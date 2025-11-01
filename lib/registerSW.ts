/**
 * Service Worker Registration
 * Registra e gerencia o Service Worker avançado
 */

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker não suportado neste navegador');
    return null;
  }

  try {
    // Wait for page load
    await new Promise(resolve => {
      if (document.readyState === 'complete') {
        resolve(true);
      } else {
        window.addEventListener('load', resolve);
      }
    });

    console.log('🔄 Registrando Service Worker...');

    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none' // Always check for updates
    });

    console.log('✅ Service Worker registrado:', registration.scope);

    // Check for updates periodically
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000); // Every hour

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      console.log('🆕 Nova versão do Service Worker encontrada');

      newWorker?.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          console.log('✨ Nova versão disponível! Recarregue a página para atualizar.');
          
          // Notify user
          if (confirm('Nova versão disponível! Deseja recarregar a página?')) {
            window.location.reload();
          }
        }
      });
    });

    // Handle controller change (when new SW takes over)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('🔄 Service Worker atualizado, recarregando...');
      window.location.reload();
    });

    return registration;
  } catch (error) {
    console.error('❌ Falha ao registrar Service Worker:', error);
    return null;
  }
}

/**
 * Unregister Service Worker (para debug/manutenção)
 */
export async function unregisterServiceWorker(): Promise<boolean> {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.unregister();
      console.log('✅ Service Worker removido');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ Falha ao remover Service Worker:', error);
    return false;
  }
}

/**
 * Request push notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    console.warn('Notificações não suportadas neste navegador');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    console.log('🔔 Permissão de notificação:', permission);
    return permission;
  }

  return Notification.permission;
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration): Promise<PushSubscription | null> {
  try {
    const permission = await requestNotificationPermission();
    
    if (permission !== 'granted') {
      console.warn('Permissão de notificação negada');
      return null;
    }

    // Generate VAPID key (você precisará adicionar sua chave)
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
    
    if (!vapidPublicKey) {
      console.warn('VAPID public key não configurada');
      return null;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
    });

    console.log('✅ Inscrito em push notifications:', subscription.endpoint);

    // Send subscription to your backend
    // await sendSubscriptionToBackend(subscription);

    return subscription;
  } catch (error) {
    console.error('❌ Falha ao inscrever em push notifications:', error);
    return null;
  }
}

/**
 * Helper: Convert VAPID key
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

/**
 * Check if app is installed as PWA
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true ||
    document.referrer.includes('android-app://')
  );
}

/**
 * Prompt to install PWA
 */
export function setupInstallPrompt(): void {
  let deferredPrompt: any = null;

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    console.log('💾 PWA pode ser instalado');

    // Show custom install button
    const installButton = document.getElementById('pwa-install-button');
    if (installButton) {
      installButton.style.display = 'block';
      installButton.addEventListener('click', async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`PWA install outcome: ${outcome}`);
        
        deferredPrompt = null;
        installButton.style.display = 'none';
      });
    }
  });

  window.addEventListener('appinstalled', () => {
    console.log('✅ PWA instalado com sucesso!');
    deferredPrompt = null;
  });
}

