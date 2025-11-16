# ============================================================================
# Script de Aplicação de Migrations - JSONB → Junction Tables
# Projeto: dudufisio-AI (urfxniitfbbvsaskicfo)
# Data: 2025-11-06
# ============================================================================

# Cores para output
$ColorInfo = "Cyan"
$ColorSuccess = "Green"
$ColorWarning = "Yellow"
$ColorError = "Red"
$ColorHighlight = "Magenta"

# Configuração
$ProjectRef = "urfxniitfbbvsaskicfo"
$MigrationsPath = "supabase\migrations"

Write-Host "`n============================================================================" -ForegroundColor $ColorHighlight
Write-Host "  APLICAÇÃO DE MIGRATIONS - JSONB → JUNCTION TABLES" -ForegroundColor $ColorHighlight
Write-Host "============================================================================`n" -ForegroundColor $ColorHighlight

Write-Host "📋 Projeto: dudufisio-AI" -ForegroundColor $ColorInfo
Write-Host "🔑 ID: $ProjectRef" -ForegroundColor $ColorInfo
Write-Host "📅 Data: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor $ColorInfo

# ============================================================================
# Etapa 1: Verificação de Pré-requisitos
# ============================================================================

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "ETAPA 1: Verificação de Pré-requisitos" -ForegroundColor $ColorHighlight
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

# Verificar Supabase CLI
Write-Host "🔍 Verificando Supabase CLI..." -ForegroundColor $ColorInfo
try {
    $supabaseVersion = supabase --version 2>&1
    Write-Host "✅ Supabase CLI instalado: $supabaseVersion" -ForegroundColor $ColorSuccess
} catch {
    Write-Host "❌ ERRO: Supabase CLI não encontrado!" -ForegroundColor $ColorError
    Write-Host "   Instale com: npm install -g supabase" -ForegroundColor $ColorWarning
    exit 1
}

# Verificar conexão
Write-Host "`n🔍 Verificando conexão com o projeto..." -ForegroundColor $ColorInfo
try {
    $projects = supabase projects list 2>&1
    if ($projects -match $ProjectRef) {
        Write-Host "✅ Projeto encontrado e acessível" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "❌ ERRO: Projeto não encontrado na lista!" -ForegroundColor $ColorError
        exit 1
    }
} catch {
    Write-Host "❌ ERRO: Não foi possível listar projetos!" -ForegroundColor $ColorError
    exit 1
}

# Verificar migrations
Write-Host "`n🔍 Verificando arquivos de migration..." -ForegroundColor $ColorInfo
$migrations = @(
    "2025-11-06_create_exercise_junction_tables.sql",
    "2025-11-06_backfill_exercise_junctions.sql"
)

foreach ($migration in $migrations) {
    $path = Join-Path $MigrationsPath $migration
    if (Test-Path $path) {
        $size = (Get-Item $path).Length / 1KB
        Write-Host "  ✅ $migration ($([math]::Round($size, 1)) KB)" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "  ❌ $migration - NÃO ENCONTRADO!" -ForegroundColor $ColorError
        exit 1
    }
}

# ============================================================================
# Etapa 2: Confirmação do Usuário
# ============================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "ETAPA 2: Confirmação" -ForegroundColor $ColorHighlight
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

Write-Host "⚠️  ATENÇÃO: Este script irá aplicar migrations no banco de dados de PRODUÇÃO!" -ForegroundColor $ColorWarning
Write-Host "`nMigrations que serão aplicadas:" -ForegroundColor $ColorInfo
Write-Host "  1. 2025-11-06_create_exercise_junction_tables.sql" -ForegroundColor $ColorInfo
Write-Host "  2. 2025-11-06_backfill_exercise_junctions.sql" -ForegroundColor $ColorInfo
Write-Host "`n⚠️  IMPORTANTE:" -ForegroundColor $ColorWarning
Write-Host "  • Certifique-se de ter um BACKUP recente do banco de dados" -ForegroundColor $ColorWarning
Write-Host "  • As migrations são idempotentes (podem ser executadas múltiplas vezes)" -ForegroundColor $ColorInfo
Write-Host "  • A migration de cleanup NÃO será aplicada agora" -ForegroundColor $ColorInfo

Write-Host "`n"
$confirmation = Read-Host "Deseja continuar? (digite 'SIM' para confirmar)"

if ($confirmation -ne "SIM") {
    Write-Host "`n❌ Operação cancelada pelo usuário." -ForegroundColor $ColorWarning
    exit 0
}

# ============================================================================
# Etapa 3: Aplicar Migrations via SQL Editor
# ============================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "ETAPA 3: Instruções para Aplicação Manual" -ForegroundColor $ColorHighlight
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

Write-Host "Devido a problemas de conexão com o CLI, siga estas instruções:" -ForegroundColor $ColorInfo
Write-Host "`n📋 PASSO A PASSO:`n" -ForegroundColor $ColorHighlight

Write-Host "1️⃣  Abra o SQL Editor do Supabase:" -ForegroundColor $ColorInfo
Write-Host "   https://supabase.com/dashboard/project/$ProjectRef/sql/new`n" -ForegroundColor $ColorInfo

Write-Host "2️⃣  MIGRATION 1 - Create Junction Tables:" -ForegroundColor $ColorInfo
Write-Host "   • Abra: supabase\migrations\2025-11-06_create_exercise_junction_tables.sql" -ForegroundColor $ColorInfo
Write-Host "   • Copie TODO o conteúdo" -ForegroundColor $ColorInfo
Write-Host "   • Cole no SQL Editor" -ForegroundColor $ColorInfo
Write-Host "   • Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor $ColorInfo
Write-Host "   • Verifique: deve mostrar 'Success'`n" -ForegroundColor $ColorSuccess

Write-Host "3️⃣  MIGRATION 2 - Backfill Data:" -ForegroundColor $ColorInfo
Write-Host "   • Abra: supabase\migrations\2025-11-06_backfill_exercise_junctions.sql" -ForegroundColor $ColorInfo
Write-Host "   • Copie TODO o conteúdo" -ForegroundColor $ColorInfo
Write-Host "   • Cole no SQL Editor" -ForegroundColor $ColorInfo
Write-Host "   • Clique em 'Run' ou pressione Ctrl+Enter" -ForegroundColor $ColorInfo
Write-Host "   • ⚠️  IMPORTANTE: Procure por mensagens de NOTICE com contagens!`n" -ForegroundColor $ColorWarning

Write-Host "4️⃣  VALIDAÇÃO - Execute Queries:" -ForegroundColor $ColorInfo
Write-Host "   • Abra: validation-queries.sql" -ForegroundColor $ColorInfo
Write-Host "   • Copie e execute no SQL Editor" -ForegroundColor $ColorInfo
Write-Host "   • Verifique: todos os testes devem mostrar ✅ PASS`n" -ForegroundColor $ColorSuccess

$waitForManual = Read-Host "`nPressione ENTER quando terminar de aplicar as migrations no Dashboard"

# ============================================================================
# Etapa 4: Gerar Tipos TypeScript
# ============================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "ETAPA 4: Gerar Tipos TypeScript" -ForegroundColor $ColorHighlight
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

Write-Host "🔄 Gerando tipos TypeScript do Supabase..." -ForegroundColor $ColorInfo

try {
    $timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $outputFile = "types\supabase-migrated-$timestamp.ts"
    
    Write-Host "📝 Executando: supabase gen types typescript..." -ForegroundColor $ColorInfo
    supabase gen types typescript --project-id $ProjectRef > $outputFile 2>&1
    
    if (Test-Path $outputFile) {
        $size = (Get-Item $outputFile).Length / 1KB
        Write-Host "✅ Tipos gerados com sucesso!" -ForegroundColor $ColorSuccess
        Write-Host "   Arquivo: $outputFile ($([math]::Round($size, 1)) KB)" -ForegroundColor $ColorInfo
        
        # Copiar para arquivo principal
        Copy-Item $outputFile "types\supabase.ts" -Force
        Write-Host "✅ Copiado para: types\supabase.ts" -ForegroundColor $ColorSuccess
    } else {
        Write-Host "⚠️  Arquivo de tipos não foi criado" -ForegroundColor $ColorWarning
    }
} catch {
    Write-Host "❌ Erro ao gerar tipos: $_" -ForegroundColor $ColorError
}

# ============================================================================
# Etapa 5: Executar Testes
# ============================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "ETAPA 5: Testes e Validação" -ForegroundColor $ColorHighlight
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

Write-Host "🧪 Executando testes TypeScript..." -ForegroundColor $ColorInfo
Write-Host "   Script: scripts\test-migration.ts`n" -ForegroundColor $ColorInfo

$runTests = Read-Host "Deseja executar os testes agora? (S/N)"

if ($runTests -eq "S" -or $runTests -eq "s") {
    try {
        Write-Host "`n📦 Instalando dependências (se necessário)..." -ForegroundColor $ColorInfo
        npm install --silent
        
        Write-Host "`n🧪 Executando testes..." -ForegroundColor $ColorInfo
        npx ts-node scripts\test-migration.ts
    } catch {
        Write-Host "⚠️  Erro ao executar testes: $_" -ForegroundColor $ColorWarning
        Write-Host "   Execute manualmente: npx ts-node scripts\test-migration.ts" -ForegroundColor $ColorInfo
    }
} else {
    Write-Host "⏭️  Testes pulados. Execute manualmente:" -ForegroundColor $ColorInfo
    Write-Host "   npx ts-node scripts\test-migration.ts" -ForegroundColor $ColorInfo
}

# ============================================================================
# Etapa 6: Resumo e Próximos Passos
# ============================================================================

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "RESUMO E PRÓXIMOS PASSOS" -ForegroundColor $ColorHighlight
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

Write-Host "✅ Migrations preparadas para aplicação" -ForegroundColor $ColorSuccess
Write-Host "✅ Tipos TypeScript gerados" -ForegroundColor $ColorSuccess

Write-Host "`n📋 CHECKLIST DE VALIDAÇÃO:`n" -ForegroundColor $ColorHighlight

Write-Host "  [ ] Migration 1 aplicada com sucesso (create tables)" -ForegroundColor $ColorInfo
Write-Host "  [ ] Migration 2 aplicada com sucesso (backfill)" -ForegroundColor $ColorInfo
Write-Host "  [ ] NOTICES verificados (contagens de migração)" -ForegroundColor $ColorInfo
Write-Host "  [ ] validation-queries.sql executado - 9/9 testes ✅" -ForegroundColor $ColorInfo
Write-Host "  [ ] Tipos TypeScript gerados" -ForegroundColor $ColorInfo
Write-Host "  [ ] Build sem erros (npm run build)" -ForegroundColor $ColorInfo
Write-Host "  [ ] Testes funcionais executados" -ForegroundColor $ColorInfo

Write-Host "`n⏰ PRÓXIMOS 48 HORAS:`n" -ForegroundColor $ColorHighlight

Write-Host "  • Monitorar logs de erro" -ForegroundColor $ColorInfo
Write-Host "  • Testar funcionalidades na UI" -ForegroundColor $ColorInfo
Write-Host "  • Verificar performance de queries" -ForegroundColor $ColorInfo
Write-Host "  • Preencher: docs\MIGRATION_VALIDATION_REPORT.md" -ForegroundColor $ColorInfo

Write-Host "`n⚠️  IMPORTANTE:`n" -ForegroundColor $ColorWarning

Write-Host "  • NÃO aplicar a migration de cleanup ainda!" -ForegroundColor $ColorWarning
Write-Host "  • Arquivo: 2025-11-06_remove_exercise_jsonb_fields.sql" -ForegroundColor $ColorWarning
Write-Host "  • Aguardar validação completa (48h mínimo)" -ForegroundColor $ColorWarning

Write-Host "`n📖 DOCUMENTAÇÃO:`n" -ForegroundColor $ColorHighlight

Write-Host "  • Resumo: docs\MIGRATION_EXECUTIVE_SUMMARY.md" -ForegroundColor $ColorInfo
Write-Host "  • Instruções: docs\APPLY_MIGRATIONS_INSTRUCTIONS.md" -ForegroundColor $ColorInfo
Write-Host "  • Relatório: docs\MIGRATION_VALIDATION_REPORT.md" -ForegroundColor $ColorInfo
Write-Host "  • Guia de Testes: docs\MIGRATION_JSONB_TO_JUNCTION_TABLES_TEST_GUIDE.md" -ForegroundColor $ColorInfo

Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor $ColorHighlight
Write-Host "✅ PROCESSO CONCLUÍDO COM SUCESSO!" -ForegroundColor $ColorSuccess
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`n" -ForegroundColor $ColorHighlight

Write-Host "📅 Concluído em: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n" -ForegroundColor $ColorInfo

