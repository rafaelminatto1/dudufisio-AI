-- ============================================================================
-- SISTEMA DE PATOLOGIAS DE PACIENTES
-- Migration criada em: 2025-01-16
-- Descrição: Tabela para registro de patologias e diagnósticos dos pacientes
-- ============================================================================

-- Garantir que uuid-ossp está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: patient_pathologies
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_pathologies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Informações da patologia
  name TEXT NOT NULL,
  icd_code VARCHAR(10),
  diagnosis_date DATE NOT NULL,
  
  -- Status e severidade
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'chronic', 'monitoring')),
  severity VARCHAR(20) CHECK (severity IN ('mild', 'moderate', 'severe', 'critical')),
  
  -- Detalhes clínicos
  affected_region TEXT,
  description TEXT,
  treatment_plan TEXT,
  
  -- Observações
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_pathologies_patient ON patient_pathologies(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_pathologies_status ON patient_pathologies(status);
CREATE INDEX IF NOT EXISTS idx_patient_pathologies_severity ON patient_pathologies(severity);
CREATE INDEX IF NOT EXISTS idx_patient_pathologies_diagnosis_date ON patient_pathologies(diagnosis_date DESC);
CREATE INDEX IF NOT EXISTS idx_patient_pathologies_icd ON patient_pathologies(icd_code);

-- Comentários
COMMENT ON TABLE patient_pathologies IS 'Registro de patologias e diagnósticos dos pacientes';
COMMENT ON COLUMN patient_pathologies.patient_id IS 'ID do paciente';
COMMENT ON COLUMN patient_pathologies.name IS 'Nome da patologia';
COMMENT ON COLUMN patient_pathologies.icd_code IS 'Código CID-10 da patologia';
COMMENT ON COLUMN patient_pathologies.diagnosis_date IS 'Data do diagnóstico';
COMMENT ON COLUMN patient_pathologies.status IS 'Status da patologia: active, resolved, chronic, monitoring';
COMMENT ON COLUMN patient_pathologies.severity IS 'Severidade: mild, moderate, severe, critical';
COMMENT ON COLUMN patient_pathologies.affected_region IS 'Região corporal afetada';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_patient_pathologies_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_pathologies_updated_at
  BEFORE UPDATE ON patient_pathologies
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_pathologies_updated_at();

-- RLS (Row Level Security)
ALTER TABLE patient_pathologies ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view patient pathologies"
  ON patient_pathologies FOR SELECT
  USING (true);

CREATE POLICY "Users can insert patient pathologies"
  ON patient_pathologies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update patient pathologies"
  ON patient_pathologies FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete patient pathologies"
  ON patient_pathologies FOR DELETE
  USING (true);

