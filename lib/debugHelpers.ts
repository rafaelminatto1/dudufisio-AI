/**
 * 🐛 Debug Helpers - Ferramentas de Debug para Produção
 * 
 * Funções utilitárias para diagnóstico de problemas
 */

/**
 * Limpa completamente o cache e storage do navegador
 */
export async function clearAllCache(): Promise<void> {
  console.log('🗑️ Limpando todo o cache...');
  
  try {
    // Limpa localStorage
    localStorage.clear();
    console.log('✅ localStorage limpo');
    
    // Limpa sessionStorage
    sessionStorage.clear();
    console.log('✅ sessionStorage limpo');
    
    // Limpa caches
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
      console.log(`✅ ${cacheNames.length} caches deletados`);
    }
    
    // Desregistra service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(reg => reg.unregister())
      );
      console.log(`✅ ${registrations.length} service workers desregistrados`);
    }
    
    console.log('✅ Limpeza completa realizada');
  } catch (error) {
    console.error('❌ Erro ao limpar cache:', error);
  }
}

/**
 * Exporta estado da aplicação para debug
 */
export function exportAppState(): void {
  const state = {
    timestamp: new Date().toISOString(),
    url: window.location.href,
    localStorage: { ...localStorage },
    sessionStorage: { ...sessionStorage },
    userAgent: navigator.userAgent,
    online: navigator.onLine,
    serviceWorker: 'serviceWorker' in navigator,
    errors: (window as any).__APP_ERROR__ || null
  };
  
  console.log('📊 Estado da Aplicação:', state);
  
  // Copia para clipboard
  const json = JSON.stringify(state, null, 2);
  navigator.clipboard?.writeText(json).then(() => {
    console.log('📋 Estado copiado para clipboard');
  });
  
  return state as any;
}

/**
 * Força reload sem cache
 */
export function hardReload(): void {
  console.log('🔄 Hard reload...');
  window.location.reload();
}

/**
 * Verifica saúde dos contextos React
 */
export function checkContextHealth(): { react: boolean; reactDOM: boolean; hasErrors: boolean; serviceWorker: boolean; localStorage: boolean; supabase: boolean } {
  console.log('🏥 Verificando saúde dos contextos...');

  const checks = {
    react: typeof globalThis.React !== 'undefined',
    reactDOM: document.querySelector('[data-reactroot]') !== null,
    hasErrors: !!(window as any).__APP_ERROR__,
    serviceWorker: 'serviceWorker' in navigator,
    localStorage: typeof localStorage !== 'undefined',
    supabase: !!(window as any).supabase
  };

  console.table(checks);

  return checks;
}

/**
 * Monitora performance em tempo real
 */
export function startPerformanceMonitoring(): () => void {
  console.log('📊 Iniciando monitoramento de performance...');
  
  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach(entry => {
      console.log(`⚡ ${entry.name}: ${entry.duration.toFixed(2)}ms`);
    });
  });
  
  try {
    observer.observe({ entryTypes: ['navigation', 'resource', 'measure'] });
  } catch (error) {
    console.error('❌ Erro ao iniciar monitoring:', error);
  }
  
  return () => {
    observer.disconnect();
    console.log('🛑 Monitoramento de performance parado');
  };
}

/**
 * Debug de Service Worker
 */
export async function debugServiceWorker(): Promise<void> {
  console.log('🔍 Debugging Service Worker...');
  
  if (!('serviceWorker' in navigator)) {
    console.warn('⚠️  Service Worker não suportado');
    return;
  }
  
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    
    if (!registration) {
      console.warn('⚠️  Nenhum Service Worker registrado');
      return;
    }
    
    console.log('📊 Service Worker Info:', {
      scope: registration.scope,
      active: !!registration.active,
      installing: !!registration.installing,
      waiting: !!registration.waiting,
      updateViaCache: registration.updateViaCache
    });
    
    // Verifica caches
    const cacheNames = await caches.keys();
    console.log('💾 Caches disponíveis:', cacheNames);
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      console.log(`  📦 ${cacheName}: ${keys.length} entradas`);
    }
    
  } catch (error) {
    console.error('❌ Erro ao debugar Service Worker:', error);
  }
}

/**
 * Adiciona helpers ao window para acesso fácil no console
 */
export function installDebugHelpers(): void {
  if (typeof window !== 'undefined') {
    (window as any).debugHelpers = {
      clearAllCache,
      exportAppState,
      hardReload,
      checkContextHealth,
      startPerformanceMonitoring,
      debugServiceWorker
    };
    
    console.log(`
🔧 Debug Helpers Instalados!

Use no console:
  debugHelpers.clearAllCache()         - Limpa tudo
  debugHelpers.exportAppState()        - Exporta estado
  debugHelpers.hardReload()            - Reload forçado
  debugHelpers.checkContextHealth()    - Verifica saúde
  debugHelpers.startPerformanceMonitoring() - Monitora performance
  debugHelpers.debugServiceWorker()    - Debug SW
    `);
  }
}

// Instala automaticamente em desenvolvimento
if (import.meta.env.DEV) {
  installDebugHelpers();
}

export default {
  clearAllCache,
  exportAppState,
  hardReload,
  checkContextHealth,
  startPerformanceMonitoring,
  debugServiceWorker,
  installDebugHelpers
};
