import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * Error Boundary Component
 * 
 * Captura erros em componentes filhos e exibe UI de fallback
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('💥 Error Boundary Caught:', error);
    console.error('📍 Component Stack:', errorInfo.componentStack);
    
    // ✅ NEW: Report to Sentry with full context
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      tags: {
        errorBoundary: true,
        errorType: 'render-error',
      },
      level: 'error',
      extra: {
        errorInfo: {
          componentStack: errorInfo.componentStack,
        },
      },
    });
    
    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log to external service (Sentry, etc.) if configured
    if (typeof window !== 'undefined') {
      (window as any).__LAST_ERROR__ = {
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      };
    }
    
    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      // Otherwise use default ErrorPage
      return (
        <ErrorPage 
          error={this.state.error} 
          resetError={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

// Export both named and default for flexibility
export { ErrorBoundary };
export default ErrorBoundary;
