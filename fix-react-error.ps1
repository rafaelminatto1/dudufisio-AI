# Script para corrigir erro "Cannot read properties of null (reading 'useState')"
Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CORRIGINDO ERRO DO REACT                                    ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

Write-Host "1. Parando processos Node..." -ForegroundColor Yellow
Stop-Process -Name "node" -Force -ErrorAction SilentlyContinue
Write-Host "   ✅ Processos parados`n" -ForegroundColor Green

Write-Host "2. Limpando cache do Vite..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules\.vite -ErrorAction SilentlyContinue
Write-Host "   ✅ Cache Vite limpo`n" -ForegroundColor Green

Write-Host "3. Limpando dist..." -ForegroundColor Yellow
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Write-Host "   ✅ Dist limpo`n" -ForegroundColor Green

Write-Host "4. Limpando tsconfig.tsbuildinfo..." -ForegroundColor Yellow
Remove-Item -Force tsconfig.tsbuildinfo -ErrorAction SilentlyContinue
Write-Host "   ✅ Build info limpo`n" -ForegroundColor Green

Write-Host "5. Reinstalando dependências React..." -ForegroundColor Yellow
npm install react@latest react-dom@latest --legacy-peer-deps
Write-Host "   ✅ React reinstalado`n" -ForegroundColor Green

Write-Host "`n╔══════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║     CORREÇÃO CONCLUÍDA!                                         ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "Agora execute: npm run dev" -ForegroundColor Cyan

