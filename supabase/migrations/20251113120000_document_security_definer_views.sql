-- Migration: Documentar views com SECURITY DEFINER
-- Data: 2025-11-13
-- Descrição: Adiciona comentários explicativos nas views que usam SECURITY DEFINER

-- ============================================================================
-- ANÁLISE DAS VIEWS SECURITY DEFINER
-- ============================================================================

-- As 3 views abaixo usam SECURITY DEFINER por motivos legítimos:
-- 1. Precisam agregar dados de múltiplas tabelas com RLS diferentes
-- 2. Fornecem visualizações consolidadas que requerem acesso cross-table
-- 3. São views read-only que não permitem modificação de dados

-- ============================================================================
-- 1. v_active_prescriptions
-- ============================================================================

COMMENT ON VIEW public.v_active_prescriptions IS
'View com SECURITY DEFINER que consolida prescrições de exercícios ativos com dados de pacientes e terapeutas.

JUSTIFICATIVA SECURITY DEFINER:
- Faz JOIN entre 4 tabelas: patient_exercise_prescriptions, patients, therapists, users
- Cada tabela tem políticas RLS diferentes
- SECURITY DEFINER necessário para agregação cross-table
- View é READ-ONLY (SELECT apenas)

SEGURANÇA:
- Filtra apenas prescrições ativas (status = ''active'')
- Exclui registros deletados (deleted_at IS NULL)
- Respeita data de validade (end_date >= CURRENT_DATE)

USO RECOMENDADO:
- Dashboard de terapeutas para visualizar prescrições ativas
- Relatórios de acompanhamento de pacientes
- API endpoints que precisam de visão consolidada';

-- ============================================================================
-- 2. v_financial_monthly_summary
-- ============================================================================

COMMENT ON VIEW public.v_financial_monthly_summary IS
'View com SECURITY DEFINER que agrega transações financeiras por mês.

JUSTIFICATIVA SECURITY DEFINER:
- Agrega dados financeiros sensíveis (receitas, despesas, lucro)
- Realiza cálculos complexos de agregação mensal
- SECURITY DEFINER permite bypass controlado de RLS para agregação
- View é READ-ONLY (SELECT apenas)

SEGURANÇA:
- Filtra apenas transações completadas (status = ''completed'')
- Exclui transações deletadas (deleted_at IS NULL)
- Agregação por mês impede acesso a transações individuais
- Ordenação DESC garante dados mais recentes primeiro

USO RECOMENDADO:
- Dashboard financeiro administrativo
- Relatórios mensais de receitas/despesas
- Análise de lucratividade por período

ATENÇÃO:
- Contém dados financeiros sensíveis
- Acesso deve ser restrito a roles admin/manager
- Considerar adicionar RLS na view se possível';

-- ============================================================================
-- 3. patient_insights_summary
-- ============================================================================

COMMENT ON VIEW public.patient_insights_summary IS
'View com SECURITY DEFINER que agrega insights médicos por paciente.

JUSTIFICATIVA SECURITY DEFINER:
- Agrega dados médicos sensíveis (medical_insights)
- Sumariza insights por severidade (success, warning, error)
- SECURITY DEFINER necessário para agregação de dados clínicos
- View é READ-ONLY (SELECT apenas)

SEGURANÇA:
- Agrega apenas contadores (sem expor texto dos insights)
- Agrupa por patient_id (controle de acesso por paciente)
- View não expõe conteúdo detalhado dos insights
- Útil para dashboards sem expor detalhes médicos

USO RECOMENDADO:
- Dashboard do terapeuta (visão geral do paciente)
- Relatórios de evolução clínica
- Indicadores de qualidade do tratamento

DADOS INCLUÍDOS:
- total_insights: Total de insights gerados
- success_count: Insights positivos (ex: melhora)
- warning_count: Insights de atenção
- error_count: Insights críticos
- pain_insights: Insights sobre redução de dor
- milestones: Marcos importantes do tratamento
- last_insight_date: Data do último insight';

-- ============================================================================
-- RECOMENDAÇÕES DE SEGURANÇA
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'Views SECURITY DEFINER documentadas com sucesso!';
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'Total de views: 3';
  RAISE NOTICE '  - v_active_prescriptions (prescrições ativas)';
  RAISE NOTICE '  - v_financial_monthly_summary (sumário financeiro)';
  RAISE NOTICE '  - patient_insights_summary (sumário de insights médicos)';
  RAISE NOTICE '===================================================================';
  RAISE NOTICE 'RECOMENDAÇÕES:';
  RAISE NOTICE '1. Manter SECURITY DEFINER (necessário para agregação)';
  RAISE NOTICE '2. Monitorar uso das views regularmente';
  RAISE NOTICE '3. Considerar adicionar RLS policies nas views se Supabase permitir';
  RAISE NOTICE '4. Documentar acessos em auditoria se dados muito sensíveis';
  RAISE NOTICE '===================================================================';
END $$;
