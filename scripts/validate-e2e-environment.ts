#!/usr/bin/env tsx

/**
 * Script de Validação do Ambiente E2E
 * Verifica se todos os pré-requisitos estão atendidos para executar os testes
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  critical: boolean;
}

const results: ValidationResult[] = [];

async function checkServerRunning(): Promise<ValidationResult> {
  try {
    const response = await fetch('http://localhost:5173');
    return {
      name: 'Servidor Dev',
      passed: response.ok,
      message: response.ok ? '✅ Servidor rodando na porta 5173' : '❌ Servidor respondeu mas com erro',
      critical: true
    };
  } catch (error) {
    return {
      name: 'Servidor Dev',
      passed: false,
      message: '❌ Servidor NÃO está rodando na porta 5173. Execute: npm run dev',
      critical: true
    };
  }
}

async function checkSupabaseConfig(): Promise<ValidationResult> {
  const envPath = path.join(process.cwd(), '.env.local');
  
  if (!fs.existsSync(envPath)) {
    return {
      name: 'Configuração Supabase',
      passed: false,
      message: '❌ Arquivo .env.local não encontrado',
      critical: true
    };
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const hasSupabaseUrl = envContent.includes('VITE_SUPABASE_URL');
  const hasSupabaseKey = envContent.includes('VITE_SUPABASE_ANON_KEY');

  if (hasSupabaseUrl && hasSupabaseKey) {
    return {
      name: 'Configuração Supabase',
      passed: true,
      message: '✅ Variáveis do Supabase configuradas',
      critical: true
    };
  }

  return {
    name: 'Configuração Supabase',
    passed: false,
    message: '❌ Variáveis VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY não encontradas',
    critical: true
  };
}

async function checkPlaywrightBrowsers(): Promise<ValidationResult> {
  try {
    // Verifica se o diretório de browsers do Playwright existe
    const playwrightDir = path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      '.cache',
      'ms-playwright'
    );

    // Windows usa um caminho diferente
    const windowsPlaywrightDir = path.join(
      process.env.LOCALAPPDATA || '',
      'ms-playwright'
    );

    const dirExists = fs.existsSync(playwrightDir) || fs.existsSync(windowsPlaywrightDir);

    if (dirExists) {
      return {
        name: 'Browsers Playwright',
        passed: true,
        message: '✅ Browsers do Playwright instalados',
        critical: false
      };
    }

    return {
      name: 'Browsers Playwright',
      passed: false,
      message: '⚠️  Browsers não encontrados. Execute: npx playwright install',
      critical: false
    };
  } catch (error) {
    return {
      name: 'Browsers Playwright',
      passed: false,
      message: '⚠️  Não foi possível verificar browsers. Execute: npx playwright install',
      critical: false
    };
  }
}

async function checkTestFiles(): Promise<ValidationResult> {
  const testDir = path.join(process.cwd(), 'tests', 'e2e');
  
  if (!fs.existsSync(testDir)) {
    return {
      name: 'Arquivos de Teste',
      passed: false,
      message: '❌ Diretório tests/e2e não encontrado',
      critical: true
    };
  }

  const testFiles = fs.readdirSync(testDir).filter(f => f.endsWith('.spec.ts'));
  
  return {
    name: 'Arquivos de Teste',
    passed: testFiles.length > 0,
    message: testFiles.length > 0 
      ? `✅ ${testFiles.length} arquivos de teste encontrados`
      : '❌ Nenhum arquivo de teste encontrado',
    critical: true
  };
}

async function checkPlaywrightConfig(): Promise<ValidationResult> {
  const configPath = path.join(process.cwd(), 'playwright.config.ts');
  
  if (!fs.existsSync(configPath)) {
    return {
      name: 'Configuração Playwright',
      passed: false,
      message: '❌ playwright.config.ts não encontrado',
      critical: true
    };
  }

  return {
    name: 'Configuração Playwright',
    passed: true,
    message: '✅ playwright.config.ts configurado',
    critical: false
  };
}

async function checkNodeModules(): Promise<ValidationResult> {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  const playwrightPath = path.join(nodeModulesPath, '@playwright', 'test');
  
  if (!fs.existsSync(nodeModulesPath)) {
    return {
      name: 'Dependências',
      passed: false,
      message: '❌ node_modules não encontrado. Execute: npm install',
      critical: true
    };
  }

  if (!fs.existsSync(playwrightPath)) {
    return {
      name: 'Dependências',
      passed: false,
      message: '❌ @playwright/test não instalado. Execute: npm install',
      critical: true
    };
  }

  return {
    name: 'Dependências',
    passed: true,
    message: '✅ Dependências instaladas',
    critical: false
  };
}

async function runValidations() {
  console.log('\n🔍 Validando Ambiente E2E para MoocaFisio\n');
  console.log('='.repeat(60));

  // Executar todas as validações
  results.push(await checkNodeModules());
  results.push(await checkPlaywrightConfig());
  results.push(await checkTestFiles());
  results.push(await checkSupabaseConfig());
  results.push(await checkPlaywrightBrowsers());
  results.push(await checkServerRunning());

  // Exibir resultados
  console.log('\n📋 Resultados da Validação:\n');
  results.forEach((result, index) => {
    const criticalBadge = result.critical ? '[CRÍTICO]' : '[OPCIONAL]';
    console.log(`${index + 1}. ${result.name} ${criticalBadge}`);
    console.log(`   ${result.message}\n`);
  });

  // Sumário
  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  const criticalFailed = results.filter(r => !r.passed && r.critical).length;

  console.log('='.repeat(60));
  console.log(`\n📊 Sumário: ${passedTests}/${totalTests} validações OK\n`);

  if (criticalFailed > 0) {
    console.log(`❌ ${criticalFailed} validações CRÍTICAS falharam!\n`);
    console.log('⚠️  Corrija os problemas críticos antes de executar os testes.\n');
    process.exit(1);
  }

  const optionalFailed = results.filter(r => !r.passed && !r.critical).length;
  if (optionalFailed > 0) {
    console.log(`⚠️  ${optionalFailed} validações opcionais falharam.`);
    console.log('   Os testes podem funcionar, mas é recomendado corrigir.\n');
  }

  if (passedTests === totalTests) {
    console.log('✅ AMBIENTE PRONTO PARA TESTES E2E! 🎉\n');
    console.log('Execute: npm run test:e2e:ui\n');
  }

  return criticalFailed === 0;
}

// Executar
runValidations().catch(error => {
  console.error('❌ Erro ao validar ambiente:', error);
  process.exit(1);
});

