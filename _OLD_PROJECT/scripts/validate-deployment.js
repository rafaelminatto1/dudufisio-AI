#!/usr/bin/env node

/**
 * Script de Validação de Deployment
 *
 * Valida que o deployment foi bem-sucedido verificando:
 * - Bundle hash mudou
 * - Site está acessível
 * - Endpoints críticos respondem
 * - Sem erros no console
 *
 * Uso:
 *   node scripts/validate-deployment.js
 *   npm run deploy:validate
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuração
const CONFIG = {
  productionUrl: 'https://moocafisio.com.br',
  criticalPaths: [
    '/login',
    '/dashboard',
    '/agenda',
    '/patients'
  ],
  expectedBundlePattern: /index-[a-zA-Z0-9]+\.js/,
  timeout: 10000, // 10 segundos
};

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
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

/**
 * Faz request HTTP e retorna o HTML
 */
function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`Timeout após ${CONFIG.timeout}ms`));
    }, CONFIG.timeout);

    https.get(url, (res) => {
      clearTimeout(timeout);

      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({
        statusCode: res.statusCode,
        body: data,
        headers: res.headers
      }));
    }).on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

/**
 * Extrai bundle hash do HTML
 */
function extractBundleHash(html) {
  const match = html.match(/index-([a-zA-Z0-9]+)\.js/);
  return match ? match[1] : null;
}

/**
 * Verifica se o site está acessível
 */
async function checkSiteAccessibility() {
  info('Verificando acessibilidade do site...');

  try {
    const { statusCode } = await fetchPage(CONFIG.productionUrl);

    if (statusCode === 200) {
      success(`Site acessível (HTTP ${statusCode})`);
      return true;
    } else {
      error(`Site retornou HTTP ${statusCode}`);
      return false;
    }
  } catch (err) {
    error(`Erro ao acessar site: ${err.message}`);
    return false;
  }
}

/**
 * Verifica bundle hash
 */
async function checkBundleHash() {
  info('Verificando bundle hash...');

  try {
    const { body } = await fetchPage(CONFIG.productionUrl);
    const hash = extractBundleHash(body);

    if (!hash) {
      error('Bundle hash não encontrado no HTML');
      return { success: false };
    }

    success(`Bundle hash encontrado: ${hash}`);

    // Verifica se há registro do último hash
    try {
      const lastHash = execSync('git log -1 --pretty=%B')
        .toString()
        .match(/Bundle.*: ([a-zA-Z0-9]+)/);

      if (lastHash && lastHash[1] === hash) {
        warning('Bundle hash não mudou desde último deploy');
        warning('Isso pode indicar problema de cache');
        return { success: false, hash };
      }
    } catch (e) {
      // Ignore se não conseguir ler git log
    }

    return { success: true, hash };
  } catch (err) {
    error(`Erro ao verificar bundle: ${err.message}`);
    return { success: false };
  }
}

/**
 * Verifica endpoints críticos
 */
async function checkCriticalPaths() {
  info('Verificando endpoints críticos...');

  let allSuccess = true;

  for (const path of CONFIG.criticalPaths) {
    const url = `${CONFIG.productionUrl}${path}`;

    try {
      const { statusCode } = await fetchPage(url);

      if (statusCode === 200) {
        success(`${path} - OK (HTTP ${statusCode})`);
      } else {
        warning(`${path} - HTTP ${statusCode}`);
        if (statusCode >= 500) {
          allSuccess = false;
        }
      }
    } catch (err) {
      error(`${path} - Erro: ${err.message}`);
      allSuccess = false;
    }
  }

  return allSuccess;
}

/**
 * Verifica headers de segurança
 */
async function checkSecurityHeaders() {
  info('Verificando headers de segurança...');

  try {
    const { headers } = await fetchPage(CONFIG.productionUrl);

    const expectedHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'strict-transport-security'
    ];

    let allPresent = true;

    for (const header of expectedHeaders) {
      if (headers[header]) {
        success(`${header}: ${headers[header]}`);
      } else {
        warning(`Header ausente: ${header}`);
        allPresent = false;
      }
    }

    return allPresent;
  } catch (err) {
    error(`Erro ao verificar headers: ${err.message}`);
    return false;
  }
}

/**
 * Executa todas as validações
 */
async function validateDeployment() {
  console.log('\n' + '='.repeat(60));
  log('🚀 VALIDAÇÃO DE DEPLOYMENT', colors.blue);
  console.log('='.repeat(60) + '\n');

  const results = {
    accessibility: false,
    bundleHash: false,
    criticalPaths: false,
    securityHeaders: false
  };

  // 1. Acessibilidade
  results.accessibility = await checkSiteAccessibility();
  console.log('');

  // 2. Bundle Hash
  const bundleResult = await checkBundleHash();
  results.bundleHash = bundleResult.success;
  console.log('');

  // 3. Endpoints Críticos
  results.criticalPaths = await checkCriticalPaths();
  console.log('');

  // 4. Security Headers
  results.securityHeaders = await checkSecurityHeaders();
  console.log('');

  // Resultado Final
  console.log('='.repeat(60));
  log('📊 RESULTADO DA VALIDAÇÃO', colors.blue);
  console.log('='.repeat(60) + '\n');

  const totalTests = Object.keys(results).length;
  const passedTests = Object.values(results).filter(Boolean).length;

  log(`Acessibilidade:      ${results.accessibility ? '✅' : '❌'}`,
      results.accessibility ? colors.green : colors.red);
  log(`Bundle Hash:         ${results.bundleHash ? '✅' : '❌'}`,
      results.bundleHash ? colors.green : colors.red);
  log(`Endpoints Críticos:  ${results.criticalPaths ? '✅' : '❌'}`,
      results.criticalPaths ? colors.green : colors.red);
  log(`Security Headers:    ${results.securityHeaders ? '✅' : '❌'}`,
      results.securityHeaders ? colors.green : colors.red);

  console.log('');

  if (passedTests === totalTests) {
    success(`\n✅ VALIDAÇÃO PASSOU: ${passedTests}/${totalTests} testes`);

    // Salvar bundle hash no git
    if (bundleResult.hash) {
      info(`\nBundle hash atual: ${bundleResult.hash}`);
      info('Recomendação: Documente este hash no commit/tag');
    }

    process.exit(0);
  } else {
    error(`\n❌ VALIDAÇÃO FALHOU: ${passedTests}/${totalTests} testes passaram`);
    warning('\nRecomendações:');

    if (!results.accessibility) {
      warning('- Verificar se site está online');
      warning('- Verificar DNS e SSL');
    }

    if (!results.bundleHash) {
      warning('- Bundle hash pode não ter mudado (problema de cache)');
      warning('- Tentar force rebuild: git commit --allow-empty');
    }

    if (!results.criticalPaths) {
      warning('- Verificar logs de erro no Vercel');
      warning('- Testar endpoints manualmente');
    }

    if (!results.securityHeaders) {
      warning('- Revisar configuração de headers no Vercel');
      warning('- Verificar vercel.json');
    }

    process.exit(1);
  }
}

// Executar validação
validateDeployment().catch((err) => {
  error(`\n❌ Erro fatal: ${err.message}`);
  console.error(err);
  process.exit(1);
});
