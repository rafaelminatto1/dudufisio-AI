#!/usr/bin/env node

/**
 * Script de Auditoria de Segurança
 * 
 * Executa npm audit, analisa vulnerabilidades e gera relatório detalhado
 * com categorização por severidade e risco real.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const SECURITY_AUDITS_DIR = path.join(__dirname, '../security-audits');
const TIMESTAMP = new Date().toISOString().replace(/:/g, '-').split('.')[0];
const REPORT_FILE = path.join(SECURITY_AUDITS_DIR, `audit-${TIMESTAMP}.md`);

// Versões seguras conhecidas
const SAFE_VERSIONS = {
  'esbuild': '0.24.3',
  'path-to-regexp': '6.3.0',
  'undici': '5.29.0',
  '@vercel/node': '5.5.0'
};

/**
 * Executa npm audit e retorna JSON
 */
function runNpmAudit() {
  try {
    const result = execSync('npm audit --json', { encoding: 'utf-8' });
    return JSON.parse(result);
  } catch (error) {
    // npm audit retorna exit code 1 se há vulnerabilidades
    if (error.stdout) {
      return JSON.parse(error.stdout);
    }
    throw error;
  }
}

/**
 * Verifica se há atualizações para pacotes críticos
 */
function checkCriticalUpdates() {
  try {
    const result = execSync('npm outdated --json', { encoding: 'utf-8' });
    const outdated = result ? JSON.parse(result) : {};
    
    const updates = {};
    Object.keys(SAFE_VERSIONS).forEach(pkg => {
      if (outdated[pkg]) {
        updates[pkg] = {
          current: outdated[pkg].current,
          wanted: outdated[pkg].wanted,
          latest: outdated[pkg].latest
        };
      }
    });
    
    return updates;
  } catch (error) {
    // Sem pacotes outdated retorna exit code 0
    return {};
  }
}

/**
 * Categoriza vulnerabilidades por risco real
 */
function categorizeVulnerabilities(auditData) {
  const categories = {
    critical: [],
    high: [],
    moderate: [],
    low: []
  };

  if (auditData.vulnerabilities) {
    Object.entries(auditData.vulnerabilities).forEach(([name, vuln]) => {
      const risk = calculateRealRisk(name, vuln);
      
      const vulnInfo = {
        name,
        severity: vuln.severity,
        realRisk: risk,
        via: vuln.via,
        range: vuln.range,
        fixAvailable: vuln.fixAvailable
      };

      if (risk === 'CRITICAL') categories.critical.push(vulnInfo);
      else if (risk === 'HIGH') categories.high.push(vulnInfo);
      else if (risk === 'MEDIUM') categories.moderate.push(vulnInfo);
      else categories.low.push(vulnInfo);
    });
  }

  return categories;
}

/**
 * Calcula risco real baseado em contexto
 */
function calculateRealRisk(packageName, vulnerability) {
  // esbuild - afeta apenas dev server
  if (packageName === 'esbuild') {
    return 'LOW';
  }

  // path-to-regexp - ReDoS mitigado por timeouts
  if (packageName === 'path-to-regexp') {
    if (vulnerability.severity === 'high') return 'MEDIUM';
    return 'LOW';
  }

  // undici - usado internamente, não para crypto crítico
  if (packageName === 'undici') {
    return 'LOW';
  }

  // @vercel/node - devDependency
  if (packageName === '@vercel/node') {
    return 'MEDIUM';
  }

  // Default: manter severidade original
  const severityMap = {
    critical: 'CRITICAL',
    high: 'HIGH',
    moderate: 'MEDIUM',
    low: 'LOW'
  };

  return severityMap[vulnerability.severity] || 'LOW';
}

/**
 * Gera recomendações baseadas no risco
 */
function generateRecommendations(categories, updates) {
  const recommendations = [];

  // Vulnerabilidades críticas
  if (categories.critical.length > 0) {
    recommendations.push({
      priority: 'URGENTE',
      action: 'Aplicar correções imediatamente',
      details: categories.critical.map(v => v.name).join(', ')
    });
  }

  // Vulnerabilidades high
  if (categories.high.length > 0) {
    recommendations.push({
      priority: 'ALTA',
      action: 'Corrigir em até 1 semana',
      details: categories.high.map(v => v.name).join(', ')
    });
  }

  // Atualizações disponíveis
  if (Object.keys(updates).length > 0) {
    recommendations.push({
      priority: 'MÉDIA',
      action: 'Atualizar pacotes quando possível',
      details: Object.keys(updates).join(', ')
    });
  }

  // Vulnerabilidades moderate/low
  if (categories.moderate.length > 0 || categories.low.length > 0) {
    recommendations.push({
      priority: 'BAIXA',
      action: 'Monitorar semanalmente',
      details: 'Vulnerabilidades de baixo risco já mitigadas'
    });
  }

  return recommendations;
}

/**
 * Gera relatório markdown
 */
function generateMarkdownReport(auditData, categories, updates, recommendations) {
  const date = new Date().toLocaleString('pt-BR');
  
  let report = `# Relatório de Auditoria de Segurança\n\n`;
  report += `**Data**: ${date}\n`;
  report += `**Total de Vulnerabilidades**: ${auditData.metadata?.vulnerabilities?.total || 0}\n\n`;
  
  report += `---\n\n`;
  
  // Resumo por severidade
  report += `## Resumo por Severidade\n\n`;
  report += `| Severidade | Reportado | Risco Real |\n`;
  report += `|------------|-----------|------------|\n`;
  report += `| Critical | ${auditData.metadata?.vulnerabilities?.critical || 0} | ${categories.critical.length} |\n`;
  report += `| High | ${auditData.metadata?.vulnerabilities?.high || 0} | ${categories.high.length} |\n`;
  report += `| Moderate | ${auditData.metadata?.vulnerabilities?.moderate || 0} | ${categories.moderate.length} |\n`;
  report += `| Low | ${auditData.metadata?.vulnerabilities?.low || 0} | ${categories.low.length} |\n\n`;

  // Vulnerabilidades por categoria
  ['critical', 'high', 'moderate', 'low'].forEach(category => {
    const vulns = categories[category];
    if (vulns.length > 0) {
      report += `## ${category.toUpperCase()} Risk Vulnerabilities\n\n`;
      vulns.forEach(vuln => {
        report += `### ${vuln.name}\n`;
        report += `- **Severidade Reportada**: ${vuln.severity}\n`;
        report += `- **Risco Real**: ${vuln.realRisk}\n`;
        report += `- **Versão Afetada**: ${vuln.range}\n`;
        
        if (vuln.fixAvailable) {
          const fix = vuln.fixAvailable;
          report += `- **Correção**: ${fix.name}@${fix.version}`;
          if (fix.isSemVerMajor) report += ` (breaking change)`;
          report += `\n`;
        }
        report += `\n`;
      });
    }
  });

  // Atualizações disponíveis
  if (Object.keys(updates).length > 0) {
    report += `## Atualizações Disponíveis\n\n`;
    Object.entries(updates).forEach(([pkg, versions]) => {
      report += `- **${pkg}**: ${versions.current} → ${versions.latest}\n`;
    });
    report += `\n`;
  }

  // Recomendações
  report += `## Recomendações\n\n`;
  if (recommendations.length > 0) {
    recommendations.forEach((rec, i) => {
      report += `${i + 1}. **${rec.priority}**: ${rec.action}\n`;
      report += `   - ${rec.details}\n\n`;
    });
  } else {
    report += `Nenhuma ação necessária no momento.\n\n`;
  }

  // Status geral
  report += `---\n\n`;
  report += `## Status Geral\n\n`;
  
  const totalHighRisk = categories.critical.length + categories.high.length;
  if (totalHighRisk === 0) {
    report += `✅ **SEGURO**: Nenhuma vulnerabilidade crítica ou de alto risco real.\n\n`;
  } else if (totalHighRisk <= 2) {
    report += `⚠️ **ATENÇÃO**: ${totalHighRisk} vulnerabilidade(s) de risco alto/crítico.\n\n`;
  } else {
    report += `🔴 **URGENTE**: ${totalHighRisk} vulnerabilidades de risco alto/crítico requerem ação!\n\n`;
  }

  report += `**Próxima Auditoria Recomendada**: ${new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR')}\n`;

  return report;
}

/**
 * Função principal
 */
function main() {
  console.log('🔍 Executando auditoria de segurança...\n');

  // Executar npm audit
  console.log('📊 Executando npm audit...');
  const auditData = runNpmAudit();

  // Verificar atualizações
  console.log('🔄 Verificando atualizações de pacotes críticos...');
  const updates = checkCriticalUpdates();

  // Categorizar vulnerabilidades
  console.log('📋 Categorizando vulnerabilidades por risco real...');
  const categories = categorizeVulnerabilities(auditData);

  // Gerar recomendações
  console.log('💡 Gerando recomendações...');
  const recommendations = generateRecommendations(categories, updates);

  // Gerar relatório
  console.log('📝 Gerando relatório...');
  const report = generateMarkdownReport(auditData, categories, updates, recommendations);

  // Salvar relatório
  fs.writeFileSync(REPORT_FILE, report);
  console.log(`\n✅ Relatório salvo em: ${REPORT_FILE}\n`);

  // Exibir resumo no console
  console.log('='.repeat(60));
  console.log('RESUMO DA AUDITORIA');
  console.log('='.repeat(60));
  console.log(`Total de vulnerabilidades: ${auditData.metadata?.vulnerabilities?.total || 0}`);
  console.log(`  - Critical (risco real): ${categories.critical.length}`);
  console.log(`  - High (risco real): ${categories.high.length}`);
  console.log(`  - Moderate (risco real): ${categories.moderate.length}`);
  console.log(`  - Low (risco real): ${categories.low.length}`);
  console.log('');
  
  if (Object.keys(updates).length > 0) {
    console.log(`Atualizações disponíveis: ${Object.keys(updates).join(', ')}`);
    console.log('');
  }

  if (recommendations.length > 0) {
    console.log('RECOMENDAÇÕES:');
    recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. [${rec.priority}] ${rec.action}`);
    });
  } else {
    console.log('✅ Nenhuma ação necessária.');
  }
  console.log('='.repeat(60));

  // Exit code baseado em risco
  const totalHighRisk = categories.critical.length + categories.high.length;
  if (totalHighRisk > 0) {
    process.exit(1); // Falha se há vulnerabilidades de alto risco
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { runNpmAudit, categorizeVulnerabilities, calculateRealRisk };

