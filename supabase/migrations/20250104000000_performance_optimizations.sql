-- ============================================================================
-- OTIMIZAÇÕES DE PERFORMANCE - FASE 4
-- ============================================================================
-- Este script implementa as otimizações de performance identificadas:
-- 1. Remoção de índices não utilizados
-- 2. Otimização de políticas RLS múltiplas
-- 3. Adição de índices para chaves estrangeiras
-- ============================================================================

-- ============================================================================
-- 1. IDENTIFICAÇÃO E REMOÇÃO DE ÍNDICES NÃO UTILIZADOS
-- ============================================================================

-- Função para identificar índices não utilizados
CREATE OR REPLACE FUNCTION find_unused_indexes()
RETURNS TABLE(
    schemaname TEXT,
    tablename TEXT,
    indexname TEXT,
    indexdef TEXT,
    size_pretty TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.schemaname,
        s.tablename,
        s.indexname,
        s.indexdef,
        pg_size_pretty(pg_relation_size(s.indexrelid)) as size_pretty
    FROM pg_stat_user_indexes s
    JOIN pg_index i ON s.indexrelid = i.indexrelid
    WHERE s.idx_scan = 0 
        AND NOT i.indisunique
        AND NOT i.indisprimary
        AND s.schemaname = 'public'
    ORDER BY pg_relation_size(s.indexrelid) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. OTIMIZAÇÃO DE POLÍTICAS RLS MÚLTIPAS
-- ============================================================================

-- Função para consolidar políticas RLS
CREATE OR REPLACE FUNCTION consolidate_rls_policies()
RETURNS VOID AS $$
DECLARE
    policy_record RECORD;
    table_name TEXT;
    consolidated_policy TEXT;
BEGIN
    -- Para cada tabela com múltiplas políticas, consolidar em uma única
    FOR table_name IN 
        SELECT DISTINCT tablename 
        FROM pg_policies 
        WHERE schemaname = 'public'
        GROUP BY tablename 
        HAVING COUNT(*) > 3
    LOOP
        -- Remover políticas existentes
        EXECUTE format('DROP POLICY IF EXISTS "Users can view %I" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can insert %I" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can update %I" ON %I', table_name, table_name);
        EXECUTE format('DROP POLICY IF EXISTS "Users can delete %I" ON %I', table_name, table_name);
        
        -- Criar política consolidada
        consolidated_policy := format('
            CREATE POLICY "Consolidated access policy for %I" ON %I
            FOR ALL USING (
                EXISTS (
                    SELECT 1 FROM users u
                    WHERE u.id = auth.uid()
                )
            )', table_name, table_name);
        
        EXECUTE consolidated_policy;
        
        RAISE NOTICE 'Consolidated policies for table: %', table_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. ADIÇÃO DE ÍNDICES PARA CHAVES ESTRANGEIRAS
-- ============================================================================

-- Função para adicionar índices para FKs
CREATE OR REPLACE FUNCTION add_fk_indexes()
RETURNS VOID AS $$
DECLARE
    fk_record RECORD;
    index_name TEXT;
BEGIN
    -- Buscar todas as chaves estrangeiras sem índices
    FOR fk_record IN
        SELECT 
            tc.table_name,
            kcu.column_name,
            ccu.table_name AS foreign_table_name,
            ccu.column_name AS foreign_column_name
        FROM information_schema.table_constraints AS tc
        JOIN information_schema.key_column_usage AS kcu
            ON tc.constraint_name = kcu.constraint_name
            AND tc.table_schema = kcu.table_schema
        JOIN information_schema.constraint_column_usage AS ccu
            ON ccu.constraint_name = tc.constraint_name
            AND ccu.table_schema = tc.table_schema
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND tc.table_schema = 'public'
            AND NOT EXISTS (
                SELECT 1 FROM pg_indexes 
                WHERE tablename = tc.table_name 
                AND indexdef LIKE '%' || kcu.column_name || '%'
            )
    LOOP
        -- Criar nome do índice
        index_name := 'idx_' || fk_record.table_name || '_' || fk_record.column_name;
        
        -- Criar índice se não existir
        EXECUTE format('
            CREATE INDEX IF NOT EXISTS %I ON %I (%I)',
            index_name,
            fk_record.table_name,
            fk_record.column_name
        );
        
        RAISE NOTICE 'Created index: % for FK: %.%', 
            index_name, fk_record.table_name, fk_record.column_name;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. OTIMIZAÇÕES ESPECÍFICAS PARA TABELAS PRINCIPAIS
-- ============================================================================

-- Otimizar tabela clinical_documents
CREATE INDEX IF NOT EXISTS idx_clinical_documents_patient_created 
ON clinical_documents(patient_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_type_signed 
ON clinical_documents(document_type, is_signed);

CREATE INDEX IF NOT EXISTS idx_clinical_documents_template 
ON clinical_documents(template_id) WHERE template_id IS NOT NULL;

-- Otimizar tabela appointments
CREATE INDEX IF NOT EXISTS idx_appointments_therapist_date 
ON appointments(therapist_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_date 
ON appointments(patient_id, scheduled_at);

CREATE INDEX IF NOT EXISTS idx_appointments_status 
ON appointments(status) WHERE status != 'completed';

-- Otimizar tabela body_points
CREATE INDEX IF NOT EXISTS idx_body_points_patient_session 
ON body_points(patient_id, session_id) WHERE session_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_body_points_region_pain 
ON body_points(body_region, pain_level);

-- Otimizar tabela patients
CREATE INDEX IF NOT EXISTS idx_patients_created_by 
ON patients(created_by);

CREATE INDEX IF NOT EXISTS idx_patients_user_id 
ON patients(user_id) WHERE user_id IS NOT NULL;

-- ============================================================================
-- 5. ANÁLISE DE PERFORMANCE
-- ============================================================================

-- Função para analisar performance das consultas
CREATE OR REPLACE FUNCTION analyze_query_performance()
RETURNS TABLE(
    query TEXT,
    calls BIGINT,
    total_time DOUBLE PRECISION,
    mean_time DOUBLE PRECISION,
    rows BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        query,
        calls,
        total_time,
        mean_time,
        rows
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%'
    ORDER BY total_time DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. EXECUÇÃO DAS OTIMIZAÇÕES
-- ============================================================================

-- Executar otimizações
DO $$
BEGIN
    RAISE NOTICE 'Starting performance optimizations...';
    
    -- Adicionar índices para FKs
    PERFORM add_fk_indexes();
    
    -- Consolidar políticas RLS
    PERFORM consolidate_rls_policies();
    
    RAISE NOTICE 'Performance optimizations completed!';
END;
$$;

-- ============================================================================
-- 7. RELATÓRIO DE OTIMIZAÇÕES
-- ============================================================================

-- Criar view para monitorar índices
CREATE OR REPLACE VIEW index_usage_stats AS
SELECT 
    schemaname,
    relname as tablename,
    indexrelname as indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch,
    pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- Criar view para monitorar políticas RLS
CREATE OR REPLACE VIEW rls_policy_stats AS
SELECT 
    schemaname,
    tablename,
    COUNT(*) as policy_count,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY policy_count DESC;

-- ============================================================================
-- FIM DA MIGRAÇÃO
-- ============================================================================
