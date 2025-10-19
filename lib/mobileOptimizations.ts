/**
 * lib/mobileOptimizations.ts
 * 
 * Utilitários para otimização mobile
 */

// Touch target mínimo recomendado (WCAG)
export const MIN_TOUCH_TARGET = 44;

// Debounce padrão para gestos
export const GESTURE_DEBOUNCE = 300;

// Lazy loading de imagens
export const lazyLoadImage = (img: HTMLImageElement, src: string) => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        img.src = src;
        observer.unobserve(img);
      }
    });
  });

  imageObserver.observe(img);
};

// Verificar se deve reduzir animações
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

// Calcular tamanho de touch target
export const getTouchTargetSize = (size: number): number => {
  return Math.max(size, MIN_TOUCH_TARGET);
};

// Debounce para gestos
export const debounceGesture = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = GESTURE_DEBOUNCE
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  }) as T;
};

// Throttle para scroll
export const throttleScroll = <T extends (...args: any[]) => any>(
  func: T,
  limit: number = 100
): T => {
  let inThrottle: boolean;
  return ((...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};

// Detectar se é touch device
export const isTouchDevice = (): boolean => {
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
};

// Obter viewport dimensions
export const getViewportDimensions = (): { width: number; height: number } => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

// Verificar conexão lenta
export const isSlowConnection = (): boolean => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return false;

  const effectiveType = connection.effectiveType;
  return effectiveType === 'slow-2g' || effectiveType === '2g';
};

// Preload crítico de recursos
export const preloadCriticalResources = (urls: string[]) => {
  urls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = url.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });
};

// Otimizar scroll performance
export const optimizeScrollPerformance = (element: HTMLElement) => {
  element.style.willChange = 'transform';
  element.style.transform = 'translateZ(0)';
};


