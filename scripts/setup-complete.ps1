# Script completo de setup do sistema
# Executa todos os passos necessários automaticamente

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🚀 SETUP COMPLETO - DUDUFISIO AI             ║" -ForegroundColor Cyan
Write-Host "║  Sistema de Gestão de Pacientes               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$totalSteps = 7
$currentStep = 0

function Show-Progress {
    param($step, $message)
    $global:currentStep = $step
    $percent = [math]::Round(($step / $totalSteps) * 100)
    $barLength = [math]::Round($percent / 5)
    $bar = "#" * $barLength
    $spaces = "-" * (20 - $barLength)
    
    Write-Host ""
    Write-Host "[$bar$spaces] $percent% - Passo $step/$totalSteps" -ForegroundColor Yellow
    Write-Host ">> $message" -ForegroundColor White
    Write-Host ""
}

# PASSO 1: Verificar Node.js e npm
Show-Progress 1 "Verificando Node.js e npm..."

$nodeVersion = node --version 2>$null
$npmVersion = npm --version 2>$null

if ($nodeVersion -and $npmVersion) {
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
    Write-Host "  ✅ npm: $npmVersion" -ForegroundColor Green
} else {
    Write-Host "  ❌ Node.js ou npm não encontrado!" -ForegroundColor Red
    Write-Host "  Instale em: https://nodejs.org" -ForegroundColor Yellow
    exit 1
}

# PASSO 2: Verificar dependências
Show-Progress 2 "Verificando dependências do projeto..."

if (Test-Path "package.json") {
    Write-Host "  ✅ package.json encontrado" -ForegroundColor Green
    
    # Verificar se node_modules existe
    if (!(Test-Path "node_modules")) {
        Write-Host "  📦 Instalando dependências..." -ForegroundColor Yellow
        npm install --legacy-peer-deps
        
        if ($?) {
            Write-Host "  ✅ Dependências instaladas!" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Erro ao instalar dependências" -ForegroundColor Red
            exit 1
        }
    } else {
        Write-Host "  ✅ node_modules já existe" -ForegroundColor Green
    }
} else {
    Write-Host "  ❌ package.json não encontrado!" -ForegroundColor Red
    exit 1
}

# PASSO 3: Verificar Supabase CLI
Show-Progress 3 "Verificando Supabase CLI..."

$supabaseVersion = supabase --version 2>$null

if ($supabaseVersion) {
    Write-Host "  ✅ Supabase CLI: $supabaseVersion" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  Supabase CLI não encontrado" -ForegroundColor Yellow
    Write-Host "  Instale com: npm install -g supabase" -ForegroundColor White
    Write-Host "  ou: scoop install supabase" -ForegroundColor White
}

# PASSO 4: Verificar arquivo .env.local
Show-Progress 4 "Verificando configuração..."

if (Test-Path ".env.local") {
    Write-Host "  ✅ .env.local encontrado" -ForegroundColor Green
    
    # Verificar se tem as keys necessárias
    $envContent = Get-Content ".env.local" -Raw
    
    if ($envContent -match "NEXT_PUBLIC_SUPABASE_URL" -and $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY") {
        Write-Host "  ✅ Variáveis Supabase configuradas" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Variáveis Supabase não encontradas" -ForegroundColor Yellow
        Write-Host "  Veja: env.supabase.example" -ForegroundColor White
    }
} else {
    Write-Host "  ⚠️  .env.local não encontrado" -ForegroundColor Yellow
    Write-Host ""
    
    $createEnv = Read-Host "  Deseja criar .env.local agora? (s/n)"
    
    if ($createEnv -eq "s" -or $createEnv -eq "S") {
        if (Test-Path "env.supabase.example") {
            Copy-Item "env.supabase.example" ".env.local"
            Write-Host "  ✅ .env.local criado!" -ForegroundColor Green
            Write-Host "  📝 EDITE O ARQUIVO e adicione suas keys:" -ForegroundColor Yellow
            Write-Host "     https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api" -ForegroundColor White
            Write-Host ""
            
            # Abrir no editor
            code ".env.local"
        }
    }
}

# PASSO 5: Verificar migrations
Show-Progress 5 "Verificando migrations..."

$migrationFile = "supabase\migrations\20251009_complete_patients_management_system.sql"

if (Test-Path $migrationFile) {
    Write-Host "  ✅ Migration encontrada" -ForegroundColor Green
    
    $migrationSize = (Get-Item $migrationFile).Length
    Write-Host "  📊 Tamanho: $([math]::Round($migrationSize/1024, 2)) KB" -ForegroundColor White
} else {
    Write-Host "  ❌ Migration não encontrada!" -ForegroundColor Red
}

# PASSO 6: Verificar hooks e services
Show-Progress 6 "Verificando arquivos implementados..."

$filesToCheck = @(
    "hooks\usePatients.query.ts",
    "services\supabase\patientService.ts",
    "components\patients\PatientListModern.tsx",
    "components\patients\PatientDetailsTabs.tsx"
)

$filesFound = 0

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        $filesFound++
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file não encontrado" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "  📊 Arquivos: $filesFound/$($filesToCheck.Count) encontrados" -ForegroundColor $(if ($filesFound -eq $filesToCheck.Count) { "Green" } else { "Yellow" })

# PASSO 7: Verificar componentes shadcn
Show-Progress 7 "Verificando componentes UI..."

$components = @("tabs", "accordion", "badge", "select", "alert-dialog", "button", "card", "input")
$componentsFound = 0

foreach ($comp in $components) {
    if (Test-Path "components\ui\$comp.tsx") {
        $componentsFound++
    }
}

Write-Host "  📦 Componentes shadcn: $componentsFound/$($components.Count)" -ForegroundColor $(if ($componentsFound -ge 5) { "Green" } else { "Yellow" })

# RESUMO FINAL
Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📊 RESUMO DO SETUP" -ForegroundColor Cyan
Write-Host ""

$checks = @{
    "Node.js e npm" = ($nodeVersion -and $npmVersion)
    "Dependências instaladas" = (Test-Path "node_modules")
    "Supabase CLI" = ($supabaseVersion -ne $null)
    ".env.local configurado" = (Test-Path ".env.local")
    "Migration criada" = (Test-Path $migrationFile)
    "Hooks implementados" = ($filesFound -eq $filesToCheck.Count)
    "Componentes UI" = ($componentsFound -ge 5)
}

$totalChecks = $checks.Count
$passedChecks = ($checks.Values | Where-Object { $_ -eq $true }).Count

foreach ($check in $checks.GetEnumerator()) {
    $status = if ($check.Value) { "✅" } else { "⚠️ " }
    $color = if ($check.Value) { "Green" } else { "Yellow" }
    Write-Host "  $status $($check.Key)" -ForegroundColor $color
}

Write-Host ""
Write-Host "  Score: $passedChecks/$totalChecks checks passaram" -ForegroundColor $(if ($passedChecks -eq $totalChecks) { "Green" } else { "Yellow" })
Write-Host ""

# PRÓXIMOS PASSOS
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 PRÓXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host ""

if (!(Test-Path ".env.local")) {
    Write-Host "  1️⃣  Criar .env.local com suas keys do Supabase" -ForegroundColor Yellow
    Write-Host "     Veja: env.supabase.example" -ForegroundColor White
    Write-Host ""
}

Write-Host "  2️⃣  Aplicar migration no Supabase" -ForegroundColor Yellow
Write-Host "     Execute: .\scripts\apply-migrations.ps1" -ForegroundColor White
Write-Host "     Ou veja: ⚡_QUICK_START_3_PASSOS.md" -ForegroundColor White
Write-Host ""

Write-Host "  3️⃣  Testar conexão" -ForegroundColor Yellow
Write-Host "     Execute: npx tsx scripts\test-supabase-connection.ts" -ForegroundColor White
Write-Host ""

Write-Host "  4️⃣  Iniciar servidor de desenvolvimento" -ForegroundColor Yellow
Write-Host "     Execute: npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "  5️⃣  Testar na interface" -ForegroundColor Yellow
Write-Host "     Abra: http://localhost:5176" -ForegroundColor White
Write-Host ""

# DOCUMENTAÇÃO
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "📚 DOCUMENTAÇÃO DISPONÍVEL:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  ⚡ Quick Start (COMECE AQUI):" -ForegroundColor White
Write-Host "     ⚡_QUICK_START_3_PASSOS.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "  🎯 Resumo Executivo:" -ForegroundColor White
Write-Host "     🎯_ENTREGA_FINAL_EXECUTIVO.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "  📐 Arquitetura Completa:" -ForegroundColor White
Write-Host "     📐_ARQUITETURA_VISUAL_COMPLETA.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "  >> Plano Estrategico (6 meses):" -ForegroundColor White
Write-Host "     PLANO_MELHORIAS_COMPLETO_SISTEMA.md" -ForegroundColor Yellow
Write-Host ""

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($passedChecks -eq $totalChecks) {
    Write-Host "🎉 TUDO PRONTO! Sistema configurado corretamente!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Execute agora:" -ForegroundColor Cyan
    Write-Host "  .\scripts\apply-migrations.ps1" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "⚠️  Algumas configurações pendentes" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Resolva os itens marcados com ⚠️  acima" -ForegroundColor White
    Write-Host ""
}

Write-Host "Boa sorte! 🚀" -ForegroundColor Cyan
Write-Host ""

