/**
 * 🌐 UNIFIED ONLINE STATUS HOOKS
 * 
 * Hooks unificados para gerenciar status online/offline.
 * Integra com SafeOfflineContext quando disponível, mas também funciona standalone.
 * 
 * Features:
 * - Detecção de conexão online/offline
 * - Integração com SafeOfflineContext
 * - Suporte a service worker
 * - Eventos customizados
 * - Fallbacks seguros
 * 
 * @module useOnlineStatus
 */

import { useState, useEffect, useCallback } from 'react';
import { useSafeOffline } from '../contexts/SafeOfflineContext';
import { getServiceWorkerStatus, updateServiceWorker } from '../lib/serviceWorker';
import { logger } from '../lib/logger';

const LOG_CONTEXT = 'useOnlineStatus';

/**
 * 📡 Hook Principal de Status Online/Offline
 * 
 * Integra com SafeOfflineContext quando disponível para acesso a fila de sincronização.
 * Funciona standalone caso o context não esteja disponível.
 * 
 * @returns Status de conectividade completo
 * 
 * @example
 * ```tsx
 * const { isOnline, isSyncing, sync } = useOnlineStatus();
 * 
 * if (!isOnline) {
 *   return <OfflineMessage />;
 * }
 * ```
 */
export function useOnlineStatus() {
  // Tentar usar o SafeOfflineContext (retorna valores padrão se não disponível)
  const offlineContext = useSafeOffline();
  
  // Estado local como fallback
  const [localIsOnline, setLocalIsOnline] = useState(() => {
    try {
      return navigator.onLine;
    } catch {
      return true;
    }
  });
  
  const [wasOffline, setWasOffline] = useState(false);

  // Configurar listeners de rede (apenas se não estiver usando context)
  useEffect(() => {
    // Se o context tem erro, usar listeners locais
    if (offlineContext.hasError) {
      logger.warn('SafeOfflineContext com erro, usando listeners locais', { context: LOG_CONTEXT });
      
      const handleOnline = () => {
        setLocalIsOnline(true);
        setWasOffline(true);
        
        // Dispara evento personalizado
        window.dispatchEvent(new CustomEvent('app:online'));
        
        // Limpa flag após 3 segundos
        setTimeout(() => setWasOffline(false), 3000);
      };

      const handleOffline = () => {
        setLocalIsOnline(false);
        
        // Dispara evento personalizado
        window.dispatchEvent(new CustomEvent('app:offline'));
      };

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [offlineContext.hasError]);

  // Detectar mudança de offline para online
  useEffect(() => {
    const currentIsOnline = offlineContext.hasError ? localIsOnline : offlineContext.isOnline;
    
    // Se estava offline e agora está online, setar flag wasOffline
    // Essa lógica já é tratada pelos handlers de evento, então não precisamos duplicar aqui
    // O wasOffline é controlado pelos eventos online/offline diretamente
  }, [offlineContext.isOnline, offlineContext.hasError, localIsOnline]);

  // Retornar valores do context se disponível, senão valores locais
  const isOnline = offlineContext.hasError ? localIsOnline : offlineContext.isOnline;

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
    isSyncing: offlineContext.isSyncing,
    queueSize: offlineContext.queueSize,
    pendingCount: offlineContext.pendingCount,
    failedCount: offlineContext.failedCount,
    sync: offlineContext.sync,
    retryFailed: offlineContext.retryFailed,
    hasError: offlineContext.hasError,
  };
}

/**
 * 🔧 Hook para gerenciar Service Worker
 * 
 * Monitora status do service worker e fornece métodos para atualização.
 * 
 * @returns Status e métodos do service worker
 * 
 * @example
 * ```tsx
 * const { updateAvailable, update, dismiss } = useServiceWorker();
 * 
 * if (updateAvailable) {
 *   return <UpdatePrompt onUpdate={update} onDismiss={dismiss} />;
 * }
 * ```
 */
export function useServiceWorker() {
  const [status, setStatus] = useState({
    registered: false,
    active: false,
    waiting: false,
    installing: false,
    updateAvailable: false,
  });
  
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  // Verificar status inicial
  useEffect(() => {
    getServiceWorkerStatus()
      .then(setStatus)
      .catch((error) => {
        logger.error('Erro ao obter status do SW', { context: LOG_CONTEXT, data: { error } });
      });
  }, []);

  // Listener para atualizações
  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    const handleControllerChange = () => {
      logger.info('Service Worker atualizado', { context: LOG_CONTEXT });
      getServiceWorkerStatus().then(setStatus);
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SW_UPDATE_AVAILABLE') {
        logger.info('Atualização do SW disponível', { context: LOG_CONTEXT });
        setStatus(prev => ({ ...prev, updateAvailable: true, waiting: true }));
        setShowUpdatePrompt(true);
      }
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Verificar periodicamente
    const checkInterval = setInterval(() => {
      getServiceWorkerStatus().then((newStatus) => {
        if (newStatus.updateAvailable && !status.updateAvailable) {
          setShowUpdatePrompt(true);
        }
        setStatus(newStatus);
      });
    }, 30000); // A cada 30 segundos

    return () => {
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      navigator.serviceWorker.removeEventListener('message', handleMessage);
      clearInterval(checkInterval);
    };
  }, [status.updateAvailable]);

  /**
   * Atualizar service worker
   */
  const update = useCallback(async () => {
    try {
      await updateServiceWorker(true, true); // Skip waiting e reload
      setShowUpdatePrompt(false);
    } catch (error) {
      logger.error('Erro ao atualizar SW', { context: LOG_CONTEXT, data: { error } });
    }
  }, []);

  /**
   * Dispensar prompt de atualização
   */
  const dismissUpdate = useCallback(() => {
    setShowUpdatePrompt(false);
  }, []);

  return {
    ...status,
    showUpdatePrompt,
    update,
    dismissUpdate,
  };
}

/**
 * 🔔 Hook para Notificações Push
 * 
 * Gerencia permissões e inscrição para notificações push.
 * 
 * @returns Estado e métodos para notificações
 */
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  });

  const [isSubscribed, setIsSubscribed] = useState(false);

  /**
   * Solicitar permissão
   */
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      logger.warn('Notificações não suportadas', { context: LOG_CONTEXT });
      return 'denied';
    }

    if (Notification.permission === 'granted') {
      return 'granted';
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    } catch (error) {
      logger.error('Erro ao solicitar permissão', { context: LOG_CONTEXT, data: { error } });
      return 'denied';
    }
  }, []);

  /**
   * Verificar se já inscrito
   */
  useEffect(() => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    navigator.serviceWorker.ready
      .then(registration => registration.pushManager.getSubscription())
      .then(subscription => {
        setIsSubscribed(!!subscription);
      })
      .catch(error => {
        logger.error('Erro ao verificar inscrição push', { context: LOG_CONTEXT, data: { error } });
      });
  }, []);

  return {
    permission,
    isSubscribed,
    isSupported: 'Notification' in window && 'PushManager' in window,
    requestPermission,
  };
}

/**
 * Export padrão
 */
export default useOnlineStatus;
