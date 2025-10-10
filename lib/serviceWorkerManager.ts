/**
 * 🔧 Gerenciador de Service Worker
 * 
 * Gerencia registro, atualização e comunicação com o Service Worker
 */

export interface ServiceWorkerStatus {
  isRegistered: boolean;
  isUpdateAvailable: boolean;
  isOfflineReady: boolean;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private status: ServiceWorkerStatus = {
    isRegistered: false,
    isUpdateAvailable: false,
    isOfflineReady: false
  };

  private listeners: Map<string, Set<Function>> = new Map();

  /**
   * Registra o Service Worker
   */
  async register(scriptPath: string = '/service-worker-advanced.js'): Promise<boolean> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker não suportado neste navegador');
      return false;
    }

    try {
      this.registration = await navigator.serviceWorker.register(scriptPath, {
        scope: '/'
      });

      console.log('✅ Service Worker registrado:', this.registration.scope);

      this.status.isRegistered = true;
      this.emit('registered', this.registration);

      // Verifica atualizações
      this.registration.addEventListener('updatefound', () => {
        this.handleUpdateFound();
      });

      // Service Worker ativo
      if (this.registration.active) {
        this.status.isOfflineReady = true;
        this.emit('ready', this.registration);
      }

      // Verifica atualizações periodicamente
      this.checkForUpdates();

      return true;
    } catch (error) {
      console.error('❌ Erro ao registrar Service Worker:', error);
      return false;
    }
  }

  /**
   * Desregistra o Service Worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('🗑️ Service Worker desregistrado');
      
      this.status.isRegistered = false;
      this.status.isOfflineReady = false;
      this.emit('unregistered');
      
      return result;
    } catch (error) {
      console.error('❌ Erro ao desregistrar Service Worker:', error);
      return false;
    }
  }

  /**
   * Atualiza o Service Worker
   */
  async update(): Promise<void> {
    if (!this.registration) {
      console.warn('Service Worker não está registrado');
      return;
    }

    try {
      await this.registration.update();
      console.log('🔄 Service Worker atualizado');
    } catch (error) {
      console.error('❌ Erro ao atualizar Service Worker:', error);
    }
  }

  /**
   * Força atualização imediata
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration?.waiting) {
      return;
    }

    // Envia mensagem para o Service Worker pular a espera
    this.postMessage({ type: 'SKIP_WAITING' });

    // Recarrega a página quando o novo SW estiver ativo
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  /**
   * Limpa todo o cache
   */
  async clearCache(): Promise<void> {
    this.postMessage({ type: 'CLEAR_CACHE' });
    
    // Também limpa o cache do navegador
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      console.log('🗑️ Cache limpo');
    }
  }

  /**
   * Envia mensagem para o Service Worker
   */
  postMessage(message: any): void {
    if (!this.registration?.active) {
      console.warn('Service Worker não está ativo');
      return;
    }

    this.registration.active.postMessage(message);
  }

  /**
   * Verifica atualizações periodicamente
   */
  private checkForUpdates(): void {
    // Verifica a cada 1 hora
    setInterval(() => {
      this.update();
    }, 60 * 60 * 1000);
  }

  /**
   * Manipula quando uma atualização é encontrada
   */
  private handleUpdateFound(): void {
    if (!this.registration) return;

    const newWorker = this.registration.installing;
    if (!newWorker) return;

    console.log('🆕 Nova versão do Service Worker encontrada');

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
        this.status.isUpdateAvailable = true;
        this.emit('updateAvailable', newWorker);
      }
    });
  }

  /**
   * Obtém status atual
   */
  getStatus(): ServiceWorkerStatus {
    return { ...this.status };
  }

  /**
   * Verifica se está offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Event emitter
   */
  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  private emit(event: string, ...args: any[]): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(...args));
    }
  }
}

// Instância global
export const serviceWorkerManager = new ServiceWorkerManager();

/**
 * Hook de inicialização
 */
export async function initializeServiceWorker(): Promise<boolean> {
  if (process.env.NODE_ENV === 'production') {
    return await serviceWorkerManager.register();
  }
  
  console.log('Service Worker desabilitado em desenvolvimento');
  return false;
}

export default ServiceWorkerManager;
