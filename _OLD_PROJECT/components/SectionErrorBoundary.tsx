import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  sectionName: string;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary granular para seções específicas da aplicação
 * Permite recuperação de erros sem afetar toda a aplicação
 */
export class SectionErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualizar estado para mostrar fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para analytics/monitoring
    console.error(`❌ [ERROR BOUNDARY] Erro na seção "${this.props.sectionName}":`, error);
    console.error('📍 [ERROR BOUNDARY] Component stack:', errorInfo.componentStack);
    
    // Callback customizado para logging externo
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Enviar para serviço de monitoring (quando implementado)
    this.logErrorToService(error, errorInfo);

    this.setState({ error, errorInfo });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // TODO: Integrar com serviço de monitoring (Sentry, LogRocket, etc.)
    if (typeof window !== 'undefined' && (window as any).__ERROR_TRACKING__) {
      try {
        (window as any).__ERROR_TRACKING__.captureException(error, {
          extra: {
            section: this.props.sectionName,
            componentStack: errorInfo.componentStack,
          },
        });
      } catch (trackingError) {
        console.error('❌ [ERROR BOUNDARY] Erro ao enviar para tracking:', trackingError);
      }
    }
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Usar fallback customizado se fornecido
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback padrão
      return (
        <div className="flex items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="max-w-md w-full text-center">
            <div className="mb-4">
              <svg
                className="w-12 h-12 text-red-500 mx-auto"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Erro em {this.props.sectionName}
            </h3>

            <p className="text-red-700 mb-4 text-sm">
              Ocorreu um erro nesta seção. As outras partes da aplicação continuam funcionando normalmente.
            </p>

            {this.state.error && (
              <details className="text-left mb-4 bg-white p-3 rounded border border-red-200">
                <summary className="cursor-pointer text-sm font-semibold text-red-800 mb-2">
                  Detalhes técnicos
                </summary>
                <div className="text-xs text-red-700 space-y-2">
                  <div>
                    <strong>Erro:</strong>
                    <pre className="mt-1 p-2 bg-red-50 rounded overflow-auto">
                      {this.state.error.message}
                    </pre>
                  </div>
                  {this.state.error.stack && (
                    <div>
                      <strong>Stack:</strong>
                      <pre className="mt-1 p-2 bg-red-50 rounded overflow-auto max-h-32">
                        {this.state.error.stack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={this.handleReset}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold text-sm"
              >
                Tentar Novamente
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors text-sm"
              >
                Recarregar Página
              </button>
            </div>

            <p className="text-xs text-red-600 mt-4">
              Se o problema persistir, entre em contato com o suporte.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default SectionErrorBoundary;

