-- ============================================================================
-- MIGRATION: SISTEMA COMPLETO DE GESTÃO DE PACIENTES
-- Data: 09 de Outubro de 2025
-- Versão: 1.0
-- Descrição: Sistema profissional completo para gestão de pacientes incluindo
--            documentos, timeline, auditoria e analytics
-- ============================================================================

-- ============================================================================
-- 1. EXTENSÕES E FUNÇÕES AUXILIARES
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text
CREATE EXTENSION IF NOT EXISTS "unaccent"; -- Para busca sem acentos

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar código único de paciente
CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    new_code := 'PAC-' || LPAD(FLOOR(RANDOM() * 999999)::TEXT, 6, '0');
    SELECT EXISTS(SELECT 1 FROM patients WHERE code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. TABELA PRINCIPAL: PATIENTS (MELHORADA)
-- ============================================================================

-- Verificar se tabela já existe, se não, criar
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
        CREATE TABLE patients (
          -- Identificação
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          code VARCHAR(20) UNIQUE NOT NULL DEFAULT generate_patient_code(),
          
          -- Dados Pessoais
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          phone VARCHAR(20) NOT NULL,
          phone2 VARCHAR(20),
          cpf VARCHAR(14) UNIQUE NOT NULL,
          rg VARCHAR(20),
          birth_date DATE NOT NULL,
          age INTEGER GENERATED ALWAYS AS (
            EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))
          ) STORED,
          gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
          marital_status VARCHAR(20) CHECK (marital_status IN ('single', 'married', 'divorced', 'widowed', 'other')),
          occupation VARCHAR(100),
          avatar_url TEXT,
          
          -- Endereço (JSONB para flexibilidade)
          address JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Contato de Emergência
          emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Dados Físicos
          blood_type VARCHAR(5),
          height NUMERIC(5,2), -- em cm
          weight NUMERIC(5,2), -- em kg
          bmi NUMERIC(5,2) GENERATED ALWAYS AS (
            CASE 
              WHEN height > 0 THEN weight / ((height / 100) ^ 2)
              ELSE NULL
            END
          ) STORED,
          
          -- Histórico Médico
          medical_history JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Condições e Diagnóstico
          conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
          main_diagnosis TEXT,
          referring_doctor VARCHAR(255),
          referring_doctor_crm VARCHAR(50),
          
          -- Status e Datas
          status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive', 'Discharged', 'Waiting', 'On Hold')),
          registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
          first_appointment_date DATE,
          last_appointment_date DATE,
          
          -- Progresso de Sessões
          session_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Métricas de Tratamento
          treatment_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Convênio/Seguro
          insurance JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Informações Financeiras
          financial_info JSONB NOT NULL DEFAULT '{}'::jsonb,
          
          -- Observações
          observations TEXT,
          internal_notes TEXT,
          
          -- Preferências
          preferred_days_of_week TEXT[],
          preferred_time_slots TEXT[],
          
          -- Documentos e Consentimentos
          has_consent_form BOOLEAN DEFAULT false,
          has_data_privacy_consent BOOLEAN DEFAULT false,
          
          -- Tags para categorização
          tags TEXT[],
          
          -- Auditoria
          created_by UUID REFERENCES users(id),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_by UUID REFERENCES users(id),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          deleted_at TIMESTAMPTZ,
          
          -- Busca full-text (será populado por trigger)
          search_vector tsvector
        );
    END IF;
END $$;

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patients_deleted_at ON patients(deleted_at) WHERE deleted_at IS NULL;

-- Índice GIN para busca full-text
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING GIN(search_vector);

-- Índice para JSONB (queries mais rápidas em campos JSONB)
CREATE INDEX IF NOT EXISTS idx_patients_address_gin ON patients USING GIN(address);
CREATE INDEX IF NOT EXISTS idx_patients_medical_history_gin ON patients USING GIN(medical_history);
CREATE INDEX IF NOT EXISTS idx_patients_conditions_gin ON patients USING GIN(conditions);

-- Trigger para atualizar updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para atualizar search_vector
CREATE OR REPLACE FUNCTION update_patients_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    coalesce(NEW.name, '') || ' ' ||
    coalesce(NEW.email, '') || ' ' ||
    coalesce(NEW.cpf, '') || ' ' ||
    coalesce(NEW.code, '') || ' ' ||
    coalesce(NEW.phone, '') || ' ' ||
    coalesce(NEW.occupation, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patients_search_trigger ON patients;
CREATE TRIGGER update_patients_search_trigger
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_patients_search_vector();

-- ============================================================================
-- 3. TABELA: PATIENT_DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Documento
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'medical_report', 'exam_result', 'prescription', 'consent_form',
    'photo', 'x-ray', 'mri', 'ultrasound', 'ct_scan', 'lab_result', 'other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Arquivo
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT, -- em bytes
  file_type VARCHAR(100), -- MIME type
  
  -- Metadata
  document_date DATE,
  uploaded_by UUID REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Organização
  category VARCHAR(50),
  tags TEXT[],
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patient_documents_patient ON patient_documents(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_documents_type ON patient_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_patient_documents_uploaded_at ON patient_documents(uploaded_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_documents_deleted_at ON patient_documents(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- 4. TABELA: PATIENT_TIMELINE
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Evento
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN (
    'registration', 'appointment_scheduled', 'appointment_completed',
    'appointment_cancelled', 'no_show', 'payment_received', 'payment_overdue',
    'document_uploaded', 'status_changed', 'note_added', 'prescription_issued',
    'exam_requested', 'exam_completed', 'discharge', 'readmission', 
    'treatment_plan_created', 'treatment_plan_updated', 'milestone_reached', 'other'
  )),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Relacionamentos
  related_appointment_id UUID,
  related_session_id UUID,
  related_document_id UUID,
  related_user_id UUID REFERENCES users(id),
  
  -- Metadata
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- Dados adicionais em JSON
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Importância do evento
  importance VARCHAR(20) DEFAULT 'normal' CHECK (importance IN ('low', 'normal', 'high', 'critical')),
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patient_timeline_patient ON patient_timeline(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_timeline_event_date ON patient_timeline(event_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_timeline_event_type ON patient_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_patient_timeline_importance ON patient_timeline(importance);
CREATE INDEX IF NOT EXISTS idx_patient_timeline_deleted_at ON patient_timeline(deleted_at) WHERE deleted_at IS NULL;

-- ============================================================================
-- 5. TABELA: PATIENT_AUDIT_LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Ação
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'VIEW', 'EXPORT')),
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  
  -- Dados
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  
  -- Auditoria
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  
  -- Contexto
  reason TEXT,
  session_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_patient_audit_log_patient ON patient_audit_log(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_audit_log_changed_at ON patient_audit_log(changed_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_audit_log_action ON patient_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_patient_audit_log_changed_by ON patient_audit_log(changed_by);

-- Trigger para audit log automático em mudanças de pacientes
CREATE OR REPLACE FUNCTION log_patient_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO patient_audit_log (
      patient_id,
      action,
      table_name,
      record_id,
      old_values,
      new_values,
      changed_by
    ) VALUES (
      NEW.id,
      'UPDATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(OLD),
      to_jsonb(NEW),
      NEW.updated_by
    );
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO patient_audit_log (
      patient_id,
      action,
      table_name,
      record_id,
      new_values,
      changed_by
    ) VALUES (
      NEW.id,
      'CREATE',
      TG_TABLE_NAME,
      NEW.id,
      to_jsonb(NEW),
      NEW.created_by
    );
  ELSIF (TG_OP = 'DELETE') THEN
    INSERT INTO patient_audit_log (
      patient_id,
      action,
      table_name,
      record_id,
      old_values,
      changed_by
    ) VALUES (
      OLD.id,
      'DELETE',
      TG_TABLE_NAME,
      OLD.id,
      to_jsonb(OLD),
      OLD.updated_by
    );
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS patient_audit_trigger ON patients;
CREATE TRIGGER patient_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION log_patient_changes();

-- ============================================================================
-- 6. TABELA: PATIENT_NOTES
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Nota
  note_type VARCHAR(50) DEFAULT 'general' CHECK (note_type IN (
    'general', 'clinical', 'administrative', 'financial', 'alert', 'reminder'
  )),
  title VARCHAR(255),
  content TEXT NOT NULL,
  
  -- Flags
  is_important BOOLEAN DEFAULT false,
  is_alert BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false, -- Visível apenas para admin
  is_pinned BOOLEAN DEFAULT false,
  
  -- Reminder
  reminder_date TIMESTAMPTZ,
  reminder_completed BOOLEAN DEFAULT false,
  
  -- Auditoria
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  
  -- Soft delete
  deleted_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_patient_notes_patient ON patient_notes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_notes_created_at ON patient_notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_patient_notes_type ON patient_notes(note_type);
CREATE INDEX IF NOT EXISTS idx_patient_notes_important ON patient_notes(is_important) WHERE is_important = true;
CREATE INDEX IF NOT EXISTS idx_patient_notes_alert ON patient_notes(is_alert) WHERE is_alert = true;
CREATE INDEX IF NOT EXISTS idx_patient_notes_reminder ON patient_notes(reminder_date) WHERE reminder_date IS NOT NULL AND reminder_completed = false;

-- ============================================================================
-- 7. FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para busca full-text de pacientes
CREATE OR REPLACE FUNCTION search_patients(search_query TEXT, max_results INT DEFAULT 50)
RETURNS TABLE (
  patient patients,
  rank REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*, ts_rank(p.search_vector, query) as rank
  FROM patients p, plainto_tsquery('portuguese', search_query) query
  WHERE p.search_vector @@ query 
    AND p.deleted_at IS NULL
  ORDER BY rank DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular KPIs do paciente
CREATE OR REPLACE FUNCTION calculate_patient_kpis(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_sessions', COALESCE(COUNT(s.id), 0),
    'completed_sessions', COALESCE(COUNT(s.id) FILTER (WHERE s.status = 'completed'), 0),
    'cancelled_sessions', COALESCE(COUNT(s.id) FILTER (WHERE s.status = 'cancelled'), 0),
    'no_show_sessions', COALESCE(COUNT(s.id) FILTER (WHERE s.no_show = true), 0),
    'total_spent', COALESCE(SUM(ft.amount) FILTER (WHERE ft.status = 'paid'), 0),
    'total_pending', COALESCE(SUM(ft.amount) FILTER (WHERE ft.status IN ('pending', 'overdue')), 0),
    'adherence_rate', 
      CASE 
        WHEN COUNT(s.id) > 0 
        THEN ROUND((COUNT(s.id) FILTER (WHERE s.status = 'completed')::NUMERIC / COUNT(s.id)::NUMERIC * 100), 2)
        ELSE 0
      END,
    'avg_pain_before', ROUND(AVG(s.pain_level_before), 2),
    'avg_pain_after', ROUND(AVG(s.pain_level_after), 2),
    'avg_satisfaction', ROUND(AVG(s.satisfaction_score), 2),
    'last_session_date', MAX(s.session_date),
    'days_since_last_session', 
      CASE 
        WHEN MAX(s.session_date) IS NOT NULL 
        THEN EXTRACT(DAY FROM (CURRENT_DATE - MAX(s.session_date)))
        ELSE NULL
      END
  ) INTO result
  FROM patients p
  LEFT JOIN sessions s ON s.patient_id = p.id
  LEFT JOIN financial_transactions ft ON ft.patient_id = p.id
  WHERE p.id = patient_uuid
  GROUP BY p.id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para gerar relatório resumido de paciente
CREATE OR REPLACE FUNCTION get_patient_summary(patient_uuid UUID)
RETURNS JSONB AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'patient', to_jsonb(p),
    'kpis', calculate_patient_kpis(patient_uuid),
    'recent_timeline', (
      SELECT jsonb_agg(to_jsonb(pt))
      FROM (
        SELECT * FROM patient_timeline
        WHERE patient_id = patient_uuid
          AND deleted_at IS NULL
        ORDER BY event_date DESC
        LIMIT 10
      ) pt
    ),
    'active_notes', (
      SELECT jsonb_agg(to_jsonb(pn))
      FROM (
        SELECT * FROM patient_notes
        WHERE patient_id = patient_uuid
          AND deleted_at IS NULL
          AND (is_important = true OR is_alert = true OR is_pinned = true)
        ORDER BY created_at DESC
        LIMIT 5
      ) pn
    ),
    'documents_count', (
      SELECT COUNT(*)
      FROM patient_documents
      WHERE patient_id = patient_uuid
        AND deleted_at IS NULL
    )
  ) INTO result
  FROM patients p
  WHERE p.id = patient_uuid;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 8. ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;

-- Policies para Admin (acesso total)
CREATE POLICY IF NOT EXISTS admin_all_patients ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

CREATE POLICY IF NOT EXISTS admin_all_patient_documents ON patient_documents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

CREATE POLICY IF NOT EXISTS admin_all_patient_timeline ON patient_timeline
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

CREATE POLICY IF NOT EXISTS admin_all_patient_notes ON patient_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'Admin'
    )
  );

-- Policies para Terapeuta (apenas seus pacientes)
CREATE POLICY IF NOT EXISTS therapist_own_patients ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM appointments a
      WHERE a.patient_id = patients.id
      AND a.therapist_id = auth.uid()
    )
  );

-- Policies para Paciente (apenas seus próprios dados)
CREATE POLICY IF NOT EXISTS patient_own_data ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.patient_id = patients.id
      AND users.role = 'Patient'
    )
  );

-- ============================================================================
-- 9. VIEWS ÚTEIS
-- ============================================================================

-- View: Pacientes com KPIs calculados
CREATE OR REPLACE VIEW patients_with_kpis AS
SELECT 
  p.*,
  calculate_patient_kpis(p.id) as kpis
FROM patients p
WHERE p.deleted_at IS NULL;

-- View: Pacientes ativos com últimas atividades
CREATE OR REPLACE VIEW active_patients_summary AS
SELECT 
  p.id,
  p.code,
  p.name,
  p.email,
  p.phone,
  p.status,
  p.age,
  p.main_diagnosis,
  (SELECT MAX(event_date) FROM patient_timeline WHERE patient_id = p.id) as last_activity,
  (SELECT COUNT(*) FROM patient_documents WHERE patient_id = p.id AND deleted_at IS NULL) as documents_count,
  (SELECT COUNT(*) FROM patient_notes WHERE patient_id = p.id AND deleted_at IS NULL AND is_alert = true) as alerts_count
FROM patients p
WHERE p.status = 'Active' AND p.deleted_at IS NULL
ORDER BY last_activity DESC NULLS LAST;

-- ============================================================================
-- 10. DADOS DE EXEMPLO (OPCIONAL - APENAS PARA DESENVOLVIMENTO)
-- ============================================================================

-- Comentado para não inserir em produção
-- Descomente se precisar de dados de teste

/*
-- Inserir pacientes de exemplo
INSERT INTO patients (
  name, email, phone, cpf, birth_date, gender, status,
  address, emergency_contact, medical_history,
  main_diagnosis, observations
) VALUES 
(
  'João Silva Santos',
  'joao.silva.test@example.com',
  '(11) 99999-1111',
  '123.456.789-00',
  '1985-03-15',
  'male',
  'Active',
  '{"street": "Rua das Flores", "number": "123", "city": "São Paulo", "state": "SP", "zipCode": "01234-567"}'::jsonb,
  '{"name": "Maria Silva", "relationship": "Esposa", "phone": "(11) 99999-2222"}'::jsonb,
  '{"allergies": ["Penicilina"], "chronicDiseases": ["Hipertensão"]}'::jsonb,
  'Hérnia de disco L4-L5 com compressão radicular',
  'Paciente colaborativo e comprometido com o tratamento.'
),
(
  'Maria Santos Oliveira',
  'maria.santos.test@example.com',
  '(11) 98888-1111',
  '987.654.321-00',
  '1990-07-22',
  'female',
  'Active',
  '{"street": "Avenida Paulista", "number": "1000", "city": "São Paulo", "state": "SP", "zipCode": "01310-100"}'::jsonb,
  '{"name": "José Santos", "relationship": "Pai", "phone": "(11) 98888-2222"}'::jsonb,
  '{"allergies": [], "chronicDiseases": []}'::jsonb,
  'Tendinite do supraespinhal - ombro direito',
  'Excelente evolução no tratamento.'
);
*/

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Commit das mudanças
COMMIT;

