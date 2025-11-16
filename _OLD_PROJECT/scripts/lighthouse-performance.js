const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function runLighthouse(url) {
  console.log(`\n🔍 Iniciando análise de performance para: ${url}\n`);
  
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance'],
    port: chrome.port
  };
  
  console.log('⏳ Executando Lighthouse...');
  const runnerResult = await lighthouse(url, options);
  
  // Salvar relatório
  const reportHtml = runnerResult.report;
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const reportPath = path.join(__dirname, '../lighthouse-reports', `report-${timestamp}.html`);
  
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, reportHtml);
  
  // Extrair métricas principais
  const metrics = {
    fcp: runnerResult.lhr.audits['first-contentful-paint'].numericValue,
    tti: runnerResult.lhr.audits['interactive'].numericValue,
    lcp: runnerResult.lhr.audits['largest-contentful-paint'].numericValue,
    tbt: runnerResult.lhr.audits['total-blocking-time'].numericValue,
    cls: runnerResult.lhr.audits['cumulative-layout-shift'].numericValue,
    score: Math.round(runnerResult.lhr.categories.performance.score * 100)
  };
  
  console.log('\n📊 Performance Metrics:');
  console.log('═══════════════════════════════════════');
  console.log(`✅ Lighthouse Score: ${metrics.score}/100`);
  console.log(`⏱️  First Contentful Paint: ${Math.round(metrics.fcp)}ms`);
  console.log(`⚡ Time to Interactive: ${Math.round(metrics.tti)}ms`);
  console.log(`📦 Largest Contentful Paint: ${Math.round(metrics.lcp)}ms`);
  console.log(`🔒 Total Blocking Time: ${Math.round(metrics.tbt)}ms`);
  console.log(`📐 Cumulative Layout Shift: ${metrics.cls.toFixed(3)}`);
  console.log('═══════════════════════════════════════');
  console.log(`\n📄 Relatório HTML salvo em: ${reportPath}\n`);
  
  await chrome.kill();
  
  return metrics;
}

const url = process.argv[2] || 'https://moocafisio.com.br';
runLighthouse(url).catch(console.error);

