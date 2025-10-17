-- ============================================================================
-- MIGRAÇÃO: SISTEMA DE RELATÓRIOS E ANALYTICS
-- ============================================================================
-- Data: 2025-01-27
-- Descrição: Criação de sistema completo de relatórios e analytics
-- ============================================================================

BEGIN;

-- ============================================================================
-- VIEWS PARA ANALYTICS
-- ============================================================================

-- View para análise de consumo de insumos
CREATE OR REPLACE VIEW supply_consumption_analytics AS
SELECT 
  s.id as supply_id,
  s.name as supply_name,
  s.category,
  s.unit_of_measure,
  s.current_stock,
  s.minimum_stock,
  s.maximum_stock,
  s.unit_cost,
  
  -- Consumo total (últimos 30 dias)
  COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN sm.quantity ELSE 0 END), 0) as total_consumed_30d,
  
  -- Custo total consumido (últimos 30 dias)
  COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN sm.quantity * s.unit_cost ELSE 0 END), 0) as total_cost_consumed,
  
  -- Consumo médio diário (últimos 30 dias)
  COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN sm.quantity ELSE 0 END), 0) / 30.0 as avg_daily_consumption_30d,
  
  -- Consumo médio mensal (últimos 90 dias)
  COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '90 days' THEN sm.quantity ELSE 0 END), 0) / 3.0 as avg_monthly_consumption_90d,
  
  -- Previsão de estoque (dias restantes)
  CASE 
    WHEN COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN sm.quantity ELSE 0 END), 0) > 0 THEN
      s.current_stock / (COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN sm.quantity ELSE 0 END), 0) / 30.0)
    ELSE NULL
  END as days_of_stock_remaining,
  
  -- Taxa de giro do estoque (últimos 30 dias)
  CASE 
    WHEN s.current_stock > 0 THEN
      COALESCE(SUM(CASE WHEN sm.movement_type = 'saida' AND sm.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN sm.quantity ELSE 0 END), 0) / s.current_stock
    ELSE 0
  END as stock_turnover_30d,
  
  -- Status do estoque
  CASE 
    WHEN s.current_stock <= s.minimum_stock THEN 'low_stock'
    WHEN s.current_stock >= s.maximum_stock THEN 'overstock'
    ELSE 'normal'
  END as stock_status

FROM supplies s
LEFT JOIN stock_movements sm ON s.id = sm.supply_id
WHERE s.is_active = true
GROUP BY s.id, s.name, s.category, s.unit_of_measure, s.current_stock, 
         s.minimum_stock, s.maximum_stock, s.unit_cost;

-- ============================================================================
-- VIEW PARA CUSTOS POR TAREFA
-- ============================================================================

CREATE OR REPLACE VIEW task_cost_analytics AS
SELECT 
  t.id as task_id,
  t.title as task_title,
  t.task_type as task_type,
  t.status as task_status,
  t.created_at as task_date,
  t.estimated_duration,
  t.actual_duration,
  
  -- Dados do paciente
  p.id as patient_id,
  p.name as patient_name,
  
  -- Dados do terapeuta
  u.id as therapist_id,
  u.full_name as therapist_name,
  
  -- Custos de insumos
  COALESCE(SUM(tsu.total_cost), 0) as total_supply_cost,
  COUNT(tsu.id) as supplies_used_count,
  COALESCE(SUM(tsu.quantity_used), 0) as total_quantity_used,
  
  -- Custo médio por insumo
  CASE 
    WHEN COUNT(tsu.id) > 0 THEN
      COALESCE(SUM(tsu.total_cost), 0) / COUNT(tsu.id)
    ELSE 0
  END as avg_cost_per_supply,
  
  -- Custos totais (se disponíveis)
  tc.labor_cost,
  tc.overhead_cost,
  tc.total_cost as calculated_total_cost
  
FROM tasks t
LEFT JOIN patients p ON t.patient_id = p.id
LEFT JOIN users u ON t.assigned_user_id = u.id
LEFT JOIN task_supplies_used tsu ON t.id = tsu.task_id
LEFT JOIN task_costs tc ON t.id = tc.task_id
WHERE t.is_active = true
GROUP BY t.id, t.title, t.task_type, t.status, t.created_at, t.estimated_duration, 
         t.actual_duration, p.id, p.name, u.id, u.full_name, tc.labor_cost, 
         tc.overhead_cost, tc.total_cost;

-- ============================================================================
-- VIEW PARA PERFORMANCE DE FORNECEDORES
-- ============================================================================

CREATE OR REPLACE VIEW supplier_performance_analytics AS
SELECT 
  sp.id as supplier_id,
  sp.name as supplier_name,
  sp.contact_person,
  sp.email,
  sp.phone,
  sp.delivery_time_days,
  
  -- Contagem de produtos
  COUNT(DISTINCT s.id) as total_products,
  COUNT(DISTINCT CASE WHEN s.is_active THEN s.id END) as active_products,
  
  -- Pedidos
  COUNT(DISTINCT po.id) as total_orders,
  COUNT(DISTINCT CASE WHEN po.status = 'received' THEN po.id END) as completed_orders,
  COUNT(DISTINCT CASE WHEN po.status = 'cancelled' THEN po.id END) as cancelled_orders,
  COUNT(DISTINCT CASE WHEN po.expected_delivery < CURRENT_DATE AND po.status IN ('ordered', 'partial') THEN po.id END) as overdue_orders,
  
  -- Valores
  COALESCE(SUM(po.total_amount), 0) as total_order_value,
  COALESCE(SUM(CASE WHEN po.status = 'received' THEN po.total_amount ELSE 0 END), 0) as completed_order_value,
  
  -- Performance de entrega
  AVG(CASE 
    WHEN po.status = 'received' AND po.received_date IS NOT NULL AND po.order_date IS NOT NULL THEN
      (po.received_date - po.order_date)::integer -- dias
    ELSE NULL
  END) as avg_delivery_days,
  
  -- Taxa de entrega no prazo
  CASE 
    WHEN COUNT(DISTINCT po.id) = 0 THEN 'N/A'
    WHEN COUNT(DISTINCT CASE WHEN po.expected_delivery < CURRENT_DATE AND po.status IN ('ordered', 'partial') THEN po.id END) > 0 THEN 'Ruim'
    WHEN AVG(CASE 
      WHEN po.status = 'received' AND po.received_date IS NOT NULL AND po.order_date IS NOT NULL THEN
        (po.received_date - po.order_date)::integer
      ELSE NULL
    END) > sp.delivery_time_days * 1.5 THEN 'Regular'
    ELSE 'Bom'
  END as performance_rating,
  
  -- Última atualização
  MAX(po.updated_at) as last_order_date

FROM suppliers sp
LEFT JOIN supplies s ON sp.id = s.supplier_id
LEFT JOIN purchase_orders po ON sp.id = po.supplier_id
WHERE sp.is_active = true
GROUP BY sp.id, sp.name, sp.contact_person, sp.email, sp.phone, sp.delivery_time_days;

-- ============================================================================
-- TABELAS PARA RELATÓRIOS AGENDADOS
-- ============================================================================

-- Tabela para relatórios agendados
CREATE TABLE IF NOT EXISTS scheduled_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  parameters JSONB DEFAULT '{}',
  schedule_type VARCHAR(20) NOT NULL CHECK (schedule_type IN ('daily', 'weekly', 'monthly', 'quarterly')),
  schedule_time TIME DEFAULT '09:00:00',
  schedule_day INTEGER, -- dia da semana (1-7) ou dia do mês (1-31)
  recipients TEXT[] NOT NULL, -- emails dos destinatários
  format VARCHAR(20) DEFAULT 'pdf' CHECK (format IN ('pdf', 'excel', 'csv')),
  is_active BOOLEAN DEFAULT true,
  last_run TIMESTAMP WITH TIME ZONE,
  next_run TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tabela para histórico de relatórios
CREATE TABLE IF NOT EXISTS report_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scheduled_report_id UUID REFERENCES scheduled_reports(id),
  report_name VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL,
  parameters JSONB DEFAULT '{}',
  status VARCHAR(20) NOT NULL CHECK (status IN ('pending', 'running', 'completed', 'failed')),
  file_path VARCHAR(500),
  file_size BIGINT,
  recipients TEXT[],
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para métricas de performance
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100) NOT NULL,
  metric_category VARCHAR(50) NOT NULL,
  metric_value DECIMAL(15,4),
  metric_unit VARCHAR(50),
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_scheduled_reports_next_run ON scheduled_reports(next_run) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_scheduled_reports_type ON scheduled_reports(report_type);
CREATE INDEX IF NOT EXISTS idx_report_history_status ON report_history(status);
CREATE INDEX IF NOT EXISTS idx_report_history_created_at ON report_history(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_category ON performance_metrics(metric_category);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_period ON performance_metrics(period_start, period_end);

-- ============================================================================
-- HABILITAR RLS
-- ============================================================================

ALTER TABLE scheduled_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE report_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS RLS
-- ============================================================================

-- Políticas para scheduled_reports
CREATE POLICY "Users can view all scheduled reports" ON scheduled_reports
  FOR SELECT USING (true);

CREATE POLICY "Users can manage scheduled reports" ON scheduled_reports
  FOR ALL USING (auth.uid() IS NOT NULL);

-- Políticas para report_history
CREATE POLICY "Users can view all report history" ON report_history
  FOR SELECT USING (true);

CREATE POLICY "System can insert report history" ON report_history
  FOR INSERT WITH CHECK (true);

-- Políticas para performance_metrics
CREATE POLICY "Users can view all performance metrics" ON performance_metrics
  FOR SELECT USING (true);

CREATE POLICY "System can manage performance metrics" ON performance_metrics
  FOR ALL WITH CHECK (true);

-- ============================================================================
-- DADOS INICIAIS - RELATÓRIOS PADRÃO
-- ============================================================================

-- Inserir relatórios agendados padrão
INSERT INTO scheduled_reports (report_name, report_type, parameters, schedule_type, schedule_time, recipients, created_by) VALUES
('Relatório Semanal de Consumo', 'consumption', '{"period_days": 7}', 'weekly', '09:00:00', ARRAY['admin@clinica.com'], NULL),
('Relatório Mensal de Custos', 'cost_analysis', '{"period_days": 30}', 'monthly', '09:00:00', ARRAY['admin@clinica.com', 'financeiro@clinica.com'], NULL),
('Performance de Fornecedores - Trimestral', 'supplier_performance', '{"period_days": 90}', 'quarterly', '09:00:00', ARRAY['admin@clinica.com'], NULL),
('Valorização do Estoque - Mensal', 'stock_valuation', '{"include_categories": true}', 'monthly', '09:00:00', ARRAY['admin@clinica.com'], NULL)
ON CONFLICT DO NOTHING;

COMMIT;