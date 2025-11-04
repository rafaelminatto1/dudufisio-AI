# Script PowerShell para executar seed + testes E2E
# MoocaFisio - Testes E2E com Dados de Teste

Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "║     🧪 EXECUTAR TESTES E2E COM SEED - MOOCAFISIO 🧪      ║" -ForegroundColor Cyan
Write-Host "║                                                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Verificar se o servidor está rodando
Write-Host "🔍 Verificando servidor..." -ForegroundColor Yellow
$serverRunning = $false
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 2 -ErrorAction SilentlyContinue
    $serverRunning = $true
    Write-Host "✅ Servidor está rodando na porta 5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Servidor NÃO está rodando" -ForegroundColor Red
    Write-Host "   Execute em outro terminal: npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Executar validação do ambiente
Write-Host "🔍 Validando ambiente E2E..." -ForegroundColor Yellow
npm run test:e2e:validate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Validação do ambiente falhou" -ForegroundColor Red
    Write-Host "   Corrija os problemas antes de continuar" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Executar seed de dados
Write-Host "🌱 Executando seed de dados de teste..." -ForegroundColor Yellow
$cleanSeed = Read-Host "Deseja limpar dados antigos antes? (S/n)"
if ($cleanSeed -eq "" -or $cleanSeed -eq "S" -or $cleanSeed -eq "s") {
    npm run test:e2e:seed:clean
} else {
    npm run test:e2e:seed
}

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Seed teve alguns problemas, mas continuando..." -ForegroundColor Yellow
}

Write-Host ""

# Escolher modo de execução
Write-Host "🧪 Como deseja executar os testes?" -ForegroundColor Cyan
Write-Host "   1. Interface UI (Recomendado)" -ForegroundColor White
Write-Host "   2. Modo headless (rápido)" -ForegroundColor White
Write-Host "   3. Modo headed (ver execução)" -ForegroundColor White
Write-Host "   4. Apenas relatório anterior" -ForegroundColor White
$choice = Read-Host "Escolha (1-4)"

Write-Host ""

switch ($choice) {
    "1" {
        Write-Host "🚀 Abrindo interface UI do Playwright..." -ForegroundColor Green
        npm run test:e2e:ui
    }
    "2" {
        Write-Host "⚡ Executando testes em modo headless..." -ForegroundColor Green
        npm run test:e2e:direct
    }
    "3" {
        Write-Host "👀 Executando testes em modo headed..." -ForegroundColor Green
        npm run test:e2e:headed
    }
    "4" {
        Write-Host "📊 Abrindo relatório anterior..." -ForegroundColor Green
        npm run test:report
    }
    default {
        Write-Host "❌ Opção inválida" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Perguntar se deseja ver relatório
if ($choice -ne "4" -and $choice -ne "1") {
    $showReport = Read-Host "Deseja ver o relatório HTML? (S/n)"
    if ($showReport -eq "" -or $showReport -eq "S" -or $showReport -eq "s") {
        npm run test:report
    }
}

Write-Host ""
Write-Host "✅ Concluído!" -ForegroundColor Green
Write-Host ""

