# Script para migrar Lote 2 - Media Prioridade
$pages = @(
    "pages/ClinicalAnalyticsPage.tsx",
    "pages/PredictiveAnalyticsPage.tsx",
    "pages/ExerciseAnalyticsPage.tsx",
    "pages/RiskAnalysisPage.tsx",
    "pages/RiskStratificationPage.tsx",
    "pages/AiAnalyticsPage.tsx",
    "pages/PerformanceMetricsDashboard.tsx",
    "pages/ProgressDashboardPage.tsx",
    "pages/PopulationHealthDashboardPage.tsx",
    "pages/QualityAssuranceDashboardPage.tsx",
    "pages/SystemHealthPage.tsx",
    "pages/AuditLogPage.tsx",
    "pages/BackupManagementPage.tsx",
    "pages/InventoryDashboardPage.tsx",
    "pages/InventoryPage.tsx",
    "pages/SuppliesPage.tsx",
    "pages/ResourceManagementPage.tsx",
    "pages/MaterialsPage.tsx",
    "pages/MaterialDetailPage.tsx",
    "pages/MaterialEditorPage.tsx",
    "pages/MaterialTasksPage.tsx",
    "pages/DocumentsPage.tsx",
    "pages/TemplatesPage.tsx",
    "pages/TemplateEditPage.tsx",
    "pages/AdvancedReportsPage.tsx",
    "pages/EvaluationReportPage.tsx",
    "pages/MedicalReportPage.tsx",
    "pages/PatientEditPage.tsx",
    "pages/ClientListPage.tsx",
    "pages/ClientDetailPage.tsx",
    "pages/ExerciseEditPage.tsx",
    "pages/ProtocolEditPage.tsx",
    "pages/EventsListPage.tsx",
    "pages/EventDetailPage.tsx",
    "pages/PartnershipPage.tsx",
    "pages/IntegrationsTestPage.tsx",
    "pages/BIIntegrationTestPage.tsx",
    "pages/UnifiedCRMPage.tsx",
    "pages/KanbanPage.tsx",
    "pages/MessagesPage.tsx",
    "pages/NotificationsPage.tsx",
    "pages/GerarLaudoPage.tsx",
    "pages/HepGeneratorPage.tsx",
    "pages/InactivePatientEmailPage.tsx",
    "pages/AiSettingsPage.tsx"
)

$totalChanges = 0
$successCount = 0
$errorCount = 0

Write-Host "`nMigrando Lote 2 (Media Prioridade) - 45 paginas`n" -ForegroundColor Cyan

foreach ($page in $pages) {
    Write-Host "Migrando: $page" -ForegroundColor Yellow
    $result = npx tsx scripts/migrate-to-monday.ts --apply --file=$page 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $successCount++
    } else {
        $errorCount++
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "RESUMO FINAL DO LOTE 2" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total de paginas: $($pages.Count)"
Write-Host "Sucesso: $successCount" -ForegroundColor Green
Write-Host "Erros: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Green" })
Write-Host "`nLote 2 completo!" -ForegroundColor Green

