/**
 * 🛡️ PROVIDER ERROR BOUNDARY
 * 
 * Error boundary específico para capturar erros em providers React.
 * Permite recuperação granular e continuidade parcial da aplicação.
 * 
 * Features:
 * - Captura erros apenas em providers, não afeta toda aplicação
 * - UI de fallback informativa e amigável
 * - Recuperação automática (com limite)
 * - Telemetria detalhada para debugging
 * - Modo de desenvolvimento vs produção
 * 
 * @module ProviderErrorBoundary
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Info } from 'lucide-react';

const LOG_CONTEXT = 'ProviderErrorBoundary';

/**
 * Props do ErrorBoundary
 */
interface ProviderErrorBoundaryProps {
  /**
   * Componentes filhos a serem renderizados
   */
  children: ReactNode;
  
  /**
   * Nome do provider (para logging e UI)
   */
  providerName?: string;
  
  /**
   * Callback quando erro é capturado
   */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /**
   * Número máximo de tentativas de recuperação automática
   * @default 1
   */
  maxRecoveryAttempts?: number;
  
  /**
   * Componente de fallback customizado
   */
  fallback?: ReactNode;
}

/**
 * State do ErrorBoundary
 */
interface ProviderErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  recoveryAttempts: number;
  isRecovering: boolean;
}

/**
 * 🛡️ ProviderErrorBoundary
 * 
 * Captura erros em providers sem quebrar toda a aplicação.
 */
export class ProviderErrorBoundary extends Component<
  ProviderErrorBoundaryProps,
  ProviderErrorBoundaryState
> {
  private recoveryTimeout?: NodeJS.Timeout;

  constructor(props: ProviderErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      recoveryAttempts: 0,
      isRecovering: false,
    };
  }

  /**
   * Deriva state do erro capturado
   */
  static getDerivedStateFromError(error: Error): Partial<ProviderErrorBoundaryState> {
    return { 
      hasError: true, 
      error 
    };
  }

  /**
   * Lifecycle: Componente capturou erro
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    const { providerName = 'Unknown Provider', onError, maxRecoveryAttempts = 1 } = this.props;
    const { recoveryAttempts } = this.state;

    // Log detalhado do erro
    logger.error(`Erro capturado em ${providerName}`, {
      context: LOG_CONTEXT,
      data: {
        providerName,
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack,
        },
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
        recoveryAttempts,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
    });

    // Atualizar state com errorInfo
    this.setState({ errorInfo });

    // Callback customizado
    if (onError) {
      try {
        onError(error, errorInfo);
      } catch (callbackError) {
        logger.error('Erro ao executar callback onError', {
          context: LOG_CONTEXT,
          data: { callbackError },
        });
      }
    }

    // Tentar recuperação automática se ainda há tentativas
    if (recoveryAttempts < maxRecoveryAttempts) {
      this.attemptRecovery();
    }

    // Enviar para Sentry (se disponível)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      try {
        (window as any).Sentry.captureException(error, {
          contexts: {
            react: {
              componentStack: errorInfo.componentStack,
            },
          },
          tags: {
            errorBoundary: 'ProviderErrorBoundary',
            providerName,
          },
        });
      } catch (sentryError) {
        logger.error('Erro ao enviar para Sentry', {
          context: LOG_CONTEXT,
          data: { sentryError },
        });
      }
    }
  }

  /**
   * Lifecycle: Limpeza antes de desmontar
   */
  componentWillUnmount(): void {
    if (this.recoveryTimeout) {
      clearTimeout(this.recoveryTimeout);
    }
  }

  /**
   * Tentar recuperação automática
   */
  private attemptRecovery = (): void => {
    const { providerName = 'Provider' } = this.props;
    
    this.setState({ isRecovering: true });
    
    logger.info(`Tentando recuperação automática de ${providerName}...`, {
      context: LOG_CONTEXT,
      data: { attempt: this.state.recoveryAttempts + 1 },
    });

    // Aguardar 2 segundos antes de tentar recuperar
    this.recoveryTimeout = setTimeout(() => {
      this.setState((prevState) => ({
        hasError: false,
        error: undefined,
        errorInfo: undefined,
        recoveryAttempts: prevState.recoveryAttempts + 1,
        isRecovering: false,
      }));

      logger.info(`Recuperação de ${providerName} concluída`, {
        context: LOG_CONTEXT,
      });
    }, 2000);
  };

  /**
   * Handler para recarregar página manualmente
   */
  private handleReload = (): void => {
    logger.info('Usuário solicitou reload da página', { context: LOG_CONTEXT });
    window.location.reload();
  };

  /**
   * Handler para limpar cache e recarregar
   */
  private handleClearCacheAndReload = async (): Promise<void> => {
    logger.info('Usuário solicitou limpeza de cache e reload', { context: LOG_CONTEXT });
    
    try {
      // Limpar localStorage
      localStorage.clear();
      
      // Limpar sessionStorage
      sessionStorage.clear();
      
      // Limpar cache do service worker (se disponível)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
      }
      
      // Desregistrar service workers
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
      }
      
      logger.info('Cache limpo com sucesso', { context: LOG_CONTEXT });
    } catch (error) {
      logger.error('Erro ao limpar cache', { context: LOG_CONTEXT, data: { error } });
    } finally {
      // Recarregar mesmo se houver erro na limpeza
      window.location.reload();
    }
  };

  /**
   * Handler para tentar novamente (reset do error boundary)
   */
  private handleTryAgain = (): void => {
    logger.info('Usuário solicitou nova tentativa', { context: LOG_CONTEXT });
    
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      recoveryAttempts: 0,
      isRecovering: false,
    });
  };

  /**
   * Renderizar UI
   */
  render(): ReactNode {
    const { hasError, error, errorInfo, isRecovering } = this.state;
    const { children, fallback, providerName = 'Provider' } = this.props;

    // Sem erro: renderizar filhos normalmente
    if (!hasError) {
      return children;
    }

    // Recuperando: mostrar loader
    if (isRecovering) {
      return (
        <div className="flex min-h-[200px] items-center justify-center bg-blue-50 dark:bg-blue-950 rounded-lg p-8">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Tentando recuperar {providerName}...
            </p>
          </div>
        </div>
      );
    }

    // Erro: usar fallback customizado se fornecido
    if (fallback) {
      return fallback;
    }

    // Erro: renderizar UI padrão de erro
    const isDev = import.meta.env.DEV;

    return (
      <div className="min-h-[300px] flex items-center justify-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 md:p-8">
            {/* Ícone e Título */}
            <div className="flex items-start gap-4 mb-6">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                  Erro no {providerName}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Um erro inesperado ocorreu ao inicializar este componente. 
                  Você pode tentar novamente ou recarregar a página.
                </p>
              </div>
            </div>

            {/* Mensagem de Erro */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-1">
                  Mensagem de erro:
                </p>
                <p className="text-sm text-red-700 dark:text-red-300 font-mono">
                  {error.message || 'Erro desconhecido'}
                </p>
              </div>
            )}

            {/* Detalhes Técnicos (apenas em dev) */}
            {isDev && errorInfo && (
              <details className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
                <summary className="cursor-pointer font-medium text-sm text-gray-700 dark:text-gray-300 mb-2">
                  <Info className="inline w-4 h-4 mr-1" />
                  Detalhes técnicos (modo desenvolvimento)
                </summary>
                <div className="mt-3 space-y-3">
                  {error?.stack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Stack Trace:
                      </p>
                      <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-600 max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo.componentStack && (
                    <div>
                      <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                        Component Stack:
                      </p>
                      <pre className="text-xs overflow-auto bg-gray-100 dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-600 max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Ações */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={this.handleTryAgain}
                className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Tentar Novamente
              </button>
              
              <button
                onClick={this.handleReload}
                className="flex-1 px-4 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 font-medium rounded-lg transition-colors"
              >
                Recarregar Página
              </button>
              
              <button
                onClick={this.handleClearCacheAndReload}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
              >
                Limpar Cache
              </button>
            </div>

            {/* Informação Adicional */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Se o problema persistir, entre em contato com o suporte técnico.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

/**
 * Export padrão
 */
export default ProviderErrorBoundary;

