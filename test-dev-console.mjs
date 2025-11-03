// Teste no modo desenvolvimento
import { chromium } from 'playwright';

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Capturar logs
  page.on('console', msg => console.log(`[DEV ${msg.type()}]:`, msg.text()));
  page.on('pageerror', error => console.error('[DEV ERROR]:', error.message));
  
  console.log('Testando DEV (porta 5173)...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle', timeout: 30000 });
  
  await page.waitForTimeout(5000);
  
  console.log('\n✅ DEV funcionou!');
  await page.screenshot({ path: 'dev-screenshot.png' });
  // await browser.close();
})();

