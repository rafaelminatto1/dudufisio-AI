-- ============================================================================
-- DESABILITAR RLS PARA DESENVOLVIMENTO
-- ============================================================================
-- Migração 004: Desabilita RLS temporariamente para desenvolvimento
-- Data: 2025-02-04
-- Descrição: Permite operações sem autenticação real durante desenvolvimento
-- ⚠️ ATENÇÃO: Esta migração é APENAS para desenvolvimento!
-- ============================================================================

-- ============================================================================
-- DESABILITAR ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE suppliers DISABLE ROW LEVEL SECURITY;
ALTER TABLE supplies DISABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE supply_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_supplies_used DISABLE ROW LEVEL SECURITY;
ALTER TABLE task_type_supply_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE supply_batches DISABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_approvals DISABLE ROW LEVEL SECURITY;
ALTER TABLE auto_replenishment_rules DISABLE ROW LEVEL SECURITY;
-- ============================================================================
-- COMENTÁRIO DE AVISO
-- ============================================================================

COMMENT ON TABLE suppliers IS '⚠️ RLS DESABILITADO PARA DESENVOLVIMENTO - HABILITAR EM PRODUÇÃO';
COMMENT ON TABLE supplies IS '⚠️ RLS DESABILITADO PARA DESENVOLVIMENTO - HABILITAR EM PRODUÇÃO';
COMMENT ON TABLE stock_movements IS '⚠️ RLS DESABILITADO PARA DESENVOLVIMENTO - HABILITAR EM PRODUÇÃO';
COMMENT ON TABLE purchase_orders IS '⚠️ RLS DESABILITADO PARA DESENVOLVIMENTO - HABILITAR EM PRODUÇÃO';
-- ============================================================================
-- FIM DA MIGRAÇÃO 004
-- ============================================================================;
