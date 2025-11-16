# Deploy Push Notification Edge Function
# MoocaFisio - Script de deploy automático (PowerShell)

Write-Host "🚀 Deploy Push Notification Edge Function - MoocaFisio" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo de service account existe
$ServiceAccountFile = "minatto\dudufisio-3831a-firebase-adminsdk-fbsvc-18616c7651.json"

if (-Not (Test-Path $ServiceAccountFile)) {
    Write-Host "❌ Erro: Arquivo de service account não encontrado!" -ForegroundColor Red
    Write-Host "Procurando por: $ServiceAccountFile"
    exit 1
}

Write-Host "✅ Service Account encontrado" -ForegroundColor Green
Write-Host ""

# Ler o JSON do service account (em uma linha)
$ServiceAccountJson = (Get-Content $ServiceAccountFile -Raw) -replace '\s+', ' ' -replace '\n', '' -replace '\r', ''

Write-Host "📦 Passo 1: Login no Supabase" -ForegroundColor Yellow
Write-Host "Executar: npx supabase login"
Write-Host "Pressione ENTER para continuar depois de fazer login..."
Read-Host

Write-Host ""
Write-Host "📦 Passo 2: Linkar projeto Supabase" -ForegroundColor Yellow
npx supabase link --project-ref urfxniitfbbvsaskicfo

Write-Host ""
Write-Host "🔐 Passo 3: Configurar Secret do Firebase Service Account" -ForegroundColor Yellow
Write-Host "Configurando FIREBASE_SERVICE_ACCOUNT..."

# Configurar secret usando npx supabase secrets set
npx supabase secrets set "FIREBASE_SERVICE_ACCOUNT=$ServiceAccountJson"

Write-Host "✅ Secret configurado" -ForegroundColor Green

Write-Host ""
Write-Host "🚀 Passo 4: Deploy da Edge Function" -ForegroundColor Yellow
npx supabase functions deploy send-push-notification

Write-Host ""
Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "=================================================="
Write-Host "🎉 Edge Function está pronta para uso!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Para testar, use:"
Write-Host "curl -i --location --request POST 'https://urfxniitfbbvsaskicfo.supabase.co/functions/v1/send-push-notification' \"
Write-Host "  --header 'Authorization: Bearer YOUR_ANON_KEY' \"
Write-Host "  --header 'Content-Type: application/json' \"
Write-Host "  --data '{`"userId`":`"user-id`",`"title`":`"Teste`",`"body`":`"Funcionou!`"}'"
Write-Host ""
Write-Host "=================================================="
