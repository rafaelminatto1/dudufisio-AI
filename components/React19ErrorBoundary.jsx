import React, { Component } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
/**
 * React 19 Error Boundary
 *
 * Este componente utiliza a nova API de Error Boundaries do React 19
 * que agora suporta captura de erros assíncronos e melhor tratamento de erros.
 */
export class React19ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.resetTimeoutId = null;
        this.resetError = () => {
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorId: ''
            });
        };
        this.reportError = (error, errorInfo) => {
            // Aqui você pode integrar com serviços como Sentry, LogRocket, etc.
            const errorReport = {
                message: error.message,
                stack: error.stack,
                componentStack: errorInfo.componentStack,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                errorId: this.state.errorId
            };
            // Exemplo de envio para serviço de monitoramento
            if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
                fetch('/api/error-reporting', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(errorReport)
                }).catch(reportError => {
                    console.error('Falha ao reportar erro:', reportError);
                });
            }
        };
        this.handleRetry = () => {
            this.resetError();
        };
        this.handleGoHome = () => {
            window.location.href = '/';
        };
        this.handleReload = () => {
            window.location.reload();
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorId: ''
        };
    }
    static getDerivedStateFromError(error) {
        // Atualiza o state para mostrar a UI de erro
        return {
            hasError: true,
            error,
            errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
    }
    componentDidCatch(error, errorInfo) {
        // Log do erro
        console.error('ErrorBoundary capturou um erro:', error, errorInfo);
        this.setState({
            error,
            errorInfo
        });
        // Callback personalizado para tratamento de erro
        this.props.onError?.(error, errorInfo);
        // Enviar erro para serviço de monitoramento (ex: Sentry)
        this.reportError(error, errorInfo);
    }
    componentDidUpdate(prevProps) {
        const { resetKeys, resetOnPropsChange } = this.props;
        const { hasError } = this.state;
        // Reset do erro se as props mudaram
        if (hasError && prevProps.resetKeys !== resetKeys) {
            if (resetOnPropsChange && this.shouldResetError(prevProps.resetKeys, resetKeys)) {
                this.resetError();
            }
        }
    }
    componentWillUnmount() {
        if (this.resetTimeoutId) {
            clearTimeout(this.resetTimeoutId);
        }
    }
    shouldResetError(prevResetKeys, nextResetKeys) {
        if (!prevResetKeys || !nextResetKeys)
            return false;
        if (prevResetKeys.length !== nextResetKeys.length)
            return true;
        return prevResetKeys.some((key, index) => key !== nextResetKeys[index]);
    }
    render() {
        if (this.state.hasError) {
            // Renderizar fallback customizado se fornecido
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // UI de erro padrão
            return (<div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-red-600"/>
              </div>
              <CardTitle className="text-2xl text-gray-900">
                Ops! Algo deu errado
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center text-gray-600">
                <p className="mb-4">
                  Encontramos um erro inesperado. Nossa equipe foi notificada e está trabalhando para resolver o problema.
                </p>
                <p className="text-sm text-gray-500">
                  ID do erro: {this.state.errorId}
                </p>
              </div>

              {/* Detalhes do erro em desenvolvimento */}
              {process.env.NODE_ENV === 'development' && this.state.error && (<details className="bg-gray-100 p-4 rounded-lg">
                  <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                    <Bug className="w-4 h-4 inline mr-2"/>
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Erro:</strong>
                      <pre className="text-sm text-red-600 mt-1 overflow-auto">
                        {this.state.error.message}
                      </pre>
                    </div>
                    {this.state.error.stack && (<div>
                        <strong>Stack trace:</strong>
                        <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-32">
                          {this.state.error.stack}
                        </pre>
                      </div>)}
                    {this.state.errorInfo?.componentStack && (<div>
                        <strong>Component stack:</strong>
                        <pre className="text-xs text-gray-600 mt-1 overflow-auto max-h-32">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>)}
                  </div>
                </details>)}

              {/* Ações */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4"/>
                  Tentar novamente
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="w-4 h-4"/>
                  Ir para início
                </Button>
                <Button variant="outline" onClick={this.handleReload} className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4"/>
                  Recarregar página
                </Button>
              </div>

              {/* Informações de contato */}
              <div className="text-center text-sm text-gray-500 pt-4 border-t">
                <p>
                  Se o problema persistir, entre em contato conosco em{' '}
                  <a href="mailto:suporte@dudufisio-ai.com" className="text-blue-600 hover:underline">
                    suporte@dudufisio-ai.com
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>);
        }
        return this.props.children;
    }
}
/**
 * Hook para capturar erros em componentes funcionais
 */
export function useErrorHandler() {
    const handleError = (error, errorInfo) => {
        console.error('Erro capturado pelo hook:', error, errorInfo);
        // Aqui você pode implementar lógica adicional de tratamento de erro
        // como enviar para serviços de monitoramento, mostrar notificações, etc.
    };
    return { handleError };
}
/**
 * Componente de Error Boundary específico para formulários
 */
export function FormErrorBoundary({ children }) {
    return (<React19ErrorBoundary fallback={<div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600"/>
            <h3 className="text-lg font-medium text-red-800">
              Erro no formulário
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            Ocorreu um erro ao processar o formulário. Por favor, tente novamente.
          </p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Recarregar página
          </Button>
        </div>} onError={(error, errorInfo) => {
            console.error('Erro no formulário:', error, errorInfo);
        }}>
      {children}
    </React19ErrorBoundary>);
}
/**
 * Componente de Error Boundary específico para dashboards
 */
export function DashboardErrorBoundary({ children }) {
    return (<React19ErrorBoundary fallback={<div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4"/>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Erro no Dashboard
          </h2>
          <p className="text-gray-600 mb-4">
            Não foi possível carregar algumas informações do dashboard.
          </p>
          <Button onClick={() => window.location.reload()}>
            Recarregar
          </Button>
        </div>} resetKeys={[window.location.pathname]} resetOnPropsChange={true}>
      {children}
    </React19ErrorBoundary>);
}
/**
 * Componente de Error Boundary específico para teleconsulta
 */
export function TeleconsultaErrorBoundary({ children }) {
    return (<React19ErrorBoundary fallback={<div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-red-600"/>
            <h3 className="text-lg font-medium text-red-800">
              Erro na Teleconsulta
            </h3>
          </div>
          <p className="text-red-700 mb-4">
            Ocorreu um erro na conexão de vídeo. Verifique sua conexão com a internet e tente novamente.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => window.location.reload()} variant="outline" size="sm">
              Reconectar
            </Button>
            <Button onClick={() => window.location.href = '/dashboard'} size="sm">
              Voltar ao Dashboard
            </Button>
          </div>
        </div>}>
      {children}
    </React19ErrorBoundary>);
}
