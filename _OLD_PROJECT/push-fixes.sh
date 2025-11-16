#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║   🚀 PUSH DAS CORREÇÕES PARA GITHUB                                       ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se há commits para fazer push
if [ -z "$(git log origin/main..HEAD 2>/dev/null)" ]; then
    echo "⚠️  Nenhum commit novo para fazer push"
    exit 0
fi

echo "📝 Commits que serão enviados:"
echo ""
git log origin/main..HEAD --oneline
echo ""

read -p "🤔 Fazer push para origin/main? (s/N): " confirm
echo ""

if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo "⚠️  Push cancelado"
    exit 0
fi

echo "🚀 Fazendo push..."
echo ""

if git push origin main; then
    echo ""
    echo "✅ Push realizado com sucesso!"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
    echo "🔗 Links úteis:"
    echo ""
    echo "  📊 Commits:"
    echo "     https://github.com/rafaelminatto1/dudufisio-AI/commits/main"
    echo ""
    echo "  🤖 CI/CD:"
    echo "     https://github.com/rafaelminatto1/dudufisio-AI/actions"
    echo ""
    echo "  📄 Código:"
    echo "     https://github.com/rafaelminatto1/dudufisio-AI"
    echo ""
    echo "═══════════════════════════════════════════════════════════════════════════"
    echo ""
else
    echo ""
    echo "❌ Erro ao fazer push"
    echo ""
    echo "⚠️  Se houver erro de permissões:"
    echo "   1. Gere um novo token em: https://github.com/settings/tokens"
    echo "   2. Configure: git remote set-url origin https://TOKEN@github.com/rafaelminatto1/dudufisio-AI.git"
    echo "   3. Tente novamente: ./push-fixes.sh"
    echo ""
    exit 1
fi

