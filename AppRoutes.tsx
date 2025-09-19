

'use client';
import React, { Suspense } from 'react';
// FIX: Use namespace import for react-router-dom to fix module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/ui/PageLoader';
import { Role } from './types';

// Fase 2: Code Splitting com React.lazy()
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const DashboardPage = React.lazy(() => import('./pages/DashboardPage'));
const ClinicalAnalyticsPage = React.lazy(() => import('./pages/ClinicalAnalyticsPage'));
const FinancialDashboardPage = React.lazy(() => import('./pages/FinancialDashboardPage'));
const PatientListPage = React.lazy(() => import('./pages/PatientListPage'));
const PatientDetailPage = React.lazy(() => import('./pages/PatientDetailPage'));
const AgendaPage = React.lazy(() => import('./pages/AgendaPage'));
const EventsListPage = React.lazy(() => import('./pages/EventsListPage'));
const EventDetailPage = React.lazy(() => import('./pages/EventDetailPage'));
const AcompanhamentoPage = React.lazy(() => import('./pages/AcompanhamentoPage'));
const NotificationCenterPage = React.lazy(() => import('./pages/NotificationCenterPage'));
const WhatsAppPage = React.lazy(() => import('./pages/WhatsAppPage'));
const GroupsPage = React.lazy(() => import('./pages/GroupsPage'));
const KanbanPage = React.lazy(() => import('./pages/KanbanPage'));
const SpecialtyAssessmentsPage = React.lazy(() => import('./pages/SpecialtyAssessmentsPage'));
const ExerciseLibraryPage = React.lazy(() => import('./pages/ExerciseLibraryPage'));
const ClinicalLibraryPage = React.lazy(() => import('./pages/ClinicalLibraryPage'));
const MaterialDetailPage = React.lazy(() => import('./pages/MaterialDetailPage'));
const EvaluationReportPage = React.lazy(() => import('./pages/EvaluationReportPage'));
const SessionEvolutionPage = React.lazy(() => import('./pages/SessionEvolutionPage'));
const HepGeneratorPage = React.lazy(() => import('./pages/HepGeneratorPage'));
const RiskAnalysisPage = React.lazy(() => import('./pages/RiskAnalysisPage'));
const InactivePatientEmailPage = React.lazy(() => import('./pages/InactivePatientEmailPage'));
const MentoriaPage = React.lazy(() => import('./pages/MentoriaPage'));
const PartnershipPage = React.lazy(() => import('./pages/PartnershipPage'));
const InventoryDashboardPage = React.lazy(() => import('./pages/InventoryDashboardPage'));
const MedicalReportPage = React.lazy(() => import('./pages/MedicalReportPage'));
const ReportsPage = React.lazy(() => import('./pages/ReportsPage'));
const AuditLogPage = React.lazy(() => import('./pages/AuditLogPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const SubscriptionPage = React.lazy(() => import('./pages/SubscriptionPage'));
const LegalPage = React.lazy(() => import('./pages/LegalPage'));
const KnowledgeBasePage = React.lazy(() => import('./pages/KnowledgeBasePage'));
const EconomicPage = React.lazy(() => import('./pages/EconomicPage'));
const AiSettingsPage = React.lazy(() => import('./pages/AiSettingsPage'));
const AgendaSettingsPage = React.lazy(() => import('./pages/AgendaSettingsPage'));
const AtendimentoPage = React.lazy(() => import('./pages/AtendimentoPage'));
const TeleconsultaPage = React.lazy(() => import('./pages/TeleconsultaPage'));

// Patient Portal Imports
const PatientPortalLayout = React.lazy(() => import('./layouts/PatientPortalLayout'));
const PatientDashboardPage = React.lazy(() => import('./pages/patient-portal/PatientDashboardPage'));
const PatientPainDiaryPage = React.lazy(() => import('./pages/patient-portal/PatientPainDiaryPage'));
const PatientProgressPage = React.lazy(() => import('./pages/patient-portal/PatientProgressPage'));
const VoucherStorePage = React.lazy(() => import('./pages/patient-portal/VoucherStorePage'));
const MyVouchersPage = React.lazy(() => import('./pages/patient-portal/MyVouchersPage'));
const GamificationPage = React.lazy(() => import('./pages/patient-portal/GamificationPage'));
const MyAppointmentsPage = React.lazy(() => import('./pages/patient-portal/MyAppointmentsPage'));
const DocumentsPage = React.lazy(() => import('./pages/patient-portal/DocumentsPage'));
const MyExercisesPage = React.lazy(() => import('./pages/patient-portal/MyExercisesPage'));

// Partner Portal Imports
const PartnerLayout = React.lazy(() => import('./layouts/PartnerLayout'));
const EducatorDashboardPage = React.lazy(() => import('./pages/partner-portal/EducatorDashboardPage'));
const ClientListPage = React.lazy(() => import('./pages/partner-portal/ClientListPage'));
const ClientDetailPage = React.lazy(() => import('./pages/partner-portal/ClientDetailPage'));
const PartnerExerciseLibraryPage = React.lazy(() => import('./pages/partner-portal/PartnerExerciseLibraryPage'));
const FinancialsPage = React.lazy(() => import('./pages/partner-portal/FinancialsPage'));


const AppRoutes: React.FC = () => {
    return (
      <Suspense fallback={<PageLoader />}>
        <ReactRouterDOM.Routes>
          <ReactRouterDOM.Route path="/login" element={<LoginPage />} />
          
           {/* Patient Portal Routes */}
           <ReactRouterDOM.Route 
            path="/portal/*"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout>
                   <ReactRouterDOM.Routes>
                      <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/portal/dashboard" replace />} />
                      <ReactRouterDOM.Route path="/dashboard" element={<PatientDashboardPage />} />
                      <ReactRouterDOM.Route path="/meu-progresso" element={<PatientProgressPage />} />
                      <ReactRouterDOM.Route path="/my-exercises" element={<MyExercisesPage />} />
                      <ReactRouterDOM.Route path="/pain-diary" element={<PatientPainDiaryPage />} />
                      <ReactRouterDOM.Route path="/partner-services" element={<VoucherStorePage />} />
                      <ReactRouterDOM.Route path="/my-vouchers" element={<MyVouchersPage />} />
                      <ReactRouterDOM.Route path="/notifications" element={<NotificationCenterPage />} />
                      <ReactRouterDOM.Route path="/gamification" element={<GamificationPage />} />
                      <ReactRouterDOM.Route path="/appointments" element={<MyAppointmentsPage />} />
                      <ReactRouterDOM.Route path="/documents" element={<DocumentsPage />} />
                   </ReactRouterDOM.Routes>
                </PatientPortalLayout>
              </ProtectedRoute>
            } 
          />

          {/* Partner Portal Routes */}
           <ReactRouterDOM.Route 
            path="/partner/*"
            element={
              <ProtectedRoute allowedRoles={[Role.EducadorFisico]}>
                <PartnerLayout>
                   <ReactRouterDOM.Routes>
                      <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/partner/dashboard" replace />} />
                      <ReactRouterDOM.Route path="/dashboard" element={<EducatorDashboardPage />} />
                      <ReactRouterDOM.Route path="/clients" element={<ClientListPage />} />
                      <ReactRouterDOM.Route path="/clients/:id" element={<ClientDetailPage />} />
                      <ReactRouterDOM.Route path="/exercises" element={<PartnerExerciseLibraryPage />} />
                      <ReactRouterDOM.Route path="/financials" element={<FinancialsPage />} />
                   </ReactRouterDOM.Routes>
                </PartnerLayout>
              </ProtectedRoute>
            }
          />

          {/* Therapist Portal Routes (Catch-all) */}
          <ReactRouterDOM.Route 
            path="/*"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout>
                  <ReactRouterDOM.Routes>
                    <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/dashboard" replace />} />
                    <ReactRouterDOM.Route path="/dashboard" element={<DashboardPage />} />
                    <ReactRouterDOM.Route path="/clinical-analytics" element={<ClinicalAnalyticsPage />} />
                    <ReactRouterDOM.Route path="/financials" element={<FinancialDashboardPage />} />
                    <ReactRouterDOM.Route path="/patients" element={<PatientListPage />} />
                    <ReactRouterDOM.Route path="/patients/:id" element={<PatientDetailPage />} />
                    <ReactRouterDOM.Route path="/agenda" element={<AgendaPage />} />
                    <ReactRouterDOM.Route path="/events" element={<EventsListPage />} />
                    <ReactRouterDOM.Route path="/events/:id" element={<EventDetailPage />} />
                    <ReactRouterDOM.Route path="/acompanhamento" element={<AcompanhamentoPage />} />
                    <ReactRouterDOM.Route path="/notifications" element={<NotificationCenterPage />} />
                    <ReactRouterDOM.Route path="/whatsapp" element={<WhatsAppPage />} />
                    <ReactRouterDOM.Route path="/groups" element={<GroupsPage />} />
                    <ReactRouterDOM.Route path="/tasks" element={<KanbanPage />} />
                    <ReactRouterDOM.Route path="/avaliacoes" element={<SpecialtyAssessmentsPage />} />
                    <ReactRouterDOM.Route path="/exercises" element={<ExerciseLibraryPage />} />
                    <ReactRouterDOM.Route path="/materials" element={<ClinicalLibraryPage />} />
                    <ReactRouterDOM.Route path="/materials/:id" element={<MaterialDetailPage />} />
                    <ReactRouterDOM.Route path="/gerar-laudo" element={<EvaluationReportPage />} />
                    <ReactRouterDOM.Route path="/gerar-evolucao" element={<SessionEvolutionPage />} />
                    <ReactRouterDOM.Route path="/gerar-hep" element={<HepGeneratorPage />} />
                    <ReactRouterDOM.Route path="/analise-risco" element={<RiskAnalysisPage />} />
                    <ReactRouterDOM.Route path="/email-inativos" element={<InactivePatientEmailPage />} />
                    <ReactRouterDOM.Route path="/mentoria" element={<MentoriaPage />} />
                    <ReactRouterDOM.Route path="/partnerships" element={<PartnershipPage />} />
                    <ReactRouterDOM.Route path="/inventory" element={<InventoryDashboardPage />} />
                    <ReactRouterDOM.Route path="/medical-report/new/:patientId" element={<MedicalReportPage />} />
                    <ReactRouterDOM.Route path="/medical-report/edit/:reportId" element={<MedicalReportPage />} />
                    <ReactRouterDOM.Route path="/reports" element={<ReportsPage />} />
                    <ReactRouterDOM.Route path="/audit-log" element={<AuditLogPage />} />
                    <ReactRouterDOM.Route path="/settings" element={<SettingsPage />} />
                    <ReactRouterDOM.Route path="/subscription" element={<SubscriptionPage />} />
                    <ReactRouterDOM.Route path="/legal" element={<LegalPage />} />
                    <ReactRouterDOM.Route path="/knowledge-base" element={<KnowledgeBasePage />} />
                    <ReactRouterDOM.Route path="/ia-economica" element={<EconomicPage />} />
                    <ReactRouterDOM.Route path="/ai-settings" element={<AiSettingsPage />} />
                    <ReactRouterDOM.Route path="/agenda-settings" element={<AgendaSettingsPage />} />
                    <ReactRouterDOM.Route path="/atendimento/:appointmentId" element={<AtendimentoPage />} />
                    <ReactRouterDOM.Route path="/teleconsulta/:appointmentId" element={<TeleconsultaPage />} />
                    <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/dashboard" replace />} />
                  </ReactRouterDOM.Routes>
                </MainLayout>
              </ProtectedRoute>
            } 
          />

        </ReactRouterDOM.Routes>
      </Suspense>
    );
};

export default AppRoutes;
