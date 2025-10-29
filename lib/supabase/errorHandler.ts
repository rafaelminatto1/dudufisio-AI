/**
 * Supabase Error Handler - DuduFisio-AI
 * 
 * Wrapper para operações Supabase com tratamento de erro consistente,
 * retry automático e mensagens amigáveis.
 */

import { handleSupabaseError, AppError } from '../middleware/errorHandler';
import { secureLogger } from '../secureLogger';

// =============================================================================
// TIPOS E INTERFACES
// =============================================================================

interface SupabaseErrorHandlerOptions {
  /** Nome da operação para logs */
  operation: string;
  /** Se deve tentar novamente em caso de erro */
  retryable?: boolean;
  /** Número máximo de tentativas */
  maxRetries?: number;
  /** Delay entre tentativas (ms) */
  retryDelay?: number;
  /** Mensagem customizada para fallback */
  fallbackMessage?: string;
  /** Se deve exibir toast de erro */
  showToast?: boolean;
  /** Contexto adicional para logs */
  context?: Record<string, any>;
}

interface RetryConfig {
  attempts: number;
  maxRetries: number;
  delay: number;
}

// =============================================================================
// CONFIGURAÇÕES PADRÃO
// =============================================================================

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  attempts: 0,
  maxRetries: 3,
  delay: 1000, // 1 segundo
};

const RETRYABLE_ERROR_CODES = [
  'PGRST301', // JWT expired
  'PGRST116', // Not found (pode ser temporário)
  '08006',    // Connection failure
  '08003',    // Connection does not exist
];

// =============================================================================
// FUNÇÕES AUXILIARES
// =============================================================================

/**
 * Verifica se o erro é recuperável (retryable)
 */
function isRetryableError(error: any): boolean {
  if (!error) return false;
  
  // Erros de rede são sempre retryable
  if (error.message?.includes('Failed to fetch') || 
      error.message?.includes('Network') ||
      error.message?.includes('timeout')) {
    return true;
  }
  
  // Códigos específicos do Supabase/PostgreSQL
  if (error.code && RETRYABLE_ERROR_CODES.includes(error.code)) {
    return true;
  }
  
  // Status codes HTTP retryable
  if (error.status && [408, 429, 500, 502, 503, 504].includes(error.status)) {
    return true;
  }
  
  return false;
}

/**
 * Calcula delay exponencial com jitter
 */
function calculateRetryDelay(attempt: number, baseDelay: number): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% de jitter
  return Math.min(exponentialDelay + jitter, 30000); // Max 30 segundos
}

/**
 * Aguarda um tempo específico
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// =============================================================================
// WRAPPER PRINCIPAL
// =============================================================================

/**
 * Wrapper para operações Supabase com tratamento de erro e retry
 * 
 * @param operation - Função assíncrona que executa a operação Supabase
 * @param options - Configurações do handler
 * @returns Promise com resultado da operação ou erro tratado
 * 
 * @example
 * ```typescript
 * export const getPatients = withSupabaseErrorHandling(
 *   async () => {
 *     const { data, error } = await supabase
 *       .from('patients')
 *       .select('*');
 *     
 *     if (error) throw error;
 *     return data;
 *   },
 *   {
 *     operation: 'getPatients',
 *     retryable: true,
 *     fallbackMessage: 'Erro ao buscar pacientes'
 *   }
 * );
 * ```
 */
export function withSupabaseErrorHandling<T>(
  operation: () => Promise<T>,
  options: SupabaseErrorHandlerOptions
): () => Promise<T> {
  return async (): Promise<T> => {
    const {
      operation: operationName,
      retryable = false,
      maxRetries = DEFAULT_RETRY_CONFIG.maxRetries,
      retryDelay = DEFAULT_RETRY_CONFIG.delay,
      fallbackMessage,
      showToast = true,
      context = {}
    } = options;

    let lastError: any;
    let retryConfig: RetryConfig = {
      attempts: 0,
      maxRetries: retryable ? maxRetries : 0,
      delay: retryDelay
    };

    // Loop de tentativas
    while (retryConfig.attempts <= retryConfig.maxRetries) {
      try {
        secureLogger.debug(`Executando operação Supabase: ${operationName}`, {
          component: 'supabaseErrorHandler',
          operation: operationName,
          attempt: retryConfig.attempts + 1,
          context
        });

        const result = await operation();
        
        // Sucesso - log e retorna
        if (retryConfig.attempts > 0) {
          secureLogger.info(`Operação Supabase bem-sucedida após retry: ${operationName}`, {
            component: 'supabaseErrorHandler',
            operation: operationName,
            attempts: retryConfig.attempts + 1,
            context
          });
        }

        return result;

      } catch (error) {
        lastError = error;
        
        secureLogger.warn(`Erro na operação Supabase: ${operationName}`, {
          component: 'supabaseErrorHandler',
          operation: operationName,
          attempt: retryConfig.attempts + 1,
          error: error instanceof Error ? error.message : String(error),
          errorCode: error?.code,
          context
        });

        // Se não é retryable ou atingiu max tentativas, sai do loop
        if (!retryable || !isRetryableError(error) || retryConfig.attempts >= retryConfig.maxRetries) {
          break;
        }

        // Incrementa tentativas e aguarda antes de tentar novamente
        retryConfig.attempts++;
        const delay = calculateRetryDelay(retryConfig.attempts - 1, retryConfig.delay);
        
        secureLogger.info(`Tentando novamente em ${delay}ms: ${operationName}`, {
          component: 'supabaseErrorHandler',
          operation: operationName,
          attempt: retryConfig.attempts + 1,
          delay,
          context
        });

        await sleep(delay);
      }
    }

    // Se chegou aqui, todas as tentativas falharam
    secureLogger.error(`Operação Supabase falhou após ${retryConfig.attempts + 1} tentativas: ${operationName}`, {
      component: 'supabaseErrorHandler',
      operation: operationName,
      totalAttempts: retryConfig.attempts + 1,
      finalError: lastError instanceof Error ? lastError.message : String(lastError),
      context
    });

    // Converte erro para AppError usando handler existente
    const appError = handleSupabaseError(lastError);
    
    // Adiciona contexto da operação
    if (fallbackMessage) {
      appError.message = fallbackMessage;
    }
    
    // Adiciona detalhes sobre tentativas
    if (retryConfig.attempts > 0) {
      appError.details = {
        ...appError.details,
        operation: operationName,
        attempts: retryConfig.attempts + 1,
        retryable: retryable,
        context
      };
    }

    // Re-lança o erro tratado
    throw appError;
  };
}

// =============================================================================
// WRAPPERS ESPECÍFICOS POR OPERAÇÃO
// =============================================================================

/**
 * Wrapper para operações de leitura (GET/SELECT)
 */
export function withSupabaseQuery<T, TArgs extends any[] = []>(
  operation: (...args: TArgs) => Promise<T>,
  options: Omit<SupabaseErrorHandlerOptions, 'retryable'> = {}
): (...args: TArgs) => Promise<T> {
  return (...args: TArgs) => {
    return withSupabaseErrorHandling(() => operation(...args), {
      ...options,
      retryable: true,
      maxRetries: 3,
      fallbackMessage: options.fallbackMessage || 'Erro ao buscar dados'
    })();
  };
}

/**
 * Wrapper para operações de escrita (INSERT/UPDATE/DELETE)
 */
export function withSupabaseMutation<T, TArgs extends any[] = []>(
  operation: (...args: TArgs) => Promise<T>,
  options: Omit<SupabaseErrorHandlerOptions, 'retryable'> = {}
): (...args: TArgs) => Promise<T> {
  return (...args: TArgs) => {
    return withSupabaseErrorHandling(() => operation(...args), {
      ...options,
      retryable: false, // Mutations não são retryable por padrão
      fallbackMessage: options.fallbackMessage || 'Erro ao salvar dados'
    })();
  };
}

/**
 * Wrapper para operações críticas (com retry mais agressivo)
 */
export function withSupabaseCritical<T, TArgs extends any[] = []>(
  operation: (...args: TArgs) => Promise<T>,
  options: Omit<SupabaseErrorHandlerOptions, 'retryable' | 'maxRetries'> = {}
): (...args: TArgs) => Promise<T> {
  return (...args: TArgs) => {
    return withSupabaseErrorHandling(() => operation(...args), {
      ...options,
      retryable: true,
      maxRetries: 5,
      retryDelay: 500, // Delay menor para operações críticas
      fallbackMessage: options.fallbackMessage || 'Erro crítico na operação'
    })();
  };
}

// =============================================================================
// UTILITÁRIOS PARA HOOKS
// =============================================================================

/**
 * Configuração padrão para hooks de query
 */
export const DEFAULT_QUERY_OPTIONS: Partial<SupabaseErrorHandlerOptions> = {
  retryable: true,
  maxRetries: 3,
  showToast: true
};

/**
 * Configuração padrão para hooks de mutation
 */
export const DEFAULT_MUTATION_OPTIONS: Partial<SupabaseErrorHandlerOptions> = {
  retryable: false,
  showToast: true
};

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  withSupabaseErrorHandling,
  withSupabaseQuery,
  withSupabaseMutation,
  withSupabaseCritical,
  DEFAULT_QUERY_OPTIONS,
  DEFAULT_MUTATION_OPTIONS
};
