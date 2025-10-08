import { test, expect, Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Perfis de teste
const testProfiles = [
  {
    name: 'Admin',
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    routes: [
      '/dashboard',
      '/admin-dashboard',
      '/patients',
      '/agenda',
      '/acompanhamento',
      '/session-evolution',
      '/teleconsulta',
      '/exercises',
      '/exercise-library',
      '/protocolos',
      '/specialty-assessments',
      '/clinical-library',
      '/mentoria',
      '/knowledge-base',
      '/users',
      '/user-management',
      '/groups',
      '/inventory',
      '/inventory-dashboard',
      '/events',
      '/events-list',
      '/partnerships',
      '/partnership-page',
      '/subscriptions',
      '/settings',
      '/financials',
      '/financial-dashboard',
      '/reports',
      '/ai-tools/consolidated',
      '/gerar-laudo',
      '/gerar-evolucao',
      '/gerar-hep',
      '/analise-risco',
      '/ia-economica',
      '/clinical-analytics',
      '/reports/consolidated',
      '/whatsapp',
      '/email-inativos',
      '/backup-management',
      '/agenda-settings',
      '/integrations',
      '/integrations-test',
      '/bi-integration-test',
      '/audit-log',
      '/legal',
      '/notifications',
      '/tasks'
    ]
  },
  {
    name: 'Fisioterapeuta',
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    routes: [
      '/dashboard',
      '/therapist-dashboard',
      '/patients',
      '/agenda',
      '/acompanhamento',
      '/session-evolution',
      '/teleconsulta',
      '/exercises',
      '/exercise-library',
      '/protocolos',
      '/specialty-assessments',
      '/clinical-library',
      '/mentoria',
      '/knowledge-base',
      '/gerar-laudo',
      '/gerar-evolucao',
      '/gerar-hep',
      '/analise-risco',
      '/clinical-analytics',
      '/notifications',
      '/tasks',
      '/settings'
    ]
  },
  {
    name: 'Paciente',
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    routes: [
      '/patient-portal',
      '/patient-portal/dashboard',
      '/patient-portal/appointments',
      '/patient-portal/exercises',
      '/patient-portal/documents',
      '/patient-portal/progress',
      '/patient-portal/vouchers',
      '/patient-portal/voucher-store',
      '/patient-portal/gamification',
      '/my-appointments',
      '/my-exercises',
      '/patient-progress',
      '/pain-diary',
      '/documents',
      '/gamification',
      '/voucher-store',
      '/notifications'
    ]
  },
  {
    name: 'Educador Físico',
    email: 'educator@dudufisio.com',
    password: 'demo123456',
    routes: [
      '/partner-portal',
      '/partner-dashboard',
      '/educator-dashboard',
      '/client-list',
      '/partner-exercises',
      '/notifications',
      '/tasks',
      '/settings'
    ]
  }
];

interface TestResult {
  profile: string;
  route: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  errors: string[];
  warnings: string[];
  screenshot?: string;
  timestamp: string;
}

let testResults: TestResult[] = [];
let consoleErrors: any[] = [];
let consoleWarnings: any[] = [];

// Função auxiliar para fazer login
async function doLogin(page: Page, email: string, password: string) {
  console.log(`\n🔐 Fazendo login como ${email}...`);
  
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  
  // Aguardar formulário de login
  await page.waitForSelector('input[name="email"], input[type="email"]', { timeout: 10000 });
  
  // Preencher credenciais
  await page.fill('input[name="email"], input[type="email"]', email);
  await page.fill('input[name="password"], input[type="password"]', password);
  
  // Clicar no botão de login
  await page.click('button[type="submit"]');
  
  // Aguardar navegação ou dashboard
  try {
    await page.waitForURL('**/dashboard**', { timeout: 15000 });
  } catch {
    // Se não redirecionar para dashboard, aguardar um elemento típico da página autenticada
    await page.waitForSelector('nav, aside, [role="navigation"]', { timeout: 15000 });
  }
  
  console.log('✅ Login realizado com sucesso');
}

// Função para testar uma página
async function testPage(page: Page, route: string, profileName: string): Promise<TestResult> {
  const errors: string[] = [];
  const warnings: string[] = [];
  const timestamp = new Date().toISOString();
  
  console.log(`\n📄 Testando: ${route}`);
  
  // Capturar erros de console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const errorText = msg.text();
      errors.push(errorText);
      consoleErrors.push({ profile: profileName, route, error: errorText, timestamp });
      console.log(`❌ Console Error: ${errorText}`);
    } else if (msg.type() === 'warning') {
      const warningText = msg.text();
      warnings.push(warningText);
      consoleWarnings.push({ profile: profileName, route, warning: warningText, timestamp });
      console.log(`⚠️  Console Warning: ${warningText}`);
    }
  });
  
  // Capturar erros de página
  page.on('pageerror', error => {
    errors.push(`Page Error: ${error.message}`);
    console.log(`❌ Page Error: ${error.message}`);
  });
  
  try {
    // Navegar para a rota
    const response = await page.goto(`http://localhost:5173${route}`, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Verificar status HTTP
    const status = response?.status();
    if (status && status >= 400) {
      errors.push(`HTTP ${status} error`);
    }
    
    // Aguardar um pouco para garantir que a página carregou
    await page.waitForTimeout(2000);
    
    // Tirar screenshot
    const screenshotPath = path.join('test-results', 'screenshots', `${profileName}-${route.replace(/\//g, '-')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    
    // Verificar se há mensagens de erro visíveis na página
    const errorMessages = await page.locator('text=/erro|error|falha|failed/i').allTextContents();
    if (errorMessages.length > 0) {
      warnings.push(`Possíveis mensagens de erro visíveis: ${errorMessages.join(', ')}`);
    }
    
    // Determinar status
    let testStatus: 'success' | 'error' | 'warning' = 'success';
    let message = 'Página carregou com sucesso';
    
    if (errors.length > 0) {
      testStatus = 'error';
      message = `Página carregou com ${errors.length} erro(s)`;
    } else if (warnings.length > 0) {
      testStatus = 'warning';
      message = `Página carregou com ${warnings.length} aviso(s)`;
    }
    
    console.log(`✅ ${message}`);
    
    return {
      profile: profileName,
      route,
      status: testStatus,
      message,
      errors,
      warnings,
      screenshot: screenshotPath,
      timestamp
    };
    
  } catch (error: any) {
    console.log(`❌ Falha ao carregar: ${error.message}`);
    
    return {
      profile: profileName,
      route,
      status: 'error',
      message: `Falha ao carregar: ${error.message}`,
      errors: [...errors, error.message],
      warnings,
      timestamp
    };
  }
}

// Criar diretório de resultados
test.beforeAll(async () => {
  const resultsDir = path.join('test-results', 'screenshots');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
});

// Testar cada perfil
for (const profile of testProfiles) {
  test.describe(`Perfil: ${profile.name}`, () => {
    
    test(`Testar todas as páginas do perfil ${profile.name}`, async ({ page }) => {
      // Fazer login
      await doLogin(page, profile.email, profile.password);
      
      // Aguardar um pouco após o login
      await page.waitForTimeout(2000);
      
      // Testar cada rota
      for (const route of profile.routes) {
        const result = await testPage(page, route, profile.name);
        testResults.push(result);
      }
    });
    
  });
}

// Gerar relatório após todos os testes
test.afterAll(async () => {
  console.log('\n\n═══════════════════════════════════════════════════════════');
  console.log('📊 RELATÓRIO COMPLETO DE TESTES');
  console.log('═══════════════════════════════════════════════════════════\n');
  
  // Estatísticas gerais
  const totalTests = testResults.length;
  const successCount = testResults.filter(r => r.status === 'success').length;
  const errorCount = testResults.filter(r => r.status === 'error').length;
  const warningCount = testResults.filter(r => r.status === 'warning').length;
  
  console.log('📈 ESTATÍSTICAS GERAIS:');
  console.log(`   Total de testes: ${totalTests}`);
  console.log(`   ✅ Sucessos: ${successCount} (${((successCount/totalTests)*100).toFixed(1)}%)`);
  console.log(`   ❌ Erros: ${errorCount} (${((errorCount/totalTests)*100).toFixed(1)}%)`);
  console.log(`   ⚠️  Avisos: ${warningCount} (${((warningCount/totalTests)*100).toFixed(1)}%)`);
  
  // Estatísticas por perfil
  console.log('\n📊 ESTATÍSTICAS POR PERFIL:');
  for (const profile of testProfiles) {
    const profileResults = testResults.filter(r => r.profile === profile.name);
    const profileSuccess = profileResults.filter(r => r.status === 'success').length;
    const profileErrors = profileResults.filter(r => r.status === 'error').length;
    const profileWarnings = profileResults.filter(r => r.status === 'warning').length;
    
    console.log(`\n   ${profile.name}:`);
    console.log(`      Total: ${profileResults.length}`);
    console.log(`      ✅ Sucessos: ${profileSuccess}`);
    console.log(`      ❌ Erros: ${profileErrors}`);
    console.log(`      ⚠️  Avisos: ${profileWarnings}`);
  }
  
  // Erros detalhados
  console.log('\n\n❌ ERROS ENCONTRADOS:');
  const errorResults = testResults.filter(r => r.status === 'error');
  if (errorResults.length === 0) {
    console.log('   Nenhum erro encontrado! 🎉');
  } else {
    errorResults.forEach(result => {
      console.log(`\n   ${result.profile} - ${result.route}:`);
      result.errors.forEach(error => {
        console.log(`      - ${error}`);
      });
    });
  }
  
  // Avisos detalhados
  console.log('\n\n⚠️  AVISOS ENCONTRADOS:');
  const warningResults = testResults.filter(r => r.warnings.length > 0);
  if (warningResults.length === 0) {
    console.log('   Nenhum aviso encontrado! 🎉');
  } else {
    warningResults.forEach(result => {
      console.log(`\n   ${result.profile} - ${result.route}:`);
      result.warnings.forEach(warning => {
        console.log(`      - ${warning}`);
      });
    });
  }
  
  // Salvar relatório em JSON
  const reportData = {
    timestamp: new Date().toISOString(),
    summary: {
      total: totalTests,
      success: successCount,
      errors: errorCount,
      warnings: warningCount
    },
    profileStats: testProfiles.map(profile => {
      const profileResults = testResults.filter(r => r.profile === profile.name);
      return {
        profile: profile.name,
        total: profileResults.length,
        success: profileResults.filter(r => r.status === 'success').length,
        errors: profileResults.filter(r => r.status === 'error').length,
        warnings: profileResults.filter(r => r.status === 'warning').length
      };
    }),
    results: testResults,
    consoleErrors: consoleErrors,
    consoleWarnings: consoleWarnings
  };
  
  fs.writeFileSync(
    path.join('test-results', 'test-report.json'),
    JSON.stringify(reportData, null, 2)
  );
  
  console.log('\n\n✅ Relatório salvo em: test-results/test-report.json');
  console.log('═══════════════════════════════════════════════════════════\n');
});

