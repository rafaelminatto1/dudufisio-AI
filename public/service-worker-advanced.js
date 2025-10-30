/**
 * 🚀 Service Worker Avançado - DuduFisio-AI
 * 
 * Implementa cache inteligente e funcionalidade offline
 * Versão: 1.0.0
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAMES = {
  static: `dudufisio-static-${CACHE_VERSION}`,
  dynamic: `dudufisio-dynamic-${CACHE_VERSION}`,
  api: `dudufisio-api-${CACHE_VERSION}`,
  images: `dudufisio-images-${CACHE_VERSION}`
};

// Assets críticos para precache
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

// Rotas de API para cache
const API_CACHE_ROUTES = [
  '/api/patients',
  '/api/therapists',
  '/api/appointments'
];

// TTL de cache (em segundos)
const CACHE_TTL = {
  static: 7 * 24 * 60 * 60, // 7 dias
  dynamic: 24 * 60 * 60,     // 1 dia
  api: 5 * 60,               // 5 minutos
  images: 30 * 24 * 60 * 60  // 30 dias
};

/**
 * Instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('🚀 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

/**
 * Ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('🎯 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove caches antigos
              return !Object.values(CACHE_NAMES).includes(cacheName);
            })
            .map((cacheName) => {
              console.log(`🗑️ Service Worker: Deleting old cache: ${cacheName}`);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

/**
 * Interceptação de requisições
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de outros domínios (exceto APIs conhecidas)
  if (url.origin !== location.origin && !url.href.includes('supabase')) {
    return;
  }

  // Estratégia baseada no tipo de recurso
  if (request.method === 'GET') {
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirst(request, CACHE_NAMES.static));
    } else if (isImage(url)) {
      event.respondWith(cacheFirst(request, CACHE_NAMES.images));
    } else if (isApiRequest(url)) {
      event.respondWith(networkFirstWithCache(request, CACHE_NAMES.api));
    } else {
      event.respondWith(staleWhileRevalidate(request, CACHE_NAMES.dynamic));
    }
  }
});

/**
 * Estratégia: Cache First
 * Prioriza o cache, fallback para network
 */
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Verifica se o cache expirou
      const cacheTime = await getCacheTime(request, cacheName);
      const ttl = CACHE_TTL.static * 1000;
      
      if (cacheTime && Date.now() - cacheTime < ttl) {
        return cachedResponse;
      }
    }

    // Busca na rede
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      await setCacheTime(request, cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('Cache First strategy failed:', error);
    
    // Tenta retornar do cache mesmo se expirado
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retorna página offline
    return caches.match('/offline.html');
  }
}

/**
 * Estratégia: Network First with Cache
 * Prioriza a rede, fallback para cache
 */
async function networkFirstWithCache(request, cacheName) {
  try {
    const networkResponse = await Promise.race([
      fetch(request),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), 3000)
      )
    ]);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      await setCacheTime(request, cacheName);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      // Adiciona header indicando que veio do cache
      const headers = new Headers(cachedResponse.headers);
      headers.append('X-From-Cache', 'true');
      
      return new Response(cachedResponse.body, {
        status: cachedResponse.status,
        statusText: cachedResponse.statusText,
        headers
      });
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline', cached: false }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

/**
 * Estratégia: Stale While Revalidate
 * Retorna do cache imediatamente e atualiza em background
 */
async function staleWhileRevalidate(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then(async (networkResponse) => {
      if (networkResponse.ok) {
        const cache = await caches.open(cacheName);
        cache.put(request, networkResponse.clone());
        await setCacheTime(request, cacheName);
      }
      return networkResponse;
    })
    .catch((error) => {
      console.log('Background fetch failed:', error);
      return cachedResponse;
    });
  
  return cachedResponse || fetchPromise;
}

/**
 * Helpers para identificar tipos de recurso
 */
function isStaticAsset(url) {
  const staticExtensions = ['.js', '.css', '.woff', '.woff2', '.ttf', '.eot'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function isImage(url) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
  return imageExtensions.some(ext => url.pathname.endsWith(ext));
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/') || 
         url.href.includes('supabase.co');
}

/**
 * Gerenciamento de TTL de cache
 */
async function setCacheTime(request, cacheName) {
  const key = `${cacheName}-${request.url}`;
  try {
    const cache = await caches.open('cache-metadata');
    // ✅ FIX: Usar URL válida com scheme https para evitar erro "Request scheme unsupported"
    await cache.put(
      new Request(`https://cache-metadata/${encodeURIComponent(key)}`),
      new Response(Date.now().toString())
    );
  } catch (error) {
    console.error('Error setting cache time:', error);
  }
}

async function getCacheTime(request, cacheName) {
  const key = `${cacheName}-${request.url}`;
  try {
    const cache = await caches.open('cache-metadata');
    // ✅ FIX: Usar URL válida com scheme https para evitar erro "Request scheme unsupported"
    const response = await cache.match(new Request(`https://cache-metadata/${encodeURIComponent(key)}`));
    if (response) {
      const timeStr = await response.text();
      return parseInt(timeStr);
    }
  } catch (error) {
    console.error('Error getting cache time:', error);
  }
  return null;
}

/**
 * Background Sync para requisições offline
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered');
  
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
});

async function syncAppointments() {
  // Implementar lógica de sincronização
  console.log('📅 Syncing appointments...');
}

/**
 * Push Notifications
 */
self.addEventListener('push', (event) => {
  console.log('📬 Service Worker: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'DuduFisio-AI';
  const options = {
    body: data.body || 'Nova notificação',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * Notification Click
 */
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked');
  
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/')
  );
});

/**
 * Message handler para comunicação com a página
 */
self.addEventListener('message', (event) => {
  console.log('💬 Service Worker: Message received', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

console.log('✨ Service Worker: Loaded and ready!');
