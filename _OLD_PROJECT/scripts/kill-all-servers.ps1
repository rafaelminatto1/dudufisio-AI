# Script para matar todos os servidores de desenvolvimento
# Uso: npm run kill:servers

Write-Host "[STOP] Matando todos os servidores de desenvolvimento..." -ForegroundColor Red
Write-Host ""

# Matar processos Node.js relacionados ao Vite
Write-Host "[SEARCH] Procurando processos Node.js..." -ForegroundColor Cyan
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue

if ($nodeProcesses) {
    Write-Host "   Encontrado(s) $($nodeProcesses.Count) processo(s) Node.js" -ForegroundColor Yellow
    
    foreach ($proc in $nodeProcesses) {
        Write-Host "   [KILL] Matando: node (PID: $($proc.Id))" -ForegroundColor Red
        Stop-Process -Id $proc.Id -Force
    }
} else {
    Write-Host "   [OK] Nenhum processo Node.js encontrado" -ForegroundColor Green
}

# Matar processos em portas comuns do Vite
$ports = @(5176, 5177, 5178, 5179, 5180, 3000, 3001, 3002, 4173, 4174)

Write-Host ""
Write-Host "[SEARCH] Verificando portas..." -ForegroundColor Cyan

foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($connections) {
        foreach ($pid in $connections) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   [KILL] Matando processo na porta $port : $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
                Stop-Process -Id $pid -Force
            }
        }
    }
}

Write-Host ""
Write-Host "[SUCCESS] Todos os servidores foram finalizados!" -ForegroundColor Green
Write-Host ""

