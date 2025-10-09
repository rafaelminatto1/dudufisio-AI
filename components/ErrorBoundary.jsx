import React, { Component } from 'react';
import ErrorPage from '../pages/ErrorPage';
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
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.handleReset = () => {
            this.setState({ hasError: false, error: undefined, errorInfo: undefined });
        };
        this.state = { hasError: false };
    }
    static getDerivedStateFromError(error) {
        return {
            hasError: true,
            error
        };
    }
    componentDidCatch(error, errorInfo) {
        console.error('💥 Error Boundary Caught:', error);
        console.error('📍 Component Stack:', errorInfo.componentStack);
        // Call optional error callback
        if (this.props.onError) {
            this.props.onError(error, errorInfo);
        }
        // Log to external service (Sentry, etc.) if configured
        if (typeof window !== 'undefined') {
            window.__LAST_ERROR__ = {
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
    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }
            // Otherwise use default ErrorPage
            return (<ErrorPage error={this.state.error} resetError={this.handleReset}/>);
        }
        return this.props.children;
    }
}
// Export both named and default for flexibility
export { ErrorBoundary };
export default ErrorBoundary;
