-- =====================================================
-- MIGRATION: Backfill Exercise Junction Tables
-- Date: 2025-11-06
-- Purpose: Migrate JSONB exercise data to normalized junction tables
-- =====================================================

-- This migration moves exercise data from JSONB fields to proper junction tables:
-- 1. exercise_protocols.exercises → protocol_exercises
-- 2. patient_exercise_prescriptions.exercises → prescription_exercises
-- 3. session_evolutions.prescribed_exercises → evolution_prescribed_exercises

-- =====================================================
-- PRE-MIGRATION VALIDATION
-- =====================================================

DO $$
DECLARE
  protocols_with_exercises INTEGER;
  prescriptions_with_exercises INTEGER;
  evolutions_with_exercises INTEGER;
BEGIN
  -- Count records with JSONB exercise data
  SELECT COUNT(*) INTO protocols_with_exercises
  FROM exercise_protocols
  WHERE exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    AND jsonb_array_length(exercises) > 0;

  SELECT COUNT(*) INTO prescriptions_with_exercises
  FROM patient_exercise_prescriptions
  WHERE exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    AND jsonb_array_length(exercises) > 0;

  SELECT COUNT(*) INTO evolutions_with_exercises
  FROM session_evolutions
  WHERE prescribed_exercises IS NOT NULL 
    AND jsonb_typeof(prescribed_exercises) = 'array' 
    AND jsonb_array_length(prescribed_exercises) > 0;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PRE-MIGRATION COUNT';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Protocols with exercises: %', protocols_with_exercises;
  RAISE NOTICE 'Prescriptions with exercises: %', prescriptions_with_exercises;
  RAISE NOTICE 'Evolutions with prescribed exercises: %', evolutions_with_exercises;
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- 1. MIGRATE PROTOCOL_EXERCISES
-- =====================================================

-- Migrate exercise_protocols.exercises → protocol_exercises
INSERT INTO protocol_exercises (
  protocol_id,
  exercise_id,
  position,
  sets,
  reps,
  hold_time_seconds,
  rest_time_seconds,
  frequency_per_week,
  intensity,
  notes,
  created_at
)
SELECT 
  ep.id AS protocol_id,
  (ex.value->>'exercise_id')::uuid AS exercise_id,
  COALESCE((ex.value->>'order')::int, ex.ordinality) AS position,
  (ex.value->>'sets')::int AS sets,
  (ex.value->>'repetitions')::int AS reps,
  (ex.value->>'duration_seconds')::int AS hold_time_seconds,
  (ex.value->>'rest_seconds')::int AS rest_time_seconds,
  (ex.value->>'frequency_per_week')::int AS frequency_per_week,
  ex.value->>'intensity' AS intensity,
  ex.value->>'notes' AS notes,
  COALESCE(ep.created_at, NOW()) AS created_at
FROM exercise_protocols ep
CROSS JOIN LATERAL jsonb_array_elements(ep.exercises) WITH ORDINALITY AS ex(value, ordinality)
WHERE ep.exercises IS NOT NULL 
  AND jsonb_typeof(ep.exercises) = 'array' 
  AND jsonb_array_length(ep.exercises) > 0
  -- Only migrate if exercise_id exists in exercises table
  AND EXISTS (
    SELECT 1 FROM exercises e 
    WHERE e.id = (ex.value->>'exercise_id')::uuid
  )
ON CONFLICT (protocol_id, exercise_id, position) DO NOTHING;

-- =====================================================
-- 2. MIGRATE PRESCRIPTION_EXERCISES
-- =====================================================

-- Migrate patient_exercise_prescriptions.exercises → prescription_exercises
INSERT INTO prescription_exercises (
  prescription_id,
  exercise_id,
  position,
  sets,
  reps,
  hold_time_seconds,
  rest_time_seconds,
  frequency_per_week,
  intensity,
  notes,
  created_at
)
SELECT 
  pep.id AS prescription_id,
  (ex.value->>'exercise_id')::uuid AS exercise_id,
  COALESCE((ex.value->>'order')::int, ex.ordinality) AS position,
  (ex.value->>'sets')::int AS sets,
  (ex.value->>'repetitions')::int AS reps,
  (ex.value->>'duration_seconds')::int AS hold_time_seconds,
  (ex.value->>'rest_seconds')::int AS rest_time_seconds,
  (ex.value->>'frequency_per_week')::int AS frequency_per_week,
  ex.value->>'intensity' AS intensity,
  ex.value->>'notes' AS notes,
  COALESCE(pep.created_at, NOW()) AS created_at
FROM patient_exercise_prescriptions pep
CROSS JOIN LATERAL jsonb_array_elements(pep.exercises) WITH ORDINALITY AS ex(value, ordinality)
WHERE pep.exercises IS NOT NULL 
  AND jsonb_typeof(pep.exercises) = 'array' 
  AND jsonb_array_length(pep.exercises) > 0
  AND EXISTS (
    SELECT 1 FROM exercises e 
    WHERE e.id = (ex.value->>'exercise_id')::uuid
  )
ON CONFLICT (prescription_id, exercise_id, position) DO NOTHING;

-- =====================================================
-- 3. MIGRATE EVOLUTION_PRESCRIBED_EXERCISES
-- =====================================================

-- Migrate session_evolutions.prescribed_exercises → evolution_prescribed_exercises
INSERT INTO evolution_prescribed_exercises (
  evolution_id,
  exercise_id,
  position,
  sets,
  reps,
  hold_time_seconds,
  rest_time_seconds,
  intensity,
  performed,
  pain_score,
  notes,
  created_at
)
SELECT 
  se.id AS evolution_id,
  (ex.value->>'exercise_id')::uuid AS exercise_id,
  COALESCE((ex.value->>'order')::int, ex.ordinality) AS position,
  (ex.value->>'sets')::int AS sets,
  (ex.value->>'repetitions')::int AS reps,
  (ex.value->>'duration_seconds')::int AS hold_time_seconds,
  (ex.value->>'rest_seconds')::int AS rest_time_seconds,
  ex.value->>'intensity' AS intensity,
  COALESCE((ex.value->>'performed')::boolean, false) AS performed,
  (ex.value->>'pain_score')::int AS pain_score,
  ex.value->>'notes' AS notes,
  COALESCE(se.created_at, NOW()) AS created_at
FROM session_evolutions se
CROSS JOIN LATERAL jsonb_array_elements(se.prescribed_exercises) WITH ORDINALITY AS ex(value, ordinality)
WHERE se.prescribed_exercises IS NOT NULL 
  AND jsonb_typeof(se.prescribed_exercises) = 'array' 
  AND jsonb_array_length(se.prescribed_exercises) > 0
  AND EXISTS (
    SELECT 1 FROM exercises e 
    WHERE e.id = (ex.value->>'exercise_id')::uuid
  )
ON CONFLICT (evolution_id, exercise_id, position) DO NOTHING;

-- =====================================================
-- POST-MIGRATION VALIDATION
-- =====================================================

DO $$
DECLARE
  protocol_exercises_count INTEGER;
  prescription_exercises_count INTEGER;
  evolution_exercises_count INTEGER;
  protocols_migrated INTEGER;
  prescriptions_migrated INTEGER;
  evolutions_migrated INTEGER;
BEGIN
  -- Count migrated records
  SELECT COUNT(*) INTO protocol_exercises_count FROM protocol_exercises;
  SELECT COUNT(*) INTO prescription_exercises_count FROM prescription_exercises;
  SELECT COUNT(*) INTO evolution_exercises_count FROM evolution_prescribed_exercises;

  -- Count source records (for comparison)
  SELECT COUNT(DISTINCT protocol_id) INTO protocols_migrated FROM protocol_exercises;
  SELECT COUNT(DISTINCT prescription_id) INTO prescriptions_migrated FROM prescription_exercises;
  SELECT COUNT(DISTINCT evolution_id) INTO evolutions_migrated FROM evolution_prescribed_exercises;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'POST-MIGRATION COUNT';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Protocol exercises migrated: % rows from % protocols', protocol_exercises_count, protocols_migrated;
  RAISE NOTICE 'Prescription exercises migrated: % rows from % prescriptions', prescription_exercises_count, prescriptions_migrated;
  RAISE NOTICE 'Evolution exercises migrated: % rows from % evolutions', evolution_exercises_count, evolutions_migrated;
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- VALIDATION QUERIES (for manual verification)
-- =====================================================

-- Query 1: Compare JSONB count vs junction table count for protocols
-- (Run manually to verify data integrity)
/*
SELECT 
  'exercise_protocols' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_array_length(exercises) > 0 THEN jsonb_array_length(exercises) ELSE 0 END) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM protocol_exercises) as total_junction_exercises
FROM exercise_protocols;
*/

-- Query 2: Compare JSONB count vs junction table count for prescriptions
/*
SELECT 
  'patient_exercise_prescriptions' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN exercises IS NOT NULL AND jsonb_array_length(exercises) > 0 THEN jsonb_array_length(exercises) ELSE 0 END) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM prescription_exercises) as total_junction_exercises
FROM patient_exercise_prescriptions;
*/

-- Query 3: Compare JSONB count vs junction table count for evolutions
/*
SELECT 
  'session_evolutions' as table_name,
  COUNT(*) as total_records,
  SUM(CASE WHEN prescribed_exercises IS NOT NULL AND jsonb_array_length(prescribed_exercises) > 0 THEN jsonb_array_length(prescribed_exercises) ELSE 0 END) as total_jsonb_exercises,
  (SELECT COUNT(*) FROM evolution_prescribed_exercises) as total_junction_exercises
FROM session_evolutions;
*/

-- Query 4: Find any orphaned exercise_ids (referenced but don't exist)
/*
SELECT 
  'Orphaned exercise_ids in JSONB' as issue,
  DISTINCT (ex.value->>'exercise_id')::uuid as orphaned_exercise_id
FROM (
  SELECT exercises FROM exercise_protocols WHERE exercises IS NOT NULL
  UNION ALL
  SELECT exercises FROM patient_exercise_prescriptions WHERE exercises IS NOT NULL
  UNION ALL  
  SELECT prescribed_exercises FROM session_evolutions WHERE prescribed_exercises IS NOT NULL
) as sources
CROSS JOIN LATERAL jsonb_array_elements(sources.exercises) as ex(value)
WHERE NOT EXISTS (
  SELECT 1 FROM exercises e WHERE e.id = (ex.value->>'exercise_id')::uuid
);
*/

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE protocol_exercises IS 'Junction table for exercise_protocols and exercises (migrated from JSONB)';
COMMENT ON TABLE prescription_exercises IS 'Junction table for patient_exercise_prescriptions and exercises (migrated from JSONB)';
COMMENT ON TABLE evolution_prescribed_exercises IS 'Junction table for session_evolutions and exercises (migrated from JSONB)';

-- =====================================================
-- COMPLETION NOTICE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION COMPLETED SUCCESSFULLY';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Verify data integrity using validation queries';
  RAISE NOTICE '2. Update TypeScript code to use junction tables';
  RAISE NOTICE '3. Test all functionality thoroughly';
  RAISE NOTICE '4. Only after complete validation, run migration to drop JSONB fields';
  RAISE NOTICE '==============================================';
END $$;

