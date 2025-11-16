#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║   🚀 SCRIPT DE PUSH PARA GITHUB                                           ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar se estamos no diretório correto
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ Erro: Este não é um repositório git${NC}"
    exit 1
fi

# Mostrar status
echo "📊 Status Atual:"
echo ""
git status -s
echo ""

# Mostrar commits pendentes
echo "📝 Commits Pendentes:"
echo ""
git log origin/main..HEAD --oneline
echo ""

# Perguntar confirmação
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
read -p "🤔 Deseja fazer push destes commits para origin/main? (s/N): " confirm
echo ""

if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}⚠️  Push cancelado pelo usuário${NC}"
    exit 0
fi

echo "🚀 Fazendo push para origin/main..."
echo ""

# Tentar push
if git push origin main; then
    echo ""
    echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🎉 Próximos passos:"
    echo ""
    echo "  1️⃣  Verificar CI/CD:"
    echo "     https://github.com/rafaelminatto1/dudufisio-AI/actions"
    echo ""
    echo "  2️⃣  Ver commits no GitHub:"
    echo "     https://github.com/rafaelminatto1/dudufisio-AI/commits/main"
    echo ""
    echo "  3️⃣  Revisar relatório de testes:"
    echo "     https://github.com/rafaelminatto1/dudufisio-AI/blob/main/TEST-REPORT.md"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erro ao fazer push${NC}"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "⚠️  Possíveis soluções:"
    echo ""
    echo "1. Token expirado ou sem permissões:"
    echo "   → Gere novo token em: https://github.com/settings/tokens"
    echo "   → Scopes necessários: repo, workflow"
    echo ""
    echo "2. Configurar token manualmente:"
    echo "   git remote set-url origin https://TOKEN@github.com/rafaelminatto1/dudufisio-AI.git"
    echo ""
    echo "3. Usar SSH (recomendado):"
    echo "   git remote set-url origin git@github.com:rafaelminatto1/dudufisio-AI.git"
    echo ""
    echo "4. Usar GitHub CLI:"
    echo "   gh auth login"
    echo "   git push origin main"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    exit 1
fi

