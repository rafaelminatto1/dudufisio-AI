# Script para aplicar migration via psql
# MoocaFisio - App para Pacientes

$projectRef = "urfxniitfbbvsaskicfo"
$password = "cFfS1GEwkj2fOAE2"
$region = "sa-east-1"

$connectionString = "postgresql://postgres.${projectRef}:${password}@aws-0-${region}.pooler.supabase.com:6543/postgres"

Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  Aplicando Migration via psql          " -ForegroundColor Cyan
Write-Host "════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Verificar se psql está instalado
$psqlExists = Get-Command psql -ErrorAction SilentlyContinue

if (-Not $psqlExists) {
    Write-Host "❌ psql não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "SOLUÇÃO: Use o Dashboard do Supabase" -ForegroundColor Yellow
    Write-Host "  1. https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  2. SQL Editor" -ForegroundColor White
    Write-Host "  3. Ctrl+V (SQL já no clipboard!)" -ForegroundColor White
    Write-Host "  4. RUN" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ psql encontrado!" -ForegroundColor Green
Write-Host ""
Write-Host "Aplicando migration..." -ForegroundColor Yellow

# Aplicar migration
psql $connectionString -f "supabase\migrations\20251106120000_patient_app_complete.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Migration aplicada com SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "  1. npm run seed:patient" -ForegroundColor White
    Write-Host "  2. npm run start:patient-app" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Erro ao aplicar migration" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente via Dashboard:" -ForegroundColor Yellow
    Write-Host "  https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "  SQL já está no clipboard! Ctrl+V → RUN" -ForegroundColor Cyan
    Write-Host ""
}

