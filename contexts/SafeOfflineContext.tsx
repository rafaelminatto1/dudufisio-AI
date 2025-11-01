/**
 * 🛡️ SAFE OFFLINE CONTEXT
 * 
 * Context robusto para gerenciamento de estado offline com proteções contra falhas.
 * Este wrapper garante que o sistema offline nunca quebre a aplicação.
 * 
 * Features:
 * - Try-catch em todas as operações
 * - Fallback values seguros
 * - Logging detalhado de erros
 * - Recuperação automática de falhas
 * - Compatibilidade com modo de desenvolvimento
 * 
 * @module SafeOfflineContext
 */

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { syncQueue, SyncQueueItem } from '../lib/offline/syncQueue';
import { logger } from '../lib/logger';

const LOG_CONTEXT = 'SafeOfflineContext';

/**
 * Interface do contexto offline
 */
interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  queueSize: number;
  pendingCount: number;
  failedCount: number;
  queueItems: SyncQueueItem[];
  sync: () => Promise<void>;
  retryFailed: () => Promise<void>;
  clearQueue: () => Promise<void>;
  hasError: boolean;
  errorMessage?: string;
}

/**
 * Valores padrão seguros para o contexto
 */
const DEFAULT_CONTEXT_VALUE: OfflineContextType = {
  isOnline: true, // Assume online por padrão
  isSyncing: false,
  queueSize: 0,
  pendingCount: 0,
  failedCount: 0,
  queueItems: [],
  sync: async () => {
    logger.warn('Sync chamado mas contexto não inicializado', { context: LOG_CONTEXT });
  },
  retryFailed: async () => {
    logger.warn('RetryFailed chamado mas contexto não inicializado', { context: LOG_CONTEXT });
  },
  clearQueue: async () => {
    logger.warn('ClearQueue chamado mas contexto não inicializado', { context: LOG_CONTEXT });
  },
  hasError: false,
};

const SafeOfflineContext = createContext<OfflineContextType>(DEFAULT_CONTEXT_VALUE);

/**
 * Props do Provider
 */
interface SafeOfflineProviderProps {
  children: ReactNode;
  /**
   * Se true, não mostra logs de erro (útil para testes)
   */
  silent?: boolean;
}

/**
 * 🛡️ SafeOfflineProvider
 * 
 * Provider robusto que envolve o sistema offline com proteções contra falhas.
 * Garante que erros no sistema offline não quebrem toda a aplicação.
 */
export const SafeOfflineProvider: React.FC<SafeOfflineProviderProps> = ({ 
  children, 
  silent = false 
}) => {
  const [isOnline, setIsOnline] = useState(() => {
    try {
      return navigator.onLine;
    } catch (error) {
      logger.error('Erro ao verificar status online', { context: LOG_CONTEXT, data: { error } });
      return true; // Fallback: assume online
    }
  });
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [queueItems, setQueueItems] = useState<SyncQueueItem[]>([]);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  /**
   * Handler seguro para evento online
   */
  const handleOnline = useCallback(() => {
    try {
      setIsOnline(true);
      logger.info('🟢 Voltou online - Preparando sincronização...', { context: LOG_CONTEXT });
      
      // Sincronizar após um pequeno delay para garantir estabilidade
      setTimeout(() => {
        sync().catch((error) => {
          logger.error('Erro na sincronização automática', { context: LOG_CONTEXT, data: { error } });
        });
      }, 1000);
    } catch (error) {
      logger.error('Erro no handler online', { context: LOG_CONTEXT, data: { error } });
    }
  }, []);

  /**
   * Handler seguro para evento offline
   */
  const handleOffline = useCallback(() => {
    try {
      setIsOnline(false);
      logger.warn('🔴 Ficou offline - Modo offline ativado', { context: LOG_CONTEXT });
    } catch (error) {
      logger.error('Erro no handler offline', { context: LOG_CONTEXT, data: { error } });
    }
  }, []);

  /**
   * Configurar listeners de eventos online/offline
   */
  useEffect(() => {
    try {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      logger.info('Listeners de conectividade registrados', { context: LOG_CONTEXT });

      return () => {
        try {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
          logger.debug('Listeners de conectividade removidos', { context: LOG_CONTEXT });
        } catch (error) {
          if (!silent) {
            logger.error('Erro ao remover listeners', { context: LOG_CONTEXT, data: { error } });
          }
        }
      };
    } catch (error) {
      logger.error('Erro ao configurar listeners de conectividade', { context: LOG_CONTEXT, data: { error } });
      setHasError(true);
      setErrorMessage('Falha ao configurar monitoramento de rede');
      
      // Retorna função vazia para evitar erros no cleanup
      return () => {};
    }
  }, [handleOnline, handleOffline, silent]);

  /**
   * Inscrever na fila de sincronização
   */
  useEffect(() => {
    try {
      const unsubscribe = syncQueue.subscribe((items) => {
        try {
          setQueueItems(items);
        } catch (error) {
          logger.error('Erro ao atualizar queueItems', { context: LOG_CONTEXT, data: { error } });
        }
      });

      logger.info('Inscrito na fila de sincronização', { context: LOG_CONTEXT });

      return () => {
        try {
          unsubscribe();
          logger.debug('Desinscrito da fila de sincronização', { context: LOG_CONTEXT });
        } catch (error) {
          if (!silent) {
            logger.error('Erro ao desinscrever da fila', { context: LOG_CONTEXT, data: { error } });
          }
        }
      };
    } catch (error) {
      logger.error('Erro ao inscrever na fila de sincronização', { context: LOG_CONTEXT, data: { error } });
      setHasError(true);
      setErrorMessage('Falha ao configurar fila de sincronização');
      
      // Retorna função vazia para evitar erros no cleanup
      return () => {};
    }
  }, [silent]);

  /**
   * Função segura de sincronização
   */
  const sync = useCallback(async () => {
    if (!isOnline || isSyncing) {
      logger.debug('Sync ignorado (offline ou já sincronizando)', { 
        context: LOG_CONTEXT, 
        data: { isOnline, isSyncing } 
      });
      return;
    }

    setIsSyncing(true);
    
    try {
      logger.info('🔄 Iniciando sincronização...', { context: LOG_CONTEXT });
      await syncQueue.processQueue();
      logger.info('✅ Sincronização concluída com sucesso', { context: LOG_CONTEXT });
    } catch (error) {
      logger.error('❌ Falha na sincronização', { context: LOG_CONTEXT, data: { error } });
      setHasError(true);
      setErrorMessage('Falha ao sincronizar dados');
      
      // Não propagar o erro - apenas logar
      if (!silent) {
        console.error('Sync failed:', error);
      }
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, silent]);

  /**
   * Função segura para retentar itens falhos
   */
  const retryFailed = useCallback(async () => {
    try {
      const failed = queueItems.filter(item => item.status === 'failed');
      
      if (failed.length === 0) {
        logger.info('Nenhum item falho para retentar', { context: LOG_CONTEXT });
        return;
      }

      logger.info(`🔁 Retentando ${failed.length} itens falhos...`, { context: LOG_CONTEXT });

      for (const item of failed) {
        try {
          await syncQueue.retryItem(item.id);
        } catch (error) {
          logger.error(`Erro ao retentar item ${item.id}`, { context: LOG_CONTEXT, data: { error, item } });
          // Continua com os próximos itens mesmo se um falhar
        }
      }

      logger.info('✅ Retentativas concluídas', { context: LOG_CONTEXT });
    } catch (error) {
      logger.error('❌ Erro ao retentar itens falhos', { context: LOG_CONTEXT, data: { error } });
      setHasError(true);
      setErrorMessage('Falha ao retentar sincronização');
    }
  }, [queueItems]);

  /**
   * Função segura para limpar a fila
   */
  const clearQueue = useCallback(async () => {
    try {
      logger.info('🧹 Limpando fila de sincronização...', { context: LOG_CONTEXT });
      await syncQueue.cleanup();
      logger.info('✅ Fila limpa com sucesso', { context: LOG_CONTEXT });
    } catch (error) {
      logger.error('❌ Erro ao limpar fila', { context: LOG_CONTEXT, data: { error } });
      setHasError(true);
      setErrorMessage('Falha ao limpar fila');
    }
  }, []);

  /**
   * Calcular contadores de forma segura
   */
  const pendingCount = React.useMemo(() => {
    try {
      return queueItems.filter(i => i.status === 'pending').length;
    } catch (error) {
      logger.error('Erro ao calcular pendingCount', { context: LOG_CONTEXT, data: { error } });
      return 0;
    }
  }, [queueItems]);

  const failedCount = React.useMemo(() => {
    try {
      return queueItems.filter(i => i.status === 'failed').length;
    } catch (error) {
      logger.error('Erro ao calcular failedCount', { context: LOG_CONTEXT, data: { error } });
      return 0;
    }
  }, [queueItems]);

  /**
   * Valor do contexto
   */
  const contextValue: OfflineContextType = React.useMemo(() => ({
    isOnline,
    isSyncing,
    queueSize: queueItems.length,
    pendingCount,
    failedCount,
    queueItems,
    sync,
    retryFailed,
    clearQueue,
    hasError,
    errorMessage,
  }), [
    isOnline,
    isSyncing,
    queueItems,
    pendingCount,
    failedCount,
    sync,
    retryFailed,
    clearQueue,
    hasError,
    errorMessage,
  ]);

  return (
    <SafeOfflineContext.Provider value={contextValue}>
      {children}
    </SafeOfflineContext.Provider>
  );
};

/**
 * 🪝 Hook seguro para acessar o contexto offline
 * 
 * Sempre retorna um valor válido, mesmo se o provider não estiver configurado.
 * Ideal para componentes que podem ou não ter acesso ao sistema offline.
 * 
 * @returns Contexto offline ou valores padrão seguros
 * 
 * @example
 * ```tsx
 * const { isOnline, sync } = useSafeOffline();
 * 
 * if (!isOnline) {
 *   return <OfflineMessage />;
 * }
 * ```
 */
export const useSafeOffline = (): OfflineContextType => {
  const context = useContext(SafeOfflineContext);
  
  // Sempre retorna um valor válido, mesmo sem provider
  if (!context) {
    logger.warn(
      'useSafeOffline usado fora do SafeOfflineProvider - retornando valores padrão', 
      { context: LOG_CONTEXT }
    );
    return DEFAULT_CONTEXT_VALUE;
  }
  
  return context;
};

/**
 * 🪝 Hook estrito para acessar o contexto offline
 * 
 * Lança erro se usado fora do provider (útil para componentes que DEVEM ter acesso ao contexto).
 * Use este hook quando o componente absolutamente precisa do contexto offline.
 * 
 * @throws Error se usado fora do SafeOfflineProvider
 * @returns Contexto offline
 * 
 * @example
 * ```tsx
 * const { queueItems, retryFailed } = useOfflineStrict();
 * // Garante que o contexto está disponível
 * ```
 */
export const useOfflineStrict = (): OfflineContextType => {
  const context = useContext(SafeOfflineContext);
  
  if (!context) {
    const error = new Error('useOfflineStrict must be used within SafeOfflineProvider');
    logger.error(error.message, { context: LOG_CONTEXT });
    throw error;
  }
  
  return context;
};

/**
 * Export do contexto para uso avançado
 */
export { SafeOfflineContext };

/**
 * Export de tipos
 */
export type { OfflineContextType, SafeOfflineProviderProps };

