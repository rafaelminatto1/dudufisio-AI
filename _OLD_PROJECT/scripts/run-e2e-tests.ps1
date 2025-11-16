# scripts/run-e2e-tests.ps1
# Script para executar testes E2E do fluxo de appointments

Write-Host "🧪 Iniciando testes E2E do DuduFisio-AI" -ForegroundColor Cyan
Write-Host ""

# Step 1: Verificar se o servidor está rodando
Write-Host "📋 Step 1: Verificando se servidor dev está rodando..." -ForegroundColor Yellow
$serverRunning = $false

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        $serverRunning = $true
        Write-Host "   ✅ Servidor dev está rodando em http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Servidor dev não está rodando" -ForegroundColor Red
}

if (-not $serverRunning) {
    Write-Host ""
    Write-Host "🚀 Iniciando servidor dev..." -ForegroundColor Yellow
    Write-Host "   Executando: npm run dev" -ForegroundColor Gray
    Write-Host ""

    # Iniciar servidor em background
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -NoNewWindow -PassThru | Out-Null

    Write-Host "   Aguardando servidor iniciar (15 segundos)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15

    # Verificar novamente
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Servidor iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erro ao iniciar servidor" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "   ⚠️  Servidor pode não ter iniciado corretamente" -ForegroundColor Yellow
        Write-Host "   Continuando com os testes..." -ForegroundColor Yellow
    }
}

Write-Host ""

# Step 2: Verificar variáveis de ambiente
Write-Host "📋 Step 2: Verificando variáveis de ambiente..." -ForegroundColor Yellow

$envFile = ".env.local"
if (Test-Path $envFile) {
    Write-Host "   ✅ Arquivo .env.local encontrado" -ForegroundColor Green

    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "SUPABASE_URL" -and $envContent -match "SUPABASE_ANON_KEY") {
        Write-Host "   ✅ Variáveis Supabase configuradas" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Variáveis Supabase não encontradas - testes usarão mock data" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ⚠️  Arquivo .env.local não encontrado" -ForegroundColor Yellow
    Write-Host "   Testes usarão mock data" -ForegroundColor Gray
}

Write-Host ""

# Step 3: Limpar resultados de testes anteriores
Write-Host "📋 Step 3: Limpando resultados de testes anteriores..." -ForegroundColor Yellow
if (Test-Path "test-results") {
    Remove-Item -Path "test-results" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Resultados anteriores removidos" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Nenhum resultado anterior encontrado" -ForegroundColor Gray
}

Write-Host ""

# Step 4: Executar testes Playwright
Write-Host "📋 Step 4: Executando testes Playwright..." -ForegroundColor Yellow
Write-Host "   Testes: appointment-flow.spec.ts" -ForegroundColor Gray
Write-Host ""

# Executar com timeout de 60 segundos
$testProcess = Start-Process -FilePath "npx" -ArgumentList "playwright", "test", "tests/e2e/appointment-flow.spec.ts", "--reporter=list" -NoNewWindow -PassThru -Wait -TimeoutSec 60

Write-Host ""

# Step 5: Verificar resultados
Write-Host "📋 Step 5: Verificando resultados..." -ForegroundColor Yellow

if (Test-Path "test-results") {
    $testFiles = Get-ChildItem -Path "test-results" -Recurse -File
    if ($testFiles.Count -gt 0) {
        Write-Host "   📊 Resultados salvos em test-results/" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "   Para ver relatório HTML, execute:" -ForegroundColor Gray
        Write-Host "   npx playwright show-report" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "✅ Testes E2E concluídos!" -ForegroundColor Green
Write-Host ""
Write-Host "📖 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Verificar logs acima para identificar falhas" -ForegroundColor Gray
Write-Host "   2. Executar 'npx playwright show-report' para ver relatório detalhado" -ForegroundColor Gray
Write-Host "   3. Corrigir bugs encontrados nos testes" -ForegroundColor Gray
Write-Host ""
