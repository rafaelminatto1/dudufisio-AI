-- =====================================================
-- SCRIPT SIMPLIFICADO PARA APLICAR NO SUPABASE DASHBOARD
-- Execute este script no SQL Editor do Supabase
-- =====================================================

-- 1. Criar tabela body_map_sessions
CREATE TABLE IF NOT EXISTS body_map_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pain_free BOOLEAN DEFAULT FALSE,
  general_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_patient_session UNIQUE(patient_id, session_number),
  CONSTRAINT valid_session_number CHECK (session_number > 0)
);

-- 2. Criar tabela body_map_pain_regions
CREATE TABLE IF NOT EXISTS body_map_pain_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES body_map_sessions(id) ON DELETE CASCADE,
  region_id VARCHAR(100) NOT NULL,
  body_region VARCHAR(50),
  body_side VARCHAR(10) CHECK (body_side IN ('front', 'back', 'left', 'right', 'bilateral', NULL)),
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 10),
  type VARCHAR(50),
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  CONSTRAINT unique_session_region UNIQUE(session_id, region_id)
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_patient ON body_map_sessions(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_date ON body_map_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_therapist ON body_map_sessions(therapist_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_appointment ON body_map_sessions(appointment_id);

CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_session ON body_map_pain_regions(session_id) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_region ON body_map_pain_regions(region_id);
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_body_region ON body_map_pain_regions(body_region);
CREATE INDEX IF NOT EXISTS idx_body_map_pain_regions_intensity ON body_map_pain_regions(intensity DESC);

-- 4. Criar triggers para updated_at automático
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

-- 5. Habilitar RLS
ALTER TABLE body_map_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS para body_map_sessions
CREATE POLICY "Therapists and admins can view all body map sessions"
  ON body_map_sessions
  FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('therapist', 'admin', 'manager')
    )
  );

CREATE POLICY "Patients can view their own body map sessions"
  ON body_map_sessions
  FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Therapists can create body map sessions"
  ON body_map_sessions
  FOR INSERT
  WITH CHECK (
    auth.uid() IN (
      SELECT id FROM users WHERE role IN ('therapist', 'admin', 'manager')
    )
  );

CREATE POLICY "Therapists can update their own body map sessions"
  ON body_map_sessions
  FOR UPDATE
  USING (
    auth.uid() = therapist_id
    OR auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

CREATE POLICY "Only admins can delete body map sessions"
  ON body_map_sessions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- 7. Criar políticas RLS para body_map_pain_regions
CREATE POLICY "Users can view pain regions of sessions they can access"
  ON body_map_pain_regions
  FOR SELECT
  USING (
    session_id IN (
      SELECT id FROM body_map_sessions
    )
  );

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

CREATE POLICY "Only admins can delete pain regions"
  ON body_map_pain_regions
  FOR DELETE
  USING (
    auth.uid() IN (
      SELECT id FROM users WHERE role = 'admin'
    )
  );

-- 8. Garantir permissões
GRANT ALL ON body_map_sessions TO authenticated;
GRANT ALL ON body_map_pain_regions TO authenticated;
GRANT ALL ON body_map_sessions TO service_role;
GRANT ALL ON body_map_pain_regions TO service_role;

-- 9. Comentários para documentação
COMMENT ON TABLE body_map_sessions IS 'Armazena sessões de registro do mapa corporal de dor dos pacientes';
COMMENT ON TABLE body_map_pain_regions IS 'Armazena regiões específicas de dor para cada sessão do mapa corporal';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
