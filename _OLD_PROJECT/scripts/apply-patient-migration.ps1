# Script para Aplicar Migration do App de Pacientes
# MoocaFisio - Patient App Migration

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MOOCAFISIO - App para Pacientes      " -ForegroundColor Cyan
Write-Host "  Aplicando Migration no Supabase      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se o arquivo existe
$migrationFile = "supabase\migrations\20251106011801_patient_app_system.sql"

if (-Not (Test-Path $migrationFile)) {
    Write-Host "❌ Erro: Arquivo de migration não encontrado!" -ForegroundColor Red
    Write-Host "   Procurando: $migrationFile" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Arquivo de migration encontrado!" -ForegroundColor Green
Write-Host ""

# Opções para o usuário
Write-Host "Escolha como aplicar a migration:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Via Supabase CLI (npx supabase db push)" -ForegroundColor White
Write-Host "2. Abrir Dashboard do Supabase no navegador" -ForegroundColor White
Write-Host "3. Copiar SQL para clipboard" -ForegroundColor White
Write-Host "4. Ver primeiras linhas da migration" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Digite sua escolha (1-4)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "🚀 Aplicando migration via Supabase CLI..." -ForegroundColor Cyan
        Write-Host ""
        
        # Tentar aplicar
        npx supabase db push
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "✅ Migration aplicada com sucesso!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠️ Erro ao aplicar migration via CLI." -ForegroundColor Yellow
            Write-Host "   Tente a opção 2 (Dashboard) para aplicar manualmente." -ForegroundColor Yellow
        }
    }
    
    "2" {
        Write-Host ""
        Write-Host "🌐 Abrindo Dashboard do Supabase..." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "📋 Instruções:" -ForegroundColor Yellow
        Write-Host "   1. Faça login no Supabase" -ForegroundColor White
        Write-Host "   2. Selecione seu projeto MoocaFisio" -ForegroundColor White
        Write-Host "   3. Vá em SQL Editor" -ForegroundColor White
        Write-Host "   4. Cole o conteúdo da migration" -ForegroundColor White
        Write-Host "   5. Clique em RUN" -ForegroundColor White
        Write-Host ""
        Write-Host "📄 Arquivo: $migrationFile" -ForegroundColor Cyan
        Write-Host ""
        
        # Copiar para clipboard
        Get-Content $migrationFile | Set-Clipboard
        Write-Host "✅ SQL copiado para clipboard!" -ForegroundColor Green
        Write-Host ""
        
        # Abrir navegador
        Start-Process "https://supabase.com/dashboard/project/_/sql/new"
    }
    
    "3" {
        Write-Host ""
        Write-Host "📋 Copiando SQL para clipboard..." -ForegroundColor Cyan
        
        Get-Content $migrationFile | Set-Clipboard
        
        Write-Host ""
        Write-Host "✅ SQL copiado para clipboard!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📄 Agora você pode colar no:" -ForegroundColor Yellow
        Write-Host "   - Supabase Dashboard > SQL Editor" -ForegroundColor White
        Write-Host "   - Seu editor SQL favorito" -ForegroundColor White
        Write-Host ""
    }
    
    "4" {
        Write-Host ""
        Write-Host "📄 Primeiras 50 linhas da migration:" -ForegroundColor Cyan
        Write-Host ""
        
        Get-Content $migrationFile -Head 50
        
        Write-Host ""
        Write-Host "..." -ForegroundColor Gray
        Write-Host ""
        $totalLines = (Get-Content $migrationFile).Count
        Write-Host "📊 Total de linhas: $totalLines" -ForegroundColor Cyan
        Write-Host ""
    }
    
    default {
        Write-Host ""
        Write-Host "❌ Opção inválida!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Próximos Passos:                     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ✅ Aplicar migration (você acabou de fazer)" -ForegroundColor Green
Write-Host "2. 📦 Criar bucket 'exercise-videos' no Storage" -ForegroundColor Yellow
Write-Host "3. 🚀 Servidores já estão rodando!" -ForegroundColor Green
Write-Host "4. 🌐 Acesse: http://localhost:5173/patient/login" -ForegroundColor Cyan
Write-Host ""
Write-Host "Leia: _APP_PACIENTES_INSTALADO.md" -ForegroundColor White
Write-Host ""

