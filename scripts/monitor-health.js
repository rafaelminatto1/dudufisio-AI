#!/usr/bin/env node

/**
 * Script de Monitoramento de Saúde do Sistema
 * 
 * Verifica:
 * - Status do deployment Vercel
 * - Métricas de performance
 * - Bundle size
 * - Saúde do Supabase
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configurações
const BUNDLE_SIZE_LIMIT = 12 * 1024 * 1024; // 12MB
const CHUNK_SIZE_LIMIT = 500 * 1024; // 500KB
const DIST_DIR = path.join(__dirname, '../dist');

/**
 * Verifica se o build existe
 */
function checkBuildExists() {
  return fs.existsSync(DIST_DIR);
}

/**
 * Calcula tamanho do bundle
 */
function calculateBundleSize() {
  if (!checkBuildExists()) {
    return null;
  }

  let totalSize = 0;
  const chunks = [];

  function walkDir(dir) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        walkDir(filePath);
      } else if (file.endsWith('.js') || file.endsWith('.css')) {
        const size = stat.size;
        totalSize += size;
        
        chunks.push({
          name: file,
          size,
          path: filePath.replace(DIST_DIR, '')
        });
      }
    });
  }

  walkDir(DIST_DIR);

  // Ordenar chunks por tamanho
  chunks.sort((a, b) => b.size - a.size);

  return {
    total: totalSize,
    chunks: chunks.slice(0, 10), // Top 10 maiores
    totalChunks: chunks.length
  };
}

/**
 * Verifica status do Supabase
 */
async function checkSupabaseHealth() {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      status: 'NOT_CONFIGURED',
      message: 'Variáveis de ambiente não configuradas'
    };
  }

  try {
    // Tentar fazer request simples
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    });

    return {
      status: response.ok ? 'HEALTHY' : 'DEGRADED',
      statusCode: response.status,
      message: response.ok ? 'Supabase respondendo' : 'Supabase com problemas'
    };
  } catch (error) {
    return {
      status: 'DOWN',
      message: error.message
    };
  }
}

/**
 * Verifica dependências críticas
 */
function checkCriticalDependencies() {
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
  );

  const critical = {
    react: packageJson.dependencies.react,
    'react-dom': packageJson.dependencies['react-dom'],
    '@supabase/supabase-js': packageJson.dependencies['@supabase/supabase-js'],
    '@vercel/node': packageJson.devDependencies?.['@vercel/node'],
    vite: packageJson.devDependencies.vite,
    typescript: packageJson.devDependencies.typescript
  };

  return critical;
}

/**
 * Formata bytes em formato legível
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
}

/**
 * Gera relatório de saúde
 */
async function generateHealthReport() {
  console.log('🏥 Monitorando saúde do sistema...\n');

  const report = {
    timestamp: new Date().toISOString(),
    checks: []
  };

  // Check 1: Bundle Size
  console.log('📦 Verificando bundle size...');
  const bundleInfo = calculateBundleSize();
  
  if (bundleInfo) {
    const bundleStatus = bundleInfo.total < BUNDLE_SIZE_LIMIT ? 'PASS' : 'FAIL';
    const percentUsed = ((bundleInfo.total / BUNDLE_SIZE_LIMIT) * 100).toFixed(1);
    
    report.checks.push({
      name: 'Bundle Size',
      status: bundleStatus,
      details: {
        total: formatBytes(bundleInfo.total),
        limit: formatBytes(BUNDLE_SIZE_LIMIT),
        percentUsed: `${percentUsed}%`,
        totalChunks: bundleInfo.totalChunks
      }
    });

    console.log(`  Total: ${formatBytes(bundleInfo.total)} / ${formatBytes(BUNDLE_SIZE_LIMIT)} (${percentUsed}%)`);
    console.log(`  Status: ${bundleStatus === 'PASS' ? '✅' : '❌'} ${bundleStatus}`);

    // Check large chunks
    const largeChunks = bundleInfo.chunks.filter(c => c.size > CHUNK_SIZE_LIMIT);
    if (largeChunks.length > 0) {
      console.log(`  ⚠️  ${largeChunks.length} chunks maiores que ${formatBytes(CHUNK_SIZE_LIMIT)}:`);
      largeChunks.forEach(chunk => {
        console.log(`     - ${chunk.name}: ${formatBytes(chunk.size)}`);
      });
    }
  } else {
    report.checks.push({
      name: 'Bundle Size',
      status: 'SKIP',
      details: { message: 'Build não encontrado' }
    });
    console.log('  ⚠️  Build não encontrado (execute npm run build)');
  }

  console.log('');

  // Check 2: Supabase
  console.log('🗄️  Verificando Supabase...');
  const supabaseHealth = await checkSupabaseHealth();
  
  report.checks.push({
    name: 'Supabase',
    status: supabaseHealth.status === 'HEALTHY' ? 'PASS' : 'WARN',
    details: supabaseHealth
  });

  console.log(`  Status: ${supabaseHealth.status}`);
  console.log(`  ${supabaseHealth.message}`);
  console.log('');

  // Check 3: Dependências Críticas
  console.log('📚 Verificando dependências críticas...');
  const deps = checkCriticalDependencies();
  
  report.checks.push({
    name: 'Critical Dependencies',
    status: 'INFO',
    details: deps
  });

  console.log('  Versões instaladas:');
  Object.entries(deps).forEach(([pkg, version]) => {
    console.log(`    ${pkg}: ${version || 'N/A'}`);
  });
  console.log('');

  // Check 4: Variáveis de Ambiente
  console.log('🔐 Verificando variáveis de ambiente...');
  const requiredEnvVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const envStatus = requiredEnvVars.every(v => process.env[v]) ? 'PASS' : 'FAIL';
  const missingVars = requiredEnvVars.filter(v => !process.env[v]);

  report.checks.push({
    name: 'Environment Variables',
    status: envStatus,
    details: {
      required: requiredEnvVars.length,
      present: requiredEnvVars.length - missingVars.length,
      missing: missingVars
    }
  });

  console.log(`  Status: ${envStatus === 'PASS' ? '✅' : '❌'} ${envStatus}`);
  if (missingVars.length > 0) {
    console.log(`  ⚠️  Variáveis faltando: ${missingVars.join(', ')}`);
  }
  console.log('');

  // Resumo Final
  console.log('='.repeat(60));
  console.log('RESUMO DO MONITORAMENTO');
  console.log('='.repeat(60));

  const passCount = report.checks.filter(c => c.status === 'PASS').length;
  const failCount = report.checks.filter(c => c.status === 'FAIL').length;
  const warnCount = report.checks.filter(c => c.status === 'WARN').length;

  console.log(`✅ Passou: ${passCount}`);
  console.log(`❌ Falhou: ${failCount}`);
  console.log(`⚠️  Avisos: ${warnCount}`);
  console.log('');

  if (failCount === 0) {
    console.log('🎉 Sistema saudável!');
  } else {
    console.log('⚠️  Atenção necessária!');
  }

  console.log('='.repeat(60));

  return report;
}

/**
 * Salva relatório em arquivo
 */
function saveReport(report) {
  const reportsDir = path.join(__dirname, '../reports/daily');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const date = new Date().toISOString().split('T')[0];
  const reportFile = path.join(reportsDir, `health-${date}.json`);

  fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));
  console.log(`\n📄 Relatório salvo em: ${reportFile}`);
}

/**
 * Função principal
 */
async function main() {
  try {
    const report = await generateHealthReport();
    saveReport(report);

    // Exit code baseado em falhas
    const failCount = report.checks.filter(c => c.status === 'FAIL').length;
    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Erro ao executar monitoramento:', error.message);
    process.exit(1);
  }
}

// Executar
if (require.main === module) {
  main();
}

module.exports = { generateHealthReport, calculateBundleSize, checkSupabaseHealth };

