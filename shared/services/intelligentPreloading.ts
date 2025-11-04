/**
 * Sistema de Preloading Inteligente
 * 
 * Implementa preloading de componentes baseado em:
 * - Comportamento do usuário (hover, intenção)
 * - Role do usuário
 * - Páginas mais acessadas
 * - Preload de componentes críticos
 */

import { Role } from '../types';
import { logger } from './logger';

/**
 * Cache de componentes já preloaded
 */
const preloadedComponents = new Set<string>();

/**
 * Mapa estático de componentes preloadáveis
 * Substitui template strings por imports mapeados
 */
const PRELOADABLE_COMPONENTS = {
  'pages/CompleteDashboard': () => import('../pages/CompleteDashboard'),
  'pages/DashboardPage': () => import('../pages/DashboardPage'),
  'pages/AdminDashboardPage': () => import('../pages/AdminDashboardPage'),
  'pages/UserManagementPage': () => import('../pages/UserManagementPage'),
  'pages/ReportsPage': () => import('../pages/ReportsPage'),
  'pages/AgendaPage': () => import('../pages/AgendaPage'),
  'pages/PatientListPage': () => import('../pages/PatientListPage'),
  'pages/PatientDetailPage': () => import('../pages/PatientDetailPage'),
  'pages/PatientPortalDashboard': () => import('../pages/PatientPortalDashboard'),
  'pages/PartnerPortalDashboard': () => import('../pages/PartnerPortalDashboard'),
  'pages/ExercisesPage': () => import('../pages/ExercisesPage'),
  'pages/FinancialPage': () => import('../pages/FinancialPage'),
  'pages/SettingsPage': () => import('../pages/SettingsPage'),
  'components/ui/OptimizedLoader': () => import('../components/ui/OptimizedLoader'),
  'components/ErrorBoundary': () => import('../components/ErrorBoundary'),
  'components/reports/ReportsDashboard': () => import('../components/reports/ReportsDashboard'),
  'components/financial/FinancialDashboard': () => import('../components/financial/FinancialDashboard'),
};

/**
 * Configuração de preloading por role
 */
const ROLE_PRELOAD_CONFIG: Record<Role, string[]> = {
  [Role.Admin]: [
    'pages/AdminDashboardPage',
    'pages/UserManagementPage',
    'pages/ReportsPage',
    'components/reports/ReportsDashboard',
    'components/financial/FinancialDashboard',
  ],
  [Role.Therapist]: [
    'pages/DashboardPage',
    'pages/AgendaPage',
    'pages/PatientListPage',
    'pages/PatientDetailPage',
  ],
  [Role.Patient]: [
    'pages/PatientPortalDashboard',
  ],
  [Role.EducadorFisico]: [
    'pages/PartnerPortalDashboard',
  ],
};

/**
 * Componentes críticos que devem ser preloaded sempre
 */
const CRITICAL_COMPONENTS = [
  'pages/CompleteDashboard',
  'pages/DashboardPage',
  'components/ui/OptimizedLoader',
  'components/ErrorBoundary',
];

/**
 * Preload de um componente específico
 */
export async function preloadComponent(componentPath: string): Promise<void> {
  if (preloadedComponents.has(componentPath)) {
    return;
  }

  try {
    const loader = PRELOADABLE_COMPONENTS[componentPath as keyof typeof PRELOADABLE_COMPONENTS];
    if (!loader) {
      logger.warn(`Componente ${componentPath} não encontrado no mapa de preload`, {
        context: 'intelligentPreloading',
      });
      return;
    }
    await loader();
    preloadedComponents.add(componentPath);
    logger.debug(`Preloaded: ${componentPath}`, { context: 'intelligentPreloading' });
  } catch (error) {
    // Falha silenciosa - não bloquear a aplicação
    logger.debug(`Failed to preload: ${componentPath}`, {
      context: 'intelligentPreloading',
      data: error as Error,
    });
  }
}

/**
 * Preload de múltiplos componentes
 */
export async function preloadComponents(componentPaths: string[]): Promise<void> {
  await Promise.all(componentPaths.map(path => preloadComponent(path)));
}

/**
 * Preload baseado no role do usuário
 */
export async function preloadForRole(role: Role): Promise<void> {
  const componentsToPreload = ROLE_PRELOAD_CONFIG[role] || [];
  await preloadComponents(componentsToPreload);
}

/**
 * Preload de componentes críticos
 */
export async function preloadCriticalComponents(): Promise<void> {
  await preloadComponents(CRITICAL_COMPONENTS);
}

/**
 * Preload baseado em hover em links
 */
export function setupHoverPreloading(): void {
  if (typeof window === 'undefined') return;

  const links = document.querySelectorAll('a[href]');
  
  links.forEach(link => {
    link.addEventListener('mouseenter', () => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      // Preload da página quando o usuário hover no link
      const componentPath = hrefToComponentPath(href);
      if (componentPath) {
        preloadComponent(componentPath);
      }
    });
  });
}

/**
 * Converter href para caminho do componente
 */
function hrefToComponentPath(href: string): string | null {
  // Mapeamento de rotas para componentes
  const routeMap: Record<string, string> = {
    '/dashboard': 'pages/DashboardPage',
    '/agenda': 'pages/AgendaPage',
    '/patients': 'pages/PatientListPage',
    '/exercises': 'pages/ExercisesPage',
    '/reports': 'pages/ReportsPage',
    '/financial': 'pages/FinancialPage',
    '/settings': 'pages/SettingsPage',
    '/admin': 'pages/AdminDashboardPage',
  };

  return routeMap[href] || null;
}

/**
 * Preload baseado em intenção (viewport)
 */
export function setupIntersectionPreloading(): void {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const componentPath = element.dataset.preload;
        
        if (componentPath) {
          preloadComponent(componentPath);
          observer.unobserve(element);
        }
      }
    });
  }, {
    rootMargin: '200px', // Preload 200px antes de entrar no viewport
  });

  // Observar elementos com data-preload
  document.querySelectorAll('[data-preload]').forEach(el => {
    observer.observe(el);
  });
}

/**
 * Preload baseado em prioridade
 */
export async function preloadWithPriority(
  components: Array<{ path: string; priority: number }>
): Promise<void> {
  // Ordenar por prioridade (maior primeiro)
  const sorted = components.sort((a, b) => b.priority - a.priority);
  
  // Preload em paralelo, mas com limite de concorrência
  const BATCH_SIZE = 3;
  for (let i = 0; i < sorted.length; i += BATCH_SIZE) {
    const batch = sorted.slice(i, i + BATCH_SIZE);
    await Promise.all(batch.map(c => preloadComponent(c.path)));
  }
}

/**
 * Preload de bibliotecas pesadas baseado em uso
 */
export async function preloadHeavyLibraries(libraries: string[]): Promise<void> {
  const libraryMap: Record<string, () => Promise<any>> = {
    'recharts': () => import('recharts'),
    'tiptap': () => import('@tiptap/react'),
    'pdf': () => import('jspdf'),
    'charts': () => import('recharts'),
  };

  await Promise.all(
    libraries.map(lib => {
      const importFn = libraryMap[lib];
      if (importFn) {
        return importFn().catch(err => {
          logger.warn(`Failed to preload library: ${lib}`, {
            context: 'intelligentPreloading',
            data: err,
          });
        });
      }
    })
  );
}

/**
 * Sistema de preloading inteligente completo
 */
export async function initializeIntelligentPreloading(userRole?: Role): Promise<void> {
  logger.debug('Initializing intelligent preloading...', {
    context: 'intelligentPreloading',
    data: { userRole },
  });

  // 1. Preload componentes críticos
  await preloadCriticalComponents();

  // 2. Preload baseado no role
  if (userRole) {
    await preloadForRole(userRole);
  }

  // 3. Setup hover preloading
  setupHoverPreloading();

  // 4. Setup intersection preloading
  setupIntersectionPreloading();

  logger.debug('Intelligent preloading initialized', {
    context: 'intelligentPreloading',
  });
}

/**
 * Preload de componentes baseado em analytics
 * (páginas mais acessadas)
 */
export async function preloadBasedOnAnalytics(analytics: Array<{ path: string; visits: number }>): Promise<void> {
  const topPages = analytics
    .sort((a, b) => b.visits - a.visits)
    .slice(0, 5) // Top 5 páginas
    .map(item => item.path);

  await preloadComponents(topPages);
}

/**
 * Preload de componentes baseado em tempo
 * (preload após X segundos de inatividade)
 */
export function setupIdlePreloading(delay: number = 3000): void {
  if (typeof window === 'undefined') return;

  let idleTimer: NodeJS.Timeout;
  
  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      // Preload de componentes menos críticos
      preloadComponents([
        'pages/SettingsPage',
        'pages/ReportsPage',
        'components/reports/ReportsDashboard',
      ]);
    }, delay);
  };

  // Reset timer em eventos de interação
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetTimer, { passive: true });
  });

  resetTimer();
}

/**
 * Preload de componentes baseado em conexão
 */
export async function preloadBasedOnConnection(): Promise<void> {
  if (typeof window === 'undefined') return;

  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (connection) {
    const effectiveType = connection.effectiveType;
    
    // Preload mais agressivo em conexões rápidas
    if (effectiveType === '4g') {
      await preloadComponents([
        'pages/DashboardPage',
        'pages/AgendaPage',
        'pages/PatientListPage',
      ]);
    }
  }
}

/**
 * Preload de componentes baseado em geolocalização
 * (preload de componentes relevantes para a região)
 */
export async function preloadBasedOnLocation(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const position = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 1000,
        maximumAge: 60000,
      });
    });

    // Preload de componentes baseado em localização
    // (exemplo: preload de componentes de clima, eventos locais, etc.)
    logger.debug('Location-based preloading enabled', {
      context: 'intelligentPreloading',
    });
  } catch (error) {
    // Silently fail
    logger.debug('Location-based preloading skipped', {
      context: 'intelligentPreloading',
    });
  }
}

/**
 * Preload de componentes baseado em preferências do usuário
 */
export async function preloadBasedOnPreferences(preferences: {
  darkMode?: boolean;
  language?: string;
  timezone?: string;
}): Promise<void> {
  // Preload de componentes baseado em preferências
  // (exemplo: preload de componentes de tema, idioma, etc.)
  logger.debug('Preferences-based preloading', {
    context: 'intelligentPreloading',
    data: preferences,
  });
}

/**
 * Preload de componentes baseado em histórico
 */
export async function preloadBasedOnHistory(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const history = JSON.parse(localStorage.getItem('navigation_history') || '[]');
    const recentPages = history
      .slice(-5) // Últimas 5 páginas
      .map((item: any) => item.path);

    await preloadComponents(recentPages);
  } catch (error) {
    logger.warn('Failed to preload based on history', {
      context: 'intelligentPreloading',
      data: error as Error,
    });
  }
}

/**
 * Sistema completo de preloading inteligente
 */
export async function initializeCompletePreloading(userRole?: Role): Promise<void> {
  logger.debug('Initializing complete intelligent preloading...', {
    context: 'intelligentPreloading',
    data: { userRole },
  });

  // 1. Preload crítico
  await preloadCriticalComponents();

  // 2. Preload baseado em role
  if (userRole) {
    await preloadForRole(userRole);
  }

  // 3. Preload baseado em conexão
  await preloadBasedOnConnection();

  // 4. Setup hover preloading
  setupHoverPreloading();

  // 5. Setup intersection preloading
  setupIntersectionPreloading();

  // 6. Setup idle preloading
  setupIdlePreloading(3000);

  // 7. Preload baseado em histórico
  await preloadBasedOnHistory();

  logger.debug('Complete intelligent preloading initialized', {
    context: 'intelligentPreloading',
  });
}

