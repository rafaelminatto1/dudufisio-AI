# Script para matar APENAS processos Node.js
# Uso: npm run kill:node

Write-Host "[STOP] Matando todos os processos Node.js..." -ForegroundColor Red
Write-Host ""

$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "   Encontrado(s) $($nodeProcesses.Count) processo(s) Node.js" -ForegroundColor Yellow
    
    foreach ($proc in $nodeProcesses) {
        Write-Host "   [KILL] Matando: node (PID: $($proc.Id))" -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force
    }
    
    Write-Host ""
    Write-Host "[SUCCESS] Todos os processos Node.js foram finalizados!" -ForegroundColor Green
} else {
    Write-Host "   [OK] Nenhum processo Node.js encontrado" -ForegroundColor Green
}

Write-Host ""

