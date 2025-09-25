#!/bin/bash

# Deploy script para DuduFisio-AI
# Sistema de Comunicação Omnichannel

echo "🚀 Deploying DuduFisio-AI with Communication System..."

# 1. Verificar dependências
echo "📦 Checking dependencies..."
npm ci

# 2. Executar testes do sistema de comunicação
echo "🧪 Testing communication system..."
node scripts/test-communication-system.js

# 3. Build do projeto
echo "🔨 Building project..."
npm run build

# 4. Deploy para Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

# 5. Sincronizar variáveis de produção
echo "🔄 Syncing production environment..."
vercel env pull .env.production --environment=production

echo "✅ Deploy completed!"
echo "📊 Dashboard: https://vercel.com/rafael-minattos-projects/dudufisio-ai"
echo "🌐 Live URL: https://dudufisio-ai.vercel.app"
echo "📖 Docs: docs/COMMUNICATION_SYSTEM.md"
