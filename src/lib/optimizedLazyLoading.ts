import { lazy, ComponentType } from 'react';

// Wrapper para lazy loading com preload capability
export function lazyWithPreload<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  const Component = lazy(factory);
  (Component as any).preload = factory;
  return Component;
}

// Preload de rotas baseado em navegação
export function preloadRoute(routePath: string) {
  const routeMap: Record<string, () => void> = {
    '/patients': () => import('../pages/PatientListPage').then(() => {}),
    '/agenda': () => import('../pages/AgendaPage').then(() => {}),
    '/dashboard': () => import('../pages/DashboardPage').then(() => {}),
    '/exercises': () => import('../pages/ExercisesPage').then(() => {}),
    '/protocols': () => import('../pages/ProtocolsPage').then(() => {}),
    '/reports': () => import('../pages/ReportsPage').then(() => {}),
    '/settings': () => import('../pages/SettingsPage').then(() => {}),
    '/user-management': () => import('../pages/UserManagementPage').then(() => {}),
    '/financials': () => import('../pages/FinancialsPage').then(() => {}),
    '/inventory': () => import('../pages/InventoryPage').then(() => {}),
    '/whatsapp': () => import('../pages/WhatsAppPage').then(() => {}),
    '/teleconsulta': () => import('../pages/TeleconsultaPage').then(() => {}),
    '/ai-tools': () => import('../pages/ai-tools/ConsolidatedAIToolsPage').then(() => {}),
    '/clinical-library': () => import('../pages/ClinicalLibraryPage').then(() => {}),
    '/materials': () => import('../pages/MaterialsPage').then(() => {}),
    '/mentoria': () => import('../pages/MentoriaPage').then(() => {}),
    '/knowledge-base': () => import('../pages/KnowledgeBasePage').then(() => {}),
    '/crm': () => import('../pages/UnifiedCRMPage').then(() => {}),
    '/partnerships': () => import('../pages/PartnershipPage').then(() => {}),
    '/subscriptions': () => import('../pages/SubscriptionPage').then(() => {}),
    '/events': () => import('../pages/EventsListPage').then(() => {}),
    '/groups': () => import('../pages/GroupsPage').then(() => {}),
    '/notifications': () => import('../pages/NotificationCenterPage').then(() => {}),
    '/tasks': () => import('../pages/TaskManagementPage').then(() => {}),
    '/audit-log': () => import('../pages/AuditLogPage').then(() => {}),
    '/backup-management': () => import('../pages/BackupManagementPage').then(() => {}),
    '/integrations': () => import('../pages/IntegrationsPage').then(() => {}),
    '/ai-settings': () => import('../pages/AiSettingsPage').then(() => {}),
    '/agenda-settings': () => import('../pages/AgendaSettingsPage').then(() => {}),
    '/clinical-analytics': () => import('../pages/ClinicalAnalyticsPage').then(() => {}),
    '/ai-analytics': () => import('../pages/AiAnalyticsPage').then(() => {}),
    '/financial-dashboard': () => import('../pages/FinancialDashboardPage').then(() => {}),
    '/reports-consolidated': () => import('../pages/reports/ConsolidatedReportsDashboard').then(() => {}),
    '/reports-advanced': () => import('../pages/AdvancedReportsPage').then(() => {}),
    '/reports-performance': () => import('../pages/PerformanceDashboard').then(() => {}),
    '/population-health': () => import('../pages/PopulationHealthDashboardPage').then(() => {}),
    '/quality-assurance': () => import('../pages/QualityAssuranceDashboardPage').then(() => {}),
    '/communication-dashboard': () => import('../pages/CommunicationDashboard').then(() => {}),
    '/predictive-analytics': () => import('../pages/PredictiveAnalyticsPage').then(() => {}),
    '/risk-stratification': () => import('../pages/RiskStratificationPage').then(() => {}),
    '/risk-analysis': () => import('../pages/RiskAnalysisPage').then(() => {}),
    '/gerar-laudo': () => import('../pages/GerarLaudoPage').then(() => {}),
    '/gerar-evolucao': () => import('../pages/SessionEvolutionPage').then(() => {}),
    '/hep-generator': () => import('../pages/HepGeneratorPage').then(() => {}),
    '/body-map': () => import('../pages/BodyMapDashboardPage').then(() => {}),
    '/medical-records': () => import('../pages/MedicalRecordsSystem').then(() => {}),
    '/medical-report': () => import('../pages/MedicalReportPage').then(() => {}),
    '/evaluation-report': () => import('../pages/EvaluationReportPage').then(() => {}),
    '/session-tracking': () => import('../pages/SessionTrackingPage').then(() => {}),
    '/patient-progress': () => import('../pages/PatientProgressPage').then(() => {}),
    '/exercise-analytics': () => import('../pages/ExerciseAnalyticsPage').then(() => {}),
    '/exercise-library': () => import('../pages/ExerciseLibraryPage').then(() => {}),
    '/exercise-library-enhanced': () => import('../pages/EnhancedExerciseLibraryPage').then(() => {}),
    '/partner-exercise-library': () => import('../pages/PartnerExerciseLibraryPage').then(() => {}),
    '/my-exercises': () => import('../pages/MyExercisesPage').then(() => {}),
    '/my-appointments': () => import('../pages/MyAppointmentsPage').then(() => {}),
    '/my-vouchers': () => import('../pages/MyVouchersPage').then(() => {}),
    '/voucher-store': () => import('../pages/VoucherStorePage').then(() => {}),
    '/client-list': () => import('../pages/ClientListPage').then(() => {}),
    '/educator-dashboard': () => import('../pages/EducatorDashboardPage').then(() => {}),
    '/partner-dashboard': () => import('../pages/partner-portal/PartnerDashboard').then(() => {}),
    '/patient-dashboard': () => import('../pages/patient-portal/PatientDashboard').then(() => {}),
    '/patient-pain-diary': () => import('../pages/PatientPainDiaryPage').then(() => {}),
    '/session-view': () => import('../pages/SessionViewPage').then(() => {}),
    '/session-form': () => import('../pages/SessionFormPage').then(() => {}),
    '/atendimento': () => import('../pages/AtendimentoPageNew').then(() => {}),
    '/atendimento-demo': () => import('../pages/AtendimentoPageDemo').then(() => {}),
    '/specialty-assessments': () => import('../pages/SpecialtyAssessmentsPage').then(() => {}),
    '/sports-rehabilitation': () => import('../pages/SportsRehabilitationPage').then(() => {}),
    '/gamification': () => import('../pages/GamificationPage').then(() => {}),
    '/templates': () => import('../pages/TemplatesPage').then(() => {}),
    '/documents': () => import('../pages/DocumentsPage').then(() => {}),
    '/supplies': () => import('../pages/SuppliesPage').then(() => {}),
    '/stock-movement': () => import('../pages/StockMovementPage').then(() => {}),
    '/messages': () => import('../pages/MessagesPage').then(() => {}),
    '/teleconsulta-list': () => import('../pages/TeleconsultasListPage').then(() => {}),
    '/teleconsulta-room': () => import('../pages/TeleconsultaRoomPage').then(() => {}),
    '/whatsapp-management': () => import('../pages/WhatsAppManagementPage').then(() => {}),
    '/email-inativos': () => import('../pages/InactivePatientEmailPage').then(() => {}),
    '/mentoria-new': () => import('../pages/MentoriaPageNew').then(() => {}),
    '/family-portal': () => import('../pages/FamilyPortalPage').then(() => {}),
    '/treatment': () => import('../pages/TreatmentPage').then(() => {}),
    '/checkout': () => import('../pages/CheckoutPage').then(() => {}),
    '/legal': () => import('../pages/LegalPage').then(() => {}),
    '/admin-dashboard': () => import('../pages/AdminDashboardPage').then(() => {}),
    '/therapist-dashboard': () => import('../pages/TherapistDashboard').then(() => {}),
  };
  
  routeMap[routePath]?.();
}

// Preload de componentes baseado em hover
export function preloadOnHover(routePath: string) {
  const element = document.querySelector(`a[href="${routePath}"]`);
  if (element) {
    element.addEventListener('mouseenter', () => preloadRoute(routePath), { once: true });
  }
}

// Preload de componentes críticos na inicialização
export function preloadCriticalComponents() {
  // Preload de componentes que provavelmente serão usados
  setTimeout(() => {
    preloadRoute('/dashboard');
    preloadRoute('/patients');
    preloadRoute('/agenda');
  }, 2000);
}

