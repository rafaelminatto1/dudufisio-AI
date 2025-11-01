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

// Web Vitals monitoring (apenas em produção)
if (import.meta.env.PROD) {
  import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
    onCLS(console.log);
    onFCP(console.log);
    onLCP(console.log);
    onTTFB(console.log);
    onINP(console.log);
  });
}

console.log('🚀 Starting React application...');

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
          {!import.meta.env.PROD && <ReactQueryDevtools initialIsOpen={false} />}
        </QueryClientProvider>
      </React.StrictMode>
    );
    console.log('🎉 React application rendered successfully!');

    // Performance mark - após render
    try {
      performance.mark('app_rendered');
      performance.measure('time_to_first_render', 'app_start', 'app_rendered');
    } catch {}

    // Registrar service worker para offline cache (adiado)
    import('./lib/serviceWorkerRegistration').then(({ registerServiceWorker }) => registerServiceWorker({
      onSuccess: () => {
        console.log('✅ Service worker registered successfully - App ready for offline use');
      },
      onUpdate: (registration) => {
        console.log('🔄 New service worker version available');
        // Notificação de atualização será mostrada automaticamente
      },
      onError: (error) => {
        console.error('❌ Service worker registration failed:', error);
      },
    })).catch(() => {});

    // Registrar Service Worker avançado (PWA Enterprise)
    import('./lib/registerSW').then(({ registerServiceWorker: registerAdvancedSW, setupInstallPrompt }) => {
      registerAdvancedSW().then(reg => {
        if (reg) {
          console.log('🚀 PWA Service Worker registrado');
          setupInstallPrompt();
        }
      });
    }).catch(() => {});

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
