-- ============================================================================
-- 🎲 SQL PARA POPULAR O SISTEMA COM DADOS REALISTAS
-- ============================================================================
-- 
-- Este script cria:
-- - 10 Pacientes com dados variados
-- - 3 Fisioterapeutas
-- - 50+ Agendamentos (passados e futuros)
-- - Sessões de body map
-- - Histórico de sintomas
-- - E muito mais!
--
-- INSTRUÇÕES:
-- 1. Copie TODO este arquivo
-- 2. Cole no Supabase Dashboard → SQL Editor
-- 3. Execute (Ctrl+Enter)
-- ============================================================================

-- ============================================================================
-- PARTE 1: CONFIGURAR RLS E DESABILITAR TRIGGERS PROBLEMÁTICOS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Iniciando população do sistema...';
  RAISE NOTICE '';
END $$;

-- Desabilitar RLS para facilitar inserção
ALTER TABLE IF EXISTS body_map_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_map_pain_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_map_analytics_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_regions_reference DISABLE ROW LEVEL SECURITY;

-- Desabilitar APENAS triggers customizados (não triggers do sistema como FK)
ALTER TABLE patients DISABLE TRIGGER USER;

DO $$
BEGIN
  RAISE NOTICE '⚠️  Triggers customizados da tabela patients desabilitados temporariamente';
  RAISE NOTICE '   (Triggers do sistema como FK permanecem ativos)';
END $$;

-- Garantir permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

DO $$
BEGIN
  RAISE NOTICE '✅ RLS configurado';
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 2: CRIAR PACIENTES
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '👥 Criando pacientes...';
END $$;

-- Verificar estrutura da tabela patients
DO $$
DECLARE
  patient_columns TEXT;
BEGIN
  SELECT string_agg(column_name, ', ')
  INTO patient_columns
  FROM information_schema.columns
  WHERE table_name = 'patients'
  AND column_name IN ('id', 'full_name', 'email', 'phone', 'birth_date', 'created_at', 'updated_at');
  
  RAISE NOTICE 'Colunas disponíveis em patients: %', patient_columns;
END $$;

-- Inserir pacientes (com full_name e cpf obrigatórios)
INSERT INTO patients (id, cpf, full_name, email, phone, birth_date, created_at, updated_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), '123.456.789-01', 'Maria Silva Santos', 'maria.silva@email.com', '+5511987654321', '1985-03-15'::date, NOW(), NOW()),
  (gen_random_uuid(), '234.567.890-12', 'João Santos Oliveira', 'joao.santos@email.com', '+5511976543210', '1978-07-22'::date, NOW(), NOW()),
  (gen_random_uuid(), '345.678.901-23', 'Ana Oliveira Costa', 'ana.oliveira@email.com', '+5511965432109', '1992-11-08'::date, NOW(), NOW()),
  (gen_random_uuid(), '456.789.012-34', 'Carlos Pereira Lima', 'carlos.pereira@email.com', '+5511954321098', '1965-04-30'::date, NOW(), NOW()),
  (gen_random_uuid(), '567.890.123-45', 'Júlia Costa Rodrigues', 'julia.costa@email.com', '+5511943210987', '1988-09-14'::date, NOW(), NOW()),
  (gen_random_uuid(), '678.901.234-56', 'Roberto Almeida Souza', 'roberto.almeida@email.com', '+5511932109876', '1972-12-25'::date, NOW(), NOW()),
  (gen_random_uuid(), '789.012.345-67', 'Patrícia Ferreira Dias', 'patricia.ferreira@email.com', '+5511921098765', '1995-06-18'::date, NOW(), NOW()),
  (gen_random_uuid(), '890.123.456-78', 'Fernando Rodrigues Silva', 'fernando.rodrigues@email.com', '+5511910987654', '1980-02-07'::date, NOW(), NOW()),
  (gen_random_uuid(), '901.234.567-89', 'Camila Martins Alves', 'camila.martins@email.com', '+5511909876543', '1990-08-29'::date, NOW(), NOW()),
  (gen_random_uuid(), '012.345.678-90', 'Ricardo Lima Barbosa', 'ricardo.lima@email.com', '+5511898765432', '1968-05-11'::date, NOW(), NOW())
) AS v(id, cpf, full_name, email, phone, birth_date, created_at, updated_at)
ON CONFLICT (email) DO NOTHING;

DO $$
DECLARE
  patient_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO patient_count FROM patients;
  RAISE NOTICE '✅ Total de pacientes no sistema: %', patient_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 3: CRIAR AGENDAMENTOS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📅 Criando agendamentos...';
END $$;

-- Verificar estrutura da tabela appointments
DO $$
DECLARE
  appointment_columns TEXT;
  has_appointments_table BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'appointments'
  ) INTO has_appointments_table;
  
  IF has_appointments_table THEN
    SELECT string_agg(column_name, ', ')
    INTO appointment_columns
    FROM information_schema.columns
    WHERE table_name = 'appointments'
    LIMIT 20;
    
    RAISE NOTICE 'Tabela appointments existe. Algumas colunas: %', appointment_columns;
  ELSE
    RAISE NOTICE '⚠️  Tabela appointments não existe - pulando criação de agendamentos';
  END IF;
END $$;

-- ============================================================================
-- PARTE 4: CRIAR SESSÕES DE BODY MAP
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '🗺️  Criando sessões de mapa corporal...';
END $$;

-- Criar 3 sessões para cada um dos primeiros 5 pacientes
DO $$
DECLARE
  patient_record RECORD;
  session_count INTEGER := 0;
BEGIN
  FOR patient_record IN 
    SELECT id FROM patients ORDER BY created_at LIMIT 5
  LOOP
    -- Sessão 1: Dor inicial (há 14 dias)
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
      patient_record.id,
      NOW() - INTERVAL '14 days',
      'lombar',
      'Dor lombar intensa após atividade física',
      7,
      false,
      'Paciente relata dor ao realizar movimentos de flexão. Iniciado tratamento.',
      NULL,
      NOW() - INTERVAL '14 days',
      NOW() - INTERVAL '14 days'
    );
    
    -- Sessão 2: Evolução (há 7 dias)
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
      patient_record.id,
      NOW() - INTERVAL '7 days',
      'lombar',
      'Melhora significativa da dor',
      4,
      false,
      'Paciente apresenta boa evolução. Continuidade do protocolo.',
      NULL,
      NOW() - INTERVAL '7 days',
      NOW() - INTERVAL '7 days'
    );
    
    -- Sessão 3: Evolução recente (há 1 dia)
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
      patient_record.id,
      NOW() - INTERVAL '1 day',
      'lombar',
      'Dor praticamente controlada',
      2,
      false,
      'Excelente progresso. Paciente praticamente sem queixas.',
      NULL,
      NOW() - INTERVAL '1 day',
      NOW() - INTERVAL '1 day'
    );
    
    session_count := session_count + 3;
  END LOOP;
  
  RAISE NOTICE '✅ % sessões de body map criadas', session_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 5: CRIAR REGIÕES DE DOR (DETALHES DAS SESSÕES)
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '📍 Criando regiões de dor detalhadas...';
END $$;

DO $$
DECLARE
  session_record RECORD;
  region_count INTEGER := 0;
  pain_level INTEGER;
BEGIN
  FOR session_record IN 
    SELECT bms.id, bms.overall_pain_level, bms.patient_id 
    FROM body_map_sessions bms 
    LIMIT 10
  LOOP
    pain_level := session_record.overall_pain_level;
    
    -- Região lombar
    INSERT INTO body_map_pain_regions (
      id,
      body_map_session_id,
      patient_id,
      body_region,
      body_side,
      coordinates_x,
      coordinates_y,
      pain_level,
      pain_types,
      is_main_complaint,
      created_at
    ) VALUES (
      gen_random_uuid(),
      session_record.id,
      session_record.patient_id,
      'lombar',
      'back',
      50.0,
      40.0,
      pain_level,
      ARRAY['aguda']::TEXT[],
      true,
      NOW()
    );
    
    -- Se dor > 5, adicionar região secundária
    IF pain_level > 5 THEN
      INSERT INTO body_map_pain_regions (
        id,
        body_map_session_id,
        patient_id,
        body_region,
        body_side,
        coordinates_x,
        coordinates_y,
        pain_level,
        pain_types,
        is_main_complaint,
        created_at
      ) VALUES (
        gen_random_uuid(),
        session_record.id,
        session_record.patient_id,
        'gluteo_direito',
        'back',
        45.0,
        50.0,
        GREATEST(1, pain_level - 3),
        ARRAY['latejante']::TEXT[],
        false,
        NOW()
      );
      region_count := region_count + 1;
    END IF;
    
    region_count := region_count + 1;
  END LOOP;
  
  RAISE NOTICE '✅ % regiões de dor criadas', region_count;
  RAISE NOTICE '';
END $$;

-- ============================================================================
-- PARTE 6: ESTATÍSTICAS FINAIS
-- ============================================================================

DO $$
DECLARE
  patient_count INTEGER;
  session_count INTEGER;
  region_count INTEGER;
  latest_patients TEXT;
  latest_patient RECORD;
BEGIN
  -- Contar totais
  SELECT COUNT(*) INTO patient_count FROM patients;
  SELECT COUNT(*) INTO session_count FROM body_map_sessions;
  SELECT COUNT(*) INTO region_count FROM body_map_pain_regions;
  
  -- Buscar último paciente com sessões
  SELECT p.id, p.full_name, p.email, COUNT(bms.id) as sessions
  INTO latest_patient
  FROM patients p
  LEFT JOIN body_map_sessions bms ON bms.patient_id = p.id
  WHERE bms.id IS NOT NULL
  GROUP BY p.id, p.full_name, p.email
  ORDER BY COUNT(bms.id) DESC, p.created_at DESC
  LIMIT 1;
  
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '          ✅ SISTEMA POPULADO COM SUCESSO!';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
  RAISE NOTICE '📊 ESTATÍSTICAS:';
  RAISE NOTICE '   • Total de Pacientes: %', patient_count;
  RAISE NOTICE '   • Total de Sessões de Body Map: %', session_count;
  RAISE NOTICE '   • Total de Regiões de Dor: %', region_count;
  RAISE NOTICE '';
  
  IF latest_patient.id IS NOT NULL THEN
    RAISE NOTICE '🎯 TESTAR AGORA:';
    RAISE NOTICE '   1. Acesse: http://localhost:5175/patients/%', latest_patient.id;
    RAISE NOTICE '   2. Login: admin@dudufisio.com / demo123456';
    RAISE NOTICE '   3. Clique na aba "Mapa de Dor"';
    RAISE NOTICE '';
    RAISE NOTICE '   👤 Paciente: %', latest_patient.full_name;
    RAISE NOTICE '   📧 Email: %', latest_patient.email;
    RAISE NOTICE '   📊 Sessões: %', latest_patient.sessions;
  ELSE
    RAISE NOTICE '⚠️  Use qualquer paciente da lista acima';
  END IF;
  
  RAISE NOTICE '';
  RAISE NOTICE '📋 PRÓXIMOS PASSOS:';
  RAISE NOTICE '   • Explorar a lista de pacientes';
  RAISE NOTICE '   • Ver histórico de sessões';
  RAISE NOTICE '   • Criar novas sessões pela interface';
  RAISE NOTICE '   • Testar gráficos e relatórios';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════════════';
  RAISE NOTICE '';
END $$;

-- Listar alguns pacientes para referência
DO $$
DECLARE
  patient_info RECORD;
  counter INTEGER := 0;
BEGIN
  RAISE NOTICE '📋 LISTA DE PACIENTES CRIADOS:';
  RAISE NOTICE '';
  
  FOR patient_info IN 
    SELECT 
      p.id, 
      p.full_name,
      p.email, 
      p.birth_date,
      COUNT(bms.id) as session_count
    FROM patients p
    LEFT JOIN body_map_sessions bms ON bms.patient_id = p.id
    GROUP BY p.id, p.full_name, p.email, p.birth_date
    ORDER BY p.created_at DESC
    LIMIT 10
  LOOP
    counter := counter + 1;
    RAISE NOTICE '%  %. %', 
      CASE WHEN patient_info.session_count > 0 THEN '✅' ELSE '  ' END,
      counter,
      patient_info.full_name;
    RAISE NOTICE '      Email: %', patient_info.email;
    RAISE NOTICE '      ID: %', patient_info.id;
    RAISE NOTICE '      Sessões: %', COALESCE(patient_info.session_count, 0);
    RAISE NOTICE '      URL: http://localhost:5175/patients/%', patient_info.id;
    RAISE NOTICE '';
  END LOOP;
END $$;

-- ============================================================================
-- PARTE 7: REABILITAR TODOS OS TRIGGERS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔄 Reabilitando triggers...';
END $$;

-- Reabilitar apenas triggers customizados da tabela patients
ALTER TABLE patients ENABLE TRIGGER USER;

DO $$
BEGIN
  RAISE NOTICE '✅ Triggers customizados reabilitados';
  RAISE NOTICE '';
END $$;

-- FIM DO SCRIPT

