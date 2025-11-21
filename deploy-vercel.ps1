# Script de Deploy para Vercel
# Execute: .\deploy-vercel.ps1

Write-Host "🚀 Preparando deploy para Vercel..." -ForegroundColor Cyan

# Verificar se o build foi concluído
if (-not (Test-Path ".next\BUILD_ID")) {
    Write-Host "⚠️  Build não encontrado. Executando build..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build falhou. Corrija os erros antes de fazer deploy." -ForegroundColor Red
        exit 1
    }
}

Write-Host "✓ Build verificado" -ForegroundColor Green

# Verificar Vercel CLI
$vercelVersion = vercel --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel CLI não encontrado. Instale com: npm i -g vercel" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Vercel CLI encontrado: $vercelVersion" -ForegroundColor Green

# Fazer deploy
Write-Host "`n🚀 Iniciando deploy na Vercel..." -ForegroundColor Cyan
Write-Host "Para deploy em produção, execute: vercel --prod" -ForegroundColor Yellow
Write-Host "Para preview, execute: vercel" -ForegroundColor Yellow

# Perguntar se deseja fazer deploy agora
$deploy = Read-Host "`nDeseja fazer deploy agora? (s/n)"
if ($deploy -eq "s" -or $deploy -eq "S") {
    $envType = Read-Host "Tipo de deploy (prod/preview) [preview]"
    if ($envType -eq "prod") {
        Write-Host "🚀 Fazendo deploy em PRODUÇÃO..." -ForegroundColor Red
        vercel --prod
    } else {
        Write-Host "🚀 Fazendo deploy em PREVIEW..." -ForegroundColor Yellow
        vercel
    }
} else {
    Write-Host "`nDeploy cancelado. Execute manualmente quando estiver pronto:" -ForegroundColor Yellow
    Write-Host "  vercel --prod    # Para produção" -ForegroundColor White
    Write-Host "  vercel           # Para preview" -ForegroundColor White
}

Write-Host "`n✓ Script concluído!" -ForegroundColor Green

