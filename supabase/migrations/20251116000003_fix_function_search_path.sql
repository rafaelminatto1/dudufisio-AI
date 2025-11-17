-- Migration: Fix Function Search Path
-- Data: 16/11/2025
-- Descrição: Adiciona search_path fixo nas funções conforme recomendação do Supabase Advisor
-- Tipo: Correção de Segurança (AVISO - Alta Prioridade)

-- ============================================================================
-- 1. UPDATE_KNOWLEDGE_BASE_SEARCH_VECTOR
-- ============================================================================
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

COMMENT ON FUNCTION public.update_knowledge_base_search_vector() IS 
'Atualiza o vetor de busca da base de conhecimento com search_path fixo';

-- ============================================================================
-- 2. SEARCH_KNOWLEDGE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_knowledge(
    query_text TEXT,
    match_threshold FLOAT DEFAULT 0.3,
    max_results INT DEFAULT 10
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[],
    similarity FLOAT
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
        ts_rank_cd(kb.search_vector, plainto_tsquery('portuguese', query_text)) AS similarity
    FROM public.knowledge_base kb
    WHERE kb.search_vector @@ plainto_tsquery('portuguese', query_text)
    AND ts_rank_cd(kb.search_vector, plainto_tsquery('portuguese', query_text)) >= match_threshold
    ORDER BY similarity DESC
    LIMIT max_results;
END;
$$;

COMMENT ON FUNCTION public.search_knowledge(TEXT, FLOAT, INT) IS 
'Busca na base de conhecimento usando full-text search com search_path fixo';

-- ============================================================================
-- 3. HYBRID_SEARCH_KNOWLEDGE
-- ============================================================================
CREATE OR REPLACE FUNCTION public.hybrid_search_knowledge(
    query_text TEXT,
    query_embedding VECTOR(1536),
    match_threshold FLOAT DEFAULT 0.3,
    match_count INT DEFAULT 10,
    full_text_weight FLOAT DEFAULT 0.5,
    semantic_weight FLOAT DEFAULT 0.5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    tags TEXT[],
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog, extensions
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
            (full_text_weight * ts_rank_cd(kb.search_vector, plainto_tsquery('portuguese', query_text))) +
            (semantic_weight * (1 - (kb.embedding <=> query_embedding)))
        ) AS similarity
    FROM public.knowledge_base kb
    WHERE 
        (kb.search_vector @@ plainto_tsquery('portuguese', query_text)
        OR (kb.embedding <=> query_embedding) < (1 - match_threshold))
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;

COMMENT ON FUNCTION public.hybrid_search_knowledge(TEXT, VECTOR, FLOAT, INT, FLOAT, FLOAT) IS 
'Busca híbrida (full-text + semântica) na base de conhecimento com search_path fixo';

-- ============================================================================
-- 4. UPDATE_UPDATED_AT_COLUMN
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_catalog
AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS 
'Atualiza automaticamente a coluna updated_at com search_path fixo';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Query para verificar search_path das funções
-- SELECT 
--     n.nspname AS schema,
--     p.proname AS function,
--     pg_get_functiondef(p.oid) AS definition
-- FROM pg_proc p
-- JOIN pg_namespace n ON p.pronamespace = n.oid
-- WHERE n.nspname = 'public'
-- AND p.proname IN (
--     'update_knowledge_base_search_vector',
--     'search_knowledge',
--     'hybrid_search_knowledge',
--     'update_updated_at_column'
-- );

