-- ============================================================================
-- MIGRAÇÃO: SISTEMA DE GESTÃO DE INSUMOS - FISIO-AI
-- Data: 2025-01-27
-- Descrição: Schema completo para gestão de insumos com integração ao sistema de tarefas
-- ============================================================================

BEGIN;

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TABELA DE FORNECEDORES
-- ============================================================================
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  cnpj VARCHAR(18),
  payment_terms VARCHAR(100),
  delivery_time_days INTEGER DEFAULT 7,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA PRINCIPAL DE INSUMOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS supplies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL CHECK (category IN (
    'equipamentos', 'materiais_descartaveis', 'medicamentos_topicos',
    'materiais_limpeza', 'materiais_escritorio', 'equipamentos_protecao'
  )),
  subcategory VARCHAR(100),
  brand VARCHAR(100),
  model VARCHAR(100),
  unit_of_measure VARCHAR(50) NOT NULL, -- unidade, caixa, litro, kg
  current_stock INTEGER DEFAULT 0,
  minimum_stock INTEGER DEFAULT 0,
  maximum_stock INTEGER,
  unit_cost DECIMAL(10,2),
  supplier_id UUID REFERENCES suppliers(id),
  barcode VARCHAR(100),
  expiration_date DATE,
  storage_location VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  requires_prescription BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE MOVIMENTAÇÕES DE ESTOQUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  movement_type VARCHAR(20) NOT NULL CHECK (movement_type IN (
    'entrada', 'saida', 'ajuste', 'vencimento', 'perda'
  )),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  reason VARCHAR(255),
  reference_document VARCHAR(100), -- nota fiscal, requisição
  moved_by UUID REFERENCES users(id),
  patient_id UUID REFERENCES patients(id), -- se usado em paciente específico
  task_id UUID, -- Referência para tarefas (será criada posteriormente)
  batch_number VARCHAR(100), -- Número do lote
  expiration_date DATE, -- Data de validade específica do lote
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE PEDIDOS DE COMPRA
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'approved', 'ordered', 'received', 'cancelled', 'partial'
  )),
  total_amount DECIMAL(10,2),
  requested_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  order_date DATE,
  expected_delivery DATE,
  received_date DATE,
  notes TEXT,
  is_auto_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE ITENS DO PEDIDO DE COMPRA
-- ============================================================================
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE,
  supply_id UUID REFERENCES supplies(id),
  quantity_requested INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- TABELA DE ALERTAS DE INSUMOS
-- ============================================================================
CREATE TABLE IF NOT EXISTS supply_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supply_id UUID REFERENCES supplies(id) ON DELETE CASCADE,
  alert_type VARCHAR(50) NOT NULL CHECK (alert_type IN (
    'low_stock', 'critical_stock', 'expiring', 'expired', 'overdue_order'
  )),
  severity VARCHAR(20) DEFAULT 'medium' CHECK (severity IN (
    'low', 'medium', 'high', 'critical'
  )),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  is_resolved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID REFERENCES users(id)
);

-- ============================================================================
-- TABELA DE PREFERÊNCIAS DE ALERTAS POR USUÁRIO
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_alert_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  alert_type VARCHAR(50),
  is_enabled BOOLEAN DEFAULT true,
  notification_method VARCHAR(20) DEFAULT 'in_app' CHECK (notification_method IN (
    'in_app', 'email', 'both'
  )),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, alert_type)
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

-- Índices para supplies
CREATE INDEX IF NOT EXISTS idx_supplies_category_active 
  ON supplies(category, is_active);

CREATE INDEX IF NOT EXISTS idx_supplies_supplier 
  ON supplies(supplier_id) WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_supplies_stock_level 
  ON supplies(current_stock, minimum_stock) WHERE is_active;

CREATE INDEX IF NOT EXISTS idx_supplies_expiration 
  ON supplies(expiration_date) WHERE expiration_date IS NOT NULL AND is_active;

-- Índices para stock_movements
CREATE INDEX IF NOT EXISTS idx_stock_movements_supply_date 
  ON stock_movements(supply_id, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_movements_type_date 
  ON stock_movements(movement_type, created_at);

CREATE INDEX IF NOT EXISTS idx_stock_movements_task 
  ON stock_movements(task_id) WHERE task_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_stock_movements_patient 
  ON stock_movements(patient_id) WHERE patient_id IS NOT NULL;

-- Índices para purchase_orders
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status 
  ON purchase_orders(status);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier 
  ON purchase_orders(supplier_id);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_date 
  ON purchase_orders(order_date);

-- Índices para alerts
CREATE INDEX IF NOT EXISTS idx_supply_alerts_type_resolved 
  ON supply_alerts(alert_type, is_resolved);

CREATE INDEX IF NOT EXISTS idx_supply_alerts_supply 
  ON supply_alerts(supply_id);

CREATE INDEX IF NOT EXISTS idx_supply_alerts_severity 
  ON supply_alerts(severity);

-- ============================================================================
-- FUNÇÕES AUXILIARES
-- ============================================================================

-- Função para atualizar current_stock automaticamente
CREATE OR REPLACE FUNCTION update_supply_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular estoque atual baseado nas movimentações
  UPDATE supplies 
  SET current_stock = (
    SELECT COALESCE(SUM(
      CASE 
        WHEN movement_type = 'entrada' THEN quantity
        WHEN movement_type = 'saida' THEN -quantity
        WHEN movement_type = 'ajuste' THEN quantity
        WHEN movement_type = 'perda' THEN -quantity
        ELSE 0
      END
    ), 0)
    FROM stock_movements 
    WHERE supply_id = NEW.supply_id
  ),
  updated_at = NOW()
  WHERE id = NEW.supply_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque automaticamente
CREATE TRIGGER trigger_update_supply_stock
  AFTER INSERT OR UPDATE OR DELETE ON stock_movements
  FOR EACH ROW EXECUTE FUNCTION update_supply_stock();

-- Função para gerar número de pedido único
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
    NEW.order_number := 'PO-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || 
                       LPAD(NEXTVAL('order_sequence')::TEXT, 4, '0');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar sequência para números de pedido
CREATE SEQUENCE IF NOT EXISTS order_sequence START 1;

-- Trigger para gerar número de pedido
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON purchase_orders
  FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- ============================================================================
-- HABILITAR RLS (ROW LEVEL SECURITY)
-- ============================================================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_alert_preferences ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Políticas para suppliers
CREATE POLICY "Users can view all suppliers" ON suppliers
  FOR SELECT USING (true);

CREATE POLICY "Users can insert suppliers" ON suppliers
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update suppliers" ON suppliers
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para supplies
CREATE POLICY "Users can view all supplies" ON supplies
  FOR SELECT USING (true);

CREATE POLICY "Users can insert supplies" ON supplies
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update supplies" ON supplies
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para stock_movements
CREATE POLICY "Users can view all stock movements" ON stock_movements
  FOR SELECT USING (true);

CREATE POLICY "Users can insert stock movements" ON stock_movements
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Políticas para purchase_orders
CREATE POLICY "Users can view all purchase orders" ON purchase_orders
  FOR SELECT USING (true);

CREATE POLICY "Users can insert purchase orders" ON purchase_orders
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update purchase orders" ON purchase_orders
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para purchase_order_items
CREATE POLICY "Users can view all purchase order items" ON purchase_order_items
  FOR SELECT USING (true);

CREATE POLICY "Users can insert purchase order items" ON purchase_order_items
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update purchase order items" ON purchase_order_items
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para supply_alerts
CREATE POLICY "Users can view all supply alerts" ON supply_alerts
  FOR SELECT USING (true);

CREATE POLICY "Users can insert supply alerts" ON supply_alerts
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update supply alerts" ON supply_alerts
  FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Políticas para user_alert_preferences
CREATE POLICY "Users can view own alert preferences" ON user_alert_preferences
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can manage own alert preferences" ON user_alert_preferences
  FOR ALL USING (user_id = auth.uid());

-- ============================================================================
-- DADOS INICIAIS (SEED DATA)
-- ============================================================================

-- Inserir categorias de fornecedores padrão
INSERT INTO suppliers (name, contact_person, email, phone, is_active) VALUES
('Fornecedor Geral de Insumos', 'João Silva', 'joao@fornecedor.com', '(11) 99999-9999', true),
('MedSupply Ltda', 'Maria Santos', 'contato@medsupply.com', '(11) 88888-8888', true),
('EquipMed Brasil', 'Carlos Oliveira', 'vendas@equipmed.com', '(11) 77777-7777', true)
ON CONFLICT DO NOTHING;

-- Inserir alguns insumos de exemplo
INSERT INTO supplies (name, description, category, subcategory, brand, unit_of_measure, minimum_stock, unit_cost, supplier_id, is_active) VALUES
('Eletrodos Autoadesivos', 'Eletrodos para eletroterapia', 'equipamentos', 'eletroterapia', 'MedSupply', 'unidade', 50, 2.50, (SELECT id FROM suppliers LIMIT 1), true),
('Gel Condutor', 'Gel para eletroterapia', 'materiais_descartaveis', 'eletroterapia', 'MedSupply', 'frasco', 10, 15.00, (SELECT id FROM suppliers LIMIT 1), true),
('Theraband Vermelho', 'Banda elástica para exercícios', 'equipamentos', 'exercicios', 'TheraBand', 'unidade', 5, 25.00, (SELECT id FROM suppliers LIMIT 1), true),
('Bola Suíça 65cm', 'Bola de exercícios terapêuticos', 'equipamentos', 'exercicios', 'Gymnic', 'unidade', 2, 120.00, (SELECT id FROM suppliers LIMIT 1), true),
('Óleo de Massagem', 'Óleo para massagem terapêutica', 'materiais_descartaveis', 'massagem', 'Weleda', 'frasco', 8, 35.00, (SELECT id FROM suppliers LIMIT 1), true),
('Luvas de Exame', 'Luvas descartáveis', 'equipamentos_protecao', 'protecao', 'MedSupply', 'caixa', 20, 12.00, (SELECT id FROM suppliers LIMIT 1), true),
('Álcool 70%', 'Álcool para desinfecção', 'materiais_limpeza', 'desinfetantes', 'MedSupply', 'litro', 5, 8.50, (SELECT id FROM suppliers LIMIT 1), true)
ON CONFLICT DO NOTHING;

COMMIT;
