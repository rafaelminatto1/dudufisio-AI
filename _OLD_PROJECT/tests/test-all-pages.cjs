/**
 * Script Playwright para testar TODAS as páginas do DuduFisio-AI
 * Captura erros do console, screenshots e gera relatório HTML
 *
 * Uso: node tests/test-all-pages.js
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = 'http://localhost:5175';
const LOGIN_EMAIL = 'admin@dudufisio.com';
const LOGIN_PASSWORD = 'demo123456';
const OUTPUT_DIR = path.join(__dirname, '../test-results');
const SCREENSHOTS_DIR = path.join(OUTPUT_DIR, 'screenshots');

// Lista completa de páginas para testar
const PAGES_TO_TEST = [
  // Páginas Prioritárias
  { route: '/', name: 'LoginPage', requiresAuth: false, priority: 'HIGH' },
  { route: '/dashboard', name: 'DashboardPage', requiresAuth: true, priority: 'HIGH' },
  { route: '/agenda', name: 'AgendaPage', requiresAuth: true, priority: 'HIGH' },
  { route: '/exercises', name: 'ExerciseLibraryPage', requiresAuth: true, priority: 'HIGH' },
  { route: '/exercise-library', name: 'ExerciseLibraryPage', requiresAuth: true, priority: 'HIGH' },
  { route: '/teleconsulta', name: 'TeleconsultaPage', requiresAuth: true, priority: 'HIGH' },

  // Gestão de Pacientes
  { route: '/patients', name: 'PatientListPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/patient/1', name: 'PatientDetailPage', requiresAuth: true, priority: 'MEDIUM' },

  // Sessões e Evolução
  { route: '/session', name: 'SessionPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/session-form', name: 'SessionFormPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/session-view', name: 'SessionViewPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/session-evolution', name: 'SessionEvolutionPage', requiresAuth: true, priority: 'HIGH' },
  { route: '/atendimento', name: 'AtendimentoPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/acompanhamento', name: 'AcompanhamentoPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/treatment', name: 'TreatmentPage', requiresAuth: true, priority: 'MEDIUM' },

  // Financeiro
  { route: '/financials', name: 'FinancialDashboardPage', requiresAuth: true, priority: 'HIGH' },

  // Admin e Gestão
  { route: '/admin-dashboard', name: 'AdminDashboardPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/therapist-dashboard', name: 'TherapistDashboard', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/simple-dashboard', name: 'SimpleDashboard', requiresAuth: true, priority: 'LOW' },
  { route: '/partner-dashboard', name: 'PartnerDashboard', requiresAuth: true, priority: 'MEDIUM' },

  // Relatórios e Analytics
  { route: '/reports', name: 'ReportsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/advanced-reports', name: 'AdvancedReportsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/ai-analytics', name: 'AiAnalyticsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/clinical-analytics', name: 'ClinicalAnalyticsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/risk-analysis', name: 'RiskAnalysisPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/admin/performance', name: 'PerformanceDashboard', requiresAuth: true, priority: 'LOW' },

  // Avaliações
  { route: '/specialty-assessments', name: 'SpecialtyAssessmentsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/medical-report', name: 'MedicalReportPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/evaluation-report', name: 'EvaluationReportPage', requiresAuth: true, priority: 'MEDIUM' },

  // Inventário e Recursos
  { route: '/inventory', name: 'InventoryPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/inventory-dashboard', name: 'InventoryDashboardPage', requiresAuth: true, priority: 'LOW' },
  { route: '/clinical-library', name: 'ClinicalLibraryPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/material/:id', name: 'MaterialDetailPage', requiresAuth: true, priority: 'LOW' },

  // Protocolos e Conhecimento
  { route: '/protocols', name: 'ProtocolsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/knowledge-base', name: 'KnowledgeBasePage', requiresAuth: true, priority: 'MEDIUM' },

  // Gestão de Usuários
  { route: '/users', name: 'UserManagementPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/groups', name: 'GroupsPage', requiresAuth: true, priority: 'MEDIUM' },

  // Eventos
  { route: '/events', name: 'EventsListPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/event/:id', name: 'EventDetailPage', requiresAuth: true, priority: 'LOW' },

  // Comunicação
  { route: '/notifications', name: 'NotificationCenterPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/whatsapp', name: 'WhatsAppPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/inactive-patient-email', name: 'InactivePatientEmailPage', requiresAuth: true, priority: 'LOW' },

  // Mentoria
  { route: '/mentoria', name: 'MentoriaPage', requiresAuth: true, priority: 'MEDIUM' },

  // Integrações e Testes
  { route: '/integrations', name: 'IntegrationsTestPage', requiresAuth: true, priority: 'LOW' },
  { route: '/bi-integration', name: 'BIIntegrationTestPage', requiresAuth: true, priority: 'LOW' },

  // Configurações
  { route: '/settings', name: 'SettingsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/agenda-settings', name: 'AgendaSettingsPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/subscription', name: 'SubscriptionPage', requiresAuth: true, priority: 'LOW' },
  { route: '/legal', name: 'LegalPage', requiresAuth: true, priority: 'LOW' },
  { route: '/partnership', name: 'PartnershipPage', requiresAuth: true, priority: 'LOW' },

  // Ferramentas
  { route: '/kanban', name: 'KanbanPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/hep-generator', name: 'HepGeneratorPage', requiresAuth: true, priority: 'LOW' },

  // Admin
  { route: '/audit-log', name: 'AuditLogPage', requiresAuth: true, priority: 'MEDIUM' },
  { route: '/backup', name: 'BackupManagementPage', requiresAuth: true, priority: 'MEDIUM' },
];

// Criar diretórios de output
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Função para fazer login
async function doLogin(page) {
  console.log('🔐 Fazendo login...');

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Clicar no botão de contas demo
  await page.click('button:has-text("Ver contas de demonstração")');
  await page.waitForTimeout(500);

  // Clicar na conta admin
  await page.click('button:has-text("Administrador")');
  await page.waitForTimeout(500);

  // Clicar em Entrar
  await page.click('button:has-text("Entrar")');

  // Aguardar redirecionamento
  await page.waitForURL('**/dashboard', { timeout: 10000 });

  console.log('✅ Login realizado com sucesso!');
}

// Função para testar uma página
async function testPage(page, pageInfo) {
  const result = {
    route: pageInfo.route,
    name: pageInfo.name,
    priority: pageInfo.priority,
    status: 'unknown',
    errors: [],
    warnings: [],
    consoleMessages: [],
    screenshot: null,
    timestamp: new Date().toISOString()
  };

  try {
    console.log(`\n📄 Testando: ${pageInfo.name} (${pageInfo.route})`);

    // Capturar mensagens do console
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();

      result.consoleMessages.push({ type, text });

      if (type === 'error') {
        result.errors.push(text);
      } else if (type === 'warning') {
        result.warnings.push(text);
      }
    });

    // Capturar erros de página
    page.on('pageerror', error => {
      result.errors.push(error.message);
    });

    // Navegar para a página
    const response = await page.goto(BASE_URL + pageInfo.route, {
      waitUntil: 'networkidle',
      timeout: 30000
    });

    // Verificar status HTTP
    if (response && response.status() >= 400) {
      result.status = 'error';
      result.errors.push(`HTTP ${response.status()}`);
    } else {
      result.status = 'success';
    }

    // Aguardar um pouco para React renderizar
    await page.waitForTimeout(2000);

    // Capturar screenshot
    const screenshotPath = path.join(SCREENSHOTS_DIR, `${pageInfo.name}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    result.screenshot = screenshotPath;

    console.log(`  ✅ Status: ${result.status}`);
    console.log(`  📊 Erros: ${result.errors.length}`);
    console.log(`  ⚠️  Avisos: ${result.warnings.length}`);

  } catch (error) {
    result.status = 'error';
    result.errors.push(error.message);
    console.log(`  ❌ ERRO: ${error.message}`);
  }

  return result;
}

// Função principal
async function runTests() {
  console.log('🚀 Iniciando testes de todas as páginas...\n');
  console.log(`📊 Total de páginas: ${PAGES_TO_TEST.length}\n`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  // Fazer login uma vez
  await doLogin(page);

  const results = [];

  // Testar cada página
  for (const pageInfo of PAGES_TO_TEST) {
    if (!pageInfo.requiresAuth || pageInfo.route === '/') {
      // Pular páginas que não precisam de auth (já testamos login)
      if (pageInfo.route === '/') continue;
    }

    const result = await testPage(page, pageInfo);
    results.push(result);

    // Pequena pausa entre testes
    await page.waitForTimeout(500);
  }

  await browser.close();

  // Gerar relatório
  generateReport(results);

  console.log('\n✅ Testes concluídos!');
  console.log(`📊 Relatório salvo em: ${OUTPUT_DIR}/report.html`);
  console.log(`📸 Screenshots salvos em: ${SCREENSHOTS_DIR}/`);
}

// Função para gerar relatório HTML
function generateReport(results) {
  const totalPages = results.length;
  const successPages = results.filter(r => r.status === 'success').length;
  const errorPages = results.filter(r => r.status === 'error').length;
  const pagesWithErrors = results.filter(r => r.errors.length > 0).length;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Relatório de Testes - DuduFisio-AI</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .container { max-width: 1400px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; }
    h1 { color: #0ea5e9; }
    .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin: 30px 0; }
    .stat-card { background: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #0ea5e9; }
    .stat-card h3 { margin: 0 0 10px 0; color: #64748b; font-size: 14px; }
    .stat-card .number { font-size: 32px; font-weight: bold; color: #0f172a; }
    .page-result { border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .page-result.success { border-left: 4px solid #22c55e; }
    .page-result.error { border-left: 4px solid #ef4444; }
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
    .page-name { font-size: 18px; font-weight: bold; }
    .priority { padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .priority.HIGH { background: #fee2e2; color: #991b1b; }
    .priority.MEDIUM { background: #fef3c7; color: #92400e; }
    .priority.LOW { background: #e0e7ff; color: #3730a3; }
    .errors { background: #fef2f2; border: 1px solid #fee2e2; padding: 15px; border-radius: 6px; margin: 10px 0; }
    .warnings { background: #fffbeb; border: 1px solid #fef3c7; padding: 15px; border-radius: 6px; margin: 10px 0; }
    .error-item, .warning-item { margin: 5px 0; padding: 8px; background: white; border-radius: 4px; }
    .screenshot { max-width: 100%; border-radius: 8px; margin-top: 15px; cursor: pointer; }
    .console-messages { font-family: monospace; font-size: 12px; max-height: 200px; overflow-y: auto; background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; }
    .filter-buttons { margin: 20px 0; }
    .filter-btn { padding: 10px 20px; margin-right: 10px; border: none; border-radius: 6px; cursor: pointer; font-weight: bold; }
    .filter-btn.active { background: #0ea5e9; color: white; }
    .filter-btn:not(.active) { background: #f1f5f9; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📊 Relatório de Testes - DuduFisio-AI</h1>
    <p>Gerado em: ${new Date().toLocaleString('pt-BR')}</p>

    <div class="summary">
      <div class="stat-card">
        <h3>Total de Páginas</h3>
        <div class="number">${totalPages}</div>
      </div>
      <div class="stat-card">
        <h3>Páginas OK</h3>
        <div class="number" style="color: #22c55e">${successPages}</div>
      </div>
      <div class="stat-card">
        <h3>Páginas com Erro</h3>
        <div class="number" style="color: #ef4444">${errorPages}</div>
      </div>
      <div class="stat-card">
        <h3>Com Erros Console</h3>
        <div class="number" style="color: #f59e0b">${pagesWithErrors}</div>
      </div>
    </div>

    <div class="filter-buttons">
      <button class="filter-btn active" onclick="filterResults('all')">Todas</button>
      <button class="filter-btn" onclick="filterResults('errors')">Com Erros</button>
      <button class="filter-btn" onclick="filterResults('success')">Sucesso</button>
      <button class="filter-btn" onclick="filterResults('HIGH')">Prioridade Alta</button>
    </div>

    <div id="results">
      ${results.map(result => `
        <div class="page-result ${result.status}" data-priority="${result.priority}" data-has-errors="${result.errors.length > 0}">
          <div class="page-header">
            <div>
              <div class="page-name">${result.name}</div>
              <div style="color: #64748b; font-size: 14px;">${result.route}</div>
            </div>
            <span class="priority ${result.priority}">${result.priority}</span>
          </div>

          ${result.errors.length > 0 ? `
            <div class="errors">
              <strong>❌ Erros (${result.errors.length}):</strong>
              ${result.errors.map(err => `<div class="error-item">${err}</div>`).join('')}
            </div>
          ` : '<div style="color: #22c55e; font-weight: bold;">✅ Nenhum erro encontrado</div>'}

          ${result.warnings.length > 0 ? `
            <div class="warnings">
              <strong>⚠️ Avisos (${result.warnings.length}):</strong>
              ${result.warnings.slice(0, 5).map(warn => `<div class="warning-item">${warn}</div>`).join('')}
              ${result.warnings.length > 5 ? `<div style="margin-top: 10px; color: #92400e;">... e mais ${result.warnings.length - 5} avisos</div>` : ''}
            </div>
          ` : ''}

          ${result.screenshot ? `
            <img src="${path.basename(result.screenshot)}" class="screenshot" alt="Screenshot de ${result.name}" onclick="window.open(this.src)">
          ` : ''}
        </div>
      `).join('')}
    </div>
  </div>

  <script>
    function filterResults(filter) {
      const results = document.querySelectorAll('.page-result');
      const buttons = document.querySelectorAll('.filter-btn');

      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');

      results.forEach(result => {
        if (filter === 'all') {
          result.style.display = 'block';
        } else if (filter === 'errors') {
          result.style.display = result.dataset.hasErrors === 'true' ? 'block' : 'none';
        } else if (filter === 'success') {
          result.style.display = result.dataset.hasErrors === 'false' ? 'block' : 'none';
        } else if (filter === 'HIGH' || filter === 'MEDIUM' || filter === 'LOW') {
          result.style.display = result.dataset.priority === filter ? 'block' : 'none';
        }
      });
    }
  </script>
</body>
</html>
  `;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'report.html'), html);

  // Também salvar JSON
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'results.json'),
    JSON.stringify(results, null, 2)
  );
}

// Executar
runTests().catch(console.error);
