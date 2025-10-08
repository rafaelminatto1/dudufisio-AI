-- =====================================================
-- MIGRATION: Family Portal System
-- Data: 2025-10-08
-- Descrição: Tabelas para Portal da Família
-- =====================================================

-- Enum para tipos de relacionamento
CREATE TYPE family_relationship AS ENUM (
  'spouse',
  'parent',
  'child',
  'sibling',
  'guardian',
  'caregiver',
  'other'
);

-- Enum para tipos de permissão
CREATE TYPE permission_type AS ENUM (
  'view_progress',
  'view_reports',
  'view_schedule',
  'send_messages',
  'schedule_appointments',
  'view_billing',
  'full_access'
);

-- Enum para status de convite
CREATE TYPE invite_status AS ENUM (
  'pending',
  'accepted',
  'declined',
  'expired',
  'revoked'
);

-- =====================================================
-- TABELA: family_members
-- Membros da família com acesso ao portal
-- =====================================================
CREATE TABLE IF NOT EXISTS family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  
  relationship family_relationship NOT NULL,
  relationship_other TEXT, -- Se relationship = 'other'
  
  -- Autenticação
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  
  -- Status
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_primary_contact BOOLEAN NOT NULL DEFAULT false,
  
  -- Consentimento (LGPD)
  consent_given BOOLEAN NOT NULL DEFAULT false,
  consent_date TIMESTAMPTZ,
  consent_ip_address TEXT,
  consent_document_url TEXT,
  
  -- Comunicação
  preferred_language TEXT DEFAULT 'pt-BR',
  notification_preferences JSONB DEFAULT '{"email": true, "sms": false, "push": false}'::jsonb,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_patient_family_email UNIQUE (patient_id, email)
);

CREATE INDEX idx_family_members_patient ON family_members(patient_id);
CREATE INDEX idx_family_members_email ON family_members(email);
CREATE INDEX idx_family_members_active ON family_members(is_active);
CREATE INDEX idx_family_members_user ON family_members(user_id);

-- =====================================================
-- TABELA: family_permissions
-- Permissões específicas por membro da família
-- =====================================================
CREATE TABLE IF NOT EXISTS family_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  permission permission_type NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  granted_by TEXT NOT NULL,
  
  expires_at TIMESTAMPTZ,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  CONSTRAINT unique_family_permission UNIQUE (family_member_id, permission)
);

CREATE INDEX idx_family_permissions_member ON family_permissions(family_member_id);
CREATE INDEX idx_family_permissions_active ON family_permissions(is_active);

-- =====================================================
-- TABELA: family_invitations
-- Convites para membros da família
-- =====================================================
CREATE TABLE IF NOT EXISTS family_invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  relationship family_relationship NOT NULL,
  
  invite_token TEXT NOT NULL UNIQUE,
  invite_status invite_status NOT NULL DEFAULT 'pending',
  
  permissions permission_type[] NOT NULL,
  
  invited_by TEXT NOT NULL,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  expires_at TIMESTAMPTZ NOT NULL,
  
  accepted_at TIMESTAMPTZ,
  declined_at TIMESTAMPTZ,
  decline_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_invitations_patient ON family_invitations(patient_id);
CREATE INDEX idx_family_invitations_email ON family_invitations(email);
CREATE INDEX idx_family_invitations_token ON family_invitations(invite_token);
CREATE INDEX idx_family_invitations_status ON family_invitations(invite_status);

-- =====================================================
-- TABELA: family_access_logs
-- Log de acessos (compliance LGPD)
-- =====================================================
CREATE TABLE IF NOT EXISTS family_access_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  accessed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'download', 'share')),
  resource_type TEXT NOT NULL CHECK (resource_type IN ('progress', 'report', 'schedule', 'billing', 'message')),
  resource_id UUID,
  
  ip_address TEXT,
  user_agent TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_access_logs_member ON family_access_logs(family_member_id);
CREATE INDEX idx_family_access_logs_patient ON family_access_logs(patient_id);
CREATE INDEX idx_family_access_logs_date ON family_access_logs(accessed_at DESC);

-- =====================================================
-- TABELA: family_messages
-- Mensagens entre família e terapeuta
-- =====================================================
CREATE TABLE IF NOT EXISTS family_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  sender_type TEXT NOT NULL CHECK (sender_type IN ('family', 'therapist', 'system')),
  sender_id UUID NOT NULL, -- family_member_id ou user_id
  sender_name TEXT NOT NULL,
  
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('family', 'therapist', 'all_therapists')),
  recipient_id UUID, -- family_member_id ou user_id (null se all_therapists)
  recipient_name TEXT,
  
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  
  reply_to_id UUID REFERENCES family_messages(id) ON DELETE SET NULL,
  
  attachments JSONB, -- Array de URLs de arquivos
  
  is_archived BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_messages_patient ON family_messages(patient_id);
CREATE INDEX idx_family_messages_sender ON family_messages(sender_id);
CREATE INDEX idx_family_messages_recipient ON family_messages(recipient_id);
CREATE INDEX idx_family_messages_read ON family_messages(is_read);
CREATE INDEX idx_family_messages_date ON family_messages(created_at DESC);

-- =====================================================
-- TABELA: family_notifications
-- Notificações para membros da família
-- =====================================================
CREATE TABLE IF NOT EXISTS family_notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  notification_type TEXT NOT NULL CHECK (notification_type IN (
    'appointment_scheduled',
    'appointment_reminder',
    'appointment_cancelled',
    'progress_update',
    'new_message',
    'new_report',
    'goal_achieved',
    'other'
  )),
  
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  action_url TEXT,
  action_label TEXT,
  
  is_read BOOLEAN NOT NULL DEFAULT false,
  read_at TIMESTAMPTZ,
  
  sent_via_email BOOLEAN NOT NULL DEFAULT false,
  sent_via_sms BOOLEAN NOT NULL DEFAULT false,
  sent_via_push BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_notifications_member ON family_notifications(family_member_id);
CREATE INDEX idx_family_notifications_patient ON family_notifications(patient_id);
CREATE INDEX idx_family_notifications_read ON family_notifications(is_read);
CREATE INDEX idx_family_notifications_date ON family_notifications(created_at DESC);

-- =====================================================
-- TABELA: family_shared_reports
-- Relatórios compartilhados com a família
-- =====================================================
CREATE TABLE IF NOT EXISTS family_shared_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  report_type TEXT NOT NULL CHECK (report_type IN ('progress', 'evaluation', 'discharge', 'custom')),
  report_title TEXT NOT NULL,
  report_content JSONB NOT NULL,
  report_file_url TEXT,
  
  shared_by TEXT NOT NULL,
  shared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  visible_to_family TEXT[] NOT NULL, -- Array de family_member_ids ou 'all'
  
  expires_at TIMESTAMPTZ,
  
  view_count INTEGER NOT NULL DEFAULT 0,
  download_count INTEGER NOT NULL DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_shared_reports_patient ON family_shared_reports(patient_id);
CREATE INDEX idx_family_shared_reports_type ON family_shared_reports(report_type);
CREATE INDEX idx_family_shared_reports_date ON family_shared_reports(shared_at DESC);

-- =====================================================
-- TABELA: family_feedback
-- Feedback da família sobre o tratamento
-- =====================================================
CREATE TABLE IF NOT EXISTS family_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  
  feedback_type TEXT NOT NULL CHECK (feedback_type IN ('satisfaction', 'concern', 'suggestion', 'complaint', 'compliment')),
  
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  
  title TEXT NOT NULL,
  feedback TEXT NOT NULL,
  
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'acknowledged', 'in_review', 'resolved', 'closed')),
  
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  response TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_feedback_member ON family_feedback(family_member_id);
CREATE INDEX idx_family_feedback_patient ON family_feedback(patient_id);
CREATE INDEX idx_family_feedback_type ON family_feedback(feedback_type);
CREATE INDEX idx_family_feedback_status ON family_feedback(status);

-- =====================================================
-- TABELA: family_education_resources
-- Recursos educacionais para família
-- =====================================================
CREATE TABLE IF NOT EXISTS family_education_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('exercise', 'condition', 'treatment', 'prevention', 'general')),
  
  content_type TEXT NOT NULL CHECK (content_type IN ('article', 'video', 'pdf', 'link', 'infographic')),
  content_url TEXT NOT NULL,
  
  thumbnail_url TEXT,
  duration INTEGER, -- minutos (para vídeos)
  
  target_conditions TEXT[],
  language TEXT NOT NULL DEFAULT 'pt-BR',
  
  is_public BOOLEAN NOT NULL DEFAULT true,
  
  views_count INTEGER NOT NULL DEFAULT 0,
  helpful_count INTEGER NOT NULL DEFAULT 0,
  
  created_by TEXT NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_family_education_category ON family_education_resources(category);
CREATE INDEX idx_family_education_language ON family_education_resources(language);
CREATE INDEX idx_family_education_public ON family_education_resources(is_public);

-- =====================================================
-- TABELA: resource_interactions
-- Interações com recursos educacionais
-- =====================================================
CREATE TABLE IF NOT EXISTS resource_interactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  resource_id UUID NOT NULL REFERENCES family_education_resources(id) ON DELETE CASCADE,
  family_member_id UUID NOT NULL REFERENCES family_members(id) ON DELETE CASCADE,
  
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'download', 'helpful', 'not_helpful', 'share')),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resource_interactions_resource ON resource_interactions(resource_id);
CREATE INDEX idx_resource_interactions_member ON resource_interactions(family_member_id);

-- =====================================================
-- VIEWS: Visualizações úteis
-- =====================================================

-- View: Active family members with permissions
CREATE OR REPLACE VIEW active_family_access AS
SELECT 
  fm.*,
  p.name as patient_name,
  array_agg(fp.permission) as permissions
FROM family_members fm
INNER JOIN patients p ON fm.patient_id = p.id
LEFT JOIN family_permissions fp ON fm.id = fp.family_member_id AND fp.is_active = true
WHERE fm.is_active = true
  AND fm.consent_given = true
GROUP BY fm.id, p.name;

-- View: Unread family messages
CREATE OR REPLACE VIEW unread_family_messages AS
SELECT 
  fmsg.*,
  fm.name as family_member_name,
  p.name as patient_name
FROM family_messages fmsg
INNER JOIN family_members fm ON fmsg.sender_id = fm.id
INNER JOIN patients p ON fmsg.patient_id = p.id
WHERE fmsg.is_read = false
  AND fmsg.sender_type = 'family'
ORDER BY fmsg.created_at DESC;

-- =====================================================
-- FUNCTIONS: Funções auxiliares
-- =====================================================

-- Função para log automático de acesso
CREATE OR REPLACE FUNCTION log_family_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Implementar lógica de log conforme necessário
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Função para enviar notificação à família
CREATE OR REPLACE FUNCTION notify_family_members(
  p_patient_id UUID,
  p_notification_type TEXT,
  p_title TEXT,
  p_message TEXT
)
RETURNS void AS $$
BEGIN
  INSERT INTO family_notifications (
    family_member_id,
    patient_id,
    notification_type,
    title,
    message
  )
  SELECT 
    id,
    p_patient_id,
    p_notification_type,
    p_title,
    p_message
  FROM family_members
  WHERE patient_id = p_patient_id
    AND is_active = true
    AND consent_given = true;
END;
$$ LANGUAGE plpgsql;

-- Função para expirar convites antigos
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS void AS $$
BEGIN
  UPDATE family_invitations
  SET invite_status = 'expired'
  WHERE invite_status = 'pending'
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- PERMISSIONS: Row Level Security
-- =====================================================

ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_access_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Family members can view their own data
CREATE POLICY "Family members can view own data"
  ON family_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    auth.uid() IN (SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta'))
  );

-- Policy: Therapists can manage family data
CREATE POLICY "Therapists can manage family data"
  ON family_members FOR ALL
  USING (auth.uid() IN (
    SELECT id FROM users WHERE role IN ('Admin', 'Fisioterapeuta')
  ));

-- =====================================================
-- COMMENTS: Documentação
-- =====================================================

COMMENT ON TABLE family_members IS 'Membros da família com acesso ao portal do paciente';
COMMENT ON TABLE family_permissions IS 'Permissões específicas por membro da família';
COMMENT ON TABLE family_messages IS 'Mensagens entre família e terapeuta';
COMMENT ON TABLE family_access_logs IS 'Log de acessos para compliance LGPD';
COMMENT ON TABLE family_education_resources IS 'Recursos educacionais para família';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================



