/**
 * 📊 Performance Monitoring para DuduFisio-AI
 *
 * Monitora Core Web Vitals e outras métricas de performance
 * Integra com Sentry e pode enviar para analytics customizado
 */

interface PerformanceMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  timestamp: number;
}

interface WebVitalsMetrics {
  FCP?: PerformanceMetric;  // First Contentful Paint
  LCP?: PerformanceMetric;  // Largest Contentful Paint
  FID?: PerformanceMetric;  // First Input Delay
  CLS?: PerformanceMetric;  // Cumulative Layout Shift
  TTFB?: PerformanceMetric; // Time to First Byte
  INP?: PerformanceMetric;  // Interaction to Next Paint
}

// Thresholds baseados em Core Web Vitals
const THRESHOLDS = {
  FCP: { good: 1800, poor: 3000 },
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
};

/**
 * Determina o rating da métrica
 */
function getRating(
  metricName: keyof typeof THRESHOLDS,
  value: number
): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[metricName];
  if (value <= threshold.good) return 'good';
  if (value <= threshold.poor) return 'needs-improvement';
  return 'poor';
}

/**
 * Coleta Core Web Vitals usando a API nativa
 */
export function initWebVitalsMonitoring() {
  if (typeof window === 'undefined') return;

  const metrics: WebVitalsMetrics = {};

  // Observer para LCP
  try {
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1] as PerformanceEntry & {
        renderTime?: number;
        loadTime?: number;
      };

      const value = lastEntry.renderTime || lastEntry.loadTime || 0;

      metrics.LCP = {
        name: 'LCP',
        value,
        rating: getRating('LCP', value),
        timestamp: Date.now(),
      };

      reportMetric(metrics.LCP);
    });

    lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
  } catch (e) {
    console.warn('LCP not supported');
  }

  // Observer para FID
  try {
    const fidObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        const value = entry.processingStart - entry.startTime;

        metrics.FID = {
          name: 'FID',
          value,
          rating: getRating('FID', value),
          timestamp: Date.now(),
        };

        reportMetric(metrics.FID);
      });
    });

    fidObserver.observe({ type: 'first-input', buffered: true });
  } catch (e) {
    console.warn('FID not supported');
  }

  // Observer para CLS
  try {
    let clsValue = 0;
    const clsObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;

          metrics.CLS = {
            name: 'CLS',
            value: clsValue,
            rating: getRating('CLS', clsValue),
            timestamp: Date.now(),
          };
        }
      });
    });

    clsObserver.observe({ type: 'layout-shift', buffered: true });

    // Report CLS when page is hidden
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden' && metrics.CLS) {
        reportMetric(metrics.CLS);
      }
    });
  } catch (e) {
    console.warn('CLS not supported');
  }

  // FCP usando Performance API
  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          metrics.FCP = {
            name: 'FCP',
            value: entry.startTime,
            rating: getRating('FCP', entry.startTime),
            timestamp: Date.now(),
          };

          reportMetric(metrics.FCP);
        }
      });
    });

    observer.observe({ type: 'paint', buffered: true });
  } catch (e) {
    console.warn('FCP not supported');
  }

  // TTFB usando Navigation Timing
  window.addEventListener('load', () => {
    const navTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    if (navTiming) {
      const ttfb = navTiming.responseStart - navTiming.requestStart;

      metrics.TTFB = {
        name: 'TTFB',
        value: ttfb,
        rating: getRating('TTFB', ttfb),
        timestamp: Date.now(),
      };

      reportMetric(metrics.TTFB);
    }
  });

  return metrics;
}

/**
 * Reporta métrica para serviços de analytics
 */
function reportMetric(metric: PerformanceMetric) {
  console.log(`[Performance] ${metric.name}:`, {
    value: `${metric.value.toFixed(2)}ms`,
    rating: metric.rating,
  });

  // Enviar para Sentry (se disponível)
  if (typeof window !== 'undefined' && (window as any).Sentry) {
    (window as any).Sentry.captureMessage(`Performance: ${metric.name}`, {
      level: metric.rating === 'poor' ? 'warning' : 'info',
      extra: metric,
    });
  }

  // Enviar para analytics customizado
  sendToAnalytics(metric);

  // Armazenar localmente para dashboard
  storeMetricLocally(metric);
}

/**
 * Envia métrica para serviço de analytics
 */
function sendToAnalytics(metric: PerformanceMetric) {
  // Google Analytics 4
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.value),
      metric_rating: metric.rating,
      metric_timestamp: metric.timestamp,
    });
  }

  // Endpoint customizado (opcional)
  if (process.env.VITE_ANALYTICS_ENDPOINT) {
    fetch(process.env.VITE_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'performance',
        metric,
        userAgent: navigator.userAgent,
        url: window.location.href,
      }),
    }).catch((err) => console.error('Analytics error:', err));
  }
}

/**
 * Armazena métrica no LocalStorage para dashboard
 */
function storeMetricLocally(metric: PerformanceMetric) {
  try {
    const storageKey = 'performance_metrics';
    const stored = localStorage.getItem(storageKey);
    const metrics: PerformanceMetric[] = stored ? JSON.parse(stored) : [];

    metrics.push(metric);

    // Manter apenas últimas 100 métricas
    const recentMetrics = metrics.slice(-100);

    localStorage.setItem(storageKey, JSON.stringify(recentMetrics));
  } catch (e) {
    // LocalStorage full ou bloqueado
  }
}

/**
 * Obtém métricas armazenadas localmente
 */
export function getStoredMetrics(): PerformanceMetric[] {
  try {
    const stored = localStorage.getItem('performance_metrics');
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
}

/**
 * Calcula estatísticas agregadas das métricas
 */
export function getMetricsStats() {
  const metrics = getStoredMetrics();

  const groupedByName = metrics.reduce((acc, metric) => {
    if (!acc[metric.name]) {
      acc[metric.name] = [];
    }
    acc[metric.name].push(metric.value);
    return acc;
  }, {} as Record<string, number[]>);

  const stats: Record<string, { avg: number; min: number; max: number; count: number }> = {};

  Object.entries(groupedByName).forEach(([name, values]) => {
    stats[name] = {
      avg: values.reduce((a, b) => a + b, 0) / values.length,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length,
    };
  });

  return stats;
}

/**
 * Monitora performance de componentes React
 */
export function measureComponentRender(
  componentName: string,
  callback: () => void
) {
  const start = performance.now();
  callback();
  const duration = performance.now() - start;

  if (duration > 16.67) { // > 1 frame (60fps)
    console.warn(`[Performance] ${componentName} render took ${duration.toFixed(2)}ms`);

    // Reportar renders lentos
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureMessage(`Slow render: ${componentName}`, {
        level: 'warning',
        extra: { duration, threshold: 16.67 },
      });
    }
  }
}

/**
 * Hook do React para monitorar performance de componentes
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const [renderCount, setRenderCount] = React.useState(0);
  const renderStart = React.useRef(performance.now());

  React.useEffect(() => {
    const duration = performance.now() - renderStart.current;
    setRenderCount((c) => c + 1);

    if (duration > 16.67) {
      console.warn(
        `[Performance] ${componentName} mount/update took ${duration.toFixed(2)}ms (render #${renderCount})`
      );
    }

    renderStart.current = performance.now();
  });

  return { renderCount };
}

/**
 * Monitora Long Tasks (tarefas >50ms)
 */
export function initLongTaskMonitoring() {
  if (typeof window === 'undefined') return;

  try {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        console.warn('[Performance] Long Task detected:', {
          duration: `${entry.duration.toFixed(2)}ms`,
          startTime: `${entry.startTime.toFixed(2)}ms`,
        });

        // Reportar para Sentry se >100ms
        if (entry.duration > 100 && (window as any).Sentry) {
          (window as any).Sentry.captureMessage('Long Task detected', {
            level: 'warning',
            extra: {
              duration: entry.duration,
              startTime: entry.startTime,
            },
          });
        }
      });
    });

    observer.observe({ type: 'longtask', buffered: true });
  } catch (e) {
    console.warn('Long Task API not supported');
  }
}

/**
 * Monitora uso de memória
 */
export function getMemoryUsage() {
  if (typeof window === 'undefined') return null;

  const memory = (performance as any).memory;

  if (!memory) return null;

  return {
    usedJSHeapSize: (memory.usedJSHeapSize / 1048576).toFixed(2) + ' MB',
    totalJSHeapSize: (memory.totalJSHeapSize / 1048576).toFixed(2) + ' MB',
    jsHeapSizeLimit: (memory.jsHeapSizeLimit / 1048576).toFixed(2) + ' MB',
    percentage: ((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100).toFixed(2) + '%',
  };
}

/**
 * Inicializa todo o monitoramento de performance
 */
export function initPerformanceMonitoring() {
  if (typeof window === 'undefined') return;

  

  // Core Web Vitals
  initWebVitalsMonitoring();

  // Long Tasks
  initLongTaskMonitoring();

  // Memory usage (log a cada 30s)
  setInterval(() => {
    const memory = getMemoryUsage();
    if (memory) {
      
    }
  }, 30000);

  
}

// Auto-inicializar em produção
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    initPerformanceMonitoring();
  });
}
