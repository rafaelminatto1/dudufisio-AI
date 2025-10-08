-- =====================================================
-- MIGRATION: Predictive Analytics with AI System
-- Data: 2025-10-08
-- Descrição: Tabelas para Análise Preditiva com IA
-- =====================================================

-- Enum para tipos de predição
CREATE TYPE prediction_type AS ENUM (
  'treatment_outcome',
  'dropout_risk',
  'recovery_time',
  'complication_risk',
  'readmission_risk',
  'adherence_prediction',
  'goal_achievement',
  'cost_prediction'
);

-- Enum para nível de confiança
CREATE TYPE confidence_level AS ENUM (
  'very_low',
  'low',
  'medium',
  'high',
  'very_high'
);

-- =====================================================
-- TABELA: ai_predictions
-- Predições geradas pela IA
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  prediction_type prediction_type NOT NULL,
  
  -- Resultado da predição
  outcome_prediction TEXT NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  confidence_level confidence_level NOT NULL,
  
  -- Dados de entrada
  input_features JSONB NOT NULL,
  features_used TEXT[] NOT NULL,
  
  -- Fatores analisados
  factors_analyzed TEXT[] NOT NULL,
  risk_factors TEXT[],
  protective_factors TEXT[],
  
  -- Recomendações
  recommendations TEXT[] NOT NULL,
  intervention_suggestions TEXT[],
  
  -- Cenários alternativos
  alternative_scenarios JSONB,
  
  -- Explicabilidade
  feature_importance JSONB, -- {feature: importance_score}
  explanation TEXT NOT NULL,
  
  -- Modelo
  model_name TEXT NOT NULL,
  model_version TEXT NOT NULL,
  model_accuracy DECIMAL(5,4),
  
  -- Validação
  validated BOOLEAN DEFAULT false,
  validation_date TIMESTAMPTZ,
  validated_by TEXT,
  actual_outcome TEXT,
  was_accurate BOOLEAN,
  
  -- Metadados
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  
  notes TEXT
);

CREATE INDEX idx_ai_predictions_patient ON ai_predictions(patient_id);
CREATE INDEX idx_ai_predictions_type ON ai_predictions(prediction_type);
CREATE INDEX idx_ai_predictions_confidence ON ai_predictions(confidence_level);
CREATE INDEX idx_ai_predictions_date ON ai_predictions(created_at DESC);
CREATE INDEX idx_ai_predictions_validated ON ai_predictions(validated);

-- =====================================================
-- TABELA: prediction_features
-- Features individuais usadas na predição
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_features (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES ai_predictions(id) ON DELETE CASCADE,
  
  feature_name TEXT NOT NULL,
  feature_category TEXT NOT NULL CHECK (feature_category IN ('demographic', 'clinical', 'behavioral', 'social', 'historical')),
  
  feature_value JSONB NOT NULL,
  feature_value_normalized DECIMAL(10,6),
  
  importance_score DECIMAL(5,4) NOT NULL CHECK (importance_score >= 0 AND importance_score <= 1),
  contribution_to_prediction DECIMAL(10,6),
  
  is_modifiable BOOLEAN NOT NULL DEFAULT true,
  modification_impact TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prediction_features_prediction ON prediction_features(prediction_id);
CREATE INDEX idx_prediction_features_importance ON prediction_features(importance_score DESC);

-- =====================================================
-- TABELA: ml_models
-- Modelos de Machine Learning
-- =====================================================
CREATE TABLE IF NOT EXISTS ml_models (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  model_name TEXT NOT NULL UNIQUE,
  model_type TEXT NOT NULL CHECK (model_type IN ('classification', 'regression', 'clustering', 'time_series')),
  prediction_type prediction_type NOT NULL,
  
  version TEXT NOT NULL,
  algorithm TEXT NOT NULL,
  
  -- Métricas de performance
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall DECIMAL(5,4),
  f1_score DECIMAL(5,4),
  auc_roc DECIMAL(5,4),
  mae DECIMAL(10,4), -- Mean Absolute Error
  rmse DECIMAL(10,4), -- Root Mean Squared Error
  r2_score DECIMAL(5,4),
  
  -- Training info
  training_data_size INTEGER NOT NULL,
  training_date TIMESTAMPTZ NOT NULL,
  validation_method TEXT NOT NULL,
  
  hyperparameters JSONB,
  feature_names TEXT[] NOT NULL,
  feature_importance JSONB,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_production BOOLEAN NOT NULL DEFAULT false,
  
  model_file_url TEXT,
  model_description TEXT NOT NULL,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ml_models_name ON ml_models(model_name);
CREATE INDEX idx_ml_models_type ON ml_models(prediction_type);
CREATE INDEX idx_ml_models_active ON ml_models(is_active);
CREATE INDEX idx_ml_models_production ON ml_models(is_production);

-- =====================================================
-- TABELA: model_training_runs
-- Histórico de treinamento de modelos
-- =====================================================
CREATE TABLE IF NOT EXISTS model_training_runs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
  
  run_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  run_duration INTEGER, -- segundos
  
  training_samples INTEGER NOT NULL,
  validation_samples INTEGER NOT NULL,
  test_samples INTEGER NOT NULL,
  
  metrics JSONB NOT NULL,
  
  hyperparameters_used JSONB NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  error_message TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_model_training_runs_model ON model_training_runs(model_id);
CREATE INDEX idx_model_training_runs_date ON model_training_runs(run_date DESC);
CREATE INDEX idx_model_training_runs_status ON model_training_runs(status);

-- =====================================================
-- TABELA: prediction_feedback
-- Feedback sobre predições (para retreinamento)
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  prediction_id UUID NOT NULL REFERENCES ai_predictions(id) ON DELETE CASCADE,
  
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('accuracy', 'usefulness', 'clarity', 'general')),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  
  did_follow_recommendations BOOLEAN,
  outcome_changed BOOLEAN,
  
  provided_by TEXT NOT NULL,
  provided_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prediction_feedback_prediction ON prediction_feedback(prediction_id);
CREATE INDEX idx_prediction_feedback_type ON prediction_feedback(feedback_type);

-- =====================================================
-- TABELA: prediction_experiments
-- Experimentos com diferentes abordagens de predição
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_experiments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  experiment_name TEXT NOT NULL,
  experiment_description TEXT NOT NULL,
  
  prediction_type prediction_type NOT NULL,
  
  models_tested TEXT[] NOT NULL,
  best_model TEXT NOT NULL,
  
  results JSONB NOT NULL,
  insights TEXT[],
  
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  
  status TEXT NOT NULL CHECK (status IN ('planning', 'running', 'completed', 'cancelled')),
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prediction_experiments_type ON prediction_experiments(prediction_type);
CREATE INDEX idx_prediction_experiments_status ON prediction_experiments(status);

-- =====================================================
-- TABELA: ai_insights
-- Insights gerados pela IA
-- =====================================================
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  insight_type TEXT NOT NULL CHECK (insight_type IN ('pattern', 'anomaly', 'trend', 'recommendation', 'correlation')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  affected_cohort_id UUID REFERENCES population_cohorts(id) ON DELETE SET NULL,
  affected_patient_ids UUID[],
  
  severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
  
  confidence DECIMAL(5,4) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  supporting_data JSONB NOT NULL,
  visualizations JSONB,
  
  actionable_items TEXT[],
  
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'investigating', 'actioned', 'dismissed')),
  
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  
  generated_by_model TEXT NOT NULL,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  expires_at TIMESTAMPTZ
);

CREATE INDEX idx_ai_insights_type ON ai_insights(insight_type);
CREATE INDEX idx_ai_insights_severity ON ai_insights(severity);
CREATE INDEX idx_ai_insights_status ON ai_insights(status);
CREATE INDEX idx_ai_insights_date ON ai_insights(generated_at DESC);

-- =====================================================
-- TABELA: prediction_monitoring
-- Monitoramento de performance das predições
-- =====================================================
CREATE TABLE IF NOT EXISTS prediction_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  model_id UUID NOT NULL REFERENCES ml_models(id) ON DELETE CASCADE,
  
  monitoring_period_start DATE NOT NULL,
  monitoring_period_end DATE NOT NULL,
  
  total_predictions INTEGER NOT NULL,
  validated_predictions INTEGER NOT NULL,
  
  accuracy DECIMAL(5,4),
  precision_score DECIMAL(5,4),
  recall DECIMAL(5,4),
  
  false_positives INTEGER,
  false_negatives INTEGER,
  true_positives INTEGER,
  true_negatives INTEGER,
  
  avg_confidence DECIMAL(5,4),
  
  model_drift_detected BOOLEAN NOT NULL DEFAULT false,
  drift_severity TEXT CHECK (drift_severity IN ('none', 'low', 'medium', 'high')),
  
  recommendations TEXT[],
  
  needs_retraining BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_prediction_monitoring_model ON prediction_monitoring(model_id);
CREATE INDEX idx_prediction_monitoring_period ON prediction_monitoring(monitoring_period_start, monitoring_period_end);
CREATE INDEX idx_prediction_monitoring_drift ON prediction_monitoring(model_drift_detected);

-- =====================================================
-- TABELA: feature_engineering_history
-- Histórico de engenharia de features
-- =====================================================
CREATE TABLE IF NOT EXISTS feature_engineering_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  feature_name TEXT NOT NULL,
  feature_description TEXT NOT NULL,
  
  calculation_method TEXT NOT NULL,
  source_features TEXT[] NOT NULL,
  
  added_date DATE NOT NULL,
  added_by TEXT NOT NULL,
  
  impact_on_models JSONB,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  deprecated_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_feature_engineering_active ON feature_engineering_history(is_active);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Latest predictions by patient
CREATE OR REPLACE VIEW latest_patient_predictions AS
SELECT DISTINCT ON (patient_id, prediction_type)
  *
FROM ai_predictions
ORDER BY patient_id, prediction_type, created_at DESC;

-- View: High confidence predictions requiring action
CREATE OR REPLACE VIEW actionable_predictions AS
SELECT 
  p.*,
  pt.name as patient_name,
  array_length(p.recommendations, 1) as recommendation_count
FROM ai_predictions p
INNER JOIN patients pt ON p.patient_id = pt.id
WHERE p.confidence_level IN ('high', 'very_high')
  AND p.prediction_type IN ('dropout_risk', 'complication_risk', 'readmission_risk')
  AND p.validated = false
  AND p.created_at > NOW() - INTERVAL '30 days'
ORDER BY p.confidence_score DESC;

-- View: Model performance summary
CREATE OR REPLACE VIEW model_performance_summary AS
SELECT 
  m.model_name,
  m.prediction_type,
  m.version,
  m.is_production,
  COUNT(p.id) as total_predictions,
  AVG(p.confidence_score) as avg_confidence,
  COUNT(CASE WHEN p.validated AND p.was_accurate THEN 1 END)::decimal / 
    NULLIF(COUNT(CASE WHEN p.validated THEN 1 END), 0) as validation_accuracy
FROM ml_models m
LEFT JOIN ai_predictions p ON m.model_name = p.model_name AND m.version = p.model_version
WHERE m.is_active = true
GROUP BY m.id, m.model_name, m.prediction_type, m.version, m.is_production;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para calcular model drift
CREATE OR REPLACE FUNCTION detect_model_drift(p_model_id UUID, p_threshold DECIMAL)
RETURNS BOOLEAN AS $$
DECLARE
  v_recent_accuracy DECIMAL;
  v_baseline_accuracy DECIMAL;
  v_drift DECIMAL;
BEGIN
  -- Acurácia recente (últimos 30 dias)
  SELECT AVG(CASE WHEN was_accurate THEN 1.0 ELSE 0.0 END)
  INTO v_recent_accuracy
  FROM ai_predictions
  WHERE model_name = (SELECT model_name FROM ml_models WHERE id = p_model_id)
    AND validated = true
    AND created_at > NOW() - INTERVAL '30 days';
  
  -- Acurácia baseline do modelo
  SELECT accuracy
  INTO v_baseline_accuracy
  FROM ml_models
  WHERE id = p_model_id;
  
  IF v_recent_accuracy IS NULL OR v_baseline_accuracy IS NULL THEN
    RETURN false;
  END IF;
  
  v_drift := ABS(v_baseline_accuracy - v_recent_accuracy);
  
  RETURN v_drift > p_threshold;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar métricas do modelo
CREATE OR REPLACE FUNCTION update_model_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.validated = true AND NEW.was_accurate IS NOT NULL THEN
    -- Atualizar estatísticas do modelo
    -- Implementar lógica conforme necessário
    NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar métricas
CREATE TRIGGER trigger_update_model_metrics
  AFTER UPDATE ON ai_predictions
  FOR EACH ROW
  WHEN (NEW.validated = true AND OLD.validated = false)
  EXECUTE FUNCTION update_model_metrics();

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE ai_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ml_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Therapists can view predictions"
  ON ai_predictions FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

CREATE POLICY "Admins can manage models"
  ON ml_models FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'Admin'
  ));

-- =====================================================
-- COMMENTS: Documentação
-- =====================================================

COMMENT ON TABLE ai_predictions IS 'Predições geradas por modelos de IA/ML';
COMMENT ON TABLE ml_models IS 'Modelos de Machine Learning treinados';
COMMENT ON TABLE prediction_features IS 'Features individuais usadas nas predições';
COMMENT ON TABLE ai_insights IS 'Insights gerados automaticamente pela IA';
COMMENT ON TABLE prediction_monitoring IS 'Monitoramento de performance das predições';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



