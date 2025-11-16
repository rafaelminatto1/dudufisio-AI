#!/usr/bin/env node

/**
 * Script de Resumo Diário
 * 
 * Coleta métricas do dia e gera relatório markdown
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REPORTS_DIR = path.join(__dirname, '../reports/daily');
const TODAY = new Date().toISOString().split('T')[0];
const REPORT_FILE = path.join(REPORTS_DIR, `summary-${TODAY}.md`);

/**
 * Obtém último commit do dia
 */
function getTodayCommits() {
  try {
    const result = execSync('git log --since="today 00:00" --oneline', { encoding: 'utf-8' });
    return result.trim().split('\n').filter(Boolean);
  } catch {
    return [];
  }
}

/**
 * Verifica último status de build
 */
function getBuildStatus() {
  const distDir = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distDir)) {
    return { status: 'NOT_BUILT', message: 'Build não executado hoje' };
  }

  const stats = fs.statSync(distDir);
  const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

  if (ageHours < 24) {
    return { 
      status: 'FRESH', 
      message: `Build executado há ${Math.floor(ageHours)}h`,
      time: stats.mtime
    };
  } else {
    return { 
      status: 'OLD', 
      message: `Build antigo (${Math.floor(ageHours)}h)`,
      time: stats.mtime
    };
  }
}

/**
 * Conta arquivos de teste
 */
function countTestFiles() {
  const testsDir = path.join(__dirname, '../tests');
  let count = 0;

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      if (fs.statSync(filePath).isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.spec.ts') || file.endsWith('.test.ts')) {
        count++;
      }
    });
  }

  if (fs.existsSync(testsDir)) {
    walkDir(testsDir);
  }

  return count;
}

/**
 * Gera relatório markdown
 */
function generateReport() {
  const commits = getTodayCommits();
  const buildStatus = getBuildStatus();
  const testCount = countTestFiles();

  let report = `# Resumo Diário - ${new Date().toLocaleDateString('pt-BR')}\n\n`;
  
  report += `## Git Activity\n\n`;
  if (commits.length > 0) {
    report += `**Commits hoje**: ${commits.length}\n\n`;
    commits.forEach(commit => {
      report += `- ${commit}\n`;
    });
  } else {
    report += `Nenhum commit hoje.\n`;
  }
  report += `\n`;

  report += `## Build Status\n\n`;
  report += `**Status**: ${buildStatus.status}\n`;
  report += `**Mensagem**: ${buildStatus.message}\n`;
  if (buildStatus.time) {
    report += `**Última build**: ${buildStatus.time.toLocaleString('pt-BR')}\n`;
  }
  report += `\n`;

  report += `## Testes\n\n`;
  report += `**Total de arquivos de teste**: ${testCount}\n`;
  report += `**Última execução**: Ver workflow do GitHub Actions\n`;
  report += `\n`;

  report += `## Próximas Ações\n\n`;
  report += `- [ ] Executar auditoria de segurança (npm run security:audit)\n`;
  report += `- [ ] Executar testes críticos (npm run test:critical)\n`;
  report += `- [ ] Verificar saúde do sistema (npm run monitor:health)\n`;
  report += `\n`;

  report += `---\n\n`;
  report += `*Gerado automaticamente em ${new Date().toLocaleString('pt-BR')}*\n`;

  return report;
}

/**
 * Função principal
 */
function main() {
  console.log('📊 Gerando resumo diário...\n');

  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true });
  }

  const report = generateReport();
  fs.writeFileSync(REPORT_FILE, report);

  console.log('✅ Resumo salvo em:', REPORT_FILE);
  console.log('\nPrévia:\n');
  console.log(report);
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { generateReport, getTodayCommits, getBuildStatus };

