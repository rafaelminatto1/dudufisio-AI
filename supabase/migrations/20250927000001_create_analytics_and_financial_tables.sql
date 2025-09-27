-- Migração: Tabelas para Analytics AI, Dashboard Financeiro e Analytics Clínicos
-- Data: 2025-09-27

BEGIN;

-- Tabela para previsões de IA
CREATE TABLE IF NOT EXISTS ai_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  prediction_type TEXT NOT NULL, -- 'demand', 'revenue', 'no_show', 'patient_outcome'
  target_date DATE NOT NULL,
  predicted_value NUMERIC(15,2),
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  factors JSONB, -- fatores que influenciaram a previsão
  actual_value NUMERIC(15,2), -- valor real quando disponível
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ai_predictions_type_date
  ON ai_predictions(prediction_type, target_date);

-- Tabela para insights de pacientes gerados por IA
CREATE TABLE IF NOT EXISTS patient_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL, -- 'risk_assessment', 'treatment_recommendation', 'engagement_score'
  title TEXT NOT NULL,
  description TEXT,
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  recommendations JSONB,
  metadata JSONB DEFAULT '{}'::jsonb,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_insights_patient_status
  ON patient_insights(patient_id, status);

-- Tabela para efetividade de tratamentos
CREATE TABLE IF NOT EXISTS treatment_effectiveness (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  treatment_type TEXT NOT NULL,
  protocol_id UUID, -- referência para protocolos futuros
  start_date DATE NOT NULL,
  end_date DATE,
  initial_pain_level INTEGER CHECK (initial_pain_level BETWEEN 0 AND 10),
  final_pain_level INTEGER CHECK (final_pain_level BETWEEN 0 AND 10),
  sessions_completed INTEGER DEFAULT 0,
  sessions_planned INTEGER,
  outcome_score NUMERIC(4,2), -- 0-100
  success_rate NUMERIC(4,3) CHECK (success_rate BETWEEN 0 AND 1),
  patient_satisfaction INTEGER CHECK (patient_satisfaction BETWEEN 1 AND 10),
  notes TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_effectiveness_outcome
  ON treatment_effectiveness(treatment_type, outcome_score);

-- Tabela para métodos de pagamento
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'cash', 'insurance'
  provider TEXT, -- 'visa', 'mastercard', 'pix', etc.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  processing_fee_percentage NUMERIC(5,4) DEFAULT 0,
  processing_fee_fixed NUMERIC(10,2) DEFAULT 0,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para alertas financeiros
CREATE TABLE IF NOT EXISTS financial_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  alert_type TEXT NOT NULL, -- 'overdue_payment', 'low_cash_flow', 'revenue_drop', 'high_refund_rate'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT,
  amount NUMERIC(15,2),
  threshold_value NUMERIC(15,2),
  current_value NUMERIC(15,2),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_financial_alerts_status
  ON financial_alerts(status, severity, created_at);

-- Tabela para pagamentos recorrentes
CREATE TABLE IF NOT EXISTS recurrent_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  clinic_id UUID,
  payment_method_id UUID REFERENCES payment_methods(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  frequency TEXT NOT NULL, -- 'weekly', 'monthly', 'quarterly'
  frequency_interval INTEGER DEFAULT 1,
  start_date DATE NOT NULL,
  end_date DATE,
  next_payment_date DATE,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'paused', 'cancelled', 'completed'
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recurrent_payments_next_date
  ON recurrent_payments(next_payment_date, status);

-- Tabela para metas financeiras
CREATE TABLE IF NOT EXISTS financial_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  goal_type TEXT NOT NULL, -- 'revenue', 'profit', 'patients', 'sessions'
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC(15,2) NOT NULL,
  current_value NUMERIC(15,2) DEFAULT 0,
  target_date DATE NOT NULL,
  period TEXT NOT NULL, -- 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'achieved', 'missed', 'cancelled'
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  achieved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela para previsões de fluxo de caixa
CREATE TABLE IF NOT EXISTS cash_flow_predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  prediction_date DATE NOT NULL,
  predicted_inflow NUMERIC(15,2) DEFAULT 0,
  predicted_outflow NUMERIC(15,2) DEFAULT 0,
  net_prediction NUMERIC(15,2) DEFAULT 0,
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  factors JSONB, -- fatores considerados na previsão
  actual_inflow NUMERIC(15,2), -- valores reais quando disponíveis
  actual_outflow NUMERIC(15,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cash_flow_predictions_date
  ON cash_flow_predictions(prediction_date);

-- Tabela para métricas clínicas
CREATE TABLE IF NOT EXISTS clinical_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID,
  metric_type TEXT NOT NULL, -- 'pain_reduction', 'functional_improvement', 'treatment_duration'
  metric_name TEXT NOT NULL,
  value NUMERIC(10,4) NOT NULL,
  unit TEXT, -- '%', 'days', 'sessions', etc.
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  therapist_id UUID REFERENCES users(id) ON DELETE SET NULL,
  treatment_type TEXT,
  patient_count INTEGER,
  benchmark_value NUMERIC(10,4), -- valor de referência/benchmark
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_metrics_type_period
  ON clinical_metrics(metric_type, period_start, period_end);

-- Tabela para resultados de tratamento
CREATE TABLE IF NOT EXISTS treatment_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  treatment_effectiveness_id UUID REFERENCES treatment_effectiveness(id) ON DELETE SET NULL,
  outcome_type TEXT NOT NULL, -- 'discharge', 'improvement', 'maintenance', 'worsening'
  measurement_date DATE NOT NULL,
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  functional_score INTEGER CHECK (functional_score BETWEEN 0 AND 100),
  range_of_motion JSONB, -- medições de amplitude de movimento
  strength_assessment JSONB, -- avaliações de força
  quality_of_life_score INTEGER CHECK (quality_of_life_score BETWEEN 0 AND 100),
  patient_satisfaction INTEGER CHECK (patient_satisfaction BETWEEN 1 AND 10),
  therapist_notes TEXT,
  objective_measures JSONB, -- medidas objetivas específicas
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatment_outcomes_patient_date
  ON treatment_outcomes(patient_id, measurement_date);

-- Tabela para segmentação de pacientes
CREATE TABLE IF NOT EXISTS patient_segmentation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  segment_type TEXT NOT NULL, -- 'risk_level', 'treatment_response', 'engagement', 'demographics'
  segment_value TEXT NOT NULL, -- 'high_risk', 'excellent_response', 'highly_engaged', etc.
  confidence_score NUMERIC(4,3) CHECK (confidence_score BETWEEN 0 AND 1),
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_date DATE,
  criteria JSONB, -- critérios usados para a segmentação
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_segmentation_type_value
  ON patient_segmentation(segment_type, segment_value);

-- Tabela para alertas clínicos
CREATE TABLE IF NOT EXISTS clinical_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  alert_type TEXT NOT NULL, -- 'treatment_plateau', 'missed_sessions', 'pain_increase', 'protocol_deviation'
  severity TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  title TEXT NOT NULL,
  description TEXT,
  recommendations TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  due_date DATE,
  metadata JSONB DEFAULT '{}'::jsonb,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clinical_alerts_status_severity
  ON clinical_alerts(status, severity, created_at);

-- Atualizar tabela de usuários para suportar roles expandidos
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'therapist',
  ADD COLUMN IF NOT EXISTS permissions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS profile_settings JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Criar índice para roles
CREATE INDEX IF NOT EXISTS idx_users_role_active
  ON users(role, is_active);

COMMIT;