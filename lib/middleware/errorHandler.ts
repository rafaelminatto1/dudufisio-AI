/**
 * Error Handler Middleware - DuduFisio-AI
 * 
 * Tratamento centralizado de erros do sistema.
 * Integrado com toast notifications e logging.
 * 
 * Baseado em BUSINESS_RULES.md e API_DOCUMENTATION.md
 */

import { toast } from '@/hooks/use-toast';

// =============================================================================
// TIPOS DE ERRO
// =============================================================================

/**
 * Classe base para erros da aplicação
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    
    // Mantém stack trace correto
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Erro de validação
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, message, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

/**
 * Erro de autenticação
 */
export class AuthenticationError extends AppError {
  constructor(message: string = 'Não autenticado') {
    super(401, message, 'AUTHENTICATION_ERROR');
    this.name = 'AuthenticationError';
  }
}

/**
 * Erro de autorização
 */
export class AuthorizationError extends AppError {
  constructor(message: string = 'Sem permissão') {
    super(403, message, 'AUTHORIZATION_ERROR');
    this.name = 'AuthorizationError';
  }
}

/**
 * Erro de recurso não encontrado
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Recurso') {
    super(404, `${resource} não encontrado`, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

/**
 * Erro de conflito (ex: CPF duplicado)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(409, message, 'CONFLICT_ERROR', details);
    this.name = 'ConflictError';
  }
}

/**
 * Erro de limite de taxa excedido
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Limite de requisições excedido') {
    super(429, message, 'RATE_LIMIT_ERROR');
    this.name = 'RateLimitError';
  }
}

/**
 * Erro interno do servidor
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Erro interno do servidor', details?: any) {
    super(500, message, 'INTERNAL_SERVER_ERROR', details);
    this.name = 'InternalServerError';
  }
}

// =============================================================================
// HANDLER DE ERROS DO SUPABASE
// =============================================================================

/**
 * Trata erros específicos do Supabase
 */
export function handleSupabaseError(error: any): AppError {
  // Erro de recurso não encontrado
  if (error.code === 'PGRST116') {
    return new NotFoundError();
  }
  
  // Erro de unique violation (ex: CPF duplicado)
  if (error.code === '23505') {
    const match = error.message.match(/Key \((.*?)\)=/);
    const field = match ? match[1] : 'campo';
    return new ConflictError(`${field} já existe no sistema`);
  }
  
  // Erro de foreign key violation
  if (error.code === '23503') {
    return new ValidationError('Referência inválida');
  }
  
  // Erro de not null violation
  if (error.code === '23502') {
    const match = error.message.match(/column "(.*?)"/);
    const field = match ? match[1] : 'Campo';
    return new ValidationError(`${field} é obrigatório`);
  }
  
  // Erro de check constraint
  if (error.code === '23514') {
    return new ValidationError('Dados inválidos');
  }
  
  // Erro de autenticação
  if (error.message?.includes('JWT') || error.message?.includes('auth')) {
    return new AuthenticationError('Sessão expirada ou inválida');
  }
  
  // Erro genérico
  return new InternalServerError(error.message || 'Erro desconhecido', error);
}

// =============================================================================
// HANDLER PRINCIPAL
// =============================================================================

/**
 * Opções para tratamento de erro
 */
interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  rethrow?: boolean;
  customMessage?: string;
}

/**
 * Trata erro e exibe feedback ao usuário
 */
export function handleError(
  error: unknown,
  options: ErrorHandlerOptions = {}
): AppError {
  const {
    showToast = true,
    logToConsole = true,
    rethrow = false,
    customMessage,
  } = options;
  
  let appError: AppError;
  
  // Converte erro para AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Tenta identificar tipo de erro
    if (error.message.includes('Failed to fetch') || error.message.includes('Network')) {
      appError = new AppError(503, 'Erro de conexão. Verifique sua internet.', 'NETWORK_ERROR');
    } else {
      appError = new InternalServerError(error.message);
    }
  } else if (typeof error === 'string') {
    appError = new InternalServerError(error);
  } else {
    appError = new InternalServerError('Erro desconhecido', error);
  }
  
  // Log no console (apenas em desenvolvimento)
  if (logToConsole && import.meta.env.DEV) {
    console.error('❌ Error:', {
      name: appError.name,
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      details: appError.details,
      stack: appError.stack,
    });
  }
  
  // Exibe toast com feedback ao usuário
  if (showToast) {
    const message = customMessage || appError.message;
    
    // Define variante do toast baseado no tipo de erro
    const variant = appError.statusCode >= 500 ? 'destructive' : 'default';
    
    toast({
      title: getErrorTitle(appError),
      description: message,
      variant,
    });
  }
  
  // Re-lança erro se solicitado
  if (rethrow) {
    throw appError;
  }
  
  return appError;
}

/**
 * Obtém título apropriado para o erro
 */
function getErrorTitle(error: AppError): string {
  if (error.statusCode >= 500) {
    return 'Erro no Servidor';
  }
  
  if (error.statusCode === 404) {
    return 'Não Encontrado';
  }
  
  if (error.statusCode === 403) {
    return 'Acesso Negado';
  }
  
  if (error.statusCode === 401) {
    return 'Não Autenticado';
  }
  
  if (error.statusCode === 409) {
    return 'Conflito';
  }
  
  if (error.statusCode === 429) {
    return 'Limite Excedido';
  }
  
  return 'Erro';
}

// =============================================================================
// WRAPPERS PARA FUNÇÕES ASSÍNCRONAS
// =============================================================================

/**
 * Wrapper para tratamento automático de erros em funções assíncronas
 */
export function withErrorHandler<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options?: ErrorHandlerOptions
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, options);
      return null;
    }
  }) as T;
}

/**
 * Wrapper para tratamento de erros em callbacks de eventos
 */
export function withEventErrorHandler<T extends (...args: any[]) => void>(
  fn: T,
  options?: ErrorHandlerOptions
): T {
  return ((...args: Parameters<T>) => {
    try {
      fn(...args);
    } catch (error) {
      handleError(error, { ...options, rethrow: false });
    }
  }) as T;
}

// =============================================================================
// BOUNDARY DE ERRO PARA REACT
// =============================================================================

/**
 * Componente Error Boundary
 * 
 * Uso:
 * ```tsx
 * <ErrorBoundary fallback={<ErrorFallback />}>
 *   <App />
 * </ErrorBoundary>
 * ```
 */
import React, { Component, ErrorInfo } from 'react';

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

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Classes de erro
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  InternalServerError,
  
  // Handlers
  handleError,
  handleSupabaseError,
  
  // Wrappers
  withErrorHandler,
  withEventErrorHandler,
  
  // Components
  ErrorBoundary,
};

