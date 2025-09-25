#!/usr/bin/env node

/**
 * Script para testar integrações Vercel configuradas
 * DuduFisio-AI - Sistema de Comunicação Omnichannel
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🧪 DuduFisio-AI - Teste de Integrações Vercel\n');

// Configuração de testes
const INTEGRATION_TESTS = [
  {
    name: 'Upstash Redis',
    envVars: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN'],
    test: testUpstashRedis
  },
  {
    name: 'Sentry',
    envVars: ['SENTRY_DSN'],
    test: testSentry
  },
  {
    name: 'Resend',
    envVars: ['RESEND_API_KEY'],
    test: testResend
  },
  {
    name: 'Vercel Analytics',
    envVars: ['VERCEL_ANALYTICS_ID'],
    test: testVercelAnalytics
  },
  {
    name: 'Vercel Blob',
    envVars: ['BLOB_READ_WRITE_TOKEN'],
    test: testVercelBlob
  }
];

function loadEnvironmentVariables() {
  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.log('❌ Arquivo .env.local não encontrado');
    console.log('💡 Execute: vercel env pull .env.local');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && !key.startsWith('#')) {
      envVars[key.trim()] = valueParts.join('=').trim();
    }
  });

  return envVars;
}

async function testUpstashRedis(envVars) {
  const url = envVars.UPSTASH_REDIS_REST_URL;
  const token = envVars.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    return { success: false, error: 'Variáveis de ambiente não configuradas' };
  }

  try {
    // Teste básico de ping
    const response = await fetch(`${url}/ping`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const result = await response.text();
      return {
        success: true,
        message: `Redis respondeu: ${result}`,
        details: { url: url.replace(/\/\/.*@/, '//***@') }
      };
    } else {
      return {
        success: false,
        error: `HTTP ${response.status}: ${response.statusText}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testSentry(envVars) {
  const dsn = envVars.SENTRY_DSN;

  if (!dsn) {
    return { success: false, error: 'SENTRY_DSN não configurado' };
  }

  try {
    // Validar formato do DSN
    const url = new URL(dsn);

    if (!url.hostname.includes('sentry.io')) {
      return { success: false, error: 'DSN não parece ser do Sentry' };
    }

    return {
      success: true,
      message: 'DSN válido',
      details: {
        host: url.hostname,
        project: url.pathname.split('/').pop()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: `DSN inválido: ${error.message}`
    };
  }
}

async function testResend(envVars) {
  const apiKey = envVars.RESEND_API_KEY;

  if (!apiKey) {
    return { success: false, error: 'RESEND_API_KEY não configurado' };
  }

  try {
    // Teste de validação da API key
    const response = await fetch('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    if (response.ok) {
      const domains = await response.json();
      return {
        success: true,
        message: `API key válida. ${domains.data?.length || 0} domínios configurados`,
        details: { domains: domains.data?.map(d => d.name) || [] }
      };
    } else {
      return {
        success: false,
        error: `API key inválida: HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function testVercelAnalytics(envVars) {
  const analyticsId = envVars.VERCEL_ANALYTICS_ID;

  if (!analyticsId) {
    return {
      success: false,
      error: 'VERCEL_ANALYTICS_ID não configurado. Ative em: https://vercel.com/analytics'
    };
  }

  return {
    success: true,
    message: 'Analytics ID configurado',
    details: { id: analyticsId }
  };
}

async function testVercelBlob(envVars) {
  const token = envVars.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    return {
      success: false,
      error: 'BLOB_READ_WRITE_TOKEN não configurado. Ative em: https://vercel.com/storage/blob'
    };
  }

  try {
    // Teste básico de acesso ao blob storage
    const response = await fetch('https://blob.vercel-storage.com/', {
      method: 'HEAD',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.status === 200 || response.status === 405) {
      // 405 Method Not Allowed é esperado para HEAD request
      return {
        success: true,
        message: 'Blob token válido',
        details: { tokenPrefix: token.substring(0, 10) + '...' }
      };
    } else {
      return {
        success: false,
        error: `Token inválido: HTTP ${response.status}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

function checkPackageDependencies() {
  console.log('📦 Verificando dependências dos pacotes...');

  const packageJsonPath = path.join(process.cwd(), 'package.json');

  if (!fs.existsSync(packageJsonPath)) {
    console.log('❌ package.json não encontrado');
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  const requiredPackages = [
    '@vercel/analytics',
    '@vercel/speed-insights',
    '@sentry/nextjs',
    'resend',
    '@vercel/blob'
  ];

  const missingPackages = requiredPackages.filter(pkg => !dependencies[pkg]);

  if (missingPackages.length > 0) {
    console.log('⚠️  Pacotes faltando:');
    missingPackages.forEach(pkg => {
      console.log(`   - ${pkg}`);
    });
    console.log('\n💡 Para instalar:');
    console.log(`   npm install ${missingPackages.join(' ')}`);
    return false;
  }

  console.log('✅ Todas as dependências estão instaladas');
  return true;
}

function generateIntegrationSummary(results) {
  console.log('\n📊 RESUMO DOS TESTES');
  console.log('=' .repeat(50));

  const successful = results.filter(r => r.success).length;
  const total = results.length;

  console.log(`\n🎯 Status: ${successful}/${total} integrações funcionando`);

  if (successful === total) {
    console.log('🎉 Todas as integrações estão funcionando corretamente!');
  } else {
    console.log('⚠️  Algumas integrações precisam de configuração');
  }

  console.log('\n📋 Detalhes:');
  results.forEach(result => {
    const status = result.success ? '✅' : '❌';
    console.log(`${status} ${result.name}`);

    if (result.success && result.details) {
      Object.entries(result.details).forEach(([key, value]) => {
        console.log(`   📄 ${key}: ${Array.isArray(value) ? value.join(', ') : value}`);
      });
    } else if (!result.success) {
      console.log(`   ❌ ${result.error}`);
    }
  });

  return successful === total;
}

function generateNextSteps(allWorking, results) {
  console.log('\n🚀 PRÓXIMOS PASSOS');
  console.log('=' .repeat(50));

  if (allWorking) {
    console.log('\n✅ Sistema pronto para uso!');
    console.log('\n📋 Você pode agora:');
    console.log('1. 🧪 Testar sistema de comunicação: npm test tests/communication/');
    console.log('2. 🚀 Fazer deploy: vercel --prod');
    console.log('3. 📊 Monitorar métricas no dashboard');
    console.log('4. 📧 Configurar templates de mensagem');
    console.log('5. 🤖 Criar regras de automação');
  } else {
    console.log('\n⚠️  Configurações pendentes:');

    const failed = results.filter(r => !r.success);
    failed.forEach(result => {
      console.log(`\n${result.name}:`);
      console.log(`   ❌ Problema: ${result.error}`);

      // Sugestões específicas por integração
      if (result.name === 'Upstash Redis') {
        console.log('   💡 Solução: https://vercel.com/marketplace/upstash');
      } else if (result.name === 'Sentry') {
        console.log('   💡 Solução: https://vercel.com/marketplace/sentry');
      } else if (result.name === 'Resend') {
        console.log('   💡 Solução: https://vercel.com/marketplace/resend');
      } else if (result.name === 'Vercel Analytics') {
        console.log('   💡 Solução: https://vercel.com/analytics');
      } else if (result.name === 'Vercel Blob') {
        console.log('   💡 Solução: https://vercel.com/storage/blob');
      }
    });

    console.log('\n🔄 Após configurar, execute novamente:');
    console.log('   vercel env pull .env.local');
    console.log('   node scripts/test-vercel-integrations.js');
  }
}

async function main() {
  console.log('Iniciando testes de integrações...\n');

  // 1. Verificar dependências
  const depsOk = checkPackageDependencies();
  if (!depsOk) {
    console.log('\n⚠️  Instale as dependências primeiro e execute novamente');
    return;
  }

  // 2. Carregar variáveis de ambiente
  const envVars = loadEnvironmentVariables();
  if (Object.keys(envVars).length === 0) {
    return;
  }

  console.log('🔍 Testando integrações configuradas...\n');

  // 3. Executar testes
  const results = [];

  for (const integration of INTEGRATION_TESTS) {
    console.log(`🧪 Testando ${integration.name}...`);

    const hasRequiredVars = integration.envVars.every(varName => envVars[varName]);

    if (!hasRequiredVars) {
      results.push({
        name: integration.name,
        success: false,
        error: `Variáveis necessárias não encontradas: ${integration.envVars.join(', ')}`
      });
      console.log(`   ❌ Variáveis não configuradas`);
      continue;
    }

    try {
      const result = await integration.test(envVars);
      result.name = integration.name;
      results.push(result);

      if (result.success) {
        console.log(`   ✅ ${result.message}`);
      } else {
        console.log(`   ❌ ${result.error}`);
      }
    } catch (error) {
      results.push({
        name: integration.name,
        success: false,
        error: error.message
      });
      console.log(`   ❌ Erro no teste: ${error.message}`);
    }
  }

  // 4. Gerar resumo
  const allWorking = generateIntegrationSummary(results);

  // 5. Próximos passos
  generateNextSteps(allWorking, results);

  console.log('\n📖 Documentação: docs/minatto/VERCEL_INTEGRATIONS.md');
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { INTEGRATION_TESTS, loadEnvironmentVariables };