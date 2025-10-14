-- ============================================================================
-- SISTEMA DE MAPA CORPORAL DE DOR
-- Migration criada em: 2025-10-13
-- Descrição: Sistema completo para registro e acompanhamento de dor dos pacientes
--            com suporte a múltiplos pontos, patologia principal e histórico
-- ============================================================================

-- ============================================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- ============================================================================

-- Garantir que uuid-ossp está habilitado
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 2. ATUALIZAR TABELA PATIENTS - ADICIONAR PATOLOGIA PRINCIPAL
-- ============================================================================

-- Adicionar campos para patologia/queixa principal permanente do paciente
ALTER TABLE patients 
ADD COLUMN IF NOT EXISTS main_pathology TEXT,
ADD COLUMN IF NOT EXISTS main_pathology_region TEXT,
ADD COLUMN IF NOT EXISTS main_pathology_since DATE;

-- Comentários explicativos
COMMENT ON COLUMN patients.main_pathology IS 'Patologia ou queixa principal do paciente (ex: Lombalgia Crônica)';
COMMENT ON COLUMN patients.main_pathology_region IS 'Região corporal da patologia principal (ex: lombar, cervical)';
COMMENT ON COLUMN patients.main_pathology_since IS 'Data de início da patologia principal';

-- ============================================================================
-- 3. TABELA: BODY_MAP_SESSIONS
-- ============================================================================

-- Armazena cada sessão de registro do mapa corporal
CREATE TABLE IF NOT EXISTS body_map_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  -- Informações da sessão
  main_complaint_region TEXT NOT NULL,
  main_complaint_description TEXT,
  session_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  overall_pain_level INTEGER CHECK (overall_pain_level >= 0 AND overall_pain_level <= 10),
  pain_free BOOLEAN DEFAULT false,
  notes TEXT,
  
  -- Auditoria
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_patient ON body_map_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_date ON body_map_sessions(session_date DESC);
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_session ON body_map_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_body_map_sessions_appointment ON body_map_sessions(appointment_id);

-- Comentários
COMMENT ON TABLE body_map_sessions IS 'Sessões de registro do mapa corporal de dor';
COMMENT ON COLUMN body_map_sessions.pain_free IS 'Indica se o paciente veio sem dor nesta sessão';
COMMENT ON COLUMN body_map_sessions.overall_pain_level IS 'Nível geral de dor da sessão (0-10)';

-- ============================================================================
-- 4. TABELA: BODY_MAP_PAIN_REGIONS
-- ============================================================================

-- Registra cada região/ponto de dor marcado em uma sessão
CREATE TABLE IF NOT EXISTS body_map_pain_regions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  body_map_session_id UUID NOT NULL REFERENCES body_map_sessions(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Localização no corpo
  body_region TEXT NOT NULL, -- cervical, lombar, ombro_direito, joelho_esquerdo, etc
  body_side VARCHAR(10) NOT NULL CHECK (body_side IN ('front', 'back')),
  coordinates_x FLOAT NOT NULL CHECK (coordinates_x >= 0 AND coordinates_x <= 100),
  coordinates_y FLOAT NOT NULL CHECK (coordinates_y >= 0 AND coordinates_y <= 100),
  
  -- Características da dor
  pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  pain_types TEXT[] NOT NULL DEFAULT '{}', -- ['aguda', 'latejante', 'queimação', 'formigamento', 'cansaço']
  symptoms TEXT[] DEFAULT '{}',
  description TEXT,
  
  -- Flags e status
  is_main_complaint BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true, -- false quando a dor foi resolvida
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES users(id),
  
  -- Auditoria
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_pain_regions_session ON body_map_pain_regions(body_map_session_id);
CREATE INDEX IF NOT EXISTS idx_pain_regions_patient ON body_map_pain_regions(patient_id);
CREATE INDEX IF NOT EXISTS idx_pain_regions_active ON body_map_pain_regions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_pain_regions_main ON body_map_pain_regions(is_main_complaint) WHERE is_main_complaint = true;
CREATE INDEX IF NOT EXISTS idx_pain_regions_region ON body_map_pain_regions(body_region);

-- Comentários
COMMENT ON TABLE body_map_pain_regions IS 'Regiões/pontos de dor registrados no mapa corporal';
COMMENT ON COLUMN body_map_pain_regions.coordinates_x IS 'Coordenada X normalizada (0-100%)';
COMMENT ON COLUMN body_map_pain_regions.coordinates_y IS 'Coordenada Y normalizada (0-100%)';
COMMENT ON COLUMN body_map_pain_regions.is_main_complaint IS 'Indica se esta é a queixa principal do paciente';
COMMENT ON COLUMN body_map_pain_regions.is_active IS 'Indica se a dor ainda está ativa (false quando resolvida)';

-- ============================================================================
-- 5. TABELA: BODY_MAP_ANALYTICS_CACHE
-- ============================================================================

-- Cache de analytics para performance (calculado via trigger ou job)
CREATE TABLE IF NOT EXISTS body_map_analytics_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Estatísticas gerais
  total_sessions INTEGER DEFAULT 0,
  pain_free_sessions INTEGER DEFAULT 0,
  active_pain_regions INTEGER DEFAULT 0,
  resolved_pain_regions INTEGER DEFAULT 0,
  
  -- Tendências
  pain_trend VARCHAR(20) CHECK (pain_trend IN ('improving', 'stable', 'worsening')),
  average_pain_level FLOAT,
  last_session_date TIMESTAMPTZ,
  days_since_last_session INTEGER,
  
  -- Queixa principal
  main_complaint_initial_pain INTEGER,
  main_complaint_current_pain INTEGER,
  main_complaint_improvement_percent FLOAT,
  
  -- Metadata
  last_calculated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_analytics_patient ON body_map_analytics_cache(patient_id);

COMMENT ON TABLE body_map_analytics_cache IS 'Cache de analytics do mapa corporal para dashboard';

-- ============================================================================
-- 6. TRIGGERS E FUNÇÕES
-- ============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_body_map_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para body_map_sessions
DROP TRIGGER IF EXISTS update_body_map_sessions_updated_at ON body_map_sessions;
CREATE TRIGGER update_body_map_sessions_updated_at
  BEFORE UPDATE ON body_map_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_body_map_updated_at();

-- Trigger para body_map_pain_regions
DROP TRIGGER IF EXISTS update_body_map_pain_regions_updated_at ON body_map_pain_regions;
CREATE TRIGGER update_body_map_pain_regions_updated_at
  BEFORE UPDATE ON body_map_pain_regions
  FOR EACH ROW
  EXECUTE FUNCTION update_body_map_updated_at();

-- ============================================================================
-- 7. FUNÇÃO: RECALCULAR ANALYTICS
-- ============================================================================

CREATE OR REPLACE FUNCTION recalculate_body_map_analytics(p_patient_id UUID)
RETURNS void AS $$
DECLARE
  v_total_sessions INTEGER;
  v_pain_free_sessions INTEGER;
  v_active_regions INTEGER;
  v_resolved_regions INTEGER;
  v_avg_pain FLOAT;
  v_last_session_date TIMESTAMPTZ;
  v_main_initial INTEGER;
  v_main_current INTEGER;
BEGIN
  -- Calcular estatísticas
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE pain_free = true),
    MAX(session_date)
  INTO v_total_sessions, v_pain_free_sessions, v_last_session_date
  FROM body_map_sessions
  WHERE patient_id = p_patient_id AND deleted_at IS NULL;

  -- Contar regiões ativas e resolvidas
  SELECT 
    COUNT(*) FILTER (WHERE is_active = true),
    COUNT(*) FILTER (WHERE is_active = false)
  INTO v_active_regions, v_resolved_regions
  FROM body_map_pain_regions
  WHERE patient_id = p_patient_id AND deleted_at IS NULL;

  -- Calcular média de dor
  SELECT AVG(pain_level)
  INTO v_avg_pain
  FROM body_map_pain_regions
  WHERE patient_id = p_patient_id 
    AND is_active = true 
    AND deleted_at IS NULL;

  -- Dor inicial e atual da queixa principal
  SELECT 
    (SELECT pain_level FROM body_map_pain_regions 
     WHERE patient_id = p_patient_id AND is_main_complaint = true 
     ORDER BY created_at ASC LIMIT 1),
    (SELECT pain_level FROM body_map_pain_regions 
     WHERE patient_id = p_patient_id AND is_main_complaint = true 
     ORDER BY created_at DESC LIMIT 1)
  INTO v_main_initial, v_main_current;

  -- Inserir ou atualizar cache
  INSERT INTO body_map_analytics_cache (
    patient_id,
    total_sessions,
    pain_free_sessions,
    active_pain_regions,
    resolved_pain_regions,
    average_pain_level,
    last_session_date,
    days_since_last_session,
    main_complaint_initial_pain,
    main_complaint_current_pain,
    main_complaint_improvement_percent,
    last_calculated_at
  ) VALUES (
    p_patient_id,
    v_total_sessions,
    v_pain_free_sessions,
    v_active_regions,
    v_resolved_regions,
    v_avg_pain,
    v_last_session_date,
    EXTRACT(DAY FROM NOW() - v_last_session_date),
    v_main_initial,
    v_main_current,
    CASE 
      WHEN v_main_initial > 0 THEN ((v_main_initial - v_main_current)::FLOAT / v_main_initial * 100)
      ELSE 0 
    END,
    NOW()
  )
  ON CONFLICT (patient_id) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    pain_free_sessions = EXCLUDED.pain_free_sessions,
    active_pain_regions = EXCLUDED.active_pain_regions,
    resolved_pain_regions = EXCLUDED.resolved_pain_regions,
    average_pain_level = EXCLUDED.average_pain_level,
    last_session_date = EXCLUDED.last_session_date,
    days_since_last_session = EXCLUDED.days_since_last_session,
    main_complaint_initial_pain = EXCLUDED.main_complaint_initial_pain,
    main_complaint_current_pain = EXCLUDED.main_complaint_current_pain,
    main_complaint_improvement_percent = EXCLUDED.main_complaint_improvement_percent,
    last_calculated_at = NOW();
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION recalculate_body_map_analytics IS 'Recalcula analytics do mapa corporal para um paciente';

-- ============================================================================
-- 8. VIEW: ÚLTIMAS SESSÕES COM DETALHES
-- ============================================================================

CREATE OR REPLACE VIEW v_body_map_recent_sessions AS
SELECT 
  bms.id,
  bms.patient_id,
  p.full_name as patient_name,
  bms.session_date,
  bms.main_complaint_region,
  bms.overall_pain_level,
  bms.pain_free,
  COUNT(bmpr.id) as pain_points_count,
  AVG(bmpr.pain_level) as average_pain_level,
  MAX(bmpr.pain_level) as max_pain_level,
  bms.created_at
FROM body_map_sessions bms
JOIN patients p ON p.id = bms.patient_id
LEFT JOIN body_map_pain_regions bmpr ON bmpr.body_map_session_id = bms.id AND bmpr.deleted_at IS NULL
WHERE bms.deleted_at IS NULL
GROUP BY bms.id, p.full_name
ORDER BY bms.session_date DESC;

COMMENT ON VIEW v_body_map_recent_sessions IS 'View com últimas sessões e estatísticas agregadas';

-- ============================================================================
-- 9. POLÍTICAS RLS (ROW LEVEL SECURITY)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE body_map_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_pain_regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_map_analytics_cache ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes se houver (para idempotência)
DROP POLICY IF EXISTS "Usuários podem ver sessões dos seus pacientes" ON body_map_sessions;
DROP POLICY IF EXISTS "Fisioterapeutas podem criar sessões" ON body_map_sessions;
DROP POLICY IF EXISTS "Fisioterapeutas podem atualizar sessões" ON body_map_sessions;
DROP POLICY IF EXISTS "Usuários podem ver regiões de dor" ON body_map_pain_regions;
DROP POLICY IF EXISTS "Fisioterapeutas podem criar regiões" ON body_map_pain_regions;
DROP POLICY IF EXISTS "Fisioterapeutas podem atualizar regiões" ON body_map_pain_regions;
DROP POLICY IF EXISTS "Usuários podem ver analytics" ON body_map_analytics_cache;

-- Políticas para body_map_sessions
CREATE POLICY "Usuários podem ver sessões dos seus pacientes"
  ON body_map_sessions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Fisioterapeutas podem criar sessões"
  ON body_map_sessions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Fisioterapeutas podem atualizar sessões"
  ON body_map_sessions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Políticas para body_map_pain_regions
CREATE POLICY "Usuários podem ver regiões de dor"
  ON body_map_pain_regions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Fisioterapeutas podem criar regiões"
  ON body_map_pain_regions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Fisioterapeutas podem atualizar regiões"
  ON body_map_pain_regions FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Políticas para analytics
CREATE POLICY "Usuários podem ver analytics"
  ON body_map_analytics_cache FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- 10. DADOS INICIAIS / SEED
-- ============================================================================

-- Regiões corporais padrão (para autocomplete/sugestões)
CREATE TABLE IF NOT EXISTS body_regions_reference (
  id SERIAL PRIMARY KEY,
  region_key VARCHAR(50) UNIQUE NOT NULL,
  region_name_pt VARCHAR(100) NOT NULL,
  region_name_en VARCHAR(100),
  body_side VARCHAR(10) CHECK (body_side IN ('front', 'back', 'both')),
  parent_region VARCHAR(50),
  sort_order INTEGER DEFAULT 0
);

-- Inserir regiões padrão
INSERT INTO body_regions_reference (region_key, region_name_pt, region_name_en, body_side, sort_order) VALUES
  ('head', 'Cabeça', 'Head', 'front', 1),
  ('neck', 'Pescoço', 'Neck', 'both', 2),
  ('cervical', 'Cervical', 'Cervical', 'back', 3),
  ('shoulder_right', 'Ombro Direito', 'Right Shoulder', 'front', 4),
  ('shoulder_left', 'Ombro Esquerdo', 'Left Shoulder', 'front', 5),
  ('upper_back', 'Parte Superior das Costas', 'Upper Back', 'back', 6),
  ('chest', 'Peito/Tórax', 'Chest', 'front', 7),
  ('arm_right', 'Braço Direito', 'Right Arm', 'both', 8),
  ('arm_left', 'Braço Esquerdo', 'Left Arm', 'both', 9),
  ('elbow_right', 'Cotovelo Direito', 'Right Elbow', 'both', 10),
  ('elbow_left', 'Cotovelo Esquerdo', 'Left Elbow', 'both', 11),
  ('forearm_right', 'Antebraço Direito', 'Right Forearm', 'both', 12),
  ('forearm_left', 'Antebraço Esquerdo', 'Left Forearm', 'both', 13),
  ('wrist_right', 'Punho Direito', 'Right Wrist', 'both', 14),
  ('wrist_left', 'Punho Esquerdo', 'Left Wrist', 'both', 15),
  ('hand_right', 'Mão Direita', 'Right Hand', 'both', 16),
  ('hand_left', 'Mão Esquerda', 'Left Hand', 'both', 17),
  ('thoracic', 'Torácica (Dorsal)', 'Thoracic', 'back', 18),
  ('lumbar', 'Lombar', 'Lumbar', 'back', 19),
  ('abdomen', 'Abdômen', 'Abdomen', 'front', 20),
  ('hip_right', 'Quadril Direito', 'Right Hip', 'both', 21),
  ('hip_left', 'Quadril Esquerdo', 'Left Hip', 'both', 22),
  ('sacral', 'Sacral', 'Sacral', 'back', 23),
  ('glute_right', 'Glúteo Direito', 'Right Glute', 'back', 24),
  ('glute_left', 'Glúteo Esquerdo', 'Left Glute', 'back', 25),
  ('thigh_right', 'Coxa Direita', 'Right Thigh', 'both', 26),
  ('thigh_left', 'Coxa Esquerda', 'Left Thigh', 'both', 27),
  ('knee_right', 'Joelho Direito', 'Right Knee', 'both', 28),
  ('knee_left', 'Joelho Esquerdo', 'Left Knee', 'both', 29),
  ('calf_right', 'Panturrilha Direita', 'Right Calf', 'back', 30),
  ('calf_left', 'Panturrilha Esquerda', 'Left Calf', 'back', 31),
  ('shin_right', 'Canela Direita', 'Right Shin', 'front', 32),
  ('shin_left', 'Canela Esquerda', 'Left Shin', 'front', 33),
  ('ankle_right', 'Tornozelo Direito', 'Right Ankle', 'both', 34),
  ('ankle_left', 'Tornozelo Esquerdo', 'Left Ankle', 'both', 35),
  ('foot_right', 'Pé Direito', 'Right Foot', 'both', 36),
  ('foot_left', 'Pé Esquerdo', 'Left Foot', 'both', 37)
ON CONFLICT (region_key) DO NOTHING;

COMMENT ON TABLE body_regions_reference IS 'Referência de regiões corporais para sugestões e autocomplete';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

-- Log de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251013_body_map_system aplicada com sucesso!';
  RAISE NOTICE 'Tabelas criadas: body_map_sessions, body_map_pain_regions, body_map_analytics_cache, body_regions_reference';
  RAISE NOTICE 'Sistema de Mapa Corporal de Dor está pronto para uso.';
END $$;

