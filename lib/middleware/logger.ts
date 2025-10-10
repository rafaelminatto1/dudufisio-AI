/**
 * Logger Middleware - DuduFisio-AI
 * 
 * Sistema de logging estruturado para o aplicativo.
 * Integrado com auditoria LGPD e monitoramento.
 * 
 * Baseado em BUSINESS_RULES.md (RN-031)
 */

// =============================================================================
// TIPOS
// =============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  stack?: string;
  tags?: string[];
}

export interface LoggerConfig {
  level: LogLevel;
  enabled: boolean;
  colorize: boolean;
  includeTimestamp: boolean;
  includeContext: boolean;
}

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const DEFAULT_CONFIG: LoggerConfig = {
  level: import.meta.env.DEV ? 'debug' : 'info',
  enabled: true,
  colorize: import.meta.env.DEV,
  includeTimestamp: true,
  includeContext: true,
};

// Níveis de log em ordem de importância
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

// Cores para console (ANSI)
const COLORS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // Cyan
  info: '\x1b[32m',  // Green
  warn: '\x1b[33m',  // Yellow
  error: '\x1b[31m', // Red
  fatal: '\x1b[35m', // Magenta
};

const RESET = '\x1b[0m';

// =============================================================================
// CLASSE LOGGER
// =============================================================================

class Logger {
  private config: LoggerConfig;
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Máximo de logs em memória
  
  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }
  
  /**
   * Atualiza configuração do logger
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }
  
  /**
   * Verifica se deve logar baseado no nível
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.level];
  }
  
  /**
   * Formata mensagem para output
   */
  private formatMessage(entry: LogEntry): string {
    const parts: string[] = [];
    
    // Timestamp
    if (this.config.includeTimestamp) {
      const timestamp = entry.timestamp.toISOString();
      parts.push(`[${timestamp}]`);
    }
    
    // Level
    const levelStr = entry.level.toUpperCase().padEnd(5);
    if (this.config.colorize) {
      parts.push(`${COLORS[entry.level]}${levelStr}${RESET}`);
    } else {
      parts.push(levelStr);
    }
    
    // Message
    parts.push(entry.message);
    
    // Context
    if (this.config.includeContext && entry.context) {
      parts.push(JSON.stringify(entry.context, null, 2));
    }
    
    // User ID
    if (entry.userId) {
      parts.push(`[User: ${entry.userId}]`);
    }
    
    // Tags
    if (entry.tags && entry.tags.length > 0) {
      parts.push(`[${entry.tags.join(', ')}]`);
    }
    
    return parts.join(' ');
  }
  
  /**
   * Adiciona log entry à memória
   */
  private addToMemory(entry: LogEntry): void {
    this.logs.push(entry);
    
    // Limita tamanho do array
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }
  
  /**
   * Log genérico
   */
  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): void {
    if (!this.shouldLog(level)) return;
    
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      stack: error?.stack,
    };
    
    // Adiciona à memória
    this.addToMemory(entry);
    
    // Output no console
    const formattedMessage = this.formatMessage(entry);
    
    switch (level) {
      case 'debug':
        console.debug(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
      case 'fatal':
        console.error(formattedMessage);
        if (error?.stack) console.error(error.stack);
        break;
    }
  }
  
  /**
   * Log de debug
   */
  debug(message: string, context?: Record<string, any>): void {
    this.log('debug', message, context);
  }
  
  /**
   * Log de informação
   */
  info(message: string, context?: Record<string, any>): void {
    this.log('info', message, context);
  }
  
  /**
   * Log de aviso
   */
  warn(message: string, context?: Record<string, any>): void {
    this.log('warn', message, context);
  }
  
  /**
   * Log de erro
   */
  error(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('error', message, context, error);
  }
  
  /**
   * Log de erro fatal
   */
  fatal(message: string, error?: Error, context?: Record<string, any>): void {
    this.log('fatal', message, context, error);
  }
  
  /**
   * Obtém logs em memória
   */
  getLogs(filter?: { level?: LogLevel; limit?: number }): LogEntry[] {
    let logs = [...this.logs];
    
    // Filtra por nível
    if (filter?.level) {
      logs = logs.filter(log => log.level === filter.level);
    }
    
    // Limita quantidade
    if (filter?.limit) {
      logs = logs.slice(-filter.limit);
    }
    
    return logs;
  }
  
  /**
   * Limpa logs em memória
   */
  clearLogs(): void {
    this.logs = [];
  }
  
  /**
   * Exporta logs como JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

// =============================================================================
// INSTÂNCIA SINGLETON
// =============================================================================

export const logger = new Logger();

// =============================================================================
// WRAPPERS DE PERFORMANCE
// =============================================================================

/**
 * Mede tempo de execução de função
 */
export async function measurePerformance<T>(
  label: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  logger.debug(`⏱️  ${label} - Iniciando...`);
  
  try {
    const result = await fn();
    const duration = performance.now() - start;
    logger.debug(`✅ ${label} - Concluído em ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    logger.error(`❌ ${label} - Falhou após ${duration.toFixed(2)}ms`, error as Error);
    throw error;
  }
}

/**
 * Cria logger com contexto específico
 */
export function createContextLogger(defaultContext: Record<string, any>) {
  return {
    debug: (message: string, context?: Record<string, any>) =>
      logger.debug(message, { ...defaultContext, ...context }),
    
    info: (message: string, context?: Record<string, any>) =>
      logger.info(message, { ...defaultContext, ...context }),
    
    warn: (message: string, context?: Record<string, any>) =>
      logger.warn(message, { ...defaultContext, ...context }),
    
    error: (message: string, error?: Error, context?: Record<string, any>) =>
      logger.error(message, error, { ...defaultContext, ...context }),
    
    fatal: (message: string, error?: Error, context?: Record<string, any>) =>
      logger.fatal(message, error, { ...defaultContext, ...context }),
  };
}

// =============================================================================
// INTEGRAÇÃO COM AUDITORIA
// =============================================================================

/**
 * Log de auditoria para conformidade LGPD
 * Integra com auditService
 */
export function auditLog(
  action: string,
  entityType: string,
  entityId: string,
  userId?: string,
  metadata?: Record<string, any>
): void {
  logger.info(`[AUDIT] ${action} on ${entityType}:${entityId}`, {
    action,
    entityType,
    entityId,
    userId,
    metadata,
    auditType: 'LGPD_COMPLIANCE',
  });
  
  // Aqui você pode integrar com auditService
  // auditService.log(action, entityType, entityId, metadata);
}

// =============================================================================
// EXPORTS
// =============================================================================

export default logger;

export {
  Logger,
  type LogEntry,
  type LogLevel,
  type LoggerConfig,
};

