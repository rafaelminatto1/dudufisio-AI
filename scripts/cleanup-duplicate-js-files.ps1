# ============================================================================
# Script para Remover Arquivos .js Duplicados
# ============================================================================
# Descricao: Remove arquivos .js que possuem versao .ts equivalente
# Data: 2025-10-27
# Uso: powershell -ExecutionPolicy Bypass -File scripts/cleanup-duplicate-js-files.ps1
# ============================================================================

Write-Host "Iniciando limpeza de arquivos .js duplicados..." -ForegroundColor Cyan
Write-Host ""

$servicesDir = "services"
$removedCount = 0
$skippedCount = 0
$errors = @()

# Listar todos os arquivos .js no diretorio services
$jsFiles = Get-ChildItem -Path $servicesDir -Filter "*.js" -Recurse -File

Write-Host "Encontrados $($jsFiles.Count) arquivos .js" -ForegroundColor Yellow
Write-Host ""

foreach ($jsFile in $jsFiles) {
    $baseName = $jsFile.BaseName
    $directory = $jsFile.DirectoryName
    $tsFile = Join-Path $directory "$baseName.ts"
    
    # Verificar se existe arquivo .ts equivalente
    if (Test-Path $tsFile) {
        try {
            Write-Host "Removendo: $($jsFile.FullName)" -ForegroundColor Gray
            Remove-Item $jsFile.FullName -Force
            $removedCount++
        }
        catch {
            Write-Host "ERRO ao remover $($jsFile.Name): $_" -ForegroundColor Red
            $errors += $jsFile.FullName
        }
    }
    else {
        Write-Host "Mantido (sem .ts equivalente): $($jsFile.Name)" -ForegroundColor Yellow
        $skippedCount++
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Limpeza concluida!" -ForegroundColor Green
Write-Host ""
Write-Host "Estatisticas:" -ForegroundColor Cyan
Write-Host "  Arquivos removidos: $removedCount" -ForegroundColor Green
Write-Host "  Arquivos mantidos: $skippedCount" -ForegroundColor Yellow
Write-Host "  Erros: $($errors.Count)" -ForegroundColor Red

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Arquivos com erro:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  - $error" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Proximos passos:" -ForegroundColor Cyan
Write-Host "  1. Verificar se o build ainda funciona: npm run type-check"
Write-Host "  2. Executar testes: npm run test:unit"
Write-Host "  3. Commitar as mudancas se tudo estiver ok"
Write-Host ""
