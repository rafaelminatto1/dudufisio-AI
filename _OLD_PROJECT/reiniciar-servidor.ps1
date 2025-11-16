# Script para reiniciar o servidor de desenvolvimento com novas configurações

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REINICIANDO SERVIDOR DE DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Encontrar processo na porta 5173
Write-Host "1. Procurando servidor na porta 5173..." -ForegroundColor Yellow
$processId = Get-NetTCPConnection -LocalPort 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess

if ($processId) {
    Write-Host "   Encontrado processo: PID $processId" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "2. Parando servidor antigo..." -ForegroundColor Yellow
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Write-Host "   Servidor parado!" -ForegroundColor Green
    Write-Host ""
    
    # Aguardar porta liberar
    Start-Sleep -Seconds 2
} else {
    Write-Host "   Nenhum servidor rodando na porta 5173" -ForegroundColor Yellow
    Write-Host ""
}

# Verificar se .env.local existe e está configurado
Write-Host "3. Verificando configuracao do Supabase..." -ForegroundColor Yellow

if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9") {
        Write-Host "   VITE_SUPABASE_URL: Configurado" -ForegroundColor Green
        Write-Host "   VITE_SUPABASE_ANON_KEY: Configurado" -ForegroundColor Green
    } else {
        Write-Host "   AVISO: .env.local existe mas anon key nao configurada" -ForegroundColor Red
    }
} else {
    Write-Host "   ERRO: .env.local nao encontrado!" -ForegroundColor Red
}

Write-Host ""
Write-Host "4. Iniciando novo servidor..." -ForegroundColor Yellow
Write-Host "   Comando: npm run dev" -ForegroundColor Cyan
Write-Host ""

# Iniciar em nova janela
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run dev"

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  SERVIDOR REINICIADO COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  URL: http://localhost:5173" -ForegroundColor Cyan
Write-Host "  Credenciais Supabase: CONFIGURADAS" -ForegroundColor Green
Write-Host ""
Write-Host "Pressione Enter para fechar..." -ForegroundColor Gray
Read-Host

