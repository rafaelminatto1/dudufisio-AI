-- =====================================================
-- APP PACIENTES - VERSÃO FINAL SIMPLIFICADA
-- Garante que funciona sempre
-- =====================================================

-- Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- CRIAR TABELA PATIENTS PRIMEIRO (Forma Simples)
-- =====================================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID,
  full_name TEXT NOT NULL DEFAULT 'Paciente',
  name TEXT,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  gender TEXT,
  status TEXT DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar coluna name se não existir
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'name') THEN
    ALTER TABLE patients ADD COLUMN IF NOT EXISTS name TEXT;
  END IF;
END $$;

-- =====================================================
-- TABELAS DO APP
-- =====================================================

CREATE TABLE IF NOT EXISTS patient_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  access_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID,
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  CONSTRAINT valid_access_code CHECK (LENGTH(access_code) = 6)
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
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  duration_seconds INTEGER,
  rest_seconds INTEGER DEFAULT 60,
  frequency_per_week INTEGER DEFAULT 3,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
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
  total_sessions_scheduled INTEGER DEFAULT 0,
  sessions_attendance_rate DECIMAL(5, 2) DEFAULT 0.00,
  last_exercise_completed_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text',
  attachment_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS patient_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL,
  access_code_id UUID,
  access_type TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ADICIONAR FOREIGN KEYS DEPOIS (Se tabelas existirem)
-- =====================================================

DO $$
BEGIN
  -- FK para patient_access_codes
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patient_access_codes DROP CONSTRAINT IF EXISTS patient_access_codes_patient_id_fkey;
    ALTER TABLE patient_access_codes ADD CONSTRAINT patient_access_codes_patient_id_fkey 
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
  END IF;
  
  -- FK para patient_exercises
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patient_exercises DROP CONSTRAINT IF EXISTS patient_exercises_patient_id_fkey;
    ALTER TABLE patient_exercises ADD CONSTRAINT patient_exercises_patient_id_fkey 
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exercise_videos') THEN
    ALTER TABLE patient_exercises DROP CONSTRAINT IF EXISTS patient_exercises_video_id_fkey;
    ALTER TABLE patient_exercises ADD CONSTRAINT patient_exercises_video_id_fkey 
      FOREIGN KEY (exercise_video_id) REFERENCES exercise_videos(id) ON DELETE SET NULL;
  END IF;
  
  -- FK para exercise_completions
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE exercise_completions DROP CONSTRAINT IF EXISTS exercise_completions_patient_id_fkey;
    ALTER TABLE exercise_completions ADD CONSTRAINT exercise_completions_patient_id_fkey 
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_exercises') THEN
    ALTER TABLE exercise_completions DROP CONSTRAINT IF EXISTS exercise_completions_exercise_id_fkey;
    ALTER TABLE exercise_completions ADD CONSTRAINT exercise_completions_exercise_id_fkey 
      FOREIGN KEY (patient_exercise_id) REFERENCES patient_exercises(id) ON DELETE CASCADE;
  END IF;
  
  -- FK para patient_stats
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patient_stats DROP CONSTRAINT IF EXISTS patient_stats_patient_id_fkey;
    ALTER TABLE patient_stats ADD CONSTRAINT patient_stats_patient_id_fkey 
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
  END IF;
  
  -- FK para patient_messages
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patient_messages DROP CONSTRAINT IF EXISTS patient_messages_patient_id_fkey;
    ALTER TABLE patient_messages ADD CONSTRAINT patient_messages_patient_id_fkey 
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
  END IF;
  
  -- FK para patient_access_logs
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patients') THEN
    ALTER TABLE patient_access_logs DROP CONSTRAINT IF EXISTS patient_access_logs_patient_id_fkey;
    ALTER TABLE patient_access_logs ADD CONSTRAINT patient_access_logs_patient_id_fkey 
      FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'patient_access_codes') THEN
    ALTER TABLE patient_access_logs DROP CONSTRAINT IF EXISTS patient_access_logs_code_id_fkey;
    ALTER TABLE patient_access_logs ADD CONSTRAINT patient_access_logs_code_id_fkey 
      FOREIGN KEY (access_code_id) REFERENCES patient_access_codes(id) ON DELETE SET NULL;
  END IF;
END $$;

-- =====================================================
-- ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_patient_access_codes_patient_id ON patient_access_codes(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_access_codes_code ON patient_access_codes(access_code) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_exercise_videos_category ON exercise_videos(category);
CREATE INDEX IF NOT EXISTS idx_patient_exercises_patient_id ON patient_exercises(patient_id);
CREATE INDEX IF NOT EXISTS idx_exercise_completions_patient_id ON exercise_completions(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_stats_patient_id ON patient_stats(patient_id);
CREATE INDEX IF NOT EXISTS idx_patient_messages_patient_id ON patient_messages(patient_id);

-- =====================================================
-- FUNCTIONS
-- =====================================================

CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE code TEXT; exists BOOLEAN;
BEGIN
  LOOP
    code := UPPER(SUBSTRING(REGEXP_REPLACE(encode(gen_random_bytes(4), 'base64'), '[^A-Z2-9]', '', 'g'), 1, 6));
    SELECT EXISTS(SELECT 1 FROM patient_access_codes WHERE access_code = code AND is_active = TRUE) INTO exists;
    IF NOT exists AND LENGTH(code) = 6 THEN RETURN code; END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION create_patient_access_code(p_patient_id UUID, p_created_by UUID DEFAULT NULL, p_expires_in_days INTEGER DEFAULT 30)
RETURNS TABLE(code TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE new_code TEXT; expiration TIMESTAMP WITH TIME ZONE;
BEGIN
  UPDATE patient_access_codes SET is_active = FALSE WHERE patient_id = p_patient_id AND is_active = TRUE;
  new_code := generate_access_code();
  expiration := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  INSERT INTO patient_access_codes (patient_id, access_code, created_by, expires_at) VALUES (p_patient_id, new_code, p_created_by, expiration);
  RETURN QUERY SELECT new_code, expiration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_patient_stats(p_patient_id UUID)
RETURNS VOID AS $$
DECLARE v_total_assigned INTEGER; v_total_completed INTEGER; v_completion_rate DECIMAL(5, 2); v_last_exercise TIMESTAMP WITH TIME ZONE;
BEGIN
  SELECT COUNT(*) INTO v_total_assigned FROM patient_exercises WHERE patient_id = p_patient_id AND is_active = TRUE;
  SELECT COUNT(DISTINCT DATE(completed_at)) INTO v_total_completed FROM exercise_completions WHERE patient_id = p_patient_id;
  v_completion_rate := CASE WHEN v_total_assigned > 0 THEN (v_total_completed::DECIMAL / v_total_assigned::DECIMAL) * 100 ELSE 0.00 END;
  SELECT MAX(completed_at) INTO v_last_exercise FROM exercise_completions WHERE patient_id = p_patient_id;
  INSERT INTO patient_stats (patient_id, total_exercises_assigned, total_exercises_completed, completion_rate, last_exercise_completed_at, updated_at)
  VALUES (p_patient_id, v_total_assigned, v_total_completed, v_completion_rate, v_last_exercise, NOW())
  ON CONFLICT (patient_id) DO UPDATE SET total_exercises_assigned = v_total_assigned, total_exercises_completed = v_total_completed, completion_rate = v_completion_rate, last_exercise_completed_at = v_last_exercise, updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION validate_access_code(p_access_code TEXT)
RETURNS TABLE(is_valid BOOLEAN, patient_id UUID, patient_name TEXT, code_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT (pac.is_active AND pac.expires_at > NOW())::BOOLEAN, pac.patient_id, COALESCE(p.full_name, p.name, 'Paciente') as patient_name, pac.id
  FROM patient_access_codes pac JOIN patients p ON p.id = pac.patient_id WHERE pac.access_code = p_access_code LIMIT 1;
  UPDATE patient_access_codes SET last_used_at = NOW(), use_count = use_count + 1 WHERE access_code = p_access_code AND is_active = TRUE AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_exercise_videos_updated_at ON exercise_videos;
CREATE TRIGGER update_exercise_videos_updated_at BEFORE UPDATE ON exercise_videos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_patient_exercises_updated_at ON patient_exercises;
CREATE TRIGGER update_patient_exercises_updated_at BEFORE UPDATE ON patient_exercises FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION trigger_update_patient_stats()
RETURNS TRIGGER AS $$ BEGIN PERFORM update_patient_stats(NEW.patient_id); RETURN NEW; END; $$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS after_exercise_completion ON exercise_completions;
CREATE TRIGGER after_exercise_completion AFTER INSERT ON exercise_completions FOR EACH ROW EXECUTE FUNCTION trigger_update_patient_stats();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE patient_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role full access patient_access_codes" ON patient_access_codes;
CREATE POLICY "Service role full access patient_access_codes" ON patient_access_codes FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "Service role full access exercise_videos" ON exercise_videos;
CREATE POLICY "Service role full access exercise_videos" ON exercise_videos FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "Service role full access patient_exercises" ON patient_exercises;
CREATE POLICY "Service role full access patient_exercises" ON patient_exercises FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "Service role full access exercise_completions" ON exercise_completions;
CREATE POLICY "Service role full access exercise_completions" ON exercise_completions FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "Service role full access patient_stats" ON patient_stats;
CREATE POLICY "Service role full access patient_stats" ON patient_stats FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "Service role full access patient_messages" ON patient_messages;
CREATE POLICY "Service role full access patient_messages" ON patient_messages FOR ALL TO service_role USING (TRUE);

DROP POLICY IF EXISTS "Service role full access patient_access_logs" ON patient_access_logs;
CREATE POLICY "Service role full access patient_access_logs" ON patient_access_logs FOR ALL TO service_role USING (TRUE);

-- Policies para therapists
DROP POLICY IF EXISTS "Therapists can manage all patient data" ON patient_access_codes;
CREATE POLICY "Therapists can manage all patient data" ON patient_access_codes FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist')));

DROP POLICY IF EXISTS "Therapists can manage videos" ON exercise_videos;
CREATE POLICY "Therapists can manage videos" ON exercise_videos FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist')));

DROP POLICY IF EXISTS "Therapists can manage exercises" ON patient_exercises;
CREATE POLICY "Therapists can manage exercises" ON patient_exercises FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist')));

DROP POLICY IF EXISTS "Therapists can view completions" ON exercise_completions;
CREATE POLICY "Therapists can view completions" ON exercise_completions FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist')));

DROP POLICY IF EXISTS "Therapists can view stats" ON patient_stats;
CREATE POLICY "Therapists can view stats" ON patient_stats FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist')));

-- =====================================================
-- STORAGE
-- =====================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('exercise-videos', 'exercise-videos', TRUE, 524288000, ARRAY['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp']::text[])
ON CONFLICT (id) DO UPDATE SET public = TRUE, file_size_limit = 524288000;

DROP POLICY IF EXISTS "Public can view exercise videos" ON storage.objects;
CREATE POLICY "Public can view exercise videos" ON storage.objects FOR SELECT TO public USING (bucket_id = 'exercise-videos');

DROP POLICY IF EXISTS "Service role can manage exercise videos" ON storage.objects;
CREATE POLICY "Service role can manage exercise videos" ON storage.objects FOR ALL TO service_role USING (bucket_id = 'exercise-videos');

DROP POLICY IF EXISTS "Therapists can upload exercise videos" ON storage.objects;
CREATE POLICY "Therapists can upload exercise videos" ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'exercise-videos' AND EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role IN ('admin', 'therapist')));

