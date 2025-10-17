-- =====================================================
-- MIGRATION: Notifications System - Complementary
-- Description: Adiciona templates, logs e funções
-- =====================================================

-- =====================================================
-- 1. NOTIFICATION TEMPLATES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  subject_template TEXT NOT NULL,
  email_template TEXT,
  sms_template TEXT,
  push_template TEXT,
  variables TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Seed templates
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
-- 2. NOTIFICATION LOGS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  notification_id UUID REFERENCES notifications(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'sent', 'failed', 'bounced')),
  provider TEXT,
  provider_id TEXT,
  provider_response JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_notification_logs_notification ON notification_logs(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_logs_status ON notification_logs(status, channel);

-- =====================================================
-- 3. NOTIFICATION PREFERENCES (on users table)
-- =====================================================

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

CREATE INDEX IF NOT EXISTS idx_users_notification_prefs ON users((notification_preferences));

-- =====================================================
-- 4. FUNCTIONS
-- =====================================================

-- Function: Criar notificação
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
  SELECT notification_preferences INTO v_user_prefs
  FROM users WHERE id = p_user_id;

  IF v_user_prefs ? p_type AND (v_user_prefs ->> p_type)::boolean = false THEN
    RETURN NULL;
  END IF;

  INSERT INTO notifications (
    user_id, type, title, message, data, scheduled_for, sent_via
  ) VALUES (
    p_user_id, p_type, p_title, p_message, p_data, p_scheduled_for, p_channels
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Marcar como lida
CREATE OR REPLACE FUNCTION mark_notification_read(
  p_notification_id UUID,
  p_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE id = p_notification_id AND user_id = p_user_id AND read = FALSE;
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Function: Marcar todas como lidas
CREATE OR REPLACE FUNCTION mark_all_notifications_read(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE notifications
  SET read = TRUE, read_at = NOW()
  WHERE user_id = p_user_id AND read = FALSE;
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Limpar antigas
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  UPDATE notifications
  SET deleted_at = NOW()
  WHERE read = TRUE AND created_at < NOW() - INTERVAL '30 days';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- Function: Contagem de não lidas
CREATE OR REPLACE FUNCTION get_unread_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM notifications
  WHERE user_id = p_user_id AND read = FALSE;
  RETURN v_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. RLS POLICIES
-- =====================================================

ALTER TABLE notification_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active templates" ON notification_templates;
CREATE POLICY "Anyone can view active templates"
  ON notification_templates FOR SELECT
  USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage templates" ON notification_templates;
CREATE POLICY "Admins can manage templates"
  ON notification_templates FOR ALL
  USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Admins can view logs" ON notification_logs;
CREATE POLICY "Admins can view logs"
  ON notification_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin'));

-- =====================================================
-- 6. GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION mark_notification_read TO authenticated;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_count TO authenticated;
