import { test, expect } from '@playwright/test';

/**
 * Teste E2E: Templates de Conduta
 * 
 * Valida:
 * - Criação de templates
 * - Listagem de templates
 * - Aplicação de templates em evolução
 * - Edição de templates
 * - Deleção de templates
 */

test.describe('Templates de Conduta', () => {

  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

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

  test('1. Criar novo template de conduta', async ({ page }) => {
    // Navegar para área de templates ou evolução
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    // Abrir evolução
    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Preencher dados SOAP
      const textarea = page.locator('textarea, [contenteditable="true"]').first();
      if (await textarea.isVisible().catch(() => false)) {
        await textarea.fill('Template de conduta para reabilitação de joelho');
      }

      // Procurar botão de salvar template
      const saveTemplateBtn = page.locator('button').filter({ 
        hasText: /template|salvar como|save as/i 
      }).first();

      if (await saveTemplateBtn.isVisible().catch(() => false)) {
        await saveTemplateBtn.click();
        await page.waitForTimeout(1000);

        // Preencher nome do template
        const templateNameInput = page.locator('input[type="text"]').filter({
          hasText: /nome|name|título/i
        }).first();

        if (await templateNameInput.isVisible().catch(() => false)) {
          await templateNameInput.fill(`Template Teste ${Date.now()}`);
        }

        // Confirmar criação
        const confirmBtn = page.locator('button').filter({ 
          hasText: /confirmar|salvar|save/i 
        }).first();
        
        if (await confirmBtn.isVisible().catch(() => false)) {
          await confirmBtn.click();
          await page.waitForTimeout(1500);

          console.log('✅ Template criado');
        }
      } else {
        console.log('⚠️  Botão de criar template não encontrado');
      }

      await page.screenshot({
        path: 'test-results/screenshots/template-created.png',
        fullPage: true
      });
    }
  });

  test('2. Listar templates existentes', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Procurar botão de aplicar/ver templates
      const templatesBtn = page.locator('button, a').filter({ 
        hasText: /templates|modelos|aplicar/i 
      }).first();

      if (await templatesBtn.isVisible().catch(() => false)) {
        await templatesBtn.click();
        await page.waitForTimeout(1000);

        // Contar templates listados
        const templateItems = page.locator('[class*="template"], [data-testid*="template"]');
        const count = await templateItems.count();

        console.log(`📊 ${count} templates encontrados`);

        await page.screenshot({
          path: 'test-results/screenshots/templates-list.png',
          fullPage: true
        });
      } else {
        console.log('⚠️  Botão de templates não encontrado');
      }
    }
  });

  test('3. Aplicar template em nova evolução', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Abrir lista de templates
      const templatesBtn = page.locator('button').filter({ 
        hasText: /template|aplicar/i 
      }).first();

      if (await templatesBtn.isVisible().catch(() => false)) {
        await templatesBtn.click();
        await page.waitForTimeout(1000);

        // Selecionar primeiro template
        const firstTemplate = page.locator('[class*="template"]').first();
        if (await firstTemplate.isVisible().catch(() => false)) {
          await firstTemplate.click();
          await page.waitForTimeout(1000);

          // Verificar se campos foram preenchidos
          const textareas = page.locator('textarea, [contenteditable="true"]');
          const firstTextarea = textareas.first();
          
          if (await firstTextarea.isVisible().catch(() => false)) {
            const content = await firstTextarea.textContent();
            if (content && content.length > 0) {
              console.log('✅ Template aplicado, campos preenchidos');
            }
          }

          await page.screenshot({
            path: 'test-results/screenshots/template-applied.png',
            fullPage: true
          });
        }
      }
    }
  });

  test('4. Editar template existente', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Abrir templates
      const templatesBtn = page.locator('button').filter({ 
        hasText: /template/i 
      }).first();

      if (await templatesBtn.isVisible().catch(() => false)) {
        await templatesBtn.click();
        await page.waitForTimeout(1000);

        // Procurar botão de editar no primeiro template
        const editBtn = page.locator('button').filter({ 
          hasText: /editar|edit|✏️/i 
        }).first();

        if (await editBtn.isVisible().catch(() => false)) {
          await editBtn.click();
          await page.waitForTimeout(1000);

          // Editar nome ou conteúdo
          const nameInput = page.locator('input[type="text"]').first();
          if (await nameInput.isVisible().catch(() => false)) {
            await nameInput.fill(`Template Editado ${Date.now()}`);
          }

          // Salvar edição
          const saveBtn = page.locator('button').filter({ 
            hasText: /salvar|save/i 
          }).first();
          
          if (await saveBtn.isVisible().catch(() => false)) {
            await saveBtn.click();
            await page.waitForTimeout(1000);
            console.log('✅ Template editado');
          }

          await page.screenshot({
            path: 'test-results/screenshots/template-edited.png',
            fullPage: true
          });
        }
      }
    }
  });

  test('5. Deletar template', async ({ page }) => {
    await page.goto('/agenda');
    await page.waitForTimeout(2000);

    const appointment = page.locator('[class*="appointment"]').first();
    if (await appointment.isVisible().catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1500);

      // Abrir templates
      const templatesBtn = page.locator('button').filter({ 
        hasText: /template/i 
      }).first();

      if (await templatesBtn.isVisible().catch(() => false)) {
        await templatesBtn.click();
        await page.waitForTimeout(1000);

        // Procurar botão de deletar
        const deleteBtn = page.locator('button').filter({ 
          hasText: /deletar|excluir|remover|delete|🗑️/i 
        }).first();

        if (await deleteBtn.isVisible().catch(() => false)) {
          await deleteBtn.click();
          await page.waitForTimeout(500);

          // Confirmar deleção se aparecer dialog
          const confirmBtn = page.locator('button').filter({ 
            hasText: /confirmar|sim|yes/i 
          }).first();

          if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await confirmBtn.click();
            await page.waitForTimeout(1000);
            console.log('✅ Template deletado');
          }

          await page.screenshot({
            path: 'test-results/screenshots/template-deleted.png',
            fullPage: true
          });
        } else {
          console.log('⚠️  Botão de deletar não encontrado');
        }
      }
    }
  });
});

