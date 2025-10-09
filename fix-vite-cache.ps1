# Script para limpar cache do Vite e reiniciar
Write-Host "🔧 Limpando cache do Vite..." -ForegroundColor Yellow

# Parar todos os processos node
Write-Host "Parando processos Node.js..." -ForegroundColor Cyan
taskkill /F /IM node.exe 2>$null

# Aguardar
Start-Sleep -Seconds 2

# Limpar cache do Vite
Write-Host "Removendo cache .vite..." -ForegroundColor Cyan
if (Test-Path "node_modules\.vite") {
    Remove-Item -Path "node_modules\.vite" -Recurse -Force
    Write-Host "✅ Cache removido" -ForegroundColor Green
}

# Aguardar
Start-Sleep -Seconds 1

# Reiniciar servidor
Write-Host "Iniciando servidor..." -ForegroundColor Green
npm run dev
