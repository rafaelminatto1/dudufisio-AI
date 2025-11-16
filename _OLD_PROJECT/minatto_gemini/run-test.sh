#!/bin/bash

echo "🚀 Executando teste automatizado com Playwright..."
echo ""

# Verifica se o servidor está rodando
if ! curl -s http://localhost:5173 > /dev/null; then
    echo "⚠️  Servidor não está rodando em http://localhost:5173"
    echo "   Por favor, inicie o servidor com: npm run dev"
    exit 1
fi

# Compila e executa o teste
npx tsx minatto_gemini/automated-test.ts
