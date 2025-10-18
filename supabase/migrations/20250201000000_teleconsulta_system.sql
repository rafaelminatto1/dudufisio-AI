-- =====================================================
-- FASE 4: SISTEMA DE TELECONSULTA
-- Implementa videochamadas com Jitsi Meet
-- =====================================================

-- Tabela de Teleconsultas
CREATE TABLE IF NOT EXISTS teleconsultas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Relacionamentos
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  therapist_id UUID REFERENCES users(id) ON DELETE CASCADE,

  -- Informações da Sessão
  room_name TEXT NOT NULL UNIQUE,
  scheduled_start TIMESTAMPTZ NOT NULL,
  scheduled_end TIMESTAMPTZ NOT NULL,

  -- Status da Teleconsulta
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (
    status IN ('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled', 'no_show')
  ),

  -- Jitsi Meeting Info
  jwt_token TEXT, -- Para autenticação Jitsi
  moderator_password TEXT,
  participant_password TEXT,

  -- Timestamps de Participação
  patient_joined_at TIMESTAMPTZ,
  therapist_joined_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,

  -- Duração e Qualidade
  duration_minutes INTEGER,
  connection_quality TEXT CHECK (connection_quality IN ('excellent', 'good', 'fair', 'poor')),

  -- Notas e Feedback
  therapist_notes TEXT,
  patient_feedback TEXT,
  patient_rating INTEGER CHECK (patient_rating BETWEEN 1 AND 5),

  -- Gravação (opcional)
  recording_url TEXT,
  recording_duration INTEGER,

  -- Metadados
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para Performance
CREATE INDEX IF NOT EXISTS idx_teleconsultas_patient ON teleconsultas(patient_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_therapist ON teleconsultas(therapist_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_appointment ON teleconsultas(appointment_id);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_scheduled_start ON teleconsultas(scheduled_start);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_status ON teleconsultas(status);
CREATE INDEX IF NOT EXISTS idx_teleconsultas_room ON teleconsultas(room_name);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_teleconsultas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER teleconsultas_updated_at
  BEFORE UPDATE ON teleconsultas
  FOR EACH ROW
  EXECUTE FUNCTION update_teleconsultas_updated_at();

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Criar nova teleconsulta
CREATE OR REPLACE FUNCTION create_teleconsulta(
  p_patient_id UUID,
  p_therapist_id UUID,
  p_appointment_id UUID,
  p_scheduled_start TIMESTAMPTZ,
  p_scheduled_end TIMESTAMPTZ
)
RETURNS TABLE(
  teleconsulta_id UUID,
  room_name TEXT,
  moderator_password TEXT,
  participant_password TEXT
) AS $$
DECLARE
  v_room_name TEXT;
  v_mod_password TEXT;
  v_part_password TEXT;
  v_teleconsulta_id UUID;
BEGIN
  -- Gerar room name único
  v_room_name := 'dudufisio-' ||
                 EXTRACT(EPOCH FROM p_scheduled_start)::TEXT || '-' ||
                 substring(md5(random()::text) from 1 for 8);

  -- Gerar senhas aleatórias
  v_mod_password := substring(md5(random()::text) from 1 for 12);
  v_part_password := substring(md5(random()::text) from 1 for 12);

  -- Inserir teleconsulta
  INSERT INTO teleconsultas (
    patient_id,
    therapist_id,
    appointment_id,
    room_name,
    scheduled_start,
    scheduled_end,
    moderator_password,
    participant_password,
    status
  ) VALUES (
    p_patient_id,
    p_therapist_id,
    p_appointment_id,
    v_room_name,
    p_scheduled_start,
    p_scheduled_end,
    v_mod_password,
    v_part_password,
    'scheduled'
  )
  RETURNING id INTO v_teleconsulta_id;

  RETURN QUERY
  SELECT
    v_teleconsulta_id,
    v_room_name,
    v_mod_password,
    v_part_password;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Iniciar teleconsulta (quando participante entra)
CREATE OR REPLACE FUNCTION start_teleconsulta(
  p_teleconsulta_id UUID,
  p_user_id UUID,
  p_user_type TEXT -- 'patient' or 'therapist'
)
RETURNS BOOLEAN AS $$
DECLARE
  v_current_status TEXT;
BEGIN
  -- Verificar status atual
  SELECT status INTO v_current_status
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  IF v_current_status IS NULL THEN
    RAISE EXCEPTION 'Teleconsulta não encontrada';
  END IF;

  -- Atualizar timestamps de entrada
  IF p_user_type = 'patient' THEN
    UPDATE teleconsultas
    SET
      patient_joined_at = COALESCE(patient_joined_at, NOW()),
      status = CASE
        WHEN status = 'scheduled' THEN 'waiting'
        WHEN status = 'waiting' AND therapist_joined_at IS NOT NULL THEN 'in_progress'
        ELSE status
      END,
      started_at = CASE
        WHEN status = 'waiting' AND therapist_joined_at IS NOT NULL THEN NOW()
        ELSE started_at
      END
    WHERE id = p_teleconsulta_id
      AND patient_id = p_user_id;
  ELSE
    UPDATE teleconsultas
    SET
      therapist_joined_at = COALESCE(therapist_joined_at, NOW()),
      status = CASE
        WHEN status = 'scheduled' THEN 'waiting'
        WHEN status = 'waiting' AND patient_joined_at IS NOT NULL THEN 'in_progress'
        ELSE status
      END,
      started_at = CASE
        WHEN status = 'waiting' AND patient_joined_at IS NOT NULL THEN NOW()
        ELSE started_at
      END
    WHERE id = p_teleconsulta_id
      AND therapist_id = p_user_id;
  END IF;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Finalizar teleconsulta
CREATE OR REPLACE FUNCTION end_teleconsulta(
  p_teleconsulta_id UUID,
  p_therapist_notes TEXT DEFAULT NULL,
  p_connection_quality TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_start_time TIMESTAMPTZ;
  v_duration INTEGER;
BEGIN
  -- Buscar informações
  SELECT started_at INTO v_start_time
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  IF v_start_time IS NULL THEN
    RAISE EXCEPTION 'Teleconsulta não foi iniciada';
  END IF;

  -- Calcular duração
  v_duration := EXTRACT(EPOCH FROM (NOW() - v_start_time)) / 60;

  -- Atualizar teleconsulta
  UPDATE teleconsultas
  SET
    status = 'completed',
    ended_at = NOW(),
    duration_minutes = v_duration,
    therapist_notes = COALESCE(p_therapist_notes, therapist_notes),
    connection_quality = COALESCE(p_connection_quality, connection_quality)
  WHERE id = p_teleconsulta_id
    AND status = 'in_progress';

  -- Criar notificação para o paciente
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    patient_id,
    'teleconsulta_completed',
    'Teleconsulta Finalizada',
    'Sua teleconsulta foi concluída. Por favor, avalie a experiência.',
    jsonb_build_object('teleconsulta_id', p_teleconsulta_id)
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cancelar teleconsulta
CREATE OR REPLACE FUNCTION cancel_teleconsulta(
  p_teleconsulta_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Atualizar status
  UPDATE teleconsultas
  SET
    status = 'cancelled',
    metadata = jsonb_set(
      COALESCE(metadata, '{}'),
      '{cancellation_reason}',
      to_jsonb(p_reason)
    ),
    metadata = jsonb_set(
      metadata,
      '{cancelled_by}',
      to_jsonb(p_user_id)
    ),
    metadata = jsonb_set(
      metadata,
      '{cancelled_at}',
      to_jsonb(NOW())
    )
  WHERE id = p_teleconsulta_id
    AND status IN ('scheduled', 'waiting')
    AND (patient_id = p_user_id OR therapist_id = p_user_id);

  -- Notificar a outra parte
  INSERT INTO notifications (user_id, type, title, message, metadata)
  SELECT
    CASE
      WHEN patient_id = p_user_id THEN therapist_id
      ELSE patient_id
    END,
    'teleconsulta_cancelled',
    'Teleconsulta Cancelada',
    'A teleconsulta agendada foi cancelada.',
    jsonb_build_object(
      'teleconsulta_id', p_teleconsulta_id,
      'reason', p_reason
    )
  FROM teleconsultas
  WHERE id = p_teleconsulta_id;

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter teleconsultas do usuário
CREATE OR REPLACE FUNCTION get_user_teleconsultas(
  p_user_id UUID,
  p_status TEXT DEFAULT NULL,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  room_name TEXT,
  scheduled_start TIMESTAMPTZ,
  scheduled_end TIMESTAMPTZ,
  status TEXT,
  patient_name TEXT,
  therapist_name TEXT,
  duration_minutes INTEGER,
  patient_rating INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.room_name,
    t.scheduled_start,
    t.scheduled_end,
    t.status,
    patient.full_name as patient_name,
    therapist.full_name as therapist_name,
    t.duration_minutes,
    t.patient_rating
  FROM teleconsultas t
  LEFT JOIN users patient ON t.patient_id = patient.id
  LEFT JOIN users therapist ON t.therapist_id = therapist.id
  WHERE (t.patient_id = p_user_id OR t.therapist_id = p_user_id)
    AND (p_status IS NULL OR t.status = p_status)
  ORDER BY t.scheduled_start DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE teleconsultas ENABLE ROW LEVEL SECURITY;

-- Política de leitura: pacientes e terapeutas podem ver suas próprias teleconsultas
CREATE POLICY "Users can view their own teleconsultas"
  ON teleconsultas FOR SELECT
  USING (
    auth.uid() = patient_id OR
    auth.uid() = therapist_id OR
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'therapist')
    )
  );

-- Política de criação: apenas terapeutas e admins
CREATE POLICY "Therapists can create teleconsultas"
  ON teleconsultas FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'therapist')
    )
  );

-- Política de atualização: participantes podem atualizar
CREATE POLICY "Participants can update teleconsultas"
  ON teleconsultas FOR UPDATE
  USING (
    auth.uid() = patient_id OR
    auth.uid() = therapist_id
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE teleconsultas IS 'Sistema de teleconsultas com integração Jitsi Meet';
COMMENT ON COLUMN teleconsultas.room_name IS 'Nome único da sala Jitsi';
COMMENT ON COLUMN teleconsultas.jwt_token IS 'Token JWT para autenticação Jitsi (opcional)';
COMMENT ON COLUMN teleconsultas.moderator_password IS 'Senha do moderador (terapeuta)';
COMMENT ON COLUMN teleconsultas.participant_password IS 'Senha do participante (paciente)';
