# Script para iniciar o servidor de desenvolvimento limpando a porta
# Uso: npm run dev:clean

Write-Host "[CHECK] Verificando processos na porta 5176..." -ForegroundColor Cyan

# Encontrar processos usando a porta 5176
$processes = Get-NetTCPConnection -LocalPort 5176 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "[WARN] Encontrado(s) processo(s) usando a porta 5176" -ForegroundColor Yellow
    
    foreach ($pid in $processes) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "   [KILL] Matando processo: $($process.ProcessName) (PID: $pid)" -ForegroundColor Red
            Stop-Process -Id $pid -Force
        }
    }
    
    Write-Host "[SUCCESS] Porta 5176 liberada!" -ForegroundColor Green
    Start-Sleep -Seconds 1
} else {
    Write-Host "[OK] Porta 5176 ja esta livre" -ForegroundColor Green
}

Write-Host "`n[START] Iniciando servidor de desenvolvimento...`n" -ForegroundColor Cyan

# Iniciar o servidor
npm run dev:skip-check

