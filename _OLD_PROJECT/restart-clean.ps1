# Script para limpar cache e reiniciar servidor
Write-Host "🧹 Limpando cache do Vite..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue

Write-Host "✅ Cache limpo!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Agora execute: npm run dev" -ForegroundColor Cyan
Write-Host ""
Write-Host "Depois acesse:" -ForegroundColor Cyan
Write-Host "  http://localhost:XXXX/enhanced-exercise-library" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+Shift+R para hard refresh!" -ForegroundColor Yellow

