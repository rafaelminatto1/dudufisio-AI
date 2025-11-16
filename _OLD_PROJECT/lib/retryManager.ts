/**
 * 🔄 SISTEMA DE RETRY PARA FALHAS DE CARREGAMENTO
 * 
 * Gerencia tentativas de reconexão e retry automático
 * para melhorar a experiência em conexões instáveis
 */

import { logger } from './logger';

interface RetryConfig {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitter: boolean;
}

interface RetryOptions {
  config?: Partial<RetryConfig>;
  onRetry?: (attempt: number, error: Error) => void;
  onSuccess?: () => void;
  onFailure?: (error: Error) => void;
}

const defaultConfig: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffMultiplier: 2,
  jitter: true,
};

export class RetryManager {
  private config: RetryConfig;
  private activeRetries = new Map<string, AbortController>();

  constructor(config: Partial<RetryConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  /**
   * Executa uma operação com retry automático
   */
  async execute<T>(
    operation: () => Promise<T>,
    key: string = 'default',
    options: RetryOptions = {}
  ): Promise<T> {
    const { config: customConfig, onRetry, onSuccess, onFailure } = options;
    const config = { ...this.config, ...customConfig };
    
    // Cancelar retry anterior se existir
    this.cancelRetry(key);

    let lastError: Error;
    
    for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
      try {
        // Criar AbortController para esta tentativa
        const controller = new AbortController();
        this.activeRetries.set(key, controller);

        // Executar operação
        const result = await operation();
        
        // Sucesso - limpar retry ativo
        this.activeRetries.delete(key);
        onSuccess?.();
        
        logger.info(`[RETRY] Operação ${key} bem-sucedida na tentativa ${attempt}`);
        return result;
        
      } catch (error) {
        lastError = error as Error;
        
        // Se não é a última tentativa, aguardar antes de tentar novamente
        if (attempt < config.maxAttempts) {
          const delay = this.calculateDelay(attempt, config);
          
          logger.warn(`[RETRY] Tentativa ${attempt} falhou para ${key}, tentando novamente em ${delay}ms:`, error);
          
          onRetry?.(attempt, lastError);
          
          // Aguardar com possibilidade de cancelamento
          await this.delay(delay, controller);
          
          // Verificar se foi cancelado
          if (controller.signal.aborted) {
            throw new Error(`Operação ${key} foi cancelada`);
          }
        }
      }
    }
    
    // Todas as tentativas falharam
    this.activeRetries.delete(key);
    logger.error(`[RETRY] Todas as tentativas falharam para ${key}:`, lastError);
    
    onFailure?.(lastError!);
    throw lastError!;
  }

  /**
   * Cancela um retry ativo
   */
  cancelRetry(key: string): void {
    const controller = this.activeRetries.get(key);
    if (controller) {
      controller.abort();
      this.activeRetries.delete(key);
      logger.info(`[RETRY] Retry ${key} cancelado`);
    }
  }

  /**
   * Cancela todos os retries ativos
   */
  cancelAllRetries(): void {
    for (const [key, controller] of this.activeRetries) {
      controller.abort();
    }
    this.activeRetries.clear();
    logger.info('[RETRY] Todos os retries cancelados');
  }

  /**
   * Calcula o delay para a próxima tentativa
   */
  private calculateDelay(attempt: number, config: RetryConfig): number {
    let delay = config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1);
    
    // Aplicar delay máximo
    delay = Math.min(delay, config.maxDelay);
    
    // Adicionar jitter para evitar thundering herd
    if (config.jitter) {
      delay = delay * (0.5 + Math.random() * 0.5);
    }
    
    return Math.floor(delay);
  }

  /**
   * Aguarda um delay com possibilidade de cancelamento
   */
  private delay(ms: number, controller: AbortController): Promise<void> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(resolve, ms);
      
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeout);
        reject(new Error('Delay cancelado'));
      });
    });
  }
}

// Instância global do retry manager
export const retryManager = new RetryManager();

// Hook para usar retry em componentes React
export const useRetry = () => {
  const executeWithRetry = React.useCallback(
    <T>(operation: () => Promise<T>, key: string, options?: RetryOptions) => {
      return retryManager.execute(operation, key, options);
    },
    []
  );

  const cancelRetry = React.useCallback((key: string) => {
    retryManager.cancelRetry(key);
  }, []);

  return { executeWithRetry, cancelRetry };
};

// Utilitário para retry de carregamento de módulos
export const retryModuleLoad = async (
  importFn: () => Promise<any>,
  moduleName: string,
  maxAttempts = 3
): Promise<any> => {
  return retryManager.execute(
    importFn,
    `module-${moduleName}`,
    {
      config: { maxAttempts },
      onRetry: (attempt, error) => {
        logger.warn(`[RETRY] Falha ao carregar módulo ${moduleName} (tentativa ${attempt}):`, error);
      },
      onSuccess: () => {
        logger.info(`[RETRY] Módulo ${moduleName} carregado com sucesso`);
      },
      onFailure: (error) => {
        logger.error(`[RETRY] Falha definitiva ao carregar módulo ${moduleName}:`, error);
      }
    }
  );
};

// Utilitário para retry de requisições de API
export const retryApiCall = async <T>(
  apiCall: () => Promise<T>,
  endpoint: string,
  maxAttempts = 3
): Promise<T> => {
  return retryManager.execute(
    apiCall,
    `api-${endpoint}`,
    {
      config: { maxAttempts },
      onRetry: (attempt, error) => {
        logger.warn(`[RETRY] Falha na API ${endpoint} (tentativa ${attempt}):`, error);
      },
      onSuccess: () => {
        logger.info(`[RETRY] API ${endpoint} chamada com sucesso`);
      },
      onFailure: (error) => {
        logger.error(`[RETRY] Falha definitiva na API ${endpoint}:`, error);
      }
    }
  );
};

// Import React para o hook
import React from 'react';
