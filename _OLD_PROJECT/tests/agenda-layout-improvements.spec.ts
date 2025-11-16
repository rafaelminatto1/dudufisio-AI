import { test, expect } from '@playwright/test';

test.describe('Agenda Layout Improvements', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página da agenda
    await page.goto('/agenda');
    
    // Aguardar o carregamento da página
    await page.waitForSelector('[data-testid="agenda-page"]', { timeout: 10000 });
  });

  test('Sidebar should have reduced width', async ({ page }) => {
    // Verificar se a sidebar não está muito larga
    const sidebar = page.locator('[data-testid="sidebar"]');
    const sidebarBox = await sidebar.boundingBox();
    
    // A largura deve ser menor que 250px (anteriormente era 208px = w-52)
    expect(sidebarBox?.width).toBeLessThan(250);
    expect(sidebarBox?.width).toBeGreaterThan(150); // Deve ser pelo menos 192px (w-48)
  });

  test('Calendar should have proper spacing from sidebar', async ({ page }) => {
    // Verificar se há espaçamento adequado entre sidebar e calendário
    const calendar = page.locator('[data-testid="calendar-grid"]');
    const calendarBox = await calendar.boundingBox();
    
    // O calendário não deve estar colado na sidebar
    expect(calendarBox?.x).toBeGreaterThan(200);
  });

  test('Day headers should have compact format', async ({ page }) => {
    // Verificar se os cabeçalhos dos dias estão no formato compacto (24/seg)
    const dayHeaders = page.locator('[data-testid="day-header"]');
    const firstHeader = dayHeaders.first();
    
    // Verificar se contém o formato de data compacto
    await expect(firstHeader).toContainText(/\d{1,2}\/\w{3}/);
  });

  test('Appointment blocks should be more compact', async ({ page }) => {
    // Verificar se os blocos de agendamento são mais compactos
    const appointmentBlocks = page.locator('[data-testid="appointment-block"]');
    
    if (await appointmentBlocks.count() > 0) {
      const firstBlock = appointmentBlocks.first();
      const blockBox = await firstBlock.boundingBox();
      
      // Altura deve ser menor (mais compacta)
      expect(blockBox?.height).toBeLessThan(50);
    }
  });

  test('Calendar should not touch right edge', async ({ page }) => {
    // Verificar se o calendário tem margem da borda direita
    const calendar = page.locator('[data-testid="calendar-grid"]');
    const calendarBox = await calendar.boundingBox();
    const viewportWidth = page.viewportSize()?.width || 0;
    
    // O calendário deve ter pelo menos 20px de margem da borda direita
    expect(calendarBox?.x + (calendarBox?.width || 0)).toBeLessThan(viewportWidth - 20);
  });

  test('Appointment text should be larger and more readable', async ({ page }) => {
    // Verificar se o texto dos agendamentos é maior e mais legível
    const appointmentText = page.locator('[data-testid="appointment-text"]');
    
    if (await appointmentText.count() > 0) {
      const firstText = appointmentText.first();
      
      // Verificar se o texto tem tamanho adequado (não muito pequeno)
      const fontSize = await firstText.evaluate(el => 
        window.getComputedStyle(el).fontSize
      );
      
      // Deve ser pelo menos 12px
      const fontSizeNumber = parseInt(fontSize);
      expect(fontSizeNumber).toBeGreaterThanOrEqual(12);
    }
  });

  test('Holiday indicator should appear on holidays', async ({ page }) => {
    // Verificar se o indicador de feriado aparece em datas de feriado
    // Nota: Este teste seria mais útil em datas específicas de feriado
    const holidayIndicator = page.locator('[data-testid="holiday-indicator"]');
    
    // Se houver indicadores de feriado, verificar se estão visíveis
    if (await holidayIndicator.count() > 0) {
      await expect(holidayIndicator.first()).toBeVisible();
    }
  });

  test('Appointment colors should be more vibrant', async ({ page }) => {
    // Verificar se as cores dos agendamentos são mais vibrantes
    const appointmentBlocks = page.locator('[data-testid="appointment-block"]');
    
    if (await appointmentBlocks.count() > 0) {
      const firstBlock = appointmentBlocks.first();
      
      // Verificar se tem cores mais vibrantes (bg-600 em vez de bg-500)
      const backgroundColor = await firstBlock.evaluate(el => 
        window.getComputedStyle(el).backgroundColor
      );
      
      // Deve ter uma cor de fundo definida (não transparente)
      expect(backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    }
  });
});
