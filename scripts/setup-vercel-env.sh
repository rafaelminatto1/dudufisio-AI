#!/bin/bash

# Script para configurar variáveis de ambiente no Vercel
# Execute este script após fazer login no Vercel CLI: vercel login

echo "🔧 Configurando variáveis de ambiente no Vercel..."

# Sentry
echo "📊 Configurando Sentry..."
vercel env add VITE_SENTRY_DSN production
vercel env add VITE_SENTRY_ORG production  
vercel env add VITE_SENTRY_PROJECT production
vercel env add SENTRY_AUTH_TOKEN production

# Clerk
echo "🔐 Configurando Clerk..."
vercel env add VITE_CLERK_PUBLISHABLE_KEY production
vercel env add CLERK_SECRET_KEY production

# Groq
echo "🤖 Configurando Groq..."
vercel env add VITE_GROQ_API_KEY production

# Checkly
echo "📈 Configurando Checkly..."
vercel env add CHECKLY_API_KEY production
vercel env add CHECKLY_ACCOUNT_ID production

# Variáveis existentes (caso ainda não estejam configuradas)
echo "📦 Configurando variáveis existentes..."
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production
vercel env add VITE_GOOGLE_AI_API_KEY production

echo "✅ Configuração concluída!"
echo "💡 Lembre-se de também configurar as mesmas variáveis para os ambientes 'preview' e 'development' se necessário."
echo "🔗 Acesse https://vercel.com/dashboard para verificar as configurações."