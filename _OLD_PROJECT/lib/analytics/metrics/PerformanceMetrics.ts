/**
 * Performance Metrics Tracker for BI System
 * Tracks and reports system performance metrics
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  category: 'query' | 'etl' | 'export' | 'ml' | 'general';
}

export interface PerformanceReport {
  totalOperations: number;
  avgExecutionTime: number;
  minExecutionTime: number;
  maxExecutionTime: number;
  successRate: number;
  errorRate: number;
  memoryUsage: number;
  cpuUsage: number;
  cacheHitRate: number;
  metrics: PerformanceMetric[];
  generatedAt: Date;
}

import { logger } from '../../logger';

export class PerformanceMetrics {
  private static instance: PerformanceMetrics;
  private metrics: PerformanceMetric[] = [];
  private operationTimers: Map<string, number> = new Map();
  private operationCounts: Map<string, { success: number; error: number }> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMetrics {
    if (!PerformanceMetrics.instance) {
      PerformanceMetrics.instance = new PerformanceMetrics();
    }
    return PerformanceMetrics.instance;
  }

  /**
   * Start tracking an operation
   */
  startOperation(operationId: string): void {
    this.operationTimers.set(operationId, performance.now());
  }

  /**
   * End tracking an operation
   */
  endOperation(
    operationId: string,
    category: PerformanceMetric['category'],
    success: boolean = true
  ): number {
    const startTime = this.operationTimers.get(operationId);
    if (!startTime) {
      logger.warn('No start time found for operation.', { context: 'analytics.metrics', data: { operationId } });
      return 0;
    }

    const duration = performance.now() - startTime;
    this.operationTimers.delete(operationId);

    // Record metric
    this.recordMetric({
      name: operationId,
      value: duration,
      unit: 'ms',
      timestamp: new Date(),
      category
    });

    // Update operation counts
    const counts = this.operationCounts.get(operationId) || { success: 0, error: 0 };
    if (success) {
      counts.success++;
    } else {
      counts.error++;
    }
    this.operationCounts.set(operationId, counts);

    return duration;
  }

  /**
   * Record a custom metric
   */
  recordMetric(metric: PerformanceMetric): void {
    this.metrics.push(metric);
    
    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get metrics by time range
   */
  getMetricsByTimeRange(start: Date, end: Date): PerformanceMetric[] {
    return this.metrics.filter(m => 
      m.timestamp >= start && m.timestamp <= end
    );
  }

  /**
   * Calculate average for a metric name
   */
  getAverageMetric(metricName: string): number {
    const relevantMetrics = this.metrics.filter(m => m.name === metricName);
    if (relevantMetrics.length === 0) return 0;
    
    const sum = relevantMetrics.reduce((acc, m) => acc + m.value, 0);
    return sum / relevantMetrics.length;
  }

  /**
   * Get operation statistics
   */
  getOperationStats(operationId: string) {
    const counts = this.operationCounts.get(operationId) || { success: 0, error: 0 };
    const total = counts.success + counts.error;
    const successRate = total > 0 ? (counts.success / total) * 100 : 0;
    const errorRate = total > 0 ? (counts.error / total) * 100 : 0;

    const metrics = this.metrics.filter(m => m.name === operationId);
    const durations = metrics.map(m => m.value);
    
    return {
      totalOperations: total,
      successCount: counts.success,
      errorCount: counts.error,
      successRate,
      errorRate,
      avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0
    };
  }

  /**
   * Generate comprehensive performance report
   */
  generateReport(): PerformanceReport {
    const allDurations = this.metrics.map(m => m.value);
    const totalOps = allDurations.length;
    
    let totalSuccess = 0;
    let totalErrors = 0;
    
    this.operationCounts.forEach(counts => {
      totalSuccess += counts.success;
      totalErrors += counts.error;
    });

    const total = totalSuccess + totalErrors;

    return {
      totalOperations: total,
      avgExecutionTime: totalOps > 0 ? allDurations.reduce((a, b) => a + b, 0) / totalOps : 0,
      minExecutionTime: totalOps > 0 ? Math.min(...allDurations) : 0,
      maxExecutionTime: totalOps > 0 ? Math.max(...allDurations) : 0,
      successRate: total > 0 ? (totalSuccess / total) * 100 : 100,
      errorRate: total > 0 ? (totalErrors / total) * 100 : 0,
      memoryUsage: this.getMemoryUsage(),
      cpuUsage: this.getCPUUsage(),
      cacheHitRate: this.calculateCacheHitRate(),
      metrics: this.metrics,
      generatedAt: new Date()
    };
  }

  /**
   * Get current memory usage (if available)
   */
  private getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100);
    }
    return 0;
  }

  /**
   * Estimate CPU usage based on operation times
   */
  private getCPUUsage(): number {
    const recentMetrics = this.metrics.slice(-50);
    if (recentMetrics.length === 0) return 0;
    
    const avgDuration = recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length;
    // Rough estimation: higher average duration = higher CPU usage
    return Math.min(Math.round(avgDuration / 10), 100);
  }

  /**
   * Calculate cache hit rate
   */
  private calculateCacheHitRate(): number {
    const cacheMetrics = this.metrics.filter(m => m.name.includes('cache'));
    if (cacheMetrics.length === 0) return 85; // Default assumption
    
    const hits = cacheMetrics.filter(m => m.value < 10).length; // Fast operations = cache hits
    return (hits / cacheMetrics.length) * 100;
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.operationTimers.clear();
    this.operationCounts.clear();
  }

  /**
   * Get metrics summary
   */
  getSummary() {
    const categories = ['query', 'etl', 'export', 'ml', 'general'] as const;
    const summary: Record<string, any> = {};

    categories.forEach(category => {
      const categoryMetrics = this.getMetricsByCategory(category);
      const durations = categoryMetrics.map(m => m.value);
      
      summary[category] = {
        count: categoryMetrics.length,
        avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0,
        minDuration: durations.length > 0 ? Math.min(...durations) : 0,
        maxDuration: durations.length > 0 ? Math.max(...durations) : 0
      };
    });

    return summary;
  }

  /**
   * Export metrics to JSON
   */
  exportMetrics(): string {
    return JSON.stringify({
      metrics: this.metrics,
      report: this.generateReport(),
      summary: this.getSummary(),
      exportedAt: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Get real-time stats
   */
  getRealTimeStats() {
    const now = Date.now();
    const lastMinute = new Date(now - 60000);
    const recentMetrics = this.getMetricsByTimeRange(lastMinute, new Date());

    return {
      operationsLastMinute: recentMetrics.length,
      avgResponseTime: recentMetrics.length > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.value, 0) / recentMetrics.length 
        : 0,
      activeOperations: this.operationTimers.size,
      memoryUsage: this.getMemoryUsage(),
      timestamp: new Date()
    };
  }
}

export const performanceMetrics = PerformanceMetrics.getInstance();
