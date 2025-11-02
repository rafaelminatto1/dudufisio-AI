/**
 * 🚀 SERVICE WORKER - OFFLINE CACHE STRATEGY
 *
 * Estratégias de cache implementadas:
 * - Cache-First: Assets estáticos (JS, CSS, imagens)
 * - Network-First: Dados dinâmicos (API calls)
 * - Stale-While-Revalidate: UI components
 */

const CACHE_VERSION = 'v1.1.0';
const STATIC_CACHE = `fisioflow-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `fisioflow-dynamic-${CACHE_VERSION}`;
const API_CACHE = `fisioflow-api-${CACHE_VERSION}`;
const VENDOR_CACHE = `fisioflow-vendor-${CACHE_VERSION}`; // Cache separado para vendors

// Assets estáticos para cache (cache-first)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
];

// ✅ CORRIGIDO: Vendor único agora
const CRITICAL_VENDORS = [
  'vendor',  // Único chunk vendor com TODAS as bibliotecas
];

// Estratégias de cache por padrão de URL
const CACHE_STRATEGIES = {
  // Cache-First: Assets estáticos (cache imutável)
  cacheFirst: [
    /\/assets\/.*\.js$/,        // JS chunks com hash
    /\/assets\/.*\.css$/,       // CSS com hash
    /\/assets\/vendor-.*\.js$/, // Vendor chunks (longa duração)
    /\.woff2?$/,                // Fontes
    /\.webp$/,                  // Imagens otimizadas
    /\.png$/,
    /\.jpg$/,
    /\.jpeg$/,
    /\.svg$/,
    /\.ico$/,
  ],

  // Network-First: APIs e dados dinâmicos
  networkFirst: [
    /\/api\//,
    /\/supabase\//,
    /gemini/,
    /openai/,
    /anthropic/,
  ],

  // Stale-While-Revalidate: UI components e páginas
  staleWhileRevalidate: [
    /\/components\//,
    /\/pages\//,
    /\/index\.html$/,
  ],
};

// Configuração de TTL para caches (otimizado para runtime performance)
const CACHE_TTL = {
  static: 30 * 24 * 60 * 60 * 1000,     // 30 dias (assets com hash)
  vendor: 90 * 24 * 60 * 60 * 1000,     // 90 dias (vendors mudam raramente)
  dynamic: 24 * 60 * 60 * 1000,         // 1 dia
  api: 5 * 60 * 1000,                   // 5 minutos
};

/**
 * Install Event - Cache assets estáticos
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting(); // Ativar imediatamente
      })
      .catch((error) => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

/**
 * Activate Event - Limpar caches antigos
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remover caches antigos (mantém apenas versão atual)
              return cacheName.startsWith('fisioflow-') &&
                     cacheName !== STATIC_CACHE &&
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== API_CACHE &&
                     cacheName !== VENDOR_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim(); // Controlar páginas imediatamente
      })
  );
});

/**
 * Fetch Event - Estratégias de cache
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não-GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar chrome extensions e outras URLs não-http
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Determinar estratégia baseada na URL
  const strategy = determineStrategy(url);

  switch (strategy) {
    case 'cache-first':
      event.respondWith(cacheFirst(request));
      break;
    case 'network-first':
      event.respondWith(networkFirst(request));
      break;
    case 'stale-while-revalidate':
      event.respondWith(staleWhileRevalidate(request));
      break;
    default:
      event.respondWith(fetch(request));
  }
});

/**
 * Determinar estratégia de cache baseada na URL
 */
function determineStrategy(url) {
  const pathname = url.pathname;

  // Cache-First para assets estáticos
  if (CACHE_STRATEGIES.cacheFirst.some(pattern => pattern.test(pathname))) {
    return 'cache-first';
  }

  // Network-First para APIs
  if (CACHE_STRATEGIES.networkFirst.some(pattern => pattern.test(pathname))) {
    return 'network-first';
  }

  // Stale-While-Revalidate para components
  if (CACHE_STRATEGIES.staleWhileRevalidate.some(pattern => pattern.test(pathname))) {
    return 'stale-while-revalidate';
  }

  return 'network-only';
}

/**
 * Cache-First Strategy (otimizado para runtime performance)
 * Busca no cache primeiro, fallback para network
 */
async function cacheFirst(request) {
  try {
    const cached = await caches.match(request);
    const url = request.url;
    
    // Determinar cache correto e TTL baseado no tipo de asset
    const isVendor = /\/assets\/vendor-.*\.js$/.test(url);
    const cacheName = isVendor ? VENDOR_CACHE : STATIC_CACHE;
    const ttl = isVendor ? CACHE_TTL.vendor : CACHE_TTL.static;

    if (cached) {
      // Verificar TTL
      const cacheTime = await getCacheTime(cacheName, url);
      const now = Date.now();

      if (cacheTime && (now - cacheTime) < ttl) {
        console.log(`[SW] Cache hit (${isVendor ? 'vendor' : 'static'}):`, url);
        return cached;
      }
    }

    // Se não está no cache ou expirou, buscar na network
    console.log('[SW] Cache miss, fetching:', url);
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, response.clone());
      await setCacheTime(cacheName, url, Date.now());
    }

    return response;
  } catch (error) {
    console.error('[SW] Cache-first failed:', error);

    // Fallback para cache mesmo se expirado
    const cached = await caches.match(request);
    if (cached) {
      console.log('[SW] Serving expired cache due to network error');
      return cached;
    }

    // Retornar página offline se disponível
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline.html');
      if (offlinePage) return offlinePage;
    }

    throw error;
  }
}

/**
 * Network-First Strategy
 * Tenta network primeiro, fallback para cache
 */
async function networkFirst(request) {
  try {
    console.log('[SW] Fetching from network (network-first):', request.url);
    const response = await fetch(request);

    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      await cache.put(request, response.clone());
      await setCacheTime(API_CACHE, request.url, Date.now());
    }

    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', error.message);

    const cached = await caches.match(request);

    if (cached) {
      // Verificar TTL
      const cacheTime = await getCacheTime(API_CACHE, request.url);
      const now = Date.now();

      if (!cacheTime || (now - cacheTime) < CACHE_TTL.api) {
        console.log('[SW] Serving from cache (network-first):', request.url);
        return cached;
      }
    }

    throw error;
  }
}

/**
 * Stale-While-Revalidate Strategy
 * Retorna cache imediatamente e atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(DYNAMIC_CACHE);
        cache.then(c => {
          c.put(request, response.clone());
          setCacheTime(DYNAMIC_CACHE, request.url, Date.now());
        });
      }
      return response;
    })
    .catch((error) => {
      console.warn('[SW] Background fetch failed:', error);
    });

  // Retornar cache se disponível, senão esperar network
  if (cached) {
    console.log('[SW] Serving stale cache, revalidating:', request.url);
    return cached;
  }

  console.log('[SW] No cache, waiting for network:', request.url);
  return fetchPromise;
}

/**
 * Helpers para gerenciar TTL do cache
 */
async function setCacheTime(cacheName, url, timestamp) {
  const cache = await caches.open(`${cacheName}-meta`);
  await cache.put(
    new Request(url + '-timestamp'),
    new Response(timestamp.toString())
  );
}

async function getCacheTime(cacheName, url) {
  try {
    const cache = await caches.open(`${cacheName}-meta`);
    const response = await cache.match(url + '-timestamp');
    if (response) {
      const text = await response.text();
      return parseInt(text, 10);
    }
  } catch (error) {
    console.warn('[SW] Failed to get cache time:', error);
  }
  return null;
}

/**
 * Background Sync - Sincronizar dados quando online
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }

  if (event.tag === 'sync-patient-data') {
    event.waitUntil(syncPatientData());
  }
});

async function syncAppointments() {
  // Implementar lógica de sincronização
  console.log('[SW] Syncing appointments...');
  // TODO: Buscar dados pendentes do IndexedDB e enviar para API
}

async function syncPatientData() {
  // Implementar lógica de sincronização
  console.log('[SW] Syncing patient data...');
  // TODO: Buscar dados pendentes do IndexedDB e enviar para API
}

/**
 * Message Event - Comunicação com o app
 */
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }

  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }

  if (event.data.action === 'getCacheSize') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({ size });
      })
    );
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;

  for (const cacheName of cacheNames) {
    const cache = await caches.open(cacheName);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const blob = await response.blob();
        totalSize += blob.size;
      }
    }
  }

  return totalSize;
}

/**
 * Push Notification - Notificações push
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  const data = event.data ? event.data.json() : {};
  const title = data.title || 'FisioFlow';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url,
    vibrate: [200, 100, 200],
    tag: data.tag || 'notification',
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification Click - Abrir app ao clicar
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked');

  event.notification.close();

  const urlToOpen = event.notification.data || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Se já existe uma janela aberta, focar nela
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }

        // Senão, abrir nova janela
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

console.log('[SW] Service worker loaded successfully');
