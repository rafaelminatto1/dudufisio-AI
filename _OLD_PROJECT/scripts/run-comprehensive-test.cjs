#!/usr/bin/env node

/**
 * Script para executar o teste completo da aplicação
 * 
 * Uso: node scripts/run-comprehensive-test.cjs [profile]
 * 
 * Exemplos:
 *   node scripts/run-comprehensive-test.cjs admin
 *   node scripts/run-comprehensive-test.cjs therapist
 *   node scripts/run-comprehensive-test.cjs patient
 *   node scripts/run-comprehensive-test.cjs educator
 *   node scripts/run-comprehensive-test.cjs all
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const profiles = {
  admin: 'Admin',
  therapist: 'Fisioterapeuta',
  patient: 'Paciente',
  educator: 'Educador Físico',
  all: 'Todos os perfis'
};

const args = process.argv.slice(2);
const profileArg = args[0] || 'all';

console.log('🧪 DuduFisio-AI - Teste Completo da Aplicação\n');
console.log('='.repeat(80));

if (profileArg === 'all') {
  console.log(`Executando testes para: ${profiles.all}\n`);
  console.log('Isso pode levar alguns minutos...\n');
  
  // Executar teste completo
  try {
    execSync('npx playwright test tests/e2e/comprehensive-application-test.spec.ts --reporter=list,html', {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n✅ Testes concluídos com sucesso!');
    console.log('\n📊 Verifique os resultados em:');
    console.log('  - test-results/comprehensive-test-results.json');
    console.log('  - test-results/ERROS_ENCONTRADOS.csv');
    console.log('  - test-results/TESTE_RELATORIO.md');
    console.log('  - playwright-report/index.html');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
    process.exit(1);
  }
  
} else if (profiles[profileArg]) {
  console.log(`Executando testes para: ${profiles[profileArg]}\n`);
  
  // Executar teste para perfil específico
  try {
    execSync(`npx playwright test tests/e2e/comprehensive-application-test.spec.ts --grep "${profiles[profileArg]}" --reporter=list,html`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });
    
    console.log('\n✅ Testes concluídos com sucesso!');
    
  } catch (error) {
    console.error('\n❌ Erro ao executar testes:', error.message);
    process.exit(1);
  }
  
} else {
  console.error(`❌ Perfil inválido: ${profileArg}`);
  console.log('\nPerfis disponíveis:');
  console.log('  - admin (Administrador)');
  console.log('  - therapist (Fisioterapeuta)');
  console.log('  - patient (Paciente)');
  console.log('  - educator (Educador Físico)');
  console.log('  - all (Todos os perfis)');
  console.log('\nUso: node scripts/run-comprehensive-test.js [profile]');
  process.exit(1);
}

