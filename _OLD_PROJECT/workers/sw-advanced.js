/**
 * Advanced Service Worker com Workbox
 * Estratégias de cache inteligentes e background sync
 */

importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.0.0/workbox-sw.js');

const { precacheAndRoute } = workbox.precaching;
const { registerRoute } = workbox.routing;
const { CacheFirst, NetworkFirst, StaleWhileRevalidate, NetworkOnly } = workbox.strategies;
const { ExpirationPlugin } = workbox.expiration;
const { CacheableResponsePlugin } = workbox.cacheableResponse;
const { BackgroundSyncPlugin } = workbox.backgroundSync;

// Version
const VERSION = '2.0.0';
const CACHE_PREFIX = 'fisioflow';

// Precache assets (será preenchido automaticamente no build)
precacheAndRoute(self.__WB_MANIFEST || []);

// API requests - Network First com fallback
registerRoute(
  ({ url }) => url.origin === self.location.origin && url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: `${CACHE_PREFIX}-api-${VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 5 * 60 // 5 minutes
      }),
      new BackgroundSyncPlugin('apiQueue', {
        maxRetentionTime: 24 * 60 // Retry for up to 24 hours
      })
    ]
  })
);

// Supabase API - Network Only (sempre buscar dados frescos)
registerRoute(
  ({ url }) => url.hostname.includes('supabase.co'),
  new NetworkOnly({
    plugins: [
      new BackgroundSyncPlugin('supabaseQueue', {
        maxRetentionTime: 48 * 60
      })
    ]
  })
);

// Images - Cache First
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-images-${VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 200,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Static assets (JS, CSS) - Stale While Revalidate
registerRoute(
  ({ request }) =>
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: `${CACHE_PREFIX}-static-${VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 7 * 24 * 60 * 60 // 7 days
      })
    ]
  })
);

// Google Fonts - Cache First
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: `${CACHE_PREFIX}-fonts-${VERSION}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60 // 1 year
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200]
      })
    ]
  })
);

// Fallback offline page
const OFFLINE_PAGE = '/offline.html';
const OFFLINE_IMAGE = '/offline-image.svg';

self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(`${CACHE_PREFIX}-offline-${VERSION}`).then((cache) => {
      return cache.addAll([OFFLINE_PAGE, OFFLINE_IMAGE]);
    })
  );

  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith(CACHE_PREFIX) && !name.includes(VERSION))
          .map((name) => {
            console.log(`[SW] Deleting old cache: ${name}`);
            return caches.delete(name);
          })
      );
    })
  );

  self.clients.claim();
});

// Handle fetch errors with offline fallback
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_PAGE);
      })
    );
  }
});

// Background sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

async function syncAppointments() {
  console.log('[SW] Syncing appointments from background...');
  
  try {
    // Get pending sync items from IndexedDB
    const db = await openDB();
    const items = await getAllPendingSync(db);

    for (const item of items) {
      try {
        await syncItem(item);
        await markAsCompleted(db, item.id);
      } catch (error) {
        console.error('[SW] Failed to sync item:', item.id, error);
      }
    }

    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
    throw error;
  }
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FisioFlow';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/logo-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: data.data || {},
    actions: data.actions || [
      { action: 'open', title: 'Abrir' },
      { action: 'close', title: 'Fechar' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'open' || !event.action) {
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
        // Check if there's already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
    );
  }
});

// Periodic background sync (requires registration)
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncAppointments());
  }
});

// Helper: Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('FisioFlowDB', 1);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Helper: Get pending sync items
async function getAllPendingSync(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offlineQueue', 'readonly');
    const store = transaction.objectStore('offlineQueue');
    const request = store.getAll();

    request.onsuccess = () => {
      const items = request.result.filter(item => item.status === 'pending');
      resolve(items);
    };
    request.onerror = () => reject(request.error);
  });
}

// Helper: Mark item as completed
async function markAsCompleted(db, itemId) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('offlineQueue', 'readwrite');
    const store = transaction.objectStore('offlineQueue');
    const request = store.delete(itemId);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper: Sync individual item
async function syncItem(item) {
  // Implement actual sync logic based on item type
  console.log('[SW] Syncing item:', item.type, item.id);
  
  // This would call your API endpoints
  // For now, just log
  return Promise.resolve();
}

console.log(`[SW ${VERSION}] Loaded successfully`);

