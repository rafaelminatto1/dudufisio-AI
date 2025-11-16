import { chromium } from 'playwright';

// Configurações dos usuários de teste
const testUsers = [
  {
    name: 'Administrador',
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    expectedPages: ['Dashboard', 'Pacientes', 'Agenda', 'Relatórios', 'Configurações']
  },
  {
    name: 'Fisioterapeuta',
    email: 'therapist@dudufisio.com',
    password: 'demo123456',
    expectedPages: ['Dashboard', 'Pacientes', 'Agenda', 'Exercícios']
  },
  {
    name: 'Paciente',
    email: 'patient@dudufisio.com',
    password: 'demo123456',
    expectedPages: ['Dashboard', 'Agendamentos', 'Exercícios', 'Mensagens']
  },
  {
    name: 'Educador Físico',
    email: 'educator@dudufisio.com',
    password: 'demo123456',
    expectedPages: ['Dashboard', 'Exercícios', 'Pacientes']
  }
];

async function testUserLogin(user) {
  console.log(`\n🔍 Testando login como ${user.name}...`);
  
  const browser = await chromium.launch({ 
    headless: false, // Para ver o que está acontecendo
    slowMo: 1000 // Para ver melhor o que está acontecendo
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
  
  // Capturar erros de página
  page.on('pageerror', error => {
    consoleErrors.push({
      text: error.message,
      location: { url: page.url() }
    });
  });
  
  try {
    // Navegar para a página de login
    console.log('📱 Navegando para a página de login...');
    await page.goto('http://localhost:5175');
    
    // Aguardar a página carregar
    await page.waitForLoadState('networkidle');
    
    // Procurar pelo formulário de login
    console.log('🔍 Procurando pelo formulário de login...');
    
    // Tentar encontrar campos de email e senha
    const emailInput = await page.locator('input[type="email"], input[placeholder*="email"], input[placeholder*="Email"]').first();
    const passwordInput = await page.locator('input[type="password"], input[placeholder*="senha"], input[placeholder*="Senha"]').first();
    
    if (await emailInput.count() === 0 || await passwordInput.count() === 0) {
      console.log('❌ Formulário de login não encontrado');
      console.log('📄 Conteúdo da página:', await page.content());
      return { success: false, error: 'Formulário de login não encontrado' };
    }
    
    // Preencher credenciais
    console.log('✏️ Preenchendo credenciais...');
    await emailInput.fill(user.email);
    await passwordInput.fill(user.password);
    
    // Procurar pelo botão de login
    const loginButton = await page.locator('button[type="submit"], button:has-text("Entrar"), button:has-text("Login")').first();
    
    if (await loginButton.count() === 0) {
      console.log('❌ Botão de login não encontrado');
      return { success: false, error: 'Botão de login não encontrado' };
    }
    
    // Clicar no botão de login
    console.log('🔐 Fazendo login...');
    await loginButton.click();
    
    // Aguardar redirecionamento
    await page.waitForLoadState('networkidle');
    
    // Verificar se o login foi bem-sucedido
    console.log('✅ Login realizado com sucesso!');
    
    // Testar navegação pelas páginas
    console.log('🧭 Testando navegação pelas páginas...');
    
    // Procurar por links de navegação
    const navLinks = await page.locator('nav a, [role="navigation"] a, .sidebar a').all();
    
    console.log(`📋 Encontrados ${navLinks.length} links de navegação`);
    
    for (const link of navLinks) {
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      console.log(`  - ${text} (${href})`);
    }
    
    // Aguardar um pouco para capturar erros
    await page.waitForTimeout(3000);
    
    return {
      success: true,
      consoleErrors,
      consoleWarnings,
      navLinks: navLinks.length
    };
    
  } catch (error) {
    console.log(`❌ Erro durante o teste: ${error.message}`);
    return { success: false, error: error.message, consoleErrors, consoleWarnings };
  } finally {
    await browser.close();
  }
}

async function runAllTests() {
  console.log('🚀 Iniciando testes de login e navegação...');
  
  const results = [];
  
  for (const user of testUsers) {
    const result = await testUserLogin(user);
    results.push({
      user: user.name,
      ...result
    });
  }
  
  // Relatório final
  console.log('\n📊 RELATÓRIO FINAL DOS TESTES');
  console.log('='.repeat(50));
  
  results.forEach(result => {
    console.log(`\n👤 ${result.user}:`);
    if (result.success) {
      console.log('  ✅ Login bem-sucedido');
      console.log(`  🔗 Links de navegação encontrados: ${result.navLinks}`);
      if (result.consoleErrors.length > 0) {
        console.log(`  ❌ Erros no console: ${result.consoleErrors.length}`);
        result.consoleErrors.forEach(error => {
          console.log(`    - ${error.text}`);
        });
      }
      if (result.consoleWarnings.length > 0) {
        console.log(`  ⚠️ Warnings no console: ${result.consoleWarnings.length}`);
        result.consoleWarnings.forEach(warning => {
          console.log(`    - ${warning.text}`);
        });
      }
    } else {
      console.log('  ❌ Falha no login');
      console.log(`  📝 Erro: ${result.error}`);
    }
  });
  
  // Estatísticas gerais
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  console.log(`\n📈 RESUMO:`);
  console.log(`  ✅ Sucessos: ${successful}/${total}`);
  console.log(`  ❌ Falhas: ${total - successful}/${total}`);
  
  // Coletar todos os erros únicos
  const allErrors = results.flatMap(r => r.consoleErrors || []);
  const uniqueErrors = [...new Set(allErrors.map(e => e.text))];
  
  if (uniqueErrors.length > 0) {
    console.log(`\n🔧 ERROS ÚNICOS ENCONTRADOS:`);
    uniqueErrors.forEach(error => {
      console.log(`  - ${error}`);
    });
  }
}

// Executar os testes
runAllTests().catch(console.error);
