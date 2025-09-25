-- ============================================================================
-- SIMULAÇÃO DAS OTIMIZAÇÕES DE PERFORMANCE
-- ============================================================================
-- Este script simula as otimizações sem aplicá-las, apenas gerando relatórios

-- 1. ANÁLISE DE ÍNDICES NÃO UTILIZADOS
-- ============================================================================

SELECT 
    'ÍNDICES NÃO UTILIZADOS' as categoria,
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as tamanho,
    idx_scan as scans_realizados
FROM pg_stat_user_indexes
WHERE idx_scan = 0 
    AND schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM pg_index i 
        WHERE i.indexrelid = pg_stat_user_indexes.indexrelid 
        AND (i.indisunique OR i.indisprimary)
    )
ORDER BY pg_relation_size(indexrelid) DESC;

-- 2. ANÁLISE DE POLÍTICAS RLS MÚLTIPAS
-- ============================================================================

SELECT 
    'POLÍTICAS RLS MÚLTIPAS' as categoria,
    schemaname,
    tablename,
    COUNT(*) as num_policies,
    STRING_AGG(policyname, ', ') as policies,
    CASE 
        WHEN COUNT(*) > 5 THEN 'CRÍTICO - Muitas políticas'
        WHEN COUNT(*) > 3 THEN 'ALTO - Pode ser otimizado'
        ELSE 'OK'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
ORDER BY num_policies DESC;

-- 3. ANÁLISE DE CHAVES ESTRANGEIRAS SEM ÍNDICES
-- ============================================================================

SELECT 
    'FKS SEM ÍNDICES' as categoria,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    'Recomendado criar índice' as acao
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
ORDER BY tc.table_name, kcu.column_name;

-- 4. ANÁLISE DE TAMANHO DAS TABELAS
-- ============================================================================

SELECT 
    'TAMANHO DAS TABELAS' as categoria,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as tamanho_tabela,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as tamanho_indices,
    CASE 
        WHEN pg_total_relation_size(schemaname||'.'||tablename) > 100*1024*1024 THEN 'GRANDE - >100MB'
        WHEN pg_total_relation_size(schemaname||'.'||tablename) > 10*1024*1024 THEN 'MÉDIO - >10MB'
        ELSE 'PEQUENO - <10MB'
    END as classificacao
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- 5. ANÁLISE DE CONSULTAS MAIS LENTAS
-- ============================================================================

SELECT 
    'CONSULTAS MAIS LENTAS' as categoria,
    LEFT(query, 100) as query_preview,
    calls,
    ROUND(total_time::numeric, 2) as total_time_ms,
    ROUND(mean_time::numeric, 2) as mean_time_ms,
    rows,
    CASE 
        WHEN mean_time > 1000 THEN 'CRÍTICO - >1s'
        WHEN mean_time > 100 THEN 'ALTO - >100ms'
        ELSE 'OK'
    END as status
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
    AND query NOT LIKE '%information_schema%'
ORDER BY total_time DESC
LIMIT 10;

-- 6. RESUMO DAS OTIMIZAÇÕES RECOMENDADAS
-- ============================================================================

WITH optimizations AS (
    SELECT 
        'Índices não utilizados' as tipo,
        COUNT(*) as quantidade,
        pg_size_pretty(SUM(pg_relation_size(indexrelid))) as espaco_livre
    FROM pg_stat_user_indexes
    WHERE idx_scan = 0 
        AND schemaname = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_index i 
            WHERE i.indexrelid = pg_stat_user_indexes.indexrelid 
            AND (i.indisunique OR i.indisprimary)
        )
    
    UNION ALL
    
    SELECT 
        'Tabelas com muitas políticas RLS' as tipo,
        COUNT(*) as quantidade,
        'N/A' as espaco_livre
    FROM (
        SELECT tablename
        FROM pg_policies
        WHERE schemaname = 'public'
        GROUP BY tablename
        HAVING COUNT(*) > 3
    ) t
    
    UNION ALL
    
    SELECT 
        'FKs sem índices' as tipo,
        COUNT(*) as quantidade,
        'N/A' as espaco_livre
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
        AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
        AND tc.table_schema = 'public'
        AND NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = tc.table_name 
            AND indexdef LIKE '%' || kcu.column_name || '%'
        )
)
SELECT 
    'RESUMO DAS OTIMIZAÇÕES' as categoria,
    tipo,
    quantidade,
    espaco_livre,
    CASE 
        WHEN quantidade = 0 THEN '✅ Nenhuma otimização necessária'
        WHEN quantidade < 5 THEN '⚠️ Poucas otimizações recomendadas'
        ELSE '🚨 Muitas otimizações necessárias'
    END as status
FROM optimizations
ORDER BY quantidade DESC;
