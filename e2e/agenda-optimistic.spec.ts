import { test, expect } from '@playwright/test';

/**
 * Testes para useOptimistic no AgendaCalendar
 * Valida que UI atualiza instantaneamente e reverte em erros
 */

test.describe('Agenda - useOptimistic Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login (ajustar conforme seu fluxo de auth)
    await page.goto('/login');
    // TODO: Implementar login
    // await page.fill('[name="email"]', 'test@example.com');
    // await page.fill('[name="password"]', 'password');
    // await page.click('button[type="submit"]');

    // Navegar para agenda
    await page.goto('/dashboard/agenda');
    await page.waitForSelector('h1:has-text("Agenda")', { timeout: 10000 });
  });

  test('should update UI instantly when creating appointment', async ({ page }) => {
    // Clicar em "Novo Agendamento"
    await page.click('button:has-text("Novo Agendamento")');

    // Preencher formulário
    await page.waitForSelector('[data-testid="appointment-form"]', { timeout: 5000 });
    // TODO: Preencher campos do formulário

    // Medir tempo de atualização da UI
    const startTime = Date.now();

    // Submeter formulário
    await page.click('button[type="submit"]');

    // Verificar que UI atualizou imediatamente (< 100ms)
    await page.waitForSelector('[data-testid="appointment-card"]', { timeout: 100 });
    const updateTime = Date.now() - startTime;

    // UI otimista deve ser instantânea
    expect(updateTime).toBeLessThan(100);

    // Verificar que modal fechou imediatamente
    await expect(page.locator('[data-testid="appointment-form"]')).not.toBeVisible();
  });

  test('should delete appointment instantly from UI', async ({ page }) => {
    // Encontrar um agendamento
    const appointment = page.locator('[data-testid="appointment-card"]').first();
    await appointment.waitFor({ state: 'visible' });

    const appointmentId = await appointment.getAttribute('data-appointment-id');

    // Medir tempo
    const startTime = Date.now();

    // Clicar em deletar
    await appointment.locator('button[aria-label="Deletar"]').click();

    // Confirmar
    page.on('dialog', (dialog) => dialog.accept());

    // Verificar que sumiu imediatamente
    await expect(appointment).not.toBeVisible({ timeout: 100 });
    const deleteTime = Date.now() - startTime;

    // Deve ser instantâneo
    expect(deleteTime).toBeLessThan(100);
  });

  test('should move appointment instantly with drag and drop', async ({ page }) => {
    // Trocar para visualização semanal
    await page.click('button:has-text("Semanal")');

    // Encontrar um agendamento
    const appointment = page.locator('[data-testid="appointment-card"]').first();
    await appointment.waitFor({ state: 'visible' });

    // Posição original
    const originalBox = await appointment.boundingBox();

    // Medir tempo
    const startTime = Date.now();

    // Arrastar para nova posição
    await appointment.dragTo(page.locator('[data-slot="next-day"]').first());

    // Verificar que moveu imediatamente
    const newBox = await appointment.boundingBox();
    const moveTime = Date.now() - startTime;

    // Posição deve ter mudado instantaneamente
    expect(newBox?.x).not.toBe(originalBox?.x);
    expect(moveTime).toBeLessThan(200);
  });

  test('should rollback on server error', async ({ page, context }) => {
    // Interceptar requisição e forçar erro
    await context.route('**/api/appointments/**', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' }),
      });
    });

    // Encontrar um agendamento
    const appointment = page.locator('[data-testid="appointment-card"]').first();
    const originalText = await appointment.textContent();

    // Tentar editar
    await appointment.click();
    await page.waitForSelector('[data-testid="appointment-form"]');

    // Alterar algo
    await page.fill('[name="notes"]', 'Nova nota');
    await page.click('button[type="submit"]');

    // Aguardar erro
    await page.waitForSelector('text=Erro', { timeout: 3000 });

    // Verificar que reverteu ao estado original
    const currentText = await appointment.textContent();
    expect(currentText).toBe(originalText);
  });

  test('should show loading state during operation', async ({ page }) => {
    // Interceptar para fazer operação demorar
    await page.route('**/api/appointments/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      route.continue();
    });

    // Criar agendamento
    await page.click('button:has-text("Novo Agendamento")');
    await page.waitForSelector('[data-testid="appointment-form"]');
    // TODO: Preencher formulário
    await page.click('button[type="submit"]');

    // Verificar que botão mostra "Salvando..."
    await expect(page.locator('button:has-text("Salvando...")')).toBeVisible();

    // Verificar que card tem opacity reduzido
    const card = page.locator('Card').first();
    const opacity = await card.evaluate((el) => window.getComputedStyle(el).opacity);
    expect(parseFloat(opacity)).toBeLessThan(1);
  });

  test('should handle multiple rapid actions', async ({ page }) => {
    // Criar múltiplos agendamentos rapidamente
    for (let i = 0; i < 3; i++) {
      await page.click('button:has-text("Novo Agendamento")');
      await page.waitForSelector('[data-testid="appointment-form"]');
      // TODO: Preencher formulário
      await page.click('button[type="submit"]');

      // Não esperar operação completar
      await page.waitForTimeout(100);
    }

    // Verificar que todos apareceram na UI
    const appointments = page.locator('[data-testid="appointment-card"]');
    const count = await appointments.count();
    expect(count).toBeGreaterThanOrEqual(3);
  });

  test('should prevent interactions during pending state', async ({ page }) => {
    // Interceptar para fazer operação demorar
    await page.route('**/api/appointments/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      route.continue();
    });

    // Iniciar operação
    await page.click('button:has-text("Novo Agendamento")');
    await page.waitForSelector('[data-testid="appointment-form"]');
    await page.click('button[type="submit"]');

    // Verificar que botões estão desabilitados
    const dailyButton = page.locator('button:has-text("Diária")');
    await expect(dailyButton).toBeDisabled();

    const newButton = page.locator('button:has-text("Novo Agendamento")');
    await expect(newButton).toBeDisabled();
  });
});

test.describe('Agenda - Performance Tests', () => {
  test('should have good Web Vitals with optimistic updates', async ({ page }) => {
    const vitals: any[] = [];

    // Capturar Web Vitals
    await page.evaluateOnNewDocument(() => {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          (window as any).vitals = (window as any).vitals || [];
          (window as any).vitals.push({
            name: entry.name,
            value: (entry as any).value || (entry as any).startTime,
          });
        }
      }).observe({ entryTypes: ['paint', 'largest-contentful-paint', 'layout-shift'] });
    });

    await page.goto('/dashboard/agenda');
    await page.waitForSelector('h1:has-text("Agenda")');

    // Fazer várias operações otimistas
    for (let i = 0; i < 5; i++) {
      const appointment = page.locator('[data-testid="appointment-card"]').nth(i);
      if (await appointment.isVisible()) {
        await appointment.click();
        await page.keyboard.press('Escape');
      }
    }

    // Obter métricas
    const pageVitals = await page.evaluate(() => (window as any).vitals || []);

    // FCP deve ser bom
    const fcp = pageVitals.find((v: any) => v.name === 'first-contentful-paint');
    if (fcp) {
      expect(fcp.value).toBeLessThan(1800); // < 1.8s
    }

    // CLS deve ser baixo (atualizações otimistas não devem causar layout shift)
    const cls = pageVitals.filter((v: any) => v.name === 'layout-shift');
    const totalCLS = cls.reduce((sum: number, v: any) => sum + v.value, 0);
    expect(totalCLS).toBeLessThan(0.1); // Bom CLS
  });

  test('should maintain 60fps during optimistic updates', async ({ page }) => {
    await page.goto('/dashboard/agenda');

    // Começar a medir FPS
    await page.evaluate(() => {
      (window as any).fps = [];
      let lastTime = performance.now();

      function measureFPS() {
        const currentTime = performance.now();
        const fps = 1000 / (currentTime - lastTime);
        (window as any).fps.push(fps);
        lastTime = currentTime;
        requestAnimationFrame(measureFPS);
      }

      requestAnimationFrame(measureFPS);
    });

    // Fazer 10 operações rápidas
    for (let i = 0; i < 10; i++) {
      const appointment = page.locator('[data-testid="appointment-card"]').nth(i);
      if (await appointment.isVisible()) {
        await appointment.click();
        await page.keyboard.press('Escape');
      }
    }

    // Obter FPS médio
    const fpsData = await page.evaluate(() => (window as any).fps);
    const avgFPS = fpsData.reduce((a: number, b: number) => a + b, 0) / fpsData.length;

    // Deve manter >= 55 FPS (próximo de 60)
    expect(avgFPS).toBeGreaterThanOrEqual(55);
  });
});
