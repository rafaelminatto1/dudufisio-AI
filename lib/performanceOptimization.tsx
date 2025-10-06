import React, { useMemo, useCallback, useState, useEffect } from 'react';

/**
 * 🚀 Sistema de Otimização de Performance
 * 
 * Implementa técnicas avançadas para melhorar o carregamento das páginas:
 * - Memoização inteligente
 * - Lazy loading otimizado
 * - Debounce de operações pesadas
 * - Virtualização de listas
 * - Preload de recursos críticos
 */

// 🎯 Hook para debounce de operações
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 🎯 Hook para throttle de operações
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [lastCall, setLastCall] = useState(0);

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        setLastCall(now);
        return callback(...args);
      }
    }) as T,
    [callback, delay, lastCall]
  );
}

// 🎯 Hook para memoização inteligente com TTL
export function useMemoWithTTL<T>(
  factory: () => T,
  deps: React.DependencyList,
  ttl: number = 60000
): T {
  const [memoizedValue, setMemoizedValue] = useState<T>(factory);
  const [lastUpdate, setLastUpdate] = useState(Date.now());

  useEffect(() => {
    const now = Date.now();
    if (now - lastUpdate > ttl) {
      setMemoizedValue(factory());
      setLastUpdate(now);
    }
  }, deps);

  return memoizedValue;
}

// 🎯 Hook para lazy loading otimizado
export function useLazyLoad<T>(
  loadFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const load = useCallback(async () => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await loadFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro desconhecido'));
    } finally {
      setLoading(false);
    }
  }, [loadFn, loading]);

  useEffect(() => {
    load();
  }, deps);

  return { data, loading, error, refetch: load };
}

// 🎯 Hook para virtualização de listas
export function useVirtualization<T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return items.slice(startIndex, endIndex).map((item, index) => ({
      item,
      index: startIndex + index,
      top: (startIndex + index) * itemHeight,
    }));
  }, [items, itemHeight, containerHeight, scrollTop]);

  const totalHeight = items.length * itemHeight;

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    visibleItems,
    totalHeight,
    handleScroll,
  };
}

// 🎯 Hook para preload de recursos
export function usePreload() {
  const [preloadedResources, setPreloadedResources] = useState<Set<string>>(new Set());

  const preload = useCallback(async (url: string, type: 'image' | 'script' | 'style' = 'image') => {
    if (preloadedResources.has(url)) return;

    try {
      switch (type) {
        case 'image': {
          const img = new Image();
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = url;
          });
          break;
        }
        case 'script': {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.onload = resolve;
            script.onerror = reject;
            script.src = url;
            document.head.appendChild(script);
          });
          break;
        }
        case 'style': {
          await new Promise((resolve, reject) => {
            const link = document.createElement('link');
            link.onload = resolve;
            link.onerror = reject;
            link.rel = 'stylesheet';
            link.href = url;
            document.head.appendChild(link);
          });
          break;
        }
      }
      
      setPreloadedResources(prev => new Set([...prev, url]));
    } catch (error) {
      console.warn(`Falha ao preload ${url}:`, error);
    }
  }, [preloadedResources]);

  const preloadBatch = useCallback(async (urls: string[], type: 'image' | 'script' | 'style' = 'image') => {
    await Promise.allSettled(urls.map(url => preload(url, type)));
  }, [preload]);

  return { preload, preloadBatch, preloadedResources };
}

// 🔄 Hook para debounced value (evitar re-renders em busca)
export function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

// 🎯 Hook para monitoramento de performance
export function usePerformanceMonitor(componentName: string) {
  const [metrics, setMetrics] = useState({
    renderTime: 0,
    mountTime: 0,
    updateCount: 0,
  });

  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      setMetrics(prev => ({
        ...prev,
        renderTime,
        updateCount: prev.updateCount + 1,
      }));

      // Log apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Performance] ${componentName}:`, {
          renderTime: `${renderTime.toFixed(2)}ms`,
          updateCount: metrics.updateCount + 1,
        });
      }
    };
  });

  return metrics;
}

// 🎯 Componente para lazy loading de imagens
interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  placeholder?: string;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  fallback,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PC9zdmc+',
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoading(false);
    };
    
    img.onerror = () => {
      if (fallback) {
        setImageSrc(fallback);
      }
      setIsLoading(false);
    };
    
    img.src = src;
  }, [src, fallback]);

  return (
    <img
      {...props}
      src={imageSrc}
      style={{
        ...props.style,
        opacity: isLoading ? 0.7 : 1,
        transition: 'opacity 0.3s ease',
      }}
    />
  );
};

// 🎯 Componente para virtualização de listas
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function VirtualizedList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className,
}: VirtualizedListProps<T>) {
  const { visibleItems, totalHeight, handleScroll } = useVirtualization(
    items,
    itemHeight,
    containerHeight
  );

  return (
    <div
      className={className}
      style={{ height: containerHeight, overflow: 'auto' }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map(({ item, index, top }) => (
          <div
            key={index}
            style={{
              position: 'absolute',
              top,
              left: 0,
              right: 0,
              height: itemHeight,
            }}
          >
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}

// 🎯 Hook para cache inteligente
export function useCache<T>(
  key: string,
  factory: () => Promise<T>,
  ttl: number = 300000 // 5 minutos
) {
  const [cache, setCache] = useState<Map<string, { data: T; timestamp: number }>>(new Map());

  const get = useCallback(async (): Promise<T> => {
    const cached = cache.get(key);
    const now = Date.now();

    if (cached && now - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await factory();
    setCache(prev => new Map([...prev, [key, { data, timestamp: now }]]));
    return data;
  }, [key, factory, ttl, cache]);

  const invalidate = useCallback(() => {
    setCache(prev => {
      const newCache = new Map(prev);
      newCache.delete(key);
      return newCache;
    });
  }, [key]);

  return { get, invalidate };
}

// 🎯 Utilitário para otimização de bundle
export const bundleOptimizer = {
  // Preload de chunks críticos
  preloadCriticalChunks: () => {
    if (typeof window !== 'undefined') {
      const criticalChunks = [
        '/src/pages/DashboardPage.tsx',
        '/src/pages/AgendaPage.tsx',
        '/src/pages/PatientListPage.tsx',
      ];

      criticalChunks.forEach(chunk => {
        const link = document.createElement('link');
        link.rel = 'modulepreload';
        link.href = chunk;
        document.head.appendChild(link);
      });
    }
  },

  // Otimização de imagens
  optimizeImage: (src: string, width?: number, height?: number) => {
    if (width && height) {
      return `${src}?w=${width}&h=${height}&q=80&f=webp`;
    }
    return src;
  },

  // Lazy loading de scripts
  loadScript: (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
};

export default {
  useDebounce,
  useThrottle,
  useMemoWithTTL,
  useLazyLoad,
  useVirtualization,
  usePreload,
  usePerformanceMonitor,
  useCache,
  LazyImage,
  VirtualizedList,
  bundleOptimizer,
};