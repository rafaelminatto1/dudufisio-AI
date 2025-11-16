#!/usr/bin/env node

/**
 * Script de Alertas de Vulnerabilidades
 * 
 * Lê relatórios de auditoria recentes e alerta se:
 * - Vulnerabilidades CRITICAL ou HIGH por > 7 dias
 * - Novas vulnerabilidades apareceram
 */

const fs = require('fs');
const path = require('path');

const SECURITY_AUDITS_DIR = path.join(__dirname, '../security-audits');
const ALERT_THRESHOLD_DAYS = 7;

/**
 * Lista todos os relatórios de auditoria
 */
function listAuditReports() {
  if (!fs.existsSync(SECURITY_AUDITS_DIR)) {
    return [];
  }

  const files = fs.readdirSync(SECURITY_AUDITS_DIR)
    .filter(f => f.startsWith('audit-') && f.endsWith('.md'))
    .map(f => {
      const filePath = path.join(SECURITY_AUDITS_DIR, f);
      const stats = fs.statSync(filePath);
      return {
        name: f,
        path: filePath,
        date: stats.mtime
      };
    })
    .sort((a, b) => b.date - a.date);

  return files;
}

/**
 * Analisa relatório para extrair vulnerabilidades de alto risco
 */
function analyzeReport(reportPath) {
  const content = fs.readFileSync(reportPath, 'utf-8');
  
  const hasCritical = content.includes('CRITICAL Risk Vulnerabilities') || 
                      content.includes('## CRITICAL');
  const hasHigh = content.includes('HIGH Risk Vulnerabilities') || 
                  content.includes('## HIGH');
  
  const criticalCount = (content.match(/\*\*Risco Real\*\*: CRITICAL/g) || []).length;
  const highCount = (content.match(/\*\*Risco Real\*\*: HIGH/g) || []).length;

  return {
    hasCritical,
    hasHigh,
    criticalCount,
    highCount,
    totalHighRisk: criticalCount + highCount
  };
}

/**
 * Calcula dias desde o primeiro relatório com vulnerabilidades altas
 */
function getDaysSinceFirstAlert(reports) {
  // Percorrer relatórios do mais antigo ao mais novo
  const reversedReports = [...reports].reverse();
  
  for (const report of reversedReports) {
    const analysis = analyzeReport(report.path);
    if (analysis.totalHighRisk > 0) {
      const daysSince = Math.floor((Date.now() - report.date.getTime()) / (1000 * 60 * 60 * 24));
      return {
        days: daysSince,
        firstReport: report.name,
        firstReportDate: report.date
      };
    }
  }
  
  return null;
}

/**
 * Gera alerta se necessário
 */
function generateAlert(reports) {
  if (reports.length === 0) {
    console.log('⚠️  Nenhum relatório de auditoria encontrado');
    console.log('Execute: npm run security:audit');
    return;
  }

  const latestReport = reports[0];
  const latestAnalysis = analyzeReport(latestReport.path);

  console.log('🔍 Análise de Vulnerabilidades');
  console.log('='.repeat(60));
  console.log(`Último relatório: ${latestReport.name}`);
  console.log(`Data: ${latestReport.date.toLocaleString('pt-BR')}`);
  console.log('');
  console.log(`Vulnerabilidades de alto risco:`);
  console.log(`  CRITICAL: ${latestAnalysis.criticalCount}`);
  console.log(`  HIGH: ${latestAnalysis.highCount}`);
  console.log(`  TOTAL: ${latestAnalysis.totalHighRisk}`);
  console.log('');

  if (latestAnalysis.totalHighRisk === 0) {
    console.log('✅ Nenhuma vulnerabilidade de alto risco');
    console.log('Sistema está seguro!');
    return;
  }

  // Verificar há quanto tempo as vulnerabilidades existem
  const alertInfo = getDaysSinceFirstAlert(reports);
  
  if (alertInfo) {
    console.log(`⏰ Vulnerabilidades presentes há ${alertInfo.days} dias`);
    console.log(`   Primeiro detectado em: ${alertInfo.firstReportDate.toLocaleDateString('pt-BR')}`);
    console.log('');

    if (alertInfo.days >= ALERT_THRESHOLD_DAYS) {
      console.log('🔴 ALERTA: AÇÃO NECESSÁRIA!');
      console.log('='.repeat(60));
      console.log(`Vulnerabilidades de alto risco presentes há ${alertInfo.days} dias`);
      console.log(`Limite: ${ALERT_THRESHOLD_DAYS} dias`);
      console.log('');
      console.log('Ações recomendadas:');
      console.log('1. Revisar relatório: ' + latestReport.path);
      console.log('2. Aplicar correções: npm audit fix');
      console.log('3. Se requer --force, testar em branch separada');
      console.log('4. Consultar ANALISE_VULNERABILIDADES_NPM.md');
      console.log('='.repeat(60));
      
      // Exit code 1 para indicar alerta
      process.exit(1);
    } else {
      const daysRemaining = ALERT_THRESHOLD_DAYS - alertInfo.days;
      console.log(`⚠️  ATENÇÃO: ${daysRemaining} dias restantes até ação obrigatória`);
      console.log('Monitore diariamente.');
    }
  } else {
    console.log('⚠️  Vulnerabilidades detectadas pela primeira vez');
    console.log('Monitore nos próximos dias.');
  }
}

/**
 * Função principal
 */
function main() {
  const reports = listAuditReports();
  generateAlert(reports);
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { listAuditReports, analyzeReport, getDaysSinceFirstAlert };

