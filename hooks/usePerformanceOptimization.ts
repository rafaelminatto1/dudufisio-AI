import { useEffect, useRef, useCallback, useState } from 'react';

// 🚀 Hook para Otimização de Performance
// Implementa técnicas avançadas de otimização

interface PerformanceOptimizationOptions {
  enableIntersectionObserver?: boolean;
  enableResizeObserver?: boolean;
  enableIdleCallback?: boolean;
  throttleScroll?: number;
  throttleResize?: number;
}

// 🎯 Hook para Intersection Observer
export const useIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const observe = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: '50px',
      ...options
    });

    observerRef.current.observe(element);
    elementRef.current = element;
  }, [callback, options]);

  const unobserve = useCallback(() => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { observe, unobserve, disconnect };
};

// 🎯 Hook para Resize Observer
export const useResizeObserver = (
  callback: (entries: ResizeObserverEntry[]) => void,
  options: ResizeObserverOptions = {}
) => {
  const observerRef = useRef<ResizeObserver | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const observe = useCallback((element: HTMLElement) => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new ResizeObserver(callback);
    observerRef.current.observe(element, options);
    elementRef.current = element;
  }, [callback, options]);

  const unobserve = useCallback(() => {
    if (observerRef.current && elementRef.current) {
      observerRef.current.unobserve(elementRef.current);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { observe, unobserve, disconnect };
};

// 🎯 Hook para Idle Callback
export const useIdleCallback = () => {
  const [isIdle, setIsIdle] = useState(true);
  const idleRef = useRef<number | null>(null);

  const scheduleIdleCallback = useCallback((callback: () => void) => {
    if ('requestIdleCallback' in window) {
      idleRef.current = window.requestIdleCallback(callback, { timeout: 5000 });
    } else {
      // Fallback para browsers que não suportam requestIdleCallback
      setTimeout(callback, 0);
    }
  }, []);

  const cancelIdleCallback = useCallback(() => {
    if (idleRef.current && 'cancelIdleCallback' in window) {
      window.cancelIdleCallback(idleRef.current);
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsIdle(document.visibilityState === 'hidden');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelIdleCallback();
    };
  }, [cancelIdleCallback]);

  return {
    isIdle,
    scheduleIdleCallback,
    cancelIdleCallback
  };
};

// 🎯 Hook para Throttled Scroll
export const useThrottledScroll = (callback: (scrollTop: number) => void, delay = 100) => {
  const lastCallRef = useRef<number>(0);

  const handleScroll = useCallback((event: Event) => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      const target = event.target as HTMLElement;
      callback(target.scrollTop);
    }
  }, [callback, delay]);

  return handleScroll;
};

// 🎯 Hook para Throttled Resize
export const useThrottledResize = (callback: (width: number, height: number) => void, delay = 100) => {
  const lastCallRef = useRef<number>(0);

  const handleResize = useCallback(() => {
    const now = Date.now();
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(window.innerWidth, window.innerHeight);
    }
  }, [callback, delay]);

  return handleResize;
};

// 🎯 Hook Principal de Otimização
export const usePerformanceOptimization = (
  options: PerformanceOptimizationOptions = {}
) => {
  const {
    enableIntersectionObserver = true,
    enableResizeObserver = true,
    enableIdleCallback = true,
    throttleScroll = 100,
    throttleResize = 100
  } = options;

  const intersectionObserver = useIntersectionObserver(
    useCallback((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Elemento visível - pode carregar conteúdo pesado
          entry.target.classList.add('visible');
        } else {
          // Elemento não visível - pode pausar animações
          entry.target.classList.remove('visible');
        }
      });
    }, []),
    { threshold: 0.1, rootMargin: '50px' }
  );

  const resizeObserver = useResizeObserver(
    useCallback((entries) => {
      entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        // Otimizar layout baseado no tamanho
        if (width < 768) {
          entry.target.classList.add('mobile-layout');
        } else {
          entry.target.classList.remove('mobile-layout');
        }
      });
    }, []),
    { box: 'content-box' }
  );

  const idleCallback = useIdleCallback();

  const throttledScroll = useThrottledScroll(
    useCallback((scrollTop) => {
      // Otimizar baseado na posição do scroll
      if (scrollTop > 100) {
        document.body.classList.add('scrolled');
      } else {
        document.body.classList.remove('scrolled');
      }
    }, []),
    throttleScroll
  );

  const throttledResize = useThrottledResize(
    useCallback((width, height) => {
      // Otimizar baseado no tamanho da tela
      if (width < 768) {
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
      }
    }, []),
    throttleResize
  );

  // 🎯 Hook para Lazy Loading de Imagens
  const useLazyImage = (src: string, placeholder?: string) => {
    const [imageSrc, setImageSrc] = useState(placeholder || '');
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
      if (!enableIntersectionObserver) {
        setImageSrc(src);
        return;
      }

      const img = imgRef.current;
      if (!img) return;

      const handleIntersection = (entries: IntersectionObserverEntry[]) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            setIsLoaded(true);
          }
        });
      };

      const observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.1
      });

      observer.observe(img);

      return () => {
        observer.disconnect();
      };
    }, [src, enableIntersectionObserver]);

    return { imgRef, imageSrc, isLoaded };
  };

  // 🎯 Hook para Preload de Recursos
  const useResourcePreloader = () => {
    const preloadedResources = useRef<Set<string>>(new Set());

    const preloadResource = useCallback((url: string, type: 'image' | 'script' | 'style' = 'image') => {
      if (preloadedResources.current.has(url)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = url;

      switch (type) {
        case 'image':
          link.as = 'image';
          break;
        case 'script':
          link.as = 'script';
          break;
        case 'style':
          link.as = 'style';
          break;
      }

      document.head.appendChild(link);
      preloadedResources.current.add(url);
  }, []);

    const preloadCriticalResources = useCallback(() => {
      // Preload recursos críticos
      const criticalImages = [
        '/icons/logo.svg',
        '/icons/stethoscope.svg'
      ];

      criticalImages.forEach(url => preloadResource(url, 'image'));
    }, [preloadResource]);

    return {
      preloadResource,
      preloadCriticalResources
    };
  };

  return {
    intersectionObserver,
    resizeObserver,
    idleCallback,
    throttledScroll,
    throttledResize,
    useLazyImage,
    useResourcePreloader
  };
};