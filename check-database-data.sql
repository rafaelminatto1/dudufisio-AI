-- ============================================================================
-- VERIFICAÇÃO: O banco tem dados?
-- ============================================================================

-- Query 1: Verificar se as tabelas principais têm registros
SELECT 
  'exercises' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
FROM exercises
UNION ALL
SELECT 
  'exercise_protocols' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativos
FROM exercise_protocols
UNION ALL
SELECT 
  'patient_exercise_prescriptions' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as ativos
FROM patient_exercise_prescriptions
UNION ALL
SELECT 
  'session_evolutions' as tabela,
  COUNT(*) as total_registros,
  NULL as ativos
FROM session_evolutions;

-- Query 2: Verificar se há campos JSONB populados
SELECT 
  'exercise_protocols com JSONB de exercises' as verificacao,
  COUNT(*) as total,
  COUNT(CASE WHEN exercises IS NOT NULL THEN 1 END) as nao_null,
  COUNT(CASE WHEN jsonb_typeof(exercises) = 'array' THEN 1 END) as tipo_array,
  COUNT(CASE WHEN jsonb_typeof(exercises) = 'array' AND jsonb_array_length(exercises) > 0 THEN 1 END) as array_populado
FROM exercise_protocols;

SELECT 
  'patient_exercise_prescriptions com JSONB de exercises' as verificacao,
  COUNT(*) as total,
  COUNT(CASE WHEN exercises IS NOT NULL THEN 1 END) as nao_null,
  COUNT(CASE WHEN jsonb_typeof(exercises) = 'array' THEN 1 END) as tipo_array,
  COUNT(CASE WHEN jsonb_typeof(exercises) = 'array' AND jsonb_array_length(exercises) > 0 THEN 1 END) as array_populado
FROM patient_exercise_prescriptions;

SELECT 
  'session_evolutions com JSONB de prescribed_exercises' as verificacao,
  COUNT(*) as total,
  COUNT(CASE WHEN prescribed_exercises IS NOT NULL THEN 1 END) as nao_null,
  COUNT(CASE WHEN jsonb_typeof(prescribed_exercises) = 'array' THEN 1 END) as tipo_array,
  COUNT(CASE WHEN jsonb_typeof(prescribed_exercises) = 'array' AND jsonb_array_length(prescribed_exercises) > 0 THEN 1 END) as array_populado
FROM session_evolutions;

-- Query 3: Amostra de dados (se houver)
SELECT 
  'Amostra de exercise_protocols' as info,
  id,
  name,
  exercises
FROM exercise_protocols
WHERE exercises IS NOT NULL
LIMIT 3;

SELECT 
  'Amostra de patient_exercise_prescriptions' as info,
  id,
  title,
  exercises
FROM patient_exercise_prescriptions
WHERE exercises IS NOT NULL
LIMIT 3;

SELECT 
  'Amostra de session_evolutions' as info,
  id,
  patient_id,
  prescribed_exercises
FROM session_evolutions
WHERE prescribed_exercises IS NOT NULL
LIMIT 3;

