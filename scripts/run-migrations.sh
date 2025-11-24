#!/bin/bash

# Script para executar migrations do Supabase
# Uso: ./scripts/run-migrations.sh

echo "🚀 Executando migrations do Supabase..."

# Verifica se supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase"
    exit 1
fi

# Verifica se está logado
if ! supabase projects list &> /dev/null; then
    echo "❌ Não está logado no Supabase. Execute: supabase login"
    exit 1
fi

# Executa migrations
supabase db push

echo "✅ Migrations executadas com sucesso!"

