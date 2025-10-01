-- ============================================================================
-- MIGRAÇÃO: INTEGRAÇÃO SISTEMA DE TAREFAS COM INSUMOS
-- Data: 2025-01-27
-- Descrição: Schema para integração entre tarefas e gestão de insumos
-- ============================================================================

BEGIN;

-- ============================================================================
-- TABELA DE TAREFAS (se não existir)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
    'pending', 'in_progress', 'completed', 'cancelled'
  )),
  priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'urgent'
  )),
  due_date DATE,
  assigned_user_id UUID REFERENCES users(id),
  actor_user_id UUID REFERENCES users(id), -- quem criou/atribuiu
  patient_id UUID REFERENCES patients(id), -- se associada a um paciente
  task_type VARCHAR(100), -- tipo de tarefa/procedimento
  estimated_duration INTEGER, -- duração estimada em minutos
  actual_duration INTEGER, -- duração real em minutos
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE INSUMOS UTILIZADOS EM TAREFAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_supplies_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  quantity_used INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  used_by UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id),
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  batch_number VARCHAR(100), -- número do lote usado
  expiration_date DATE, -- data de validade do lote usado
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE TEMPLATES DE INSUMOS POR TIPO DE TAREFA
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_type_supply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(100) NOT NULL,
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  default_quantity INTEGER DEFAULT 1,
  is_required BOOLEAN DEFAULT false,
  notes TEXT,
  created_by UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(task_type, supply_id)
);

-- ============================================================================
-- TABELA DE CUSTOS POR TAREFA
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_costs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  total_supply_cost DECIMAL(10,2) DEFAULT 0,
  labor_cost DECIMAL(10,2) DEFAULT 0,
  overhead_cost DECIMAL(10,2) DEFAULT 0,
  total_cost DECIMAL(10,2) DEFAULT 0,
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  calculated_by UUID REFERENCES users(id)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_user ON tasks(assigned_user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_patient ON tasks(patient_id);
CREATE INDEX IF NOT EXISTS idx_tasks_type ON tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Índices para task_supplies_used
CREATE INDEX IF NOT EXISTS idx_task_supplies_task ON task_supplies_used(task_id);
CREATE INDEX IF NOT EXISTS idx_task_supplies_supply ON task_supplies_used(supply_id);
CREATE INDEX IF NOT EXISTS idx_task_supplies_patient ON task_supplies_used(patient_id);
CREATE INDEX IF NOT EXISTS idx_task_supplies_usage_date ON task_supplies_used(usage_date);

-- Índices para templates
CREATE INDEX IF NOT EXISTS idx_task_templates_type ON task_type_supply_templates(task_type);
CREATE INDEX IF NOT EXISTS idx_task_templates_supply ON task_type_supply_templates(supply_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_active ON task_type_supply_templates(is_active);

-- Índices para custos
CREATE INDEX IF NOT EXISTS idx_task_costs_task ON task_costs(task_id);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para calcular custo total da tarefa
CREATE OR REPLACE FUNCTION calculate_task_total_cost(task_uuid UUID)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  supply_cost DECIMAL(10,2);
  labor_cost DECIMAL(10,2);
  overhead_cost DECIMAL(10,2);
BEGIN
  -- Calcular custo dos insumos
  SELECT COALESCE(SUM(total_cost), 0) INTO supply_cost
  FROM task_supplies_used
  WHERE task_id = task_uuid;
  
  -- Buscar custos de mão de obra e indiretos (se existirem)
  SELECT COALESCE(labor_cost, 0), COALESCE(overhead_cost, 0)
  INTO labor_cost, overhead_cost
  FROM task_costs
  WHERE task_id = task_uuid;
  
  -- Retornar custo total
  RETURN supply_cost + labor_cost + overhead_cost;
END;
$$ LANGUAGE plpgsql;

-- Função para baixar estoque automaticamente ao usar insumos em tarefa
CREATE OR REPLACE FUNCTION consume_supplies_for_task()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar movimentação de saída no estoque
  INSERT INTO stock_movements (
    supply_id,
    movement_type,
    quantity,
    unit_cost,
    total_cost,
    reason,
    moved_by,
    patient_id,
    task_id,
    batch_number,
    expiration_date
  ) VALUES (
    NEW.supply_id,
    'saida',
    NEW.quantity_used,
    NEW.unit_cost,
    NEW.total_cost,
    'Uso em tarefa: ' || (SELECT title FROM tasks WHERE id = NEW.task_id),
    NEW.used_by,
    NEW.patient_id,
    NEW.task_id,
    NEW.batch_number,
    NEW.expiration_date
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para baixar estoque automaticamente
CREATE TRIGGER trigger_consume_supplies_for_task
  AFTER INSERT ON task_supplies_used
  FOR EACH ROW EXECUTE FUNCTION consume_supplies_for_task();

-- Função para atualizar custo total da tarefa
CREATE OR REPLACE FUNCTION update_task_total_cost()
RETURNS TRIGGER AS $$
DECLARE
  total_supply_cost DECIMAL(10,2);
BEGIN
  -- Calcular custo total dos insumos
  SELECT COALESCE(SUM(total_cost), 0) INTO total_supply_cost
  FROM task_supplies_used
  WHERE task_id = COALESCE(NEW.task_id, OLD.task_id);
  
  -- Atualizar ou inserir registro de custos
  INSERT INTO task_costs (task_id, total_supply_cost, total_cost)
  VALUES (COALESCE(NEW.task_id, OLD.task_id), total_supply_cost, total_supply_cost)
  ON CONFLICT (task_id) DO UPDATE SET
    total_supply_cost = total_supply_cost,
    total_cost = total_supply_cost,
    calculated_at = NOW();
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar custo total da tarefa
CREATE TRIGGER trigger_update_task_total_cost
  AFTER INSERT OR UPDATE OR DELETE ON task_supplies_used
  FOR EACH ROW EXECUTE FUNCTION update_task_total_cost();

-- ============================================================================
-- HABILITAR RLS
-- ============================================================================

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_supplies_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_type_supply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_costs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Políticas para tasks
CREATE POLICY "Users can view all tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Users can insert tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update tasks" ON tasks
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete tasks" ON tasks
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Políticas para task_supplies_used
CREATE POLICY "Users can view all task supplies" ON task_supplies_used
  FOR SELECT USING (true);

CREATE POLICY "Users can insert task supplies" ON task_supplies_used
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update task supplies" ON task_supplies_used
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para task_type_supply_templates
CREATE POLICY "Users can view all task templates" ON task_type_supply_templates
  FOR SELECT USING (true);

CREATE POLICY "Users can insert task templates" ON task_type_supply_templates
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update task templates" ON task_type_supply_templates
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para task_costs
CREATE POLICY "Users can view all task costs" ON task_costs
  FOR SELECT USING (true);

CREATE POLICY "Users can insert task costs" ON task_costs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- DADOS INICIAIS - TEMPLATES DE INSUMOS POR TIPO DE TAREFA
-- ============================================================================

-- Inserir templates para tipos de tarefas comuns
INSERT INTO task_type_supply_templates (task_type, supply_id, default_quantity, is_required, notes) VALUES
-- Eletroterapia
('eletroterapia', (SELECT id FROM supplies WHERE name LIKE '%Eletrodos%' LIMIT 1), 2, true, 'Eletrodos para aplicação'),
('eletroterapia', (SELECT id FROM supplies WHERE name LIKE '%Gel Condutor%' LIMIT 1), 1, true, 'Gel para condução elétrica'),

-- Exercícios Terapêuticos
('exercicios_terapeuticos', (SELECT id FROM supplies WHERE name LIKE '%Theraband%' LIMIT 1), 1, false, 'Banda elástica para exercícios'),
('exercicios_terapeuticos', (SELECT id FROM supplies WHERE name LIKE '%Bola Suíça%' LIMIT 1), 1, false, 'Bola para exercícios'),

-- Terapia Manual
('terapia_manual', (SELECT id FROM supplies WHERE name LIKE '%Óleo%' LIMIT 1), 1, true, 'Óleo para massagem'),

-- Proteção
('qualquer_tarefa', (SELECT id FROM supplies WHERE name LIKE '%Luvas%' LIMIT 1), 1, true, 'Luvas de proteção')
ON CONFLICT (task_type, supply_id) DO NOTHING;

COMMIT;
