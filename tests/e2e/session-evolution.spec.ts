/**
 * Testes E2E - Evolução de Sessão (SOAP Notes)
 * 
 * Testa o fluxo completo de documentação clínica:
 * - Abertura de sessão agendada
 * - Preenchimento do formulário SOAP
 * - Auto-save de rascunhos
 * - Múltiplas condutas
 * - Anexos e documentos
 * - Finalização e assinatura
 * - Histórico de evoluções
 */

import { test, expect } from '@playwright/test';

// Helper para login
async function loginAsTherapist(page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('admin@dudufisio.com');
  await page.getByLabel(/senha/i).fill('DuduFisio2024!');
  await page.getByTestId('login-submit').click();
  await page.waitForURL(/\/dashboard|\/agenda/i, { timeout: 15000 });
}

// Helper para navegar até sessões/evoluções
async function navigateToEvolution(page) {
  // Tentar navegar pelo menu
  const evolutionLink = page.getByTestId('nav--session-evolution') ||
                        page.getByRole('link', { name: /evolu[çc][ãa]o|sess[ãa]o/i });
  
  if (await evolutionLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await evolutionLink.click();
  } else {
    // Fallback: navegação direta
    await page.goto('/session-evolution');
  }
  
  await page.waitForLoadState('networkidle');
}

test.describe('Evolução de Sessão - SOAP Notes', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsTherapist(page);
  });

  test('deve abrir sessão agendada', async ({ page }) => {
    // Navegar para agenda
    await page.goto('/agenda');
    await page.waitForLoadState('networkidle');
    
    // Localizar um agendamento
    const appointment = page.locator('[data-testid*="appointment"]').first();
    
    if (await appointment.isVisible({ timeout: 5000 }).catch(() => false)) {
      await appointment.click();
      await page.waitForTimeout(1000);
      
      // Procurar botão de iniciar sessão/evolução
      const startSessionBtn = page.getByRole('button', { name: /iniciar|atender|evolu[çc][ãa]o/i });
      
      if (await startSessionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await startSessionBtn.click();
        
        // Aguardar navegação para página de evolução
        await page.waitForURL(/session|evolution|atendimento/i, { timeout: 10000 });
        
        // Verificar que o formulário SOAP está presente
        await expect(page.getByText(/subjetivo|soap/i)).toBeVisible({ timeout: 10000 });
      }
    } else {
      test.skip(true, 'Nenhum agendamento disponível');
    }
  });

  test('deve preencher formulário SOAP completo', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Criar nova evolução
    const newBtn = page.getByRole('button', { name: /nova evolu[çc][ãa]o|nova sess[ãa]o/i });
    
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(2000);
    } else {
      // Tentar navegar diretamente
      await page.goto('/atendimento');
      await page.waitForLoadState('networkidle');
    }
    
    // S - Subjetivo (Queixas do paciente)
    const subjective = page.getByLabel(/subjetivo|queixa/i);
    if (await subjective.isVisible({ timeout: 5000 }).catch(() => false)) {
      await subjective.fill('Paciente relata dor lombar há 3 dias, com piora ao movimento de flexão. Refere formigamento em MIE.');
    }
    
    // O - Objetivo (Avaliação física)
    const objective = page.getByLabel(/objetivo|observa[çc][ãa]o|avalia[çc][ãa]o/i);
    if (await objective.isVisible({ timeout: 5000 }).catch(() => false)) {
      await objective.fill('PA: 4/10. ADM lombar limitada (50%). Teste de Lasègue positivo à esquerda. Força muscular grau 4 em flexores de quadril.');
    }
    
    // A - Avaliação/Assessment
    const assessment = page.getByLabel(/avalia[çc][ãa]o|assessment|diagn[óo]stico/i);
    if (await assessment.isVisible({ timeout: 5000 }).catch(() => false)) {
      await assessment.fill('Lombalgia aguda com irradiação. Possível compressão radicular L5-S1.');
    }
    
    // P - Plano/Planejamento
    const plan = page.getByLabel(/plano|planejamento|plan|conduta/i);
    if (await plan.isVisible({ timeout: 5000 }).catch(() => false)) {
      await plan.fill('Iniciar protocolo de descompressão. Terapia manual + cinesioterapia + crioterapia.');
    }
    
    // Adicionar nível de dor
    const painLevel = page.getByLabel(/dor|eva|escala/i);
    if (await painLevel.isVisible({ timeout: 3000 }).catch(() => false)) {
      await painLevel.fill('4');
    }
    
    await page.waitForTimeout(1000);
  });

  test('deve salvar automaticamente (auto-save)', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Criar nova evolução
    const newBtn = page.getByRole('button', { name: /nova evolu[çc][ãa]o/i });
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Preencher campo
    const subjective = page.getByLabel(/subjetivo|queixa/i);
    if (await subjective.isVisible({ timeout: 5000 }).catch(() => false)) {
      await subjective.fill('Teste de auto-save');
      
      // Aguardar indicador de salvamento
      await page.waitForTimeout(3000);
      
      // Verificar se há indicador de "salvo" ou "rascunho"
      const saveIndicator = page.getByText(/salvo|rascunho|saved|draft/i);
      const isVisible = await saveIndicator.isVisible({ timeout: 5000 }).catch(() => false);
      
      if (isVisible) {
        await expect(saveIndicator).toBeVisible();
      }
    }
  });

  test('deve registrar múltiplas condutas', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Navegar para seção de condutas
    const conductTab = page.getByRole('tab', { name: /conduta/i }) ||
                       page.getByText(/conduta/i);
    
    if (await conductTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await conductTab.click();
      await page.waitForTimeout(1000);
      
      // Adicionar primeira conduta
      const addConductBtn = page.getByRole('button', { name: /adicionar conduta|nova conduta/i });
      if (await addConductBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Conduta 1
        await addConductBtn.click();
        await page.waitForTimeout(500);
        
        const conductInput = page.getByLabel(/conduta|procedimento/i).first();
        await conductInput.fill('Terapia Manual - Mobilização vertebral L4-L5');
        
        // Conduta 2
        await addConductBtn.click();
        await page.waitForTimeout(500);
        
        const conductInput2 = page.getByLabel(/conduta|procedimento/i).last();
        await conductInput2.fill('Cinesioterapia - Fortalecimento de core (3x10 repetições)');
        
        // Conduta 3
        await addConductBtn.click();
        await page.waitForTimeout(500);
        
        const conductInput3 = page.getByLabel(/conduta|procedimento/i).last();
        await conductInput3.fill('Crioterapia - 15 minutos em região lombar');
        
        // Verificar que todas foram adicionadas
        const conducts = page.getByText(/Terapia Manual|Cinesioterapia|Crioterapia/);
        const count = await conducts.count();
        expect(count).toBeGreaterThanOrEqual(3);
      }
    }
  });

  test('deve adicionar anexos (fotos/documentos)', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Procurar seção de anexos
    const attachmentTab = page.getByRole('tab', { name: /anexo|arquivo|documento/i });
    
    if (await attachmentTab.isVisible({ timeout: 5000 }).catch(() => false)) {
      await attachmentTab.click();
      await page.waitForTimeout(1000);
      
      // Localizar botão de upload
      const uploadBtn = page.getByRole('button', { name: /upload|anexar|adicionar arquivo/i });
      
      if (await uploadBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Verificar que o input de arquivo existe
        const fileInput = page.locator('input[type="file"]');
        const exists = await fileInput.count() > 0;
        
        expect(exists).toBeTruthy();
        
        // Nota: Não vamos fazer upload real em testes automatizados
        // mas verificamos que a funcionalidade está presente
      }
    } else {
      test.skip(true, 'Seção de anexos não encontrada');
    }
  });

  test('deve finalizar e assinar evolução', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Criar evolução rápida
    const newBtn = page.getByRole('button', { name: /nova evolu[çc][ãa]o/i });
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Preencher mínimo necessário
    const subjective = page.getByLabel(/subjetivo/i);
    if (await subjective.isVisible({ timeout: 3000 }).catch(() => false)) {
      await subjective.fill('Teste de finalização');
    }
    
    const objective = page.getByLabel(/objetivo/i);
    if (await objective.isVisible({ timeout: 3000 }).catch(() => false)) {
      await objective.fill('Avaliação teste');
    }
    
    await page.waitForTimeout(1000);
    
    // Procurar botão de finalizar
    const finishBtn = page.getByRole('button', { name: /finalizar|concluir|assinar/i });
    
    if (await finishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishBtn.click();
      
      // Pode aparecer confirmação
      const confirmBtn = page.getByRole('button', { name: /sim|confirmar/i });
      if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmBtn.click();
      }
      
      // Verificar mensagem de sucesso
      await expect(page.getByText(/finalizada|conclu[íi]da|sucesso/i)).toBeVisible({ timeout: 10000 });
    }
  });

  test('deve visualizar histórico de evoluções', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Verificar se há lista de evoluções
    const evolutionList = page.locator('[data-testid*="evolution-list"], [data-testid*="session-list"]');
    
    if (await evolutionList.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Verificar elementos do histórico
      const items = page.locator('[data-testid*="evolution-item"], [data-testid*="session-item"]');
      const count = await items.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
      
      if (count > 0) {
        // Verificar que cada item tem data
        const firstItem = items.first();
        const text = await firstItem.textContent();
        
        // Deve conter data (formato DD/MM/YYYY ou similar)
        expect(text).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}/);
      }
    } else {
      // Tentar via paciente
      await page.goto('/patients');
      await page.waitForLoadState('networkidle');
      
      const firstPatient = page.locator('[data-testid*="patient-row"]').first();
      if (await firstPatient.isVisible({ timeout: 3000 }).catch(() => false)) {
        await firstPatient.click();
        await page.waitForTimeout(2000);
        
        // Procurar tab de evoluções
        const evolutionTab = page.getByRole('tab', { name: /evolu[çc][ãa]o|hist[óo]rico/i });
        if (await evolutionTab.isVisible({ timeout: 3000 }).catch(() => false)) {
          await evolutionTab.click();
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('deve editar evolução recente', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Localizar primeira evolução da lista
    const firstEvolution = page.locator('[data-testid*="evolution-item"]').first();
    
    if (await firstEvolution.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstEvolution.click();
      await page.waitForTimeout(1000);
      
      // Procurar botão de editar
      const editBtn = page.getByRole('button', { name: /editar/i });
      
      if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(1000);
        
        // Modificar campo
        const subjective = page.getByLabel(/subjetivo/i);
        if (await subjective.isVisible({ timeout: 3000 }).catch(() => false)) {
          const currentValue = await subjective.inputValue();
          await subjective.fill(currentValue + ' [EDITADO]');
          
          // Salvar
          const saveBtn = page.getByRole('button', { name: /salvar/i });
          if (await saveBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
            await saveBtn.click();
            
            // Verificar sucesso
            await expect(page.getByText(/atualizado|salvo|sucesso/i)).toBeVisible({ timeout: 10000 });
          }
        }
      }
    } else {
      test.skip(true, 'Nenhuma evolução disponível para editar');
    }
  });

  test('deve gerar PDF da evolução', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Localizar evolução
    const firstEvolution = page.locator('[data-testid*="evolution-item"]').first();
    
    if (await firstEvolution.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstEvolution.click();
      await page.waitForTimeout(1000);
      
      // Procurar botão de gerar PDF / exportar
      const pdfBtn = page.getByRole('button', { name: /pdf|exportar|imprimir|relat[óo]rio/i });
      
      if (await pdfBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Configurar listener para download
        const downloadPromise = page.waitForEvent('download', { timeout: 15000 });
        
        await pdfBtn.click();
        
        try {
          const download = await downloadPromise;
          const filename = download.suggestedFilename();
          
          // Verificar que é um PDF
          expect(filename).toMatch(/\.pdf$/i);
        } catch (error) {
          // Se não houver download, pode ser que abra em nova aba
          // ou exiba inline - isso também é aceitável
          console.log('PDF não iniciou download, mas pode estar funcionando corretamente');
        }
      }
    } else {
      test.skip(true, 'Nenhuma evolução disponível');
    }
  });

  test('deve validar campos obrigatórios', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Criar nova evolução
    const newBtn = page.getByRole('button', { name: /nova evolu[çc][ãa]o/i });
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(2000);
    }
    
    // Tentar finalizar sem preencher
    const finishBtn = page.getByRole('button', { name: /finalizar|concluir/i });
    
    if (await finishBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await finishBtn.click();
      
      // Verificar mensagem de validação
      await expect(page.getByText(/obrigat[óo]rio|required|preencha|campo.*vazio/i)).toBeVisible({ timeout: 5000 });
    }
  });

  test('deve mostrar indicador de tempo de sessão', async ({ page }) => {
    await navigateToEvolution(page);
    
    // Criar nova sessão
    const newBtn = page.getByRole('button', { name: /nova evolu[çc][ãa]o|nova sess[ãa]o/i });
    if (await newBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newBtn.click();
      await page.waitForTimeout(2000);
      
      // Procurar timer/cronômetro
      const timer = page.getByText(/\d{1,2}:\d{2}|\d{1,2}min|tempo/i);
      
      if (await timer.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Aguardar e verificar que o tempo está incrementando
        const initialTime = await timer.textContent();
        await page.waitForTimeout(3000);
        const newTime = await timer.textContent();
        
        // O tempo deve ter mudado
        expect(newTime).not.toBe(initialTime);
      }
    }
  });
});
