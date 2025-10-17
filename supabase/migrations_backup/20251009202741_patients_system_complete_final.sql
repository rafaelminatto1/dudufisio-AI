-- ============================================================================
-- MIGRATION: SISTEMA DE GESTÃO DE PACIENTES (VERSÃO SIMPLIFICADA)
-- Data: 09 de Outubro de 2025
-- Descrição: Tabelas de pacientes sem dependências externas
-- ============================================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Função updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Função para gerar código
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

-- Tabela patients (sem FK para users se não existir)
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL DEFAULT generate_patient_code(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) NOT NULL,
  phone2 VARCHAR(20),
  cpf VARCHAR(14) UNIQUE NOT NULL,
  rg VARCHAR(20),
  birth_date DATE NOT NULL,
  age INTEGER GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))) STORED,
  gender VARCHAR(20) NOT NULL,
  marital_status VARCHAR(20),
  occupation VARCHAR(100),
  avatar_url TEXT,
  address JSONB NOT NULL DEFAULT '{}'::jsonb,
  emergency_contact JSONB NOT NULL DEFAULT '{}'::jsonb,
  blood_type VARCHAR(5),
  height NUMERIC(5,2),
  weight NUMERIC(5,2),
  bmi NUMERIC(5,2) GENERATED ALWAYS AS (
    CASE WHEN height > 0 THEN weight / ((height / 100) ^ 2) ELSE NULL END
  ) STORED,
  medical_history JSONB NOT NULL DEFAULT '{}'::jsonb,
  conditions JSONB NOT NULL DEFAULT '[]'::jsonb,
  main_diagnosis TEXT,
  referring_doctor VARCHAR(255),
  referring_doctor_crm VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  registration_date DATE NOT NULL DEFAULT CURRENT_DATE,
  first_appointment_date DATE,
  last_appointment_date DATE,
  session_progress JSONB NOT NULL DEFAULT '{}'::jsonb,
  treatment_metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  insurance JSONB NOT NULL DEFAULT '{}'::jsonb,
  financial_info JSONB NOT NULL DEFAULT '{}'::jsonb,
  observations TEXT,
  internal_notes TEXT,
  preferred_days_of_week TEXT[],
  preferred_time_slots TEXT[],
  has_consent_form BOOLEAN DEFAULT false,
  has_data_privacy_consent BOOLEAN DEFAULT false,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  search_vector tsvector
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patients_name ON patients(name);
CREATE INDEX IF NOT EXISTS idx_patients_cpf ON patients(cpf);
CREATE INDEX IF NOT EXISTS idx_patients_email ON patients(email);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
CREATE INDEX IF NOT EXISTS idx_patients_search ON patients USING GIN(search_vector);

-- Trigger updated_at
DROP TRIGGER IF EXISTS update_patients_updated_at ON patients;
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger search_vector
CREATE OR REPLACE FUNCTION update_patients_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('portuguese',
    coalesce(NEW.name, '') || ' ' || coalesce(NEW.email, '') || ' ' || coalesce(NEW.cpf, '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_patients_search_trigger ON patients;
CREATE TRIGGER update_patients_search_trigger
  BEFORE INSERT OR UPDATE ON patients
  FOR EACH ROW
  EXECUTE FUNCTION update_patients_search_vector();

-- Tabela patient_documents
CREATE TABLE IF NOT EXISTS patient_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  file_type VARCHAR(100),
  document_date DATE,
  uploaded_by UUID,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  category VARCHAR(50),
  tags TEXT[],
  deleted_at TIMESTAMPTZ
);

-- Tabela patient_timeline
CREATE TABLE IF NOT EXISTS patient_timeline (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  related_appointment_id UUID,
  related_session_id UUID,
  related_document_id UUID,
  related_user_id UUID,
  event_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  importance VARCHAR(20) DEFAULT 'normal',
  deleted_at TIMESTAMPTZ
);

-- Tabela patient_notes
CREATE TABLE IF NOT EXISTS patient_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  note_type VARCHAR(50) DEFAULT 'general',
  title VARCHAR(255),
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  is_alert BOOLEAN DEFAULT false,
  is_private BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  reminder_date TIMESTAMPTZ,
  reminder_completed BOOLEAN DEFAULT false,
  created_by UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Tabela patient_audit_log
CREATE TABLE IF NOT EXISTS patient_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  action VARCHAR(20) NOT NULL,
  table_name VARCHAR(50) NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  changed_fields TEXT[],
  changed_by UUID,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT,
  reason TEXT,
  session_id TEXT
);

-- Funções úteis
CREATE OR REPLACE FUNCTION search_patients(search_query TEXT, max_results INT DEFAULT 50)
RETURNS TABLE (patient patients, rank REAL) AS $$
BEGIN
  RETURN QUERY
  SELECT p.*, ts_rank(p.search_vector, query) as rank
  FROM patients p, plainto_tsquery('portuguese', search_query) query
  WHERE p.search_vector @@ query AND p.deleted_at IS NULL
  ORDER BY rank DESC LIMIT max_results;
END;
$$ LANGUAGE plpgsql;

-- RLS
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_audit_log ENABLE ROW LEVEL SECURITY;
