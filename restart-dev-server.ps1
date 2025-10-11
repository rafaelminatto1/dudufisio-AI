# ====================================================================
# Script de Reinicialização do Servidor de Desenvolvimento
# ====================================================================
# Este script para o servidor atual, limpa o cache e reinicia
# ====================================================================

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  REINICIALIZANDO SERVIDOR DE DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

# 1. Verificar se .env.local existe
Write-Host "1. Verificando arquivo .env.local..." -ForegroundColor Yellow
if (Test-Path .env.local) {
    Write-Host "   ✅ Arquivo .env.local encontrado" -ForegroundColor Green
    
    # Mostrar as variáveis (sem mostrar as keys completas)
    $envContent = Get-Content .env.local
    foreach ($line in $envContent) {
        if ($line -match "^VITE_SUPABASE_URL=(.+)$") {
            Write-Host "   ✅ VITE_SUPABASE_URL configurada" -ForegroundColor Green
        }
        if ($line -match "^VITE_SUPABASE_ANON_KEY=(.+)$") {
            Write-Host "   ✅ VITE_SUPABASE_ANON_KEY configurada" -ForegroundColor Green
        }
        if ($line -match "^VITE_GEMINI_API_KEY=(.+)$") {
            Write-Host "   ✅ VITE_GEMINI_API_KEY configurada" -ForegroundColor Green
        }
    }
} else {
    Write-Host "   ❌ Arquivo .env.local NÃO encontrado!" -ForegroundColor Red
    Write-Host "   Executando criação do arquivo..." -ForegroundColor Yellow
    
    # Criar .env.local com as credenciais
    @"
VITE_SUPABASE_URL=https://urfxniitfbbvsaskicfo.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg
VITE_GEMINI_API_KEY=AIzaSyDc5vZXFRAlU18dl1Bk9K2NT-BS8GmuLtM
NODE_ENV=development
"@ | Set-Content -Path .env.local -Encoding UTF8 -NoNewline
    
    Write-Host "   ✅ Arquivo .env.local criado!" -ForegroundColor Green
}

Write-Host "`n2. Parando processos Node existentes..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Where-Object { $_.MainWindowTitle -like "*vite*" -or $_.CommandLine -like "*vite*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Processos Node parados" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Nenhum processo Node rodando" -ForegroundColor Gray
}

Write-Host "`n3. Limpando cache do Vite..." -ForegroundColor Yellow
if (Test-Path "node_modules\.vite") {
    Remove-Item -Recurse -Force "node_modules\.vite" -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache do Vite removido" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Sem cache para limpar" -ForegroundColor Gray
}

Write-Host "`n4. Aguardando 2 segundos..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
Write-Host "   ✅ Pronto!" -ForegroundColor Green

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "  SERVIDOR PRONTO PARA INICIAR" -ForegroundColor Cyan
Write-Host "===============================================`n" -ForegroundColor Cyan

Write-Host "Agora execute:" -ForegroundColor Yellow
Write-Host "  npm run dev`n" -ForegroundColor Cyan

Write-Host "✅ Todas as preparações concluídas!" -ForegroundColor Green
Write-Host "✅ Variáveis de ambiente configuradas" -ForegroundColor Green
Write-Host "✅ Cache limpo" -ForegroundColor Green
Write-Host "✅ Processos antigos parados`n" -ForegroundColor Green



