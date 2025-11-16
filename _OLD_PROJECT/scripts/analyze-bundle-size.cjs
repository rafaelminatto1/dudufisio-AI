#!/usr/bin/env node

/**
 * Script de Análise de Bundle Size
 *
 * Analisa os bundles de produção e identifica oportunidades de otimização.
 *
 * Uso:
 *   npm run build && node scripts/analyze-bundle-size.js
 *   npm run bundle:analyze
 *
 * Gera:
 *   - Relatório de tamanho dos bundles
 *   - Top módulos pesados
 *   - Recomendações de otimização
 */

const fs = require('fs');
const path = require('path');

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

/**
 * Formatar bytes para leitura humana
 */
function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

/**
 * Calcular porcentagem
 */
function percentage(part, total) {
  return ((part / total) * 100).toFixed(1) + '%';
}

/**
 * Ler tamanhos dos arquivos no dist
 */
function getBundleSizes() {
  const distPath = path.join(process.cwd(), 'dist', 'assets');

  if (!fs.existsSync(distPath)) {
    error('Pasta dist/assets não encontrada');
    error('Execute npm run build primeiro');
    return null;
  }

  const files = fs.readdirSync(distPath);
  const bundles = [];
  let totalSize = 0;

  for (const file of files) {
    if (file.endsWith('.js')) {
      const filePath = path.join(distPath, file);
      const stats = fs.statSync(filePath);
      const size = stats.size;

      bundles.push({
        name: file,
        size: size,
        sizeFormatted: formatBytes(size),
      });

      totalSize += size;
    }
  }

  // Ordenar por tamanho (maior primeiro)
  bundles.sort((a, b) => b.size - a.size);

  return {
    bundles,
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
  };
}

/**
 * Classificar bundles por tipo
 */
function classifyBundles(bundles) {
  const classification = {
    vendor: [],
    pages: [],
    chunks: [],
    main: null,
  };

  for (const bundle of bundles) {
    if (bundle.name.includes('vendor')) {
      classification.vendor.push(bundle);
    } else if (bundle.name.includes('Page')) {
      classification.pages.push(bundle);
    } else if (bundle.name.includes('index-')) {
      classification.main = bundle;
    } else {
      classification.chunks.push(bundle);
    }
  }

  return classification;
}

/**
 * Analisar vendor bundles
 */
function analyzeVendorBundles(vendorBundles, totalSize) {
  console.log('');
  log('📦 VENDOR BUNDLES', colors.blue);
  console.log('='.repeat(80));
  console.log('');

  if (vendorBundles.length === 0) {
    warning('Nenhum vendor bundle encontrado');
    return;
  }

  for (const bundle of vendorBundles) {
    const pct = percentage(bundle.size, totalSize);
    const status = bundle.size > 400 * 1024 ? colors.red :
                   bundle.size > 300 * 1024 ? colors.yellow :
                   colors.green;

    log(`${bundle.name}`, status);
    log(`  Tamanho: ${bundle.sizeFormatted} (${pct} do total)`, status);

    // Identificar componentes prováveis
    if (bundle.name.includes('common')) {
      info('  Contém: Dependências compartilhadas (React, utils)');
    } else if (bundle.name.includes('react')) {
      info('  Contém: React e React-DOM');
    } else if (bundle.name.includes('router')) {
      info('  Contém: React Router');
    } else if (bundle.name.includes('ui')) {
      info('  Contém: Componentes UI (Radix, etc)');
    }

    console.log('');
  }
}

/**
 * Analisar page bundles
 */
function analyzePageBundles(pageBundles, totalSize) {
  console.log('');
  log('📄 PAGE BUNDLES', colors.blue);
  console.log('='.repeat(80));
  console.log('');

  if (pageBundles.length === 0) {
    warning('Nenhum page bundle encontrado (code splitting pode não estar funcionando)');
    return;
  }

  info(`Total de páginas com code splitting: ${pageBundles.length}`);
  console.log('');

  // Top 5 maiores páginas
  const topPages = pageBundles.slice(0, 5);

  log('Top 5 Maiores Páginas:', colors.yellow);
  for (let i = 0; i < topPages.length; i++) {
    const page = topPages[i];
    const pct = percentage(page.size, totalSize);
    log(`  ${i + 1}. ${page.name}: ${page.sizeFormatted} (${pct})`, colors.gray);
  }

  console.log('');

  // Páginas muito grandes (> 200KB)
  const largePagesCount = pageBundles.filter(p => p.size > 200 * 1024).length;
  const heavyPages = pageBundles.filter(p => p.size > 200 * 1024);

  if (largePagesCount > 0) {
    warning(`${largePagesCount} página(s) > 200KB detectadas:`);
    for (const page of heavyPages) {
      log(`  • ${page.name}: ${page.sizeFormatted}`, colors.yellow);
    }
    console.log('');
    info('Considere otimizar essas páginas com lazy loading adicional');
  } else {
    success('Todas as páginas estão abaixo de 200KB ✅');
  }

  console.log('');
}

/**
 * Gerar recomendações de otimização
 */
function generateRecommendations(classification, totalSize) {
  console.log('');
  log('💡 RECOMENDAÇÕES DE OTIMIZAÇÃO', colors.blue);
  console.log('='.repeat(80));
  console.log('');

  const recommendations = [];

  // Vendor bundles muito grandes
  const largeVendors = classification.vendor.filter(v => v.size > 400 * 1024);
  if (largeVendors.length > 0) {
    recommendations.push({
      priority: 'HIGH',
      issue: `${largeVendors.length} vendor bundle(s) > 400KB`,
      action: 'Split vendor bundles por categoria',
      details: [
        'manualChunks no vite.config.ts:',
        '  - vendor-react (React, React-DOM)',
        '  - vendor-ui (Radix UI components)',
        '  - vendor-charts (Recharts)',
        '  - vendor-forms (React Hook Form, Zod)',
        '  - vendor-utils (date-fns, lodash)',
      ]
    });
  }

  // Total size muito grande
  if (totalSize > 2 * 1024 * 1024) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: `Bundle total > 2MB (${formatBytes(totalSize)})`,
      action: 'Implementar lazy loading agressivo',
      details: [
        'React.lazy() para componentes pesados',
        'Dynamic imports para módulos grandes',
        'Carregar charts sob demanda',
        'Suspense boundaries adequados',
      ]
    });
  }

  // Páginas muito grandes
  const heavyPages = classification.pages.filter(p => p.size > 200 * 1024);
  if (heavyPages.length > 0) {
    recommendations.push({
      priority: 'MEDIUM',
      issue: `${heavyPages.length} página(s) > 200KB`,
      action: 'Otimizar páginas pesadas',
      details: heavyPages.map(p => `  • ${p.name}: ${p.sizeFormatted}`)
    });
  }

  // Análise de dependências comuns pesadas
  recommendations.push({
    priority: 'LOW',
    issue: 'Dependências pesadas conhecidas',
    action: 'Avaliar alternativas mais leves',
    details: [
      'date-fns: Usar apenas funções necessárias',
      'recharts: Considerar Chart.js (mais leve)',
      'framer-motion: Avaliar necessidade real',
      '@radix-ui: Usar tree-shaking adequado',
    ]
  });

  // Exibir recomendações
  for (const rec of recommendations) {
    const priorityColor = rec.priority === 'HIGH' ? colors.red :
                          rec.priority === 'MEDIUM' ? colors.yellow :
                          colors.blue;

    log(`[${rec.priority}] ${rec.issue}`, priorityColor);
    log(`  Ação: ${rec.action}`, colors.gray);
    for (const detail of rec.details) {
      log(`    ${detail}`, colors.gray);
    }
    console.log('');
  }
}

/**
 * Comparar com budget
 */
function checkBudget(classification) {
  console.log('');
  log('🎯 BUDGET DE PERFORMANCE', colors.blue);
  console.log('='.repeat(80));
  console.log('');

  const budgets = [
    { name: 'Vendor Common', target: 400 * 1024, bundles: classification.vendor.filter(v => v.name.includes('common')) },
    { name: 'Main Bundle', target: 200 * 1024, bundles: classification.main ? [classification.main] : [] },
    { name: 'Página Individual', target: 200 * 1024, bundles: classification.pages },
  ];

  for (const budget of budgets) {
    if (budget.bundles.length === 0) continue;

    const totalSize = budget.bundles.reduce((sum, b) => sum + b.size, 0);
    const avgSize = totalSize / budget.bundles.length;
    const maxSize = Math.max(...budget.bundles.map(b => b.size));

    const status = maxSize <= budget.target ? '✅' : '❌';
    const color = maxSize <= budget.target ? colors.green : colors.red;

    log(`${status} ${budget.name}`, color);
    log(`  Target: ${formatBytes(budget.target)}`, colors.gray);
    log(`  Maior: ${formatBytes(maxSize)}`, color);
    if (budget.bundles.length > 1) {
      log(`  Média: ${formatBytes(avgSize)}`, colors.gray);
    }

    if (maxSize > budget.target) {
      const excess = maxSize - budget.target;
      warning(`  Excede em: ${formatBytes(excess)}`);
    }

    console.log('');
  }
}

/**
 * Gerar relatório completo
 */
function generateReport() {
  console.log('');
  log('🔍 ANÁLISE DE BUNDLE SIZE', colors.blue);
  console.log('='.repeat(80));
  console.log('');

  const data = getBundleSizes();
  if (!data) {
    return 2;
  }

  const { bundles, totalSize, totalSizeFormatted } = data;

  info(`Total de bundles: ${bundles.length}`);
  info(`Tamanho total: ${totalSizeFormatted}`);
  console.log('');

  // Classificar bundles
  const classification = classifyBundles(bundles);

  // Analisar vendor bundles
  analyzeVendorBundles(classification.vendor, totalSize);

  // Analisar page bundles
  analyzePageBundles(classification.pages, totalSize);

  // Verificar budget
  checkBudget(classification);

  // Gerar recomendações
  generateRecommendations(classification, totalSize);

  // Resumo final
  console.log('='.repeat(80));
  log('📊 RESUMO', colors.blue);
  console.log('='.repeat(80));
  console.log('');

  log(`Total Bundles: ${bundles.length}`, colors.gray);
  log(`Vendor Bundles: ${classification.vendor.length}`, colors.gray);
  log(`Page Bundles: ${classification.pages.length}`, colors.gray);
  log(`Tamanho Total: ${totalSizeFormatted}`, colors.gray);

  const largeVendors = classification.vendor.filter(v => v.size > 400 * 1024);
  if (largeVendors.length > 0) {
    error(`\n❌ ${largeVendors.length} vendor bundle(s) acima do budget`);
    return 1;
  } else {
    success('\n✅ Todos os vendor bundles dentro do budget');
    return 0;
  }
}

// Executar análise
if (require.main === module) {
  try {
    const exitCode = generateReport();
    process.exit(exitCode);
  } catch (err) {
    error(`\n❌ Erro fatal: ${err.message}`);
    console.error(err);
    process.exit(2);
  }
}

module.exports = { getBundleSizes, classifyBundles };
