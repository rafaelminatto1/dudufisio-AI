# ============================================================================
# Script de Validacao das Correcoes de Seguranca
# ============================================================================
# Descricao: Valida que as correcoes de seguranca foram aplicadas corretamente
# Data: 2025-10-27
# Uso: powershell -ExecutionPolicy Bypass -File scripts/validate-security-fixes.ps1
# ============================================================================

Write-Host "Validando Correcoes de Seguranca..." -ForegroundColor Cyan
Write-Host ""

$allPassed = $true

# ============================================================================
# 1. Verificar API Keys Hardcoded
# ============================================================================
Write-Host "1. Verificando API keys hardcoded..." -ForegroundColor Yellow

$hardcodedKeys = Select-String -Path ".\services\**\*.ts" `
    -Pattern "AIzaSy[a-zA-Z0-9_-]{33}" `
    -ErrorAction SilentlyContinue

if ($hardcodedKeys) {
    Write-Host "   FALHA: Ainda existem API keys hardcoded!" -ForegroundColor Red
    $hardcodedKeys | ForEach-Object {
        Write-Host "      $($_.Path):$($_.LineNumber)" -ForegroundColor Red
    }
    $allPassed = $false
}
else {
    Write-Host "   PASSOU: Nenhuma API key hardcoded encontrada" -ForegroundColor Green
}

# ============================================================================
# 2. Verificar .env.example
# ============================================================================
Write-Host ""
Write-Host "2. Verificando .env.example..." -ForegroundColor Yellow

$envExample = Get-Content ".env.example" -Raw
if ($envExample -match "eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+") {
    Write-Host "   FALHA: .env.example ainda contem chaves reais!" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "   PASSOU: .env.example nao contem chaves reais" -ForegroundColor Green
}

# ============================================================================
# 3. Verificar TypeScript Strict Flags
# ============================================================================
Write-Host ""
Write-Host "3. Verificando TypeScript strict flags..." -ForegroundColor Yellow

$tsconfig = Get-Content "tsconfig.json" -Raw | ConvertFrom-Json

$expectedFlags = @{
    "strictNullChecks" = $true
    "strictFunctionTypes" = $true
    "strictBindCallApply" = $true
    "noFallthroughCasesInSwitch" = $true
    "noUncheckedIndexedAccess" = $true
    "noImplicitReturns" = $true
    "alwaysStrict" = $true
}

$flagsOk = $true
foreach ($flag in $expectedFlags.Keys) {
    $expected = $expectedFlags[$flag]
    $actual = $tsconfig.compilerOptions.$flag
    
    if ($actual -ne $expected) {
        Write-Host "   FALHA: $flag deveria ser $expected mas e $actual" -ForegroundColor Red
        $flagsOk = $false
        $allPassed = $false
    }
}

if ($flagsOk) {
    Write-Host "   PASSOU: Flags de type safety configuradas corretamente" -ForegroundColor Green
}

# ============================================================================
# 4. Verificar Migration de RLS
# ============================================================================
Write-Host ""
Write-Host "4. Verificando migration de RLS..." -ForegroundColor Yellow

$rlsMigration = "supabase\migrations\20251027000010_reenable_rls_production.sql"
if (Test-Path $rlsMigration) {
    $migrationContent = Get-Content $rlsMigration -Raw
    
    if ($migrationContent -match "ENABLE ROW LEVEL SECURITY" -and 
        $migrationContent -match "CREATE POLICY") {
        Write-Host "   PASSOU: Migration de RLS criada corretamente" -ForegroundColor Green
    }
    else {
        Write-Host "   FALHA: Migration de RLS incompleta" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "   FALHA: Migration de RLS nao encontrada" -ForegroundColor Red
    $allPassed = $false
}

# ============================================================================
# 5. Verificar Remocao de Arquivos .js Duplicados
# ============================================================================
Write-Host ""
Write-Host "5. Verificando arquivos .js duplicados..." -ForegroundColor Yellow

$criticalJsFiles = @(
    "services\acompanhamentoService.js",
    "services\activityService.js",
    "services\appointmentService.js",
    "services\patientService.js",
    "services\userService.js"
)

$stillExists = $false
foreach ($file in $criticalJsFiles) {
    if (Test-Path $file) {
        Write-Host "   FALHA: Ainda existe: $file" -ForegroundColor Red
        $stillExists = $true
        $allPassed = $false
    }
}

if (-not $stillExists) {
    Write-Host "   PASSOU: Arquivos .js criticos removidos" -ForegroundColor Green
}

# ============================================================================
# 6. Verificar Tipos Duplicados
# ============================================================================
Write-Host ""
Write-Host "6. Verificando tipos duplicados em types.ts..." -ForegroundColor Yellow

$typesContent = Get-Content "types.ts" -Raw

# Verificar se MovementType enum DEPRECATED foi removido
if ($typesContent -match "export enum MovementType \{") {
    Write-Host "   FALHA: MovementType enum DEPRECATED ainda existe" -ForegroundColor Red
    $allPassed = $false
}
else {
    Write-Host "   PASSOU: Tipos DEPRECATED removidos" -ForegroundColor Green
}

# ============================================================================
# Resultado Final
# ============================================================================
Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan

if ($allPassed) {
    Write-Host "TODAS AS VALIDACOES PASSARAM!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "  1. Executar type-check: npm run type-check" -ForegroundColor White
    Write-Host "  2. Executar testes: npm run test:unit" -ForegroundColor White
    Write-Host "  3. Aplicar migration de RLS em staging" -ForegroundColor White
    Write-Host "  4. Revogar API key antiga no Google Cloud Console" -ForegroundColor White
    exit 0
}
else {
    Write-Host "ALGUMAS VALIDACOES FALHARAM!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Revise os erros acima e corrija antes de prosseguir." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
