-- Migration: Move vector extension to extensions schema
-- Data: 16/11/2025
-- Descrição: Move a extensão vector do schema public para extensions
-- Tipo: Correção de Segurança (AVISO)

-- ============================================================================
-- NOTA IMPORTANTE
-- ============================================================================
-- Esta migration move a extensão pgvector do schema public para extensions.
-- ATENÇÃO: Esta operação pode falhar se a extensão já estiver no schema correto
-- ou se houver dependências que precisam ser atualizadas.

-- ============================================================================
-- CRIAR SCHEMA EXTENSIONS SE NÃO EXISTIR
-- ============================================================================
CREATE SCHEMA IF NOT EXISTS extensions;

-- Grant permissões no schema extensions
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA extensions TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA extensions TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA extensions
GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA extensions
GRANT ALL ON FUNCTIONS TO postgres, anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA extensions
GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- MOVER EXTENSÃO VECTOR
-- ============================================================================
-- Verificar se a extensão existe no public antes de mover
DO $$
BEGIN
    -- Tentar mover a extensão
    IF EXISTS (
        SELECT 1 FROM pg_extension e
        JOIN pg_namespace n ON e.extnamespace = n.oid
        WHERE e.extname = 'vector' AND n.nspname = 'public'
    ) THEN
        -- Mover extensão vector para schema extensions
        ALTER EXTENSION vector SET SCHEMA extensions;
        RAISE NOTICE 'Extensão vector movida para schema extensions';
    ELSE
        RAISE NOTICE 'Extensão vector já está no schema correto ou não existe em public';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE WARNING 'Erro ao mover extensão vector: %', SQLERRM;
        RAISE NOTICE 'A extensão pode já estar no schema extensions ou há dependências';
END;
$$;

-- ============================================================================
-- ATUALIZAR SEARCH_PATH DAS FUNÇÕES QUE USAM VECTOR
-- ============================================================================
-- Atualizar função hybrid_search_knowledge para incluir extensions no search_path
-- (já foi atualizada na migration anterior, mas garantir que está correta)

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================
-- Query para verificar o schema da extensão vector
-- SELECT 
--     e.extname AS extension_name,
--     n.nspname AS schema_name,
--     e.extversion AS version
-- FROM pg_extension e
-- JOIN pg_namespace n ON e.extnamespace = n.oid
-- WHERE e.extname = 'vector';

-- ============================================================================
-- COMENTÁRIO
-- ============================================================================
COMMENT ON SCHEMA extensions IS 
'Schema para extensões PostgreSQL (pgvector, pg_net, etc)';

