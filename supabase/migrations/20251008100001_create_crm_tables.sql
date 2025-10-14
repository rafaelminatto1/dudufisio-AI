-- =====================================================
-- MIGRATION: Create CRM Tables - Activity Integration
-- Version: 1.0.0
-- Date: 2025-10-08
-- Description: Criação das tabelas do sistema CRM completo
--              para integração com WhatsApp Business API
-- =====================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- =====================================================
-- 1. TABELA DE LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  source VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'novo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas que possam estar faltando (para tabelas já criadas)
DO $$ 
BEGIN
  -- clinic_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='clinic_id') THEN
    ALTER TABLE leads ADD COLUMN clinic_id UUID;
    -- Nota: FK será adicionada apenas se a tabela clinics existir
  END IF;
  
  -- service_interest
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='service_interest') THEN
    ALTER TABLE leads ADD COLUMN service_interest VARCHAR(100);
  END IF;
  
  -- pain_description
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='pain_description') THEN
    ALTER TABLE leads ADD COLUMN pain_description TEXT;
  END IF;
  
  -- sport_activity
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='sport_activity') THEN
    ALTER TABLE leads ADD COLUMN sport_activity VARCHAR(100);
  END IF;
  
  -- pain_duration
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='pain_duration') THEN
    ALTER TABLE leads ADD COLUMN pain_duration VARCHAR(50);
  END IF;
  
  -- pain_location
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='pain_location') THEN
    ALTER TABLE leads ADD COLUMN pain_location VARCHAR(100);
  END IF;
  
  -- urgency_level
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='urgency_level') THEN
    ALTER TABLE leads ADD COLUMN urgency_level VARCHAR(20) DEFAULT 'media';
  END IF;
  
  -- first_contact_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='first_contact_at') THEN
    ALTER TABLE leads ADD COLUMN first_contact_at TIMESTAMPTZ DEFAULT NOW();
  END IF;
  
  -- last_contact_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='last_contact_at') THEN
    ALTER TABLE leads ADD COLUMN last_contact_at TIMESTAMPTZ;
  END IF;
  
  -- next_follow_up_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='next_follow_up_at') THEN
    ALTER TABLE leads ADD COLUMN next_follow_up_at TIMESTAMPTZ;
  END IF;
  
  -- contact_count
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='contact_count') THEN
    ALTER TABLE leads ADD COLUMN contact_count INTEGER DEFAULT 0;
  END IF;
  
  -- whatsapp_messages_sent
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='whatsapp_messages_sent') THEN
    ALTER TABLE leads ADD COLUMN whatsapp_messages_sent INTEGER DEFAULT 0;
  END IF;
  
  -- whatsapp_messages_received
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='whatsapp_messages_received') THEN
    ALTER TABLE leads ADD COLUMN whatsapp_messages_received INTEGER DEFAULT 0;
  END IF;
  
  -- converted_to_patient_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='converted_to_patient_id') THEN
    ALTER TABLE leads ADD COLUMN converted_to_patient_id UUID;
  END IF;
  
  -- converted_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='converted_at') THEN
    ALTER TABLE leads ADD COLUMN converted_at TIMESTAMPTZ;
  END IF;
  
  -- conversion_source
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='conversion_source') THEN
    ALTER TABLE leads ADD COLUMN conversion_source VARCHAR(50);
  END IF;
  
  -- remarketing_sequence
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='remarketing_sequence') THEN
    ALTER TABLE leads ADD COLUMN remarketing_sequence INTEGER DEFAULT 0;
  END IF;
  
  -- remarketing_paused
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='remarketing_paused') THEN
    ALTER TABLE leads ADD COLUMN remarketing_paused BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- last_remarketing_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='last_remarketing_at') THEN
    ALTER TABLE leads ADD COLUMN last_remarketing_at TIMESTAMPTZ;
  END IF;
  
  -- campaign_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='campaign_id') THEN
    ALTER TABLE leads ADD COLUMN campaign_id VARCHAR(100);
  END IF;
  
  -- ad_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='ad_id') THEN
    ALTER TABLE leads ADD COLUMN ad_id VARCHAR(100);
  END IF;
  
  -- utm_source
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='utm_source') THEN
    ALTER TABLE leads ADD COLUMN utm_source VARCHAR(100);
  END IF;
  
  -- utm_medium
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='utm_medium') THEN
    ALTER TABLE leads ADD COLUMN utm_medium VARCHAR(100);
  END IF;
  
  -- utm_campaign
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='utm_campaign') THEN
    ALTER TABLE leads ADD COLUMN utm_campaign VARCHAR(100);
  END IF;
  
  -- utm_content
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='utm_content') THEN
    ALTER TABLE leads ADD COLUMN utm_content VARCHAR(100);
  END IF;
  
  -- utm_term
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='utm_term') THEN
    ALTER TABLE leads ADD COLUMN utm_term VARCHAR(100);
  END IF;
  
  -- estimated_value
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='estimated_value') THEN
    ALTER TABLE leads ADD COLUMN estimated_value DECIMAL(10,2);
  END IF;
  
  -- notes (array)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='notes') THEN
    ALTER TABLE leads ADD COLUMN notes TEXT[];
  END IF;
  
  -- tags (array)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='tags') THEN
    ALTER TABLE leads ADD COLUMN tags VARCHAR(50)[];
  END IF;
  
  -- assigned_to
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='assigned_to') THEN
    ALTER TABLE leads ADD COLUMN assigned_to UUID;
  END IF;
  
  -- created_by
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='created_by') THEN
    ALTER TABLE leads ADD COLUMN created_by UUID;
  END IF;
  
  -- deleted_at
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name='leads' AND column_name='deleted_at') THEN
    ALTER TABLE leads ADD COLUMN deleted_at TIMESTAMPTZ;
  END IF;
END $$;

-- Índices de performance
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_follow_up_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_leads_created ON leads(created_at DESC) WHERE deleted_at IS NULL;

-- Índices condicionais (somente se as colunas existirem)
DO $$
BEGIN
  -- Índices que dependem de clinic_id
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='leads' AND column_name='clinic_id') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_clinic_status ON leads(clinic_id, status) WHERE deleted_at IS NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_clinic_created ON leads(clinic_id, created_at DESC) WHERE deleted_at IS NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(clinic_id, source) WHERE deleted_at IS NULL';
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_urgency ON leads(clinic_id, urgency_level) WHERE deleted_at IS NULL';
  END IF;
  
  -- Índice que depende de assigned_to
  IF EXISTS (SELECT 1 FROM information_schema.columns 
             WHERE table_name='leads' AND column_name='assigned_to') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_leads_assigned ON leads(assigned_to) WHERE deleted_at IS NULL';
  END IF;
END $$;

-- Índice para busca textual removido temporariamente (problema com pg_trgm)
-- CREATE INDEX IF NOT EXISTS idx_leads_name_trgm ON leads USING gin(name gin_trgm_ops) WHERE deleted_at IS NULL;

-- Comentários
COMMENT ON TABLE leads IS 'Tabela de leads do CRM - candidatos a pacientes';
COMMENT ON COLUMN leads.status IS 'novo: primeiro contato | contatado: já respondemos | qualificado: tem perfil | agendado: marcou consulta | convertido: virou paciente | perdido: desistiu';
COMMENT ON COLUMN leads.urgency_level IS 'Nível de urgência do caso baseado em descrição da dor e sintomas';
COMMENT ON COLUMN leads.remarketing_sequence IS 'Posição na sequência de remarketing (0=não iniciado, 1=24h, 2=3dias, 3=7dias)';

-- =====================================================
-- 2. TABELA DE INTERAÇÕES COM LEADS
-- =====================================================
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Tipo de interação
  interaction_type VARCHAR(50) NOT NULL, -- 'whatsapp', 'call', 'email', 'sms', 'in_person', 'auto_message'
  direction VARCHAR(20) NOT NULL, -- 'inbound' (lead enviou), 'outbound' (enviamos)
  channel VARCHAR(50),
  
  -- Conteúdo da mensagem
  message_content TEXT,
  message_template_id VARCHAR(100), -- ID do template usado (se automático)
  message_template_name VARCHAR(255),
  
  -- Status da interação
  status VARCHAR(50), -- 'sent', 'delivered', 'read', 'replied', 'failed', 'bounced'
  status_updated_at TIMESTAMPTZ,
  
  -- Resposta do lead
  lead_response TEXT,
  lead_responded_at TIMESTAMPTZ,
  
  -- Detecção automática (IA)
  detected_intent VARCHAR(50), -- 'schedule', 'info_price', 'pain_report', etc.
  detected_sentiment VARCHAR(20), -- 'positive', 'neutral', 'negative'
  ai_confidence DECIMAL(3,2), -- 0.00 a 1.00
  
  -- Agente responsável
  agent_id UUID REFERENCES unified_users(id),
  is_automated BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  metadata JSONB,
  
  -- Tracking
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT lead_interactions_direction_check CHECK (direction IN ('inbound', 'outbound')),
  CONSTRAINT lead_interactions_type_check CHECK (interaction_type IN ('whatsapp', 'call', 'email', 'sms', 'in_person', 'auto_message'))
);

-- Índices
CREATE INDEX idx_lead_interactions_lead ON lead_interactions(lead_id, created_at DESC);
CREATE INDEX idx_lead_interactions_clinic ON lead_interactions(clinic_id, created_at DESC);
CREATE INDEX idx_lead_interactions_agent ON lead_interactions(agent_id, created_at DESC);
CREATE INDEX idx_lead_interactions_type ON lead_interactions(clinic_id, interaction_type, created_at DESC);
CREATE INDEX idx_lead_interactions_intent ON lead_interactions(detected_intent) WHERE detected_intent IS NOT NULL;

-- Comentários
COMMENT ON TABLE lead_interactions IS 'Histórico completo de todas interações com leads';
COMMENT ON COLUMN lead_interactions.detected_intent IS 'Intenção detectada pela IA (scheduling, info_request, complaint, etc)';
COMMENT ON COLUMN lead_interactions.ai_confidence IS 'Confiança da IA na detecção (0.0 a 1.0)';

-- =====================================================
-- 3. TABELA DE TEMPLATES DE MENSAGENS
-- =====================================================
CREATE TABLE IF NOT EXISTS message_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'welcome', 'follow_up', 'remarketing', 'confirmation', 'reminder', 'info'
  channel VARCHAR(50) NOT NULL, -- 'whatsapp', 'email', 'sms', 'all'
  
  -- Conteúdo
  subject VARCHAR(255), -- para emails
  body TEXT NOT NULL,
  variables JSONB, -- ex: ["nome_paciente", "data", "horario"]
  
  -- Template WhatsApp Business API (Meta)
  whatsapp_template_id VARCHAR(255), -- ID aprovado pela Meta
  whatsapp_template_language VARCHAR(10) DEFAULT 'pt_BR',
  whatsapp_template_status VARCHAR(50), -- 'pending', 'approved', 'rejected'
  whatsapp_template_components JSONB,
  
  -- Configurações
  is_active BOOLEAN DEFAULT TRUE,
  requires_approval BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMPTZ,
  approved_by UUID REFERENCES unified_users(id),
  
  -- Métricas de uso
  times_used INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  conversion_rate DECIMAL(5,2),
  avg_response_time INTEGER, -- em minutos
  
  -- Auditoria
  created_by UUID REFERENCES unified_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT message_templates_category_check CHECK (category IN ('welcome', 'follow_up', 'remarketing', 'confirmation', 'reminder', 'info', 'automation')),
  CONSTRAINT message_templates_channel_check CHECK (channel IN ('whatsapp', 'email', 'sms', 'all')),
  CONSTRAINT message_templates_whatsapp_status_check CHECK (whatsapp_template_status IN ('pending', 'approved', 'rejected', 'draft') OR whatsapp_template_status IS NULL)
);

-- Adicionar colunas faltantes se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'deleted_at') THEN
        ALTER TABLE message_templates ADD COLUMN deleted_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'clinic_id') THEN
        ALTER TABLE message_templates ADD COLUMN clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'description') THEN
        ALTER TABLE message_templates ADD COLUMN description TEXT;
    END IF;
    
    -- Adicionar name e category se não existirem (com valores padrão temporários)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'name' AND column_name = 'name') THEN
        ALTER TABLE message_templates ADD COLUMN name VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'subject') THEN
        ALTER TABLE message_templates ADD COLUMN subject VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'body') THEN
        ALTER TABLE message_templates ADD COLUMN body TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'whatsapp_template_id') THEN
        ALTER TABLE message_templates ADD COLUMN whatsapp_template_id VARCHAR(255);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'whatsapp_template_language') THEN
        ALTER TABLE message_templates ADD COLUMN whatsapp_template_language VARCHAR(10) DEFAULT 'pt_BR';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'whatsapp_template_status') THEN
        ALTER TABLE message_templates ADD COLUMN whatsapp_template_status VARCHAR(50);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'whatsapp_template_components') THEN
        ALTER TABLE message_templates ADD COLUMN whatsapp_template_components JSONB;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'requires_approval') THEN
        ALTER TABLE message_templates ADD COLUMN requires_approval BOOLEAN DEFAULT FALSE;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'approved_at') THEN
        ALTER TABLE message_templates ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'approved_by') THEN
        ALTER TABLE message_templates ADD COLUMN approved_by UUID REFERENCES unified_users(id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'times_used') THEN
        ALTER TABLE message_templates ADD COLUMN times_used INTEGER DEFAULT 0;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'last_used_at') THEN
        ALTER TABLE message_templates ADD COLUMN last_used_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'conversion_rate') THEN
        ALTER TABLE message_templates ADD COLUMN conversion_rate DECIMAL(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'avg_response_time') THEN
        ALTER TABLE message_templates ADD COLUMN avg_response_time INTEGER;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'created_by') THEN
        ALTER TABLE message_templates ADD COLUMN created_by UUID REFERENCES unified_users(id);
    END IF;
END $$;

-- Índices
CREATE INDEX IF NOT EXISTS idx_templates_clinic_category ON message_templates(clinic_id, category, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_templates_channel ON message_templates(channel, is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_templates_whatsapp_status ON message_templates(whatsapp_template_status) WHERE whatsapp_template_id IS NOT NULL;

-- Comentários
COMMENT ON TABLE message_templates IS 'Templates de mensagens para automação e uso manual';
COMMENT ON COLUMN message_templates.whatsapp_template_id IS 'ID do template aprovado pela Meta (WhatsApp Business API)';
COMMENT ON COLUMN message_templates.variables IS 'Array de variáveis dinâmicas disponíveis no template';

-- =====================================================
-- 4. TABELA DE CAMPANHAS DE AUTOMAÇÃO
-- =====================================================
CREATE TABLE IF NOT EXISTS automation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Identificação
  name VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(50) NOT NULL, -- 'follow_up', 'remarketing', 'nurturing', 'reengagement', 'confirmation'
  
  -- Configuração do gatilho
  trigger_event VARCHAR(100) NOT NULL, -- 'lead_created', 'no_response_24h', 'appointment_scheduled', 'appointment_completed'
  trigger_conditions JSONB, -- condições adicionais em JSON
  trigger_delay_minutes INTEGER DEFAULT 0,
  
  -- Sequência de mensagens
  sequence JSONB NOT NULL, -- Array de steps: [{ step: 1, delay: 0, template_id: "uuid", conditions: {} }]
  
  -- Status e controle
  is_active BOOLEAN DEFAULT TRUE,
  start_date DATE,
  end_date DATE,
  max_leads INTEGER, -- limite de leads que podem entrar
  
  -- Segmentação
  target_sources VARCHAR(50)[], -- filtrar por fonte
  target_services VARCHAR(100)[], -- filtrar por serviço de interesse
  target_urgency VARCHAR(20)[], -- filtrar por urgência
  
  -- Métricas
  leads_entered INTEGER DEFAULT 0,
  leads_active INTEGER DEFAULT 0,
  leads_completed INTEGER DEFAULT 0,
  messages_sent INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,2),
  
  -- Auditoria
  created_by UUID REFERENCES unified_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  
  -- Constraints
  CONSTRAINT automation_campaigns_type_check CHECK (type IN ('follow_up', 'remarketing', 'nurturing', 'reengagement', 'confirmation')),
  CONSTRAINT automation_campaigns_dates_check CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Índices
CREATE INDEX idx_campaigns_clinic_active ON automation_campaigns(clinic_id, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_type ON automation_campaigns(type, is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_campaigns_trigger ON automation_campaigns(trigger_event, is_active) WHERE deleted_at IS NULL;

-- Comentários
COMMENT ON TABLE automation_campaigns IS 'Campanhas de automação com sequências de mensagens';
COMMENT ON COLUMN automation_campaigns.sequence IS 'Array de steps com delays e template_ids: [{"step":1,"delay_minutes":0,"template_id":"uuid"}]';
COMMENT ON COLUMN automation_campaigns.trigger_event IS 'Evento que inicia a campanha (lead_created, no_response, etc)';

-- =====================================================
-- 5. TABELA DE LEADS EM CAMPANHAS (TRACKING)
-- =====================================================
CREATE TABLE IF NOT EXISTS campaign_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES automation_campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  
  -- Controle de progresso
  current_step INTEGER DEFAULT 0,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'completed', 'converted', 'opted_out', 'failed'
  
  -- Datas importantes
  entered_at TIMESTAMPTZ DEFAULT NOW(),
  next_action_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  
  -- Resultados
  messages_sent INTEGER DEFAULT 0,
  messages_delivered INTEGER DEFAULT 0,
  messages_read INTEGER DEFAULT 0,
  lead_responded BOOLEAN DEFAULT FALSE,
  converted BOOLEAN DEFAULT FALSE,
  
  -- Metadados
  metadata JSONB,
  
  UNIQUE(campaign_id, lead_id),
  
  -- Constraints
  CONSTRAINT campaign_leads_status_check CHECK (status IN ('active', 'paused', 'completed', 'converted', 'opted_out', 'failed'))
);

-- Índices
CREATE INDEX idx_campaign_leads_next_action ON campaign_leads(next_action_at) WHERE status = 'active';
CREATE INDEX idx_campaign_leads_campaign ON campaign_leads(campaign_id, status);
CREATE INDEX idx_campaign_leads_lead ON campaign_leads(lead_id);
CREATE INDEX idx_campaign_leads_status ON campaign_leads(campaign_id, status);

-- Comentários
COMMENT ON TABLE campaign_leads IS 'Tracking de leads dentro de campanhas de automação';
COMMENT ON COLUMN campaign_leads.current_step IS 'Step atual na sequência da campanha (0 = não iniciado)';
COMMENT ON COLUMN campaign_leads.next_action_at IS 'Timestamp da próxima ação agendada';

-- =====================================================
-- 6. FUNÇÃO: Atualizar updated_at automaticamente
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON message_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_campaigns_updated_at BEFORE UPDATE ON automation_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 7. FUNÇÃO: Auto-incrementar contact_count
-- =====================================================
CREATE OR REPLACE FUNCTION increment_lead_contact_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.direction = 'outbound' THEN
    UPDATE leads 
    SET 
      contact_count = contact_count + 1,
      last_contact_at = NEW.created_at,
      whatsapp_messages_sent = CASE 
        WHEN NEW.interaction_type = 'whatsapp' THEN whatsapp_messages_sent + 1 
        ELSE whatsapp_messages_sent 
      END
    WHERE id = NEW.lead_id;
  ELSIF NEW.direction = 'inbound' THEN
    UPDATE leads
    SET
      last_contact_at = NEW.created_at,
      whatsapp_messages_received = CASE
        WHEN NEW.interaction_type = 'whatsapp' THEN whatsapp_messages_received + 1
        ELSE whatsapp_messages_received
      END
    WHERE id = NEW.lead_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_lead_interactions AFTER INSERT ON lead_interactions
  FOR EACH ROW EXECUTE FUNCTION increment_lead_contact_count();

-- =====================================================
-- 8. FUNÇÃO: Atualizar métricas de template
-- =====================================================
CREATE OR REPLACE FUNCTION update_template_metrics()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.message_template_id IS NOT NULL THEN
    UPDATE message_templates
    SET
      times_used = times_used + 1,
      last_used_at = NEW.created_at
    WHERE whatsapp_template_id = NEW.message_template_id
       OR id::text = NEW.message_template_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_template_usage AFTER INSERT ON lead_interactions
  FOR EACH ROW EXECUTE FUNCTION update_template_metrics();

-- =====================================================
-- 9. VIEWS DE MÉTRICAS
-- =====================================================

-- View: Leads ativos por status
CREATE OR REPLACE VIEW leads_by_status AS
SELECT 
  clinic_id,
  status,
  COUNT(*) as count,
  AVG(EXTRACT(EPOCH FROM (NOW() - created_at))/3600)::INTEGER as avg_age_hours
FROM leads
WHERE deleted_at IS NULL
GROUP BY clinic_id, status;

-- View: Performance por fonte
CREATE OR REPLACE VIEW leads_by_source AS
SELECT
  clinic_id,
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'convertido') as converted,
  ROUND(COUNT(*) FILTER (WHERE status = 'convertido')::NUMERIC / COUNT(*) * 100, 2) as conversion_rate,
  AVG(estimated_value) as avg_value
FROM leads
WHERE deleted_at IS NULL
GROUP BY clinic_id, source;

-- View: Funil de conversão
CREATE OR REPLACE VIEW conversion_funnel AS
SELECT
  clinic_id,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status IN ('contatado', 'qualificado', 'agendado', 'convertido')) as contacted,
  COUNT(*) FILTER (WHERE status IN ('qualificado', 'agendado', 'convertido')) as qualified,
  COUNT(*) FILTER (WHERE status IN ('agendado', 'convertido')) as scheduled,
  COUNT(*) FILTER (WHERE status = 'convertido') as converted,
  ROUND(COUNT(*) FILTER (WHERE status = 'convertido')::NUMERIC / NULLIF(COUNT(*), 0) * 100, 2) as conversion_rate
FROM leads
WHERE deleted_at IS NULL
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY clinic_id;

-- =====================================================
-- 10. RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_leads ENABLE ROW LEVEL SECURITY;

-- Policies para leads
CREATE POLICY "Users can view leads from their clinic"
  ON leads FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert leads to their clinic"
  ON leads FOR INSERT
  WITH CHECK (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can update leads from their clinic"
  ON leads FOR UPDATE
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can delete leads from their clinic"
  ON leads FOR DELETE
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

-- Policies similares para outras tabelas
CREATE POLICY "Users can view interactions from their clinic"
  ON lead_interactions FOR SELECT
  USING (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can insert interactions to their clinic"
  ON lead_interactions FOR INSERT
  WITH CHECK (clinic_id IN (
    SELECT clinic_id FROM unified_users WHERE id = auth.uid()
  ));

-- =====================================================
-- 11. GRANTS
-- =====================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON leads TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON lead_interactions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON message_templates TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON automation_campaigns TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON campaign_leads TO authenticated;

GRANT SELECT ON leads_by_status TO authenticated;
GRANT SELECT ON leads_by_source TO authenticated;
GRANT SELECT ON conversion_funnel TO authenticated;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Comentário da migration
COMMENT ON SCHEMA public IS 'CRM Tables Migration v1.0.0 - Activity Integration - 2025-10-08';

