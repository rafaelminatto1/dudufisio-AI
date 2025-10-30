# Script para detectar qual porta o Vite está usando
# Uso: Script auxiliar para testes e2e

Write-Host "🔍 Detectando porta do servidor de desenvolvimento..." -ForegroundColor Cyan

$ports = @(5173, 5176, 5177, 5178, 5179, 5180)
$activePort = $null

foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $activePort = $port
            Write-Host "   ✅ Servidor encontrado na porta $port" -ForegroundColor Green
            break
        }
    } catch {
        # Porta não disponível, continuar
    }
}

if ($activePort) {
    Write-Host "   📍 Porta ativa: $activePort" -ForegroundColor Yellow
    Write-Output $activePort
} else {
    Write-Host "   ❌ Nenhum servidor encontrado nas portas verificadas" -ForegroundColor Red
    Write-Host "   Tentando portas: $($ports -join ', ')" -ForegroundColor Gray
    Write-Output ""
}

