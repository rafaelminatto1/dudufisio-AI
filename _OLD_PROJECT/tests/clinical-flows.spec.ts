import { test, expect } from '@playwright/test';

test.describe('Clinical Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should create initial assessment', async ({ page }) => {
    // Navigate to assessment form
    await page.click('text=Avaliação Inicial');
    
    // Fill in patient ID
    await page.fill('input[placeholder="UUID do Paciente"]', 'test-patient-id');
    
    // Fill in chief complaint
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Dor na região lombar há 2 semanas, piora com movimentos de flexão');
    
    // Fill in medical history
    await page.fill('textarea[placeholder="Histórico de doenças, cirurgias, medicamentos..."]', 
      'HAS controlada, sem cirurgias prévias, uso de losartana 50mg/dia');
    
    // Fill in physical exam
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Inspeção: postura antálgica, desvio lateral da coluna. Palpação: dor à palpação L4-L5, espasmo muscular paravertebral');
    
    // Fill in diagnosis
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'Lombalgia aguda inespecífica (M54.5)');
    
    // Fill in treatment plan
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Fisioterapia 3x/semana por 4 semanas: mobilização articular, fortalecimento muscular, orientações posturais');
    
    // Fill in goals
    await page.fill('textarea[placeholder="Metas de curto e longo prazo..."]', 
      'Curto prazo: redução da dor em 50% em 2 semanas. Longo prazo: retorno às atividades laborais em 4 semanas');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Avaliação Salva!')).toBeVisible();
  });

  test('should create session evolution', async ({ page }) => {
    // Navigate to evolution form
    await page.click('text=Evolução de Sessão');
    
    // Fill in patient ID (should be pre-filled)
    await expect(page.locator('input[placeholder="UUID do Paciente"]')).toHaveValue('test-patient-id');
    
    // Fill in appointment ID (should be pre-filled)
    await expect(page.locator('input[placeholder="UUID da Consulta"]')).toHaveValue('test-appointment-id');
    
    // Fill in subjective assessment
    await page.fill('textarea[placeholder="Como o paciente se sentiu na sessão? Queixas, percepções..."]', 
      'Paciente relata melhora da dor após a sessão anterior, conseguiu dormir melhor');
    
    // Set pain level before session
    await page.locator('input[type="range"]').first().fill('6');
    
    // Set pain level after session
    await page.locator('input[type="range"]').nth(1).fill('3');
    
    // Fill in objective findings
    await page.fill('textarea[placeholder="Medidas, testes, observações clínicas..."]', 
      'ADM lombar: flexão 60°, extensão 20°, lateral direita 15°, lateral esquerda 10°. Teste de Lasègue negativo');
    
    // Fill in techniques applied
    await page.fill('textarea[placeholder="Descreva as técnicas e exercícios realizados..."]', 
      'Mobilização articular L4-L5, exercícios de fortalecimento do core, alongamentos da cadeia posterior');
    
    // Fill in patient response
    await page.fill('textarea[placeholder="Como o paciente respondeu às intervenções? Reações adversas?"]', 
      'Paciente respondeu bem às técnicas, sem reações adversas');
    
    // Fill in next session plan
    await page.fill('textarea[placeholder="O que será feito na próxima sessão? Recomendações?"]', 
      'Continuar com mobilização articular, introduzir exercícios de estabilização, orientar sobre ergonomia');
    
    // Fill in home exercises
    await page.fill('textarea[placeholder="Instruções para exercícios em casa..."]', 
      'Exercícios de alongamento da cadeia posterior 2x/dia, exercícios de fortalecimento do core 1x/dia');
    
    // Submit the form
    await page.click('button[type="submit"]');
    
    // Verify success message
    await expect(page.locator('text=Evolução Salva!')).toBeVisible();
  });

  test('should view clinical timeline', async ({ page }) => {
    // Navigate to timeline
    await page.click('text=Timeline Clínica');
    
    // Verify timeline is visible
    await expect(page.locator('text=Linha do Tempo Clínica')).toBeVisible();
    
    // Check if events are displayed
    await expect(page.locator('[data-testid="timeline-event"]')).toHaveCount.greaterThan(0);
  });

  test('should view clinical documents', async ({ page }) => {
    // Navigate to documents
    await page.click('text=Documentos Clínicos');
    
    // Verify document viewer is visible
    await expect(page.locator('text=Documento ID:')).toBeVisible();
    
    // Check if document content is displayed
    await expect(page.locator('[data-testid="document-content"]')).toBeVisible();
  });

  test('should validate form fields', async ({ page }) => {
    // Navigate to assessment form
    await page.click('text=Avaliação Inicial');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Verify validation errors
    await expect(page.locator('text=A queixa principal deve ter pelo menos 10 caracteres.')).toBeVisible();
    await expect(page.locator('text=O exame físico deve ter pelo menos 20 caracteres.')).toBeVisible();
    await expect(page.locator('text=O diagnóstico deve ter pelo menos 10 caracteres.')).toBeVisible();
    await expect(page.locator('text=O plano de tratamento deve ter pelo menos 20 caracteres.')).toBeVisible();
  });

  test('should handle pain level sliders', async ({ page }) => {
    // Navigate to evolution form
    await page.click('text=Evolução de Sessão');
    
    // Test pain level before slider
    const painBeforeSlider = page.locator('input[type="range"]').first();
    await painBeforeSlider.fill('5');
    await expect(page.locator('text=Dor: 5/10')).toBeVisible();
    
    // Test pain level after slider
    const painAfterSlider = page.locator('input[type="range"]').nth(1);
    await painAfterSlider.fill('2');
    await expect(page.locator('text=Dor: 2/10')).toBeVisible();
  });
});
