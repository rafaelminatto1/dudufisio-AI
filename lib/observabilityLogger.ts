/* eslint-disable no-console */
type ObservabilityCategory = 'security' | 'database' | 'application';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type ObservabilityLogger = Record<LogLevel, (event: string, payload?: unknown) => void>;

const createLogger = (category: ObservabilityCategory): ObservabilityLogger => ({
  info: (event, payload) => {
    // Only log info in development mode
    if (import.meta.env.DEV) {
      console.info(`[${category}] ${event}`, payload);
    }
  },
  warn: (event, payload) => {
    // Only log warnings in development mode
    if (import.meta.env.DEV) {
      console.warn(`[${category}] ${event}`, payload);
    }
  },
  error: (event, payload) => {
    // Always log errors, but reduce noise for known issues
    const shouldLog = !event.includes('supabase.credentials.missing') || import.meta.env.DEV;
    if (shouldLog) {
      console.error(`[${category}] ${event}`, payload);
    }
  },
  debug: (event, payload) => {
    // Only log debug in development mode
    if (import.meta.env.DEV) {
      console.debug(`[${category}] ${event}`, payload);
    }
  },
});

export const observability = {
  security: createLogger('security'),
  database: createLogger('database'),
  application: createLogger('application'),
  config: {
    load: (event: string, payload?: unknown) => console.info(`[config] ${event}`, payload),
    error: (event: string, payload?: unknown) => console.error(`[config] ${event}`, payload),
    validate: (event: string, payload?: unknown) => console.info(`[config] ${event}`, payload),
  },
  setup: {
    start: (event: string, payload?: unknown) => console.info(`[setup] ${event}`, payload),
    warn: (event: string, payload?: unknown) => console.warn(`[setup] ${event}`, payload),
    success: (event: string, payload?: unknown) => console.info(`[setup] ${event}`, payload),
    error: (event: string, payload?: unknown) => console.error(`[setup] ${event}`, payload),
  },
} as const;

