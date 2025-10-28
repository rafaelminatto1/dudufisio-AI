# ============================================================================
# Script para Identificar Console.logs com Dados Sensiveis
# ============================================================================
# Descricao: Encontra console.log que podem estar expondo dados sensiveis
# Data: 2025-10-27
# Uso: powershell -ExecutionPolicy Bypass -File scripts/find-sensitive-console-logs.ps1
# ============================================================================

Write-Host "Procurando por console.logs com dados sensiveis..." -ForegroundColor Cyan
Write-Host ""

# Palavras-chave que indicam dados sensiveis
$sensitiveKeywords = @(
    "password",
    "senha",
    "token",
    "api_key",
    "apiKey",
    "secret",
    "cpf",
    "rg",
    "email",
    "phone",
    "telefone",
    "patient",
    "paciente",
    "user",
    "usuario",
    "auth",
    "credential",
    "key"
)

$totalFound = 0
$results = @{}

foreach ($keyword in $sensitiveKeywords) {
    Write-Host "Buscando por: $keyword" -ForegroundColor Yellow
    
    # Buscar em arquivos .ts e .tsx
    $matches = Select-String -Path ".\services\*.ts", ".\pages\*.tsx", ".\components\*.tsx" `
        -Pattern "console\.(log|error|warn).*$keyword" `
        -CaseSensitive:$false `
        -ErrorAction SilentlyContinue
    
    if ($matches) {
        $results[$keyword] = $matches
        $totalFound += $matches.Count
    }
}

Write-Host ""
Write-Host "================================================================================" -ForegroundColor Cyan
Write-Host "Resultados da Analise" -ForegroundColor Green
Write-Host ""

if ($totalFound -eq 0) {
    Write-Host "Nenhum console.log suspeito encontrado!" -ForegroundColor Green
}
else {
    Write-Host "ATENCAO: Encontrados $totalFound console.logs potencialmente sensiveis:" -ForegroundColor Red
    Write-Host ""
    
    foreach ($keyword in $results.Keys) {
        $matches = $results[$keyword]
        Write-Host "Palavra-chave: $keyword ($($matches.Count) ocorrencias)" -ForegroundColor Red
        
        foreach ($match in $matches | Select-Object -First 5) {
            Write-Host "   Arquivo: $($match.Path):$($match.LineNumber)" -ForegroundColor Gray
            Write-Host "      $($match.Line.Trim())" -ForegroundColor DarkGray
        }
        
        if ($matches.Count -gt 5) {
            Write-Host "      ... e mais $($matches.Count - 5) ocorrencias" -ForegroundColor Gray
        }
        Write-Host ""
    }
    
    Write-Host "================================================================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Recomendacoes:" -ForegroundColor Cyan
    Write-Host "  1. Revisar cada console.log listado acima" -ForegroundColor White
    Write-Host "  2. Remover ou sanitizar dados sensiveis" -ForegroundColor White
    Write-Host "  3. Substituir por lib/logger para logs estruturados" -ForegroundColor White
    Write-Host "  4. Adicionar linter rule para bloquear console.log em producao" -ForegroundColor White
}

Write-Host ""
