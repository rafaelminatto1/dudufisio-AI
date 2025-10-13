import * as Sentry from '@sentry/react';

// Inicializar Sentry o mais cedo possível
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN || "https://00acd94c013b372a7c8c8f6d512171ab@o4510069182955520.ingest.us.sentry.io/4510069190295552",
  
  // Enviar informações padrão de PII (IP address automático)
  sendDefaultPii: true,
  
  // Performance Monitoring
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  
  // Performance - 100% das transações em produção
  tracesSampleRate: 1.0,
  
  // Session Replay
  replaysSessionSampleRate: 0.1, // 10% das sessões normais
  replaysOnErrorSampleRate: 1.0, // 100% quando há erro
  
  // Environment
  environment: import.meta.env.MODE || 'production',
  
  // Release tracking (útil para rastrear em qual versão o erro ocorreu)
  release: `dudufisio-ai@${import.meta.env.VITE_APP_VERSION || '1.0.0'}`,
  
  // Filtros inteligentes
  beforeSend(event, hint) {
    // Em desenvolvimento, apenas log no console (não enviar)
    if (import.meta.env.DEV) {
      console.warn('🐛 [Sentry DEV]', event);
      return null;
    }
    return event;
  },
  
  // Ignorar erros conhecidos que não são críticos
  ignoreErrors: [
    // Erros do browser
    'ResizeObserver loop limit exceeded',
    'ResizeObserver loop completed with undelivered notifications',
    'Non-Error promise rejection captured',
    
    // Network errors temporários
    'NetworkError',
    'Failed to fetch',
    
    // Erros de extensões do browser
    'chrome-extension://',
    'moz-extension://',
    'safari-extension://',
    
    // Erros conhecidos do React
    'Minified React error',
  ],
  
  // Habilitar debug apenas em desenvolvimento
  debug: import.meta.env.DEV,
  
  // Sampling inteligente para não estourar quota
  enableTracing: true,
});

// Export named e default para compatibilidade
export { Sentry };
export default Sentry;
