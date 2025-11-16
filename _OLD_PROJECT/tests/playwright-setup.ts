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
 * Verifica se o servidor está respondendo corretamente
 */
async function waitForServer(url: string, maxAttempts = 30): Promise<boolean> {
  console.log(`⏳ Aguardando servidor em ${url}...`);
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(url, { 
        method: 'GET',
        signal: AbortSignal.timeout(5000) // 5s timeout per request
      });
      
      if (response.ok || response.status === 304) {
        console.log(`✅ Servidor respondendo após ${attempt} tentativa(s)`);
        return true;
      }
    } catch (error) {
      // Ignore errors and keep trying
      if (attempt % 5 === 0) {
        console.log(`⏳ Ainda aguardando... (tentativa ${attempt}/${maxAttempts})`);
      }
    }
    
    // Wait 2 seconds between attempts
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.error(`❌ Servidor não respondeu após ${maxAttempts} tentativas`);
  return false;
}

/**
 * Verifica se a página de login está carregando corretamente
 */
async function verifyLoginPage(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { 
      method: 'GET',
      signal: AbortSignal.timeout(10000)
    });
    
    if (response.ok) {
      const html = await response.text();
      
      // Verify that the page has the expected content
      const hasLoginForm = html.includes('login') || html.includes('email') || html.includes('DuduFisio');
      
      if (hasLoginForm) {
        console.log('✅ Página de login carregando corretamente');
        return true;
      } else {
        console.warn('⚠️ Página carregada mas conteúdo de login não encontrado');
        return false;
      }
    }
    
    console.warn(`⚠️ Página de login retornou status ${response.status}`);
    return false;
  } catch (error) {
    console.error('❌ Erro ao verificar página de login:', error);
    return false;
  }
}

/**
 * Função de setup global do Playwright
 * Esta função é executada uma vez antes de todos os testes
 */
export default async function globalSetup() {
  console.log('🚀 Iniciando setup global do Playwright...');
  
  const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5176';
  
  // Wait for the development server to be ready
  const serverReady = await waitForServer(baseURL);
  
  if (!serverReady) {
    throw new Error('❌ Servidor não está respondendo. Certifique-se de que o servidor de desenvolvimento está rodando.');
  }
  
  // Give React app some time to initialize
  console.log('⏳ Aguardando inicialização da aplicação React...');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Verify login page is accessible
  const loginPageReady = await verifyLoginPage(baseURL);
  
  if (!loginPageReady) {
    console.warn('⚠️ Página de login pode não estar totalmente pronta, mas continuando com os testes...');
  }
  
  console.log('✅ Setup global concluído!');
  console.log('📝 Dicas:');
  console.log('   - Use os helpers em tests/helpers/login.ts para login consistente');
  console.log('   - Prefira data-testid ao invés de seletores CSS');
  console.log('   - Os timeouts foram aumentados para melhor estabilidade');
}
