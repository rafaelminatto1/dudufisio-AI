import React, { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';
import { createLazyComponent } from '../lib/lazyLoading';
import { PageSkeleton } from '../components/ui/PageSkeleton';
import ErrorBoundary from '../components/ErrorBoundary';

// ✅ Lazy load de todas as páginas principais
const DashboardPage = createLazyComponent(() => import('./DashboardPage'));
const AgendaPage = createLazyComponent(() => import('./AgendaPage'));
const PatientListPage = createLazyComponent(() => import('./PatientListPage'));
const PatientDetailPage = createLazyComponent(() => import('./PatientDetailPage'));
const AcompanhamentoPage = createLazyComponent(() => import('./AcompanhamentoPage'));
const ExerciseLibraryPage = createLazyComponent(() => import('./ExerciseLibraryPage'));
const ProtocolsPage = createLazyComponent(() => import('./ProtocolsPage'));
const FinancialPage = createLazyComponent(() => import('./FinancialPage'));
const ClinicalAnalyticsPage = createLazyComponent(() => import('./ClinicalAnalyticsPage'));
const ReportsPage = createLazyComponent(() => import('./ReportsPage'));
const SettingsPage = createLazyComponent(() => import('./SettingsPage'));
const NotificationCenterPage = createLazyComponent(() => import('./NotificationCenterPage'));
const CRMDashboardPage = createLazyComponent(() => import('./CRMDashboardPage'));

// Loading component
const PageLoader = () => <PageSkeleton />;

interface MainDashboardProps {
  user: any;
  onLogout: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({ user, onLogout }) => {
  return (
    <ResponsiveLayout user={user} onLogout={onLogout}>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Dashboard Principal */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* Notificações */}
            <Route path="/notifications" element={<NotificationCenterPage />} />
            
            {/* Clínico */}
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/patients/:id" element={<PatientDetailPage />} />
            <Route path="/agenda" element={<AgendaPage />} />
            <Route path="/acompanhamento" element={<AcompanhamentoPage />} />
            <Route path="/acompanhamento/:patientId" element={<AcompanhamentoPage />} />
            <Route path="/exercises" element={<ExerciseLibraryPage />} />
            <Route path="/protocols" element={<ProtocolsPage />} />
            
            {/* Analytics */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/financial" element={<FinancialPage />} />
            <Route path="/analytics" element={<ClinicalAnalyticsPage />} />
            
            {/* CRM */}
            <Route path="/crm" element={<CRMDashboardPage />} />
            
            {/* Configurações */}
            <Route path="/settings/*" element={<SettingsPage />} />
            
            {/* 404 - Redireciona para dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </ResponsiveLayout>
  );
};

export default MainDashboard;

