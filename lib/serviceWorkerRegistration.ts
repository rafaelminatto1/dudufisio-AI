/**
 * 🚀 SERVICE WORKER REGISTRATION
 *
 * Utilitário para registrar e gerenciar o service worker
 */

import { logger } from './logger';

interface ServiceWorkerConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onWaiting?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

/**
 * Registrar service worker
 */
export async function registerServiceWorker(config?: ServiceWorkerConfig) {
  // Só registrar em produção
  if (process.env.NODE_ENV !== 'production') {
    logger.info('[SW] Service worker disabled em desenvolvimento.', { context: 'serviceWorkerRegistration.register' });
    return;
  }

  // Verificar se o navegador suporta service workers
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service workers não são suportados neste navegador.', { context: 'serviceWorkerRegistration.register' });
    return;
  }

  try {
    // Esperar a página carregar completamente
    window.addEventListener('load', async () => {
      try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/',
        });

        logger.info('Service worker registrado com sucesso.', { context: 'serviceWorkerRegistration.register', data: { scope: registration.scope } });

        // Verificar se existe atualização
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                // Nova versão disponível
                logger.info('Nova versão do service worker disponível.', { context: 'serviceWorkerRegistration.updateFound' });
                config?.onUpdate?.(registration);

                // Notificar usuário - DESABILITADO
                // showUpdateNotification(registration);
              } else {
                // Service worker instalado pela primeira vez
                logger.info('Service worker instalado com sucesso.', { context: 'serviceWorkerRegistration.install' });
                config?.onSuccess?.(registration);
              }
            }
          });
        });

        // Verificar periodicamente por atualizações
        setInterval(() => {
          registration.update();
        }, 60 * 60 * 1000); // 1 hora

      } catch (error) {
        logger.error('Falha ao registrar service worker.', { context: 'serviceWorkerRegistration.register', data: { error } });
        config?.onError?.(error as Error);
      }
    });

  } catch (error) {
    logger.error('Erro inesperado durante o registro do service worker.', { context: 'serviceWorkerRegistration.register', data: { error } });
    config?.onError?.(error as Error);
  }
}

/**
 * Desregistrar service worker
 */
export async function unregisterServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const success = await registration.unregister();

    if (success) {
      logger.info('Service worker desregistrado com sucesso.', { context: 'serviceWorkerRegistration.unregister' });
    }

    return success;
  } catch (error) {
    logger.error('Falha ao desregistrar service worker.', { context: 'serviceWorkerRegistration.unregister', data: { error } });
    return false;
  }
}

/**
 * Atualizar service worker (skip waiting)
 */
export async function updateServiceWorker(registration: ServiceWorkerRegistration) {
  const waitingWorker = registration.waiting;

  if (!waitingWorker) {
    return;
  }

  // Enviar mensagem para skip waiting
  waitingWorker.postMessage({ action: 'skipWaiting' });

  // Recarregar página quando o novo worker assumir
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

// Variável para controlar debounce das notificações
let updateNotificationTimeout: NodeJS.Timeout | null = null;
let isNotificationShowing = false;

/**
 * Mostrar notificação de atualização
 */
function showUpdateNotification(registration: ServiceWorkerRegistration) {
  // Debounce: se já existe uma notificação pendente, cancelar
  if (updateNotificationTimeout) {
    clearTimeout(updateNotificationTimeout);
  }
  
  // Se já está mostrando notificação, não mostrar outra
  if (isNotificationShowing) {
    logger.debug('Notificação de atualização já exibida, pulando duplicata.', { context: 'serviceWorkerRegistration.notification' });
    return;
  }
  
  // Aguardar 1 segundo antes de mostrar (debounce)
  updateNotificationTimeout = setTimeout(() => {
    isNotificationShowing = true;
    
    // Criar toast de atualização
    const toast = document.createElement('div');
    toast.className = 'sw-update-toast';
  toast.innerHTML = `
    <div style="
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      border-radius: 12px;
      padding: 16px 24px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
      display: flex;
      align-items: center;
      gap: 16px;
      z-index: 9999;
      animation: slideUp 0.3s ease-out;
    ">
      <div style="flex: 1;">
        <div style="font-weight: 600; color: #1a202c; margin-bottom: 4px;">
          Nova versão disponível! 🎉
        </div>
        <div style="font-size: 14px; color: #718096;">
          Clique em atualizar para obter as últimas melhorias
        </div>
      </div>
      <button
        id="sw-update-btn"
        style="
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s;
        "
        onmouseover="this.style.transform='scale(1.05)'"
        onmouseout="this.style.transform='scale(1)'"
      >
        Atualizar
      </button>
      <button
        id="sw-dismiss-btn"
        style="
          background: transparent;
          color: #718096;
          border: 1px solid #e2e8f0;
          padding: 10px 20px;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
        "
      >
        Depois
      </button>
    </div>
    <style>
      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateX(-50%) translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
      }
    </style>
  `;

  document.body.appendChild(toast);

    // Botão de atualizar
    const updateBtn = document.getElementById('sw-update-btn');
    updateBtn?.addEventListener('click', () => {
      updateServiceWorker(registration);
      toast.remove();
      isNotificationShowing = false;
    });

    // Botão de dispensar
    const dismissBtn = document.getElementById('sw-dismiss-btn');
    dismissBtn?.addEventListener('click', () => {
      toast.remove();
      isNotificationShowing = false;
    });

    // Auto-remover após 30 segundos
    setTimeout(() => {
      if (document.body.contains(toast)) {
        toast.remove();
        isNotificationShowing = false;
      }
    }, 30000);
  }, 1000); // Fim do setTimeout do debounce
}

/**
 * Obter tamanho do cache
 */
export async function getCacheSize(): Promise<number> {
  if (!('serviceWorker' in navigator)) {
    return 0;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const messageChannel = new MessageChannel();

    return new Promise((resolve) => {
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data.size || 0);
      };

      registration.active?.postMessage(
        { action: 'getCacheSize' },
        [messageChannel.port2]
      );

      // Timeout de 5s
      setTimeout(() => resolve(0), 5000);
    });
  } catch (error) {
    logger.error('Falha ao obter tamanho do cache.', { context: 'serviceWorkerRegistration.cache', data: { error } });
    return 0;
  }
}

/**
 * Limpar cache do service worker
 */
export async function clearServiceWorkerCache() {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    registration.active?.postMessage({ action: 'clearCache' });

    logger.info('Cache limpo com sucesso.', { context: 'serviceWorkerRegistration.cache' });
    return true;
  } catch (error) {
    logger.error('Falha ao limpar cache.', { context: 'serviceWorkerRegistration.cache', data: { error } });
    return false;
  }
}

/**
 * Verificar status online/offline
 */
export function getNetworkStatus(): 'online' | 'offline' {
  return navigator.onLine ? 'online' : 'offline';
}

/**
 * Adicionar listeners de rede
 */
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  window.addEventListener('online', () => {
    logger.info('Rede online.', { context: 'serviceWorkerRegistration.network' });
    onOnline?.();
  });

  window.addEventListener('offline', () => {
    logger.warn('Rede offline.', { context: 'serviceWorkerRegistration.network' });
    onOffline?.();
  });
}

/**
 * Sincronizar dados em background (quando voltar online)
 */
export async function requestBackgroundSync(tag: string) {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    logger.warn('Background sync não suportado.', { context: 'serviceWorkerRegistration.backgroundSync' });
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);

    logger.info(`[SW] Background sync registrado: ${tag}`, { context: 'serviceWorkerRegistration.backgroundSync', data: { tag } });
    return true;
  } catch (error) {
    logger.error('Falha ao registrar background sync.', { context: 'serviceWorkerRegistration.backgroundSync', data: { error } });
    return false;
  }
}

/**
 * Verificar se app está rodando como PWA
 */
export function isPWA(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

/**
 * Obter status do service worker
 */
export async function getServiceWorkerStatus(): Promise<{
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
}> {
  if (!('serviceWorker' in navigator)) {
    return {
      registered: false,
      active: false,
      waiting: false,
      installing: false,
    };
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();

    if (!registration) {
      return {
        registered: false,
        active: false,
        waiting: false,
        installing: false,
      };
    }

    return {
      registered: true,
      active: !!registration.active,
      waiting: !!registration.waiting,
      installing: !!registration.installing,
    };
  } catch (error) {
    logger.error('Falha ao obter status do service worker.', { context: 'serviceWorkerRegistration.status', data: { error } });
    return {
      registered: false,
      active: false,
      waiting: false,
      installing: false,
    };
  }
}

/**
 * Exportar métricas do service worker
 */
export async function exportServiceWorkerMetrics() {
  const status = await getServiceWorkerStatus();
  const cacheSize = await getCacheSize();
  const networkStatus = getNetworkStatus();
  const isPWAMode = isPWA();

  const metrics = {
    status,
    cacheSize: `${(cacheSize / 1024 / 1024).toFixed(2)} MB`,
    networkStatus,
    isPWA: isPWAMode,
    timestamp: new Date().toISOString(),
  };

  logger.info('[SW] Métricas do service worker.', { context: 'serviceWorkerRegistration.metrics', data: metrics });
  return metrics;
}
