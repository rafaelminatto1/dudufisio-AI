-- =====================================================
-- MIGRATION: Quality Assurance and Compliance System
-- Data: 2025-10-08
-- Descrição: Tabelas para Garantia de Qualidade e Compliance
-- =====================================================

-- Enum para tipos de auditoria
CREATE TYPE audit_type AS ENUM (
  'comprehensive',
  'documentation',
  'clinical_practice',
  'lgpd_compliance',
  'coffito_compliance',
  'patient_safety',
  'financial',
  'operational'
);

-- Enum para status de compliance
CREATE TYPE compliance_status AS ENUM (
  'compliant',
  'minor_issues',
  'major_issues',
  'non_compliant',
  'under_review'
);

-- Enum para severidade de issue
CREATE TYPE issue_severity AS ENUM (
  'info',
  'low',
  'medium',
  'high',
  'critical'
);

-- =====================================================
-- TABELA: compliance_audits
-- Auditorias de compliance
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  audit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audit_type audit_type NOT NULL,
  
  scope TEXT NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  compliance_score INTEGER NOT NULL CHECK (compliance_score >= 0 AND compliance_score <= 100),
  compliance_status compliance_status NOT NULL,
  
  -- Áreas verificadas
  areas_checked TEXT[] NOT NULL,
  
  -- Resultados
  issues_found INTEGER NOT NULL DEFAULT 0,
  critical_issues INTEGER NOT NULL DEFAULT 0,
  major_issues INTEGER NOT NULL DEFAULT 0,
  minor_issues INTEGER NOT NULL DEFAULT 0,
  warnings INTEGER NOT NULL DEFAULT 0,
  
  -- Achados detalhados
  findings JSONB NOT NULL,
  
  -- Recomendações
  recommendations TEXT[] NOT NULL,
  action_items TEXT[],
  
  -- Próxima auditoria
  next_audit_date TIMESTAMPTZ NOT NULL,
  
  audited_by TEXT NOT NULL,
  reviewed_by TEXT,
  approved_by TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_audits_date ON compliance_audits(audit_date DESC);
CREATE INDEX idx_compliance_audits_type ON compliance_audits(audit_type);
CREATE INDEX idx_compliance_audits_status ON compliance_audits(compliance_status);
CREATE INDEX idx_compliance_audits_score ON compliance_audits(compliance_score);

-- =====================================================
-- TABELA: compliance_issues
-- Issues de compliance identificadas
-- =====================================================
CREATE TABLE IF NOT EXISTS compliance_issues (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  audit_id UUID NOT NULL REFERENCES compliance_audits(id) ON DELETE CASCADE,
  
  issue_type TEXT NOT NULL,
  area TEXT NOT NULL,
  severity issue_severity NOT NULL,
  
  description TEXT NOT NULL,
  impact TEXT NOT NULL,
  
  regulation_violated TEXT,
  standard_violated TEXT,
  
  evidence JSONB,
  affected_records UUID[],
  
  recommended_action TEXT NOT NULL,
  required_by_date TIMESTAMPTZ,
  
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'accepted_risk')),
  
  assigned_to TEXT,
  resolved_date TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_compliance_issues_audit ON compliance_issues(audit_id);
CREATE INDEX idx_compliance_issues_severity ON compliance_issues(severity);
CREATE INDEX idx_compliance_issues_status ON compliance_issues(status);

-- =====================================================
-- TABELA: quality_metrics
-- Métricas de qualidade
-- =====================================================
CREATE TABLE IF NOT EXISTS quality_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  metric_date DATE NOT NULL,
  
  -- Métricas de documentação
  total_sessions INTEGER NOT NULL,
  documented_sessions INTEGER NOT NULL,
  documentation_rate DECIMAL(5,2) NOT NULL,
  avg_documentation_time INTEGER, -- minutos
  documentation_quality_score DECIMAL(3,2),
  
  -- Métricas de atendimento
  avg_session_duration INTEGER, -- minutos
  sessions_on_time INTEGER,
  sessions_delayed INTEGER,
  sessions_cancelled INTEGER,
  
  -- Métricas de satisfação
  patient_satisfaction_score DECIMAL(3,2),
  nps_score INTEGER,
  complaints_received INTEGER,
  compliments_received INTEGER,
  
  -- Métricas de outcome
  treatment_adherence_rate DECIMAL(5,2),
  goal_achievement_rate DECIMAL(5,2),
  avg_improvement_score DECIMAL(3,2),
  readmission_rate DECIMAL(5,2),
  
  -- Métricas de segurança
  adverse_events INTEGER DEFAULT 0,
  near_miss_events INTEGER DEFAULT 0,
  safety_incidents INTEGER DEFAULT 0,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quality_metrics_date ON quality_metrics(metric_date DESC);

-- =====================================================
-- TABELA: quality_indicators
-- Indicadores de qualidade (KPIs)
-- =====================================================
CREATE TABLE IF NOT EXISTS quality_indicators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  indicator_name TEXT NOT NULL UNIQUE,
  indicator_category TEXT NOT NULL CHECK (indicator_category IN ('clinical', 'operational', 'financial', 'satisfaction', 'safety')),
  
  description TEXT NOT NULL,
  calculation_method TEXT NOT NULL,
  
  target_value DECIMAL(10,2) NOT NULL,
  warning_threshold DECIMAL(10,2) NOT NULL,
  critical_threshold DECIMAL(10,2) NOT NULL,
  
  unit TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly', 'annual')),
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  responsible_role TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_quality_indicators_category ON quality_indicators(indicator_category);
CREATE INDEX idx_quality_indicators_active ON quality_indicators(is_active);

-- =====================================================
-- TABELA: quality_measurements
-- Medições dos indicadores de qualidade
-- =====================================================
CREATE TABLE IF NOT EXISTS quality_measurements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  indicator_id UUID NOT NULL REFERENCES quality_indicators(id) ON DELETE CASCADE,
  
  measurement_date DATE NOT NULL,
  measured_value DECIMAL(10,2) NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('on_target', 'warning', 'critical')),
  
  variance_from_target DECIMAL(10,2),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  
  notes TEXT,
  measured_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_indicator_date UNIQUE (indicator_id, measurement_date)
);

CREATE INDEX idx_quality_measurements_indicator ON quality_measurements(indicator_id);
CREATE INDEX idx_quality_measurements_date ON quality_measurements(measurement_date DESC);
CREATE INDEX idx_quality_measurements_status ON quality_measurements(status);

-- =====================================================
-- TABELA: documentation_audits
-- Auditorias de documentação clínica
-- =====================================================
CREATE TABLE IF NOT EXISTS documentation_audits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  audit_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  audited_by TEXT NOT NULL,
  
  -- Critérios de qualidade
  has_soap_note BOOLEAN NOT NULL,
  soap_complete BOOLEAN NOT NULL,
  has_objectives BOOLEAN NOT NULL,
  has_interventions BOOLEAN NOT NULL,
  has_outcomes BOOLEAN NOT NULL,
  has_plan BOOLEAN NOT NULL,
  has_signature BOOLEAN NOT NULL,
  
  -- Conformidade
  meets_coffito_standards BOOLEAN NOT NULL,
  meets_lgpd_requirements BOOLEAN NOT NULL,
  
  -- Score
  documentation_score INTEGER NOT NULL CHECK (documentation_score >= 0 AND documentation_score <= 100),
  
  issues_found TEXT[],
  recommendations TEXT[],
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_documentation_audits_session ON documentation_audits(session_id);
CREATE INDEX idx_documentation_audits_patient ON documentation_audits(patient_id);
CREATE INDEX idx_documentation_audits_score ON documentation_audits(documentation_score);
CREATE INDEX idx_documentation_audits_date ON documentation_audits(audit_date DESC);

-- =====================================================
-- TABELA: clinical_practice_reviews
-- Revisões de prática clínica
-- =====================================================
CREATE TABLE IF NOT EXISTS clinical_practice_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  
  total_sessions_reviewed INTEGER NOT NULL,
  
  -- Aderência a protocolos
  protocol_adherence_rate DECIMAL(5,2),
  evidence_based_practice_rate DECIMAL(5,2),
  
  -- Outcomes
  avg_patient_improvement DECIMAL(5,2),
  goal_achievement_rate DECIMAL(5,2),
  patient_satisfaction DECIMAL(3,2),
  
  -- Áreas de excelência
  strengths TEXT[],
  
  -- Áreas de melhoria
  areas_for_improvement TEXT[],
  development_recommendations TEXT[],
  
  overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
  
  reviewed_by TEXT NOT NULL,
  reviewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  follow_up_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clinical_practice_reviews_therapist ON clinical_practice_reviews(therapist_id);
CREATE INDEX idx_clinical_practice_reviews_period ON clinical_practice_reviews(review_period_start, review_period_end);

-- =====================================================
-- TABELA: patient_safety_events
-- Eventos de segurança do paciente
-- =====================================================
CREATE TABLE IF NOT EXISTS patient_safety_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  event_type TEXT NOT NULL CHECK (event_type IN ('adverse_event', 'near_miss', 'sentinel_event', 'complaint')),
  event_date TIMESTAMPTZ NOT NULL,
  
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  reported_by TEXT NOT NULL,
  
  severity issue_severity NOT NULL,
  
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  
  contributing_factors TEXT[],
  immediate_actions_taken TEXT[],
  
  harm_level TEXT NOT NULL CHECK (harm_level IN ('none', 'minor', 'moderate', 'major', 'catastrophic')),
  
  status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'investigating', 'resolved', 'closed')),
  
  investigation_findings TEXT,
  root_causes TEXT[],
  corrective_actions TEXT[],
  preventive_actions TEXT[],
  
  investigated_by TEXT,
  investigation_date TIMESTAMPTZ,
  
  lessons_learned TEXT[],
  
  reported_to_authorities BOOLEAN NOT NULL DEFAULT false,
  authority_notification_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_patient_safety_events_type ON patient_safety_events(event_type);
CREATE INDEX idx_patient_safety_events_severity ON patient_safety_events(severity);
CREATE INDEX idx_patient_safety_events_status ON patient_safety_events(status);
CREATE INDEX idx_patient_safety_events_date ON patient_safety_events(event_date DESC);

-- =====================================================
-- TABELA: corrective_action_plans
-- Planos de ação corretiva
-- =====================================================
CREATE TABLE IF NOT EXISTS corrective_action_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  related_issue_id UUID, -- Pode ser compliance_issue ou safety_event
  related_issue_type TEXT CHECK (related_issue_type IN ('compliance', 'safety', 'quality')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  root_cause TEXT NOT NULL,
  
  actions TEXT[] NOT NULL,
  responsible_parties TEXT[] NOT NULL,
  
  start_date DATE NOT NULL,
  target_completion_date DATE NOT NULL,
  actual_completion_date DATE,
  
  status TEXT NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'delayed', 'cancelled')),
  
  effectiveness_verified BOOLEAN DEFAULT false,
  effectiveness_verification_date DATE,
  verification_notes TEXT,
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_corrective_action_plans_status ON corrective_action_plans(status);
CREATE INDEX idx_corrective_action_plans_dates ON corrective_action_plans(target_completion_date);

-- =====================================================
-- TABELA: regulatory_requirements
-- Requisitos regulatórios
-- =====================================================
CREATE TABLE IF NOT EXISTS regulatory_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  requirement_id TEXT NOT NULL UNIQUE,
  regulation_name TEXT NOT NULL,
  regulation_body TEXT NOT NULL CHECK (regulation_body IN ('COFFITO', 'ANVISA', 'LGPD', 'CFM', 'other')),
  
  requirement_title TEXT NOT NULL,
  requirement_description TEXT NOT NULL,
  
  category TEXT NOT NULL,
  applicable_to TEXT[] NOT NULL,
  
  compliance_criteria TEXT[] NOT NULL,
  evidence_required TEXT[],
  
  effective_date DATE NOT NULL,
  review_frequency TEXT NOT NULL,
  
  is_mandatory BOOLEAN NOT NULL DEFAULT true,
  
  references TEXT[],
  official_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regulatory_requirements_body ON regulatory_requirements(regulation_body);

-- =====================================================
-- TABELA: requirement_compliance_status
-- Status de conformidade com requisitos
-- =====================================================
CREATE TABLE IF NOT EXISTS requirement_compliance_status (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requirement_id UUID NOT NULL REFERENCES regulatory_requirements(id) ON DELETE CASCADE,
  
  assessment_date DATE NOT NULL,
  compliance_status compliance_status NOT NULL,
  
  compliance_percentage INTEGER CHECK (compliance_percentage >= 0 AND compliance_percentage <= 100),
  
  evidence_provided TEXT[],
  gaps_identified TEXT[],
  
  action_plan_id UUID REFERENCES corrective_action_plans(id) ON DELETE SET NULL,
  
  assessed_by TEXT NOT NULL,
  notes TEXT,
  
  next_assessment_date DATE NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_requirement_compliance_requirement ON requirement_compliance_status(requirement_id);
CREATE INDEX idx_requirement_compliance_status ON requirement_compliance_status(compliance_status);
CREATE INDEX idx_requirement_compliance_date ON requirement_compliance_status(assessment_date DESC);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Current compliance overview
CREATE OR REPLACE VIEW current_compliance_overview AS
SELECT DISTINCT ON (audit_type)
  audit_type,
  audit_date,
  compliance_score,
  compliance_status,
  issues_found,
  critical_issues
FROM compliance_audits
ORDER BY audit_type, audit_date DESC;

-- View: Open critical issues
CREATE OR REPLACE VIEW open_critical_issues AS
SELECT 
  ci.*,
  ca.audit_type,
  ca.audit_date
FROM compliance_issues ci
INNER JOIN compliance_audits ca ON ci.audit_id = ca.id
WHERE ci.status IN ('open', 'in_progress')
  AND ci.severity IN ('high', 'critical')
ORDER BY 
  CASE ci.severity
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
  END,
  ci.created_at;

-- View: Quality indicators performance
CREATE OR REPLACE VIEW quality_indicators_performance AS
SELECT 
  qi.indicator_name,
  qi.indicator_category,
  qi.target_value,
  qm.measured_value as latest_value,
  qm.measurement_date as latest_measurement,
  qm.status,
  qm.trend
FROM quality_indicators qi
LEFT JOIN LATERAL (
  SELECT *
  FROM quality_measurements
  WHERE indicator_id = qi.id
  ORDER BY measurement_date DESC
  LIMIT 1
) qm ON true
WHERE qi.is_active = true
ORDER BY qm.status DESC, qi.indicator_category;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para calcular compliance score
CREATE OR REPLACE FUNCTION calculate_compliance_score(
  p_total_checks INTEGER,
  p_passed_checks INTEGER,
  p_critical_failures INTEGER
)
RETURNS INTEGER AS $$
BEGIN
  IF p_critical_failures > 0 THEN
    RETURN GREATEST(0, (p_passed_checks::decimal / p_total_checks * 100) - (p_critical_failures * 10))::INTEGER;
  ELSE
    RETURN (p_passed_checks::decimal / p_total_checks * 100)::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Função para auto-atualizar quality metrics
CREATE OR REPLACE FUNCTION calculate_daily_quality_metrics()
RETURNS void AS $$
BEGIN
  -- Implementar cálculo automático de métricas
  -- Exemplo: documentação rate, satisfaction score, etc.
  NULL;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE compliance_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE quality_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_safety_events ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all audits"
  ON compliance_audits FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'Admin'
  ));

CREATE POLICY "Admins can manage compliance"
  ON compliance_audits FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role = 'Admin'
  ));

-- =====================================================
-- COMMENTS: Documentação
-- =====================================================

COMMENT ON TABLE compliance_audits IS 'Auditorias de compliance e conformidade';
COMMENT ON TABLE compliance_issues IS 'Issues de compliance identificadas';
COMMENT ON TABLE quality_metrics IS 'Métricas de qualidade agregadas';
COMMENT ON TABLE quality_indicators IS 'Indicadores de qualidade (KPIs)';
COMMENT ON TABLE patient_safety_events IS 'Eventos de segurança do paciente';
COMMENT ON TABLE corrective_action_plans IS 'Planos de ação corretiva';
COMMENT ON TABLE regulatory_requirements IS 'Requisitos regulatórios (COFFITO, LGPD, etc)';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



