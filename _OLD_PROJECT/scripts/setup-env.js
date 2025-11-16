#!/usr/bin/env node

/**
 * Script de Setup Inicial - DuduFisio-AI
 * 
 * Este script guia o desenvolvedor na configuração inicial
 * do projeto, criando o arquivo .env.local e validando a configuração.
 * 
 * Uso:
 *   node scripts/setup-env.js
 *   npm run setup
 */

import { existsSync, writeFileSync, readFileSync, copyFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createInterface } from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

// Interface de leitura do terminal
const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Função para fazer perguntas ao usuário
function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer);
    });
  });
}

// Função para imprimir cabeçalho
function printHeader() {
  console.clear();
  console.log(`${colors.bright}${colors.blue}`);
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║                                                              ║');
  console.log('║         🏥 DuduFisio-AI - Setup Inicial                      ║');
  console.log('║                                                              ║');
  console.log('║         Sistema de Gestão para Clínicas de Fisioterapia     ║');
  console.log('║                                                              ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`${colors.reset}\n`);
}

// Função para imprimir seção
function printSection(title) {
  console.log(`\n${colors.bright}${colors.cyan}${'═'.repeat(60)}${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}${title}${colors.reset}`);
  console.log(`${colors.cyan}${'═'.repeat(60)}${colors.reset}\n`);
}

// Função para validar URL
function isValidUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.includes('supabase.co');
  } catch {
    return false;
  }
}

// Função para validar JWT
function isValidJWT(token) {
  return token.startsWith('eyJ');
}

// Função principal
async function main() {
  printHeader();

  console.log(`${colors.green}Bem-vindo ao setup inicial do DuduFisio-AI!${colors.reset}\n`);
  console.log('Este script irá guiá-lo na configuração das variáveis de ambiente.\n');
  
  const envPath = resolve(projectRoot, '.env.local');
  const envExamplePath = resolve(projectRoot, '.env.example');

  // Verificar se .env.local já existe
  if (existsSync(envPath)) {
    console.log(`${colors.yellow}⚠️  Arquivo .env.local já existe!${colors.reset}\n`);
    const overwrite = await question('Deseja sobrescrever? (s/N): ');
    
    if (overwrite.toLowerCase() !== 's') {
      console.log(`\n${colors.green}✓ Setup cancelado. Mantendo configuração existente.${colors.reset}\n`);
      rl.close();
      return;
    }
  }

  // Copiar template se .env.example existir
  if (existsSync(envExamplePath)) {
    copyFileSync(envExamplePath, envPath);
    console.log(`${colors.green}✓ Template .env.example copiado para .env.local${colors.reset}\n`);
  } else {
    console.log(`${colors.red}✗ Arquivo .env.example não encontrado!${colors.reset}\n`);
    rl.close();
    process.exit(1);
  }

  // Ler conteúdo atual
  let envContent = readFileSync(envPath, 'utf-8');

  // Configurar Supabase
  printSection('🔐 Configuração do Supabase (OBRIGATÓRIO)');
  
  console.log(`${colors.yellow}As credenciais do Supabase são OBRIGATÓRIAS para o funcionamento do sistema.${colors.reset}\n`);
  console.log('📋 Onde encontrar:');
  console.log('   https://supabase.com/dashboard/project/urfxniitfbbvsaskicfo/settings/api\n');

  // VITE_SUPABASE_URL
  let supabaseUrl = await question(`${colors.cyan}VITE_SUPABASE_URL${colors.reset} (deixe vazio para usar padrão): `);
  if (!supabaseUrl.trim()) {
    supabaseUrl = 'https://urfxniitfbbvsaskicfo.supabase.co';
  }
  
  if (!isValidUrl(supabaseUrl)) {
    console.log(`${colors.yellow}⚠️  Aviso: URL não parece ser válida. Continuando mesmo assim...${colors.reset}`);
  }
  
  envContent = envContent.replace(
    /VITE_SUPABASE_URL=.*/,
    `VITE_SUPABASE_URL=${supabaseUrl}`
  );

  // VITE_SUPABASE_ANON_KEY
  let anonKey = await question(`${colors.cyan}VITE_SUPABASE_ANON_KEY${colors.reset} (deixe vazio para usar padrão): `);
  if (!anonKey.trim()) {
    anonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgzMDU0NDcsImV4cCI6MjA3Mzg4MTQ0N30.1duUQHT_MjGOmMKP-b-R6A9VByGzHgj296A2UR-IXvA';
  }
  
  if (!isValidJWT(anonKey)) {
    console.log(`${colors.yellow}⚠️  Aviso: Chave não parece ser um JWT válido. Continuando mesmo assim...${colors.reset}`);
  }
  
  envContent = envContent.replace(
    /VITE_SUPABASE_ANON_KEY=.*/,
    `VITE_SUPABASE_ANON_KEY=${anonKey}`
  );

  // Configurar Gemini (Opcional)
  printSection('🤖 Configuração do Gemini AI (OPCIONAL)');
  
  console.log(`${colors.yellow}O Gemini AI é usado para recursos de IA como geração de vídeos.${colors.reset}\n`);
  console.log('📋 Onde encontrar:');
  console.log('   https://makersuite.google.com/app/apikey\n');

  const useGemini = await question('Deseja configurar o Gemini AI agora? (s/N): ');
  
  if (useGemini.toLowerCase() === 's') {
    const geminiKey = await question(`${colors.cyan}VITE_GEMINI_API_KEY${colors.reset}: `);
    
    if (geminiKey.trim()) {
      envContent = envContent.replace(
        /VITE_GEMINI_API_KEY=.*/,
        `VITE_GEMINI_API_KEY=${geminiKey}`
      );
      console.log(`${colors.green}✓ Gemini AI configurado${colors.reset}`);
    }
  }

  // Salvar arquivo
  writeFileSync(envPath, envContent, 'utf-8');
  console.log(`\n${colors.green}✓ Arquivo .env.local criado com sucesso!${colors.reset}\n`);

  // Validar configuração
  printSection('✅ Validação da Configuração');
  
  console.log('Validando variáveis de ambiente...\n');
  
  // Importar e executar script de validação
  try {
    const { spawn } = await import('child_process');
    
    return new Promise((resolve) => {
      const checkEnv = spawn('node', ['scripts/check-env.js'], {
        cwd: projectRoot,
        stdio: 'inherit',
      });
      
      checkEnv.on('close', (code) => {
        if (code === 0) {
          console.log(`\n${colors.bright}${colors.green}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
          console.log(`${colors.bright}${colors.green}║  ✓ Setup concluído com sucesso!                               ║${colors.reset}`);
          console.log(`${colors.bright}${colors.green}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`);
          
          console.log(`${colors.cyan}Próximos passos:${colors.reset}`);
          console.log('  1. Execute: npm run dev');
          console.log('  2. Acesse: http://localhost:5176');
          console.log('  3. Consulte TROUBLESHOOTING.md se tiver problemas\n');
        } else {
          console.log(`\n${colors.yellow}⚠️  Algumas variáveis opcionais não foram configuradas.${colors.reset}`);
          console.log(`${colors.yellow}   O sistema funcionará, mas alguns recursos podem estar limitados.${colors.reset}\n`);
        }
        
        rl.close();
        resolve();
      });
    });
  } catch (error) {
    console.log(`${colors.yellow}⚠️  Não foi possível validar automaticamente.${colors.reset}`);
    console.log(`${colors.yellow}   Execute manualmente: npm run check:env${colors.reset}\n`);
    rl.close();
  }
}

// Executar
main().catch(error => {
  console.error(`${colors.red}Erro inesperado:${colors.reset}`, error);
  rl.close();
  process.exit(1);
});

