#!/usr/bin/env node
/**
 * ✅ SCRIPT DE VERIFICAÇÃO INTELIGENTE DA ESTRUTURA DO PROJETO
 * 
 * PROPÓSITO:
 * - Verificar PRIMEIRO qual é a estrutura real do projeto
 * - Identificar qual sistema está ATIVO
 * - Detectar problemas NO SISTEMA CORRETO
 * - Evitar trabalhar em código arquivado sem confirmação
 * 
 * MELHORIA: Resolve o problema de "Processo/Abordagem: 7/10"
 * Agora sempre verificamos a estrutura ANTES de qualquer ação!
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  red: '\x1b[31m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

/**
 * Identifica a estrutura do projeto
 */
function identifyProjectStructure() {
  const root = process.cwd();
  const structure = {
    type: null,
    activeSystem: null,
    archivedSystems: [],
    microservices: [],
    nextjs: null,
    hasPackages: false,
    hasOldProject: false,
  };

  // Verificar sistema Next.js
  const nextjsDirs = ['fisioflow-next', 'app', 'pages'];
  for (const dir of nextjsDirs) {
    const fullPath = path.join(root, dir);
    if (fs.existsSync(fullPath)) {
      const packageJsonPath = path.join(fullPath, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
        if (pkg.dependencies && pkg.dependencies.next) {
          structure.nextjs = dir;
          structure.activeSystem = dir;
          structure.type = 'nextjs';
        }
      }
    }
  }

  // Verificar microserviços
  const packagesPath = path.join(root, 'packages');
  if (fs.existsSync(packagesPath)) {
    structure.hasPackages = true;
    const packages = fs.readdirSync(packagesPath);
    structure.microservices = packages.filter(pkg => {
      const pkgPath = path.join(packagesPath, pkg);
      return fs.statSync(pkgPath).isDirectory();
    });
    
    if (structure.microservices.length > 0 && !structure.activeSystem) {
      structure.activeSystem = 'packages';
      structure.type = 'microservices';
    }
  }

  // Verificar projeto arquivado
  const oldProjectPath = path.join(root, '_OLD_PROJECT');
  if (fs.existsSync(oldProjectPath)) {
    structure.hasOldProject = true;
    structure.archivedSystems.push('_OLD_PROJECT');
    
    // Verificar se tem packages dentro
    const oldPackages = path.join(oldProjectPath, 'packages');
    if (fs.existsSync(oldPackages)) {
      structure.archivedSystems.push('_OLD_PROJECT/packages');
    }
  }

  return structure;
}

/**
 * Verifica a idade dos diretórios (quando foram modificados)
 */
function checkDirectoryAge(structure) {
  const ages = {};
  const root = process.cwd();

  const dirsToCheck = [
    structure.nextjs,
    'packages',
    '_OLD_PROJECT',
  ].filter(Boolean);

  dirsToCheck.forEach(dir => {
    const fullPath = path.join(root, dir);
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      ages[dir] = {
        created: stats.birthtime,
        modified: stats.mtime,
        age: Math.floor((Date.now() - stats.mtime) / (1000 * 60 * 60)), // horas
      };
    }
  });

  return ages;
}

/**
 * Determina qual sistema é o ativo baseado em idade e estrutura
 */
function determineActiveSystem(structure, ages) {
  if (!structure.activeSystem) {
    log('\n⚠️  Nenhum sistema ativo detectado automaticamente.', 'yellow');
    return null;
  }

  const activeAge = ages[structure.activeSystem];
  
  // Se o sistema ativo foi modificado nas últimas 24h, está definitivamente ativo
  if (activeAge && activeAge.age < 24) {
    return {
      system: structure.activeSystem,
      confidence: 'HIGH',
      reason: `Modificado há ${activeAge.age} hora(s)`,
    };
  }

  // Se tem Next.js e é recente, provavelmente é o ativo
  if (structure.nextjs && ages[structure.nextjs]?.age < 168) { // 1 semana
    return {
      system: structure.nextjs,
      confidence: 'MEDIUM',
      reason: `Next.js modificado há ${ages[structure.nextjs].age} hora(s)`,
    };
  }

  return {
    system: structure.activeSystem,
    confidence: 'LOW',
    reason: 'Detectado pela estrutura, mas idade desconhecida',
  };
}

/**
 * Gera relatório visual da estrutura
 */
function generateReport(structure, ages, activeSystem) {
  console.log('\n' + '='.repeat(60));
  log('📊 RELATÓRIO DA ESTRUTURA DO PROJETO', 'blue');
  console.log('='.repeat(60) + '\n');

  // Tipo de projeto
  log(`Tipo de Projeto: ${structure.type || 'DESCONHECIDO'}`, 'green');
  
  // Sistema ativo
  if (activeSystem) {
    log(`\n✅ Sistema Ativo Detectado: ${activeSystem.system}`, 'green');
    log(`   Confiança: ${activeSystem.confidence}`, 'blue');
    log(`   Razão: ${activeSystem.reason}`, 'blue');
  }

  // Next.js
  if (structure.nextjs) {
    const age = ages[structure.nextjs];
    log(`\n📦 Next.js encontrado: ${structure.nextjs}/`, 'green');
    if (age) {
      log(`   Criado: ${age.created.toLocaleString('pt-BR')}`, 'blue');
      log(`   Modificado: ${age.modified.toLocaleString('pt-BR')}`, 'blue');
      log(`   Idade: ${age.age} hora(s) desde última modificação`, 'blue');
    }
  }

  // Microserviços
  if (structure.hasPackages) {
    log(`\n📦 Microserviços encontrados: packages/`, 'green');
    log(`   Total: ${structure.microservices.length} microserviços`, 'blue');
    structure.microservices.forEach(ms => {
      log(`   - ${ms}`, 'blue');
    });
  }

  // Sistemas arquivados
  if (structure.archivedSystems.length > 0) {
    log(`\n📁 Sistemas Arquivados:`, 'yellow');
    structure.archivedSystems.forEach(sys => {
      const age = ages[sys.split('/')[0]];
      log(`   - ${sys}`, 'yellow');
      if (age) {
        log(`     Modificado: ${age.modified.toLocaleString('pt-BR')}`, 'yellow');
      }
    });
  }

  console.log('\n' + '='.repeat(60) + '\n');
}

/**
 * Gera recomendações baseadas na análise
 */
function generateRecommendations(structure, activeSystem) {
  log('💡 RECOMENDAÇÕES', 'blue');
  console.log('='.repeat(60) + '\n');

  if (!activeSystem) {
    log('⚠️  Não foi possível determinar o sistema ativo.', 'yellow');
    log('   Recomendação: Verifique manualmente qual diretório contém o código atual.\n', 'yellow');
    return;
  }

  if (activeSystem.confidence === 'HIGH') {
    log('✅ Sistema ativo identificado com alta confiança!', 'green');
    log(`   Trabalhe em: ${activeSystem.system}/\n`, 'green');
  } else if (activeSystem.confidence === 'MEDIUM') {
    log('⚠️  Sistema ativo identificado com média confiança.', 'yellow');
    log(`   Recomendado: ${activeSystem.system}/`, 'yellow');
    log('   Sugestão: Confirme manualmente antes de fazer alterações.\n', 'yellow');
  } else {
    log('⚠️  Sistema ativo identificado com baixa confiança.', 'yellow');
    log(`   Possível: ${activeSystem.system}/`, 'yellow');
    log('   IMPORTANTE: Confirme com o usuário antes de prosseguir!\n', 'yellow');
  }

  // Avisos sobre sistemas arquivados
  if (structure.hasOldProject) {
    log('📁 Sistema arquivado detectado (_OLD_PROJECT/)', 'yellow');
    log('   ATENÇÃO: Não trabalhe neste diretório sem confirmação explícita.\n', 'yellow');
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * Exporta resultado como JSON para ser usado por outros scripts
 */
function exportResult(structure, activeSystem) {
  const result = {
    timestamp: new Date().toISOString(),
    structure,
    activeSystem,
    recommendation: activeSystem ? {
      workIn: activeSystem.system,
      confidence: activeSystem.confidence,
      shouldConfirm: activeSystem.confidence !== 'HIGH',
    } : null,
  };

  const outputPath = path.join(process.cwd(), '.project-structure.json');
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  
  log(`💾 Resultado exportado para: .project-structure.json`, 'green');
}

/**
 * Main function
 */
function main() {
  log('\n🔍 VERIFICANDO ESTRUTURA DO PROJETO...', 'blue');
  log('Analisando diretórios e identificando sistema ativo...\n', 'blue');

  try {
    const structure = identifyProjectStructure();
    const ages = checkDirectoryAge(structure);
    const activeSystem = determineActiveSystem(structure, ages);

    generateReport(structure, ages, activeSystem);
    generateRecommendations(structure, activeSystem);
    exportResult(structure, activeSystem);

    log('✅ Análise concluída com sucesso!\n', 'green');

    // Return code baseado na confiança
    if (!activeSystem) {
      process.exit(1); // Não conseguiu determinar
    } else if (activeSystem.confidence === 'LOW') {
      process.exit(2); // Baixa confiança, precisa confirmação
    } else {
      process.exit(0); // Sucesso
    }
  } catch (error) {
    log(`\n❌ Erro durante análise: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Executar
main();

export { identifyProjectStructure, checkDirectoryAge, determineActiveSystem };

