/**
 * 📊 Sistema de Monitoramento de Performance
 *
 * Coleta e analisa métricas de performance:
 * - Core Web Vitals (LCP, FID, CLS, TTFB)
 * - Tempo de carregamento de componentes
 * - Cache hits/misses
 * - Navegação e rotas
 * - Uso de recursos
 */
class PerformanceMonitor {
    constructor() {
        this.metrics = new Map();
        this.componentMetrics = new Map();
        this.navigationMetrics = [];
        this.cacheMetrics = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            totalSize: 0,
            entries: 0
        };
        this.observers = new Map();
        this.startTime = Date.now();
        this.initializeObservers();
    }
    /**
     * Inicializa observers de performance
     */
    initializeObservers() {
        if (typeof window === 'undefined')
            return;
        try {
            // Observer para LCP
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    this.recordMetric({
                        name: 'LCP',
                        value: lastEntry.renderTime || lastEntry.loadTime,
                        rating: this.rateLCP(lastEntry.renderTime || lastEntry.loadTime),
                        timestamp: Date.now()
                    });
                }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            this.observers.set('lcp', lcpObserver);
            // Observer para FID
            const fidObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordMetric({
                        name: 'FID',
                        value: entry.processingStart - entry.startTime,
                        rating: this.rateFID(entry.processingStart - entry.startTime),
                        timestamp: Date.now()
                    });
                });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
            this.observers.set('fid', fidObserver);
            // Observer para CLS
            const clsObserver = new PerformanceObserver((list) => {
                let clsValue = 0;
                list.getEntries().forEach((entry) => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                this.recordMetric({
                    name: 'CLS',
                    value: clsValue,
                    rating: this.rateCLS(clsValue),
                    timestamp: Date.now()
                });
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
            this.observers.set('cls', clsObserver);
            // Observer para navegação
            const navObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    this.recordMetric({
                        name: 'TTFB',
                        value: entry.responseStart - entry.requestStart,
                        rating: this.rateTTFB(entry.responseStart - entry.requestStart),
                        timestamp: Date.now(),
                        context: {
                            dns: entry.domainLookupEnd - entry.domainLookupStart,
                            tcp: entry.connectEnd - entry.connectStart,
                            request: entry.responseStart - entry.requestStart,
                            response: entry.responseEnd - entry.responseStart,
                            dom: entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
                            load: entry.loadEventEnd - entry.loadEventStart
                        }
                    });
                });
            });
            navObserver.observe({ entryTypes: ['navigation'] });
            this.observers.set('nav', navObserver);
        }
        catch (error) {
            console.error('Error initializing performance observers:', error);
        }
    }
    /**
     * Avalia LCP (Largest Contentful Paint)
     */
    rateLCP(value) {
        if (value <= 2500)
            return 'good';
        if (value <= 4000)
            return 'needs-improvement';
        return 'poor';
    }
    /**
     * Avalia FID (First Input Delay)
     */
    rateFID(value) {
        if (value <= 100)
            return 'good';
        if (value <= 300)
            return 'needs-improvement';
        return 'poor';
    }
    /**
     * Avalia CLS (Cumulative Layout Shift)
     */
    rateCLS(value) {
        if (value <= 0.1)
            return 'good';
        if (value <= 0.25)
            return 'needs-improvement';
        return 'poor';
    }
    /**
     * Avalia TTFB (Time to First Byte)
     */
    rateTTFB(value) {
        if (value <= 800)
            return 'good';
        if (value <= 1800)
            return 'needs-improvement';
        return 'poor';
    }
    /**
     * Registra uma métrica
     */
    recordMetric(metric) {
        this.metrics.set(metric.name, metric);
        // Log para observabilidade
        // TODO: Add trackPerformance method to observability
        // if (observability && typeof observability.trackPerformance === 'function') {
        //   observability.trackPerformance(metric.name, metric.value, {
        //     rating: metric.rating,
        //     ...metric.context
        //   });
        // }
        // Dispara evento customizado
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('performance-metric', { detail: metric }));
        }
    }
    /**
     * Registra métrica de componente
     */
    recordComponentMetric(component) {
        const existing = this.componentMetrics.get(component.name);
        if (existing) {
            existing.updateCount++;
            existing.renderTime = (existing.renderTime + component.renderTime) / 2;
        }
        else {
            this.componentMetrics.set(component.name, { ...component, updateCount: 1 });
        }
    }
    /**
     * Registra navegação
     */
    recordNavigation(from, to, duration) {
        const nav = {
            from,
            to,
            duration,
            timestamp: Date.now()
        };
        this.navigationMetrics.push(nav);
        // Mantém apenas últimas 50 navegações
        if (this.navigationMetrics.length > 50) {
            this.navigationMetrics.shift();
        }
        // TODO: Add trackNavigation method to observability
        // if (observability && typeof observability.trackNavigation === 'function') {
        //   observability.trackNavigation(from, to, duration);
        // }
    }
    /**
     * Atualiza métricas de cache
     */
    updateCacheMetrics(metrics) {
        this.cacheMetrics = { ...this.cacheMetrics, ...metrics };
        if (this.cacheMetrics.hits + this.cacheMetrics.misses > 0) {
            this.cacheMetrics.hitRate =
                this.cacheMetrics.hits / (this.cacheMetrics.hits + this.cacheMetrics.misses);
        }
    }
    /**
     * Obtém Web Vitals
     */
    getWebVitals() {
        return {
            lcp: this.metrics.get('LCP') || null,
            fid: this.metrics.get('FID') || null,
            cls: this.metrics.get('CLS') || null,
            ttfb: this.metrics.get('TTFB') || null,
            fcp: this.metrics.get('FCP') || null,
            inp: this.metrics.get('INP') || null
        };
    }
    /**
     * Obtém métricas de componentes
     */
    getComponentMetrics() {
        return Array.from(this.componentMetrics.values())
            .sort((a, b) => b.renderTime - a.renderTime);
    }
    /**
     * Obtém métricas de navegação
     */
    getNavigationMetrics() {
        return [...this.navigationMetrics];
    }
    /**
     * Obtém métricas de cache
     */
    getCacheMetrics() {
        return { ...this.cacheMetrics };
    }
    /**
     * Gera relatório completo
     */
    generateReport() {
        return {
            webVitals: this.getWebVitals(),
            components: this.getComponentMetrics(),
            cache: this.getCacheMetrics(),
            navigation: this.getNavigationMetrics(),
            timestamp: Date.now()
        };
    }
    /**
     * Exporta relatório como JSON
     */
    exportReport() {
        const report = this.generateReport();
        return JSON.stringify(report, null, 2);
    }
    /**
     * Reseta métricas
     */
    reset() {
        this.metrics.clear();
        this.componentMetrics.clear();
        this.navigationMetrics = [];
        this.cacheMetrics = {
            hits: 0,
            misses: 0,
            hitRate: 0,
            totalSize: 0,
            entries: 0
        };
        this.startTime = Date.now();
    }
    /**
     * Desconecta observers
     */
    disconnect() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
    }
    /**
     * Obtém tempo de execução
     */
    getUptime() {
        return Date.now() - this.startTime;
    }
    /**
     * Marca um ponto de performance
     */
    mark(name) {
        if (typeof window !== 'undefined' && window.performance) {
            performance.mark(name);
        }
    }
    /**
     * Mede tempo entre duas marcas
     */
    measure(name, startMark, endMark) {
        if (typeof window !== 'undefined' && window.performance) {
            try {
                performance.measure(name, startMark, endMark);
                const measure = performance.getEntriesByName(name)[0];
                return measure?.duration || 0;
            }
            catch (error) {
                console.error('Error measuring performance:', error);
                return 0;
            }
        }
        return 0;
    }
    /**
     * Limpa marcas e medições
     */
    clearMarks() {
        if (typeof window !== 'undefined' && window.performance) {
            performance.clearMarks();
            performance.clearMeasures();
        }
    }
}
// Instância global
export const performanceMonitor = new PerformanceMonitor();
/**
 * Hook para monitorar performance de componente
 */
export function measureComponentPerformance(componentName) {
    const startTime = performance.now();
    const startMark = `${componentName}-start`;
    performanceMonitor.mark(startMark);
    return {
        end: () => {
            const endMark = `${componentName}-end`;
            performanceMonitor.mark(endMark);
            const duration = performance.now() - startTime;
            performanceMonitor.recordComponentMetric({
                name: componentName,
                renderTime: duration,
                mountTime: duration,
                updateCount: 0
            });
            return duration;
        }
    };
}
export default performanceMonitor;
