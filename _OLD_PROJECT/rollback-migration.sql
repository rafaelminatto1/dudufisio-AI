-- ============================================================================
-- ROLLBACK SCRIPT - Migração JSONB → Junction Tables
-- Date: 2025-11-06
-- Purpose: Reverter migração em caso de falha
-- ============================================================================

-- ⚠️ IMPORTANTE: Execute este script APENAS se decidir fazer rollback
-- Os dados JSONB originais NÃO foram removidos, então este rollback é seguro

-- ============================================================================
-- PRE-ROLLBACK: Verificar Estado Atual
-- ============================================================================

DO $$
DECLARE
  protocol_exercises_count INTEGER;
  prescription_exercises_count INTEGER;
  evolution_exercises_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO protocol_exercises_count FROM protocol_exercises;
  SELECT COUNT(*) INTO prescription_exercises_count FROM prescription_exercises;
  SELECT COUNT(*) INTO evolution_exercises_count FROM evolution_prescribed_exercises;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'ESTADO ATUAL ANTES DO ROLLBACK';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'protocol_exercises: % registros', protocol_exercises_count;
  RAISE NOTICE 'prescription_exercises: % registros', prescription_exercises_count;
  RAISE NOTICE 'evolution_prescribed_exercises: % registros', evolution_exercises_count;
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- ROLLBACK: Limpar Junction Tables
-- ============================================================================

-- Iniciar transação
BEGIN;

RAISE NOTICE 'Iniciando rollback...';

-- Truncar as junction tables (remove todos os registros)
TRUNCATE TABLE protocol_exercises CASCADE;
TRUNCATE TABLE prescription_exercises CASCADE;
TRUNCATE TABLE evolution_prescribed_exercises CASCADE;

RAISE NOTICE 'Junction tables limpas.';

-- ============================================================================
-- POST-ROLLBACK: Verificar Que Tabelas Estão Vazias
-- ============================================================================

DO $$
DECLARE
  protocol_exercises_count INTEGER;
  prescription_exercises_count INTEGER;
  evolution_exercises_count INTEGER;
  jsonb_protocols INTEGER;
  jsonb_prescriptions INTEGER;
  jsonb_evolutions INTEGER;
BEGIN
  -- Contar registros nas junction tables (devem estar vazias)
  SELECT COUNT(*) INTO protocol_exercises_count FROM protocol_exercises;
  SELECT COUNT(*) INTO prescription_exercises_count FROM prescription_exercises;
  SELECT COUNT(*) INTO evolution_exercises_count FROM evolution_prescribed_exercises;

  -- Contar registros nos campos JSONB (devem estar intactos)
  SELECT COUNT(*) INTO jsonb_protocols
  FROM exercise_protocols
  WHERE exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    AND jsonb_array_length(exercises) > 0;
    
  SELECT COUNT(*) INTO jsonb_prescriptions
  FROM patient_exercise_prescriptions
  WHERE exercises IS NOT NULL 
    AND jsonb_typeof(exercises) = 'array' 
    AND jsonb_array_length(exercises) > 0;
    
  SELECT COUNT(*) INTO jsonb_evolutions
  FROM session_evolutions
  WHERE prescribed_exercises IS NOT NULL 
    AND jsonb_typeof(prescribed_exercises) = 'array' 
    AND jsonb_array_length(prescribed_exercises) > 0;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'ESTADO APÓS ROLLBACK';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Junction tables (devem estar vazias):';
  RAISE NOTICE '  - protocol_exercises: %', protocol_exercises_count;
  RAISE NOTICE '  - prescription_exercises: %', prescription_exercises_count;
  RAISE NOTICE '  - evolution_prescribed_exercises: %', evolution_exercises_count;
  RAISE NOTICE '';
  RAISE NOTICE 'Dados JSONB (devem estar intactos):';
  RAISE NOTICE '  - exercise_protocols com exercises: %', jsonb_protocols;
  RAISE NOTICE '  - prescriptions com exercises: %', jsonb_prescriptions;
  RAISE NOTICE '  - evolutions com prescribed_exercises: %', jsonb_evolutions;
  RAISE NOTICE '============================================';

  -- Validar que rollback foi bem-sucedido
  IF protocol_exercises_count = 0 AND 
     prescription_exercises_count = 0 AND 
     evolution_exercises_count = 0 THEN
    RAISE NOTICE '✅ ROLLBACK BEM-SUCEDIDO - Junction tables vazias';
  ELSE
    RAISE WARNING '⚠️  ALERTA - Junction tables não estão completamente vazias!';
  END IF;

  IF jsonb_protocols > 0 OR jsonb_prescriptions > 0 OR jsonb_evolutions > 0 THEN
    RAISE NOTICE '✅ DADOS JSONB INTACTOS - Nenhum dado foi perdido';
  ELSE
    RAISE NOTICE 'ℹ️  Não há dados JSONB no banco (normal se banco estiver vazio)';
  END IF;
END $$;

-- ============================================================================
-- DECISÃO: COMMIT ou ROLLBACK
-- ============================================================================

-- Se tudo estiver OK, descomente a linha abaixo:
COMMIT;

-- Se algo estiver errado, descomente a linha abaixo:
-- ROLLBACK;

-- ============================================================================
-- FINALIZAÇÃO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'ROLLBACK CONCLUÍDO';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '1. Reverter código TypeScript (se já foi deployado)';
  RAISE NOTICE '2. Analisar causa da falha';
  RAISE NOTICE '3. Corrigir migration de backfill';
  RAISE NOTICE '4. Re-aplicar migrations quando pronto';
  RAISE NOTICE '============================================';
END $$;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

-- 1. Os dados JSONB originais NÃO foram afetados
-- 2. As junction tables ainda existem (apenas foram esvaziadas)
-- 3. Você pode re-executar a migration de backfill a qualquer momento
-- 4. Para dropar as junction tables completamente (opcional):
--    DROP TABLE protocol_exercises CASCADE;
--    DROP TABLE prescription_exercises CASCADE;
--    DROP TABLE evolution_prescribed_exercises CASCADE;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================

