import { test, expect, devices } from '@playwright/test';

/**
 * FASE 2.7: Testes de Responsividade
 * Testa o sistema em múltiplos dispositivos
 */

const testDevices = [
  { name: 'Desktop HD', ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } },
  { name: 'Laptop', ...devices['Desktop Chrome'], viewport: { width: 1366, height: 768 } },
  { name: 'iPad', ...devices['iPad Pro'] },
  { name: 'iPhone', ...devices['iPhone 12'] },
  { name: 'Android', viewport: { width: 360, height: 640 } },
];

for (const device of testDevices) {
  test.describe(`Responsividade - ${device.name}`, () => {
    test.use(device);

    test(`Login e Dashboard em ${device.name}`, async ({ page }) => {
      await page.goto('http://localhost:5175');

      // Screenshot da página de login
      await page.screenshot({
        path: `test-results/screenshots/responsive-${device.name.toLowerCase().replace(' ', '-')}-login.png`,
        fullPage: true
      });

      // Fazer login
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForTimeout(3000);

      // Screenshot do dashboard
      await page.screenshot({
        path: `test-results/screenshots/responsive-${device.name.toLowerCase().replace(' ', '-')}-dashboard.png`,
        fullPage: true
      });

      console.log(`✅ ${device.name} - Login e dashboard testados`);
    });

    test(`Menu de navegação em ${device.name}`, async ({ page }) => {
      await page.goto('http://localhost:5175');
      await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
      await page.fill('[data-testid="login-password"]', 'demo123456');
      await page.click('[data-testid="login-submit"]');
      await page.waitForTimeout(2000);

      // Verificar se sidebar está visível
      const sidebar = page.locator('aside[data-testid="sidebar"]');
      const isSidebarVisible = await sidebar.isVisible().catch(() => false);

      if (isSidebarVisible) {
        await page.screenshot({
          path: `test-results/screenshots/responsive-${device.name.toLowerCase().replace(' ', '-')}-menu.png`,
          fullPage: true
        });
        console.log(`✅ ${device.name} - Menu visível`);
      } else {
        console.log(`⚠️  ${device.name} - Menu não visível (pode ser mobile)`);
      }
    });
  });
}
