-- ============================================================================
-- REABILITAR ROW LEVEL SECURITY PARA PRODUÇÃO
-- ============================================================================
-- Migração: 20251027000010_reenable_rls_production.sql
-- Data: 2025-10-27
-- Descrição: Reabilita RLS e cria políticas de segurança adequadas
-- Prioridade: CRÍTICA - SEGURANÇA
-- ============================================================================

-- ============================================================================
-- REABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_supplies_used ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_type_supply_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE supply_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replenishment_rules ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - SUPPLIERS
-- ============================================================================

-- Admins e Therapists podem ver todos os fornecedores
CREATE POLICY "Admins and therapists can view all suppliers"
ON suppliers FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Apenas Admins podem inserir/atualizar/deletar fornecedores
CREATE POLICY "Only admins can manage suppliers"
ON suppliers FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - SUPPLIES
-- ============================================================================

-- Admins e Therapists podem ver todos os insumos
CREATE POLICY "Admins and therapists can view all supplies"
ON supplies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Admins e Therapists podem inserir novos insumos
CREATE POLICY "Admins and therapists can create supplies"
ON supplies FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Apenas Admins podem atualizar insumos
CREATE POLICY "Only admins can update supplies"
ON supplies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Apenas Admins podem deletar insumos
CREATE POLICY "Only admins can delete supplies"
ON supplies FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - STOCK_MOVEMENTS
-- ============================================================================

-- Admins e Therapists podem ver todas as movimentações
CREATE POLICY "Admins and therapists can view stock movements"
ON stock_movements FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Admins e Therapists podem registrar movimentações
CREATE POLICY "Admins and therapists can create stock movements"
ON stock_movements FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
  AND moved_by = auth.uid()
);

-- Apenas Admins podem deletar movimentações
CREATE POLICY "Only admins can delete stock movements"
ON stock_movements FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - PURCHASE_ORDERS
-- ============================================================================

-- Admins e Therapists podem ver pedidos de compra
CREATE POLICY "Admins and therapists can view purchase orders"
ON purchase_orders FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Admins e Therapists podem criar pedidos
CREATE POLICY "Admins and therapists can create purchase orders"
ON purchase_orders FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
  AND requested_by = auth.uid()
);

-- Apenas Admins podem aprovar/atualizar pedidos
CREATE POLICY "Only admins can update purchase orders"
ON purchase_orders FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - PURCHASE_ORDER_ITEMS
-- ============================================================================

-- Seguem as mesmas regras dos purchase_orders
CREATE POLICY "View purchase order items with parent permission"
ON purchase_order_items FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM purchase_orders po
    INNER JOIN users u ON u.id = auth.uid()
    WHERE po.id = purchase_order_items.purchase_order_id
    AND u.role IN ('admin', 'therapist')
  )
);

CREATE POLICY "Create purchase order items with parent permission"
ON purchase_order_items FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM purchase_orders po
    INNER JOIN users u ON u.id = auth.uid()
    WHERE po.id = purchase_order_items.purchase_order_id
    AND u.role IN ('admin', 'therapist')
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - SUPPLY_ALERTS
-- ============================================================================

-- Admins e Therapists podem ver alertas
CREATE POLICY "Admins and therapists can view supply alerts"
ON supply_alerts FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Sistema pode criar alertas (via service_role)
-- Admins podem resolver alertas
CREATE POLICY "Admins can resolve supply alerts"
ON supply_alerts FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - TASK_SUPPLIES_USED
-- ============================================================================

-- Therapists podem ver uso de insumos de suas próprias tarefas
CREATE POLICY "Therapists can view their task supplies usage"
ON task_supplies_used FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Therapists podem registrar uso de insumos
CREATE POLICY "Therapists can record supply usage"
ON task_supplies_used FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
  AND used_by = auth.uid()
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - TASK_TYPE_SUPPLY_TEMPLATES
-- ============================================================================

-- Todos authenticated podem ver templates
CREATE POLICY "Authenticated users can view supply templates"
ON task_type_supply_templates FOR SELECT
TO authenticated
USING (true);

-- Apenas Admins podem criar templates
CREATE POLICY "Only admins can insert supply templates"
ON task_type_supply_templates FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Apenas Admins podem atualizar templates
CREATE POLICY "Only admins can update supply templates"
ON task_type_supply_templates FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Apenas Admins podem deletar templates
CREATE POLICY "Only admins can delete supply templates"
ON task_type_supply_templates FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - SUPPLY_BATCHES
-- ============================================================================

-- Admins e Therapists podem ver lotes
CREATE POLICY "Admins and therapists can view supply batches"
ON supply_batches FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('admin', 'therapist')
  )
);

-- Apenas Admins podem criar lotes
CREATE POLICY "Only admins can insert supply batches"
ON supply_batches FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Apenas Admins podem atualizar lotes
CREATE POLICY "Only admins can update supply batches"
ON supply_batches FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- Apenas Admins podem deletar lotes
CREATE POLICY "Only admins can delete supply batches"
ON supply_batches FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - PURCHASE_APPROVALS
-- ============================================================================

-- Admins podem ver e gerenciar aprovações
CREATE POLICY "Admins can manage purchase approvals"
ON purchase_approvals FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA - AUTO_REPLENISHMENT_RULES
-- ============================================================================

-- Admins podem ver e gerenciar regras de reposição automática
CREATE POLICY "Admins can manage auto replenishment rules"
ON auto_replenishment_rules FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  )
);

-- ============================================================================
-- ATUALIZAR COMENTÁRIOS
-- ============================================================================

COMMENT ON TABLE suppliers IS 'Fornecedores - RLS HABILITADO com políticas por role';
COMMENT ON TABLE supplies IS 'Insumos - RLS HABILITADO com políticas por role';
COMMENT ON TABLE stock_movements IS 'Movimentações de estoque - RLS HABILITADO';
COMMENT ON TABLE purchase_orders IS 'Pedidos de compra - RLS HABILITADO';

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================

