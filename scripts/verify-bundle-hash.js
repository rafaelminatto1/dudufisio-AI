#!/usr/bin/env node

/**
 * Script de Verificação de Bundle Hash
 *
 * Verifica se o bundle hash mudou entre dois deployments.
 * Útil para detectar problemas de cache do Vercel.
 *
 * Uso:
 *   node scripts/verify-bundle-hash.js
 *   node scripts/verify-bundle-hash.js --url1=https://old-deploy.vercel.app --url2=https://new-deploy.vercel.app
 *   npm run verify:bundle-hash
 *
 * Exit Codes:
 *   0 - Bundle hash mudou (sucesso)
 *   1 - Bundle hash não mudou (falha - possível problema de cache)
 *   2 - Erro na execução
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuração
const CONFIG = {
  productionUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://moocafisio.com.br',
  timeout: 15000,
  bundlePatterns: [
    /index-([a-zA-Z0-9]+)\.js/,
    /vendor-([a-zA-Z0-9]+)\.js/,
    /DashboardPageV2-([a-zA-Z0-9]+)\.js/,
    /AgendaPage-([a-zA-Z0-9]+)\.js/,
  ],
  cacheFile: path.join(__dirname, '.bundle-hash-cache.json'),
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function debug(message) {
  if (process.env.DEBUG) {
    log(`🔍 ${message}`, colors.gray);
  }
}

/**
 * Faz HTTP request e retorna HTML
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout após ${CONFIG.timeout}ms`));
    }, CONFIG.timeout);

    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'bundle-hash-verifier/1.0',
      },
    };

    https.get(options, (res) => {
      clearTimeout(timeout);

      // Seguir redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        debug(`Redirect para: ${res.headers.location}`);
        resolve(fetchPage(res.headers.location));
        return;
      }

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          body: data,
          url: url,
        });
      });
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Extrai todos os bundle hashes do HTML
 */
function extractBundleHashes(html) {
  const hashes = {};

  for (const pattern of CONFIG.bundlePatterns) {
    const matches = html.matchAll(new RegExp(pattern.source, 'g'));

    for (const match of matches) {
      const fullMatch = match[0];
      const hash = match[1];
      const bundleName = fullMatch.split('-')[0];

      hashes[bundleName] = hash;
      debug(`Encontrado: ${bundleName} = ${hash}`);
    }
  }

  return hashes;
}

/**
 * Carrega cache de hashes anteriores
 */
function loadCache() {
  try {
    if (fs.existsSync(CONFIG.cacheFile)) {
      const data = fs.readFileSync(CONFIG.cacheFile, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    warning(`Erro ao ler cache: ${err.message}`);
  }
  return null;
}

/**
 * Salva hashes no cache
 */
function saveCache(data) {
  try {
    fs.writeFileSync(
      CONFIG.cacheFile,
      JSON.stringify(data, null, 2),
      'utf8'
    );
    debug(`Cache salvo: ${CONFIG.cacheFile}`);
  } catch (err) {
    warning(`Erro ao salvar cache: ${err.message}`);
  }
}

/**
 * Compara dois conjuntos de hashes
 */
function compareHashes(oldHashes, newHashes) {
  const results = {
    changed: [],
    unchanged: [],
    new: [],
    removed: [],
  };

  // Verificar bundles que mudaram ou continuam iguais
  for (const [bundle, oldHash] of Object.entries(oldHashes)) {
    if (newHashes[bundle]) {
      if (newHashes[bundle] === oldHash) {
        results.unchanged.push({ bundle, hash: oldHash });
      } else {
        results.changed.push({
          bundle,
          oldHash,
          newHash: newHashes[bundle]
        });
      }
    } else {
      results.removed.push({ bundle, hash: oldHash });
    }
  }

  // Verificar bundles novos
  for (const [bundle, newHash] of Object.entries(newHashes)) {
    if (!oldHashes[bundle]) {
      results.new.push({ bundle, hash: newHash });
    }
  }

  return results;
}

/**
 * Exibe resultados da comparação
 */
function displayResults(comparison) {
  console.log('');
  log('📊 RESULTADO DA VERIFICAÇÃO', colors.blue);
  console.log('='.repeat(60));
  console.log('');

  if (comparison.changed.length > 0) {
    success(`${comparison.changed.length} bundle(s) mudaram:`);
    for (const item of comparison.changed) {
      log(`  ${item.bundle}:`, colors.green);
      log(`    Old: ${item.oldHash}`, colors.gray);
      log(`    New: ${item.newHash}`, colors.green);
    }
    console.log('');
  }

  if (comparison.new.length > 0) {
    info(`${comparison.new.length} bundle(s) novos:`);
    for (const item of comparison.new) {
      log(`  ${item.bundle}: ${item.hash}`, colors.blue);
    }
    console.log('');
  }

  if (comparison.removed.length > 0) {
    warning(`${comparison.removed.length} bundle(s) removidos:`);
    for (const item of comparison.removed) {
      log(`  ${item.bundle}: ${item.hash}`, colors.yellow);
    }
    console.log('');
  }

  if (comparison.unchanged.length > 0) {
    error(`${comparison.unchanged.length} bundle(s) NÃO mudaram:`);
    for (const item of comparison.unchanged) {
      log(`  ${item.bundle}: ${item.hash}`, colors.red);
    }
    console.log('');
  }
}

/**
 * Parse argumentos CLI
 */
function parseArgs() {
  const args = {
    url1: null,
    url2: null,
    save: true,
    force: false,
  };

  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--url1=')) {
      args.url1 = arg.substring(7);
    } else if (arg.startsWith('--url2=')) {
      args.url2 = arg.substring(7);
    } else if (arg === '--no-save') {
      args.save = false;
    } else if (arg === '--force') {
      args.force = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  }

  return args;
}

/**
 * Exibe ajuda
 */
function printHelp() {
  console.log(`
📦 Bundle Hash Verifier - Verificador de Bundle Hash

USO:
  node scripts/verify-bundle-hash.js [options]

OPÇÕES:
  --url1=<url>     URL do deployment antigo (default: cache ou produção)
  --url2=<url>     URL do deployment novo (default: produção)
  --no-save        Não salvar hashes no cache
  --force          Ignorar cache e sempre comparar URLs
  --help, -h       Exibir esta ajuda

EXEMPLOS:
  # Verificar produção contra cache
  node scripts/verify-bundle-hash.js

  # Comparar dois deployments específicos
  node scripts/verify-bundle-hash.js \\
    --url1=https://old-deploy.vercel.app \\
    --url2=https://new-deploy.vercel.app

  # Verificar sem salvar no cache
  node scripts/verify-bundle-hash.js --no-save

  # Forçar verificação mesmo com cache
  node scripts/verify-bundle-hash.js --force

EXIT CODES:
  0 - Bundle hash mudou (✅ sucesso)
  1 - Bundle hash não mudou (❌ falha - possível cache)
  2 - Erro na execução

VARIÁVEIS DE AMBIENTE:
  VERCEL_URL       URL do deployment Vercel (auto-detectado em preview)
  DEBUG            Ativar logs de debug (DEBUG=1)
  `);
}

/**
 * Função principal
 */
async function verifyBundleHash() {
  const args = parseArgs();

  console.log('');
  log('🔍 VERIFICADOR DE BUNDLE HASH', colors.blue);
  console.log('='.repeat(60));
  console.log('');

  try {
    let oldHashes, newHashes;

    // Determinar URL1 (deployment antigo)
    if (args.url1) {
      info(`Buscando hashes de: ${args.url1}`);
      const { body } = await fetchPage(args.url1);
      oldHashes = extractBundleHashes(body);
    } else if (!args.force) {
      // Tentar carregar do cache
      const cache = loadCache();
      if (cache) {
        info(`Usando hashes do cache (${new Date(cache.timestamp).toLocaleString('pt-BR')})`);
        oldHashes = cache.hashes;
      } else {
        warning('Cache não encontrado, usando produção como baseline');
        info(`Buscando hashes de: ${CONFIG.productionUrl}`);
        const { body } = await fetchPage(CONFIG.productionUrl);
        oldHashes = extractBundleHashes(body);
      }
    } else {
      info(`Buscando hashes de: ${CONFIG.productionUrl}`);
      const { body } = await fetchPage(CONFIG.productionUrl);
      oldHashes = extractBundleHashes(body);
    }

    // Determinar URL2 (deployment novo)
    const url2 = args.url2 || CONFIG.productionUrl;
    info(`Buscando hashes de: ${url2}`);
    const { body } = await fetchPage(url2);
    newHashes = extractBundleHashes(body);

    // Verificar se encontrou hashes
    if (Object.keys(oldHashes).length === 0) {
      error('Nenhum bundle hash encontrado no deployment antigo');
      return 2;
    }

    if (Object.keys(newHashes).length === 0) {
      error('Nenhum bundle hash encontrado no deployment novo');
      return 2;
    }

    // Comparar hashes
    const comparison = compareHashes(oldHashes, newHashes);
    displayResults(comparison);

    // Salvar novo hash no cache (se solicitado)
    if (args.save) {
      saveCache({
        timestamp: new Date().toISOString(),
        url: url2,
        hashes: newHashes,
      });
      debug('Novos hashes salvos no cache');
    }

    // Determinar resultado
    console.log('='.repeat(60));

    const totalBundles = Object.keys(oldHashes).length;
    const changedOrNew = comparison.changed.length + comparison.new.length;

    if (changedOrNew > 0) {
      success(`\n✅ SUCESSO: ${changedOrNew} bundle(s) mudaram de ${totalBundles}`);
      success('Deploy reflete código novo (sem problemas de cache)');
      return 0;
    } else if (comparison.unchanged.length === totalBundles) {
      error(`\n❌ FALHA: NENHUM bundle mudou (${totalBundles} bundles)`);
      error('Possível problema de cache do Vercel!');
      console.log('');
      warning('RECOMENDAÇÕES:');
      warning('1. Verificar se código realmente mudou');
      warning('2. Tentar force rebuild: git commit --allow-empty');
      warning('3. Consultar: RUNBOOK_CACHE_DEPLOYMENT_ISSUES.md');
      return 1;
    } else {
      warning(`\n⚠️  PARCIAL: ${comparison.unchanged.length} bundles não mudaram`);
      warning('Alguns bundles podem estar em cache');
      return 1;
    }

  } catch (err) {
    console.log('');
    error(`\n❌ ERRO: ${err.message}`);
    if (process.env.DEBUG) {
      console.error(err);
    }
    return 2;
  }
}

// Executar verificação
if (require.main === module) {
  verifyBundleHash()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((err) => {
      error(`\n❌ Erro fatal: ${err.message}`);
      console.error(err);
      process.exit(2);
    });
}

module.exports = { verifyBundleHash, extractBundleHashes, compareHashes };
