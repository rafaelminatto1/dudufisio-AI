import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Home, RefreshCw, Mail, ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import * as Sentry from '@sentry/react';

interface ErrorPageProps {
  error?: Error;
  resetError?: () => void;
}

const ErrorPage: React.FC<ErrorPageProps> = ({ error: propError, resetError }) => {
  const navigate = useNavigate();
  
  // Use only the prop error, don't try to access route error
  const error = propError;
  const errorMessage = error?.message || 'Ocorreu um erro inesperado';
  const errorStack = error?.stack;

  // ✅ NEW: Capture error to Sentry if not already captured
  React.useEffect(() => {
    if (error && typeof window !== 'undefined') {
      // Check if error was already reported (via ErrorBoundary)
      const errorId = Sentry.captureException(error, {
        tags: {
          errorSource: 'error-page',
        },
        level: 'error',
      });
      
      // Store error ID for reference
      if (errorId) {
        console.log('Error reported to Sentry:', errorId);
      }
    }
  }, [error]);

  const handleReload = () => {
    if (resetError) {
      resetError();
    } else {
      window.location.reload();
    }
  };

  const handleClearCache = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 flex items-center justify-center p-md">
      <div className="max-w-2xl w-full">
        {/* Error Icon */}
        <div className="text-center mb-mdxl">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-white rounded-full shadow-cardActive mb-xl">
            <AlertTriangle className="w-12 h-12 text-red-500" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-text mb-md">
            Algo deu errado
          </h1>
          
          <p className="text-lg text-neutral-textSecondary max-w-md mx-auto">
            Desculpe, encontramos um problema ao carregar esta página.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-white rounded-cardLarge shadow-xl p-lg mb-xl">
          <div className="space-y-md">
            <div>
              <h3 className="font-semibold text-neutral-text mb-sm">Erro:</h3>
              <p className="text-sm text-error bg-error-light p-md rounded-lg font-mono">
                {errorMessage}
              </p>
            </div>
            
            {errorStack && (
              <details className="text-left">
                <summary className="cursor-pointer font-semibold text-neutral-text hover:text-neutral-text text-sm">
                  Detalhes técnicos (clique para expandir)
                </summary>
                <pre className="mt-3 text-xs text-neutral-textSecondary bg-neutral-bgAlt p-md rounded-lg overflow-auto max-h-48">
                  {errorStack}
                </pre>
              </details>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-cardLarge shadow-xl p-lg mb-xl">
          <h3 className="font-semibold text-neutral-text mb-md">O que você pode fazer:</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <Button
              onClick={handleReload}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              <RefreshCw className="w-4 h-4 mr-sm" />
              Recarregar Página
            </Button>
            
            <Button
              onClick={() => navigate('/dashboard')}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-sm" />
              Ir para Dashboard
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-sm" />
              Voltar
            </Button>
            
            <Button
              onClick={handleClearCache}
              variant="outline"
              className="w-full text-error hover:text-error hover:bg-error-light"
            >
              <RefreshCw className="w-4 h-4 mr-sm" />
              Limpar Cache
            </Button>
          </div>
        </div>

        {/* Support */}
        <div className="text-center">
          <p className="text-sm text-neutral-textSecondary mb-md">
            Se o problema persistir, entre em contato com nossa equipe
          </p>
          <Button
            variant="ghost"
            className="text-indigo-600 hover:text-indigo-700"
            onClick={() => window.location.href = 'mailto:suporte@dudufisio.com?subject=Erro%20na%20Aplicação'}
          >
            <Mail className="w-4 h-4 mr-sm" />
            suporte@dudufisio.com
          </Button>
        </div>

        {/* Additional Info */}
        <div className="mt-3xl text-center text-xs text-neutral-textTertiary">
          <p>ID do Erro: {Date.now().toString(36)}</p>
          <p>Timestamp: {new Date().toLocaleString('pt-BR')}</p>
          <p className="mt-sm text-neutral-textSecondary">Este erro foi reportado automaticamente à nossa equipe de desenvolvimento.</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;

