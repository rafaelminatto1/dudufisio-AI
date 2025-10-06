import { chromium } from 'playwright';

// Teste específico para verificar navegação dos portais
async function testPortalNavigation() {
  console.log('🔍 Testando navegação dos portais...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capturar erros do console
  const consoleErrors = [];
  const consoleWarnings = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({
        text: msg.text(),
        location: msg.location()
      });
    } else if (msg.type() === 'warning') {
      consoleWarnings.push({
        text: msg.text(),
        location: msg.location()
      });
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push({
      text: error.message,
      location: { url: page.url() }
    });
  });
  
  try {
    // Testar Portal do Paciente
    console.log('\n👤 Testando Portal do Paciente...');
    await page.goto('http://localhost:5175');
    await page.waitForLoadState('networkidle');
    
    // Fazer login como paciente
    await page.fill('input[type="email"]', 'patient@dudufisio.com');
    await page.fill('input[type="password"]', 'demo123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verificar se o portal do paciente está sendo renderizado
    const patientPortal = await page.locator('text=Portal do Paciente').first();
    if (await patientPortal.count() > 0) {
      console.log('✅ Portal do Paciente renderizado');
    } else {
      console.log('❌ Portal do Paciente não encontrado');
    }
    
    // Verificar se há botões de navegação
    const navButtons = await page.locator('button').all();
    console.log(`📋 Encontrados ${navButtons.length} botões na página`);
    
    // Verificar botões específicos do portal do paciente
    const dashboardButton = await page.locator('button:has-text("Início")').first();
    const appointmentsButton = await page.locator('button:has-text("Consultas")').first();
    const exercisesButton = await page.locator('button:has-text("Exercícios")').first();
    
    console.log(`  - Botão Início: ${await dashboardButton.count() > 0 ? '✅' : '❌'}`);
    console.log(`  - Botão Consultas: ${await appointmentsButton.count() > 0 ? '✅' : '❌'}`);
    console.log(`  - Botão Exercícios: ${await exercisesButton.count() > 0 ? '✅' : '❌'}`);
    
    // Testar cliques nos botões
    if (await dashboardButton.count() > 0) {
      console.log('🖱️ Testando clique no botão Início...');
      await dashboardButton.click();
      await page.waitForTimeout(1000);
    }
    
    if (await exercisesButton.count() > 0) {
      console.log('🖱️ Testando clique no botão Exercícios...');
      await exercisesButton.click();
      await page.waitForTimeout(1000);
    }
    
    // Fazer logout
    const logoutButton = await page.locator('button:has-text("Sair")').first();
    if (await logoutButton.count() > 0) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
    }
    
    // Testar Portal do Educador Físico
    console.log('\n🏃 Testando Portal do Educador Físico...');
    
    // Fazer login como educador físico
    await page.fill('input[type="email"]', 'educator@dudufisio.com');
    await page.fill('input[type="password"]', 'demo123456');
    await page.click('button[type="submit"]');
    await page.waitForLoadState('networkidle');
    
    // Verificar se o portal do educador está sendo renderizado
    const educatorPortal = await page.locator('text=Portal do Parceiro').first();
    if (await educatorPortal.count() > 0) {
      console.log('✅ Portal do Educador Físico renderizado');
    } else {
      console.log('❌ Portal do Educador Físico não encontrado');
    }
    
    // Verificar botões específicos do portal do educador
    const educatorDashboardButton = await page.locator('button:has-text("Dashboard")').first();
    const clientsButton = await page.locator('button:has-text("Meus Clientes")').first();
    const educatorExercisesButton = await page.locator('button:has-text("Exercícios")').first();
    
    console.log(`  - Botão Dashboard: ${await educatorDashboardButton.count() > 0 ? '✅' : '❌'}`);
    console.log(`  - Botão Meus Clientes: ${await clientsButton.count() > 0 ? '✅' : '❌'}`);
    console.log(`  - Botão Exercícios: ${await educatorExercisesButton.count() > 0 ? '✅' : '❌'}`);
    
    // Testar cliques nos botões
    if (await educatorDashboardButton.count() > 0) {
      console.log('🖱️ Testando clique no botão Dashboard...');
      await educatorDashboardButton.click();
      await page.waitForTimeout(1000);
    }
    
    if (await educatorExercisesButton.count() > 0) {
      console.log('🖱️ Testando clique no botão Exercícios...');
      await educatorExercisesButton.click();
      await page.waitForTimeout(1000);
    }
    
    return {
      success: true,
      consoleErrors,
      consoleWarnings
    };
    
  } catch (error) {
    console.log(`❌ Erro durante o teste: ${error.message}`);
    return { success: false, error: error.message, consoleErrors, consoleWarnings };
  } finally {
    await browser.close();
  }
}

// Executar o teste
testPortalNavigation().then(result => {
  console.log('\n📊 RESULTADO DO TESTE:');
  console.log('='.repeat(50));
  
  if (result.success) {
    console.log('✅ Teste executado com sucesso');
  } else {
    console.log('❌ Teste falhou');
    console.log(`📝 Erro: ${result.error}`);
  }
  
  if (result.consoleErrors.length > 0) {
    console.log(`\n❌ Erros encontrados: ${result.consoleErrors.length}`);
    result.consoleErrors.forEach(error => {
      console.log(`  - ${error.text}`);
    });
  }
  
  if (result.consoleWarnings.length > 0) {
    console.log(`\n⚠️ Warnings encontrados: ${result.consoleWarnings.length}`);
    result.consoleWarnings.forEach(warning => {
      console.log(`  - ${warning.text}`);
    });
  }
}).catch(console.error);
