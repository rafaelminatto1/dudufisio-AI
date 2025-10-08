-- =====================================================
-- MIGRATION: Sports Rehabilitation System
-- Data: 2025-10-08
-- Descrição: Tabelas para Módulo de Reabilitação Esportiva
-- =====================================================

-- Enum para tipos de esporte
CREATE TYPE sport_type AS ENUM (
  'soccer',
  'basketball',
  'volleyball',
  'tennis',
  'running',
  'swimming',
  'cycling',
  'martial_arts',
  'gymnastics',
  'crossfit',
  'weight_lifting',
  'other'
);

-- Enum para nível de competição
CREATE TYPE competition_level AS ENUM (
  'recreational',
  'amateur',
  'semi_professional',
  'professional',
  'elite'
);

-- Enum para status de clearance
CREATE TYPE clearance_status AS ENUM (
  'not_ready',
  'partial_clearance',
  'full_clearance',
  'return_to_play'
);

-- Enum para fases de reabilitação
CREATE TYPE rehab_phase AS ENUM (
  'phase1_acute',
  'phase2_intermediate',
  'phase3_advanced',
  'phase4_sport',
  'phase5_rtp'
);

-- =====================================================
-- TABELA: athlete_profiles
-- Perfil do atleta/paciente esportivo
-- =====================================================
CREATE TABLE IF NOT EXISTS athlete_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL UNIQUE REFERENCES patients(id) ON DELETE CASCADE,
  
  sport_type sport_type NOT NULL,
  position TEXT,
  competition_level competition_level NOT NULL,
  years_practicing INTEGER NOT NULL,
  hours_per_week DECIMAL(4,1) NOT NULL,
  competition_frequency TEXT,
  dominant_side TEXT NOT NULL CHECK (dominant_side IN ('right', 'left', 'both')),
  
  current_phase rehab_phase NOT NULL,
  target_return_date TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_athlete_profiles_patient ON athlete_profiles(patient_id);
CREATE INDEX idx_athlete_profiles_sport ON athlete_profiles(sport_type);
CREATE INDEX idx_athlete_profiles_level ON athlete_profiles(competition_level);

-- =====================================================
-- TABELA: injury_history
-- Histórico de lesões do atleta
-- =====================================================
CREATE TABLE IF NOT EXISTS injury_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  injury_type TEXT NOT NULL,
  body_part TEXT NOT NULL,
  injury_date DATE NOT NULL,
  recovery_time INTEGER, -- dias
  complications TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_injury_history_athlete ON injury_history(athlete_id);
CREATE INDEX idx_injury_history_date ON injury_history(injury_date DESC);

-- =====================================================
-- TABELA: athlete_goals
-- Metas do atleta
-- =====================================================
CREATE TABLE IF NOT EXISTS athlete_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strength', 'power', 'endurance', 'flexibility', 'skill', 'psychological')),
  target_date DATE,
  priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
  
  achieved BOOLEAN NOT NULL DEFAULT false,
  achieved_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_athlete_goals_athlete ON athlete_goals(athlete_id);
CREATE INDEX idx_athlete_goals_achieved ON athlete_goals(achieved);

-- =====================================================
-- TABELA: return_to_sport_criteria
-- Critérios de retorno ao esporte
-- =====================================================
CREATE TABLE IF NOT EXISTS return_to_sport_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  assessment_date DATE NOT NULL,
  assessed_by TEXT NOT NULL,
  
  -- Critérios gerais
  pain_level INTEGER NOT NULL CHECK (pain_level >= 0 AND pain_level <= 10),
  swelling_present BOOLEAN NOT NULL,
  
  -- Scores
  overall_score DECIMAL(5,2) NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
  clearance_status clearance_status NOT NULL,
  
  notes TEXT,
  
  -- Aprovação
  approved BOOLEAN NOT NULL DEFAULT false,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  
  next_assessment_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rts_criteria_athlete ON return_to_sport_criteria(athlete_id);
CREATE INDEX idx_rts_criteria_date ON return_to_sport_criteria(assessment_date DESC);
CREATE INDEX idx_rts_criteria_status ON return_to_sport_criteria(clearance_status);

-- =====================================================
-- TABELA: rom_assessments
-- Avaliações de amplitude de movimento
-- =====================================================
CREATE TABLE IF NOT EXISTS rom_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rts_criteria_id UUID NOT NULL REFERENCES return_to_sport_criteria(id) ON DELETE CASCADE,
  
  joint TEXT NOT NULL,
  overall_symmetry DECIMAL(5,2) NOT NULL,
  passed_criteria BOOLEAN NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rom_assessments_rts ON rom_assessments(rts_criteria_id);

-- =====================================================
-- TABELA: rom_movements
-- Movimentos específicos da avaliação ROM
-- =====================================================
CREATE TABLE IF NOT EXISTS rom_movements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rom_assessment_id UUID NOT NULL REFERENCES rom_assessments(id) ON DELETE CASCADE,
  
  movement TEXT NOT NULL,
  affected_side DECIMAL(5,2) NOT NULL, -- graus
  unaffected_side DECIMAL(5,2) NOT NULL, -- graus
  symmetry_index DECIMAL(5,2) NOT NULL, -- %
  within_normal BOOLEAN NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rom_movements_assessment ON rom_movements(rom_assessment_id);

-- =====================================================
-- TABELA: strength_tests
-- Testes de força
-- =====================================================
CREATE TABLE IF NOT EXISTS strength_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rts_criteria_id UUID NOT NULL REFERENCES return_to_sport_criteria(id) ON DELETE CASCADE,
  
  test_name TEXT NOT NULL,
  muscle TEXT NOT NULL,
  test_type TEXT NOT NULL CHECK (test_type IN ('isokinetic', 'isometric', '1RM', 'manual_resistance')),
  
  affected_side DECIMAL(10,2) NOT NULL,
  unaffected_side DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  symmetry_index DECIMAL(5,2) NOT NULL,
  compared_to_norm DECIMAL(5,2),
  
  passed_criteria BOOLEAN NOT NULL,
  test_date DATE NOT NULL,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_strength_tests_rts ON strength_tests(rts_criteria_id);
CREATE INDEX idx_strength_tests_date ON strength_tests(test_date DESC);

-- =====================================================
-- TABELA: functional_tests
-- Testes funcionais
-- =====================================================
CREATE TABLE IF NOT EXISTS functional_tests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rts_criteria_id UUID NOT NULL REFERENCES return_to_sport_criteria(id) ON DELETE CASCADE,
  
  test_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('hop', 'balance', 'agility', 'power', 'endurance')),
  description TEXT NOT NULL,
  
  -- Resultados bilaterais
  affected_side DECIMAL(10,2),
  unaffected_side DECIMAL(10,2),
  symmetry_index DECIMAL(5,2),
  
  -- Resultados absolutos
  score DECIMAL(10,2),
  unit TEXT,
  compared_to_norm DECIMAL(5,2),
  
  passed_criteria BOOLEAN NOT NULL,
  criteria_threshold DECIMAL(5,2) NOT NULL,
  test_date DATE NOT NULL,
  video_url TEXT,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_functional_tests_rts ON functional_tests(rts_criteria_id);
CREATE INDEX idx_functional_tests_category ON functional_tests(category);
CREATE INDEX idx_functional_tests_date ON functional_tests(test_date DESC);

-- =====================================================
-- TABELA: psychological_assessments
-- Avaliações psicológicas
-- =====================================================
CREATE TABLE IF NOT EXISTS psychological_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rts_criteria_id UUID NOT NULL REFERENCES return_to_sport_criteria(id) ON DELETE CASCADE,
  
  acl_rsi_score DECIMAL(5,2) CHECK (acl_rsi_score >= 0 AND acl_rsi_score <= 100),
  fear_avoidance INTEGER NOT NULL CHECK (fear_avoidance >= 1 AND fear_avoidance <= 5),
  confidence INTEGER NOT NULL CHECK (confidence >= 1 AND confidence <= 10),
  readiness INTEGER NOT NULL CHECK (readiness >= 1 AND readiness <= 10),
  motivation INTEGER NOT NULL CHECK (motivation >= 1 AND motivation <= 10),
  anxiety_level INTEGER NOT NULL CHECK (anxiety_level >= 1 AND anxiety_level <= 10),
  
  overall_psychological_score DECIMAL(5,2) NOT NULL CHECK (overall_psychological_score >= 0 AND overall_psychological_score <= 100),
  concerns TEXT[],
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_psychological_assessments_rts ON psychological_assessments(rts_criteria_id);

-- =====================================================
-- TABELA: performance_metrics
-- Métricas de performance do atleta
-- =====================================================
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  metric_type TEXT NOT NULL CHECK (metric_type IN ('strength', 'power', 'speed', 'endurance', 'agility', 'flexibility')),
  metric_name TEXT NOT NULL,
  value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  metric_date DATE NOT NULL,
  
  context TEXT,
  compared_to_baseline DECIMAL(5,2),
  compared_to_norm DECIMAL(5,2),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_performance_metrics_athlete ON performance_metrics(athlete_id);
CREATE INDEX idx_performance_metrics_type ON performance_metrics(metric_type);
CREATE INDEX idx_performance_metrics_date ON performance_metrics(metric_date DESC);

-- =====================================================
-- TABELA: sport_benchmarks
-- Benchmarks por esporte e nível
-- =====================================================
CREATE TABLE IF NOT EXISTS sport_benchmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  sport_type sport_type NOT NULL,
  position TEXT,
  competition_level competition_level NOT NULL,
  age_min INTEGER NOT NULL,
  age_max INTEGER NOT NULL,
  gender TEXT CHECK (gender IN ('M', 'F')),
  
  metric_name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  average_value DECIMAL(10,2) NOT NULL,
  excellent_value DECIMAL(10,2) NOT NULL,
  minimum_value DECIMAL(10,2) NOT NULL,
  unit TEXT NOT NULL,
  source TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_sport_benchmark UNIQUE (sport_type, position, competition_level, age_min, age_max, gender, metric_name)
);

CREATE INDEX idx_sport_benchmarks_sport ON sport_benchmarks(sport_type);
CREATE INDEX idx_sport_benchmarks_level ON sport_benchmarks(competition_level);

-- =====================================================
-- TABELA: rehab_progressions
-- Progressão de reabilitação do atleta
-- =====================================================
CREATE TABLE IF NOT EXISTS rehab_progressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  current_phase rehab_phase NOT NULL,
  phase_start_date DATE NOT NULL,
  estimated_phase_completion DATE,
  
  overall_progress DECIMAL(5,2) NOT NULL CHECK (overall_progress >= 0 AND overall_progress <= 100),
  estimated_return_date DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rehab_progressions_athlete ON rehab_progressions(athlete_id);
CREATE INDEX idx_rehab_progressions_phase ON rehab_progressions(current_phase);

-- =====================================================
-- TABELA: phase_goals
-- Metas por fase de reabilitação
-- =====================================================
CREATE TABLE IF NOT EXISTS phase_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progression_id UUID NOT NULL REFERENCES rehab_progressions(id) ON DELETE CASCADE,
  
  goal TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_date DATE,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_phase_goals_progression ON phase_goals(progression_id);
CREATE INDEX idx_phase_goals_completed ON phase_goals(completed);

-- =====================================================
-- TABELA: completed_phases
-- Histórico de fases completadas
-- =====================================================
CREATE TABLE IF NOT EXISTS completed_phases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progression_id UUID NOT NULL REFERENCES rehab_progressions(id) ON DELETE CASCADE,
  
  phase rehab_phase NOT NULL,
  start_date DATE NOT NULL,
  completion_date DATE NOT NULL,
  duration INTEGER NOT NULL, -- dias
  outcomes TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_completed_phases_progression ON completed_phases(progression_id);

-- =====================================================
-- TABELA: progression_criteria
-- Critérios de progressão entre fases
-- =====================================================
CREATE TABLE IF NOT EXISTS progression_criteria (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  progression_id UUID NOT NULL REFERENCES rehab_progressions(id) ON DELETE CASCADE,
  
  criterion TEXT NOT NULL,
  met BOOLEAN NOT NULL DEFAULT false,
  date_met DATE,
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_progression_criteria_progression ON progression_criteria(progression_id);
CREATE INDEX idx_progression_criteria_met ON progression_criteria(met);

-- =====================================================
-- TABELA: sports_rehab_protocols
-- Protocolos de reabilitação esportiva
-- =====================================================
CREATE TABLE IF NOT EXISTS sports_rehab_protocols (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name TEXT NOT NULL,
  sport_type sport_type NOT NULL,
  injury_type TEXT NOT NULL,
  description TEXT NOT NULL,
  
  total_duration_min INTEGER NOT NULL,
  total_duration_max INTEGER NOT NULL,
  duration_unit TEXT NOT NULL CHECK (duration_unit IN ('weeks', 'months')),
  
  return_to_criteria TEXT[],
  evidence_level TEXT,
  references TEXT[],
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sports_rehab_protocols_sport ON sports_rehab_protocols(sport_type);
CREATE INDEX idx_sports_rehab_protocols_injury ON sports_rehab_protocols(injury_type);
CREATE INDEX idx_sports_rehab_protocols_active ON sports_rehab_protocols(is_active);

-- =====================================================
-- TABELA: sport_training_sessions
-- Sessões de treino esportivo
-- =====================================================
CREATE TABLE IF NOT EXISTS sport_training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  session_date DATE NOT NULL,
  session_type TEXT NOT NULL CHECK (session_type IN ('strength', 'conditioning', 'skill', 'sport_specific', 'recovery')),
  phase rehab_phase NOT NULL,
  duration INTEGER NOT NULL, -- minutos
  
  -- Métricas da sessão
  heart_rate_avg INTEGER,
  heart_rate_max INTEGER,
  perceived_exertion INTEGER CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
  fatigue_level INTEGER CHECK (fatigue_level >= 1 AND fatigue_level <= 10),
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  performance_rating INTEGER CHECK (performance_rating >= 1 AND performance_rating <= 10),
  
  objectives TEXT[],
  objectives_achieved BOOLEAN NOT NULL DEFAULT false,
  
  notes TEXT,
  conducted_by TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sport_training_sessions_athlete ON sport_training_sessions(athlete_id);
CREATE INDEX idx_sport_training_sessions_date ON sport_training_sessions(session_date DESC);
CREATE INDEX idx_sport_training_sessions_type ON sport_training_sessions(session_type);

-- =====================================================
-- TABELA: session_exercises
-- Exercícios da sessão de treino
-- =====================================================
CREATE TABLE IF NOT EXISTS session_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sport_training_sessions(id) ON DELETE CASCADE,
  
  exercise_id TEXT,
  exercise_name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  load DECIMAL(10,2),
  load_unit TEXT,
  rest_time INTEGER, -- segundos
  
  completed BOOLEAN NOT NULL DEFAULT false,
  perceived_exertion INTEGER CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_session_exercises_session ON session_exercises(session_id);

-- =====================================================
-- TABELA: load_monitoring
-- Monitoramento de carga de treino
-- =====================================================
CREATE TABLE IF NOT EXISTS load_monitoring (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  week_year TEXT NOT NULL, -- formato: YYYY-WW
  
  -- Métricas semanais
  total_load DECIMAL(10,2) NOT NULL,
  average_load DECIMAL(10,2) NOT NULL,
  acute_load DECIMAL(10,2) NOT NULL,
  chronic_load DECIMAL(10,2) NOT NULL,
  acwr DECIMAL(5,2) NOT NULL, -- Acute:Chronic Workload Ratio
  monotony DECIMAL(5,2) NOT NULL,
  strain DECIMAL(10,2) NOT NULL,
  risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high')),
  
  recommendations TEXT[],
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_athlete_week UNIQUE (athlete_id, week_year)
);

CREATE INDEX idx_load_monitoring_athlete ON load_monitoring(athlete_id);
CREATE INDEX idx_load_monitoring_week ON load_monitoring(week_year DESC);

-- =====================================================
-- TABELA: daily_wellness
-- Dados diários de wellness
-- =====================================================
CREATE TABLE IF NOT EXISTS daily_wellness (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  athlete_id UUID NOT NULL REFERENCES athlete_profiles(id) ON DELETE CASCADE,
  
  wellness_date DATE NOT NULL,
  
  sleep_quality INTEGER NOT NULL CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  sleep_duration DECIMAL(3,1) NOT NULL, -- horas
  muscle_soreness INTEGER NOT NULL CHECK (muscle_soreness >= 1 AND muscle_soreness <= 10),
  stress_level INTEGER NOT NULL CHECK (stress_level >= 1 AND stress_level <= 10),
  mood INTEGER NOT NULL CHECK (mood >= 1 AND mood <= 10),
  energy INTEGER NOT NULL CHECK (energy >= 1 AND energy <= 10),
  
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_athlete_wellness_date UNIQUE (athlete_id, wellness_date)
);

CREATE INDEX idx_daily_wellness_athlete ON daily_wellness(athlete_id);
CREATE INDEX idx_daily_wellness_date ON daily_wellness(wellness_date DESC);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Athletes ready for next phase
CREATE OR REPLACE VIEW athletes_ready_for_progression AS
SELECT 
  ap.*,
  rp.current_phase,
  rp.overall_progress,
  COUNT(pc.id) FILTER (WHERE pc.met = false) as unmet_criteria_count
FROM athlete_profiles ap
INNER JOIN rehab_progressions rp ON ap.id = rp.athlete_id
LEFT JOIN progression_criteria pc ON rp.id = pc.progression_id
WHERE rp.overall_progress >= 80
GROUP BY ap.id, rp.current_phase, rp.overall_progress
HAVING COUNT(pc.id) FILTER (WHERE pc.met = false) = 0;

-- View: Athletes with full clearance
CREATE OR REPLACE VIEW athletes_full_clearance AS
SELECT DISTINCT
  ap.*,
  rts.assessment_date,
  rts.clearance_status,
  rts.overall_score
FROM athlete_profiles ap
INNER JOIN return_to_sport_criteria rts ON ap.id = (
  SELECT athlete_id FROM athlete_profiles WHERE patient_id = 
    (SELECT patient_id FROM athlete_profiles WHERE id = rts.athlete_id)
)
WHERE rts.clearance_status = 'full_clearance'
  AND rts.approved = true
ORDER BY rts.assessment_date DESC;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para calcular ACWR
CREATE OR REPLACE FUNCTION calculate_acwr(p_athlete_id UUID, p_week TEXT)
RETURNS DECIMAL AS $$
DECLARE
  v_acute_load DECIMAL;
  v_chronic_load DECIMAL;
BEGIN
  -- Acute load (últimos 7 dias)
  SELECT AVG(duration * perceived_exertion)
  INTO v_acute_load
  FROM sport_training_sessions
  WHERE athlete_id = p_athlete_id
    AND session_date >= (SELECT TO_DATE(p_week, 'IYYY-IW') - INTERVAL '7 days')
    AND session_date < TO_DATE(p_week, 'IYYY-IW');
  
  -- Chronic load (últimos 28 dias)
  SELECT AVG(duration * perceived_exertion)
  INTO v_chronic_load
  FROM sport_training_sessions
  WHERE athlete_id = p_athlete_id
    AND session_date >= (SELECT TO_DATE(p_week, 'IYYY-IW') - INTERVAL '28 days')
    AND session_date < TO_DATE(p_week, 'IYYY-IW');
  
  IF v_chronic_load > 0 THEN
    RETURN v_acute_load / v_chronic_load;
  ELSE
    RETURN 0;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE athlete_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE return_to_sport_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Policies básicas
CREATE POLICY "Therapists can view athlete data"
  ON athlete_profiles FOR SELECT
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

-- =====================================================
-- COMMENTS: Documentação
-- =====================================================

COMMENT ON TABLE athlete_profiles IS 'Perfis de atletas e pacientes esportivos';
COMMENT ON TABLE return_to_sport_criteria IS 'Critérios de retorno ao esporte';
COMMENT ON TABLE performance_metrics IS 'Métricas de performance do atleta';
COMMENT ON TABLE load_monitoring IS 'Monitoramento de carga de treino';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

