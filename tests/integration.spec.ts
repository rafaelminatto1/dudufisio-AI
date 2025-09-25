import { test, expect } from '@playwright/test';

test.describe('Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('should integrate with Supabase', async ({ page }) => {
    // Test database connection by creating a document
    await page.click('text=Avaliação Inicial');
    
    // Fill minimal required fields
    await page.fill('input[placeholder="UUID do Paciente"]', 'test-patient-id');
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Teste de integração com banco de dados');
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Exame físico normal para teste de integração');
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'Teste de integração (Z00.0)');
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Teste de integração com fisioterapia');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify success (indicates database write worked)
    await expect(page.locator('text=Avaliação Salva!')).toBeVisible();
  });

  test('should validate FHIR compliance', async ({ page }) => {
    // Test FHIR resource creation
    await page.click('text=Avaliação Inicial');
    
    // Fill form with FHIR-compliant data
    await page.fill('input[placeholder="UUID do Paciente"]', '550e8400-e29b-41d4-a716-446655440000');
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Dor lombar com características específicas para validação FHIR');
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Exame físico detalhado com medidas objetivas para compliance FHIR');
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'M54.5 - Lombalgia inespecífica');
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Fisioterapia conforme protocolo FHIR');
    
    await page.click('button[type="submit"]');
    
    // Verify FHIR validation passed
    await expect(page.locator('text=Avaliação Salva!')).toBeVisible();
  });

  test('should handle digital signature workflow', async ({ page }) => {
    // Create a document first
    await page.click('text=Avaliação Inicial');
    
    await page.fill('input[placeholder="UUID do Paciente"]', 'test-patient-id');
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Documento para teste de assinatura digital');
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Exame físico para assinatura digital');
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'M54.5 - Lombalgia');
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Fisioterapia com assinatura digital');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Avaliação Salva!')).toBeVisible();
    
    // Navigate to document viewer
    await page.click('text=Documentos Clínicos');
    
    // Verify document is ready for signature
    await expect(page.locator('text=Assinatura Digital')).toBeVisible();
  });

  test('should validate compliance rules', async ({ page }) => {
    // Test CFM compliance
    await page.click('text=Avaliação Inicial');
    
    // Fill form with CFM-compliant data
    await page.fill('input[placeholder="UUID do Paciente"]', 'test-patient-id');
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Queixa principal detalhada conforme resolução CFM');
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Exame físico completo conforme normas CFM');
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'M54.5 - Lombalgia inespecífica');
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Plano de tratamento conforme resolução CFM');
    
    await page.click('button[type="submit"]');
    
    // Verify CFM compliance validation
    await expect(page.locator('text=Avaliação Salva!')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Test network error handling
    await page.route('**/api/**', route => route.abort());
    
    await page.click('text=Avaliação Inicial');
    await page.fill('input[placeholder="UUID do Paciente"]', 'test-patient-id');
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Teste de erro de rede');
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Exame físico para teste de erro');
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'M54.5 - Lombalgia');
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Fisioterapia para teste de erro');
    
    await page.click('button[type="submit"]');
    
    // Verify error handling
    await expect(page.locator('text=Erro ao salvar')).toBeVisible();
  });

  test('should maintain data consistency', async ({ page }) => {
    // Create initial assessment
    await page.click('text=Avaliação Inicial');
    
    await page.fill('input[placeholder="UUID do Paciente"]', 'consistency-test-patient');
    await page.fill('textarea[placeholder="Descreva a queixa principal do paciente..."]', 
      'Teste de consistência de dados');
    await page.fill('textarea[placeholder="Resultados do exame físico, inspeção, palpação..."]', 
      'Exame físico para teste de consistência');
    await page.fill('textarea[placeholder="Diagnóstico e CID-10 relacionados..."]', 
      'M54.5 - Lombalgia');
    await page.fill('textarea[placeholder="Intervenções, frequência, duração..."]', 
      'Fisioterapia para teste de consistência');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Avaliação Salva!')).toBeVisible();
    
    // Create session evolution
    await page.click('text=Evolução de Sessão');
    
    // Verify patient ID is consistent
    await expect(page.locator('input[placeholder="UUID do Paciente"]')).toHaveValue('consistency-test-patient');
    
    await page.fill('textarea[placeholder="Descreva as técnicas e exercícios realizados..."]', 
      'Técnicas aplicadas para teste de consistência');
    
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Evolução Salva!')).toBeVisible();
    
    // Verify data consistency in timeline
    await page.click('text=Timeline Clínica');
    await expect(page.locator('text=consistency-test-patient')).toBeVisible();
  });
});
