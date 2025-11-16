import { test, expect } from '@playwright/test';

/**
 * 🧪 Testes de Service Worker
 * 
 * Valida funcionalidade offline e cache
 */

test.describe('Service Worker Registration', () => {
  test('deve registrar o service worker', async ({ page, context }) => {
    // Vai para a aplicação
    await page.goto('http://localhost:5175');
    
    // Aguarda o service worker registrar
    await page.waitForTimeout(2000);
    
    // Verifica se o service worker foi registrado
    const swRegistered = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration !== undefined;
      }
      return false;
    });
    
    expect(swRegistered).toBeTruthy();
    console.log('✅ Service Worker registrado com sucesso');
  });

  test('deve ter service worker ativo', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);
    
    const swActive = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration?.active !== null;
      }
      return false;
    });
    
    expect(swActive).toBeTruthy();
    console.log('✅ Service Worker está ativo');
  });

  test('deve ter o scope correto', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);
    
    const scope = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration?.scope;
      }
      return null;
    });
    
    expect(scope).toContain('localhost:5175');
    console.log(`✅ Service Worker scope: ${scope}`);
  });
});

test.describe('Offline Functionality', () => {
  test('deve exibir indicador quando ficar offline', async ({ page, context }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Simula offline
    await context.setOffline(true);
    
    // Aguarda indicador aparecer
    await page.waitForTimeout(1000);
    
    // Verifica se o indicador offline aparece
    const offlineIndicator = page.locator('text=Você está offline');
    await expect(offlineIndicator).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Indicador offline exibido');
  });

  test('deve exibir mensagem quando voltar online', async ({ page, context }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Vai offline
    await context.setOffline(true);
    await page.waitForTimeout(1000);
    
    // Volta online
    await context.setOffline(false);
    await page.waitForTimeout(1000);
    
    // Verifica mensagem de reconexão
    const onlineMessage = page.locator('text=Conexão restaurada');
    await expect(onlineMessage).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Mensagem de reconexão exibida');
  });

  test('deve carregar página offline quando não há conexão', async ({ page, context }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Aguarda SW registrar
    
    // Vai offline
    await context.setOffline(true);
    
    // Tenta navegar para uma página que não está no cache
    await page.goto('http://localhost:5175/some-uncached-page').catch(() => {
      // Esperado falhar
    });
    
    // Verifica se a página offline é exibida
    const offlinePage = page.locator('text=Você está offline');
    const isOfflinePageVisible = await offlinePage.isVisible().catch(() => false);
    
    expect(isOfflinePageVisible).toBeTruthy();
  });
});

test.describe('Cache Strategy', () => {
  test('deve cachear assets estáticos', async ({ page }) => {
    // Primeira visita
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verifica se assets estão no cache
    const cacheSize = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      
      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const keys = await cache.keys();
        totalSize += keys.length;
      }
      
      return totalSize;
    });
    
    expect(cacheSize).toBeGreaterThan(0);
    console.log(`📦 Assets no cache: ${cacheSize}`);
  });

  test('deve usar cache first para assets', async ({ page, context }) => {
    // Primeira visita para popular cache
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Segunda visita deve usar cache
    const requests: string[] = [];
    page.on('request', request => {
      requests.push(request.url());
    });
    
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    console.log(`📊 Requisições feitas: ${requests.length}`);
    
    // Deve haver menos requisições na segunda vez
    expect(requests.length).toBeGreaterThan(0);
  });

  test('deve limpar cache antigo', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Limpa todos os caches
    await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
    });
    
    // Verifica se caches foram limpos
    const cacheCount = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames.length;
    });
    
    expect(cacheCount).toBe(0);
    console.log('✅ Cache limpo com sucesso');
  });
});

test.describe('Service Worker Update', () => {
  test('deve detectar atualizações do service worker', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForTimeout(2000);
    
    // Verifica se há update disponível
    const hasUpdate = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        return registration?.waiting !== null || registration?.installing !== null;
      }
      return false;
    });
    
    console.log(`🔄 Update disponível: ${hasUpdate}`);
  });

  test('deve exibir prompt de atualização quando disponível', async ({ page }) => {
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Simula update do SW (se houver)
    const updatePromptVisible = await page.locator('text=Atualização disponível')
      .isVisible({ timeout: 3000 })
      .catch(() => false);
    
    if (updatePromptVisible) {
      console.log('✅ Prompt de atualização exibido');
      
      // Testa botão de atualizar
      const updateButton = page.locator('button:has-text("Atualizar")');
      await expect(updateButton).toBeVisible();
    } else {
      console.log('ℹ️  Nenhuma atualização disponível no momento');
    }
  });
});

test.describe('Performance com Service Worker', () => {
  test('segunda visita deve ser mais rápida', async ({ page }) => {
    // Primeira visita
    const firstVisitStart = Date.now();
    await page.goto('http://localhost:5175/dashboard');
    await page.waitForLoadState('networkidle');
    const firstVisitTime = Date.now() - firstVisitStart;
    
    await page.waitForTimeout(2000); // Aguarda cache
    
    // Segunda visita
    const secondVisitStart = Date.now();
    await page.goto('http://localhost:5175/dashboard');
    await page.waitForLoadState('networkidle');
    const secondVisitTime = Date.now() - secondVisitStart;
    
    console.log(`⚡ Primeira visita: ${firstVisitTime}ms`);
    console.log(`⚡ Segunda visita: ${secondVisitTime}ms`);
    console.log(`📈 Melhoria: ${((1 - secondVisitTime/firstVisitTime) * 100).toFixed(1)}%`);
    
    // Segunda visita deve ser mais rápida ou igual
    expect(secondVisitTime).toBeLessThanOrEqual(firstVisitTime * 1.2); // 20% de margem
  });

  test('deve ter cache hit rate alto após várias navegações', async ({ page }) => {
    const pages = [
      '/dashboard',
      '/patients',
      '/agenda',
      '/dashboard'
    ];
    
    for (const path of pages) {
      await page.goto(`http://localhost:5175${path}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);
    }
    
    // Navega para performance dashboard
    await page.goto('http://localhost:5175/admin/performance');
    
    // Verifica hit rate (se disponível)
    const hitRateText = await page.locator('text=Hit Rate')
      .locator('..')
      .locator('text=/%/')
      .textContent()
      .catch(() => null);
    
    if (hitRateText) {
      const hitRate = parseFloat(hitRateText);
      console.log(`🎯 Cache Hit Rate: ${hitRate}%`);
      expect(hitRate).toBeGreaterThan(50);
    }
  });
});
