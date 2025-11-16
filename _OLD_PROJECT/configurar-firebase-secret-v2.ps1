# ============================================================================
# Script para Configurar Firebase Service Account no Supabase
# Execute este script no PowerShell
# ============================================================================

Write-Host "🔧 Configurando Firebase Service Account no Supabase..." -ForegroundColor Cyan
Write-Host ""

# Caminho para o arquivo JSON do Firebase
$firebaseJsonPath = "C:\Users\rafal\Downloads\dudufisio-3831a-firebase-adminsdk-fbsvc-18616c7651.json"

# Verificar se o arquivo existe
if (-Not (Test-Path $firebaseJsonPath)) {
    Write-Host "❌ Erro: Arquivo JSON não encontrado em $firebaseJsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Arquivo JSON encontrado!" -ForegroundColor Green

# Ler o conteúdo do arquivo JSON e comprimir (uma linha)
$jsonContent = (Get-Content $firebaseJsonPath -Raw) -replace '\r?\n', '' -replace '\s+', ' '

Write-Host "📦 Conteúdo do JSON lido" -ForegroundColor Green
Write-Host ""

# Configurar o secret no Supabase
Write-Host "🚀 Configurando secret FIREBASE_SERVICE_ACCOUNT no Supabase..." -ForegroundColor Cyan

try {
    # Método correto: NAME=VALUE
    $secretValue = "FIREBASE_SERVICE_ACCOUNT=$jsonContent"
    
    # Executar comando
    $result = supabase secrets set $secretValue --project-ref urfxniitfbbvsaskicfo 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Secret configurado com sucesso!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Você pode verificar em:" -ForegroundColor Yellow
        Write-Host "https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions" -ForegroundColor Cyan
    } else {
        throw $result
    }
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao configurar secret automaticamente" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️ Configure manualmente no Dashboard:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions" -ForegroundColor Cyan
    Write-Host "2. Clique em 'Add new secret'" -ForegroundColor Cyan
    Write-Host "3. Preencha:" -ForegroundColor Cyan
    Write-Host "   Name: FIREBASE_SERVICE_ACCOUNT" -ForegroundColor White
    Write-Host "   Value: [Cole o JSON abaixo]" -ForegroundColor White
    Write-Host ""
    Write-Host "JSON para copiar:" -ForegroundColor Yellow
    Write-Host "==================" -ForegroundColor Gray
    Write-Host $jsonContent -ForegroundColor White
    Write-Host "==================" -ForegroundColor Gray
}

