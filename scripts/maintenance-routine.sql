-- ============================================================================
-- ROTINA DE MANUTENÇÃO E OTIMIZAÇÃO CONTÍNUA
-- DuduFisio AI - Sistema de Prontuário Eletrônico Médico
-- ============================================================================

-- ============================================================================
-- 1. ANÁLISE SEMANAL DE PERFORMANCE
-- ============================================================================

-- Função para análise semanal automática
CREATE OR REPLACE FUNCTION weekly_performance_analysis()
RETURNS TABLE(
    analysis_date TIMESTAMP,
    total_indexes BIGINT,
    unused_indexes BIGINT,
    total_size TEXT,
    slow_queries BIGINT,
    rls_policies BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        NOW() as analysis_date,
        (SELECT COUNT(*) FROM pg_indexes WHERE schemaname = 'public') as total_indexes,
        (SELECT COUNT(*) FROM pg_stat_user_indexes WHERE idx_scan = 0 AND schemaname = 'public') as unused_indexes,
        (SELECT pg_size_pretty(SUM(pg_relation_size(indexrelid))) FROM pg_stat_user_indexes WHERE schemaname = 'public') as total_size,
        (SELECT COUNT(*) FROM pg_stat_statements WHERE query NOT LIKE '%pg_stat%') as slow_queries,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as rls_policies;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. LIMPEZA AUTOMÁTICA DE ÍNDICES NÃO UTILIZADOS
-- ============================================================================

-- Função para remover índices não utilizados automaticamente
CREATE OR REPLACE FUNCTION cleanup_unused_indexes()
RETURNS TABLE(
    removed_index TEXT,
    size_freed TEXT
) AS $$
DECLARE
    idx_record RECORD;
    removed_count INTEGER := 0;
BEGIN
    RAISE NOTICE 'Iniciando limpeza automática de índices não utilizados...';
    
    FOR idx_record IN
        SELECT 
            s.schemaname,
            s.relname as tablename,
            s.indexrelname as indexname,
            pg_relation_size(s.indexrelid) as size_bytes
        FROM pg_stat_user_indexes s
        JOIN pg_index i ON s.indexrelid = i.indexrelid
        WHERE s.idx_scan = 0 
            AND NOT i.indisunique
            AND NOT i.indisprimary
            AND s.schemaname = 'public'
            AND pg_relation_size(s.indexrelid) > 1024 -- Apenas índices > 1KB
            AND s.indexrelname NOT LIKE '%_pkey' -- Não remover chaves primárias
        ORDER BY pg_relation_size(s.indexrelid) DESC
        LIMIT 10 -- Limitar a 10 índices por execução
    LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I.%I', idx_record.schemaname, idx_record.indexname);
        removed_count := removed_count + 1;
        
        RETURN QUERY SELECT 
            (idx_record.schemaname || '.' || idx_record.indexname)::TEXT as removed_index,
            pg_size_pretty(idx_record.size_bytes)::TEXT as size_freed;
    END LOOP;
    
    RAISE NOTICE 'Limpeza concluída. Índices removidos: %', removed_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 3. OTIMIZAÇÃO AUTOMÁTICA DE CONSULTAS
-- ============================================================================

-- Função para identificar consultas lentas e sugerir otimizações
CREATE OR REPLACE FUNCTION analyze_slow_queries()
RETURNS TABLE(
    query_preview TEXT,
    calls BIGINT,
    total_time_ms NUMERIC,
    mean_time_ms NUMERIC,
    rows BIGINT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        LEFT(query, 100) as query_preview,
        calls,
        ROUND(total_time::numeric, 2) as total_time_ms,
        ROUND(mean_time::numeric, 2) as mean_time_ms,
        rows,
        CASE 
            WHEN mean_time > 1000 THEN 'CRÍTICO - Considere adicionar índices'
            WHEN mean_time > 500 THEN 'ALTO - Otimize consulta ou adicione índices'
            WHEN mean_time > 100 THEN 'MÉDIO - Monitore performance'
            ELSE 'OK'
        END as recommendation
    FROM pg_stat_statements
    WHERE query NOT LIKE '%pg_stat%'
        AND query NOT LIKE '%information_schema%'
        AND mean_time > 50 -- Apenas consultas > 50ms
    ORDER BY total_time DESC
    LIMIT 20;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 4. MONITORAMENTO DE CRESCIMENTO DO BANCO
-- ============================================================================

-- Função para monitorar crescimento das tabelas
CREATE OR REPLACE FUNCTION monitor_database_growth()
RETURNS TABLE(
    table_name TEXT,
    current_size TEXT,
    growth_trend TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname||'.'||tablename as table_name,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as current_size,
        CASE 
            WHEN pg_total_relation_size(schemaname||'.'||tablename) > 100*1024*1024 THEN 'RÁPIDO'
            WHEN pg_total_relation_size(schemaname||'.'||tablename) > 10*1024*1024 THEN 'MÉDIO'
            ELSE 'LENTO'
        END as growth_trend,
        CASE 
            WHEN pg_total_relation_size(schemaname||'.'||tablename) > 100*1024*1024 THEN 'Considere particionamento'
            WHEN pg_total_relation_size(schemaname||'.'||tablename) > 10*1024*1024 THEN 'Monitore crescimento'
            ELSE 'OK'
        END as recommendation
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 5. RELATÓRIO DE SAÚDE DO SISTEMA
-- ============================================================================

-- Função para gerar relatório completo de saúde do sistema
CREATE OR REPLACE FUNCTION system_health_report()
RETURNS TABLE(
    metric_name TEXT,
    current_value TEXT,
    status TEXT,
    recommendation TEXT
) AS $$
BEGIN
    RETURN QUERY
    WITH metrics AS (
        SELECT 
            'Total de Índices' as metric_name,
            COUNT(*)::TEXT as current_value,
            CASE WHEN COUNT(*) < 200 THEN 'OK' ELSE 'ALTO' END as status,
            CASE WHEN COUNT(*) > 200 THEN 'Considere remover índices não utilizados' ELSE 'OK' END as recommendation
        FROM pg_indexes WHERE schemaname = 'public'
        
        UNION ALL
        
        SELECT 
            'Índices Não Utilizados' as metric_name,
            COUNT(*)::TEXT as current_value,
            CASE WHEN COUNT(*) < 10 THEN 'OK' ELSE 'ALTO' END as status,
            CASE WHEN COUNT(*) > 10 THEN 'Execute cleanup_unused_indexes()' ELSE 'OK' END as recommendation
        FROM pg_stat_user_indexes WHERE idx_scan = 0 AND schemaname = 'public'
        
        UNION ALL
        
        SELECT 
            'Tamanho Total do Banco' as metric_name,
            pg_size_pretty(pg_database_size(current_database())) as current_value,
            CASE WHEN pg_database_size(current_database()) < 100*1024*1024 THEN 'OK' ELSE 'ALTO' END as status,
            CASE WHEN pg_database_size(current_database()) > 100*1024*1024 THEN 'Monitore crescimento' ELSE 'OK' END as recommendation
        
        UNION ALL
        
        SELECT 
            'Consultas Lentas' as metric_name,
            COUNT(*)::TEXT as current_value,
            CASE WHEN COUNT(*) < 5 THEN 'OK' ELSE 'ALTO' END as status,
            CASE WHEN COUNT(*) > 5 THEN 'Execute analyze_slow_queries()' ELSE 'OK' END as recommendation
        FROM pg_stat_statements WHERE mean_time > 100 AND query NOT LIKE '%pg_stat%'
        
        UNION ALL
        
        SELECT 
            'Políticas RLS' as metric_name,
            COUNT(*)::TEXT as current_value,
            CASE WHEN COUNT(*) < 50 THEN 'OK' ELSE 'ALTO' END as status,
            CASE WHEN COUNT(*) > 50 THEN 'Considere consolidar políticas' ELSE 'OK' END as recommendation
        FROM pg_policies WHERE schemaname = 'public'
    )
    SELECT * FROM metrics;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 6. EXECUÇÃO DA ROTINA DE MANUTENÇÃO
-- ============================================================================

-- Executar análise semanal
DO $$
DECLARE
    analysis_result RECORD;
BEGIN
    RAISE NOTICE '=== ROTINA DE MANUTENÇÃO SEMANAL ===';
    RAISE NOTICE 'Data: %', NOW();
    
    -- Executar análise de performance
    FOR analysis_result IN SELECT * FROM weekly_performance_analysis() LOOP
        RAISE NOTICE 'Índices totais: %', analysis_result.total_indexes;
        RAISE NOTICE 'Índices não utilizados: %', analysis_result.unused_indexes;
        RAISE NOTICE 'Tamanho total: %', analysis_result.total_size;
        RAISE NOTICE 'Consultas lentas: %', analysis_result.slow_queries;
        RAISE NOTICE 'Políticas RLS: %', analysis_result.rls_policies;
    END LOOP;
    
    RAISE NOTICE '=== ROTINA CONCLUÍDA ===';
END;
$$;

-- ============================================================================
-- FIM DA ROTINA DE MANUTENÇÃO
-- ============================================================================
