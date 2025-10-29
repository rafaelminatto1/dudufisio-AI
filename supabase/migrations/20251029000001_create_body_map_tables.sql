-- =====================================================
-- MIGRATION: Create Body Map Tables
-- Description: Tabelas para armazenar histórico do mapa corporal de dor
-- Created: 2025-10-29
-- Author: DuduFisio AI Team
-- =====================================================

-- =====================================================
-- 1. BODY_MAP_SESSIONS TABLE
-- =====================================================
-- Armazena sessões de registro do mapa corporal
CREATE TABLE IF NOT EXISTS body_map_sessions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Keys
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- Session Info
  session_number INTEGER NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  pain_free BOOLEAN DEFAULT FALSE,
  general_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_patient_session UNIQUE(patient_id, session_number),
  CONSTRAINT valid_session_number CHECK (session_number > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_patient ON body_map_sessions(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_date ON body_map_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_therapist ON body_map_sessions(therapist_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_appointment ON body_map_sessions(appointment_id);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_body_map_sessions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_body_map_sessions_updated_at
  BEFORE UPDATE ON body_map_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_body_map_sessions_updated_at();

-- =====================================================
-- 2. BODY_MAP_PAIN_REGIONS TABLE
-- =====================================================
-- Armazena regiões de dor específicas para cada sessão
CREATE TABLE IF NOT EXISTS body_map_pain_regions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Foreign Key
  session_id UUID NOT NULL REFERENCES body_map_sessions(id) ON DELETE CASCADE,
  
  -- Region Identification
  region_id VARCHAR(100) NOT NULL, -- Ex: 'front-head', 'back-lower-spine'
  body_region VARCHAR(50), -- Ex: 'head', 'spine', 'shoulder'
  body_side VARCHAR(10) CHECK (body_side IN ('front', 'back', 'left', 'right', 'bilateral', NULL)),
  
  -- Pain Details
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 10),
  type VARCHAR(50), -- Ex: 'sharp', 'dull', 'burning', 'tingling'
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT unique_session_region UNIQUE(session_id, region_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_session ON body_map_pain_regions(session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_region ON body_map_pain_regions(region_id);
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_body_region ON body_map_pain_regions(body_region);
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_intensity ON body_map_pain_regions(intensity DESC);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_body_map_pain_regions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_body_map_pain_regions_updated_at
  BEFORE UPDATE ON body_map_pain_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_body_map_pain_regions_updated_at();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS
ALTER TABLE body_map_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions ENABLE ROW LEVEL SECURITY;

-- ============= BODY_MAP_SESSIONS POLICIES =============

-- SELECT: Terapeutas e Admins podem ver todas as sessões
CREATE POLICY "Therapists and admins can view all body map sessions"
  ON body_map_sessions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('therapist', 'admin', 'manager')
    )
  );

-- SELECT: Pacientes podem ver apenas suas próprias sessões
CREATE POLICY "Patients can view their own body map sessions"
  ON body_map_sessions
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- INSERT: Terapeutas e Admins podem criar sessões
CREATE POLICY "Therapists can create body map sessions"
  ON body_map_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('therapist', 'admin', 'manager')
    )
  );

-- UPDATE: Terapeutas podem atualizar suas próprias sessões ou admins podem atualizar todas
CREATE POLICY "Therapists can update their own body map sessions"
  ON body_map_sessions
  FOR UPDATE
  USING (
    auth.uid() = therapist_id
    OR auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- DELETE: Apenas Admins podem deletar (soft delete via deleted_at é preferível)
CREATE POLICY "Only admins can delete body map sessions"
  ON body_map_sessions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- ============= BODY_MAP_PAIN_REGIONS POLICIES =============

-- SELECT: Se pode ver a sessão, pode ver as regiões
CREATE POLICY "Users can view pain regions of sessions they can access"
  ON body_map_pain_regions
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM body_map_sessions
    )
  );

-- INSERT: Se pode criar na sessão, pode criar regiões
CREATE POLICY "Therapists can create pain regions"
  ON body_map_pain_regions
  FOR INSERT
  WITH CHECK (
    session_id IN (
      SELECT id FROM body_map_sessions
      WHERE auth.uid() IN (
        SELECT id FROM users WHERE role IN ('therapist', 'admin', 'manager')
      )
    )
  );

-- UPDATE: Se pode atualizar a sessão, pode atualizar regiões
CREATE POLICY "Therapists can update pain regions"
  ON body_map_pain_regions
  FOR UPDATE
  USING (
    session_id IN (
      SELECT id FROM body_map_sessions
      WHERE therapist_id = auth.uid()
        OR auth.uid() IN (
          SELECT id FROM users WHERE role = 'admin'
        )
    )
  );

-- DELETE: Apenas Admins podem deletar
CREATE POLICY "Only admins can delete pain regions"
  ON body_map_pain_regions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- =====================================================
-- 4. COMMENTS (Documentação)
-- =====================================================

COMMENT ON TABLE body_map_sessions IS 'Armazena sessões de registro do mapa corporal de dor dos pacientes';
COMMENT ON COLUMN body_map_sessions.session_number IS 'Número sequencial da sessão para o paciente';
COMMENT ON COLUMN body_map_sessions.pain_free IS 'Indica se o paciente estava sem dor nesta sessão';
COMMENT ON COLUMN body_map_sessions.deleted_at IS 'Soft delete timestamp - NULL significa ativo';

COMMENT ON TABLE body_map_pain_regions IS 'Armazena regiões específicas de dor para cada sessão do mapa corporal';
COMMENT ON COLUMN body_map_pain_regions.region_id IS 'Identificador único da região no mapa (ex: front-head, back-lower-spine)';
COMMENT ON COLUMN body_map_pain_regions.intensity IS 'Intensidade da dor de 0 (sem dor) a 10 (dor máxima)';
COMMENT ON COLUMN body_map_pain_regions.type IS 'Tipo de dor: sharp (aguda), dull (surda), burning (queimação), tingling (formigamento), etc';
COMMENT ON COLUMN body_map_pain_regions.is_active IS 'Indica se esta região de dor ainda está ativa/presente';

-- =====================================================
-- 5. GRANTS (Permissões)
-- =====================================================

-- Garantir que o serviço pode acessar as tabelas
GRANT ALL ON body_map_sessions TO authenticated;
GRANT ALL ON body_map_pain_regions TO authenticated;
GRANT ALL ON body_map_sessions TO service_role;
GRANT ALL ON body_map_pain_regions TO service_role;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

