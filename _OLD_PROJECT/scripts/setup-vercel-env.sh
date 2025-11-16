#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# DuduFisio AI - Configuração de Produção

echo "🚀 Configurando variáveis de ambiente no Vercel..."

# Variáveis do Supabase
SUPABASE_URL="https://urfxniitfbbvsaskicfo.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzQ4NDcsImV4cCI6MjA1MDI1MDg0N30.placeholder"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDY3NDg0NywiZXhwIjoyMDUwMjUwODQ3fQ.placeholder"

# NextAuth
NEXTAUTH_SECRET="dudufisio-ai-secret-key-2025"
NEXTAUTH_URL="https://dudufisio-knh9ovp8i-rafael-minattos-projects.vercel.app"

# Playwright
PLAYWRIGHT_BASE_URL="https://dudufisio-knh9ovp8i-rafael-minattos-projects.vercel.app"

echo "📝 Configurando NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "📝 Configurando NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "📝 Configurando SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "📝 Configurando NEXTAUTH_SECRET..."
echo "$NEXTAUTH_SECRET" | vercel env add NEXTAUTH_SECRET production

echo "📝 Configurando NEXTAUTH_URL..."
echo "$NEXTAUTH_URL" | vercel env add NEXTAUTH_URL production

echo "📝 Configurando PLAYWRIGHT_BASE_URL..."
echo "$PLAYWRIGHT_BASE_URL" | vercel env add PLAYWRIGHT_BASE_URL production

echo "✅ Variáveis de ambiente configuradas com sucesso!"
echo "🔄 Fazendo redeploy para aplicar as variáveis..."

vercel --prod

echo "🎉 Deploy concluído com variáveis de ambiente!"