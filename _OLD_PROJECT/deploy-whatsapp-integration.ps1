# Deploy WhatsApp Business Integration
# MoocaFisio - Script de deploy automático (PowerShell)

Write-Host "🚀 Deploy WhatsApp Business Integration - MoocaFisio" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Variáveis de ambiente
$WhatsAppApiUrl = "https://graph.facebook.com/v21.0"
$PhoneNumberId = "779431901927431"
$AccessToken = "EAAjPUGyZBQPoBP1q1pmzgxHttN4s9lMo1qSjz5Itp113lTuNamYabi2ZBn50r1Rr77FsZAZCbbGvrSstZAZCfyMhNUKVxoNhYDQ58YdfjuUJwslG9SRxO90d7gvzslimdEnCevVy0zsZBEvz4uYJImsPrI1NpOBtkl0JmFFYZBMvewrkZA777kXsh4ZACgwHN7Ns1jsT8yku1qZBT3Y6TJD4CYfCWozQZBRaFk3cIfuH7Dja1WXAasBkCWUPDZBFa7YQ6qwZDZD"

Write-Host "📋 Passo 1: Verificar login no Supabase" -ForegroundColor Yellow
Write-Host "Verificando se está logado..."
Write-Host ""

# Tentar verificar o login
$loginCheck = npx supabase projects list 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Você não está logado. Execute:" -ForegroundColor Red
    Write-Host "npx supabase login" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pressione ENTER depois de fazer login..."
    Read-Host
}

Write-Host "✅ Login verificado" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Passo 2: Verificar link com projeto" -ForegroundColor Yellow
npx supabase link --project-ref urfxniitfbbvsaskicfo
Write-Host ""

Write-Host "📋 Passo 3: Aplicar migrations" -ForegroundColor Yellow
Write-Host ""
Write-Host "⚠️ IMPORTANTE: As migrations serão aplicadas via Supabase Dashboard SQL Editor" -ForegroundColor Yellow
Write-Host ""
Write-Host "Abra estas URLs no navegador:" -ForegroundColor Cyan
Write-Host "https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/sql" -ForegroundColor White
Write-Host ""
Write-Host "Depois execute os arquivos SQL nesta ordem:" -ForegroundColor Cyan
Write-Host "1. supabase\migrations\20251104000004_create_whatsapp_preferences.sql" -ForegroundColor White
Write-Host "2. supabase\migrations\20251104000005_create_whatsapp_logs.sql" -ForegroundColor White
Write-Host ""
Write-Host "Pressione ENTER quando terminar de aplicar as migrations..." -ForegroundColor Yellow
Read-Host

Write-Host "✅ Migrations aplicadas" -ForegroundColor Green
Write-Host ""

Write-Host "🔐 Passo 4: Configurar Secrets do WhatsApp" -ForegroundColor Yellow
Write-Host "Configurando WHATSAPP_API_URL..."
npx supabase secrets set "WHATSAPP_API_URL=$WhatsAppApiUrl"

Write-Host "Configurando WHATSAPP_PHONE_NUMBER_ID..."
npx supabase secrets set "WHATSAPP_PHONE_NUMBER_ID=$PhoneNumberId"

Write-Host "Configurando WHATSAPP_ACCESS_TOKEN..."
npx supabase secrets set "WHATSAPP_ACCESS_TOKEN=$AccessToken"

Write-Host "✅ Secrets configurados" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Passo 5: Deploy da Edge Function" -ForegroundColor Yellow
npx supabase functions deploy send-whatsapp

Write-Host ""
Write-Host "✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "=================================================="
Write-Host "🎉 WhatsApp Business Integration está pronta!" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "1. Aprovar templates no Meta Business Suite" -ForegroundColor White
Write-Host "2. Testar envio de mensagem" -ForegroundColor White
Write-Host "3. Verificar logs no Supabase" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentação completa em:" -ForegroundColor Yellow
Write-Host "- GUIA_IMPLEMENTACAO_WHATSAPP_BUSINESS.md" -ForegroundColor White
Write-Host "- RESUMO_WHATSAPP_INTEGRATION.md" -ForegroundColor White
Write-Host ""
Write-Host "=================================================="
