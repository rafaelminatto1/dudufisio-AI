/**
 * Analisa o conteúdo do vendor-misc chunk
 * Extrai bibliotecas do bundle para identificar oportunidades de split
 */

const fs = require('fs');
const path = require('path');

const statsPath = path.join(__dirname, '../dist/stats.html');

if (!fs.existsSync(statsPath)) {
  console.error('❌ stats.html não encontrado. Execute: npm run build');
  process.exit(1);
}

const html = fs.readFileSync(statsPath, 'utf-8');

// Extrair dados JSON do stats.html
const jsonMatch = html.match(/var chartData = (\{.*?\});/s);
if (!jsonMatch) {
  console.error('❌ Não foi possível extrair dados do stats.html');
  process.exit(1);
}

const data = JSON.parse(jsonMatch[1]);

// Encontrar o vendor-misc chunk
let vendorMisc = null;
function findVendorMisc(node) {
  if (node.label && node.label.includes('vendor-misc')) {
    vendorMisc = node;
    return true;
  }
  if (node.groups) {
    for (const group of node.groups) {
      if (findVendorMisc(group)) return true;
    }
  }
  return false;
}

findVendorMisc(data);

if (!vendorMisc) {
  console.error('❌ vendor-misc chunk não encontrado');
  process.exit(1);
}

console.log('📦 ANÁLISE DO VENDOR-MISC');
console.log('═'.repeat(60));
console.log(`Tamanho total: ${(vendorMisc.statSize / 1024).toFixed(2)} KB`);
console.log(`Gzip: ${(vendorMisc.gzipSize / 1024).toFixed(2)} KB`);
console.log('');

// Extrair bibliotecas
const libraries = [];

function extractLibraries(node, prefix = '') {
  if (node.label) {
    const label = prefix + node.label;
    if (label.includes('node_modules')) {
      const match = label.match(/node_modules\/(@?[^/]+(?:\/[^/]+)?)/);
      if (match) {
        libraries.push({
          name: match[1],
          size: node.statSize,
          gzipSize: node.gzipSize || 0
        });
      }
    }
  }

  if (node.groups) {
    for (const group of node.groups) {
      extractLibraries(group, prefix + (node.label || '') + '/');
    }
  }
}

extractLibraries(vendorMisc);

// Agrupar por biblioteca
const libMap = {};
libraries.forEach(lib => {
  if (!libMap[lib.name]) {
    libMap[lib.name] = { size: 0, gzipSize: 0, count: 0 };
  }
  libMap[lib.name].size += lib.size;
  libMap[lib.name].gzipSize += lib.gzipSize;
  libMap[lib.name].count++;
});

// Ordenar por tamanho
const sorted = Object.entries(libMap)
  .sort((a, b) => b[1].size - a[1].size)
  .slice(0, 20);

console.log('📊 TOP 20 BIBLIOTECAS NO VENDOR-MISC:');
console.log('─'.repeat(60));
sorted.forEach(([name, data], i) => {
  const sizeMB = (data.size / 1024).toFixed(2);
  const gzipKB = (data.gzipSize / 1024).toFixed(2);
  console.log(`${(i + 1).toString().padStart(2)}. ${name.padEnd(35)} ${sizeMB.padStart(8)} KB │ gzip: ${gzipKB} KB`);
});

console.log('');
console.log('💡 RECOMENDAÇÕES DE SPLIT:');
console.log('─'.repeat(60));

const recommendations = [];
sorted.forEach(([name, data]) => {
  const sizeKB = data.size / 1024;
  if (sizeKB > 50) {
    recommendations.push({
      name,
      size: sizeKB,
      category: categorizLib(name)
    });
  }
});

const categoryMap = {};
recommendations.forEach(rec => {
  if (!categoryMap[rec.category]) {
    categoryMap[rec.category] = { libs: [], totalSize: 0 };
  }
  categoryMap[rec.category].libs.push(rec.name);
  categoryMap[rec.category].totalSize += rec.size;
});

Object.entries(categoryMap)
  .sort((a, b) => b[1].totalSize - a[1].totalSize)
  .forEach(([category, data]) => {
    console.log(`\n${category} (${data.totalSize.toFixed(2)} KB total):`);
    data.libs.forEach(lib => {
      console.log(`  - ${lib}`);
    });
  });

function categorizLib(name) {
  if (name.includes('sentry') || name.includes('@sentry')) return 'vendor-monitoring';
  if (name.includes('icon') || name.includes('react-icons')) return 'vendor-icons';
  if (name.includes('uuid') || name.includes('crypto')) return 'vendor-utils';
  if (name.includes('ai') || name.includes('google') || name.includes('genai')) return 'vendor-ai';
  if (name.includes('toast') || name.includes('notification')) return 'vendor-ui-extras';
  if (name.includes('markdown') || name.includes('remark')) return 'vendor-markdown';
  if (name.includes('pdf') || name.includes('canvas')) return 'lib-pdf';
  return 'vendor-misc-remaining';
}

console.log('\n═'.repeat(60));
console.log('✅ Análise completa!');
