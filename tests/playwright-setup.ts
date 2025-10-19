/**
 * Playwright Setup File
 * Configuração global para testes E2E
 */

// Mock das variáveis de ambiente do Vite
Object.defineProperty(globalThis, 'import', {
  value: {
    meta: {
      env: {
        VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321',
        VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH',
        VITE_GEMINI_API_KEY: process.env.VITE_GEMINI_API_KEY || '',
        DEV: process.env.NODE_ENV !== 'production',
        MODE: process.env.NODE_ENV || 'development',
        PROD: process.env.NODE_ENV === 'production',
      }
    }
  },
  writable: true,
  configurable: true
});

/**
 * Função de setup global do Playwright
 * Esta função é executada uma vez antes de todos os testes
 */
export default async function globalSetup() {
  console.log('🚀 Iniciando setup global do Playwright...');
  
  // Configurações adicionais podem ser adicionadas aqui
  // Por exemplo: limpar banco de dados de teste, criar dados de seed, etc.
  
  console.log('✅ Setup global concluído!');
}
