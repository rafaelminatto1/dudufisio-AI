#!/usr/bin/env node

/**
 * Script de Verificação de Dependências Críticas
 * 
 * Verifica versões de pacotes críticos e compara com versões seguras
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Versões seguras conhecidas
const SAFE_VERSIONS = {
  'esbuild': '>=0.24.3',
  'path-to-regexp': '>=6.3.0',
  'undici': '>=5.29.0',
  '@vercel/node': '>=5.5.0'
};

// Pacotes críticos para o projeto
const CRITICAL_PACKAGES = [
  'react',
  'react-dom',
  '@supabase/supabase-js',
  'vite',
  '@vercel/node',
  'typescript'
];

/**
 * Obtém versão instalada de um pacote
 */
function getInstalledVersion(packageName) {
  try {
    const packageJsonPath = path.join(__dirname, '../node_modules', packageName, 'package.json');
    if (fs.existsSync(packageJsonPath)) {
      const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
      return pkg.version;
    }
  } catch (error) {
    return null;
  }
  return null;
}

/**
 * Verifica se há atualizações disponíveis
 */
function checkForUpdates() {
  try {
    const result = execSync('npm outdated --json', { encoding: 'utf-8' });
    return result ? JSON.parse(result) : {};
  } catch (error) {
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
    return {};
  }
}

/**
 * Compara versões
 */
function compareVersions(current, target) {
  const parseVersion = (v) => v.replace(/[^\d.]/g, '').split('.').map(Number);
  
  const curr = parseVersion(current);
  const targ = parseVersion(target.replace('>=', ''));
  
  for (let i = 0; i < Math.max(curr.length, targ.length); i++) {
    const c = curr[i] || 0;
    const t = targ[i] || 0;
    if (c < t) return -1;
    if (c > t) return 1;
  }
  return 0;
}

/**
 * Função principal
 */
function main() {
  console.log('🔍 Verificando dependências críticas...\n');

  const results = {
    safe: [],
    outdated: [],
    vulnerable: []
  };

  // Verificar pacotes críticos
  console.log('📦 Pacotes Críticos:');
  console.log('='.repeat(60));

  CRITICAL_PACKAGES.forEach(pkg => {
    const version = getInstalledVersion(pkg);
    console.log(`${pkg}: ${version || 'NOT FOUND'}`);
    
    if (version) {
      results.safe.push({ name: pkg, version });
    }
  });

  console.log('');

  // Verificar atualizações disponíveis
  console.log('🔄 Verificando atualizações...');
  const updates = checkForUpdates();

  Object.entries(updates).forEach(([pkg, info]) => {
    if (CRITICAL_PACKAGES.includes(pkg)) {
      results.outdated.push({
        name: pkg,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest
      });
    }
  });

  if (results.outdated.length > 0) {
    console.log('\n📊 Atualizações Disponíveis para Pacotes Críticos:');
    results.outdated.forEach(pkg => {
      console.log(`  ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
    });
  } else {
    console.log('  ✅ Todos os pacotes críticos estão atualizados');
  }

  console.log('');

  // Verificar versões seguras conhecidas
  console.log('🔐 Verificando Versões Seguras:');
  console.log('='.repeat(60));

  Object.entries(SAFE_VERSIONS).forEach(([pkg, safeVersion]) => {
    const installed = getInstalledVersion(pkg);
    
    if (!installed) {
      console.log(`⚠️  ${pkg}: NÃO INSTALADO`);
      results.vulnerable.push({ name: pkg, reason: 'not_installed' });
    } else {
      const comparison = compareVersions(installed, safeVersion);
      if (comparison < 0) {
        console.log(`❌ ${pkg}: ${installed} (requer ${safeVersion})`);
        results.vulnerable.push({
          name: pkg,
          current: installed,
          required: safeVersion
        });
      } else {
        console.log(`✅ ${pkg}: ${installed} (OK)`);
      }
    }
  });

  console.log('');
  console.log('='.repeat(60));
  console.log('RESUMO');
  console.log('='.repeat(60));
  console.log(`✅ Pacotes seguros: ${results.safe.length}`);
  console.log(`📊 Atualizações disponíveis: ${results.outdated.length}`);
  console.log(`⚠️  Vulneráveis/Desatualizados: ${results.vulnerable.length}`);
  console.log('='.repeat(60));

  // Exit code baseado em vulnerabilidades
  process.exit(results.vulnerable.length > 0 ? 1 : 0);
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { getInstalledVersion, checkForUpdates, compareVersions };

