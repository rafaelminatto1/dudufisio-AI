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

