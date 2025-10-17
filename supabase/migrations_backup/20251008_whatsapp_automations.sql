-- WhatsApp Automations Tables
-- Sistema de automações para WhatsApp Business API
-- DuduFisio-AI

-- Tabela de automações de WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_automations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Configuração do gatilho
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN ('keyword', 'time_based', 'event_based')),
  trigger_value TEXT NOT NULL,
  trigger_conditions JSONB DEFAULT '{}',
  
  -- Configuração da ação
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('send_message', 'create_appointment', 'notify_staff', 'update_lead')),
  action_data JSONB NOT NULL,
  
  -- Status e controle
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 0,
  
  -- Estatísticas
  total_executions INTEGER DEFAULT 0,
  last_executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Tabela de histórico de mensagens WhatsApp
CREATE TABLE IF NOT EXISTS whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
  patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
  
  -- Dados da mensagem
  message_id VARCHAR(255), -- ID da mensagem no Meta/Twilio
  phone VARCHAR(20) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),
  message_type VARCHAR(50) DEFAULT 'text' CHECK (message_type IN ('text', 'template', 'image', 'document', 'audio', 'video')),
  content TEXT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'read', 'failed')),
  error_message TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  automation_id UUID REFERENCES whatsapp_automations(id) ON DELETE SET NULL,
  
  -- Timestamps
  sent_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de templates de mensagens
CREATE TABLE IF NOT EXISTS whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  
  -- Dados do template
  name VARCHAR(255) NOT NULL,
  template_id VARCHAR(255), -- ID do template no Meta
  category VARCHAR(50) NOT NULL CHECK (category IN ('marketing', 'utility', 'authentication')),
  language VARCHAR(10) DEFAULT 'pt_BR',
  
  -- Conteúdo
  header_type VARCHAR(20) CHECK (header_type IN ('text', 'image', 'document', 'video')),
  header_content TEXT,
  body_text TEXT NOT NULL,
  footer_text TEXT,
  buttons JSONB DEFAULT '[]',
  
  -- Variáveis
  variables JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  is_active BOOLEAN DEFAULT true,
  
  -- Estatísticas
  total_sent INTEGER DEFAULT 0,
  last_sent_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_whatsapp_automations_clinic ON whatsapp_automations(clinic_id);
CREATE INDEX idx_whatsapp_automations_trigger ON whatsapp_automations(trigger_type, trigger_value);
CREATE INDEX idx_whatsapp_automations_active ON whatsapp_automations(is_active);

CREATE INDEX idx_whatsapp_messages_clinic ON whatsapp_messages(clinic_id);
CREATE INDEX idx_whatsapp_messages_phone ON whatsapp_messages(phone);
CREATE INDEX idx_whatsapp_messages_lead ON whatsapp_messages(lead_id);
CREATE INDEX idx_whatsapp_messages_status ON whatsapp_messages(status);
CREATE INDEX idx_whatsapp_messages_created ON whatsapp_messages(created_at DESC);

CREATE INDEX idx_whatsapp_templates_clinic ON whatsapp_templates(clinic_id);
CREATE INDEX idx_whatsapp_templates_status ON whatsapp_templates(status, is_active);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_automations_updated_at BEFORE UPDATE ON whatsapp_automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_templates_updated_at BEFORE UPDATE ON whatsapp_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security)
ALTER TABLE whatsapp_automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_templates ENABLE ROW LEVEL SECURITY;

-- Policies para whatsapp_automations
CREATE POLICY "Users can view automations from their clinic"
  ON whatsapp_automations FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage automations"
  ON whatsapp_automations FOR ALL
  USING (
    clinic_id IN (
      SELECT uc.clinic_id 
      FROM user_clinics uc
      JOIN users u ON u.id = uc.user_id
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'owner')
    )
  );

-- Policies para whatsapp_messages
CREATE POLICY "Users can view messages from their clinic"
  ON whatsapp_messages FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()));

CREATE POLICY "System can insert messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (true);

-- Policies para whatsapp_templates
CREATE POLICY "Users can view templates from their clinic"
  ON whatsapp_templates FOR SELECT
  USING (clinic_id IN (SELECT clinic_id FROM user_clinics WHERE user_id = auth.uid()));

CREATE POLICY "Admins can manage templates"
  ON whatsapp_templates FOR ALL
  USING (
    clinic_id IN (
      SELECT uc.clinic_id 
      FROM user_clinics uc
      JOIN users u ON u.id = uc.user_id
      WHERE u.id = auth.uid() AND u.role IN ('admin', 'owner')
    )
  );

-- Inserir automações padrão
INSERT INTO whatsapp_automations (clinic_id, name, description, trigger_type, trigger_value, action_type, action_data, is_active)
SELECT 
  id,
  'Mensagem de Boas-Vindas',
  'Resposta automática para novas mensagens',
  'keyword',
  'oi|olá|ola',
  'send_message',
  jsonb_build_object(
    'message', '👋 Olá! Bem-vindo à nossa clínica. Como posso ajudá-lo?

Você pode:
📅 Digitar *AGENDAR* para marcar uma consulta
📍 Digitar *LOCALIZAÇÃO* para ver nosso endereço
🕐 *HORÁRIO* para ver nosso horário de atendimento
💰 Digitar *PREÇOS* para informações sobre valores'
  ),
  true
FROM clinics
WHERE NOT EXISTS (
  SELECT 1 FROM whatsapp_automations WHERE name = 'Mensagem de Boas-Vindas'
);

COMMENT ON TABLE whatsapp_automations IS 'Automações configuradas para WhatsApp Business API';
COMMENT ON TABLE whatsapp_messages IS 'Histórico de mensagens enviadas e recebidas via WhatsApp';
COMMENT ON TABLE whatsapp_templates IS 'Templates aprovados para envio via WhatsApp Business API';

