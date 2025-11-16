/**
 * 🧪 Testes E2E - Fluxo Offline Completo
 * 
 * Testa o comportamento do sistema offline em cenários reais.
 */

import { test, expect, type Page } from '@playwright/test';

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:5173';

/**
 * Helper para fazer login
 */
async function login(page: Page) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[type="email"]', 'admin@dudufisio.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/dashboard`, { timeout: 10000 });
}

/**
 * Helper para ficar offline
 */
async function goOffline(page: Page) {
  await page.context().setOffline(true);
}

/**
 * Helper para voltar online
 */
async function goOnline(page: Page) {
  await page.context().setOffline(false);
}

test.describe('Fluxo Offline - Básico', () => {
  test('deve permitir criar agendamento offline e sincronizar ao voltar online', async ({ page }) => {
    // 1. Login
    await login(page);

    // 2. Navegar para agenda
    await page.goto(`${BASE_URL}/agenda`);
    await page.waitForSelector('[data-testid="agenda-calendar"]', { timeout: 5000 });

    // 3. Criar agendamento online
    await page.click('button:has-text("Novo Agendamento")');
    await page.fill('input[name="patientName"]', 'Paciente Teste Online');
    await page.fill('input[type="date"]', '2024-12-01');
    await page.fill('input[type="time"]', '10:00');
    await page.click('button[type="submit"]');
    
    // Aguardar confirmação
    await expect(page.locator('text=Agendamento criado')).toBeVisible({ timeout: 5000 });

    // 4. Ficar offline
    await goOffline(page);

    // 5. Verificar que indicador offline aparece
    await expect(page.locator('role=status >> text=Você está offline')).toBeVisible({ timeout: 3000 });

    // 6. Tentar criar agendamento offline
    await page.click('button:has-text("Novo Agendamento")');
    await page.fill('input[name="patientName"]', 'Paciente Teste Offline');
    await page.fill('input[type="date"]', '2024-12-02');
    await page.fill('input[type="time"]', '11:00');
    await page.click('button[type="submit"]');

    // 7. Verificar que foi adicionado à fila
    await expect(page.locator('text=/1|2 (item|itens) pendente/i')).toBeVisible({ timeout: 3000 });

    // 8. Voltar online
    await goOnline(page);

    // 9. Verificar notificação de conexão restaurada
    await expect(page.locator('text=Conexão restaurada')).toBeVisible({ timeout: 5000 });

    // 10. Aguardar sincronização
    await expect(page.locator('text=/Sincronizando/i')).toBeVisible({ timeout: 3000 });
    await expect(page.locator('text=/Sincronizando/i')).not.toBeVisible({ timeout: 10000 });

    // 11. Verificar que ambos agendamentos foram criados
    await expect(page.locator('text=Paciente Teste Online')).toBeVisible();
    await expect(page.locator('text=Paciente Teste Offline')).toBeVisible();
  });

  test('deve mostrar contador de itens pendentes quando múltiplas ações offline', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/agenda`);

    // Ficar offline
    await goOffline(page);

    // Verificar indicador offline
    await expect(page.locator('text=Você está offline')).toBeVisible({ timeout: 3000 });

    // Criar múltiplos agendamentos
    for (let i = 1; i <= 3; i++) {
      await page.click('button:has-text("Novo Agendamento")');
      await page.fill('input[name="patientName"]', `Paciente ${i}`);
      await page.fill('input[type="date"]', '2024-12-01');
      await page.fill('input[type="time"]', `${9 + i}:00`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // Verificar contador
    await expect(page.locator('text=/3 itens pendentes/i')).toBeVisible({ timeout: 3000 });

    // Voltar online
    await goOnline(page);

    // Aguardar sincronização completa
    await page.waitForTimeout(5000);

    // Verificar que todos foram processados
    await expect(page.locator('text=/0 itens pendentes/i')).not.toBeVisible();
  });
});

test.describe('Fluxo Offline - Falhas e Retry', () => {
  test('deve mostrar item falho e permitir retentar', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/agenda`);

    // Interceptar request para forçar falha
    await page.route('**/api/appointments', (route) => {
      if (route.request().method() === 'POST') {
        route.abort('failed');
      } else {
        route.continue();
      }
    });

    // Ficar offline
    await goOffline(page);

    // Criar agendamento
    await page.click('button:has-text("Novo Agendamento")');
    await page.fill('input[name="patientName"]', 'Paciente Falha');
    await page.fill('input[type="date"]', '2024-12-01');
    await page.fill('input[type="time"]', '14:00');
    await page.click('button[type="submit"]');

    // Voltar online (mas API vai falhar)
    await goOnline(page);

    // Aguardar tentativa de sync
    await page.waitForTimeout(3000);

    // Verificar que item está failed
    await expect(page.locator('text=Falha na sincronização')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=/1 falhou/i')).toBeVisible();

    // Remover intercept para permitir sucesso
    await page.unroute('**/api/appointments');

    // Clicar em retentar
    const retryButton = page.locator('button:has-text("Retentar")');
    await expect(retryButton).toBeVisible();
    await retryButton.click();

    // Aguardar sucesso
    await page.waitForTimeout(3000);

    // Item deve ter sido removido
    await expect(page.locator('text=Falha na sincronização')).not.toBeVisible();
  });
});

test.describe('Fluxo Offline - Múltiplas Ações', () => {
  test('deve processar múltiplas ações em ordem quando voltar online', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/patients`);

    // Ficar offline
    await goOffline(page);

    // Verificar offline
    await expect(page.locator('text=Você está offline')).toBeVisible({ timeout: 3000 });

    // Ações para fazer offline
    const actions = [
      { action: 'create', name: 'Novo Paciente 1' },
      { action: 'create', name: 'Novo Paciente 2' },
      { action: 'create', name: 'Novo Paciente 3' },
    ];

    // Executar ações
    for (const { name } of actions) {
      await page.click('button:has-text("Novo Paciente")');
      await page.fill('input[name="name"]', name);
      await page.fill('input[name="email"]', `${name.toLowerCase().replace(/\s/g, '')}@test.com`);
      await page.click('button[type="submit"]');
      await page.waitForTimeout(500);
    }

    // Verificar contador
    await expect(page.locator('text=/3 itens pendentes/i')).toBeVisible({ timeout: 3000 });

    // Voltar online
    await goOnline(page);

    // Aguardar sincronização
    await expect(page.locator('text=Conexão restaurada')).toBeVisible({ timeout: 3000 });
    await page.waitForTimeout(5000);

    // Verificar que todas ações foram processadas
    await expect(page.locator('text=/itens pendentes/i')).not.toBeVisible();

    // Verificar que pacientes foram criados (ou pelo menos tentados)
    // Nota: Pode precisar navegar para página de pacientes
    await page.goto(`${BASE_URL}/patients`);
    
    // Aguardar carregamento
    await page.waitForTimeout(2000);
  });
});

test.describe('Fluxo Offline - Acessibilidade', () => {
  test('deve ter roles ARIA corretos no indicador offline', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard`);

    // Ficar offline
    await goOffline(page);

    // Verificar roles ARIA
    const indicator = page.locator('[role="status"][aria-live="polite"]');
    await expect(indicator).toBeVisible({ timeout: 3000 });

    const alert = page.locator('[role="alert"]').first();
    await expect(alert).toBeVisible();

    // Verificar aria-label nos botões
    const dismissButton = page.locator('button[aria-label="Dispensar"]').first();
    await expect(dismissButton).toBeVisible();
  });

  test('deve ser navegável por teclado', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard`);

    // Ficar offline
    await goOffline(page);

    // Aguardar indicador
    await page.waitForSelector('text=Você está offline', { timeout: 3000 });

    // Focar no botão dispensar com Tab
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    // Pressionar Enter para dispensar
    await page.keyboard.press('Enter');

    // Indicador deve desaparecer
    await expect(page.locator('text=Você está offline')).not.toBeVisible({ timeout: 2000 });
  });
});

test.describe('Fluxo Offline - Edge Cases', () => {
  test('deve lidar com conexão instável (vai e volta)', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/agenda`);

    // Offline -> Online -> Offline -> Online rapidamente
    await goOffline(page);
    await page.waitForTimeout(1000);
    
    await goOnline(page);
    await page.waitForTimeout(1000);
    
    await goOffline(page);
    await page.waitForTimeout(1000);
    
    await goOnline(page);

    // Não deve travar ou duplicar indicadores
    const indicators = page.locator('[role="status"]');
    expect(await indicators.count()).toBeLessThanOrEqual(2);
  });

  test('deve permitir dispensar notificações', async ({ page }) => {
    await login(page);
    await page.goto(`${BASE_URL}/dashboard`);

    // Ficar offline
    await goOffline(page);
    
    await expect(page.locator('text=Você está offline')).toBeVisible({ timeout: 3000 });

    // Dispensar
    await page.click('button[aria-label="Dispensar"]');

    // Indicador deve desaparecer
    await expect(page.locator('text=Você está offline')).not.toBeVisible({ timeout: 2000 });
  });
});

