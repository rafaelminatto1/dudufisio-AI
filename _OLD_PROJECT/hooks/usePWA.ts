import { useState, useEffect } from 'react';

export interface PWAStatus {
  isInstalled: boolean;
  isOnline: boolean;
  isUpdateAvailable: boolean;
  canInstall: boolean;
  deferredPrompt: any;
}

export interface PWAControls {
  install: () => Promise<void>;
  update: () => Promise<void>;
  unregister: () => Promise<boolean>;
  requestNotificationPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<PushSubscription | null>;
}

export const usePWA = (): [PWAStatus, PWAControls] => {
  const [status, setStatus] = useState<PWAStatus>({
    isInstalled: false,
    isOnline: navigator.onLine,
    isUpdateAvailable: false,
    canInstall: false,
    deferredPrompt: null
  });

  // Registrar Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      registerServiceWorker();
    }

    // Detectar se já está instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setStatus(prev => ({ ...prev, isInstalled: true }));
    }

    // Listeners para eventos de instalação
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const registerServiceWorker = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('[PWA] Service Worker registrado:', registration.scope);

      // Verificar atualizações
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[PWA] Nova versão disponível!');
              setStatus(prev => ({ ...prev, isUpdateAvailable: true }));
            }
          });
        }
      });

      // Verificar atualizações periodicamente (desabilitado)
      // Removido para evitar alertas frequentes
      // setInterval(() => {
      //   registration.update();
      // }, 60 * 60 * 1000);

    } catch (error) {
      console.error('[PWA] Erro ao registrar Service Worker:', error);
    }
  };

  const handleBeforeInstallPrompt = (e: Event) => {
    e.preventDefault();
    setStatus(prev => ({
      ...prev,
      canInstall: true,
      deferredPrompt: e
    }));
  };

  const handleAppInstalled = () => {
    console.log('[PWA] App instalado!');
    setStatus(prev => ({
      ...prev,
      isInstalled: true,
      canInstall: false,
      deferredPrompt: null
    }));
  };

  const handleOnline = () => {
    console.log('[PWA] Conexão restaurada');
    setStatus(prev => ({ ...prev, isOnline: true }));
  };

  const handleOffline = () => {
    console.log('[PWA] Sem conexão');
    setStatus(prev => ({ ...prev, isOnline: false }));
  };

  // Controles
  const install = async () => {
    if (!status.deferredPrompt) {
      console.warn('[PWA] Prompt de instalação não disponível');
      return;
    }

    status.deferredPrompt.prompt();
    const { outcome } = await status.deferredPrompt.userChoice;
    
    console.log(`[PWA] Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalação`);
    
    setStatus(prev => ({
      ...prev,
      deferredPrompt: null,
      canInstall: false
    }));
  };

  const update = async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      
      if (registration && registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        // Reload removido - atualização silenciosa
        console.log('[PWA] Service Worker atualizado. Recarregue manualmente se necessário.');
      }
    }
  };

  const unregister = async (): Promise<boolean> => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      if (registration) {
        return registration.unregister();
      }
    }
    return false;
  };

  const requestNotificationPermission = async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) {
      console.warn('[PWA] Notificações não suportadas');
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return Notification.requestPermission();
    }

    return Notification.permission;
  };

  const subscribeToNotifications = async (): Promise<PushSubscription | null> => {
    try {
      const permission = await requestNotificationPermission();
      
      if (permission !== 'granted') {
        console.warn('[PWA] Permissão de notificação negada');
        return null;
      }

      const registration = await navigator.serviceWorker.ready;
      
      // VAPID public key (deve ser gerado no servidor)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      console.log('[PWA] Inscrito em notificações push');
      
      // Enviar subscription para o servidor
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      return subscription;
    } catch (error) {
      console.error('[PWA] Erro ao inscrever em notificações:', error);
      return null;
    }
  };

  const controls: PWAControls = {
    install,
    update,
    unregister,
    requestNotificationPermission,
    subscribeToNotifications
  };

  return [status, controls];
};

/**
 * Converte VAPID key de base64 para Uint8Array
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}
