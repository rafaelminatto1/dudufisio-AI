-- ============================================================================
-- DIAGNÓSTICO RÁPIDO - Uma Query Para Mostrar Tudo
-- Execute esta query e compartilhe TODO o resultado
-- ============================================================================

-- PARTE 1: Contagens
WITH contagens AS (
  SELECT 
    'exercise_protocols' as tabela,
    (SELECT SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int FROM exercise_protocols) as jsonb_count,
    (SELECT COUNT(*)::int FROM protocol_exercises) as junction_count
  UNION ALL
  SELECT 
    'patient_exercise_prescriptions' as tabela,
    (SELECT SUM(CASE WHEN exercises IS NOT NULL AND jsonb_typeof(exercises) = 'array' THEN jsonb_array_length(exercises) ELSE 0 END)::int FROM patient_exercise_prescriptions) as jsonb_count,
    (SELECT COUNT(*)::int FROM prescription_exercises) as junction_count
  UNION ALL
  SELECT 
    'session_evolutions' as tabela,
    (SELECT SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_typeof(prescribed_exercises) = 'array' THEN jsonb_array_length(prescribed_exercises) ELSE 0 END)::int FROM session_evolutions) as jsonb_count,
    (SELECT COUNT(*)::int FROM evolution_prescribed_exercises) as junction_count
),
-- PARTE 2: Órfãos
orfaos AS (
  SELECT 
    'protocol_exercises' as tabela,
    (SELECT COUNT(*)::int FROM protocol_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) as orfaos_count
  UNION ALL
  SELECT 
    'prescription_exercises' as tabela,
    (SELECT COUNT(*)::int FROM prescription_exercises pe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = pe.exercise_id)) as orfaos_count
  UNION ALL
  SELECT 
    'evolution_prescribed_exercises' as tabela,
    (SELECT COUNT(*)::int FROM evolution_prescribed_exercises epe WHERE NOT EXISTS (SELECT 1 FROM exercises e WHERE e.id = epe.exercise_id)) as orfaos_count
),
-- PARTE 3: Positions inválidas
positions AS (
  SELECT 
    'protocol_exercises' as tabela,
    (SELECT COUNT(*)::int FROM protocol_exercises WHERE position < 0) as positions_invalidas
  UNION ALL
  SELECT 
    'prescription_exercises' as tabela,
    (SELECT COUNT(*)::int FROM prescription_exercises WHERE position < 0) as positions_invalidas
  UNION ALL
  SELECT 
    'evolution_prescribed_exercises' as tabela,
    (SELECT COUNT(*)::int FROM evolution_prescribed_exercises WHERE position < 0) as positions_invalidas
)
-- RESULTADO FINAL
SELECT 
  '=== DIAGNÓSTICO COMPLETO ===' as titulo,
  jsonb_build_object(
    'contagens', (SELECT jsonb_agg(row_to_json(c)) FROM contagens c),
    'orfaos', (SELECT jsonb_agg(row_to_json(o)) FROM orfaos o),
    'positions_invalidas', (SELECT jsonb_agg(row_to_json(p)) FROM positions p),
    'resumo', jsonb_build_object(
      'total_diferenca_contagem', (SELECT SUM(jsonb_count - junction_count) FROM contagens),
      'total_orfaos', (SELECT SUM(orfaos_count) FROM orfaos),
      'total_positions_invalidas', (SELECT SUM(positions_invalidas) FROM positions)
    )
  ) as diagnostico_json;

