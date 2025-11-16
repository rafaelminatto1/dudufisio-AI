-- ============================================================================
-- DIAGNÓSTICO SIMPLIFICADO - Execute seção por seção
-- ============================================================================

-- ============================================================================
-- SEÇÃO 1: CONTAGENS BÁSICAS
-- ============================================================================

-- Query 1A: Protocols
SELECT 
  'exercise_protocols' as tabela,
  COUNT(*) as total_registros,
  SUM(CASE 
    WHEN exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    THEN jsonb_array_length(exercises) 
    ELSE 0 
  END)::int as total_exercises_jsonb,
  (SELECT COUNT(*) FROM protocol_exercises) as total_junction,
  (SUM(CASE 
    WHEN exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    THEN jsonb_array_length(exercises) 
    ELSE 0 
  END)::int - (SELECT COUNT(*) FROM protocol_exercises)) as diferenca
FROM exercise_protocols;

-- Query 1B: Prescriptions
SELECT 
  'patient_exercise_prescriptions' as tabela,
  COUNT(*) as total_registros,
  SUM(CASE 
    WHEN exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    THEN jsonb_array_length(exercises) 
    ELSE 0 
  END)::int as total_exercises_jsonb,
  (SELECT COUNT(*) FROM prescription_exercises) as total_junction,
  (SUM(CASE 
    WHEN exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    THEN jsonb_array_length(exercises) 
    ELSE 0 
  END)::int - (SELECT COUNT(*) FROM prescription_exercises)) as diferenca
FROM patient_exercise_prescriptions;

-- Query 1C: Evolutions
SELECT 
  'session_evolutions' as tabela,
  COUNT(*) as total_registros,
  SUM(CASE 
    WHEN prescribed_exercises IS NOT NULL 
    AND jsonb_typeof(prescribed_exercises) = 'array' 
    THEN jsonb_array_length(prescribed_exercises) 
    ELSE 0 
  END)::int as total_exercises_jsonb,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as total_junction,
  (SUM(CASE 
    WHEN prescribed_exercises IS NOT NULL 
    AND jsonb_typeof(prescribed_exercises) = 'array' 
    THEN jsonb_array_length(prescribed_exercises) 
    ELSE 0 
  END)::int - (SELECT COUNT(*) FROM evolution_prescribed_exercises)) as diferenca
FROM session_evolutions;

-- ============================================================================
-- SEÇÃO 2: ÓRFÃOS EM JUNCTION TABLES
-- ============================================================================

-- Query 2A: Órfãos em protocol_exercises
SELECT 
  'protocol_exercises' as tabela,
  COUNT(*) as exercise_ids_orfaos
FROM protocol_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id
);

-- Query 2B: Órfãos em prescription_exercises
SELECT 
  'prescription_exercises' as tabela,
  COUNT(*) as exercise_ids_orfaos
FROM prescription_exercises pe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id
);

-- Query 2C: Órfãos em evolution_prescribed_exercises
SELECT 
  'evolution_prescribed_exercises' as tabela,
  COUNT(*) as exercise_ids_orfaos
FROM evolution_prescribed_exercises epe
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id
);

-- ============================================================================
-- SEÇÃO 3: POSITIONS INVÁLIDAS
-- ============================================================================

-- Query 3A: Positions < 0 em protocol_exercises
SELECT 
  'protocol_exercises' as tabela,
  COUNT(*) as positions_invalidas
FROM protocol_exercises
WHERE position < 0;

-- Query 3B: Positions < 0 em prescription_exercises
SELECT 
  'prescription_exercises' as tabela,
  COUNT(*) as positions_invalidas
FROM prescription_exercises
WHERE position < 0;

-- Query 3C: Positions < 0 em evolution_prescribed_exercises
SELECT 
  'evolution_prescribed_exercises' as tabela,
  COUNT(*) as positions_invalidas
FROM evolution_prescribed_exercises
WHERE position < 0;

-- ============================================================================
-- SEÇÃO 4: RESUMO DOS 9 TESTES
-- ============================================================================

-- Teste 1
SELECT 
  '1' as teste_numero,
  'Contagem protocols' as teste_nome,
  CASE 
    WHEN (SELECT SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) FROM exercise_protocols) = (SELECT COUNT(*) FROM protocol_exercises)
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 2
SELECT 
  '2' as teste_numero,
  'Contagem prescriptions' as teste_nome,
  CASE 
    WHEN (SELECT SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END) FROM patient_exercise_prescriptions) = (SELECT COUNT(*) FROM prescription_exercises)
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 3
SELECT 
  '3' as teste_numero,
  'Contagem evolutions' as teste_nome,
  CASE 
    WHEN (SELECT SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) FROM session_evolutions) = (SELECT COUNT(*) FROM evolution_prescribed_exercises)
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 4
SELECT 
  '4' as teste_numero,
  'Órfãos protocol_exercises' as teste_nome,
  CASE 
    WHEN (SELECT COUNT(*) FROM protocol_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) = 0
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 5
SELECT 
  '5' as teste_numero,
  'Órfãos prescription_exercises' as teste_nome,
  CASE 
    WHEN (SELECT COUNT(*) FROM prescription_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) = 0
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 6
SELECT 
  '6' as teste_numero,
  'Órfãos evolution_prescribed_exercises' as teste_nome,
  CASE 
    WHEN (SELECT COUNT(*) FROM evolution_prescribed_exercises epe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id)) = 0
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 7
SELECT 
  '7' as teste_numero,
  'Positions protocol_exercises' as teste_nome,
  CASE 
    WHEN (SELECT COUNT(*) FROM protocol_exercises WHERE position < 0) = 0
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 8
SELECT 
  '8' as teste_numero,
  'Positions prescription_exercises' as teste_nome,
  CASE 
    WHEN (SELECT COUNT(*) FROM prescription_exercises WHERE position < 0) = 0
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

-- Teste 9
SELECT 
  '9' as teste_numero,
  'Positions evolution_prescribed_exercises' as teste_nome,
  CASE 
    WHEN (SELECT COUNT(*) FROM evolution_prescribed_exercises WHERE position < 0) = 0
    THEN '✅ PASS' 
    ELSE '❌ FAIL' 
  END as status;

