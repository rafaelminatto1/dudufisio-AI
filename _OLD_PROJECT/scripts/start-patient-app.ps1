# Script para Iniciar App de Pacientes
# MoocaFisio - Start Patient App

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MOOCAFISIO - App para Pacientes      " -ForegroundColor Cyan
Write-Host "  Iniciando Sistema Completo           " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se as migrations foram aplicadas
Write-Host "Verificando configuracao..." -ForegroundColor Yellow

# Verificar .env.local
if (-Not (Test-Path ".env.local")) {
    Write-Host "X Arquivo .env.local nao encontrado!" -ForegroundColor Red
    Write-Host "  Execute: npm run setup" -ForegroundColor Yellow
    exit 1
}

# Verificar se PATIENT_JWT_SECRET existe
$envContent = Get-Content ".env.local" -Raw
if (-Not ($envContent -match "PATIENT_JWT_SECRET")) {
    Write-Host "X PATIENT_JWT_SECRET nao configurado!" -ForegroundColor Red
    Write-Host "  Adicionando agora..." -ForegroundColor Yellow
    Add-Content -Path ".env.local" -Value "PATIENT_JWT_SECRET=moocafisio-patient-secret-change-in-production-2025"
}

Write-Host "[OK] Configuracao verificada!" -ForegroundColor Green
Write-Host ""

# Matar processos nas portas se existirem
Write-Host "Liberando portas..." -ForegroundColor Yellow
$ports = @(5173, 5174, 5175, 5176, 5177)

foreach ($port in $ports) {
    $process = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "  Liberando porta $port..." -ForegroundColor Gray
        taskkill /F /PID $process.OwningProcess 2>&1 | Out-Null
    }
}

Write-Host "[OK] Portas liberadas!" -ForegroundColor Green
Write-Host ""

# Iniciar servidores
Write-Host "Iniciando servidores..." -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Host (porta 5173)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\host'; Write-Host 'HOST - Porta 5173' -ForegroundColor Cyan; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 2

Write-Host "2. Agenda (porta 5174)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\agenda-pacientes'; Write-Host 'AGENDA - Porta 5174' -ForegroundColor Cyan; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 1

Write-Host "3. Tratamentos (porta 5175)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\tratamentos'; Write-Host 'TRATAMENTOS - Porta 5175' -ForegroundColor Cyan; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 1

Write-Host "4. Financeiro (porta 5176)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\financeiro'; Write-Host 'FINANCEIRO - Porta 5176' -ForegroundColor Cyan; npm run dev" -WindowStyle Minimized

Start-Sleep -Seconds 1

Write-Host "5. Patient Portal (porta 5177)..." -ForegroundColor White
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\packages\patient-portal'; Write-Host 'PATIENT PORTAL - Porta 5177' -ForegroundColor Cyan; npm run dev" -WindowStyle Minimized

Write-Host ""
Write-Host "[OK] Todos os servidores iniciados!" -ForegroundColor Green
Write-Host ""

# Aguardar servidores iniciarem
Write-Host "Aguardando servidores iniciarem..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verificar portas
Write-Host ""
Write-Host "Verificando portas..." -ForegroundColor Yellow
$allRunning = $true

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if ($connection) {
        Write-Host "  [OK] Porta $port: ATIVA" -ForegroundColor Green
    } else {
        Write-Host "  [X] Porta $port: INATIVA" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

if ($allRunning) {
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "  SISTEMA INICIADO COM SUCESSO!        " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
} else {
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host "  ALGUNS SERVIDORES NAO INICIARAM      " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "URLs DISPONIVEIS:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Fisioterapeuta:" -ForegroundColor White
Write-Host "  http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
Write-Host "  App Paciente:" -ForegroundColor White
Write-Host "  http://localhost:5173/patient/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pressione qualquer tecla para abrir no navegador..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Abrir navegador
Start-Process "http://localhost:5173/patient/login"

Write-Host ""
Write-Host "Navegador aberto! Bom teste!" -ForegroundColor Green
Write-Host ""

