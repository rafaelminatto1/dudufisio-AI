import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4173';

const results = {
  errors: [],
  warnings: [],
  pages404: [],
  consoleLogs: [],
  pagesVisited: [],
  failedRequests: []
};

async function testNavigation() {
  console.log('\n🚀 Iniciando teste de navegação completo...\n');
  console.log('='.repeat(70));
  
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Captura logs do console
  page.on('console', msg => {
    const text = msg.text();
    const type = msg.type();
    
    results.consoleLogs.push({ type, text });
    
    if (type === 'error') {
      console.log(`  ❌ Console Error: ${text}`);
      results.errors.push(text);
    } else if (type === 'warning') {
      console.log(`  ⚠️  Console Warning: ${text}`);
      results.warnings.push(text);
    }
  });
  
  // Captura erros de página
  page.on('pageerror', error => {
    console.log(`  💥 Page Error: ${error.message}`);
    results.errors.push(error.message);
  });
  
  // Captura falhas de requisição
  page.on('requestfailed', request => {
    const url = request.url();
    const error = request.failure().errorText;
    console.log(`  🔴 Request Failed: ${url} - ${error}`);
    results.failedRequests.push({ url, error });
  });
  
  // Captura respostas 404
  page.on('response', response => {
    if (response.status() === 404) {
      const url = response.url();
      console.log(`  ⛔ 404 Not Found: ${url}`);
      results.pages404.push(url);
    }
  });
  
  try {
    // 1. Acessar página inicial (já vai para o dashboard)
    console.log('📍 1. Acessando aplicação...\n');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);
    
    console.log('✅ Aplicação carregada!\n');
    
    // 2. Capturar screenshot inicial
    await page.screenshot({ path: '/workspace/dashboard-initial.png', fullPage: false });
    console.log('📸 Screenshot inicial salvo\n');
    
    // 3. Extrair todos os links de navegação
    console.log('📍 2. Extraindo links de navegação...\n');
    
    const links = await page.evaluate(() => {
      const allLinks = Array.from(document.querySelectorAll('a[href]'));
      return allLinks
        .map(link => {
          const href = link.getAttribute('href');
          const text = link.textContent?.trim() || '';
          
          return {
            href,
            text,
            isInternal: href && (href.startsWith('/') || href.startsWith('#'))
          };
        })
        .filter(link => 
          link.isInternal && 
          link.href && 
          link.href !== '/' && 
          link.href !== '#' && 
          !link.href.includes('javascript:') &&
          !link.href.includes('mailto:')
        );
    });
    
    // Obter links únicos
    const uniqueLinks = [...new Map(links.map(l => [l.href, l])).values()];
    console.log(`📋 Encontrados ${uniqueLinks.length} links únicos\n`);
    
    // Agrupar links por seção (baseado no prefixo da URL)
    const linksBySection = {};
    uniqueLinks.forEach(link => {
      const section = link.href.split('/')[1] || 'root';
      if (!linksBySection[section]) {
        linksBySection[section] = [];
      }
      linksBySection[section].push(link);
    });
    
    console.log('📊 Links por seção:');
    Object.entries(linksBySection).forEach(([section, sectionLinks]) => {
      console.log(`  ${section}: ${sectionLinks.length} link(s)`);
    });
    console.log();
    
    // 4. Navegar por cada link
    console.log('📍 3. Navegando por cada página...\n');
    console.log('='.repeat(70));
    
    let visitedCount = 0;
    let errorCount = 0;
    
    for (const link of uniqueLinks.slice(0, 50)) { // Limitar a 50 páginas
      try {
        const fullUrl = link.href.startsWith('http') ? link.href : `${BASE_URL}${link.href}`;
        const linkText = link.text.substring(0, 40);
        
        console.log(`\n→ Acessando: ${link.href}`);
        console.log(`  Texto: "${linkText}"`);
        
        await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 });
        await page.waitForTimeout(1500);
        
        const title = await page.title();
        const url = page.url();
        
        // Verificar se há erro 404 ou página de erro
        const hasErrorPage = await page.$('text=/404|não encontrad|error|erro/i').catch(() => null);
        
        if (hasErrorPage) {
          const errorText = await hasErrorPage.textContent();
          console.log(`  ⛔ Página de erro: ${errorText?.substring(0, 50)}`);
          results.pages404.push({ href: link.href, text: linkText });
          errorCount++;
        } else {
          console.log(`  ✅ OK - ${title}`);
          results.pagesVisited.push({ 
            href: link.href, 
            text: linkText,
            title,
            actualUrl: url
          });
          visitedCount++;
        }
        
      } catch (error) {
        console.log(`  ❌ Erro: ${error.message}`);
        results.errors.push(`Navigation error: ${link.href} - ${error.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(70));
    console.log('\n📊 RESUMO FINAL\n');
    console.log('='.repeat(70));
    
    console.log(`\n✅ Páginas visitadas com sucesso: ${visitedCount}`);
    console.log(`❌ Páginas com erro: ${errorCount}`);
    console.log(`🔴 Erros no console: ${results.errors.length}`);
    console.log(`⚠️  Avisos no console: ${results.warnings.length}`);
    console.log(`⛔ Recursos 404: ${results.pages404.length}`);
    console.log(`🔌 Requisições falhadas: ${results.failedRequests.length}`);
    
    // Mostrar detalhes dos erros
    if (results.errors.length > 0) {
      console.log('\n❌ ERROS ENCONTRADOS:');
      console.log('-'.repeat(70));
      results.errors.slice(0, 10).forEach((error, i) => {
        console.log(`${i + 1}. ${error.substring(0, 100)}`);
      });
      if (results.errors.length > 10) {
        console.log(`... e mais ${results.errors.length - 10} erros`);
      }
    }
    
    // Mostrar recursos 404
    if (results.pages404.length > 0) {
      console.log('\n⛔ RECURSOS 404:');
      console.log('-'.repeat(70));
      const unique404 = [...new Set(results.pages404.map(p => typeof p === 'string' ? p : p.href))];
      unique404.slice(0, 10).forEach((url, i) => {
        console.log(`${i + 1}. ${url}`);
      });
      if (unique404.length > 10) {
        console.log(`... e mais ${unique404.length - 10} recursos`);
      }
    }
    
    // Mostrar requisições falhadas
    if (results.failedRequests.length > 0) {
      console.log('\n🔌 REQUISIÇÕES FALHADAS:');
      console.log('-'.repeat(70));
      results.failedRequests.slice(0, 10).forEach((req, i) => {
        console.log(`${i + 1}. ${req.url}`);
        console.log(`   → ${req.error}`);
      });
      if (results.failedRequests.length > 10) {
        console.log(`... e mais ${results.failedRequests.length - 10} requisições`);
      }
    }
    
    // Mostrar páginas visitadas
    if (results.pagesVisited.length > 0) {
      console.log('\n✅ PÁGINAS VISITADAS COM SUCESSO:');
      console.log('-'.repeat(70));
      results.pagesVisited.forEach((page, i) => {
        console.log(`${i + 1}. ${page.href} - ${page.title}`);
      });
    }
    
    console.log('\n' + '='.repeat(70));
    
    // Salvar resultados
    const fs = await import('fs');
    fs.writeFileSync('/workspace/navigation-results.json', JSON.stringify(results, null, 2));
    console.log('\n💾 Resultados salvos em: navigation-results.json\n');
    
  } catch (error) {
    console.error('\n❌ Erro fatal:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

testNavigation().catch(console.error);

