-- CRM + Leads Integration Migration
-- Integra sistema de CRM com pacientes e comunicação

-- Tabela de Leads (prospects que ainda não são pacientes)
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Dados básicos
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  source VARCHAR(100), -- whatsapp, website, referral, instagram, facebook, google

  -- Status do lead
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
    'new', 'contacted', 'qualified', 'proposal_sent',
    'negotiation', 'won', 'lost', 'no_response'
  )),
  stage VARCHAR(50) DEFAULT 'lead',

  -- Scoring e Engajamento
  lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
  engagement_level VARCHAR(20) DEFAULT 'cold' CHECK (engagement_level IN ('hot', 'warm', 'cold')),

  -- Relacionamento
  assigned_to UUID REFERENCES auth.users(id),
  converted_patient_id UUID REFERENCES patients(id),
  converted_at TIMESTAMP WITH TIME ZONE,

  -- Interesse e Qualificação
  interested_in TEXT,
  pain_points TEXT[],
  budget_range VARCHAR(50),
  urgency VARCHAR(20) CHECK (urgency IN ('high', 'medium', 'low')),
  expected_start_date DATE,

  -- Tracking de Interações
  first_contact_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_contact_at TIMESTAMP WITH TIME ZONE,
  last_message_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE,
  total_interactions INTEGER DEFAULT 0,
  whatsapp_interactions INTEGER DEFAULT 0,
  email_interactions INTEGER DEFAULT 0,
  call_interactions INTEGER DEFAULT 0,

  -- Probabilidade de conversão (calculado)
  conversion_probability INTEGER DEFAULT 0 CHECK (conversion_probability BETWEEN 0 AND 100),

  -- Razão de perda (se status = 'lost')
  lost_reason VARCHAR(255),
  lost_at TIMESTAMP WITH TIME ZONE,

  -- Metadata e Tags
  metadata JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  custom_fields JSONB DEFAULT '{}',

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Interações com Leads
CREATE TABLE IF NOT EXISTS lead_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,

  -- Tipo de interação
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'whatsapp_message', 'email', 'phone_call', 'meeting',
    'note', 'status_change', 'score_update'
  )),

  -- Dados da interação
  direction VARCHAR(20) CHECK (direction IN ('inbound', 'outbound')),
  subject VARCHAR(255),
  content TEXT,
  duration_seconds INTEGER, -- para calls

  -- Relacionamento com mensagens
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,

  -- Usuário que fez a interação
  performed_by UUID REFERENCES auth.users(id),

  -- Metadata
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Pipeline de Vendas
CREATE TABLE IF NOT EXISTS sales_pipeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  stages JSONB NOT NULL, -- array de stages com configs
  is_default BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir pipeline padrão
INSERT INTO sales_pipeline (name, description, stages, is_default, is_active) VALUES (
  'Pipeline Fisioterapia',
  'Pipeline padrão para conversão de leads em pacientes',
  '[
    {
      "id": "new",
      "name": "Novo Lead",
      "order": 1,
      "color": "#94a3b8",
      "auto_move_days": 3
    },
    {
      "id": "contacted",
      "name": "Contato Inicial",
      "order": 2,
      "color": "#3b82f6",
      "auto_move_days": 5
    },
    {
      "id": "qualified",
      "name": "Qualificado",
      "order": 3,
      "color": "#8b5cf6",
      "auto_move_days": 7
    },
    {
      "id": "proposal_sent",
      "name": "Proposta Enviada",
      "order": 4,
      "color": "#f59e0b",
      "auto_move_days": null
    },
    {
      "id": "negotiation",
      "name": "Negociação",
      "order": 5,
      "color": "#ec4899",
      "auto_move_days": null
    },
    {
      "id": "won",
      "name": "Ganho",
      "order": 6,
      "color": "#10b981",
      "auto_move_days": null
    },
    {
      "id": "lost",
      "name": "Perdido",
      "order": 7,
      "color": "#ef4444",
      "auto_move_days": null
    }
  ]'::jsonb,
  true,
  true
) ON CONFLICT DO NOTHING;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_next_followup ON leads(next_followup_at);
CREATE INDEX IF NOT EXISTS idx_leads_lead_score ON leads(lead_score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_lead_interactions_lead_id ON lead_interactions(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_type ON lead_interactions(type);
CREATE INDEX IF NOT EXISTS idx_lead_interactions_created_at ON lead_interactions(created_at DESC);

-- RLS Policies
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_pipeline ENABLE ROW LEVEL SECURITY;

-- Usuários podem ver leads atribuídos a eles
CREATE POLICY "Users can view assigned leads" ON leads
  FOR SELECT USING (assigned_to = auth.uid());

-- Admins e terapeutas podem gerenciar todos os leads
CREATE POLICY "Admins and therapists can manage all leads" ON leads
  FOR ALL USING (
    auth.jwt() ->> 'role' IN ('admin', 'therapist', 'Admin', 'Therapist')
  );

-- Políticas para interações
CREATE POLICY "Users can view interactions of their leads" ON lead_interactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_interactions.lead_id
      AND (leads.assigned_to = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'Admin'))
    )
  );

CREATE POLICY "Users can create interactions for their leads" ON lead_interactions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM leads WHERE leads.id = lead_interactions.lead_id
      AND (leads.assigned_to = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'Admin'))
    )
  );

-- Políticas para sales_pipeline
CREATE POLICY "Everyone can view active pipelines" ON sales_pipeline
  FOR SELECT USING (is_active = true);

CREATE POLICY "Only admins can manage pipelines" ON sales_pipeline
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Trigger para atualizar updated_at
CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_pipeline_updated_at
  BEFORE UPDATE ON sales_pipeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para calcular lead score automaticamente
CREATE OR REPLACE FUNCTION calculate_lead_score(lead_id_param UUID)
RETURNS INTEGER AS $$
DECLARE
  score INTEGER := 0;
  lead_record RECORD;
  days_since_contact INTEGER;
  total_messages INTEGER;
BEGIN
  SELECT * INTO lead_record FROM leads WHERE id = lead_id_param;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- Base score: 20 pontos
  score := 20;

  -- +15 pontos se tem email
  IF lead_record.email IS NOT NULL THEN
    score := score + 15;
  END IF;

  -- +10 pontos se tem telefone
  IF lead_record.phone IS NOT NULL THEN
    score := score + 10;
  END IF;

  -- +15 pontos se preencheu "interested_in"
  IF lead_record.interested_in IS NOT NULL THEN
    score := score + 15;
  END IF;

  -- Pontos baseados em interações (max 30)
  score := score + LEAST(lead_record.total_interactions * 5, 30);

  -- Pontos baseados em recência de contato
  days_since_contact := EXTRACT(DAY FROM (NOW() - COALESCE(lead_record.last_contact_at, lead_record.created_at)));

  IF days_since_contact <= 1 THEN
    score := score + 20; -- muito recente
  ELSIF days_since_contact <= 3 THEN
    score := score + 15;
  ELSIF days_since_contact <= 7 THEN
    score := score + 10;
  ELSIF days_since_contact <= 14 THEN
    score := score + 5;
  END IF;

  -- Penalidade por tempo sem contato
  IF days_since_contact > 30 THEN
    score := score - 15;
  END IF;

  -- +10 pontos se urgência é alta
  IF lead_record.urgency = 'high' THEN
    score := score + 10;
  END IF;

  -- Garantir que está entre 0 e 100
  score := LEAST(100, GREATEST(0, score));

  -- Atualizar engagement level baseado no score
  UPDATE leads SET
    lead_score = score,
    engagement_level = CASE
      WHEN score >= 70 THEN 'hot'
      WHEN score >= 40 THEN 'warm'
      ELSE 'cold'
    END,
    conversion_probability = score
  WHERE id = lead_id_param;

  RETURN score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para converter lead em paciente
CREATE OR REPLACE FUNCTION convert_lead_to_patient(lead_id_param UUID)
RETURNS UUID AS $$
DECLARE
  new_patient_id UUID;
  lead_record RECORD;
  recipient_record RECORD;
BEGIN
  -- Buscar lead
  SELECT * INTO lead_record FROM leads WHERE id = lead_id_param;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Lead not found: %', lead_id_param;
  END IF;

  -- Verificar se já foi convertido
  IF lead_record.converted_patient_id IS NOT NULL THEN
    RETURN lead_record.converted_patient_id;
  END IF;

  -- Criar paciente
  INSERT INTO patients (
    name, email, phone, source,
    address_street, notes,
    metadata, created_at
  )
  VALUES (
    lead_record.name,
    lead_record.email,
    lead_record.phone,
    COALESCE(lead_record.source, 'crm_conversion'),
    NULL,
    COALESCE(lead_record.notes, ''),
    jsonb_build_object(
      'converted_from_lead_id', lead_record.id,
      'lead_score', lead_record.lead_score,
      'original_source', lead_record.source,
      'conversion_date', NOW(),
      'interested_in', lead_record.interested_in
    ),
    NOW()
  )
  RETURNING id INTO new_patient_id;

  -- Criar ou atualizar recipient de comunicação
  SELECT * INTO recipient_record FROM communication_recipients
  WHERE phone = lead_record.phone OR email = lead_record.email
  LIMIT 1;

  IF recipient_record IS NULL THEN
    INSERT INTO communication_recipients (
      patient_id, name, email, phone, preferred_channel,
      metadata, created_at
    )
    VALUES (
      new_patient_id,
      lead_record.name,
      lead_record.email,
      lead_record.phone,
      'whatsapp',
      jsonb_build_object('lead_id', lead_record.id, 'source', lead_record.source),
      NOW()
    );
  ELSE
    UPDATE communication_recipients
    SET patient_id = new_patient_id,
        metadata = metadata || jsonb_build_object('lead_id', lead_record.id)
    WHERE id = recipient_record.id;
  END IF;

  -- Atualizar lead
  UPDATE leads
  SET
    status = 'won',
    stage = 'converted',
    converted_patient_id = new_patient_id,
    converted_at = NOW(),
    updated_at = NOW()
  WHERE id = lead_id_param;

  -- Transferir mensagens do recipient para o paciente
  UPDATE messages
  SET patient_id = new_patient_id
  WHERE recipient_id IN (
    SELECT id FROM communication_recipients
    WHERE phone = lead_record.phone OR email = lead_record.email
  )
  AND patient_id IS NULL;

  -- Criar interação de conversão
  INSERT INTO lead_interactions (
    lead_id, type, subject, content, performed_by, created_at
  )
  VALUES (
    lead_id_param,
    'status_change',
    'Lead convertido em paciente',
    format('Lead %s convertido com sucesso em paciente ID: %s', lead_record.name, new_patient_id),
    auth.uid(),
    NOW()
  );

  RETURN new_patient_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar score automaticamente após interação
CREATE OR REPLACE FUNCTION update_lead_score_on_interaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementar contador de interações
  UPDATE leads SET
    total_interactions = total_interactions + 1,
    whatsapp_interactions = CASE WHEN NEW.type = 'whatsapp_message' THEN whatsapp_interactions + 1 ELSE whatsapp_interactions END,
    email_interactions = CASE WHEN NEW.type = 'email' THEN email_interactions + 1 ELSE email_interactions END,
    call_interactions = CASE WHEN NEW.type = 'phone_call' THEN call_interactions + 1 ELSE call_interactions END,
    last_contact_at = NOW(),
    last_message_at = CASE WHEN NEW.type IN ('whatsapp_message', 'email') THEN NOW() ELSE last_message_at END
  WHERE id = NEW.lead_id;

  -- Recalcular score
  PERFORM calculate_lead_score(NEW.lead_id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_lead_score
  AFTER INSERT ON lead_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_lead_score_on_interaction();

-- View para analytics de leads
CREATE OR REPLACE VIEW lead_conversion_metrics AS
SELECT
  source,
  COUNT(*) as total_leads,
  COUNT(*) FILTER (WHERE status = 'won') as converted_leads,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'won')::DECIMAL / NULLIF(COUNT(*), 0) * 100,
    2
  ) as conversion_rate,
  AVG(EXTRACT(DAY FROM (converted_at - created_at))) FILTER (WHERE status = 'won') as avg_days_to_convert,
  AVG(lead_score) as avg_lead_score,
  COUNT(*) FILTER (WHERE engagement_level = 'hot') as hot_leads,
  COUNT(*) FILTER (WHERE engagement_level = 'warm') as warm_leads,
  COUNT(*) FILTER (WHERE engagement_level = 'cold') as cold_leads
FROM leads
GROUP BY source;

-- Comentários
COMMENT ON TABLE leads IS 'Tabela de leads (prospects) antes de se tornarem pacientes';
COMMENT ON TABLE lead_interactions IS 'Histórico de todas interações com leads';
COMMENT ON TABLE sales_pipeline IS 'Configuração de pipelines de vendas personalizáveis';
COMMENT ON FUNCTION calculate_lead_score IS 'Calcula score do lead baseado em múltiplos fatores';
COMMENT ON FUNCTION convert_lead_to_patient IS 'Converte um lead em paciente, sincronizando todos os dados';
