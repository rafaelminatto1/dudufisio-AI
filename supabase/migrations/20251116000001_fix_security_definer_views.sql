-- Migration: Fix Security Definer Views
-- Data: 16/11/2025
-- Descrição: Remove SECURITY DEFINER de views conforme recomendação do Supabase Advisor
-- Tipo: Correção de Segurança (CRÍTICO)

-- ============================================================================
-- 1. V_ACTIVE_PRESCRIPTIONS
-- ============================================================================
-- Drop e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.v_active_prescriptions CASCADE;

CREATE VIEW public.v_active_prescriptions
WITH (security_invoker = true)
AS
SELECT 
    pep.id,
    pep.patient_id,
    pep.therapist_id,
    pep.start_date,
    pep.end_date,
    pep.status,
    p.name as patient_name,
    p.email as patient_email,
    u.full_name as therapist_name,
    pep.completion_percentage,
    pep.sessions_completed,
    pep.total_sessions_planned
FROM patient_exercise_prescriptions pep
JOIN patients p ON p.id = pep.patient_id
LEFT JOIN users u ON u.id = pep.therapist_id
WHERE pep.status = 'active'
GROUP BY pep.id, p.id, u.id;

-- Grant permissions
GRANT SELECT ON public.v_active_prescriptions TO authenticated;

-- Comentário
COMMENT ON VIEW public.v_active_prescriptions IS 
'View de prescrições ativas com SECURITY INVOKER (respeita RLS do usuário que consulta)';

-- ============================================================================
-- 2. V_FINANCIAL_MONTHLY_SUMMARY
-- ============================================================================
-- Drop e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.v_financial_monthly_summary CASCADE;

CREATE VIEW public.v_financial_monthly_summary
WITH (security_invoker = true)
AS
SELECT 
    DATE_TRUNC('month', ft.payment_date) as month,
    ft.therapist_id,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE 0 END) as total_income,
    SUM(CASE WHEN ft.type = 'expense' THEN ft.amount ELSE 0 END) as total_expenses,
    SUM(CASE WHEN ft.type = 'income' THEN ft.amount ELSE -ft.amount END) as net_balance,
    COUNT(DISTINCT CASE WHEN ft.type = 'income' THEN ft.id END) as income_count,
    COUNT(DISTINCT CASE WHEN ft.type = 'expense' THEN ft.id END) as expense_count
FROM financial_transactions ft
WHERE ft.payment_status = 'completed'
GROUP BY DATE_TRUNC('month', ft.payment_date), ft.therapist_id;

-- Grant permissions
GRANT SELECT ON public.v_financial_monthly_summary TO authenticated;

-- Comentário
COMMENT ON VIEW public.v_financial_monthly_summary IS 
'Resumo financeiro mensal com SECURITY INVOKER (respeita RLS do usuário que consulta)';

-- ============================================================================
-- 3. PATIENT_INSIGHTS_SUMMARY
-- ============================================================================
-- Drop e recriar sem SECURITY DEFINER
DROP VIEW IF EXISTS public.patient_insights_summary CASCADE;

CREATE VIEW public.patient_insights_summary
WITH (security_invoker = true)
AS
SELECT 
    p.id as patient_id,
    p.name as patient_name,
    p.email,
    p.status as patient_status,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) as cancelled_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'no_show' THEN a.id END) as no_show_count,
    COUNT(DISTINCT se.id) as total_sessions,
    MAX(a.appointment_date) as last_appointment_date,
    MAX(se.session_date) as last_session_date,
    AVG(se.pain_level_before) as avg_pain_before,
    AVG(se.pain_level_after) as avg_pain_after,
    COALESCE(SUM(ft.amount), 0) as total_payments
FROM patients p
LEFT JOIN appointments a ON a.patient_id = p.id
LEFT JOIN session_evolutions se ON se.patient_id = p.id
LEFT JOIN financial_transactions ft ON ft.patient_id = p.id AND ft.type = 'income' AND ft.status = 'completed'
GROUP BY p.id;

-- Grant permissions
GRANT SELECT ON public.patient_insights_summary TO authenticated;

-- Comentário
COMMENT ON VIEW public.patient_insights_summary IS 
'Resumo de insights dos pacientes com SECURITY INVOKER (respeita RLS do usuário que consulta)';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Query para verificar que não há mais views com SECURITY DEFINER
-- SELECT 
--     schemaname, 
--     viewname,
--     definition
-- FROM pg_views 
-- WHERE schemaname = 'public' 
-- AND definition ILIKE '%security definer%';

