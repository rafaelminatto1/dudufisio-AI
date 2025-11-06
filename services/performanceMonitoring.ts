/**
 * Performance Monitoring Service
 * MoocaFisio - Real User Monitoring (RUM)
 *
 * ✅ Implementa monitoramento de Core Web Vitals:
 * - LCP (Largest Contentful Paint)
 * - FID (First Input Delay) / INP (Interaction to Next Paint)
 * - CLS (Cumulative Layout Shift)
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 *
 * 📊 Envia métricas para analytics (Google Analytics, Supabase, etc.)
 */

// Types para Web Vitals
export interface WebVitalMetric {
  name: 'CLS' | 'FID' | 'FCP' | 'LCP' | 'TTFB' | 'INP';
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

export interface PerformanceBudget {
  metric: string;
  budget: number;  // em ms ou score
  actual: number;
  status: 'pass' | 'warning' | 'fail';
}

/**
 * Performance Budgets recomendados
 * Baseado em Google Web Vitals thresholds
 */
export const PERFORMANCE_BUDGETS = {
  // Core Web Vitals
  LCP: { good: 2500, needsImprovement: 4000 },      // Largest Contentful Paint
  FID: { good: 100, needsImprovement: 300 },        // First Input Delay
  INP: { good: 200, needsImprovement: 500 },        // Interaction to Next Paint
  CLS: { good: 0.1, needsImprovement: 0.25 },       // Cumulative Layout Shift

  // Additional Metrics
  FCP: { good: 1800, needsImprovement: 3000 },      // First Contentful Paint
  TTFB: { good: 800, needsImprovement: 1800 },      // Time to First Byte

  // Custom Budgets
  BUNDLE_SIZE: { good: 1000000, needsImprovement: 1500000 },  // 1MB inicial
  TOTAL_BUNDLE: { good: 8000000, needsImprovement: 10000000 } // 8MB total
};

/**
 * Calcula rating baseado nos thresholds do Google
 */
export function calculateRating(
  metricName: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const budget = PERFORMANCE_BUDGETS[metricName as keyof typeof PERFORMANCE_BUDGETS];

  if (!budget) return 'good';

  if (value <= budget.good) return 'good';
  if (value <= budget.needsImprovement) return 'needs-improvement';
  return 'poor';
}

/**
 * Lazy load da biblioteca web-vitals
 * Reduz bundle inicial em ~3KB
 */
async function loadWebVitals() {
  console.log('[Performance] Lazy loading web-vitals...');
  return await import('web-vitals');
}

/**
 * Handler para enviar métricas para analytics
 */
function sendToAnalytics(metric: WebVitalMetric) {
  const { name, value, rating, id } = metric;

  console.log(`[Performance] ${name}:`, {
    value: `${Math.round(value)}${name === 'CLS' ? '' : 'ms'}`,
    rating,
    id: id.substring(0, 8)
  });

  // Enviar para Google Analytics (se disponível)
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', name, {
      value: Math.round(name === 'CLS' ? value * 1000 : value),
      event_category: 'Web Vitals',
      event_label: id,
      non_interaction: true,
    });
  }

  // Enviar para console em desenvolvimento
  if (import.meta.env.DEV) {
    console.table({
      Metric: name,
      Value: Math.round(value),
      Rating: rating,
      Budget: getBudgetStatus(name, value)
    });
  }

  // TODO: Enviar para Supabase ou backend para armazenamento
  // await sendMetricToBackend({ name, value, rating, timestamp: Date.now() });
}

/**
 * Verifica status do budget
 */
function getBudgetStatus(metricName: string, value: number): string {
  const rating = calculateRating(metricName, value);
  const budget = PERFORMANCE_BUDGETS[metricName as keyof typeof PERFORMANCE_BUDGETS];

  if (!budget) return 'N/A';

  const symbols = {
    good: '✅',
    'needs-improvement': '⚠️',
    poor: '❌'
  };

  return `${symbols[rating]} ${Math.round(value)}/${budget.good}`;
}

/**
 * Inicializa monitoramento de Web Vitals
 * Deve ser chamado o mais cedo possível (no App.tsx)
 */
export async function initPerformanceMonitoring() {
  try {
    // Lazy load web-vitals apenas em produção ou quando explicitamente habilitado
    if (!import.meta.env.PROD && !localStorage.getItem('enable-web-vitals')) {
      console.log('[Performance] Web Vitals disabled in development. Enable with: localStorage.setItem("enable-web-vitals", "true")');
      return;
    }

    console.log('[Performance] Initializing Web Vitals monitoring...');

    const webVitals = await loadWebVitals();

    // Core Web Vitals
    webVitals.onLCP(sendToAnalytics as any);   // Largest Contentful Paint
    webVitals.onFID(sendToAnalytics as any);   // First Input Delay
    webVitals.onCLS(sendToAnalytics as any);   // Cumulative Layout Shift

    // Additional Metrics
    webVitals.onFCP(sendToAnalytics as any);   // First Contentful Paint
    webVitals.onTTFB(sendToAnalytics as any);  // Time to First Byte

    // Interaction to Next Paint (novo - substitui FID)
    if (webVitals.onINP) {
      webVitals.onINP(sendToAnalytics as any);
    }

    console.log('[Performance] Web Vitals monitoring initialized ✅');
  } catch (error) {
    console.error('[Performance] Error initializing Web Vitals:', error);
  }
}

/**
 * Reporta custom performance mark
 */
export function reportCustomMetric(name: string, value: number) {
  console.log(`[Performance] Custom: ${name} = ${Math.round(value)}ms`);

  // Enviar para analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'custom_metric', {
      metric_name: name,
      value: Math.round(value),
      event_category: 'Performance',
    });
  }
}

/**
 * Mede performance de uma operação
 */
export async function measurePerformance<T>(
  name: string,
  operation: () => Promise<T>
): Promise<T> {
  const startTime = performance.now();

  try {
    const result = await operation();
    const duration = performance.now() - startTime;

    reportCustomMetric(name, duration);

    return result;
  } catch (error) {
    const duration = performance.now() - startTime;
    reportCustomMetric(`${name}_error`, duration);
    throw error;
  }
}

/**
 * Verifica se algum budget foi excedido
 */
export function checkPerformanceBudgets(): PerformanceBudget[] {
  const results: PerformanceBudget[] = [];

  // Verificar bundle size (se disponível no build)
  const bundleInfo = (window as any).__BUNDLE_INFO__;
  if (bundleInfo) {
    results.push({
      metric: 'Initial Bundle',
      budget: PERFORMANCE_BUDGETS.BUNDLE_SIZE.good,
      actual: bundleInfo.initialSize,
      status: bundleInfo.initialSize <= PERFORMANCE_BUDGETS.BUNDLE_SIZE.good ? 'pass' :
              bundleInfo.initialSize <= PERFORMANCE_BUDGETS.BUNDLE_SIZE.needsImprovement ? 'warning' : 'fail'
    });
  }

  return results;
}

/**
 * Exporta relatório de performance
 */
export function exportPerformanceReport(): string {
  const budgets = checkPerformanceBudgets();

  const report = {
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    connection: (navigator as any).connection?.effectiveType || 'unknown',
    budgets,
    url: window.location.href
  };

  return JSON.stringify(report, null, 2);
}

/**
 * Monitora Long Tasks (tarefas que bloqueiam a thread principal > 50ms)
 */
export function monitorLongTasks() {
  if (!('PerformanceObserver' in window)) {
    console.warn('[Performance] PerformanceObserver not supported');
    return;
  }

  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) {
          console.warn(`[Performance] Long Task detected: ${Math.round(entry.duration)}ms`);

          // Enviar para analytics
          if ((window as any).gtag) {
            (window as any).gtag('event', 'long_task', {
              value: Math.round(entry.duration),
              event_category: 'Performance',
            });
          }
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    console.log('[Performance] Long Tasks monitoring enabled');
  } catch (error) {
    console.error('[Performance] Error setting up Long Tasks observer:', error);
  }
}

/**
 * Service completo de performance monitoring
 */
export const performanceMonitoringService = {
  init: initPerformanceMonitoring,
  reportCustomMetric,
  measurePerformance,
  checkPerformanceBudgets,
  exportPerformanceReport,
  monitorLongTasks,
  BUDGETS: PERFORMANCE_BUDGETS
};

export default performanceMonitoringService;
