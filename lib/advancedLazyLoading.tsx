/**
 * 🚀 ADVANCED LAZY LOADING SYSTEM
 *
 * Sistema avançado de lazy loading com preload inteligente
 */

import React, { ComponentType, lazy, LazyExoticComponent, useEffect } from 'react';
import { logger } from './logger';

// Tipos
type ImportFunc<T = any> = () => Promise<{ default: ComponentType<T> }>;
type PreloadableComponent<T = any> = LazyExoticComponent<ComponentType<T>> & {
  preload: () => Promise<{ default: ComponentType<T> }>;
};

/**
 * Criar componente lazy com capacidade de preload
 */
export function lazyWithPreload<T = any>(
  importFunc: ImportFunc<T>
): PreloadableComponent<T> {
  const LazyComponent = lazy(importFunc);
  let factoryPromise: Promise<{ default: ComponentType<T> }> | undefined;

  const Component = LazyComponent as PreloadableComponent<T>;
  Component.preload = () => {
    if (!factoryPromise) {
      factoryPromise = importFunc();
    }
    return factoryPromise;
  };

  return Component;
}

/**
 * Preload em hover (quando usuário passa mouse sobre link/botão)
 */
export const usePreloadOnHover = (
  component: PreloadableComponent,
  enabled = true
) => {
  const handleMouseEnter = () => {
    if (enabled) {
      component.preload();
    }
  };

  return { onMouseEnter: handleMouseEnter };
};

/**
 * Preload em visible (quando elemento aparece na tela)
 */
export const usePreloadOnVisible = (
  component: PreloadableComponent,
  options?: IntersectionObserverInit
) => {
  const [ref, setRef] = React.useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            component.preload();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, ...options }
    );

    observer.observe(ref);

    return () => observer.disconnect();
  }, [ref, component]);

  return setRef;
};

/**
 * Preload durante idle time
 */
export const usePreloadOnIdle = (
  components: PreloadableComponent[],
  timeout = 1000
) => {
  useEffect(() => {
    const requestIdleCallback =
      (window as any).requestIdleCallback ||
      ((cb: any) => setTimeout(cb, timeout));

    const handle = requestIdleCallback(
      () => {
        components.forEach((component) => component.preload());
      },
      { timeout }
    );

    return () => {
      const cancelIdleCallback =
        (window as any).cancelIdleCallback || clearTimeout;
      cancelIdleCallback(handle);
    };
  }, [components, timeout]);
};

/**
 * Preload baseado em rota provável
 * Analisa padrões de navegação para prever próxima rota
 */
export class RoutePredictor {
  private navigationHistory: string[] = [];
  private patterns: Map<string, Map<string, number>> = new Map();
  private maxHistorySize = 50;

  recordNavigation(from: string, to: string) {
    this.navigationHistory.push(`${from}->${to}`);

    if (this.navigationHistory.length > this.maxHistorySize) {
      this.navigationHistory.shift();
    }

    // Atualizar padrões
    if (!this.patterns.has(from)) {
      this.patterns.set(from, new Map());
    }

    const fromPatterns = this.patterns.get(from)!;
    const count = fromPatterns.get(to) || 0;
    fromPatterns.set(to, count + 1);
  }

  predictNextRoute(currentRoute: string): string | null {
    const patterns = this.patterns.get(currentRoute);
    if (!patterns || patterns.size === 0) return null;

    // Retornar rota mais frequente
    let maxCount = 0;
    let predictedRoute: string | null = null;

    patterns.forEach((count, route) => {
      if (count > maxCount) {
        maxCount = count;
        predictedRoute = route;
      }
    });

    return predictedRoute;
  }

  getPredictionConfidence(currentRoute: string, predictedRoute: string): number {
    const patterns = this.patterns.get(currentRoute);
    if (!patterns) return 0;

    const total = Array.from(patterns.values()).reduce((a, b) => a + b, 0);
    const count = patterns.get(predictedRoute) || 0;

    return count / total;
  }
}

export const routePredictor = new RoutePredictor();

/**
 * Hook para preload preditivo
 */
export const usePredictivePreload = (
  currentRoute: string,
  routeComponentMap: Map<string, PreloadableComponent>
) => {
  useEffect(() => {
    const predicted = routePredictor.predictNextRoute(currentRoute);
    if (!predicted) return;

    const confidence = routePredictor.getPredictionConfidence(currentRoute, predicted);

    // Só preload se confiança > 50%
    if (confidence > 0.5) {
      const component = routeComponentMap.get(predicted);
      if (component) {
        component.preload();
        logger.debug(`Preloading ${predicted} (${(confidence * 100).toFixed(0)}% confidence).`, { context: 'advancedLazyLoading.RoutePredictor', data: { predicted, confidence } });
      }
    }
  }, [currentRoute, routeComponentMap]);
};

/**
 * Wrapper para lazy loading com retry
 */
export function lazyWithRetry<T = any>(
  importFunc: ImportFunc<T>,
  maxRetries = 3
): LazyExoticComponent<ComponentType<T>> {
  return lazy(() => {
    return new Promise<{ default: ComponentType<T> }>((resolve, reject) => {
      const attemptImport = async (retriesLeft: number) => {
        try {
          const module = await importFunc();
          resolve(module);
        } catch (error) {
          if (retriesLeft === 0) {
            reject(error);
            return;
          }

          logger.warn(
            `Falha ao carregar módulo, tentando novamente... (${retriesLeft} tentativas restantes)`
          );

          // Exponential backoff
          const delay = Math.pow(2, maxRetries - retriesLeft) * 1000;
          setTimeout(() => attemptImport(retriesLeft - 1), delay);
        }
      };

      attemptImport(maxRetries);
    });
  });
}

/**
 * Suspense boundary com fallback inteligente
 */
interface SmartSuspenseProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minLoadingTime?: number; // Evitar flash de loading
  timeout?: number; // Timeout para mostrar erro
}

export const SmartSuspense: React.FC<SmartSuspenseProps> = ({
  children,
  fallback,
  minLoadingTime = 300,
  timeout = 10000,
}) => {
  const [showFallback, setShowFallback] = React.useState(false);
  const [hasError, setHasError] = React.useState(false);
  const startTime = React.useRef(Date.now());

  useEffect(() => {
    const minTimer = setTimeout(() => setShowFallback(true), minLoadingTime);
    const errorTimer = setTimeout(() => setHasError(true), timeout);

    return () => {
      clearTimeout(minTimer);
      clearTimeout(errorTimer);
    };
  }, [minLoadingTime, timeout]);

  if (hasError) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 font-semibold mb-2">
          Erro ao carregar componente
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Recarregar página
        </button>
      </div>
    );
  }

  return (
    <React.Suspense fallback={showFallback ? fallback : null}>
      {children}
    </React.Suspense>
  );
};

/**
 * Componente de preload para lista de rotas
 */
export const RoutePreloader: React.FC<{
  routes: PreloadableComponent[];
  strategy?: 'idle' | 'immediate' | 'delay';
  delay?: number;
}> = ({ routes, strategy = 'idle', delay = 2000 }) => {
  useEffect(() => {
    if (strategy === 'immediate') {
      routes.forEach((route) => route.preload());
    } else if (strategy === 'delay') {
      const timer = setTimeout(() => {
        routes.forEach((route) => route.preload());
      }, delay);
      return () => clearTimeout(timer);
    } else {
      // idle strategy
      usePreloadOnIdle(routes);
    }
  }, [routes, strategy, delay]);

  return null;
};

/**
 * Inicializar sistema de lazy loading
 */
export function initializeLazyLoading() {
  logger.info('Advanced lazy loading system initialized.', { context: 'advancedLazyLoading.initializeLazyLoading' });

  // Preload de componentes críticos em idle time
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => {
      logger.debug('Idle time detected, preloading secondary components.', { context: 'advancedLazyLoading.initializeLazyLoading' });
    }, { timeout: 2000 });
  }
}
