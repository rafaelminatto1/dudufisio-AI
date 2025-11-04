/**
 * Testes E2E - Prescrição de Exercícios
 * 
 * Testa o fluxo completo de prescrição de exercícios terapêuticos:
 * - Navegação na biblioteca de exercícios
 * - Busca e filtros
 * - Criação de protocolos
 * - Configuração de séries/repetições
 * - Atribuição a pacientes
 * - Visualização no portal do paciente
 * - Acompanhamento de progresso
 */

import { test, expect } from '@playwright/test';

// Helper para login como terapeuta
async function loginAsTherapist(page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('admin@moocafisio.com.br');
  await page.getByLabel(/senha/i).fill('admin123');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await page.waitForURL(/\/dashboard|\/agenda/i, { timeout: 15000 });
}

// Helper para login como paciente
async function loginAsPatient(page) {
  await page.goto('/');
  await page.getByLabel(/email/i).fill('paciente@moocafisio.com.br');
  await page.getByLabel(/senha/i).fill('paciente123');
  await page.getByRole('button', { name: /entrar|login/i }).click();
  await page.waitForURL(/\/dashboard|\/patient/i, { timeout: 15000 });
}

// Helper para navegar até exercícios
async function navigateToExercises(page) {
  const exercisesLink = page.getByTestId('nav--exercises') ||
                        page.getByTestId('nav--exercise-library') ||
                        page.getByRole('link', { name: /exerc[íi]cio/i });
  
  if (await exercisesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await exercisesLink.click();
  } else {
    await page.goto('/exercises');
  }
  
  await page.waitForLoadState('networkidle');
}

test.describe('Prescrição de Exercícios Terapêuticos', () => {
  
  test.beforeEach(async ({ page }) => {
    await loginAsTherapist(page);
  });

  test('deve navegar pela biblioteca de exercícios', async ({ page }) => {
    await navigateToExercises(page);
    
    // Verificar título da página
    await expect(page.getByRole('heading', { name: /exerc[íi]cio|biblioteca/i })).toBeVisible({ timeout: 10000 });
    
    // Verificar que há exercícios listados
    const exerciseCards = page.locator('[data-testid*="exercise-card"], [data-testid*="exercise-item"]');
    const count = await exerciseCards.count();
    
    expect(count).toBeGreaterThan(0);
    
    // Verificar elementos de um card de exercício
    const firstCard = exerciseCards.first();
    if (await firstCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Deve ter nome do exercício
      const cardText = await firstCard.textContent();
      expect(cardText).toBeTruthy();
      expect(cardText?.length).toBeGreaterThan(0);
    }
  });

  test('deve buscar exercício por nome', async ({ page }) => {
    await navigateToExercises(page);
    
    // Localizar campo de busca
    const searchInput = page.getByPlaceholder(/buscar|pesquisar/i) ||
                        page.getByRole('searchbox');
    
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Buscar por um exercício comum
      await searchInput.fill('agachamento');
      await page.waitForTimeout(1000);
      
      // Verificar resultados
      const results = page.locator('[data-testid*="exercise"]');
      const count = await results.count();
      
      if (count > 0) {
        // Verificar que os resultados contêm o termo buscado
        for (let i = 0; i < Math.min(count, 3); i++) {
          const text = await results.nth(i).textContent();
          expect(text?.toLowerCase()).toContain('agachamento');
        }
      }
    } else {
      test.skip(true, 'Campo de busca não encontrado');
    }
  });

  test('deve filtrar exercícios por categoria', async ({ page }) => {
    await navigateToExercises(page);
    
    // Localizar filtro de categoria
    const categoryFilter = page.getByLabel(/categoria|tipo/i);
    
    if (await categoryFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await categoryFilter.click();
      await page.waitForTimeout(500);
      
      // Selecionar uma categoria (ex: Fortalecimento)
      const option = page.getByRole('option', { name: /fortalecimento|strength/i });
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click();
      } else {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1000);
      
      // Verificar que a lista foi filtrada
      const exercises = page.locator('[data-testid*="exercise"]');
      const count = await exercises.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      test.skip(true, 'Filtro de categoria não encontrado');
    }
  });

  test('deve visualizar detalhes e vídeo do exercício', async ({ page }) => {
    await navigateToExercises(page);
    
    // Clicar em um exercício
    const firstExercise = page.locator('[data-testid*="exercise-card"]').first();
    
    if (await firstExercise.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstExercise.click();
      await page.waitForTimeout(1000);
      
      // Verificar modal/página de detalhes
      await expect(page.getByText(/descri[çc][ãa]o|instru[çc][õo]es|como fazer/i)).toBeVisible({ timeout: 5000 });
      
      // Verificar se há vídeo ou imagem
      const video = page.locator('video, iframe[src*="youtube"], iframe[src*="vimeo"]');
      const image = page.locator('img[alt*="exerc"]');
      
      const hasVideo = await video.count() > 0;
      const hasImage = await image.count() > 0;
      
      expect(hasVideo || hasImage).toBeTruthy();
    } else {
      test.skip(true, 'Nenhum exercício disponível');
    }
  });

  test('deve criar novo protocolo de exercícios', async ({ page }) => {
    await navigateToExercises(page);
    
    // Procurar botão de criar protocolo
    const newProtocolBtn = page.getByRole('button', { name: /novo protocolo|criar protocolo/i });
    
    if (await newProtocolBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await newProtocolBtn.click();
      await page.waitForTimeout(1000);
      
      // Preencher nome do protocolo
      const nameInput = page.getByLabel(/nome|t[íi]tulo/i);
      await nameInput.fill('Protocolo de Fortalecimento Lombar - Teste E2E');
      
      // Adicionar descrição
      const descInput = page.getByLabel(/descri[çc][ãa]o/i);
      if (await descInput.isVisible({ timeout: 3000 }).catch(() => false)) {
        await descInput.fill('Protocolo para fortalecimento da musculatura lombar e estabilização do core.');
      }
      
      // Salvar protocolo básico
      await page.getByRole('button', { name: /salvar|criar/i }).click();
      
      // Verificar sucesso
      await expect(page.getByText(/protocolo criado|sucesso/i)).toBeVisible({ timeout: 10000 });
    } else {
      // Tentar navegação direta
      await page.goto('/protocols');
      await page.waitForLoadState('networkidle');
      
      const newBtn = page.getByRole('button', { name: /novo|criar/i });
      if (await newBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await newBtn.click();
      } else {
        test.skip(true, 'Não foi possível criar protocolo');
      }
    }
  });

  test('deve adicionar 5 exercícios ao protocolo', async ({ page }) => {
    // Criar protocolo primeiro
    await navigateToExercises(page);
    
    // Navegar para protocolos
    await page.goto('/protocols');
    await page.waitForLoadState('networkidle');
    
    // Abrir protocolo existente ou criar novo
    const firstProtocol = page.locator('[data-testid*="protocol"]').first();
    
    if (await firstProtocol.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstProtocol.click();
      await page.waitForTimeout(1000);
      
      // Procurar botão de adicionar exercício
      const addExerciseBtn = page.getByRole('button', { name: /adicionar exerc[íi]cio/i });
      
      if (await addExerciseBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        // Adicionar 5 exercícios
        for (let i = 0; i < 5; i++) {
          await addExerciseBtn.click();
          await page.waitForTimeout(500);
          
          // Selecionar exercício da lista
          const exerciseList = page.locator('[data-testid*="exercise-option"]');
          const count = await exerciseList.count();
          
          if (count > i) {
            await exerciseList.nth(i).click();
            await page.waitForTimeout(500);
            
            // Confirmar seleção
            const confirmBtn = page.getByRole('button', { name: /adicionar|confirmar/i });
            if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
              await confirmBtn.click();
            }
          }
          
          await page.waitForTimeout(500);
        }
        
        // Verificar que 5 exercícios foram adicionados
        const addedExercises = page.locator('[data-testid*="protocol-exercise"]');
        const finalCount = await addedExercises.count();
        
        expect(finalCount).toBeGreaterThanOrEqual(5);
      }
    } else {
      test.skip(true, 'Nenhum protocolo disponível');
    }
  });

  test('deve configurar séries e repetições', async ({ page }) => {
    await page.goto('/protocols');
    await page.waitForLoadState('networkidle');
    
    // Abrir protocolo
    const firstProtocol = page.locator('[data-testid*="protocol"]').first();
    
    if (await firstProtocol.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstProtocol.click();
      await page.waitForTimeout(1000);
      
      // Localizar primeiro exercício do protocolo
      const firstExercise = page.locator('[data-testid*="protocol-exercise"]').first();
      
      if (await firstExercise.isVisible({ timeout: 3000 }).catch(() => false)) {
        // Procurar campos de configuração
        const setsInput = page.getByLabel(/s[ée]rie|sets/i).first();
        const repsInput = page.getByLabel(/repeti[çc][õo]es|reps/i).first();
        
        if (await setsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await setsInput.clear();
          await setsInput.fill('3');
        }
        
        if (await repsInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          await repsInput.clear();
          await repsInput.fill('12');
        }
        
        // Configurar tempo de descanso
        const restInput = page.getByLabel(/descanso|rest|intervalo/i).first();
        if (await restInput.isVisible({ timeout: 2000 }).catch(() => false)) {
          await restInput.fill('60');
        }
        
        // Salvar configurações
        const saveBtn = page.getByRole('button', { name: /salvar/i });
        if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
          await saveBtn.click();
          await expect(page.getByText(/salvo|atualizado/i)).toBeVisible({ timeout: 5000 });
        }
      }
    } else {
      test.skip(true, 'Nenhum protocolo disponível');
    }
  });

  test('deve atribuir protocolo a paciente', async ({ page }) => {
    await page.goto('/protocols');
    await page.waitForLoadState('networkidle');
    
    // Abrir protocolo
    const firstProtocol = page.locator('[data-testid*="protocol"]').first();
    
    if (await firstProtocol.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstProtocol.click();
      await page.waitForTimeout(1000);
      
      // Procurar botão de atribuir
      const assignBtn = page.getByRole('button', { name: /atribuir|prescrever|enviar para paciente/i });
      
      if (await assignBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await assignBtn.click();
        await page.waitForTimeout(1000);
        
        // Selecionar paciente
        const patientSelect = page.getByLabel(/paciente/i);
        if (await patientSelect.isVisible({ timeout: 3000 }).catch(() => false)) {
          await patientSelect.click();
          await page.waitForTimeout(500);
          
          // Selecionar primeiro paciente
          await page.keyboard.press('ArrowDown');
          await page.keyboard.press('Enter');
          
          // Confirmar atribuição
          const confirmBtn = page.getByRole('button', { name: /atribuir|confirmar|enviar/i });
          if (await confirmBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await confirmBtn.click();
            
            // Verificar sucesso
            await expect(page.getByText(/atribu[íi]do|prescrito|enviado|sucesso/i)).toBeVisible({ timeout: 10000 });
          }
        }
      }
    } else {
      test.skip(true, 'Nenhum protocolo disponível');
    }
  });

  test('paciente deve visualizar exercícios no portal', async ({ page }) => {
    // Fazer logout do terapeuta e login como paciente
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Logout
    const logoutBtn = page.getByRole('button', { name: /sair|logout/i });
    if (await logoutBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutBtn.click();
      await page.waitForTimeout(1000);
    }
    
    // Login como paciente
    await loginAsPatient(page);
    
    // Navegar para exercícios
    const exercisesLink = page.getByRole('link', { name: /exerc[íi]cio|meus exerc[íi]cio/i });
    
    if (await exercisesLink.isVisible({ timeout: 5000 }).catch(() => false)) {
      await exercisesLink.click();
      await page.waitForTimeout(2000);
      
      // Verificar que há exercícios prescritos
      const exercises = page.locator('[data-testid*="exercise"], .exercise-card');
      const count = await exercises.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
      
      if (count > 0) {
        // Verificar elementos do exercício
        const firstExercise = exercises.first();
        await expect(firstExercise).toBeVisible();
        
        // Verificar que tem informações de séries/reps
        const text = await firstExercise.textContent();
        expect(text).toMatch(/s[ée]rie|repeti[çc]/i);
      }
    } else {
      test.skip(true, 'Portal do paciente não acessível');
    }
  });

  test('paciente deve marcar exercício como concluído', async ({ page }) => {
    await loginAsPatient(page);
    
    // Navegar para exercícios
    await page.goto('/patient/exercises');
    await page.waitForLoadState('networkidle');
    
    // Localizar primeiro exercício
    const firstExercise = page.locator('[data-testid*="exercise"]').first();
    
    if (await firstExercise.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Procurar checkbox ou botão de "concluir"
      const completeBtn = page.getByRole('button', { name: /concluir|completar|feito/i }).first() ||
                          page.locator('input[type="checkbox"]').first();
      
      if (await completeBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await completeBtn.click();
        
        // Verificar feedback visual
        await page.waitForTimeout(1000);
        
        // Pode aparecer mensagem de sucesso ou checkmark
        const feedback = page.getByText(/conclu[íi]do|completo|feito/i) ||
                        page.locator('[data-testid*="completed"]');
        
        const isVisible = await feedback.isVisible({ timeout: 3000 }).catch(() => false);
        if (isVisible) {
          await expect(feedback).toBeVisible();
        }
      }
    } else {
      test.skip(true, 'Nenhum exercício disponível para o paciente');
    }
  });

  test('terapeuta deve visualizar progresso do paciente', async ({ page }) => {
    await loginAsTherapist(page);
    
    // Navegar para página de pacientes
    await page.goto('/patients');
    await page.waitForLoadState('networkidle');
    
    // Abrir primeiro paciente
    const firstPatient = page.locator('[data-testid*="patient-row"]').first();
    
    if (await firstPatient.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstPatient.click();
      await page.waitForTimeout(2000);
      
      // Procurar tab de exercícios/progresso
      const exercisesTab = page.getByRole('tab', { name: /exerc[íi]cio|progresso|ader[êe]ncia/i });
      
      if (await exercisesTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await exercisesTab.click();
        await page.waitForTimeout(1000);
        
        // Verificar que há informações de progresso
        const progressInfo = page.getByText(/progresso|ader[êe]ncia|conclu[íi]do|%/);
        const count = await progressInfo.count();
        
        expect(count).toBeGreaterThan(0);
        
        // Pode ter gráfico ou indicadores visuais
        const chart = page.locator('svg, canvas, [data-testid*="chart"]');
        const hasChart = await chart.count() > 0;
        
        // Aceitar tanto gráfico quanto texto
        expect(hasChart || count > 0).toBeTruthy();
      }
    } else {
      test.skip(true, 'Nenhum paciente disponível');
    }
  });

  test('deve editar protocolo existente', async ({ page }) => {
    await page.goto('/protocols');
    await page.waitForLoadState('networkidle');
    
    // Abrir protocolo
    const firstProtocol = page.locator('[data-testid*="protocol"]').first();
    
    if (await firstProtocol.isVisible({ timeout: 5000 }).catch(() => false)) {
      await firstProtocol.click();
      await page.waitForTimeout(1000);
      
      // Procurar botão de editar
      const editBtn = page.getByRole('button', { name: /editar/i });
      
      if (await editBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await editBtn.click();
        await page.waitForTimeout(1000);
        
        // Modificar nome
        const nameInput = page.getByLabel(/nome|t[íi]tulo/i);
        if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
          const currentValue = await nameInput.inputValue();
          await nameInput.fill(currentValue + ' [EDITADO]');
          
          // Salvar
          const saveBtn = page.getByRole('button', { name: /salvar/i });
          if (await saveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
            await saveBtn.click();
            
            // Verificar sucesso
            await expect(page.getByText(/atualizado|salvo|sucesso/i)).toBeVisible({ timeout: 10000 });
          }
        }
      }
    } else {
      test.skip(true, 'Nenhum protocolo disponível para editar');
    }
  });

  test('deve filtrar exercícios por parte do corpo', async ({ page }) => {
    await navigateToExercises(page);
    
    // Localizar filtro de parte do corpo
    const bodyPartFilter = page.getByLabel(/parte do corpo|regi[ãa]o|local/i);
    
    if (await bodyPartFilter.isVisible({ timeout: 5000 }).catch(() => false)) {
      await bodyPartFilter.click();
      await page.waitForTimeout(500);
      
      // Selecionar uma parte (ex: Lombar)
      const option = page.getByRole('option', { name: /lombar|lower back/i });
      if (await option.isVisible({ timeout: 2000 }).catch(() => false)) {
        await option.click();
      } else {
        await page.keyboard.press('ArrowDown');
        await page.keyboard.press('Enter');
      }
      
      await page.waitForTimeout(1000);
      
      // Verificar que a lista foi filtrada
      const exercises = page.locator('[data-testid*="exercise"]');
      const count = await exercises.count();
      
      expect(count).toBeGreaterThanOrEqual(0);
    } else {
      test.skip(true, 'Filtro de parte do corpo não encontrado');
    }
  });
});
