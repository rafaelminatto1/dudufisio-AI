/**
 * Configuração do Sentry para Monitoramento de Erros
 * 
 * @see https://docs.sentry.io/platforms/javascript/guides/react/
 */

import * as Sentry from "@sentry/react";

// =============================================================================
// TIPOS
// =============================================================================

interface SentryConfig {
  dsn: string;
  environment: string;
  enabled: boolean;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

interface SentryUser {
  id: string;
  email?: string;
  username?: string;
  role?: string;
}

// =============================================================================
// CONFIGURAÇÃO
// =============================================================================

const SENTRY_CONFIG: SentryConfig = {
  dsn: import.meta.env.VITE_SENTRY_DSN || '',
  environment: import.meta.env.MODE || 'development',
  enabled: import.meta.env.MODE === 'production' && !!import.meta.env.VITE_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% das transações
  replaysSessionSampleRate: 0.1, // 10% das sessões
  replaysOnErrorSampleRate: 1.0, // 100% quando há erro
};

// =============================================================================
// INICIALIZAÇÃO
// =============================================================================

/**
 * Inicializa o Sentry
 */
export function initSentry() {
  if (!SENTRY_CONFIG.enabled) {
    console.log('🔍 Sentry: Desabilitado (modo desenvolvimento ou DSN não configurado)');
    return;
  }

  Sentry.init({
    dsn: SENTRY_CONFIG.dsn,
    environment: SENTRY_CONFIG.environment,
    
    // Integrations
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    tracesSampleRate: SENTRY_CONFIG.tracesSampleRate,

    // Session Replay
    replaysSessionSampleRate: SENTRY_CONFIG.replaysSessionSampleRate,
    replaysOnErrorSampleRate: SENTRY_CONFIG.replaysOnErrorSampleRate,

    // Filtragem de erros
    beforeSend(event, hint) {
      // Não enviar erros de desenvolvimento
      if (SENTRY_CONFIG.environment === 'development') {
        return null;
      }

      // Filtrar erros de extensões do navegador
      if (event.exception) {
        const values = event.exception.values || [];
        for (const value of values) {
          if (value.value?.includes('chrome-extension://') || 
              value.value?.includes('moz-extension://')) {
            return null;
          }
        }
      }

      // Adicionar contexto adicional
      event.tags = {
        ...event.tags,
        'app.version': import.meta.env.VITE_APP_VERSION || '1.0.0',
        'app.name': 'DuduFisio-AI'
      };

      return event;
    },

    // Ignorar erros conhecidos/esperados
    ignoreErrors: [
      // Erros do navegador
      'ResizeObserver loop limit exceeded',
      'Non-Error promise rejection captured',
      
      // Erros de rede comuns
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      
      // Erros de cancelamento
      'AbortError',
      'Request aborted',
    ],
  });

  console.log('✅ Sentry: Inicializado com sucesso');
}

// =============================================================================
// UTILITÁRIOS
// =============================================================================

/**
 * Define o usuário atual no Sentry
 */
export function setSentryUser(user: SentryUser) {
  if (!SENTRY_CONFIG.enabled) return;

  Sentry.setUser({
    id: user.id,
    email: user.email,
    username: user.username,
    role: user.role,
  });
}

/**
 * Limpa o usuário do Sentry (logout)
 */
export function clearSentryUser() {
  if (!SENTRY_CONFIG.enabled) return;
  Sentry.setUser(null);
}

/**
 * Captura exceção manualmente
 */
export function captureSentryException(error: Error, context?: Record<string, any>) {
  if (!SENTRY_CONFIG.enabled) {
    console.error('Sentry (mock):', error, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureException(error);
  });
}

/**
 * Captura mensagem manualmente
 */
export function captureSentryMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: Record<string, any>) {
  if (!SENTRY_CONFIG.enabled) {
    console.log(`Sentry (mock) [${level}]:`, message, context);
    return;
  }

  Sentry.withScope((scope) => {
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
    }
    Sentry.captureMessage(message, level);
  });
}

/**
 * Adiciona breadcrumb (rastro de eventos)
 */
export function addSentryBreadcrumb(
  message: string, 
  category: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>
) {
  if (!SENTRY_CONFIG.enabled) return;

  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Adiciona tag ao escopo atual
 */
export function setSentryTag(key: string, value: string) {
  if (!SENTRY_CONFIG.enabled) return;
  Sentry.setTag(key, value);
}

/**
 * Adiciona contexto ao escopo atual
 */
export function setSentryContext(name: string, context: Record<string, any>) {
  if (!SENTRY_CONFIG.enabled) return;
  Sentry.setContext(name, context);
}

/**
 * Inicia transação para performance monitoring
 */
export function startSentryTransaction(name: string, operation: string) {
  if (!SENTRY_CONFIG.enabled) return null;
  
  return Sentry.startSpan({
    name,
    op: operation,
  }, () => {});
}

// =============================================================================
// INTEGRAÇÃO COM ERROR HANDLER
// =============================================================================

/**
 * Reporta erro ao Sentry com contexto do errorHandler
 */
export function reportErrorToSentry(
  error: Error,
  operation: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: Record<string, any>
) {
  if (!SENTRY_CONFIG.enabled) {
    console.log('Sentry (mock) - Error:', {
      error: error.message,
      operation,
      severity,
      context
    });
    return;
  }

  Sentry.withScope((scope) => {
    // Tags
    scope.setTag('operation', operation);
    scope.setTag('severity', severity);

    // Nível baseado na severidade
    const levelMap = {
      low: 'info' as const,
      medium: 'warning' as const,
      high: 'error' as const,
      critical: 'fatal' as const,
    };
    scope.setLevel(levelMap[severity]);

    // Contexto adicional
    if (context) {
      Object.keys(context).forEach((key) => {
        scope.setExtra(key, context[key]);
      });
    }

    // Capturar exceção
    Sentry.captureException(error);
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  init: initSentry,
  setUser: setSentryUser,
  clearUser: clearSentryUser,
  captureException: captureSentryException,
  captureMessage: captureSentryMessage,
  addBreadcrumb: addSentryBreadcrumb,
  setTag: setSentryTag,
  setContext: setSentryContext,
  startTransaction: startSentryTransaction,
  reportError: reportErrorToSentry,
};

