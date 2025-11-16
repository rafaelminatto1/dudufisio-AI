# Script PowerShell para aplicar população do sistema
# Usa psql para conectar diretamente ao Supabase

$DB_PASSWORD = "cFfS1GEwkj2fOAE2"
$DB_HOST = "db.urfxniitfbbvsaskicfo.supabase.co"
$DB_PORT = "5432"
$DB_NAME = "postgres"
$DB_USER = "postgres"
$SQL_FILE = "🎲_POPULAR_SISTEMA_COMPLETO.sql"

Write-Host ""
Write-Host "🚀 Aplicando população do sistema..." -ForegroundColor Cyan
Write-Host ""

# Verificar se psql está instalado
$psqlPath = Get-Command psql -ErrorAction SilentlyContinue

if (-not $psqlPath) {
    Write-Host "❌ psql não está instalado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Soluções:" -ForegroundColor Yellow
    Write-Host "   1. Instale PostgreSQL: https://www.postgresql.org/download/windows/" -ForegroundColor White
    Write-Host "   2. OU use o Supabase Dashboard (copie e cole o SQL)" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 Arquivo SQL: $SQL_FILE" -ForegroundColor Cyan
    Write-Host ""
    exit 1
}

# Montar string de conexão
$env:PGPASSWORD = $DB_PASSWORD

Write-Host "🔗 Conectando ao banco..." -ForegroundColor Yellow
Write-Host "   Host: $DB_HOST" -ForegroundColor Gray
Write-Host "   Database: $DB_NAME" -ForegroundColor Gray
Write-Host ""

# Executar SQL
$command = "psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f `"$SQL_FILE`""

Write-Host "⚡ Executando SQL..." -ForegroundColor Yellow
Write-Host ""

try {
    Invoke-Expression $command
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ População do sistema concluída com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎯 Próximos passos:" -ForegroundColor Cyan
        Write-Host "   1. Acesse: http://localhost:5175" -ForegroundColor White
        Write-Host "   2. Login: admin@dudufisio.com / demo123456" -ForegroundColor White
        Write-Host "   3. Vá em 'Pacientes' para ver a lista" -ForegroundColor White
        Write-Host "   4. Clique em qualquer paciente com ✅" -ForegroundColor White
        Write-Host "   5. Acesse a aba 'Mapa de Dor'" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host ""
        Write-Host "❌ Erro ao executar SQL (código: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host ""
        Write-Host "💡 Use o Supabase Dashboard como alternativa" -ForegroundColor Yellow
        Write-Host ""
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Use o Supabase Dashboard como alternativa:" -ForegroundColor Yellow
    Write-Host "   1. Abra: https://supabase.com/dashboard" -ForegroundColor White
    Write-Host "   2. SQL Editor → New Query" -ForegroundColor White
    Write-Host "   3. Cole o conteúdo de: $SQL_FILE" -ForegroundColor White
    Write-Host "   4. Execute (Ctrl+Enter)" -ForegroundColor White
    Write-Host ""
}

# Limpar variável de senha
Remove-Item Env:\PGPASSWORD -ErrorAction SilentlyContinue



