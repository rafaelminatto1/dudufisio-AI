#!/bin/bash

# =============================================================================
# Script de Validação do Projeto - DuduFisio-AI
# =============================================================================
#
# Este script executa uma validação completa do projeto, verificando:
# - Estrutura de pastas
# - Arquivos duplicados
# - Erros TypeScript
# - Erros ESLint
# - Testes
# - Documentação
#
# Uso: ./scripts/validate-project.sh
#
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contadores
ERRORS=0
WARNINGS=0
CHECKS=0

# Função para printar com cores
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
    ((CHECKS++))
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
    ((ERRORS++))
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    ((WARNINGS++))
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# =============================================================================
# 1. VERIFICAR ESTRUTURA DE PASTAS
# =============================================================================

print_header "1. Verificando Estrutura de Pastas"

required_folders=(
    "components"
    "pages"
    "services"
    "contexts"
    "hooks"
    "lib"
    "types"
    "supabase"
    "tests"
)

for folder in "${required_folders[@]}"; do
    if [ -d "$folder" ]; then
        print_success "Pasta '$folder' existe"
    else
        print_error "Pasta '$folder' não encontrada"
    fi
done

# =============================================================================
# 2. VERIFICAR ARQUIVOS DUPLICADOS
# =============================================================================

print_header "2. Verificando Arquivos Duplicados (.jsx/.tsx e .js/.ts)"

# Buscar pares duplicados na raiz
duplicates_found=0

if [ -f "App.jsx" ] && [ -f "App.tsx" ]; then
    print_warning "Arquivos duplicados: App.jsx e App.tsx"
    ((duplicates_found++))
fi

if [ -f "AppRoutes.jsx" ] && [ -f "AppRoutes.tsx" ]; then
    print_warning "Arquivos duplicados: AppRoutes.jsx e AppRoutes.tsx"
    ((duplicates_found++))
fi

if [ -f "index.jsx" ] && [ -f "index.tsx" ]; then
    print_warning "Arquivos duplicados: index.jsx e index.tsx"
    ((duplicates_found++))
fi

if [ -f "types.js" ] && [ -f "types.ts" ]; then
    print_warning "Arquivos duplicados: types.js e types.ts"
    ((duplicates_found++))
fi

# Buscar arquivos .jsx em contexts/
jsx_contexts=$(find contexts/ -name "*.jsx" 2>/dev/null | wc -l)
if [ "$jsx_contexts" -gt 0 ]; then
    print_warning "Encontrados $jsx_contexts arquivos .jsx em contexts/"
    ((duplicates_found+=$jsx_contexts))
fi

if [ "$duplicates_found" -eq 0 ]; then
    print_success "Nenhum arquivo duplicado encontrado"
else
    print_warning "Total de arquivos duplicados: $duplicates_found"
fi

# =============================================================================
# 3. VERIFICAR DOCUMENTAÇÃO
# =============================================================================

print_header "3. Verificando Documentação Essencial"

required_docs=(
    "README.md"
    "DEVELOPER_GUIDE.md"
    "AI_CONTEXT.md"
    "BUSINESS_RULES.md"
    "API_DOCUMENTATION.md"
)

for doc in "${required_docs[@]}"; do
    if [ -f "$doc" ]; then
        print_success "Documento '$doc' existe"
    else
        print_error "Documento '$doc' não encontrado"
    fi
done

# =============================================================================
# 4. EXECUTAR TYPE-CHECK
# =============================================================================

print_header "4. Executando Type-Check (TypeScript)"

if npm run type-check > /tmp/typecheck.log 2>&1; then
    print_success "Type-check passou sem erros"
else
    ts_errors=$(grep -c "error TS" /tmp/typecheck.log || echo "0")
    print_error "Type-check falhou com $ts_errors erros"
    print_info "Ver detalhes em: /tmp/typecheck.log"
fi

# =============================================================================
# 5. EXECUTAR LINT
# =============================================================================

print_header "5. Executando ESLint"

if npm run lint > /tmp/eslint.log 2>&1; then
    print_success "ESLint passou sem erros"
else
    print_warning "ESLint encontrou problemas"
    print_info "Ver detalhes em: /tmp/eslint.log"
fi

# =============================================================================
# 6. EXECUTAR TESTES
# =============================================================================

print_header "6. Executando Testes"

if npm run test:unit > /tmp/tests.log 2>&1; then
    print_success "Testes unitários passaram"
else
    print_warning "Alguns testes falharam"
    print_info "Ver detalhes em: /tmp/tests.log"
fi

# =============================================================================
# 7. VERIFICAR BUILD
# =============================================================================

print_header "7. Verificando Build"

if npm run build > /tmp/build.log 2>&1; then
    print_success "Build executado com sucesso"
    
    # Verificar tamanho do bundle
    if [ -d "dist" ]; then
        bundle_size=$(du -sh dist | cut -f1)
        print_info "Tamanho do bundle: $bundle_size"
    fi
else
    print_error "Build falhou"
    print_info "Ver detalhes em: /tmp/build.log"
fi

# =============================================================================
# 8. VERIFICAR DEPENDÊNCIAS
# =============================================================================

print_header "8. Verificando Dependências"

outdated=$(npm outdated 2>/dev/null | wc -l || echo "0")
if [ "$outdated" -gt 1 ]; then
    print_warning "$((outdated - 1)) dependências desatualizadas"
    print_info "Execute: npm run deps:check"
else
    print_success "Todas as dependências estão atualizadas"
fi

# Security audit
if npm audit --audit-level=moderate > /dev/null 2>&1; then
    print_success "Nenhuma vulnerabilidade encontrada"
else
    print_warning "Vulnerabilidades encontradas"
    print_info "Execute: npm run security"
fi

# =============================================================================
# RELATÓRIO FINAL
# =============================================================================

print_header "Relatório Final da Validação"

echo -e "Verificações executadas: ${CHECKS}"
echo -e "Erros encontrados: ${RED}${ERRORS}${NC}"
echo -e "Avisos: ${YELLOW}${WARNINGS}${NC}"

if [ "$ERRORS" -eq 0 ] && [ "$WARNINGS" -eq 0 ]; then
    echo -e "\n${GREEN}🎉 Projeto validado com sucesso!${NC}\n"
    exit 0
elif [ "$ERRORS" -eq 0 ]; then
    echo -e "\n${YELLOW}⚠️  Projeto validado com avisos${NC}\n"
    exit 0
else
    echo -e "\n${RED}❌ Projeto tem erros que precisam ser corrigidos${NC}\n"
    exit 1
fi

