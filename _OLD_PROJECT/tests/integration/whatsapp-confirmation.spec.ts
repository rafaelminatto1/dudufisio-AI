import { test, expect } from '@playwright/test';
import { loginAsAdmin } from '../helpers/login';

const AGENDA_URL = '/agenda';

async function ensureOnAgenda(page: import('@playwright/test').Page) {
  if (!page.url().includes('/agenda')) {
    await page.goto(AGENDA_URL, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForSelector('[data-testid^="appointment-card-"]', { timeout: 20000 });
}

test.describe('Confirmações via WhatsApp', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
    await ensureOnAgenda(page);
  });

  test('exibe status de confirmação e permite reenviar lembrete manualmente', async ({ page }) => {
    await page.route('**/api/whatsapp/reminder', async (route) => {
      await route.fulfill({
        status: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ success: true, messageId: 'test-message-id' })
      });
    });

    const appointmentCard = page.locator('[data-testid^="appointment-card-"]').first();

    if (!(await appointmentCard.isVisible({ timeout: 1000 }))) {
      test.skip(true, 'Nenhum agendamento disponível para testar confirmações');
    }

    await appointmentCard.click();

    const detailModal = page.locator('[data-testid="appointment-detail-modal"]');
    await expect(detailModal).toBeVisible({ timeout: 10000 });

    const confirmationBadge = detailModal.locator('[data-testid="appointment-confirmation-badge"]');
    await expect(confirmationBadge).toBeVisible();

    const lastReminder = detailModal.locator('[data-testid="appointment-last-reminder"]');
    if (await lastReminder.count()) {
      await expect(lastReminder.first()).toBeVisible();
    }

    await detailModal.getByTestId('btn-whatsapp-resend').click();

    await Promise.all([
      page.waitForResponse((response) =>
        response.url().includes('/api/whatsapp/reminder') && response.status() === 200
      ),
      page.getByTestId('whatsapp-reminder-24h').click(),
    ]);

    await expect(page.getByText('Lembrete reenviado com sucesso')).toBeVisible({ timeout: 5000 });
  });
});
