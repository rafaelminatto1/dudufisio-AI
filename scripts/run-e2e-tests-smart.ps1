# Script inteligente para executar testes E2E
# Detecta automaticamente qual porta o servidor esta usando

Write-Host "Preparando testes E2E com deteccao automatica de porta" -ForegroundColor Cyan
Write-Host ""

# Step 1: Detectar porta ativa
Write-Host "Detectando porta do servidor de desenvolvimento..." -ForegroundColor Yellow
$ports = @(5173, 5176, 5177, 5178, 5179, 5180)
$activePort = $null

foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$port" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $activePort = $port
            Write-Host "   Servidor encontrado na porta $port" -ForegroundColor Green
            break
        }
    } catch {
        # Porta nao disponivel, continuar
    }
}

if (-not $activePort) {
    Write-Host "   Nenhum servidor rodando" -ForegroundColor Yellow
    Write-Host "   O Playwright iniciara o servidor automaticamente na porta 5173" -ForegroundColor Cyan
    $activePort = 5173
} else {
    Write-Host "   Usando servidor na porta $activePort" -ForegroundColor Green
}

Write-Host ""

# Step 2: Executar testes com a porta detectada
Write-Host "Executando testes E2E..." -ForegroundColor Cyan
Write-Host ""

$env:PLAYWRIGHT_BASE_URL = "http://localhost:$activePort"
$env:PLAYWRIGHT_SERVER_URL = "http://localhost:$activePort"

# Executar os testes
npx playwright test tests/e2e/appointment-flow.spec.ts --project=chromium

# Mostrar resultado
Write-Host ""
Write-Host "Testes concluidos!" -ForegroundColor Green
Write-Host ""
Write-Host "Para ver o relatorio detalhado, execute:" -ForegroundColor Cyan
Write-Host "   npx playwright show-report" -ForegroundColor White
Write-Host ""
