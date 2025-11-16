import { useState, useCallback } from 'react';
import { useToast } from '../contexts/ToastContext';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
}

interface UseErrorHandlerReturn {
  errorState: ErrorState;
  handleError: (error: unknown, context?: string) => void;
  clearError: () => void;
  isError: (errorType?: string) => boolean;
}

/**
 * 🛡️ Hook para tratamento de erros com UX melhorada
 * 
 * Fornece uma interface consistente para capturar, exibir e gerenciar erros
 * com notificações toast e estado de erro persistente.
 */
export const useErrorHandler = (): UseErrorHandlerReturn => {
  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: ''
  });
  
  const { showToast } = useToast();

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`🚨 Erro${context ? ` em ${context}` : ''}:`, error);
    
    let errorMessage = 'Ocorreu um erro inesperado';
    let errorType = 'unknown';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      errorType = error.name;
    } else if (typeof error === 'string') {
      errorMessage = error;
      errorType = 'string';
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
      errorType = 'object';
    }

    // Mapear tipos de erro para mensagens amigáveis
    const friendlyMessages: Record<string, string> = {
      'NetworkError': 'Problema de conexão. Verifique sua internet.',
      'TypeError': 'Erro de dados. Tente novamente.',
      'ReferenceError': 'Erro interno. Recarregue a página.',
      'SyntaxError': 'Erro de configuração. Contate o suporte.',
      'PGRST301': 'Sessão expirada. Faça login novamente.',
      'PGRST116': 'Você não tem permissão para esta ação.',
      '23505': 'Este registro já existe.',
      '23503': 'Este registro está sendo usado em outro lugar.',
      '401': 'Não autorizado. Faça login novamente.',
      '403': 'Acesso negado.',
      '404': 'Recurso não encontrado.',
      '500': 'Erro interno do servidor. Tente novamente.'
    };

    // Verificar se é um erro conhecido
    const friendlyMessage = friendlyMessages[errorType] || 
                           friendlyMessages[errorMessage] || 
                           errorMessage;

    setErrorState({
      hasError: true,
      error: error instanceof Error ? error : new Error(errorMessage),
      errorMessage: friendlyMessage
    });

    // Mostrar toast de erro
    showToast(friendlyMessage, 'error');
  }, [showToast]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: ''
    });
  }, []);

  const isError = useCallback((errorType?: string) => {
    if (!errorState.hasError) return false;
    if (!errorType) return true;
    return errorState.error?.name === errorType;
  }, [errorState]);

  return {
    errorState,
    handleError,
    clearError,
    isError
  };
};

/**
 * 🎯 Hook para tratamento de erros de API
 */
export const useApiErrorHandler = () => {
  const { handleError, clearError, errorState } = useErrorHandler();

  const handleApiError = useCallback((error: unknown, operation?: string) => {
    const context = operation ? `API ${operation}` : 'API';
    handleError(error, context);
  }, [handleError]);

  const handleNetworkError = useCallback(() => {
    handleError(new Error('Problema de conexão. Verifique sua internet.'), 'Rede');
  }, [handleError]);

  const handleAuthError = useCallback(() => {
    handleError(new Error('Sessão expirada. Faça login novamente.'), 'Autenticação');
  }, [handleError]);

  return {
    errorState,
    handleApiError,
    handleNetworkError,
    handleAuthError,
    clearError
  };
};

/**
 * 🎯 Hook para tratamento de erros de validação
 */
export const useValidationErrorHandler = () => {
  const { handleError, clearError, errorState } = useErrorHandler();

  const handleValidationError = useCallback((errors: Record<string, string[]>) => {
    const errorMessages = Object.entries(errors)
      .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
      .join('; ');
    
    handleError(new Error(`Erro de validação: ${errorMessages}`), 'Validação');
  }, [handleError]);

  return {
    errorState,
    handleValidationError,
    clearError
  };
};
