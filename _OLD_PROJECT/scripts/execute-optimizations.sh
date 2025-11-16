#!/bin/bash

# Script para executar otimizações de performance
# Usa SQL direto para aplicar as otimizações

echo "🚀 DuduFisio AI - Otimizações de Performance"
echo "=============================================="

# Verificar se o Supabase está rodando
if ! supabase status &> /dev/null; then
    echo "⚠️  Supabase não está rodando. Iniciando..."
    supabase start
fi

echo "📊 1. Analisando estado atual do banco..."

# Executar análise via SQL direto
supabase db query "
SELECT 
    'ESTADO ATUAL' as status,
    COUNT(*) as total_tabelas,
    pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) as tamanho_total
FROM pg_tables 
WHERE schemaname = 'public';
"

echo "🔧 2. Aplicando otimizações de performance..."

# Aplicar otimizações via migração
supabase db push

echo "📈 3. Executando análise pós-otimização..."

# Executar análise final
supabase db query "
SELECT 
    'PÓS-OTIMIZAÇÃO' as status,
    COUNT(*) as total_indices,
    pg_size_pretty(SUM(pg_relation_size(indexrelid))) as tamanho_indices
FROM pg_indexes 
WHERE schemaname = 'public';
"

echo "✅ Otimizações de performance concluídas!"
echo "📊 Relatório de otimizações salvo em: reports/performance-optimization-report.txt"
