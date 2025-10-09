# Script para limpar Service Worker e cache

Write-Host "🧹 Limpando Service Worker e Cache..." -ForegroundColor Yellow

# Mensagem para o usuário
Write-Host ""
Write-Host "⚠️ INSTRUÇÕES:" -ForegroundColor Red
Write-Host "1. Abra o navegador em: http://localhost:5175" -ForegroundColor Cyan
Write-Host "2. Pressione F12 para abrir DevTools" -ForegroundColor Cyan
Write-Host "3. Vá para a aba 'Application' (ou 'Aplicativo')" -ForegroundColor Cyan
Write-Host "4. No menu lateral esquerdo:" -ForegroundColor Cyan
Write-Host "   - Clique em 'Service Workers'" -ForegroundColor Yellow
Write-Host "   - Clique em 'Unregister' para desregistrar" -ForegroundColor Yellow
Write-Host "   - Clique em 'Storage' → 'Clear site data'" -ForegroundColor Yellow
Write-Host "5. Pressione Ctrl + Shift + R para recarregar sem cache" -ForegroundColor Cyan
Write-Host ""

Write-Host "✅ Ou simplesmente:" -ForegroundColor Green
Write-Host "   - Pressione Ctrl + Shift + Delete" -ForegroundColor Yellow
Write-Host "   - Marque 'Cached images and files'" -ForegroundColor Yellow
Write-Host "   - Clique em 'Clear data'" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔄 Depois disso, recarregue a página com Ctrl + Shift + R" -ForegroundColor Green
Write-Host ""

Read-Host "Pressione Enter quando terminar"
