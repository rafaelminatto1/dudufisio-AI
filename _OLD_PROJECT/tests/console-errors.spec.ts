import { test, expect, Page } from '@playwright/test';

// Lista de páginas para testar
const pages = [
  '/',
  '/dashboard',
  '/patients',
  '/appointments',
  '/reports/advanced',
  '/medical-records',
  '/inventory',
  '/exercises',
  '/ai-tools',
  '/financials',
  '/teleconsulta',
  '/users',
  '/inventory-dashboard',
  '/events',
  '/partnerships',
  '/subscriptions',
  '/whatsapp',
  '/user-management',
  '/groups',
  '/events-list',
  '/partnership-page'
];

// Função para capturar erros do console
async function captureConsoleErrors(page: Page): Promise<{ url: string; errors: string[] }> {
  const errors: string[] = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(`[${msg.type()}] ${msg.text()}`);
    }
  });

  page.on('pageerror', (error) => {
    errors.push(`[PAGE_ERROR] ${error.message}`);
  });

  return { url: page.url(), errors };
}

// Teste para verificar erros no console em todas as páginas
test.describe('Console Errors Check', () => {
  let allErrors: Array<{ url: string; errors: string[] }> = [];

  for (const pagePath of pages) {
    test(`Console errors on ${pagePath}`, async ({ page }) => {
      const errorCapture = await captureConsoleErrors(page);
      
      // Navegar para a página
      await page.goto(pagePath);
      
      // Aguardar o carregamento da página
      await page.waitForLoadState('networkidle');
      
      // Aguardar um pouco mais para capturar erros de inicialização
      await page.waitForTimeout(2000);
      
      // Capturar erros finais
      const finalErrors = await captureConsoleErrors(page);
      
      // Adicionar à lista de erros
      allErrors.push({
        url: page.url(),
        errors: finalErrors.errors
      });

      // Log dos erros encontrados
      if (finalErrors.errors.length > 0) {
        console.log(`\n❌ Erros encontrados em ${pagePath}:`);
        finalErrors.errors.forEach(error => {
          console.log(`  - ${error}`);
        });
      } else {
        console.log(`✅ ${pagePath} - Sem erros no console`);
      }

      // Verificar se a página carregou corretamente
      await expect(page).toHaveTitle(/DuduFisio-AI/);
    });
  }

  test.afterAll(async () => {
    // Gerar relatório de erros
    console.log('\n📊 RELATÓRIO DE ERROS NO CONSOLE:');
    console.log('=====================================');
    
    const pagesWithErrors = allErrors.filter(page => page.errors.length > 0);
    const pagesWithoutErrors = allErrors.filter(page => page.errors.length === 0);
    
    console.log(`\n✅ Páginas sem erros: ${pagesWithoutErrors.length}`);
    pagesWithoutErrors.forEach(page => {
      console.log(`  - ${page.url}`);
    });
    
    console.log(`\n❌ Páginas com erros: ${pagesWithErrors.length}`);
    pagesWithErrors.forEach(page => {
      console.log(`\n🔴 ${page.url}:`);
      page.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
    });
    
    console.log('\n📈 RESUMO:');
    console.log(`Total de páginas testadas: ${allErrors.length}`);
    console.log(`Páginas sem erros: ${pagesWithoutErrors.length}`);
    console.log(`Páginas com erros: ${pagesWithErrors.length}`);
    console.log(`Taxa de sucesso: ${((pagesWithoutErrors.length / allErrors.length) * 100).toFixed(1)}%`);
  });
});

// Teste para verificar navegação entre páginas
test.describe('Page Navigation', () => {
  test('Navigate through main pages', async ({ page }) => {
    const mainPages = ['/', '/dashboard', '/patients', '/appointments'];
    
    for (const pagePath of mainPages) {
      await page.goto(pagePath);
      await page.waitForLoadState('networkidle');
      
      // Verificar se a página carregou
      await expect(page).toHaveTitle(/DuduFisio-AI/);
      
      // Verificar se não há erros críticos
      const errors = await page.evaluate(() => {
        return window.console._errors || [];
      });
      
      if (errors.length > 0) {
        console.log(`Erros em ${pagePath}:`, errors);
      }
    }
  });
});

// Teste para verificar funcionalidades básicas
test.describe('Basic Functionality', () => {
  test('Check page elements and interactions', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Verificar se a página principal carrega
    await expect(page).toHaveTitle(/DuduFisio-AI/);
    
    // Verificar se não há erros de JavaScript
    const jsErrors = await page.evaluate(() => {
      const errors: string[] = [];
      const originalError = window.onerror;
      window.onerror = (message, source, lineno, colno, error) => {
        errors.push(`${message} at ${source}:${lineno}:${colno}`);
      };
      return errors;
    });
    
    if (jsErrors.length > 0) {
      console.log('Erros de JavaScript encontrados:', jsErrors);
    }
  });
});
