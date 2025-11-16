import React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './index.css';
import AppRoutes from './AppRoutes';
// Importações adiadas para pós-render

// Preload theme ANTES de render para evitar flash
import('./lib/themePreloader').then(({ preloadTheme }) => {
  preloadTheme().catch(() => console.warn('Theme preload failed'));
});

// Performance mark - início do app
try { performance.mark('app_start'); } catch {}

// Prefetch crítico do LoginPage e AuthRoutes logo após o boot
if (typeof window !== 'undefined') {
  const runWhenIdle = (cb: () => void) => {
    if (typeof (window as any).requestIdleCallback === 'function') {
      (window as any).requestIdleCallback(cb, { timeout: 1000 });
    } else {
      setTimeout(cb, 0);
    }
  };
  
  runWhenIdle(() => {
    import('./pages/auth/LoginPage');
    import('./pages/auth/AuthRoutes');
  });
}

// Configure React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (antigo cacheTime)
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Inicializar sistema de monitoramento de erros (adiado)
import('./lib/monitoring/initMonitoring').then(m => m.initMonitoring()).catch(() => {});

// Monitoramento contínuo de performance (dev e prod)
import('./lib/debugHelpers').then(({ startPerformanceMonitoring }) => {
  try {
    startPerformanceMonitoring();
  } catch (e) {
    console.warn('PerformanceObserver indisponível:', e);
  }
});

// Web Vitals monitoring (apenas em produção)
if (import.meta.env.PROD) {
  import('./lib/analytics/webVitalsTracker').then(({ initWebVitalsTracking }) => {
    initWebVitalsTracking();
  }).catch(() => {
    console.warn('Failed to load Web Vitals tracker');
  });
}

console.log('🚀 Starting React application...');
console.log('📦 Environment:', import.meta.env.MODE);
console.log('🔍 Production mode:', import.meta.env.PROD);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  alert('ERRO: Elemento root não encontrado!');
} else {
  console.log('✅ Root element found');
  try {
    console.log('🎨 Creating React root...');
    const root = createRoot(rootElement);
    console.log('⚛️ Rendering React app...');
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
          {!import.meta.env.PROD && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log('🎉 React application rendered successfully!');

    // Register Service Worker for Push Notifications
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/firebase-messaging-sw.js')
        .then((registration) => {
          console.log('✅ [Push Notifications] Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('❌ [Push Notifications] Service Worker registration failed:', error);
        });
    }

    // Performance mark - após render
    try {
      performance.mark('app_rendered');
      performance.measure('time_to_first_render', 'app_start', 'app_rendered');
    } catch {}

    // Registrar service worker unificado para offline cache (adiado para não bloquear render)
    import('./lib/serviceWorker').then(({ 
      registerServiceWorker, 
      setupInstallPrompt,
      setupNetworkListeners 
    }) => {
      registerServiceWorker({
        onSuccess: () => {
          console.log('✅ Service worker registered successfully - App ready for offline use');
        },
        onUpdate: (registration) => {
          console.log('🔄 New service worker version available');
          // Notificação será mostrada pelo UnifiedOfflineIndicator
        },
        onError: (error) => {
          console.error('❌ Service worker registration failed:', error);
        },
        enablePeriodicUpdates: true, // Verificar atualizações periodicamente
        updateInterval: 2 * 60 * 60 * 1000, // 2 horas
      });

      // Configurar prompt de instalação PWA
      setupInstallPrompt(
        (prompt) => {
          console.log('💾 PWA pode ser instalado');
          // Prompt disponível para uso posterior
        },
        () => {
          console.log('✅ PWA instalado com sucesso!');
        }
      );

      // Configurar listeners de rede (opcional - o SafeOfflineContext já faz isso)
      setupNetworkListeners(
        () => console.log('🟢 Voltou online'),
        () => console.log('🔴 Ficou offline')
      );
    }).catch((error) => {
      console.error('❌ Erro ao carregar service worker module:', error);
    });

  } catch (error) {
    console.error('💥 Error rendering React app:', error);
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Erro ao carregar aplicação</h1>
        <p>Detalhes: ${error}</p>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar
        </button>
      </div>
    `;
  }
}
