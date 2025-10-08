#!/usr/bin/env node

/**
 * Setup Script - Activity Fisioterapia Integration
 * Automatiza instalação e configuração
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Setup: Activity Fisioterapia Integration\n');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
};

// Etapa 1: Verificar dependências
log.info('Verificando dependências...');

try {
  const axios = require.resolve('axios');
  log.success('axios instalado');
} catch {
  log.warn('axios não encontrado - instalando...');
  execSync('npm install --save axios', { stdio: 'inherit' });
}

try {
  const genai = require.resolve('@google/generative-ai');
  log.success('@google/generative-ai instalado');
} catch {
  log.warn('@google/generative-ai não encontrado - instalando...');
  execSync('npm install --save @google/generative-ai', { stdio: 'inherit' });
}

// Etapa 2: Verificar .env.local
log.info('\nVerificando configurações...');

const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  log.warn('.env.local não encontrado - criando exemplo...');
  
  const envTemplate = `# Activity Fisioterapia Integration - Configurações

# Gemini API (IA Conversacional)
GEMINI_API_KEY=your_gemini_key_here
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key_here

# Twilio (WhatsApp Business API) - Opcional
# TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
# TWILIO_AUTH_TOKEN=xxxxxxxxxxxxx
# TWILIO_WHATSAPP_NUMBER=+5511999999999
# WHATSAPP_VERIFY_TOKEN=seu_token_secreto

# Redis (Para filas e contexto) - Opcional
# REDIS_URL=redis://localhost:6379
# UPSTASH_REDIS_URL=https://xxxxx.upstash.io
# UPSTASH_REDIS_TOKEN=xxxxxxxxxxxxx

# Stripe (Pagamentos) - Opcional
# STRIPE_SECRET_KEY=sk_xxxxxxxxxxxxx
# STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
# NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_xxxxxxxxxxxxx

# Mercado Pago (Alternativa ao Stripe) - Opcional
# MERCADO_PAGO_TOKEN=xxxxxxxxxxxxx

# Default Clinic ID (para webhook WhatsApp)
# DEFAULT_CLINIC_ID=your-clinic-uuid
`;

  fs.writeFileSync(envPath, envTemplate);
  log.success('.env.local criado! Configure suas keys.');
} else {
  log.success('.env.local encontrado');
}

// Etapa 3: Verificar migrations
log.info('\nVerificando migrations...');

const migration1 = path.join(process.cwd(), 'supabase/migrations/20251008100001_create_crm_tables.sql');
const migration2 = path.join(process.cwd(), 'supabase/migrations/20251008100002_create_gamification_tables.sql');

if (fs.existsSync(migration1)) {
  log.success('Migration CRM encontrada');
} else {
  log.error('Migration CRM não encontrada!');
}

if (fs.existsSync(migration2)) {
  log.success('Migration Gamificação encontrada');
} else {
  log.error('Migration Gamificação não encontrada!');
}

// Etapa 4: Aplicar migrations (pedir confirmação)
log.info('\n📊 Pronto para aplicar migrations no Supabase');
log.warn('IMPORTANTE: Faça backup do banco antes!\n');

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout,
});

readline.question('Aplicar migrations agora? (s/n): ', (answer) => {
  if (answer.toLowerCase() === 's' || answer.toLowerCase() === 'sim') {
    log.info('Aplicando migrations...');
    try {
      execSync('npx supabase db push', { stdio: 'inherit' });
      log.success('Migrations aplicadas com sucesso!');
    } catch (error) {
      log.error('Erro ao aplicar migrations. Execute manualmente: npx supabase db push');
    }
  } else {
    log.info('Migrations não aplicadas. Execute manualmente quando pronto: npx supabase db push');
  }

  // Etapa 5: Resumo final
  console.log('\n' + '='.repeat(60));
  log.success('Setup completo!');
  console.log('='.repeat(60));
  
  console.log('\n📋 Próximos passos:\n');
  console.log('1. Configure .env.local com suas API keys');
  console.log('2. Aplique migrations se não fez: npx supabase db push');
  console.log('3. Inicie o servidor: npm run dev');
  console.log('4. Acesse: /crm/dashboard');
  console.log('\n📚 Documentação: Leia 🚀_COMECE_AGORA_ACTIVITY.md\n');
  
  readline.close();
});

