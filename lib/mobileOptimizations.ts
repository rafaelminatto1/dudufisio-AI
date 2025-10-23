/**
 * 🚀 OTIMIZAÇÕES PARA MOBILE E CONEXÕES LENTAS
 * 
 * Este arquivo contém otimizações específicas para melhorar
 * a experiência em dispositivos móveis e conexões lentas
 */

import { logger } from './logger';

// Detectar se é mobile
export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768 ||
         ('ontouchstart' in window);
};

// Detectar conexão lenta
export const isSlowConnection = (): boolean => {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return false;
  }

  const connection = (navigator as any).connection;
  if (!connection) return false;

  // Considerar lenta se:
  // - effectiveType é 'slow-2g' ou '2g'
  // - downlink é menor que 1 Mbps
  // - rtt é maior que 1000ms
  return (
    connection.effectiveType === 'slow-2g' ||
    connection.effectiveType === '2g' ||
    (connection.downlink && connection.downlink < 1) ||
    (connection.rtt && connection.rtt > 1000)
  );
};

// Detectar se está offline
export const isOffline = (): boolean => {
  return typeof navigator !== 'undefined' && !navigator.onLine;
};

// Configurações adaptativas baseadas no dispositivo e conexão
export const getAdaptiveConfig = () => {
  const mobile = isMobile();
  const slowConnection = isSlowConnection();
  const offline = isOffline();

  return {
    // Timeouts mais longos para conexões lentas
    loadingTimeout: slowConnection ? 30000 : 10000, // 30s para conexões lentas, 10s normal
    
    // Reduzir animações em mobile
    enableAnimations: !mobile || !slowConnection,
    
    // Preload menos agressivo em conexões lentas
    enablePreload: !slowConnection,
    
    // Reduzir qualidade de imagens em mobile
    imageQuality: mobile ? 'medium' : 'high',
    
    // Lazy loading mais agressivo em mobile
    lazyLoadThreshold: mobile ? 100 : 200,
    
    // Reduzir bundle size em conexões lentas
    enableCodeSplitting: true,
    
    // Cache mais agressivo offline
    enableOfflineCache: offline,
    
    // Reduzir logs em produção mobile
    enableDetailedLogs: !mobile || import.meta.env.DEV,
  };
};

// Hook para monitorar mudanças de conexão
export const useConnectionMonitor = () => {
  const [connectionState, setConnectionState] = React.useState({
    online: typeof navigator !== 'undefined' ? navigator.onLine : true,
    effectiveType: typeof navigator !== 'undefined' && 'connection' in navigator 
      ? (navigator as any).connection?.effectiveType || 'unknown'
      : 'unknown',
    downlink: typeof navigator !== 'undefined' && 'connection' in navigator
      ? (navigator as any).connection?.downlink || 0
      : 0,
    rtt: typeof navigator !== 'undefined' && 'connection' in navigator
      ? (navigator as any).connection?.rtt || 0
      : 0,
  });

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateConnectionState = () => {
      const connection = (navigator as any).connection;
      setConnectionState({
        online: navigator.onLine,
        effectiveType: connection?.effectiveType || 'unknown',
        downlink: connection?.downlink || 0,
        rtt: connection?.rtt || 0,
      });
    };

    // Listeners para mudanças de conexão
    window.addEventListener('online', updateConnectionState);
    window.addEventListener('offline', updateConnectionState);
    
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      connection.addEventListener('change', updateConnectionState);
    }

    return () => {
      window.removeEventListener('online', updateConnectionState);
      window.removeEventListener('offline', updateConnectionState);
      
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        connection.removeEventListener('change', updateConnectionState);
      }
    };
  }, []);

  return connectionState;
};

// Otimizações de carregamento para mobile
export const optimizeForMobile = () => {
  const config = getAdaptiveConfig();
  
  // Reduzir timeout de carregamento em mobile
  if (config.loadingTimeout !== 10000) {
    logger.info(`[MOBILE] Ajustando timeout para ${config.loadingTimeout}ms`);
  }

  // Desabilitar animações em conexões lentas
  if (!config.enableAnimations) {
    document.documentElement.style.setProperty('--animation-duration', '0ms');
    document.documentElement.style.setProperty('--transition-duration', '0ms');
    logger.info('[MOBILE] Animações desabilitadas para conexão lenta');
  }

  // Ajustar lazy loading threshold
  if (config.lazyLoadThreshold !== 200) {
    logger.info(`[MOBILE] Ajustando lazy loading threshold para ${config.lazyLoadThreshold}px`);
  }

  return config;
};

// Preload inteligente baseado na conexão
export const intelligentPreload = (importFn: () => Promise<any>, priority: 'high' | 'medium' | 'low' = 'medium') => {
  const config = getAdaptiveConfig();
  
  // Não fazer preload em conexões lentas ou offline
  if (!config.enablePreload || config.enableOfflineCache) {
    return Promise.resolve();
  }

  // Delay baseado na prioridade e conexão
  const delay = priority === 'high' ? 0 : priority === 'medium' ? 100 : 500;
  
  return new Promise((resolve) => {
    setTimeout(() => {
      importFn()
        .then(resolve)
        .catch((error) => {
          logger.warn('[MOBILE] Preload falhou:', error);
          resolve();
        });
    }, delay);
  });
};

// Debounce para eventos em mobile
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate = false
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
};

// Throttle para scroll em mobile
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Detectar e reportar problemas de performance
export const reportPerformanceIssues = () => {
  if (typeof window === 'undefined') return;

  // Monitorar Core Web Vitals
  if ('web-vitals' in window) {
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB }) => {
      onCLS((metric) => {
        if (metric.value > 0.25) {
          logger.warn('[PERFORMANCE] CLS alto detectado:', metric);
        }
      });
      
      onFID((metric) => {
        if (metric.value > 100) {
          logger.warn('[PERFORMANCE] FID alto detectado:', metric);
        }
      });
      
      onFCP((metric) => {
        if (metric.value > 3000) {
          logger.warn('[PERFORMANCE] FCP alto detectado:', metric);
        }
      });
      
      onLCP((metric) => {
        if (metric.value > 4000) {
          logger.warn('[PERFORMANCE] LCP alto detectado:', metric);
        }
      });
      
      onTTFB((metric) => {
        if (metric.value > 800) {
          logger.warn('[PERFORMANCE] TTFB alto detectado:', metric);
        }
      });
    });
  }

  // Monitorar memory usage
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    const usedMB = memory.usedJSHeapSize / 1024 / 1024;
    const totalMB = memory.totalJSHeapSize / 1024 / 1024;
    
    if (usedMB > 50) {
      logger.warn('[PERFORMANCE] Uso de memória alto:', { usedMB, totalMB });
    }
  }
};

// Inicializar otimizações mobile
export const initializeMobileOptimizations = () => {
  const config = optimizeForMobile();
  
  // Aplicar otimizações CSS
  if (isMobile()) {
    document.documentElement.classList.add('mobile-optimized');
  }
  
  if (isSlowConnection()) {
    document.documentElement.classList.add('slow-connection');
  }
  
  if (isOffline()) {
    document.documentElement.classList.add('offline');
  }

  // Reportar problemas de performance
  reportPerformanceIssues();
  
  logger.info('[MOBILE] Otimizações aplicadas:', config);
  
  return config;
};

// Exportar React para uso no hook
import React from 'react';