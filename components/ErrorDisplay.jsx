import React from 'react';
import { AlertTriangle, RefreshCw, X, Info } from 'lucide-react';
/**
 * 🎨 Componente para exibir erros de forma amigável
 *
 * Fornece diferentes variantes de exibição de erro com opções de retry e dismiss
 */
export const ErrorDisplay = ({ error, context, onRetry, onDismiss, variant = 'error', showDetails = false, className = '' }) => {
    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' && error.stack;
    const getVariantStyles = () => {
        switch (variant) {
            case 'warning':
                return {
                    container: 'bg-yellow-50 border-yellow-200',
                    icon: 'text-yellow-600',
                    title: 'text-yellow-800',
                    message: 'text-yellow-700',
                    button: 'bg-yellow-600 hover:bg-yellow-700'
                };
            case 'info':
                return {
                    container: 'bg-blue-50 border-blue-200',
                    icon: 'text-blue-600',
                    title: 'text-blue-800',
                    message: 'text-blue-700',
                    button: 'bg-blue-600 hover:bg-blue-700'
                };
            default:
                return {
                    container: 'bg-red-50 border-red-200',
                    icon: 'text-red-600',
                    title: 'text-red-800',
                    message: 'text-red-700',
                    button: 'bg-red-600 hover:bg-red-700'
                };
        }
    };
    const styles = getVariantStyles();
    return (<div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {variant === 'info' ? (<Info className={`h-5 w-5 ${styles.icon}`}/>) : (<AlertTriangle className={`h-5 w-5 ${styles.icon}`}/>)}
        </div>
        
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {context ? `Erro em ${context}` : 'Ocorreu um erro'}
          </h3>
          
          <div className={`mt-2 text-sm ${styles.message}`}>
            <p>{errorMessage}</p>
          </div>

          {showDetails && errorStack && (<details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-gray-800">
                Detalhes técnicos
              </summary>
              <pre className="mt-2 text-xs text-gray-600 overflow-auto max-h-32 bg-gray-100 p-2 rounded">
                {errorStack}
              </pre>
            </details>)}

          <div className="mt-4 flex space-x-3">
            {onRetry && (<button onClick={onRetry} className={`inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}>
                <RefreshCw className="h-4 w-4 mr-2"/>
                Tentar Novamente
              </button>)}
            
            {onDismiss && (<button onClick={onDismiss} className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                <X className="h-4 w-4 mr-2"/>
                Fechar
              </button>)}
          </div>
        </div>
      </div>
    </div>);
};
export const ErrorList = ({ errors, variant = 'error', className = '' }) => {
    if (errors.length === 0)
        return null;
    return (<div className={`space-y-3 ${className}`}>
      {errors.map(({ id, error, context, onRetry, onDismiss }) => (<ErrorDisplay key={id} error={error} context={context} onRetry={onRetry} onDismiss={onDismiss} variant={variant}/>))}
    </div>);
};
export const LoadingError = ({ onRetry, message = 'Erro ao carregar dados', className = '' }) => {
    return (<div className={`text-center py-8 ${className}`}>
      <AlertTriangle className="mx-auto h-12 w-12 text-red-400"/>
      <h3 className="mt-2 text-sm font-medium text-gray-900">{message}</h3>
      <p className="mt-1 text-sm text-gray-500">
        Tente novamente ou recarregue a página.
      </p>
      <div className="mt-6">
        <button onClick={onRetry} className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
          <RefreshCw className="h-4 w-4 mr-2"/>
          Tentar Novamente
        </button>
      </div>
    </div>);
};
export default ErrorDisplay;
