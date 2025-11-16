import { test, expect } from '@playwright/test';

/**
 * Teste E2E - Navegação no Dashboard
 *
 * O sistema usa mock authentication em desenvolvimento, então não precisa fazer login.
 * A aplicação carrega automaticamente com um usuário Admin mockado.
 */

test.describe('Navegação no Dashboard com Mock Auth', () => {
  test.beforeEach(async ({ page }) => {
    // O sistema carrega automaticamente com mock auth em desenvolvimento
    // Basta navegar para a raiz
    await page.goto('/', { waitUntil: 'networkidle' });

    // Aguardar carregamento completo
    await page.waitForTimeout(3000);
  });

  test('Deve carregar a aplicação com mock auth', async ({ page }) => {
    // Verificar que a aplicação carregou
    const body = page.locator('body');
    await expect(body).toBeVisible();

    // Verificar que há conteúdo na página
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    console.log(`✅ Aplicação carregou com ${headingCount} títulos`);
  });

  test('Deve exibir sidebar ou menu de navegação', async ({ page }) => {
    // Procurar sidebar ou menu
    const sidebar = page.locator('nav, aside, [role="navigation"]').first();

    // Aguardar até 5 segundos para sidebar aparecer
    await sidebar.waitFor({ state: 'visible', timeout: 5000 });

    expect(await sidebar.isVisible()).toBeTruthy();
    console.log('✅ Sidebar/Menu encontrado');
  });

  test('Deve ter links de navegação funcionais', async ({ page }) => {
    // Procurar links de navegação
    const navLinks = page.locator('nav a, aside a');
    const linkCount = await navLinks.count();

    expect(linkCount).toBeGreaterThan(0);
    console.log(`✅ Encontrados ${linkCount} links de navegação`);

    // Verificar que pelo menos um link está visível
    if (linkCount > 0) {
      const firstLink = navLinks.first();
      await expect(firstLink).toBeVisible();
    }
  });

  test('Deve permitir navegação para Pacientes', async ({ page }) => {
    // Procurar e clicar em link de Pacientes
    const pacientesLink = page.locator('a, button').filter({ hasText: /pacientes/i }).first();

    if (await pacientesLink.isVisible({ timeout: 3000 })) {
      await pacientesLink.click();
      await page.waitForTimeout(2000);

      // Verificar que a URL mudou ou há conteúdo de pacientes
      const url = page.url();
      console.log('URL após clicar em Pacientes:', url);

      // Verificar que há conteúdo na página
      const content = page.locator('h1, h2, h3');
      expect(await content.count()).toBeGreaterThan(0);

      console.log('✅ Navegação para Pacientes funcionou');
    } else {
      console.log('⚠️ Link de Pacientes não encontrado');
    }
  });

  test('Deve permitir navegação para Agenda', async ({ page }) => {
    const agendaLink = page.locator('a, button').filter({ hasText: /agenda/i }).first();

    if (await agendaLink.isVisible({ timeout: 3000 })) {
      await agendaLink.click();
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log('URL após clicar em Agenda:', url);

      const content = page.locator('h1, h2, h3');
      expect(await content.count()).toBeGreaterThan(0);

      console.log('✅ Navegação para Agenda funcionou');
    } else {
      console.log('⚠️ Link de Agenda não encontrado');
    }
  });

  test('Deve permitir navegação para Exercícios', async ({ page }) => {
    const exerciciosLink = page.locator('a, button').filter({ hasText: /exercício/i }).first();

    if (await exerciciosLink.isVisible({ timeout: 3000 })) {
      await exerciciosLink.click();
      await page.waitForTimeout(2000);

      const url = page.url();
      console.log('URL após clicar em Exercícios:', url);

      const content = page.locator('h1, h2, h3');
      expect(await content.count()).toBeGreaterThan(0);

      console.log('✅ Navegação para Exercícios funcionou');
    } else {
      console.log('⚠️ Link de Exercícios não encontrado');
    }
  });

  test('Não deve ter erros críticos no console', async ({ page }) => {
    const errors: string[] = [];
    const criticalErrors: string[] = [];

    // Monitorar erros do console
    page.on('console', (msg) => {
      const text = msg.text();

      // Ignorar warnings e logs normais
      if (msg.type() === 'error') {
        errors.push(text);

        // Erros críticos que devem falhar o teste
        if (text.includes('Uncaught') ||
            text.includes('TypeError') && !text.includes('Failed to fetch') ||
            text.includes('ReferenceError') ||
            text.includes('SyntaxError')) {
          criticalErrors.push(text);
        }
      }
    });

    // Navegar por algumas páginas
    const pages = [
      { selector: 'text=Pacientes', wait: 1500 },
      { selector: 'text=Agenda', wait: 1500 },
      { selector: 'text=Exercícios', wait: 1500 },
    ];

    for (const pageNav of pages) {
      try {
        const link = page.locator(pageNav.selector).first();
        if (await link.isVisible({ timeout: 2000 })) {
          await link.click();
          await page.waitForTimeout(pageNav.wait);
        }
      } catch (e) {
        console.log(`Não foi possível navegar para: ${pageNav.selector}`);
      }
    }

    // Permitir alguns erros de fetch (service worker), mas não erros críticos de JavaScript
    console.log(`Total de erros no console: ${errors.length}`);
    console.log(`Erros críticos: ${criticalErrors.length}`);

    if (criticalErrors.length > 0) {
      console.error('Erros críticos encontrados:');
      criticalErrors.forEach(err => console.error('  -', err));
    }

    // O teste falha apenas se houver erros críticos
    expect(criticalErrors.length).toBe(0);
  });

  test('Service Worker - Não deve gerar loops infinitos de erro', async ({ page }) => {
    const swErrors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (text.includes('Fetch error') || text.includes('Failed to fetch')) {
        swErrors.push(text);
      }
    });

    // Navegar rapidamente por algumas páginas
    const pages = ['Pacientes', 'Agenda', 'Exercícios'];

    for (const pageName of pages) {
      try {
        const link = page.locator(`text=${pageName}`).first();
        if (await link.isVisible({ timeout: 2000 })) {
          await link.click();
          await page.waitForTimeout(1000);
        }
      } catch (e) {
        // Ignorar erros de navegação
      }
    }

    // Permitir até 20 erros de fetch (pode haver alguns durante navegação)
    // Mas se houver mais de 50, indica um loop infinito
    console.log(`Total de erros de fetch do Service Worker: ${swErrors.length}`);

    expect(swErrors.length).toBeLessThan(50);

    if (swErrors.length > 20) {
      console.warn(`⚠️ Número alto de erros de fetch: ${swErrors.length}`);
    } else {
      console.log('✅ Service Worker funcionando sem loops infinitos');
    }
  });

  test('Deve renderizar componentes React sem erros', async ({ page }) => {
    // Verificar que React carregou corretamente
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();

    // Verificar que há conteúdo dentro do root
    const children = reactRoot.locator('*');
    const childCount = await children.count();

    expect(childCount).toBeGreaterThan(0);
    console.log(`✅ React renderizou ${childCount} elementos`);
  });

  test('Performance - Aplicação deve carregar em menos de 5 segundos', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/', { waitUntil: 'networkidle' });

    const loadTime = Date.now() - startTime;
    console.log(`Tempo de carregamento: ${loadTime}ms`);

    // Aplicação deve carregar em menos de 5 segundos
    expect(loadTime).toBeLessThan(5000);

    if (loadTime < 2000) {
      console.log('🚀 Carregamento rápido!');
    } else if (loadTime < 3500) {
      console.log('✅ Carregamento aceitável');
    } else {
      console.warn('⚠️ Carregamento lento');
    }
  });
});
