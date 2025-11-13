-- ============================================================================
-- SISTEMA DE GESTÃO DE INSUMOS - DUDUFISIO-AI
-- ============================================================================
-- Migração 001: Estrutura base de tabelas
-- Data: 2024
-- Descrição: Criação das tabelas principais para gestão de insumos
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE FORNECEDORES
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  cnpj VARCHAR(18) UNIQUE,
  payment_terms VARCHAR(100),
  delivery_time_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para fornecedores
CREATE INDEX idx_suppliers_active ON suppliers(is_active);
CREATE INDEX idx_suppliers_name ON suppliers(name);
-- ============================================================================
-- 2. TABELA DE INSUMOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'equipamentos',
    'materiais_descartaveis',
    'medicamentos_topicos',
    'materiais_limpeza',
    'materiais_escritorio',
    'equipamentos_protecao'
  )),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  unit_of_measure VARCHAR(50) NOT NULL DEFAULT 'unidade',
  current_stock INTEGER DEFAULT 0 CHECK (current_stock >= 0),
  minimum_stock INTEGER DEFAULT 0 CHECK (minimum_stock >= 0),
  maximum_stock INTEGER CHECK (maximum_stock IS NULL OR maximum_stock > 0),
  unit_cost DECIMAL(10,2) CHECK (unit_cost IS NULL OR unit_cost >= 0),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  barcode VARCHAR(100),
  expiration_date DATE,
  storage_location VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  requires_prescription BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para insumos
CREATE INDEX idx_supplies_category_active ON supplies(category, is_active);
CREATE INDEX idx_supplies_supplier ON supplies(supplier_id);
CREATE INDEX idx_supplies_expiration ON supplies(expiration_date) WHERE expiration_date IS NOT NULL;
CREATE INDEX idx_supplies_low_stock ON supplies(id) WHERE current_stock <= minimum_stock;
-- ============================================================================
-- 3. TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE NOT NULL,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN ('entrada', 'saida', 'ajuste', 'vencimento')),
  quantity INTEGER NOT NULL CHECK (quantity != 0),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason VARCHAR(255),
  reference_document VARCHAR(100),
  moved_by UUID REFERENCES auth.users(id),
  patient_id UUID, -- Referência ao paciente se aplicável
  task_id UUID, -- Referência à tarefa se aplicável
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para movimentações
CREATE INDEX idx_stock_movements_supply_date ON stock_movements(supply_id, created_at);
CREATE INDEX idx_stock_movements_type ON stock_movements(movement_type);
CREATE INDEX idx_stock_movements_task ON stock_movements(task_id) WHERE task_id IS NOT NULL;
CREATE INDEX idx_stock_movements_patient ON stock_movements(patient_id) WHERE patient_id IS NOT NULL;
-- ============================================================================
-- 4. TABELA DE PEDIDOS DE COMPRA
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'ordered', 'received', 'cancelled')),
  total_amount DECIMAL(10,2) CHECK (total_amount >= 0),
  requested_by UUID REFERENCES auth.users(id),
  approved_by UUID REFERENCES auth.users(id),
  order_date DATE,
  expected_delivery DATE,
  received_date DATE,
  notes TEXT,
  is_auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para pedidos de compra
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_purchase_orders_supplier ON purchase_orders(supplier_id);
CREATE INDEX idx_purchase_orders_date ON purchase_orders(order_date);
-- ============================================================================
-- 5. TABELA DE ITENS DO PEDIDO DE COMPRA
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
  supply_id UUID REFERENCES supplies(id) ON DELETE SET NULL,
  quantity_requested INTEGER NOT NULL CHECK (quantity_requested > 0),
  quantity_received INTEGER DEFAULT 0 CHECK (quantity_received >= 0),
  unit_cost DECIMAL(10,2) CHECK (unit_cost >= 0),
  total_cost DECIMAL(10,2) CHECK (total_cost >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para itens do pedido
CREATE INDEX idx_purchase_order_items_order ON purchase_order_items(purchase_order_id);
CREATE INDEX idx_purchase_order_items_supply ON purchase_order_items(supply_id);
-- ============================================================================
-- 6. TABELA DE ALERTAS DE INSUMOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS supply_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN ('low_stock', 'critical_stock', 'expiring', 'expired', 'reorder')),
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES auth.users(id)
);
-- Índices para alertas
CREATE INDEX idx_supply_alerts_type_resolved ON supply_alerts(alert_type, is_resolved);
CREATE INDEX idx_supply_alerts_supply ON supply_alerts(supply_id);
CREATE INDEX idx_supply_alerts_unread ON supply_alerts(is_read) WHERE is_read = false;
-- ============================================================================
-- 7. TABELA DE INSUMOS UTILIZADOS EM TAREFAS
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_supplies_used (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL, -- Referência à tabela de tarefas existente
  supply_id UUID REFERENCES supplies(id) ON DELETE SET NULL,
  quantity_used INTEGER NOT NULL CHECK (quantity_used > 0),
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  used_by UUID REFERENCES auth.users(id),
  patient_id UUID, -- Referência ao paciente
  usage_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  notes TEXT
);
-- Índices para insumos de tarefas
CREATE INDEX idx_task_supplies_task ON task_supplies_used(task_id);
CREATE INDEX idx_task_supplies_supply ON task_supplies_used(supply_id);
CREATE INDEX idx_task_supplies_patient ON task_supplies_used(patient_id);
CREATE INDEX idx_task_supplies_date ON task_supplies_used(usage_date);
-- ============================================================================
-- 8. TABELA DE TEMPLATES DE INSUMOS POR TIPO DE TAREFA
-- ============================================================================
CREATE TABLE IF NOT EXISTS task_type_supply_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_type VARCHAR(100) NOT NULL,
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  default_quantity INTEGER DEFAULT 1 CHECK (default_quantity > 0),
  is_required BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para templates
CREATE INDEX idx_task_supply_templates_type ON task_type_supply_templates(task_type);
CREATE INDEX idx_task_supply_templates_supply ON task_type_supply_templates(supply_id);
-- ============================================================================
-- 9. TABELA DE LOTES DE PRODUTOS (RASTREABILIDADE)
-- ============================================================================
CREATE TABLE IF NOT EXISTS supply_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  manufacturing_date DATE,
  expiration_date DATE NOT NULL,
  manufacturer VARCHAR(255),
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  quantity_received INTEGER NOT NULL CHECK (quantity_received > 0),
  quantity_remaining INTEGER NOT NULL CHECK (quantity_remaining >= 0),
  unit_cost DECIMAL(10,2),
  quality_certificate_url TEXT,
  storage_conditions TEXT,
  received_by UUID REFERENCES auth.users(id),
  received_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'quarantine', 'expired', 'recalled'))
);
-- Índices para lotes
CREATE INDEX idx_supply_batches_supply ON supply_batches(supply_id);
CREATE INDEX idx_supply_batches_expiration ON supply_batches(expiration_date);
CREATE INDEX idx_supply_batches_status ON supply_batches(status);
CREATE UNIQUE INDEX idx_supply_batches_unique ON supply_batches(supply_id, batch_number);
-- ============================================================================
-- 10. TABELA DE APROVAÇÕES DE PEDIDOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
  approver_id UUID REFERENCES auth.users(id),
  approval_level INTEGER NOT NULL CHECK (approval_level IN (1, 2, 3)),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  comments TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para aprovações
CREATE INDEX idx_purchase_approvals_order ON purchase_approvals(purchase_order_id);
CREATE INDEX idx_purchase_approvals_status ON purchase_approvals(status);
CREATE INDEX idx_purchase_approvals_approver ON purchase_approvals(approver_id);
-- ============================================================================
-- 11. TABELA DE CONFIGURAÇÕES DE REPOSIÇÃO AUTOMÁTICA
-- ============================================================================
CREATE TABLE IF NOT EXISTS auto_replenishment_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE UNIQUE,
  is_enabled BOOLEAN DEFAULT true,
  reorder_point INTEGER NOT NULL CHECK (reorder_point > 0),
  economic_order_quantity INTEGER NOT NULL CHECK (economic_order_quantity > 0),
  max_stock_level INTEGER CHECK (max_stock_level > 0),
  auto_approve_limit DECIMAL(10,2),
  preferred_supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- Índices para regras de reposição
CREATE INDEX idx_auto_replenishment_enabled ON auto_replenishment_rules(is_enabled);
CREATE INDEX idx_auto_replenishment_supply ON auto_replenishment_rules(supply_id);
-- ============================================================================
-- FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Triggers para atualizar updated_at
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_supplies_updated_at BEFORE UPDATE ON supplies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_purchase_orders_updated_at BEFORE UPDATE ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_task_type_supply_templates_updated_at BEFORE UPDATE ON task_type_supply_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_auto_replenishment_rules_updated_at BEFORE UPDATE ON auto_replenishment_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
-- ============================================================================
-- Função para atualizar estoque após movimentação
-- ============================================================================
CREATE OR REPLACE FUNCTION update_stock_after_movement()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'entrada' THEN
    UPDATE supplies 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.supply_id;
  ELSIF NEW.movement_type = 'saida' THEN
    UPDATE supplies 
    SET current_stock = current_stock - NEW.quantity 
    WHERE id = NEW.supply_id;
  ELSIF NEW.movement_type = 'ajuste' THEN
    -- Para ajustes, a quantidade pode ser positiva ou negativa
    UPDATE supplies 
    SET current_stock = current_stock + NEW.quantity 
    WHERE id = NEW.supply_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER update_stock_on_movement
AFTER INSERT ON stock_movements
FOR EACH ROW EXECUTE FUNCTION update_stock_after_movement();
-- ============================================================================
-- Função para criar alertas de estoque baixo
-- ============================================================================
CREATE OR REPLACE FUNCTION check_and_create_low_stock_alert()
RETURNS TRIGGER AS $$
BEGIN
  -- Verifica se o estoque está abaixo do mínimo
  IF NEW.current_stock <= NEW.minimum_stock THEN
    -- Verifica se já existe um alerta não resolvido para este insumo
    IF NOT EXISTS (
      SELECT 1 FROM supply_alerts 
      WHERE supply_id = NEW.id 
      AND alert_type IN ('low_stock', 'critical_stock')
      AND is_resolved = false
    ) THEN
      -- Determina o tipo e severidade do alerta
      IF NEW.current_stock = 0 THEN
        INSERT INTO supply_alerts (
          supply_id, 
          alert_type, 
          severity, 
          message
        ) VALUES (
          NEW.id, 
          'critical_stock', 
          'critical',
          'Estoque zerado! Insumo: ' || NEW.name
        );
      ELSE
        INSERT INTO supply_alerts (
          supply_id, 
          alert_type, 
          severity, 
          message
        ) VALUES (
          NEW.id, 
          'low_stock', 
          'high',
          'Estoque baixo! Insumo: ' || NEW.name || ' - Estoque atual: ' || NEW.current_stock
        );
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER check_low_stock
AFTER UPDATE OF current_stock ON supplies
FOR EACH ROW EXECUTE FUNCTION check_and_create_low_stock_alert();
-- ============================================================================
-- Função para gerar número de pedido automático
-- ============================================================================
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  NEW.order_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                      LPAD(COALESCE((SELECT COUNT(*) + 1 FROM purchase_orders WHERE DATE(created_at) = DATE(NOW()))::TEXT, '1'), 4, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER generate_purchase_order_number
BEFORE INSERT ON purchase_orders
FOR EACH ROW 
WHEN (NEW.order_number IS NULL)
EXECUTE FUNCTION generate_order_number();
-- ============================================================================
-- RLS (Row Level Security) POLICIES
-- ============================================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_supplies_used ENABLE ROW LEVEL SECURITY;
-- Política para fornecedores (todos podem ler, apenas admin pode modificar)
CREATE POLICY "Fornecedores visíveis para todos" ON suppliers
  FOR SELECT USING (true);
CREATE POLICY "Apenas admin pode gerenciar fornecedores" ON suppliers
  FOR ALL USING (auth.uid() IN (SELECT id FROM auth.users WHERE role = 'admin'));
-- Política para insumos (todos podem ler, apenas autorizados podem modificar)
CREATE POLICY "Insumos visíveis para todos" ON supplies
  FOR SELECT USING (true);
CREATE POLICY "Usuários autorizados podem gerenciar insumos" ON supplies
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Política para movimentações (apenas usuários autenticados)
CREATE POLICY "Movimentações para usuários autenticados" ON stock_movements
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Política para pedidos de compra (apenas autorizados)
CREATE POLICY "Pedidos para usuários autorizados" ON purchase_orders
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Política para alertas (todos autenticados podem ver)
CREATE POLICY "Alertas para usuários autenticados" ON supply_alerts
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Política para insumos de tarefas (todos autenticados)
CREATE POLICY "Insumos de tarefas para usuários autenticados" ON task_supplies_used
  FOR ALL USING (auth.uid() IS NOT NULL);
-- ============================================================================
-- DADOS INICIAIS DE EXEMPLO
-- ============================================================================

-- Inserir fornecedores de exemplo
INSERT INTO suppliers (name, contact_person, email, phone, cnpj, payment_terms, delivery_time_days, is_active)
VALUES 
  ('MedSupplies Ltda', 'João Silva', 'contato@medsupplies.com.br', '(11) 3456-7890', '12.345.678/0001-90', '30 dias', 7, true),
  ('FisioEquip Brasil', 'Maria Santos', 'vendas@fisioequip.com.br', '(21) 9876-5432', '98.765.432/0001-10', '15 dias', 5, true),
  ('Produtos Hospitalares SA', 'Carlos Oliveira', 'comercial@prodhospitalar.com.br', '(31) 2345-6789', '11.222.333/0001-44', '45 dias', 10, true)
ON CONFLICT DO NOTHING;
-- Inserir categorias de insumos de exemplo
INSERT INTO supplies (name, description, category, unit_of_measure, current_stock, minimum_stock, supplier_id, is_active)
SELECT 
  'Theraband Verde', 
  'Faixa elástica de resistência média', 
  'equipamentos', 
  'unidade', 
  10, 
  5,
  (SELECT id FROM suppliers WHERE name = 'FisioEquip Brasil' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM supplies WHERE name = 'Theraband Verde');
INSERT INTO supplies (name, description, category, unit_of_measure, current_stock, minimum_stock, supplier_id, is_active)
SELECT 
  'Eletrodos Autoadesivos', 
  'Eletrodos descartáveis para eletroterapia', 
  'materiais_descartaveis', 
  'pacote', 
  20, 
  10,
  (SELECT id FROM suppliers WHERE name = 'MedSupplies Ltda' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM supplies WHERE name = 'Eletrodos Autoadesivos');
INSERT INTO supplies (name, description, category, unit_of_measure, current_stock, minimum_stock, supplier_id, is_active)
SELECT 
  'Gel Condutor', 
  'Gel para eletroterapia e ultrassom', 
  'materiais_descartaveis', 
  'litro', 
  5, 
  3,
  (SELECT id FROM suppliers WHERE name = 'MedSupplies Ltda' LIMIT 1),
  true
WHERE NOT EXISTS (SELECT 1 FROM supplies WHERE name = 'Gel Condutor');
-- ============================================================================
-- COMENTÁRIOS NAS TABELAS E COLUNAS
-- ============================================================================

COMMENT ON TABLE suppliers IS 'Tabela de fornecedores de insumos';
COMMENT ON TABLE supplies IS 'Tabela principal de insumos do sistema';
COMMENT ON TABLE stock_movements IS 'Registro de todas as movimentações de estoque';
COMMENT ON TABLE purchase_orders IS 'Pedidos de compra para reposição de estoque';
COMMENT ON TABLE purchase_order_items IS 'Itens individuais dos pedidos de compra';
COMMENT ON TABLE supply_alerts IS 'Alertas automáticos sobre insumos (estoque baixo, vencimento, etc)';
COMMENT ON TABLE task_supplies_used IS 'Registro de insumos utilizados em tarefas/procedimentos';
COMMENT ON TABLE task_type_supply_templates IS 'Templates de insumos padrão por tipo de tarefa';
COMMENT ON TABLE supply_batches IS 'Controle de lotes para rastreabilidade';
COMMENT ON TABLE auto_replenishment_rules IS 'Configurações para reposição automática de estoque';
-- ============================================================================
-- FIM DA MIGRAÇÃO 001
-- ============================================================================;
