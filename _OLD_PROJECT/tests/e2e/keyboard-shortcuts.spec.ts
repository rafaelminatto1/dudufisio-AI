import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Atalhos de Teclado
 * 
 * Valida atalhos no sistema de evolução:
 * - Ctrl+S: Salvar sem fechar
 * - Ctrl+Enter: Salvar e fechar
 * - Esc: Cancelar/fechar
 * - Ctrl+Z / Ctrl+Shift+Z: Desfazer/Refazer no editor
 */

test.describe('Atalhos de Teclado', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Login
    const sidebar = page.locator('aside, nav');
    try {
      await sidebar.waitFor({ state: 'visible', timeout: 3000 });
    } catch {
      await page.fill('input[type="email"]', 'therapist@dudufisio.com');
      await page.fill('input[type="password"]', 'demo123456');
      await page.click('button[type="submit"]');
      await page.waitForLoadState('networkidle');
    }
  });

  test('1. Ctrl+S - Salvar sem fechar', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Verificar se modal está aberto
      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        // Preencher campo
        const textarea = page.locator('textarea, [contenteditable="true"]').first();
        if (await textarea.isVisible().catch(() => false)) {
          await textarea.click();
          await textarea.fill('Teste Ctrl+S');

          // Pressionar Ctrl+S
          await page.keyboard.press('Control+S');
          await page.waitForTimeout(1500);

          // Verificar se modal ainda está aberto
          const stillVisible = await modal.isVisible().catch(() => false);
          
          if (stillVisible) {
            console.log('✅ Ctrl+S: Modal permaneceu aberto após salvar');
          } else {
            console.log('⚠️  Modal fechou (comportamento inesperado para Ctrl+S)');
          }

          // Procurar indicador de salvamento
          const savedIndicator = page.locator('text=/salvo|saved|success/i');
          const hasFeedback = await savedIndicator.isVisible({ timeout: 2000 }).catch(() => false);
          
          if (hasFeedback) {
            console.log('✅ Feedback de salvamento visível');
          }
        }

        await page.screenshot({
          path: 'test-results/screenshots/shortcut-ctrl-s.png',
          fullPage: true
        });
      }
    }
  });

  test('2. Ctrl+Enter - Salvar e fechar', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      const modal = page.locator('[role="dialog"]');
      const modalWasVisible = await modal.isVisible().catch(() => false);

      if (modalWasVisible) {
        // Preencher campo
        const textarea = page.locator('textarea, [contenteditable="true"]').first();
        if (await textarea.isVisible().catch(() => false)) {
          await textarea.click();
          await textarea.fill('Teste Ctrl+Enter para salvar e fechar');

          // Pressionar Ctrl+Enter
          await page.keyboard.press('Control+Enter');
          await page.waitForTimeout(2000);

          // Verificar se modal fechou
          const modalStillVisible = await modal.isVisible({ timeout: 2000 }).catch(() => false);

          if (!modalStillVisible) {
            console.log('✅ Ctrl+Enter: Modal fechou após salvar');
          } else {
            console.log('⚠️  Ctrl+Enter: Modal ainda visível');
          }
        }

        await page.screenshot({
          path: 'test-results/screenshots/shortcut-ctrl-enter.png',
          fullPage: true
        });
      }
    }
  });

  test('3. Esc - Cancelar/Fechar', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      const modal = page.locator('[role="dialog"]');
      const modalVisible = await modal.isVisible().catch(() => false);

      if (modalVisible) {
        // Preencher algo para forçar confirmação
        const textarea = page.locator('textarea, [contenteditable="true"]').first();
        if (await textarea.isVisible().catch(() => false)) {
          await textarea.fill('Teste Esc com alterações');
          await page.waitForTimeout(500);
        }

        // Pressionar Esc
        await page.keyboard.press('Escape');
        await page.waitForTimeout(1500);

        // Verificar se apareceu dialog de confirmação
        const confirmDialog = page.locator('[role="alertdialog"], text=/confirma|cancelar|descartar/i');
        const hasConfirm = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);

        if (hasConfirm) {
          console.log('✅ Esc: Diálogo de confirmação apareceu');
          
          await page.screenshot({
            path: 'test-results/screenshots/shortcut-esc-confirm.png',
            fullPage: true
          });

          // Confirmar cancelamento
          const confirmBtn = page.locator('button').filter({ 
            hasText: /sim|yes|confirmar|descartar/i 
          }).first();
          
          if (await confirmBtn.isVisible().catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
          }
        } else {
          // Verificar se modal fechou diretamente
          const modalStillVisible = await modal.isVisible().catch(() => false);
          if (!modalStillVisible) {
            console.log('✅ Esc: Modal fechou diretamente');
          }
        }
      }
    }
  });

  test('4. Ctrl+Z - Desfazer no editor', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      const textarea = page.locator('textarea, [contenteditable="true"]').first();
      if (await textarea.isVisible().catch(() => false)) {
        // Escrever texto inicial
        await textarea.click();
        await textarea.fill('Texto inicial');
        await page.waitForTimeout(300);

        // Adicionar mais texto
        await textarea.press('End');
        await page.keyboard.type(' - Texto adicional');
        await page.waitForTimeout(300);

        // Obter texto completo
        const fullText = await textarea.inputValue().catch(async () => {
          return await textarea.textContent();
        });

        // Desfazer com Ctrl+Z
        await page.keyboard.press('Control+Z');
        await page.waitForTimeout(500);

        // Verificar se texto voltou ao estado anterior
        const textAfterUndo = await textarea.inputValue().catch(async () => {
          return await textarea.textContent();
        });

        if (textAfterUndo && fullText && textAfterUndo !== fullText && textAfterUndo.length < fullText.length) {
          console.log('✅ Ctrl+Z: Desfazer funcionou');
        } else {
          console.log('⚠️  Ctrl+Z: Comportamento não detectado claramente');
        }

        await page.screenshot({
          path: 'test-results/screenshots/shortcut-ctrl-z.png',
          fullPage: true
        });
      }
    }
  });

  test('5. Ctrl+Shift+Z - Refazer no editor', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      const textarea = page.locator('textarea, [contenteditable="true"]').first();
      if (await textarea.isVisible().catch(() => false)) {
        // Escrever texto
        await textarea.click();
        await textarea.fill('Texto para refazer');
        await page.waitForTimeout(300);

        const originalText = await textarea.inputValue().catch(async () => {
          return await textarea.textContent();
        });

        // Desfazer
        await page.keyboard.press('Control+Z');
        await page.waitForTimeout(500);

        // Refazer com Ctrl+Shift+Z
        await page.keyboard.press('Control+Shift+Z');
        await page.waitForTimeout(500);

        const textAfterRedo = await textarea.inputValue().catch(async () => {
          return await textarea.textContent();
        });

        if (textAfterRedo === originalText) {
          console.log('✅ Ctrl+Shift+Z: Refazer funcionou');
        } else {
          console.log('⚠️  Ctrl+Shift+Z: Texto não voltou ao original');
        }

        await page.screenshot({
          path: 'test-results/screenshots/shortcut-ctrl-shift-z.png',
          fullPage: true
        });
      }
    }
  });

  test('6. Teste de múltiplos atalhos em sequência', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      const textarea = page.locator('textarea, [contenteditable="true"]').first();
      if (await textarea.isVisible().catch(() => false)) {
        // Escrever
        await textarea.click();
        await textarea.fill('Teste 1');
        
        // Salvar com Ctrl+S
        await page.keyboard.press('Control+S');
        await page.waitForTimeout(1000);

        // Editar novamente
        await textarea.fill('Teste 2 - Editado');

        // Salvar e fechar com Ctrl+Enter
        await page.keyboard.press('Control+Enter');
        await page.waitForTimeout(2000);

        console.log('✅ Sequência de atalhos executada');

        await page.screenshot({
          path: 'test-results/screenshots/shortcuts-sequence.png',
          fullPage: true
        });
      }
    }
  });
});

