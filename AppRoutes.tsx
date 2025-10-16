import React, { useState, useEffect, Component, ErrorInfo, ReactNode, memo, useMemo, useCallback } from 'react';
import { 
  CompleteDashboard, 
  PatientPortalDashboard, 
  PartnerPortalDashboard,
  preloadCriticalComponents,
  preloadUserRoleComponents
} from './lib/lazyLoading';
import { initializeLazyLoading } from './lib/advancedLazyLoading';
import { PerformanceProfiler } from './lib/performanceOptimizations';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { DebugProvider } from './contexts/DebugContext';
import { PatientProvider } from './contexts/PatientContext';
import { ExerciseProvider } from './contexts/ExerciseContext';
import LoginPage from './pages/auth/LoginPage';
import TwoFactorSetupPage from './pages/auth/TwoFactorSetupPage';
import { Role } from './types';
import { initializeServiceWorker } from './lib/serviceWorkerManager';
import OfflineIndicator from './components/OfflineIndicator';
import { logger } from './lib/logger';
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
const BodyMapDashboardPage = lazy(() => import('./pages/BodyMapDashboardPage'));

const AppContent: React.FC = memo(() => {
    const { user, isAuthenticated, loading, logout } = useSupabaseAuth();
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [loadingTimeout, setLoadingTimeout] = useState(false);

    // 🚀 Inicializa Service Worker (apenas em produção, não em headless) - memoizado
    const initializeServiceWorkerCallback = useCallback(() => {
        // Detectar modo headless
        const isHeadless = /HeadlessChrome|PhantomJS|Puppeteer/.test(navigator.userAgent);
        const isDev = import.meta.env.DEV;
        
        if (isHeadless) {
            console.log('ℹ️  [INIT] Service Worker desabilitado (modo headless detectado)');
            return;
        }
        
        if (isDev) {
            console.log('ℹ️  [INIT] Service Worker desabilitado (ambiente de desenvolvimento)');
            return;
        }
        
        if (import.meta.env.PROD) {
            console.log('🔵 [INIT] Inicializando Service Worker...');
            initializeServiceWorker().then((registered) => {
                if (registered) {
                    console.log('✅ [INIT] Service Worker inicializado com sucesso');
                }
            }).catch(error => {
                console.error('❌ [INIT] Erro ao inicializar Service Worker:', error);
            });
        }
    }, []);

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('🔵 [INIT] Iniciando aplicação...');
        }
        initializeServiceWorkerCallback();
    }, [initializeServiceWorkerCallback]);

    // 🚀 Preloading inteligente de componentes - memoizado
    const preloadComponentsCallback = useCallback(() => {
        if (import.meta.env.DEV) {
            console.log('🔵 [INIT] Preloading componentes críticos...');
        }
        preloadCriticalComponents();
        
        if (import.meta.env.DEV) {
            console.log('🔵 [INIT] Inicializando sistema de lazy loading...');
        }
        initializeLazyLoading();
        
        if (user?.role) {
            if (import.meta.env.DEV) {
                console.log(`🔵 [INIT] Preloading componentes para role: ${user.role}`);
            }
            preloadUserRoleComponents(user.role);
        }
        
        if (import.meta.env.DEV) {
            console.log('✅ [INIT] Preloading concluído');
        }
    }, [user?.role]);

    useEffect(() => {
        preloadComponentsCallback();
    }, [preloadComponentsCallback]);

    // ⏱️ Timeout de segurança para loading
    useEffect(() => {
        if (loading) {
            const timer = setTimeout(() => {
                console.error('❌ [TIMEOUT] Carregamento excedeu tempo limite de 10 segundos');
                setLoadingTimeout(true);
            }, 10000);

            return () => {
                clearTimeout(timer);
            };
        }
    }, [loading]);

    // 📊 Log estado de autenticação para debug - memoizado
    const authState = useMemo(() => ({
        isAuthenticated, 
        hasUser: !!user, 
        loading,
        userRole: user?.role,
        userId: user?.id
    }), [isAuthenticated, user, loading]);

    useEffect(() => {
        if (import.meta.env.DEV) {
            console.log('🔐 Auth State:', authState);
        }
    }, [authState]);

    // Memoizar componentes de loading
    const LoadingScreen = useMemo(() => (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando...</p>
            </div>
        </div>
    ), []);

    const DashboardLoadingScreen = useMemo(() => (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Carregando dashboard...</p>
            </div>
        </div>
    ), []);

    // Loading state with timeout
    if (loading && !loadingTimeout) {
        return LoadingScreen;
    }

    // Timeout screen
    if (loadingTimeout) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
                <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Erro ao Carregar</h2>
                    <p className="text-slate-600 mb-6">
                        A aplicação está demorando mais que o esperado para carregar.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold"
                        >
                            🔄 Tentar Novamente
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                sessionStorage.clear();
                                window.location.reload();
                            }}
                            className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
                        >
                            🗑️ Limpar Cache e Recarregar
                        </button>
                    </div>
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

    // Memoizar dashboard component para evitar re-renderizações desnecessárias
    const dashboardComponent = useMemo(() => {
        if (!user) {
            return null;
        }

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
    }, [user, logout]);

    if (isAuthenticated && user) {
        
        return (
            <React.Suspense fallback={DashboardLoadingScreen}>
                <Routes>
                    <Route path="/*" element={dashboardComponent} />
                </Routes>
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
});

// Wrapper para BrowserRouter para evitar problemas com React 19
const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return <BrowserRouter>{children}</BrowserRouter>;
};

const AppRoutes: React.FC = () => {
    return (
        <AppErrorBoundary>
            <RouterWrapper>
                <DebugProvider>
                    <SupabaseAuthProvider>
                        <AppProvider>
                            <PatientProvider>
                                <ExerciseProvider>
                                    <PerformanceProfiler
                                    id="AppRoutes"
                                    onRender={(id, phase, actualDuration) => {
                                        if (actualDuration > 50) {
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
                                </ExerciseProvider>
                            </PatientProvider>
                        </AppProvider>
                    </SupabaseAuthProvider>
                </DebugProvider>
            </RouterWrapper>
        </AppErrorBoundary>
    );
};

export default AppRoutes;
