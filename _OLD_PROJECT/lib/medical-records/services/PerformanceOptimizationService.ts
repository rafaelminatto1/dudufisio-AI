// lib/medical-records/services/PerformanceOptimizationService.ts
import { DocumentId, PatientId } from '../../../types/medical-records';

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  queryTime: number;
  renderTime: number;
}

export interface CacheConfig {
  ttl: number; // Time to live in milliseconds
  maxSize: number; // Maximum number of items
  strategy: 'lru' | 'fifo' | 'lfu';
}

export class PerformanceOptimizationService {
  private cache = new Map<string, { data: any; timestamp: number; hits: number }>();
  private metrics: PerformanceMetrics[] = [];
  private config: CacheConfig;

  constructor(config: CacheConfig = {
    ttl: 5 * 60 * 1000, // 5 minutes
    maxSize: 1000,
    strategy: 'lru'
  }) {
    this.config = config;
  }

  /**
   * Cache de documentos clínicos
   */
  cacheDocument(documentId: DocumentId, document: any): void {
    this.ensureCacheSize();
    this.cache.set(`document:${documentId}`, {
      data: document,
      timestamp: Date.now(),
      hits: 0
    });
  }

  /**
   * Recupera documento do cache
   */
  getCachedDocument(documentId: DocumentId): any | null {
    const key = `document:${documentId}`;
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    // Verificar TTL
    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    // Incrementar hits
    cached.hits++;
    return cached.data;
  }

  /**
   * Cache de lista de pacientes
   */
  cachePatientList(patients: any[]): void {
    this.ensureCacheSize();
    this.cache.set('patient:list', {
      data: patients,
      timestamp: Date.now(),
      hits: 0
    });
  }

  /**
   * Recupera lista de pacientes do cache
   */
  getCachedPatientList(): any[] | null {
    const cached = this.cache.get('patient:list');
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete('patient:list');
      return null;
    }
    
    cached.hits++;
    return cached.data;
  }

  /**
   * Cache de templates clínicos
   */
  cacheTemplate(templateId: string, template: any): void {
    this.ensureCacheSize();
    this.cache.set(`template:${templateId}`, {
      data: template,
      timestamp: Date.now(),
      hits: 0
    });
  }

  /**
   * Recupera template do cache
   */
  getCachedTemplate(templateId: string): any | null {
    const key = `template:${templateId}`;
    const cached = this.cache.get(key);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.config.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    cached.hits++;
    return cached.data;
  }

  /**
   * Invalida cache por padrão
   */
  invalidateCache(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Limpa todo o cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Garante que o cache não exceda o tamanho máximo
   */
  private ensureCacheSize(): void {
    if (this.cache.size >= this.config.maxSize) {
      this.evictOldest();
    }
  }

  /**
   * Remove itens mais antigos do cache
   */
  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, value] of this.cache.entries()) {
      if (value.timestamp < oldestTime) {
        oldestTime = value.timestamp;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  /**
   * Registra métricas de performance
   */
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    this.metrics.push({
      loadTime: metrics.loadTime || 0,
      memoryUsage: metrics.memoryUsage || 0,
      cacheHitRate: metrics.cacheHitRate || 0,
      queryTime: metrics.queryTime || 0,
      renderTime: metrics.renderTime || 0
    });
    
    // Manter apenas as últimas 100 métricas
    if (this.metrics.length > 100) {
      this.metrics = this.metrics.slice(-100);
    }
  }

  /**
   * Obtém estatísticas de performance
   */
  getPerformanceStats(): {
    averageLoadTime: number;
    averageMemoryUsage: number;
    averageCacheHitRate: number;
    averageQueryTime: number;
    averageRenderTime: number;
    totalMetrics: number;
  } {
    if (this.metrics.length === 0) {
      return {
        averageLoadTime: 0,
        averageMemoryUsage: 0,
        averageCacheHitRate: 0,
        averageQueryTime: 0,
        averageRenderTime: 0,
        totalMetrics: 0
      };
    }

    const totals = this.metrics.reduce((acc, metric) => ({
      loadTime: acc.loadTime + metric.loadTime,
      memoryUsage: acc.memoryUsage + metric.memoryUsage,
      cacheHitRate: acc.cacheHitRate + metric.cacheHitRate,
      queryTime: acc.queryTime + metric.queryTime,
      renderTime: acc.renderTime + metric.renderTime
    }), { loadTime: 0, memoryUsage: 0, cacheHitRate: 0, queryTime: 0, renderTime: 0 });

    const count = this.metrics.length;

    return {
      averageLoadTime: totals.loadTime / count,
      averageMemoryUsage: totals.memoryUsage / count,
      averageCacheHitRate: totals.cacheHitRate / count,
      averageQueryTime: totals.queryTime / count,
      averageRenderTime: totals.renderTime / count,
      totalMetrics: count
    };
  }

  /**
   * Obtém estatísticas do cache
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    missRate: number;
    totalHits: number;
    totalMisses: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0);
    const totalRequests = totalHits + (this.cache.size - entries.length);
    
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? totalHits / totalRequests : 0,
      missRate: totalRequests > 0 ? (totalRequests - totalHits) / totalRequests : 0,
      totalHits,
      totalMisses: totalRequests - totalHits
    };
  }

  /**
   * Otimiza consultas de banco de dados
   */
  optimizeQuery(query: string, params: any[]): { optimizedQuery: string; optimizedParams: any[] } {
    // Implementar otimizações de query
    // Por exemplo: adicionar índices, usar prepared statements, etc.
    
    return {
      optimizedQuery: query,
      optimizedParams: params
    };
  }

  /**
   * Implementa lazy loading para listas grandes
   */
  async lazyLoadData<T>(
    loadFunction: (offset: number, limit: number) => Promise<T[]>,
    offset: number = 0,
    limit: number = 20
  ): Promise<{ data: T[]; hasMore: boolean; nextOffset: number }> {
    const data = await loadFunction(offset, limit);
    const hasMore = data.length === limit;
    const nextOffset = offset + limit;
    
    return { data, hasMore, nextOffset };
  }

  /**
   * Implementa debounce para operações frequentes
   */
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  }

  /**
   * Implementa throttle para operações que devem ser limitadas
   */
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  /**
   * Monitora uso de memória
   */
  monitorMemoryUsage(): number {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage();
      return usage.heapUsed / 1024 / 1024; // MB
    }
    return 0;
  }

  /**
   * Limpa recursos não utilizados
   */
  cleanup(): void {
    // Limpar cache expirado
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.config.ttl) {
        this.cache.delete(key);
      }
    }
    
    // Limpar métricas antigas
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50);
    }
  }
}
