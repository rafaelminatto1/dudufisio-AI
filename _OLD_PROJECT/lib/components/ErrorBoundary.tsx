/**
 * ErrorBoundary Component - DuduFisio-AI
 * 
 * React Error Boundary para capturar e tratar erros em componentes.
 * Integrado com sistema de error handling.
 */

import React, { Component, ErrorInfo } from 'react';
import { handleError } from '../middleware/errorHandler';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log erro
    console.error('ErrorBoundary caught:', error, errorInfo);
    
    // Callback customizado
    this.props.onError?.(error, errorInfo);
    
    // Trata erro
    handleError(error, {
      showToast: true,
      logToConsole: true,
      rethrow: false,
    });
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Algo deu errado</h1>
            <p className="text-xl text-gray-600 mb-8">
              Ocorreu um erro inesperado. Por favor, recarregue a página.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}

export default ErrorBoundary;


