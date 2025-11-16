-- =====================================================
-- VALIDATION QUERIES - JSONB to Junction Tables Migration
-- Date: 2025-11-06
-- Purpose: Validate data integrity after migration
-- =====================================================

-- =====================================================
-- 1. COMPARAÇÃO DE CONTAGENS (JSONB vs Junction Tables)
-- =====================================================

-- Protocolo: exercise_protocols
SELECT 
  'exercise_protocols' as table_name,
  COUNT(*) as total_records,
  SUM(
    CASE 
      WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
      THEN jsonb_array_length(exercises) 
      ELSE 0 
    END
  ) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM protocol_exercises) as total_junction_exercises,
  CASE 
    WHEN SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) = (SELECT COUNT(*) FROM protocol_exercises)
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM exercise_protocols;

-- Prescrições: patient_exercise_prescriptions
SELECT 
  'patient_exercise_prescriptions' as table_name,
  COUNT(*) as total_records,
  SUM(
    CASE 
      WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' 
      THEN jsonb_array_length(exercises) 
      ELSE 0 
    END
  ) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM prescription_exercises) as total_junction_exercises,
  CASE 
    WHEN SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) = (SELECT COUNT(*) FROM prescription_exercises)
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM patient_exercise_prescriptions;

-- Evoluções: session_evolutions
SELECT 
  'session_evolutions' as table_name,
  COUNT(*) as total_records,
  SUM(
    CASE 
      WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' 
      THEN jsonb_array_length(prescribed_exercises) 
      ELSE 0 
    END
  ) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as total_junction_exercises,
  CASE 
    WHEN SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) = (SELECT COUNT(*) FROM evolution_prescribed_exercises)
    THEN '✅ PASS'
    ELSE '❌ FAIL'
  END as status
FROM session_evolutions;

-- =====================================================
-- 2. VERIFICAÇÃO DE INTEGRIDADE REFERENCIAL
-- =====================================================

-- Verificar exercise_ids órfãos em protocol_exercises
SELECT 
  'protocol_exercises - Orphaned exercise_ids' as test_name,
  COUNT(*) as orphaned_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM protocol_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id
);

-- Verificar protocol_ids órfãos em protocol_exercises
SELECT 
  'protocol_exercises - Orphaned protocol_ids' as test_name,
  COUNT(*) as orphaned_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM protocol_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM exercise_protocols ep WHERE ep.id = pe.protocol_id
);

-- Verificar exercise_ids órfãos em prescription_exercises
SELECT 
  'prescription_exercises - Orphaned exercise_ids' as test_name,
  COUNT(*) as orphaned_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM prescription_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id
);

-- Verificar prescription_ids órfãos em prescription_exercises
SELECT 
  'prescription_exercises - Orphaned prescription_ids' as test_name,
  COUNT(*) as orphaned_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM prescription_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM patient_exercise_prescriptions pep WHERE pep.id = pe.prescription_id
);

-- Verificar exercise_ids órfãos em evolution_prescribed_exercises
SELECT 
  'evolution_prescribed_exercises - Orphaned exercise_ids' as test_name,
  COUNT(*) as orphaned_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM evolution_prescribed_exercises epe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id
);

-- Verificar evolution_ids órfãos em evolution_prescribed_exercises
SELECT 
  'evolution_prescribed_exercises - Orphaned evolution_ids' as test_name,
  COUNT(*) as orphaned_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM evolution_prescribed_exercises epe
WHERE NOT EXISTS (
  SELECT 1 FROM session_evolutions se WHERE se.id = epe.evolution_id
);

-- =====================================================
-- 3. VERIFICAÇÃO DE POSITIONS
-- =====================================================

-- Verificar positions inválidas em protocol_exercises
SELECT 
  'protocol_exercises - Invalid positions' as test_name,
  COUNT(*) as invalid_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM protocol_exercises
WHERE position < 0;

-- Verificar positions inválidas em prescription_exercises
SELECT 
  'prescription_exercises - Invalid positions' as test_name,
  COUNT(*) as invalid_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM prescription_exercises
WHERE position < 0;

-- Verificar positions inválidas em evolution_prescribed_exercises
SELECT 
  'evolution_prescribed_exercises - Invalid positions' as test_name,
  COUNT(*) as invalid_count,
  CASE WHEN COUNT(*) = 0 THEN '✅ PASS' ELSE '❌ FAIL' END as status
FROM evolution_prescribed_exercises
WHERE position < 0;

-- =====================================================
-- 4. VERIFICAÇÃO DE ÍNDICES
-- =====================================================

SELECT 
  'Indexes Verification' as category,
  schemaname,
  tablename,
  indexname,
  CASE WHEN indexdef IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_indexes
WHERE tablename IN ('protocol_exercises', 'prescription_exercises', 'evolution_prescribed_exercises')
ORDER BY tablename, indexname;

-- =====================================================
-- 5. VERIFICAÇÃO DE RLS POLICIES
-- =====================================================

SELECT 
  'RLS Policies Verification' as category,
  schemaname,
  tablename,
  policyname,
  CASE WHEN cmd IS NOT NULL THEN '✅ EXISTS' ELSE '❌ MISSING' END as status
FROM pg_policies
WHERE tablename IN ('protocol_exercises', 'prescription_exercises', 'evolution_prescribed_exercises')
ORDER BY tablename, policyname;

-- =====================================================
-- 6. ESTATÍSTICAS GERAIS
-- =====================================================

-- Resumo geral das junction tables
SELECT 
  'Junction Tables Summary' as category,
  (SELECT COUNT(*) FROM protocol_exercises) as protocol_exercises_count,
  (SELECT COUNT(DISTINCT protocol_id) FROM protocol_exercises) as unique_protocols,
  (SELECT COUNT(*) FROM prescription_exercises) as prescription_exercises_count,
  (SELECT COUNT(DISTINCT prescription_id) FROM prescription_exercises) as unique_prescriptions,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as evolution_exercises_count,
  (SELECT COUNT(DISTINCT evolution_id) FROM evolution_prescribed_exercises) as unique_evolutions;

-- Exercícios mais usados em protocolos
SELECT 
  'Most Used Exercises in Protocols' as category,
  e.id,
  e.name,
  COUNT(*) as usage_count
FROM protocol_exercises pe
JOIN exercises e ON e.id = pe.exercise_id
GROUP BY e.id, e.name
ORDER BY usage_count DESC
LIMIT 10;

-- Exercícios mais prescritos
SELECT 
  'Most Prescribed Exercises' as category,
  e.id,
  e.name,
  COUNT(*) as prescription_count
FROM prescription_exercises pe
JOIN exercises e ON e.id = pe.exercise_id
GROUP BY e.id, e.name
ORDER BY prescription_count DESC
LIMIT 10;

-- =====================================================
-- 7. VALIDAÇÃO FINAL - RESUMO DE STATUS
-- =====================================================

SELECT 
  '=== VALIDATION SUMMARY ===' as summary,
  NOW() as validated_at;

-- Contagem total de testes
WITH validation_results AS (
  SELECT 
    CASE 
      WHEN (SELECT SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) FROM exercise_protocols) = (SELECT COUNT(*) FROM protocol_exercises)
      THEN 1 ELSE 0 
    END +
    CASE 
      WHEN (SELECT SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) FROM patient_exercise_prescriptions) = (SELECT COUNT(*) FROM prescription_exercises)
      THEN 1 ELSE 0 
    END +
    CASE 
      WHEN (SELECT SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) FROM session_evolutions) = (SELECT COUNT(*) FROM evolution_prescribed_exercises)
      THEN 1 ELSE 0 
    END +
    CASE WHEN (SELECT COUNT(*) FROM protocol_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) = 0 THEN 1 ELSE 0 END +
    CASE WHEN (SELECT COUNT(*) FROM prescription_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) = 0 THEN 1 ELSE 0 END +
    CASE WHEN (SELECT COUNT(*) FROM evolution_prescribed_exercises epe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id)) = 0 THEN 1 ELSE 0 END +
    CASE WHEN (SELECT COUNT(*) FROM protocol_exercises WHERE position < 0) = 0 THEN 1 ELSE 0 END +
    CASE WHEN (SELECT COUNT(*) FROM prescription_exercises WHERE position < 0) = 0 THEN 1 ELSE 0 END +
    CASE WHEN (SELECT COUNT(*) FROM evolution_prescribed_exercises WHERE position < 0) = 0 THEN 1 ELSE 0 END
    as passed_tests
)
SELECT 
  passed_tests as tests_passed,
  9 as total_tests,
  ROUND((passed_tests::numeric / 9) * 100, 2) || '%' as success_rate,
  CASE 
    WHEN passed_tests = 9 THEN '✅ ALL TESTS PASSED - MIGRATION SUCCESSFUL'
    WHEN passed_tests >= 7 THEN '⚠️ MOST TESTS PASSED - REVIEW NEEDED'
    ELSE '❌ MIGRATION FAILED - ROLLBACK REQUIRED'
  END as final_status
FROM validation_results;

