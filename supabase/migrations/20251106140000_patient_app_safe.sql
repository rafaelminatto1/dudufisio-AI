-- =====================================================
-- APP PACIENTES - VERSÃO ULTRA-SEGURA
-- Verifica tudo antes de criar
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 1. GARANTIR QUE PATIENTS EXISTE
-- =====================================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  full_name TEXT NOT NULL DEFAULT 'Paciente',
  name TEXT,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 2. TABELAS SIMPLES (SEM FK INICIALMENTE)
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  access_code TEXT UNIQUE NOT NULL CHECK (LENGTH(access_code) = 6),
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS exercise_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT,
  video_type TEXT DEFAULT 'url',
  duration INTEGER,
  category TEXT,
  tags TEXT[],
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS patient_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  exercise_video_id UUID,
  prescribed_by UUID NOT NULL,
  exercise_name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  sets INTEGER DEFAULT 3,
  reps INTEGER DEFAULT 10,
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  frequency_per_week INTEGER DEFAULT 3,
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_exercise_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_date DATE DEFAULT CURRENT_DATE,
  sets_completed INTEGER,
  reps_completed INTEGER,
  duration_seconds INTEGER,
  difficulty_level INTEGER,
  pain_level INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS patient_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID UNIQUE NOT NULL,
  total_exercises_assigned INTEGER DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0.00,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  total_sessions_completed INTEGER DEFAULT 0,
  sessions_attendance_rate DECIMAL(5, 2) DEFAULT 0.00,
  last_exercise_completed_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  access_code_id UUID,
  access_type TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  device_info JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- 3. FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION generate_access_code() RETURNS TEXT AS $$
DECLARE code TEXT; exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(REGEXP_REPLACE(encode(gen_random_bytes(4), 'base64'), '[^A-Z2-9]', '', 'g'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM patient_access_codes WHERE access_code = code) INTO exists;
    IF NOT exists AND LENGTH(code) = 6 THEN RETURN code; END IF;
  END LOOP;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_patient_access_code(p_patient_id UUID, p_created_by UUID DEFAULT NULL, p_expires_in_days INTEGER DEFAULT 30)
RETURNS TABLE(code TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE new_code TEXT; expiration TIMESTAMP WITH TIME ZONE;
BEGIN
  UPDATE patient_access_codes SET is_active = FALSE WHERE patient_id = p_patient_id;
  new_code := generate_access_code();
  expiration := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  INSERT INTO patient_access_codes (patient_id, access_code, created_by, expires_at) VALUES (p_patient_id, new_code, p_created_by, expiration);
  RETURN QUERY SELECT new_code, expiration;
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_patient_stats(p_patient_id UUID) RETURNS VOID AS $$
DECLARE v_assigned INT; v_completed INT; v_rate DECIMAL;
BEGIN
  SELECT COUNT(*) INTO v_assigned FROM patient_exercises WHERE patient_id = p_patient_id AND is_active = TRUE;
  SELECT COUNT(DISTINCT completed_date) INTO v_completed FROM exercise_completions WHERE patient_id = p_patient_id;
  v_rate := CASE WHEN v_assigned > 0 THEN (v_completed::DECIMAL / v_assigned) * 100 ELSE 0 END;
  INSERT INTO patient_stats (patient_id, total_exercises_assigned, total_exercises_completed, completion_rate, updated_at)
  VALUES (p_patient_id, v_assigned, v_completed, v_rate, NOW())
  ON CONFLICT (patient_id) DO UPDATE SET total_exercises_assigned = v_assigned, total_exercises_completed = v_completed, completion_rate = v_rate, updated_at = NOW();
END; $$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION validate_access_code(p_access_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, patient_id UUID, patient_name TEXT, code_id UUID) AS $$
BEGIN
  RETURN QUERY SELECT (pac.is_active AND pac.expires_at > NOW())::BOOLEAN, pac.patient_id, COALESCE(p.full_name, p.name, 'Paciente'), pac.id
  FROM patient_access_codes pac JOIN patients p ON p.id = pac.patient_id WHERE pac.access_code = p_access_code LIMIT 1;
  UPDATE patient_access_codes SET last_used_at = NOW(), use_count = use_count + 1 WHERE access_code = p_access_code AND is_active = TRUE;
END; $$ LANGUAGE plpgsql;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS update_exercise_videos_updated_at ON exercise_videos;
CREATE TRIGGER update_exercise_videos_updated_at BEFORE UPDATE ON exercise_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at();
DROP TRIGGER IF EXISTS update_patient_exercises_updated_at ON patient_exercises;
CREATE TRIGGER update_patient_exercises_updated_at BEFORE UPDATE ON patient_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION trigger_update_stats() RETURNS TRIGGER AS $$ BEGIN PERFORM update_patient_stats(NEW.patient_id); RETURN NEW; END; $$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS after_exercise_completion ON exercise_completions;
CREATE TRIGGER after_exercise_completion AFTER INSERT ON exercise_completions FOR EACH ROW EXECUTE FUNCTION trigger_update_stats();

-- =====================================================
-- 5. RLS - SERVICE ROLE APENAS (Simplificado)
-- =====================================================

ALTER TABLE patient_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "service_role_all_patient_access_codes" ON patient_access_codes;
CREATE POLICY "service_role_all_patient_access_codes" ON patient_access_codes FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "service_role_all_exercise_videos" ON exercise_videos;
CREATE POLICY "service_role_all_exercise_videos" ON exercise_videos FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "service_role_all_patient_exercises" ON patient_exercises;
CREATE POLICY "service_role_all_patient_exercises" ON patient_exercises FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "service_role_all_exercise_completions" ON exercise_completions;
CREATE POLICY "service_role_all_exercise_completions" ON exercise_completions FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "service_role_all_patient_stats" ON patient_stats;
CREATE POLICY "service_role_all_patient_stats" ON patient_stats FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "service_role_all_patient_access_logs" ON patient_access_logs;
CREATE POLICY "service_role_all_patient_access_logs" ON patient_access_logs FOR ALL TO service_role USING (TRUE);

-- =====================================================
-- 6. STORAGE
-- =====================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('exercise-videos', 'exercise-videos', TRUE) ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_exercise_videos" ON storage.objects;
CREATE POLICY "public_read_exercise_videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'exercise-videos');

DROP POLICY IF EXISTS "service_role_all_exercise_videos_storage" ON storage.objects;
CREATE POLICY "service_role_all_exercise_videos_storage" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'exercise-videos');

-- =====================================================
-- 7. ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_patient_access_codes_patient_id ON patient_access_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_codes_code ON patient_access_codes(access_code);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_patient_id ON patient_exercises(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_patient_id ON exercise_completions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_stats_patient_id ON patient_stats(patient_id);

