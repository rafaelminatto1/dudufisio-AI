-- =====================================================
-- FASE 5: SISTEMA DE MENSAGENS PACIENTE-TERAPEUTA
-- Portal do Paciente Melhorado
-- =====================================================

-- Tabela de Mensagens
CREATE TABLE IF NOT EXISTS patient_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Remetente e Destinatário
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Conteúdo
  subject TEXT,
  message TEXT NOT NULL CHECK (length(message) <= 5000),

  -- Tipo de mensagem
  message_type TEXT DEFAULT 'general' CHECK (
    message_type IN ('general', 'appointment_request', 'question', 'feedback', 'urgent')
  ),

  -- Status
  status TEXT DEFAULT 'unread' CHECK (
    status IN ('unread', 'read', 'archived', 'deleted')
  ),

  -- Thread (para respostas)
  thread_id UUID REFERENCES patient_messages(id) ON DELETE SET NULL,
  is_reply BOOLEAN DEFAULT FALSE,

  -- Anexos (URLs)
  attachments JSONB DEFAULT '[]',

  -- Prioridade
  priority TEXT DEFAULT 'normal' CHECK (
    priority IN ('low', 'normal', 'high', 'urgent')
  ),

  -- Timestamps
  read_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_messages_sender ON patient_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON patient_messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_messages_thread ON patient_messages(thread_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON patient_messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created ON patient_messages(created_at DESC);

-- Trigger updated_at
CREATE OR REPLACE FUNCTION update_patient_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER patient_messages_updated_at
  BEFORE UPDATE ON patient_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_patient_messages_updated_at();

-- =====================================================
-- MELHORIAS NO SISTEMA DE AGENDAMENTO
-- Sistema de SOLICITAÇÃO (não auto-agendamento)
-- =====================================================

-- Tabela para solicitações de agendamento do paciente
CREATE TABLE IF NOT EXISTS appointment_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Quem solicita
  patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  therapist_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Preferências do paciente
  preferred_date TIMESTAMPTZ NOT NULL,
  preferred_time_slot TEXT, -- 'morning', 'afternoon', 'evening'
  alternative_dates JSONB DEFAULT '[]', -- Array de datas alternativas

  -- Motivo da consulta
  reason TEXT NOT NULL CHECK (length(reason) <= 1000),
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'high', 'urgent')),

  -- Status
  status TEXT DEFAULT 'pending' CHECK (
    status IN ('pending', 'approved', 'rejected', 'cancelled')
  ),

  -- Resposta do terapeuta
  response_message TEXT,
  approved_date TIMESTAMPTZ, -- Data aprovada pelo terapeuta
  appointment_id UUID REFERENCES appointments(id), -- Se aprovado, link para appointment criado

  -- Auditoria
  responded_by UUID REFERENCES users(id),
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_patient ON appointment_requests(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_therapist ON appointment_requests(therapist_id);
CREATE INDEX IF NOT EXISTS idx_appointment_requests_status ON appointment_requests(status);

-- =====================================================
-- RPC FUNCTIONS
-- =====================================================

-- Enviar mensagem
CREATE OR REPLACE FUNCTION send_patient_message(
  p_recipient_id UUID,
  p_subject TEXT,
  p_message TEXT,
  p_message_type TEXT DEFAULT 'general',
  p_priority TEXT DEFAULT 'normal',
  p_thread_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
  v_sender_id UUID;
BEGIN
  v_sender_id := auth.uid();

  IF v_sender_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Criar mensagem
  INSERT INTO patient_messages (
    sender_id,
    recipient_id,
    subject,
    message,
    message_type,
    priority,
    thread_id,
    is_reply
  ) VALUES (
    v_sender_id,
    p_recipient_id,
    p_subject,
    p_message,
    p_message_type,
    p_priority,
    p_thread_id,
    p_thread_id IS NOT NULL
  )
  RETURNING id INTO v_message_id;

  -- Criar notificação para o destinatário
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    p_recipient_id,
    'new_message',
    CASE
      WHEN p_thread_id IS NOT NULL THEN 'Nova Resposta'
      ELSE 'Nova Mensagem'
    END,
    substring(p_message from 1 for 100),
    jsonb_build_object('message_id', v_message_id, 'sender_id', v_sender_id)
  );

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Marcar mensagem como lida
CREATE OR REPLACE FUNCTION mark_message_read(p_message_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE patient_messages
  SET
    status = 'read',
    read_at = COALESCE(read_at, NOW())
  WHERE id = p_message_id
    AND recipient_id = auth.uid()
    AND status = 'unread';

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obter mensagens do usuário
CREATE OR REPLACE FUNCTION get_user_messages(
  p_folder TEXT DEFAULT 'inbox', -- 'inbox', 'sent', 'archived'
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE(
  id UUID,
  subject TEXT,
  message TEXT,
  message_type TEXT,
  priority TEXT,
  status TEXT,
  is_reply BOOLEAN,
  thread_id UUID,
  sender_name TEXT,
  recipient_name TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ
) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();

  RETURN QUERY
  SELECT
    m.id,
    m.subject,
    m.message,
    m.message_type,
    m.priority,
    m.status,
    m.is_reply,
    m.thread_id,
    sender.full_name as sender_name,
    recipient.full_name as recipient_name,
    m.read_at,
    m.created_at
  FROM patient_messages m
  JOIN users sender ON m.sender_id = sender.id
  JOIN users recipient ON m.recipient_id = recipient.id
  WHERE
    CASE
      WHEN p_folder = 'inbox' THEN m.recipient_id = v_user_id AND m.status != 'deleted'
      WHEN p_folder = 'sent' THEN m.sender_id = v_user_id
      WHEN p_folder = 'archived' THEN m.recipient_id = v_user_id AND m.status = 'archived'
      ELSE FALSE
    END
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Solicitar agendamento (paciente envia SOLICITAÇÃO)
CREATE OR REPLACE FUNCTION request_appointment(
  p_therapist_id UUID,
  p_preferred_date TIMESTAMPTZ,
  p_preferred_time_slot TEXT,
  p_reason TEXT,
  p_urgency TEXT DEFAULT 'normal',
  p_alternative_dates JSONB DEFAULT '[]'
)
RETURNS UUID AS $$
DECLARE
  v_request_id UUID;
  v_patient_id UUID;
BEGIN
  v_patient_id := auth.uid();

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Usuário não autenticado';
  END IF;

  -- Verificar se é paciente
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = v_patient_id AND role = 'patient'
  ) THEN
    RAISE EXCEPTION 'Apenas pacientes podem solicitar agendamentos';
  END IF;

  -- Criar SOLICITAÇÃO (NÃO appointment)
  INSERT INTO appointment_requests (
    patient_id,
    therapist_id,
    preferred_date,
    preferred_time_slot,
    alternative_dates,
    reason,
    urgency,
    status
  ) VALUES (
    v_patient_id,
    p_therapist_id,
    p_preferred_date,
    p_preferred_time_slot,
    p_alternative_dates,
    p_reason,
    p_urgency,
    'pending'
  )
  RETURNING id INTO v_request_id;

  -- Notificar terapeuta
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    p_therapist_id,
    'appointment_request',
    'Nova Solicitação de Agendamento',
    substring(p_reason from 1 for 100),
    jsonb_build_object('request_id', v_request_id, 'urgency', p_urgency)
  );

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aprovar/Rejeitar solicitação (terapeuta decide)
CREATE OR REPLACE FUNCTION respond_appointment_request(
  p_request_id UUID,
  p_approved BOOLEAN,
  p_approved_date TIMESTAMPTZ DEFAULT NULL,
  p_response_message TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_therapist_id UUID;
  v_patient_id UUID;
  v_appointment_id UUID;
  v_preferred_date TIMESTAMPTZ;
BEGIN
  v_therapist_id := auth.uid();

  -- Verificar se é terapeuta
  IF NOT EXISTS (
    SELECT 1 FROM users
    WHERE id = v_therapist_id AND role IN ('therapist', 'admin')
  ) THEN
    RAISE EXCEPTION 'Apenas terapeutas podem responder solicitações';
  END IF;

  -- Buscar dados da solicitação
  SELECT patient_id, preferred_date
  INTO v_patient_id, v_preferred_date
  FROM appointment_requests
  WHERE id = p_request_id AND therapist_id = v_therapist_id;

  IF v_patient_id IS NULL THEN
    RAISE EXCEPTION 'Solicitação não encontrada';
  END IF;

  IF p_approved THEN
    -- CRIAR APPOINTMENT REAL (só terapeuta pode criar)
    INSERT INTO appointments (
      patient_id,
      therapist_id,
      scheduled_date,
      duration,
      status
    ) VALUES (
      v_patient_id,
      v_therapist_id,
      COALESCE(p_approved_date, v_preferred_date),
      60, -- padrão 60min
      'confirmed'
    )
    RETURNING id INTO v_appointment_id;

    -- Atualizar solicitação
    UPDATE appointment_requests
    SET
      status = 'approved',
      appointment_id = v_appointment_id,
      approved_date = COALESCE(p_approved_date, v_preferred_date),
      response_message = p_response_message,
      responded_by = v_therapist_id,
      responded_at = NOW()
    WHERE id = p_request_id;

    -- Notificar paciente
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      v_patient_id,
      'appointment_approved',
      'Agendamento Aprovado!',
      COALESCE(p_response_message, 'Sua solicitação foi aprovada.'),
      jsonb_build_object('appointment_id', v_appointment_id, 'request_id', p_request_id)
    );
  ELSE
    -- Rejeitar
    UPDATE appointment_requests
    SET
      status = 'rejected',
      response_message = p_response_message,
      responded_by = v_therapist_id,
      responded_at = NOW()
    WHERE id = p_request_id;

    -- Notificar paciente
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      v_patient_id,
      'appointment_rejected',
      'Solicitação Recusada',
      COALESCE(p_response_message, 'Sua solicitação não pôde ser atendida.'),
      jsonb_build_object('request_id', p_request_id)
    );
  END IF;

  RETURN v_appointment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE patient_messages ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver mensagens que enviaram ou receberam
CREATE POLICY "Users can view their messages"
  ON patient_messages FOR SELECT
  USING (
    auth.uid() = sender_id OR
    auth.uid() = recipient_id
  );

-- Usuários podem enviar mensagens
CREATE POLICY "Users can send messages"
  ON patient_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- Usuários podem atualizar suas mensagens recebidas
CREATE POLICY "Users can update received messages"
  ON patient_messages FOR UPDATE
  USING (auth.uid() = recipient_id);

-- RLS para appointment_requests
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their appointment requests"
  ON appointment_requests FOR SELECT
  USING (
    auth.uid() = patient_id OR
    auth.uid() = therapist_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Patients can create appointment requests"
  ON appointment_requests FOR INSERT
  WITH CHECK (
    auth.uid() = patient_id AND
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'patient')
  );

CREATE POLICY "Therapists can update appointment requests"
  ON appointment_requests FOR UPDATE
  USING (
    auth.uid() = therapist_id OR
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE patient_messages IS 'Sistema de mensagens entre pacientes e terapeutas';
COMMENT ON TABLE appointment_requests IS 'Solicitações de agendamento enviadas por pacientes (não são appointments reais)';
COMMENT ON FUNCTION send_patient_message IS 'Envia mensagem e cria notificação';
COMMENT ON FUNCTION request_appointment IS 'Paciente SOLICITA agendamento (terapeuta deve aprovar)';
COMMENT ON FUNCTION respond_appointment_request IS 'Terapeuta aprova/rejeita e CRIA appointment se aprovado';
