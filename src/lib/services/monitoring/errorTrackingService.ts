import { AuditService } from '../audit/auditService';

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface ErrorEntry {
  id?: string;
  message: string;
  stack?: string;
  severity: ErrorSeverity;
  source: string; // 'client' | 'server' | 'api' | 'database'
  userId?: string;
  metadata?: Record<string, any>;
  timestamp: string;
  resolved?: boolean;
  resolvedAt?: string;
  resolvedBy?: string;
}

export interface ErrorAggregation {
  message: string;
  count: number;
  firstOccurrence: string;
  lastOccurrence: string;
  severity: ErrorSeverity;
  sources: string[];
  affectedUsers: string[];
}

export interface ErrorTrend {
  date: string;
  total: number;
  bySeverity: Record<ErrorSeverity, number>;
}

/**
 * Service para rastreamento e agregação de erros
 * Notifica erros críticos e fornece análise de tendências
 */
export class ErrorTrackingService {
  private static errorCache: ErrorEntry[] = [];
  private static readonly MAX_CACHE = 500;

  /**
   * Registra um erro
   */
  static async trackError(
    error: Error | string,
    options?: {
      severity?: ErrorSeverity;
      source?: string;
      userId?: string;
      metadata?: Record<string, any>;
    }
  ): Promise<ErrorEntry> {
    const message = typeof error === 'string' ? error : error.message;
    const stack = typeof error === 'string' ? undefined : error.stack;

    const entry: ErrorEntry = {
      message,
      stack,
      severity: options?.severity || this.inferSeverity(message),
      source: options?.source || 'server',
      userId: options?.userId,
      metadata: options?.metadata,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    // Adicionar ao cache
    this.errorCache.push(entry);
    if (this.errorCache.length > this.MAX_CACHE) {
      this.errorCache = this.errorCache.slice(-this.MAX_CACHE);
    }

    // Salvar no banco (se configurado)
    try {
      await this.saveErrorToDatabase(entry);
    } catch (err) {
      console.error('Failed to save error to database:', err);
    }

    // Log de auditoria para erros críticos
    if (entry.severity === 'critical' && entry.userId) {
      await AuditService.logAction({
        userId: entry.userId,
        action: 'other',
        entityType: 'error',
        description: `Critical error: ${message}`,
        metadata: { severity: entry.severity, source: entry.source },
      });
    }

    // Notificar erros críticos
    if (entry.severity === 'critical') {
      await this.notifyCriticalError(entry);
    }

    return entry;
  }

  /**
   * Salva erro no banco de dados
   */
  private static async saveErrorToDatabase(entry: ErrorEntry): Promise<void> {
    // Tabela error_logs pode não existir no schema, então sempre usamos audit_logs como fallback
    // Isso evita erros de tipo do TypeScript
    try {
      // Garantir que metadata seja um objeto simples para evitar problemas de tipo
      const errorMetadata: Record<string, any> = {
        severity: entry.severity,
        source: entry.source,
        stack: entry.stack,
        ...(entry.metadata || {}),
      };
      
      await AuditService.logAction({
        userId: entry.userId || 'system',
        action: 'other',
        entityType: 'error',
        description: `Error: ${entry.message}`,
        metadata: errorMetadata,
      });
    } catch (err: any) {
      // Se houver erro ao salvar, apenas logar (não quebrar o fluxo)
      console.error('Failed to save error to audit log:', err);
    }
  }

  /**
   * Notifica erros críticos
   */
  private static async notifyCriticalError(entry: ErrorEntry): Promise<void> {
    // Em produção, enviar notificação (email, Slack, etc.)
    console.error('🚨 CRITICAL ERROR:', {
      message: entry.message,
      source: entry.source,
      userId: entry.userId,
      timestamp: entry.timestamp,
    });

    // TODO: Integrar com serviço de notificações
    // await NotificationService.sendCriticalErrorAlert(entry);
  }

  /**
   * Infere severidade baseada na mensagem de erro
   */
  private static inferSeverity(message: string): ErrorSeverity {
    const lower = message.toLowerCase();

    if (
      lower.includes('critical') ||
      lower.includes('fatal') ||
      lower.includes('database connection') ||
      lower.includes('authentication failed')
    ) {
      return 'critical';
    }

    if (
      lower.includes('error') ||
      lower.includes('failed') ||
      lower.includes('timeout') ||
      lower.includes('unauthorized')
    ) {
      return 'high';
    }

    if (
      lower.includes('warning') ||
      lower.includes('deprecated') ||
      lower.includes('slow')
    ) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Agrega erros similares
   */
  static aggregateErrors(timeWindow?: number): ErrorAggregation[] {
    const now = Date.now();
    const window = timeWindow || 24 * 60 * 60 * 1000; // 24 horas padrão
    const cutoff = now - window;

    const recentErrors = this.errorCache.filter(
      e => new Date(e.timestamp).getTime() > cutoff
    );

    const aggregationMap = new Map<string, ErrorAggregation>();

    recentErrors.forEach(error => {
      const key = this.normalizeErrorMessage(error.message);

      if (!aggregationMap.has(key)) {
        aggregationMap.set(key, {
          message: error.message,
          count: 0,
          firstOccurrence: error.timestamp,
          lastOccurrence: error.timestamp,
          severity: error.severity,
          sources: [],
          affectedUsers: [],
        });
      }

      const agg = aggregationMap.get(key)!;
      agg.count++;
      
      if (new Date(error.timestamp) < new Date(agg.firstOccurrence)) {
        agg.firstOccurrence = error.timestamp;
      }
      if (new Date(error.timestamp) > new Date(agg.lastOccurrence)) {
        agg.lastOccurrence = error.timestamp;
      }

      if (error.source && !agg.sources.includes(error.source)) {
        agg.sources.push(error.source);
      }

      if (error.userId && !agg.affectedUsers.includes(error.userId)) {
        agg.affectedUsers.push(error.userId);
      }

      // Atualizar severidade para a mais alta
      if (this.compareSeverity(error.severity, agg.severity) > 0) {
        agg.severity = error.severity;
      }
    });

    return Array.from(aggregationMap.values())
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Normaliza mensagem de erro para agregação
   */
  private static normalizeErrorMessage(message: string): string {
    // Remover IDs dinâmicos, timestamps, etc.
    return message
      .replace(/\d{4}-\d{2}-\d{2}/g, '[DATE]')
      .replace(/\d{2}:\d{2}:\d{2}/g, '[TIME]')
      .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '[UUID]')
      .replace(/\b\d+\b/g, '[NUMBER]')
      .trim();
  }

  /**
   * Compara severidades
   */
  private static compareSeverity(a: ErrorSeverity, b: ErrorSeverity): number {
    const order: ErrorSeverity[] = ['low', 'medium', 'high', 'critical'];
    return order.indexOf(a) - order.indexOf(b);
  }

  /**
   * Obtém tendências de erros
   */
  static getErrorTrends(days: number = 7): ErrorTrend[] {
    const trends = new Map<string, {
      total: number;
      bySeverity: Record<ErrorSeverity, number>;
    }>();

    const now = Date.now();
    const cutoff = now - (days * 24 * 60 * 60 * 1000);

    this.errorCache
      .filter(e => new Date(e.timestamp).getTime() > cutoff)
      .forEach(error => {
        const date = new Date(error.timestamp).toISOString().split('T')[0];
        
        if (!trends.has(date)) {
          trends.set(date, {
            total: 0,
            bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
          });
        }

        const trend = trends.get(date)!;
        trend.total++;
        trend.bySeverity[error.severity]++;
      });

    return Array.from(trends.entries())
      .map(([date, data]) => ({
        date,
        ...data,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Obtém erros não resolvidos
   */
  static getUnresolvedErrors(severity?: ErrorSeverity): ErrorEntry[] {
    let errors = this.errorCache.filter(e => !e.resolved);

    if (severity) {
      errors = errors.filter(e => e.severity === severity);
    }

    return errors.sort((a, b) => {
      const severityOrder = ['low', 'medium', 'high', 'critical'];
      const severityDiff = severityOrder.indexOf(b.severity) - severityOrder.indexOf(a.severity);
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });
  }

  /**
   * Marca erro como resolvido
   */
  static async resolveError(
    errorId: string,
    resolvedBy: string
  ): Promise<boolean> {
    const error = this.errorCache.find(e => e.id === errorId);
    if (!error) return false;

    error.resolved = true;
    error.resolvedAt = new Date().toISOString();
    error.resolvedBy = resolvedBy;

    // Atualizar no cache (tabela error_logs pode não existir no schema)
    // A atualização no banco seria feita via audit_logs, mas não há necessidade
    // já que o cache é suficiente para rastreamento de erros

    return true;
  }

  /**
   * Obtém estatísticas de erros
   */
  static getStats(): {
    total: number;
    bySeverity: Record<ErrorSeverity, number>;
    unresolved: number;
    critical: number;
  } {
    const bySeverity: Record<ErrorSeverity, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    this.errorCache.forEach(error => {
      bySeverity[error.severity]++;
    });

    return {
      total: this.errorCache.length,
      bySeverity,
      unresolved: this.errorCache.filter(e => !e.resolved).length,
      critical: bySeverity.critical,
    };
  }

  /**
   * Limpa cache de erros
   */
  static clearCache(): void {
    this.errorCache = [];
  }
}

