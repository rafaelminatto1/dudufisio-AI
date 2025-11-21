# Script PowerShell para gerar .env.local
# Uso: .\scripts\generate-env-local.ps1

Write-Host "🔧 Gerador de .env.local" -ForegroundColor Cyan
Write-Host ""

# Verifica se já existe
if (Test-Path .env.local) {
    $overwrite = Read-Host "Arquivo .env.local já existe. Deseja sobrescrever? (s/N)"
    if ($overwrite -ne "s" -and $overwrite -ne "S") {
        Write-Host "Operação cancelada." -ForegroundColor Yellow
        exit
    }
}

Write-Host "📝 Preencha as informações solicitadas:" -ForegroundColor Yellow
Write-Host ""

# Supabase
Write-Host "=== SUPABASE ===" -ForegroundColor Green
$supabaseUrl = Read-Host "NEXT_PUBLIC_SUPABASE_URL (ex: https://xxx.supabase.co)"
$supabaseAnonKey = Read-Host "NEXT_PUBLIC_SUPABASE_ANON_KEY"
$supabaseServiceKey = Read-Host "SUPABASE_SERVICE_ROLE_KEY" -AsSecureString
$supabaseServiceKeyPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($supabaseServiceKey))

Write-Host ""
Write-Host "=== WHATSAPP BUSINESS API ===" -ForegroundColor Green
$whatsappToken = Read-Host "WHATSAPP_API_KEY (já preenchido, pressione Enter para usar o padrão)"
if ([string]::IsNullOrWhiteSpace($whatsappToken)) {
    $whatsappToken = "EAAjPUGyZBQPoBP6VPXKdgqOPBzvmuxzQkaq1gzxl6ALoGtVTC3kI1keAWMm60AA3gt8JCl1KvlENDULm7buBSFLvqnRC6GTBU601Ba3IceXBo7XR6kLIu6fqFHDfko3TTRLwQeajNrcCfmYvMHQGdRwRD0TAQcGvm0fZAFs2kNkamkerJn2IxLljKsRsyOkgZDZD"
}

$phoneNumberId = Read-Host "WHATSAPP_PHONE_NUMBER_ID (já preenchido, Enter para padrão)"
if ([string]::IsNullOrWhiteSpace($phoneNumberId)) {
    $phoneNumberId = "779431901927431"
}

$webhookToken = Read-Host "WHATSAPP_WEBHOOK_VERIFY_TOKEN (gere um token seguro)"
if ([string]::IsNullOrWhiteSpace($webhookToken)) {
    # Gera token aleatório
    $webhookToken = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "Token gerado automaticamente: $webhookToken" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== EMAIL (RESEND) ===" -ForegroundColor Green
$emailKey = Read-Host "EMAIL_API_KEY (já preenchido, Enter para padrão)"
if ([string]::IsNullOrWhiteSpace($emailKey)) {
    $emailKey = "re_Mezq7Vga_HYycFnWej9d9EgGsjQdksWZg"
}

Write-Host ""
Write-Host "=== CRON SECRET ===" -ForegroundColor Green
$cronSecret = Read-Host "CRON_SECRET (Enter para gerar automaticamente)"
if ([string]::IsNullOrWhiteSpace($cronSecret)) {
    # Gera secret aleatório
    $cronSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
    Write-Host "Secret gerado automaticamente: $cronSecret" -ForegroundColor Cyan
}

# Gera o conteúdo do arquivo
$envContent = @"
# ============================================
# SUPABASE (OBRIGATÓRIO)
# ============================================
NEXT_PUBLIC_SUPABASE_URL=$supabaseUrl
NEXT_PUBLIC_SUPABASE_ANON_KEY=$supabaseAnonKey
SUPABASE_SERVICE_ROLE_KEY=$supabaseServiceKeyPlain

# ============================================
# WHATSAPP BUSINESS API
# ============================================
WHATSAPP_PROVIDER=whatsapp_business
WHATSAPP_API_KEY=$whatsappToken
WHATSAPP_PHONE_NUMBER_ID=$phoneNumberId
WHATSAPP_BUSINESS_ACCOUNT_ID=806225345331804
WHATSAPP_FROM_NUMBER=+551158749885
WHATSAPP_WEBHOOK_VERIFY_TOKEN=$webhookToken

# ============================================
# EMAIL (RESEND)
# ============================================
EMAIL_PROVIDER=resend
EMAIL_API_KEY=$emailKey
EMAIL_FROM=noreply@dudufisio.com

# ============================================
# CRON JOBS
# ============================================
CRON_SECRET=$cronSecret

# ============================================
# APP CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
"@

# Salva o arquivo
$envContent | Out-File -FilePath .env.local -Encoding utf8 -NoNewline

Write-Host ""
Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANTE: Este arquivo contém informações sensíveis." -ForegroundColor Yellow
Write-Host "   Nunca commite este arquivo no Git!" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "   1. Verifique se todas as variáveis estão corretas" -ForegroundColor White
Write-Host "   2. Reinicie o servidor de desenvolvimento (npm run dev)" -ForegroundColor White
Write-Host "   3. Teste a conexão com Supabase" -ForegroundColor White

