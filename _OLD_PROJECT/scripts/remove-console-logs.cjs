#!/usr/bin/env node

/**
 * Script para remover console.log de código de produção
 * Preserva console.error, console.warn, console.info
 * Ignora arquivos de teste e configuração
 */

const fs = require('fs');
const path = require('path');

// Diretórios a processar
const DIRECTORIES = [
  'pages',
  'components',
  'services',
  'lib',
  'hooks',
  'contexts'
];

// Arquivos/pastas a ignorar
const IGNORE_PATTERNS = [
  /\.test\./,
  /\.spec\./,
  /tests\//,
  /test\//,
  /__tests__\//,
  /node_modules/,
  /\.config\./,
  /setup/,
  /debug/,
  /\.d\.ts$/,
  /index\.tsx$/, // Preservar index.tsx (web-vitals)
];

// Extensões a processar
const EXTENSIONS = ['.ts', '.tsx'];

let totalFiles = 0;
let totalLogsRemoved = 0;
let filesModified = 0;

function shouldIgnore(filePath) {
  return IGNORE_PATTERNS.some(pattern => pattern.test(filePath));
}

function removeConsoleLogs(content) {
  let modified = false;
  let logsRemoved = 0;
  
  // Regex para encontrar console.log (mas não console.error, console.warn, console.info)
  const consoleLogRegex = /console\.log\([^)]*\);/g;
  
  // Contar ocorrências
  const matches = content.match(consoleLogRegex);
  if (matches) {
    logsRemoved = matches.length;
    // Remover console.log
    content = content.replace(consoleLogRegex, '');
    modified = true;
  }
  
  return { content, modified, logsRemoved };
}

function processFile(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (shouldIgnore(fullPath)) {
    return;
  }
  
  const ext = path.extname(fullPath);
  if (!EXTENSIONS.includes(ext)) {
    return;
  }
  
  totalFiles++;
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const { content: newContent, modified, logsRemoved } = removeConsoleLogs(content);
    
    if (modified) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      filesModified++;
      totalLogsRemoved += logsRemoved;
      console.log(`✓ ${filePath} - ${logsRemoved} console.log removidos`);
    }
  } catch (error) {
    console.error(`✗ Erro ao processar ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  const fullPath = path.resolve(dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ Diretório não encontrado: ${fullPath}`);
    return;
  }
  
  const entries = fs.readdirSync(fullPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullEntryPath = path.join(fullPath, entry.name);
    
    if (shouldIgnore(fullEntryPath)) {
      continue;
    }
    
    if (entry.isDirectory()) {
      processDirectory(fullEntryPath);
    } else if (entry.isFile()) {
      processFile(fullEntryPath);
    }
  }
}

// Executar
console.log('🧹 Removendo console.log de código de produção...\n');

for (const dir of DIRECTORIES) {
  console.log(`📁 Processando: ${dir}/`);
  processDirectory(dir);
  console.log('');
}

console.log('\n✅ Limpeza concluída!');
console.log(`📊 Estatísticas:`);
console.log(`   - Arquivos verificados: ${totalFiles}`);
console.log(`   - Arquivos modificados: ${filesModified}`);
console.log(`   - Console.log removidos: ${totalLogsRemoved}`);

