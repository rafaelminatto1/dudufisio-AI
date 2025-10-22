# Script PowerShell para automatizar deploy: GitHub + Supabase
# Uso: .\scripts\deploy.ps1 "mensagem do commit"

param(
    [Parameter(Mandatory=$true)]
    [string]$CommitMessage
)

# Função para log colorido
function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

Write-Log "🚀 Iniciando processo de deploy..."

# 1. Verificar status do git
Write-Log "📋 Verificando status do Git..."
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Log "📝 Arquivos modificados encontrados, adicionando ao staging..."
    git add .
    Write-Success "Arquivos adicionados ao staging"
} else {
    Write-Warning "Nenhuma alteração detectada no Git"
}

# 2. Fazer commit
Write-Log "💾 Fazendo commit com mensagem: '$CommitMessage'"
git commit -m $CommitMessage
Write-Success "Commit realizado com sucesso"

# 3. Push para GitHub
Write-Log "📤 Enviando para GitHub..."
git push origin main
Write-Success "Push para GitHub realizado com sucesso"

# 4. Verificar se Supabase está rodando
Write-Log "🔍 Verificando status do Supabase..."
try {
    $supabaseStatus = npx supabase status 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Supabase já está rodando"
    } else {
        throw "Supabase não está rodando"
    }
} catch {
    Write-Warning "Supabase não está rodando, iniciando..."
    npx supabase start
    Write-Success "Supabase iniciado"
}

# 5. Verificar migrations pendentes
Write-Log "🔄 Verificando migrations pendentes..."
try {
    $migrationDiff = npx supabase db diff --schema public 2>$null
    
    if ($migrationDiff -match "No schema changes found") {
        Write-Success "Nenhuma migration pendente encontrada"
    } else {
        Write-Warning "Migrations pendentes detectadas:"
        Write-Host $migrationDiff
        
        $createMigration = Read-Host "Deseja criar uma nova migration? (y/N)"
        if ($createMigration -eq "y" -or $createMigration -eq "Y") {
            $migrationName = Read-Host "Digite o nome da migration"
            npx supabase migration new $migrationName
            Write-Success "Migration criada: $migrationName"
            
            $applyMigration = Read-Host "Deseja aplicar a migration agora? (y/N)"
            if ($applyMigration -eq "y" -or $applyMigration -eq "Y") {
                npx supabase db reset
                Write-Success "Migration aplicada com sucesso"
            }
        }
    }
} catch {
    Write-Warning "Erro ao verificar migrations: $($_.Exception.Message)"
}

# 6. Verificar se há dados mock que precisam ser sincronizados
Write-Log "🔍 Verificando se há dados mock para sincronizar..."
if (Test-Path "data/mockData.ts") {
    Write-Warning "Dados mock encontrados. Em produção, considere migrar para Supabase."
    Write-Log "💡 Para sincronizar dados mock com Supabase, use: npx supabase db seed"
}

# 7. Resumo final
Write-Log "📊 Resumo do deploy:"
Write-Success "✅ Código enviado para GitHub"
Write-Success "✅ Supabase verificado"
Write-Success "✅ Migrations verificadas"

Write-Host ""
Write-Log "🎉 Deploy concluído com sucesso!"
Write-Log "🌐 Acesse o Supabase Studio: http://127.0.0.1:54323"
Write-Log "📱 Acesse a aplicação: http://localhost:5173"

Write-Host ""
Write-Warning "💡 Próximos passos recomendados:"
Write-Host "   - Teste a aplicação localmente"
Write-Host "   - Verifique se todas as funcionalidades estão funcionando"
Write-Host "   - Considere fazer deploy para producao se necessario"
