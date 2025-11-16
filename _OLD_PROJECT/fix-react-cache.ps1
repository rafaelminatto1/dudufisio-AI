#!/usr/bin/env pwsh
# Script de Correcao: React Hooks Error
# Limpa cache do Vite para resolver problemas de "Invalid Hook Call"

Write-Host "Iniciando limpeza de cache do React/Vite..." -ForegroundColor Cyan
Write-Host ""

# Funcao para remover diretorio com feedback
function Remove-DirectoryIfExists {
    param([string]$Path, [string]$Name)
    
    if (Test-Path $Path) {
        Write-Host "  Removendo $Name..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force $Path -ErrorAction SilentlyContinue
        Write-Host "  $Name removido com sucesso!" -ForegroundColor Green
    } else {
        Write-Host "  $Name nao encontrado (ok)" -ForegroundColor Gray
    }
}

# Limpar cache do Vite
Write-Host "Limpando cache do Vite..." -ForegroundColor Cyan
Remove-DirectoryIfExists "node_modules\.vite" "Cache do Vite (node_modules\.vite)"

# Limpar build anterior
Write-Host ""
Write-Host "Limpando build anterior..." -ForegroundColor Cyan
Remove-DirectoryIfExists "dist" "Build anterior (dist)"

Write-Host ""
Write-Host "Limpeza concluida com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Execute: npm run dev" -ForegroundColor White
Write-Host "  2. Aguarde o Vite re-otimizar as dependencias" -ForegroundColor White
Write-Host "  3. Acesse o sistema e faca login" -ForegroundColor White
Write-Host "  4. Verifique se nao ha erros de hooks no console" -ForegroundColor White
Write-Host ""
