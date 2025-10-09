/**
 * Performance Utilities
 * Funções para medição e otimização de performance
 */

/**
 * Mede performance de uma função
 * 
 * @example
 * ```typescript
 * measurePerformance('loadData', async () => {
 *   await fetchData();
 * });
 * ```
 */
export function measurePerformance<T>(
  metricName: string,
  callback: () => T | Promise<T>
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const start = performance.now();
    
    try {
      const result = await callback();
      const end = performance.now();
      const duration = end - start;
      
      console.log(`[Performance] ${metricName}: ${duration.toFixed(2)}ms`);
      
      // Enviar para analytics (se configurado)
      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'timing_complete', {
          name: metricName,
          value: Math.round(duration),
          event_category: 'Performance',
        });
      }
      
      resolve(result);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Debounce para otimizar inputs e buscas
 * 
 * @example
 * ```typescript
 * const debouncedSearch = debounce((query) => {
 *   searchAPI(query);
 * }, 300);
 * 
 * <input onChange={(e) => debouncedSearch(e.target.value)} />
 * ```
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle para otimizar scroll e resize handlers
 * 
 * @example
 * ```typescript
 * const throttledScroll = throttle(() => {
 *   handleScroll();
 * }, 100);
 * 
 * window.addEventListener('scroll', throttledScroll);
 * ```
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Lazy load de componente com retry
 * 
 * @example
 * ```typescript
 * const LazyDashboard = lazyWithRetry(() => import('./Dashboard'));
 * ```
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>
) {
  return React.lazy(async () => {
    const pageHasAlreadyBeenForceRefreshed = JSON.parse(
      window.sessionStorage.getItem('page-has-been-force-refreshed') || 'false'
    );

    try {
      const component = await componentImport();
      window.sessionStorage.setItem('page-has-been-force-refreshed', 'false');
      return component;
    } catch (error) {
      if (!pageHasAlreadyBeenForceRefreshed) {
        window.sessionStorage.setItem('page-has-been-force-refreshed', 'true');
        return window.location.reload() as any;
      }

      throw error;
    }
  });
}

/**
 * Calcula Web Vitals
 * 
 * @example
 * ```typescript
 * reportWebVitals((metric) => {
 *   console.log(metric);
 *   sendToAnalytics(metric);
 * });
 * ```
 */
export function reportWebVitals(onPerfEntry?: (metric: any) => void) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(onPerfEntry);
      getFID(onPerfEntry);
      getFCP(onPerfEntry);
      getLCP(onPerfEntry);
      getTTFB(onPerfEntry);
    });
  }
}

/**
 * Intersection Observer para lazy load customizado
 * 
 * @example
 * ```typescript
 * useIntersectionObserver(ref, () => {
 *   loadMoreData();
 * });
 * ```
 */
export function createIntersectionObserver(
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver {
  return new IntersectionObserver(callback, {
    root: null,
    rootMargin: '50px',
    threshold: 0.1,
    ...options,
  });
}

/**
 * Preload de recursos críticos
 * 
 * @example
 * ```typescript
 * preloadResource('/api/critical-data', 'fetch');
 * preloadResource('/important-image.jpg', 'image');
 * ```
 */
export function preloadResource(
  href: string,
  as: 'script' | 'style' | 'image' | 'fetch' | 'font'
) {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  
  if (as === 'font') {
    link.crossOrigin = 'anonymous';
  }
  
  document.head.appendChild(link);
}

/**
 * Prefetch de rota para navegação mais rápida
 * 
 * @example
 * ```tsx
 * <Link 
 *   to="/dashboard"
 *   onMouseEnter={() => prefetchRoute('/dashboard')}
 * >
 *   Dashboard
 * </Link>
 * ```
 */
export function prefetchRoute(route: string) {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = route;
  document.head.appendChild(link);
}




