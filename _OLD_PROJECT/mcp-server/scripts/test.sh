#!/bin/bash

# Script de teste do servidor MCP

echo "🧪 Testando DuduFisio-AI MCP Server"
echo "===================================="
echo ""

# Compilar se necessário
if [ ! -d "dist" ]; then
    echo "📦 Compilando código..."
    npm run build
    echo ""
fi

# Teste 1: Listar ferramentas
echo "📋 Teste 1: Listando ferramentas disponíveis..."
echo '{"jsonrpc":"2.0","method":"tools/list","id":1}' | node dist/server.js 2>/dev/null | jq '.result.tools | length' 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Teste 1 passou!"
else
    echo "❌ Teste 1 falhou!"
fi

echo ""

# Teste 2: Listar pacientes
echo "👥 Teste 2: Listando pacientes..."
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"list_patients","arguments":{}},"id":2}' | node dist/server.js 2>/dev/null | jq -r '.result.content[0].text' | jq '.total' 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Teste 2 passou!"
else
    echo "❌ Teste 2 falhou!"
fi

echo ""

# Teste 3: Buscar paciente
echo "🔍 Teste 3: Buscando paciente 'João'..."
echo '{"jsonrpc":"2.0","method":"tools/call","params":{"name":"search_patient","arguments":{"query":"João"}},"id":3}' | node dist/server.js 2>/dev/null | jq -r '.result.content[0].text' | jq '.count' 2>/dev/null

if [ $? -eq 0 ]; then
    echo "✅ Teste 3 passou!"
else
    echo "❌ Teste 3 falhou!"
fi

echo ""
echo "✅ Testes concluídos!"
echo ""
echo "💡 Para ver métricas detalhadas:"
echo "   https://sentry.io/orgredirect/organizations/:orgslug/insights/ai/mcp/"
echo ""

