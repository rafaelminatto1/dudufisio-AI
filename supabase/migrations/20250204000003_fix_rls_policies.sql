-- ============================================================================
-- CORREÇÃO DE POLÍTICAS RLS PARA GESTÃO DE INSUMOS
-- ============================================================================
-- Migração 003: Ajustar políticas RLS para permitir operações
-- Data: 2025-02-04
-- Descrição: Atualiza políticas RLS para funcionar com usuários autenticados
-- ============================================================================

-- ============================================================================
-- ATUALIZAR POLÍTICAS RLS
-- ============================================================================

-- Atualizar política de fornecedores
DROP POLICY IF EXISTS "Apenas admin pode gerenciar fornecedores" ON suppliers;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar fornecedores" ON suppliers;
CREATE POLICY "Usuários autenticados podem gerenciar fornecedores" ON suppliers
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de insumos
DROP POLICY IF EXISTS "Usuários autorizados podem gerenciar insumos" ON supplies;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar insumos" ON supplies;
CREATE POLICY "Usuários autenticados podem gerenciar insumos" ON supplies
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de movimentações
DROP POLICY IF EXISTS "Movimentações para usuários autenticados" ON stock_movements;
CREATE POLICY "Movimentações para usuários autenticados" ON stock_movements
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de pedidos de compra
DROP POLICY IF EXISTS "Pedidos para usuários autorizados" ON purchase_orders;
DROP POLICY IF EXISTS "Pedidos para usuários autenticados" ON purchase_orders;
CREATE POLICY "Pedidos para usuários autenticados" ON purchase_orders
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de alertas
DROP POLICY IF EXISTS "Alertas para usuários autenticados" ON supply_alerts;
CREATE POLICY "Alertas para usuários autenticados" ON supply_alerts
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de insumos de tarefas
DROP POLICY IF EXISTS "Insumos de tarefas para usuários autenticados" ON task_supplies_used;
CREATE POLICY "Insumos de tarefas para usuários autenticados" ON task_supplies_used
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de templates
DROP POLICY IF EXISTS "Templates para usuários autenticados" ON task_type_supply_templates;
CREATE POLICY "Templates para usuários autenticados" ON task_type_supply_templates
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de lotes
DROP POLICY IF EXISTS "Lotes para usuários autenticados" ON supply_batches;
CREATE POLICY "Lotes para usuários autenticados" ON supply_batches
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de aprovações
DROP POLICY IF EXISTS "Aprovações para usuários autenticados" ON purchase_approvals;
CREATE POLICY "Aprovações para usuários autenticados" ON purchase_approvals
  FOR ALL USING (auth.uid() IS NOT NULL);
-- Atualizar política de regras de reposição
DROP POLICY IF EXISTS "Regras de reposição para usuários autenticados" ON auto_replenishment_rules;
CREATE POLICY "Regras de reposição para usuários autenticados" ON auto_replenishment_rules
  FOR ALL USING (auth.uid() IS NOT NULL);
-- ============================================================================
-- FIM DA MIGRAÇÃO 003
-- ============================================================================;
