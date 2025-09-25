#!/usr/bin/env node

/**
 * Script para automatizar configuração de integrações Vercel
 * DuduFisio-AI - Sistema de Comunicação Omnichannel
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 DuduFisio-AI - Setup Vercel Integrations\n');

// Configurações do projeto
const PROJECT_CONFIG = {
  name: 'dudufisio-ai',
  teamId: 'team_RWPxV6A0gp02a6FO7Ghf2YSV',
  projectId: 'prj_lJT0yis7pFVJASeoHaykO6A1U7kz'
};

// Integrações recomendadas
const RECOMMENDED_INTEGRATIONS = [
  {
    name: 'Upstash Redis',
    id: 'upstash',
    description: 'Serverless Redis para filas de mensagens',
    url: 'https://vercel.com/marketplace/upstash',
    priority: 1,
    envVars: ['UPSTASH_REDIS_REST_URL', 'UPSTASH_REDIS_REST_TOKEN']
  },
  {
    name: 'Sentry',
    id: 'sentry',
    description: 'Error tracking e monitoring',
    url: 'https://vercel.com/marketplace/sentry',
    priority: 2,
    envVars: ['SENTRY_DSN', 'SENTRY_ORG', 'SENTRY_PROJECT']
  },
  {
    name: 'Resend',
    id: 'resend',
    description: 'Email delivery service',
    url: 'https://vercel.com/marketplace/resend',
    priority: 3,
    envVars: ['RESEND_API_KEY']
  },
  {
    name: 'Vercel Analytics',
    id: 'analytics',
    description: 'Web analytics nativo',
    url: 'https://vercel.com/analytics',
    priority: 4,
    envVars: ['VERCEL_ANALYTICS_ID']
  },
  {
    name: 'Vercel Blob',
    id: 'blob',
    description: 'Object storage para arquivos',
    url: 'https://vercel.com/storage/blob',
    priority: 5,
    envVars: ['BLOB_READ_WRITE_TOKEN']
  }
];

function executeCommand(command, description) {
  try {
    console.log(`⚙️  ${description}...`);
    const result = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    console.log(`✅ ${description} - Concluído`);
    return result;
  } catch (error) {
    console.log(`❌ ${description} - Erro:`, error.message);
    return null;
  }
}

function checkVercelCLI() {
  console.log('🔍 Verificando Vercel CLI...');

  try {
    const version = execSync('vercel --version', { encoding: 'utf8' });
    console.log(`✅ Vercel CLI encontrado: ${version.trim()}`);
    return true;
  } catch (error) {
    console.log('❌ Vercel CLI não encontrado');
    console.log('📥 Instale com: npm install -g vercel');
    return false;
  }
}

function checkProjectConnection() {
  console.log('🔗 Verificando conexão com projeto...');

  try {
    const projectInfo = execSync('vercel project ls', { encoding: 'utf8' });
    if (projectInfo.includes(PROJECT_CONFIG.name)) {
      console.log(`✅ Projeto ${PROJECT_CONFIG.name} encontrado`);
      return true;
    } else {
      console.log(`❌ Projeto ${PROJECT_CONFIG.name} não encontrado`);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao verificar projetos:', error.message);
    return false;
  }
}

function pullEnvironmentVariables() {
  console.log('📥 Sincronizando variáveis de ambiente...');

  const result = executeCommand(
    'vercel env pull .env.local',
    'Pull de variáveis de ambiente'
  );

  if (result) {
    console.log('✅ Variáveis de ambiente sincronizadas em .env.local');
  }

  return result !== null;
}

function checkExistingIntegrations() {
  console.log('🔍 Verificando integrações existentes...');

  const envPath = path.join(process.cwd(), '.env.local');

  if (!fs.existsSync(envPath)) {
    console.log('⚠️  Arquivo .env.local não encontrado');
    return {};
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const existingIntegrations = {};

  RECOMMENDED_INTEGRATIONS.forEach(integration => {
    const hasAllVars = integration.envVars.every(envVar =>
      envContent.includes(envVar)
    );

    existingIntegrations[integration.id] = {
      installed: hasAllVars,
      vars: integration.envVars.filter(envVar => envContent.includes(envVar))
    };

    if (hasAllVars) {
      console.log(`✅ ${integration.name} - Configurado`);
    } else {
      console.log(`⚠️  ${integration.name} - Não configurado`);
    }
  });

  return existingIntegrations;
}

function generateInstallationGuide(existingIntegrations) {
  console.log('\n📋 GUIA DE INSTALAÇÃO MANUAL');
  console.log('=' .repeat(50));

  const toInstall = RECOMMENDED_INTEGRATIONS.filter(
    integration => !existingIntegrations[integration.id]?.installed
  );

  if (toInstall.length === 0) {
    console.log('🎉 Todas as integrações recomendadas já estão configuradas!');
    return;
  }

  console.log('\n🚀 Integrações para instalar:');

  toInstall.forEach((integration, index) => {
    console.log(`\n${index + 1}. ${integration.name}`);
    console.log(`   📝 ${integration.description}`);
    console.log(`   🔗 ${integration.url}`);
    console.log(`   📋 Passos:`);
    console.log(`      1. Acesse: ${integration.url}`);
    console.log(`      2. Clique em "Add Integration"`);
    console.log(`      3. Selecione o projeto: ${PROJECT_CONFIG.name}`);
    console.log(`      4. Complete a configuração`);
    console.log(`   🔧 Variáveis esperadas: ${integration.envVars.join(', ')}`);
  });

  console.log('\n⚡ LINKS RÁPIDOS:');
  console.log('Dashboard Vercel:', `https://vercel.com/dashboard`);
  console.log('Marketplace:', 'https://vercel.com/marketplace');
  console.log('Projeto:', `https://vercel.com/rafael-minattos-projects/dudufisio-ai`);
}

function updateCommunicationConfig(existingIntegrations) {
  console.log('\n🔧 Atualizando configuração do sistema de comunicação...');

  // Atualizar MessageBus para usar Upstash se disponível
  if (existingIntegrations.upstash?.installed) {
    const messageBusPath = path.join(process.cwd(), 'lib/communication/core/MessageBus.ts');

    if (fs.existsSync(messageBusPath)) {
      let content = fs.readFileSync(messageBusPath, 'utf8');

      // Atualizar configuração do Redis
      const redisConfigUpdate = `
  // Configuração Redis via Upstash (Vercel Integration)
  const redisConfig = {
    url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
    // Fallback para configuração local
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0')
  };`;

      // Se não existe a configuração, adicionar
      if (!content.includes('UPSTASH_REDIS_REST_URL')) {
        content = content.replace(
          /redisUrl: ['"`][^'"`]*['"`]/,
          'redisUrl: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL'
        );

        fs.writeFileSync(messageBusPath, content, 'utf8');
        console.log('✅ MessageBus atualizado para usar Upstash Redis');
      }
    }
  }

  // Atualizar EmailChannel para usar Resend se disponível
  if (existingIntegrations.resend?.installed) {
    const emailChannelPath = path.join(process.cwd(), 'lib/communication/channels/EmailChannel.ts');

    if (fs.existsSync(emailChannelPath)) {
      console.log('✅ EmailChannel pode ser atualizado para usar Resend API');
      console.log('   📝 Veja documentação em: docs/minatto/VERCEL_INTEGRATIONS.md');
    }
  }
}

function generateEnvTemplate(existingIntegrations) {
  console.log('\n📄 Gerando template de .env...');

  const envTemplate = `# ===== VERCEL INTEGRATIONS =====
# Configurado automaticamente via Vercel Marketplace

# Upstash Redis (Para filas de mensagens)
${existingIntegrations.upstash?.installed ? '# ✅ Configurado' : '# ⚠️  Configure via: https://vercel.com/marketplace/upstash'}
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token
KV_REST_API_URL=\${UPSTASH_REDIS_REST_URL}
KV_REST_API_TOKEN=\${UPSTASH_REDIS_REST_TOKEN}

# Sentry (Error tracking)
${existingIntegrations.sentry?.installed ? '# ✅ Configurado' : '# ⚠️  Configure via: https://vercel.com/marketplace/sentry'}
SENTRY_DSN=https://key@sentry.io/project
SENTRY_ORG=your-org
SENTRY_PROJECT=dudufisio-ai

# Resend (Email delivery)
${existingIntegrations.resend?.installed ? '# ✅ Configurado' : '# ⚠️  Configure via: https://vercel.com/marketplace/resend'}
RESEND_API_KEY=re_your-api-key

# Vercel Analytics (Web analytics)
${existingIntegrations.analytics?.installed ? '# ✅ Configurado' : '# ⚠️  Configure via: https://vercel.com/analytics'}
VERCEL_ANALYTICS_ID=analytics-id

# Vercel Blob (File storage)
${existingIntegrations.blob?.installed ? '# ✅ Configurado' : '# ⚠️  Configure via: https://vercel.com/storage/blob'}
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_token

# ===== SYSTEM CONFIGURATION =====
# Use Redis from Upstash for communication system
REDIS_URL=\${UPSTASH_REDIS_REST_URL}
REDIS_TOKEN=\${UPSTASH_REDIS_REST_TOKEN}

# Email provider (resend or smtp)
EMAIL_PROVIDER=resend
EMAIL_FROM=noreply@fisioflow.com
EMAIL_FROM_NAME=FisioFlow
`;

  const templatePath = path.join(process.cwd(), '.env.vercel.template');
  fs.writeFileSync(templatePath, envTemplate, 'utf8');

  console.log('✅ Template salvo em: .env.vercel.template');
}

function main() {
  console.log('Iniciando setup das integrações Vercel...\n');

  // 1. Verificar pré-requisitos
  if (!checkVercelCLI()) {
    process.exit(1);
  }

  // 2. Verificar conexão com projeto
  if (!checkProjectConnection()) {
    console.log('\n🔗 Para conectar ao projeto:');
    console.log('   vercel link');
    console.log('   Selecione: rafael-minattos-projects/dudufisio-ai');
  }

  // 3. Sincronizar variáveis de ambiente
  pullEnvironmentVariables();

  // 4. Verificar integrações existentes
  const existingIntegrations = checkExistingIntegrations();

  // 5. Gerar guia de instalação
  generateInstallationGuide(existingIntegrations);

  // 6. Atualizar configuração do sistema
  updateCommunicationConfig(existingIntegrations);

  // 7. Gerar template de environment
  generateEnvTemplate(existingIntegrations);

  console.log('\n🎉 Setup concluído!');
  console.log('\n📚 Próximos passos:');
  console.log('1. Instale as integrações pendentes via Dashboard Vercel');
  console.log('2. Execute: vercel env pull .env.local');
  console.log('3. Execute: node scripts/setup-vercel-integrations.js (novamente)');
  console.log('4. Teste o sistema de comunicação');

  console.log('\n📖 Documentação completa: docs/minatto/VERCEL_INTEGRATIONS.md');
}

// Executar script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export {
  PROJECT_CONFIG,
  RECOMMENDED_INTEGRATIONS,
  checkExistingIntegrations,
  pullEnvironmentVariables
};