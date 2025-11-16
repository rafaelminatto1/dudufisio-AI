# Script de Configuração do Edge Config
# Execute após criar o Edge Config Store e o API Token

Write-Host "🚀 CONFIGURAÇÃO DO EDGE CONFIG - DuduFisio AI" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Verificar se Vercel CLI está instalado
try {
    $vercelVersion = vercel --version
    Write-Host "✅ Vercel CLI detectado: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI não encontrado!" -ForegroundColor Red
    Write-Host "   Instale com: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 INSTRUÇÕES:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Abra: https://vercel.com/rafael-minattos-projects/stores" -ForegroundColor White
Write-Host "   - Create Store → Edge Config → Nome: 'agenda-cache'" -ForegroundColor Gray
Write-Host "   - Connect Project → 'dudufisio-ai' → todos os ambientes" -ForegroundColor Gray
Write-Host "   - Settings → Copie o Edge Config ID" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Abra: https://vercel.com/account/tokens" -ForegroundColor White
Write-Host "   - Create Token → Nome: 'Edge Config API'" -ForegroundColor Gray
Write-Host "   - Scope: 'rafael-minattos-projects'" -ForegroundColor Gray
Write-Host "   - Copie o token IMEDIATAMENTE (só mostra 1 vez!)" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Coletar EDGE_CONFIG_ID
Write-Host "🔑 PASSO 1: EDGE CONFIG ID" -ForegroundColor Cyan
Write-Host ""
$edgeConfigId = Read-Host "Cole o Edge Config ID (formato: ecfg_xxx...)"

if ($edgeConfigId -notmatch "^ecfg_") {
    Write-Host "⚠️  Aviso: O ID não parece estar no formato correto (deveria começar com 'ecfg_')" -ForegroundColor Yellow
    $continue = Read-Host "Continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        Write-Host "❌ Configuração cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Edge Config ID recebido: $edgeConfigId" -ForegroundColor Green
Write-Host ""

# Coletar VERCEL_API_TOKEN
Write-Host "🔑 PASSO 2: VERCEL API TOKEN" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Cole o token completo (é longo, ~200 caracteres)" -ForegroundColor Yellow
$vercelToken = Read-Host "Cole o Vercel API Token (formato: vercel_xxx...)" -AsSecureString
$vercelTokenPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($vercelToken))

if ($vercelTokenPlain -notmatch "^vercel_") {
    Write-Host "⚠️  Aviso: O token não parece estar no formato correto (deveria começar com 'vercel_')" -ForegroundColor Yellow
    $continue = Read-Host "Continuar mesmo assim? (s/n)"
    if ($continue -ne "s") {
        Write-Host "❌ Configuração cancelada" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Vercel API Token recebido: vercel_***...***" -ForegroundColor Green
Write-Host ""

# Adicionar EDGE_CONFIG_ID
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🔧 ADICIONANDO VARIÁVEIS DE AMBIENTE..." -ForegroundColor Cyan
Write-Host ""

Write-Host "Adicionando EDGE_CONFIG_ID..." -ForegroundColor White
$edgeConfigId | vercel env add EDGE_CONFIG_ID production preview development

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ EDGE_CONFIG_ID adicionado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao adicionar EDGE_CONFIG_ID" -ForegroundColor Red
    Write-Host "   Execute manualmente: vercel env add EDGE_CONFIG_ID" -ForegroundColor Yellow
}

Write-Host ""

# Adicionar VERCEL_API_TOKEN
Write-Host "Adicionando VERCEL_API_TOKEN..." -ForegroundColor White
$vercelTokenPlain | vercel env add VERCEL_API_TOKEN production preview development

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ VERCEL_API_TOKEN adicionado com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao adicionar VERCEL_API_TOKEN" -ForegroundColor Red
    Write-Host "   Execute manualmente: vercel env add VERCEL_API_TOKEN" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Verificar variáveis
Write-Host "📋 VERIFICANDO VARIÁVEIS ADICIONADAS..." -ForegroundColor Cyan
Write-Host ""
vercel env ls

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Perguntar se deve fazer deploy
$deploy = Read-Host "🚀 Deseja fazer o redeploy agora? (s/n)"

if ($deploy -eq "s") {
    Write-Host ""
    Write-Host "🚀 INICIANDO REDEPLOY..." -ForegroundColor Cyan
    Write-Host ""
    
    git commit --allow-empty -m "trigger: redeploy com Edge Config configurado"
    git push
    
    Write-Host ""
    Write-Host "✅ Push concluído! Deploy será iniciado automaticamente." -ForegroundColor Green
    Write-Host ""
    Write-Host "Aguarde ~2 minutos e verifique:" -ForegroundColor Yellow
    Write-Host "   vercel ls" -ForegroundColor White
    Write-Host ""
    Write-Host "Ou acompanhe em tempo real:" -ForegroundColor Yellow
    Write-Host "   🔗 https://vercel.com/rafael-minattos-projects/dudufisio-ai" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "✅ Variáveis configuradas!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para fazer deploy depois, execute:" -ForegroundColor Yellow
    Write-Host "   git commit --allow-empty -m 'trigger: redeploy com Edge Config'" -ForegroundColor White
    Write-Host "   git push" -ForegroundColor White
}

Write-Host ""
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host "🎉 CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Salvar valores em arquivo temporário (para referência)
$configFile = "edge-config-values.txt"
@"
EDGE CONFIG - VALORES CONFIGURADOS
Data: $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

EDGE_CONFIG_ID=$edgeConfigId
VERCEL_API_TOKEN=vercel_***...*** (oculto por segurança)

Links importantes:
- Edge Config: https://vercel.com/rafael-minattos-projects/stores
- Deployments: https://vercel.com/rafael-minattos-projects/dudufisio-ai
- Env Vars: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables
"@ | Out-File -FilePath $configFile -Encoding UTF8

Write-Host "📄 Valores salvos em: $configFile" -ForegroundColor Gray
Write-Host ""

