# 🔥 FIX COMPLETO - DuduFisio-AI
# Solução definitiva para todos os erros de cache e WebSocket

param(
    [switch]$Full,
    [switch]$SkipInstall
)

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   🔥 FIX COMPLETO - DUDUFISIO-AI              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$startTime = Get-Date

# ═══════════════════════════════════════════════════════════
# PASSO 1: Finalizar processos
# ═══════════════════════════════════════════════════════════
Write-Host "┌────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ 1️⃣  FINALIZANDO PROCESSOS                      │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

# Para processos Node
$nodeProcesses = Get-Process node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✅ $($nodeProcesses.Count) processo(s) Node finalizados" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Nenhum processo Node ativo" -ForegroundColor Gray
}

# Para processos na porta 5175
try {
    $portProcesses = Get-NetTCPConnection -LocalPort 5175 -ErrorAction SilentlyContinue | 
                     Select-Object -ExpandProperty OwningProcess -Unique
    
    if ($portProcesses) {
        foreach ($pid in $portProcesses) {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        }
        Write-Host "   ✅ Porta 5175 liberada" -ForegroundColor Green
    }
} catch {
    Write-Host "   ℹ️  Porta 5175 já livre" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# ═══════════════════════════════════════════════════════════
# PASSO 2: Limpar cache
# ═══════════════════════════════════════════════════════════
Write-Host ""
Write-Host "┌────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ 2️⃣  LIMPANDO CACHE                             │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

$pathsToClean = @(
    @{Path = "node_modules\.vite"; Name = "Cache do Vite"},
    @{Path = "node_modules\.cache"; Name = "Cache do Node"},
    @{Path = ".vite"; Name = "Cache raiz do Vite"},
    @{Path = "dist"; Name = "Build anterior"},
    @{Path = ".next"; Name = "Cache Next.js (se existir)"},
    @{Path = "tsconfig.tsbuildinfo"; Name = "Cache TypeScript"}
)

foreach ($item in $pathsToClean) {
    if (Test-Path $item.Path) {
        try {
            Remove-Item $item.Path -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ $($item.Name) removido" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erro ao remover $($item.Name)" -ForegroundColor Red
        }
    } else {
        Write-Host "   ℹ️  $($item.Name) não encontrado" -ForegroundColor Gray
    }
}

# ═══════════════════════════════════════════════════════════
# PASSO 3: Reinstalar dependências (se --Full)
# ═══════════════════════════════════════════════════════════
if ($Full -and -not $SkipInstall) {
    Write-Host ""
    Write-Host "┌────────────────────────────────────────────────┐" -ForegroundColor Yellow
    Write-Host "│ 3️⃣  REINSTALANDO DEPENDÊNCIAS (--Full)         │" -ForegroundColor Yellow
    Write-Host "└────────────────────────────────────────────────┘" -ForegroundColor Yellow
    Write-Host ""
    
    Write-Host "   🔄 Executando npm ci..." -ForegroundColor Cyan
    npm ci
    
    Write-Host "   ✅ Dependências reinstaladas" -ForegroundColor Green
}

# ═══════════════════════════════════════════════════════════
# PASSO 4: Instruções para Service Worker
# ═══════════════════════════════════════════════════════════
Write-Host ""
Write-Host "┌────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ 4️⃣  SERVICE WORKER                             │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""
Write-Host "   ⚠️  IMPORTANTE: Após o servidor iniciar:" -ForegroundColor Yellow
Write-Host "   1. Abra: desabilitar-service-worker.html" -ForegroundColor White
Write-Host "   2. Clique no botão" -ForegroundColor White
Write-Host "   3. Recarregue com Ctrl+F5" -ForegroundColor White
Write-Host ""

# ═══════════════════════════════════════════════════════════
# PASSO 5: Verificar package.json
# ═══════════════════════════════════════════════════════════
Write-Host ""
Write-Host "┌────────────────────────────────────────────────┐" -ForegroundColor Yellow
Write-Host "│ 5️⃣  VERIFICANDO CONFIGURAÇÃO                   │" -ForegroundColor Yellow
Write-Host "└────────────────────────────────────────────────┘" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "package.json") {
    Write-Host "   ✅ package.json encontrado" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ node_modules não encontrado" -ForegroundColor Red
        Write-Host "   📝 Execute: npm install" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ package.json não encontrado!" -ForegroundColor Red
    exit 1
}

# ═══════════════════════════════════════════════════════════
# PASSO 6: Iniciar servidor
# ═══════════════════════════════════════════════════════════
$elapsed = (Get-Date) - $startTime
Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   ✅ LIMPEZA COMPLETA                          ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "⏱️  Tempo decorrido: $([math]::Round($elapsed.TotalSeconds, 2)) segundos" -ForegroundColor Cyan
Write-Host ""
Write-Host "┌────────────────────────────────────────────────┐" -ForegroundColor Green
Write-Host "│ 6️⃣  INICIANDO SERVIDOR                         │" -ForegroundColor Green
Write-Host "└────────────────────────────────────────────────┘" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Servidor iniciando com --force..." -ForegroundColor Cyan
Write-Host "⏳ Primeira inicialização pode levar 1-2 minutos" -ForegroundColor Yellow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

# Inicia com --force
npm run dev -- --force --clearScreen false

