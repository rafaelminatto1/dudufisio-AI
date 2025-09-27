/* eslint-disable no-console */
type ObservabilityCategory = 'security' | 'database' | 'application';

type LogLevel = 'info' | 'warn' | 'error' | 'debug';

type ObservabilityLogger = Record<LogLevel, (event: string, payload?: unknown) => void>;

const createLogger = (category: ObservabilityCategory): ObservabilityLogger => ({
  info: (event, payload) => {
    console.info(`[${category}] ${event}`, payload);
  },
  warn: (event, payload) => {
    console.warn(`[${category}] ${event}`, payload);
  },
  error: (event, payload) => {
    console.error(`[${category}] ${event}`, payload);
  },
  debug: (event, payload) => {
    console.debug(`[${category}] ${event}`, payload);
  },
});

export const observability = {
  security: createLogger('security'),
  database: createLogger('database'),
  application: createLogger('application'),
} as const;

