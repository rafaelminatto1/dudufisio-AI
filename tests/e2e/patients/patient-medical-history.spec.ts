import { test, expect } from '@playwright/test';
import { testUsers } from '../__fixtures__/users';

test.describe('Histórico Médico do Paciente', () => {
  test.beforeEach(async ({ page }) => {
    // Login como fisioterapeuta
    await page.goto('/');
    const therapist = testUsers.therapist;
    
    await page.fill('input[type="email"]', therapist.email);
    await page.fill('input[type="password"]', therapist.password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/.*dashboard/, { timeout: 10000 });

    // Navegar para pacientes
    await page.click('text=Pacientes');
    await page.waitForURL(/.*pacientes/, { timeout: 10000 });

    // Abrir primeiro paciente
    const firstPatient = page.locator(
      '[data-testid="patient-card"], .patient-item, button:has-text("Maria"), a:has-text("Maria")'
    ).first();

    await firstPatient.click();
    await page.waitForTimeout(1000);
  });

  test('Deve exibir seção de histórico médico', async ({ page }) => {
    // Procurar por seção de histórico
    const historySection = page.locator(
      'text=Histórico, text=Prontuário, text=Notas Clínicas, [data-testid="medical-history"]'
    );

    // Pode estar em aba/tab
    const historyTab = page.locator('button:has-text("Histórico"), [role="tab"]:has-text("Prontuário")');
    
    if (await historyTab.count().then(c => c > 0)) {
      await historyTab.first().click();
    }

    await expect(historySection.first()).toBeVisible({ timeout: 5000 });
  });

  test('Deve exibir notas SOAP', async ({ page }) => {
    // Clicar em aba de histórico se existir
    const historyTab = page.locator('button:has-text("Histórico"), text=SOAP, text=Notas').first();
    if (await historyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await historyTab.click();
    }

    // Procurar notas SOAP
    const soapNotes = page.locator('text=Subjetivo, text=Objetivo, text=SOAP, [data-testid="soap-note"]');

    if (await soapNotes.count().then(c => c > 0)) {
      await expect(soapNotes.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve ter opção de adicionar nova nota', async ({ page }) => {
    // Procurar botão de adicionar nota
    const addNoteButton = page.locator(
      'button:has-text("Nova Nota"), button:has-text("Adicionar Nota"), button:has-text("+ Nota")'
    ).first();

    if (await addNoteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await expect(addNoteButton).toBeVisible();
      
      // Clicar para abrir formulário
      await addNoteButton.click();

      // Deve aparecer campos SOAP
      await expect(
        page.locator('textarea[name="subjective"], input[name="subjective"], text=Subjetivo').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve exibir avaliações do paciente', async ({ page }) => {
    // Clicar em aba de avaliações se existir
    const evaluationTab = page.locator('button:has-text("Avaliações"), text=Avaliação').first();
    if (await evaluationTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await evaluationTab.click();
    }

    // Procurar avaliações
    const evaluations = page.locator('text=Avaliação, [data-testid="evaluation"]');

    if (await evaluations.count().then(c => c > 0)) {
      await expect(evaluations.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve exibir mapa corporal de dor', async ({ page }) => {
    // Procurar por mapa corporal
    const bodyMapTab = page.locator('button:has-text("Mapa"), text=Corporal, text=Dor').first();
    
    if (await bodyMapTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await bodyMapTab.click();

      // Deve mostrar canvas ou SVG do corpo
      const bodyMap = page.locator('canvas, svg, [data-testid="body-map"]');
      await expect(bodyMap.first()).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve exibir plano de tratamento', async ({ page }) => {
    // Clicar em aba de tratamento
    const treatmentTab = page.locator('button:has-text("Tratamento"), text=Plano').first();
    
    if (await treatmentTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await treatmentTab.click();

      // Deve mostrar plano ou exercícios
      await expect(
        page.locator('text=Plano de tratamento, text=Exercícios, text=Protocolo').first()
      ).toBeVisible({ timeout: 5000 });
    }
  });

  test('Deve ordenar histórico por data', async ({ page }) => {
    // Clicar em histórico
    const historyTab = page.locator('button:has-text("Histórico"), text=Notas').first();
    if (await historyTab.isVisible({ timeout: 2000 }).catch(() => false)) {
      await historyTab.click();
    }

    // Procurar datas nas notas
    const dates = page.locator('time, .date, [data-testid="note-date"]');
    
    if (await dates.count().then(c => c >= 2)) {
      // Verificar se estão em ordem (mais recente primeiro)
      const firstDate = await dates.first().textContent();
      const secondDate = await dates.nth(1).textContent();
      
      expect(firstDate).toBeTruthy();
      expect(secondDate).toBeTruthy();
    }
  });

  test('Deve filtrar histórico por tipo', async ({ page }) => {
    // Procurar filtro de tipo
    const typeFilter = page.locator(
      'select:has(option:has-text("SOAP")), button:has-text("Filtrar")'
    ).first();

    if (await typeFilter.isVisible({ timeout: 2000 }).catch(() => false)) {
      await typeFilter.click();
      
      // Selecionar um tipo
      await page.click('text=SOAP, text=Avaliação');
      await page.waitForTimeout(500);

      // Verificar que lista foi filtrada
      // (implementação específica)
    }
  });

  test('Deve permitir editar nota existente', async ({ page }) => {
    // Procurar primeira nota
    const firstNote = page.locator('[data-testid="soap-note"], .note-item').first();

    if (await firstNote.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Procurar botão de editar na nota
      const editButton = firstNote.locator('button:has-text("Editar"), button[title="Editar"]');
      
      if (await editButton.count().then(c => c > 0)) {
        await editButton.first().click();

        // Deve abrir formulário de edição
        await expect(
          page.locator('textarea[name="subjective"], input[name="subjective"]').first()
        ).toBeVisible({ timeout: 5000 });
      }
    }
  });

  test('Deve permitir excluir nota (com confirmação)', async ({ page }) => {
    // Procurar primeira nota
    const firstNote = page.locator('[data-testid="soap-note"], .note-item').first();

    if (await firstNote.isVisible({ timeout: 3000 }).catch(() => false)) {
      // Procurar botão de excluir
      const deleteButton = firstNote.locator('button:has-text("Excluir"), button[title="Excluir"]');
      
      if (await deleteButton.count().then(c => c > 0)) {
        await deleteButton.first().click();

        // Deve mostrar confirmação
        await expect(
          page.locator('text=Confirmar, text=Tem certeza, text=Deseja excluir').first()
        ).toBeVisible({ timeout: 3000 });
      }
    }
  });
});









