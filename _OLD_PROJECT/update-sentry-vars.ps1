# Script para atualizar variáveis do Sentry na Vercel

Write-Host "🔧 Atualizando variáveis do Sentry na Vercel..." -ForegroundColor Yellow

# Remover variáveis antigas
Write-Host "🗑️ Removendo SENTRY_DSN antigo..." -ForegroundColor Red
echo "y" | vercel env rm SENTRY_DSN

Write-Host "🗑️ Removendo SENTRY_ORG antigo..." -ForegroundColor Red  
echo "y" | vercel env rm SENTRY_ORG

Write-Host "🗑️ Removendo SENTRY_PROJECT antigo..." -ForegroundColor Red
echo "y" | vercel env rm SENTRY_PROJECT

# Adicionar variáveis corretas
Write-Host "➕ Adicionando SENTRY_DSN correto..." -ForegroundColor Green
echo "https://ed8c685723abb975493f2c73a17122bb@o4509108057341952.ingest.us.sentry.io/4510185005973504" | vercel env add SENTRY_DSN production development preview

Write-Host "➕ Adicionando SENTRY_ORG correto..." -ForegroundColor Green
echo "activity-fisioterapia" | vercel env add SENTRY_ORG production development preview

Write-Host "➕ Adicionando SENTRY_PROJECT correto..." -ForegroundColor Green
echo "dudufisio-ai" | vercel env add SENTRY_PROJECT production development preview

Write-Host "✅ Variáveis do Sentry atualizadas com sucesso!" -ForegroundColor Green
Write-Host "🚀 Faça um redeploy para aplicar as mudanças." -ForegroundColor Cyan
