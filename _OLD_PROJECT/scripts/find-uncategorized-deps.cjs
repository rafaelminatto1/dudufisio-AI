#!/usr/bin/env node

/**
 * Script para Identificar Dependências Não Categorizadas
 *
 * Analisa package.json e vite.config.ts para encontrar dependências
 * que não estão categorizadas em vendor bundles específicos.
 */

const fs = require('fs');
const path = require('path');

// Ler package.json
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Todas as dependências (runtime)
const allDeps = {
  ...packageJson.dependencies,
};

// Ler vite.config.ts
const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
const viteConfigContent = fs.readFileSync(viteConfigPath, 'utf8');

// Extrair todas as dependências já categorizadas no vite.config
const categorizedDeps = new Set();

// Regex para encontrar includes no código
const includesRegex = /includes\(['"]node_modules\/([@\w-]+(?:\/[@\w-]+)?)\//g;
let match;

while ((match = includesRegex.exec(viteConfigContent)) !== null) {
  const depName = match[1];
  categorizedDeps.add(depName);
}

// Dependências não categorizadas
const uncategorized = [];

for (const dep of Object.keys(allDeps)) {
  // Verificar se a dep ou seu escopo está categorizado
  const isScoped = dep.startsWith('@');
  const depBase = isScoped ? dep : dep.split('/')[0];

  let found = false;
  for (const cat of categorizedDeps) {
    if (cat === dep || cat === depBase || dep.startsWith(cat)) {
      found = true;
      break;
    }
  }

  if (!found) {
    const size = allDeps[dep];
    uncategorized.push({ name: dep, version: size });
  }
}

// Output
console.log('\n📦 DEPENDÊNCIAS NÃO CATEGORIZADAS NO VITE.CONFIG.TS\n');
console.log('Total dependências:', Object.keys(allDeps).length);
console.log('Categorizadas:', categorizedDeps.size);
console.log('Não categorizadas:', uncategorized.length);
console.log('\n' + '='.repeat(60) + '\n');

if (uncategorized.length > 0) {
  console.log('📋 Lista de dependências não categorizadas:\n');

  // Agrupar por tipo/propósito (heurística baseada no nome)
  const groups = {
    'React/UI': [],
    'Data/State': [],
    'Utilities': [],
    'Other': []
  };

  for (const dep of uncategorized) {
    const name = dep.name.toLowerCase();

    if (name.includes('react') || name.includes('radix') || name.includes('ui')) {
      groups['React/UI'].push(dep);
    } else if (name.includes('query') || name.includes('table') || name.includes('virtual')) {
      groups['Data/State'].push(dep);
    } else if (name.includes('util') || name.includes('helper') || name.includes('lib')) {
      groups['Utilities'].push(dep);
    } else {
      groups['Other'].push(dep);
    }
  }

  for (const [group, deps] of Object.entries(groups)) {
    if (deps.length > 0) {
      console.log(`\n${group}:`);
      for (const dep of deps) {
        console.log(`  - ${dep.name} (${dep.version})`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('\n💡 RECOMENDAÇÕES:\n');
  console.log('Adicione estas dependências ao vite.config.ts manualChunks:');
  console.log('\nExemplo:');
  console.log('```typescript');

  // Gerar sugestões de código
  const suggestions = [];

  for (const dep of uncategorized) {
    const name = dep.name;

    // Sugerir chunk name
    let chunkName = 'vendor-misc';

    if (name.includes('react')) chunkName = 'vendor-react-utils';
    else if (name.includes('query')) chunkName = 'vendor-query';
    else if (name.includes('table')) chunkName = 'vendor-table';
    else if (name.includes('icon')) chunkName = 'vendor-icons';
    else if (name.includes('chart')) chunkName = 'feature-charts';
    else if (name.includes('pdf')) chunkName = 'feature-pdf';

    if (!suggestions.find(s => s.chunk === chunkName && s.deps.includes(name))) {
      const existing = suggestions.find(s => s.chunk === chunkName);
      if (existing) {
        existing.deps.push(name);
      } else {
        suggestions.push({ chunk: chunkName, deps: [name] });
      }
    }
  }

  for (const suggestion of suggestions) {
    console.log(`if (normalizedId.includes('node_modules/${suggestion.deps[0]}/')) {`);
    console.log(`  return '${suggestion.chunk}';`);
    console.log('}');
  }

  console.log('```\n');
} else {
  console.log('✅ Todas as dependências estão categorizadas!\n');
}

console.log('📊 DEPENDÊNCIAS CATEGORIZADAS:\n');
console.log([...categorizedDeps].sort().map(d => `  - ${d}`).join('\n'));
console.log('\n');
