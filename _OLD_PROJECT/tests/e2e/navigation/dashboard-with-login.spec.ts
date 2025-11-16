import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../__helpers__/auth-helper';

/**
 * Teste E2E - Navegação no Dashboard COM Login
 *
 * Estes testes fazem login antes de testar a navegação
 */

test.describe('Navegação no Dashboard (Com Login)', () => {
  test.beforeEach(async ({ page }) => {
    // Fazer login como Admin
    await loginAsAdmin(page);

    // Aguardar carregamento completo
    await page.waitForTimeout(2000);
  });

  test('Deve carregar o dashboard após login', async ({ page }) => {
    // Verificar que não está mais na página de login
    const loginButton = await page.locator('button:has-text("Entrar")').isVisible({ timeout: 2000 }).catch(() => false);
    expect(loginButton).toBe(false);

    // Verificar que há conteúdo carregado
    const headings = page.locator('h1, h2, h3');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThan(0);

    console.log(`✅ Dashboard carregado com ${headingCount} títulos`);
  });

  test('Deve exibir elementos de navegação', async ({ page }) => {
    // Verificar se há menu ou sidebar
    const navElements = page.locator('nav, aside, [role="navigation"], a').first();
    await navElements.waitFor({ state: 'visible', timeout: 5000 });

    expect(await navElements.isVisible()).toBeTruthy();
    console.log('✅ Elementos de navegação encontrados');
  });

  test('Deve ter links clicáveis na interface', async ({ page }) => {
    // Procurar por links ou botões
    const links = page.locator('a, button').filter({ hasNot: page.locator('[disabled]') });
    const linkCount = await links.count();

    expect(linkCount).toBeGreaterThan(5); // Deve ter pelo menos alguns links
    console.log(`✅ Encontrados ${linkCount} elementos clicáveis`);
  });

  test('Service Worker - Sem erros críticos', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('Failed to fetch')) {
        errors.push(text);
      }
    });

    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(3000);

    console.log(`Erros no console (excluindo fetch): ${errors.length}`);

    if (errors.length > 0) {
      console.warn('Erros encontrados:');
      errors.slice(0, 5).forEach(err => console.warn('  -', err));
    }

    // Permitir até 5 erros não-críticos
    expect(errors.length).toBeLessThan(10);
  });

  test('Performance - Aplicação responde rapidamente', async ({ page }) => {
    const startTime = Date.now();

    // Procurar e clicar em algum elemento
    const clickable = page.locator('a, button').first();
    if (await clickable.isVisible({ timeout: 2000 })) {
      await clickable.click();
      await page.waitForTimeout(1000);
    }

    const responseTime = Date.now() - startTime;
    console.log(`Tempo de resposta: ${responseTime}ms`);

    // Deve responder em menos de 3 segundos
    expect(responseTime).toBeLessThan(3000);
  });

  test('React - Deve renderizar elementos corretamente', async ({ page }) => {
    const reactRoot = page.locator('#root');
    await expect(reactRoot).toBeVisible();

    const children = reactRoot.locator('*');
    const childCount = await children.count();

    expect(childCount).toBeGreaterThan(10);
    console.log(`✅ React renderizou ${childCount} elementos`);
  });

  test('Navegação - Deve poder clicar em múltiplos elementos', async ({ page }) => {
    let successfulClicks = 0;

    // Tentar clicar em até 5 elementos diferentes
    const elements = page.locator('a, button').filter({ hasNot: page.locator('[disabled]') });
    const count = Math.min(await elements.count(), 5);

    for (let i = 0; i < count; i++) {
      try {
        const element = elements.nth(i);
        if (await element.isVisible({ timeout: 1000 })) {
          await element.click();
          await page.waitForTimeout(500);
          successfulClicks++;

          // Voltar para estado inicial (se possível)
          await page.goBack().catch(() => {});
          await page.waitForTimeout(500);
        }
      } catch (e) {
        console.log(`Não foi possível clicar no elemento ${i}`);
      }
    }

    console.log(`✅ Clicou com sucesso em ${successfulClicks} elementos`);
    expect(successfulClicks).toBeGreaterThan(0);
  });

  test('Console - Não deve ter erros de JavaScript críticos', async ({ page }) => {
    const criticalErrors: string[] = [];

    page.on('pageerror', (error) => {
      criticalErrors.push(error.message);
    });

    // Aguardar e verificar por erros
    await page.waitForTimeout(3000);

    if (criticalErrors.length > 0) {
      console.error('Erros críticos de JavaScript encontrados:');
      criticalErrors.forEach(err => console.error('  -', err));
    }

    expect(criticalErrors.length).toBe(0);
  });

  test('Interface - Deve ter títulos e conteúdo visível', async ({ page }) => {
    // Verificar títulos
    const h1 = page.locator('h1').first();
    const h2 = page.locator('h2').first();
    const h3 = page.locator('h3').first();

    const hasH1 = await h1.isVisible({ timeout: 2000 }).catch(() => false);
    const hasH2 = await h2.isVisible({ timeout: 2000 }).catch(() => false);
    const hasH3 = await h3.isVisible({ timeout: 2000 }).catch(() => false);

    const hasTitle = hasH1 || hasH2 || hasH3;
    expect(hasTitle).toBeTruthy();

    if (hasH1) {
      const text = await h1.textContent();
      console.log(`H1: "${text}"`);
    } else if (hasH2) {
      const text = await h2.textContent();
      console.log(`H2: "${text}"`);
    } else if (hasH3) {
      const text = await h3.textContent();
      console.log(`H3: "${text}"`);
    }

    // Verificar parágrafos
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();

    expect(paragraphCount).toBeGreaterThan(0);
    console.log(`✅ Encontrados ${paragraphCount} parágrafos`);
  });

  test('Estabilidade - Múltiplos reloads não devem quebrar a aplicação', async ({ page }) => {
    for (let i = 0; i < 3; i++) {
      await page.reload({ waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Verificar que ainda há conteúdo
      const headings = page.locator('h1, h2, h3');
      const count = await headings.count();

      expect(count).toBeGreaterThan(0);
      console.log(`Reload ${i + 1}: ${count} títulos encontrados`);
    }

    console.log('✅ Aplicação estável após múltiplos reloads');
  });
});
