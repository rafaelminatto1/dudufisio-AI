-- ============================================================================
-- TESTE: Verificar se as tabelas do Mapa Corporal foram criadas
-- ============================================================================

-- 1. Verificar tabelas existentes
SELECT 
  table_name,
  'Tabela existe' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name LIKE 'body_map%'
ORDER BY table_name;

-- 2. Verificar se há dados nas tabelas
SELECT 
  'body_map_sessions' as tabela,
  COUNT(*) as total_registros
FROM body_map_sessions
UNION ALL
SELECT 
  'body_map_pain_regions' as tabela,
  COUNT(*) as total_registros
FROM body_map_pain_regions
UNION ALL
SELECT 
  'body_map_analytics_cache' as tabela,
  COUNT(*) as total_registros
FROM body_map_analytics_cache
UNION ALL
SELECT 
  'body_regions_reference' as tabela,
  COUNT(*) as total_registros
FROM body_regions_reference;

-- 3. Verificar colunas da tabela body_map_sessions
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'body_map_sessions'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Verificar políticas RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operacao
FROM pg_policies
WHERE tablename LIKE 'body_map%'
ORDER BY tablename, policyname;

-- 5. Testar inserção de dados (se as tabelas existirem)
-- INSERT INTO body_regions_reference (region_key, region_name_pt, body_side) 
-- VALUES ('test_region', 'Região de Teste', 'front')
-- ON CONFLICT (region_key) DO NOTHING;

-- SELECT 'Teste de inserção realizado com sucesso' as resultado;
