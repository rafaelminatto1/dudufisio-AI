# =====================================================
# Script: Adicionar Analytics ao App.tsx
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "📊 Adicionando Vercel Analytics e Speed Insights ao App.tsx..." -ForegroundColor Cyan
Write-Host ""

# Verificar se App.tsx existe
if (-not (Test-Path "App.tsx")) {
    Write-Host "❌ Arquivo App.tsx não encontrado!" -ForegroundColor Red
    Write-Host "   Execute este script na raiz do projeto." -ForegroundColor Yellow
    exit 1
}

# Ler conteúdo atual
$appContent = Get-Content "App.tsx" -Raw

# Verificar se já tem os imports
if ($appContent -match "@vercel/analytics") {
    Write-Host "✅ Analytics já estão configurados no App.tsx!" -ForegroundColor Green
    exit 0
}

Write-Host "   Adicionando imports..." -ForegroundColor Gray

# Adicionar imports após os imports existentes
$importToAdd = @"
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
"@

# Encontrar a última linha de import
$lines = $appContent -split "`n"
$lastImportIndex = 0

for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "^import ") {
        $lastImportIndex = $i
    }
}

# Inserir imports
$lines = $lines[0..$lastImportIndex] + $importToAdd.Split("`n") + $lines[($lastImportIndex + 1)..($lines.Length - 1)]

# Adicionar componentes antes do último </> ou </div> do return
$newContent = $lines -join "`n"

# Procurar pelo return final e adicionar componentes
if ($newContent -match "(return\s*\(\s*(?:<>|<\w+[^>]*>)[\s\S]*?)((?:</>|</\w+>)\s*\);?\s*}?\s*$)") {
    $before = $matches[1]
    $after = $matches[2]
    
    $componentsToAdd = @"

      {/* Vercel Analytics e Speed Insights */}
      <Analytics />
      <SpeedInsights />
"@
    
    $newContent = $before + $componentsToAdd + "`n      " + $after
}

# Salvar arquivo
Set-Content -Path "App.tsx" -Value $newContent

Write-Host "✅ Analytics adicionados com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Próximo passo:" -ForegroundColor Yellow
Write-Host "   1. Revisar App.tsx para garantir que está correto" -ForegroundColor White
Write-Host "   2. Fazer commit das mudanças" -ForegroundColor White
Write-Host "   3. Deploy: vercel --prod" -ForegroundColor Cyan
Write-Host ""

