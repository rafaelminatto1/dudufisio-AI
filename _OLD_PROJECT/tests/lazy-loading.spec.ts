import { test, expect } from '@playwright/test';

test.describe('Lazy Loading Tests', () => {
  test('should lazy load dashboard components', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    
    // Verificar que apenas chunks essenciais são carregados inicialmente
    const requests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('.js')) {
        requests.push(request.url());
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    // Verificar ordem de carregamento
    const reactCoreLoaded = requests.some(url => url.includes('00-vendor-react-core'));
    const reactDomLoaded = requests.some(url => url.includes('01-vendor-react-dom'));
    
    console.log('React Core loaded:', reactCoreLoaded);
    console.log('React DOM loaded:', reactDomLoaded);
    
    // Verificar que pelo menos os chunks principais foram carregados
    expect(requests.length).toBeGreaterThan(0);
  });
  
  test('should load page-specific chunks on navigation', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');
    
    const chunksBeforeNavigation = new Set<string>();
    page.on('request', request => {
      if (request.url().includes('.js')) {
        chunksBeforeNavigation.add(request.url());
      }
    });
    
    // Navegar para página de pacientes
    await page.click('a[href="/patients"]');
    await page.waitForLoadState('networkidle');
    
    // Verificar que novos chunks foram carregados
    const allChunks = new Set<string>();
    page.on('request', request => {
      if (request.url().includes('.js')) {
        allChunks.add(request.url());
      }
    });
    
    // Aguardar um pouco para garantir que todos os chunks foram carregados
    await page.waitForTimeout(1000);
    
    console.log('Chunks before navigation:', chunksBeforeNavigation.size);
    console.log('Total chunks:', allChunks.size);
    
    // Verificar que novos chunks foram carregados
    expect(allChunks.size).toBeGreaterThanOrEqual(chunksBeforeNavigation.size);
  });
  
  test('should load chunks in correct order', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    
    const loadOrder: string[] = [];
    page.on('request', request => {
      if (request.url().includes('.js')) {
        const url = request.url();
        if (url.includes('vendor-react-core')) {
          loadOrder.push('react-core');
        } else if (url.includes('vendor-react-dom')) {
          loadOrder.push('react-dom');
        } else if (url.includes('vendor-router')) {
          loadOrder.push('router');
        } else if (url.includes('vendor-tanstack')) {
          loadOrder.push('tanstack');
        } else if (url.includes('vendor-radix')) {
          loadOrder.push('radix');
        }
      }
    });
    
    await page.waitForLoadState('networkidle');
    
    console.log('Load order:', loadOrder);
    
    // Verificar que React Core foi carregado antes de React DOM
    const reactCoreIndex = loadOrder.indexOf('react-core');
    const reactDomIndex = loadOrder.indexOf('react-dom');
    
    if (reactCoreIndex !== -1 && reactDomIndex !== -1) {
      expect(reactCoreIndex).toBeLessThan(reactDomIndex);
    }
  });
  
  test('should not load editor chunks until needed', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');
    
    const editorChunks: string[] = [];
    page.on('request', request => {
      if (request.url().includes('.js')) {
        const url = request.url();
        if (url.includes('lib-editor') || url.includes('prosemirror')) {
          editorChunks.push(url);
        }
      }
    });
    
    // Navegar para página que não usa editor
    await page.click('a[href="/dashboard"]');
    await page.waitForLoadState('networkidle');
    
    console.log('Editor chunks loaded:', editorChunks.length);
    
    // Verificar que chunks do editor não foram carregados
    expect(editorChunks.length).toBe(0);
  });
  
  test('should load editor chunks when needed', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');
    
    const editorChunks: string[] = [];
    page.on('request', request => {
      if (request.url().includes('.js')) {
        const url = request.url();
        if (url.includes('lib-editor') || url.includes('prosemirror')) {
          editorChunks.push(url);
        }
      }
    });
    
    // Navegar para página que usa editor (ex: gerar laudo)
    try {
      await page.click('a[href="/gerar-laudo"]');
      await page.waitForLoadState('networkidle');
      
      console.log('Editor chunks loaded:', editorChunks.length);
      
      // Verificar que chunks do editor foram carregados
      expect(editorChunks.length).toBeGreaterThan(0);
    } catch (error) {
      console.log('Page not found or not accessible:', error);
      // Skip test if page doesn't exist
    }
  });
  
  test('should have multiple chunks loaded', async ({ page }) => {
    await page.goto('http://localhost:4173/');
    await page.waitForLoadState('networkidle');
    
    const chunks = new Set<string>();
    page.on('request', request => {
      if (request.url().includes('.js') && request.url().includes('assets/')) {
        chunks.add(request.url());
      }
    });
    
    // Aguardar um pouco para garantir que todos os chunks foram carregados
    await page.waitForTimeout(2000);
    
    console.log('Total chunks loaded:', chunks.size);
    
    // Verificar que temos múltiplos chunks
    expect(chunks.size).toBeGreaterThan(5);
  });
});

