/**
 * ErrorBoundary Component
 * 
 * Componente de classe React para capturar erros não tratados na aplicação.
 * Fornece uma UI amigável quando ocorre um erro inesperado.
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Atualizar state para mostrar UI de fallback
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log do erro para monitoramento
    console.error('🔴 ErrorBoundary capturou erro:', error, errorInfo);
    
    // Aqui você pode enviar para serviço de monitoramento (Sentry, etc)
    if (import.meta.env.PROD) {
      // TODO: Enviar para serviço de monitoramento em produção
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Ops! Algo deu errado
            </h2>
            <p className="text-slate-600 mb-4">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-slate-100 p-3 rounded mb-4 overflow-auto max-h-40">
                {this.state.error.message}
              </pre>
            )}
            <Button
              onClick={() => window.location.reload()}
              className="w-full"
            >
              Recarregar Página
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
