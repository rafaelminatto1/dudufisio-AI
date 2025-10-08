-- =====================================================
-- MIGRATION: Risk Stratification System
-- Data: 2025-10-08
-- Descrição: Tabelas para Sistema de Estratificação de Risco
-- =====================================================

-- Enum para tipos de risco
CREATE TYPE risk_type AS ENUM (
  'fall',
  'deconditioning',
  'abandonment',
  'no_show',
  'complication',
  'readmission',
  'chronic_pain',
  'functional_decline'
);

-- Enum para níveis de risco
CREATE TYPE risk_level AS ENUM (
  'low',
  'moderate',
  'high',
  'critical'
);

-- Enum para categoria de fator de risco
CREATE TYPE risk_factor_category AS ENUM (
  'demographic',
  'clinical',
  'behavioral',
  'social',
  'environmental'
);

-- Enum para categoria de recomendação
CREATE TYPE risk_recommendation_category AS ENUM (
  'prevention',
  'intervention',
  'monitoring'
);

-- Enum para prioridade
CREATE TYPE risk_priority AS ENUM (
  'low',
  'medium',
  'high'
);

-- =====================================================
-- TABELA: risk_assessments
-- Armazena avaliações de risco dos pacientes
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  risk_type risk_type NOT NULL,
  risk_level risk_level NOT NULL,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0 AND confidence <= 1),
  
  -- Metadados
  assessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assessed_by TEXT NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  
  -- Histórico
  previous_score DECIMAL(5,2),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'worsening')),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Índices
  CONSTRAINT unique_patient_risk_assessment UNIQUE (patient_id, risk_type, assessed_at)
);

-- Índices para performance
CREATE INDEX idx_risk_assessments_patient ON risk_assessments(patient_id);
CREATE INDEX idx_risk_assessments_type ON risk_assessments(risk_type);
CREATE INDEX idx_risk_assessments_level ON risk_assessments(risk_level);
CREATE INDEX idx_risk_assessments_date ON risk_assessments(assessed_at DESC);

-- =====================================================
-- TABELA: risk_factors
-- Fatores individuais que contribuem para o risco
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_factors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  category risk_factor_category NOT NULL,
  value JSONB NOT NULL, -- Pode ser número, boolean, string, etc.
  weight DECIMAL(3,2) NOT NULL CHECK (weight >= 0 AND weight <= 1),
  contribution DECIMAL(5,2) NOT NULL CHECK (contribution >= 0 AND contribution <= 100),
  
  description TEXT,
  is_modifiable BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_factors_assessment ON risk_factors(assessment_id);
CREATE INDEX idx_risk_factors_category ON risk_factors(category);

-- =====================================================
-- TABELA: risk_recommendations
-- Recomendações geradas para cada avaliação
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assessment_id UUID NOT NULL REFERENCES risk_assessments(id) ON DELETE CASCADE,
  
  priority risk_priority NOT NULL,
  action TEXT NOT NULL,
  rationale TEXT NOT NULL,
  target_factors UUID[] NOT NULL, -- Array de IDs de fatores
  estimated_impact INTEGER NOT NULL CHECK (estimated_impact >= 0 AND estimated_impact <= 100),
  category risk_recommendation_category NOT NULL,
  
  -- Atribuição e prazo
  assigned_to TEXT,
  due_date TIMESTAMPTZ,
  
  -- Status
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  completed_by TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_recommendations_assessment ON risk_recommendations(assessment_id);
CREATE INDEX idx_risk_recommendations_priority ON risk_recommendations(priority);
CREATE INDEX idx_risk_recommendations_completed ON risk_recommendations(completed);

-- =====================================================
-- TABELA: risk_profiles
-- Perfil de risco completo do paciente
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  
  overall_risk_level risk_level NOT NULL,
  highest_risks risk_type[] NOT NULL,
  
  last_assessment_date TIMESTAMPTZ NOT NULL,
  next_assessment_due TIMESTAMPTZ NOT NULL,
  
  -- Metadados
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_profiles_patient ON risk_profiles(patient_id);
CREATE INDEX idx_risk_profiles_level ON risk_profiles(overall_risk_level);

-- =====================================================
-- TABELA: risk_alerts
-- Alertas gerados para riscos altos/críticos
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  assessment_id UUID REFERENCES risk_assessments(id) ON DELETE SET NULL,
  
  risk_type risk_type NOT NULL,
  risk_level risk_level NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Status
  acknowledged BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by TEXT,
  acknowledged_at TIMESTAMPTZ,
  
  resolved BOOLEAN NOT NULL DEFAULT false,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_alerts_patient ON risk_alerts(patient_id);
CREATE INDEX idx_risk_alerts_acknowledged ON risk_alerts(acknowledged);
CREATE INDEX idx_risk_alerts_resolved ON risk_alerts(resolved);
CREATE INDEX idx_risk_alerts_date ON risk_alerts(triggered_at DESC);

-- =====================================================
-- TABELA: risk_alert_actions
-- Ações tomadas em resposta a alertas
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_alert_actions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id UUID NOT NULL REFERENCES risk_alerts(id) ON DELETE CASCADE,
  
  action TEXT NOT NULL,
  performed_by TEXT NOT NULL,
  performed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT
);

CREATE INDEX idx_risk_alert_actions_alert ON risk_alert_actions(alert_id);

-- =====================================================
-- TABELA: risk_intervention_plans
-- Planos de intervenção para redução de risco
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_intervention_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  target_risks risk_type[] NOT NULL,
  
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL,
  review_date TIMESTAMPTZ NOT NULL,
  
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_intervention_plans_patient ON risk_intervention_plans(patient_id);
CREATE INDEX idx_risk_intervention_plans_status ON risk_intervention_plans(status);

-- =====================================================
-- TABELA: risk_interventions
-- Intervenções específicas do plano
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_interventions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES risk_intervention_plans(id) ON DELETE CASCADE,
  
  intervention_type TEXT NOT NULL CHECK (intervention_type IN ('education', 'exercise', 'medication', 'environmental', 'behavioral')),
  description TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  target_risk_factors UUID[] NOT NULL,
  
  assigned_to TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('planned', 'in_progress', 'completed')),
  
  effectiveness INTEGER CHECK (effectiveness >= 0 AND effectiveness <= 100),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_interventions_plan ON risk_interventions(plan_id);
CREATE INDEX idx_risk_interventions_status ON risk_interventions(status);

-- =====================================================
-- TABELA: risk_goals
-- Metas de redução de risco
-- =====================================================
CREATE TABLE IF NOT EXISTS risk_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES risk_intervention_plans(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  target_risk_type risk_type NOT NULL,
  target_reduction INTEGER NOT NULL CHECK (target_reduction >= 0 AND target_reduction <= 100),
  
  deadline TIMESTAMPTZ NOT NULL,
  
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_risk_goals_plan ON risk_goals(plan_id);
CREATE INDEX idx_risk_goals_achieved ON risk_goals(achieved);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Latest assessments por paciente
CREATE OR REPLACE VIEW latest_risk_assessments AS
SELECT DISTINCT ON (patient_id, risk_type)
  *
FROM risk_assessments
ORDER BY patient_id, risk_type, assessed_at DESC;

-- View: High risk patients
CREATE OR REPLACE VIEW high_risk_patients AS
SELECT DISTINCT
  p.id,
  p.name,
  p.email,
  p.phone,
  rp.overall_risk_level,
  rp.highest_risks,
  rp.last_assessment_date
FROM patients p
INNER JOIN risk_profiles rp ON p.id = rp.patient_id
WHERE rp.overall_risk_level IN ('high', 'critical')
ORDER BY 
  CASE rp.overall_risk_level
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
  END,
  rp.last_assessment_date DESC;

-- View: Active alerts
CREATE OR REPLACE VIEW active_risk_alerts AS
SELECT 
  ra.*,
  p.name as patient_name,
  p.email as patient_email
FROM risk_alerts ra
INNER JOIN patients p ON ra.patient_id = p.id
WHERE ra.resolved = false
ORDER BY 
  CASE ra.risk_level
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'moderate' THEN 3
    WHEN 'low' THEN 4
  END,
  ra.triggered_at DESC;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para calcular overall risk level
CREATE OR REPLACE FUNCTION calculate_overall_risk_level(p_patient_id UUID)
RETURNS risk_level AS $$
DECLARE
  v_highest_level risk_level;
BEGIN
  SELECT MAX(
    CASE risk_level
      WHEN 'critical' THEN 4
      WHEN 'high' THEN 3
      WHEN 'moderate' THEN 2
      WHEN 'low' THEN 1
    END
  )
  INTO v_highest_level
  FROM latest_risk_assessments
  WHERE patient_id = p_patient_id;
  
  RETURN CASE v_highest_level
    WHEN 4 THEN 'critical'::risk_level
    WHEN 3 THEN 'high'::risk_level
    WHEN 2 THEN 'moderate'::risk_level
    ELSE 'low'::risk_level
  END;
END;
$$ LANGUAGE plpgsql;

-- Função para atualizar perfil de risco automaticamente
CREATE OR REPLACE FUNCTION update_risk_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO risk_profiles (
    patient_id,
    overall_risk_level,
    highest_risks,
    last_assessment_date,
    next_assessment_due
  )
  VALUES (
    NEW.patient_id,
    calculate_overall_risk_level(NEW.patient_id),
    ARRAY[NEW.risk_type],
    NEW.assessed_at,
    NEW.assessed_at + INTERVAL '30 days'
  )
  ON CONFLICT (patient_id) DO UPDATE SET
    overall_risk_level = calculate_overall_risk_level(NEW.patient_id),
    highest_risks = (
      SELECT array_agg(DISTINCT risk_type)
      FROM latest_risk_assessments
      WHERE patient_id = NEW.patient_id
        AND risk_level IN ('high', 'critical')
    ),
    last_assessment_date = NEW.assessed_at,
    next_assessment_due = NEW.assessed_at + INTERVAL '30 days',
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar perfil de risco
CREATE TRIGGER trigger_update_risk_profile
  AFTER INSERT OR UPDATE ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION update_risk_profile();

-- Função para criar alerta automaticamente
CREATE OR REPLACE FUNCTION create_risk_alert()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.risk_level IN ('high', 'critical') THEN
    INSERT INTO risk_alerts (
      patient_id,
      patient_name,
      assessment_id,
      risk_type,
      risk_level,
      score
    )
    VALUES (
      NEW.patient_id,
      NEW.patient_name,
      NEW.id,
      NEW.risk_type,
      NEW.risk_level,
      NEW.score
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar alertas
CREATE TRIGGER trigger_create_risk_alert
  AFTER INSERT ON risk_assessments
  FOR EACH ROW
  EXECUTE FUNCTION create_risk_alert();

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

-- Enable RLS
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_factors ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_intervention_plans ENABLE ROW LEVEL SECURITY;

-- Policies (exemplo básico - ajustar conforme necessidade)
CREATE POLICY "Users can view their own patient risk data"
  ON risk_assessments FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

CREATE POLICY "Therapists can insert risk assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

-- =====================================================
-- SAMPLE DATA (opcional - remover em produção)
-- =====================================================

-- Comentado para não inserir dados de exemplo
-- INSERT INTO risk_assessments (patient_id, patient_name, risk_type, risk_level, score, confidence, assessed_by, valid_until)
-- VALUES ...

-- =====================================================
-- COMMENTS: Documentação das tabelas
-- =====================================================

COMMENT ON TABLE risk_assessments IS 'Avaliações de risco dos pacientes';
COMMENT ON TABLE risk_factors IS 'Fatores individuais que contribuem para o risco';
COMMENT ON TABLE risk_recommendations IS 'Recomendações geradas para cada avaliação';
COMMENT ON TABLE risk_profiles IS 'Perfil de risco completo do paciente';
COMMENT ON TABLE risk_alerts IS 'Alertas gerados para riscos altos/críticos';
COMMENT ON TABLE risk_intervention_plans IS 'Planos de intervenção para redução de risco';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

