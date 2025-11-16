#!/usr/bin/env node

/**
 * Script de Validação de Setup do Sentry
 *
 * Valida que o Sentry está configurado corretamente e recebendo eventos.
 *
 * Uso:
 *   node scripts/validate-sentry-setup.js
 *   npm run sentry:validate
 *
 * Exit Codes:
 *   0 - Sentry configurado corretamente
 *   1 - Sentry não configurado ou com problemas
 *   2 - Erro na execução
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
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
 * Verifica se DSN está configurado no .env
 */
function checkEnvConfig() {
  info('Verificando variáveis de ambiente...');

  const envFiles = ['.env', '.env.local', '.env.production'];
  let dsnFound = false;
  let envFound = false;

  for (const file of envFiles) {
    const envPath = path.join(process.cwd(), file);

    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');

      if (content.includes('VITE_SENTRY_DSN')) {
        const match = content.match(/VITE_SENTRY_DSN=(.+)/);
        if (match && match[1] && !match[1].includes('your-') && match[1].trim().length > 0) {
          success(`DSN encontrado em ${file}`);
          dsnFound = true;
        }
      }

      if (content.includes('VITE_SENTRY_ENV')) {
        success(`SENTRY_ENV encontrado em ${file}`);
        envFound = true;
      }
    }
  }

  if (!dsnFound) {
    error('VITE_SENTRY_DSN não encontrado ou inválido');
    warning('Configure VITE_SENTRY_DSN no .env.production');
    return false;
  }

  if (!envFound) {
    warning('VITE_SENTRY_ENV não configurado (usando padrão)');
  }

  return true;
}

/**
 * Verifica se Sentry está instalado
 */
function checkSentryInstallation() {
  info('Verificando instalação do Sentry...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    error('package.json não encontrado');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

  const dependencies = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  const requiredPackages = ['@sentry/react', '@sentry/vite-plugin'];
  let allInstalled = true;

  for (const pkg of requiredPackages) {
    if (dependencies[pkg]) {
      success(`${pkg} instalado (${dependencies[pkg]})`);
    } else {
      error(`${pkg} não instalado`);
      allInstalled = false;
    }
  }

  if (!allInstalled) {
    warning('Execute: npm install @sentry/react @sentry/vite-plugin');
    return false;
  }

  return true;
}

/**
 * Verifica se Sentry está inicializado no código
 */
function checkSentryInit() {
  info('Verificando inicialização do Sentry...');

  // Procurar por Sentry.init() no código
  const searchPaths = [
    'src/main.tsx',
    'src/main.ts',
    'src/App.tsx',
    'src/index.tsx',
    'packages/host/src/main.tsx',
  ];

  let initFound = false;

  for (const filePath of searchPaths) {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      if (content.includes('Sentry.init')) {
        success(`Sentry.init() encontrado em ${filePath}`);
        initFound = true;

        // Verificar configurações importantes
        if (content.includes('environment:')) {
          success('  ↳ environment configurado');
        } else {
          warning('  ↳ environment não configurado');
        }

        if (content.includes('release:')) {
          success('  ↳ release tracking configurado');
        } else {
          warning('  ↳ release tracking não configurado (recomendado)');
        }

        if (content.includes('tracesSampleRate:')) {
          success('  ↳ tracesSampleRate configurado');
        } else {
          warning('  ↳ tracesSampleRate não configurado');
        }

        break;
      }
    }
  }

  if (!initFound) {
    error('Sentry.init() não encontrado no código');
    warning('Adicione Sentry.init() no main.tsx ou App.tsx');
    return false;
  }

  return true;
}

/**
 * Verifica se Sentry plugin está no Vite config
 */
function checkViteConfig() {
  info('Verificando configuração do Vite...');

  const viteConfigPaths = [
    'vite.config.ts',
    'vite.config.js',
    'packages/host/vite.config.ts',
  ];

  let pluginFound = false;

  for (const filePath of viteConfigPaths) {
    const fullPath = path.join(process.cwd(), filePath);

    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      if (content.includes('@sentry/vite-plugin')) {
        success(`Sentry plugin encontrado em ${filePath}`);
        pluginFound = true;

        // Verificar configurações do plugin
        if (content.includes('authToken:')) {
          success('  ↳ authToken configurado');
        } else {
          warning('  ↳ authToken não configurado (necessário para source maps)');
        }

        if (content.includes('org:')) {
          success('  ↳ org configurado');
        }

        if (content.includes('project:')) {
          success('  ↳ project configurado');
        }

        break;
      }
    }
  }

  if (!pluginFound) {
    warning('Sentry Vite plugin não encontrado');
    warning('Recomendado para upload de source maps');
    info('Adicione ao vite.config.ts:');
    console.log(`
    import { sentryVitePlugin } from '@sentry/vite-plugin';

    export default defineConfig({
      plugins: [
        sentryVitePlugin({
          org: 'moocafisio',
          project: 'dudufisio-ai',
          authToken: process.env.SENTRY_AUTH_TOKEN,
        }),
      ],
    });
    `);
    // Não é crítico, então não retorna false
  }

  return true;
}

/**
 * Testa envio de evento para Sentry
 */
async function testSentryEvent() {
  info('Testando envio de evento...');

  try {
    // Carregar variáveis de ambiente
    const envPath = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/VITE_SENTRY_DSN=(.+)/);
      if (match && match[1]) {
        process.env.VITE_SENTRY_DSN = match[1].trim();
      }
    }

    // Importar e inicializar Sentry
    const Sentry = require('@sentry/react');

    Sentry.init({
      dsn: process.env.VITE_SENTRY_DSN,
      environment: 'test',
      tracesSampleRate: 0,
    });

    // Enviar evento de teste
    const eventId = Sentry.captureMessage('Sentry monitoring validation test', {
      level: 'info',
      tags: {
        test: true,
        script: 'validate-sentry-setup',
      },
    });

    await Sentry.flush(2000);

    success('Evento de teste enviado');
    info(`Event ID: ${eventId}`);
    console.log('');
    info('Verifique em: https://sentry.io/organizations/moocafisio/issues/');
    info('Procure por: "Sentry monitoring validation test"');
    console.log('');

    return true;
  } catch (err) {
    error(`Erro ao testar envio: ${err.message}`);
    warning('Verifique se VITE_SENTRY_DSN está correto');
    return false;
  }
}

/**
 * Exibe recomendações de configuração
 */
function displayRecommendations(results) {
  console.log('');
  log('📋 RECOMENDAÇÕES', colors.blue);
  console.log('='.repeat(60));
  console.log('');

  if (!results.env) {
    log('1. Configurar VITE_SENTRY_DSN no .env.production', colors.yellow);
    console.log('   Obtenha o DSN em: https://sentry.io/settings/moocafisio/projects/dudufisio-ai/keys/');
    console.log('');
  }

  if (!results.installation) {
    log('2. Instalar pacotes do Sentry', colors.yellow);
    console.log('   npm install @sentry/react @sentry/vite-plugin');
    console.log('');
  }

  if (!results.init) {
    log('3. Inicializar Sentry no código', colors.yellow);
    console.log('   Adicione Sentry.init() no src/main.tsx');
    console.log('');
  }

  if (results.env && results.installation && results.init) {
    log('✅ Setup básico completo!', colors.green);
    console.log('');
    log('Próximos passos:', colors.blue);
    console.log('1. Configurar alertas: Ver SENTRY_MONITORING_SETUP.md');
    console.log('2. Configurar integrações (Slack, GitHub)');
    console.log('3. Criar dashboard de monitoramento');
    console.log('4. Testar alertas enviando erro de teste');
    console.log('');
  }
}

/**
 * Função principal
 */
async function validateSentrySetup() {
  console.log('');
  log('🔍 VALIDAÇÃO DE SETUP DO SENTRY', colors.blue);
  console.log('='.repeat(60));
  console.log('');

  const results = {
    env: false,
    installation: false,
    init: false,
    viteConfig: false,
    testEvent: false,
  };

  try {
    // 1. Verificar .env
    results.env = checkEnvConfig();
    console.log('');

    // 2. Verificar instalação
    results.installation = checkSentryInstallation();
    console.log('');

    // 3. Verificar inicialização
    results.init = checkSentryInit();
    console.log('');

    // 4. Verificar Vite config
    results.viteConfig = checkViteConfig();
    console.log('');

    // 5. Testar evento (se configuração básica OK)
    if (results.env && results.installation && results.init) {
      results.testEvent = await testSentryEvent();
    } else {
      warning('Pulando teste de evento (configuração incompleta)');
      console.log('');
    }

    // Resultado final
    console.log('='.repeat(60));
    log('📊 RESULTADO DA VALIDAÇÃO', colors.blue);
    console.log('='.repeat(60));
    console.log('');

    const checks = [
      { name: 'Variáveis de Ambiente', result: results.env },
      { name: 'Instalação', result: results.installation },
      { name: 'Inicialização', result: results.init },
      { name: 'Vite Config', result: results.viteConfig },
      { name: 'Teste de Evento', result: results.testEvent },
    ];

    for (const check of checks) {
      const icon = check.result ? '✅' : '❌';
      const color = check.result ? colors.green : colors.red;
      log(`${icon} ${check.name}`, color);
    }

    console.log('');

    const totalChecks = Object.keys(results).length;
    const passedChecks = Object.values(results).filter(Boolean).length;

    if (passedChecks === totalChecks) {
      success(`\n✅ SUCESSO: Sentry configurado corretamente (${passedChecks}/${totalChecks})`);
      info('\nPróximos passos:');
      info('1. Consultar: SENTRY_MONITORING_SETUP.md');
      info('2. Configurar alertas no Sentry Dashboard');
      info('3. Integrar com Slack e GitHub');
      return 0;
    } else if (passedChecks >= 3) {
      warning(`\n⚠️  PARCIAL: ${passedChecks}/${totalChecks} checks passaram`);
      displayRecommendations(results);
      return 0; // Setup mínimo OK
    } else {
      error(`\n❌ FALHA: ${passedChecks}/${totalChecks} checks passaram`);
      displayRecommendations(results);
      return 1;
    }

  } catch (err) {
    console.log('');
    error(`\n❌ Erro fatal: ${err.message}`);
    console.error(err);
    return 2;
  }
}

// Executar validação
if (require.main === module) {
  validateSentrySetup()
    .then((exitCode) => {
      process.exit(exitCode);
    })
    .catch((err) => {
      error(`\n❌ Erro fatal: ${err.message}`);
      console.error(err);
      process.exit(2);
    });
}

module.exports = { validateSentrySetup };
