// Script para testar o sidebar com debug
const puppeteer = require('puppeteer');

async function testSidebar() {
    console.log('🔍 Iniciando teste do sidebar...');
    
    const browser = await puppeteer.launch({
        headless: false, // Visual para debug
        defaultViewport: { width: 1280, height: 720 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    // Interceptar logs do console
    page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        if (text.includes('[SIDEBAR]') || text.includes('[LAYOUT]') || text.includes('[COMPLETE_DASHBOARD]')) {
            console.log(`📱 [${type.toUpperCase()}] ${text}`);
        }
    });
    
    try {
        console.log('🌐 Navegando para a aplicação...');
        await page.goto('http://localhost:5175', { 
            waitUntil: 'networkidle2',
            timeout: 10000 
        });
        
        // Aguardar carregamento inicial
        await page.waitForTimeout(2000);
        
        console.log('🔐 Tentando fazer login...');
        
        // Preencher formulário de login
        await page.type('input[type="email"]', 'admin@dudufisio.com');
        await page.type('input[type="password"]', 'demo123456');
        
        // Clicar no botão de login
        await page.click('button[type="submit"]');
        
        // Aguardar redirecionamento
        await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 });
        
        console.log('✅ Login realizado, verificando sidebar...');
        
        // Aguardar um pouco para o sidebar carregar
        await page.waitForTimeout(3000);
        
        // Verificar se o sidebar está visível
        const sidebarVisible = await page.$eval('nav[class*="sidebar"], aside[class*="sidebar"], div[class*="sidebar"]', el => {
            return el && el.offsetWidth > 0 && el.offsetHeight > 0;
        }).catch(() => false);
        
        console.log(`🔍 Sidebar visível: ${sidebarVisible}`);
        
        // Verificar se há elementos de navegação
        const navItems = await page.$$eval('a[href], button', elements => {
            return elements.length;
        }).catch(() => 0);
        
        console.log(`🔍 Elementos de navegação encontrados: ${navItems}`);
        
        // Screenshot para debug
        await page.screenshot({ 
            path: 'test-results/sidebar-debug.png',
            fullPage: true 
        });
        
        console.log('📸 Screenshot salvo em test-results/sidebar-debug.png');
        
        if (!sidebarVisible) {
            console.log('❌ PROBLEMA: Sidebar não está visível');
            
            // Verificar se há mensagem de loading
            const loadingText = await page.$eval('body', el => el.textContent).catch(() => '');
            if (loadingText.includes('Carregando')) {
                console.log('⏳ Aplicação ainda carregando...');
            }
        } else {
            console.log('✅ Sidebar está funcionando!');
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    } finally {
        await browser.close();
    }
}

testSidebar().catch(console.error);
