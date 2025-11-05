# Update WhatsApp Access Token
# MoocaFisio - Script rápido para atualizar token expirado

Write-Host "🔑 Atualizar WhatsApp Access Token" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Solicitar novo token
Write-Host "Cole o NOVO Access Token obtido do Meta Business:" -ForegroundColor Yellow
$NewToken = Read-Host

if ([string]::IsNullOrWhiteSpace($NewToken)) {
    Write-Host "❌ Token não pode estar vazio!" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🔄 Atualizando secret no Supabase..." -ForegroundColor Yellow

# Atualizar secret
npx supabase secrets set "WHATSAPP_ACCESS_TOKEN=$NewToken"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Token atualizado com sucesso!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Não esqueça de atualizar também o .env.local:" -ForegroundColor Yellow
    Write-Host "WHATSAPP_ACCESS_TOKEN=$NewToken" -ForegroundColor White
    Write-Host ""
    Write-Host "🧪 Agora você pode testar novamente a Edge Function!" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Erro ao atualizar secret" -ForegroundColor Red
}
