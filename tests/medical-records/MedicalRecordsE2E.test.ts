// tests/medical-records/MedicalRecordsE2E.test.ts
import { test, expect } from '@playwright/test';

test.describe('Sistema de Prontuário Eletrônico Médico - E2E', () => {
  test.beforeEach(async ({ page }) => {
    // Navegar para a página principal do sistema
    await page.goto('/medical-records');
    
    // Aguardar o carregamento da página
    await page.waitForLoadState('networkidle');
  });

  test('Deve exibir o dashboard principal do sistema de prontuários', async ({ page }) => {
    // Verificar se o título principal está visível
    await expect(page.locator('h1')).toContainText('Sistema de Prontuário Eletrônico');
    
    // Verificar se os componentes principais estão presentes
    await expect(page.locator('[data-testid="medical-records-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="clinical-templates-manager"]')).toBeVisible();
    await expect(page.locator('[data-testid="digital-signature-manager"]')).toBeVisible();
  });

  test('Deve permitir criar uma nova avaliação inicial', async ({ page }) => {
    // Clicar no botão para nova avaliação
    await page.click('[data-testid="new-assessment-button"]');
    
    // Preencher formulário de avaliação
    await page.fill('[data-testid="patient-id-input"]', 'patient-123');
    await page.fill('[data-testid="chief-complaint-textarea"]', 'Dor lombar há 2 semanas');
    await page.fill('[data-testid="medical-history-textarea"]', 'Hipertensão controlada, diabetes tipo 2');
    await page.fill('[data-testid="physical-exam-textarea"]', 'Limitação da flexão lombar, espasmo muscular');
    await page.fill('[data-testid="diagnosis-textarea"]', 'Lombalgia aguda - CID M54.5');
    await page.fill('[data-testid="treatment-plan-textarea"]', 'Fisioterapia 3x/semana, alongamentos, fortalecimento');
    
    // Submeter formulário
    await page.click('[data-testid="save-assessment-button"]');
    
    // Verificar se a avaliação foi salva
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Avaliação Salva!');
    
    // Verificar se aparece na lista de documentos
    await expect(page.locator('[data-testid="document-list"]')).toContainText('Avaliação Inicial');
  });

  test('Deve permitir criar uma evolução de sessão', async ({ page }) => {
    // Navegar para evolução de sessão
    await page.click('[data-testid="new-evolution-button"]');
    
    // Preencher formulário de evolução
    await page.fill('[data-testid="patient-id-input"]', 'patient-123');
    await page.fill('[data-testid="appointment-id-input"]', 'appointment-456');
    await page.fill('[data-testid="subjective-assessment-textarea"]', 'Paciente relata melhora da dor');
    await page.fill('[data-testid="objective-findings-textarea"]', 'Aumento da amplitude de movimento');
    await page.fill('[data-testid="techniques-applied-textarea"]', 'Mobilização articular, alongamento');
    await page.fill('[data-testid="patient-response-textarea"]', 'Boa resposta ao tratamento');
    await page.fill('[data-testid="next-session-plan-textarea"]', 'Continuar com exercícios de fortalecimento');
    
    // Ajustar níveis de dor
    await page.locator('[data-testid="pain-level-before-slider"]').fill('7');
    await page.locator('[data-testid="pain-level-after-slider"]').fill('4');
    
    // Submeter formulário
    await page.click('[data-testid="save-evolution-button"]');
    
    // Verificar se a evolução foi salva
    await expect(page.locator('[data-testid="success-message"]')).toContainText('Evolução Salva!');
  });

  test('Deve exibir a linha do tempo clínica', async ({ page }) => {
    // Navegar para a linha do tempo
    await page.click('[data-testid="clinical-timeline-tab"]');
    
    // Verificar se a linha do tempo está visível
    await expect(page.locator('[data-testid="clinical-timeline"]')).toBeVisible();
    
    // Verificar se há eventos na linha do tempo
    const timelineEvents = page.locator('[data-testid="timeline-event"]');
    await expect(timelineEvents).toHaveCount.greaterThan(0);
  });

  test('Deve permitir visualizar documentos clínicos', async ({ page }) => {
    // Clicar em um documento na lista
    await page.click('[data-testid="document-item"]:first-child');
    
    // Verificar se o visualizador de documento está aberto
    await expect(page.locator('[data-testid="document-viewer"]')).toBeVisible();
    
    // Verificar se o conteúdo do documento está sendo exibido
    await expect(page.locator('[data-testid="document-content"]')).toBeVisible();
  });

  test('Deve permitir gerenciar templates clínicos', async ({ page }) => {
    // Navegar para gerenciamento de templates
    await page.click('[data-testid="templates-manager-tab"]');
    
    // Verificar se a interface de templates está visível
    await expect(page.locator('[data-testid="templates-manager"]')).toBeVisible();
    
    // Criar novo template
    await page.click('[data-testid="new-template-button"]');
    
    // Preencher dados do template
    await page.fill('[data-testid="template-name-input"]', 'Avaliação Ortopédica');
    await page.selectOption('[data-testid="template-type-select"]', 'initial_assessment');
    await page.selectOption('[data-testid="template-specialty-select"]', 'orthopedic_physiotherapy');
    
    // Salvar template
    await page.click('[data-testid="save-template-button"]');
    
    // Verificar se o template foi criado
    await expect(page.locator('[data-testid="template-list"]')).toContainText('Avaliação Ortopédica');
  });

  test('Deve permitir gerenciar assinaturas digitais', async ({ page }) => {
    // Navegar para gerenciamento de assinaturas
    await page.click('[data-testid="signature-manager-tab"]');
    
    // Verificar se a interface de assinaturas está visível
    await expect(page.locator('[data-testid="signature-manager"]')).toBeVisible();
    
    // Selecionar um documento para assinar
    await page.click('[data-testid="document-to-sign"]:first-child');
    
    // Clicar em assinar digitalmente
    await page.click('[data-testid="sign-document-button"]');
    
    // Verificar se o modal de assinatura aparece
    await expect(page.locator('[data-testid="signature-modal"]')).toBeVisible();
  });

  test('Deve permitir gerar relatórios clínicos', async ({ page }) => {
    // Navegar para gerador de relatórios
    await page.click('[data-testid="reports-generator-tab"]');
    
    // Verificar se a interface de relatórios está visível
    await expect(page.locator('[data-testid="reports-generator"]')).toBeVisible();
    
    // Selecionar tipo de relatório
    await page.selectOption('[data-testid="report-type-select"]', 'progress_report');
    
    // Selecionar paciente
    await page.selectOption('[data-testid="patient-select"]', 'patient-123');
    
    // Definir período
    await page.fill('[data-testid="start-date-input"]', '2024-01-01');
    await page.fill('[data-testid="end-date-input"]', '2024-12-31');
    
    // Gerar relatório
    await page.click('[data-testid="generate-report-button"]');
    
    // Verificar se o relatório foi gerado
    await expect(page.locator('[data-testid="generated-report"]')).toBeVisible();
  });

  test('Deve validar compliance com CFM/COFFITO', async ({ page }) => {
    // Criar um documento clínico
    await page.click('[data-testid="new-assessment-button"]');
    await page.fill('[data-testid="patient-id-input"]', 'patient-123');
    await page.fill('[data-testid="chief-complaint-textarea"]', 'Dor lombar');
    await page.fill('[data-testid="physical-exam-textarea"]', 'Exame físico normal');
    await page.fill('[data-testid="diagnosis-textarea"]', 'Lombalgia');
    await page.fill('[data-testid="treatment-plan-textarea"]', 'Fisioterapia');
    await page.click('[data-testid="save-assessment-button"]');
    
    // Verificar validação de compliance
    await expect(page.locator('[data-testid="compliance-status"]')).toContainText('Conforme');
    
    // Verificar se não há violações
    await expect(page.locator('[data-testid="compliance-violations"]')).toHaveCount(0);
  });

  test('Deve implementar versionamento de documentos', async ({ page }) => {
    // Criar um documento
    await page.click('[data-testid="new-assessment-button"]');
    await page.fill('[data-testid="patient-id-input"]', 'patient-123');
    await page.fill('[data-testid="chief-complaint-textarea"]', 'Dor lombar');
    await page.fill('[data-testid="physical-exam-textarea"]', 'Exame físico normal');
    await page.fill('[data-testid="diagnosis-textarea"]', 'Lombalgia');
    await page.fill('[data-testid="treatment-plan-textarea"]', 'Fisioterapia');
    await page.click('[data-testid="save-assessment-button"]');
    
    // Editar o documento
    await page.click('[data-testid="edit-document-button"]');
    await page.fill('[data-testid="diagnosis-textarea"]', 'Lombalgia aguda - CID M54.5');
    await page.click('[data-testid="save-changes-button"]');
    
    // Verificar se a versão foi incrementada
    await expect(page.locator('[data-testid="document-version"]')).toContainText('v2');
    
    // Verificar histórico de versões
    await page.click('[data-testid="version-history-button"]');
    await expect(page.locator('[data-testid="version-history"]')).toBeVisible();
    await expect(page.locator('[data-testid="version-item"]')).toHaveCount(2);
  });

  test('Deve implementar auditoria completa', async ({ page }) => {
    // Realizar várias ações que devem ser auditadas
    await page.click('[data-testid="new-assessment-button"]');
    await page.fill('[data-testid="patient-id-input"]', 'patient-123');
    await page.fill('[data-testid="chief-complaint-textarea"]', 'Dor lombar');
    await page.fill('[data-testid="physical-exam-textarea"]', 'Exame físico normal');
    await page.fill('[data-testid="diagnosis-textarea"]', 'Lombalgia');
    await page.fill('[data-testid="treatment-plan-textarea"]', 'Fisioterapia');
    await page.click('[data-testid="save-assessment-button"]');
    
    // Navegar para auditoria
    await page.click('[data-testid="audit-trail-tab"]');
    
    // Verificar se as ações foram registradas
    await expect(page.locator('[data-testid="audit-log"]')).toBeVisible();
    await expect(page.locator('[data-testid="audit-entry"]')).toHaveCount.greaterThan(0);
    
    // Verificar se há registro de criação do documento
    await expect(page.locator('[data-testid="audit-entry"]')).toContainText('Document created');
  });

  test('Deve implementar segurança e controle de acesso', async ({ page }) => {
    // Tentar acessar funcionalidade sem permissão
    await page.goto('/medical-records/admin');
    
    // Verificar se há redirecionamento ou mensagem de erro
    await expect(page.locator('[data-testid="access-denied"]')).toBeVisible();
    
    // Verificar se botões sensíveis estão desabilitados
    await expect(page.locator('[data-testid="delete-document-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="export-data-button"]')).toBeDisabled();
  });

  test('Deve implementar integração FHIR', async ({ page }) => {
    // Navegar para exportação FHIR
    await page.click('[data-testid="fhir-export-tab"]');
    
    // Verificar se a interface FHIR está visível
    await expect(page.locator('[data-testid="fhir-export"]')).toBeVisible();
    
    // Selecionar recursos para exportar
    await page.check('[data-testid="export-patient"]');
    await page.check('[data-testid="export-encounter"]');
    await page.check('[data-testid="export-observation"]');
    
    // Exportar para FHIR
    await page.click('[data-testid="export-fhir-button"]');
    
    // Verificar se o bundle FHIR foi gerado
    await expect(page.locator('[data-testid="fhir-bundle"]')).toBeVisible();
    
    // Verificar se contém os recursos selecionados
    await expect(page.locator('[data-testid="fhir-resource"]')).toHaveCount.greaterThan(0);
  });

  test('Deve implementar performance e otimização', async ({ page }) => {
    // Medir tempo de carregamento da página
    const startTime = Date.now();
    await page.goto('/medical-records');
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    
    // Verificar se o carregamento foi rápido (menos de 3 segundos)
    expect(loadTime).toBeLessThan(3000);
    
    // Verificar se há lazy loading implementado
    await page.scrollTo('[data-testid="document-list"]');
    await expect(page.locator('[data-testid="lazy-loaded-content"]')).toBeVisible();
    
    // Verificar se há cache implementado
    await page.reload();
    const cachedLoadTime = Date.now() - startTime;
    expect(cachedLoadTime).toBeLessThan(loadTime);
  });
});
