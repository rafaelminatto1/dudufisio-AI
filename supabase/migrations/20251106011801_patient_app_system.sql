-- =====================================================
-- MIGRATION: Sistema de App para Pacientes - MoocaFisio
-- Data: 2025-11-06
-- Descrição: Tabelas, RLS policies, functions e storage para app de pacientes
-- =====================================================

-- =====================================================
-- 1. EXTENSÕES NECESSÁRIAS
-- =====================================================

-- Habilitar extensão para geração de UUIDs (se não existir)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Habilitar extensão pgcrypto para geração de códigos aleatórios
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- 2. TABELAS
-- =====================================================

-- 2.1 Tabela de códigos de acesso para pacientes
CREATE TABLE IF NOT EXISTS patient_access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  access_code TEXT UNIQUE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  last_used_at TIMESTAMP WITH TIME ZONE,
  use_count INTEGER DEFAULT 0,
  CONSTRAINT valid_access_code CHECK (LENGTH(access_code) = 6)
);

-- Índices para performance
CREATE INDEX idx_patient_access_codes_patient_id ON patient_access_codes(patient_id);
CREATE INDEX idx_patient_access_codes_code ON patient_access_codes(access_code) WHERE is_active = TRUE;
CREATE INDEX idx_patient_access_codes_expires_at ON patient_access_codes(expires_at);

-- 2.2 Tabela de vídeos de exercícios
CREATE TABLE IF NOT EXISTS exercise_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  storage_path TEXT, -- Path no Supabase Storage (se for upload local)
  video_type TEXT DEFAULT 'url' CHECK (video_type IN ('url', 'storage', 'youtube', 'vimeo')),
  duration INTEGER, -- Duração em segundos
  category TEXT,
  tags TEXT[],
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- Índices
CREATE INDEX idx_exercise_videos_category ON exercise_videos(category);
CREATE INDEX idx_exercise_videos_active ON exercise_videos(is_active);
CREATE INDEX idx_exercise_videos_created_by ON exercise_videos(created_by);

-- 2.3 Tabela de exercícios prescritos aos pacientes
CREATE TABLE IF NOT EXISTS patient_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  exercise_video_id UUID REFERENCES exercise_videos(id) ON DELETE SET NULL,
  prescribed_by UUID NOT NULL REFERENCES users(id),
  
  -- Informações do exercício
  exercise_name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  
  -- Parâmetros de execução
  sets INTEGER NOT NULL DEFAULT 3,
  reps INTEGER NOT NULL DEFAULT 10,
  duration_seconds INTEGER, -- Duração de cada série
  rest_seconds INTEGER DEFAULT 60,
  frequency_per_week INTEGER DEFAULT 3,
  
  -- Período de validade
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT TRUE,
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_patient_exercises_patient_id ON patient_exercises(patient_id);
CREATE INDEX idx_patient_exercises_video_id ON patient_exercises(exercise_video_id);
CREATE INDEX idx_patient_exercises_active ON patient_exercises(is_active);
CREATE INDEX idx_patient_exercises_dates ON patient_exercises(start_date, end_date);

-- 2.4 Tabela de conclusão de exercícios
CREATE TABLE IF NOT EXISTS exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_exercise_id UUID NOT NULL REFERENCES patient_exercises(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Dados da execução
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_date DATE DEFAULT CURRENT_DATE,
  sets_completed INTEGER,
  reps_completed INTEGER,
  duration_seconds INTEGER,
  
  -- Feedback do paciente
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  pain_level INTEGER CHECK (pain_level BETWEEN 0 AND 10),
  notes TEXT,
  
  -- Localização (se disponível)
  location_lat DECIMAL(10, 8),
  location_lng DECIMAL(11, 8)
);

-- Índices
CREATE INDEX idx_exercise_completions_patient_exercise ON exercise_completions(patient_exercise_id);
CREATE INDEX idx_exercise_completions_patient_id ON exercise_completions(patient_id);
CREATE INDEX idx_exercise_completions_date ON exercise_completions(completed_date);
CREATE INDEX idx_exercise_completions_timestamp ON exercise_completions(completed_at);

-- 2.5 Tabela de estatísticas dos pacientes (materialized view em tabela)
CREATE TABLE IF NOT EXISTS patient_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID UNIQUE NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  -- Estatísticas de exercícios
  total_exercises_assigned INTEGER DEFAULT 0,
  total_exercises_completed INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 0.00,
  current_streak_days INTEGER DEFAULT 0,
  longest_streak_days INTEGER DEFAULT 0,
  
  -- Estatísticas de sessões
  total_sessions_completed INTEGER DEFAULT 0,
  total_sessions_scheduled INTEGER DEFAULT 0,
  sessions_attendance_rate DECIMAL(5, 2) DEFAULT 0.00,
  
  -- Última atividade
  last_exercise_completed_at TIMESTAMP WITH TIME ZONE,
  last_login_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice
CREATE INDEX idx_patient_stats_patient_id ON patient_stats(patient_id);

-- 2.6 Tabela de mensagens entre paciente e fisioterapeuta
CREATE TABLE IF NOT EXISTS patient_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'therapist')),
  
  -- Conteúdo da mensagem
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file')),
  attachment_url TEXT,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_patient_messages_patient_id ON patient_messages(patient_id);
CREATE INDEX idx_patient_messages_sender_id ON patient_messages(sender_id);
CREATE INDEX idx_patient_messages_created_at ON patient_messages(created_at DESC);
CREATE INDEX idx_patient_messages_unread ON patient_messages(is_read) WHERE is_read = FALSE;

-- 2.7 Tabela de logs de acesso dos pacientes
CREATE TABLE IF NOT EXISTS patient_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  access_code_id UUID REFERENCES patient_access_codes(id) ON DELETE SET NULL,
  
  -- Informações do acesso
  access_type TEXT NOT NULL CHECK (access_type IN ('login', 'logout', 'token_refresh')),
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  
  -- Resultado
  success BOOLEAN DEFAULT TRUE,
  error_message TEXT,
  
  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_patient_access_logs_patient_id ON patient_access_logs(patient_id);
CREATE INDEX idx_patient_access_logs_created_at ON patient_access_logs(created_at DESC);

-- =====================================================
-- 3. FUNCTIONS
-- =====================================================

-- 3.1 Function para gerar código aleatório de 6 caracteres
CREATE OR REPLACE FUNCTION generate_access_code()
RETURNS TEXT AS $$
DECLARE
  code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    -- Gera código com letras maiúsculas e números (excluindo 0, O, I, 1 para evitar confusão)
    code := UPPER(
      SUBSTRING(
        REGEXP_REPLACE(
          encode(gen_random_bytes(4), 'base64'),
          '[^A-Z2-9]', '', 'g'
        ),
        1, 6
      )
    );
    
    -- Verifica se já existe
    SELECT EXISTS(
      SELECT 1 FROM patient_access_codes 
      WHERE access_code = code AND is_active = TRUE
    ) INTO exists;
    
    -- Se não existe, retorna o código
    IF NOT exists AND LENGTH(code) = 6 THEN
      RETURN code;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.2 Function para criar código de acesso para paciente
CREATE OR REPLACE FUNCTION create_patient_access_code(
  p_patient_id UUID,
  p_created_by UUID DEFAULT NULL,
  p_expires_in_days INTEGER DEFAULT 30
)
RETURNS TABLE(code TEXT, expires_at TIMESTAMP WITH TIME ZONE) AS $$
DECLARE
  new_code TEXT;
  expiration TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Desativa códigos antigos do mesmo paciente
  UPDATE patient_access_codes 
  SET is_active = FALSE 
  WHERE patient_id = p_patient_id AND is_active = TRUE;
  
  -- Gera novo código
  new_code := generate_access_code();
  expiration := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  
  -- Insere novo código
  INSERT INTO patient_access_codes (patient_id, access_code, created_by, expires_at)
  VALUES (p_patient_id, new_code, p_created_by, expiration);
  
  RETURN QUERY SELECT new_code, expiration;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.3 Function para atualizar estatísticas do paciente
CREATE OR REPLACE FUNCTION update_patient_stats(p_patient_id UUID)
RETURNS VOID AS $$
DECLARE
  v_total_assigned INTEGER;
  v_total_completed INTEGER;
  v_completion_rate DECIMAL(5, 2);
  v_last_exercise TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Conta exercícios atribuídos ativos
  SELECT COUNT(*) INTO v_total_assigned
  FROM patient_exercises
  WHERE patient_id = p_patient_id AND is_active = TRUE;
  
  -- Conta exercícios completados (únicos por data)
  SELECT COUNT(DISTINCT DATE(completed_at)) INTO v_total_completed
  FROM exercise_completions
  WHERE patient_id = p_patient_id;
  
  -- Calcula taxa de conclusão
  IF v_total_assigned > 0 THEN
    v_completion_rate := (v_total_completed::DECIMAL / v_total_assigned::DECIMAL) * 100;
  ELSE
    v_completion_rate := 0.00;
  END IF;
  
  -- Busca último exercício completado
  SELECT MAX(completed_at) INTO v_last_exercise
  FROM exercise_completions
  WHERE patient_id = p_patient_id;
  
  -- Upsert nas estatísticas
  INSERT INTO patient_stats (
    patient_id,
    total_exercises_assigned,
    total_exercises_completed,
    completion_rate,
    last_exercise_completed_at,
    updated_at
  )
  VALUES (
    p_patient_id,
    v_total_assigned,
    v_total_completed,
    v_completion_rate,
    v_last_exercise,
    NOW()
  )
  ON CONFLICT (patient_id) DO UPDATE SET
    total_exercises_assigned = v_total_assigned,
    total_exercises_completed = v_total_completed,
    completion_rate = v_completion_rate,
    last_exercise_completed_at = v_last_exercise,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3.4 Function para validar código de acesso
CREATE OR REPLACE FUNCTION validate_access_code(p_access_code TEXT)
RETURNS TABLE(
  is_valid BOOLEAN,
  patient_id UUID,
  patient_name TEXT,
  code_id UUID
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (pac.is_active AND pac.expires_at > NOW())::BOOLEAN as is_valid,
    pac.patient_id,
    p.name as patient_name,
    pac.id as code_id
  FROM patient_access_codes pac
  JOIN patients p ON p.id = pac.patient_id
  WHERE pac.access_code = p_access_code
  LIMIT 1;
  
  -- Atualiza uso do código se válido
  UPDATE patient_access_codes 
  SET 
    last_used_at = NOW(),
    use_count = use_count + 1
  WHERE access_code = p_access_code 
    AND is_active = TRUE 
    AND expires_at > NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 4. TRIGGERS
-- =====================================================

-- 4.1 Trigger para atualizar updated_at em exercise_videos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_exercise_videos_updated_at
  BEFORE UPDATE ON exercise_videos
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4.2 Trigger para atualizar updated_at em patient_exercises
CREATE TRIGGER update_patient_exercises_updated_at
  BEFORE UPDATE ON patient_exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4.3 Trigger para atualizar estatísticas quando exercício é completado
CREATE OR REPLACE FUNCTION trigger_update_patient_stats()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM update_patient_stats(NEW.patient_id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_exercise_completion
  AFTER INSERT ON exercise_completions
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_patient_stats();

-- 4.4 Trigger para desativar códigos expirados automaticamente
CREATE OR REPLACE FUNCTION deactivate_expired_codes()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE patient_access_codes
  SET is_active = FALSE
  WHERE expires_at < NOW() AND is_active = TRUE;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger que roda periodicamente (via pg_cron ou manualmente)
-- Por enquanto, será chamado quando houver tentativa de validação

-- =====================================================
-- 5. STORAGE BUCKET
-- =====================================================

-- Nota: Bucket e policies de storage serão criados em migration separada
-- Ver: 20251106011802_storage_policies_patient.sql

-- =====================================================
-- 6. RLS POLICIES
-- =====================================================

-- 6.1 Habilitar RLS em todas as tabelas
ALTER TABLE patient_access_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_access_logs ENABLE ROW LEVEL SECURITY;

-- 6.2 Policies para patient_access_codes

-- Fisioterapeutas podem criar códigos para seus pacientes
CREATE POLICY "Therapists can create access codes for their patients"
  ON patient_access_codes FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Fisioterapeutas podem ver códigos de seus pacientes
CREATE POLICY "Therapists can view access codes"
  ON patient_access_codes FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Service role (APIs) pode validar qualquer código
CREATE POLICY "Service role can validate codes"
  ON patient_access_codes FOR ALL
  TO service_role
  USING (TRUE);

-- 6.3 Policies para exercise_videos

-- Fisioterapeutas podem criar vídeos
CREATE POLICY "Therapists can create videos"
  ON exercise_videos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Fisioterapeutas podem ver todos os vídeos
CREATE POLICY "Therapists can view all videos"
  ON exercise_videos FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Fisioterapeutas podem atualizar seus vídeos
CREATE POLICY "Therapists can update their videos"
  ON exercise_videos FOR UPDATE
  TO authenticated
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

-- Service role pode ler vídeos (para API pública de pacientes)
CREATE POLICY "Service role can read videos"
  ON exercise_videos FOR SELECT
  TO service_role
  USING (TRUE);

-- 6.4 Policies para patient_exercises

-- Fisioterapeutas podem prescrever exercícios
CREATE POLICY "Therapists can prescribe exercises"
  ON patient_exercises FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Fisioterapeutas podem ver exercícios que prescreveram
CREATE POLICY "Therapists can view exercises they prescribed"
  ON patient_exercises FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Fisioterapeutas podem atualizar exercícios que prescreveram
CREATE POLICY "Therapists can update their prescriptions"
  ON patient_exercises FOR UPDATE
  TO authenticated
  USING (prescribed_by = auth.uid())
  WITH CHECK (prescribed_by = auth.uid());

-- Service role pode ler exercícios (para API de pacientes)
CREATE POLICY "Service role can read exercises"
  ON patient_exercises FOR SELECT
  TO service_role
  USING (TRUE);

-- 6.5 Policies para exercise_completions

-- Fisioterapeutas podem ver conclusões de exercícios
CREATE POLICY "Therapists can view exercise completions"
  ON exercise_completions FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Service role pode gerenciar conclusões (para API de pacientes)
CREATE POLICY "Service role can manage completions"
  ON exercise_completions FOR ALL
  TO service_role
  USING (TRUE);

-- 6.6 Policies para patient_stats

-- Fisioterapeutas podem ver estatísticas
CREATE POLICY "Therapists can view patient stats"
  ON patient_stats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Service role pode gerenciar estatísticas
CREATE POLICY "Service role can manage stats"
  ON patient_stats FOR ALL
  TO service_role
  USING (TRUE);

-- 6.7 Policies para patient_messages

-- Fisioterapeutas podem ver e enviar mensagens
CREATE POLICY "Therapists can view messages"
  ON patient_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

CREATE POLICY "Therapists can send messages"
  ON patient_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role IN ('admin', 'therapist')
    )
  );

-- Service role pode gerenciar mensagens (para API de pacientes)
CREATE POLICY "Service role can manage messages"
  ON patient_messages FOR ALL
  TO service_role
  USING (TRUE);

-- 6.8 Policies para patient_access_logs

-- Service role pode criar e ler logs
CREATE POLICY "Service role can manage access logs"
  ON patient_access_logs FOR ALL
  TO service_role
  USING (TRUE);

-- Admins podem ver logs
CREATE POLICY "Admins can view access logs"
  ON patient_access_logs FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users u
      WHERE u.id = auth.uid()
      AND u.role = 'admin'
    )
  );

-- 6.9 Storage policies
-- Nota: Storage policies serão criadas em migration separada (20251106011802_storage_policies_patient.sql)

-- =====================================================
-- 7. INDEXES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índice composto para buscar exercícios ativos de um paciente
CREATE INDEX idx_patient_exercises_patient_active 
  ON patient_exercises(patient_id, is_active) 
  WHERE is_active = TRUE;

-- Índice para buscar conclusões por data
CREATE INDEX idx_exercise_completions_patient_date 
  ON exercise_completions(patient_id, completed_date DESC);

-- =====================================================
-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE patient_access_codes IS 'Códigos de 6 dígitos para acesso de pacientes ao app';
COMMENT ON TABLE exercise_videos IS 'Biblioteca de vídeos de exercícios';
COMMENT ON TABLE patient_exercises IS 'Exercícios prescritos aos pacientes';
COMMENT ON TABLE exercise_completions IS 'Registro de exercícios completados pelos pacientes';
COMMENT ON TABLE patient_stats IS 'Estatísticas agregadas dos pacientes';
COMMENT ON TABLE patient_messages IS 'Mensagens entre pacientes e fisioterapeutas';
COMMENT ON TABLE patient_access_logs IS 'Log de acessos dos pacientes para auditoria';

COMMENT ON FUNCTION generate_access_code() IS 'Gera código aleatório único de 6 caracteres';
COMMENT ON FUNCTION create_patient_access_code(UUID, UUID, INTEGER) IS 'Cria novo código de acesso para paciente';
COMMENT ON FUNCTION update_patient_stats(UUID) IS 'Atualiza estatísticas do paciente';
COMMENT ON FUNCTION validate_access_code(TEXT) IS 'Valida código de acesso e retorna informações do paciente';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

