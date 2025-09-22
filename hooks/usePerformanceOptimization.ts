import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Hook for virtual scrolling
export const useVirtualList = <T>(
  items: T[],
  itemHeight: number,
  containerHeight: number
) => {
  const [scrollTop, setScrollTop] = useState(0);

  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      items.length
    );

    return {
      startIndex,
      endIndex,
      items: items.slice(startIndex, endIndex),
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight,
    };
  }, [items, itemHeight, containerHeight, scrollTop]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  return {
    ...visibleItems,
    handleScroll,
  };
};

// Hook for image lazy loading
export const useLazyImage = (src: string, options: IntersectionObserverInit = {}) => {
  const [imageSrc, setImageSrc] = useState<string | undefined>();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isError, setIsError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!src || !imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setImageSrc(src);
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options,
      }
    );

    observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, [src, options]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setIsError(false);
  }, []);

  const handleError = useCallback(() => {
    setIsError(true);
    setIsLoaded(false);
  }, []);

  return {
    imgRef,
    src: imageSrc,
    isLoaded,
    isError,
    onLoad: handleLoad,
    onError: handleError,
  };
};

// Hook for debouncing values
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

// Hook for throttling callbacks
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = useRef(Date.now());

  return useCallback(
    ((...args: Parameters<T>) => {
      if (Date.now() - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = Date.now();
      }
    }) as T,
    [callback, delay]
  );
};

// Hook for infinite scrolling
export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  threshold: number = 100
) => {
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !hasMore) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;

      if (scrollHeight - scrollTop - clientHeight < threshold && !isLoading) {
        setIsLoading(true);
        callback();
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [callback, hasMore, threshold, isLoading]);

  return { containerRef, isLoading };
};

// Hook for optimistic updates
export const useOptimisticUpdate = <T>(
  initialData: T,
  updateFn: (data: T, update: Partial<T>) => Promise<T>
) => {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const update = useCallback(
    async (optimisticUpdate: Partial<T>) => {
      const previousData = data;

      // Apply optimistic update immediately
      setData(prev => ({ ...prev, ...optimisticUpdate }));
      setIsLoading(true);
      setError(null);

      try {
        const result = await updateFn(data, optimisticUpdate);
        setData(result);
      } catch (err) {
        // Revert on error
        setData(previousData);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [data, updateFn]
  );

  return {
    data,
    update,
    isLoading,
    error,
  };
};

// Hook for efficient data fetching with caching
export const useDataCache = <T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: {
    ttl?: number; // Time to live in milliseconds
    refetchOnWindowFocus?: boolean;
    refetchInterval?: number;
  } = {}
) => {
  const {
    ttl = 5 * 60 * 1000, // 5 minutes default
    refetchOnWindowFocus = true,
    refetchInterval,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const cacheRef = useRef<Map<string, { data: T; timestamp: number }>>(new Map());

  const fetchData = useCallback(async (force = false) => {
    const cached = cacheRef.current.get(key);
    const now = Date.now();

    // Return cached data if valid and not forced
    if (!force && cached && (now - cached.timestamp) < ttl) {
      setData(cached.data);
      return cached.data;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      cacheRef.current.set(key, { data: result, timestamp: now });
      setData(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [key, fetchFn, ttl]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch on window focus
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => fetchData();
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [fetchData, refetchOnWindowFocus]);

  // Periodic refetch
  useEffect(() => {
    if (!refetchInterval) return;

    const interval = setInterval(() => fetchData(), refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval]);

  const invalidate = useCallback(() => {
    cacheRef.current.delete(key);
    fetchData(true);
  }, [key, fetchData]);

  return {
    data,
    isLoading,
    error,
    refetch: () => fetchData(true),
    invalidate,
  };
};

// Hook for performance monitoring
export const usePerformanceMonitor = (componentName: string) => {
  const renderStart = useRef(performance.now());
  const renderCount = useRef(0);

  useEffect(() => {
    renderCount.current++;
    const renderTime = performance.now() - renderStart.current;

    // Log performance metrics in development
    if (process.env['NODE_ENV'] === 'development') {
      console.log(`${componentName} render #${renderCount.current}: ${renderTime.toFixed(2)}ms`);
    }

    // Track in analytics
    if (renderTime > 16.67) { // Slower than 60fps
      console.warn(`${componentName} slow render: ${renderTime.toFixed(2)}ms`);
    }

    renderStart.current = performance.now();
  });

  return {
    renderCount: renderCount.current,
  };
};

// Hook for memory usage optimization
export const useMemoryOptimization = () => {
  const [memoryUsage, setMemoryUsage] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null);

  useEffect(() => {
    if ('memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        setMemoryUsage({
          used: memory.usedJSHeapSize,
          total: memory.totalJSHeapSize,
          percentage: (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100,
        });
      };

      updateMemoryUsage();
      const interval = setInterval(updateMemoryUsage, 5000);
      return () => clearInterval(interval);
    }
  }, []);

  const forceGarbageCollection = useCallback(() => {
    if ('gc' in window) {
      (window as any).gc();
    }
  }, []);

  return {
    memoryUsage,
    forceGarbageCollection,
  };
};

// Hook for connection quality monitoring
export const useConnectionQuality = () => {
  const [connectionQuality, setConnectionQuality] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;

      const updateConnection = () => {
        setConnectionQuality({
          effectiveType: connection.effectiveType,
          downlink: connection.downlink,
          rtt: connection.rtt,
          saveData: connection.saveData,
        });
      };

      updateConnection();
      connection.addEventListener('change', updateConnection);
      return () => connection.removeEventListener('change', updateConnection);
    }
  }, []);

  return connectionQuality;
};

// Hook for adaptive loading based on device capabilities
export const useAdaptiveLoading = () => {
  const [deviceCapabilities, setDeviceCapabilities] = useState({
    isLowEnd: false,
    cores: navigator.hardwareConcurrency || 1,
    memory: (navigator as any).deviceMemory || 1,
    connectionSpeed: 'unknown',
  });

  useEffect(() => {
    const capabilities = {
      isLowEnd: navigator.hardwareConcurrency <= 2 || (navigator as any).deviceMemory <= 1,
      cores: navigator.hardwareConcurrency || 1,
      memory: (navigator as any).deviceMemory || 1,
      connectionSpeed: 'connection' in navigator ? (navigator as any).connection.effectiveType : 'unknown',
    };

    setDeviceCapabilities(capabilities);
  }, []);

  const getOptimalSettings = useCallback(() => {
    return {
      maxConcurrentRequests: deviceCapabilities.isLowEnd ? 2 : 6,
      imageQuality: deviceCapabilities.isLowEnd ? 'low' : 'high',
      animationsEnabled: !deviceCapabilities.isLowEnd,
      preloadDistance: deviceCapabilities.isLowEnd ? 1 : 3,
      chunkSize: deviceCapabilities.isLowEnd ? 10 : 50,
    };
  }, [deviceCapabilities]);

  return {
    deviceCapabilities,
    getOptimalSettings,
  };
};

// Hook for bundle size optimization tracking
export const useBundleOptimization = () => {
  const [bundleMetrics, setBundleMetrics] = useState<{
    totalSize: number;
    loadedChunks: string[];
    pendingChunks: string[];
  }>({
    totalSize: 0,
    loadedChunks: [],
    pendingChunks: [],
  });

  useEffect(() => {
    // Track loaded chunks and their sizes
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === 'resource' && entry.name.includes('.js')) {
          setBundleMetrics(prev => ({
            ...prev,
            totalSize: prev.totalSize + (entry as any).transferSize,
            loadedChunks: [...prev.loadedChunks, entry.name],
          }));
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
    return () => observer.disconnect();
  }, []);

  return bundleMetrics;
};