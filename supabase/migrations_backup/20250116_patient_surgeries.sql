-- ============================================================================
-- SISTEMA DE CIRURGIAS DE PACIENTES
-- Migration criada em: 2025-01-16
-- Descrição: Tabela para registro de cirurgias realizadas pelos pacientes
-- ============================================================================

-- Garantir que uuid-ossp está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: patient_surgeries
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_surgeries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Informações da cirurgia
  name TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  
  -- Detalhes médicos
  surgeon VARCHAR(255),
  hospital VARCHAR(255),
  complications TEXT,
  recovery_time_days INTEGER,
  
  -- Observações
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_surgeries_patient ON patient_surgeries(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_surgeries_date ON patient_surgeries(date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_surgeries_patient_date ON patient_surgeries(patient_id, date DESC);

-- Comentários
COMMENT ON TABLE patient_surgeries IS 'Registro de cirurgias realizadas pelos pacientes';
COMMENT ON COLUMN patient_surgeries.patient_id IS 'ID do paciente';
COMMENT ON COLUMN patient_surgeries.name IS 'Nome da cirurgia';
COMMENT ON COLUMN patient_surgeries.date IS 'Data da cirurgia';
COMMENT ON COLUMN patient_surgeries.recovery_time_days IS 'Tempo estimado de recuperação em dias';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_patient_surgeries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_surgeries_updated_at
  BEFORE UPDATE ON patient_surgeries
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_surgeries_updated_at();

-- RLS (Row Level Security)
ALTER TABLE patient_surgeries ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view patient surgeries"
  ON patient_surgeries FOR SELECT
  USING (true);

CREATE POLICY "Users can insert patient surgeries"
  ON patient_surgeries FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update patient surgeries"
  ON patient_surgeries FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete patient surgeries"
  ON patient_surgeries FOR DELETE
  USING (true);

