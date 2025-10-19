import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import AppRoutes from './AppRoutes';
import { registerServiceWorker } from './lib/serviceWorkerRegistration';

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
        <AppRoutes />
      </React.StrictMode>
    );
    console.log('🎉 React application rendered successfully!');

    // Registrar service worker para offline cache
    registerServiceWorker({
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
