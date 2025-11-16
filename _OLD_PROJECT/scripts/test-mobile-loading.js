#!/usr/bin/env node

/**
 * 🧪 SCRIPT DE TESTE PARA CARREGAMENTO MOBILE
 * 
 * Simula condições de conexão lenta e testa o carregamento
 */

const puppeteer = require('puppeteer');
const path = require('path');

async function testMobileLoading() {
  console.log('🚀 Iniciando teste de carregamento mobile...');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: { width: 375, height: 667 }, // iPhone SE
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const page = await browser.newPage();

  // Simular conexão lenta
  await page.emulate({
    name: 'Slow 3G',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    viewport: { width: 375, height: 667 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    connection: {
      effectiveType: '2g',
      downlink: 0.5,
      rtt: 2000
    }
  });

  // Interceptar requisições para simular falhas
  await page.setRequestInterception(true);
  let requestCount = 0;

  page.on('request', (request) => {
    requestCount++;
    
    // Simular falha na primeira tentativa de algumas requisições
    if (request.url().includes('supabase') && requestCount <= 2) {
      console.log('❌ Simulando falha na requisição:', request.url());
      request.abort();
    } else {
      request.continue();
    }
  });

  // Monitorar console logs
  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    
    if (type === 'error') {
      console.log('🔴 Console Error:', text);
    } else if (type === 'warn') {
      console.log('🟡 Console Warning:', text);
    } else if (text.includes('[MOBILE]') || text.includes('[FALLBACK]')) {
      console.log('📱 Mobile Log:', text);
    }
  });

  // Monitorar erros de rede
  page.on('requestfailed', (request) => {
    console.log('🌐 Request Failed:', request.url(), request.failure().errorText);
  });

  try {
    console.log('📱 Navegando para a aplicação...');
    
    // Navegar para a aplicação
    await page.goto('http://localhost:5176', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    console.log('⏳ Aguardando carregamento inicial...');
    
    // Aguardar o carregamento da aplicação
    await page.waitForSelector('#root', { timeout: 10000 });
    
    // Aguardar um pouco mais para ver se carrega
    await page.waitForTimeout(5000);
    
    // Verificar se a aplicação carregou
    const appLoaded = await page.evaluate(() => {
      const root = document.querySelector('#root');
      return root && root.innerHTML.length > 100;
    });

    if (appLoaded) {
      console.log('✅ Aplicação carregada com sucesso!');
      
      // Verificar se está em modo fallback
      const isFallbackMode = await page.evaluate(() => {
        return document.body.textContent.includes('Modo Offline') || 
               document.body.textContent.includes('fallback');
      });

      if (isFallbackMode) {
        console.log('🔄 Modo fallback ativado corretamente');
      } else {
        console.log('⚠️ Modo fallback não detectado');
      }

      // Verificar se há notificações de conexão
      const hasConnectionNotification = await page.evaluate(() => {
        return document.querySelector('[class*="offline"]') !== null ||
               document.querySelector('[class*="slow"]') !== null;
      });

      if (hasConnectionNotification) {
        console.log('📢 Notificação de conexão detectada');
      }

    } else {
      console.log('❌ Aplicação não carregou corretamente');
    }

    // Tirar screenshot
    await page.screenshot({ 
      path: 'mobile-loading-test.png',
      fullPage: true 
    });
    console.log('📸 Screenshot salvo como mobile-loading-test.png');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  } finally {
    await browser.close();
    console.log('🏁 Teste concluído');
  }
}

// Executar o teste
testMobileLoading().catch(console.error);
