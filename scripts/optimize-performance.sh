#!/bin/bash

# Script para otimizações de performance do DuduFisio AI
# Executa as otimizações identificadas na Fase 4

echo "🚀 Iniciando otimizações de performance..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instalando..."
    npm install -g supabase
fi

# Verificar se estamos conectados ao projeto
if ! supabase status &> /dev/null; then
    echo "⚠️  Supabase não está rodando. Iniciando..."
    supabase start
fi

echo "📊 1. Analisando índices não utilizados..."

# Executar análise de índices não utilizados
supabase db reset --debug 2>&1 | grep -E "(ERROR|WARNING|NOTICE)" || true

echo "🔧 2. Aplicando migração de otimizações..."

# Aplicar migração de otimizações
supabase db push

echo "📈 3. Executando análise de performance..."

# Executar consultas de análise
supabase db query --file scripts/analyze-performance.sql

echo "✅ Otimizações de performance concluídas!"

# Mostrar estatísticas finais
echo "📊 Estatísticas finais:"
supabase db query "SELECT * FROM index_usage_stats LIMIT 10;"
supabase db query "SELECT * FROM rls_policy_stats;"
