-- ==========================================
-- VERIFICAÇÃO COMPLETA DAS MIGRAÇÕES CRM
-- Execute este SQL no Supabase Dashboard
-- ==========================================

-- 1️⃣ VERIFICAR TABELAS CRIADAS
SELECT
    '1. TABELAS CRM' as verificacao,
    tablename as nome,
    CASE
        WHEN tablename IN ('leads', 'lead_interactions', 'sales_pipeline',
                           'message_templates', 'automation_rules',
                           'automation_executions', 'scheduled_followups')
        THEN '✅ OK'
        ELSE '⚠️ Extra'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
  'leads',
  'lead_interactions',
  'sales_pipeline',
  'message_templates',
  'automation_rules',
  'automation_executions',
  'scheduled_followups'
)
ORDER BY tablename;

-- Esperado: 7 tabelas com status ✅ OK

-- ==========================================

-- 2️⃣ VERIFICAR COLUNAS DA TABELA LEADS
SELECT
    '2. COLUNAS LEADS' as verificacao,
    column_name as coluna,
    data_type as tipo,
    is_nullable as permite_null
FROM information_schema.columns
WHERE table_name = 'leads'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Esperado: ~20 colunas incluindo id, name, email, phone, status, lead_score, etc

-- ==========================================

-- 3️⃣ VERIFICAR FUNÇÕES SQL CRIADAS
SELECT
    '3. FUNÇÕES SQL' as verificacao,
    proname as funcao,
    CASE
        WHEN proname IN (
            'calculate_lead_score',
            'convert_lead_to_patient',
            'process_automation_rules',
            'apply_message_template',
            'schedule_followup',
            'get_pending_followups',
            'update_lead_score_on_interaction'
        ) THEN '✅ OK'
        ELSE '⚠️ Extra'
    END as status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
AND proname LIKE '%lead%' OR proname LIKE '%automation%' OR proname LIKE '%followup%'
ORDER BY proname;

-- Esperado: 6-7 funções relacionadas ao CRM

-- ==========================================

-- 4️⃣ VERIFICAR DADOS SEED INSERIDOS
SELECT
    '4. TEMPLATES' as verificacao,
    COUNT(*) as quantidade,
    CASE WHEN COUNT(*) >= 7 THEN '✅ OK (7 templates)'
         ELSE '⚠️ Faltando templates' END as status
FROM message_templates

UNION ALL

SELECT
    '4. REGRAS AUTOMAÇÃO' as verificacao,
    COUNT(*) as quantidade,
    CASE WHEN COUNT(*) >= 4 THEN '✅ OK (4 regras)'
         ELSE '⚠️ Faltando regras' END as status
FROM automation_rules

UNION ALL

SELECT
    '4. PIPELINES' as verificacao,
    COUNT(*) as quantidade,
    CASE WHEN COUNT(*) >= 1 THEN '✅ OK (1 pipeline)'
         ELSE '⚠️ Faltando pipeline' END as status
FROM sales_pipeline;

-- Esperado: Templates: 7, Regras: 4, Pipelines: 1

-- ==========================================

-- 5️⃣ VERIFICAR VIEWS CRIADAS
SELECT
    '5. VIEWS ANALÍTICAS' as verificacao,
    viewname as view,
    CASE
        WHEN viewname IN ('lead_conversion_metrics', 'automation_statistics')
        THEN '✅ OK'
        ELSE '⚠️ Extra'
    END as status
FROM pg_views
WHERE schemaname = 'public'
AND (viewname LIKE '%lead%' OR viewname LIKE '%automation%')
ORDER BY viewname;

-- Esperado: 2 views (lead_conversion_metrics, automation_statistics)

-- ==========================================

-- 6️⃣ VERIFICAR ÍNDICES CRIADOS
SELECT
    '6. ÍNDICES' as verificacao,
    tablename as tabela,
    COUNT(*) as quantidade_indices
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'leads',
    'lead_interactions',
    'message_templates',
    'automation_rules',
    'automation_executions',
    'scheduled_followups'
)
GROUP BY tablename
ORDER BY tablename;

-- Esperado: Cada tabela deve ter pelo menos 1-3 índices

-- ==========================================

-- 7️⃣ VERIFICAR PIPELINE PADRÃO
SELECT
    '7. PIPELINE PADRÃO' as verificacao,
    name as nome,
    is_default,
    is_active,
    jsonb_array_length(stages) as qtd_estagios,
    CASE
        WHEN is_default = true AND jsonb_array_length(stages) = 7
        THEN '✅ OK (7 estágios)'
        ELSE '⚠️ Verificar'
    END as status
FROM sales_pipeline
WHERE is_default = true;

-- Esperado: 1 pipeline "Pipeline Fisioterapia" com 7 estágios

-- ==========================================

-- 8️⃣ VERIFICAR TEMPLATES DE MENSAGENS
SELECT
    '8. TEMPLATES MENSAGENS' as verificacao,
    name as nome,
    category as categoria,
    channel as canal,
    is_active as ativo
FROM message_templates
ORDER BY name;

-- Esperado: 7 templates (Boas-vindas, Follow-up 24h, Follow-up Qualificado, etc)

-- ==========================================

-- 9️⃣ VERIFICAR REGRAS DE AUTOMAÇÃO
SELECT
    '9. REGRAS AUTOMAÇÃO' as verificacao,
    name as nome,
    trigger_type as gatilho,
    action_type as acao,
    is_active as ativo,
    priority as prioridade
FROM automation_rules
ORDER BY priority DESC;

-- Esperado: 4 regras (Boas-vindas, Follow-up 24h, Follow-up Qualificado, Reengajamento)

-- ==========================================

-- 🔟 TESTE FUNCIONAL - CRIAR LEAD DE TESTE
DO $$
DECLARE
    test_lead_id UUID;
    lead_score_result INTEGER;
    followup_id UUID;
BEGIN
    -- Criar lead de teste
    INSERT INTO leads (name, phone, email, source, status, urgency)
    VALUES (
        'TESTE VERIFICAÇÃO - ' || NOW()::text,
        '+5511999999999',
        'teste@verificacao.com',
        'whatsapp',
        'new',
        'high'
    )
    RETURNING id INTO test_lead_id;

    RAISE NOTICE '✅ Lead teste criado: %', test_lead_id;

    -- Testar cálculo de score
    lead_score_result := calculate_lead_score(test_lead_id);
    RAISE NOTICE '✅ Score calculado: %', lead_score_result;

    -- Testar agendamento de follow-up
    followup_id := schedule_followup(
        test_lead_id,
        24,
        'Mensagem de teste',
        'whatsapp'
    );
    RAISE NOTICE '✅ Follow-up agendado: %', followup_id;

    -- Limpar dados de teste
    DELETE FROM leads WHERE id = test_lead_id;
    RAISE NOTICE '✅ Lead teste removido';

    RAISE NOTICE '========================================';
    RAISE NOTICE '🎉 TESTE FUNCIONAL COMPLETO - TUDO OK!';
    RAISE NOTICE '========================================';
END $$;

-- ==========================================

-- 📊 RESUMO FINAL
SELECT
    '=== RESUMO FINAL ===' as titulo,
    (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public'
     AND tablename IN ('leads', 'lead_interactions', 'sales_pipeline',
                       'message_templates', 'automation_rules',
                       'automation_executions', 'scheduled_followups')) as tabelas_crm,
    (SELECT COUNT(*) FROM pg_proc p JOIN pg_namespace n ON p.pronamespace = n.oid
     WHERE n.nspname = 'public' AND (proname LIKE '%lead%' OR proname LIKE '%automation%')) as funcoes_sql,
    (SELECT COUNT(*) FROM message_templates) as templates,
    (SELECT COUNT(*) FROM automation_rules) as regras,
    (SELECT COUNT(*) FROM sales_pipeline WHERE is_default = true) as pipeline_padrao,
    (SELECT COUNT(*) FROM pg_views WHERE schemaname = 'public'
     AND viewname IN ('lead_conversion_metrics', 'automation_statistics')) as views_analiticas;

-- Esperado:
-- tabelas_crm: 7
-- funcoes_sql: 6-7
-- templates: 7
-- regras: 4
-- pipeline_padrao: 1
-- views_analiticas: 2

-- ==========================================
-- ✅ SE TODOS OS VALORES BATEREM = SUCESSO!
-- ==========================================
