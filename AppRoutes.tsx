

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
          {/* Login Route - No Authentication Required */}
          <ReactRouterDOM.Route path="/login" element={<LoginPage />} />

          {/* Patient Portal Routes - Flattened Structure */}
          <ReactRouterDOM.Route path="/portal" element={<ReactRouterDOM.Navigate to="/portal/dashboard" replace />} />
          <ReactRouterDOM.Route
            path="/portal/dashboard"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><PatientDashboardPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/meu-progresso"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><PatientProgressPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/my-exercises"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><MyExercisesPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/pain-diary"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><PatientPainDiaryPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/partner-services"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><VoucherStorePage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/my-vouchers"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><MyVouchersPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/notifications"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><NotificationCenterPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/gamification"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><GamificationPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/appointments"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><MyAppointmentsPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/portal/documents"
            element={
              <ProtectedRoute allowedRoles={[Role.Patient]}>
                <PatientPortalLayout><DocumentsPage /></PatientPortalLayout>
              </ProtectedRoute>
            }
          />

          {/* Partner Portal Routes - Flattened Structure */}
          <ReactRouterDOM.Route path="/partner" element={<ReactRouterDOM.Navigate to="/partner/dashboard" replace />} />
          <ReactRouterDOM.Route
            path="/partner/dashboard"
            element={
              <ProtectedRoute allowedRoles={[Role.EducadorFisico]}>
                <PartnerLayout><EducatorDashboardPage /></PartnerLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/partner/clients"
            element={
              <ProtectedRoute allowedRoles={[Role.EducadorFisico]}>
                <PartnerLayout><ClientListPage /></PartnerLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/partner/clients/:id"
            element={
              <ProtectedRoute allowedRoles={[Role.EducadorFisico]}>
                <PartnerLayout><ClientDetailPage /></PartnerLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/partner/exercises"
            element={
              <ProtectedRoute allowedRoles={[Role.EducadorFisico]}>
                <PartnerLayout><PartnerExerciseLibraryPage /></PartnerLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/partner/financials"
            element={
              <ProtectedRoute allowedRoles={[Role.EducadorFisico]}>
                <PartnerLayout><FinancialsPage /></PartnerLayout>
              </ProtectedRoute>
            }
          />

          {/* Therapist Portal Routes - Flattened Structure */}
          <ReactRouterDOM.Route path="/" element={<ReactRouterDOM.Navigate to="/dashboard" replace />} />
          <ReactRouterDOM.Route
            path="/dashboard"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><DashboardPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/clinical-analytics"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><ClinicalAnalyticsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/financials"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><FinancialDashboardPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><PatientListPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/patients/:id"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><PatientDetailPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/agenda"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><AgendaPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/events"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><EventsListPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/events/:id"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><EventDetailPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/acompanhamento"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><AcompanhamentoPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/notifications"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><NotificationCenterPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/whatsapp"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><WhatsAppPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/groups"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><GroupsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/tasks"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><KanbanPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/avaliacoes"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><SpecialtyAssessmentsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/exercises"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><ExerciseLibraryPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/materials"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><ClinicalLibraryPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/materials/:id"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><MaterialDetailPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/gerar-laudo"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><EvaluationReportPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/gerar-evolucao"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><SessionEvolutionPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/gerar-hep"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><HepGeneratorPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/analise-risco"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><RiskAnalysisPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/email-inativos"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><InactivePatientEmailPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/mentoria"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><MentoriaPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/partnerships"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><PartnershipPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/inventory"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><InventoryDashboardPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/medical-report/new/:patientId"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><MedicalReportPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/medical-report/edit/:reportId"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><MedicalReportPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/reports"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><ReportsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/audit-log"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><AuditLogPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/settings"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><SettingsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/subscription"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><SubscriptionPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/legal"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><LegalPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/knowledge-base"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><KnowledgeBasePage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/ia-economica"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><EconomicPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/ai-settings"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><AiSettingsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/agenda-settings"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><AgendaSettingsPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/atendimento/:appointmentId"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><AtendimentoPage /></MainLayout>
              </ProtectedRoute>
            }
          />
          <ReactRouterDOM.Route
            path="/teleconsulta/:appointmentId"
            element={
              <ProtectedRoute allowedRoles={[Role.Therapist, Role.Admin]}>
                <MainLayout><TeleconsultaPage /></MainLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback Route */}
          <ReactRouterDOM.Route path="*" element={<ReactRouterDOM.Navigate to="/dashboard" replace />} />
        </ReactRouterDOM.Routes>
      </Suspense>
    );
};

export default AppRoutes;
