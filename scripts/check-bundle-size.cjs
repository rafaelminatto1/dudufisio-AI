/**
 * Script para verificar tamanho do bundle e chunks
 *
 * Este script:
 * - Verifica o tamanho total do bundle
 * - Lista chunks maiores que 500KB
 * - Falha se bundle > 12MB
 * - Fornece recomendações de otimização
 *
 * Uso: node scripts/check-bundle-size.js
 */

const fs = require('fs');
const path = require('path');

// Configurações
const MAX_BUNDLE_SIZE = 12 * 1024 * 1024; // 12MB
const MAX_CHUNK_SIZE = 500 * 1024; // 500KB
const WARNING_CHUNK_SIZE = 300 * 1024; // 300KB

/**
 * Calcula o tamanho total apenas dos arquivos JS e CSS (sem source maps)
 */
function getBundleSize(dir) {
  let size = 0;
  try {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      if (stats.isDirectory()) {
        size += getBundleSize(filePath);
      } else {
        // Incluir apenas JS, CSS e assets, EXCLUIR .map files
        if ((file.endsWith('.js') || file.endsWith('.css') ||
             file.endsWith('.png') || file.endsWith('.jpg') ||
             file.endsWith('.svg') || file.endsWith('.woff') ||
             file.endsWith('.woff2') || file.endsWith('.ttf')) &&
            !file.endsWith('.map')) {
          size += stats.size;
        }
      }
    }
  } catch (error) {
    console.error(`Erro ao ler diretório ${dir}:`, error.message);
  }
  return size;
}

/**
 * Formata bytes para formato legível
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)}MB`;
}

/**
 * Obtém lista de chunks JavaScript
 */
function getJavaScriptChunks(assetsDir) {
  if (!fs.existsSync(assetsDir)) {
    console.warn(`⚠️  Diretório ${assetsDir} não encontrado`);
    return [];
  }

  return fs.readdirSync(assetsDir)
    .filter(f => f.endsWith('.js'))
    .map(f => ({
      name: f,
      size: fs.statSync(path.join(assetsDir, f)).size
    }))
    .sort((a, b) => b.size - a.size); // Maior para menor
}

function resolveTargets() {
  const args = process.argv.slice(2);
  const targetFlagIndex = args.indexOf('--target');
  const explicitTarget = targetFlagIndex !== -1 ? args[targetFlagIndex + 1] : undefined;
  const envTargets = process.env.BUNDLE_SCOPE || process.env.BUNDLE_TARGETS;

  const targetList = explicitTarget || envTargets;

  if (!targetList) {
    return ['dist'];
  }

  return targetList
    .split(',')
    .map(target => target.trim())
    .filter(Boolean);
}

/**
 * Análise principal
 */
function analyzeBundleSizeForTarget(targetDir) {
  const distPath = path.isAbsolute(targetDir) ? targetDir : path.join(__dirname, '..', targetDir);
  const assetsPath = path.join(distPath, 'assets');

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`📊 ANÁLISE DE TAMANHO DO BUNDLE (${targetDir})`);
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  if (!fs.existsSync(distPath)) {
    console.error(`❌ Diretório ${distPath} não encontrado!`);
    console.error('   Execute `npm run build` primeiro.');
    process.exitCode = 1;
    return;
  }

  // 1. Tamanho total (sem source maps)
  const totalSize = getBundleSize(distPath);
  const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
  const percentOfMax = ((totalSize / MAX_BUNDLE_SIZE) * 100).toFixed(1);

  console.log('📦 TAMANHO TOTAL');
  console.log(`   ${formatBytes(totalSize)} / ${formatBytes(MAX_BUNDLE_SIZE)}`);
  console.log(`   ${percentOfMax}% do limite máximo`);
  console.log('');

  if (totalSize > MAX_BUNDLE_SIZE) {
    console.error(`❌ ERRO: Bundle muito grande!`);
    console.error(`   Máximo: ${formatBytes(MAX_BUNDLE_SIZE)}`);
    console.error(`   Atual:  ${formatBytes(totalSize)}`);
    console.error(`   Excesso: ${formatBytes(totalSize - MAX_BUNDLE_SIZE)}`);
    console.log('');
    process.exit(1);
  } else {
    console.log(`✅ Tamanho total OK`);
    console.log('');
  }

  // 2. Chunks JavaScript
  const chunks = getJavaScriptChunks(assetsPath);

  if (chunks.length === 0) {
    console.warn('⚠️  Nenhum chunk JavaScript encontrado');
    return;
  }

  const largeChunks = chunks.filter(c => c.size > MAX_CHUNK_SIZE);
  const warningChunks = chunks.filter(c => c.size > WARNING_CHUNK_SIZE && c.size <= MAX_CHUNK_SIZE);

  console.log('📑 CHUNKS JAVASCRIPT');
  console.log(`   Total de chunks: ${chunks.length}`);
  console.log(`   Maior chunk: ${formatBytes(chunks[0].size)}`);
  console.log(`   Menor chunk: ${formatBytes(chunks[chunks.length - 1].size)}`);
  console.log('');

  // Chunks problemáticos
  if (largeChunks.length > 0) {
    console.warn('⚠️  CHUNKS MUITO GRANDES (> 500KB):');
    largeChunks.forEach(c => {
      console.warn(`   ❌ ${c.name.padEnd(50)} ${formatBytes(c.size)}`);
    });
    console.log('');
    console.log('💡 RECOMENDAÇÕES:');
    console.log('   1. Revise code splitting no vite.config.ts');
    console.log('   2. Implemente lazy loading para estas features');
    console.log('   3. Considere dynamic imports');
    console.log('');
  }

  if (warningChunks.length > 0) {
    console.warn('⚠️  CHUNKS GRANDES (> 300KB):');
    warningChunks.forEach(c => {
      console.warn(`   ⚠️  ${c.name.padEnd(50)} ${formatBytes(c.size)}`);
    });
    console.log('');
  }

  // Top 10 maiores chunks
  console.log('📊 TOP 10 MAIORES CHUNKS:');
  chunks.slice(0, 10).forEach((c, i) => {
    const icon = c.size > MAX_CHUNK_SIZE ? '❌' :
                 c.size > WARNING_CHUNK_SIZE ? '⚠️ ' : '✅';
    console.log(`   ${(i + 1).toString().padStart(2)}. ${icon} ${c.name.padEnd(45)} ${formatBytes(c.size)}`);
  });
  console.log('');

  // 3. Estatísticas
  const totalJSSize = chunks.reduce((sum, c) => sum + c.size, 0);
  const averageChunkSize = totalJSSize / chunks.length;

  console.log('📈 ESTATÍSTICAS:');
  console.log(`   Total JS: ${formatBytes(totalJSSize)}`);
  console.log(`   Média por chunk: ${formatBytes(averageChunkSize)}`);
  console.log(`   Chunks > 500KB: ${largeChunks.length}`);
  console.log(`   Chunks > 300KB: ${warningChunks.length}`);
  console.log('');

  // 4. Resumo final
  console.log('═══════════════════════════════════════════════════════════');
  if (largeChunks.length === 0 && totalSize < MAX_BUNDLE_SIZE) {
    console.log('          ✅ BUNDLE OK - TODOS OS CHECKS PASSARAM');
  } else if (largeChunks.length > 0) {
    console.log('          ⚠️  BUNDLE OK MAS PRECISA DE OTIMIZAÇÃO');
  }
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  // 5. Próximos passos
  if (largeChunks.length > 0 || warningChunks.length > 5) {
    console.log('💡 PRÓXIMOS PASSOS:');
    console.log('   1. Execute `npm run build:analyze` para visualização gráfica');
    console.log('   2. Revise VERCEL_BUILD_OPTIMIZATION_PLAN.md');
    console.log('   3. Implemente lazy loading agressivo');
    console.log('');
  }
}

function analyzeBundleSize() {
  const targets = resolveTargets();
  targets.forEach(analyzeBundleSizeForTarget);
}

// Executar análise
try {
  analyzeBundleSize();
} catch (error) {
  console.error('❌ Erro durante análise:', error.message);
  process.exit(1);
}
