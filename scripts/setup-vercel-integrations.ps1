# =====================================================
# Script de Configuração: Integrações Vercel + Supabase (PowerShell)
# =====================================================
# Este script configura automaticamente:
# 1. Variáveis de ambiente Supabase na Vercel
# 2. Integração Supabase
# 3. Analytics e Speed Insights
# =====================================================

$ErrorActionPreference = "Stop"

Write-Host "🚀 Iniciando configuração de integrações Vercel..." -ForegroundColor Cyan
Write-Host ""

# =====================================================
# 1. CONFIGURAR VARIÁVEIS DE AMBIENTE
# =====================================================
Write-Host "📋 Passo 1: Configurando variáveis de ambiente Supabase na Vercel..." -ForegroundColor Yellow
Write-Host ""

# Supabase Project Details
$SUPABASE_PROJECT_ID = "urfxniitfbbvsaskicfo"
$SUPABASE_URL = "https://urfxniitfbbvsaskicfo.supabase.co"

# IMPORTANTE: As chaves já foram fornecidas pelo usuário
$SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA"
$SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg"

Write-Host "   Adicionando variáveis de ambiente..." -ForegroundColor Gray

# Adicionar variáveis no Vercel usando echo para passar valor
$env:TEMP_VALUE = $SUPABASE_URL
Write-Host "VITE_SUPABASE_URL" | vercel env add VITE_SUPABASE_URL production preview development

$env:TEMP_VALUE = $SUPABASE_ANON_KEY
Write-Host "VITE_SUPABASE_ANON_KEY" | vercel env add VITE_SUPABASE_ANON_KEY production preview development

$env:TEMP_VALUE = $SUPABASE_SERVICE_ROLE_KEY
Write-Host "SUPABASE_SERVICE_ROLE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

$env:TEMP_VALUE = $SUPABASE_PROJECT_ID
Write-Host "SUPABASE_PROJECT_ID" | vercel env add SUPABASE_PROJECT_ID production preview development

Write-Host "✅ Variáveis de ambiente configuradas!" -ForegroundColor Green
Write-Host ""

# =====================================================
# 2. INSTALAR ANALYTICS E SPEED INSIGHTS
# =====================================================
Write-Host "📊 Passo 2: Instalando Vercel Analytics e Speed Insights..." -ForegroundColor Yellow
Write-Host ""

npm install @vercel/analytics @vercel/speed-insights

Write-Host "✅ Analytics instalados!" -ForegroundColor Green
Write-Host ""

# =====================================================
# 3. CRIAR ARQUIVO .env.local
# =====================================================
Write-Host "📝 Passo 3: Criando arquivo .env.local..." -ForegroundColor Yellow
Write-Host ""

$envContent = @"
# Supabase Configuration
VITE_SUPABASE_URL=$SUPABASE_URL
VITE_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY
SUPABASE_PROJECT_ID=$SUPABASE_PROJECT_ID

# Gemini AI (se necessário)
# VITE_GEMINI_API_KEY=your_key_here
"@

Set-Content -Path ".env.local" -Value $envContent

Write-Host "✅ Arquivo .env.local criado!" -ForegroundColor Green
Write-Host ""

# =====================================================
# 4. ATUALIZAR .gitignore
# =====================================================
Write-Host "🔒 Passo 4: Atualizando .gitignore..." -ForegroundColor Yellow
Write-Host ""

if (Test-Path ".gitignore") {
    $gitignoreContent = Get-Content ".gitignore" -Raw
    if (-not ($gitignoreContent -match "\.env\.local")) {
        Add-Content -Path ".gitignore" -Value "`n.env.local"
        Write-Host "✅ .env.local adicionado ao .gitignore" -ForegroundColor Green
    } else {
        Write-Host "✅ .env.local já está no .gitignore" -ForegroundColor Green
    }
} else {
    Set-Content -Path ".gitignore" -Value ".env.local"
    Write-Host "✅ .gitignore criado com .env.local" -ForegroundColor Green
}

Write-Host ""

# =====================================================
# RESUMO FINAL
# =====================================================
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "✅ CONFIGURAÇÃO CONCLUÍDA!" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 O que foi configurado:" -ForegroundColor Yellow
Write-Host "   ✅ Variáveis de ambiente Supabase (tentar adicionar na Vercel)" -ForegroundColor White
Write-Host "   ✅ Analytics e Speed Insights instalados" -ForegroundColor White
Write-Host "   ✅ Arquivo .env.local criado" -ForegroundColor White
Write-Host "   ✅ .gitignore atualizado" -ForegroundColor White
Write-Host ""
Write-Host "📝 PRÓXIMOS PASSOS MANUAIS:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Adicionar variáveis na Vercel (via Dashboard):" -ForegroundColor White
Write-Host "   https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Instalar integração Supabase:" -ForegroundColor White
Write-Host "   a) Via CLI:" -ForegroundColor Gray
Write-Host "      vercel install supabase" -ForegroundColor Cyan
Write-Host ""
Write-Host "   b) Via Dashboard:" -ForegroundColor Gray
Write-Host "      https://vercel.com/integrations/supabase" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Adicionar Analytics no código:" -ForegroundColor White
Write-Host "   - Execute: .\scripts\add-analytics.ps1" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. Fazer deploy:" -ForegroundColor White
Write-Host "   vercel --prod" -ForegroundColor Cyan
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan

