# Script para corrigir multiplas instancias do React
# Este script resolve o erro "Cannot read properties of null (reading 'useState')"

Write-Host "Corrigindo multiplas instancias do React..." -ForegroundColor Cyan
Write-Host ""

# 1. Parar qualquer processo do Vite em execucao
Write-Host "1. Parando processos do Vite..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*vite*"
} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# 2. Limpar cache do Vite
Write-Host "2. Limpando cache do Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK - Cache do Vite removido" -ForegroundColor Green
}

# 3. Limpar cache do npm
Write-Host "3. Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "   OK - Cache do npm limpo" -ForegroundColor Green

# 4. Remover node_modules e package-lock
Write-Host "4. Removendo node_modules..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   OK - node_modules removido" -ForegroundColor Green
}

if (Test-Path "package-lock.json") {
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "   OK - package-lock.json removido" -ForegroundColor Green
}

# 5. Reinstalar dependencias
Write-Host "5. Reinstalando dependencias..." -ForegroundColor Yellow
npm install --legacy-peer-deps
Write-Host "   OK - Dependencias instaladas" -ForegroundColor Green

# 6. Deduplicar pacotes
Write-Host "6. Deduplicando pacotes React..." -ForegroundColor Yellow
npm dedupe
Write-Host "   OK - Deduplicacao concluida" -ForegroundColor Green

# 7. Verificar versoes do React
Write-Host ""
Write-Host "7. Verificando versoes do React instaladas:" -ForegroundColor Yellow
npm list react react-dom --depth=0
Write-Host ""

Write-Host "Correcao concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Agora execute: npm run dev" -ForegroundColor Cyan
Write-Host ""
