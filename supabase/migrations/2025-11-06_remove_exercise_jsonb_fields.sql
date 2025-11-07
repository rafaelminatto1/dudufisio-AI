-- =====================================================
-- MIGRATION: Remove Exercise JSONB Fields (CLEANUP)
-- Date: 2025-11-06
-- Purpose: Remove deprecated JSONB exercise fields after successful migration
-- =====================================================

-- ⚠️ WARNING: This migration is DESTRUCTIVE and IRREVERSIBLE
-- 
-- ONLY apply this migration after:
-- 1. Successfully running the backfill migration
-- 2. Validating data integrity (all tests passing)
-- 3. Testing all functionality in production for at least 48 hours
-- 4. Getting formal approval from stakeholders
-- 5. Creating a fresh backup of the database
--
-- This migration removes the JSONB fields that have been replaced by junction tables:
-- - exercise_protocols.exercises
-- - patient_exercise_prescriptions.exercises  
-- - session_evolutions.prescribed_exercises

-- =====================================================
-- PRE-REMOVAL VALIDATION
-- =====================================================

DO $$
DECLARE
  protocol_exercises_count INTEGER;
  prescription_exercises_count INTEGER;
  evolution_exercises_count INTEGER;
  jsonb_protocols_count INTEGER;
  jsonb_prescriptions_count INTEGER;
  jsonb_evolutions_count INTEGER;
BEGIN
  -- Count junction table records
  SELECT COUNT(*) INTO protocol_exercises_count FROM protocol_exercises;
  SELECT COUNT(*) INTO prescription_exercises_count FROM prescription_exercises;
  SELECT COUNT(*) INTO evolution_exercises_count FROM evolution_prescribed_exercises;
  
  -- Count JSONB records
  SELECT COUNT(*) INTO jsonb_protocols_count
  FROM exercise_protocols
  WHERE exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    AND jsonb_array_length(exercises) > 0;
    
  SELECT COUNT(*) INTO jsonb_prescriptions_count
  FROM patient_exercise_prescriptions
  WHERE exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    AND jsonb_array_length(exercises) > 0;
    
  SELECT COUNT(*) INTO jsonb_evolutions_count
  FROM session_evolutions
  WHERE prescribed_exercises IS NOT NULL 
    AND jsonb_typeof(prescribed_exercises) = 'array' 
    AND jsonb_array_length(prescribed_exercises) > 0;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'PRE-REMOVAL VALIDATION';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Junction tables populated:';
  RAISE NOTICE '  - protocol_exercises: % records', protocol_exercises_count;
  RAISE NOTICE '  - prescription_exercises: % records', prescription_exercises_count;
  RAISE NOTICE '  - evolution_prescribed_exercises: % records', evolution_exercises_count;
  RAISE NOTICE '';
  RAISE NOTICE 'JSONB fields still in use:';
  RAISE NOTICE '  - exercise_protocols.exercises: % protocols', jsonb_protocols_count;
  RAISE NOTICE '  - patient_exercise_prescriptions.exercises: % prescriptions', jsonb_prescriptions_count;
  RAISE NOTICE '  - session_evolutions.prescribed_exercises: % evolutions', jsonb_evolutions_count;
  RAISE NOTICE '==============================================';
  
  -- Safety check: Ensure junction tables have data
  IF protocol_exercises_count = 0 AND jsonb_protocols_count > 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Junction table protocol_exercises is empty but JSONB has % records. Migration not safe to proceed.', jsonb_protocols_count;
  END IF;
  
  IF prescription_exercises_count = 0 AND jsonb_prescriptions_count > 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Junction table prescription_exercises is empty but JSONB has % records. Migration not safe to proceed.', jsonb_prescriptions_count;
  END IF;
  
  IF evolution_exercises_count = 0 AND jsonb_evolutions_count > 0 THEN
    RAISE EXCEPTION 'SAFETY CHECK FAILED: Junction table evolution_prescribed_exercises is empty but JSONB has % records. Migration not safe to proceed.', jsonb_evolutions_count;
  END IF;
  
  RAISE NOTICE 'SAFETY CHECKS PASSED - Ready to remove JSONB fields';
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- OPTIONAL: Create Backup Columns (Recommended)
-- =====================================================
-- Uncomment these lines if you want to keep a backup of JSONB data
-- before dropping the columns

/*
ALTER TABLE exercise_protocols 
  RENAME COLUMN exercises TO exercises_backup_20251106;

ALTER TABLE patient_exercise_prescriptions 
  RENAME COLUMN exercises TO exercises_backup_20251106;

ALTER TABLE session_evolutions 
  RENAME COLUMN prescribed_exercises TO prescribed_exercises_backup_20251106;

RAISE NOTICE 'JSONB columns renamed to _backup_20251106 for safety';
*/

-- =====================================================
-- REMOVE JSONB COLUMNS (DESTRUCTIVE)
-- =====================================================

-- Remove exercises from exercise_protocols
ALTER TABLE exercise_protocols 
  DROP COLUMN IF EXISTS exercises;

-- Remove exercises from patient_exercise_prescriptions
ALTER TABLE patient_exercise_prescriptions 
  DROP COLUMN IF EXISTS exercises;

-- Remove prescribed_exercises from session_evolutions
ALTER TABLE session_evolutions 
  DROP COLUMN IF EXISTS prescribed_exercises;

-- =====================================================
-- POST-REMOVAL VALIDATION
-- =====================================================

DO $$
DECLARE
  protocol_column_exists BOOLEAN;
  prescription_column_exists BOOLEAN;
  evolution_column_exists BOOLEAN;
BEGIN
  -- Check if columns were successfully removed
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'exercise_protocols' 
      AND column_name = 'exercises'
  ) INTO protocol_column_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'patient_exercise_prescriptions' 
      AND column_name = 'exercises'
  ) INTO prescription_column_exists;
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'session_evolutions' 
      AND column_name = 'prescribed_exercises'
  ) INTO evolution_column_exists;

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'POST-REMOVAL VALIDATION';
  RAISE NOTICE '==============================================';
  
  IF protocol_column_exists THEN
    RAISE WARNING 'exercise_protocols.exercises column still exists!';
  ELSE
    RAISE NOTICE '✓ exercise_protocols.exercises column removed';
  END IF;
  
  IF prescription_column_exists THEN
    RAISE WARNING 'patient_exercise_prescriptions.exercises column still exists!';
  ELSE
    RAISE NOTICE '✓ patient_exercise_prescriptions.exercises column removed';
  END IF;
  
  IF evolution_column_exists THEN
    RAISE WARNING 'session_evolutions.prescribed_exercises column still exists!';
  ELSE
    RAISE NOTICE '✓ session_evolutions.prescribed_exercises column removed';
  END IF;
  
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- UPDATE COMMENTS
-- =====================================================

COMMENT ON TABLE protocol_exercises IS 
  'Junction table for exercise_protocols and exercises. Replaces JSONB exercises field (removed 2025-11-06)';

COMMENT ON TABLE prescription_exercises IS 
  'Junction table for patient_exercise_prescriptions and exercises. Replaces JSONB exercises field (removed 2025-11-06)';

COMMENT ON TABLE evolution_prescribed_exercises IS 
  'Junction table for session_evolutions and exercises. Replaces JSONB prescribed_exercises field (removed 2025-11-06)';

-- =====================================================
-- COMPLETION NOTICE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'MIGRATION COMPLETED - JSONB FIELDS REMOVED';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'The following JSONB fields have been permanently removed:';
  RAISE NOTICE '  - exercise_protocols.exercises';
  RAISE NOTICE '  - patient_exercise_prescriptions.exercises';
  RAISE NOTICE '  - session_evolutions.prescribed_exercises';
  RAISE NOTICE '';
  RAISE NOTICE 'All exercise data is now stored in normalized junction tables:';
  RAISE NOTICE '  - protocol_exercises';
  RAISE NOTICE '  - prescription_exercises';
  RAISE NOTICE '  - evolution_prescribed_exercises';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Monitor application for any errors';
  RAISE NOTICE '2. Run performance benchmarks';
  RAISE NOTICE '3. Update API documentation';
  RAISE NOTICE '4. Celebrate the migration success! 🎉';
  RAISE NOTICE '==============================================';
END $$;

-- =====================================================
-- ROLLBACK INSTRUCTIONS (For Emergency Use Only)
-- =====================================================
-- 
-- If you need to rollback this migration (should be very rare):
--
-- 1. Re-add the JSONB columns:
--    ALTER TABLE exercise_protocols ADD COLUMN exercises JSONB DEFAULT '[]'::jsonb;
--    ALTER TABLE patient_exercise_prescriptions ADD COLUMN exercises JSONB DEFAULT '[]'::jsonb;
--    ALTER TABLE session_evolutions ADD COLUMN prescribed_exercises JSONB DEFAULT '[]'::jsonb;
--
-- 2. Repopulate JSONB from junction tables (reverse backfill):
--    -- This requires custom SQL to aggregate junction table data back into JSONB
--    -- Contact dev team for rollback scripts if needed
--
-- 3. Revert application code to use JSONB fields
--
-- NOTE: Rollback should only be done in extreme emergency scenarios
--       as it's a complex and risky operation

