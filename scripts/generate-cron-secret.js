#!/usr/bin/env node

/**
 * Gerador de CRON_SECRET
 * Gera uma chave aleatória segura para autenticação de Cron Jobs
 */

const crypto = require('crypto');

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

function generateSecret(length = 32) {
  return crypto.randomBytes(length).toString('base64');
}

function main() {
  console.clear();
  
  logSection('🔑 Gerador de CRON_SECRET');
  
  log('Gerando chave aleatória segura...', 'cyan');
  
  const secret = generateSecret(32);
  
  log('\n✅ CRON_SECRET gerado com sucesso!\n', 'green');
  
  log('Copie e cole esta chave nas variáveis de ambiente do Vercel:', 'yellow');
  log('\n' + secret + '\n', 'green');
  
  log('Passos para adicionar no Vercel:', 'cyan');
  log('1. Acesse: https://vercel.com/rafael-minattos-projects/dudufisio-ai/settings/environment-variables', 'blue');
  log('2. Clique em "Add New"', 'blue');
  log('3. Nome: CRON_SECRET', 'blue');
  log('4. Valor: ' + secret, 'blue');
  log('5. Ambiente: Production, Preview, Development', 'blue');
  log('6. Clique em "Save"\n', 'blue');
  
  log('⚠️  IMPORTANTE:', 'yellow');
  log('• Mantenha esta chave segura e não a compartilhe', 'yellow');
  log('• Use a mesma chave em todos os ambientes', 'yellow');
  log('• Não commite esta chave no Git\n', 'yellow');
  
  // Salvar em arquivo temporário
  const fs = require('fs');
  const path = require('path');
  
  const tempFile = path.join(__dirname, '..', '.cron-secret-temp.txt');
  
  try {
    fs.writeFileSync(tempFile, secret, 'utf8');
    log(`✅ Chave salva em: ${tempFile}`, 'green');
    log('⚠️  Lembre-se de deletar este arquivo após usar!\n', 'yellow');
  } catch (error) {
    log('❌ Erro ao salvar arquivo temporário', 'red');
  }
  
  log('✅ Pronto!', 'green');
  log('Adicione a chave no Vercel e execute um redeploy.\n', 'cyan');
}

main();

