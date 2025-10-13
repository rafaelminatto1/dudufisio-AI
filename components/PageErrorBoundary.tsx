import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
  pageName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class PageErrorBoundaryClass extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`💥 Error in page ${this.props.pageName || 'Unknown'}:`, error);
    console.error('📍 Component Stack:', errorInfo.componentStack);

    // Log específico para erro de Context
    if (error.message.includes('useContext') || error.message.includes('Cannot read properties of null')) {
      console.error('🔴 ERRO DE CONTEXT: A página está tentando usar um Context fora do Provider');
      console.error('Verifique se todos os Contexts necessários estão sendo fornecidos');
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50 p-4">
          <div className="max-w-2xl w-full bg-white rounded-lg shadow-xl p-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>

              <div className="flex-1">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">
                  Algo deu errado
                </h1>

                <p className="text-slate-600 mb-4">
                  Desculpe, encontramos um problema ao carregar esta página.
                </p>

                {this.props.pageName && (
                  <div className="mb-4 p-3 bg-slate-100 rounded">
                    <p className="text-sm text-slate-700">
                      <strong>Página:</strong> {this.props.pageName}
                    </p>
                  </div>
                )}

                <div className="mb-6">
                  <details className="text-left bg-slate-50 p-4 rounded text-xs">
                    <summary className="cursor-pointer font-semibold text-slate-700 mb-2">
                      ▶ Detalhes técnicos (clique para expandir)
                    </summary>
                    <div className="mt-2 space-y-2">
                      <div>
                        <strong className="text-red-600">Erro:</strong>
                        <pre className="mt-1 text-slate-600 overflow-auto whitespace-pre-wrap">
                          {this.state.error?.message || 'Erro desconhecido'}
                        </pre>
                      </div>
                      {this.state.error?.stack && (
                        <div>
                          <strong className="text-red-600">Stack:</strong>
                          <pre className="mt-1 text-slate-600 overflow-auto whitespace-pre-wrap text-[10px]">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo?.componentStack && (
                        <div>
                          <strong className="text-red-600">Component Stack:</strong>
                          <pre className="mt-1 text-slate-600 overflow-auto whitespace-pre-wrap text-[10px]">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-slate-700 mb-3">O que você pode fazer:</p>

                  <button
                    onClick={() => window.history.back()}
                    className="w-full px-4 py-3 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Voltar para página anterior</span>
                  </button>

                  <button
                    onClick={() => window.location.href = '/'}
                    className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                    <span>Ir para Dashboard</span>
                  </button>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full px-4 py-2 border-2 border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors font-semibold flex items-center justify-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Recarregar Página</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper funcional para usar com React Router
export const PageErrorBoundary: React.FC<Props> = ({ children, pageName }) => {
  return (
    <PageErrorBoundaryClass pageName={pageName}>
      {children}
    </PageErrorBoundaryClass>
  );
};

export default PageErrorBoundary;
