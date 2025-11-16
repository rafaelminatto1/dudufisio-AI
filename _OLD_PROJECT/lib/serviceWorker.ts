/**
 * 🚀 UNIFIED SERVICE WORKER MANAGER
 * 
 * Sistema unificado de gerenciamento de service worker.
 * Consolida funcionalidades de:
 * - lib/serviceWorkerRegistration.ts
 * - lib/registerSW.ts
 * 
 * Features:
 * - Registro único e consistente
 * - Tratamento robusto de erros
 * - Suporte a PWA
 * - Background sync
 * - Cache management
 * - Push notifications (estrutura)
 * - Logging detalhado
 * 
 * @module serviceWorker
 */

import { logger } from './logger';

const LOG_CONTEXT = 'ServiceWorker';

/**
 * Configuração do service worker
 */
export interface ServiceWorkerConfig {
  /**
   * Callback quando registro é bem-sucedido
   */
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  
  /**
   * Callback quando há atualização disponível
   */
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  
  /**
   * Callback quando há erro
   */
  onError?: (error: Error) => void;
  
  /**
   * Habilitar verificação periódica de atualizações
   * @default false
   */
  enablePeriodicUpdates?: boolean;
  
  /**
   * Intervalo de verificação de atualizações (em ms)
   * @default 6 horas
   */
  updateInterval?: number;
}

/**
 * Status do service worker
 */
export interface ServiceWorkerStatus {
  registered: boolean;
  active: boolean;
  waiting: boolean;
  installing: boolean;
  updateAvailable: boolean;
}

/**
 * Estado interno do manager
 */
let registration: ServiceWorkerRegistration | null = null;
let updateCheckInterval: NodeJS.Timeout | null = null;

/**
 * 🚀 Registrar Service Worker
 * 
 * Função principal para registrar o service worker da aplicação.
 * Usa o arquivo /service-worker.js do diretório public.
 * 
 * @param config Configuração opcional
 * @returns Promise com o registration ou null em caso de erro
 * 
 * @example
 * ```typescript
 * registerServiceWorker({
 *   onSuccess: () => console.log('SW registered'),
 *   onUpdate: () => console.log('Update available'),
 * });
 * ```
 */
export async function registerServiceWorker(
  config?: ServiceWorkerConfig
): Promise<ServiceWorkerRegistration | null> {
  // Verificar suporte
  if (!('serviceWorker' in navigator)) {
    logger.warn('Service Worker não suportado neste navegador', { context: LOG_CONTEXT });
    return null;
  }

  // Não registrar em desenvolvimento (opcional - pode ser habilitado para testes)
  if (import.meta.env.DEV) {
    logger.info('Service Worker desabilitado em desenvolvimento', { context: LOG_CONTEXT });
    return null;
  }

  // Aguardar carregamento completo da página
  if (document.readyState !== 'complete') {
    await new Promise<void>((resolve) => {
      window.addEventListener('load', () => resolve(), { once: true });
    });
  }

  try {
    logger.info('🔄 Registrando Service Worker...', { context: LOG_CONTEXT });

    const buildId =
      __APP_BUILD_ID__ ||
      import.meta.env.VITE_APP_VERSION ||
      import.meta.env.VERCEL_GIT_COMMIT_SHA ||
      import.meta.env.VERCEL_DEPLOYMENT_ID ||
      'dev';
    const serviceWorkerUrl = `/service-worker.js?v=${encodeURIComponent(buildId)}`;

    logger.debug('Registrando Service Worker com buildId', {
      context: LOG_CONTEXT,
      data: { buildId, serviceWorkerUrl },
    });

    registration = await navigator.serviceWorker.register(serviceWorkerUrl, {
      scope: '/',
      updateViaCache: 'none', // Sempre verificar atualizações
    });

    logger.info('✅ Service Worker registrado com sucesso', {
      context: LOG_CONTEXT,
      data: { scope: registration.scope },
    });

    // Configurar listeners de atualização
    setupUpdateListeners(registration, config);

    // Verificar se já está ativo
    if (registration.active) {
      logger.info('Service Worker já está ativo', { context: LOG_CONTEXT });
      config?.onSuccess?.(registration);
    }

    // Configurar verificação periódica de atualizações
    if (config?.enablePeriodicUpdates && import.meta.env.PROD) {
      const interval = config.updateInterval || 6 * 60 * 60 * 1000; // 6 horas
      
      updateCheckInterval = setInterval(() => {
        logger.debug('Verificando atualizações do Service Worker...', { context: LOG_CONTEXT });
        registration?.update().catch((error) => {
          logger.error('Erro ao verificar atualização', { context: LOG_CONTEXT, data: { error } });
        });
      }, interval);
    }

    return registration;
  } catch (error) {
    logger.error('❌ Falha ao registrar Service Worker', {
      context: LOG_CONTEXT,
      data: { error },
    });
    
    config?.onError?.(error as Error);
    return null;
  }
}

/**
 * Configurar listeners para atualizações do SW
 */
function setupUpdateListeners(
  registration: ServiceWorkerRegistration,
  config?: ServiceWorkerConfig
): void {
  // Listener para quando há nova versão instalando
  registration.addEventListener('updatefound', () => {
    const newWorker = registration.installing;
    
    if (!newWorker) return;

    logger.info('🆕 Nova versão do Service Worker encontrada', { context: LOG_CONTEXT });

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // Nova versão disponível (há um SW ativo)
          logger.info('✨ Atualização disponível', { context: LOG_CONTEXT });
          config?.onUpdate?.(registration);
        } else {
          // Primeira instalação
          logger.info('✅ Service Worker instalado pela primeira vez', { context: LOG_CONTEXT });
          config?.onSuccess?.(registration);
        }
      }
    });
  });

  // Listener para quando o controller muda (nova versão assume)
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    logger.info('🔄 Service Worker atualizado - novo controller ativo', { context: LOG_CONTEXT });
    // Não recarregamos automaticamente - deixamos o usuário decidir
  });
}

/**
 * 🗑️ Desregistrar Service Worker
 * 
 * Remove o service worker. Útil para debugging e manutenção.
 * 
 * @returns Promise com true se removido com sucesso
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) {
    return false;
  }

  try {
    // Limpar intervalo de verificação
    if (updateCheckInterval) {
      clearInterval(updateCheckInterval);
      updateCheckInterval = null;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    
    if (registration) {
      const success = await registration.unregister();
      
      if (success) {
        logger.info('✅ Service Worker desregistrado com sucesso', { context: LOG_CONTEXT });
      }
      
      return success;
    }

    return false;
  } catch (error) {
    logger.error('❌ Erro ao desregistrar Service Worker', {
      context: LOG_CONTEXT,
      data: { error },
    });
    return false;
  }
}

/**
 * 🔄 Atualizar Service Worker
 * 
 * Força o service worker em waiting a assumir imediatamente.
 * 
 * @param skipWaiting Se true, envia mensagem para skip waiting
 * @param reload Se true, recarrega a página após atualização
 */
export async function updateServiceWorker(
  skipWaiting = true,
  reload = false
): Promise<void> {
  try {
    const reg = registration || await navigator.serviceWorker.getRegistration();
    
    if (!reg) {
      logger.warn('Nenhum Service Worker registrado para atualizar', { context: LOG_CONTEXT });
      return;
    }

    const waitingWorker = reg.waiting;

    if (!waitingWorker) {
      logger.info('Nenhuma atualização em espera', { context: LOG_CONTEXT });
      return;
    }

    if (skipWaiting) {
      // Enviar mensagem para skip waiting
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
      logger.info('Mensagem SKIP_WAITING enviada', { context: LOG_CONTEXT });
    }

    if (reload) {
      // Aguardar controller change antes de recarregar
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        logger.info('Recarregando página após atualização...', { context: LOG_CONTEXT });
        window.location.reload();
      }, { once: true });
    }
  } catch (error) {
    logger.error('Erro ao atualizar Service Worker', {
      context: LOG_CONTEXT,
      data: { error },
    });
  }
}

/**
 * 📊 Obter Status do Service Worker
 * 
 * Retorna informações sobre o estado atual do service worker.
 * 
 * @returns Status detalhado
 */
export async function getServiceWorkerStatus(): Promise<ServiceWorkerStatus> {
  if (!('serviceWorker' in navigator)) {
    return {
      registered: false,
      active: false,
      waiting: false,
      installing: false,
      updateAvailable: false,
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
        updateAvailable: false,
      };
    }

    return {
      registered: true,
      active: !!registration.active,
      waiting: !!registration.waiting,
      installing: !!registration.installing,
      updateAvailable: !!registration.waiting,
    };
  } catch (error) {
    logger.error('Erro ao obter status do Service Worker', {
      context: LOG_CONTEXT,
      data: { error },
    });
    
    return {
      registered: false,
      active: false,
      waiting: false,
      installing: false,
      updateAvailable: false,
    };
  }
}

/**
 * 🧹 Limpar Cache
 * 
 * Remove todos os caches do service worker.
 * Útil para forçar recarregamento de assets.
 * 
 * @returns true se limpeza foi bem-sucedida
 */
export async function clearServiceWorkerCache(): Promise<boolean> {
  try {
    if (!('caches' in window)) {
      logger.warn('Cache API não suportada', { context: LOG_CONTEXT });
      return false;
    }

    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map(name => caches.delete(name)));

    logger.info(`✅ ${cacheNames.length} caches removidos`, { context: LOG_CONTEXT });
    return true;
  } catch (error) {
    logger.error('Erro ao limpar cache', { context: LOG_CONTEXT, data: { error } });
    return false;
  }
}

/**
 * 📱 Verificar se App está instalado como PWA
 * 
 * @returns true se rodando como PWA
 */
export function isPWA(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * 💾 Configurar Prompt de Instalação PWA
 * 
 * Configura handlers para o prompt de instalação do PWA.
 * 
 * @param onInstallable Callback quando app pode ser instalado
 * @param onInstalled Callback quando app foi instalado
 */
export function setupInstallPrompt(
  onInstallable?: (prompt: any) => void,
  onInstalled?: () => void
): void {
  let deferredPrompt: any = null;

  // Capturar evento beforeinstallprompt
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    logger.info('💾 PWA pode ser instalado', { context: LOG_CONTEXT });
    onInstallable?.(deferredPrompt);
  });

  // Detectar instalação
  window.addEventListener('appinstalled', () => {
    logger.info('✅ PWA instalado com sucesso!', { context: LOG_CONTEXT });
    deferredPrompt = null;
    onInstalled?.();
  });
}

/**
 * 🔔 Solicitar Permissão de Notificações
 * 
 * @returns Permissão concedida
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    logger.warn('Notificações não suportadas', { context: LOG_CONTEXT });
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    logger.info(`🔔 Permissão de notificação: ${permission}`, { context: LOG_CONTEXT });
    return permission;
  }

  return Notification.permission;
}

/**
 * 🌐 Verificar Status de Rede
 * 
 * @returns 'online' ou 'offline'
 */
export function getNetworkStatus(): 'online' | 'offline' {
  return navigator.onLine ? 'online' : 'offline';
}

/**
 * 🎧 Configurar Listeners de Rede
 * 
 * @param onOnline Callback quando ficar online
 * @param onOffline Callback quando ficar offline
 * @returns Função para remover listeners
 */
export function setupNetworkListeners(
  onOnline?: () => void,
  onOffline?: () => void
): () => void {
  const handleOnline = () => {
    logger.info('🟢 Rede online', { context: LOG_CONTEXT });
    onOnline?.();
  };

  const handleOffline = () => {
    logger.warn('🔴 Rede offline', { context: LOG_CONTEXT });
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  // Retornar função de cleanup
  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/**
 * 🔁 Registrar Background Sync
 * 
 * Registra uma tag para sincronização em background.
 * 
 * @param tag Tag de sincronização
 * @returns true se registrado com sucesso
 */
export async function registerBackgroundSync(tag: string): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('sync' in ServiceWorkerRegistration.prototype)) {
    logger.warn('Background sync não suportado', { context: LOG_CONTEXT });
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    await (registration as any).sync.register(tag);

    logger.info(`✅ Background sync registrado: ${tag}`, { context: LOG_CONTEXT });
    return true;
  } catch (error) {
    logger.error('Erro ao registrar background sync', {
      context: LOG_CONTEXT,
      data: { error, tag },
    });
    return false;
  }
}

/**
 * Export types
 */
export type { ServiceWorkerConfig, ServiceWorkerStatus };

