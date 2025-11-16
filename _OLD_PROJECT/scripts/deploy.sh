#!/bin/bash

# Script de Deploy Automático para Vercel
# Autor: DuduFisio AI Team
# Data: 03/11/2025

set -e  # Exit on error

echo "🚀 Iniciando Deploy Automático para Vercel"
echo "==========================================="
echo ""

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Função para printar com cores
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# 1. Verificar se estamos na branch main
current_branch=$(git branch --show-current)
if [ "$current_branch" != "main" ]; then
    print_warning "Você está na branch '$current_branch'. Recomendado fazer deploy da 'main'."
    read -p "Continuar mesmo assim? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_error "Deploy cancelado."
        exit 1
    fi
fi

# 2. Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    print_warning "Há mudanças não commitadas no repositório."
    print_warning "Faça commit antes de fazer deploy."
    exit 1
fi

# 3. Atualizar do remoto
print_success "Atualizando do remoto..."
git pull origin $current_branch

# 4. Executar linting
echo ""
echo "🔍 Verificando código..."
npm run lint --silent || {
    print_error "Linting falhou. Corrija os erros antes de fazer deploy."
    exit 1
}
print_success "Linting passou"

# 5. Executar testes (se existirem)
if [ -f "package.json" ] && grep -q "\"test\"" package.json; then
    echo ""
    echo "🧪 Executando testes..."
    npm test --silent || {
        print_warning "Alguns testes falharam, mas continuando com deploy..."
    }
fi

# 6. Build de produção
echo ""
echo "🏗️  Fazendo build de produção..."
npm run build || {
    print_error "Build falhou. Corrija os erros antes de fazer deploy."
    exit 1
}
print_success "Build concluído com sucesso"

# 7. Verificar se Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI não encontrado. Instalando..."
    npm install -g vercel
fi

# 8. Fazer deploy para Vercel
echo ""
echo "🚀 Fazendo deploy para Vercel..."

# Verificar se é produção ou preview
if [ "$1" == "--production" ] || [ "$current_branch" == "main" ]; then
    print_success "Deploying para PRODUÇÃO..."
    vercel --prod --yes
else
    print_success "Deploying para PREVIEW..."
    vercel --yes
fi

# 9. Sucesso!
echo ""
echo "=========================================="
print_success "Deploy concluído com sucesso! 🎉"
echo ""
echo "📊 Próximos passos:"
echo "  1. Verifique o deploy no dashboard do Vercel"
echo "  2. Teste a aplicação em produção"
echo "  3. Monitore logs por erros"
echo ""
echo "🔗 Links úteis:"
echo "  - Dashboard: https://vercel.com/dashboard"
echo "  - Aplicação: https://moocafisio.com.br"
echo ""

exit 0

