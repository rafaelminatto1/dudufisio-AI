# Script PowerShell para executar migrations do Supabase
# Uso: .\scripts\run-migrations.ps1

Write-Host "🚀 Executando migrations do Supabase..." -ForegroundColor Cyan

# Verifica se supabase CLI está instalado
try {
    $null = Get-Command supabase -ErrorAction Stop
} catch {
    Write-Host "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase" -ForegroundColor Red
    exit 1
}

# Executa migrations
Write-Host "📦 Executando supabase db push..." -ForegroundColor Yellow
supabase db push

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Migrations executadas com sucesso!" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao executar migrations" -ForegroundColor Red
    exit 1
}

