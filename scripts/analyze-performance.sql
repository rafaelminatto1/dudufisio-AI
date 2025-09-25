-- Script de análise de performance
-- Identifica gargalos e oportunidades de otimização

-- 1. Análise de índices não utilizados
SELECT 
    'Índices não utilizados' as categoria,
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) as tamanho,
    idx_scan as scans
FROM pg_stat_user_indexes
WHERE idx_scan = 0 
    AND schemaname = 'public'
    AND NOT EXISTS (
        SELECT 1 FROM pg_index i 
        WHERE i.indexrelid = pg_stat_user_indexes.indexrelid 
        AND (i.indisunique OR i.indisprimary)
    )
ORDER BY pg_relation_size(indexrelid) DESC;

-- 2. Análise de consultas mais lentas
SELECT 
    'Consultas mais lentas' as categoria,
    query,
    calls,
    total_time,
    mean_time,
    rows
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat%'
ORDER BY total_time DESC
LIMIT 5;

-- 3. Análise de tabelas com mais políticas RLS
SELECT 
    'Tabelas com múltiplas políticas RLS' as categoria,
    schemaname,
    tablename,
    COUNT(*) as num_policies,
    STRING_AGG(policyname, ', ') as policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY schemaname, tablename
HAVING COUNT(*) > 2
ORDER BY num_policies DESC;

-- 4. Análise de chaves estrangeiras sem índices
SELECT 
    'FKs sem índices' as categoria,
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
    );

-- 5. Análise de tamanho das tabelas
SELECT 
    'Tamanho das tabelas' as categoria,
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as tamanho_total,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) as tamanho_tabela,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) as tamanho_indices
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
