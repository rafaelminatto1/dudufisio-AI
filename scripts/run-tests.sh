#!/bin/bash

# Script para execução de testes do DuduFisio-AI
# Baseado no plano de testes do TestSprite MCP

echo "🧪 DuduFisio-AI - Execução de Testes"
echo "======================================"
echo ""

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Executar linting
echo "🔍 Executando linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Erros de linting encontrados. Corrija antes de continuar."
    exit 1
fi
echo "✅ Linting passou"
echo ""

# Executar testes unitários
echo "🧪 Executando testes unitários..."
npm run test -- --testPathPattern="tests/unit" --coverage --watchAll=false
if [ $? -ne 0 ]; then
    echo "❌ Testes unitários falharam"
    exit 1
fi
echo "✅ Testes unitários passaram"
echo ""

# Executar testes de integração
echo "🔗 Executando testes de integração..."
npm run test -- --testPathPattern="tests/integration" --coverage --watchAll=false
if [ $? -ne 0 ]; then
    echo "❌ Testes de integração falharam"
    exit 1
fi
echo "✅ Testes de integração passaram"
echo ""

# Executar testes contratuais
echo "📋 Executando testes contratuais..."
npm run test:contract
if [ $? -ne 0 ]; then
    echo "❌ Testes contratuais falharam"
    exit 1
fi
echo "✅ Testes contratuais passaram"
echo ""

# Gerar relatório de cobertura
echo "📊 Gerando relatório de cobertura..."
npm run test:coverage
echo ""

# Verificar cobertura mínima
echo "🎯 Verificando cobertura mínima (80%)..."
COVERAGE=$(npm run test:coverage -- --silent | grep -o "All files.*[0-9]*\.[0-9]*%" | grep -o "[0-9]*\.[0-9]*%" | head -1 | sed 's/%//')
if (( $(echo "$COVERAGE < 80" | bc -l) )); then
    echo "❌ Cobertura insuficiente: ${COVERAGE}% (mínimo: 80%)"
    exit 1
fi
echo "✅ Cobertura adequada: ${COVERAGE}%"
echo ""

# Resumo final
echo "🎉 RESUMO FINAL"
echo "==============="
echo "✅ Linting: Passou"
echo "✅ Testes Unitários: Passaram"
echo "✅ Testes de Integração: Passaram"
echo "✅ Testes Contratuais: Passaram"
echo "✅ Cobertura: ${COVERAGE}%"
echo ""
echo "🚀 Todos os testes baseados no TestSprite MCP foram executados com sucesso!"
echo "📋 20 casos de teste implementados e validados"
echo ""
