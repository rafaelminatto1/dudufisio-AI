-- =====================================================
-- MIGRATION: Wearables Integration System
-- Data: 2025-10-08
-- Descrição: Integração com dispositivos wearables
-- =====================================================

-- Enum para tipos de dispositivo
CREATE TYPE wearable_device_type AS ENUM (
  'apple_health',
  'google_fit',
  'fitbit',
  'garmin',
  'samsung_health',
  'whoop',
  'oura_ring',
  'polar',
  'other'
);

-- Enum para tipos de dados
CREATE TYPE wearable_data_type AS ENUM (
  'steps',
  'heart_rate',
  'sleep',
  'calories',
  'distance',
  'exercise',
  'blood_pressure',
  'blood_oxygen',
  'weight',
  'body_temperature',
  'stress_level',
  'hrv'
);

-- =====================================================
-- TABELA: wearable_connections
-- Conexões de dispositivos wearables
-- =====================================================
CREATE TABLE IF NOT EXISTS wearable_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  device_type wearable_device_type NOT NULL,
  device_name TEXT,
  
  is_connected BOOLEAN NOT NULL DEFAULT false,
  
  -- OAuth tokens (encrypted)
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  
  -- Sincronização
  last_sync_at TIMESTAMPTZ,
  sync_frequency TEXT DEFAULT 'hourly' CHECK (sync_frequency IN ('manual', 'hourly', 'daily')),
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  
  -- Permissões
  permissions JSONB, -- {steps: true, heart_rate: true, ...}
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_device UNIQUE (patient_id, device_type)
);

CREATE INDEX idx_wearable_connections_patient ON wearable_connections(patient_id);
CREATE INDEX idx_wearable_connections_type ON wearable_connections(device_type);
CREATE INDEX idx_wearable_connections_connected ON wearable_connections(is_connected);

-- =====================================================
-- TABELA: wearable_data
-- Dados coletados dos wearables
-- =====================================================
CREATE TABLE IF NOT EXISTS wearable_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  connection_id UUID REFERENCES wearable_connections(id) ON DELETE SET NULL,
  
  source wearable_device_type NOT NULL,
  data_type wearable_data_type NOT NULL,
  
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  
  recorded_at TIMESTAMPTZ NOT NULL,
  
  -- Metadados adicionais
  metadata JSONB, -- {quality: 'good', confidence: 0.95, ...}
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_data_point UNIQUE (patient_id, source, data_type, recorded_at)
);

CREATE INDEX idx_wearable_data_patient ON wearable_data(patient_id);
CREATE INDEX idx_wearable_data_source ON wearable_data(source);
CREATE INDEX idx_wearable_data_type ON wearable_data(data_type);
CREATE INDEX idx_wearable_data_recorded ON wearable_data(recorded_at DESC);

-- =====================================================
-- TABELA: wearable_daily_aggregates
-- Agregados diários de métricas
-- =====================================================
CREATE TABLE IF NOT EXISTS wearable_daily_aggregates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  aggregate_date DATE NOT NULL,
  
  -- Passos
  total_steps INTEGER,
  avg_steps INTEGER,
  
  -- Frequência cardíaca
  avg_heart_rate INTEGER,
  max_heart_rate INTEGER,
  min_heart_rate INTEGER,
  resting_heart_rate INTEGER,
  
  -- Sono
  total_sleep_hours DECIMAL(4,2),
  deep_sleep_hours DECIMAL(4,2),
  light_sleep_hours DECIMAL(4,2),
  rem_sleep_hours DECIMAL(4,2),
  sleep_quality_score INTEGER CHECK (sleep_quality_score >= 0 AND sleep_quality_score <= 100),
  
  -- Atividade
  total_calories_burned INTEGER,
  active_minutes INTEGER,
  sedentary_minutes INTEGER,
  total_distance_km DECIMAL(6,2),
  
  -- Outros
  avg_stress_level INTEGER CHECK (avg_stress_level >= 0 AND avg_stress_level <= 100),
  hrv_avg DECIMAL(6,2), -- Heart Rate Variability
  
  data_sources TEXT[], -- Quais dispositivos contribuíram
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_date UNIQUE (patient_id, aggregate_date)
);

CREATE INDEX idx_wearable_daily_aggregates_patient ON wearable_daily_aggregates(patient_id);
CREATE INDEX idx_wearable_daily_aggregates_date ON wearable_daily_aggregates(aggregate_date DESC);

-- =====================================================
-- TABELA: activity_goals
-- Metas de atividade física
-- =====================================================
CREATE TABLE IF NOT EXISTS activity_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  goal_type TEXT NOT NULL CHECK (goal_type IN ('steps', 'exercise_minutes', 'calories', 'distance', 'sleep_hours')),
  
  target_value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly')),
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_goals_patient ON activity_goals(patient_id);
CREATE INDEX idx_activity_goals_active ON activity_goals(is_active);

-- =====================================================
-- TABELA: goal_achievements
-- Alcance de metas
-- =====================================================
CREATE TABLE IF NOT EXISTS goal_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES activity_goals(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  achievement_date DATE NOT NULL,
  target_value DECIMAL(10,2) NOT NULL,
  actual_value DECIMAL(10,2) NOT NULL,
  achievement_percentage INTEGER NOT NULL,
  
  achieved BOOLEAN NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_goal_achievements_goal ON goal_achievements(goal_id);
CREATE INDEX idx_goal_achievements_patient ON goal_achievements(patient_id);
CREATE INDEX idx_goal_achievements_date ON goal_achievements(achievement_date DESC);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Latest wearable data per type
CREATE OR REPLACE VIEW latest_wearable_data AS
SELECT DISTINCT ON (patient_id, data_type)
  *
FROM wearable_data
ORDER BY patient_id, data_type, recorded_at DESC;

-- View: Today's activity summary
CREATE OR REPLACE VIEW todays_activity_summary AS
SELECT 
  patient_id,
  total_steps,
  avg_heart_rate,
  total_sleep_hours,
  active_minutes,
  total_calories_burned
FROM wearable_daily_aggregates
WHERE aggregate_date = CURRENT_DATE;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para calcular agregados diários
CREATE OR REPLACE FUNCTION calculate_daily_aggregates(p_patient_id UUID, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO wearable_daily_aggregates (
    patient_id,
    aggregate_date,
    total_steps,
    avg_heart_rate,
    max_heart_rate,
    min_heart_rate
  )
  SELECT 
    p_patient_id,
    p_date,
    SUM(CASE WHEN data_type = 'steps' THEN value ELSE 0 END)::INTEGER,
    AVG(CASE WHEN data_type = 'heart_rate' THEN value ELSE NULL END)::INTEGER,
    MAX(CASE WHEN data_type = 'heart_rate' THEN value ELSE NULL END)::INTEGER,
    MIN(CASE WHEN data_type = 'heart_rate' THEN value ELSE NULL END)::INTEGER
  FROM wearable_data
  WHERE patient_id = p_patient_id
    AND DATE(recorded_at) = p_date
  ON CONFLICT (patient_id, aggregate_date) DO UPDATE SET
    total_steps = EXCLUDED.total_steps,
    avg_heart_rate = EXCLUDED.avg_heart_rate,
    max_heart_rate = EXCLUDED.max_heart_rate,
    min_heart_rate = EXCLUDED.min_heart_rate,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can view own wearable data"
  ON wearable_data FOR SELECT
  USING (
    patient_id = (SELECT patient_id FROM users WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta'))
  );

CREATE POLICY "Patients can manage own connections"
  ON wearable_connections FOR ALL
  USING (
    patient_id = (SELECT patient_id FROM users WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta'))
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE wearable_connections IS 'Conexões com dispositivos wearables (Apple Health, Fitbit, etc)';
COMMENT ON TABLE wearable_data IS 'Dados coletados dos wearables (passos, FC, sono, etc)';
COMMENT ON TABLE wearable_daily_aggregates IS 'Agregados diários de métricas de wearables';
COMMENT ON TABLE activity_goals IS 'Metas de atividade física do paciente';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================












