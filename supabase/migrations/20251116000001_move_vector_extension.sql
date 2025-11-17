-- Migration: Move Vector Extension to Extensions Schema
-- Description: Move a extensão pgvector do schema public para o schema extensions
-- Date: 2025-11-16
-- Reason: Extensões no schema public podem expor vulnerabilidades de segurança

-- ================================================
-- 1. CREATE EXTENSIONS SCHEMA IF NOT EXISTS
-- ================================================
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant usage on extensions schema
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- ================================================
-- 2. MOVE VECTOR EXTENSION
-- ================================================
-- Note: A extensão vector já está instalada no schema public
-- Vamos movê-la para o schema extensions

-- Primeiro, verificamos se a extensão existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM pg_extension 
        WHERE extname = 'vector' 
        AND extnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
    ) THEN
        -- Move a extensão para o schema extensions
        ALTER EXTENSION vector SET SCHEMA extensions;
        
        RAISE NOTICE 'Extensão vector movida para schema extensions com sucesso';
    ELSE
        RAISE NOTICE 'Extensão vector não encontrada no schema public ou já está no schema extensions';
    END IF;
END $$;

-- ================================================
-- 3. UPDATE SEARCH_PATH FOR FUNCTIONS USING VECTOR
-- ================================================
-- Atualizar funções que usam o tipo vector para incluir extensions no search_path

-- Se houver funções que usam o tipo vector, elas precisam ter o search_path atualizado
-- Exemplo: hybrid_search_knowledge já foi atualizada na migration anterior

-- ================================================
-- 4. VERIFY VECTOR EXTENSION IS IN EXTENSIONS SCHEMA
-- ================================================
DO $$
DECLARE
    ext_schema text;
BEGIN
    SELECT nspname INTO ext_schema
    FROM pg_extension e
    JOIN pg_namespace n ON e.extnamespace = n.oid
    WHERE e.extname = 'vector';
    
    IF ext_schema = 'extensions' THEN
        RAISE NOTICE 'Verificação OK: Extensão vector está no schema extensions';
    ELSE
        RAISE WARNING 'Atenção: Extensão vector está no schema: %', ext_schema;
    END IF;
END $$;

-- ================================================
-- 5. GRANT PERMISSIONS ON VECTOR TYPES
-- ================================================
-- Garantir que os roles possam usar os tipos e funções do vector

GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO postgres, service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA extensions TO authenticated, anon;

-- ================================================
-- 6. UPDATE HYBRID_SEARCH_KNOWLEDGE FUNCTION
-- ================================================
-- Atualizar a função para usar extensions no search_path
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
SET search_path = public, extensions, pg_catalog
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

COMMENT ON FUNCTION public.hybrid_search_knowledge(text, vector, integer, real, real) IS 
'Função de busca híbrida (full-text + semântica) com search_path incluindo extensions schema';

-- ================================================
-- 7. FINAL VERIFICATION
-- ================================================
COMMENT ON SCHEMA extensions IS 
'Schema dedicado para extensões PostgreSQL - move extensões do schema public para melhorar segurança';

