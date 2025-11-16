#!/usr/bin/env pwsh

Write-Host "🚀 Executando teste automatizado com Playwright..." -ForegroundColor Cyan
Write-Host ""

# Verifica se o servidor está rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method Head -TimeoutSec 2 -ErrorAction Stop
    Write-Host "✓ Servidor detectado em http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Servidor não está rodando em http://localhost:5173" -ForegroundColor Yellow
    Write-Host "   Por favor, inicie o servidor com: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Compila e executa o teste
Write-Host ""
Write-Host "Executando teste..." -ForegroundColor Cyan
npx tsx minatto_gemini/automated-test.ts
