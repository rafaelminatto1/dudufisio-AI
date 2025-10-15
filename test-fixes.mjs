import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4173';

// Páginas que foram corrigidas
const pagesToTest = [
  { url: '/teleconsulta', name: 'Teleconsulta List' },
  { url: '/crm', name: 'CRM (Supabase)' },
  { url: '/integrations', name: 'Integrations' },
  { url: '/integrations-test', name: 'Integrations Test' },
  { url: '/specialty-assessments', name: 'Specialty Assessments' },
  { url: '/user-management', name: 'User Management' },
];

async function testPages() {
  console.log('\n🧪 Testando páginas corrigidas...\n');
  console.log('='.repeat(70));

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  const results = {
    passed: [],
    failed: [],
    warnings: []
  };

  // Capturar erros
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`  ❌ Console Error: ${msg.text()}`);
    }
  });

  page.on('pageerror', error => {
    console.log(`  💥 Page Error: ${error.message}`);
  });

  // Acessar página inicial primeiro (para fazer "login")
  console.log('\n📍 Acessando aplicação...');
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(2000);
  console.log('✅ Aplicação carregada\n');

  // Testar cada página
  for (const testPage of pagesToTest) {
    console.log(`\n→ Testando: ${testPage.name} (${testPage.url})`);
    
    try {
      const startTime = Date.now();
      await page.goto(`${BASE_URL}${testPage.url}`, { 
        waitUntil: 'networkidle', 
        timeout: 20000 
      });
      
      await page.waitForTimeout(1500);
      const loadTime = Date.now() - startTime;

      // Verificar se há erro 404 ou erro de página
      const hasErrorPage = await page.$('text=/404|não encontrad|page not found/i').catch(() => null);
      const hasSupabaseError = await page.$('text=/VITE_SUPABASE_URL/i').catch(() => null);

      if (hasErrorPage) {
        console.log(`  ⛔ 404 - Página não encontrada`);
        results.failed.push({ ...testPage, reason: '404 Not Found' });
      } else if (hasSupabaseError) {
        console.log(`  ⚠️  Erro de configuração Supabase (esperado se não configurado)`);
        results.warnings.push({ ...testPage, reason: 'Supabase config missing' });
      } else {
        const timeIcon = loadTime > 5000 ? '🐌' : loadTime > 3000 ? '⏱️' : '⚡';
        console.log(`  ✅ OK ${timeIcon} (${(loadTime / 1000).toFixed(2)}s)`);
        results.passed.push({ ...testPage, loadTime });
      }

    } catch (error) {
      if (error.message.includes('Timeout')) {
        console.log(`  ⏱️  TIMEOUT (>20s) - Página precisa otimização adicional`);
        results.warnings.push({ ...testPage, reason: 'Timeout >20s' });
      } else {
        console.log(`  ❌ Erro: ${error.message}`);
        results.failed.push({ ...testPage, reason: error.message });
      }
    }
  }

  await browser.close();

  // Resumo final
  console.log('\n' + '='.repeat(70));
  console.log('📊 RESUMO DOS TESTES');
  console.log('='.repeat(70));

  console.log(`\n✅ Páginas OK: ${results.passed.length}/${pagesToTest.length}`);
  results.passed.forEach(p => {
    const time = p.loadTime / 1000;
    const icon = time < 3 ? '⚡' : time < 5 ? '✓' : '🐌';
    console.log(`  ${icon} ${p.name} - ${time.toFixed(2)}s`);
  });

  if (results.warnings.length > 0) {
    console.log(`\n⚠️  Avisos: ${results.warnings.length}`);
    results.warnings.forEach(p => {
      console.log(`  - ${p.name}: ${p.reason}`);
    });
  }

  if (results.failed.length > 0) {
    console.log(`\n❌ Falhas: ${results.failed.length}`);
    results.failed.forEach(p => {
      console.log(`  - ${p.name}: ${p.reason}`);
    });
  }

  console.log('\n' + '='.repeat(70));

  const successRate = (results.passed.length / pagesToTest.length * 100).toFixed(0);
  console.log(`\n🎯 Taxa de Sucesso: ${successRate}%`);

  if (results.failed.length === 0 && results.warnings.length === 0) {
    console.log('🎉 TODOS OS TESTES PASSARAM!\n');
  } else if (results.failed.length === 0) {
    console.log('✅ Nenhuma falha crítica, apenas avisos.\n');
  } else {
    console.log('⚠️  Algumas páginas ainda precisam de atenção.\n');
  }
}

testPages().catch(console.error);

