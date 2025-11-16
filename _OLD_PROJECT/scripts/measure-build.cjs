// Measure build duration and optionally alert on slow builds
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function postToSlack(text) {
  const webhook = process.env.SLACK_WEBHOOK_URL;
  if (!webhook) return;
  try {
    execSync(`curl -X POST -H "Content-type: application/json" --data '${JSON.stringify({ text })}' ${webhook}`);
  } catch (e) {
    // silent fail
  }
}

function writeMetrics(metrics) {
  const reportsDir = path.join(process.cwd(), 'reports');
  const file = path.join(reportsDir, 'deploy-metrics.json');
  try {
    if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
    const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : [];
    prev.push(metrics);
    fs.writeFileSync(file, JSON.stringify(prev, null, 2));
  } catch (e) {
    // ignore
  }
}

function formatMs(ms) {
  const s = (ms / 1000).toFixed(1);
  return `${s}s`;
}

(async () => {
  const start = Date.now();
  const startedAt = new Date().toISOString();
  const env = process.env.VERCEL ? 'vercel' : 'local';
  let ok = true;
  let error = null;
  try {
    // Run the optimized build
    execSync('npm run build:optimized:core', { stdio: 'inherit' });
  } catch (e) {
    ok = false;
    error = e.message?.slice(0, 1000) || String(e);
  }
  const end = Date.now();
  const durationMs = end - start;
  const finishedAt = new Date().toISOString();
  const metrics = {
    env,
    ok,
    startedAt,
    finishedAt,
    durationMs,
    durationHuman: formatMs(durationMs),
    node: process.version,
  };
  writeMetrics(metrics);

  const thresholdMs = Number(process.env.BUILD_WARN_THRESHOLD_MS || 120000); // 2 min default
  if (!ok || durationMs > thresholdMs) {
    postToSlack(`⚠️ Deploy build ${ok ? 'slow' : 'failed'}: ${formatMs(durationMs)} (env=${env})`);
  } else {
    postToSlack(`✅ Deploy build ok: ${formatMs(durationMs)} (env=${env})`);
  }

  // Exit code based on success
  process.exit(ok ? 0 : 1);
})();