-- ============================================================================
-- MIGRATION: Popular Sistema com Dados de Teste
-- Data: 2025-10-14
-- Descrição: Criar pacientes, sessões de body map e dados de demonstração
-- ============================================================================

-- Desabilitar RLS para facilitar inserção
ALTER TABLE IF EXISTS body_map_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_map_pain_regions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_map_analytics_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS body_regions_reference DISABLE ROW LEVEL SECURITY;

-- Desabilitar APENAS triggers customizados (não triggers do sistema como FK)
ALTER TABLE patients DISABLE TRIGGER USER;

-- Garantir permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================================================
-- CRIAR PACIENTES
-- ============================================================================

-- Inserir pacientes (com full_name obrigatório)
INSERT INTO patients (id, full_name, email, phone, birth_date, created_at, updated_at)
SELECT * FROM (VALUES
  (gen_random_uuid(), 'Maria Silva Santos', 'maria.silva@email.com', '+5511987654321', '1985-03-15'::date, NOW(), NOW()),
  (gen_random_uuid(), 'João Santos Oliveira', 'joao.santos@email.com', '+5511976543210', '1978-07-22'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Ana Oliveira Costa', 'ana.oliveira@email.com', '+5511965432109', '1992-11-08'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Carlos Pereira Lima', 'carlos.pereira@email.com', '+5511954321098', '1965-04-30'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Júlia Costa Rodrigues', 'julia.costa@email.com', '+5511943210987', '1988-09-14'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Roberto Almeida Souza', 'roberto.almeida@email.com', '+5511932109876', '1972-12-25'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Patrícia Ferreira Dias', 'patricia.ferreira@email.com', '+5511921098765', '1995-06-18'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Fernando Rodrigues Silva', 'fernando.rodrigues@email.com', '+5511910987654', '1980-02-07'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Camila Martins Alves', 'camila.martins@email.com', '+5511909876543', '1990-08-29'::date, NOW(), NOW()),
  (gen_random_uuid(), 'Ricardo Lima Barbosa', 'ricardo.lima@email.com', '+5511898765432', '1968-05-11'::date, NOW(), NOW())
) AS v(id, full_name, email, phone, birth_date, created_at, updated_at)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- CRIAR SESSÕES DE BODY MAP
-- ============================================================================

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
END $$;

-- ============================================================================
-- CRIAR REGIÕES DE DOR (DETALHES DAS SESSÕES)
-- ============================================================================

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
END $$;

-- ============================================================================
-- REABILITAR TRIGGERS
-- ============================================================================

-- Reabilitar apenas triggers customizados da tabela patients
ALTER TABLE patients ENABLE TRIGGER USER;

