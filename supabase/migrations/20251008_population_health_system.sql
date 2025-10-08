-- =====================================================
-- MIGRATION: Population Health Analytics System
-- Data: 2025-10-08
-- Descrição: Tabelas para Dashboard de Saúde Populacional
-- =====================================================

-- Enum para tipos de coorte
CREATE TYPE cohort_type AS ENUM (
  'age_group',
  'condition',
  'treatment',
  'risk_level',
  'geographic',
  'socioeconomic',
  'custom'
);

-- Enum para tendência
CREATE TYPE trend_direction AS ENUM (
  'improving',
  'stable',
  'worsening',
  'insufficient_data'
);

-- =====================================================
-- TABELA: population_cohorts
-- Coortes/grupos populacionais para análise
-- =====================================================
CREATE TABLE IF NOT EXISTS population_cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  cohort_type cohort_type NOT NULL,
  criteria JSONB NOT NULL, -- Critérios de inclusão
  
  patient_count INTEGER NOT NULL DEFAULT 0,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_population_cohorts_type ON population_cohorts(cohort_type);
CREATE INDEX idx_population_cohorts_active ON population_cohorts(is_active);

-- =====================================================
-- TABELA: cohort_members
-- Membros de cada coorte
-- =====================================================
CREATE TABLE IF NOT EXISTS cohort_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES population_cohorts(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT unique_cohort_patient UNIQUE (cohort_id, patient_id)
);

CREATE INDEX idx_cohort_members_cohort ON cohort_members(cohort_id);
CREATE INDEX idx_cohort_members_patient ON cohort_members(patient_id);
CREATE INDEX idx_cohort_members_active ON cohort_members(is_active);

-- =====================================================
-- TABELA: population_metrics
-- Métricas agregadas da população
-- =====================================================
CREATE TABLE IF NOT EXISTS population_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  metric_date DATE NOT NULL,
  cohort_id UUID REFERENCES population_cohorts(id) ON DELETE SET NULL,
  
  -- Métricas gerais
  total_patients INTEGER NOT NULL,
  active_treatments INTEGER NOT NULL,
  avg_age DECIMAL(5,2),
  gender_distribution JSONB, -- {male: X, female: Y, other: Z}
  
  -- Métricas clínicas
  avg_sessions_per_patient DECIMAL(5,2),
  avg_treatment_duration INTEGER, -- dias
  completion_rate DECIMAL(5,2), -- porcentagem
  dropout_rate DECIMAL(5,2), -- porcentagem
  
  -- Métricas de outcome
  avg_improvement_score DECIMAL(5,2),
  goal_achievement_rate DECIMAL(5,2),
  readmission_rate DECIMAL(5,2),
  
  -- Métricas de satisfação
  avg_satisfaction_score DECIMAL(3,2),
  nps_score INTEGER,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_population_metrics_date ON population_metrics(metric_date DESC);
CREATE INDEX idx_population_metrics_cohort ON population_metrics(cohort_id);

-- =====================================================
-- TABELA: condition_prevalence
-- Prevalência de condições na população
-- =====================================================
CREATE TABLE IF NOT EXISTS condition_prevalence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  condition_name TEXT NOT NULL,
  condition_category TEXT NOT NULL,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_cases INTEGER NOT NULL,
  new_cases INTEGER NOT NULL,
  resolved_cases INTEGER NOT NULL,
  active_cases INTEGER NOT NULL,
  
  incidence_rate DECIMAL(10,5), -- por 100.000
  prevalence_rate DECIMAL(10,5), -- por 100.000
  
  avg_age_at_onset DECIMAL(5,2),
  gender_distribution JSONB,
  risk_factors JSONB,
  
  trend trend_direction NOT NULL DEFAULT 'insufficient_data',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_condition_prevalence_name ON condition_prevalence(condition_name);
CREATE INDEX idx_condition_prevalence_period ON condition_prevalence(period_start, period_end);

-- =====================================================
-- TABELA: treatment_outcomes_aggregate
-- Outcomes agregados por tipo de tratamento
-- =====================================================
CREATE TABLE IF NOT EXISTS treatment_outcomes_aggregate (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  treatment_type TEXT NOT NULL,
  condition_treated TEXT NOT NULL,
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  total_patients INTEGER NOT NULL,
  completed_treatment INTEGER NOT NULL,
  ongoing_treatment INTEGER NOT NULL,
  discontinued_treatment INTEGER NOT NULL,
  
  avg_sessions INTEGER NOT NULL,
  avg_duration_days INTEGER NOT NULL,
  
  -- Outcomes
  success_rate DECIMAL(5,2), -- porcentagem
  avg_improvement DECIMAL(5,2),
  avg_pain_reduction DECIMAL(5,2),
  avg_function_improvement DECIMAL(5,2),
  
  -- Custos (se disponível)
  avg_cost_per_patient DECIMAL(10,2),
  total_cost DECIMAL(12,2),
  
  effectiveness_score DECIMAL(3,2), -- 0-1
  recommendation_level TEXT CHECK (recommendation_level IN ('highly_recommended', 'recommended', 'conditional', 'not_recommended')),
  
  evidence_quality TEXT CHECK (evidence_quality IN ('high', 'moderate', 'low', 'very_low')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_treatment_outcomes_type ON treatment_outcomes_aggregate(treatment_type);
CREATE INDEX idx_treatment_outcomes_condition ON treatment_outcomes_aggregate(condition_treated);
CREATE INDEX idx_treatment_outcomes_period ON treatment_outcomes_aggregate(period_start, period_end);

-- =====================================================
-- TABELA: demographic_insights
-- Insights demográficos da população
-- =====================================================
CREATE TABLE IF NOT EXISTS demographic_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  insight_date DATE NOT NULL,
  
  age_distribution JSONB NOT NULL, -- {0-18: X, 19-30: Y, ...}
  gender_distribution JSONB NOT NULL,
  geographic_distribution JSONB,
  
  socioeconomic_data JSONB,
  education_level_distribution JSONB,
  employment_status_distribution JSONB,
  
  health_literacy_avg DECIMAL(3,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_demographic_insights_date ON demographic_insights(insight_date DESC);

-- =====================================================
-- TABELA: health_disparities
-- Disparidades de saúde identificadas
-- =====================================================
CREATE TABLE IF NOT EXISTS health_disparities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  disparity_type TEXT NOT NULL CHECK (disparity_type IN ('age', 'gender', 'race', 'socioeconomic', 'geographic', 'disability')),
  
  affected_group TEXT NOT NULL,
  comparison_group TEXT NOT NULL,
  
  metric_name TEXT NOT NULL,
  affected_value DECIMAL(10,2) NOT NULL,
  comparison_value DECIMAL(10,2) NOT NULL,
  disparity_ratio DECIMAL(5,2) NOT NULL,
  
  statistical_significance BOOLEAN NOT NULL,
  p_value DECIMAL(5,4),
  
  severity TEXT NOT NULL CHECK (severity IN ('minimal', 'moderate', 'significant', 'critical')),
  
  description TEXT NOT NULL,
  potential_causes TEXT[],
  recommended_interventions TEXT[],
  
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('identified', 'under_investigation', 'intervention_planned', 'resolved')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_health_disparities_type ON health_disparities(disparity_type);
CREATE INDEX idx_health_disparities_severity ON health_disparities(severity);
CREATE INDEX idx_health_disparities_status ON health_disparities(status);

-- =====================================================
-- TABELA: intervention_programs
-- Programas de intervenção populacional
-- =====================================================
CREATE TABLE IF NOT EXISTS intervention_programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  
  target_cohort_id UUID REFERENCES population_cohorts(id) ON DELETE SET NULL,
  target_disparity_id UUID REFERENCES health_disparities(id) ON DELETE SET NULL,
  
  objectives TEXT[] NOT NULL,
  interventions TEXT[] NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE,
  
  status TEXT NOT NULL CHECK (status IN ('planned', 'active', 'paused', 'completed', 'cancelled')),
  
  participants_enrolled INTEGER DEFAULT 0,
  participants_completed INTEGER DEFAULT 0,
  
  budget DECIMAL(12,2),
  actual_cost DECIMAL(12,2),
  
  success_metrics JSONB,
  
  created_by TEXT NOT NULL,
  managed_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intervention_programs_cohort ON intervention_programs(target_cohort_id);
CREATE INDEX idx_intervention_programs_status ON intervention_programs(status);

-- =====================================================
-- TABELA: program_outcomes
-- Resultados dos programas de intervenção
-- =====================================================
CREATE TABLE IF NOT EXISTS program_outcomes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES intervention_programs(id) ON DELETE CASCADE,
  
  measurement_date DATE NOT NULL,
  
  metrics JSONB NOT NULL,
  success_rate DECIMAL(5,2),
  roi DECIMAL(10,2), -- Return on Investment
  
  qualitative_feedback TEXT[],
  lessons_learned TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_program_outcomes_program ON program_outcomes(program_id);
CREATE INDEX idx_program_outcomes_date ON program_outcomes(measurement_date DESC);

-- =====================================================
-- TABELA: predictive_population_trends
-- Tendências preditivas da população
-- =====================================================
CREATE TABLE IF NOT EXISTS predictive_population_trends (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  trend_type TEXT NOT NULL CHECK (trend_type IN ('disease_burden', 'service_demand', 'outcome_improvement', 'cost', 'capacity')),
  
  current_value DECIMAL(12,2) NOT NULL,
  predicted_value_30d DECIMAL(12,2),
  predicted_value_90d DECIMAL(12,2),
  predicted_value_1y DECIMAL(12,2),
  
  confidence_interval JSONB, -- {lower: X, upper: Y}
  confidence_level DECIMAL(3,2) NOT NULL,
  
  trend_direction trend_direction NOT NULL,
  
  contributing_factors TEXT[],
  recommendations TEXT[],
  
  model_used TEXT NOT NULL,
  model_accuracy DECIMAL(5,2),
  
  prediction_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_predictive_trends_type ON predictive_population_trends(trend_type);
CREATE INDEX idx_predictive_trends_date ON predictive_population_trends(prediction_date DESC);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Current population overview
CREATE OR REPLACE VIEW current_population_overview AS
SELECT 
  COUNT(DISTINCT p.id) as total_patients,
  AVG(EXTRACT(YEAR FROM AGE(p.birth_date))) as avg_age,
  COUNT(DISTINCT t.id) as active_treatments,
  AVG(t.completed_sessions::decimal / NULLIF(t.total_sessions, 0) * 100) as avg_completion_rate
FROM patients p
LEFT JOIN treatments t ON p.id = t.patient_id
WHERE p.is_active = true;

-- View: Latest metrics by cohort
CREATE OR REPLACE VIEW latest_cohort_metrics AS
SELECT DISTINCT ON (cohort_id)
  pm.*,
  pc.name as cohort_name,
  pc.cohort_type
FROM population_metrics pm
INNER JOIN population_cohorts pc ON pm.cohort_id = pc.id
ORDER BY cohort_id, metric_date DESC;

-- View: Critical disparities
CREATE OR REPLACE VIEW critical_health_disparities AS
SELECT *
FROM health_disparities
WHERE severity IN ('significant', 'critical')
  AND status NOT IN ('resolved')
ORDER BY 
  CASE severity
    WHEN 'critical' THEN 1
    WHEN 'significant' THEN 2
  END,
  created_at DESC;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para atualizar contagem de pacientes no cohort
CREATE OR REPLACE FUNCTION update_cohort_patient_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE population_cohorts
  SET 
    patient_count = (
      SELECT COUNT(*)
      FROM cohort_members
      WHERE cohort_id = COALESCE(NEW.cohort_id, OLD.cohort_id)
        AND is_active = true
    ),
    updated_at = NOW()
  WHERE id = COALESCE(NEW.cohort_id, OLD.cohort_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar contagem
CREATE TRIGGER trigger_update_cohort_count
  AFTER INSERT OR UPDATE OR DELETE ON cohort_members
  FOR EACH ROW
  EXECUTE FUNCTION update_cohort_patient_count();

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE population_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE population_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_disparities ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY "Admin can view population data"
  ON population_cohorts FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'Admin'
  ));

CREATE POLICY "Admin can manage population data"
  ON population_cohorts FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'Admin'
  ));

-- =====================================================
-- COMMENTS: Documentação
-- =====================================================

COMMENT ON TABLE population_cohorts IS 'Coortes/grupos populacionais para análise';
COMMENT ON TABLE population_metrics IS 'Métricas agregadas da população';
COMMENT ON TABLE condition_prevalence IS 'Prevalência de condições na população';
COMMENT ON TABLE health_disparities IS 'Disparidades de saúde identificadas';
COMMENT ON TABLE intervention_programs IS 'Programas de intervenção populacional';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



