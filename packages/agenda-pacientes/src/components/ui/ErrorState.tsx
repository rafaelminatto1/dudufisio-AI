/**
 * ErrorState Component - DuduFisio-AI
 * 
 * Componente reutilizável para estados de erro
 * com mensagem amigável e ação de retry.
 * 
 * ♿ Acessibilidade:
 * - role="alert" para anunciar erros imediatamente
 * - aria-live="assertive" para erros críticos
 * - Botões com aria-label descritivos
 * - Foco automático no botão de ação principal
 */

import React, { memo, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw, Home, ArrowLeft } from 'lucide-react';
import { Button } from './button';

interface ErrorStateProps {
  /** Erro a ser exibido */
  error?: Error | string | null;
  /** Função chamada ao clicar em "Tentar novamente" */
  onRetry?: () => void;
  /** Função chamada ao clicar em "Voltar" */
  onGoBack?: () => void;
  /** Função chamada ao clicar em "Ir para início" */
  onGoHome?: () => void;
  /** Título customizado */
  title?: string;
  /** Mensagem customizada */
  message?: string;
  /** Se deve mostrar detalhes técnicos do erro */
  showDetails?: boolean;
  /** Classe CSS adicional */
  className?: string;
}

export const ErrorState: React.FC<ErrorStateProps> = memo(({
  error,
  onRetry,
  onGoBack,
  onGoHome,
  title = 'Ops! Algo deu errado',
  message,
  showDetails = false,
  className = ''
}) => {
  const retryButtonRef = useRef<HTMLButtonElement>(null);

  // Focar no botão de retry quando componente montar
  useEffect(() => {
    if (onRetry && retryButtonRef.current) {
      retryButtonRef.current.focus();
    }
  }, [onRetry]);

  // Extrai mensagem do erro
  const getErrorMessage = () => {
    if (message) return message;
    if (typeof error === 'string') return error;
    if (error instanceof Error) return error.message;
    return 'Ocorreu um erro inesperado. Tente novamente.';
  };

  const errorMessage = getErrorMessage();

  // Determina se é erro de rede
  const isNetworkError = errorMessage.includes('Failed to fetch') || 
                        errorMessage.includes('Network') ||
                        errorMessage.includes('conexão');

  // Determina se é erro de autenticação
  const isAuthError = errorMessage.includes('autenticado') || 
                     errorMessage.includes('sessão') ||
                     errorMessage.includes('JWT');

  return (
    <div 
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <div className="mb-6">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {title}
        </h2>
        <p className="text-gray-600 max-w-md">
          {errorMessage}
        </p>
      </div>

      {/* Sugestões baseadas no tipo de erro */}
      {isNetworkError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 max-w-md">
          <p className="text-yellow-800 text-sm">
            <strong>Problema de conexão:</strong> Verifique sua internet e tente novamente.
          </p>
        </div>
      )}

      {isAuthError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-md">
          <p className="text-red-800 text-sm">
            <strong>Sessão expirada:</strong> Faça login novamente para continuar.
          </p>
        </div>
      )}

      {/* Detalhes técnicos (apenas em desenvolvimento) */}
      {showDetails && import.meta.env.DEV && error instanceof Error && (
        <details className="mb-6 max-w-md text-left">
          <summary className="text-sm text-gray-500 cursor-pointer">
            Detalhes técnicos
          </summary>
          <pre className="mt-2 text-xs text-gray-600 bg-gray-100 p-2 rounded overflow-auto">
            {error.stack}
          </pre>
        </details>
      )}

      {/* Ações */}
      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button
            ref={retryButtonRef}
            onClick={onRetry}
            className="flex items-center gap-2"
            variant="default"
            aria-label="Tentar carregar novamente"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Tentar novamente
          </Button>
        )}

        {onGoBack && (
          <Button
            onClick={onGoBack}
            variant="outline"
            className="flex items-center gap-2"
            aria-label="Voltar para página anterior"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Voltar
          </Button>
        )}

        {onGoHome && (
          <Button
            onClick={onGoHome}
            variant="ghost"
            className="flex items-center gap-2"
            aria-label="Ir para página inicial"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            Ir para início
          </Button>
        )}
      </div>
    </div>
  );
});

ErrorState.displayName = 'ErrorState';

export default ErrorState;
