/**
 * Sistema de Monitoramento de Métricas de IA
 * Rastreia latência, custos, taxa de sucesso e uso de fallback
 */

import {
  AIProvider,
  AIMetrics,
  AIResponse,
  AIRequest,
} from '../../services/ai/types';

/**
 * Métricas agregadas por período
 */
export interface AggregatedMetrics {
  period: {
    start: Date;
    end: Date;
    durationMs: number;
  };
  
  providers: {
    [key in AIProvider]?: {
      totalRequests: number;
      successRate: number;
      averageLatencyMs: number;
      totalTokens: number;
      estimatedCostUSD: number;
    };
  };
  
  comparison: {
    groqVsGemini: {
      latencyImprovement: number; // % mais rápido
      costSavings: number; // % mais barato
    };
  };
  
  fallback: {
    totalFallbacks: number;
    fallbackRate: number; // %
    byProvider: {
      [key in AIProvider]?: number;
    };
  };
  
  cache: {
    hits: number;
    misses: number;
    hitRate: number; // %
  };
}

/**
 * Evento de métrica individual
 */
export interface MetricEvent {
  timestamp: Date;
  provider: AIProvider;
  useCase: string;
  latencyMs: number;
  tokensUsed: number;
  estimatedCostUSD: number;
  success: boolean;
  usedFallback: boolean;
  fromCache: boolean;
}

/**
 * Serviço de coleta e análise de métricas
 */
export class AIMetricsCollector {
  private events: MetricEvent[] = [];
  private maxEvents = 1000; // Manter últimos 1000 eventos

  /**
   * Registra um evento de métrica
   */
  recordEvent(request: AIRequest, response: AIResponse): void {
    const event: MetricEvent = {
      timestamp: response.timestamp,
      provider: response.provider,
      useCase: request.useCase,
      latencyMs: response.latencyMs,
      tokensUsed: response.tokensUsed.total,
      estimatedCostUSD: response.estimatedCost || 0,
      success: response.status === 'completed',
      usedFallback: response.usedFallback,
      fromCache: response.metadata?.fromCache || false,
    };

    this.events.push(event);

    // Limitar tamanho da lista
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Log em tempo real para eventos importantes
    if (event.usedFallback) {
      console.warn(`⚠️ Fallback usado: ${response.originalProvider} → ${response.provider}`);
    }
    if (event.latencyMs > 5000) {
      console.warn(`⏱️ Alta latência: ${event.latencyMs}ms em ${event.provider}`);
    }
  }

  /**
   * Obtém métricas agregadas para um período
   */
  getAggregatedMetrics(periodMs: number = 3600000): AggregatedMetrics {
    const now = new Date();
    const periodStart = new Date(now.getTime() - periodMs);
    
    // Filtrar eventos do período
    const periodEvents = this.events.filter(
      e => e.timestamp >= periodStart
    );

    if (periodEvents.length === 0) {
      return this.getEmptyMetrics(periodStart, now);
    }

    // Agrupar por provider
    const byProvider = this.groupByProvider(periodEvents);
    
    // Calcular comparação Groq vs Gemini
    const comparison = this.compareProviders(byProvider);
    
    // Calcular métricas de fallback
    const fallback = this.calculateFallbackMetrics(periodEvents);
    
    // Calcular métricas de cache
    const cache = this.calculateCacheMetrics(periodEvents);

    return {
      period: {
        start: periodStart,
        end: now,
        durationMs: periodMs,
      },
      providers: byProvider,
      comparison,
      fallback,
      cache,
    };
  }

  /**
   * Agrupa eventos por provider
   */
  private groupByProvider(events: MetricEvent[]): AggregatedMetrics['providers'] {
    const grouped: AggregatedMetrics['providers'] = {};

    for (const provider of [AIProvider.GROQ, AIProvider.GEMINI]) {
      const providerEvents = events.filter(e => e.provider === provider);
      
      if (providerEvents.length === 0) continue;

      const successfulEvents = providerEvents.filter(e => e.success);
      const totalLatency = providerEvents.reduce((sum, e) => sum + e.latencyMs, 0);
      const totalTokens = providerEvents.reduce((sum, e) => sum + e.tokensUsed, 0);
      const totalCost = providerEvents.reduce((sum, e) => sum + e.estimatedCostUSD, 0);

      grouped[provider] = {
        totalRequests: providerEvents.length,
        successRate: (successfulEvents.length / providerEvents.length) * 100,
        averageLatencyMs: totalLatency / providerEvents.length,
        totalTokens,
        estimatedCostUSD: totalCost,
      };
    }

    return grouped;
  }

  /**
   * Compara performance entre Groq e Gemini
   */
  private compareProviders(
    byProvider: AggregatedMetrics['providers']
  ): AggregatedMetrics['comparison'] {
    const groq = byProvider[AIProvider.GROQ];
    const gemini = byProvider[AIProvider.GEMINI];

    if (!groq || !gemini) {
      return {
        groqVsGemini: {
          latencyImprovement: 0,
          costSavings: 0,
        },
      };
    }

    // Calcular % de melhoria
    const latencyImprovement = 
      ((gemini.averageLatencyMs - groq.averageLatencyMs) / gemini.averageLatencyMs) * 100;
    
    // Calcular % de economia (assumindo mesma quantidade de tokens)
    const costPerToken = {
      groq: groq.estimatedCostUSD / groq.totalTokens,
      gemini: gemini.estimatedCostUSD / gemini.totalTokens,
    };
    
    const costSavings = gemini.totalTokens > 0
      ? ((costPerToken.gemini - costPerToken.groq) / costPerToken.gemini) * 100
      : 0;

    return {
      groqVsGemini: {
        latencyImprovement: Math.round(latencyImprovement * 10) / 10,
        costSavings: Math.round(costSavings * 10) / 10,
      },
    };
  }

  /**
   * Calcula métricas de fallback
   */
  private calculateFallbackMetrics(events: MetricEvent[]): AggregatedMetrics['fallback'] {
    const fallbackEvents = events.filter(e => e.usedFallback);
    
    const byProvider: AggregatedMetrics['fallback']['byProvider'] = {};
    
    for (const provider of [AIProvider.GROQ, AIProvider.GEMINI]) {
      byProvider[provider] = fallbackEvents.filter(
        e => e.provider === provider
      ).length;
    }

    return {
      totalFallbacks: fallbackEvents.length,
      fallbackRate: events.length > 0 
        ? (fallbackEvents.length / events.length) * 100 
        : 0,
      byProvider,
    };
  }

  /**
   * Calcula métricas de cache
   */
  private calculateCacheMetrics(events: MetricEvent[]): AggregatedMetrics['cache'] {
    const cacheHits = events.filter(e => e.fromCache).length;
    const cacheMisses = events.length - cacheHits;

    return {
      hits: cacheHits,
      misses: cacheMisses,
      hitRate: events.length > 0 ? (cacheHits / events.length) * 100 : 0,
    };
  }

  /**
   * Retorna métricas vazias
   */
  private getEmptyMetrics(start: Date, end: Date): AggregatedMetrics {
    return {
      period: {
        start,
        end,
        durationMs: end.getTime() - start.getTime(),
      },
      providers: {},
      comparison: {
        groqVsGemini: {
          latencyImprovement: 0,
          costSavings: 0,
        },
      },
      fallback: {
        totalFallbacks: 0,
        fallbackRate: 0,
        byProvider: {},
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
    };
  }

  /**
   * Obtém eventos brutos (para debugging)
   */
  getEvents(limit: number = 100): MetricEvent[] {
    return this.events.slice(-limit);
  }

  /**
   * Reseta todas as métricas
   */
  reset(): void {
    this.events = [];
    console.log('🔄 Métricas de IA resetadas');
  }

  /**
   * Exporta métricas para análise externa
   */
  exportMetrics(): string {
    const metrics = this.getAggregatedMetrics();
    return JSON.stringify(metrics, null, 2);
  }

  /**
   * Gera relatório em texto
   */
  generateReport(periodMs: number = 3600000): string {
    const metrics = this.getAggregatedMetrics(periodMs);
    const periodHours = periodMs / 3600000;

    let report = `
📊 Relatório de Métricas de IA (Últimas ${periodHours}h)
${'='.repeat(50)}

`;

    // Providers
    for (const [provider, data] of Object.entries(metrics.providers)) {
      if (!data) continue;
      
      report += `
${provider.toUpperCase()}:
  • Requisições: ${data.totalRequests}
  • Taxa de Sucesso: ${data.successRate.toFixed(1)}%
  • Latência Média: ${Math.round(data.averageLatencyMs)}ms
  • Tokens Usados: ${data.totalTokens.toLocaleString()}
  • Custo Estimado: $${data.estimatedCostUSD.toFixed(4)}
`;
    }

    // Comparação
    report += `
COMPARAÇÃO GROQ VS GEMINI:
  • Melhoria de Latência: ${metrics.comparison.groqVsGemini.latencyImprovement > 0 ? '+' : ''}${metrics.comparison.groqVsGemini.latencyImprovement.toFixed(1)}%
  • Economia de Custo: ${metrics.comparison.groqVsGemini.costSavings > 0 ? '+' : ''}${metrics.comparison.groqVsGemini.costSavings.toFixed(1)}%
`;

    // Fallback
    report += `
FALLBACK:
  • Total de Fallbacks: ${metrics.fallback.totalFallbacks}
  • Taxa de Fallback: ${metrics.fallback.fallbackRate.toFixed(1)}%
`;

    // Cache
    report += `
CACHE:
  • Hits: ${metrics.cache.hits}
  • Misses: ${metrics.cache.misses}
  • Taxa de Acerto: ${metrics.cache.hitRate.toFixed(1)}%
`;

    report += `\n${'='.repeat(50)}\n`;

    return report;
  }
}

// Instância singleton
let metricsCollectorInstance: AIMetricsCollector | null = null;

/**
 * Retorna instância singleton do collector
 */
export function getAIMetricsCollector(): AIMetricsCollector {
  if (!metricsCollectorInstance) {
    metricsCollectorInstance = new AIMetricsCollector();
  }
  return metricsCollectorInstance;
}

/**
 * Hook para registrar métricas automaticamente
 */
export function withMetrics<T extends (...args: any[]) => Promise<AIResponse>>(
  fn: T,
  getRequest: (...args: Parameters<T>) => AIRequest
): T {
  return (async (...args: Parameters<T>) => {
    const request = getRequest(...args);
    const response = await fn(...args);
    
    const collector = getAIMetricsCollector();
    collector.recordEvent(request, response);
    
    return response;
  }) as T;
}

export default AIMetricsCollector;


