-- =====================================================
-- MIGRATION: Mental Health Integration Module
-- Data: 2025-10-08
-- Descrição: Integração com Saúde Mental
-- =====================================================

-- Enum para tipos de questionário
CREATE TYPE mental_health_scale AS ENUM (
  'had_scale',      -- Hospital Anxiety and Depression Scale
  'phq9',           -- Patient Health Questionnaire-9
  'gad7',           -- Generalized Anxiety Disorder-7
  'pss',            -- Perceived Stress Scale
  'who5'            -- WHO-5 Well-Being Index
);

-- Enum para níveis de severidade
CREATE TYPE mental_health_severity AS ENUM (
  'minimal',
  'mild',
  'moderate',
  'moderately_severe',
  'severe'
);

-- =====================================================
-- TABELA: mental_health_screenings
-- Triagens de saúde mental
-- =====================================================
CREATE TABLE IF NOT EXISTS mental_health_screenings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  screening_date DATE NOT NULL,
  scale_used mental_health_scale NOT NULL,
  
  -- HAD Scale (Anxiety and Depression)
  had_anxiety_score INTEGER CHECK (had_anxiety_score >= 0 AND had_anxiety_score <= 21),
  had_depression_score INTEGER CHECK (had_depression_score >= 0 AND had_depression_score <= 21),
  
  -- PHQ-9 (Depression)
  phq9_score INTEGER CHECK (phq9_score >= 0 AND phq9_score <= 27),
  
  -- GAD-7 (Anxiety)
  gad7_score INTEGER CHECK (gad7_score >= 0 AND gad7_score <= 21),
  
  -- PSS (Stress)
  pss_score INTEGER CHECK (pss_score >= 0 AND pss_score <= 40),
  
  -- WHO-5 (Well-being)
  who5_score INTEGER CHECK (who5_score >= 0 AND who5_score <= 100),
  
  -- Interpretação
  anxiety_level mental_health_severity,
  depression_level mental_health_severity,
  overall_wellbeing TEXT CHECK (overall_wellbeing IN ('poor', 'low', 'moderate', 'good', 'excellent')),
  
  -- Ação
  requires_referral BOOLEAN NOT NULL DEFAULT false,
  referral_urgency TEXT CHECK (referral_urgency IN ('routine', 'urgent', 'emergency')),
  
  screened_by TEXT NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mental_health_screenings_patient ON mental_health_screenings(patient_id);
CREATE INDEX idx_mental_health_screenings_date ON mental_health_screenings(screening_date DESC);
CREATE INDEX idx_mental_health_screenings_referral ON mental_health_screenings(requires_referral);

-- =====================================================
-- TABELA: mental_health_referrals
-- Encaminhamentos para profissionais de saúde mental
-- =====================================================
CREATE TABLE IF NOT EXISTS mental_health_referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  screening_id UUID REFERENCES mental_health_screenings(id) ON DELETE SET NULL,
  
  referral_date DATE NOT NULL,
  referred_by TEXT NOT NULL,
  
  referral_type TEXT NOT NULL CHECK (referral_type IN ('psychologist', 'psychiatrist', 'social_worker', 'counselor', 'support_group')),
  
  urgency TEXT NOT NULL CHECK (urgency IN ('routine', 'urgent', 'emergency')),
  
  reason TEXT NOT NULL,
  clinical_summary TEXT NOT NULL,
  
  -- Professional referido
  professional_name TEXT,
  professional_contact TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'scheduled', 'completed', 'declined')),
  
  scheduled_date DATE,
  completed_date DATE,
  
  outcome TEXT,
  follow_up_plan TEXT,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mental_health_referrals_patient ON mental_health_referrals(patient_id);
CREATE INDEX idx_mental_health_referrals_status ON mental_health_referrals(status);
CREATE INDEX idx_mental_health_referrals_urgency ON mental_health_referrals(urgency);

-- =====================================================
-- TABELA: psychological_support_sessions
-- Sessões de suporte psicológico integrado
-- =====================================================
CREATE TABLE IF NOT EXISTS psychological_support_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('individual', 'group', 'family', 'brief_intervention')),
  
  duration INTEGER NOT NULL, -- minutos
  
  topics_addressed TEXT[] NOT NULL,
  techniques_used TEXT[],
  
  patient_mood TEXT CHECK (patient_mood IN ('very_low', 'low', 'neutral', 'good', 'very_good')),
  engagement_level INTEGER CHECK (engagement_level >= 1 AND engagement_level <= 5),
  
  progress_notes TEXT NOT NULL,
  homework_assigned TEXT,
  
  conducted_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psychological_support_patient ON psychological_support_sessions(patient_id);
CREATE INDEX idx_psychological_support_date ON psychological_support_sessions(session_date DESC);

-- =====================================================
-- TABELA: mental_health_goals
-- Metas de saúde mental
-- =====================================================
CREATE TABLE IF NOT EXISTS mental_health_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  goal_description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('anxiety_reduction', 'mood_improvement', 'stress_management', 'sleep_quality', 'social_engagement', 'coping_skills')),
  
  target_date DATE,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  
  baseline_measurement TEXT,
  target_measurement TEXT,
  
  current_progress INTEGER CHECK (current_progress >= 0 AND current_progress <= 100),
  
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_date DATE,
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mental_health_goals_patient ON mental_health_goals(patient_id);
CREATE INDEX idx_mental_health_goals_achieved ON mental_health_goals(achieved);

-- =====================================================
-- TABELA: mental_health_alerts
-- Alertas de risco psicológico
-- =====================================================
CREATE TABLE IF NOT EXISTS mental_health_alerts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  
  alert_type TEXT NOT NULL CHECK (alert_type IN ('suicide_risk', 'severe_depression', 'panic_attack', 'crisis', 'deterioration')),
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  
  trigger_event TEXT NOT NULL,
  assessment_details TEXT NOT NULL,
  
  triggered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Resposta
  immediate_action_taken TEXT,
  action_taken_by TEXT,
  
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'monitoring', 'resolved')),
  
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_mental_health_alerts_patient ON mental_health_alerts(patient_id);
CREATE INDEX idx_mental_health_alerts_severity ON mental_health_alerts(severity);
CREATE INDEX idx_mental_health_alerts_status ON mental_health_alerts(status);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Patients requiring mental health attention
CREATE OR REPLACE VIEW patients_mental_health_priority AS
SELECT 
  p.id,
  p.full_name,
  mhs.screening_date,
  mhs.anxiety_level,
  mhs.depression_level,
  mhs.requires_referral,
  mhr.status as referral_status
FROM patients p
INNER JOIN mental_health_screenings mhs ON p.id = mhs.patient_id
LEFT JOIN mental_health_referrals mhr ON mhs.id = mhr.screening_id
WHERE mhs.requires_referral = true
  AND (mhr.status IS NULL OR mhr.status IN ('pending', 'contacted'))
ORDER BY 
  CASE mhs.referral_urgency
    WHEN 'emergency' THEN 1
    WHEN 'urgent' THEN 2
    WHEN 'routine' THEN 3
  END,
  mhs.screening_date;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE mental_health_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE mental_health_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Therapists can view mental health data"
  ON mental_health_screenings FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta', 'Psicólogo')
  ));

-- =====================================================
-- COMMENTS
-- =====================================================

COMMENT ON TABLE mental_health_screenings IS 'Triagens de saúde mental (HAD, PHQ-9, GAD-7, etc)';
COMMENT ON TABLE mental_health_referrals IS 'Encaminhamentos para profissionais de saúde mental';
COMMENT ON TABLE mental_health_alerts IS 'Alertas de risco psicológico crítico';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================


