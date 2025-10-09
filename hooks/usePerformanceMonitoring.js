/**
 * 🚀 PERFORMANCE MONITORING SYSTEM
 *
 * Sistema completo de monitoramento de performance para produção
 */
import { useEffect, useRef, useCallback } from 'react';
// Singleton para armazenar métricas globalmente
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.thresholds = {
            renderTime: 16, // 60fps = ~16ms por frame
            renderCount: 50, // Alerta se > 50 renders
            memoryIncrease: 10 * 1024 * 1024, // 10MB
        };
    }
    recordMetric(metric) {
        const componentMetrics = this.metrics.get(metric.componentName) || [];
        componentMetrics.push(metric);
        this.metrics.set(metric.componentName, componentMetrics);
        // Manter apenas últimas 100 métricas por componente
        if (componentMetrics.length > 100) {
            componentMetrics.shift();
        }
        // Log warnings em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
            this.checkThresholds(metric);
        }
    }
    checkThresholds(metric) {
        const warnings = [];
        if (metric.renderTime > this.thresholds.renderTime) {
            warnings.push(`⚠️ ${metric.componentName}: Render lento (${metric.renderTime.toFixed(2)}ms > ${this.thresholds.renderTime}ms)`);
        }
        if (metric.renderCount > this.thresholds.renderCount) {
            warnings.push(`⚠️ ${metric.componentName}: Muitos re-renders (${metric.renderCount} > ${this.thresholds.renderCount})`);
        }
        warnings.forEach(warning => console.warn(warning));
    }
    getReport(componentName) {
        const metrics = this.metrics.get(componentName);
        if (!metrics || metrics.length === 0)
            return null;
        const renderTimes = metrics.map(m => m.renderTime);
        const renderCounts = metrics.map(m => m.renderCount);
        return {
            averageRenderTime: renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length,
            totalRenders: renderCounts[renderCounts.length - 1] || 0,
            slowestRender: Math.max(...renderTimes),
            fastestRender: Math.min(...renderTimes),
            memoryUsage: metrics[metrics.length - 1]?.memory,
            warnings: [],
        };
    }
    getAllReports() {
        const reports = new Map();
        this.metrics.forEach((_, componentName) => {
            const report = this.getReport(componentName);
            if (report) {
                reports.set(componentName, report);
            }
        });
        return reports;
    }
    exportMetrics() {
        const reports = this.getAllReports();
        const data = {};
        reports.forEach((report, name) => {
            data[name] = report;
        });
        return JSON.stringify(data, null, 2);
    }
    clearMetrics(componentName) {
        if (componentName) {
            this.metrics.delete(componentName);
        }
        else {
            this.metrics.clear();
        }
    }
}
// Singleton instance
export const performanceMonitor = new PerformanceMonitor();
/**
 * Hook para monitorar performance de componentes
 */
export const usePerformanceMonitoring = (componentName) => {
    const renderCount = useRef(0);
    const renderStartTime = useRef(0);
    const lastMemory = useRef(undefined);
    useEffect(() => {
        renderCount.current += 1;
    });
    useEffect(() => {
        renderStartTime.current = performance.now();
        return () => {
            const renderTime = performance.now() - renderStartTime.current;
            // Pegar memória se disponível
            let memory;
            if ('memory' in performance) {
                const perfMemory = performance.memory;
                memory = perfMemory.usedJSHeapSize;
            }
            const metric = {
                componentName,
                renderTime,
                renderCount: renderCount.current,
                timestamp: Date.now(),
                memory,
            };
            performanceMonitor.recordMetric(metric);
            lastMemory.current = memory;
        };
    });
    const getReport = useCallback(() => {
        return performanceMonitor.getReport(componentName);
    }, [componentName]);
    const clearMetrics = useCallback(() => {
        performanceMonitor.clearMetrics(componentName);
    }, [componentName]);
    return {
        renderCount: renderCount.current,
        getReport,
        clearMetrics,
    };
};
/**
 * Hook para FPS monitoring
 */
export const useFPSMonitoring = () => {
    const frameCount = useRef(0);
    const lastTime = useRef(performance.now());
    const fps = useRef(60);
    useEffect(() => {
        let animationFrameId;
        const measureFPS = () => {
            frameCount.current++;
            const currentTime = performance.now();
            const deltaTime = currentTime - lastTime.current;
            if (deltaTime >= 1000) {
                fps.current = Math.round((frameCount.current * 1000) / deltaTime);
                frameCount.current = 0;
                lastTime.current = currentTime;
                if (fps.current < 30 && process.env.NODE_ENV === 'development') {
                    console.warn(`⚠️ FPS baixo detectado: ${fps.current} fps`);
                }
            }
            animationFrameId = requestAnimationFrame(measureFPS);
        };
        animationFrameId = requestAnimationFrame(measureFPS);
        return () => {
            cancelAnimationFrame(animationFrameId);
        };
    }, []);
    return fps.current;
};
/**
 * Hook para detectar memory leaks
 */
export const useMemoryLeakDetection = (componentName) => {
    const initialMemory = useRef(undefined);
    const checkInterval = useRef(undefined);
    useEffect(() => {
        if (!('memory' in performance)) {
            console.warn('Memory API não disponível');
            return;
        }
        const perfMemory = performance.memory;
        initialMemory.current = perfMemory.usedJSHeapSize;
        checkInterval.current = setInterval(() => {
            const currentMemory = perfMemory.usedJSHeapSize;
            const memoryIncrease = currentMemory - (initialMemory.current || 0);
            if (memoryIncrease > 50 * 1024 * 1024) { // 50MB
                console.error(`🚨 Possível memory leak em ${componentName}: +${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);
            }
        }, 30000); // Check a cada 30s
        return () => {
            if (checkInterval.current) {
                clearInterval(checkInterval.current);
            }
        };
    }, [componentName]);
};
/**
 * Exportar métricas para análise
 */
export const exportPerformanceMetrics = () => {
    const metrics = performanceMonitor.exportMetrics();
    const blob = new Blob([metrics], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
