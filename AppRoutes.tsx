import React, { lazy, useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { 
  CompleteDashboard, 
  PatientPortalDashboard, 
  PartnerPortalDashboard,
  preloadCriticalComponents,
  preloadUserRoleComponents
} from './lib/lazyLoading';
import { initializeLazyLoading } from './lib/advancedLazyLoading';
import { PerformanceProfiler } from './lib/performanceOptimizations';
import { BrowserRouter } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { DebugProvider } from './contexts/DebugContext';
import LoginPage from './pages/auth/LoginPage';
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage';
import { Role } from './types';
import { initializeServiceWorker } from './lib/serviceWorkerManager';
import OfflineIndicator from './components/OfflineIndicator';
import './lib/debugHelpers'; // Instala helpers de debug

// 🛡️ Error Boundary para capturar erros silenciosos
class AppErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error; errorInfo?: ErrorInfo }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 App Error Boundary:', error);
    console.error('📍 Error Info:', errorInfo);
    
    // Log para observabilidade
    if (typeof window !== 'undefined') {
      (window as any).__APP_ERROR__ = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack
      };
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
          <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
            <div className="mb-4">
              <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              Erro ao Carregar Aplicação
            </h1>
            
            <p className="text-slate-600 mb-4">
              {this.state.error?.message || 'Ocorreu um erro inesperado'}
            </p>
            
            <details className="text-left mb-6 bg-slate-50 p-4 rounded text-xs">
              <summary className="cursor-pointer font-semibold text-slate-700">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-slate-600 overflow-auto">
                {this.state.error?.stack}
              </pre>
            </details>

            <div className="space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold"
              >
                🔄 Recarregar Página
              </button>
              
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = '/';
                }}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold"
              >
                🗑️ Limpar Cache e Recarregar
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Lazy load remaining components
const IntegrationsTestPage = lazy(() => import('./pages/IntegrationsTestPage'));
const BIIntegrationTestPage = lazy(() => import('./pages/BIIntegrationTestPage'));

const AppContent: React.FC = () => {
    const { user, isAuthenticated, loading, logout } = useSupabaseAuth();
    const [show2FASetup, setShow2FASetup] = useState(false);

    // 🚀 Inicializa Service Worker (apenas em produção)
    useEffect(() => {
        if (import.meta.env.PROD) {
            initializeServiceWorker().then((registered) => {
                if (registered) {
                    console.log('✅ Service Worker inicializado com sucesso');
                }
            }).catch(error => {
                console.warn('⚠️ Service Worker initialization failed:', error);
            });
        } else {
            console.log('ℹ️  Service Worker desabilitado em desenvolvimento');
        }
    }, []);

    // 🚀 Preloading inteligente de componentes
    useEffect(() => {
        preloadCriticalComponents();
        initializeLazyLoading();
        
        if (user?.role) {
            preloadUserRoleComponents(user.role);
        }
    }, [user?.role]);

    // 📊 Log estado de autenticação para debug
    useEffect(() => {
        console.log('🔐 Auth State:', { 
            isAuthenticated, 
            hasUser: !!user, 
            loading,
            userRole: user?.role,
            userId: user?.id
        });
    }, [isAuthenticated, user, loading]);

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Carregando...</p>
                </div>
            </div>
        );
    }

    // 2FA Setup flow
    if (show2FASetup) {
        return (
            <TwoFactorSetupPage
                onComplete={() => setShow2FASetup(false)}
                onBack={() => setShow2FASetup(false)}
            />
        );
    }

    const renderDashboard = () => {
        if (!user) return null;

        // Route to appropriate dashboard based on user role
        switch (user.role) {
            case Role.Patient:
                return <PatientPortalDashboard user={user} onLogout={logout} />;
            case Role.EducadorFisico:
                return <PartnerPortalDashboard user={user} onLogout={logout} />;
            case Role.Admin:
            case Role.Therapist:
            default:
                return <CompleteDashboard user={user} onLogout={logout} />;
        }
    };

    if (isAuthenticated && user) {
        return (
            <React.Suspense fallback={
                <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Carregando dashboard...</p>
                    </div>
                </div>
            }>
                {renderDashboard()}
            </React.Suspense>
        );
    }

    return (
        <LoginPage
            onSuccess={() => {
                // Optionally show 2FA setup for new users
                // setShow2FASetup(true);
            }}
        />
    );
};

const AppRoutes: React.FC = () => {
    return (
        <AppErrorBoundary>
            <BrowserRouter>
                <DebugProvider>
                    <SupabaseAuthProvider>
                        <AppProvider>
                            <PerformanceProfiler
                                id="AppRoutes"
                                onRender={(id, phase, actualDuration) => {
                                    if (actualDuration > 16) {
                                        console.warn(`⚠️ Performance issue in ${id}: ${actualDuration}ms`);
                                    }
                                }}
                            >
                                <ToastProvider>
                                    <AppContent />
                                    {/* 📡 Indicador de status offline/online */}
                                    <OfflineIndicator />
                                </ToastProvider>
                            </PerformanceProfiler>
                        </AppProvider>
                    </SupabaseAuthProvider>
                </DebugProvider>
            </BrowserRouter>
        </AppErrorBoundary>
    );
};

export default AppRoutes;