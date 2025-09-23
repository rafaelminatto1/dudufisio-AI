
import { createRoot } from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { initSentry } from './lib/sentry';

// Initialize Sentry
initSentry();

console.log('🚀 Starting React application...');

// Capture React errors more specifically
window.addEventListener('error', (event) => {
  console.error('🔥 Global error caught:', event.error);
  if (event.error && event.error.message && event.error.message.includes('310')) {
    console.error('🎯 React error #310 detected!', event.error);
    console.error('Stack trace:', event.error.stack);
  }
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('🔥 Unhandled promise rejection:', event.reason);
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React app...');

  try {
    const root = createRoot(rootElement);
    root.render(
      <ErrorBoundary onError={(error, errorInfo) => {
        console.error('🚨 ErrorBoundary caught error:', error);
        console.error('🚨 ErrorBoundary error info:', errorInfo);
      }}>
        <App />
      </ErrorBoundary>
    );
    console.log('🎉 React application rendered successfully!');
  } catch (error) {
    console.error('💥 Error rendering React app:', error);

    // Show a simple error message in the root element
    rootElement.innerHTML = `
      <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
        <h1 style="color: red;">Erro ao carregar aplicação</h1>
        <p>Ocorreu um erro ao inicializar a aplicação.</p>
        <details style="margin-top: 20px; text-align: left; background: #f5f5f5; padding: 10px; border-radius: 5px;">
          <summary style="cursor: pointer; font-weight: bold;">Detalhes do erro</summary>
          <pre style="margin-top: 10px; white-space: pre-wrap;">${error}</pre>
        </details>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #007acc; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Recarregar
        </button>
      </div>
    `;
  }
}