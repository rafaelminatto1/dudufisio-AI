/**
 * 🔧 SERVICE WORKER - DUDUFISIO-AI
 *
 * Service Worker completo para DuduFisio-AI com suporte a:
 * - Push notifications
 * - Cache inteligente
 * - Offline functionality
 * - Background sync
 * - Notificações interativas
 */

const CACHE_NAME = 'dudufisio-ai-v1.1.0';
const API_CACHE = 'dudufisio-api-v1.1.0';

// Recursos essenciais para cache
const ESSENTIAL_RESOURCES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/badge-72x72.png'
];

// URLs de API para cache
const API_URLS = [
  '/api/patients',
  '/api/appointments',
  '/api/therapists'
];

// 🚀 INSTALAÇÃO DO SERVICE WORKER
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker instalando...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Cache criado, adicionando recursos essenciais');
        return cache.addAll(ESSENTIAL_RESOURCES);
      })
      .catch((error) => {
        console.error('❌ Erro ao criar cache:', error);
      })
  );

  // Força ativação imediata
  self.skipWaiting();
});

// 🔄 ATIVAÇÃO DO SERVICE WORKER
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker ativando...');

  event.waitUntil(
    Promise.all([
      // Limpar caches antigos
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== API_CACHE) {
              console.log('🗑️ Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Assumir controle de todas as páginas
      self.clients.claim()
    ])
  );

  console.log('✅ Service Worker ativado');
});

// 🌐 INTERCEPTAÇÃO DE REQUESTS
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip chrome-extension, webpack-internal, and other special protocols
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return;
  }

  // Skip Vite HMR and dev server special requests
  if (url.pathname.includes('/@vite/') ||
      url.pathname.includes('/@id/') ||
      url.pathname.includes('/@react-refresh') ||
      url.pathname.includes('/__vite') ||
      url.pathname.includes('node_modules') ||
      url.pathname.endsWith('.tsx') ||
      url.pathname.endsWith('.ts') ||
      url.pathname.endsWith('.jsx') ||
      url.pathname.endsWith('.js') ||
      url.search.includes('?v=') ||
      url.search.includes('html-proxy') ||
      url.search.includes('direct')) {
    return;
  }

  // Skip WebSocket connections
  if (request.headers.get('upgrade') === 'websocket') {
    return;
  }

  // Skip requests to external domains that might cause issues
  if (url.hostname.includes('dummy.supabase.co') ||
      url.hostname.includes('mock.supabase.local') ||
      (url.hostname !== 'localhost' && url.hostname !== '127.0.0.1')) {

    // For mock Supabase URLs, return a mock response to prevent CORS errors
    if (url.hostname.includes('mock.supabase.local') || url.hostname.includes('dummy.supabase.co')) {
      event.respondWith(new Response(JSON.stringify({
        error: 'Mock mode - no real connection',
        message: 'Using mock data for development',
        data: []
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization'
        }
      }));
    }

    return; // Let the browser handle other external requests normally
  }

  // Estratégias diferentes baseadas no tipo de resource
  if (request.method === 'GET') {
    try {
      if (url.pathname.includes('/api/')) {
        // API requests - Network First com fallback para cache
        event.respondWith(networkFirstStrategy(request));
      } else if (ESSENTIAL_RESOURCES.includes(url.pathname)) {
        // Recursos essenciais - Cache First
        event.respondWith(cacheFirstStrategy(request));
      } else {
        // Outros recursos - Stale While Revalidate
        event.respondWith(staleWhileRevalidateStrategy(request));
      }
    } catch (error) {
      console.error('❌ Service Worker fetch error:', error);
      // Don't respond with anything, let the browser handle it
    }
  }
});

// 📱 PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  console.log('📱 Push notification recebida');

  if (!event.data) {
    console.warn('⚠️ Push event sem dados');
    return;
  }

  try {
    const data = event.data.json();
    console.log('📋 Dados da push notification:', data);

    const options = {
      body: data.body || 'Você tem uma nova notificação',
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      image: data.image,
      data: data.data || {},
      actions: data.actions || [
        {
          action: 'open',
          title: 'Abrir',
          icon: '/icon-open.png'
        },
        {
          action: 'dismiss',
          title: 'Dispensar',
          icon: '/icon-close.png'
        }
      ],
      tag: data.tag || 'dudufisio-notification',
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: data.timestamp || Date.now(),
      vibrate: [200, 100, 200], // Padrão de vibração
      dir: 'ltr',
      lang: 'pt-BR'
    };

    event.waitUntil(
      self.registration.showNotification(
        data.title || 'DuduFisio-AI',
        options
      ).then(() => {
        console.log('✅ Notificação exibida com sucesso');

        // Registrar analytics
        trackNotificationEvent('displayed', data);
      }).catch((error) => {
        console.error('❌ Erro ao exibir notificação:', error);
      })
    );

  } catch (error) {
    console.error('❌ Erro ao processar push notification:', error);

    // Fallback para notificação simples
    event.waitUntil(
      self.registration.showNotification('DuduFisio-AI', {
        body: 'Você tem uma nova notificação',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png'
      })
    );
  }
});

// 🖱️ CLIQUES EM NOTIFICAÇÕES
self.addEventListener('notificationclick', (event) => {
  console.log('🖱️ Notificação clicada:', event.action);

  const { notification, action } = event;
  const data = notification.data || {};

  event.notification.close();

  // Registrar analytics
  trackNotificationEvent('clicked', { action, ...data });

  event.waitUntil(
    handleNotificationClick(action, data)
  );
});

// 🔕 FECHAMENTO DE NOTIFICAÇÕES
self.addEventListener('notificationclose', (event) => {
  console.log('🔕 Notificação fechada');

  const data = event.notification.data || {};
  trackNotificationEvent('closed', data);
});

// 🔄 BACKGROUND SYNC
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event.tag);

  if (event.tag === 'background-sync-appointments') {
    event.waitUntil(syncAppointments());
  } else if (event.tag === 'background-sync-notifications') {
    event.waitUntil(syncNotifications());
  }
});

// 📡 ESTRATÉGIAS DE CACHE

// Network First - Prioriza rede, fallback para cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(API_CACHE);
      // Clone the response before caching to avoid "body already used" error
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    console.log('🌐 Network falhou, buscando no cache:', request.url);

    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Retornar resposta offline para APIs
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'Dados não disponíveis offline'
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache First - Prioriza cache, fallback para rede
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      // Clone the response before caching to avoid "body already used" error
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }

    return networkResponse;
  } catch (error) {
    // Fallback para página offline
    if (request.destination === 'document') {
      return caches.match('/offline.html');
    }

    throw error;
  }
}

// Stale While Revalidate - Retorna cache e atualiza em background
async function staleWhileRevalidateStrategy(request) {
  try {
    const cachedResponse = await caches.match(request);

    // Create fetch promise with proper error handling
    const fetchPromise = fetch(request)
      .then((networkResponse) => {
        // Only cache successful responses
        if (networkResponse && networkResponse.ok && networkResponse.status < 400) {
          // Clone BEFORE any other operation to avoid "body already used" error
          const responseToCache = networkResponse.clone();

          // Cache in background without blocking
          caches.open(CACHE_NAME)
            .then(cache => cache.put(request, responseToCache))
            .catch(() => {
              // Silently fail cache writes - not critical
            });
        }
        return networkResponse;
      })
      .catch(() => {
        // Network error - silently fail
        // Return null on error, will be handled below
        return null;
      });

    // Se tem cache, retorna imediatamente
    if (cachedResponse) {
      // Atualiza em background (não bloqueia)
      fetchPromise.catch(() => {});
      return cachedResponse;
    }

    // Se não tem cache, aguarda a rede
    const response = await fetchPromise;

    // Se a rede também falhou, retorna erro 503
    if (!response) {
      return new Response('Service Unavailable', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    return response;
  } catch (error) {
    // Silently fail - don't log errors that might spam the console
    // Return a proper error response
    return new Response('Internal Error', {
      status: 500,
      statusText: 'Internal Server Error',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// 🎯 HANDLERS DE NOTIFICAÇÃO

async function handleNotificationClick(action, data) {
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // URL para abrir baseada na ação
  let urlToOpen = '/';

  if (action === 'open' || action === undefined) {
    if (data.actionUrl) {
      urlToOpen = data.actionUrl;
    } else if (data.appointmentId) {
      urlToOpen = `/appointments/${data.appointmentId}`;
    } else if (data.patientId) {
      urlToOpen = `/patients/${data.patientId}`;
    }
  } else if (action === 'dismiss') {
    // Apenas fechar - não abrir nada
    return;
  }

  // Verificar se já existe uma janela aberta
  const existingClient = clients.find(client =>
    client.url.includes(new URL(urlToOpen, self.location.origin).pathname)
  );

  if (existingClient) {
    // Focar na janela existente
    await existingClient.focus();

    // Navegar para a URL se necessário
    if (existingClient.navigate) {
      await existingClient.navigate(urlToOpen);
    }
  } else {
    // Abrir nova janela
    await self.clients.openWindow(urlToOpen);
  }
}

// 📊 ANALYTICS E TRACKING

function trackNotificationEvent(eventType, data) {
  // Em produção, enviar para serviço de analytics
  console.log(`📊 Notification ${eventType}:`, data);

  // Armazenar no IndexedDB para sync posterior
  if ('indexedDB' in self) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data,
      userAgent: navigator.userAgent
    };

    // Implementar storage no IndexedDB aqui se necessário
  }
}

// 🔄 SYNC FUNCTIONS

async function syncAppointments() {
  try {
    console.log('🔄 Sincronizando appointments...');

    // Implementar sync de appointments
    const response = await fetch('/api/appointments/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Appointments sincronizados');
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar appointments:', error);
    throw error; // Re-schedule sync
  }
}

async function syncNotifications() {
  try {
    console.log('🔄 Sincronizando notifications...');

    // Implementar sync de notifications
    const response = await fetch('/api/notifications/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      console.log('✅ Notifications sincronizadas');
    }
  } catch (error) {
    console.error('❌ Erro ao sincronizar notifications:', error);
    throw error; // Re-schedule sync
  }
}

// 🚨 ERROR HANDLING
self.addEventListener('error', (event) => {
  console.error('❌ Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('❌ Service Worker unhandled rejection:', event.reason);
});

console.log('🚀 Service Worker DuduFisio-AI carregado');