#!/usr/bin/env node

/**
 * Verificador de Deployment
 * Verifica o status do deployment no Vercel
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

function checkUrl(url, description) {
  return new Promise((resolve) => {
    log(`Verificando: ${description}`, 'cyan');
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
          log(`✅ Online! (${duration}ms)`, 'green');
          log(`   Status: ${res.statusCode}`, 'green');
          log(`   Tamanho: ${data.length} bytes`, 'green');
          resolve({ success: true, status: res.statusCode, duration, size: data.length });
        } else {
          log(`⚠️  Status: ${res.statusCode}`, 'yellow');
          resolve({ success: false, status: res.statusCode, duration });
        }
      });
    }).on('error', (err) => {
      log(`❌ Erro: ${err.message}`, 'red');
      resolve({ success: false, error: err.message });
    });
  });
}

async function main() {
  console.clear();
  
  logSection('🚀 Verificador de Deployment - DuduFisio-AI');
  
  const urls = [
    {
      url: 'https://moocafisio.com.br',
      description: 'Site Principal'
    },
    {
      url: 'https://www.moocafisio.com.br',
      description: 'Site Principal (www)'
    },
    {
      url: 'https://dudufisio-ai.vercel.app',
      description: 'Vercel App'
    },
    {
      url: 'https://moocafisio.com.br/login',
      description: 'Página de Login'
    },
    {
      url: 'https://moocafisio.com.br/dashboard',
      description: 'Dashboard'
    }
  ];
  
  log('Verificando status do deployment...\n', 'cyan');
  
  const results = [];
  
  for (const item of urls) {
    const result = await checkUrl(item.url, item.description);
    results.push({ ...item, ...result });
    console.log('');
  }
  
  // Resumo
  logSection('📊 Resumo do Deployment');
  
  const successCount = results.filter(r => r.success).length;
  const totalCount = results.length;
  
  log(`Total de URLs verificadas: ${totalCount}`, 'cyan');
  log(`URLs online: ${successCount}`, successCount === totalCount ? 'green' : 'yellow');
  log(`URLs com problemas: ${totalCount - successCount}`, totalCount - successCount === 0 ? 'green' : 'red');
  
  if (successCount === totalCount) {
    log('\n✅ Deployment está 100% funcional!', 'green');
  } else {
    log('\n⚠️  Algumas URLs apresentaram problemas.', 'yellow');
    log('Verifique os logs acima para mais detalhes.\n', 'yellow');
  }
  
  // Informações do deployment
  logSection('📋 Informações do Deployment');
  
  log('URLs Disponíveis:', 'cyan');
  for (const item of urls) {
    log(`  • ${item.url}`, 'blue');
  }
  
  log('\nPróximos Passos:', 'cyan');
  log('1. Configure os providers OAuth no Supabase', 'cyan');
  log('2. Execute as migrations no banco de dados', 'cyan');
  log('3. Adicione CRON_SECRET no Vercel', 'cyan');
  log('4. Teste as funcionalidades de autenticação', 'cyan');
  log('5. Teste a geração de calendários\n', 'cyan');
  
  log('✅ Verificação concluída!', 'green');
  log('Consulte PROXIMOS_PASSOS.md para mais detalhes.\n', 'cyan');
}

main().catch(console.error);

