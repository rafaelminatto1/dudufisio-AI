/**
 * 🚀 OPTIMIZED ERROR BOUNDARY
 *
 * Error boundary otimizado com retry, logging e fallback inteligente
 */
import React, { Component } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
class OptimizedErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.resetTimeout = null;
        this.handleReset = () => {
            if (this.resetTimeout) {
                clearTimeout(this.resetTimeout);
            }
            this.setState({
                hasError: false,
                error: null,
                errorInfo: null,
                errorCount: 0,
            });
        };
        this.handleReload = () => {
            window.location.reload();
        };
        this.handleGoHome = () => {
            window.location.href = '/';
        };
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            errorCount: 0,
            lastErrorTime: 0,
        };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error,
        };
    }
    componentDidCatch(error, errorInfo) {
        const now = Date.now();
        const timeSinceLastError = now - this.state.lastErrorTime;
        // Se múltiplos erros em sequência rápida, pode ser loop infinito
        const isErrorLoop = timeSinceLastError < 1000 && this.state.errorCount > 3;
        this.setState({
            errorInfo,
            errorCount: timeSinceLastError < 5000 ? this.state.errorCount + 1 : 1,
            lastErrorTime: now,
        });
        // Log do erro
        this.logError(error, errorInfo, isErrorLoop);
        // Callback customizado
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Auto-reset após 10s (se não for loop infinito)
        if (!isErrorLoop && this.props.level !== 'critical') {
            this.resetTimeout = setTimeout(() => {
                this.handleReset();
            }, 10000);
        }
    }
    componentDidUpdate(prevProps) {
        // Reset quando resetKeys mudarem
        if (this.props.resetKeys && prevProps.resetKeys) {
            const hasChanges = this.props.resetKeys.some((key, index) => key !== prevProps.resetKeys[index]);
            if (hasChanges && this.state.hasError) {
                this.handleReset();
            }
        }
    }
    componentWillUnmount() {
        if (this.resetTimeout) {
            clearTimeout(this.resetTimeout);
        }
    }
    logError(error, errorInfo, isErrorLoop) {
        const errorLog = {
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            level: this.props.level || 'component',
            isErrorLoop,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
        };
        // Em produção, enviar para serviço de logging
        if (process.env.NODE_ENV === 'production') {
            // Exemplo: Sentry, LogRocket, etc
            console.error('🚨 Error Boundary:', errorLog);
            // Aqui você pode enviar para seu serviço de logging
            // sendToErrorService(errorLog);
        }
        else {
            console.error('🚨 Error Boundary:', errorLog);
        }
    }
    render() {
        if (this.state.hasError) {
            // Usar fallback customizado se fornecido
            if (this.props.fallback) {
                return this.props.fallback;
            }
            const { error, errorInfo, errorCount } = this.state;
            const isErrorLoop = errorCount > 3;
            const isDev = process.env.NODE_ENV === 'development';
            const showDetails = this.props.showDetails ?? isDev;
            // UI baseada no nível do boundary
            return (<div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-600"/>
                </div>
                <div>
                  <CardTitle className="text-red-900">
                    {isErrorLoop
                    ? 'Erro Crítico Detectado'
                    : this.props.level === 'critical'
                        ? 'Erro Crítico'
                        : 'Algo deu errado'}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {isErrorLoop
                    ? 'Loop de erros detectado. A página precisa ser recarregada.'
                    : 'Encontramos um problema ao carregar esta parte da aplicação.'}
                  </p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Error message */}
              {error && showDetails && (<div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Bug className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0"/>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-red-900">Mensagem de erro:</p>
                      <p className="text-sm text-red-800 mt-1 break-words">
                        {error.message}
                      </p>
                    </div>
                  </div>

                  {errorInfo && (<details className="mt-3">
                      <summary className="text-sm text-red-700 cursor-pointer hover:text-red-900">
                        Ver stack trace
                      </summary>
                      <pre className="mt-2 text-xs text-red-800 overflow-auto max-h-40 p-2 bg-red-100 rounded">
                        {errorInfo.componentStack}
                      </pre>
                    </details>)}
                </div>)}

              {/* Error count warning */}
              {errorCount > 1 && !isErrorLoop && (<div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Este erro ocorreu {errorCount} vezes seguidas
                  </p>
                </div>)}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                {!isErrorLoop && this.props.level !== 'critical' && (<Button onClick={this.handleReset} className="flex-1">
                    <RefreshCw className="w-4 h-4 mr-2"/>
                    Tentar Novamente
                  </Button>)}

                <Button onClick={this.handleReload} variant="outline" className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2"/>
                  Recarregar Página
                </Button>

                {this.props.level !== 'critical' && (<Button onClick={this.handleGoHome} variant="outline" className="flex-1">
                    <Home className="w-4 h-4 mr-2"/>
                    Ir para Início
                  </Button>)}
              </div>

              {/* Help text */}
              <p className="text-xs text-gray-500 text-center pt-2">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </CardContent>
          </Card>
        </div>);
        }
        return this.props.children;
    }
}
export default OptimizedErrorBoundary;
/**
 * HOC para facilitar uso do Error Boundary
 */
export function withErrorBoundary(Component, errorBoundaryProps) {
    const WrappedComponent = (props) => (<OptimizedErrorBoundary {...errorBoundaryProps}>
      <Component {...props}/>
    </OptimizedErrorBoundary>);
    WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name || 'Component'})`;
    return WrappedComponent;
}
/**
 * Hook para usar error boundary programaticamente
 */
export function useErrorHandler() {
    const [error, setError] = React.useState(null);
    React.useEffect(() => {
        if (error) {
            throw error;
        }
    }, [error]);
    return setError;
}
