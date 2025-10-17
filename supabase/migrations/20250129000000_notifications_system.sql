-- =====================================================
-- MIGRATION: 004 - Sistema de Notificações
-- Description: Notificações em tempo real, emails, SMS e WhatsApp
-- Created: 2025-01-17
-- Requirements: Vercel Pro + Supabase Pro + Twilio
-- =====================================================

-- =====================================================
-- 1. NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- User Reference
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Notification Details
  type TEXT NOT NULL CHECK (type IN (
    'appointment_reminder_24h',
    'appointment_reminder_2h',
    'appointment_confirmed',
    'appointment_cancelled',
    'appointment_rescheduled',
    'payment_received',
    'payment_due',
    'exercise_assigned',
    'message_received',
    'system_announcement',
    'achievement_unlocked'
  )),

  title TEXT NOT NULL,
  message TEXT NOT NULL,

  -- Status
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,

  -- Additional Data (JSONB for flexibility)
  data JSONB DEFAULT '{}'::jsonb,
  -- Format: {"appointment_id": "uuid", "patient_name": "João", "time": "14:00"}

  -- Delivery Channels
  sent_via TEXT[] DEFAULT '{}',
  -- Values: ['email', 'sms', 'whatsapp', 'push', 'in_app']

  -- Scheduling
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,

  -- Actions
  action_url TEXT, -- URL para ação (ex: /agenda/appointment/123)
  action_label TEXT, -- Label do botão (ex: "Ver Agendamento")

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Notificações podem expirar
  deleted_at TIMESTAMPTZ -- Soft delete
);

-- Indexes para performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON notifications(scheduled_for) WHERE sent_at IS NULL AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);

-- =====================================================
-- 2. NOTIFICATION PREFERENCES
-- =====================================================

-- Adicionar preferências de notificação à tabela users
DO $$ BEGIN
  ALTER TABLE users ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "email": true,
    "sms": true,
    "whatsapp": false,
    "push": true,
    "appointment_reminder_24h": true,
    "appointment_reminder_2h": true,
    "appointment_confirmed": true,
    "appointment_cancelled": true,
    "payment_received": true,
    "payment_due": true,
    "marketing": false,
    "system": true
  }'::jsonb;
EXCEPTION
  WHEN duplicate_column THEN null;
END $$;

-- Index para buscar preferências
CREATE INDEX IF NOT EXISTS idx_users_notification_prefs ON users((notification_preferences));

-- =====================================================
-- 3. NOTIFICATION TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Template Info
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL, -- Mesmo tipo da notification

  -- Content
  subject_template TEXT NOT NULL, -- Para email
  email_template TEXT, -- HTML template
  sms_template TEXT, -- Texto curto
  push_template TEXT, -- Texto para push

  -- Variables
  variables TEXT[] DEFAULT '{}',
  -- Ex: ['patientName', 'appointmentTime', 'therapistName']

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Seed templates padrão
INSERT INTO notification_templates (name, type, subject_template, email_template, sms_template, push_template, variables) VALUES
(
  'appointment_reminder_24h',
  'appointment_reminder_24h',
  'Lembrete: Consulta amanhã às {{time}}',
  '<h1>Olá {{patientName}}!</h1><p>Lembramos que você tem uma consulta agendada:</p><p><strong>Data:</strong> {{date}}</p><p><strong>Hora:</strong> {{time}}</p><p><strong>Profissional:</strong> {{therapistName}}</p>',
  'Lembrete: Consulta amanhã às {{time}} com {{therapistName}}. DuduFisio',
  'Consulta amanhã às {{time}} com {{therapistName}}',
  ARRAY['patientName', 'date', 'time', 'therapistName', 'location']
),
(
  'appointment_confirmed',
  'appointment_confirmed',
  'Consulta confirmada para {{date}}',
  '<h1>Consulta Confirmada!</h1><p>Olá {{patientName}},</p><p>Sua consulta foi confirmada:</p><p><strong>Data:</strong> {{date}}</p><p><strong>Hora:</strong> {{time}}</p>',
  'Consulta confirmada para {{date}} às {{time}}. DuduFisio',
  'Consulta confirmada para {{date}} às {{time}}',
  ARRAY['patientName', 'date', 'time', 'therapistName']
),
(
  'appointment_cancelled',
  'appointment_cancelled',
  'Consulta cancelada',
  '<h1>Consulta Cancelada</h1><p>Olá {{patientName}},</p><p>Sua consulta de {{date}} às {{time}} foi cancelada.</p><p>Motivo: {{reason}}</p>',
  'Sua consulta de {{date}} foi cancelada. Entre em contato para reagendar. DuduFisio',
  'Consulta de {{date}} cancelada',
  ARRAY['patientName', 'date', 'time', 'reason']
)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. NOTIFICATION LOG (para auditoria)
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,

  channel TEXT NOT NULL, -- email, sms, whatsapp, push

  -- Status
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),

  -- Provider Info
  provider TEXT, -- twilio, supabase, fcm
  provider_id TEXT, -- ID externo do provedor
  provider_response JSONB,

  -- Error Handling
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_notification ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status, channel);

-- =====================================================
-- 5. FUNCTIONS
-- =====================================================

-- Function: Criar notificação e agendar envio
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_scheduled_for TIMESTAMPTZ DEFAULT NOW(),
  p_channels TEXT[] DEFAULT ARRAY['in_app']
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
  v_user_prefs JSONB;
BEGIN
  -- Buscar preferências do usuário
  SELECT notification_preferences INTO v_user_prefs
  FROM users
  WHERE id = p_user_id;

  -- Verificar se usuário permite este tipo de notificação
  IF v_user_prefs ? p_type AND (v_user_prefs ->> p_type)::boolean = false THEN
    RETURN NULL; -- Usuário não quer receber este tipo
  END IF;

  -- Criar notificação
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    data,
    scheduled_for,
    sent_via
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_data,
    p_scheduled_for,
    p_channels
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Marcar notificação como lida
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET
    read = TRUE,
    read_at = NOW()
  WHERE id = p_notification_id
    AND user_id = p_user_id
    AND read = FALSE;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Marcar todas como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notifications
  SET
    read = TRUE,
    read_at = NOW()
  WHERE user_id = p_user_id
    AND read = FALSE
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Limpar notificações antigas
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Soft delete de notificações lidas com mais de 30 dias
  UPDATE notifications
  SET deleted_at = NOW()
  WHERE read = TRUE
    AND created_at < NOW() - INTERVAL '30 days'
    AND deleted_at IS NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Obter contagem de não lidas
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = p_user_id
    AND read = FALSE
    AND deleted_at IS NULL
    AND (expires_at IS NULL OR expires_at > NOW());

  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. RLS (Row Level Security)
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

-- Notifications: Usuários só veem suas próprias
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()))
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (TRUE); -- Edge functions podem inserir

CREATE POLICY "Admins can manage all notifications"
  ON notifications FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Templates: Todos podem ler, só admin pode escrever
CREATE POLICY "Anyone can view active templates"
  ON notification_templates FOR SELECT
  USING (is_active = TRUE);

CREATE POLICY "Admins can manage templates"
  ON notification_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- Logs: Só admins podem ver
CREATE POLICY "Admins can view logs"
  ON notification_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE auth_id = auth.uid() AND role = 'admin'
    )
  );

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at em templates
DROP TRIGGER IF EXISTS update_notification_templates_updated_at ON notification_templates;
CREATE TRIGGER update_notification_templates_updated_at
  BEFORE UPDATE ON notification_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. GRANTS
-- =====================================================

-- Grant para funções
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;

-- =====================================================
-- END OF MIGRATION
-- =====================================================

COMMENT ON TABLE notifications IS 'Sistema de notificações em tempo real com múltiplos canais';
COMMENT ON TABLE notification_templates IS 'Templates para emails, SMS e push notifications';
COMMENT ON TABLE notification_logs IS 'Log de auditoria de envio de notificações';
