// Script para desregistrar Service Workers antigos
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    registrations.forEach(registration => {
      registration.unregister().then(() => {
        console.log('✅ Service Worker desregistrado');
      });
    });
  });
  
  // Limpar caches antigos
  if ('caches' in window) {
    caches.keys().then(cacheNames => {
      cacheNames.forEach(cacheName => {
        caches.delete(cacheName).then(() => {
          console.log('✅ Cache limpo:', cacheName);
        });
      });
    });
  }
}
