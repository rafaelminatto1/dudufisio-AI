import { useState, useEffect, useCallback } from 'react';
import { performanceMonitor, PerformanceReport, WebVitalsMetrics, ComponentMetric, CacheMetrics } from '../lib/performanceMonitor';

/**
 * 📊 Hook para acessar métricas de performance
 */
export function usePerformanceMetrics() {
  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(true);

  useEffect(() => {
    if (!isMonitoring) return;

    // Atualiza relatório a cada 5 segundos
    const interval = setInterval(() => {
      const newReport = performanceMonitor.generateReport();
      setReport(newReport);
    }, 5000);

    // Atualização inicial
    setReport(performanceMonitor.generateReport());

    return () => clearInterval(interval);
  }, [isMonitoring]);

  const toggleMonitoring = useCallback(() => {
    setIsMonitoring(prev => !prev);
  }, []);

  const resetMetrics = useCallback(() => {
    performanceMonitor.reset();
    setReport(performanceMonitor.generateReport());
  }, []);

  const exportReport = useCallback(() => {
    return performanceMonitor.exportReport();
  }, []);

  return {
    report,
    isMonitoring,
    toggleMonitoring,
    resetMetrics,
    exportReport
  };
}

/**
 * Hook para monitorar Web Vitals
 */
export function useWebVitals() {
  const [vitals, setVitals] = useState<WebVitalsMetrics | null>(null);

  useEffect(() => {
    const updateVitals = () => {
      setVitals(performanceMonitor.getWebVitals());
    };

    // Atualiza a cada 2 segundos
    const interval = setInterval(updateVitals, 2000);
    updateVitals();

    return () => clearInterval(interval);
  }, []);

  return vitals;
}

/**
 * Hook para monitorar componentes
 */
export function useComponentMetrics() {
  const [components, setComponents] = useState<ComponentMetric[]>([]);

  useEffect(() => {
    const updateComponents = () => {
      setComponents(performanceMonitor.getComponentMetrics());
    };

    const interval = setInterval(updateComponents, 3000);
    updateComponents();

    return () => clearInterval(interval);
  }, []);

  return components;
}

/**
 * Hook para monitorar cache
 */
export function useCacheMetrics() {
  const [cache, setCache] = useState<CacheMetrics | null>(null);

  useEffect(() => {
    const updateCache = () => {
      setCache(performanceMonitor.getCacheMetrics());
    };

    const interval = setInterval(updateCache, 2000);
    updateCache();

    return () => clearInterval(interval);
  }, []);

  return cache;
}

/**
 * Hook para monitorar performance de componente individual
 */
export function useComponentPerformance(componentName: string) {
  useEffect(() => {
    const measurement = performanceMonitor.mark(`${componentName}-render-start`);

    return () => {
      performanceMonitor.mark(`${componentName}-render-end`);
      const duration = performanceMonitor.measure(
        `${componentName}-render`,
        `${componentName}-render-start`,
        `${componentName}-render-end`
      );

      if (duration > 0) {
        performanceMonitor.recordComponentMetric({
          name: componentName,
          renderTime: duration,
          mountTime: duration,
          updateCount: 0
        });
      }
    };
  }, []); // 🐛 FIX: Adiciona array vazio para rodar apenas no mount/unmount
}

export default usePerformanceMetrics;
