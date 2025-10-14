-- ============================================================================
-- MIGRATION: Fix RLS Policies for Body Map (Development)
-- Data: 2025-10-14
-- Descrição: Configurar políticas permissivas para desenvolvimento
-- ⚠️ IMPORTANTE: Estas policies são para DESENVOLVIMENTO. Ajustar para produção!
-- ============================================================================

-- Remover policies existentes se houver conflito
DROP POLICY IF EXISTS "allow_all_for_development" ON body_map_sessions;
DROP POLICY IF EXISTS "allow_all_for_development" ON body_map_pain_regions;
DROP POLICY IF EXISTS "allow_all_for_development" ON body_map_analytics_cache;
DROP POLICY IF EXISTS "allow_all_for_development" ON body_regions_reference;

-- ============================================================================
-- OPÇÃO 1: Desabilitar RLS temporariamente (mais permissivo)
-- ============================================================================

-- Comentar estas linhas se preferir usar policies ao invés de desabilitar
ALTER TABLE body_map_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_analytics_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_regions_reference DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- OPÇÃO 2: Criar policies permissivas (comentado por padrão)
-- ============================================================================

-- Descomentar estas linhas se preferir usar policies ao invés de desabilitar RLS

/*
-- Reabilitar RLS primeiro
ALTER TABLE body_map_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_analytics_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_regions_reference ENABLE ROW LEVEL SECURITY;

-- Policy para body_map_sessions
CREATE POLICY "allow_all_for_development" ON body_map_sessions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy para body_map_pain_regions
CREATE POLICY "allow_all_for_development" ON body_map_pain_regions
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy para body_map_analytics_cache
CREATE POLICY "allow_all_for_development" ON body_map_analytics_cache
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Policy para body_regions_reference (tabela de referência, apenas leitura)
CREATE POLICY "allow_all_for_development" ON body_regions_reference
  FOR SELECT
  TO anon, authenticated
  USING (true);
*/

-- ============================================================================
-- GRANTS: Garantir permissões para anon e authenticated
-- ============================================================================

-- Garantir acesso para role anon
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_pain_regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_analytics_cache TO anon;
GRANT SELECT ON body_regions_reference TO anon;

-- Garantir acesso para role authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_pain_regions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_analytics_cache TO authenticated;
GRANT SELECT ON body_regions_reference TO authenticated;

-- ============================================================================
-- LOG de conclusão
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS policies configuradas para desenvolvimento';
  RAISE NOTICE '⚠️  LEMBRETE: Ajustar policies antes de ir para produção!';
END $$;

