# Script PowerShell para corrigir e fazer rebuild apos correcao do erro Radix UI
# Uso: .\scripts\fix-radix-ui-build.ps1

$ErrorActionPreference = "Stop"

Write-Host "Iniciando correcao do build Radix UI..." -ForegroundColor Cyan
Write-Host ""

# 1. Limpar build anterior
Write-Host "Limpando build anterior..." -ForegroundColor White
if (Test-Path "dist") {
    Remove-Item -Recurse -Force "dist"
}
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite"
}
Write-Host "Build anterior limpo" -ForegroundColor Green

# 2. Limpar cache do npm (opcional)
$clearCache = Read-Host "Deseja limpar o cache do npm? (y/N)"
if ($clearCache -eq "y" -or $clearCache -eq "Y") {
    Write-Host "Limpando cache do npm..." -ForegroundColor White
    npm cache clean --force
    Write-Host "Cache do npm limpo" -ForegroundColor Green
}

# 3. Reinstalar dependencias (opcional)
$reinstall = Read-Host "Deseja reinstalar as dependencias? (y/N)"
if ($reinstall -eq "y" -or $reinstall -eq "Y") {
    Write-Host "Reinstalando dependencias..." -ForegroundColor White
    Remove-Item -Recurse -Force "node_modules"
    npm install
    Write-Host "Dependencias reinstaladas" -ForegroundColor Green
}

# 4. Type check
Write-Host "Verificando tipos TypeScript..." -ForegroundColor White
try {
    npm run type-check
    Write-Host "Type check passou" -ForegroundColor Green
} catch {
    Write-Host "Type check falhou" -ForegroundColor Red
    Write-Host "Verifique os erros acima"
    exit 1
}

# 5. Build para producao
Write-Host "Fazendo build para producao..." -ForegroundColor White
try {
    npm run build
    Write-Host "Build concluido com sucesso" -ForegroundColor Green
} catch {
    Write-Host "Build falhou" -ForegroundColor Red
    Write-Host "Verifique os erros acima"
    exit 1
}

# 6. Verificar tamanho do bundle
Write-Host "Verificando tamanho do bundle..." -ForegroundColor White
if (Test-Path "dist\assets") {
    Write-Host ""
    Write-Host "Tamanho dos arquivos principais:" -ForegroundColor White
    Get-ChildItem "dist\assets\*.js" | Sort-Object Length -Descending | Select-Object -First 10 | ForEach-Object {
        $size = [math]::Round($_.Length / 1KB, 2)
        Write-Host "$size KB - $($_.Name)"
    }
    Write-Host ""
    
    # Verificar se vendor-react existe
    $vendorReact = Get-ChildItem "dist\assets\vendor-react-*.js" -ErrorAction SilentlyContinue
    if ($vendorReact) {
        $size = [math]::Round($vendorReact[0].Length / 1KB, 2)
        Write-Host "vendor-react.js encontrado: $size KB" -ForegroundColor Green
    } else {
        Write-Host "vendor-react.js nao encontrado" -ForegroundColor Yellow
    }
    
    # Verificar se vendor-radix NAO existe (deve estar consolidado)
    $vendorRadix = Get-ChildItem "dist\assets\vendor-radix-*.js" -ErrorAction SilentlyContinue
    if ($vendorRadix) {
        Write-Host "vendor-radix.js ainda existe! A consolidacao nao funcionou." -ForegroundColor Red
        exit 1
    } else {
        Write-Host "vendor-radix.js nao existe (consolidado corretamente)" -ForegroundColor Green
    }
}

# 7. Iniciar preview
Write-Host "Iniciando preview do build..." -ForegroundColor White
Write-Host "O servidor de preview sera iniciado na porta 4173" -ForegroundColor Yellow
Write-Host "Pressione Ctrl+C para parar o servidor" -ForegroundColor White
Write-Host ""
$startPreview = Read-Host "Deseja iniciar o preview agora? (Y/n)"
if ($startPreview -ne "n" -and $startPreview -ne "N") {
    npm run start
}

# 8. Deploy (opcional)
Write-Host ""
$deploy = Read-Host "Deseja fazer deploy para producao agora? (y/N)"
if ($deploy -eq "y" -or $deploy -eq "Y") {
    Write-Host "Fazendo deploy para Vercel..." -ForegroundColor White
    npm run vercel:deploy
    Write-Host "Deploy concluido!" -ForegroundColor Green
    Write-Host "Verifique o site em producao para confirmar que o erro foi corrigido" -ForegroundColor White
}

Write-Host "Processo concluido!" -ForegroundColor Green
Write-Host "Proximos passos:" -ForegroundColor White
Write-Host "1. Teste o preview local em http://localhost:4173" -ForegroundColor White
Write-Host "2. Verifique o console do navegador para erros" -ForegroundColor White
Write-Host "3. Teste componentes Radix UI (dialogs, dropdowns, etc.)" -ForegroundColor White
Write-Host "4. Faca deploy para producao quando estiver satisfeito" -ForegroundColor White
