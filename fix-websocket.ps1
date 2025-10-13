# 🔧 Fix WebSocket - DuduFisio-AI
# Este script limpa cache e reinicia o servidor corretamente

Write-Host "🧹 Limpando cache e corrigindo WebSocket..." -ForegroundColor Cyan
Write-Host ""

# 1. Para processos Node existentes na porta 5175
Write-Host "1️⃣ Parando processos na porta 5175..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue | 
             Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    foreach ($proc in $processes) {
        try {
            Stop-Process -Id $proc -Force -ErrorAction SilentlyContinue
            Write-Host "   ✅ Processo $proc finalizado" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ Não foi possível finalizar processo $proc" -ForegroundColor Red
        }
    }
} else {
    Write-Host "   ℹ️ Nenhum processo encontrado na porta 5175" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# 2. Limpa cache do Node
Write-Host ""
Write-Host "2️⃣ Limpando cache do Node..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item "node_modules/.vite" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Vite removido" -ForegroundColor Green
} else {
    Write-Host "   ℹ️ Cache do Vite não encontrado" -ForegroundColor Gray
}

if (Test-Path "node_modules/.cache") {
    Remove-Item "node_modules/.cache" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Node removido" -ForegroundColor Green
}

# 3. Limpa dist
Write-Host ""
Write-Host "3️⃣ Limpando build anterior..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item "dist" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Pasta dist removida" -ForegroundColor Green
}

# 4. Reinicia o servidor
Write-Host ""
Write-Host "4️⃣ Iniciando servidor de desenvolvimento..." -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 Servidor iniciando na porta 5175..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Inicia o servidor
npm run dev

