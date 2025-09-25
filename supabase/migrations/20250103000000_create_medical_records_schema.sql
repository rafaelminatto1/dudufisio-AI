-- ============================================================================
-- MIGRAÇÃO: SISTEMA DE PRONTUÁRIO ELETRÔNICO MÉDICO
-- Data: 2025-01-03
-- Descrição: Criação do schema completo para prontuário eletrônico seguindo
--           padrões HL7 FHIR e compliance CFM/COFFITO
-- ============================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELA DE TEMPLATES CLÍNICOS (mover antes para permitir FK em clinical_documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS clinical_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'initial_assessment', 'session_evolution', 'treatment_plan',
    'discharge_summary', 'referral_letter', 'progress_report'
  )),
  specialty VARCHAR(30) NOT NULL CHECK (specialty IN (
    'physiotherapy', 'occupational_therapy', 'speech_therapy',
    'sports_physiotherapy', 'neurological_physiotherapy', 
    'orthopedic_physiotherapy', 'respiratory_physiotherapy',
    'pediatric_physiotherapy'
  )),
  template_schema JSONB NOT NULL,
  default_values JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- ============================================================================
-- TABELA PRINCIPAL DE DOCUMENTOS CLÍNICOS
-- ============================================================================

CREATE TABLE clinical_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
    'initial_assessment', 'session_evolution', 'treatment_plan',
    'discharge_summary', 'referral_letter', 'progress_report'
  )),
  version INTEGER NOT NULL DEFAULT 1,
  content JSONB NOT NULL,
  
  -- Metadados clínicos
  specialty VARCHAR(30) NOT NULL CHECK (specialty IN (
    'physiotherapy', 'occupational_therapy', 'speech_therapy',
    'sports_physiotherapy', 'neurological_physiotherapy', 
    'orthopedic_physiotherapy', 'respiratory_physiotherapy',
    'pediatric_physiotherapy'
  )),
  session_id UUID REFERENCES appointments(id),
  template_id UUID REFERENCES clinical_templates(id),
  
  -- Assinatura digital
  is_signed BOOLEAN DEFAULT FALSE,
  signature_data JSONB,
  signed_at TIMESTAMP WITH TIME ZONE,
  signed_by UUID REFERENCES users(id),
  
  -- Status e auditoria
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN (
    'draft', 'signed', 'archived', 'deleted'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_version CHECK (version > 0),
  CONSTRAINT signed_documents_immutable CHECK (
    NOT is_signed OR (updated_at = created_at)
  )
);

-- ============================================================================
-- TABELA DE AVALIAÇÕES INICIAIS ESTRUTURADAS
-- ============================================================================

CREATE TABLE initial_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clinical_documents(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Queixa principal
  chief_complaint TEXT NOT NULL,
  pain_onset DATE,
  pain_characteristics JSONB,
  
  -- História clínica
  medical_history JSONB NOT NULL DEFAULT '{}',
  surgical_history JSONB DEFAULT '{}',
  medications JSONB DEFAULT '[]',
  allergies JSONB DEFAULT '[]',
  
  -- Exame físico
  vital_signs JSONB,
  inspection_findings TEXT,
  palpation_findings TEXT,
  range_of_motion JSONB,
  muscle_strength JSONB,
  special_tests JSONB,
  neurological_exam JSONB,
  
  -- Testes funcionais
  functional_tests JSONB DEFAULT '[]',
  
  -- Diagnóstico e plano
  physiotherapy_diagnosis TEXT NOT NULL,
  treatment_goals JSONB NOT NULL DEFAULT '[]',
  treatment_plan TEXT NOT NULL,
  prognosis TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- ============================================================================
-- TABELA DE EVOLUÇÕES POR SESSÃO
-- ============================================================================

CREATE TABLE session_evolutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clinical_documents(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  
  -- Avaliação subjetiva
  subjective_assessment TEXT,
  pain_level_before INTEGER CHECK (pain_level_before >= 0 AND pain_level_before <= 10),
  pain_level_after INTEGER CHECK (pain_level_after >= 0 AND pain_level_after <= 10),
  
  -- Avaliação objetiva
  objective_findings TEXT,
  measurements JSONB,
  
  -- Intervenções realizadas
  techniques_applied JSONB NOT NULL DEFAULT '[]',
  exercises_performed JSONB DEFAULT '[]',
  equipment_used JSONB DEFAULT '[]',
  
  -- Resposta do paciente
  patient_response TEXT,
  adverse_reactions TEXT,
  
  -- Plano para próxima sessão
  next_session_plan TEXT,
  home_exercises JSONB DEFAULT '[]',
  recommendations TEXT,
  
  -- Integração com mapa corporal
  body_map_points JSONB DEFAULT '[]',
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- (bloco movido para o topo)

-- ============================================================================
-- TABELA DE ASSINATURAS DIGITAIS
-- ============================================================================

CREATE TABLE digital_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clinical_documents(id) ON DELETE CASCADE,
  signature_data JSONB NOT NULL,
  certificate_id UUID NOT NULL,
  signed_at TIMESTAMP WITH TIME ZONE NOT NULL,
  signed_by UUID NOT NULL REFERENCES users(id),
  verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN (
    'pending', 'verified', 'failed', 'expired'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE CERTIFICADOS DIGITAIS
-- ============================================================================

CREATE TABLE digital_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  certificate_data JSONB NOT NULL,
  public_key TEXT NOT NULL,
  algorithm VARCHAR(50) NOT NULL,
  valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID NOT NULL REFERENCES users(id)
);

-- ============================================================================
-- TABELA DE AUDITORIA
-- ============================================================================

CREATE TABLE audit_trail (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID REFERENCES clinical_documents(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL CHECK (action IN (
    'create', 'read', 'update', 'delete', 'sign', 'export', 'print'
  )),
  performed_by UUID NOT NULL REFERENCES users(id),
  performed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT
);

-- ============================================================================
-- TABELA DE COMPLIANCE E VALIDAÇÕES
-- ============================================================================

CREATE TABLE compliance_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clinical_documents(id) ON DELETE CASCADE,
  validation_type VARCHAR(50) NOT NULL CHECK (validation_type IN (
    'cfm', 'coffito', 'lgpd', 'fhir'
  )),
  is_valid BOOLEAN NOT NULL,
  violations JSONB DEFAULT '[]',
  validated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  validated_by UUID NOT NULL REFERENCES users(id)
);

-- ============================================================================
-- TABELA DE ARQUIVAMENTO
-- ============================================================================

CREATE TABLE document_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES clinical_documents(id) ON DELETE CASCADE,
  archive_location TEXT NOT NULL,
  encryption_key TEXT NOT NULL,
  checksum TEXT NOT NULL,
  retention_policy JSONB NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  archived_by UUID NOT NULL REFERENCES users(id)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para clinical_documents
CREATE INDEX idx_clinical_documents_patient ON clinical_documents(patient_id, created_at DESC);
CREATE INDEX idx_clinical_documents_type ON clinical_documents(document_type);
CREATE INDEX idx_clinical_documents_signed ON clinical_documents(is_signed, signed_at);
CREATE INDEX idx_clinical_documents_specialty ON clinical_documents(specialty);
CREATE INDEX idx_clinical_documents_status ON clinical_documents(status);
CREATE INDEX idx_clinical_documents_created_by ON clinical_documents(created_by);

-- Índices para initial_assessments
CREATE INDEX idx_assessments_patient ON initial_assessments(patient_id);
CREATE INDEX idx_assessments_document ON initial_assessments(document_id);
CREATE INDEX idx_assessments_created_by ON initial_assessments(created_by);

-- Índices para session_evolutions
CREATE INDEX idx_evolutions_appointment ON session_evolutions(appointment_id);
CREATE INDEX idx_evolutions_patient ON session_evolutions(patient_id);
CREATE INDEX idx_evolutions_document ON session_evolutions(document_id);
CREATE INDEX idx_evolutions_created_by ON session_evolutions(created_by);

-- Índices para clinical_templates
CREATE INDEX IF NOT EXISTS idx_templates_type ON clinical_templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_specialty ON clinical_templates(specialty);
CREATE INDEX IF NOT EXISTS idx_templates_active ON clinical_templates(active);

-- Índices para digital_signatures
CREATE INDEX idx_signatures_document ON digital_signatures(document_id);
CREATE INDEX idx_signatures_signed_by ON digital_signatures(signed_by);
CREATE INDEX idx_signatures_verification ON digital_signatures(verification_status);

-- Índices para audit_trail
CREATE INDEX idx_audit_document ON audit_trail(document_id);
CREATE INDEX idx_audit_performed_by ON audit_trail(performed_by);
CREATE INDEX idx_audit_performed_at ON audit_trail(performed_at);
CREATE INDEX idx_audit_action ON audit_trail(action);

-- Índices para compliance_validations
CREATE INDEX idx_compliance_document ON compliance_validations(document_id);
CREATE INDEX idx_compliance_type ON compliance_validations(validation_type);
CREATE INDEX idx_compliance_valid ON compliance_validations(is_valid);

-- ============================================================================
-- TRIGGERS PARA VERSIONAMENTO AUTOMÁTICO
-- ============================================================================

-- Função para incrementar versão de documentos
CREATE OR REPLACE FUNCTION increment_document_version()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.is_signed = FALSE THEN
    NEW.version = OLD.version + 1;
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para versionamento automático
CREATE TRIGGER clinical_documents_versioning
  BEFORE UPDATE ON clinical_documents
  FOR EACH ROW EXECUTE FUNCTION increment_document_version();

-- ============================================================================
-- TRIGGERS PARA AUDITORIA AUTOMÁTICA
-- ============================================================================

-- Função para registrar auditoria
CREATE OR REPLACE FUNCTION audit_clinical_documents()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO audit_trail (document_id, action, performed_by, details)
    VALUES (NEW.id, 'create', NEW.created_by, 
            jsonb_build_object('version', NEW.version, 'type', NEW.document_type));
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO audit_trail (document_id, action, performed_by, details)
    VALUES (NEW.id, 'update', NEW.updated_by, 
            jsonb_build_object('old_version', OLD.version, 'new_version', NEW.version));
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO audit_trail (document_id, action, performed_by, details)
    VALUES (OLD.id, 'delete', OLD.updated_by, 
            jsonb_build_object('version', OLD.version));
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para auditoria automática
CREATE TRIGGER clinical_documents_audit
  AFTER INSERT OR UPDATE OR DELETE ON clinical_documents
  FOR EACH ROW EXECUTE FUNCTION audit_clinical_documents();

-- ============================================================================
-- RLS (ROW LEVEL SECURITY) POLICIES
-- ============================================================================

-- Habilitar RLS nas tabelas
ALTER TABLE clinical_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE initial_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_evolutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinical_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_signatures ENABLE ROW LEVEL SECURITY;
ALTER TABLE digital_certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_trail ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_validations ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_archives ENABLE ROW LEVEL SECURITY;

-- Políticas para clinical_documents
CREATE POLICY "Users can view their own clinical documents" ON clinical_documents
  FOR SELECT USING (
    created_by = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.patient_id = clinical_documents.patient_id 
        AND a.therapist_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create clinical documents" ON clinical_documents
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own clinical documents" ON clinical_documents
  FOR UPDATE USING (created_by = auth.uid() AND is_signed = FALSE);

CREATE POLICY "Users can delete their own clinical documents" ON clinical_documents
  FOR DELETE USING (created_by = auth.uid() AND is_signed = FALSE);

-- Políticas para initial_assessments
CREATE POLICY "Users can view assessments for their patients" ON initial_assessments
  FOR SELECT USING (
    created_by = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.patient_id = initial_assessments.patient_id 
        AND a.therapist_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create assessments" ON initial_assessments
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own assessments" ON initial_assessments
  FOR UPDATE USING (created_by = auth.uid());

-- Políticas para session_evolutions
CREATE POLICY "Users can view evolutions for their patients" ON session_evolutions
  FOR SELECT USING (
    created_by = (select auth.uid()) OR 
    EXISTS (
      SELECT 1 FROM appointments a 
      WHERE a.patient_id = session_evolutions.patient_id 
        AND a.therapist_id = (select auth.uid())
    )
  );

CREATE POLICY "Users can create evolutions" ON session_evolutions
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own evolutions" ON session_evolutions
  FOR UPDATE USING (created_by = auth.uid());

-- Políticas para clinical_templates
CREATE POLICY "Users can view active templates" ON clinical_templates
  FOR SELECT USING (active = TRUE);

CREATE POLICY "Users can create templates" ON clinical_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON clinical_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Políticas para digital_signatures
CREATE POLICY "Users can view signatures for their documents" ON digital_signatures
  FOR SELECT USING (signed_by = auth.uid() OR 
                   EXISTS (SELECT 1 FROM clinical_documents WHERE id = document_id AND created_by = auth.uid()));

CREATE POLICY "Users can create signatures" ON digital_signatures
  FOR INSERT WITH CHECK (signed_by = auth.uid());

-- Políticas para digital_certificates
CREATE POLICY "Users can view their own certificates" ON digital_certificates
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own certificates" ON digital_certificates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own certificates" ON digital_certificates
  FOR UPDATE USING (user_id = auth.uid());

-- Políticas para audit_trail
CREATE POLICY "Users can view audit trail for their documents" ON audit_trail
  FOR SELECT USING (performed_by = auth.uid() OR 
                   EXISTS (SELECT 1 FROM clinical_documents WHERE id = document_id AND created_by = auth.uid()));

-- Políticas para compliance_validations
CREATE POLICY "Users can view compliance for their documents" ON compliance_validations
  FOR SELECT USING (validated_by = auth.uid() OR 
                   EXISTS (SELECT 1 FROM clinical_documents WHERE id = document_id AND created_by = auth.uid()));

CREATE POLICY "Users can create compliance validations" ON compliance_validations
  FOR INSERT WITH CHECK (validated_by = auth.uid());

-- Políticas para document_archives
CREATE POLICY "Users can view archives for their documents" ON document_archives
  FOR SELECT USING (archived_by = auth.uid() OR 
                   EXISTS (SELECT 1 FROM clinical_documents WHERE id = document_id AND created_by = auth.uid()));

CREATE POLICY "Users can create archives" ON document_archives
  FOR INSERT WITH CHECK (archived_by = auth.uid());

-- ============================================================================
-- FUNÇÕES DE UTILIDADE
-- ============================================================================

-- Função para gerar hash de documento
CREATE OR REPLACE FUNCTION generate_document_hash(document_content JSONB)
RETURNS TEXT AS $$
BEGIN
  RETURN encode(digest(document_content::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Função para validar integridade de documento
CREATE OR REPLACE FUNCTION validate_document_integrity(
  doc_id UUID,
  expected_hash TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  actual_hash TEXT;
BEGIN
  SELECT generate_document_hash(content) INTO actual_hash
  FROM clinical_documents
  WHERE id = doc_id;
  
  RETURN actual_hash = expected_hash;
END;
$$ LANGUAGE plpgsql;

-- Função para obter histórico de versões
CREATE OR REPLACE FUNCTION get_document_version_history(doc_id UUID)
RETURNS TABLE (
  version INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  created_by UUID,
  is_signed BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    cd.version,
    cd.created_at,
    cd.created_by,
    cd.is_signed
  FROM clinical_documents cd
  WHERE cd.id = doc_id
  ORDER BY cd.version DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMENTÁRIOS DAS TABELAS
-- ============================================================================

COMMENT ON TABLE clinical_documents IS 'Tabela principal para documentos clínicos com versionamento e assinatura digital';
COMMENT ON TABLE initial_assessments IS 'Avaliações iniciais estruturadas seguindo padrões clínicos';
COMMENT ON TABLE session_evolutions IS 'Evoluções por sessão com integração ao mapa corporal';
COMMENT ON TABLE clinical_templates IS 'Templates clínicos dinâmicos por especialidade';
COMMENT ON TABLE digital_signatures IS 'Assinaturas digitais certificadas para documentos clínicos';
COMMENT ON TABLE digital_certificates IS 'Certificados digitais dos profissionais';
COMMENT ON TABLE audit_trail IS 'Trilha de auditoria completa para compliance';
COMMENT ON TABLE compliance_validations IS 'Validações de compliance CFM/COFFITO/LGPD';
COMMENT ON TABLE document_archives IS 'Arquivamento seguro de documentos com política de retenção';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
