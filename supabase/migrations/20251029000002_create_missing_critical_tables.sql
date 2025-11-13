-- =====================================================
-- MIGRATION: Criar Tabelas Faltantes Críticas
-- Description: Tabelas essenciais que podem estar faltando
-- Created: 2025-10-29
-- =====================================================

-- =====================================================
-- 1. SOAP_NOTES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS soap_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- SOAP Components
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Additional Info
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  CONSTRAINT unique_patient_session_soap UNIQUE(patient_id, session_number)
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_soap_notes_patient ON soap_notes(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_soap_notes_date ON soap_notes(date DESC);
CREATE INDEX IF NOT EXISTS idx_soap_notes_therapist ON soap_notes(therapist_id) WHERE deleted_at IS NULL;
-- =====================================================
-- 2. SURGERIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS surgeries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Surgery Info
  surgery_name TEXT NOT NULL,
  surgery_date DATE NOT NULL,
  surgeon_name TEXT,
  hospital_name TEXT,
  surgery_type TEXT,
  
  -- Details
  description TEXT,
  complications TEXT,
  recovery_notes TEXT,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_surgeries_patient ON surgeries(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_surgeries_date ON surgeries(surgery_date DESC);
-- =====================================================
-- 3. PATIENT_GOALS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Goal Info
  title TEXT NOT NULL,
  description TEXT,
  goal_type TEXT, -- 'pain_reduction', 'mobility', 'strength', 'function'
  
  -- Progress
  target_value NUMERIC,
  current_value NUMERIC,
  unit TEXT,
  
  -- Timeline
  target_date DATE,
  start_date DATE DEFAULT CURRENT_DATE,
  
  -- Status
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'achieved', 'cancelled', 'paused')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_goals_patient ON patient_goals(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_patient_goals_status ON patient_goals(status);
CREATE INDEX IF NOT EXISTS idx_patient_goals_target_date ON patient_goals(target_date);
-- =====================================================
-- 4. PATHOLOGIES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS pathologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Pathology Info
  name TEXT NOT NULL,
  icd_code TEXT,
  pathology_type TEXT, -- 'musculoskeletal', 'neurological', 'cardiovascular', etc
  
  -- Details
  description TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  onset_date DATE,
  
  -- Treatment
  treatment_plan TEXT,
  medications TEXT[],
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  is_chronic BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_pathologies_patient ON pathologies(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_pathologies_type ON pathologies(pathology_type);
CREATE INDEX IF NOT EXISTS idx_pathologies_active ON pathologies(is_active);
-- =====================================================
-- 5. MANDATORY_TEST_ALERTS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS mandatory_test_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Alert Info
  test_name TEXT NOT NULL,
  test_type TEXT NOT NULL,
  frequency_type TEXT CHECK (frequency_type IN ('every_session', 'weekly', 'monthly', 'custom')),
  
  -- Details
  description TEXT,
  instructions TEXT,
  
  -- Status
  severity TEXT DEFAULT 'low' CHECK (severity IN ('low', 'important', 'critical')),
  is_completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  
  -- Scheduling
  due_date DATE,
  reminder_sent BOOLEAN DEFAULT FALSE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_mandatory_test_alerts_patient ON mandatory_test_alerts(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_mandatory_test_alerts_severity ON mandatory_test_alerts(severity);
CREATE INDEX IF NOT EXISTS idx_mandatory_test_alerts_completed ON mandatory_test_alerts(is_completed);
CREATE INDEX IF NOT EXISTS idx_mandatory_test_alerts_due_date ON mandatory_test_alerts(due_date);
-- =====================================================
-- 6. WAITLIST TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Waitlist Info
  status TEXT DEFAULT 'waiting' CHECK (status IN ('waiting', 'contacted', 'scheduled', 'cancelled')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Preferences
  preferred_days TEXT[],
  preferred_times TEXT[],
  preferred_start_from DATE,
  preferred_start_to DATE,
  
  -- Contact
  contact_attempts INTEGER DEFAULT 0,
  last_contact_date TIMESTAMPTZ,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
-- Índices
CREATE INDEX IF NOT EXISTS idx_waitlist_patient ON waitlist(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist(status);
CREATE INDEX IF NOT EXISTS idx_waitlist_priority ON waitlist(priority);
CREATE INDEX IF NOT EXISTS idx_waitlist_created ON waitlist(created_at DESC);
-- =====================================================
-- 7. SCHEDULE_BLOCKS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS schedule_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,
  
  -- Block Info
  title TEXT NOT NULL,
  description TEXT,
  block_type TEXT DEFAULT 'unavailable' CHECK (block_type IN ('unavailable', 'break', 'meeting', 'personal')),
  
  -- Timing
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT FALSE,
  recurrence_pattern TEXT, -- 'daily', 'weekly', 'monthly'
  recurrence_end_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

ALTER TABLE schedule_blocks
  ADD COLUMN IF NOT EXISTS title TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS block_type TEXT,
  ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS end_time TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_end_date DATE,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

ALTER TABLE schedule_blocks
  ALTER COLUMN block_type SET DEFAULT 'unavailable',
  ALTER COLUMN is_recurring SET DEFAULT FALSE,
  ALTER COLUMN is_active SET DEFAULT TRUE,
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW();

-- Índices
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_therapist ON schedule_blocks(therapist_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_start_time ON schedule_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_schedule_blocks_active ON schedule_blocks(is_active);
-- =====================================================
-- 8. TRIGGERS PARA UPDATED_AT
-- =====================================================

-- Função genérica para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Aplicar triggers em todas as tabelas
CREATE TRIGGER trigger_soap_notes_updated_at
  BEFORE UPDATE ON soap_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_surgeries_updated_at
  BEFORE UPDATE ON surgeries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_patient_goals_updated_at
  BEFORE UPDATE ON patient_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_pathologies_updated_at
  BEFORE UPDATE ON pathologies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_mandatory_test_alerts_updated_at
  BEFORE UPDATE ON mandatory_test_alerts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_waitlist_updated_at
  BEFORE UPDATE ON waitlist
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trigger_schedule_blocks_updated_at
  BEFORE UPDATE ON schedule_blocks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
-- =====================================================
-- 9. RLS BÁSICO (Desabilitado para desenvolvimento)
-- =====================================================

-- Habilitar RLS
ALTER TABLE soap_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE surgeries ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE pathologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE mandatory_test_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_blocks ENABLE ROW LEVEL SECURITY;
-- Políticas básicas (permissivas para desenvolvimento)
CREATE POLICY "Allow all for soap_notes" ON soap_notes FOR ALL USING (true);
CREATE POLICY "Allow all for surgeries" ON surgeries FOR ALL USING (true);
CREATE POLICY "Allow all for patient_goals" ON patient_goals FOR ALL USING (true);
CREATE POLICY "Allow all for pathologies" ON pathologies FOR ALL USING (true);
CREATE POLICY "Allow all for mandatory_test_alerts" ON mandatory_test_alerts FOR ALL USING (true);
CREATE POLICY "Allow all for waitlist" ON waitlist FOR ALL USING (true);
CREATE POLICY "Allow all for schedule_blocks" ON schedule_blocks FOR ALL USING (true);
-- =====================================================
-- 10. GRANTS
-- =====================================================

-- Garantir permissões
GRANT ALL ON soap_notes TO authenticated;
GRANT ALL ON surgeries TO authenticated;
GRANT ALL ON patient_goals TO authenticated;
GRANT ALL ON pathologies TO authenticated;
GRANT ALL ON mandatory_test_alerts TO authenticated;
GRANT ALL ON waitlist TO authenticated;
GRANT ALL ON schedule_blocks TO authenticated;
GRANT ALL ON soap_notes TO service_role;
GRANT ALL ON surgeries TO service_role;
GRANT ALL ON patient_goals TO service_role;
GRANT ALL ON pathologies TO service_role;
GRANT ALL ON mandatory_test_alerts TO service_role;
GRANT ALL ON waitlist TO service_role;
GRANT ALL ON schedule_blocks TO service_role;
-- =====================================================
-- 11. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE soap_notes IS 'Notas SOAP das sessões de fisioterapia';
COMMENT ON TABLE surgeries IS 'Cirurgias realizadas pelos pacientes';
COMMENT ON TABLE patient_goals IS 'Objetivos de tratamento dos pacientes';
COMMENT ON TABLE pathologies IS 'Patologias e condições médicas dos pacientes';
COMMENT ON TABLE mandatory_test_alerts IS 'Alertas de testes obrigatórios para pacientes';
COMMENT ON TABLE waitlist IS 'Lista de espera para agendamentos';
COMMENT ON TABLE schedule_blocks IS 'Bloqueios de agenda dos terapeutas';
-- =====================================================
-- FIM DA MIGRATION
-- =====================================================;
