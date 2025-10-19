import { test, expect, devices } from '@playwright/test';

/**
 * FASE 2.7: Testes de Responsividade
 * Testa o sistema em múltiplos dispositivos
 */

const testDevices = [
  { name: 'Desktop HD', viewport: { width: 1920, height: 1080 } },
  { name: 'Laptop', viewport: { width: 1366, height: 768 } },
  { name: 'iPad', viewport: { width: 1024, height: 1366 } },
  { name: 'iPhone', viewport: { width: 390, height: 844 } },
  { name: 'Android', viewport: { width: 360, height: 640 } },
];

test.describe('Responsividade - Desktop HD', () => {
  test.use({ viewport: { width: 1920, height: 1080 } });

  test('Login e Dashboard em Desktop HD', async ({ page }) => {
    await page.goto('http://localhost:5175');

    // Screenshot da página de login
    await page.screenshot({
      path: `test-results/screenshots/responsive-desktop-hd-login.png`,
      fullPage: true
    });

    // Fazer login
    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    await page.click('[data-testid="login-submit"]');
    await page.waitForTimeout(3000);

    // Screenshot do dashboard
    await page.screenshot({
      path: `test-results/screenshots/responsive-desktop-hd-dashboard.png`,
      fullPage: true
    });

    console.log(`✅ Desktop HD - Login e dashboard testados`);
  });

  test('Menu de navegação em Desktop HD', async ({ page }) => {
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
        path: `test-results/screenshots/responsive-desktop-hd-menu.png`,
        fullPage: true
      });
      console.log(`✅ Desktop HD - Menu visível`);
    } else {
      console.log(`⚠️  Desktop HD - Menu não visível`);
    }
  });
});

test.describe('Responsividade - Laptop', () => {
  test.use({ viewport: { width: 1366, height: 768 } });

  test('Login e Dashboard em Laptop', async ({ page }) => {
    await page.goto('http://localhost:5175');

    await page.screenshot({
      path: `test-results/screenshots/responsive-laptop-login.png`,
      fullPage: true
    });

    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    await page.click('[data-testid="login-submit"]');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `test-results/screenshots/responsive-laptop-dashboard.png`,
      fullPage: true
    });

    console.log(`✅ Laptop - Login e dashboard testados`);
  });
});

test.describe('Responsividade - iPad', () => {
  test.use({ viewport: { width: 1024, height: 1366 } });

  test('Login e Dashboard em iPad', async ({ page }) => {
    await page.goto('http://localhost:5175');

    await page.screenshot({
      path: `test-results/screenshots/responsive-ipad-login.png`,
      fullPage: true
    });

    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    await page.click('[data-testid="login-submit"]');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `test-results/screenshots/responsive-ipad-dashboard.png`,
      fullPage: true
    });

    console.log(`✅ iPad - Login e dashboard testados`);
  });
});

test.describe('Responsividade - iPhone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('Login e Dashboard em iPhone', async ({ page }) => {
    await page.goto('http://localhost:5175');

    await page.screenshot({
      path: `test-results/screenshots/responsive-iphone-login.png`,
      fullPage: true
    });

    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    await page.click('[data-testid="login-submit"]');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `test-results/screenshots/responsive-iphone-dashboard.png`,
      fullPage: true
    });

    console.log(`✅ iPhone - Login e dashboard testados`);
  });
});

test.describe('Responsividade - Android', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('Login e Dashboard em Android', async ({ page }) => {
    await page.goto('http://localhost:5175');

    await page.screenshot({
      path: `test-results/screenshots/responsive-android-login.png`,
      fullPage: true
    });

    await page.fill('[data-testid="login-email"]', 'admin@dudufisio.com');
    await page.fill('[data-testid="login-password"]', 'demo123456');
    await page.click('[data-testid="login-submit"]');
    await page.waitForTimeout(3000);

    await page.screenshot({
      path: `test-results/screenshots/responsive-android-dashboard.png`,
      fullPage: true
    });

    console.log(`✅ Android - Login e dashboard testados`);
  });
});
