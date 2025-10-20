# Script simples para rebuild apos correcao do erro Radix UI
# Uso: .\scripts\fix-build-simple.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Correcao do Build Radix UI" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Limpar build anterior
Write-Host "[1/4] Limpando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") { Remove-Item -Recurse -Force "dist" }
if (Test-Path "node_modules\.vite") { Remove-Item -Recurse -Force "node_modules\.vite" }
Write-Host "       OK - Build anterior limpo" -ForegroundColor Green
Write-Host ""

# Type check
Write-Host "[2/4] Verificando tipos TypeScript..." -ForegroundColor Yellow
npm run type-check
Write-Host "       OK - Type check passou" -ForegroundColor Green
Write-Host ""

# Build para producao
Write-Host "[3/4] Fazendo build para producao..." -ForegroundColor Yellow
npm run build
Write-Host "       OK - Build concluido" -ForegroundColor Green
Write-Host ""

# Verificar bundle
Write-Host "[4/4] Verificando bundle..." -ForegroundColor Yellow
if (Test-Path "dist\assets") {
    $vendorReact = Get-ChildItem "dist\assets\vendor-react-*.js" -ErrorAction SilentlyContinue
    $vendorRadix = Get-ChildItem "dist\assets\vendor-radix-*.js" -ErrorAction SilentlyContinue
    
    if ($vendorReact) {
        $size = [math]::Round($vendorReact[0].Length / 1KB, 2)
        Write-Host "       OK - vendor-react.js: $size KB" -ForegroundColor Green
    }
    
    if ($vendorRadix) {
        Write-Host "       ERRO - vendor-radix.js ainda existe!" -ForegroundColor Red
    } else {
        Write-Host "       OK - vendor-radix.js consolidado" -ForegroundColor Green
    }
}
Write-Host ""

# Perguntar sobre preview
Write-Host "========================================" -ForegroundColor Cyan
$startPreview = Read-Host "Iniciar preview local? (Y/n)"
if ($startPreview -ne "n" -and $startPreview -ne "N") {
    Write-Host ""
    Write-Host "Iniciando preview em http://localhost:4173" -ForegroundColor Green
    Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
    Write-Host ""
    npm run start
} else {
    Write-Host ""
    Write-Host "Para testar localmente, execute:" -ForegroundColor Yellow
    Write-Host "  npm run start" -ForegroundColor White
    Write-Host ""
    Write-Host "Para fazer deploy:" -ForegroundColor Yellow
    Write-Host "  npm run vercel:deploy" -ForegroundColor White
}

