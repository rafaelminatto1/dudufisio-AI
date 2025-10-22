-- Migration: Criar tabela session_evolutions
-- Data: 22/10/2025
-- Descrição: Armazena evoluções completas de cada sessão de atendimento

-- Criar tabela
CREATE TABLE IF NOT EXISTS session_evolutions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  session_date TIMESTAMP NOT NULL,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  therapist_name TEXT,
  
  -- Dados SOAP
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  
  -- Testes realizados (JSONB array de TestResult)
  tests_performed JSONB DEFAULT '[]'::jsonb,
  
  -- Métricas rápidas
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  satisfaction_level INTEGER CHECK (satisfaction_level >= 0 AND satisfaction_level <= 10),
  
  -- Metadata
  duration INTEGER, -- minutos
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_session_evolutions_patient_id ON session_evolutions(patient_id);
CREATE INDEX IF NOT EXISTS idx_session_evolutions_session_id ON session_evolutions(session_id);
CREATE INDEX IF NOT EXISTS idx_session_evolutions_session_date ON session_evolutions(session_date);
CREATE INDEX IF NOT EXISTS idx_session_evolutions_therapist_id ON session_evolutions(therapist_id);

-- Índice para buscar por session_number
CREATE INDEX IF NOT EXISTS idx_session_evolutions_patient_session_number ON session_evolutions(patient_id, session_number);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_session_evolutions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_session_evolutions_updated_at
  BEFORE UPDATE ON session_evolutions
  FOR EACH ROW
  EXECUTE FUNCTION update_session_evolutions_updated_at();

-- RLS (Row Level Security)
ALTER TABLE session_evolutions ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários podem ver evoluções dos seus pacientes
CREATE POLICY "Users can view session evolutions of their patients"
  ON session_evolutions
  FOR SELECT
  USING (
    auth.uid() = therapist_id
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'Admin')
  );

-- Policy: Terapeutas podem criar evoluções
CREATE POLICY "Therapists can create session evolutions"
  ON session_evolutions
  FOR INSERT
  WITH CHECK (
    auth.uid() = therapist_id
    OR auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta'))
  );

-- Policy: Terapeutas podem atualizar suas próprias evoluções
CREATE POLICY "Therapists can update their own session evolutions"
  ON session_evolutions
  FOR UPDATE
  USING (
    auth.uid() = therapist_id
    OR auth.uid() IN (SELECT id FROM users WHERE role = 'Admin')
  );

-- Policy: Apenas Admin pode deletar
CREATE POLICY "Only admins can delete session evolutions"
  ON session_evolutions
  FOR DELETE
  USING (
    auth.uid() IN (SELECT id FROM users WHERE role = 'Admin')
  );

-- Comentários na tabela
COMMENT ON TABLE session_evolutions IS 'Armazena evoluções completas de cada sessão de atendimento fisioterapêutico';
COMMENT ON COLUMN session_evolutions.tests_performed IS 'Array JSON de TestResult com todos os testes realizados na sessão';
COMMENT ON COLUMN session_evolutions.tags IS 'Tags para categorização e busca (ex: melhora, progresso, estável)';

