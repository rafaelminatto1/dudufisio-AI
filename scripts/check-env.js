#!/usr/bin/env node

/**
 * Script de Verificação de Variáveis de Ambiente
 * 
 * Este script valida se todas as variáveis de ambiente necessárias
 * estão configuradas corretamente antes de iniciar o servidor.
 * 
 * Uso:
 *   node scripts/check-env.js
 *   npm run check:env
 */

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Variáveis obrigatórias para o funcionamento básico
const REQUIRED_VARS = {
  'VITE_SUPABASE_URL': {
    description: 'URL do projeto Supabase',
    example: 'https://xxxxx.supabase.co',
    test: (value) => {
      try {
        const url = new URL(value);
        return url.hostname.includes('supabase.co');
      } catch {
        return false;
      }
    },
  },
  'VITE_SUPABASE_ANON_KEY': {
    description: 'Chave pública (anon) do Supabase',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    test: (value) => value.startsWith('eyJ'),
  },
};

// Variáveis opcionais (não bloqueiam o funcionamento)
const OPTIONAL_VARS = {
  'VITE_GEMINI_API_KEY': {
    description: 'Chave da API do Google Gemini (para recursos de IA)',
    example: 'AIza...',
    test: (value) => value.startsWith('AIza'),
  },
  'VITE_SUPABASE_SERVICE_ROLE_KEY': {
    description: 'Chave de serviço do Supabase (para operações admin)',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    test: (value) => value.startsWith('eyJ'),
  },
};

// Função para carregar variáveis de ambiente do .env.local
function loadEnvVars() {
  const envPath = resolve(projectRoot, '.env.local');
  const envVars = {};

  if (!existsSync(envPath)) {
    return { envVars, missing: true };
  }

  const envContent = readFileSync(envPath, 'utf-8');
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        envVars[key.trim()] = valueParts.join('=').trim();
      }
    }
  });

  return { envVars, missing: false };
}

// Função para validar uma variável
function validateVar(key, config, value) {
  const { description, test, example } = config;
  
  if (!value) {
    return {
      valid: false,
      error: `Não definida`,
      suggestion: `Adicione: ${key}=${example}`,
    };
  }

  if (test && !test(value)) {
    return {
      valid: false,
      error: `Formato inválido`,
      suggestion: `Esperado: ${example}`,
    };
  }

  return { valid: true };
}

// Função para imprimir resultado
function printResult(key, config, result, required = true) {
  const icon = result.valid ? '✓' : '✗';
  const color = result.valid ? colors.green : colors.red;
  const prefix = required ? 'OBRIGATÓRIA' : 'OPCIONAL';
  
  console.log(`${color}${icon}${colors.reset} ${colors.cyan}${key}${colors.reset} (${prefix})`);
  console.log(`   ${config.description}`);
  
  if (!result.valid) {
    console.log(`   ${colors.red}❌ ${result.error}${colors.reset}`);
    console.log(`   ${colors.yellow}💡 ${result.suggestion}${colors.reset}`);
  }
  
  console.log('');
}

// Função principal
async function main() {
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Verificação de Variáveis de Ambiente - DuduFisio-AI     ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);

  // Carregar variáveis
  const { envVars, missing } = loadEnvVars();

  if (missing) {
    console.log(`${colors.red}${colors.bright}❌ ERRO: Arquivo .env.local não encontrado!${colors.reset}\n`);
    console.log(`${colors.yellow}📋 Solução:${colors.reset}`);
    console.log('   1. Copie o arquivo .env.example para .env.local');
    console.log('   2. Preencha as variáveis obrigatórias');
    console.log('   3. Execute este script novamente\n');
    process.exit(1);
  }

  console.log(`${colors.green}✓ Arquivo .env.local encontrado${colors.reset}\n`);
  console.log(`${colors.bright}Verificando variáveis obrigatórias:${colors.reset}\n`);

  // Validar variáveis obrigatórias
  let hasErrors = false;
  
  for (const [key, config] of Object.entries(REQUIRED_VARS)) {
    const value = envVars[key];
    const result = validateVar(key, config, value);
    printResult(key, config, result, true);
    
    if (!result.valid) {
      hasErrors = true;
    }
  }

  // Validar variáveis opcionais
  console.log(`${colors.bright}Verificando variáveis opcionais:${colors.reset}\n`);
  
  for (const [key, config] of Object.entries(OPTIONAL_VARS)) {
    const value = envVars[key];
    const result = validateVar(key, config, value);
    printResult(key, config, result, false);
  }

  // Resultado final
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  
  if (hasErrors) {
    console.log('║  ❌ Configuração incompleta - Corrija os erros acima      ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}`);
    console.log(`${colors.yellow}📚 Documentação: TROUBLESHOOTING.md${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log('║  ✓ Todas as variáveis obrigatórias estão configuradas    ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}`);
    console.log(`${colors.green}✓ Sistema pronto para iniciar!${colors.reset}\n`);
    process.exit(0);
  }
}

// Executar
main().catch(error => {
  console.error(`${colors.red}Erro inesperado:${colors.reset}`, error);
  process.exit(1);
});

