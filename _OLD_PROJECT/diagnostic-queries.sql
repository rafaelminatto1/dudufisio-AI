-- ============================================================================
-- DIAGNOSTIC QUERIES - Identificar Causas da Falha
-- Date: 2025-11-06
-- Purpose: Diagnosticar exatamente quais testes falharam e por quê
-- ============================================================================

-- Execute estas queries NO ORDEM para identificar o problema

-- ============================================================================
-- DIAGNÓSTICO 1: CONTAGENS DETALHADAS
-- ============================================================================

SELECT '=== DIAGNÓSTICO 1: CONTAGENS DETALHADAS ===' as secao;

-- Protocols
SELECT 
  'exercise_protocols' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN exercises IS NOT NULL THEN 1 END) as com_jsonb,
  COUNT(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN 1 END) as jsonb_valido,
  COUNT(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' AND jsonb_array_length(exercises) > 0 THEN 1 END) as jsonb_populado,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int as total_exercises_jsonb,
  (SELECT COUNT(*) FROM protocol_exercises) as total_junction,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int - (SELECT COUNT(*) FROM protocol_exercises) as diferenca
FROM exercise_protocols;

-- Prescriptions
SELECT 
  'patient_exercise_prescriptions' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN exercises IS NOT NULL THEN 1 END) as com_jsonb,
  COUNT(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN 1 END) as jsonb_valido,
  COUNT(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' AND jsonb_array_length(exercises) > 0 THEN 1 END) as jsonb_populado,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int as total_exercises_jsonb,
  (SELECT COUNT(*) FROM prescription_exercises) as total_junction,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int - (SELECT COUNT(*) FROM prescription_exercises) as diferenca
FROM patient_exercise_prescriptions;

-- Evolutions
SELECT 
  'session_evolutions' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN prescribed_exercises IS NOT NULL THEN 1 END) as com_jsonb,
  COUNT(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN 1 END) as jsonb_valido,
  COUNT(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' AND jsonb_array_length(prescribed_exercises) > 0 THEN 1 END) as jsonb_populado,
  SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END)::int as total_exercises_jsonb,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as total_junction,
  SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END)::int - (SELECT COUNT(*) FROM evolution_prescribed_exercises) as diferenca
FROM session_evolutions;

-- ============================================================================
-- DIAGNÓSTICO 2: EXERCISE IDS ÓRFÃOS NO JSONB
-- ============================================================================

SELECT '=== DIAGNÓSTICO 2: EXERCISE IDS ÓRFÃOS ===' as secao;

-- Exercise IDs no JSONB que não existem na tabela exercises
WITH orphaned_from_protocols AS (
  SELECT DISTINCT 
    'exercise_protocols' as fonte,
    (ex.value->>'exercise_id')::text as exercise_id_orphan
  FROM exercise_protocols ep,
       jsonb_array_elements(ep.exercises) as ex(value)
  WHERE ep.exercises IS NOT NULL 
    AND jsonb_typeof(ep.exercises) = 'array'
    AND jsonb_array_length(ep.exercises) > 0
    AND (ex.value->>'exercise_id') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM exercises e 
      WHERE e.id::text = (ex.value->>'exercise_id')::text
    )
),
orphaned_from_prescriptions AS (
  SELECT DISTINCT 
    'patient_exercise_prescriptions' as fonte,
    (ex.value->>'exercise_id')::text as exercise_id_orphan
  FROM patient_exercise_prescriptions pep,
       jsonb_array_elements(pep.exercises) as ex(value)
  WHERE pep.exercises IS NOT NULL 
    AND jsonb_typeof(pep.exercises) = 'array'
    AND jsonb_array_length(pep.exercises) > 0
    AND (ex.value->>'exercise_id') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM exercises e 
      WHERE e.id::text = (ex.value->>'exercise_id')::text
    )
),
orphaned_from_evolutions AS (
  SELECT DISTINCT 
    'session_evolutions' as fonte,
    (ex.value->>'exercise_id')::text as exercise_id_orphan
  FROM session_evolutions se,
       jsonb_array_elements(se.prescribed_exercises) as ex(value)
  WHERE se.prescribed_exercises IS NOT NULL 
    AND jsonb_typeof(se.prescribed_exercises) = 'array'
    AND jsonb_array_length(se.prescribed_exercises) > 0
    AND (ex.value->>'exercise_id') IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM exercises e 
      WHERE e.id::text = (ex.value->>'exercise_id')::text
    )
)
SELECT * FROM orphaned_from_protocols
UNION ALL
SELECT * FROM orphaned_from_prescriptions
UNION ALL
SELECT * FROM orphaned_from_evolutions
LIMIT 50;

-- ============================================================================
-- DIAGNÓSTICO 3: FORMATO DO JSONB
-- ============================================================================

SELECT '=== DIAGNÓSTICO 3: AMOSTRAS DO JSONB ===' as secao;

-- Amostra de JSONB de protocols (para verificar formato)
SELECT 
  id,
  name,
  jsonb_typeof(exercises) as tipo,
  jsonb_array_length(exercises) as qtd_exercises,
  exercises::text as jsonb_content
FROM exercise_protocols
WHERE exercises IS NOT NULL 
  AND jsonb_typeof(exercises) = 'array'
  AND jsonb_array_length(exercises) > 0
LIMIT 3;

-- Amostra de JSONB de prescriptions
SELECT 
  id,
  title,
  jsonb_typeof(exercises) as tipo,
  jsonb_array_length(exercises) as qtd_exercises,
  exercises::text as jsonb_content
FROM patient_exercise_prescriptions
WHERE exercises IS NOT NULL 
  AND jsonb_typeof(exercises) = 'array'
  AND jsonb_array_length(exercises) > 0
LIMIT 3;

-- Amostra de JSONB de evolutions
SELECT 
  id,
  patient_id,
  jsonb_typeof(prescribed_exercises) as tipo,
  jsonb_array_length(prescribed_exercises) as qtd_exercises,
  prescribed_exercises::text as jsonb_content
FROM session_evolutions
WHERE prescribed_exercises IS NOT NULL 
  AND jsonb_typeof(prescribed_exercises) = 'array'
  AND jsonb_array_length(prescribed_exercises) > 0
LIMIT 3;

-- ============================================================================
-- DIAGNÓSTICO 4: KEYS ESPERADAS VS REAIS NO JSONB
-- ============================================================================

SELECT '=== DIAGNÓSTICO 4: ESTRUTURA DO JSONB ===' as secao;

-- Verificar quais keys estão presentes no JSONB
WITH jsonb_keys AS (
  SELECT DISTINCT jsonb_object_keys(ex.value) as key_name
  FROM exercise_protocols ep,
       jsonb_array_elements(ep.exercises) as ex(value)
  WHERE ep.exercises IS NOT NULL 
    AND jsonb_array_length(ep.exercises) > 0
  LIMIT 100
)
SELECT 
  'Keys em exercise_protocols.exercises' as fonte,
  array_agg(key_name ORDER BY key_name) as keys_presentes
FROM jsonb_keys;

-- ============================================================================
-- DIAGNÓSTICO 5: REGISTROS NA JUNCTION TABLE
-- ============================================================================

SELECT '=== DIAGNÓSTICO 5: JUNCTION TABLES STATE ===' as secao;

-- Ver alguns registros das junction tables
SELECT 'protocol_exercises' as tabela, * FROM protocol_exercises LIMIT 5;
SELECT 'prescription_exercises' as tabela, * FROM prescription_exercises LIMIT 5;
SELECT 'evolution_prescribed_exercises' as tabela, * FROM evolution_prescribed_exercises LIMIT 5;

-- ============================================================================
-- DIAGNÓSTICO 6: IDENTIFICAR TESTES QUE FALHARAM
-- ============================================================================

SELECT '=== DIAGNÓSTICO 6: STATUS DOS TESTES ===' as secao;

-- Teste 1: Contagem protocols
SELECT 
  'Teste 1: Contagem exercise_protocols' as teste,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int as jsonb_count,
  (SELECT COUNT(*) FROM protocol_exercises) as junction_count,
  CASE 
    WHEN SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) = (SELECT COUNT(*) FROM protocol_exercises)
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM exercise_protocols;

-- Teste 2: Contagem prescriptions
SELECT 
  'Teste 2: Contagem prescriptions' as teste,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int as jsonb_count,
  (SELECT COUNT(*) FROM prescription_exercises) as junction_count,
  CASE 
    WHEN SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) = (SELECT COUNT(*) FROM prescription_exercises)
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM patient_exercise_prescriptions;

-- Teste 3: Contagem evolutions
SELECT 
  'Teste 3: Contagem evolutions' as teste,
  SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END)::int as jsonb_count,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as junction_count,
  CASE 
    WHEN SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) = (SELECT COUNT(*) FROM evolution_prescribed_exercises)
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status
FROM session_evolutions;

-- Teste 4-9: Órfãos e positions
SELECT 
  'Teste 4: Órfãos em protocol_exercises' as teste,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM protocol_exercises pe
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id);

SELECT 
  'Teste 5: Órfãos em prescription_exercises' as teste,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM prescription_exercises pe
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id);

SELECT 
  'Teste 6: Órfãos em evolution_prescribed_exercises' as teste,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM evolution_prescribed_exercises epe
WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id);

SELECT 
  'Teste 7: Positions inválidas protocol_exercises' as teste,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM protocol_exercises
WHERE position < 0;

SELECT 
  'Teste 8: Positions inválidas prescription_exercises' as teste,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM prescription_exercises
WHERE position < 0;

SELECT 
  'Teste 9: Positions inválidas evolution_prescribed_exercises' as teste,
  COUNT(*) as count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM evolution_prescribed_exercises
WHERE position < 0;

-- ============================================================================
-- DIAGNÓSTICO AVANÇADO: POR QUE OS DADOS NÃO MIGRARAM?
-- ============================================================================

SELECT '=== DIAGNÓSTICO AVANÇADO ===' as secao;

-- Verificar se há exercise_ids NULL ou inválidos no JSONB
SELECT 
  'Exercise IDs NULL ou inválidos no JSONB' as problema,
  COUNT(*) as quantidade
FROM (
  SELECT ex.value->>'exercise_id' as ex_id
  FROM exercise_protocols ep,
       jsonb_array_elements(ep.exercises) as ex(value)
  WHERE ep.exercises IS NOT NULL 
    AND jsonb_array_length(ep.exercises) > 0
) sub
WHERE ex_id IS NULL 
   OR ex_id = '' 
   OR ex_id = 'null';

-- Listar os primeiros exercise_ids órfãos encontrados
SELECT 
  'Exercise IDs órfãos (primeiros 10)' as problema,
  (ex.value->>'exercise_id')::text as exercise_id_orfao,
  COUNT(*) as ocorrencias
FROM exercise_protocols ep,
     jsonb_array_elements(ep.exercises) as ex(value)
WHERE ep.exercises IS NOT NULL 
  AND jsonb_array_length(ep.exercises) > 0
  AND (ex.value->>'exercise_id') IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM exercises e 
    WHERE e.id::text = (ex.value->>'exercise_id')::text
  )
GROUP BY (ex.value->>'exercise_id')::text
LIMIT 10;

-- Verificar se todas as tables necessárias existem
SELECT 
  'Tabelas existentes' as info,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('exercises', 'exercise_protocols', 'patient_exercise_prescriptions', 'session_evolutions', 'protocol_exercises', 'prescription_exercises', 'evolution_prescribed_exercises')
ORDER BY tablename;

-- ============================================================================
-- RECOMENDAÇÃO FINAL
-- ============================================================================

SELECT '=== RECOMENDAÇÃO ===' as secao;

DO $$
DECLARE
  protocols_diff INTEGER;
  prescriptions_diff INTEGER;
  evolutions_diff INTEGER;
  total_orphans INTEGER;
BEGIN
  -- Calcular diferenças
  SELECT 
    COALESCE(SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END), 0) - COALESCE((SELECT COUNT(*) FROM protocol_exercises), 0)
  INTO protocols_diff
  FROM exercise_protocols;
  
  SELECT 
    COALESCE(SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END), 0) - COALESCE((SELECT COUNT(*) FROM prescription_exercises), 0)
  INTO prescriptions_diff
  FROM patient_exercise_prescriptions;
  
  SELECT 
    COALESCE(SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END), 0) - COALESCE((SELECT COUNT(*) FROM evolution_prescribed_exercises), 0)
  INTO evolutions_diff
  FROM session_evolutions;

  -- Contar órfãos totais
  SELECT 
    (SELECT COUNT(*) FROM protocol_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) +
    (SELECT COUNT(*) FROM prescription_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) +
    (SELECT COUNT(*) FROM evolution_prescribed_exercises epe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id))
  INTO total_orphans;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'DIAGNÓSTICO FINAL';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Diferenças nas contagens:';
  RAISE NOTICE '  - Protocols: % registros não migrados', protocols_diff;
  RAISE NOTICE '  - Prescriptions: % registros não migrados', prescriptions_diff;
  RAISE NOTICE '  - Evolutions: % registros não migrados', evolutions_diff;
  RAISE NOTICE '';
  RAISE NOTICE 'Exercise IDs órfãos nas junction tables: %', total_orphans;
  RAISE NOTICE '';
  
  IF protocols_diff = 0 AND prescriptions_diff = 0 AND evolutions_diff = 0 AND total_orphans = 0 THEN
    RAISE NOTICE '✅ RECOMENDAÇÃO: Tudo está correto! Investigar por que validation falhou.';
  ELSIF total_orphans > 0 THEN
    RAISE NOTICE '⚠️  CAUSA: Exercise IDs órfãos no JSONB (IDs que não existem na tabela exercises)';
    RAISE NOTICE '🔧 SOLUÇÃO: Limpar exercise_ids órfãos do JSONB ou criar exercícios faltantes';
  ELSIF protocols_diff > 0 OR prescriptions_diff > 0 OR evolutions_diff > 0 THEN
    RAISE NOTICE '⚠️  CAUSA: Registros não migraram (possível problema de formato ou RLS)';
    RAISE NOTICE '🔧 SOLUÇÃO: Verificar formato do JSONB e permissões RLS';
  ELSE
    RAISE NOTICE '❓ CAUSA DESCONHECIDA - Investigação manual necessária';
  END IF;
  
  RAISE NOTICE '============================================';
END $$;

