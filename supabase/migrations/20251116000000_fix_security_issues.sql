-- Migration: Fix Security Issues
-- Description: Corrige problemas de segurança identificados pelo Supabase Advisor
-- Date: 2025-11-16

-- ================================================
-- 1. FIX SECURITY DEFINER VIEWS
-- ================================================
-- Problema: Views com SECURITY DEFINER executam com permissões do criador
-- Solução: Recriar views com SECURITY INVOKER (permissões do usuário que executa)

-- View 1: v_active_prescriptions
DROP VIEW IF EXISTS public.v_active_prescriptions CASCADE;
CREATE VIEW public.v_active_prescriptions
WITH (security_invoker = true)
AS
SELECT 
    pep.id,
    pep.patient_id,
    pep.therapist_id,
    pep.status,
    pep.start_date,
    pep.end_date,
    pep.notes,
    pep.created_at,
    pep.updated_at,
    p.full_name as patient_name,
    u.full_name as therapist_name
FROM patient_exercise_prescriptions pep
LEFT JOIN patients p ON pep.patient_id = p.id
LEFT JOIN users u ON pep.therapist_id = u.id
WHERE pep.status = 'active' 
  AND (pep.end_date IS NULL OR pep.end_date >= CURRENT_DATE);

-- View 2: v_financial_monthly_summary  
DROP VIEW IF EXISTS public.v_financial_monthly_summary CASCADE;
CREATE VIEW public.v_financial_monthly_summary
WITH (security_invoker = true)
AS
SELECT 
    DATE_TRUNC('month', ft.payment_date) as month,
    ft.transaction_type,
    COUNT(*) as transaction_count,
    SUM(ft.amount) as total_amount,
    AVG(ft.amount) as avg_amount
FROM financial_transactions ft
WHERE ft.payment_date >= DATE_TRUNC('month', CURRENT_DATE - INTERVAL '12 months')
  AND ft.payment_date IS NOT NULL
GROUP BY DATE_TRUNC('month', ft.payment_date), ft.transaction_type
ORDER BY month DESC, ft.transaction_type;

-- View 3: patient_insights_summary
DROP VIEW IF EXISTS public.patient_insights_summary CASCADE;
CREATE VIEW public.patient_insights_summary
WITH (security_invoker = true)
AS
SELECT 
    p.id as patient_id,
    p.full_name as patient_name,
    p.email,
    p.phone,
    COUNT(DISTINCT a.id) as total_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'completed' THEN a.id END) as completed_appointments,
    COUNT(DISTINCT CASE WHEN a.status = 'cancelled' THEN a.id END) as cancelled_appointments,
    COUNT(DISTINCT se.id) as total_sessions,
    MAX(a.start_time) as last_appointment_date,
    p.created_at as registration_date
FROM patients p
LEFT JOIN appointments a ON p.id = a.patient_id
LEFT JOIN session_evolutions se ON p.id = se.patient_id
GROUP BY p.id, p.full_name, p.email, p.phone, p.created_at;

-- ================================================
-- 2. ENABLE RLS ON KNOWLEDGE_BASE_QUERIES
-- ================================================
-- Problema: Tabela pública sem RLS habilitado
-- Solução: Habilitar RLS e criar políticas apropriadas

ALTER TABLE public.knowledge_base_queries ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem inserir suas próprias queries
CREATE POLICY "Users can insert their own queries"
ON public.knowledge_base_queries
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: Usuários podem ver suas próprias queries
CREATE POLICY "Users can view their own queries"
ON public.knowledge_base_queries
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: Admins podem ver todas as queries
CREATE POLICY "Admins can view all queries"
ON public.knowledge_base_queries
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM users
        WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
);

-- ================================================
-- 3. FIX FUNCTION SEARCH_PATH
-- ================================================
-- Problema: Funções sem search_path definido podem ser vulneráveis
-- Solução: Adicionar search_path explícito

-- Function 1: update_knowledge_base_search_vector
CREATE OR REPLACE FUNCTION public.update_knowledge_base_search_vector()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('portuguese', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.content, '')), 'B') ||
        setweight(to_tsvector('portuguese', COALESCE(NEW.tags::text, '')), 'C');
    RETURN NEW;
END;
$$;

-- Function 2: search_knowledge
CREATE OR REPLACE FUNCTION public.search_knowledge(
    search_query text,
    limit_count integer DEFAULT 10
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    category text,
    tags jsonb,
    rank real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.tags,
        ts_rank(kb.search_vector, websearch_to_tsquery('portuguese', search_query)) as rank
    FROM knowledge_base kb
    WHERE kb.search_vector @@ websearch_to_tsquery('portuguese', search_query)
    ORDER BY rank DESC
    LIMIT limit_count;
END;
$$;

-- Function 3: hybrid_search_knowledge
CREATE OR REPLACE FUNCTION public.hybrid_search_knowledge(
    search_query text,
    embedding_vector vector(1536),
    limit_count integer DEFAULT 10,
    text_weight real DEFAULT 0.5,
    semantic_weight real DEFAULT 0.5
)
RETURNS TABLE (
    id uuid,
    title text,
    content text,
    category text,
    tags jsonb,
    combined_score real
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        kb.id,
        kb.title,
        kb.content,
        kb.category,
        kb.tags,
        (
            (ts_rank(kb.search_vector, websearch_to_tsquery('portuguese', search_query)) * text_weight) +
            ((1 - (kb.embedding <=> embedding_vector)) * semantic_weight)
        ) as combined_score
    FROM knowledge_base kb
    WHERE kb.search_vector @@ websearch_to_tsquery('portuguese', search_query)
       OR kb.embedding IS NOT NULL
    ORDER BY combined_score DESC
    LIMIT limit_count;
END;
$$;

-- Function 4: update_updated_at_column
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- ================================================
-- 4. COMMENTS FOR DOCUMENTATION
-- ================================================
COMMENT ON VIEW public.v_active_prescriptions IS 
'View com SECURITY INVOKER - mostra prescrições ativas de exercícios com RLS';

COMMENT ON VIEW public.v_financial_monthly_summary IS 
'View com SECURITY INVOKER - resumo financeiro mensal com RLS';

COMMENT ON VIEW public.patient_insights_summary IS 
'View com SECURITY INVOKER - insights consolidados de pacientes com RLS';

COMMENT ON POLICY "Users can insert their own queries" ON public.knowledge_base_queries IS 
'Permite que usuários autenticados insiram suas próprias queries na base de conhecimento';

COMMENT ON FUNCTION public.update_knowledge_base_search_vector() IS 
'Trigger function com search_path definido para atualizar vetor de busca full-text';

COMMENT ON FUNCTION public.search_knowledge(text, integer) IS 
'Função de busca full-text com search_path definido e proteção contra SQL injection';

