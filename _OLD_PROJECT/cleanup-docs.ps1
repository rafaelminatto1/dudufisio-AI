# Script para limpar documentação redundante
# Mantém apenas: README.md, CLAUDE.md, CHANGELOG.md, LICENSE.md, docs/, 📋_PLANO_CONCLUSAO_PROJETO.md

Write-Host "🗑️  Iniciando limpeza de documentação..." -ForegroundColor Yellow

# Lista de padrões para DELETAR (arquivos obsoletos)
$patternsToDelete = @(
    "*FINAL*.md",
    "*RESUMO*.md",
    "*GUIA_*.md",
    "*TODO*.md",
    "*SESSAO*.md",
    "*CHECKLIST*.md",
    "*CONQUISTA*.md",
    "*MISSAO*.md",
    "*OBRIGADO*.md",
    "*ACOES*.md",
    "*IMPLEMENTA*.md",
    "*RELATORIO*.md",
    "*PLANEJAMENTO*.md",
    "*CORRECAO*.md",
    "*CORREC*.md",
    "*FIX_*.md",
    "*ANALISE*.md",
    "*CRUD_*.md",
    "*CLINICAL_CONTENT*.md",
    "*QUICK_START*.md",
    "✅*.md",
    "🎉*.md",
    "🎊*.md",
    "🎬*.md",
    "🎯*.md",
    "🎨*.md",
    "🏆*.md",
    "🏁*.md",
    "📋*.md",
    "📊*.md",
    "📚*.md",
    "📖*.md",
    "📱*.md",
    "📦*.md",
    "🚀*.md",
    "🔧*.md",
    "🧪*.md",
    "🧠*.md",
    "⚡*.md",
    "✨*.md",
    "🌟*.md",
    "👥*.md"
)

# Arquivos para MANTER
$filesToKeep = @(
    "README.md",
    "CLAUDE.md",
    "CHANGELOG.md",
    "LICENSE.md"
)

$deletedCount = 0
$keptCount = 0

# Deletar arquivos por padrão
foreach ($pattern in $patternsToDelete) {
    $files = Get-ChildItem -Path "." -Filter $pattern -File -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        # Verifica se não está na lista de manter
        if ($filesToKeep -notcontains $file.Name) {
            Write-Host "  ❌ Deletando: $($file.Name)" -ForegroundColor Red
            Remove-Item $file.FullName -Force
            $deletedCount++
        } else {
            Write-Host "  ✅ Mantendo: $($file.Name)" -ForegroundColor Green
            $keptCount++
        }
    }
}

Write-Host ""
Write-Host "✨ Limpeza concluída!" -ForegroundColor Green
Write-Host "   📁 Arquivos deletados: $deletedCount" -ForegroundColor Yellow
Write-Host "   💾 Arquivos mantidos: $keptCount" -ForegroundColor Cyan
Write-Host "   📂 Pasta docs/ mantida intacta" -ForegroundColor Cyan
