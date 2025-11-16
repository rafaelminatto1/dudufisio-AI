#!/usr/bin/env node

/**
 * Script de Manutenção Automatizada
 * Executa verificações de qualidade e segurança do projeto
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  try {
    log(`\n🔧 ${description}...`, 'blue');
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    log(`✅ ${description} concluído`, 'green');
    return { success: true, output };
  } catch (error) {
    log(`❌ Erro em ${description}:`, 'red');
    console.log(error.stdout || error.message);
    return { success: false, error: error.stdout || error.message };
  }
}

function checkProjectHealth() {
  log('\n🚀 INICIANDO VERIFICAÇÃO DE SAÚDE DO PROJETO', 'bright');
  log('=' .repeat(50), 'cyan');

  const results = {
    security: false,
    linting: false,
    types: false,
    build: false,
    outdated: false
  };

  // 1. Verificação de segurança
  const securityCheck = runCommand('npm audit --audit-level=moderate', 'Auditoria de Segurança');
  results.security = securityCheck.success;

  // 2. Verificação de linting
  const lintCheck = runCommand('npm run lint', 'Verificação de Linting');
  results.linting = lintCheck.success;

  // 3. Verificação de tipos
  const typeCheck = runCommand('npm run type-check', 'Verificação de Tipos TypeScript');
  results.types = typeCheck.success;

  // 4. Build do projeto
  const buildCheck = runCommand('npm run build', 'Build do Projeto');
  results.build = buildCheck.success;

  // 5. Verificação de dependências desatualizadas
  try {
    const outdatedCheck = runCommand('npm outdated', 'Verificação de Dependências');
    results.outdated = outdatedCheck.success;
  } catch {
    results.outdated = true; // npm outdated retorna exit code 1 quando há updates
  }

  // Resumo dos resultados
  log('\n📊 RESUMO DOS RESULTADOS', 'bright');
  log('=' .repeat(30), 'cyan');
  
  Object.entries(results).forEach(([key, success]) => {
    const status = success ? '✅ PASSOU' : '❌ FALHOU';
    const color = success ? 'green' : 'red';
    log(`${key.toUpperCase()}: ${status}`, color);
  });

  const allPassed = Object.values(results).every(Boolean);
  
  if (allPassed) {
    log('\n🎉 PROJETO EM EXCELENTE ESTADO!', 'green');
    log('Todas as verificações passaram com sucesso.', 'green');
  } else {
    log('\n⚠️  ATENÇÃO: Algumas verificações falharam', 'yellow');
    log('Revise os erros acima e corrija antes de fazer commit.', 'yellow');
  }

  return allPassed;
}

function updateDependencies() {
  log('\n📦 ATUALIZANDO DEPENDÊNCIAS', 'bright');
  log('=' .repeat(30), 'cyan');

  // Verificar dependências desatualizadas
  try {
    const outdatedOutput = execSync('npm outdated', { encoding: 'utf8' });
    log('📋 Dependências desatualizadas encontradas:', 'yellow');
    console.log(outdatedOutput);
    
    // Atualizar dependências seguras
    log('\n🔄 Atualizando dependências seguras...', 'blue');
    runCommand('npm update', 'Atualização de Dependências');
    
  } catch (error) {
    log('✅ Todas as dependências estão atualizadas!', 'green');
  }
}

function generateReport() {
  const reportPath = path.join(__dirname, '..', 'reports', 'maintenance-report.md');
  const reportDir = path.dirname(reportPath);
  
  // Criar diretório se não existir
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }

  const report = `# Relatório de Manutenção - ${new Date().toLocaleDateString('pt-BR')}

## Verificações Realizadas

- [x] Auditoria de Segurança
- [x] Verificação de Linting
- [x] Verificação de Tipos TypeScript
- [x] Build do Projeto
- [x] Verificação de Dependências

## Comandos Úteis

\`\`\`bash
# Verificação completa
npm run check

# Correção automática de linting
npm run lint:fix

# Verificação de tipos
npm run type-check

# Auditoria de segurança
npm audit

# Verificar dependências desatualizadas
npm outdated
\`\`\`

---
*Relatório gerado automaticamente pelo script de manutenção*
`;

  fs.writeFileSync(reportPath, report);
  log(`\n📄 Relatório gerado: ${reportPath}`, 'blue');
}

// Executar script
const args = process.argv.slice(2);

if (args.includes('--update')) {
  updateDependencies();
}

if (args.includes('--health') || args.length === 0) {
  const healthPassed = checkProjectHealth();
  
  if (healthPassed) {
    generateReport();
    process.exit(0);
  } else {
    process.exit(1);
  }
}

export { checkProjectHealth, updateDependencies, generateReport };
