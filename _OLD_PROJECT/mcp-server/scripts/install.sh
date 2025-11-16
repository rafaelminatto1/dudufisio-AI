#!/bin/bash

# Script de instalação do DuduFisio MCP Server

echo "🏥 DuduFisio-AI MCP Server - Instalação"
echo "========================================"
echo ""

# Verificar Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Erro ao instalar dependências"
    exit 1
fi

echo ""
echo "🔨 Compilando TypeScript..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Erro ao compilar TypeScript"
    exit 1
fi

echo ""
echo "✅ Instalação concluída com sucesso!"
echo ""
echo "📚 Próximos passos:"
echo "  1. Configure suas variáveis de ambiente (opcional)"
echo "  2. Execute: npm start"
echo "  3. Acesse o dashboard Sentry: https://sentry.io"
echo ""

