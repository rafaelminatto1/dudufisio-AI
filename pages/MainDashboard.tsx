import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ResponsiveLayoutV2 from '../components/layout/ResponsiveLayoutV2';
import { createLazyComponent } from '../lib/lazyLoading';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';

// ✅ Lazy load de todas as páginas principais
const DashboardPage = createLazyComponent(() => import('./DashboardPageV2'));
const AgendaPage = createLazyComponent(() => import('./AgendaPage'));
const PatientListPage = createLazyComponent(() => import('./PatientListPageV2'));
const PatientDetailPage = createLazyComponent(() => import('./PatientDetailPage'));
const AcompanhamentoPage = createLazyComponent(() => import('./AcompanhamentoPage'));
const ExerciseLibraryPage = createLazyComponent(() => import('./ExerciseListPage'));
const ProtocolsPage = createLazyComponent(() => import('./ProtocolListPage'));
const AppointmentListPage = createLazyComponent(() => import('./AppointmentListPage'));
const FinancialPage = createLazyComponent(() => import('./FinancialPage'));
const ClinicalAnalyticsPage = createLazyComponent(() => import('./ClinicalAnalyticsPage'));
const ReportsPage = createLazyComponent(() => import('./ReportsPage'));
const SettingsPage = createLazyComponent(() => import('./SettingsPage'));
const NotificationCenterPage = createLazyComponent(() => import('./NotificationCenterPage'));
const CRMDashboardPage = createLazyComponent(() => import('./CRMDashboardPage'));
const AnalyticsDashboardPage = createLazyComponent(() => import('./AnalyticsDashboardPage'));
const CheckInPage = createLazyComponent(() => import('./CheckInPage'));
const GamificationDashboard = createLazyComponent(() => import('./GamificationDashboard'));
const ResourceManagementPage = createLazyComponent(() => import('./ResourceManagementPage'));
const AdvancedAnalyticsDashboard = createLazyComponent(() => import('./AdvancedAnalyticsDashboard'));

// ✅ Dashboards Específicos
const AdminDashboardPage = createLazyComponent(() => import('./AdminDashboardPage'));
const TherapistDashboard = createLazyComponent(() => import('./TherapistDashboard'));

// ✅ Clínico Avançado
const TeleconsultaPage = createLazyComponent(() => import('./TeleconsultaPage'));
const SessionEvolutionPage = createLazyComponent(() => import('./SessionEvolutionPage'));
const MaterialsPage = createLazyComponent(() => import('./MaterialsPage'));
const KnowledgeBasePage = createLazyComponent(() => import('./KnowledgeBasePage'));
const MentoriaPage = createLazyComponent(() => import('./MentoriaPage'));
const SpecialtyAssessmentsPage = createLazyComponent(() => import('./SpecialtyAssessmentsPage'));
const ClinicalLibraryPage = createLazyComponent(() => import('./ClinicalLibraryPage'));
const EnhancedExerciseLibraryPage = createLazyComponent(() => import('./EnhancedExerciseLibraryPage'));
const ProtocolsPageEnhanced = createLazyComponent(() => import('./EnhancedProtocolsPage'));

// ✅ Ferramentas IA
const GerarLaudoPage = createLazyComponent(() => import('./GerarLaudoPage'));
const SessionFormPage = createLazyComponent(() => import('./SessionFormPage'));
const HepGeneratorPage = createLazyComponent(() => import('./HepGeneratorPage'));
const RiskAnalysisPage = createLazyComponent(() => import('./RiskAnalysisPage'));
const FreeVideoGeneratorReal = createLazyComponent(() => import('./FreeVideoGeneratorReal'));
const BodyMapDemoPage = createLazyComponent(() => import('./BodyMapDemoPage'));
const AiAnalyticsPage = createLazyComponent(() => import('./AiAnalyticsPage'));

// ✅ Relatórios Avançados
const MedicalReportPage = createLazyComponent(() => import('./MedicalReportPage'));
const EvaluationReportPage = createLazyComponent(() => import('./EvaluationReportPage'));
const AdvancedReportsPage = createLazyComponent(() => import('./AdvancedReportsPage'));

// ✅ Gestão
const UserManagementPage = createLazyComponent(() => import('./UserManagementPage'));
const GroupsPage = createLazyComponent(() => import('./GroupsPage'));
const SuppliesPage = createLazyComponent(() => import('./SuppliesPage'));
const InventoryPage = createLazyComponent(() => import('./InventoryPage'));
const InventoryDashboardPage = createLazyComponent(() => import('./InventoryDashboardPage'));
const EventsListPage = createLazyComponent(() => import('./EventsListPage'));
const PartnershipPage = createLazyComponent(() => import('./PartnershipPage'));
const SubscriptionPage = createLazyComponent(() => import('./SubscriptionPage'));
const KanbanPage = createLazyComponent(() => import('./KanbanPage'));

// ✅ Sistema e CRM
const WhatsAppManagementPage = createLazyComponent(() => import('./WhatsAppManagementPage'));
const InactivePatientEmailPage = createLazyComponent(() => import('./InactivePatientEmailPage'));
const BackupManagementPage = createLazyComponent(() => import('./BackupManagementPage'));
const AgendaSettingsPage = createLazyComponent(() => import('./AgendaSettingsPage'));
const IntegrationsTestPage = createLazyComponent(() => import('./IntegrationsTestPage'));
const BIIntegrationTestPage = createLazyComponent(() => import('./BIIntegrationTestPage'));
const AiSettingsPage = createLazyComponent(() => import('./AiSettingsPage'));
const AuditLogPage = createLazyComponent(() => import('./AuditLogPage'));
const LegalPage = createLazyComponent(() => import('./LegalPage'));

// Loading component
const PageLoader = () => <PageSkeleton />;

interface MainDashboardProps {
  user: any;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
  return (
    <ResponsiveLayoutV2 user={user} onLogout={onLogout}>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Dashboard Principal */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Dashboards Específicos */}
            <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
            <Route path="/therapist-dashboard" element={<TherapistDashboard />} />
            
            {/* Notificações */}
            <Route path="/notifications" element={<NotificationCenterPage />} />
            
            {/* Tarefas */}
            <Route path="/tasks" element={<KanbanPage />} />
            
            {/* Clínico - Básico */}
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/appointments" element={<AppointmentListPage />} />
            <Route path="/agenda-analytics" element={<AnalyticsDashboardPage />} />
            <Route path="/checkin" element={<CheckInPage />} />
            <Route path="/acompanhamento" element={<AcompanhamentoPage />} />
            <Route path="/acompanhamento/:patientId" element={<AcompanhamentoPage />} />
            <Route path="/acompanhamento/monitoramento" element={<AcompanhamentoPage />} />
            <Route path="/exercises" element={<ExerciseLibraryPage />} />
            <Route path="/protocols" element={<ProtocolsPage />} />
            
            {/* Clínico - Avançado */}
            <Route path="/session-evolution" element={<SessionEvolutionPage />} />
            <Route path="/teleconsulta" element={<TeleconsultaPage />} />
            <Route path="/exercise-library" element={<EnhancedExerciseLibraryPage />} />
            <Route path="/specialty-assessments" element={<SpecialtyAssessmentsPage />} />
            <Route path="/clinical-library" element={<ClinicalLibraryPage />} />
            <Route path="/materials" element={<MaterialsPage />} />
            <Route path="/mentoria" element={<MentoriaPage />} />
            <Route path="/knowledge-base" element={<KnowledgeBasePage />} />
            
            {/* Ferramentas IA */}
            <Route path="/ai-tools/consolidated" element={<Navigate to="/gerar-laudo" replace />} />
            <Route path="/body-map-demo" element={<BodyMapDemoPage />} />
            <Route path="/gerar-laudo" element={<GerarLaudoPage />} />
            <Route path="/gerar-evolucao" element={<SessionFormPage />} />
            <Route path="/hep-generator" element={<HepGeneratorPage />} />
            <Route path="/risk-analysis" element={<RiskAnalysisPage />} />
            <Route path="/ia-economica" element={<AiAnalyticsPage />} />
            <Route path="/free-video-generator" element={<FreeVideoGeneratorReal />} />
            
            {/* Analytics e Relatórios */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/consolidated" element={<AdvancedReportsPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/financials" element={<FinancialPage />} />
            <Route path="/analytics" element={<ClinicalAnalyticsPage />} />
            <Route path="/clinical-analytics" element={<ClinicalAnalyticsPage />} />
            <Route path="/ai-analytics" element={<AiAnalyticsPage />} />
            <Route path="/my-performance" element={<TherapistDashboard />} />
            <Route path="/medical-reports" element={<MedicalReportPage />} />
            <Route path="/evaluation-reports" element={<EvaluationReportPage />} />
            
            {/* Gestão */}
            <Route path="/user-management" element={<UserManagementPage />} />
            <Route path="/groups" element={<GroupsPage />} />
            <Route path="/supplies" element={<SuppliesPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/inventory-dashboard" element={<InventoryDashboardPage />} />
            <Route path="/events" element={<EventsListPage />} />
            <Route path="/events-list" element={<EventsListPage />} />
            <Route path="/partnerships" element={<PartnershipPage />} />
            <Route path="/subscriptions" element={<SubscriptionPage />} />
            
            {/* Gamification & Resources */}
            <Route path="/gamification" element={<GamificationDashboard />} />
            <Route path="/resources" element={<ResourceManagementPage />} />
            
            {/* Sistema e CRM */}
            <Route path="/crm" element={<CRMDashboardPage />} />
            <Route path="/whatsapp" element={<WhatsAppManagementPage />} />
            <Route path="/email-inativos" element={<InactivePatientEmailPage />} />
            <Route path="/backup-management" element={<BackupManagementPage />} />
            <Route path="/agenda-settings" element={<AgendaSettingsPage />} />
            <Route path="/integrations" element={<IntegrationsTestPage />} />
            <Route path="/integrations-test" element={<IntegrationsTestPage />} />
            <Route path="/bi-integration-test" element={<BIIntegrationTestPage />} />
            <Route path="/ai-settings" element={<AiSettingsPage />} />
            <Route path="/audit-log" element={<AuditLogPage />} />
            <Route path="/audit-log-page" element={<AuditLogPage />} />
            <Route path="/legal" element={<LegalPage />} />
            
            {/* Configurações */}
            <Route path="/settings/*" element={<SettingsPage />} />
            
            {/* 404 - Redireciona para dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ResponsiveLayoutV2>
  );
};

export default MainDashboard;

