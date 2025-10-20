#!/bin/bash

# Script para corrigir e fazer rebuild após correção do erro Radix UI
# Uso: bash scripts/fix-radix-ui-build.sh

set -e  # Exit on error

echo "🔧 Iniciando correção do build Radix UI..."
echo ""

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir mensagens coloridas
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${NC}ℹ️  $1${NC}"
}

# 1. Limpar build anterior
print_info "Limpando build anterior..."
rm -rf dist
rm -rf node_modules/.vite
print_success "Build anterior limpo"

# 2. Limpar cache do npm (opcional)
read -p "Deseja limpar o cache do npm? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Limpando cache do npm..."
    npm cache clean --force
    print_success "Cache do npm limpo"
fi

# 3. Reinstalar dependências (opcional)
read -p "Deseja reinstalar as dependências? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Reinstalando dependências..."
    rm -rf node_modules
    npm install
    print_success "Dependências reinstaladas"
fi

# 4. Type check
print_info "Verificando tipos TypeScript..."
if npm run type-check 2>&1 | tee /tmp/typecheck.log; then
    print_success "Type check passou"
else
    print_error "Type check falhou"
    print_info "Verifique os erros acima"
    exit 1
fi

# 5. Build para produção
print_info "Fazendo build para produção..."
if npm run build 2>&1 | tee /tmp/build.log; then
    print_success "Build concluído com sucesso"
else
    print_error "Build falhou"
    print_info "Verifique os erros acima"
    exit 1
fi

# 6. Verificar tamanho do bundle
print_info "Verificando tamanho do bundle..."
if [ -d "dist/assets" ]; then
    echo ""
    print_info "Tamanho dos arquivos principais:"
    ls -lh dist/assets/*.js | awk '{print $5, $9}' | sort -hr | head -10
    echo ""
    
    # Verificar se vendor-react existe
    if ls dist/assets/vendor-react-*.js 1> /dev/null 2>&1; then
        VENDOR_REACT_SIZE=$(du -h dist/assets/vendor-react-*.js | cut -f1)
        print_success "vendor-react.js encontrado: $VENDOR_REACT_SIZE"
    else
        print_warning "vendor-react.js não encontrado"
    fi
    
    # Verificar se vendor-radix NÃO existe (deve estar consolidado)
    if ls dist/assets/vendor-radix-*.js 1> /dev/null 2>&1; then
        print_error "vendor-radix.js ainda existe! A consolidação não funcionou."
        exit 1
    else
        print_success "vendor-radix.js não existe (consolidado corretamente)"
    fi
fi

# 7. Iniciar preview
print_info "Iniciando preview do build..."
print_warning "O servidor de preview será iniciado na porta 4173"
print_info "Pressione Ctrl+C para parar o servidor"
echo ""
read -p "Deseja iniciar o preview agora? (Y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Nn]$ ]]; then
    npm run start
fi

# 8. Deploy (opcional)
echo ""
read -p "Deseja fazer deploy para produção agora? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "Fazendo deploy para Vercel..."
    npm run vercel:deploy
    print_success "Deploy concluído!"
    print_info "Verifique o site em produção para confirmar que o erro foi corrigido"
fi

print_success "Processo concluído!"
print_info "Próximos passos:"
print_info "1. Teste o preview local em http://localhost:4173"
print_info "2. Verifique o console do navegador para erros"
print_info "3. Teste componentes Radix UI (dialogs, dropdowns, etc.)"
print_info "4. Faça deploy para produção quando estiver satisfeito"

