import * as Sentry from '@sentry/react';

if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    sendDefaultPii: true,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: import.meta.env.PROD ? 1.0 : 0,
    replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 0,
    replaysOnErrorSampleRate: import.meta.env.PROD ? 1.0 : 0,
    environment: import.meta.env.MODE || 'production',
    release: `dudufisio-ai@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
    debug: import.meta.env.DEV,
    beforeSend: import.meta.env.DEV ? () => null : undefined,
    ignoreErrors: [
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      'NetworkError',
      'Failed to fetch',
      'chrome-extension://',
    ],
    enableTracing: true,
  });
}

export { Sentry };
export default Sentry;
