/**
 * Script para rodar todos os testes e gerar relatório
 */

const { execSync } = require('child_process');

console.log('🧪 Executando Suite Completa de Testes...\n');

const results = {
  unit: { passed: false, error: null },
  e2e: { passed: null, error: null },
  lint: { passed: false, error: null },
  typeCheck: { passed: false, error: null },
};

// =============================================================================
// TESTES UNITÁRIOS
// =============================================================================

console.log('📦 1. Testes Unitários (Vitest)...');
try {
  execSync('npm run test:unit', { stdio: 'inherit' });
  results.unit.passed = true;
  console.log('✅ Testes unitários: PASSOU\n');
} catch (error) {
  results.unit.passed = false;
  results.unit.error = error.message;
  console.log('❌ Testes unitários: FALHOU\n');
}

// =============================================================================
// LINT
// =============================================================================

console.log('🔍 2. Linting (ESLint)...');
try {
  execSync('npm run lint', { stdio: 'inherit' });
  results.lint.passed = true;
  console.log('✅ Linting: PASSOU\n');
} catch (error) {
  results.lint.passed = false;
  results.lint.error = error.message;
  console.log('❌ Linting: FALHOU\n');
}

// =============================================================================
// TYPE CHECK
// =============================================================================

console.log('📘 3. Type Check (TypeScript)...');
try {
  execSync('npm run type-check', { stdio: 'inherit' });
  results.typeCheck.passed = true;
  console.log('✅ Type Check: PASSOU\n');
} catch (error) {
  results.typeCheck.passed = false;
  results.typeCheck.error = error.message;
  console.log('❌ Type Check: FALHOU\n');
}

// =============================================================================
// TESTES E2E (Opcional - requer servidor rodando)
// =============================================================================

console.log('🎭 4. Testes E2E (Playwright)...');
console.log('   ⚠️  Para rodar E2E, execute "npm run dev" em outro terminal');
console.log('   Pulando testes E2E por enquanto.\n');

// =============================================================================
// RELATÓRIO FINAL
// =============================================================================

console.log('');
console.log('═══════════════════════════════════════════════════════');
console.log('                   RELATÓRIO FINAL                     ');
console.log('═══════════════════════════════════════════════════════');
console.log('');

const printResult = (name, result) => {
  const icon = result.passed === true ? '✅' : result.passed === false ? '❌' : '⚠️ ';
  const status = result.passed === true ? 'PASSOU' : result.passed === false ? 'FALHOU' : 'PULADO';
  console.log(`${icon} ${name.padEnd(20)} ${status}`);
};

printResult('Testes Unitários', results.unit);
printResult('Linting', results.lint);
printResult('Type Check', results.typeCheck);
printResult('Testes E2E', results.e2e);

console.log('');
console.log('═══════════════════════════════════════════════════════');

const allPassed = results.unit.passed && results.lint.passed && results.typeCheck.passed;

if (allPassed) {
  console.log('🎉 TESTES ESSENCIAIS PASSARAM!');
  console.log('');
  console.log('Pronto para:');
  console.log('  ✓ Commit changes');
  console.log('  ✓ Create PR');
  console.log('  ✓ Deploy to production');
  console.log('');
  console.log('Para rodar E2E:');
  console.log('  1. Terminal 1: npm run dev');
  console.log('  2. Terminal 2: npm run test:e2e');
  process.exit(0);
} else {
  console.log('❌ ALGUNS TESTES FALHARAM');
  console.log('');
  console.log('Por favor, corrija os erros antes de fazer commit.');
  process.exit(1);
}

