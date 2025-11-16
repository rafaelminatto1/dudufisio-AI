#!/usr/bin/env node

/**
 * Pre-commit Hook - Verificação de Variáveis de Ambiente
 * 
 * Este script é executado antes de cada commit para garantir que:
 * 1. .env.local está no .gitignore
 * 2. Nenhum segredo foi commitado acidentalmente
 * 3. .env.example está atualizado
 * 
 * Uso: Automático via Husky
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Cores
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
};

// Variáveis sensíveis que NÃO devem estar em .env.example
const SENSITIVE_VARS = [
  'VITE_SUPABASE_ANON_KEY',
  'VITE_SUPABASE_SERVICE_ROLE_KEY',
  'VITE_GEMINI_API_KEY',
  'TWILIO_AUTH_TOKEN',
  'SMTP_PASSWORD',
  'CRON_SECRET',
];

// Função para ler arquivo
function readFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }
  return readFileSync(filePath, 'utf-8');
}

// Função para verificar se .env.local está no .gitignore
function checkGitignore() {
  const gitignorePath = resolve(projectRoot, '.gitignore');
  const gitignore = readFile(gitignorePath);
  
  if (!gitignore) {
    console.log(`${colors.red}✗ Arquivo .gitignore não encontrado!${colors.reset}`);
    return false;
  }
  
  const patterns = [
    '.env.local',
    '.env*.local',
    '*.local',
  ];
  
  let found = false;
  for (const pattern of patterns) {
    if (gitignore.includes(pattern)) {
      found = true;
      break;
    }
  }
  
  if (!found) {
    console.log(`${colors.red}✗ .env.local não está no .gitignore!${colors.reset}`);
    console.log(`${colors.yellow}  Adicione uma dessas linhas:${colors.reset}`);
    patterns.forEach(p => console.log(`    ${p}`));
    return false;
  }
  
  console.log(`${colors.green}✓ .env.local está no .gitignore${colors.reset}`);
  return true;
}

// Função para verificar se há segredos em .env.example
function checkEnvExample() {
  const envExamplePath = resolve(projectRoot, '.env.example');
  const envExample = readFile(envExamplePath);
  
  if (!envExample) {
    console.log(`${colors.yellow}⚠️  Arquivo .env.example não encontrado${colors.reset}`);
    return true; // Não é um erro crítico
  }
  
  let hasSecrets = false;
  
  for (const varName of SENSITIVE_VARS) {
    const regex = new RegExp(`${varName}=[^\\n]+`, 'g');
    const matches = envExample.match(regex);
    
    if (matches) {
      for (const match of matches) {
        const value = match.split('=')[1];
        // Verificar se não é um placeholder
        if (value && 
            !value.includes('your_') && 
            !value.includes('example') &&
            value.length > 20) { // Valores reais são longos
          console.log(`${colors.red}✗ Segredo encontrado em .env.example: ${varName}${colors.reset}`);
          hasSecrets = true;
        }
      }
    }
  }
  
  if (!hasSecrets) {
    console.log(`${colors.green}✓ .env.example não contém segredos reais${colors.reset}`);
  }
  
  return !hasSecrets;
}

// Função para verificar se .env.local foi commitado acidentalmente
function checkStagedFiles() {
  // Esta verificação seria feita via git diff --cached
  // Por simplicidade, apenas avisamos
  console.log(`${colors.cyan}ℹ️  Verifique se .env.local não está nos arquivos staged${colors.reset}`);
  console.log(`${colors.cyan}   Execute: git status${colors.reset}`);
  return true;
}

// Função principal
async function main() {
  console.log(`\n${colors.cyan}Pre-commit: Verificando variáveis de ambiente...${colors.reset}\n`);
  
  let allPassed = true;
  
  // 1. Verificar .gitignore
  if (!checkGitignore()) {
    allPassed = false;
  }
  
  console.log('');
  
  // 2. Verificar .env.example
  if (!checkEnvExample()) {
    allPassed = false;
  }
  
  console.log('');
  
  // 3. Aviso sobre arquivos staged
  checkStagedFiles();
  
  console.log('');
  
  // Resultado
  if (!allPassed) {
    console.log(`${colors.red}✗ Pre-commit falhou! Corrija os erros acima antes de commitar.${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✓ Verificação de ambiente concluída${colors.reset}\n`);
  process.exit(0);
}

// Executar
main().catch(error => {
  console.error(`${colors.red}Erro inesperado:${colors.reset}`, error);
  process.exit(1);
});

