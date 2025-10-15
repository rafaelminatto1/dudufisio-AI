import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4173';

// Usuários de teste para cada perfil
const testUsers = [
  {
    email: 'admin@fisio.com',
    password: '123456',
    role: 'Admin',
    expectedDashboard: 'CompleteDashboard'
  },
  {
    email: 'therapist@fisio.com',
    password: '123456',
    role: 'Therapist',
    expectedDashboard: 'CompleteDashboard'
  },
  {
    email: 'patient@fisio.com',
    password: '123456',
    role: 'Patient',
    expectedDashboard: 'PatientPortalDashboard'
  },
  {
    email: 'educator@fisio.com',
    password: '123456',
    role: 'EducadorFisico',
    expectedDashboard: 'PartnerPortalDashboard'
  }
];

const results = {
  errors: [],
  warnings: [],
  pages404: [],
  consoleLogs: [],
  profiles: {}
};

async function testProfile(browser, user) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🧪 Testando perfil: ${user.role} (${user.email})`);
  console.log('='.repeat(60));
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  const profileResults = {
    role: user.role,
    email: user.email,
    loginSuccess: false,
    errors: [],
    warnings: [],
    pages404: [],
    consoleLogs: [],
    pagesVisited: []
  };
  
  // Captura logs do console
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    if (type === 'error') {
      console.log(`  ❌ Console Error: ${text}`);
      profileResults.errors.push(text);
      results.errors.push({ profile: user.role, error: text });
    } else if (type === 'warning') {
      console.log(`  ⚠️  Console Warning: ${text}`);
      profileResults.warnings.push(text);
      results.warnings.push({ profile: user.role, warning: text });
    }
    
    profileResults.consoleLogs.push({ type, text });
  });
  
  // Captura erros de página
  page.on('pageerror', error => {
    console.log(`  💥 Page Error: ${error.message}`);
    profileResults.errors.push(error.message);
    results.errors.push({ profile: user.role, error: error.message });
  });
  
  // Captura falhas de requisição
  page.on('requestfailed', request => {
    console.log(`  🔴 Request Failed: ${request.url()} - ${request.failure().errorText}`);
    profileResults.errors.push(`Request failed: ${request.url()}`);
  });
  
  // Captura respostas 404
  page.on('response', response => {
    if (response.status() === 404) {
      const url = response.url();
      console.log(`  ⛔ 404 Not Found: ${url}`);
      profileResults.pages404.push(url);
      results.pages404.push({ profile: user.role, url });
    }
  });
  
  try {
    // 1. Acessar página de login
    console.log(`\n📍 1. Acessando página de login...`);
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(1000);
    
    // 2. Fazer login
    console.log(`📍 2. Fazendo login...`);
    await page.fill('input[type="email"]', user.email);
    await page.fill('input[type="password"]', user.password);
    await page.click('button[type="submit"]');
    
    // Aguardar navegação após login
    await page.waitForTimeout(3000);
    
    // Verificar se login foi bem-sucedido
    const currentUrl = page.url();
    if (currentUrl === BASE_URL || currentUrl === `${BASE_URL}/`) {
      // Ainda na página de login - verificar se há erro
      const errorElement = await page.$('.text-red-600, .text-red-500, [role="alert"]');
      if (errorElement) {
        const errorText = await errorElement.textContent();
        console.log(`  ❌ Erro de login: ${errorText}`);
        profileResults.errors.push(`Login failed: ${errorText}`);
      } else {
        console.log(`  ✅ Login realizado com sucesso!`);
        profileResults.loginSuccess = true;
      }
    } else {
      console.log(`  ✅ Login realizado com sucesso! Redirecionado para: ${currentUrl}`);
      profileResults.loginSuccess = true;
    }
    
    if (!profileResults.loginSuccess) {
      console.log(`  ⚠️  Pulando testes de navegação (login falhou)`);
      return profileResults;
    }
    
    // 3. Aguardar o dashboard carregar
    console.log(`📍 3. Aguardando dashboard carregar...`);
    await page.waitForTimeout(3000);
    
    // 4. Capturar screenshot do dashboard
    const screenshotPath = `/workspace/screenshot-${user.role.toLowerCase()}-dashboard.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`  📸 Screenshot salvo: ${screenshotPath}`);
    
    // 5. Extrair links de navegação da sidebar/menu
    console.log(`📍 4. Extraindo links de navegação...`);
    
    // Aguardar sidebar carregar
    await page.waitForSelector('nav, aside, [role="navigation"]', { timeout: 5000 }).catch(() => null);
    
    // Extrair todos os links
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks
        .map(link => ({
          href: link.getAttribute('href'),
          text: link.textContent?.trim() || '',
          isInternal: link.getAttribute('href')?.startsWith('/') || link.getAttribute('href')?.startsWith('#')
        }))
        .filter(link => link.isInternal && link.href !== '/' && link.href !== '#' && !link.href.includes('javascript:'));
    });
    
    // Obter links únicos
    const uniqueLinks = [...new Set(links.map(l => l.href))].filter(href => href && href !== '/');
    console.log(`  📋 Encontrados ${uniqueLinks.length} links únicos de navegação`);
    
    // 6. Navegar por cada link
    console.log(`📍 5. Navegando por cada página...`);
    for (const href of uniqueLinks.slice(0, 30)) { // Limitar a 30 páginas para não demorar muito
      try {
        console.log(`  → Acessando: ${href}`);
        const fullUrl = href.startsWith('http') ? href : `${BASE_URL}${href}`;
        
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1000);
        
        // Verificar se a página carregou corretamente
        const title = await page.title();
        const hasErrorPage = await page.$('text=/404|não encontrada|error|erro/i');
        
        if (hasErrorPage) {
          console.log(`    ⛔ Página de erro encontrada: ${href}`);
          profileResults.pages404.push(href);
        } else {
          console.log(`    ✓ Página carregada: ${title || href}`);
          profileResults.pagesVisited.push({ href, title });
        }
        
      } catch (error) {
        console.log(`    ❌ Erro ao acessar ${href}: ${error.message}`);
        profileResults.errors.push(`Navigation error: ${href} - ${error.message}`);
      }
    }
    
    console.log(`\n✅ Teste do perfil ${user.role} concluído!`);
    console.log(`  - Páginas visitadas: ${profileResults.pagesVisited.length}`);
    console.log(`  - Erros: ${profileResults.errors.length}`);
    console.log(`  - Avisos: ${profileResults.warnings.length}`);
    console.log(`  - 404s: ${profileResults.pages404.length}`);
    
  } catch (error) {
    console.log(`  💥 Erro crítico no teste: ${error.message}`);
    profileResults.errors.push(`Critical error: ${error.message}`);
  } finally {
    await context.close();
  }
  
  return profileResults;
}

async function runTests() {
  console.log('\n🚀 Iniciando testes de todos os perfis...\n');
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    for (const user of testUsers) {
      const profileResults = await testProfile(browser, user);
      results.profiles[user.role] = profileResults;
    }
    
    // Resumo final
    console.log('\n' + '='.repeat(60));
    console.log('📊 RESUMO FINAL DOS TESTES');
    console.log('='.repeat(60));
    
    console.log('\n📈 Por Perfil:');
    for (const [role, data] of Object.entries(results.profiles)) {
      console.log(`\n  ${role}:`);
      console.log(`    Login: ${data.loginSuccess ? '✅ Sucesso' : '❌ Falhou'}`);
      console.log(`    Páginas visitadas: ${data.pagesVisited.length}`);
      console.log(`    Erros: ${data.errors.length}`);
      console.log(`    Avisos: ${data.warnings.length}`);
      console.log(`    404s: ${data.pages404.length}`);
    }
    
    console.log('\n🔴 Erros Totais:', results.errors.length);
    if (results.errors.length > 0) {
      console.log('\nErros encontrados:');
      results.errors.slice(0, 10).forEach(e => {
        console.log(`  - [${e.profile}] ${e.error.substring(0, 100)}`);
      });
      if (results.errors.length > 10) {
        console.log(`  ... e mais ${results.errors.length - 10} erros`);
      }
    }
    
    console.log('\n⚠️  Avisos Totais:', results.warnings.length);
    
    console.log('\n⛔ 404s Totais:', results.pages404.length);
    if (results.pages404.length > 0) {
      console.log('\nPáginas 404 encontradas:');
      const unique404s = [...new Set(results.pages404.map(p => p.url))];
      unique404s.slice(0, 10).forEach(url => {
        console.log(`  - ${url}`);
      });
      if (unique404s.length > 10) {
        console.log(`  ... e mais ${unique404s.length - 10} URLs 404`);
      }
    }
    
    console.log('\n' + '='.repeat(60));
    
    // Salvar resultados em JSON
    const fs = await import('fs');
    fs.writeFileSync('/workspace/test-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Resultados completos salvos em: test-results.json');
    
  } catch (error) {
    console.error('❌ Erro fatal:', error);
  } finally {
    await browser.close();
  }
}

runTests().catch(console.error);

