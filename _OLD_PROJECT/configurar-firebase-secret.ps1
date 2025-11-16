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

# Ler o conteúdo do arquivo JSON
$jsonContent = Get-Content $firebaseJsonPath -Raw

# Comprimir o JSON (remover espaços e quebras de linha desnecessárias)
$jsonContentCompressed = $jsonContent -replace '\s+', ' ' -replace '> <', '><'

Write-Host "📦 Conteúdo do JSON lido e comprimido" -ForegroundColor Green
Write-Host ""

# Configurar o secret no Supabase
Write-Host "🚀 Configurando secret FIREBASE_SERVICE_ACCOUNT no Supabase..." -ForegroundColor Cyan

try {
    # Usar supabase secrets set
    $jsonContentCompressed | supabase secrets set FIREBASE_SERVICE_ACCOUNT --project-ref urfxniitfbbvsaskicfo
    
    Write-Host ""
    Write-Host "✅ Secret configurado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Você pode verificar em:" -ForegroundColor Yellow
    Write-Host "https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions" -ForegroundColor Cyan
} catch {
    Write-Host ""
    Write-Host "❌ Erro ao configurar secret: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️ Alternativa: Configure manualmente no Dashboard:" -ForegroundColor Yellow
    Write-Host "1. Acesse: https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/functions" -ForegroundColor Cyan
    Write-Host "2. Adicione um novo secret:" -ForegroundColor Cyan
    Write-Host "   - Name: FIREBASE_SERVICE_ACCOUNT" -ForegroundColor White
    Write-Host "   - Value: [Cole o conteúdo do arquivo JSON]" -ForegroundColor White
    Write-Host ""
    Write-Host "Conteúdo do JSON para copiar:" -ForegroundColor Yellow
    Write-Host $jsonContentCompressed -ForegroundColor White
}

