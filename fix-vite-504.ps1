# 🔥 Fix Vite 504 - Outdated Optimize Dep
# Solução para erro 504 (Outdated Optimize Dep)

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host "🔥 CORRIGINDO ERRO 504 - OUTDATED OPTIMIZE DEP" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Red
Write-Host ""

# 1. Para TODOS os processos Node
Write-Host "1️⃣ Finalizando TODOS os processos Node..." -ForegroundColor Cyan
try {
    Get-Process node -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "   ✅ Processos Node finalizados" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️ Nenhum processo Node encontrado" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 2. Limpa cache do Vite (COMPLETO)
Write-Host ""
Write-Host "2️⃣ Limpando cache do Vite (COMPLETO)..." -ForegroundColor Cyan

$pathsToClean = @(
    "node_modules\.vite",
    "node_modules\.cache",
    ".vite",
    "dist"
)

foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Removido: $path" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️ Não encontrado: $path" -ForegroundColor Gray
    }
}

# 3. Limpa cache do navegador programaticamente
Write-Host ""
Write-Host "3️⃣ Preparando limpeza do Service Worker..." -ForegroundColor Cyan
Write-Host "   ⚠️ Você precisará abrir: desabilitar-service-worker.html" -ForegroundColor Yellow

# 4. Força reinstalação das dependências
Write-Host ""
Write-Host "4️⃣ Verificando dependências..." -ForegroundColor Cyan
Write-Host "   ℹ️ Se o problema persistir, execute: npm ci" -ForegroundColor Gray

# 5. Inicia com flag de limpeza FORÇADA
Write-Host ""
Write-Host "5️⃣ Iniciando servidor com cache LIMPO..." -ForegroundColor Cyan
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host "🚀 SERVIDOR INICIANDO (com --force)..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Aguarde... O Vite vai reconstruir TODAS as dependências" -ForegroundColor Yellow
Write-Host "   Isso pode levar 1-2 minutos na primeira vez" -ForegroundColor Yellow
Write-Host ""

# Inicia com --force para forçar reconstrução
npm run dev -- --force --clearScreen false

