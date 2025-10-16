-- ============================================================================
-- SISTEMA UNIFICADO DE METAS DE PACIENTES
-- Migration criada em: 2025-01-16
-- Descrição: Sistema unificado para gerenciamento de metas dos pacientes
-- ============================================================================

-- Garantir que uuid-ossp está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: patient_goals
-- ============================================================================

CREATE TABLE IF NOT EXISTS patient_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Informações da meta
  title TEXT NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'performance', 'recovery', 'fitness', 'lifestyle', 'medical',
    'mobility', 'strength', 'pain_reduction', 'functional'
  )),
  
  -- Valores e progresso
  target_date DATE,
  target_value TEXT,
  current_value TEXT,
  current_progress INTEGER CHECK (current_progress >= 0 AND current_progress <= 100),
  unit VARCHAR(50),
  
  -- Prioridade e status
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled', 'archived')),
  
  -- Conclusão
  achieved_at TIMESTAMPTZ,
  
  -- Observações
  notes TEXT,
  
  -- Metadata
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_patient_goals_patient ON patient_goals(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_goals_status ON patient_goals(status);
CREATE INDEX IF NOT EXISTS idx_patient_goals_category ON patient_goals(category);
CREATE INDEX IF NOT EXISTS idx_patient_goals_priority ON patient_goals(priority);
CREATE INDEX IF NOT EXISTS idx_patient_goals_target_date ON patient_goals(target_date);

-- Comentários
COMMENT ON TABLE patient_goals IS 'Metas e objetivos dos pacientes';
COMMENT ON COLUMN patient_goals.patient_id IS 'ID do paciente';
COMMENT ON COLUMN patient_goals.title IS 'Título da meta';
COMMENT ON COLUMN patient_goals.category IS 'Categoria da meta';
COMMENT ON COLUMN patient_goals.target_value IS 'Valor alvo da meta (ex: "10 km", "sem muletas")';
COMMENT ON COLUMN patient_goals.current_value IS 'Valor atual da meta';
COMMENT ON COLUMN patient_goals.current_progress IS 'Progresso atual (0-100%)';
COMMENT ON COLUMN patient_goals.priority IS 'Prioridade: low, medium, high, critical';
COMMENT ON COLUMN patient_goals.status IS 'Status: active, completed, paused, cancelled, archived';

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_patient_goals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_patient_goals_updated_at
  BEFORE UPDATE ON patient_goals
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_goals_updated_at();

-- Trigger para marcar como concluída
CREATE OR REPLACE FUNCTION mark_goal_as_completed()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.achieved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_mark_goal_as_completed
  BEFORE UPDATE ON patient_goals
  FOR EACH ROW
  EXECUTE FUNCTION mark_goal_as_completed();

-- RLS (Row Level Security)
ALTER TABLE patient_goals ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view patient goals"
  ON patient_goals FOR SELECT
  USING (true);

CREATE POLICY "Users can insert patient goals"
  ON patient_goals FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update patient goals"
  ON patient_goals FOR UPDATE
  USING (true);

CREATE POLICY "Users can delete patient goals"
  ON patient_goals FOR DELETE
  USING (true);

