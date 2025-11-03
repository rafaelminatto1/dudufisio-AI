// Teste rápido para ver os logs do console no preview
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capturar TODOS os logs do console
  page.on('console', msg => {
    console.log(`[CONSOLE ${msg.type()}]:`, msg.text());
  });
  
  // Capturar erros
  page.on('pageerror', error => {
    console.error('[PAGE ERROR]:', error.message);
  });
  
  console.log('Navegando para http://localhost:4173...');
  await page.goto('http://localhost:4173', { waitUntil: 'networkidle', timeout: 30000 });
  
  console.log('\nAguardando 10 segundos para ver todos os logs...');
  await page.waitForTimeout(10000);
  
  console.log('\nTirando screenshot...');
  await page.screenshot({ path: 'preview-screenshot.png', fullPage: true });
  
  console.log('\nVerificando conteúdo da página...');
  const content = await page.content();
  console.log('HTML tem', content.length, 'caracteres');
  
  console.log('\nTeste concluído! Pressione Ctrl+C para fechar.');
  // await browser.close();
})();

