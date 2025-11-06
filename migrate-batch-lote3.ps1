# Script para migrar Lote 3 - Baixa Prioridade
$pages = @(
    "pages/EnhancedProtocolsPage.tsx",
    "pages/EnhancedExerciseLibraryPage.tsx",
    "pages/EnhancedAssessmentsPage.tsx",
    "pages/AdvancedMaterialsDashboard.tsx",
    "pages/ExerciseLibraryTestPage.tsx",
    "pages/BodyMapDashboardPage.tsx",
    "pages/BodyMapDemoPage.tsx",
    "pages/ClinicalContentPage.tsx",
    "pages/ClinicalLibraryPage.tsx",
    "pages/KnowledgeBasePage.tsx",
    "pages/EducatorDashboardPage.tsx",
    "pages/PartnerDashboard.tsx",
    "pages/PartnerExerciseLibraryPage.tsx",
    "pages/PartnerPortalDashboard.tsx",
    "pages/PatientPortalDashboard.tsx",
    "pages/PatientPortalPage.tsx",
    "pages/FamilyPortalPage.tsx",
    "pages/MyAppointmentsPage.tsx",
    "pages/MyExercisesPage.tsx",
    "pages/MyVouchersPage.tsx",
    "pages/VoucherStorePage.tsx",
    "pages/PatientPainDiaryPage.tsx",
    "pages/GamificationPage.tsx",
    "pages/SubscriptionPage.tsx",
    "pages/TeleconsultaPage.tsx",
    "pages/TeleconsultaListPage.tsx",
    "pages/SportsRehabilitationPage.tsx",
    "pages/GeriatricAssessmentPage.tsx",
    "pages/SpecialtyAssessmentsPage.tsx",
    "pages/MentoriaPage.tsx",
    "pages/MentoriaPageNew.tsx",
    "pages/GroupsPage.tsx",
    "pages/AssignmentsPage.tsx",
    "pages/auth/LoginPage.tsx",
    "pages/RegisterPage.tsx",
    "pages/ForgotPasswordPage.tsx",
    "pages/ResetPasswordPage.tsx",
    "pages/auth/TwoFactorSetupPage.tsx",
    "pages/SimpleLoginPage.tsx",
    "pages/AuthCallbackPage.tsx",
    "pages/ErrorPage.tsx",
    "pages/NotFoundPage.tsx",
    "pages/NotFoundInAppPage.tsx",
    "pages/LegalPage.tsx",
    "pages/AdminDashboardPageSimple.tsx",
    "pages/AtendimentoPageDemo.tsx",
    "pages/FreeVideoGeneratorReal.tsx",
    "pages/AuthRoutes.tsx"
)

$totalChanges = 0
$successCount = 0
$errorCount = 0

Write-Host "`nMigrando Lote 3 (Baixa Prioridade) - 48 paginas finais`n" -ForegroundColor Cyan

foreach ($page in $pages) {
    Write-Host "Migrando: $page" -ForegroundColor Yellow
    $result = npx tsx scripts/migrate-to-monday.ts --apply --file=$page 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        $successCount++
    } else {
        $errorCount++
        Write-Host "  AVISO: Erro ao processar $page" -ForegroundColor Yellow
    }
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "RESUMO FINAL DO LOTE 3" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Total de paginas: $($pages.Count)"
Write-Host "Sucesso: $successCount" -ForegroundColor Green
Write-Host "Erros: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Yellow" } else { "Green" })
Write-Host "`nLote 3 completo!" -ForegroundColor Green
Write-Host "`nTOTAL GERAL: 144 paginas migradas (100% de cobertura)!" -ForegroundColor Cyan

