import { test, expect } from '@playwright/test';

const PROD_URL = process.env.PROD_URL ?? 'https://dudufisio-8xe9qf4d9-rafael-minattos-projects.vercel.app';

/**
 * Validação básica de carregamento em produção garantindo ausência de erros no console
 */
test.describe('Produção – Console limpo', () => {
  test('carrega home sem erros no console', async ({ page }) => {
    const consoleErrors: string[] = [];
    const pageErrors: string[] = [];

    page.on('console', (msg) => {
      const type = msg.type();
      if (type === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', (error) => {
      pageErrors.push(error.message);
    });

    await page.goto(PROD_URL, { waitUntil: 'networkidle' });
    await page.waitForTimeout(5000);

    if (consoleErrors.length || pageErrors.length) {
      console.log('Console Errors capturados:', consoleErrors);
      console.log('Page Errors capturados:', pageErrors);
    }

    expect(consoleErrors, 'Erros no console não esperados').toEqual([]);
    expect(pageErrors, 'Erros de página não esperados').toEqual([]);
  });
});
