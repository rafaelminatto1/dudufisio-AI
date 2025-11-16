#!/bin/bash

# =====================================================
# Script de Configuração: Integrações Vercel + Supabase
# =====================================================
# Este script configura automaticamente:
# 1. Variáveis de ambiente Supabase na Vercel
# 2. Integração Supabase
# 3. Analytics e Speed Insights
# =====================================================

set -e  # Exit on error

echo "🚀 Iniciando configuração de integrações Vercel..."
echo ""

# =====================================================
# 1. CONFIGURAR VARIÁVEIS DE AMBIENTE
# =====================================================
echo "📋 Passo 1: Configurando variáveis de ambiente Supabase na Vercel..."
echo ""

# Supabase Project Details
SUPABASE_PROJECT_ID="urfxniitfbbvsaskicfo"
SUPABASE_URL="https://urfxniitfbbvsaskicfo.supabase.co"

# IMPORTANTE: As chaves já foram fornecidas pelo usuário
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg"

# Adicionar variáveis no Vercel (Production, Preview e Development)
echo "   Adicionando VITE_SUPABASE_URL..."
vercel env add VITE_SUPABASE_URL production preview development <<EOF
${SUPABASE_URL}
EOF

echo "   Adicionando VITE_SUPABASE_ANON_KEY..."
vercel env add VITE_SUPABASE_ANON_KEY production preview development <<EOF
${SUPABASE_ANON_KEY}
EOF

echo "   Adicionando SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development <<EOF
${SUPABASE_SERVICE_ROLE_KEY}
EOF

echo "   Adicionando SUPABASE_PROJECT_ID..."
vercel env add SUPABASE_PROJECT_ID production preview development <<EOF
${SUPABASE_PROJECT_ID}
EOF

echo "✅ Variáveis de ambiente configuradas!"
echo ""

# =====================================================
# 2. INSTALAR INTEGRAÇÃO SUPABASE
# =====================================================
echo "📦 Passo 2: Instalando integração Supabase..."
echo ""

# Nota: A instalação via CLI requer interação manual
echo "⚠️  A instalação da integração Supabase requer aprovação manual."
echo "   Execute manualmente: vercel install supabase"
echo "   Ou acesse: https://vercel.com/integrations/supabase"
echo ""

# =====================================================
# 3. INSTALAR ANALYTICS E SPEED INSIGHTS
# =====================================================
echo "📊 Passo 3: Instalando Vercel Analytics e Speed Insights..."
echo ""

npm install @vercel/analytics @vercel/speed-insights

echo "✅ Analytics instalados!"
echo ""

# =====================================================
# 4. CRIAR ARQUIVO .env.local
# =====================================================
echo "📝 Passo 4: Criando arquivo .env.local..."
echo ""

cat > .env.local <<EOF
# Supabase Configuration
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
SUPABASE_PROJECT_ID=${SUPABASE_PROJECT_ID}

# Gemini AI (se necessário)
# VITE_GEMINI_API_KEY=your_key_here
EOF

echo "✅ Arquivo .env.local criado!"
echo ""

# =====================================================
# 5. ATUALIZAR .gitignore
# =====================================================
echo "🔒 Passo 5: Atualizando .gitignore..."
echo ""

# Adicionar .env.local ao gitignore se não existir
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
    echo "✅ .env.local adicionado ao .gitignore"
else
    echo "✅ .env.local já está no .gitignore"
fi

echo ""

# =====================================================
# RESUMO FINAL
# =====================================================
echo "=========================================="
echo "✅ CONFIGURAÇÃO CONCLUÍDA!"
echo "=========================================="
echo ""
echo "📋 O que foi configurado:"
echo "   ✅ Variáveis de ambiente Supabase na Vercel"
echo "   ✅ Analytics e Speed Insights instalados"
echo "   ✅ Arquivo .env.local criado"
echo "   ✅ .gitignore atualizado"
echo ""
echo "📝 PRÓXIMOS PASSOS MANUAIS:"
echo ""
echo "1. Integração Supabase (escolha uma opção):"
echo "   a) Via CLI:"
echo "      vercel install supabase"
echo ""
echo "   b) Via Dashboard:"
echo "      https://vercel.com/integrations/supabase"
echo ""
echo "2. Adicionar Analytics no App.tsx:"
echo "   - Abra: App.tsx ou index.tsx"
echo "   - Adicione os imports e componentes (ver instruções abaixo)"
echo ""
echo "3. Fazer deploy:"
echo "   vercel --prod"
echo ""
echo "=========================================="
echo "📚 DOCUMENTAÇÃO COMPLETA"
echo "=========================================="
echo "Arquivo criado: scripts/add-analytics-to-app.md"
echo ""

