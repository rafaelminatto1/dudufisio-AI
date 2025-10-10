import React, { Suspense, lazy, ComponentType } from 'react';
import OptimizedLoader from '../components/ui/OptimizedLoader';
import { ErrorBoundary } from '../components/ErrorBoundary';

/**
 * 🚀 Sistema de Lazy Loading Otimizado
 * 
 * Implementa carregamento sob demanda com:
 * - Suspense boundaries inteligentes
 * - Loading states personalizados
 * - Error boundaries
 * - Preload de componentes críticos
 */

interface LazyComponentProps {
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

/**
 * Wrapper para componentes lazy com fallback otimizado
 * ✅ FIX: Removido forwardRef para compatibilidade com React 19 e evitar erros de hook
 */
export function createLazyComponent<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFn);

  const WrappedComponent: React.FC = (props) => (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('🚨 Erro no componente lazy:', error, errorInfo);
      }}
    >
      <Suspense fallback={fallback || <OptimizedLoader variant="skeleton" />}>
        <LazyComponent {...props} />
      </Suspense>
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `Lazy(${LazyComponent.name || 'Component'})`;

  return WrappedComponent;
}

/**
 * 🎯 Lazy Components Otimizados - Dashboard Pages
 * Exports individuais para compatibilidade com AppRoutes.tsx
 */
export const CompleteDashboard = createLazyComponent(
  () => import('../pages/CompleteDashboard')
);

export const PatientPortalDashboard = createLazyComponent(
  () => import('../pages/PatientPortalDashboard')
);

export const PartnerPortalDashboard = createLazyComponent(
  () => import('../pages/PartnerPortalDashboard')
);

export const WhatsAppManagementPage = createLazyComponent(
  () => import('../pages/WhatsAppManagementPage')
);

/**
 * Lazy loading para páginas principais
 */
export const LazyPages = {
  DashboardPage: createLazyComponent(() => import('../pages/DashboardPage')),
  AgendaPage: createLazyComponent(() => import('../pages/AgendaPage')),
  PatientListPage: createLazyComponent(() => import('../pages/PatientListPage')),
  PatientDetailPage: createLazyComponent(() => import('../pages/PatientDetailPage')),
  TherapistDashboard: createLazyComponent(() => import('../pages/TherapistDashboard')),
  ReportsPage: createLazyComponent(() => import('../pages/ReportsPage')),
  AiAnalyticsPage: createLazyComponent(() => import('../pages/AiAnalyticsPage')),
  FinancialPage: createLazyComponent(() => import('../pages/FinancialPage')),
  FinancialDashboardPage: createLazyComponent(() => import('../pages/FinancialPage')), // Alias para compatibilidade
  InventoryPage: createLazyComponent(() => import('../pages/InventoryPage')),
  UserManagementPage: createLazyComponent(() => import('../pages/UserManagementPage')),
  NotFoundPage: createLazyComponent(() => import('../pages/NotFoundPage')),
  ErrorPage: createLazyComponent(() => import('../pages/ErrorPage')),
  AdminDashboardPage: createLazyComponent(() => import('../pages/AdminDashboardPage')),
  CompleteDashboard: CompleteDashboard,
  SessionFormPage: createLazyComponent(() => import('../pages/SessionFormPage')),
  SessionViewPage: createLazyComponent(() => import('../pages/SessionViewPage')),
  SuppliesPage: createLazyComponent(() => import('../pages/SuppliesPage')),
};

/**
 * Lazy loading para componentes pesados
 */
export const LazyComponents = {
  // Componentes de Analytics
  FinancialDashboard: createLazyComponent(() => import('../components/financial/FinancialDashboard')),
  CommunicationDashboard: createLazyComponent(() => import('../components/communication/CommunicationDashboard')),
  ReportsDashboard: createLazyComponent(() => import('../components/reports/ReportsDashboard')),
  ConsolidatedReportsDashboard: createLazyComponent(() => import('../components/reports/ConsolidatedReportsDashboard')),
  
  // Componentes de Agenda
  EnhancedAgendaPage: createLazyComponent(() => import('../components/agenda/EnhancedAgendaPage')),
  ImprovedWeeklyView: createLazyComponent(() => import('../components/agenda/ImprovedWeeklyView')),
  
  // Componentes Médicos
  BodyMapContainer: createLazyComponent(() => import('../components/medical/body-map/BodyMapContainer')),
  MedicalRecordsSystem: createLazyComponent(() => import('../components/medical-records/MedicalRecordsSystem').then(m => ({ default: m.default || m as any }))),
  MedicalRecordsDashboard: createLazyComponent(() => import('../components/medical-records/MedicalRecordsDashboard')),
  
  // Componentes de IA
  ConsolidatedAITools: createLazyComponent(() => import('../components/ai-tools/ConsolidatedAITools')),
  
  // Componentes de Paciente
  PatientDashboard: createLazyComponent(() => import('../components/patient-portal/PatientDashboard')),
};

/**
 * Hook para preload de componentes
 */
export function usePreload() {
  const preloadMap = new Map<string, Promise<any>>();

  const preload = React.useCallback((importFn: () => Promise<any>, key: string) => {
    if (!preloadMap.has(key)) {
      preloadMap.set(key, importFn());
    }
    return preloadMap.get(key);
  }, []);

  const preloadPage = React.useCallback((pageName: keyof typeof LazyPages) => {
    const component = LazyPages[pageName];
    if (component && typeof component !== 'undefined') {
      // Preload do componente lazy
      preload(() => import(/* @vite-ignore */ `../pages/${pageName}`), `page-${pageName}`);
    }
  }, [preload]);

  return { preload, preloadPage };
}

/**
 * Componente de Suspense com error boundary
 */
interface SuspenseWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error) => void;
}

export class SuspenseWrapper extends React.Component<
  SuspenseWrapperProps,
  { hasError: boolean; error?: Error }
> {
  constructor(props: SuspenseWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('SuspenseWrapper Error:', error, errorInfo);
    this.props.onError?.(error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">
            Erro ao carregar componente
          </h3>
          <p className="text-slate-600 mb-4">
            {this.state.error?.message || 'Ocorreu um erro inesperado'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return (
      <ErrorBoundary
        onError={(error, errorInfo) => {
          console.error('🚨 Erro no SuspenseWrapper:', error, errorInfo);
        }}
      >
        <Suspense fallback={this.props.fallback || <OptimizedLoader variant="skeleton" />}>
          {this.props.children}
        </Suspense>
      </ErrorBoundary>
    );
  }
}

/**
 * Utilitário para preload de rotas críticas
 */
export const preloadCriticalRoutes = () => {
  // Preload das páginas mais acessadas
  const criticalPages = [
    'DashboardPage',
    'AgendaPage', 
    'PatientListPage',
    'TherapistDashboard'
  ] as const;

  criticalPages.forEach(pageName => {
    // Preload em background
    setTimeout(() => {
      import(/* @vite-ignore */ `../pages/${pageName}`).catch(console.error);
    }, 100);
  });
};

// 🎯 Preloading de componentes críticos
export const preloadCriticalComponents = () => {
  // Usar requestIdleCallback para preload quando o browser estiver ocioso
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      console.log('🔵 [PRELOAD] Iniciando preload de componentes críticos...');
      Promise.all([
        import('../pages/CompleteDashboard'),
        import('../components/Sidebar'),
        import('../components/Breadcrumbs')
      ])
      .then(() => {
        console.log('✅ [PRELOAD] Componentes críticos carregados com sucesso');
      })
      .catch((error) => {
        console.error('❌ [PRELOAD] Erro ao carregar componentes críticos:', error);
      });
    });
  } else {
    // Fallback para browsers que não suportam requestIdleCallback
    setTimeout(() => {
      console.log('🔵 [PRELOAD] Iniciando preload de componentes críticos (fallback)...');
      Promise.all([
        import('../pages/CompleteDashboard'),
        import('../components/Sidebar'),
        import('../components/Breadcrumbs')
      ])
      .then(() => {
        console.log('✅ [PRELOAD] Componentes críticos carregados com sucesso');
      })
      .catch((error) => {
        console.error('❌ [PRELOAD] Erro ao carregar componentes críticos:', error);
      });
    }, 100); // Delay mínimo
  }
};

// 🎯 Preloading baseado em role do usuário
export const preloadUserRoleComponents = (userRole: string) => {
  // Usar requestIdleCallback para preload quando o browser estiver ocioso
  const doPreload = () => {
    console.log(`🔵 [PRELOAD] Carregando componentes para role: ${userRole}`);
    
    switch (userRole) {
      case 'Admin':
      case 'Therapist':
        Promise.all([
          import('../pages/AcompanhamentoPage'),
          import('../pages/GroupsPage'),
          import('../pages/NotificationCenterPage')
        ])
        .then(() => {
          console.log(`✅ [PRELOAD] Componentes de ${userRole} carregados`);
        })
        .catch((error) => {
          console.error(`❌ [PRELOAD] Erro ao carregar componentes de ${userRole}:`, error);
        });
        break;
      case 'Patient':
        Promise.all([
          import('../pages/patient-portal/PatientDashboardPage'),
          import('../pages/patient-portal/MyAppointmentsPage'),
          import('../pages/patient-portal/MyExercisesPage')
        ])
        .then(() => {
          console.log(`✅ [PRELOAD] Componentes de ${userRole} carregados`);
        })
        .catch((error) => {
          console.error(`❌ [PRELOAD] Erro ao carregar componentes de ${userRole}:`, error);
        });
        break;
      case 'EducadorFisico':
        Promise.all([
          import('../pages/partner-portal/EducatorDashboardPage'),
          import('../pages/partner-portal/ClientListPage')
        ])
        .then(() => {
          console.log(`✅ [PRELOAD] Componentes de ${userRole} carregados`);
        })
        .catch((error) => {
          console.error(`❌ [PRELOAD] Erro ao carregar componentes de ${userRole}:`, error);
        });
        break;
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(doPreload);
  } else {
    // Fallback para browsers antigos com delay mínimo
    setTimeout(doPreload, 100);
  }
};

export default LazyPages;
