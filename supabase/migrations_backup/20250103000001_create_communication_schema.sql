-- Communication System Schema Migration
-- Creates comprehensive database structure for omnichannel communication system

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types for communication system
CREATE TYPE communication_channel AS ENUM (
  'email',
  'sms',
  'whatsapp',
  'push'
);

CREATE TYPE message_status AS ENUM (
  'draft',
  'queued',
  'processing',
  'sent',
  'delivered',
  'read',
  'failed',
  'cancelled',
  'retry_scheduled'
);

CREATE TYPE message_type AS ENUM (
  'appointment_confirmation',
  'appointment_reminder',
  'appointment_cancellation',
  'payment_reminder',
  'welcome',
  'birthday_wishes',
  'treatment_completion',
  'no_show_followup',
  'generic'
);

CREATE TYPE automation_trigger_type AS ENUM (
  'appointment',
  'patient',
  'payment',
  'system'
);

CREATE TYPE automation_action_type AS ENUM (
  'send_message',
  'schedule_message',
  'update_patient',
  'log_event',
  'webhook',
  'conditional',
  'delay'
);

CREATE TYPE template_category AS ENUM (
  'appointment',
  'payment',
  'marketing',
  'system',
  'general'
);

-- Recipients table (extends patient data for communication)
CREATE TABLE IF NOT EXISTS communication_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  push_token TEXT,
  preferred_channel communication_channel,
  preferred_locale VARCHAR(10) DEFAULT 'pt-BR',
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
  opt_out_channels communication_channel[] DEFAULT '{}',
  communication_preferences JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message templates table
CREATE TABLE IF NOT EXISTS message_templates (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type message_type NOT NULL,
  category template_category DEFAULT 'general',
  subject TEXT,
  body TEXT NOT NULL,
  html TEXT,
  whatsapp TEXT,
  sms TEXT,
  email TEXT,
  push TEXT,
  variables TEXT[] DEFAULT '{}',
  locale VARCHAR(10) DEFAULT 'pt-BR',
  is_active BOOLEAN DEFAULT true,
  version INTEGER DEFAULT 1,
  created_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table - stores all sent messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES communication_recipients(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  template_id VARCHAR(100) REFERENCES message_templates(id) ON DELETE SET NULL,
  type message_type NOT NULL,
  channel communication_channel NOT NULL,
  status message_status DEFAULT 'draft',
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),

  -- Message content
  subject TEXT,
  body TEXT NOT NULL,
  html_content TEXT,

  -- Delivery information
  external_message_id VARCHAR(255), -- ID from external service (Twilio, etc)
  scheduled_for TIMESTAMP WITH TIME ZONE,
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,

  -- Cost and analytics
  cost DECIMAL(10,4) DEFAULT 0,
  delivery_attempts INTEGER DEFAULT 0,
  last_attempt_at TIMESTAMP WITH TIME ZONE,

  -- Error handling
  error_code VARCHAR(50),
  error_message TEXT,

  -- Metadata and tracking
  metadata JSONB DEFAULT '{}',
  automation_rule_id UUID,
  campaign_id UUID,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message delivery attempts table
CREATE TABLE IF NOT EXISTS message_delivery_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  channel communication_channel NOT NULL,
  attempt_number INTEGER NOT NULL,
  attempted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Result information
  success BOOLEAN NOT NULL,
  status_code VARCHAR(20),
  response_message TEXT,
  external_id VARCHAR(255),

  -- Cost and timing
  cost DECIMAL(10,4) DEFAULT 0,
  duration_ms INTEGER,

  -- Error details
  error_code VARCHAR(50),
  error_message TEXT,
  retryable BOOLEAN DEFAULT true,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation rules table
CREATE TABLE IF NOT EXISTS automation_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type automation_trigger_type NOT NULL,
  trigger_config JSONB NOT NULL, -- trigger configuration
  conditions JSONB DEFAULT '[]', -- array of conditions
  condition_operator VARCHAR(3) DEFAULT 'AND' CHECK (condition_operator IN ('AND', 'OR')),
  actions JSONB NOT NULL, -- array of actions
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  is_active BOOLEAN DEFAULT true,

  -- Execution limits
  max_executions_per_day INTEGER,
  execution_count_today INTEGER DEFAULT 0,
  last_execution_date DATE,

  -- Metadata
  created_by UUID,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Automation executions table (audit log)
CREATE TABLE IF NOT EXISTS automation_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  rule_id UUID REFERENCES automation_rules(id) ON DELETE CASCADE,
  triggered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failure', 'partial')),

  -- Context information
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  trigger_event_data JSONB,

  -- Execution details
  actions_executed INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  duration_ms INTEGER,

  -- Error information
  error_message TEXT,
  error_details JSONB,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Communication analytics table
CREATE TABLE IF NOT EXISTS communication_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,
  channel communication_channel NOT NULL,
  message_type message_type,

  -- Volume metrics
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,

  -- Performance metrics
  delivery_rate DECIMAL(5,4), -- percentage
  read_rate DECIMAL(5,4), -- percentage
  average_delivery_time INTEGER, -- milliseconds

  -- Cost metrics
  total_cost DECIMAL(10,4) DEFAULT 0,
  cost_per_message DECIMAL(10,4) DEFAULT 0,

  -- Engagement metrics
  click_through_rate DECIMAL(5,4),
  conversion_rate DECIMAL(5,4),
  opt_out_rate DECIMAL(5,4),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(date, channel, message_type)
);

-- Opt-out tracking table
CREATE TABLE IF NOT EXISTS communication_opt_outs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_id UUID REFERENCES communication_recipients(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  channel communication_channel NOT NULL,
  opted_out_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',

  UNIQUE(recipient_id, channel)
);

-- Communication preferences table
CREATE TABLE IF NOT EXISTS communication_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,

  -- Channel preferences
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  whatsapp_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,

  -- Message type preferences
  appointment_notifications BOOLEAN DEFAULT true,
  reminder_notifications BOOLEAN DEFAULT true,
  payment_notifications BOOLEAN DEFAULT true,
  marketing_notifications BOOLEAN DEFAULT false,
  birthday_messages BOOLEAN DEFAULT true,

  -- Timing preferences
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '08:00',
  preferred_days INTEGER[] DEFAULT '{1,2,3,4,5}', -- Mon-Fri
  timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',

  -- Frequency limits
  max_messages_per_day INTEGER DEFAULT 5,
  max_messages_per_week INTEGER DEFAULT 20,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(patient_id)
);

-- Message queue table for Bull queue integration
CREATE TABLE IF NOT EXISTS message_queue_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  queue_name VARCHAR(100) NOT NULL,
  job_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'waiting',
  priority INTEGER DEFAULT 5,
  scheduled_for TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  progress INTEGER DEFAULT 0,
  result JSONB,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook endpoints table
CREATE TABLE IF NOT EXISTS communication_webhooks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- which events to send
  channels communication_channel[] DEFAULT '{}', -- which channels to listen for
  is_active BOOLEAN DEFAULT true,

  -- Security
  secret_token VARCHAR(255),
  verify_ssl BOOLEAN DEFAULT true,

  -- Configuration
  timeout_ms INTEGER DEFAULT 30000,
  retry_attempts INTEGER DEFAULT 3,
  headers JSONB DEFAULT '{}',

  -- Statistics
  total_deliveries INTEGER DEFAULT 0,
  successful_deliveries INTEGER DEFAULT 0,
  failed_deliveries INTEGER DEFAULT 0,
  last_delivery_at TIMESTAMP WITH TIME ZONE,

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Webhook delivery log
CREATE TABLE IF NOT EXISTS webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  webhook_id UUID REFERENCES communication_webhooks(id) ON DELETE CASCADE,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  event_type VARCHAR(100) NOT NULL,

  -- Request details
  request_url TEXT NOT NULL,
  request_method VARCHAR(10) DEFAULT 'POST',
  request_headers JSONB,
  request_body JSONB,

  -- Response details
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  response_time_ms INTEGER,

  -- Delivery status
  success BOOLEAN NOT NULL,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,

  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'recipient_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_recipient_id ON public.messages(recipient_id)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'patient_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_patient_id ON public.messages(patient_id)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'status'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_status ON public.messages(status)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'channel'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_channel ON public.messages(channel)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'scheduled_for'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_scheduled_for ON public.messages(scheduled_for)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'created_at'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at)';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'messages' AND column_name = 'template_id'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_messages_template_id ON public.messages(template_id)';
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_delivery_attempts_message_id ON message_delivery_attempts(message_id);
CREATE INDEX IF NOT EXISTS idx_delivery_attempts_attempted_at ON message_delivery_attempts(attempted_at);

CREATE INDEX IF NOT EXISTS idx_automation_rules_trigger_type ON automation_rules(trigger_type);
CREATE INDEX IF NOT EXISTS idx_automation_rules_is_active ON automation_rules(is_active);

CREATE INDEX IF NOT EXISTS idx_automation_executions_rule_id ON automation_executions(rule_id);
CREATE INDEX IF NOT EXISTS idx_automation_executions_triggered_at ON automation_executions(triggered_at);
CREATE INDEX IF NOT EXISTS idx_automation_executions_patient_id ON automation_executions(patient_id);

CREATE INDEX IF NOT EXISTS idx_analytics_date_channel ON communication_analytics(date, channel);
CREATE INDEX IF NOT EXISTS idx_analytics_date ON communication_analytics(date);

CREATE INDEX IF NOT EXISTS idx_opt_outs_recipient_channel ON communication_opt_outs(recipient_id, channel);
CREATE INDEX IF NOT EXISTS idx_opt_outs_patient_id ON communication_opt_outs(patient_id);

CREATE INDEX IF NOT EXISTS idx_queue_jobs_status ON message_queue_jobs(status);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_scheduled_for ON message_queue_jobs(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_message_id ON message_queue_jobs(message_id);

CREATE INDEX IF NOT EXISTS idx_recipients_patient_id ON communication_recipients(patient_id);
CREATE INDEX IF NOT EXISTS idx_recipients_email ON communication_recipients(email);
CREATE INDEX IF NOT EXISTS idx_recipients_phone ON communication_recipients(phone);

CREATE INDEX IF NOT EXISTS idx_templates_type ON message_templates(type);
CREATE INDEX IF NOT EXISTS idx_templates_is_active ON message_templates(is_active);
CREATE INDEX IF NOT EXISTS idx_templates_locale ON message_templates(locale);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_communication_recipients_updated_at BEFORE UPDATE ON communication_recipients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_automation_rules_updated_at BEFORE UPDATE ON automation_rules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_preferences_updated_at BEFORE UPDATE ON communication_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_message_queue_jobs_updated_at BEFORE UPDATE ON message_queue_jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_communication_webhooks_updated_at BEFORE UPDATE ON communication_webhooks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE communication_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_delivery_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_opt_outs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_queue_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE communication_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (can be customized based on auth requirements)
CREATE POLICY "Users can view their own communication data" ON communication_recipients
  FOR SELECT USING (auth.uid()::text = patient_id::text);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='messages' AND policyname='Users can view their own messages'
  ) THEN
    CREATE POLICY "Users can view their own messages" ON messages
      FOR SELECT USING ((select auth.uid())::text = patient_id::text);
  END IF;
END$$;

CREATE POLICY "Users can view their own preferences" ON communication_preferences
  FOR SELECT USING (auth.uid()::text = patient_id::text);

-- Admin policies (assuming admin role exists)
CREATE POLICY "Admins can manage all communication data" ON communication_recipients
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage all messages" ON messages
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage templates" ON message_templates
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins can manage automation rules" ON automation_rules
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Analytics functions
CREATE OR REPLACE FUNCTION get_communication_metrics(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  end_date DATE DEFAULT CURRENT_DATE,
  channel_filter communication_channel DEFAULT NULL
)
RETURNS TABLE(
  date DATE,
  channel communication_channel,
  total_sent BIGINT,
  total_delivered BIGINT,
  total_failed BIGINT,
  delivery_rate DECIMAL,
  total_cost DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.created_at::DATE as date,
    m.channel,
    COUNT(*) as total_sent,
    COUNT(*) FILTER (WHERE m.status = 'delivered') as total_delivered,
    COUNT(*) FILTER (WHERE m.status = 'failed') as total_failed,
    ROUND(
      COUNT(*) FILTER (WHERE m.status = 'delivered')::DECIMAL /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) as delivery_rate,
    COALESCE(SUM(m.cost), 0) as total_cost
  FROM messages m
  WHERE m.created_at::DATE BETWEEN start_date AND end_date
    AND (channel_filter IS NULL OR m.channel = channel_filter)
  GROUP BY m.created_at::DATE, m.channel
  ORDER BY date DESC, channel;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate daily automation execution stats
CREATE OR REPLACE FUNCTION get_automation_stats(
  start_date DATE DEFAULT CURRENT_DATE - INTERVAL '7 days',
  end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(
  date DATE,
  rule_name VARCHAR(255),
  executions BIGINT,
  success_rate DECIMAL,
  messages_sent BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ae.triggered_at::DATE as date,
    ar.name as rule_name,
    COUNT(*) as executions,
    ROUND(
      COUNT(*) FILTER (WHERE ae.status = 'success')::DECIMAL /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) as success_rate,
    COALESCE(SUM(ae.messages_sent), 0) as messages_sent
  FROM automation_executions ae
  JOIN automation_rules ar ON ae.rule_id = ar.id
  WHERE ae.triggered_at::DATE BETWEEN start_date AND end_date
  GROUP BY ae.triggered_at::DATE, ar.name
  ORDER BY date DESC, rule_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update daily execution count for automation rules
CREATE OR REPLACE FUNCTION update_automation_rule_execution_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE automation_rules
  SET
    execution_count_today = CASE
      WHEN last_execution_date = CURRENT_DATE THEN execution_count_today + 1
      ELSE 1
    END,
    last_execution_date = CURRENT_DATE
  WHERE id = NEW.rule_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER automation_execution_counter
  AFTER INSERT ON automation_executions
  FOR EACH ROW EXECUTE FUNCTION update_automation_rule_execution_count();

-- Function to cleanup old data
CREATE OR REPLACE FUNCTION cleanup_old_communication_data(
  days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - (days_to_keep || ' days')::INTERVAL;

  -- Delete old delivery attempts
  DELETE FROM message_delivery_attempts
  WHERE attempted_at < cutoff_date;
  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Delete old webhook deliveries
  DELETE FROM webhook_deliveries
  WHERE delivered_at < cutoff_date;

  -- Delete old queue jobs
  DELETE FROM message_queue_jobs
  WHERE created_at < cutoff_date AND status IN ('completed', 'failed');

  -- Delete old automation executions
  DELETE FROM automation_executions
  WHERE triggered_at < cutoff_date;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup job (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-communication-data', '0 2 * * 0', 'SELECT cleanup_old_communication_data(90);');

-- Insert default message templates
INSERT INTO message_templates (id, name, type, category, subject, body, whatsapp, sms, push, variables, locale, is_active, version) VALUES
(
  'appointment_confirmation',
  'Confirmação de Consulta',
  'appointment_confirmation',
  'appointment',
  'Confirmação de Consulta - {{appointment.type}}',
  'Olá {{patient.name}},

Sua consulta foi confirmada com sucesso!

📅 **Detalhes da Consulta:**
• Tipo: {{appointment.type}}
• Data: {{formatDate appointment.date "dd/MM/yyyy"}}
• Horário: {{formatDate appointment.date "HH:mm"}}
• Terapeuta: {{appointment.therapist}}

Para cancelar ou reagendar, entre em contato conosco.

Atenciosamente,
{{clinic.name}}',
  '🏥 *{{clinic.name}}*

Olá *{{patient.name}}*!

✅ Sua consulta foi confirmada:

📅 *{{formatDate appointment.date "dd/MM/yyyy"}}* às *{{formatDate appointment.date "HH:mm"}}*
👨‍⚕️ {{appointment.therapist}}
🏥 {{appointment.type}}

Para cancelar ou reagendar, responda esta mensagem.',
  '{{clinic.name}}: Consulta confirmada para {{formatDate appointment.date "dd/MM HH:mm"}} com {{appointment.therapist}}.',
  'Consulta confirmada para {{formatDate appointment.date "dd/MM"}} às {{formatDate appointment.date "HH:mm"}}',
  ARRAY['patient', 'appointment', 'clinic'],
  'pt-BR',
  true,
  1
),
(
  'appointment_reminder',
  'Lembrete de Consulta',
  'appointment_reminder',
  'appointment',
  'Lembrete: Consulta amanhã - {{appointment.type}}',
  'Olá {{patient.name}},

Este é um lembrete sobre sua consulta agendada para amanhã.

📅 **Detalhes:**
• Data: {{formatDate appointment.date "dd/MM/yyyy"}}
• Horário: {{formatDate appointment.date "HH:mm"}}
• Terapeuta: {{appointment.therapist}}

Por favor, chegue 10 minutos antes do horário marcado.

{{clinic.name}}',
  '🔔 *Lembrete de Consulta*

Olá {{patient.name}}!

Sua consulta é *amanhã*:
📅 {{formatDate appointment.date "dd/MM"}} às {{formatDate appointment.date "HH:mm"}}
👨‍⚕️ {{appointment.therapist}}

Por favor, chegue 10 min antes.

{{clinic.name}}',
  'Lembrete {{clinic.name}}: Consulta amanha {{formatDate appointment.date "dd/MM HH:mm"}} com {{appointment.therapist}}.',
  'Lembrete: Consulta amanhã às {{formatDate appointment.date "HH:mm"}}',
  ARRAY['patient', 'appointment', 'clinic'],
  'pt-BR',
  true,
  1
);

-- Create a view for message analytics
DO $$
DECLARE
  has_channel boolean;
  has_type boolean;
  view_sql text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='channel'
  ) INTO has_channel;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='messages' AND column_name='type'
  ) INTO has_type;

  view_sql := 'CREATE OR REPLACE VIEW public.communication_dashboard AS
  SELECT
    DATE_TRUNC(''day'', COALESCE(m.sent_at, m.delivered_at, m.read_at)) as date,
    ' || CASE WHEN has_channel THEN 'm.channel' ELSE 'NULL::text' END || ' as channel,
    ' || CASE WHEN has_type THEN 'm.type' ELSE 'NULL::text' END || ' as message_type,
    COUNT(*) as total_messages,
    COUNT(*) FILTER (WHERE m.status = ''delivered'') as delivered_messages,
    COUNT(*) FILTER (WHERE m.status = ''failed'') as failed_messages,
    COUNT(*) FILTER (WHERE m.status = ''read'') as read_messages,
    ROUND(
      COUNT(*) FILTER (WHERE m.status = ''delivered'')::DECIMAL /
      NULLIF(COUNT(*), 0) * 100,
      2
    ) as delivery_rate,
    ROUND(
      COUNT(*) FILTER (WHERE m.status = ''read'')::DECIMAL /
      NULLIF(COUNT(*) FILTER (WHERE m.status = ''delivered''), 0) * 100,
      2
    ) as read_rate
  FROM public.messages m
  WHERE COALESCE(m.sent_at, m.delivered_at, m.read_at) >= CURRENT_DATE - INTERVAL ''30 days''
  GROUP BY 1,2,3
  ORDER BY date DESC, channel, message_type';

  EXECUTE view_sql;
END$$;

COMMENT ON TABLE communication_recipients IS 'Recipients for communication system, extends patient data';
COMMENT ON TABLE message_templates IS 'Templates for different types of messages across all channels';
COMMENT ON TABLE messages IS 'All messages sent through the communication system';
COMMENT ON TABLE message_delivery_attempts IS 'Individual delivery attempts for messages with retry logic';
COMMENT ON TABLE automation_rules IS 'Rules for automated message sending based on triggers';
COMMENT ON TABLE automation_executions IS 'Audit log of automation rule executions';
COMMENT ON TABLE communication_analytics IS 'Aggregated analytics data for communication metrics';
COMMENT ON TABLE communication_opt_outs IS 'Tracks user opt-outs from specific channels';
COMMENT ON TABLE communication_preferences IS 'User preferences for communication channels and timing';
COMMENT ON TABLE message_queue_jobs IS 'Queue jobs for message processing with Bull/Redis';
COMMENT ON TABLE communication_webhooks IS 'Webhook endpoints for external integrations';
COMMENT ON TABLE webhook_deliveries IS 'Log of webhook delivery attempts';