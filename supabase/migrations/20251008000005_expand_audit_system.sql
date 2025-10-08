-- ============================================================================
-- MIGRAÇÃO: SISTEMA DE AUDITORIA EXPANDIDO
-- Data: 2025-10-08
-- Descrição: Expande sistema de auditoria para compliance LGPD e rastreamento completo
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1. EXPANDIR TABELA AUDIT_TRAIL
-- ============================================================================

-- Adicionar novas colunas à audit_trail
ALTER TABLE audit_trail
  ADD COLUMN IF NOT EXISTS table_name TEXT,
  ADD COLUMN IF NOT EXISTS record_id UUID,
  ADD COLUMN IF NOT EXISTS old_values JSONB,
  ADD COLUMN IF NOT EXISTS new_values JSONB,
  ADD COLUMN IF NOT EXISTS clinic_id UUID REFERENCES clinics(id);

-- Índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_audit_trail_table_record
  ON audit_trail(table_name, record_id, performed_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_trail_clinic
  ON audit_trail(clinic_id, performed_at DESC)
  WHERE clinic_id IS NOT NULL;

-- ============================================================================
-- 2. FUNÇÃO GENÉRICA DE AUDITORIA
-- ============================================================================

CREATE OR REPLACE FUNCTION generic_audit_trigger()
RETURNS TRIGGER AS $$
DECLARE
  audit_action TEXT;
  old_data JSONB;
  new_data JSONB;
  user_clinic_id UUID;
BEGIN
  -- Determinar ação
  IF TG_OP = 'INSERT' THEN
    audit_action := 'create';
    old_data := NULL;
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    audit_action := 'update';
    old_data := to_jsonb(OLD);
    new_data := to_jsonb(NEW);
  ELSIF TG_OP = 'DELETE' THEN
    audit_action := 'delete';
    old_data := to_jsonb(OLD);
    new_data := NULL;
  END IF;
  
  -- Obter clinic_id do usuário (se possível)
  BEGIN
    SELECT clinic_id INTO user_clinic_id
    FROM unified_users
    WHERE id = auth.uid();
  EXCEPTION WHEN OTHERS THEN
    user_clinic_id := NULL;
  END;
  
  -- Inserir registro de auditoria
  INSERT INTO audit_trail (
    table_name,
    record_id,
    action,
    performed_by,
    old_values,
    new_values,
    ip_address,
    clinic_id
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE((NEW.id)::uuid, (OLD.id)::uuid),
    audit_action,
    auth.uid(),
    old_data,
    new_data,
    inet_client_addr(),
    user_clinic_id
  );
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Em caso de erro, não bloquear a operação principal
    RAISE WARNING 'Erro ao registrar auditoria: %', SQLERRM;
    IF TG_OP = 'DELETE' THEN
      RETURN OLD;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. ADICIONAR TRIGGERS DE AUDITORIA EM TABELAS CRÍTICAS
-- ============================================================================

-- Patients
DROP TRIGGER IF EXISTS audit_patients_changes ON patients;
CREATE TRIGGER audit_patients_changes
  AFTER INSERT OR UPDATE OR DELETE ON patients
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Appointments
DROP TRIGGER IF EXISTS audit_appointments_changes ON appointments;
CREATE TRIGGER audit_appointments_changes
  AFTER INSERT OR UPDATE OR DELETE ON appointments
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Unified Users
DROP TRIGGER IF EXISTS audit_unified_users_changes ON unified_users;
CREATE TRIGGER audit_unified_users_changes
  AFTER INSERT OR UPDATE OR DELETE ON unified_users
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Initial Assessments
DROP TRIGGER IF EXISTS audit_initial_assessments_changes ON initial_assessments;
CREATE TRIGGER audit_initial_assessments_changes
  AFTER INSERT OR UPDATE OR DELETE ON initial_assessments
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Session Evolutions
DROP TRIGGER IF EXISTS audit_session_evolutions_changes ON session_evolutions;
CREATE TRIGGER audit_session_evolutions_changes
  AFTER INSERT OR UPDATE OR DELETE ON session_evolutions
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Exercise Prescriptions
DROP TRIGGER IF EXISTS audit_prescriptions_changes ON patient_exercise_prescriptions;
CREATE TRIGGER audit_prescriptions_changes
  AFTER INSERT OR UPDATE OR DELETE ON patient_exercise_prescriptions
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Digital Certificates
DROP TRIGGER IF EXISTS audit_certificates_changes ON digital_certificates;
CREATE TRIGGER audit_certificates_changes
  AFTER INSERT OR UPDATE OR DELETE ON digital_certificates
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- Clinics
DROP TRIGGER IF EXISTS audit_clinics_changes ON clinics;
CREATE TRIGGER audit_clinics_changes
  AFTER INSERT OR UPDATE OR DELETE ON clinics
  FOR EACH ROW EXECUTE FUNCTION generic_audit_trigger();

-- ============================================================================
-- 4. TABELA DE TENTATIVAS DE ACESSO NEGADO
-- ============================================================================

CREATE TABLE IF NOT EXISTS access_denied_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES unified_users(id),
  attempted_table TEXT NOT NULL,
  attempted_action TEXT NOT NULL,
  attempted_record_id UUID,
  reason TEXT,
  ip_address INET,
  user_agent TEXT,
  clinic_id UUID REFERENCES clinics(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_access_denied_user_date 
  ON access_denied_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_denied_table_action
  ON access_denied_log(attempted_table, attempted_action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_denied_clinic
  ON access_denied_log(clinic_id, created_at DESC)
  WHERE clinic_id IS NOT NULL;

-- RLS
ALTER TABLE access_denied_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins_view_access_denied" ON access_denied_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM unified_users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 5. FUNÇÃO PARA REGISTRAR ACESSOS NEGADOS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_access_denied(
  p_table TEXT,
  p_action TEXT,
  p_record_id UUID,
  p_reason TEXT
)
RETURNS VOID AS $$
DECLARE
  user_clinic_id UUID;
BEGIN
  -- Obter clinic_id do usuário
  SELECT clinic_id INTO user_clinic_id
  FROM unified_users
  WHERE id = auth.uid();
  
  INSERT INTO access_denied_log (
    user_id,
    attempted_table,
    attempted_action,
    attempted_record_id,
    reason,
    ip_address,
    clinic_id
  ) VALUES (
    auth.uid(),
    p_table,
    p_action,
    p_record_id,
    p_reason,
    inet_client_addr(),
    user_clinic_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 6. TABELA DE CONSENTIMENTO LGPD
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_consent_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  consent_type TEXT NOT NULL CHECK (consent_type IN (
    'data_processing', 'data_sharing', 'marketing', 'research', 'telehealth'
  )),
  granted BOOLEAN NOT NULL,
  consent_text TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_consent_patient
  ON patient_consent_log(patient_id, consent_type, granted_at DESC);

CREATE INDEX IF NOT EXISTS idx_patient_consent_active
  ON patient_consent_log(patient_id, consent_type)
  WHERE revoked_at IS NULL AND granted = TRUE;

-- RLS
ALTER TABLE patient_consent_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_view_own_consent" ON patient_consent_log
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "therapists_view_patient_consent" ON patient_consent_log
  FOR SELECT USING (
    patient_id IN (
      SELECT p.id FROM patients p
      JOIN appointments a ON a.patient_id = p.id
      WHERE a.therapist_id = auth.uid()
    )
  );

-- ============================================================================
-- 7. FUNÇÃO PARA OBTER HISTÓRICO DE ALTERAÇÕES
-- ============================================================================

CREATE OR REPLACE FUNCTION get_record_audit_history(
  p_table_name TEXT,
  p_record_id UUID,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  action TEXT,
  performed_at TIMESTAMPTZ,
  performed_by_name TEXT,
  old_values JSONB,
  new_values JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.action,
    a.performed_at,
    u.full_name AS performed_by_name,
    a.old_values,
    a.new_values
  FROM audit_trail a
  LEFT JOIN unified_users u ON u.id = a.performed_by
  WHERE a.table_name = p_table_name
    AND a.record_id = p_record_id
  ORDER BY a.performed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 8. FUNÇÃO PARA RELATÓRIO DE COMPLIANCE LGPD
-- ============================================================================

CREATE OR REPLACE FUNCTION generate_lgpd_compliance_report(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric TEXT,
  count BIGINT,
  details JSONB
) AS $$
BEGIN
  RETURN QUERY
  -- Total de acessos
  SELECT 
    'Total de acessos registrados'::TEXT,
    COUNT(*)::BIGINT,
    jsonb_build_object('period', jsonb_build_object('start', p_start_date, 'end', p_end_date))
  FROM audit_trail
  WHERE performed_at::date BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  -- Acessos negados
  SELECT 
    'Tentativas de acesso negado'::TEXT,
    COUNT(*)::BIGINT,
    jsonb_build_object('period', jsonb_build_object('start', p_start_date, 'end', p_end_date))
  FROM access_denied_log
  WHERE created_at::date BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  -- Documentos acessados
  SELECT 
    'Documentos clínicos acessados'::TEXT,
    COUNT(DISTINCT document_id)::BIGINT,
    jsonb_build_object('period', jsonb_build_object('start', p_start_date, 'end', p_end_date))
  FROM audit_trail
  WHERE table_name = 'clinical_documents'
    AND action = 'read'
    AND performed_at::date BETWEEN p_start_date AND p_end_date
  
  UNION ALL
  
  -- Consentimentos ativos
  SELECT 
    'Consentimentos LGPD ativos'::TEXT,
    COUNT(DISTINCT patient_id)::BIGINT,
    jsonb_build_object('consent_types', COUNT(DISTINCT consent_type))
  FROM patient_consent_log
  WHERE granted = TRUE AND revoked_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE access_denied_log IS 'Registra todas as tentativas de acesso negado para compliance LGPD';
COMMENT ON TABLE patient_consent_log IS 'Registra consentimentos dos pacientes conforme LGPD';
COMMENT ON FUNCTION generic_audit_trigger() IS 'Trigger genérico para auditoria automática de todas as operações';
COMMENT ON FUNCTION log_access_denied(TEXT, TEXT, UUID, TEXT) IS 'Registra tentativa de acesso negado';
COMMENT ON FUNCTION get_record_audit_history(TEXT, UUID, INTEGER) IS 'Retorna histórico completo de alterações de um registro';
COMMENT ON FUNCTION generate_lgpd_compliance_report(DATE, DATE) IS 'Gera relatório de compliance LGPD para período especificado';

COMMIT;
