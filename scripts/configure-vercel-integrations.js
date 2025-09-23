#!/usr/bin/env node

/**
 * Script para configurar as integrações no Vercel automaticamente
 * Execute: node scripts/configure-vercel-integrations.js
 */

const { execSync } = require('child_process');

const envVars = {
  // Sentry
  VITE_SENTRY_DSN: process.env.VITE_SENTRY_DSN || 'your_sentry_dsn_here',
  VITE_SENTRY_ORG: process.env.VITE_SENTRY_ORG || 'your_sentry_org_here',
  VITE_SENTRY_PROJECT: process.env.VITE_SENTRY_PROJECT || 'your_sentry_project_here',
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN || 'your_sentry_auth_token_here',
  
  // Clerk
  VITE_CLERK_PUBLISHABLE_KEY: process.env.VITE_CLERK_PUBLISHABLE_KEY || 'your_clerk_publishable_key_here',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'your_clerk_secret_key_here',
  
  // XAI
  VITE_XAI_API_KEY: process.env.VITE_XAI_API_KEY || 'your_xai_api_key_here',
  
  // Checkly
  CHECKLY_API_KEY: process.env.CHECKLY_API_KEY || 'your_checkly_api_key_here',
  CHECKLY_ACCOUNT_ID: process.env.CHECKLY_ACCOUNT_ID || 'your_checkly_account_id_here'
};

console.log('🔧 Configurando variáveis de ambiente no Vercel...\n');

const environments = ['production', 'preview', 'development'];

for (const [key, value] of Object.entries(envVars)) {
  console.log(`📝 Configurando ${key}...`);
  
  for (const env of environments) {
    try {
      const command = `echo "${value}" | vercel env add ${key} ${env}`;
      execSync(command, { stdio: 'pipe' });
      console.log(`   ✅ ${env}`);
    } catch (error) {
      console.log(`   ⚠️  ${env} - Variável já existe ou erro: ${error.message.split('\n')[0]}`);
    }
  }
  console.log('');
}

console.log('✅ Configuração concluída!');
console.log('\n📋 Próximos passos:');
console.log('1. Execute: npm run deploy');
console.log('2. Execute: npm run checkly:deploy');
console.log('3. Acesse https://vercel.com/dashboard para verificar');
console.log('4. Teste as integrações na página /integrations do seu app');
