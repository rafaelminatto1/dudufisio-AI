/**
 * Service Worker para DuduFisio-AI PWA
 * Implementa cache strategies, offline mode e push notifications
 */

const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `dudufisio-ai-${CACHE_VERSION}`;

// Recursos para cache imediato (App Shell)
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo-192.png',
  '/logo-512.png'
];

// Padrões de URLs que devem ser sempre buscados da rede
const NETWORK_FIRST_PATTERNS = [
  /\/api\//,
  /supabase/,
  /\.json$/
];

// Padrões de URLs que podem usar cache primeiro
const CACHE_FIRST_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.png$/,
  /\.jpg$/,
  /\.svg$/
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache dos recursos do App Shell');
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Service Worker instalado com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao instalar Service Worker:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              // Remove caches antigas
              return cacheName.startsWith('dudufisio-ai-') && cacheName !== CACHE_NAME;
            })
            .map((cacheName) => {
              console.log('[SW] Removendo cache antiga:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado');
        return self.clients.claim();
      })
  );
});

// Estratégia de cache para requisições
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requisições de outros domínios (exceto APIs conhecidas)
  if (url.origin !== location.origin && !url.href.includes('supabase')) {
    return;
  }

  // Network First: APIs e dados dinâmicos
  if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Cache First: Assets estáticos
  if (CACHE_FIRST_PATTERNS.some(pattern => pattern.test(request.url))) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Stale While Revalidate: Páginas HTML
  event.respondWith(staleWhileRevalidate(request));
});

/**
 * Network First Strategy
 * Tenta buscar da rede, fallback para cache se offline
 */
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    
    // Se a resposta for bem-sucedida, atualiza o cache
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.log('[SW] Rede falhou, buscando do cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Retorna página offline se disponível
    return caches.match('/offline.html') || new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Cache First Strategy
 * Busca do cache primeiro, fallback para rede
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    
    return response;
  } catch (error) {
    console.error('[SW] Erro ao buscar recurso:', error);
    return new Response('Resource not available', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

/**
 * Stale While Revalidate Strategy
 * Retorna cache imediatamente, atualiza em background
 */
async function staleWhileRevalidate(request) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request).then((response) => {
    if (response && response.ok) {
      // Clone ANTES de usar a resposta
      const responseToCache = response.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(request, responseToCache);
      });
    }
    return response;
  }).catch(() => {
    // Silenciosamente falha se offline
    return cachedResponse;
  });
  
  return cachedResponse || fetchPromise;
}

// Push Notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification recebida');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do DuduFisio-AI',
    icon: '/logo-192.png',
    badge: '/badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Abrir',
        icon: '/check-icon.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/close-icon.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('DuduFisio-AI', options)
  );
});

// Notification Click
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background Sync
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-appointments') {
    event.waitUntil(syncAppointments());
  }
  
  if (event.tag === 'sync-notes') {
    event.waitUntil(syncNotes());
  }
});

/**
 * Sincroniza agendamentos offline
 */
async function syncAppointments() {
  try {
    const cache = await caches.open('offline-data');
    const offlineAppointments = await cache.match('/offline/appointments');
    
    if (offlineAppointments) {
      const data = await offlineAppointments.json();
      
      // Envia dados para API
      await fetch('/api/appointments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      // Limpa dados offline após sincronização
      await cache.delete('/offline/appointments');
      
      console.log('[SW] Agendamentos sincronizados com sucesso');
    }
  } catch (error) {
    console.error('[SW] Erro ao sincronizar agendamentos:', error);
    throw error; // Re-throw para retry automático
  }
}

/**
 * Sincroniza notas offline
 */
async function syncNotes() {
  try {
    const cache = await caches.open('offline-data');
    const offlineNotes = await cache.match('/offline/notes');
    
    if (offlineNotes) {
      const data = await offlineNotes.json();
      
      await fetch('/api/notes/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      await cache.delete('/offline/notes');
      
      console.log('[SW] Notas sincronizadas com sucesso');
    }
  } catch (error) {
    console.error('[SW] Erro ao sincronizar notas:', error);
    throw error;
  }
}

// Mensagens do cliente
self.addEventListener('message', (event) => {
  console.log('[SW] Mensagem recebida:', event.data);
  
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
  
  if (event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_VERSION });
  }
});

console.log('[SW] Service Worker carregado');