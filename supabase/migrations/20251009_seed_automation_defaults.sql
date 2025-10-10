-- =====================================================
-- SEED: Regras e Templates Padrão para Automações CRM
-- =====================================================

-- =====================================================
-- 1. TEMPLATES DE MENSAGENS
-- =====================================================

-- Template: Boas-vindas novo lead
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Boas-vindas - Novo Lead',
    'welcome',
    'Olá {name}! 👋

Obrigado por entrar em contato com a DuduFisio!

Somos especializados em fisioterapia personalizada e estamos aqui para ajudar você a alcançar seus objetivos de saúde.

Em que posso ajudá-lo(a) hoje?',
    '["name"]'::jsonb,
    'whatsapp'
);

-- Template: Follow-up 24h sem resposta
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Follow-up - 24h sem resposta',
    'follow_up',
    'Oi {name}! 😊

Vi que você entrou em contato conosco ontem, mas ainda não conseguimos conversar.

Gostaria de agendar uma avaliação? Temos horários disponíveis para {date}.

É só me avisar qual horário funciona melhor para você!',
    '["name", "date"]'::jsonb,
    'whatsapp'
);

-- Template: Lead qualificado há 3 dias
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Follow-up - Lead Qualificado',
    'follow_up',
    'Olá {name}! 🎯

Gostaria de saber se você teve tempo de pensar sobre iniciar o tratamento de {service}?

Nossos pacientes têm obtido ótimos resultados e adoraria poder ajudá-lo(a) também!

Posso tirar alguma dúvida?',
    '["name", "service"]'::jsonb,
    'whatsapp'
);

-- Template: Lembrete de agendamento
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Lembrete - Agendamento Pendente',
    'reminder',
    'Oi {name}! 📅

Vi que você demonstrou interesse em agendar uma sessão.

Temos disponibilidade para esta semana:
• {date1} às {time1}
• {date2} às {time2}
• {date3} às {time3}

Qual funciona melhor para você?',
    '["name", "date1", "time1", "date2", "time2", "date3", "time3"]'::jsonb,
    'whatsapp'
);

-- Template: Lead inativo 7 dias
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Reengajamento - 7 dias inativo',
    'follow_up',
    'Olá {name}! 💙

Faz um tempinho que não conversamos...

Queria saber se ainda tem interesse em cuidar da sua saúde com a gente?

Se preferir, posso enviar mais informações sobre nossos serviços de {service}.',
    '["name", "service"]'::jsonb,
    'whatsapp'
);

-- Template: Proposta enviada
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Follow-up - Proposta Enviada',
    'follow_up',
    'Oi {name}! 📋

Você recebeu a proposta que enviei para o tratamento de {service}?

Ficou com alguma dúvida? Estou à disposição para explicar melhor!

Podemos agendar sua primeira sessão? 😊',
    '["name", "service"]'::jsonb,
    'whatsapp'
);

-- Template: Pedido de feedback
INSERT INTO message_templates (name, category, content, variables, channel) VALUES
(
    'Feedback - Interesse',
    'closing',
    'Olá {name}! 🙏

Para melhorar nosso atendimento, gostaria de saber:

O que fez você buscar a DuduFisio? E o que poderia ajudar você a dar o próximo passo no seu tratamento?

Sua opinião é muito importante para nós!',
    '["name"]'::jsonb,
    'whatsapp'
);

-- =====================================================
-- 2. REGRAS DE AUTOMAÇÃO
-- =====================================================

-- Regra 1: Follow-up automático após 24h sem resposta
INSERT INTO automation_rules (
    name,
    description,
    trigger_type,
    trigger_conditions,
    action_type,
    action_config,
    template_id,
    delay_minutes,
    is_active,
    priority
)
SELECT
    'Follow-up 24h - Novo Lead',
    'Envia mensagem de follow-up quando um novo lead não responde em 24 horas',
    'no_response_24h',
    '{
        "statuses": ["new", "contacted"],
        "hours_threshold": 24
    }'::jsonb,
    'send_message',
    '{
        "channel": "whatsapp",
        "mark_as_contacted": true
    }'::jsonb,
    mt.id,
    0,
    true,
    8
FROM message_templates mt
WHERE mt.name = 'Follow-up - 24h sem resposta'
LIMIT 1;

-- Regra 2: Follow-up para leads qualificados há 3 dias
INSERT INTO automation_rules (
    name,
    description,
    trigger_type,
    trigger_conditions,
    action_type,
    action_config,
    template_id,
    delay_minutes,
    is_active,
    priority
)
SELECT
    'Follow-up Lead Qualificado',
    'Envia proposta de agendamento para leads qualificados há 3+ dias',
    'qualified_3days',
    '{
        "status": "qualified",
        "days_threshold": 3,
        "no_next_followup": true
    }'::jsonb,
    'send_message',
    '{
        "channel": "whatsapp",
        "schedule_next_followup": true,
        "followup_hours": 48
    }'::jsonb,
    mt.id,
    0,
    true,
    7
FROM message_templates mt
WHERE mt.name = 'Follow-up - Lead Qualificado'
LIMIT 1;

-- Regra 3: Reengajamento de leads inativos
INSERT INTO automation_rules (
    name,
    description,
    trigger_type,
    trigger_conditions,
    action_type,
    action_config,
    template_id,
    delay_minutes,
    is_active,
    priority
)
SELECT
    'Reengajamento 7 dias',
    'Tenta reengajar leads inativos há 7+ dias',
    'inactive_7days',
    '{
        "statuses": ["contacted", "qualified"],
        "days_threshold": 7,
        "exclude_engagement": ["cold"]
    }'::jsonb,
    'send_message',
    '{
        "channel": "whatsapp",
        "update_engagement": "cold"
    }'::jsonb,
    mt.id,
    0,
    true,
    5
FROM message_templates mt
WHERE mt.name = 'Reengajamento - 7 dias inativo'
LIMIT 1;

-- Regra 4: Boas-vindas automáticas (desabilitada por padrão - requer webhook)
INSERT INTO automation_rules (
    name,
    description,
    trigger_type,
    trigger_conditions,
    action_type,
    action_config,
    template_id,
    delay_minutes,
    is_active,
    priority
)
SELECT
    'Boas-vindas Automáticas',
    'Envia mensagem de boas-vindas para novos leads (requer configuração de webhook)',
    'new_lead',
    '{
        "source": ["whatsapp", "website", "phone"]
    }'::jsonb,
    'send_message',
    '{
        "channel": "whatsapp",
        "immediate": true
    }'::jsonb,
    mt.id,
    5,
    false,
    10
FROM message_templates mt
WHERE mt.name = 'Boas-vindas - Novo Lead'
LIMIT 1;

-- =====================================================
-- 3. VIEWS ÚTEIS
-- =====================================================

-- View: Estatísticas de automações
CREATE OR REPLACE VIEW automation_statistics AS
SELECT
    ar.id AS rule_id,
    ar.name AS rule_name,
    ar.trigger_type,
    ar.is_active,
    COUNT(ae.id) AS total_executions,
    COUNT(CASE WHEN ae.execution_status = 'success' THEN 1 END) AS successful_executions,
    COUNT(CASE WHEN ae.execution_status = 'failed' THEN 1 END) AS failed_executions,
    COUNT(CASE WHEN ae.execution_status = 'pending' THEN 1 END) AS pending_executions,
    ROUND(
        COUNT(CASE WHEN ae.execution_status = 'success' THEN 1 END)::NUMERIC /
        NULLIF(COUNT(ae.id), 0) * 100, 2
    ) AS success_rate,
    MAX(ae.executed_at) AS last_execution,
    ar.created_at
FROM automation_rules ar
LEFT JOIN automation_executions ae ON ae.rule_id = ar.id
GROUP BY ar.id, ar.name, ar.trigger_type, ar.is_active, ar.created_at
ORDER BY ar.priority DESC;

COMMENT ON VIEW automation_statistics IS 'Estatísticas de performance das regras de automação';

-- =====================================================
-- 4. DADOS DE EXEMPLO (comentados - descomentar se desejar testar)
-- =====================================================

/*
-- Exemplo: Criar lead de teste
INSERT INTO leads (name, phone, email, source, status)
VALUES (
    'Maria Silva Teste',
    '+5511999887766',
    'maria.teste@email.com',
    'whatsapp',
    'new'
);

-- Exemplo: Agendar follow-up manual
SELECT schedule_followup(
    (SELECT id FROM leads WHERE name = 'Maria Silva Teste' LIMIT 1),
    24, -- 24 horas
    'Olá Maria! Como posso ajudá-la?',
    'whatsapp'
);
*/

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
