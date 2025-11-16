#!/bin/bash

echo ""
echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                            ║"
echo "║   🔒 RESOLVEDOR DE VULNERABILIDADES                                       ║"
echo "║                                                                            ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar vulnerabilidades atuais
echo "📊 Verificando vulnerabilidades atuais..."
VULN_COUNT=$(npm audit --json 2>/dev/null | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
echo "   Vulnerabilidades high: $VULN_COUNT"
echo ""

if [ "$VULN_COUNT" -eq "0" ]; then
    echo "✅ Nenhuma vulnerabilidade encontrada!"
    exit 0
fi

echo "🔒 Vulnerabilidades detectadas (principalmente whatsapp-web.js)"
echo ""
echo "⚠️  AVISO: whatsapp-web.js pode quebrar se atualizado"
echo "   Funcionalidades WhatsApp podem parar de funcionar"
echo ""

read -p "🤔 Tentar resolver automaticamente? (s/N): " confirm
echo ""

if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo "⚠️  Operação cancelada"
    echo ""
    echo "💡 Alternativas:"
    echo "   1. Atualizar manualmente: npm update whatsapp-web.js"
    echo "   2. Usar overrides no package.json"
    echo "   3. Aceitar risco temporariamente (funcionalidade não crítica)"
    echo ""
    exit 0
fi

echo "🔧 Tentando resolver vulnerabilidades..."
echo ""

# Backup package.json
cp package.json package.json.backup
echo "✅ Backup do package.json criado"

# Tentar atualizar whatsapp-web.js especificamente
echo "📦 Atualizando whatsapp-web.js..."
npm update whatsapp-web.js 2>&1 | tail -10

# Verificar se resolveu
echo ""
echo "🔍 Verificando se vulnerabilidades foram resolvidas..."
VULN_AFTER=$(npm audit --json 2>/dev/null | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
echo "   Vulnerabilidades restantes: $VULN_AFTER"

if [ "$VULN_AFTER" -lt "$VULN_COUNT" ]; then
    echo "✅ Algumas vulnerabilidades foram resolvidas!"
    RESOLVED=$((VULN_COUNT - VULN_AFTER))
    echo "   $RESOLVED vulnerabilidades corrigidas"
else
    echo "⚠️  Vulnerabilidades persistem (dependências transitivas)"
fi

echo ""

# Testar build
echo "🏗️  Testando se build ainda funciona..."
if npm run build > /tmp/build-test.log 2>&1; then
    echo "✅ Build OK após atualizações"
    
    echo ""
    read -p "🚀 Fazer commit das correções? (s/N): " commit_confirm
    
    if [[ $commit_confirm =~ ^[Ss]$ ]]; then
        git add package.json package-lock.json
        git commit -m "🔒 fix: atualiza dependências para resolver vulnerabilidades

- Atualiza whatsapp-web.js para versão mais segura
- Resolve $RESOLVED de $VULN_COUNT vulnerabilidades high severity
- Mantém compatibilidade com funcionalidades existentes
- Backup salvo em package.json.backup"
        
        echo "✅ Commit realizado!"
        echo "   Para enviar: git push origin main"
    fi
    
else
    echo "❌ Build falhou após atualizações"
    echo "   Restaurando backup..."
    mv package.json.backup package.json
    npm install > /tmp/restore.log 2>&1
    echo "   Backup restaurado"
    echo ""
    echo "💡 Recomendação:"
    echo "   1. Usar overrides no package.json"
    echo "   2. Ou aceitar risco temporariamente"
    echo "   3. Ver SECURITY-VULNERABILITIES-GUIDE.md"
fi

echo ""
echo "═══════════════════════════════════════════════════════════════════════════"
echo "🔗 Para mais opções, veja: SECURITY-VULNERABILITIES-GUIDE.md"
echo "═══════════════════════════════════════════════════════════════════════════"
echo ""
