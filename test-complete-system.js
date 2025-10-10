/**
 * Script de Teste Completo do Sistema DuduFisio-AI
 * Testa todos os usuários e todas as páginas, capturando erros e métricas
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Configuração
const BASE_URL = 'http://localhost:5178';
const SCREENSHOT_DIR = './test-results/screenshots';
const REPORT_FILE = './test-results/complete-test-report.json';
const SUMMARY_FILE = './test-results/RELATORIO_TESTES_COMPLETO.md';

// Criar diretórios
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

// Armazenar resultados
const allResults = [];

// Usuários de teste
const testUsers = [
  {
    name: 'Admin',
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    role: 'Admin',
    pages: [
      { name: 'Dashboard Geral', url: '/dashboard' },
      { name: 'Dashboard Administrativo', url: '/admin-dashboard' },
      { name: 'Pacientes', url: '/patients' },
      { name: 'Agenda', url: '/agenda' },
      { name: 'Acompanhamento', url: '/acompanhamento' },
      { name: 'Exercícios', url: '/exercises' },
      { name: 'Biblioteca de Exercícios', url: '/exercise-library' },
      { name: 'Protocolos Clínicos', url: '/protocols' },
      { name: 'Relatórios', url: '/reports' },
      { name: 'Analytics com IA', url: '/ai-analytics' },
      { name: 'Financeiro', url: '/financial' },
      { name: 'Gestão de Usuários', url: '/user-management' },
      { name: 'Notificações', url: '/notifications' },
      { name: 'Configurações', url: '/settings' },
    ]
  },
  {
    name: 'Therapist',
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    role: 'Fisioterapeuta',
    pages: [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Pacientes', url: '/patients' },
      { name: 'Agenda', url: '/agenda' },
      { name: 'Exercícios', url: '/exercises' },
      { name: 'Relatórios', url: '/reports' },
    ]
  },
  {
    name: 'Patient',
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    role: 'Paciente',
    pages: [
      { name: 'Dashboard Paciente', url: '/' },
    ]
  },
  {
    name: 'EducadorFisico',
    email: 'educator@dudufisio.com',
    password: 'demo123456',
    role: 'EducadorFisico',
    pages: [
      { name: 'Dashboard Educador', url: '/' },
    ]
  }
];

// Função para fazer login
async function loginUser(page, email, password) {
  console.log(`\n🔐 Fazendo login como: ${email}`);
  
  try {
    await page.goto(BASE_URL, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Aguardar formulário de login
    await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 10000 });
    
    // Preencher credenciais
    await page.type('input[type="email"], input[name="email"]', email);
    await page.type('input[type="password"], input[name="password"]', password);
    
    // Clicar no botão de login
    await page.click('button[type="submit"]');
    
    // Aguardar navegação após login
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    
    // Aguardar um pouco para garantir que o dashboard carregou
    await page.waitForTimeout(3000);
    
    console.log('✅ Login realizado com sucesso');
    return true;
  } catch (error) {
    console.error(`❌ Erro no login: ${error.message}`);
    return false;
  }
}

// Função para testar uma página
async function testPage(page, userName, pageName, pageUrl) {
  const consoleErrors = [];
  const consoleWarnings = [];
  const networkErrors = [];
  let totalRequests = 0;
  let failedRequests = 0;
  
  const result = {
    user: userName,
    page: pageName,
    url: pageUrl,
    timestamp: new Date().toISOString(),
    consoleErrors: [],
    consoleWarnings: [],
    networkErrors: [],
    performanceMetrics: {
      loadTime: 0,
      domContentLoaded: 0,
      totalRequests: 0,
      failedRequests: 0,
    },
    success: false,
  };

  try {
    console.log(`\n📄 Testando página: ${pageName} (${pageUrl})`);

    // Capturar console
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      
      if (type === 'error') {
        consoleErrors.push(text);
        if (!text.includes('DevTools')) {
          console.log(`  ❌ Console Error: ${text.substring(0, 100)}`);
        }
      } else if (type === 'warning' && !text.includes('DevTools')) {
        consoleWarnings.push(text);
      }
    });

    // Capturar erros de página
    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
      console.log(`  💥 Page Error: ${error.message}`);
    });

    // Capturar falhas de network
    page.on('requestfailed', request => {
      const failure = request.failure();
      networkErrors.push(`${request.url()} - ${failure?.errorText || 'Unknown error'}`);
      failedRequests++;
      console.log(`  🚫 Network Error: ${request.url().substring(0, 80)}`);
    });

    // Contar requests
    page.on('request', () => {
      totalRequests++;
    });

    // Navegar para a página e medir performance
    const startTime = Date.now();
    
    const fullUrl = `${BASE_URL}${pageUrl}`;
    await page.goto(fullUrl, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000 
    }).catch(err => {
      throw new Error(`Falha ao navegar: ${err.message}`);
    });

    // Aguardar um pouco para carregamento completo
    await page.waitForTimeout(4000);
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;

    // Obter métricas de performance
    const performanceMetrics = await page.evaluate(() => {
      const perfData = performance.timing;
      return {
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
      };
    }).catch(() => ({ domContentLoaded: 0 }));

    // Tirar screenshot
    const screenshotPath = path.join(
      SCREENSHOT_DIR,
      `${userName}-${pageName.replace(/[^a-z0-9]/gi, '_')}.png`
    );
    await page.screenshot({ path: screenshotPath, fullPage: false }).catch(() => {});

    result.performanceMetrics = {
      loadTime,
      domContentLoaded: performanceMetrics.domContentLoaded,
      totalRequests,
      failedRequests,
    };
    result.consoleErrors = consoleErrors;
    result.consoleWarnings = consoleWarnings;
    result.networkErrors = networkErrors;
    result.screenshot = screenshotPath;
    result.success = true;

    console.log(`  ✅ Página carregada em ${loadTime}ms`);
    console.log(`  📊 Requests: ${totalRequests} (${failedRequests} falharam)`);
    console.log(`  ⚠️  Erros console: ${consoleErrors.length}`);
    console.log(`  ⚠️  Avisos console: ${consoleWarnings.length}`);

  } catch (error) {
    result.error = error.message;
    result.success = false;
    console.log(`  ❌ ERRO: ${error.message}`);
  }

  return result;
}

// Função principal
async function runTests() {
  console.log('╔══════════════════════════════════════════════════════════════════╗');
  console.log('║     TESTE COMPLETO DO SISTEMA - DUDUFISIO-AI                    ║');
  console.log('╚══════════════════════════════════════════════════════════════════╝\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu'
    ]
  });

  try {
    for (const user of testUsers) {
      console.log('\n' + '='.repeat(80));
      console.log(`🧪 TESTANDO USUÁRIO: ${user.name}`);
      console.log('='.repeat(80));

      const page = await browser.newPage();
      
      // Configurar viewport
      await page.setViewport({ width: 1920, height: 1080 });
      
      // Configurar timeout padrão
      page.setDefaultTimeout(30000);

      try {
        // Fazer login
        const loginSuccess = await loginUser(page, user.email, user.password);
        
        if (!loginSuccess) {
          console.error(`❌ Falha no login para ${user.name}. Pulando usuário.`);
          await page.close();
          continue;
        }

        // Testar cada página
        for (const pageInfo of user.pages) {
          const result = await testPage(page, user.name, pageInfo.name, pageInfo.url);
          allResults.push(result);
          
          // Aguardar entre páginas
          await page.waitForTimeout(1500);
        }

      } catch (error) {
        console.error(`❌ Erro ao testar usuário ${user.name}: ${error.message}`);
      } finally {
        await page.close();
      }
    }

  } finally {
    await browser.close();
  }

  // Gerar relatórios
  generateReports();
}

// Gerar relatórios
function generateReports() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 GERANDO RELATÓRIOS');
  console.log('='.repeat(80));

  // Salvar JSON completo
  fs.writeFileSync(REPORT_FILE, JSON.stringify(allResults, null, 2));
  console.log(`✅ Relatório JSON salvo em: ${REPORT_FILE}`);

  // Calcular estatísticas
  const totalTests = allResults.length;
  const successfulTests = allResults.filter(r => r.success).length;
  const failedTests = totalTests - successfulTests;
  const totalErrors = allResults.reduce((sum, r) => sum + r.consoleErrors.length, 0);
  const totalWarnings = allResults.reduce((sum, r) => sum + r.consoleWarnings.length, 0);
  const totalNetworkErrors = allResults.reduce((sum, r) => sum + r.networkErrors.length, 0);
  
  const avgLoadTime = allResults.reduce((sum, r) => sum + r.performanceMetrics.loadTime, 0) / totalTests;

  // Páginas mais lentas
  const slowest = [...allResults]
    .sort((a, b) => b.performanceMetrics.loadTime - a.performanceMetrics.loadTime)
    .slice(0, 10);
  
  // Páginas com mais erros
  const mostErrors = [...allResults]
    .filter(r => r.consoleErrors.length > 0)
    .sort((a, b) => b.consoleErrors.length - a.consoleErrors.length)
    .slice(0, 10);

  // Gerar relatório Markdown
  let markdown = `# 📊 RELATÓRIO COMPLETO DE TESTES - DUDUFISIO-AI\n\n`;
  markdown += `**Data:** ${new Date().toLocaleString('pt-BR')}\n\n`;
  markdown += `---\n\n`;
  
  markdown += `## 📈 RESUMO GERAL\n\n`;
  markdown += `| Métrica | Valor |\n`;
  markdown += `|---------|-------|\n`;
  markdown += `| Total de Testes | ${totalTests} |\n`;
  markdown += `| ✅ Sucessos | ${successfulTests} |\n`;
  markdown += `| ❌ Falhas | ${failedTests} |\n`;
  markdown += `| ❌ Erros Console | ${totalErrors} |\n`;
  markdown += `| ⚠️ Avisos Console | ${totalWarnings} |\n`;
  markdown += `| 🚫 Erros Network | ${totalNetworkErrors} |\n`;
  markdown += `| ⏱️ Tempo Médio de Carregamento | ${avgLoadTime.toFixed(0)}ms |\n\n`;

  markdown += `---\n\n`;
  markdown += `## 🐌 TOP 10 - PÁGINAS MAIS LENTAS\n\n`;
  markdown += `| # | Usuário | Página | Tempo (ms) | Status |\n`;
  markdown += `|---|---------|--------|------------|--------|\n`;
  slowest.forEach((r, i) => {
    const status = r.success ? '✅' : '❌';
    markdown += `| ${i + 1} | ${r.user} | ${r.page} | ${r.performanceMetrics.loadTime} | ${status} |\n`;
  });

  markdown += `\n---\n\n`;
  markdown += `## ❌ TOP 10 - PÁGINAS COM MAIS ERROS\n\n`;
  
  if (mostErrors.length > 0) {
    markdown += `| # | Usuário | Página | Erros | Avisos |\n`;
    markdown += `|---|---------|--------|-------|--------|\n`;
    mostErrors.forEach((r, i) => {
      markdown += `| ${i + 1} | ${r.user} | ${r.page} | ${r.consoleErrors.length} | ${r.consoleWarnings.length} |\n`;
    });
  } else {
    markdown += `✅ **Nenhum erro encontrado!**\n`;
  }

  markdown += `\n---\n\n`;
  markdown += `## 📋 DETALHES POR USUÁRIO\n\n`;

  // Agrupar por usuário
  const byUser = {};
  allResults.forEach(r => {
    if (!byUser[r.user]) byUser[r.user] = [];
    byUser[r.user].push(r);
  });

  Object.keys(byUser).forEach(userName => {
    const userResults = byUser[userName];
    const userSuccess = userResults.filter(r => r.success).length;
    const userErrors = userResults.reduce((sum, r) => sum + r.consoleErrors.length, 0);
    
    markdown += `### 👤 ${userName}\n\n`;
    markdown += `- **Páginas Testadas:** ${userResults.length}\n`;
    markdown += `- **Sucessos:** ${userSuccess}/${userResults.length}\n`;
    markdown += `- **Total de Erros:** ${userErrors}\n\n`;
    
    markdown += `| Página | Status | Tempo (ms) | Erros | Avisos |\n`;
    markdown += `|--------|--------|------------|-------|--------|\n`;
    userResults.forEach(r => {
      const status = r.success ? '✅' : '❌';
      markdown += `| ${r.page} | ${status} | ${r.performanceMetrics.loadTime} | ${r.consoleErrors.length} | ${r.consoleWarnings.length} |\n`;
    });
    markdown += `\n`;
  });

  markdown += `---\n\n`;
  markdown += `## 🔍 ERROS DETALHADOS\n\n`;

  const errorPages = allResults.filter(r => r.consoleErrors.length > 0);
  if (errorPages.length > 0) {
    errorPages.forEach(r => {
      markdown += `### ${r.user} - ${r.page}\n\n`;
      markdown += `**URL:** \`${r.url}\`\n\n`;
      markdown += `**Erros Console:**\n\`\`\`\n`;
      r.consoleErrors.slice(0, 5).forEach(err => {
        markdown += `${err.substring(0, 200)}\n`;
      });
      markdown += `\`\`\`\n\n`;
      
      if (r.networkErrors.length > 0) {
        markdown += `**Erros Network:**\n\`\`\`\n`;
        r.networkErrors.slice(0, 3).forEach(err => {
          markdown += `${err}\n`;
        });
        markdown += `\`\`\`\n\n`;
      }
    });
  }

  markdown += `---\n\n`;
  markdown += `## 💡 RECOMENDAÇÕES DE MELHORIAS\n\n`;
  
  markdown += `### Performance\n\n`;
  if (avgLoadTime > 3000) {
    markdown += `⚠️ **Tempo médio de carregamento elevado (${avgLoadTime.toFixed(0)}ms)**\n`;
    markdown += `- Considerar implementar code splitting mais agressivo\n`;
    markdown += `- Otimizar imagens e assets\n`;
    markdown += `- Implementar lazy loading de componentes pesados\n\n`;
  }
  
  if (slowest.length > 0 && slowest[0].performanceMetrics.loadTime > 5000) {
    markdown += `⚠️ **Páginas muito lentas detectadas (>${slowest[0].performanceMetrics.loadTime}ms)**\n`;
    markdown += `- Revisar páginas: ${slowest.slice(0, 3).map(r => r.page).join(', ')}\n`;
    markdown += `- Analisar bundle size dessas páginas\n`;
    markdown += `- Considerar pré-carregamento de dados críticos\n\n`;
  }

  markdown += `### Erros\n\n`;
  if (totalErrors > 0) {
    markdown += `⚠️ **${totalErrors} erros de console detectados**\n`;
    markdown += `- Revisar e corrigir erros JavaScript\n`;
    markdown += `- Implementar error boundaries mais granulares\n`;
    markdown += `- Adicionar tratamento de erros em requests\n\n`;
  }
  
  if (totalNetworkErrors > 0) {
    markdown += `⚠️ **${totalNetworkErrors} erros de network detectados**\n`;
    markdown += `- Verificar endpoints de API\n`;
    markdown += `- Implementar retry logic para requests falhados\n`;
    markdown += `- Adicionar fallbacks para dados não disponíveis\n\n`;
  }

  markdown += `---\n\n`;
  markdown += `*Relatório gerado automaticamente em ${new Date().toLocaleString('pt-BR')}*\n`;

  // Salvar relatório Markdown
  fs.writeFileSync(SUMMARY_FILE, markdown);
  console.log(`✅ Relatório Markdown salvo em: ${SUMMARY_FILE}`);

  // Imprimir resumo no console
  console.log('\n' + '='.repeat(80));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(80));
  console.log(`\nTotal de testes: ${totalTests}`);
  console.log(`✅ Sucessos: ${successfulTests}`);
  console.log(`❌ Falhas: ${failedTests}`);
  console.log(`\n❌ Total de erros console: ${totalErrors}`);
  console.log(`⚠️  Total de avisos console: ${totalWarnings}`);
  console.log(`🚫 Total de erros network: ${totalNetworkErrors}`);
  console.log(`\n⏱️  Tempo médio de carregamento: ${avgLoadTime.toFixed(0)}ms`);
  console.log('\n' + '='.repeat(80));
}

// Executar testes
runTests().catch(error => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});

