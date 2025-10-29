/* eslint-disable no-console */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogOptions {
  context?: string;
  data?: Record<string, unknown> | Error;
}

const isBrowser = typeof window !== 'undefined';
const isProduction = process.env.NODE_ENV === 'production';

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
  // Em produção, sempre apenas errors
  if (isProduction) {
    return 'error';
  }

  // Verificar localStorage para override temporário
  if (isBrowser) {
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

const normalizeData = (data: LogOptions['data']): unknown => {
  if (!data) {
    return undefined;
  }

  if (data instanceof Error) {
    return {
      name: data.name,
      message: data.message,
      stack: data.stack,
    };
  }

  return data;
};

const shouldLog = (level: LogLevel): boolean => {
  if (!isBrowser) {
    return true;
  }

  const configuredLevel = getConfiguredLogLevel();
  const configuredPriority = LOG_LEVELS[configuredLevel];
  const messagePriority = LOG_LEVELS[level];

  // Só loga se a prioridade da mensagem for <= a configurada
  return messagePriority <= configuredPriority;
};

const formatPrefix = (level: LogLevel, context?: string): string => {
  const base = `[${level.toUpperCase()}]`;
  return context ? `${base} [${context}]` : base;
};

const logWithLevel = (
  level: LogLevel,
  message: string,
  options?: LogOptions,
): void => {
  if (!shouldLog(level)) {
    return;
  }

  const payload = normalizeData(options?.data);
  const prefix = formatPrefix(level, options?.context);

  switch (level) {
    case 'debug':
      console.debug(prefix, message, payload);
      break;
    case 'info':
      console.info(prefix, message, payload);
      break;
    case 'warn':
      console.warn(prefix, message, payload);
      break;
    case 'error':
    default:
      console.error(prefix, message, payload);
  }
};

export const logger = {
  debug(message: string, options?: LogOptions) {
    logWithLevel('debug', message, options);
  },
  info(message: string, options?: LogOptions) {
    logWithLevel('info', message, options);
  },
  warn(message: string, options?: LogOptions) {
    logWithLevel('warn', message, options);
  },
  error(message: string, options?: LogOptions) {
    logWithLevel('error', message, options);
  },
  performance(id: string, duration: number, thresholdMs = 50) {
    if (duration <= thresholdMs) {
      return;
    }

    logWithLevel('warn', `Performance issue detected: ${duration.toFixed(2)}ms`, {
      context: id,
    });
  },
};

export type Logger = typeof logger;

