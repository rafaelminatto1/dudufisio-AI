const CACHE_NAME = 'fisioflow-v6';
const APP_SHELL_URLS = [
  // Local app shell - Core files for the application to run
  '/',
  '/index.html',
  '/index.tsx',
  '/App.tsx',
  '/AppRoutes.tsx',
  '/types.ts',
  '/layouts/MainLayout.tsx',
  '/components/Sidebar.tsx',
  '/contexts/AuthContext.tsx',
  '/contexts/DataContext.tsx',
  '/contexts/ToastContext.tsx',
  '/services/authService.ts',
  '/services/patientService.ts',
  '/services/appointmentService.ts',
  '/services/mockDb.ts',
  '/data/mockData.ts',

  // Critical CDN assets from script tags
  'https://cdn.tailwindcss.com',
];

// Install event: precache the app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
      .catch(error => {
        console.error('Service Worker: Failed to cache app shell:', error);
      })
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event: apply different strategies based on the request
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }

  const url = new URL(event.request.url);

  const isAppShellUrl = APP_SHELL_URLS.some(shellUrl => {
    if (shellUrl.startsWith('http')) {
        return url.href === shellUrl;
    }
    return url.origin === self.origin && url.pathname === shellUrl;
  });

  if (isAppShellUrl) {
    // "Cache, then network" strategy for the app shell (Cache falling back to network)
    event.respondWith(
      caches.match(event.request).then(responseFromCache => {
        if (responseFromCache) {
          return responseFromCache;
        }
        return fetch(event.request).then(responseFromNetwork => {
          const responseToCache = responseFromNetwork.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return responseFromNetwork;
        });
      })
    );
  } else {
    // "Stale-while-revalidate" strategy for other assets
    event.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
          // Return from cache immediately if available, otherwise wait for network
          return response || fetchPromise;
        });
      })
    );
  }
});