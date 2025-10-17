#!/usr/bin/env node

/**
 * Script de Setup de Autenticação
 * Este script ajuda a configurar e testar o sistema de autenticação
 */

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('\n' + '='.repeat(60));
  log(title, 'bright');
  console.log('='.repeat(60) + '\n');
}

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.clear();
  
  logSection('🔐 Setup de Autenticação - DuduFisio-AI');
  
  log('Bem-vindo ao assistente de configuração!', 'cyan');
  log('Este script irá ajudá-lo a configurar o sistema de autenticação.\n', 'cyan');
  
  // Verificar variáveis de ambiente
  logSection('📋 Verificação de Variáveis de Ambiente');
  
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_GEMINI_API_KEY'
  ];
  
  const missingVars = [];
  
  for (const varName of requiredVars) {
    if (process.env[varName]) {
      log(`✅ ${varName}`, 'green');
    } else {
      log(`❌ ${varName} - NÃO CONFIGURADO`, 'red');
      missingVars.push(varName);
    }
  }
  
  if (missingVars.length > 0) {
    log('\n⚠️  Algumas variáveis de ambiente estão faltando!', 'yellow');
    log('Configure-as no arquivo .env.local antes de continuar.\n', 'yellow');
    process.exit(1);
  }
  
  // Checklist de configuração
  logSection('✅ Checklist de Configuração');
  
  const checklist = [
    {
      title: 'Google OAuth no Supabase',
      url: 'https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers',
      description: 'Habilitar Google OAuth e adicionar credenciais'
    },
    {
      title: 'Apple Sign-In no Supabase',
      url: 'https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers',
      description: 'Habilitar Apple Sign-In e adicionar credenciais'
    },
    {
      title: 'Phone Auth (SMS OTP)',
      url: 'https://supabase.com/dashboard/project/[PROJECT_ID]/settings/auth',
      description: 'Habilitar Phone Auth (Twilio já integrado no Supabase Pro)'
    },
    {
      title: 'Executar Migrations',
      url: 'https://supabase.com/dashboard/project/[PROJECT_ID]/sql/new',
      description: 'Executar migrations do banco de dados'
    },
    {
      title: 'CRON_SECRET no Vercel',
      url: 'https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables',
      description: 'Adicionar variável CRON_SECRET'
    }
  ];
  
  for (let i = 0; i < checklist.length; i++) {
    const item = checklist[i];
    log(`${i + 1}. ${item.title}`, 'blue');
    log(`   ${item.description}`, 'cyan');
    log(`   URL: ${item.url}\n`, 'yellow');
  }
  
  // Testar funcionalidades
  logSection('🧪 Testes de Funcionalidade');
  
  const tests = [
    {
      name: 'Login com Google',
      url: 'https://moocafisio.com.br/login',
      description: 'Testar login com Google OAuth'
    },
    {
      name: 'Login com Apple',
      url: 'https://moocafisio.com.br/login',
      description: 'Testar login com Apple Sign-In'
    },
    {
      name: 'OTP via Email',
      url: 'https://moocafisio.com.br/login',
      description: 'Testar envio de OTP por email'
    },
    {
      name: 'OTP via SMS',
      url: 'https://moocafisio.com.br/login',
      description: 'Testar envio de OTP por SMS'
    },
    {
      name: 'Geração de .ics',
      url: 'https://moocafisio.com.br/api/calendar/[APPOINTMENT_ID].ics',
      description: 'Testar geração de arquivo .ics'
    },
    {
      name: 'Edge Functions',
      url: 'https://moocafisio.com.br/api/cron/send-reminders',
      description: 'Testar execução de Edge Functions'
    }
  ];
  
  for (let i = 0; i < tests.length; i++) {
    const test = tests[i];
    log(`${i + 1}. ${test.name}`, 'blue');
    log(`   ${test.description}`, 'cyan');
    log(`   URL: ${test.url}\n`, 'yellow');
  }
  
  // Gerar CRON_SECRET
  logSection('🔑 Gerar CRON_SECRET');
  
  const crypto = require('crypto');
  const cronSecret = crypto.randomBytes(32).toString('base64');
  
  log('Gerando CRON_SECRET aleatório...', 'cyan');
  log(`\n${cronSecret}\n`, 'green');
  log('Adicione esta chave nas variáveis de ambiente do Vercel:', 'yellow');
  log('https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables\n', 'yellow');
  
  // Próximos passos
  logSection('🚀 Próximos Passos');
  
  const nextSteps = [
    '1. Configure os providers OAuth no Supabase Dashboard',
    '2. Execute as migrations no banco de dados',
    '3. Adicione CRON_SECRET no Vercel',
    '4. Teste todas as funcionalidades',
    '5. Monitore os logs e métricas'
  ];
  
  for (const step of nextSteps) {
    log(step, 'cyan');
  }
  
  log('\n✅ Setup concluído!', 'green');
  log('Consulte a documentação em PROXIMOS_PASSOS.md para mais detalhes.\n', 'cyan');
  
  rl.close();
}

main().catch(console.error);

