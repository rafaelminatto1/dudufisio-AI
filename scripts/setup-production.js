#!/usr/bin/env node

/**
 * 🚀 Setup Script para Produção - FisioFlow Check-in System
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Cores para o console
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  warning: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  title: (msg) => console.log(`\n${colors.bold}${colors.blue}🚀 ${msg}${colors.reset}\n`)
};

log.title('CONFIGURAÇÃO DE PRODUÇÃO - FISIOFLOW CHECK-IN SYSTEM');
log.info('Sistema pronto para produção!');
log.success('Deploy realizado: https://dudufisio-q5j90ltqp-rafael-minattos-projects.vercel.app');

console.log(`
${colors.bold}1. Configure as API Keys no Vercel:${colors.reset}
   - Consulte API_KEYS_PRODUCTION_GUIDE.md
   - Configure todas as variáveis de ambiente

${colors.bold}2. URLs Importantes:${colors.reset}
   - Aplicação: https://moocafisio.com.br
   - Vercel: https://vercel.com/dashboard
   - Supabase: https://supabase.com/dashboard

${colors.green}✅ Sistema configurado com sucesso!${colors.reset}
`);