
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('🚀 Starting React application...');

// Simple test component
const TestComponent: React.FC = () => {
  console.log('✅ TestComponent renderizando');

  return (
    <div style={{
      padding: '40px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      fontFamily: 'Inter, Arial, sans-serif',
      color: 'white',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '3rem',
        marginBottom: '1rem',
        fontWeight: '800'
      }}>
        DuduFisio-AI
      </h1>
      <p style={{
        fontSize: '1.25rem',
        marginBottom: '2rem',
        opacity: 0.9
      }}>
        ✅ React funcionando corretamente!
      </p>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '2rem'
      }}>
        <p style={{ margin: 0, fontSize: '1rem' }}>
          Sistema carregado com sucesso
        </p>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error('❌ Root element not found!');
} else {
  console.log('✅ Root element found, creating React app...');

  try {
    const root = createRoot(rootElement);
    root.render(<TestComponent />);
    console.log('🎉 React application rendered successfully!');
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