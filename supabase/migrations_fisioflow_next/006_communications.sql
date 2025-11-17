-- =============================================
-- MIGRATION 006: COMMUNICATIONS SYSTEM
-- messages, templates, campaigns, notifications
-- =============================================

-- =============================================
-- MESSAGE TEMPLATES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Template Details
  name TEXT UNIQUE NOT NULL,
  template_type TEXT NOT NULL CHECK (template_type IN ('whatsapp', 'email', 'sms', 'notificacao')),
  category TEXT CHECK (category IN ('agendamento', 'lembrete', 'confirmacao', 'feedback', 'marketing', 'inatividade', 'aniversario', 'promocao')),
  
  -- Content
  subject TEXT, -- For emails
  content TEXT NOT NULL,
  
  -- Variables
  variables TEXT[] DEFAULT '{}', -- Available variables like {{paciente_nome}}, {{data_consulta}}
  
  -- WhatsApp Business Template
  whatsapp_template_name TEXT, -- Meta approved template name
  whatsapp_template_id TEXT,
  whatsapp_language TEXT DEFAULT 'pt_BR',
  whatsapp_approved BOOLEAN DEFAULT false,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Usage Stats
  times_sent INTEGER DEFAULT 0,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- WHATSAPP MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  phone_number TEXT NOT NULL,
  
  -- Message Content
  message TEXT NOT NULL,
  template_id UUID REFERENCES public.message_templates(id),
  
  -- WhatsApp Business API
  whatsapp_message_id TEXT UNIQUE, -- Meta message ID
  whatsapp_conversation_id TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error
  error_message TEXT,
  error_code TEXT,
  
  -- Type
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'image', 'document', 'video')),
  media_url TEXT,
  
  -- Context
  context_type TEXT, -- 'appointment', 'treatment', 'campaign'
  context_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  sent_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- EMAIL MESSAGES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.email_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  email_address TEXT NOT NULL,
  
  -- Email Content
  subject TEXT NOT NULL,
  body_html TEXT NOT NULL,
  body_text TEXT,
  template_id UUID REFERENCES public.message_templates(id),
  
  -- Email Service (SendGrid/Resend)
  email_service_id TEXT UNIQUE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  bounced_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error
  error_message TEXT,
  
  -- Attachments
  attachments JSONB DEFAULT '[]',
  
  -- Tracking
  open_count INTEGER DEFAULT 0,
  click_count INTEGER DEFAULT 0,
  
  -- Context
  context_type TEXT,
  context_id UUID,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  sent_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE (In-app)
-- =============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Recipient
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  -- Notification Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  notification_type TEXT CHECK (notification_type IN ('info', 'success', 'warning', 'error', 'appointment', 'message', 'achievement', 'system')),
  
  -- Status
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  -- Context
  context_type TEXT,
  context_id UUID,
  
  -- Priority
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  
  -- Expiration
  expires_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CAMPAIGNS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Campaign Details
  name TEXT NOT NULL,
  description TEXT,
  campaign_type TEXT NOT NULL CHECK (campaign_type IN ('whatsapp', 'email', 'sms', 'multi')),
  
  -- Target Audience
  target_audience JSONB NOT NULL, -- Filters: {status: 'ativo', tags: ['tag1'], min_sessions: 5}
  
  -- Content
  template_id UUID REFERENCES public.message_templates(id),
  custom_content TEXT,
  
  -- Scheduling
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'cancelled')),
  scheduled_for TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Recipients
  total_recipients INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_failed INTEGER DEFAULT 0,
  
  -- Analytics
  open_rate DECIMAL(5, 2),
  click_rate DECIMAL(5, 2),
  response_rate DECIMAL(5, 2),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_by UUID NOT NULL REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CAMPAIGN RECIPIENTS TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'opted_out')),
  
  -- Message References
  whatsapp_message_id UUID REFERENCES public.whatsapp_messages(id),
  email_message_id UUID REFERENCES public.email_messages(id),
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Error
  error_message TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, patient_id)
);

-- =============================================
-- COMMUNICATION PREFERENCES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.communication_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID UNIQUE NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Channels
  whatsapp_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  
  -- Message Types
  appointment_reminders BOOLEAN DEFAULT true,
  marketing_messages BOOLEAN DEFAULT true,
  promotional_messages BOOLEAN DEFAULT true,
  educational_content BOOLEAN DEFAULT true,
  
  -- Frequency
  max_messages_per_week INTEGER DEFAULT 10,
  
  -- Quiet Hours
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  
  -- Preferred Language
  preferred_language TEXT DEFAULT 'pt_BR',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- CONVERSATION HISTORY TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS public.conversation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  
  -- Message
  message_type TEXT NOT NULL CHECK (message_type IN ('whatsapp', 'email', 'sms', 'call', 'in_person')),
  direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  
  -- Content
  content TEXT NOT NULL,
  
  -- Participants
  from_user_id UUID REFERENCES public.users(id),
  to_patient_id UUID REFERENCES public.patients(id),
  
  -- References
  whatsapp_message_id UUID REFERENCES public.whatsapp_messages(id),
  email_message_id UUID REFERENCES public.email_messages(id),
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- INDEXES
-- =============================================
CREATE INDEX idx_message_templates_template_type ON public.message_templates(template_type);
CREATE INDEX idx_message_templates_category ON public.message_templates(category);
CREATE INDEX idx_message_templates_is_active ON public.message_templates(is_active);

CREATE INDEX idx_whatsapp_messages_patient_id ON public.whatsapp_messages(patient_id);
CREATE INDEX idx_whatsapp_messages_phone_number ON public.whatsapp_messages(phone_number);
CREATE INDEX idx_whatsapp_messages_status ON public.whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created_at ON public.whatsapp_messages(created_at DESC);

CREATE INDEX idx_email_messages_patient_id ON public.email_messages(patient_id);
CREATE INDEX idx_email_messages_email_address ON public.email_messages(email_address);
CREATE INDEX idx_email_messages_status ON public.email_messages(status);
CREATE INDEX idx_email_messages_created_at ON public.email_messages(created_at DESC);

CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

CREATE INDEX idx_campaigns_status ON public.campaigns(status);
CREATE INDEX idx_campaigns_campaign_type ON public.campaigns(campaign_type);
CREATE INDEX idx_campaigns_scheduled_for ON public.campaigns(scheduled_for);

CREATE INDEX idx_campaign_recipients_campaign_id ON public.campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_patient_id ON public.campaign_recipients(patient_id);
CREATE INDEX idx_campaign_recipients_status ON public.campaign_recipients(status);

CREATE INDEX idx_communication_preferences_patient_id ON public.communication_preferences(patient_id);

CREATE INDEX idx_conversation_history_patient_id ON public.conversation_history(patient_id);
CREATE INDEX idx_conversation_history_created_at ON public.conversation_history(created_at DESC);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.communication_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_history ENABLE ROW LEVEL SECURITY;

-- MESSAGE TEMPLATES POLICIES
CREATE POLICY "Staff can view templates"
  ON public.message_templates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

CREATE POLICY "Admins can manage templates"
  ON public.message_templates FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- WHATSAPP MESSAGES POLICIES
CREATE POLICY "Patients can view own whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all whatsapp messages"
  ON public.whatsapp_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

CREATE POLICY "System can manage whatsapp messages"
  ON public.whatsapp_messages FOR ALL
  USING (true);

-- EMAIL MESSAGES POLICIES
CREATE POLICY "Patients can view own emails"
  ON public.email_messages FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all emails"
  ON public.email_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

CREATE POLICY "System can manage emails"
  ON public.email_messages FOR ALL
  USING (true);

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- CAMPAIGNS POLICIES
CREATE POLICY "Staff can view campaigns"
  ON public.campaigns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- CAMPAIGN RECIPIENTS POLICIES
CREATE POLICY "Staff can view campaign recipients"
  ON public.campaign_recipients FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

-- COMMUNICATION PREFERENCES POLICIES
CREATE POLICY "Patients can view own preferences"
  ON public.communication_preferences FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Patients can update own preferences"
  ON public.communication_preferences FOR UPDATE
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can manage preferences"
  ON public.communication_preferences FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'recepcionista')
    )
  );

-- CONVERSATION HISTORY POLICIES
CREATE POLICY "Patients can view own conversation"
  ON public.conversation_history FOR SELECT
  USING (
    patient_id IN (
      SELECT id FROM public.patients WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Staff can view all conversations"
  ON public.conversation_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('admin', 'fisioterapeuta', 'recepcionista')
    )
  );

-- =============================================
-- TRIGGERS
-- =============================================
CREATE TRIGGER update_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_messages_updated_at
  BEFORE UPDATE ON public.whatsapp_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_messages_updated_at
  BEFORE UPDATE ON public.email_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_preferences_updated_at
  BEFORE UPDATE ON public.communication_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function to create default communication preferences for new patients
CREATE OR REPLACE FUNCTION create_default_communication_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.communication_preferences (patient_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER create_comm_prefs_on_patient
  AFTER INSERT ON public.patients
  FOR EACH ROW EXECUTE FUNCTION create_default_communication_preferences();

