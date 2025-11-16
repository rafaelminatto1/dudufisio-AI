const lhModule = require('lighthouse');
const lighthouse = lhModule.default || lhModule;
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');
const path = require('path');

async function run(url) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = { logLevel: 'silent', output: 'json', onlyCategories: ['performance'], port: chrome.port };
  const runnerResult = await lighthouse(url, options);

  const lhr = runnerResult.lhr;
  const metrics = {
    score: Math.round(lhr.categories.performance.score * 100),
    fcp: Math.round(lhr.audits['first-contentful-paint'].numericValue),
    lcp: Math.round(lhr.audits['largest-contentful-paint'].numericValue),
    tti: Math.round(lhr.audits['interactive'].numericValue),
    tbt: Math.round(lhr.audits['total-blocking-time'].numericValue),
    cls: Number(lhr.audits['cumulative-layout-shift'].numericValue.toFixed(3)),
  };

  const ts = new Date().toISOString().replace(/:/g, '-').split('.')[0];
  const out = [
    `# Lighthouse Summary (${ts})`,
    '',
    `- URL: ${url}`,
    `- Score: ${metrics.score}`,
    `- FCP: ${metrics.fcp} ms`,
    `- LCP: ${metrics.lcp} ms`,
    `- TTI: ${metrics.tti} ms`,
    `- TBT: ${metrics.tbt} ms`,
    `- CLS: ${metrics.cls}`,
    '',
  ].join('\n');

  fs.writeFileSync(path.resolve(__dirname, '..', 'LIGHTHOUSE_SUMMARY.md'), out);
  await chrome.kill();
  console.log('✅ LIGHTHOUSE_SUMMARY.md gerado.');
}

const url = process.argv[2] || 'http://localhost:4173';
run(url).catch(err => { console.error(err); process.exit(1); });


