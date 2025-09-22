// Script para testar erros do navegador usando Node.js
const puppeteer = require('puppeteer');

async function testBrowserErrors() {
    console.log('🚀 Iniciando teste de erros do navegador...');

    let browser;
    try {
        browser = await puppeteer.launch({
            headless: false, // Para ver o que está acontecendo
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Capturar erros do console
        const consoleMessages = [];
        const errors = [];
        const warnings = [];

        page.on('console', msg => {
            const text = msg.text();
            consoleMessages.push({
                type: msg.type(),
                text: text,
                timestamp: new Date().toISOString()
            });

            if (msg.type() === 'error') {
                errors.push(text);
                console.log('❌ ERROR:', text);
            } else if (msg.type() === 'warning') {
                warnings.push(text);
                console.log('⚠️  WARNING:', text);
            } else {
                console.log(`📝 ${msg.type().toUpperCase()}:`, text);
            }
        });

        // Capturar erros de JavaScript
        page.on('pageerror', error => {
            errors.push(error.message);
            console.log('💥 PAGE ERROR:', error.message);
        });

        // Capturar erros de rede
        page.on('requestfailed', request => {
            console.log('🌐 NETWORK ERROR:', request.url(), request.failure().errorText);
        });

        console.log('🌐 Navegando para http://localhost:5174...');
        await page.goto('http://localhost:5174', {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Aguardar a aplicação carregar
        console.log('⏳ Aguardando aplicação carregar...');
        await page.waitForTimeout(5000);

        // Verificar se o React carregou
        const reactLoaded = await page.evaluate(() => {
            return typeof window.React !== 'undefined' || document.querySelector('[data-reactroot]') !== null;
        });

        console.log('⚛️  React carregado:', reactLoaded);

        // Tentar navegar para diferentes páginas
        const testPages = [
            '/#/dashboard',
            '/#/agenda',
            '/#/patients',
            '/#/patient-dashboard'
        ];

        for (const testPage of testPages) {
            console.log(`🧪 Testando página: ${testPage}`);
            try {
                await page.goto(`http://localhost:5174${testPage}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 10000
                });
                await page.waitForTimeout(2000);

                const pageTitle = await page.title();
                console.log(`📄 Título da página: ${pageTitle}`);
            } catch (error) {
                console.log(`❌ Erro ao navegar para ${testPage}:`, error.message);
            }
        }

        // Relatório final
        console.log('\n📊 RELATÓRIO FINAL:');
        console.log('================');
        console.log(`Total de mensagens de console: ${consoleMessages.length}`);
        console.log(`Erros encontrados: ${errors.length}`);
        console.log(`Warnings encontrados: ${warnings.length}`);

        if (errors.length > 0) {
            console.log('\n❌ ERROS ENCONTRADOS:');
            errors.forEach((error, index) => {
                console.log(`${index + 1}. ${error}`);
            });
        }

        if (warnings.length > 0) {
            console.log('\n⚠️  WARNINGS ENCONTRADOS:');
            warnings.forEach((warning, index) => {
                console.log(`${index + 1}. ${warning}`);
            });
        }

        if (errors.length === 0) {
            console.log('✅ Nenhum erro crítico encontrado!');
        }

    } catch (error) {
        console.error('💥 Erro durante o teste:', error);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Verificar se Puppeteer está disponível
try {
    testBrowserErrors();
} catch (error) {
    console.log('⚠️  Puppeteer não disponível. Usando método alternativo...');
    console.log('🌐 Aplicação rodando em: http://localhost:5174');
    console.log('📋 Para verificar erros manualmente:');
    console.log('1. Abra http://localhost:5174 no Firefox');
    console.log('2. Pressione F12 para abrir DevTools');
    console.log('3. Vá para a aba Console');
    console.log('4. Navegue pela aplicação e observe os erros');
}