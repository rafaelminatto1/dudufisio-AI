import { createServerComponentClient } from '~/lib/supabase/server';

// Helper para performance.now() compatível com Node.js e browser
const getPerformanceNow = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  // Fallback para Node.js
  if (typeof process !== 'undefined' && process.hrtime) {
    const hrtime = process.hrtime();
    return hrtime[0] * 1000 + hrtime[1] / 1000000;
  }
  // Último fallback
  return Date.now();
};

export interface QueryMetrics {
  query: string;
  table?: string;
  duration: number; // milliseconds
  timestamp: string;
  success: boolean;
  error?: string;
  rowCount?: number;
}

export interface PerformanceReport {
  period: {
    start: string;
    end: string;
  };
  totalQueries: number;
  averageDuration: number;
  slowQueries: QueryMetrics[];
  fastestQueries: QueryMetrics[];
  errorRate: number;
  recommendations: string[];
}

export interface PerformanceSnapshot {
  timestamp: string;
  queries: QueryMetrics[];
  averageDuration: number;
  slowestQuery: QueryMetrics | null;
  fastestQuery: QueryMetrics | null;
  totalQueries: number;
  errorCount: number;
}

/**
 * Service para monitoramento de performance de queries e operações
 * Identifica gargalos e fornece recomendações de otimização
 */
export class PerformanceMonitorService {
  private static queryHistory: QueryMetrics[] = [];
  private static readonly MAX_HISTORY = 1000; // Limitar histórico em memória

  /**
   * Registra métrica de uma query
   */
  static recordQuery(metrics: Omit<QueryMetrics, 'timestamp'>): void {
    const entry: QueryMetrics = {
      ...metrics,
      timestamp: new Date().toISOString(),
    };

    this.queryHistory.push(entry);

    // Limitar tamanho do histórico
    if (this.queryHistory.length > this.MAX_HISTORY) {
      this.queryHistory = this.queryHistory.slice(-this.MAX_HISTORY);
    }
  }

  /**
   * Mede performance de uma operação assíncrona
   */
  static async measureOperation<T>(
    operation: () => Promise<T>,
    query: string,
    table?: string
  ): Promise<T> {
    const startTime = getPerformanceNow();
    let success = true;
    let error: string | undefined;

    try {
      const result = await operation();
      return result;
    } catch (err: any) {
      success = false;
      error = err.message;
      throw err;
    } finally {
      const duration = getPerformanceNow() - startTime;
      this.recordQuery({
        query,
        table,
        duration,
        success,
        error,
      });
    }
  }

  /**
   * Obtém snapshot atual de performance
   */
  static getSnapshot(timeWindow?: number): PerformanceSnapshot {
    const now = Date.now();
    const window = timeWindow || 5 * 60 * 1000; // 5 minutos padrão
    const cutoff = now - window;

    const recentQueries = this.queryHistory.filter(
      q => new Date(q.timestamp).getTime() > cutoff
    );

    if (recentQueries.length === 0) {
      return {
        timestamp: new Date().toISOString(),
        queries: [],
        averageDuration: 0,
        slowestQuery: null,
        fastestQuery: null,
        totalQueries: 0,
        errorCount: 0,
      };
    }

    const durations = recentQueries.map(q => q.duration);
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    const slowestQuery = recentQueries.reduce((prev, current) =>
      prev.duration > current.duration ? prev : current
    );

    const fastestQuery = recentQueries.reduce((prev, current) =>
      prev.duration < current.duration ? prev : current
    );

    const errorCount = recentQueries.filter(q => !q.success).length;

    return {
      timestamp: new Date().toISOString(),
      queries: recentQueries,
      averageDuration: Math.round(averageDuration),
      slowestQuery,
      fastestQuery,
      totalQueries: recentQueries.length,
      errorCount,
    };
  }

  /**
   * Identifica queries lentas
   */
  static getSlowQueries(threshold: number = 1000): QueryMetrics[] {
    return this.queryHistory
      .filter(q => q.duration > threshold && q.success)
      .sort((a, b) => b.duration - a.duration);
  }

  /**
   * Identifica queries com erro
   */
  static getFailedQueries(): QueryMetrics[] {
    return this.queryHistory
      .filter(q => !q.success)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  /**
   * Gera relatório de performance
   */
  static generateReport(startDate: string, endDate: string): PerformanceReport {
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const periodQueries = this.queryHistory.filter(q => {
      const timestamp = new Date(q.timestamp).getTime();
      return timestamp >= start && timestamp <= end;
    });

    if (periodQueries.length === 0) {
      return {
        period: { start: startDate, end: endDate },
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: [],
        fastestQueries: [],
        errorRate: 0,
        recommendations: ['Nenhuma query registrada no período'],
      };
    }

    const durations = periodQueries.map(q => q.duration);
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

    const slowQueries = periodQueries
      .filter(q => q.duration > averageDuration * 2)
      .sort((a, b) => b.duration - a.duration)
      .slice(0, 10);

    const fastestQueries = periodQueries
      .filter(q => q.success)
      .sort((a, b) => a.duration - b.duration)
      .slice(0, 10);

    const errorCount = periodQueries.filter(q => !q.success).length;
    const errorRate = (errorCount / periodQueries.length) * 100;

    const recommendations = this.generateRecommendations(periodQueries, averageDuration);

    return {
      period: { start: startDate, end: endDate },
      totalQueries: periodQueries.length,
      averageDuration: Math.round(averageDuration),
      slowQueries,
      fastestQueries,
      errorRate: Math.round(errorRate * 100) / 100,
      recommendations,
    };
  }

  /**
   * Gera recomendações baseadas nas métricas
   */
  private static generateRecommendations(
    queries: QueryMetrics[],
    averageDuration: number
  ): string[] {
    const recommendations: string[] = [];

    // Verificar queries muito lentas
    const verySlow = queries.filter(q => q.duration > 5000);
    if (verySlow.length > 0) {
      recommendations.push(
        `${verySlow.length} query(s) com duração superior a 5s detectadas. Considere adicionar índices ou otimizar queries.`
      );
    }

    // Verificar taxa de erro
    const errorRate = (queries.filter(q => !q.success).length / queries.length) * 100;
    if (errorRate > 5) {
      recommendations.push(
        `Taxa de erro alta (${errorRate.toFixed(1)}%). Verifique logs e conexões com o banco de dados.`
      );
    }

    // Verificar duração média
    if (averageDuration > 1000) {
      recommendations.push(
        `Duração média de queries alta (${Math.round(averageDuration)}ms). Considere otimizar queries frequentes.`
      );
    }

    // Verificar queries sem índice
    const queriesWithoutIndex = queries.filter(
      q => q.table && q.duration > 500 && !q.query.toLowerCase().includes('index')
    );
    if (queriesWithoutIndex.length > 0) {
      recommendations.push(
        `Considere adicionar índices nas tabelas mais consultadas para melhorar performance.`
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('Performance está dentro dos parâmetros esperados.');
    }

    return recommendations;
  }

  /**
   * Analisa performance por tabela
   */
  static getTablePerformance(): Record<string, {
    count: number;
    averageDuration: number;
    totalDuration: number;
    errorCount: number;
  }> {
    const tableStats: Record<string, {
      count: number;
      totalDuration: number;
      errorCount: number;
    }> = {};

    this.queryHistory.forEach(query => {
      if (!query.table) return;

      if (!tableStats[query.table]) {
        tableStats[query.table] = {
          count: 0,
          totalDuration: 0,
          errorCount: 0,
        };
      }

      tableStats[query.table].count++;
      tableStats[query.table].totalDuration += query.duration;
      if (!query.success) {
        tableStats[query.table].errorCount++;
      }
    });

    const result: Record<string, {
      count: number;
      averageDuration: number;
      totalDuration: number;
      errorCount: number;
    }> = {};

    Object.entries(tableStats).forEach(([table, stats]) => {
      result[table] = {
        count: stats.count,
        averageDuration: Math.round(stats.totalDuration / stats.count),
        totalDuration: Math.round(stats.totalDuration),
        errorCount: stats.errorCount,
      };
    });

    return result;
  }

  /**
   * Limpa histórico de queries
   */
  static clearHistory(): void {
    this.queryHistory = [];
  }

  /**
   * Obtém estatísticas resumidas
   */
  static getStats(): {
    totalQueries: number;
    averageDuration: number;
    slowQueries: number;
    errorRate: number;
  } {
    if (this.queryHistory.length === 0) {
      return {
        totalQueries: 0,
        averageDuration: 0,
        slowQueries: 0,
        errorRate: 0,
      };
    }

    const durations = this.queryHistory.map(q => q.duration);
    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const slowQueries = this.queryHistory.filter(q => q.duration > 1000).length;
    const errorCount = this.queryHistory.filter(q => !q.success).length;
    const errorRate = (errorCount / this.queryHistory.length) * 100;

    return {
      totalQueries: this.queryHistory.length,
      averageDuration: Math.round(averageDuration),
      slowQueries,
      errorRate: Math.round(errorRate * 100) / 100,
    };
  }
}

