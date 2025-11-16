// Service Worker Registration
// Registrar SW apenas em produção para evitar cache em dev (que pode quebrar HMR)
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('✅ ServiceWorker registration successful with scope: ', registration.scope);

        if (Notification.permission === 'default') {
          console.log('📱 Notification permission not set, will request when user interacts');
        }
      },
      (err) => {
        console.log('❌ ServiceWorker registration failed: ', err);
      }
    );
  });
} else {
  console.log('[SW] Service worker disabled in development');
}
