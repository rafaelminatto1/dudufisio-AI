# Script simples de verificacao do setup
# Sem caracteres especiais - compatibilidade Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " VERIFICACAO DE SETUP - DUDUFISIO AI   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Contador de checks
$passed = 0
$total = 0

# CHECK 1: Node.js
$total++
Write-Host "CHECK 1: Node.js..." -ForegroundColor Yellow
$nodeVer = node --version 2>$null
if ($nodeVer) {
    Write-Host "  OK - Version: $nodeVer" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - Node.js nao encontrado" -ForegroundColor Red
}

# CHECK 2: npm
$total++
Write-Host "CHECK 2: npm..." -ForegroundColor Yellow
$npmVer = npm --version 2>$null
if ($npmVer) {
    Write-Host "  OK - Version: $npmVer" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - npm nao encontrado" -ForegroundColor Red
}

# CHECK 3: node_modules
$total++
Write-Host "CHECK 3: Dependencias..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  OK - node_modules existe" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - Execute: npm install" -ForegroundColor Red
}

# CHECK 4: Supabase CLI
$total++
Write-Host "CHECK 4: Supabase CLI..." -ForegroundColor Yellow
$supabaseVer = supabase --version 2>$null
if ($supabaseVer) {
    Write-Host "  OK - Version: $supabaseVer" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  WARN - Opcional para uso via Dashboard" -ForegroundColor Yellow
}

# CHECK 5: .env.local
$total++
Write-Host "CHECK 5: Arquivo .env.local..." -ForegroundColor Yellow
if (Test-Path ".env.local") {
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL") {
        Write-Host "  OK - Configurado" -ForegroundColor Green
        $passed++
    } else {
        Write-Host "  FAIL - Faltam variaveis" -ForegroundColor Red
    }
} else {
    Write-Host "  FAIL - Arquivo nao existe. Veja: env.supabase.example" -ForegroundColor Red
}

# CHECK 6: Migration file
$total++
Write-Host "CHECK 6: Migration criada..." -ForegroundColor Yellow
if (Test-Path "supabase\migrations\20251009_complete_patients_management_system.sql") {
    Write-Host "  OK - Migration encontrada" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - Migration nao encontrada" -ForegroundColor Red
}

# CHECK 7: Hooks
$total++
Write-Host "CHECK 7: Hooks implementados..." -ForegroundColor Yellow
if (Test-Path "hooks\usePatients.query.ts") {
    Write-Host "  OK - Hooks criados" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - Hooks nao encontrados" -ForegroundColor Red
}

# CHECK 8: Services
$total++
Write-Host "CHECK 8: Services criados..." -ForegroundColor Yellow
if (Test-Path "services\supabase\patientService.ts") {
    Write-Host "  OK - Service Layer criado" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - Services nao encontrados" -ForegroundColor Red
}

# CHECK 9: Components
$total++
Write-Host "CHECK 9: Componentes UI..." -ForegroundColor Yellow
$compCount = 0
if (Test-Path "components\patients\PatientListModern.tsx") { $compCount++ }
if (Test-Path "components\patients\PatientDetailsTabs.tsx") { $compCount++ }

if ($compCount -eq 2) {
    Write-Host "  OK - Componentes criados" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  PARTIAL - $compCount/2 componentes" -ForegroundColor Yellow
}

# CHECK 10: Supabase Client
$total++
Write-Host "CHECK 10: Supabase Client..." -ForegroundColor Yellow
if (Test-Path "lib\supabaseClient.ts") {
    Write-Host "  OK - Cliente configurado" -ForegroundColor Green
    $passed++
} else {
    Write-Host "  FAIL - Cliente nao encontrado" -ForegroundColor Red
}

# RESULTADO
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " RESULTADO: $passed/$total checks OK" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if ($passed -ge 8) {
    Write-Host "EXCELENTE! Sistema quase pronto!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Proximos passos:" -ForegroundColor Cyan
    Write-Host "1. Aplicar migration no Supabase Dashboard" -ForegroundColor White
    Write-Host "2. Configurar .env.local (se ainda nao fez)" -ForegroundColor White
    Write-Host "3. Testar: npx tsx scripts\test-supabase-connection.ts" -ForegroundColor White
    Write-Host "4. Iniciar: npm run dev" -ForegroundColor White
    Write-Host ""
    Write-Host "Veja: QUICK_START_3_PASSOS.md" -ForegroundColor Yellow
} elseif ($passed -ge 5) {
    Write-Host "BOM! Algumas configuracoes pendentes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Resolva os items com FAIL acima" -ForegroundColor White
} else {
    Write-Host "ATENCAO! Muitas configuracoes faltando" -ForegroundColor Red
    Write-Host ""
    Write-Host "Execute: npm install" -ForegroundColor White
    Write-Host "Veja: README_IMPLEMENTACAO_COMPLETA.md" -ForegroundColor White
}

Write-Host ""

