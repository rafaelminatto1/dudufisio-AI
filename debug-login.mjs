import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4173';

async function debugLogin() {
  console.log('🔍 Investigando página de login...\n');
  
  const browser = await chromium.launch({
    headless: true, // Rodar em modo headless
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  
  const page = await context.newPage();
  
  // Capturar TODOS os logs do console
  page.on('console', msg => {
    const type = msg.type();
    const text = msg.text();
    console.log(`[CONSOLE ${type.toUpperCase()}] ${text}`);
  });
  
  // Capturar erros
  page.on('pageerror', error => {
    console.log(`[PAGE ERROR] ${error.message}`);
    console.log(error.stack);
  });
  
  // Capturar falhas de requisição
  page.on('requestfailed', request => {
    console.log(`[REQUEST FAILED] ${request.url()}`);
    console.log(`  → ${request.failure().errorText}`);
  });
  
  // Capturar respostas
  page.on('response', response => {
    const status = response.status();
    const url = response.url();
    if (status >= 400) {
      console.log(`[HTTP ${status}] ${url}`);
    }
  });
  
  try {
    console.log('📍 Acessando página...');
    await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 30000 });
    
    console.log('\n📍 Aguardando carregamento completo...');
    await page.waitForTimeout(5000);
    
    console.log('\n📍 Capturando HTML da página...');
    const html = await page.content();
    const fs = await import('fs');
    fs.writeFileSync('/workspace/login-page.html', html);
    console.log('  ✓ HTML salvo em: login-page.html');
    
    console.log('\n📍 Capturando screenshot...');
    await page.screenshot({ path: '/workspace/login-screenshot.png', fullPage: true });
    console.log('  ✓ Screenshot salvo em: login-screenshot.png');
    
    console.log('\n📍 Verificando elementos da página...');
    
    // Verificar título
    const title = await page.title();
    console.log(`  Título: ${title}`);
    
    // Verificar se há algum input visível
    const inputs = await page.$$('input');
    console.log(`  Total de inputs encontrados: ${inputs.length}`);
    
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i];
      const type = await input.getAttribute('type');
      const name = await input.getAttribute('name');
      const placeholder = await input.getAttribute('placeholder');
      const id = await input.getAttribute('id');
      const visible = await input.isVisible();
      
      console.log(`  Input ${i + 1}:`);
      console.log(`    type: ${type}`);
      console.log(`    name: ${name}`);
      console.log(`    id: ${id}`);
      console.log(`    placeholder: ${placeholder}`);
      console.log(`    visible: ${visible}`);
    }
    
    // Verificar botões
    const buttons = await page.$$('button');
    console.log(`\n  Total de botões encontrados: ${buttons.length}`);
    
    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
      const text = await button.textContent();
      const type = await button.getAttribute('type');
      const visible = await button.isVisible();
      
      console.log(`  Botão ${i + 1}:`);
      console.log(`    text: ${text?.trim()}`);
      console.log(`    type: ${type}`);
      console.log(`    visible: ${visible}`);
    }
    
    // Verificar se há algum erro visível na página
    console.log('\n📍 Verificando erros na página...');
    const errorElements = await page.$$('[role="alert"], .error, .text-red-500, .text-red-600');
    console.log(`  Elementos de erro encontrados: ${errorElements.length}`);
    
    for (let i = 0; i < errorElements.length; i++) {
      const el = errorElements[i];
      const text = await el.textContent();
      const visible = await el.isVisible();
      if (visible) {
        console.log(`  Erro ${i + 1}: ${text?.trim()}`);
      }
    }
    
    // Verificar estrutura da página
    console.log('\n📍 Estrutura da página:');
    const bodyClasses = await page.evaluate(() => document.body.className);
    console.log(`  Body classes: ${bodyClasses}`);
    
    const bodyChildren = await page.evaluate(() => {
      return Array.from(document.body.children).map(el => ({
        tag: el.tagName,
        id: el.id,
        classes: el.className,
        text: el.textContent?.substring(0, 50)
      }));
    });
    
    console.log('  Elementos principais do body:');
    bodyChildren.forEach((el, i) => {
      console.log(`    ${i + 1}. <${el.tag}${el.id ? ` id="${el.id}"` : ''}${el.classes ? ` class="${el.classes}"` : ''}>`);
    });
    
    console.log('\n✅ Investigação concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error.stack);
  } finally {
    await browser.close();
  }
}

debugLogin().catch(console.error);

