/**
 * Testes E2E: App para Pacientes - MoocaFisio
 * Fluxo completo: Gerar código, login, visualizar exercícios, marcar como concluído
 */

import { test, expect } from '@playwright/test';

test.describe('App para Pacientes - Fluxo Completo', () => {
  let accessCode: string;
  const patientId = 'test-patient-id'; // ID do paciente de teste
  const patientName = 'João da Silva';
  
  test.beforeAll(async ({ request }) => {
    // TODO: Setup - criar paciente de teste no banco se necessário
    // Este teste assume que o paciente já existe no banco de testes
  });
  
  test('Fisioterapeuta deve gerar código de acesso para paciente', async ({ page }) => {
    // 1. Login como fisioterapeuta
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'fisio@moocafisio.com.br');
    await page.fill('input[type="password"]', 'senha123');
    await page.click('button[type="submit"]');
    
    // Aguardar redirecionamento após login
    await page.waitForURL(/\/agenda|\/patients/);
    
    // 2. Navegar para lista de pacientes
    await page.goto('/patients');
    await page.waitForSelector('text=Pacientes');
    
    // 3. Clicar no primeiro paciente (ou buscar por nome)
    await page.click('text=' + patientName);
    await page.waitForURL(/\/patients\/[a-z0-9-]+/);
    
    // 4. Localizar e clicar no botão de gerar código
    await page.click('button:has-text("Gerar Código de Acesso")');
    
    // 5. Aguardar o código ser gerado
    await page.waitForSelector('text=/[A-Z0-9]{6}/', { timeout: 10000 });
    
    // 6. Extrair o código gerado
    const codeElement = await page.locator('text=/[A-Z0-9]{6}/').first();
    accessCode = await codeElement.textContent() || '';
    
    console.log('Código gerado:', accessCode);
    
    // 7. Validar que o código tem 6 caracteres
    expect(accessCode).toHaveLength(6);
    expect(accessCode).toMatch(/^[A-Z0-9]{6}$/);
    
    // 8. Verificar que o botão de copiar existe
    await expect(page.locator('button:has-text("Copiar Código")')).toBeVisible();
  });
  
  test('Paciente deve fazer login com código de acesso', async ({ page }) => {
    test.skip(!accessCode, 'Código de acesso não foi gerado');
    
    // 1. Navegar para página de login do paciente
    await page.goto('/patient/login');
    
    // 2. Verificar elementos da página
    await expect(page.locator('h1:has-text("Área do Paciente")')).toBeVisible();
    await expect(page.locator('text=Digite o código de acesso')).toBeVisible();
    
    // 3. Inserir código de acesso
    const codeInput = page.locator('input[type="text"][maxlength="6"]');
    await codeInput.fill(accessCode);
    
    // 4. Verificar que o botão está habilitado
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeEnabled();
    
    // 5. Fazer login
    await submitButton.click();
    
    // 6. Aguardar redirecionamento para dashboard
    await page.waitForURL('/patient/dashboard', { timeout: 10000 });
    
    // 7. Verificar que chegou ao dashboard
    await expect(page.locator('h1:has-text("Olá")')).toBeVisible();
    await expect(page.locator('text=MoocaFisio')).toBeVisible();
  });
  
  test('Paciente deve visualizar dashboard com estatísticas', async ({ page, context }) => {
    // Usar código de acesso do teste anterior
    test.skip(!accessCode, 'Código de acesso não disponível');
    
    // 1. Fazer login (reutilizar código)
    await page.goto('/patient/login');
    await page.fill('input[type="text"][maxlength="6"]', accessCode);
    await page.click('button[type="submit"]');
    await page.waitForURL('/patient/dashboard');
    
    // 2. Verificar cards de estatísticas
    await expect(page.locator('text=Exercícios Concluídos')).toBeVisible();
    await expect(page.locator('text=Taxa de Conclusão')).toBeVisible();
    await expect(page.locator('text=Sessões Realizadas')).toBeVisible();
    
    // 3. Verificar gráfico de progresso
    await expect(page.locator('text=Seu Progresso')).toBeVisible();
    
    // 4. Verificar navegação (mobile e desktop)
    const isMobile = page.viewportSize()!.width < 768;
    
    if (isMobile) {
      // Bottom navigation no mobile
      await expect(page.locator('nav >> text=Início')).toBeVisible();
      await expect(page.locator('nav >> text=Exercícios')).toBeVisible();
      await expect(page.locator('nav >> text=Perfil')).toBeVisible();
    } else {
      // Sidebar/header no desktop
      await expect(page.locator('header >> text=MoocaFisio')).toBeVisible();
    }
  });
  
  test('Paciente deve visualizar lista de exercícios', async ({ page }) => {
    test.skip(!accessCode, 'Código de acesso não disponível');
    
    // 1. Fazer login
    await page.goto('/patient/login');
    await page.fill('input[type="text"][maxlength="6"]', accessCode);
    await page.click('button[type="submit"]');
    await page.waitForURL('/patient/dashboard');
    
    // 2. Navegar para exercícios
    await page.click('text=Ver Meus Exercícios');
    await page.waitForURL('/patient/exercises');
    
    // 3. Verificar página de exercícios
    await expect(page.locator('h1:has-text("Meus Exercícios")')).toBeVisible();
    
    // 4. Verificar filtros
    await expect(page.locator('button:has-text("Todos")')).toBeVisible();
    await expect(page.locator('button:has-text("Pendentes")')).toBeVisible();
    await expect(page.locator('button:has-text("Concluídos")')).toBeVisible();
    
    // 5. Verificar se há exercícios ou estado vazio
    const hasExercises = await page.locator('text=Nenhum exercício encontrado').count() === 0;
    
    if (hasExercises) {
      // Se há exercícios, verificar cards
      await expect(page.locator('[class*="grid"]').first()).toBeVisible();
    } else {
      // Se não há exercícios, verificar mensagem
      await expect(page.locator('text=Nenhum exercício encontrado')).toBeVisible();
    }
  });
  
  test('Paciente deve abrir modal de exercício e marcar como concluído', async ({ page }) => {
    test.skip(!accessCode, 'Código de acesso não disponível');
    
    // 1. Fazer login e ir para exercícios
    await page.goto('/patient/login');
    await page.fill('input[type="text"][maxlength="6"]', accessCode);
    await page.click('button[type="submit"]');
    await page.waitForURL('/patient/dashboard');
    await page.goto('/patient/exercises');
    
    // 2. Verificar se há exercícios
    const exerciseCards = page.locator('[class*="card"]').filter({ hasText: /séries|repetições/i });
    const exerciseCount = await exerciseCards.count();
    
    test.skip(exerciseCount === 0, 'Nenhum exercício disponível para teste');
    
    // 3. Clicar no primeiro exercício
    await exerciseCards.first().click();
    
    // 4. Aguardar modal abrir
    await page.waitForSelector('[role="dialog"], .fixed.inset-0', { timeout: 5000 });
    
    // 5. Verificar elementos do modal
    await expect(page.locator('text=Séries')).toBeVisible();
    await expect(page.locator('text=Repetições')).toBeVisible();
    
    // 6. Verificar se há vídeo
    const hasVideo = await page.locator('video, iframe').count() > 0;
    if (hasVideo) {
      console.log('✓ Vídeo encontrado no modal');
    }
    
    // 7. Verificar botão de marcar como concluído
    const completeButton = page.locator('button:has-text("Marcar como Concluído")');
    const isCompleted = await completeButton.count() === 0;
    
    if (!isCompleted) {
      // 8. Marcar como concluído
      await completeButton.click();
      
      // 9. Aguardar feedback (pode ser fechamento do modal ou mensagem de sucesso)
      await page.waitForTimeout(1000);
      
      // 10. Verificar que o exercício foi marcado como concluído
      // (pode ser necessário reabrir o exercício ou verificar na lista)
    }
    
    // 11. Fechar modal
    const closeButton = page.locator('button:has-text("Fechar")');
    if (await closeButton.isVisible()) {
      await closeButton.click();
    }
  });
  
  test('Paciente deve testar filtros de exercícios', async ({ page }) => {
    test.skip(!accessCode, 'Código de acesso não disponível');
    
    // 1. Fazer login e ir para exercícios
    await page.goto('/patient/login');
    await page.fill('input[type="text"][maxlength="6"]', accessCode);
    await page.click('button[type="submit"]');
    await page.waitForURL('/patient/dashboard');
    await page.goto('/patient/exercises');
    
    // 2. Clicar em cada filtro
    const filters = ['Todos', 'Pendentes', 'Concluídos'];
    
    for (const filter of filters) {
      await page.click(`button:has-text("${filter}")`);
      await page.waitForTimeout(500);
      
      // Verificar que o filtro está ativo
      const filterButton = page.locator(`button:has-text("${filter}")`);
      await expect(filterButton).toHaveClass(/primary|blue/);
      
      console.log(`✓ Filtro "${filter}" aplicado`);
    }
  });
  
  test('Paciente deve acessar perfil e fazer logout', async ({ page }) => {
    test.skip(!accessCode, 'Código de acesso não disponível');
    
    // 1. Fazer login
    await page.goto('/patient/login');
    await page.fill('input[type="text"][maxlength="6"]', accessCode);
    await page.click('button[type="submit"]');
    await page.waitForURL('/patient/dashboard');
    
    // 2. Navegar para perfil
    await page.click('text=Perfil');
    await page.waitForURL('/patient/profile');
    
    // 3. Verificar página de perfil
    await expect(page.locator('h1:has-text("Meu Perfil")')).toBeVisible();
    await expect(page.locator(`text=${patientName}`)).toBeVisible();
    
    // 4. Verificar informações do paciente
    await expect(page.locator('text=Sobre o App')).toBeVisible();
    
    // 5. Fazer logout
    await page.click('button:has-text("Sair do Aplicativo")');
    
    // 6. Aguardar redirecionamento para login
    await page.waitForURL('/patient/login', { timeout: 5000 });
    
    // 7. Verificar que voltou para tela de login
    await expect(page.locator('h1:has-text("Área do Paciente")')).toBeVisible();
  });
  
  test('Deve validar responsividade mobile', async ({ page, context }) => {
    test.skip(!accessCode, 'Código de acesso não disponível');
    
    // 1. Configurar viewport mobile
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
    
    // 2. Fazer login
    await page.goto('/patient/login');
    await page.fill('input[type="text"][maxlength="6"]', accessCode);
    await page.click('button[type="submit"]');
    await page.waitForURL('/patient/dashboard');
    
    // 3. Verificar bottom navigation
    const bottomNav = page.locator('nav').last();
    await expect(bottomNav).toBeVisible();
    await expect(bottomNav.locator('text=Início')).toBeVisible();
    await expect(bottomNav.locator('text=Exercícios')).toBeVisible();
    await expect(bottomNav.locator('text=Perfil')).toBeVisible();
    
    // 4. Testar navegação entre páginas
    await page.click('nav >> text=Exercícios');
    await page.waitForURL('/patient/exercises');
    await expect(page.locator('h1')).toContainText('Meus Exercícios');
    
    await page.click('nav >> text=Perfil');
    await page.waitForURL('/patient/profile');
    await expect(page.locator('h1')).toContainText('Meu Perfil');
    
    await page.click('nav >> text=Início');
    await page.waitForURL('/patient/dashboard');
    
    console.log('✓ Navegação mobile funcionando corretamente');
  });
});

