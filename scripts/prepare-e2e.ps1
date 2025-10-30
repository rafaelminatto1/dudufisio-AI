# Script para preparar ambiente para testes E2E
# Detecta a porta ativa e configura o Playwright

Write-Host "🧪 Preparando ambiente para testes E2E" -ForegroundColor Cyan
Write-Host ""

# Step 1: Detectar porta ativa
Write-Host "📋 Step 1: Detectando porta do servidor..." -ForegroundColor Yellow
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

if (-not $activePort) {
    Write-Host "   ⚠️  Nenhum servidor rodando nas portas: $($ports -join ', ')" -ForegroundColor Yellow
    Write-Host "   🚀 Iniciando servidor na porta padrão 5173..." -ForegroundColor Cyan
    
    # Tentar iniciar servidor
    Start-Process -FilePath "npm" -ArgumentList "run", "dev:skip-check" -NoNewWindow
    
    Write-Host "   ⏳ Aguardando servidor iniciar..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    # Verificar novamente
    foreach ($port in $ports) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $activePort = $port
                Write-Host "   ✅ Servidor iniciado na porta $port" -ForegroundColor Green
                break
            }
        } catch {
            # Continuar tentando
        }
    }
}

if ($activePort) {
    Write-Host ""
    Write-Host "✅ Ambiente preparado! Porta: $activePort" -ForegroundColor Green
    Write-Output $activePort
} else {
    Write-Host ""
    Write-Host "❌ Erro: Não foi possível iniciar o servidor" -ForegroundColor Red
    exit 1
}

