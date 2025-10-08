-- =====================================================
-- MIGRATION: Nutritional Guidance Module
-- Data: 2025-10-08
-- Descrição: Módulo de Orientação Nutricional
-- =====================================================

-- Enum para objetivos nutricionais
CREATE TYPE nutritional_goal AS ENUM (
  'weight_loss',
  'weight_gain',
  'muscle_gain',
  'fat_loss',
  'maintenance',
  'recovery',
  'performance'
);

-- Enum para nível de atividade
CREATE TYPE activity_level AS ENUM (
  'sedentary',
  'light',
  'moderate',
  'active',
  'very_active'
);

-- =====================================================
-- TABELA: nutritional_assessments
-- Avaliações nutricionais
-- =====================================================
CREATE TABLE IF NOT EXISTS nutritional_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  assessment_date DATE NOT NULL,
  assessed_by TEXT NOT NULL,
  
  -- Antropometria
  weight DECIMAL(5,2) NOT NULL, -- kg
  height DECIMAL(5,2) NOT NULL, -- cm
  bmi DECIMAL(4,2) NOT NULL,
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_percentage DECIMAL(4,2),
  visceral_fat INTEGER,
  
  -- Circunferências
  waist_circumference DECIMAL(5,2), -- cm
  hip_circumference DECIMAL(5,2), -- cm
  waist_hip_ratio DECIMAL(4,3),
  
  -- Metabolismo
  bmr DECIMAL(6,2), -- Basal Metabolic Rate (kcal)
  tdee DECIMAL(6,2), -- Total Daily Energy Expenditure (kcal)
  
  -- Estilo de vida
  activity_level activity_level NOT NULL,
  
  -- Avaliação dietética
  current_caloric_intake DECIMAL(6,2),
  protein_intake DECIMAL(5,2), -- gramas/dia
  carb_intake DECIMAL(5,2),
  fat_intake DECIMAL(5,2),
  water_intake DECIMAL(5,2), -- litros/dia
  
  -- Deficiências identificadas
  nutritional_deficiencies TEXT[],
  
  -- Classificação
  nutritional_status TEXT NOT NULL CHECK (nutritional_status IN ('underweight', 'normal', 'overweight', 'obese_i', 'obese_ii', 'obese_iii')),
  
  -- Observações
  dietary_restrictions TEXT[],
  allergies TEXT[],
  preferences TEXT[],
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nutritional_assessments_patient ON nutritional_assessments(patient_id);
CREATE INDEX idx_nutritional_assessments_date ON nutritional_assessments(assessment_date DESC);

-- =====================================================
-- TABELA: nutritional_plans
-- Planos nutricionais personalizados
-- =====================================================
CREATE TABLE IF NOT EXISTS nutritional_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES nutritional_assessments(id) ON DELETE SET NULL,
  
  plan_start_date DATE NOT NULL,
  plan_end_date DATE,
  
  primary_goal nutritional_goal NOT NULL,
  secondary_goals nutritional_goal[],
  
  -- Metas calóricas
  target_calories DECIMAL(6,2) NOT NULL,
  target_protein DECIMAL(5,2) NOT NULL, -- gramas
  target_carbs DECIMAL(5,2) NOT NULL,
  target_fats DECIMAL(5,2) NOT NULL,
  target_water DECIMAL(5,2) NOT NULL, -- litros
  
  -- Macros em percentual
  protein_percentage INTEGER CHECK (protein_percentage >= 0 AND protein_percentage <= 100),
  carbs_percentage INTEGER CHECK (carbs_percentage >= 0 AND carbs_percentage <= 100),
  fats_percentage INTEGER CHECK (fats_percentage >= 0 AND fats_percentage <= 100),
  
  -- Refeições
  meals_per_day INTEGER NOT NULL CHECK (meals_per_day >= 3 AND meals_per_day <= 8),
  meal_timing JSONB, -- {breakfast: '08:00', lunch: '12:00', ...}
  
  -- Recomendações
  foods_to_include TEXT[] NOT NULL,
  foods_to_avoid TEXT[],
  supplements_recommended TEXT[],
  
  -- Hidratação
  hydration_schedule TEXT[],
  
  -- Integração com fisio
  pre_workout_nutrition TEXT,
  post_workout_nutrition TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nutritional_plans_patient ON nutritional_plans(patient_id);
CREATE INDEX idx_nutritional_plans_status ON nutritional_plans(status);

-- =====================================================
-- TABELA: body_composition_tracking
-- Acompanhamento de composição corporal
-- =====================================================
CREATE TABLE IF NOT EXISTS body_composition_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  measurement_date DATE NOT NULL,
  
  weight DECIMAL(5,2) NOT NULL,
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  bone_mass_kg DECIMAL(4,2),
  water_percentage DECIMAL(4,2),
  
  -- Circunferências
  chest_cm DECIMAL(5,2),
  waist_cm DECIMAL(5,2),
  hip_cm DECIMAL(5,2),
  arm_cm DECIMAL(5,2),
  thigh_cm DECIMAL(5,2),
  
  -- Fotos de progresso
  photo_front_url TEXT,
  photo_side_url TEXT,
  photo_back_url TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_measurement_date UNIQUE (patient_id, measurement_date)
);

CREATE INDEX idx_body_composition_patient ON body_composition_tracking(patient_id);
CREATE INDEX idx_body_composition_date ON body_composition_tracking(measurement_date DESC);

-- =====================================================
-- TABELA: meal_logs
-- Registro de refeições
-- =====================================================
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES nutritional_plans(id) ON DELETE SET NULL,
  
  meal_date DATE NOT NULL,
  meal_time TIME NOT NULL,
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack', 'pre_workout', 'post_workout')),
  
  foods_consumed JSONB NOT NULL, -- [{food: 'X', quantity: Y, unit: 'g'}]
  
  -- Macros calculados
  total_calories DECIMAL(6,2),
  total_protein DECIMAL(5,2),
  total_carbs DECIMAL(5,2),
  total_fats DECIMAL(5,2),
  
  water_ml INTEGER,
  
  -- Aderência ao plano
  adherence_score INTEGER CHECK (adherence_score >= 0 AND adherence_score <= 100),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_meal_logs_patient ON meal_logs(patient_id);
CREATE INDEX idx_meal_logs_date ON meal_logs(meal_date DESC);

-- =====================================================
-- TABELA: nutritional_recommendations
-- Recomendações nutricionais personalizadas
-- =====================================================
CREATE TABLE IF NOT EXISTS nutritional_recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  recommendation_type TEXT NOT NULL CHECK (recommendation_type IN ('meal_plan', 'supplement', 'hydration', 'timing', 'portion', 'food_swap', 'recipe')),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  
  rationale TEXT NOT NULL,
  expected_benefit TEXT NOT NULL,
  
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  
  implementation_tips TEXT[],
  
  -- Tracking
  implemented BOOLEAN NOT NULL DEFAULT false,
  implementation_date DATE,
  
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_nutritional_recommendations_patient ON nutritional_recommendations(patient_id);
CREATE INDEX idx_nutritional_recommendations_implemented ON nutritional_recommendations(implemented);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Latest body composition per patient
CREATE OR REPLACE VIEW latest_body_composition AS
SELECT DISTINCT ON (patient_id)
  *
FROM body_composition_tracking
ORDER BY patient_id, measurement_date DESC;

-- View: Nutritional adherence summary
CREATE OR REPLACE VIEW nutritional_adherence_summary AS
SELECT 
  patient_id,
  DATE_TRUNC('week', meal_date) as week,
  AVG(adherence_score) as avg_adherence,
  COUNT(*) as meals_logged,
  AVG(total_calories) as avg_calories
FROM meal_logs
WHERE meal_date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY patient_id, DATE_TRUNC('week', meal_date)
ORDER BY patient_id, week DESC;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE nutritional_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE nutritional_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Patients can manage own nutrition data"
  ON meal_logs FOR ALL
  USING (
    patient_id = (SELECT patient_id FROM users WHERE id = auth.uid()) OR
    auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta', 'Nutricionista'))
  );

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE nutritional_assessments IS 'Avaliações nutricionais (IMC, composição corporal, metabolismo)';
COMMENT ON TABLE nutritional_plans IS 'Planos nutricionais personalizados';
COMMENT ON TABLE body_composition_tracking IS 'Tracking de peso, medidas e composição corporal';
COMMENT ON TABLE meal_logs IS 'Registro de refeições e macros';
COMMENT ON TABLE nutritional_recommendations IS 'Recomendações nutricionais personalizadas';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


