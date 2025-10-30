import React, {
  Component,
  ErrorInfo,
  ReactNode,
  Suspense,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { PerformanceProfiler } from './lib/performanceOptimizations';
import { initializeMobileOptimizations, getAdaptiveConfig } from './lib/mobileOptimizations';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { DebugProvider } from './contexts/DebugContext';
import { PatientProvider } from './contexts/PatientContext';
import { ExerciseProvider } from './contexts/ExerciseContext';
import AuthRoutes from './pages/auth/AuthRoutes';
import { Role } from './types';
// SW e preloading serão importados sob demanda em idle
import OfflineIndicator from './components/OfflineIndicator';
import OfflineNotification from './components/OfflineNotification';
import MobileLoadingScreen from './components/ui/MobileLoadingScreen';
import { logger } from './lib/logger';
import './lib/debugHelpers';

const LOG_CONTEXT = 'AppRoutes';
const LOADING_TIMEOUT_MS = getAdaptiveConfig().loadingTimeout;

// Utilitário: agenda execução quando o thread estiver ocioso, com fallback seguro
const runWhenIdle = (cb: () => void) => {
  if (typeof (window as any).requestIdleCallback === 'function') {
    (window as any).requestIdleCallback(cb, { timeout: 1500 });
  } else {
    // Próximo tick para não bloquear o first paint
    setTimeout(cb, 0);
  }
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
};

class AppErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Erro capturado pelo AppErrorBoundary.', {
      context: 'AppErrorBoundary',
      data: { error, errorInfo },
    });

    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, unknown>).__APP_ERROR__ = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      };
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
          <div className="mb-4">
            <svg
              className="mx-auto h-16 w-16 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>

          <h1 className="mb-2 text-2xl font-bold text-slate-900">Erro ao carregar a aplicação</h1>
          <p className="mb-4 text-slate-600">
            {this.state.error?.message ?? 'Ocorreu um erro inesperado. Tente novamente em instantes.'}
          </p>

          <details className="mb-6 rounded bg-slate-50 p-4 text-left text-xs">
            <summary className="cursor-pointer font-semibold text-slate-700">Detalhes técnicos</summary>
            <pre className="mt-2 overflow-auto text-slate-600">{this.state.error?.stack}</pre>
          </details>

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-sky-700"
            >
              Recarregar página
            </button>

            <button
              type="button"
              onClick={() => {
                try {
                  window.localStorage.clear();
                  window.sessionStorage.clear();
                } finally {
                  window.location.href = '/';
                }
              }}
              className="w-full rounded-lg bg-slate-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-slate-700"
            >
              Limpar cache e recarregar
            </button>
          </div>
        </div>
      </div>
    );
  }
}

const buildLoadingScreen = (message: string) => (
  <MobileLoadingScreen message={message} />
);

const TIMEOUT_SCREEN = (
  <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
    <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-xl">
      <div className="mb-6">
        <svg
          className="mx-auto h-16 w-16 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </div>

      <h2 className="mb-2 text-2xl font-bold text-slate-900">Tempo de carregamento excedido</h2>
      <p className="mb-6 text-slate-600">A aplicação está levando mais tempo que o esperado para iniciar.</p>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="w-full rounded-lg bg-sky-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-sky-700"
        >
          Tentar novamente
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              window.localStorage.clear();
              window.sessionStorage.clear();
            } finally {
              window.location.reload();
            }
          }}
          className="w-full rounded-lg bg-slate-600 px-4 py-2 text-sm text-white transition-colors hover:bg-slate-700"
        >
          Limpar cache e recarregar
        </button>
      </div>
    </div>
  </div>
);

const AppContent: React.FC = memo(() => {
  const { user, isAuthenticated, loading, logout } = useSupabaseAuth();
  const location = useLocation();
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [loadingTimeout, setLoadingTimeout] = useState(false);

  const initializeServiceWorkerCallback = useCallback(() => {
    // Importar dinamicamente o registrador do SW
    const loadAndInit = async () => {
      const { initializeServiceWorker } = await import('./lib/serviceWorkerManager');
      return initializeServiceWorker();
    };
    const isHeadless = /HeadlessChrome|PhantomJS|Puppeteer/.test(navigator.userAgent);

    if (isHeadless) {
      logger.info('Service Worker desabilitado: modo headless detectado.', { context: LOG_CONTEXT });
      return;
    }

    if (import.meta.env.DEV) {
      logger.info('Service Worker desabilitado em ambiente de desenvolvimento.', { context: LOG_CONTEXT });
      return;
    }

    if (!import.meta.env.PROD) {
      return;
    }

    logger.info('Inicializando Service Worker...', { context: LOG_CONTEXT });

    loadAndInit()
      .then(registered => {
        if (registered) {
          logger.info('Service Worker inicializado com sucesso.', { context: LOG_CONTEXT });
        }
      })
      .catch(error => {
        logger.error('Falha ao inicializar Service Worker.', {
          context: LOG_CONTEXT,
          data: error,
        });
      });
  }, []);

  useEffect(() => {
    logger.info('Inicializando aplicação.', { context: LOG_CONTEXT });

    // Inicializar otimizações mobile primeiro (rápido e leve)
    initializeMobileOptimizations();

    // Adiar o Service Worker para ocioso/pós-first paint
    runWhenIdle(initializeServiceWorkerCallback);
  }, [initializeServiceWorkerCallback]);

  const preloadComponentsCallback = useCallback(() => {
    (async () => {
      logger.debug('Preloading de componentes críticos.', { context: LOG_CONTEXT });
      const lazy = await import('./lib/lazyLoading');
      lazy.preloadCriticalComponents();

      logger.debug('Inicializando sistema avançado de lazy loading.', { context: LOG_CONTEXT });
      const { initializeLazyLoading } = await import('./lib/advancedLazyLoading');
      initializeLazyLoading();

      logger.debug('Inicializando preloading inteligente.', { context: LOG_CONTEXT });
      const { initializeIntelligentPreloading } = await import('./lib/intelligentPreloading');
      initializeIntelligentPreloading(user?.role);

      if (user?.role) {
        logger.debug(`Preloading específico para o perfil ${user.role}.`, { context: LOG_CONTEXT });
        lazy.preloadUserRoleComponents(user.role);
      }
    })();
  }, [user?.role]);

  useEffect(() => {
    // Preloads não-bloqueantes: executa quando ocioso
    runWhenIdle(preloadComponentsCallback);
  }, [preloadComponentsCallback]);

  // Marcar quando autenticação está pronta para exibir login
  useEffect(() => {
    if (!isAuthenticated && !user && !loading) {
      try {
        performance.mark('auth_ready');
        performance.measure('time_to_auth_ready', 'app_start', 'auth_ready');
      } catch {}
    }
  }, [isAuthenticated, user, loading]);

  useEffect(() => {
    if (!loading) {
      return;
    }

    const timer = window.setTimeout(() => {
      logger.error('Carregamento excedeu o tempo limite de 10 segundos.', { context: LOG_CONTEXT });
      setLoadingTimeout(true);
    }, LOADING_TIMEOUT_MS);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loading]);

  const authSnapshot = useMemo(
    () => ({
      isAuthenticated,
      hasUser: Boolean(user),
      loading,
      userRole: user?.role,
      userId: user?.id,
    }),
    [isAuthenticated, user, loading],
  );

  useEffect(() => {
    logger.debug('Estado de autenticação atualizado.', {
      context: LOG_CONTEXT,
      data: authSnapshot,
    });
  }, [authSnapshot]);

  const loadingScreen = useMemo(() => buildLoadingScreen('Carregando...'), []);
  const dashboardLoadingScreen = useMemo(() => buildLoadingScreen('Carregando dashboard...'), []);

  const dashboard = useMemo(() => {
    if (!user) {
      return null;
    }

    switch (user.role) {
      case Role.Patient:
        return <PatientPortalDashboard user={user} onLogout={logout} />;
      case Role.Educator:
        return <PartnerPortalDashboard user={user} onLogout={logout} />;
      case Role.Admin:
      case Role.Therapist:
      default:
        return <CompleteDashboard user={user} onLogout={logout} />;
    }
  }, [user, logout]);

  // Fast-path: se não autenticado, mostre imediatamente as rotas de Auth
  if (!isAuthenticated && !user) {
    return (
      <AuthRoutes
        onSuccess={() => setShow2FASetup(false)}
        show2FASetup={show2FASetup}
        onBack2FA={() => setShow2FASetup(false)}
        onComplete2FA={() => setShow2FASetup(false)}
      />
    );
  }

  if (loading && !loadingTimeout) {
    return loadingScreen;
  }

  if (loadingTimeout) {
    return TIMEOUT_SCREEN;
  }

  if (isAuthenticated && user) {
    // Se está na raiz, redireciona para /dashboard
    // Caso contrário, preserva a URL atual e deixa o dashboard gerenciar
    if (location.pathname === '/') {
      return <Navigate to="/dashboard" replace />;
    }
    
    // Prefetch em idle de alguns chunks de dashboard após autenticação
    runWhenIdle(() => {
      try {
        import('./pages/DashboardPage');
        import('./pages/AgendaPage');
      } catch {}
    });

    return (
      <Suspense fallback={dashboardLoadingScreen}>
        <Routes>
          <Route path="/*" element={dashboard} />
        </Routes>
      </Suspense>
    );
  }

  return (
    <AuthRoutes
      onSuccess={() => setShow2FASetup(false)}
      show2FASetup={show2FASetup}
      onBack2FA={() => setShow2FASetup(false)}
      onComplete2FA={() => setShow2FASetup(false)}
    />
  );
});

const RouterWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

const AppRoutes: React.FC = () => (
  <AppErrorBoundary>
    <RouterWrapper>
      <DebugProvider>
        <SupabaseAuthProvider>
          <AppProvider>
            <PatientProvider>
              <ExerciseProvider>
                <PerformanceProfiler
                  id="AppRoutes"
                  onRender={(id, _phase, actualDuration) => {
                    logger.performance(id, actualDuration, 100);
                  }}
                >
                  <ToastProvider>
                    <AppContent />
                    <OfflineIndicator />
                    <OfflineNotification />
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

export default AppRoutes;
