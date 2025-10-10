# Script para corrigir problemas de Service Worker e Cache
Write-Host "🔧 Corrigindo problemas de Service Worker e Cache..." -ForegroundColor Yellow

# 1. Parar todos os processos Node.js e Vite
Write-Host "📴 Parando processos Node.js e Vite..." -ForegroundColor Blue
Get-Process | Where-Object {$_.ProcessName -like "*node*" -or $_.ProcessName -like "*vite*"} | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Limpar cache do Vite
Write-Host "🗑️ Limpando cache do Vite..." -ForegroundColor Blue
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# 3. Limpar cache do navegador (instruções)
Write-Host "🌐 Para limpar cache do navegador:" -ForegroundColor Green
Write-Host "   - Pressione Ctrl+Shift+Delete" -ForegroundColor White
Write-Host "   - Ou pressione F12 > Application > Storage > Clear storage" -ForegroundColor White
Write-Host "   - Ou use modo incógnito para testar" -ForegroundColor White

# 4. Reiniciar servidor
Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; npm run dev"

Write-Host "✅ Processo concluído!" -ForegroundColor Green
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Aguarde o servidor inicializar" -ForegroundColor White
Write-Host "   2. Acesse http://localhost:5173" -ForegroundColor White
Write-Host "   3. Limpe o cache do navegador" -ForegroundColor White
Write-Host "   4. Teste a página do gerador de vídeos" -ForegroundColor White

Read-Host "Pressione Enter para continuar..."
