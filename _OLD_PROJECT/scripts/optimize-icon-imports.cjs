/**
 * Script para otimizar imports de ícones lucide-react
 *
 * Substitui imports diretos por imports do barrel file lib/icons.ts
 * Exemplo:
 *   DE: import { Home, User } from 'lucide-react'
 *   PARA: import { Home, User } from '@/lib/icons'
 *
 * Uso: node scripts/optimize-icon-imports.cjs
 */

const fs = require('fs');
const path = require('path');

// Diretórios para processar
const DIRS_TO_PROCESS = [
  'components',
  'pages',
  'lib'
];

const ROOT_DIR = path.join(__dirname, '..');

let filesProcessed = 0;
let importsReplaced = 0;
let errors = 0;

/**
 * Processa um arquivo TypeScript/JavaScript
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');

    // Regex para encontrar imports do lucide-react
    const lucideImportRegex = /import\s+\{([^}]+)\}\s+from\s+['"]lucide-react['"]/g;

    // Verificar se tem imports do lucide-react
    if (!lucideImportRegex.test(content)) {
      return false; // Sem imports para otimizar
    }

    // Resetar regex
    lucideImportRegex.lastIndex = 0;

    // Substituir imports
    const newContent = content.replace(
      lucideImportRegex,
      "import {$1} from '@/lib/icons'"
    );

    // Verificar se houve mudança
    if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      importsReplaced++;
      return true;
    }

    return false;
  } catch (error) {
    console.error(`❌ Erro ao processar ${filePath}:`, error.message);
    errors++;
    return false;
  }
}

/**
 * Processa um diretório recursivamente
 */
function processDirectory(dir) {
  try {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        // Ignorar node_modules, dist, .next, etc
        if (file === 'node_modules' || file === 'dist' || file === '.next' ||
            file === 'build' || file === '.git' || file.startsWith('.')) {
          continue;
        }
        processDirectory(filePath);
      } else if (stats.isFile()) {
        // Processar apenas arquivos .ts, .tsx, .js, .jsx
        if (file.endsWith('.ts') || file.endsWith('.tsx') ||
            file.endsWith('.js') || file.endsWith('.jsx')) {
          filesProcessed++;
          const changed = processFile(filePath);
          if (changed) {
            const relativePath = path.relative(ROOT_DIR, filePath);
            console.log(`✅ ${relativePath}`);
          }
        }
      }
    }
  } catch (error) {
    console.error(`❌ Erro ao processar diretório ${dir}:`, error.message);
    errors++;
  }
}

/**
 * Main
 */
function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          🎨 OTIMIZADOR DE IMPORTS DE ÍCONES');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');

  console.log('📂 Diretórios a processar:', DIRS_TO_PROCESS.join(', '));
  console.log('');

  const startTime = Date.now();

  // Processar cada diretório
  DIRS_TO_PROCESS.forEach(dir => {
    const dirPath = path.join(ROOT_DIR, dir);
    if (fs.existsSync(dirPath)) {
      console.log(`🔍 Processando ${dir}/...`);
      processDirectory(dirPath);
    } else {
      console.warn(`⚠️  Diretório não encontrado: ${dir}/`);
    }
  });

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          📊 RESULTADOS');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📁 Arquivos processados: ${filesProcessed}`);
  console.log(`✅ Imports otimizados: ${importsReplaced}`);
  console.log(`❌ Erros: ${errors}`);
  console.log(`⏱️  Tempo: ${duration}s`);
  console.log('');

  if (importsReplaced > 0) {
    console.log('💡 PRÓXIMO PASSO:');
    console.log('   Execute `npm run build` para verificar os ganhos de bundle size');
    console.log('');
  } else {
    console.log('✅ Nenhuma otimização necessária - todos os imports já estão otimizados!');
    console.log('');
  }

  if (errors > 0) {
    console.error('⚠️  Processo concluído com erros');
    process.exit(1);
  }
}

// Executar
try {
  main();
} catch (error) {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
}
