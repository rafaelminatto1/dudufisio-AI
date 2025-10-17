-- =====================================================
-- SISTEMA DE AUTOMAÇÕES CRM
-- Automação de follow-up e mensagens automáticas
-- =====================================================

-- 1. Tabela de Templates de Mensagens
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Adicionar colunas se não existirem
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'name') THEN
        ALTER TABLE message_templates ADD COLUMN name VARCHAR(255) NOT NULL DEFAULT 'Sem título';
        -- Remover default depois de adicionar
        ALTER TABLE message_templates ALTER COLUMN name DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'category') THEN
        ALTER TABLE message_templates ADD COLUMN category VARCHAR(100) NOT NULL DEFAULT 'follow_up';
        ALTER TABLE message_templates ALTER COLUMN category DROP DEFAULT;
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
                   AND column_name = 'content') THEN
        ALTER TABLE message_templates ADD COLUMN content TEXT NOT NULL DEFAULT '';
        ALTER TABLE message_templates ALTER COLUMN content DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'variables') THEN
        ALTER TABLE message_templates ADD COLUMN variables JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'channel') THEN
        ALTER TABLE message_templates ADD COLUMN channel VARCHAR(50) NOT NULL DEFAULT 'whatsapp' CHECK (channel IN ('whatsapp', 'email', 'sms'));
        ALTER TABLE message_templates ALTER COLUMN channel DROP DEFAULT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema = 'public' 
                   AND table_name = 'message_templates' 
                   AND column_name = 'is_active') THEN
        ALTER TABLE message_templates ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_message_templates_category ON message_templates(category);
CREATE INDEX IF NOT EXISTS idx_message_templates_channel ON message_templates(channel);

-- 2. Tabela de Regras de Automação
CREATE TABLE IF NOT EXISTS automation_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    trigger_type VARCHAR(100) NOT NULL,
    -- 'no_response_24h', 'qualified_3days', 'new_lead', 'stage_change', 'inactive_7days'
    trigger_conditions JSONB DEFAULT '{}'::jsonb,
    action_type VARCHAR(100) NOT NULL,
    -- 'send_message', 'update_status', 'assign_to', 'create_task', 'send_notification'
    action_config JSONB NOT NULL,
    template_id UUID REFERENCES message_templates(id) ON DELETE SET NULL,
    delay_minutes INTEGER DEFAULT 0, -- Delay antes de executar
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_executed_at TIMESTAMPTZ
);

CREATE INDEX idx_automation_rules_trigger ON automation_rules(trigger_type);
CREATE INDEX idx_automation_rules_active ON automation_rules(is_active);

-- 3. Tabela de Execuções de Automações (Log)
CREATE TABLE IF NOT EXISTS automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_id UUID NOT NULL REFERENCES automation_rules(id) ON DELETE CASCADE,
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
    execution_status VARCHAR(50) NOT NULL CHECK (execution_status IN ('pending', 'running', 'success', 'failed', 'skipped')),
    trigger_data JSONB DEFAULT '{}'::jsonb,
    action_result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    executed_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_automation_executions_rule_id ON automation_executions(rule_id);
CREATE INDEX idx_automation_executions_lead_id ON automation_executions(lead_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(execution_status);
CREATE INDEX idx_automation_executions_executed_at ON automation_executions(executed_at DESC);

-- 4. Tabela de Follow-ups Agendados
CREATE TABLE IF NOT EXISTS scheduled_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES automation_rules(id) ON DELETE SET NULL,
    scheduled_for TIMESTAMPTZ NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    message TEXT,
    channel VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX idx_scheduled_followups_lead_id ON scheduled_followups(lead_id);
CREATE INDEX idx_scheduled_followups_scheduled_for ON scheduled_followups(scheduled_for);
CREATE INDEX idx_scheduled_followups_status ON scheduled_followups(status);

-- =====================================================
-- FUNÇÕES SQL
-- =====================================================

-- 1. Função para processar regras automáticas
CREATE OR REPLACE FUNCTION process_automation_rules()
RETURNS TABLE (
    rule_id UUID,
    leads_affected INTEGER,
    executions_created INTEGER
) AS $$
DECLARE
    rule RECORD;
    lead_record RECORD;
    execution_id UUID;
    executions_count INTEGER := 0;
BEGIN
    -- Iterar por todas as regras ativas
    FOR rule IN
        SELECT * FROM automation_rules
        WHERE is_active = true
        ORDER BY priority DESC
    LOOP
        executions_count := 0;

        -- Processar cada tipo de trigger
        CASE rule.trigger_type
            WHEN 'no_response_24h' THEN
                -- Leads sem resposta há 24h
                FOR lead_record IN
                    SELECT l.*
                    FROM leads l
                    WHERE l.status IN ('new', 'contacted')
                    AND l.last_contact_at < NOW() - INTERVAL '24 hours'
                    AND NOT EXISTS (
                        SELECT 1 FROM automation_executions ae
                        WHERE ae.rule_id = rule.id
                        AND ae.lead_id = l.id
                        AND ae.executed_at > NOW() - INTERVAL '24 hours'
                    )
                LOOP
                    -- Criar execução
                    INSERT INTO automation_executions (
                        rule_id, lead_id, execution_status, trigger_data
                    ) VALUES (
                        rule.id, lead_record.id, 'pending',
                        jsonb_build_object('trigger', 'no_response_24h', 'hours_since_contact',
                            EXTRACT(EPOCH FROM (NOW() - lead_record.last_contact_at))/3600
                        )
                    );
                    executions_count := executions_count + 1;
                END LOOP;

            WHEN 'qualified_3days' THEN
                -- Leads qualificados há 3+ dias sem próximo passo
                FOR lead_record IN
                    SELECT l.*
                    FROM leads l
                    WHERE l.status = 'qualified'
                    AND l.updated_at < NOW() - INTERVAL '3 days'
                    AND l.next_followup_at IS NULL
                    AND NOT EXISTS (
                        SELECT 1 FROM automation_executions ae
                        WHERE ae.rule_id = rule.id
                        AND ae.lead_id = l.id
                        AND ae.executed_at > NOW() - INTERVAL '3 days'
                    )
                LOOP
                    INSERT INTO automation_executions (
                        rule_id, lead_id, execution_status, trigger_data
                    ) VALUES (
                        rule.id, lead_record.id, 'pending',
                        jsonb_build_object('trigger', 'qualified_3days', 'days_qualified',
                            EXTRACT(DAY FROM (NOW() - lead_record.updated_at))
                        )
                    );
                    executions_count := executions_count + 1;
                END LOOP;

            WHEN 'inactive_7days' THEN
                -- Leads inativos há 7+ dias
                FOR lead_record IN
                    SELECT l.*
                    FROM leads l
                    WHERE l.status IN ('contacted', 'qualified')
                    AND l.last_contact_at < NOW() - INTERVAL '7 days'
                    AND l.engagement_level != 'cold'
                    AND NOT EXISTS (
                        SELECT 1 FROM automation_executions ae
                        WHERE ae.rule_id = rule.id
                        AND ae.lead_id = l.id
                        AND ae.executed_at > NOW() - INTERVAL '7 days'
                    )
                LOOP
                    INSERT INTO automation_executions (
                        rule_id, lead_id, execution_status, trigger_data
                    ) VALUES (
                        rule.id, lead_record.id, 'pending',
                        jsonb_build_object('trigger', 'inactive_7days', 'days_inactive',
                            EXTRACT(DAY FROM (NOW() - lead_record.last_contact_at))
                        )
                    );
                    executions_count := executions_count + 1;

                    -- Atualizar engagement para cold
                    UPDATE leads SET engagement_level = 'cold' WHERE id = lead_record.id;
                END LOOP;
        END CASE;

        -- Retornar estatísticas da regra
        RETURN QUERY SELECT rule.id, 0::INTEGER, executions_count;
    END LOOP;

    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 2. Função para aplicar template de mensagem
CREATE OR REPLACE FUNCTION apply_message_template(
    template_id_param UUID,
    variables_param JSONB DEFAULT '{}'::jsonb
)
RETURNS TEXT AS $$
DECLARE
    template_content TEXT;
    variable_key TEXT;
    variable_value TEXT;
BEGIN
    -- Buscar template
    SELECT content INTO template_content
    FROM message_templates
    WHERE id = template_id_param AND is_active = true;

    IF template_content IS NULL THEN
        RAISE EXCEPTION 'Template not found or inactive';
    END IF;

    -- Substituir variáveis
    FOR variable_key, variable_value IN
        SELECT * FROM jsonb_each_text(variables_param)
    LOOP
        template_content := REPLACE(template_content, '{' || variable_key || '}', variable_value);
    END LOOP;

    RETURN template_content;
END;
$$ LANGUAGE plpgsql;

-- 3. Função para agendar follow-up
CREATE OR REPLACE FUNCTION schedule_followup(
    lead_id_param UUID,
    hours_delay INTEGER DEFAULT 24,
    message_param TEXT DEFAULT NULL,
    channel_param VARCHAR(50) DEFAULT 'whatsapp'
)
RETURNS UUID AS $$
DECLARE
    followup_id UUID;
BEGIN
    INSERT INTO scheduled_followups (
        lead_id,
        scheduled_for,
        message,
        channel
    ) VALUES (
        lead_id_param,
        NOW() + (hours_delay || ' hours')::INTERVAL,
        message_param,
        channel_param
    )
    RETURNING id INTO followup_id;

    -- Atualizar lead com próximo follow-up
    UPDATE leads
    SET next_followup_at = NOW() + (hours_delay || ' hours')::INTERVAL
    WHERE id = lead_id_param;

    RETURN followup_id;
END;
$$ LANGUAGE plpgsql;

-- 4. Função para obter follow-ups pendentes
CREATE OR REPLACE FUNCTION get_pending_followups()
RETURNS TABLE (
    followup_id UUID,
    lead_id UUID,
    lead_name VARCHAR,
    lead_phone VARCHAR,
    message TEXT,
    channel VARCHAR,
    scheduled_for TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        sf.id,
        sf.lead_id,
        l.name,
        l.phone,
        sf.message,
        sf.channel,
        sf.scheduled_for
    FROM scheduled_followups sf
    INNER JOIN leads l ON l.id = sf.lead_id
    WHERE sf.status = 'pending'
    AND sf.scheduled_for <= NOW()
    ORDER BY sf.scheduled_for ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_message_templates_updated_at
    BEFORE UPDATE ON message_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automation_rules_updated_at
    BEFORE UPDATE ON automation_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- RLS POLICIES
-- =====================================================

ALTER TABLE message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_followups ENABLE ROW LEVEL SECURITY;

-- Policies (simplificadas - ajustar conforme necessidade)
CREATE POLICY "Enable all for authenticated users" ON message_templates
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON automation_rules
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON automation_executions
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all for authenticated users" ON scheduled_followups
    FOR ALL USING (auth.role() = 'authenticated');

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE message_templates IS 'Templates de mensagens para automações';
COMMENT ON TABLE automation_rules IS 'Regras de automação do CRM';
COMMENT ON TABLE automation_executions IS 'Log de execuções das automações';
COMMENT ON TABLE scheduled_followups IS 'Follow-ups agendados';
COMMENT ON FUNCTION process_automation_rules() IS 'Processa todas as regras ativas e cria execuções';
COMMENT ON FUNCTION apply_message_template(UUID, JSONB) IS 'Aplica variáveis a um template';
COMMENT ON FUNCTION schedule_followup(UUID, INTEGER, TEXT, VARCHAR) IS 'Agenda follow-up para lead';
COMMENT ON FUNCTION get_pending_followups() IS 'Retorna follow-ups pendentes para execução';
