const fs = require('fs');
const path = require('path');

function formatKB(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

function bar(bytes, max) {
  const width = 24;
  const ratio = Math.min(1, bytes / max);
  const filled = Math.round(ratio * width);
  return '█'.repeat(filled) + '░'.repeat(width - filled);
}

function generate() {
  const dist = path.resolve(__dirname, '..', 'dist', 'assets');
  if (!fs.existsSync(dist)) {
    console.error('dist/assets não encontrado. Rode o build primeiro.');
    process.exit(1);
  }

  const files = fs.readdirSync(dist)
    .filter(f => f.endsWith('.js'))
    .map(f => {
      const fp = path.join(dist, f);
      const size = fs.statSync(fp).size;
      return { name: f, size };
    })
    .sort((a, b) => b.size - a.size);

  const max = files[0]?.size || 1;
  const top = files.slice(0, 40);

  const lines = [];
  lines.push('# Bundle Sizes (Top 40)');
  lines.push('');
  lines.push('| Chunk | Size | Graph |');
  lines.push('|---|---:|---|');
  for (const f of top) {
    lines.push(`| ${f.name} | ${formatKB(f.size)} | ${bar(f.size, max)} |`);
  }
  lines.push('');
  lines.push('Gerado por scripts/generate-bundle-report.cjs');

  fs.writeFileSync(path.resolve(__dirname, '..', 'BUNDLE_SIZES.md'), lines.join('\n'));
  console.log('✅ BUNDLE_SIZES.md gerado.');
}

generate();


