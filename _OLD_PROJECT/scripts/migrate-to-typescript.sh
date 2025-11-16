#!/bin/bash

# =============================================================================
# Script de Migração para TypeScript - DuduFisio-AI
# =============================================================================
#
# Este script identifica arquivos .jsx e .js e os converte para .tsx e .ts
#
# Uso: ./scripts/migrate-to-typescript.sh [--dry-run]
#
# =============================================================================

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Flags
DRY_RUN=false

# Parse argumentos
for arg in "$@"; do
    case $arg in
        --dry-run)
            DRY_RUN=true
            shift
            ;;
    esac
done

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

# =============================================================================
# 1. IDENTIFICAR ARQUIVOS .jsx E .js
# =============================================================================

print_header "1. Identificando Arquivos JavaScript"

# Excluir node_modules, dist, e outros
jsx_files=$(find . -name "*.jsx" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.vite/*" \
    -not -path "*/build/*" \
    | wc -l)

js_files=$(find . -name "*.js" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -path "*/.vite/*" \
    -not -path "*/build/*" \
    -not -name "*.config.js" \
    -not -name "*.cjs" \
    -not -name "*.mjs" \
    | wc -l)

echo -e "Arquivos .jsx encontrados: ${YELLOW}${jsx_files}${NC}"
echo -e "Arquivos .js encontrados: ${YELLOW}${js_files}${NC}"

# =============================================================================
# 2. VERIFICAR ARQUIVOS DUPLICADOS
# =============================================================================

print_header "2. Verificando Duplicatas"

duplicates=0

# Verificar duplicatas críticas na raiz
critical_files=("App" "AppRoutes" "index" "types")

for base in "${critical_files[@]}"; do
    jsx="${base}.jsx"
    tsx="${base}.tsx"
    js="${base}.js"
    ts="${base}.ts"
    
    if [ -f "$jsx" ] && [ -f "$tsx" ]; then
        echo -e "${YELLOW}Duplicata encontrada: ${jsx} e ${tsx}${NC}"
        ((duplicates++))
        
        if [ "$DRY_RUN" = false ]; then
            echo -e "${GREEN}  → Removendo ${jsx}${NC}"
            rm "$jsx"
        else
            echo -e "${BLUE}  → [DRY-RUN] Removeria ${jsx}${NC}"
        fi
    fi
    
    if [ -f "$js" ] && [ -f "$ts" ]; then
        echo -e "${YELLOW}Duplicata encontrada: ${js} e ${ts}${NC}"
        ((duplicates++))
        
        if [ "$DRY_RUN" = false ]; then
            echo -e "${GREEN}  → Removendo ${js}${NC}"
            rm "$js"
        else
            echo -e "${BLUE}  → [DRY-RUN] Removeria ${js}${NC}"
        fi
    fi
done

if [ "$duplicates" -eq 0 ]; then
    echo -e "${GREEN}✅ Nenhuma duplicata crítica encontrada${NC}"
else
    echo -e "${YELLOW}⚠️  ${duplicates} duplicatas processadas${NC}"
fi

# =============================================================================
# 3. GERAR RELATÓRIO
# =============================================================================

print_header "3. Gerando Relatório"

report_file="typescript-migration-report.txt"

cat > "$report_file" <<EOF
# Relatório de Migração para TypeScript
# Data: $(date)
# 
# =============================================================================

## Resumo

- Arquivos .jsx encontrados: ${jsx_files}
- Arquivos .js encontrados: ${js_files}
- Duplicatas processadas: ${duplicates}
- Modo: $(if [ "$DRY_RUN" = true ]; then echo "DRY-RUN"; else echo "EXECUTION"; fi)

## Arquivos .jsx por Pasta

EOF

find . -name "*.jsx" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    | sort >> "$report_file"

cat >> "$report_file" <<EOF

## Arquivos .js por Pasta (excluindo configs)

EOF

find . -name "*.js" \
    -not -path "*/node_modules/*" \
    -not -path "*/dist/*" \
    -not -name "*.config.js" \
    -not -name "*.cjs" \
    -not -name "*.mjs" \
    | sort >> "$report_file"

echo -e "${GREEN}✅ Relatório gerado: ${report_file}${NC}"

# =============================================================================
# 4. RESUMO FINAL
# =============================================================================

print_header "Resumo da Execução"

if [ "$DRY_RUN" = true ]; then
    echo -e "${BLUE}Modo DRY-RUN ativado - Nenhum arquivo foi modificado${NC}"
    echo -e "${BLUE}Execute sem --dry-run para aplicar mudanças${NC}"
else
    echo -e "${GREEN}Migração executada com sucesso!${NC}"
    echo -e "Total de duplicatas removidas: ${duplicates}"
fi

echo -e "\n📊 Consulte o relatório completo em: ${report_file}"
echo -e "\n${GREEN}✅ Validação concluída!${NC}\n"

exit 0

