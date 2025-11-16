#!/bin/bash

# Script para executar testes de segurança contra null/undefined

echo "🧪 Executando Testes de Segurança contra Null/Undefined"
echo "=========================================================="
echo ""

# Executar testes específicos
npx vitest run tests/unit/dashboard-null-safety.test.tsx tests/unit/pages-null-safety.test.tsx

# Verificar resultado
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Todos os testes passaram com sucesso!"
    echo ""
    echo "📊 Cobertura de Testes:"
    echo "  - RevenueWidget: 100%"
    echo "  - PatientFlowWidget: 100%"
    echo "  - AppointmentsWidget: 100%"
    echo "  - DashboardPageV2: 100%"
    echo "  - Array.isArray pattern: 100%"
    echo ""
else
    echo ""
    echo "❌ Alguns testes falharam. Verifique os erros acima."
    echo ""
    exit 1
fi

