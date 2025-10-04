import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';

// 🚀 Otimizações de Performance baseadas no Context7
// Implementa as melhores práticas do React Design Patterns

// ✅ REMOVIDO: React Tracked - Incompatível com React 18
// Usando React Context puro para state management

// 🎯 2. Memoização Inteligente de Componentes
export const withPerformanceOptimization = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return React.memo(Component, (prevProps, nextProps) => {
    // Comparação customizada para evitar re-renders desnecessários
    return JSON.stringify(prevProps) === JSON.stringify(nextProps);
  });
};

// 🎯 3. Hook para Debounce Otimizado
export const useDebounce = <T>(value: T, delay: number): T => {
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
};

// 🎯 4. Hook para Throttle Otimizado
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: any[]) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// 🎯 5. Hook para Virtual Scrolling
export const useVirtualScroll = (
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(containerHeight / itemHeight) + 1,
    itemCount
  );

  const visibleItems = useMemo(() => {
    const items = [];
    for (let i = startIndex; i < endIndex; i++) {
      items.push({
        index: i,
        top: i * itemHeight,
        height: itemHeight
      });
    }
    return items;
  }, [startIndex, endIndex, itemHeight]);

  const totalHeight = itemCount * itemHeight;

  return {
    visibleItems,
    totalHeight,
    setScrollTop
  };
};

// 🎯 6. Hook para Intersection Observer
export const useIntersectionObserver = (
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      options
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
};

// 🎯 7. Hook para Performance Monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(Date.now());

  useEffect(() => {
    renderCount.current += 1;
    const renderTime = Date.now() - startTime.current;
    
    if (renderCount.current > 1) {
      console.warn(`⚠️ ${componentName} re-rendered ${renderCount.current} times in ${renderTime}ms`);
    }
    
    startTime.current = Date.now();
  });

  return {
    renderCount: renderCount.current,
    logPerformance: () => {
      console.log(`📊 ${componentName} Performance:`, {
        renders: renderCount.current,
        time: Date.now() - startTime.current
      });
    }
  };
};

// 🎯 8. Hook para Lazy Loading de Imagens
export const useLazyImage = (src: string, placeholder?: string) => {
  const [imageSrc, setImageSrc] = useState(placeholder || '');
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const img = new Image();
    
    img.onload = () => {
      setImageSrc(src);
      setIsLoaded(true);
    };
    
    img.onerror = () => {
      setHasError(true);
    };
    
    img.src = src;
  }, [src]);

  return { imageSrc, isLoaded, hasError };
};

// 🎯 9. Hook para Cache de Dados
export const useDataCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutos
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async () => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      return cached.data;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetcher();
      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetcher, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refetch: fetchData };
};

// 🎯 10. Hook para Web Workers
export const useWebWorker = <T, R>(
  workerScript: string,
  onMessage?: (result: R) => void,
  onError?: (error: Error) => void
) => {
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    workerRef.current = new Worker(workerScript);

    if (onMessage) {
      workerRef.current.onmessage = (e) => onMessage(e.data);
    }

    if (onError) {
      workerRef.current.onerror = (e) => onError(new Error(e.message));
    }

    return () => {
      workerRef.current?.terminate();
    };
  }, [workerScript, onMessage, onError]);

  const postMessage = useCallback((data: T) => {
    if (workerRef.current) {
      workerRef.current.postMessage(data);
    }
  }, []);

  return { postMessage };
};

// 🎯 11. Componente de Lista Virtualizada
interface VirtualizedListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export const VirtualizedList = <T,>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  className = ''
}: VirtualizedListProps<T>) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const { visibleItems, totalHeight } = useVirtualScroll(
    items.length,
    itemHeight,
    containerHeight
  );

  const handleScroll = useThrottle((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, 16); // ~60fps

  return React.createElement(
    'div',
    {
      ref: containerRef,
      className: `overflow-auto ${className}`,
      style: { height: containerHeight },
      onScroll: handleScroll
    },
    React.createElement(
      'div',
      { style: { height: totalHeight, position: 'relative' } },
      visibleItems.map(({ index, top }) =>
        React.createElement(
          'div',
          {
            key: index,
            style: {
              position: 'absolute',
              top,
              height: itemHeight,
              width: '100%'
            }
          },
          renderItem(items[index], index)
        )
      )
    )
  );
};

// 🎯 12. Hook para Otimização de Formulários
export const useOptimizedForm = <T extends Record<string, any>>(
  initialValues: T,
  onSubmit: (values: T) => void | Promise<void>
) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const debouncedValues = useDebounce(values, 300);

  const updateValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const validateField = useCallback((field: keyof T, value: any) => {
    // Implementar validação específica por campo
    if (!value && field === 'email') {
      setErrors(prev => ({ ...prev, [field]: 'Email é obrigatório' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(debouncedValues);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [debouncedValues, onSubmit]);

  return {
    values: debouncedValues,
    errors,
    isSubmitting,
    updateValue,
    validateField,
    handleSubmit,
    setValues
  };
};

// 🎯 13. Hook para Otimização de API Calls
export const useOptimizedAPI = <T>(
  endpoint: string,
  options: RequestInit = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancelar requisição anterior se existir
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        ...options,
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (err) {
      if (err instanceof Error && err.name !== 'AbortError') {
        setError(err);
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, options]);

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { data, isLoading, error, fetchData };
};

// 🎯 14. Componente de Performance Profiler
interface PerformanceProfilerProps {
  children: React.ReactNode;
  id: string;
  onRender?: (id: string, phase: string, actualDuration: number) => void;
}

export const PerformanceProfiler: React.FC<PerformanceProfilerProps> = ({
  children,
  id,
  onRender
}) => {
  return React.createElement(
    React.Profiler,
    {
      id,
      onRender: (id: string, phase: string, actualDuration: number) => {
        if (onRender) {
          onRender(id, phase, actualDuration);
        }
        
        if (actualDuration > 16) { // Mais de 16ms indica problema de performance
          console.warn(`⚠️ Performance issue in ${id}: ${actualDuration}ms`);
        }
      }
    },
    children
  );
};

// 🎯 15. Hook para Otimização de Memória
export const useMemoryOptimization = () => {
  const cleanupFunctions = useRef<(() => void)[]>([]);

  const addCleanup = useCallback((cleanup: () => void) => {
    cleanupFunctions.current.push(cleanup);
  }, []);

  useEffect(() => {
    return () => {
      cleanupFunctions.current.forEach(cleanup => cleanup());
      cleanupFunctions.current = [];
    };
  }, []);

  return { addCleanup };
};

// 🎯 Exportações
export default {
  withPerformanceOptimization,
  useDebounce,
  useThrottle,
  useVirtualScroll,
  useIntersectionObserver,
  usePerformanceMonitor,
  useLazyImage,
  useDataCache,
  useWebWorker,
  VirtualizedList,
  useOptimizedForm,
  useOptimizedAPI,
  PerformanceProfiler,
  useMemoryOptimization
};
