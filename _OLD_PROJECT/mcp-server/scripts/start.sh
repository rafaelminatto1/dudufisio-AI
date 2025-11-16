#!/bin/bash

# Script para iniciar o servidor MCP

echo "🚀 Iniciando DuduFisio-AI MCP Server..."
echo ""

# Verificar se está compilado
if [ ! -d "dist" ]; then
    echo "⚠️  Código não compilado. Compilando agora..."
    npm run build
    echo ""
fi

# Iniciar servidor
echo "🎯 Servidor MCP rodando..."
echo "📊 Sentry monitoramento ativo"
echo "🔗 Dashboard: https://sentry.io/orgredirect/organizations/:orgslug/insights/ai/mcp/"
echo ""
echo "Pressione Ctrl+C para parar"
echo "----------------------------------------"
echo ""

node dist/server.js

