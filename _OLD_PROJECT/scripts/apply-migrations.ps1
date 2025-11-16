# Script PowerShell para aplicar migrations do Supabase
# Uso: .\scripts\apply-migrations.ps1

Write-Host "🚀 APLICADOR DE MIGRATIONS SUPABASE" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se Supabase CLI está instalado
Write-Host "📋 Verificando Supabase CLI..." -ForegroundColor Yellow
$supabaseInstalled = Get-Command supabase -ErrorAction SilentlyContinue

if (-not $supabaseInstalled) {
    Write-Host "❌ Supabase CLI não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Instale com:" -ForegroundColor Yellow
    Write-Host "  scoop install supabase" -ForegroundColor White
    Write-Host "  ou" -ForegroundColor Yellow
    Write-Host "  npm install -g supabase" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host "✅ Supabase CLI encontrado!" -ForegroundColor Green
Write-Host ""

# Verificar se Docker está rodando
Write-Host "🐳 Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>$null

if (-not $?) {
    Write-Host "⚠️  Docker não está rodando!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "ESCOLHA UMA OPÇÃO:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Iniciar Docker Desktop e rodar localmente" -ForegroundColor White
    Write-Host "2. Usar projeto Supabase Cloud (remoto)" -ForegroundColor White
    Write-Host "3. Aplicar manualmente via Dashboard" -ForegroundColor White
    Write-Host ""
    $choice = Read-Host "Digite sua escolha (1, 2 ou 3)"
    
    switch ($choice) {
        "1" {
            Write-Host ""
            Write-Host "📌 Iniciando Docker Desktop..." -ForegroundColor Yellow
            Write-Host ""
            Write-Host "Por favor:" -ForegroundColor Yellow
            Write-Host "1. Abra Docker Desktop manualmente" -ForegroundColor White
            Write-Host "2. Aguarde até ele iniciar completamente (1-2 minutos)" -ForegroundColor White
            Write-Host "3. Execute este script novamente" -ForegroundColor White
            Write-Host ""
            
            # Tentar iniciar Docker Desktop
            $dockerPath = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
            if (Test-Path $dockerPath) {
                Start-Process $dockerPath
                Write-Host "✅ Docker Desktop foi iniciado!" -ForegroundColor Green
                Write-Host "⏳ Aguardando inicialização..." -ForegroundColor Yellow
                Write-Host ""
                Start-Sleep -Seconds 10
                
                # Verificar novamente
                $dockerRunning = docker ps 2>$null
                if ($?) {
                    Write-Host "✅ Docker está rodando!" -ForegroundColor Green
                } else {
                    Write-Host "⏳ Docker ainda está inicializando..." -ForegroundColor Yellow
                    Write-Host "Execute este script novamente em alguns instantes." -ForegroundColor White
                    exit 0
                }
            }
            exit 0
        }
        "2" {
            Write-Host ""
            Write-Host "☁️  USANDO PROJETO CLOUD" -ForegroundColor Cyan
            Write-Host ""
            
            # Login
            Write-Host "🔐 Fazendo login no Supabase..." -ForegroundColor Yellow
            supabase login
            
            if (-not $?) {
                Write-Host "❌ Erro ao fazer login" -ForegroundColor Red
                exit 1
            }
            
            Write-Host ""
            Write-Host "🔗 Listando seus projetos..." -ForegroundColor Yellow
            supabase projects list
            
            Write-Host ""
            $projectRef = Read-Host "Digite o PROJECT_REF do seu projeto"
            
            if (-not $projectRef) {
                Write-Host "❌ PROJECT_REF não fornecido" -ForegroundColor Red
                exit 1
            }
            
            Write-Host ""
            Write-Host "🔗 Conectando ao projeto $projectRef..." -ForegroundColor Yellow
            supabase link --project-ref $projectRef
            
            if (-not $?) {
                Write-Host "❌ Erro ao conectar ao projeto" -ForegroundColor Red
                exit 1
            }
            
            Write-Host ""
            Write-Host "📤 Aplicando migrations..." -ForegroundColor Yellow
            supabase db push
            
            if ($?) {
                Write-Host ""
                Write-Host "✅ Migrations aplicadas com sucesso!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Próximos passos:" -ForegroundColor Cyan
                Write-Host "1. Configure o Storage (veja 🔧_GUIA_APLICAR_MIGRATIONS_SUPABASE.md)" -ForegroundColor White
                Write-Host "2. Crie o arquivo .env.local com as keys" -ForegroundColor White
                Write-Host "3. Teste a conexão" -ForegroundColor White
            } else {
                Write-Host "❌ Erro ao aplicar migrations" -ForegroundColor Red
            }
            
            exit 0
        }
        "3" {
            Write-Host ""
            Write-Host "📋 APLICAÇÃO MANUAL VIA DASHBOARD" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "1. Acesse: https://supabase.com/dashboard" -ForegroundColor White
            Write-Host "2. Selecione seu projeto" -ForegroundColor White
            Write-Host "3. Vá em SQL Editor" -ForegroundColor White
            Write-Host "4. Abra: supabase/migrations/20251009_complete_patients_management_system.sql" -ForegroundColor White
            Write-Host "5. Copie TODO o conteúdo" -ForegroundColor White
            Write-Host "6. Cole no SQL Editor" -ForegroundColor White
            Write-Host "7. Clique em Run" -ForegroundColor White
            Write-Host ""
            Write-Host "✅ Depois, configure o Storage conforme o guia!" -ForegroundColor Green
            Write-Host ""
            exit 0
        }
        default {
            Write-Host "❌ Opção inválida" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "✅ Docker está rodando!" -ForegroundColor Green
Write-Host ""

# Verificar se Supabase local está rodando
Write-Host "🔍 Verificando Supabase local..." -ForegroundColor Yellow
$supabaseStatus = supabase status 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Supabase local não está rodando" -ForegroundColor Yellow
    Write-Host ""
    $startLocal = Read-Host "Deseja iniciar Supabase local? (s/n)"
    
    if ($startLocal -eq "s" -or $startLocal -eq "S") {
        Write-Host ""
        Write-Host "🚀 Iniciando Supabase local..." -ForegroundColor Yellow
        Write-Host "⏳ Isso pode demorar alguns minutos..." -ForegroundColor Yellow
        Write-Host ""
        
        supabase start
        
        if ($?) {
            Write-Host ""
            Write-Host "✅ Supabase iniciado com sucesso!" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "❌ Erro ao iniciar Supabase" -ForegroundColor Red
            exit 1
        }
    } else {
        exit 0
    }
}

Write-Host ""
Write-Host "📤 Aplicando migrations..." -ForegroundColor Yellow
Write-Host ""

supabase db push

if ($?) {
    Write-Host ""
    Write-Host "✅ MIGRATIONS APLICADAS COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Verificando o que foi criado..." -ForegroundColor Cyan
    Write-Host ""
    
    # Listar tabelas
    Write-Host "Tabelas criadas:" -ForegroundColor Yellow
    supabase db list
    
    Write-Host ""
    Write-Host "🎉 TUDO PRONTO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Próximos passos:" -ForegroundColor Cyan
    Write-Host "1. Configure o Storage (rode: .\scripts\configure-storage.ps1)" -ForegroundColor White
    Write-Host "2. Crie o arquivo .env.local com as keys" -ForegroundColor White
    Write-Host "3. Teste a conexão" -ForegroundColor White
    Write-Host ""
    Write-Host "URLs disponíveis:" -ForegroundColor Cyan
    supabase status | Select-String "http"
    
} else {
    Write-Host ""
    Write-Host "❌ ERRO ao aplicar migrations!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tente:" -ForegroundColor Yellow
    Write-Host "1. Verificar os logs: supabase logs" -ForegroundColor White
    Write-Host "2. Resetar o database: supabase db reset" -ForegroundColor White
    Write-Host "3. Ver o guia completo: 🔧_GUIA_APLICAR_MIGRATIONS_SUPABASE.md" -ForegroundColor White
    Write-Host ""
}

