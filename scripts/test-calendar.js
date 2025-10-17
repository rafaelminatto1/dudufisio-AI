#!/usr/bin/env node

/**
 * Script de Teste de Calendários
 * Este script testa a geração de arquivos .ics e links de calendário
 */

const https = require('https');

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

function testEndpoint(url, description) {
  return new Promise((resolve, reject) => {
    log(`Testando: ${description}`, 'cyan');
    log(`URL: ${url}`, 'yellow');
    
    const startTime = Date.now();
    
    https.get(url, (res) => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode === 200) {
          log(`✅ Sucesso! (${duration}ms)`, 'green');
          log(`   Status: ${res.statusCode}`, 'green');
          log(`   Tamanho: ${data.length} bytes`, 'green');
          resolve({ success: true, status: res.statusCode, duration, size: data.length });
        } else {
          log(`❌ Erro! Status: ${res.statusCode}`, 'red');
          resolve({ success: false, status: res.statusCode, duration });
        }
      });
    }).on('error', (err) => {
      log(`❌ Erro de conexão: ${err.message}`, 'red');
      reject(err);
    });
  });
}

async function testCalendarGeneration() {
  logSection('📅 Teste de Geração de Calendários');
  
  const baseUrl = 'https://moocafisio.com.br';
  
  // Teste 1: Endpoint de calendário
  logSection('1. Teste de Endpoint de Calendário');
  
  const testAppointmentId = 'test-appointment-123';
  const calendarUrl = `${baseUrl}/api/calendar/${testAppointmentId}.ics`;
  
  try {
    await testEndpoint(calendarUrl, 'Geração de arquivo .ics');
  } catch (error) {
    log('Erro ao testar endpoint de calendário', 'red');
  }
  
  // Teste 2: Cron Jobs
  logSection('2. Teste de Cron Jobs');
  
  const cronJobs = [
    {
      url: `${baseUrl}/api/cron/send-reminders`,
      description: 'Cron Job de Lembretes'
    },
    {
      url: `${baseUrl}/api/cron/cleanup-old-links`,
      description: 'Cron Job de Limpeza'
    },
    {
      url: `${baseUrl}/api/cron/sync-calendar-access`,
      description: 'Cron Job de Sincronização'
    }
  ];
  
  for (const cronJob of cronJobs) {
    try {
      await testEndpoint(cronJob.url, cronJob.description);
    } catch (error) {
      log(`Erro ao testar ${cronJob.description}`, 'red');
    }
  }
  
  // Teste 3: Página de Login
  logSection('3. Teste de Página de Login');
  
  try {
    await testEndpoint(`${baseUrl}/login`, 'Página de Login');
  } catch (error) {
    log('Erro ao testar página de login', 'red');
  }
  
  // Resumo
  logSection('📊 Resumo dos Testes');
  
  log('Testes concluídos!', 'green');
  log('\nPróximos passos:', 'cyan');
  log('1. Teste manualmente o login com Google/Apple', 'cyan');
  log('2. Teste o envio de OTP por email/SMS', 'cyan');
  log('3. Crie um agendamento e verifique a geração de links', 'cyan');
  log('4. Teste a adição ao Google Calendar', 'cyan');
  log('5. Teste a adição ao Apple Calendar', 'cyan');
  
  console.log('\n');
}

async function main() {
  console.clear();
  
  logSection('🧪 Teste de Calendários - DuduFisio-AI');
  
  log('Iniciando testes de funcionalidade...', 'cyan');
  log('Site: https://moocafisio.com.br\n', 'yellow');
  
  await testCalendarGeneration();
  
  log('✅ Todos os testes foram executados!', 'green');
  log('Consulte os resultados acima para mais detalhes.\n', 'cyan');
}

main().catch(console.error);

