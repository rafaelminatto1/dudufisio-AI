/**
 * 🔧 DESABILITA SERVICE WORKER - MODO DESENVOLVIMENTO
 * 
 * Use este script para desabilitar o Service Worker durante desenvolvimento
 * quando houver conflitos com o WebSocket do Vite
 */

// Desregistra todos os Service Workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister().then(success => {
        if (success) {
          console.log('✅ Service Worker desregistrado:', registration.scope);
        }
      });
    });
  });

  // Limpa todos os caches
  caches.keys().then(cacheNames => {
    cacheNames.forEach(cacheName => {
      caches.delete(cacheName).then(success => {
        if (success) {
          console.log('✅ Cache removido:', cacheName);
        }
      });
    });
  });

  console.log('🔧 Service Worker desabilitado. Recarregue a página.');
}

