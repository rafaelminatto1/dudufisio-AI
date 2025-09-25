
// Completely minimal test - no imports at all
console.log('🚀 Starting minimal test...');

const rootElement = document.getElementById('root');
if (rootElement) {
  rootElement.innerHTML = `
    <div style="padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; font-family: 'Inter', Arial, sans-serif; color: white;">
      <div style="max-width: 600px; margin: 0 auto; text-align: center;">
        <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 800;">DuduFisio-AI</h1>
        <p style="font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9;">✅ Sistema carregado com sucesso!</p>
        <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 12px; margin-bottom: 2rem;">
          <p style="margin: 0; font-size: 1rem;">Teste básico funcionando sem conflitos React</p>
        </div>
        <button onclick="window.location.reload()" style="background: rgba(255,255,255,0.2); border: 2px solid rgba(255,255,255,0.3); color: white; padding: 12px 24px; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">
          🔄 Recarregar Página
        </button>
        <p style="margin-top: 2rem; font-size: 0.875rem; opacity: 0.7;">Timestamp: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
  console.log('✅ Minimal content loaded successfully!');
}