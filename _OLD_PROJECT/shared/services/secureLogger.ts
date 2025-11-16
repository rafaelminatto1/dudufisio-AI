/**
 * Secure Logger - Sistema de Logging Estruturado
 * 
 * Substitui console.log com logging seguro que:
 * - Não expõe PII (Personally Identifiable Information)
 * - Sanitiza dados sensíveis automaticamente
 * - Suporta diferentes níveis de log
 * - Integra com Sentry em produção
 */

import * as Sentry from '@sentry/react';

// Tipos de dados sensíveis que devem ser sanitizados
const SENSITIVE_FIELDS = [
  'password',
  'senha',
  'token',
  'apiKey',
  'api_key',
  'secret',
  'cpf',
  'rg',
  'email',
  'phone',
  'telefone',
  'credential',
  'authorization',
];

// Tipos de log
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  patientId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: unknown;
}

/**
 * Sanitiza dados sensíveis antes de logar
 */
function sanitizeData(data: unknown): unknown {
  if (data === null || data === undefined) {
    return data;
  }

  if (typeof data === 'string') {
    return sanitizeString(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }

  if (typeof data === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      // Verificar se a chave é sensível
      const isSensitive = SENSITIVE_FIELDS.some(field => 
        key.toLowerCase().includes(field.toLowerCase())
      );

      if (isSensitive) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = sanitizeData(value);
      }
    }
    return sanitized;
  }

  return data;
}

/**
 * Sanitiza strings que podem conter dados sensíveis
 */
function sanitizeString(str: string): string {
  // Redact CPF (xxx.xxx.xxx-xx)
  str = str.replace(/\d{3}\.\d{3}\.\d{3}-\d{2}/g, '***.***.***-**');
  
  // Redact email parcialmente (mantém domínio para debug)
  str = str.replace(/([a-zA-Z0-9._-]+)@([a-zA-Z0-9._-]+)/g, '***@$2');
  
  // Redact phone numbers
  str = str.replace(/\(\d{2}\)\s?\d{4,5}-?\d{4}/g, '(**) ****-****');
  str = str.replace(/\+\d{2}\s?\d{2}\s?\d{4,5}-?\d{4}/g, '+** ** ****-****');
  
  // Redact API keys (Google, OpenAI, etc)
  str = str.replace(/AIzaSy[a-zA-Z0-9_-]{33}/g, 'AIzaSy***[REDACTED]');
  str = str.replace(/sk-[a-zA-Z0-9]{32,}/g, 'sk-***[REDACTED]');
  
  // Redact JWTs
  str = str.replace(/eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+/g, 'eyJ***[REDACTED]');
  
  return str;
}

/**
 * Formata mensagem de log com timestamp e contexto
 */
function formatLogMessage(
  level: LogLevel,
  message: string,
  context?: LogContext
): string {
  const timestamp = new Date().toISOString();
  const ctx = context ? ` [${context.component || 'App'}]` : '';
  const lvl = level.toUpperCase().padEnd(5);
  
  return `[${timestamp}] ${lvl}${ctx} ${message}`;
}

/**
 * Log levels em ordem de prioridade
 */
const LOG_LEVELS = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
} as const;

type LogLevelName = keyof typeof LOG_LEVELS;

/**
 * Obtém o log level configurado
 * Prioridade: localStorage > variável de ambiente > padrão
 */
const getConfiguredLogLevel = (): LogLevelName => {
  const isProduction = import.meta.env.PROD || false;

  // Em produção, sempre apenas errors
  if (isProduction) {
    return 'error';
  }

  // Verificar localStorage para override temporário
  if (typeof window !== 'undefined') {
    const localStorageLevel = localStorage.getItem('logLevel') as LogLevelName;
    if (localStorageLevel && localStorageLevel in LOG_LEVELS) {
      return localStorageLevel;
    }
  }

  // Verificar variável de ambiente
  const envLevel = import.meta.env.VITE_LOG_LEVEL as LogLevelName;
  if (envLevel && envLevel in LOG_LEVELS) {
    return envLevel;
  }

  // Padrão: warn em desenvolvimento
  return 'warn';
};

/**
 * Verifica se deve logar baseado no nível
 */
const shouldLog = (level: LogLevel): boolean => {
  const configuredLevel = getConfiguredLogLevel();
  const configuredPriority = LOG_LEVELS[configuredLevel];
  const messagePriority = LOG_LEVELS[level];

  // Só loga se a prioridade da mensagem for <= a configurada
  return messagePriority <= configuredPriority;
};

/**
 * Classe principal do Secure Logger
 */
export class SecureLogger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = import.meta.env.DEV || false;
    this.isProduction = import.meta.env.PROD || false;
  }

  /**
   * Log de debug (apenas em desenvolvimento)
   */
  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return;

    const formattedMessage = formatLogMessage('debug', message, context);
    const sanitizedContext = context ? sanitizeData(context) : undefined;

    console.log(formattedMessage, sanitizedContext);
  }

  /**
   * Log informativo
   */
  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return;

    const formattedMessage = formatLogMessage('info', message, context);
    const sanitizedContext = context ? sanitizeData(context) : undefined;

    if (this.isDevelopment) {
      console.log(formattedMessage, sanitizedContext);
    }

    // Em produção, apenas envia para Sentry como breadcrumb
    if (this.isProduction) {
      Sentry.addBreadcrumb({
        message: sanitizeString(message),
        level: 'info',
        data: sanitizedContext as Record<string, unknown>,
      });
    }
  }

  /**
   * Log de warning
   */
  warn(message: string, context?: LogContext): void {
    const formattedMessage = formatLogMessage('warn', message, context);
    const sanitizedContext = context ? sanitizeData(context) : undefined;

    console.warn(formattedMessage, sanitizedContext);

    if (this.isProduction) {
      Sentry.captureMessage(sanitizeString(message), {
        level: 'warning',
        contexts: {
          context: sanitizedContext as Record<string, unknown>,
        },
      });
    }
  }

  /**
   * Log de erro
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const formattedMessage = formatLogMessage('error', message, context);
    const sanitizedContext = context ? sanitizeData(context) : undefined;

    console.error(formattedMessage, error, sanitizedContext);

    if (this.isProduction) {
      if (error instanceof Error) {
        Sentry.captureException(error, {
          contexts: {
            context: sanitizedContext as Record<string, unknown>,
          },
          tags: {
            component: context?.component || 'unknown',
          },
        });
      } else {
        Sentry.captureMessage(sanitizeString(message), {
          level: 'error',
          contexts: {
            context: sanitizedContext as Record<string, unknown>,
          },
        });
      }
    }
  }

  /**
   * Log de operação crítica (sempre loga, mesmo em produção)
   */
  critical(message: string, context?: LogContext): void {
    const formattedMessage = formatLogMessage('error', `CRITICAL: ${message}`, context);
    const sanitizedContext = context ? sanitizeData(context) : undefined;

    console.error(formattedMessage, sanitizedContext);

    Sentry.captureMessage(sanitizeString(message), {
      level: 'fatal',
      contexts: {
        context: sanitizedContext as Record<string, unknown>,
      },
    });
  }

  /**
   * Log de auditoria (para compliance LGPD)
   */
  audit(action: string, context: LogContext): void {
    const sanitizedContext = sanitizeData(context);
    const message = `AUDIT: ${action}`;
    
    // Sempre loga operações de auditoria
    console.log(formatLogMessage('info', message, context), sanitizedContext);

    // Enviar para sistema de auditoria (Sentry + Database)
    if (this.isProduction) {
      Sentry.addBreadcrumb({
        category: 'audit',
        message: sanitizeString(action),
        level: 'info',
        data: sanitizedContext as Record<string, unknown>,
      });

      // TODO: Salvar no banco de dados para compliance LGPD
      // await auditService.log({ action, context: sanitizedContext });
    }
  }

  /**
   * Helper para logar performance
   */
  performance(operation: string, durationMs: number, threshold?: number): void {
    const message = `Performance: ${operation} took ${durationMs}ms`;
    
    if (threshold && durationMs > threshold) {
      this.warn(message, { operation, durationMs, threshold });
    } else {
      this.debug(message, { operation, durationMs });
    }
  }
}

// Singleton instance
export const secureLogger = new SecureLogger();

// Export para compatibilidade com logger existente
export const logger = secureLogger;

// Helpers para uso direto
export const log = {
  debug: (msg: string, ctx?: LogContext) => secureLogger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => secureLogger.info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => secureLogger.warn(msg, ctx),
  error: (msg: string, err?: Error | unknown, ctx?: LogContext) => secureLogger.error(msg, err, ctx),
  audit: (action: string, ctx: LogContext) => secureLogger.audit(action, ctx),
};

export default secureLogger;

