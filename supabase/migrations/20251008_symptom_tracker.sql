-- =====================================================
-- MIGRATION: Advanced Symptom Tracker Module
-- Data: 2025-10-08
-- Descrição: Rastreador Avançado de Sintomas
-- =====================================================

-- Enum para tipos de sintomas
CREATE TYPE symptom_type AS ENUM (
  'pain',
  'fatigue',
  'swelling',
  'stiffness',
  'numbness',
  'weakness',
  'dizziness',
  'nausea',
  'sleep_disturbance',
  'mood_change',
  'appetite_change',
  'other'
);

-- Enum para severidade
CREATE TYPE symptom_severity AS ENUM (
  'none',
  'mild',
  'moderate',
  'severe',
  'very_severe'
);

-- =====================================================
-- TABELA: symptom_diary
-- Diário de sintomas do paciente
-- =====================================================
CREATE TABLE IF NOT EXISTS symptom_diary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  diary_date DATE NOT NULL,
  diary_time TIME NOT NULL,
  
  symptom_type symptom_type NOT NULL,
  symptom_description TEXT NOT NULL,
  
  -- Escalas
  severity symptom_severity NOT NULL,
  intensity INTEGER NOT NULL CHECK (intensity >= 0 AND intensity <= 10),
  
  -- Dor específica (VAS - Visual Analog Scale)
  pain_location TEXT,
  pain_quality TEXT[], -- ['sharp', 'dull', 'burning', 'shooting']
  pain_radiation BOOLEAN DEFAULT false,
  
  -- Duração e frequência
  duration_minutes INTEGER,
  frequency TEXT CHECK (frequency IN ('constant', 'intermittent', 'occasional', 'rare')),
  
  -- Fatores
  triggering_factors TEXT[],
  relieving_factors TEXT[],
  
  -- Contexto
  activity_at_onset TEXT,
  mood_state TEXT CHECK (mood_state IN ('very_bad', 'bad', 'neutral', 'good', 'very_good')),
  
  -- Medicação tomada
  medication_taken TEXT,
  medication_effective BOOLEAN,
  
  -- Impacto
  impact_on_function INTEGER CHECK (impact_on_function >= 0 AND impact_on_function <= 10),
  impact_on_sleep INTEGER CHECK (impact_on_sleep >= 0 AND impact_on_sleep <= 10),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_symptom_datetime UNIQUE (patient_id, diary_date, diary_time, symptom_type)
);

CREATE INDEX idx_symptom_diary_patient ON symptom_diary(patient_id);
CREATE INDEX idx_symptom_diary_date ON symptom_diary(diary_date DESC);
CREATE INDEX idx_symptom_diary_type ON symptom_diary(symptom_type);
CREATE INDEX idx_symptom_diary_severity ON symptom_diary(severity);

-- =====================================================
-- TABELA: environmental_factors
-- Fatores ambientais correlacionados
-- =====================================================
CREATE TABLE IF NOT EXISTS environmental_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  symptom_entry_id UUID NOT NULL REFERENCES symptom_diary(id) ON DELETE CASCADE,
  
  -- Clima
  temperature DECIMAL(5,2),
  humidity INTEGER CHECK (humidity >= 0 AND humidity <= 100),
  barometric_pressure DECIMAL(6,2),
  weather_condition TEXT,
  
  -- Qualidade do ar
  air_quality_index INTEGER,
  pollen_count TEXT CHECK (pollen_count IN ('low', 'moderate', 'high', 'very_high')),
  
  -- Localização
  location TEXT,
  
  -- Outros
  noise_level INTEGER CHECK (noise_level >= 0 AND noise_level <= 10),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_environmental_factors_symptom ON environmental_factors(symptom_entry_id);

-- =====================================================
-- TABELA: symptom_correlations
-- Correlações identificadas (IA/ML)
-- =====================================================
CREATE TABLE IF NOT EXISTS symptom_correlations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  correlation_type TEXT NOT NULL CHECK (correlation_type IN ('symptom_symptom', 'symptom_activity', 'symptom_environment', 'symptom_medication', 'symptom_time')),
  
  primary_symptom symptom_type NOT NULL,
  correlated_factor TEXT NOT NULL,
  
  correlation_coefficient DECIMAL(5,4) NOT NULL CHECK (correlation_coefficient >= -1 AND correlation_coefficient <= 1),
  statistical_significance DECIMAL(5,4),
  p_value DECIMAL(5,4),
  
  strength TEXT NOT NULL CHECK (strength IN ('weak', 'moderate', 'strong', 'very_strong')),
  direction TEXT NOT NULL CHECK (direction IN ('positive', 'negative', 'neutral')),
  
  sample_size INTEGER NOT NULL,
  
  analysis_period_start DATE NOT NULL,
  analysis_period_end DATE NOT NULL,
  
  insights TEXT NOT NULL,
  recommendations TEXT[],
  
  confidence_level DECIMAL(3,2) NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptom_correlations_patient ON symptom_correlations(patient_id);
CREATE INDEX idx_symptom_correlations_strength ON symptom_correlations(strength);

-- =====================================================
-- TABELA: symptom_alerts
-- Alertas baseados em padrões de sintomas
-- =====================================================
CREATE TABLE IF NOT EXISTS symptom_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  alert_type TEXT NOT NULL CHECK (alert_type IN ('worsening_trend', 'new_pattern', 'severity_threshold', 'frequency_increase', 'red_flag')),
  
  symptom_type symptom_type NOT NULL,
  
  alert_message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'urgent', 'critical')),
  
  supporting_data JSONB NOT NULL,
  
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  
  action_taken TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptom_alerts_patient ON symptom_alerts(patient_id);
CREATE INDEX idx_symptom_alerts_severity ON symptom_alerts(severity);
CREATE INDEX idx_symptom_alerts_acknowledged ON symptom_alerts(acknowledged);

-- =====================================================
-- TABELA: symptom_patterns
-- Padrões identificados pela IA
-- =====================================================
CREATE TABLE IF NOT EXISTS symptom_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  pattern_name TEXT NOT NULL,
  pattern_description TEXT NOT NULL,
  
  symptom_types symptom_type[] NOT NULL,
  
  frequency TEXT NOT NULL,
  typical_timing TEXT, -- 'morning', 'evening', 'after_activity', etc
  
  contributing_factors TEXT[],
  
  first_observed DATE NOT NULL,
  last_observed DATE NOT NULL,
  occurrences INTEGER NOT NULL,
  
  confidence DECIMAL(3,2) NOT NULL,
  
  clinical_significance TEXT NOT NULL CHECK (clinical_significance IN ('low', 'moderate', 'high', 'critical')),
  
  recommendations TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_symptom_patterns_patient ON symptom_patterns(patient_id);
CREATE INDEX idx_symptom_patterns_significance ON symptom_patterns(clinical_significance);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Symptom trends over time
CREATE OR REPLACE VIEW symptom_trends_7d AS
SELECT 
  patient_id,
  symptom_type,
  DATE_TRUNC('day', diary_date) as day,
  AVG(intensity) as avg_intensity,
  MAX(intensity) as max_intensity,
  COUNT(*) as occurrences
FROM symptom_diary
WHERE diary_date >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY patient_id, symptom_type, DATE_TRUNC('day', diary_date)
ORDER BY patient_id, day DESC;

-- View: Unacknowledged critical alerts
CREATE OR REPLACE VIEW critical_symptom_alerts AS
SELECT *
FROM symptom_alerts
WHERE severity IN ('urgent', 'critical')
  AND acknowledged = false
ORDER BY triggered_at DESC;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para detectar tendência de piora
CREATE OR REPLACE FUNCTION detect_worsening_trend(
  p_patient_id UUID,
  p_symptom_type symptom_type,
  p_days INTEGER DEFAULT 7
)
RETURNS BOOLEAN AS $$
DECLARE
  v_trend_direction TEXT;
  v_recent_avg DECIMAL;
  v_previous_avg DECIMAL;
BEGIN
  -- Média dos últimos X dias
  SELECT AVG(intensity)
  INTO v_recent_avg
  FROM symptom_diary
  WHERE patient_id = p_patient_id
    AND symptom_type = p_symptom_type
    AND diary_date >= CURRENT_DATE - (p_days || ' days')::INTERVAL;
  
  -- Média dos X dias anteriores
  SELECT AVG(intensity)
  INTO v_previous_avg
  FROM symptom_diary
  WHERE patient_id = p_patient_id
    AND symptom_type = p_symptom_type
    AND diary_date >= CURRENT_DATE - (p_days * 2 || ' days')::INTERVAL
    AND diary_date < CURRENT_DATE - (p_days || ' days')::INTERVAL;
  
  IF v_recent_avg IS NULL OR v_previous_avg IS NULL THEN
    RETURN false;
  END IF;
  
  -- Consideraraumento > 20% como piora
  RETURN v_recent_avg > (v_previous_avg * 1.2);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE symptom_diary ENABLE ROW LEVEL SECURITY;
ALTER TABLE symptom_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own symptom diary"
  ON symptom_diary FOR ALL
  USING (
    patient_id = (SELECT patient_id FROM users WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta'))
  );

CREATE POLICY "Therapists can view symptom data"
  ON symptom_diary FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE symptom_diary IS 'Diário de sintomas dos pacientes';
COMMENT ON TABLE environmental_factors IS 'Fatores ambientais correlacionados com sintomas';
COMMENT ON TABLE symptom_correlations IS 'Correlações identificadas pela IA entre sintomas e fatores';
COMMENT ON TABLE symptom_alerts IS 'Alertas automáticos baseados em padrões de sintomas';
COMMENT ON TABLE symptom_patterns IS 'Padrões de sintomas identificados';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


