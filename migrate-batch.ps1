# Script para migrar múltiplas páginas em lote
$pages = @(
    "pages/ProtocolsPage.tsx",
    "pages/AtendimentoPage.tsx",
    "pages/AtendimentoPageV2.tsx",
    "pages/SessionViewPage.tsx",
    "pages/PatientDashboardPage.tsx",
    "pages/PatientProgressPage.tsx",
    "pages/MainDashboard.tsx",
    "pages/CompleteDashboard.tsx",
    "pages/SimpleDashboard.tsx",
    "pages/FinancialsPage.tsx",
    "pages/WhatsAppPage.tsx",
    "pages/WhatsAppManagementPage.tsx",
    "pages/ResponsiveDashboardPage.tsx",
    "pages/ResponsiveAgendaPage.tsx",
    "pages/ResponsiveCrmWhatsappPage.tsx",
    "pages/PatientMonitoringPage.tsx",
    "pages/PatientProgressSummaryPage.tsx",
    "pages/SessionTrackingPage.tsx",
    "pages/SessionPage.tsx",
    "pages/SessionFormPageExpanded.tsx",
    "pages/AgendaSettingsPage.tsx",
    "pages/SessionEvolutionSettingsPage.tsx",
    "pages/ExerciseListPage.tsx",
    "pages/ExercisesPage.tsx",
    "pages/ProtocolListPage.tsx"
)

$totalChanges = 0
$successCount = 0
$errorCount = 0

Write-Host "`nMigrando Lote 1 (Alta Prioridade) - 25 paginas restantes`n" -ForegroundColor Cyan

foreach ($page in $pages) {
    Write-Host "Migrando: $page" -ForegroundColor Yellow
    
    $result = npx tsx scripts/migrate-to-monday.ts --apply --file=$page 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $successCount++
        # Extrair número de mudanças do output
        if ($result -match "Total de mudancas: (\d+)") {
            $changes = [int]$matches[1]
            $totalChanges += $changes
            Write-Host "  OK $changes mudancas aplicadas" -ForegroundColor Green
        }
    } else {
        $errorCount++
        Write-Host "  ERRO na migracao" -ForegroundColor Red
    }
}

Write-Host "`n" -NoNewline
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "RESUMO FINAL DO LOTE 1" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total de páginas processadas: $($pages.Count)"
Write-Host "Sucesso: $successCount" -ForegroundColor Green
Write-Host "Erros: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "Total de mudanças: $totalChanges" -ForegroundColor Cyan
Write-Host "`nLote 1 completo!" -ForegroundColor Green

