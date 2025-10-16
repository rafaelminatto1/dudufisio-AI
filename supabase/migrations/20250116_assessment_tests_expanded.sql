-- ============================================================================
-- SISTEMA DE TESTES DE AVALIAÇÃO EXPANDIDO
-- Migration criada em: 2025-01-16
-- Descrição: Expansão do sistema de assessments com configuração de testes obrigatórios
-- ============================================================================

-- Garantir que uuid-ossp está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- EXPANDIR TABELA assessments
-- ============================================================================

-- Adicionar novos campos à tabela assessments se não existirem
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS test_type VARCHAR(50);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS test_category VARCHAR(50);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS mandatory_frequency VARCHAR(50);
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS next_scheduled_date DATE;

-- Comentários
COMMENT ON COLUMN assessments.test_type IS 'Tipo de teste: amplitude, strength, balance, functional, pain';
COMMENT ON COLUMN assessments.test_category IS 'Categoria do teste';
COMMENT ON COLUMN assessments.mandatory_frequency IS 'Frequência obrigatória do teste';
COMMENT ON COLUMN assessments.next_scheduled_date IS 'Próxima data agendada para o teste';

-- ============================================================================
-- TABELA: assessment_test_configs
-- ============================================================================

CREATE TABLE IF NOT EXISTS assessment_test_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Informações do teste
  test_name VARCHAR(100) NOT NULL,
  test_type VARCHAR(50) NOT NULL CHECK (test_type IN ('amplitude', 'strength', 'balance', 'functional', 'pain')),
  
  -- Frequência
  frequency_sessions INTEGER, -- executar a cada X sessões
  frequency_days INTEGER, -- ou a cada X dias
  
  -- Configurações
  is_mandatory BOOLEAN DEFAULT false,
  
  -- Histórico
  last_performed_date DATE,
  next_due_date DATE,
  
  -- Observações
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_assessment_configs_patient ON assessment_test_configs(patient_id);
CREATE INDEX IF NOT EXISTS idx_assessment_configs_test_type ON assessment_test_configs(test_type);
CREATE INDEX IF NOT EXISTS idx_assessment_configs_mandatory ON assessment_test_configs(is_mandatory);
CREATE INDEX IF NOT EXISTS idx_assessment_configs_next_due ON assessment_test_configs(next_due_date);

-- Comentários
COMMENT ON TABLE assessment_test_configs IS 'Configuração de testes de avaliação para pacientes';
COMMENT ON COLUMN assessment_test_configs.patient_id IS 'ID do paciente';
COMMENT ON COLUMN assessment_test_configs.test_name IS 'Nome do teste (ex: "Amplitude de Movimento", "Y Balance Test")';
COMMENT ON COLUMN assessment_test_configs.test_type IS 'Tipo: amplitude, strength, balance, functional, pain';
COMMENT ON COLUMN assessment_test_configs.frequency_sessions IS 'Frequência em sessões (ex: a cada 5 sessões)';
COMMENT ON COLUMN assessment_test_configs.frequency_days IS 'Frequência em dias (ex: a cada 30 dias)';
COMMENT ON COLUMN assessment_test_configs.is_mandatory IS 'Se o teste é obrigatório';
COMMENT ON COLUMN assessment_test_configs.next_due_date IS 'Próxima data em que o teste deve ser realizado';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_assessment_test_configs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_assessment_test_configs_updated_at
  BEFORE UPDATE ON assessment_test_configs
  FOR EACH ROW
  EXECUTE FUNCTION update_assessment_test_configs_updated_at();

-- RLS (Row Level Security)
ALTER TABLE assessment_test_configs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view assessment test configs"
  ON assessment_test_configs FOR SELECT
  USING (true);

CREATE POLICY "Users can insert assessment test configs"
  ON assessment_test_configs FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update assessment test configs"
  ON assessment_test_configs FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete assessment test configs"
  ON assessment_test_configs FOR DELETE
  USING (true);

