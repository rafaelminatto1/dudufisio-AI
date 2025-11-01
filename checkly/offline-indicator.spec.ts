/**
 * 🔍 Checkly Check - Offline Indicator
 * 
 * Verifica se o indicador offline está funcionando corretamente.
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.ENVIRONMENT_URL || 'https://moocafisio.com.br';

test('Indicador offline deve aparecer quando desconectar', async ({ page, context }) => {
  // Login (assumindo credenciais em variáveis de ambiente)
  await page.goto(`${BASE_URL}/login`);
  
  // Navegar para dashboard
  await page.goto(`${BASE_URL}/dashboard`);

  // Verificar que está online inicialmente (indicador não deve aparecer)
  await expect(page.locator('text=Você está offline')).not.toBeVisible();

  // Ficar offline
  await context.setOffline(true);

  // Indicador deve aparecer
  await expect(page.locator('role=status >> text=Você está offline')).toBeVisible({ timeout: 5000 });

  // Voltar online
  await context.setOffline(false);

  // Notificação de conexão restaurada deve aparecer
  await expect(page.locator('text=Conexão restaurada')).toBeVisible({ timeout: 5000 });
});

test('Service worker deve estar registrado', async ({ page }) => {
  await page.goto(`${BASE_URL}/`);

  // Aguardar carregamento
  await page.waitForLoadState('networkidle');

  // Verificar SW via JavaScript
  const swRegistered = await page.evaluate(async () => {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.getRegistration();
      return !!registration;
    }
    return false;
  });

  expect(swRegistered).toBe(true);
});

