-- ============================================================================
-- 🔥 SQL PARA COPIAR E COLAR NO SUPABASE DASHBOARD
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Abra: https://supabase.com/dashboard
-- 2. Selecione seu projeto: urfxniitfbbvsaskicfo
-- 3. Vá em: SQL Editor → New Query
-- 4. Cole TODO este arquivo
-- 5. Clique em "Run" (ou pressione Ctrl+Enter)
--
-- ============================================================================

-- ============================================================================
-- PARTE 1: FIX RLS POLICIES (OBRIGATÓRIO)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Iniciando configuração do Body Map System...';
  RAISE NOTICE '';
END $$;

-- Remover policies existentes se houver conflito
DROP POLICY IF EXISTS "allow_all_for_development" ON body_map_sessions;
DROP POLICY IF EXISTS "allow_all_for_development" ON body_map_pain_regions;
DROP POLICY IF EXISTS "allow_all_for_development" ON body_map_analytics_cache;
DROP POLICY IF EXISTS "allow_all_for_development" ON body_regions_reference;

-- Desabilitar RLS temporariamente para desenvolvimento
ALTER TABLE body_map_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_analytics_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE body_regions_reference DISABLE ROW LEVEL SECURITY;

-- Garantir permissões para role anon
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_sessions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_pain_regions TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_analytics_cache TO anon;
GRANT SELECT ON body_regions_reference TO anon;

-- Garantir permissões para role authenticated
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_sessions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_pain_regions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON body_map_analytics_cache TO authenticated;
GRANT SELECT ON body_regions_reference TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies configuradas';
  RAISE NOTICE '✅ Permissões concedidas para anon e authenticated';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 2: DADOS DE TESTE (OPCIONAL - PODE COMENTAR SE NÃO QUISER)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📊 Inserindo dados de teste...';
END $$;

-- ============================================================================
-- NOTA: Usando primeiro paciente existente no banco
-- ============================================================================

-- Primeiro vamos verificar se há pacientes no banco
DO $$
BEGIN
  RAISE NOTICE '🔍 Buscando pacientes no banco...';
END $$;

-- Mostrar pacientes disponíveis (para referência)
DO $$
DECLARE
  patient_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO patient_count FROM patients;
  RAISE NOTICE 'Total de pacientes encontrados: %', patient_count;
  
  IF patient_count = 0 THEN
    RAISE EXCEPTION 'ERRO: Nenhum paciente encontrado no banco! Crie um paciente primeiro pela interface.';
  END IF;
END $$;

DO $$
DECLARE
  test_patient_id UUID;
BEGIN
  -- Usar o primeiro paciente existente
  SELECT id INTO test_patient_id FROM patients ORDER BY created_at DESC LIMIT 1;
  
  IF test_patient_id IS NULL THEN
    RAISE EXCEPTION 'ERRO: Não foi possível encontrar um paciente válido!';
  END IF;
  
  RAISE NOTICE '✅ Usando paciente existente com ID: %', test_patient_id;
  
  -- Agora inserir as sessões usando o patient_id válido
  -- Sessão 1: Dor lombar inicial (há 7 dias)
  INSERT INTO body_map_sessions (
    id,
    patient_id,
    session_date,
    main_complaint_region,
    main_complaint_description,
    overall_pain_level,
    pain_free,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_patient_id,
    NOW() - INTERVAL '7 days',
    'lombar',
    'Dor lombar após exercício de levantamento de peso',
    6,
    false,
    'Paciente relata dor intensa ao realizar movimentos de flexão. Iniciado protocolo de fortalecimento da musculatura do core.',
    NULL,
    NOW() - INTERVAL '7 days',
    NOW() - INTERVAL '7 days'
  ) ON CONFLICT DO NOTHING;

  -- Sessão 2: Melhora significativa (há 2 dias)
  INSERT INTO body_map_sessions (
    id,
    patient_id,
    session_date,
    main_complaint_region,
    main_complaint_description,
    overall_pain_level,
    pain_free,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_patient_id,
    NOW() - INTERVAL '2 days',
    'lombar',
    'Melhora significativa da dor lombar',
    3,
    false,
    'Paciente apresenta evolução positiva. Dor diminuiu consideravelmente. Continuar protocolo.',
    NULL,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '2 days'
  ) ON CONFLICT DO NOTHING;

  -- Sessão 3: Sem dor (hoje)
  INSERT INTO body_map_sessions (
    id,
    patient_id,
    session_date,
    main_complaint_region,
    main_complaint_description,
    overall_pain_level,
    pain_free,
    notes,
    created_by,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    test_patient_id,
    NOW(),
    NULL,
    'Paciente relata ausência completa de dor',
    0,
    true,
    'Excelente evolução! Paciente sem queixas álgicas. Alta programada para próxima sessão.',
    NULL,
    NOW(),
    NOW()
  ) ON CONFLICT DO NOTHING;
  
  RAISE NOTICE '✅ 3 sessões inseridas para o paciente ID: %', test_patient_id;
END $$;

DO $$
BEGIN
  RAISE NOTICE '✅ Dados de teste inseridos';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 3: VERIFICAÇÃO FINAL
-- ============================================================================

DO $$
DECLARE
  session_count INTEGER;
  rls_status TEXT;
  patient_info RECORD;
BEGIN
  -- Buscar informações do paciente com sessões
  SELECT p.id, p.full_name, COUNT(bms.id) as sessions
  INTO patient_info
  FROM patients p
  LEFT JOIN body_map_sessions bms ON bms.patient_id = p.id
  WHERE bms.id IS NOT NULL
  GROUP BY p.id, p.full_name
  ORDER BY COUNT(bms.id) DESC
  LIMIT 1;
  
  -- Contar total de sessões
  SELECT COUNT(*) INTO session_count 
  FROM body_map_sessions;
  
  -- Verificar RLS
  SELECT 
    CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END 
  INTO rls_status
  FROM pg_tables 
  WHERE tablename = 'body_map_sessions';
  
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '        ✅ CONFIGURAÇÃO CONCLUÍDA!';
  RAISE NOTICE '═══════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Estatísticas:';
  RAISE NOTICE '   - Total de sessões: %', session_count;
  RAISE NOTICE '   - RLS Status: %', rls_status;
  IF patient_info.id IS NOT NULL THEN
    RAISE NOTICE '   - Paciente com sessões: % (ID: %)', patient_info.full_name, patient_info.id;
    RAISE NOTICE '   - Número de sessões: %', patient_info.sessions;
  END IF;
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Próximos passos:';
  RAISE NOTICE '   1. Reinicie o servidor: npm run dev';
  IF patient_info.id IS NOT NULL THEN
    RAISE NOTICE '   2. Acesse: http://localhost:5175/patients/%', patient_info.id;
  ELSE
    RAISE NOTICE '   2. Acesse: http://localhost:5175/patients/[ID_DO_PACIENTE]';
  END IF;
  RAISE NOTICE '   3. Faça login: admin@dudufisio.com / demo123456';
  RAISE NOTICE '   4. Clique na aba "Mapa de Dor"';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️  IMPORTANTE:';
  RAISE NOTICE '   - RLS está DESABILITADO (apenas para desenvolvimento)';
  RAISE NOTICE '   - Habilitar RLS antes de ir para produção!';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════';
END $$;

-- FIM DO SCRIPT

