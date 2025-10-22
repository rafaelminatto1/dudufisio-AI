# Script para configurar GitHub Secrets automaticamente
# Autor: AI Assistant
# Data: 2025-10-22

Write-Host "Configuracao Automatica dos GitHub Secrets" -ForegroundColor Cyan
Write-Host ""
Write-Host "Este script ira configurar os secrets necessarios para o deploy automatico." -ForegroundColor Yellow
Write-Host ""

# 1. SUPABASE_PROJECT_REF (ja conhecemos)
$PROJECT_REF = "urfxniitfbbvsaskicfo"
Write-Host "SUPABASE_PROJECT_REF: $PROJECT_REF" -ForegroundColor Green
Write-Host ""

# 2. Obter SUPABASE_ACCESS_TOKEN
Write-Host "Para obter o SUPABASE_ACCESS_TOKEN:" -ForegroundColor Cyan
Write-Host "   1. Acesse: https://supabase.com/dashboard/account/tokens" -ForegroundColor White
Write-Host "   2. Clique em Generate new token" -ForegroundColor White
Write-Host "   3. De um nome: GitHub Actions" -ForegroundColor White
Write-Host "   4. Copie o token gerado" -ForegroundColor White
Write-Host ""

# Abrir o navegador automaticamente
Start-Process "https://supabase.com/dashboard/account/tokens"
Write-Host "Abrindo o Supabase Dashboard no navegador..." -ForegroundColor Green
Write-Host ""

# Aguardar o usuario obter o token
Write-Host "Cole o SUPABASE_ACCESS_TOKEN aqui (pressione Enter apos colar):" -ForegroundColor Yellow
$SUPABASE_TOKEN = Read-Host

if ([string]::IsNullOrWhiteSpace($SUPABASE_TOKEN)) {
    Write-Host "Token nao fornecido. Abortando..." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Token recebido!" -ForegroundColor Green
Write-Host ""

# 3. Configurar secrets no GitHub
Write-Host "Configurando secrets no GitHub..." -ForegroundColor Cyan
Write-Host ""

# Verificar se gh esta instalado e autenticado
try {
    $ghStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "GitHub CLI nao esta autenticado. Execute: gh auth login" -ForegroundColor Red
        exit 1
    }
    Write-Host "GitHub CLI autenticado" -ForegroundColor Green
}
catch {
    Write-Host "GitHub CLI nao esta instalado. Instale: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Configurar SUPABASE_ACCESS_TOKEN
Write-Host "Configurando SUPABASE_ACCESS_TOKEN..." -ForegroundColor Yellow
echo $SUPABASE_TOKEN | gh secret set SUPABASE_ACCESS_TOKEN --repo rafaelminatto1/dudufisio-AI

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUPABASE_ACCESS_TOKEN configurado com sucesso!" -ForegroundColor Green
}
else {
    Write-Host "Erro ao configurar SUPABASE_ACCESS_TOKEN" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Configurar SUPABASE_PROJECT_REF
Write-Host "Configurando SUPABASE_PROJECT_REF..." -ForegroundColor Yellow
echo $PROJECT_REF | gh secret set SUPABASE_PROJECT_REF --repo rafaelminatto1/dudufisio-AI

if ($LASTEXITCODE -eq 0) {
    Write-Host "SUPABASE_PROJECT_REF configurado com sucesso!" -ForegroundColor Green
}
else {
    Write-Host "Erro ao configurar SUPABASE_PROJECT_REF" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Configuracao concluida com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "   1. Faca um push para testar: git push origin main" -ForegroundColor White
Write-Host "   2. Verifique as Actions: https://github.com/rafaelminatto1/dudufisio-AI/actions" -ForegroundColor White
Write-Host "   3. Confirme que o deploy automatico funcionou!" -ForegroundColor White
Write-Host ""
Write-Host "Seu deploy automatico esta pronto!" -ForegroundColor Green
