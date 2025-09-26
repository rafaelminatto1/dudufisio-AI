
import React, { useState, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import Layout from './components/Layout';
import { AppProvider } from './contexts/AppContext';
import { SupabaseAuthProvider } from './contexts/SupabaseAuthContext';
import { ToastProvider } from './contexts/ToastContext';

// Lazy load das páginas
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AgendaPage = lazy(() => import('./pages/AgendaPage'));
const PatientListPage = lazy(() => import('./pages/PatientListPage'));
const PatientDetailPage = lazy(() => import('./pages/PatientDetailPage'));
const ExerciseLibraryPage = lazy(() => import('./pages/ExerciseLibraryPage'));
const AcompanhamentoPage = lazy(() => import('./pages/AcompanhamentoPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const FinancialDashboardPage = lazy(() => import('./pages/FinancialDashboardPage'));
const SpecialtyAssessmentsPage = lazy(() => import('./pages/SpecialtyAssessmentsPage'));
const IntegrationsTestPage = lazy(() => import('./pages/IntegrationsTestPage'));

console.log('🚀 Starting React application...');

const App: React.FC = () => {
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');

  const handleLoginSuccess = () => {
    console.log('🎯 Login success - setting user');
    const newUser = {
      id: '1',
      name: 'Usuário Demo',
      email: 'demo@dudufisio.com',
      role: 'Administrador',
      avatarUrl: ''
    };
    setUser(newUser);
    console.log('✅ User set:', newUser);
  };

  const handleLogout = () => {
    console.log('🚪 Logout triggered');
    setUser(null);
    setCurrentPage('dashboard');
  };

  const handlePageChange = (page: string) => {
    console.log('📄 Page change to:', page);
    setCurrentPage(page);
  };

  // Expose the setCurrentPage function globally for navigation
  React.useEffect(() => {
    (window as any).__setCurrentPage = setCurrentPage;
    (window as any).__navigateToRegister = () => setAuthPage('register');
    (window as any).__navigateToLogin = () => setAuthPage('login');
    return () => {
      delete (window as any).__setCurrentPage;
      delete (window as any).__navigateToRegister;
      delete (window as any).__navigateToLogin;
    };
  }, []);

  const renderPage = () => {
    switch(currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'appointments':
        return <AgendaPage />;
      case 'patients':
        return <PatientListPage />;
      case 'patient-detail':
        return <PatientDetailPage />;
      case 'exercises':
        return <ExerciseLibraryPage />;
      case 'treatments':
        return <AcompanhamentoPage />;
      case 'reports':
        return <ReportsPage />;
      case 'financial':
        return <FinancialDashboardPage />;
      case 'evaluations':
        return <SpecialtyAssessmentsPage />;
      case 'integrations':
        return <IntegrationsTestPage />;
      default:
        return <DashboardPage />;
    }
  };

  if (!user) {
    return (
      <SupabaseAuthProvider>
        {authPage === 'login' ? (
          <LoginPage onSuccess={handleLoginSuccess} />
        ) : (
          <RegisterPage onSuccess={handleLoginSuccess} onBack={() => setAuthPage('login')} />
        )}
      </SupabaseAuthProvider>
    );
  }

  return (
    <SupabaseAuthProvider>
      <AppProvider>
        <ToastProvider>
          <Layout
            user={user}
            onLogout={handleLogout}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          >
            <Suspense fallback={
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
              </div>
            }>
              {renderPage()}
            </Suspense>
          </Layout>
        </ToastProvider>
      </AppProvider>
    </SupabaseAuthProvider>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React app...');

  try {
    const root = createRoot(rootElement);
    root.render(<App />);
    console.log('🎉 React application rendered successfully!');
  } catch (error) {
    console.error('💥 Error rendering React app:', error);

    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Erro ao carregar aplicação</h1>
        <p>Detalhes: ${error}</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar
        </button>
      </div>
    `;
  }
}