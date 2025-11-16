/**
 * Script para configurar variáveis do Sentry na Vercel
 */

const { execSync } = require('child_process');
const readline = require('readline');

console.log('🔧 Configurando Sentry na Vercel...\n');

const SENTRY_DSN = "https://a5c9487ee708b10ac7fe4ac2faefa088@o4510069182955520.ingest.us.sentry.io/4510270702878720";

const envVars = [
  {
    name: 'VITE_SENTRY_DSN',
    value: SENTRY_DSN,
    environments: ['production', 'preview', 'development']
  },
  {
    name: 'VITE_APP_VERSION',
    value: '1.0.0',
    environments: ['production', 'preview', 'development']
  }
];

console.log('📝 Variáveis a serem configuradas:');
envVars.forEach(env => {
  console.log(`  - ${env.name}`);
  console.log(`    Valor: ${env.value.substring(0, 50)}...`);
  console.log(`    Ambientes: ${env.environments.join(', ')}`);
  console.log('');
});

console.log('⚠️  IMPORTANTE: Execute estes comandos manualmente:\n');

envVars.forEach(env => {
  env.environments.forEach(environment => {
    console.log(`# ${env.name} - ${environment}`);
    console.log(`vercel env add ${env.name} ${environment}`);
    console.log(`# Quando perguntado, cole: ${env.value}`);
    console.log('');
  });
});

console.log('\n📋 OU use este comando único para cada ambiente:\n');

console.log('# PRODUÇÃO');
console.log('echo "' + SENTRY_DSN + '" | vercel env add VITE_SENTRY_DSN production');
console.log('echo "1.0.0" | vercel env add VITE_APP_VERSION production');
console.log('');

console.log('# PREVIEW');  
console.log('echo "' + SENTRY_DSN + '" | vercel env add VITE_SENTRY_DSN preview');
console.log('echo "1.0.0" | vercel env add VITE_APP_VERSION preview');
console.log('');

console.log('# DEVELOPMENT');
console.log('echo "' + SENTRY_DSN + '" | vercel env add VITE_SENTRY_DSN development');
console.log('echo "1.0.0" | vercel env add VITE_APP_VERSION development');
console.log('');

console.log('✅ Depois de adicionar, faça redeploy:');
console.log('vercel --prod');

