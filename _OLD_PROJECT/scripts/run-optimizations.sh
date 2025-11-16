#!/bin/bash

# Script para executar otimizações de performance
# Usa psql diretamente para aplicar as otimizações

echo "🚀 Iniciando otimizações de performance do DuduFisio AI..."

# Verificar se psql está disponível
if ! command -v psql &> /dev/null; then
    echo "❌ psql não encontrado. Instalando postgresql-client..."
    sudo apt-get update && sudo apt-get install -y postgresql-client
fi

# Configurações do banco (usar variáveis de ambiente se disponíveis)
DB_HOST=${SUPABASE_DB_HOST:-"localhost"}
DB_PORT=${SUPABASE_DB_PORT:-"54322"}
DB_NAME=${SUPABASE_DB_NAME:-"postgres"}
DB_USER=${SUPABASE_DB_USER:-"postgres"}

echo "📊 Conectando ao banco: $DB_HOST:$DB_PORT/$DB_NAME"

# Executar otimizações
echo "🔧 Aplicando otimizações de performance..."

psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/apply-performance-optimizations.sql

if [ $? -eq 0 ]; then
    echo "✅ Otimizações aplicadas com sucesso!"
    
    # Executar análise de performance
    echo "📈 Executando análise de performance..."
    psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f scripts/analyze-performance.sql
    
    echo "🎉 Otimizações de performance concluídas!"
else
    echo "❌ Erro ao aplicar otimizações"
    exit 1
fi
