-- =====================================================
-- MIGRATION: Geriatric Care Module
-- Data: 2025-10-08
-- Descrição: Módulo de Cuidados Geriátricos
-- =====================================================

-- Enum para escalas de avaliação
CREATE TYPE geriatric_scale AS ENUM (
  'morse_fall_scale',
  'berg_balance',
  'timed_up_go',
  'meem',
  'gds',
  'katz_index',
  'lawton_brody',
  'mini_nutritional'
);

-- Enum para nível de risco de queda
CREATE TYPE fall_risk_level AS ENUM (
  'no_risk',
  'low_risk',
  'moderate_risk',
  'high_risk'
);

-- =====================================================
-- TABELA: geriatric_assessments
-- Avaliações geriátricas completas
-- =====================================================
CREATE TABLE IF NOT EXISTS geriatric_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  assessment_date DATE NOT NULL,
  assessed_by TEXT NOT NULL,
  
  -- Escala de Morse (Risco de Quedas)
  morse_score INTEGER CHECK (morse_score >= 0 AND morse_score <= 125),
  fall_risk_level fall_risk_level,
  
  -- Berg Balance Scale
  berg_score INTEGER CHECK (berg_score >= 0 AND berg_score <= 56),
  
  -- Timed Up and Go
  tug_time DECIMAL(5,2), -- segundos
  tug_risk_level fall_risk_level,
  
  -- MEEM (Mini Exame do Estado Mental)
  meem_score INTEGER CHECK (meem_score >= 0 AND meem_score <= 30),
  cognitive_status TEXT CHECK (cognitive_status IN ('normal', 'mild_impairment', 'moderate_impairment', 'severe_impairment')),
  
  -- Escala de Depressão Geriátrica (GDS)
  gds_score INTEGER CHECK (gds_score >= 0 AND gds_score <= 15),
  depression_risk TEXT CHECK (depression_risk IN ('none', 'mild', 'moderate', 'severe')),
  
  -- Índice de Katz (AVD)
  katz_score INTEGER CHECK (katz_score >= 0 AND katz_score <= 6),
  independence_level TEXT CHECK (independence_level IN ('independent', 'partial', 'dependent')),
  
  -- Escala de Lawton-Brody (AIVD)
  lawton_score INTEGER CHECK (lawton_score >= 0 AND lawton_score <= 8),
  
  -- Mini Avaliação Nutricional
  mna_score DECIMAL(5,2) CHECK (mna_score >= 0 AND mna_score <= 30),
  nutritional_status TEXT CHECK (nutritional_status IN ('normal', 'risk', 'malnourished')),
  
  -- Observações
  overall_assessment TEXT NOT NULL,
  recommendations TEXT[],
  intervention_plan TEXT NOT NULL,
  
  -- Follow-up
  next_assessment_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_geriatric_assessments_patient ON geriatric_assessments(patient_id);
CREATE INDEX idx_geriatric_assessments_date ON geriatric_assessments(assessment_date DESC);
CREATE INDEX idx_geriatric_assessments_fall_risk ON geriatric_assessments(fall_risk_level);

-- =====================================================
-- TABELA: fall_prevention_plans
-- Planos de prevenção de quedas
-- =====================================================
CREATE TABLE IF NOT EXISTS fall_prevention_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES geriatric_assessments(id) ON DELETE SET NULL,
  
  plan_date DATE NOT NULL,
  created_by TEXT NOT NULL,
  
  -- Intervenções
  environmental_modifications TEXT[],
  assistive_devices TEXT[],
  exercise_program TEXT NOT NULL,
  medication_review_needed BOOLEAN NOT NULL DEFAULT false,
  vision_assessment_needed BOOLEAN NOT NULL DEFAULT false,
  
  -- Metas
  goals TEXT[] NOT NULL,
  timeline TEXT NOT NULL,
  
  -- Status
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  
  -- Revisão
  review_date DATE,
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_fall_prevention_plans_patient ON fall_prevention_plans(patient_id);
CREATE INDEX idx_fall_prevention_plans_status ON fall_prevention_plans(status);

-- =====================================================
-- TABELA: cognitive_training_sessions
-- Sessões de treino cognitivo
-- =====================================================
CREATE TABLE IF NOT EXISTS cognitive_training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('memory', 'attention', 'executive', 'language', 'visuospatial', 'multi_domain')),
  
  duration INTEGER NOT NULL, -- minutos
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  
  -- Métricas
  tasks_completed INTEGER NOT NULL,
  tasks_total INTEGER NOT NULL,
  accuracy_rate DECIMAL(5,2),
  reaction_time DECIMAL(10,2), -- milissegundos
  
  -- Feedback
  patient_feedback TEXT,
  therapist_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_cognitive_training_patient ON cognitive_training_sessions(patient_id);
CREATE INDEX idx_cognitive_training_date ON cognitive_training_sessions(session_date DESC);

-- =====================================================
-- TABELA: polypharmacy_reviews
-- Revisões de polifarmácia
-- =====================================================
CREATE TABLE IF NOT EXISTS polypharmacy_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  review_date DATE NOT NULL,
  reviewed_by TEXT NOT NULL,
  
  total_medications INTEGER NOT NULL,
  high_risk_medications TEXT[],
  potential_interactions TEXT[],
  
  fall_risk_medications TEXT[],
  cognitive_impact_medications TEXT[],
  
  recommendations TEXT[] NOT NULL,
  physician_referral_needed BOOLEAN NOT NULL DEFAULT false,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_polypharmacy_reviews_patient ON polypharmacy_reviews(patient_id);
CREATE INDEX idx_polypharmacy_reviews_date ON polypharmacy_reviews(review_date DESC);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: High risk elderly patients
CREATE OR REPLACE VIEW high_risk_elderly_patients AS
SELECT 
  p.id,
  p.full_name,
  p.birth_date,
  EXTRACT(YEAR FROM AGE(p.birth_date))::INTEGER as age,
  ga.fall_risk_level,
  ga.cognitive_status,
  ga.independence_level,
  ga.assessment_date
FROM patients p
INNER JOIN geriatric_assessments ga ON p.id = ga.patient_id
WHERE EXTRACT(YEAR FROM AGE(p.birth_date)) >= 65
  AND (
    ga.fall_risk_level IN ('high_risk', 'moderate_risk') OR
    ga.cognitive_status IN ('moderate_impairment', 'severe_impairment') OR
    ga.independence_level = 'dependent'
  )
ORDER BY 
  CASE ga.fall_risk_level
    WHEN 'high_risk' THEN 1
    WHEN 'moderate_risk' THEN 2
    ELSE 3
  END,
  ga.assessment_date DESC;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para calcular risco de queda pela Escala de Morse
CREATE OR REPLACE FUNCTION calculate_morse_fall_risk(p_score INTEGER)
RETURNS fall_risk_level AS $$
BEGIN
  RETURN CASE
    WHEN p_score >= 45 THEN 'high_risk'::fall_risk_level
    WHEN p_score >= 25 THEN 'moderate_risk'::fall_risk_level
    WHEN p_score > 0 THEN 'low_risk'::fall_risk_level
    ELSE 'no_risk'::fall_risk_level
  END;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE geriatric_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE fall_prevention_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view geriatric data"
  ON geriatric_assessments FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE geriatric_assessments IS 'Avaliações geriátricas completas (Morse, Berg, MEEM, etc)';
COMMENT ON TABLE fall_prevention_plans IS 'Planos personalizados de prevenção de quedas';
COMMENT ON TABLE cognitive_training_sessions IS 'Sessões de treinamento cognitivo';
COMMENT ON TABLE polypharmacy_reviews IS 'Revisões de polifarmácia (múltiplos medicamentos)';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================







