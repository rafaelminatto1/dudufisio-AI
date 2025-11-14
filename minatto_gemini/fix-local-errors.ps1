#!/usr/bin/env pwsh

# Script de Diagnóstico e Correção Rápida
# Autor: Claude Code
# Data: 2025-11-14

Write-Host ""
Write-Host "🔧 DIAGNÓSTICO E CORREÇÃO DE ERROS LOCAIS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar portas
function Test-Port {
    param($Port)
    $connections = netstat -ano | Select-String ":$Port"
    return $null -ne $connections
}

# 1. Verificar servidores rodando
Write-Host "📊 Verificando servidores em execução..." -ForegroundColor Yellow
Write-Host ""

$ports = @{
    5173 = "Host (Principal)"
    5174 = "Agenda-Pacientes"
    5175 = "Tratamentos"
    5176 = "Financeiro"
    5177 = "Patient-Portal"
}

$runningCount = 0
$missingPorts = @()

foreach ($port in $ports.Keys) {
    $isRunning = Test-Port -Port $port
    if ($isRunning) {
        Write-Host "  ✅ Porta $port ($($ports[$port])) - RODANDO" -ForegroundColor Green
        $runningCount++
    } else {
        Write-Host "  ❌ Porta $port ($($ports[$port])) - NÃO RODANDO" -ForegroundColor Red
        $missingPorts += $port
    }
}

Write-Host ""
Write-Host "Total de servidores rodando: $runningCount de 5" -ForegroundColor $(if ($runningCount -eq 5) { "Green" } else { "Yellow" })
Write-Host ""

# 2. Diagnóstico
if ($runningCount -eq 0) {
    Write-Host "⚠️  PROBLEMA DETECTADO: Nenhum servidor está rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📋 SOLUÇÃO:" -ForegroundColor Yellow
    Write-Host "   Execute: npm run dev" -ForegroundColor White
    Write-Host ""

    $response = Read-Host "Deseja iniciar todos os servidores agora? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host ""
        Write-Host "🚀 Iniciando todos os servidores..." -ForegroundColor Green
        Write-Host ""
        npm run dev
        exit 0
    }
}
elseif ($runningCount -lt 5) {
    Write-Host "⚠️  PROBLEMA DETECTADO: Alguns servidores não estão rodando!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Servidores faltando:" -ForegroundColor Yellow
    foreach ($port in $missingPorts) {
        Write-Host "  - Porta $port ($($ports[$port]))" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "📋 SOLUÇÃO:" -ForegroundColor Yellow
    Write-Host "   1. Feche todos os servidores (Ctrl + C)" -ForegroundColor White
    Write-Host "   2. Execute: npm run kill:dev-ports" -ForegroundColor White
    Write-Host "   3. Execute: npm run dev" -ForegroundColor White
    Write-Host ""

    $response = Read-Host "Deseja matar processos e reiniciar? (S/N)"
    if ($response -eq "S" -or $response -eq "s") {
        Write-Host ""
        Write-Host "🔪 Matando processos nas portas..." -ForegroundColor Yellow
        npm run kill:dev-ports
        Start-Sleep -Seconds 2

        Write-Host ""
        Write-Host "🚀 Iniciando todos os servidores..." -ForegroundColor Green
        Write-Host ""
        npm run dev
        exit 0
    }
}
else {
    Write-Host "✅ TUDO OK: Todos os 5 servidores estão rodando!" -ForegroundColor Green
    Write-Host ""
}

# 3. Verificar cache do navegador
Write-Host ""
Write-Host "📋 CHECKLIST ADICIONAL:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [ ] Limpar cache do navegador (Ctrl + Shift + Del)" -ForegroundColor White
Write-Host "  [ ] Fazer Hard Refresh (Ctrl + F5)" -ForegroundColor White
Write-Host "  [ ] Limpar cache do Vite: rmdir /s /q node_modules\.vite" -ForegroundColor White
Write-Host "  [ ] Testar em modo anônimo (Ctrl + Shift + N)" -ForegroundColor White
Write-Host ""

# 4. Testar conectividade
if ($runningCount -eq 5) {
    Write-Host "🔍 Testando conectividade..." -ForegroundColor Yellow
    Write-Host ""

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  ✅ Host (5173) - ACESSÍVEL" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Host (5173) - NÃO ACESSÍVEL" -ForegroundColor Red
    }

    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5174" -Method Head -TimeoutSec 2 -ErrorAction Stop
        Write-Host "  ✅ Agenda (5174) - ACESSÍVEL" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Agenda (5174) - NÃO ACESSÍVEL" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📚 Para mais detalhes, consulte:" -ForegroundColor Cyan
Write-Host "   minatto_gemini/SOLUCAO_ERROS_LOCAIS.md" -ForegroundColor White
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
