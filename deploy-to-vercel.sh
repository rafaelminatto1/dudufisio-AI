#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║   🚀 DEPLOY AUTOMATIZADO PARA VERCEL                                      ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Contador de erros
ERRORS=0

# 1. Verificar se estamos no diretório correto
echo "📍 Verificando ambiente..."
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Erro: package.json não encontrado${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Ambiente OK${NC}"
echo ""

# 2. Verificar dependências
echo "📦 Verificando dependências..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules não encontrado, instalando...${NC}"
    npm install || { echo -e "${RED}❌ Erro ao instalar dependências${NC}"; exit 1; }
fi
echo -e "${GREEN}✅ Dependências OK${NC}"
echo ""

# 3. Verificar vulnerabilidades
echo "🔒 Verificando vulnerabilidades de segurança..."
VULN_COUNT=$(npm audit --json 2>/dev/null | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
echo "   Vulnerabilidades alta severidade: $VULN_COUNT"

if [ "$VULN_COUNT" -gt "0" ]; then
    echo -e "${YELLOW}⚠️  Tentando corrigir automaticamente...${NC}"
    npm audit fix --legacy-peer-deps 2>&1 | tail -5
    echo -e "${YELLOW}⚠️  Algumas vulnerabilidades podem persistir (whatsapp-web.js)${NC}"
fi
echo ""

# 4. Rodar lint (opcional)
echo "🔍 Verificando código..."
if npm run lint --if-present 2>/dev/null; then
    echo -e "${GREEN}✅ Lint OK${NC}"
else
    echo -e "${YELLOW}⚠️  Lint com avisos (continuando...)${NC}"
fi
echo ""

# 5. Build de produção
echo "🏗️  Executando build de produção..."
if npm run build; then
    echo -e "${GREEN}✅ Build concluído com sucesso${NC}"
else
    echo -e "${RED}❌ Erro no build${NC}"
    exit 1
fi
echo ""

# 6. Verificar tamanho dos chunks
echo "📊 Analisando tamanho dos chunks..."
if [ -d "dist" ]; then
    LARGEST=$(find dist/assets -name "*.js" -type f -exec du -h {} + 2>/dev/null | sort -rh | head -5)
    echo "   Top 5 maiores chunks:"
    echo "$LARGEST" | while read size file; do
        echo "      $size - $(basename $file)"
    done
else
    echo -e "${RED}❌ Pasta dist não encontrada${NC}"
    exit 1
fi
echo ""

# 7. Confirmar deploy
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
read -p "🤔 Fazer push e trigger deploy no Vercel? (s/N): " confirm
echo ""

if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}⚠️  Deploy cancelado${NC}"
    exit 0
fi

# 8. Git status
echo "📝 Status do Git:"
git status --short
echo ""

# 9. Push para GitHub (trigger Vercel deploy automático)
echo "🚀 Fazendo push para GitHub..."
if git push origin main; then
    echo -e "${GREEN}✅ Push realizado com sucesso!${NC}"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🎉 Deploy iniciado no Vercel!"
    echo ""
    echo "📊 Acompanhe o deploy em:"
    echo "   https://vercel.com/rafael-minattos-projects/dudufisio-ai"
    echo ""
    echo "🌐 Site em produção:"
    echo "   https://dudufisio-ai-rafael-minattos-projects.vercel.app"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
else
    echo -e "${RED}❌ Erro ao fazer push${NC}"
    echo ""
    echo "💡 Dica: Verifique suas credenciais Git"
    exit 1
fi

