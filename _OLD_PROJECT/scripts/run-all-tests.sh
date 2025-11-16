#!/bin/bash

# Script para executar todos os testes de fluxo
# DuduFisio-AI - Test Suite

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        DuduFisio-AI - Suite Completa de Testes           ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar se as variáveis de ambiente estão configuradas
echo -e "${BLUE}📋 Verificando variáveis de ambiente...${NC}"

if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo -e "${YELLOW}⚠️  Variáveis não encontradas no ambiente${NC}"
    echo -e "${BLUE}Carregando do .env.local...${NC}"

    if [ -f .env.local ]; then
        export $(cat .env.local | grep -v '^#' | xargs)
        echo -e "${GREEN}✅ Variáveis carregadas do .env.local${NC}"
    else
        echo -e "${RED}❌ Arquivo .env.local não encontrado${NC}"
        echo -e "${YELLOW}Crie o arquivo .env.local com:${NC}"
        echo "VITE_SUPABASE_URL=your_url"
        echo "VITE_SUPABASE_ANON_KEY=your_key"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Variáveis de ambiente configuradas${NC}"
echo ""

# Contador de testes
TOTAL_TESTS=4
PASSED_TESTS=0
FAILED_TESTS=0

# Função para executar teste
run_test() {
    local test_name=$1
    local test_file=$2

    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  TESTE: $test_name"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""

    if npx tsx "$test_file"; then
        echo ""
        echo -e "${GREEN}✅ $test_name: PASSOU${NC}"
        ((PASSED_TESTS++))
    else
        echo ""
        echo -e "${RED}❌ $test_name: FALHOU${NC}"
        ((FAILED_TESTS++))
    fi

    echo ""
    echo "Pressione ENTER para continuar com o próximo teste..."
    read
}

# Executar testes
echo -e "${BLUE}🧪 Iniciando bateria de testes...${NC}"
echo ""

run_test "Fluxo de Pagamentos Stripe" "scripts/test-payment-flow.js"
run_test "Fluxo de Teleconsulta Jitsi" "scripts/test-teleconsulta-flow.js"
run_test "Fluxo de Mensagens" "scripts/test-messaging-flow.js"
run_test "Fluxo de Solicitação de Agendamento" "scripts/test-appointment-request-flow.js"

# Relatório final
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║              RELATÓRIO FINAL DE TESTES                    ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo -e "${BLUE}Total de testes: $TOTAL_TESTS${NC}"
echo -e "${GREEN}✅ Testes passados: $PASSED_TESTS${NC}"
echo -e "${RED}❌ Testes falhados: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║  🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉             ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${BLUE}🚀 O sistema está PRONTO PARA PRODUÇÃO!${NC}"
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║  ⚠️  ALGUNS TESTES FALHARAM - REVISE OS ERROS ACIMA       ║${NC}"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════════╝${NC}"
fi

echo ""
echo -e "${BLUE}📚 Documentação dos testes:${NC}"
echo "   - STATUS_FINAL_PRODUCAO.md"
echo "   - RELATORIO_FINAL_COMPLETO.md"
echo "   - FASES_4_5_6_IMPLEMENTADAS.md"
echo ""
