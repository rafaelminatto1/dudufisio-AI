/**
 * Sistema de Métricas de Erro
 * 
 * Coleta e analisa métricas sobre erros para melhorar observabilidade
 */

// =============================================================================
// TIPOS
// =============================================================================

interface ErrorMetric {
  operation: string;
  errorType: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: number;
  resolved: boolean;
  duration?: number; // Tempo até resolver (se aplicável)
}

interface ErrorStats {
  operation: string;
  totalErrors: number;
  lastError: number;
  errorRate: number; // Erros por hora
  avgResolutionTime: number; // Tempo médio para resolver (ms)
  errorsByType: Record<string, number>;
  errorsBySeverity: Record<string, number>;
}

interface SystemHealthMetrics {
  totalErrors: number;
  errorsLast24h: number;
  errorsLastHour: number;
  errorRate: number;
  mostFailedOperations: Array<{
    operation: string;
    count: number;
    errorRate: number;
  }>;
  criticalErrors: number;
  averageResolutionTime: number;
}

// =============================================================================
// ARMAZENAMENTO
// =============================================================================

class ErrorMetricsStore {
  private metrics: ErrorMetric[] = [];
  private maxMetrics = 1000; // Manter últimas 1000 métricas em memória

  /**
   * Adiciona nova métrica de erro
   */
  add(metric: ErrorMetric) {
    this.metrics.push(metric);
    
    // Manter apenas as métricas mais recentes
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }

    // Persistir no localStorage (opcional)
    this.persist();
  }

  /**
   * Marca erro como resolvido
   */
  resolve(operation: string, timestamp: number) {
    const metric = this.metrics.find(
      m => m.operation === operation && m.timestamp === timestamp && !m.resolved
    );
    
    if (metric) {
      metric.resolved = true;
      metric.duration = Date.now() - metric.timestamp;
      this.persist();
    }
  }

  /**
   * Obtém todas as métricas
   */
  getAll(): ErrorMetric[] {
    return [...this.metrics];
  }

  /**
   * Obtém métricas por operação
   */
  getByOperation(operation: string): ErrorMetric[] {
    return this.metrics.filter(m => m.operation === operation);
  }

  /**
   * Obtém métricas em um período
   */
  getInTimeRange(startTime: number, endTime: number): ErrorMetric[] {
    return this.metrics.filter(
      m => m.timestamp >= startTime && m.timestamp <= endTime
    );
  }

  /**
   * Limpa métricas antigas
   */
  cleanup(olderThan: number = 7 * 24 * 60 * 60 * 1000) { // 7 dias por padrão
    const cutoff = Date.now() - olderThan;
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff);
    this.persist();
  }

  /**
   * Limpa todas as métricas
   */
  clear() {
    this.metrics = [];
    localStorage.removeItem('dudufisio_error_metrics');
  }

  /**
   * Persiste métricas no localStorage
   */
  private persist() {
    try {
      const data = JSON.stringify(this.metrics.slice(-100)); // Salvar apenas últimas 100
      localStorage.setItem('dudufisio_error_metrics', data);
    } catch (error) {
      console.warn('Falha ao persistir métricas:', error);
    }
  }

  /**
   * Carrega métricas do localStorage
   */
  load() {
    try {
      const data = localStorage.getItem('dudufisio_error_metrics');
      if (data) {
        this.metrics = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Falha ao carregar métricas:', error);
    }
  }
}

// =============================================================================
// INSTÂNCIA GLOBAL
// =============================================================================

const metricsStore = new ErrorMetricsStore();

// Carregar métricas ao iniciar
if (typeof window !== 'undefined') {
  metricsStore.load();
}

// =============================================================================
// FUNÇÕES PÚBLICAS
// =============================================================================

/**
 * Registra um erro
 */
export function trackError(
  operation: string,
  error: Error,
  severity: 'low' | 'medium' | 'high' | 'critical'
) {
  metricsStore.add({
    operation,
    errorType: error.name || 'Error',
    severity,
    timestamp: Date.now(),
    resolved: false,
  });
}

/**
 * Marca erro como resolvido (quando retry funciona)
 */
export function resolveError(operation: string, timestamp: number) {
  metricsStore.resolve(operation, timestamp);
}

/**
 * Obtém estatísticas por operação
 */
export function getOperationStats(operation: string): ErrorStats {
  const metrics = metricsStore.getByOperation(operation);
  
  if (metrics.length === 0) {
    return {
      operation,
      totalErrors: 0,
      lastError: 0,
      errorRate: 0,
      avgResolutionTime: 0,
      errorsByType: {},
      errorsBySeverity: {},
    };
  }

  // Calcular taxa de erro (últimas 24h)
  const last24h = Date.now() - (24 * 60 * 60 * 1000);
  const recent = metrics.filter(m => m.timestamp > last24h);
  const errorRate = recent.length / 24; // Erros por hora

  // Tempo médio de resolução
  const resolved = metrics.filter(m => m.resolved && m.duration);
  const avgResolutionTime = resolved.length > 0
    ? resolved.reduce((sum, m) => sum + (m.duration || 0), 0) / resolved.length
    : 0;

  // Contagem por tipo
  const errorsByType: Record<string, number> = {};
  metrics.forEach(m => {
    errorsByType[m.errorType] = (errorsByType[m.errorType] || 0) + 1;
  });

  // Contagem por severidade
  const errorsBySeverity: Record<string, number> = {};
  metrics.forEach(m => {
    errorsBySeverity[m.severity] = (errorsBySeverity[m.severity] || 0) + 1;
  });

  return {
    operation,
    totalErrors: metrics.length,
    lastError: metrics[metrics.length - 1]?.timestamp || 0,
    errorRate,
    avgResolutionTime,
    errorsByType,
    errorsBySeverity,
  };
}

/**
 * Obtém métricas gerais de saúde do sistema
 */
export function getSystemHealthMetrics(): SystemHealthMetrics {
  const all = metricsStore.getAll();
  const now = Date.now();
  const last24h = now - (24 * 60 * 60 * 1000);
  const lastHour = now - (60 * 60 * 1000);

  const errorsLast24h = all.filter(m => m.timestamp > last24h).length;
  const errorsLastHour = all.filter(m => m.timestamp > lastHour).length;
  const errorRate = errorsLast24h / 24; // Erros por hora

  // Operações mais problemáticas
  const operationCounts: Record<string, number> = {};
  all.forEach(m => {
    operationCounts[m.operation] = (operationCounts[m.operation] || 0) + 1;
  });

  const mostFailedOperations = Object.entries(operationCounts)
    .map(([operation, count]) => {
      const opMetrics = all.filter(m => m.operation === operation && m.timestamp > last24h);
      const opRate = opMetrics.length / 24;
      return { operation, count, errorRate: opRate };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5

  // Erros críticos
  const criticalErrors = all.filter(m => m.severity === 'critical').length;

  // Tempo médio de resolução
  const resolved = all.filter(m => m.resolved && m.duration);
  const averageResolutionTime = resolved.length > 0
    ? resolved.reduce((sum, m) => sum + (m.duration || 0), 0) / resolved.length
    : 0;

  return {
    totalErrors: all.length,
    errorsLast24h,
    errorsLastHour,
    errorRate,
    mostFailedOperations,
    criticalErrors,
    averageResolutionTime,
  };
}

/**
 * Obtém lista de todas as operações com erros
 */
export function getAllOperationsWithErrors(): string[] {
  const operations = new Set<string>();
  metricsStore.getAll().forEach(m => operations.add(m.operation));
  return Array.from(operations).sort();
}

/**
 * Exporta métricas para análise
 */
export function exportMetrics(): string {
  const metrics = metricsStore.getAll();
  return JSON.stringify(metrics, null, 2);
}

/**
 * Limpa métricas antigas
 */
export function cleanupOldMetrics(daysToKeep: number = 7) {
  const olderThan = daysToKeep * 24 * 60 * 60 * 1000;
  metricsStore.cleanup(olderThan);
}

/**
 * Limpa todas as métricas
 */
export function clearAllMetrics() {
  metricsStore.clear();
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  track: trackError,
  resolve: resolveError,
  getOperationStats,
  getSystemHealth: getSystemHealthMetrics,
  getAllOperations: getAllOperationsWithErrors,
  export: exportMetrics,
  cleanup: cleanupOldMetrics,
  clear: clearAllMetrics,
};

