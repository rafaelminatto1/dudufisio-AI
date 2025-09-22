
import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4">
            <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
                <AlertTriangle className="mx-auto h-16 w-16 text-red-400" />
                <h1 className="mt-4 text-2xl font-bold text-slate-800">Oops! Algo deu errado.</h1>
                <p className="mt-2 text-slate-600">
                    Nossa equipe foi notificada. Você pode tentar novamente ou recarregar a página.
                </p>
                <details className="mt-4 text-left bg-slate-50 p-3 rounded-lg text-xs text-slate-500">
                    <summary className="cursor-pointer font-medium">Detalhes do Erro</summary>
                    <pre className="mt-2 whitespace-pre-wrap">
                        {this.state.error?.toString()}
                    </pre>
                </details>
                <div className="mt-6 flex gap-2 justify-center">
                  <button
                      onClick={this.handleRetry}
                      className="inline-flex items-center justify-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                  >
                      Tentar Novamente
                  </button>
                  <button
                      onClick={() => window.location.reload()}
                      className="inline-flex items-center justify-center rounded-lg border border-transparent bg-teal-500 px-5 py-3 text-base font-medium text-white shadow-sm hover:bg-teal-600"
                  >
                      Recarregar Página
                  </button>
                </div>
            </div>
        </div>
      );
    }

    const { children } = this.props;
    return children;
  }
}

export default ErrorBoundary;