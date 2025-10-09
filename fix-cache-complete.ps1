# Script para limpar completamente o cache do Vite e resolver erros de useContext
Write-Host "🔧 Limpando cache completo do Vite..." -ForegroundColor Yellow

# Parar todos os processos Node.js
Write-Host "🛑 Parando processos Node.js..." -ForegroundColor Red
taskkill /F /IM node.exe 2>$null
Start-Sleep -Seconds 3

# Limpar cache do Vite
Write-Host "🗑️ Removendo cache do Vite..." -ForegroundColor Yellow
Remove-Item -Path "node_modules\.vite" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "node_modules\.cache" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

# Limpar cache do npm
Write-Host "🗑️ Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force

# Reinstalar dependências se necessário
Write-Host "📦 Verificando dependências..." -ForegroundColor Blue
npm install

# Aguardar
Write-Host "⏳ Aguardando 2 segundos..." -ForegroundColor Gray
Start-Sleep -Seconds 2

# Iniciar servidor
Write-Host "🚀 Iniciando servidor..." -ForegroundColor Green
npm run dev

