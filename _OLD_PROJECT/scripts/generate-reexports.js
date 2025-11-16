#!/usr/bin/env node
/**
 * Script para gerar automaticamente arquivos de re-export nos microserviços
 * Resolve o problema de imports de arquivos compartilhados
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES = [
  { name: 'agenda-pacientes', path: 'packages/agenda-pacientes' },
  { name: 'tratamentos', path: 'packages/tratamentos' },
  { name: 'financeiro', path: 'packages/financeiro' }
];

// Padrão para detectar imports de arquivos compartilhados (4+ níveis acima)
const SHARED_IMPORT_PATTERN = /from\s+['"](\.\.\/)(\.\.\/)(\.\.\/)(\.\.\/)([^'"]+)['"]/g;
const RELATIVE_IMPORT_PATTERN = /from\s+['"](\.\.\/)(\.\.\/)(\.\.\/)([^'"]+)['"]/g;

/**
 * Lê recursivamente todos os arquivos .ts/.tsx de um diretório
 */
function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Ignora node_modules e dist
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.(ts|tsx)$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extrai todos os imports compartilhados de um arquivo
 */
function extractSharedImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const imports = new Map(); // importPath -> levels
  
  // Busca TODOS os imports relativos
  let match;
  const pattern = /from\s+['"](\.\.\/[^'"]+)['"]/g;
  
  while ((match = pattern.exec(content)) !== null) {
    const fullPath = match[1];
    
    // Conta quantos ../ tem
    const levels = (fullPath.match(/\.\.\//g) || []).length;
    
    // Remove os ../ e pega o caminho limpo
    const cleanPath = fullPath.replace(/^(\.\.\/)+/, '');
    
    // Guarda o maior número de níveis para cada import
    if (!imports.has(cleanPath) || imports.get(cleanPath) < levels) {
      imports.set(cleanPath, levels);
    }
  }
  
  return imports;
}

/**
 * Converte um caminho de import para estrutura de diretório local
 */
function convertImportToLocalPath(importPath) {
  // Remove extensões
  const withoutExt = importPath.replace(/\.(ts|tsx|js|jsx)$/, '');
  return withoutExt;
}

/**
 * Calcula o caminho relativo correto para o re-export
 */
function calculateReexportPath(importPath) {
  const levels = 4; // Sempre 4 níveis para voltar à raiz
  return '../'.repeat(levels) + importPath;
}

/**
 * Cria um arquivo de re-export
 */
function createReexportFile(targetPath, importPath, isDefault = false) {
  const dir = path.dirname(targetPath);
  
  // Cria diretórios se não existirem
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  const reexportPath = calculateReexportPath(importPath);
  
  let content = `// Re-export from shared\n`;
  content += `export * from '${reexportPath}';\n`;
  
  // Para alguns tipos de arquivos, adiciona default export também
  if (isDefault || importPath.match(/(Component|Page|Modal|Dialog|Service)/) || targetPath.endsWith('.tsx')) {
    content += `export { default } from '${reexportPath}';\n`;
  }
  
  fs.writeFileSync(targetPath, content, 'utf-8');
  console.log(`✓ Created: ${targetPath}`);
}

/**
 * Determina se um import precisa de re-export baseado nos níveis
 */
function needsReexport(levels, packageName) {
  // Para agenda-pacientes: 2+ níveis (../../)
  // Para outros: 3+ níveis (../../../)
  const threshold = packageName === 'agenda-pacientes' ? 2 : 3;
  return levels >= threshold;
}

/**
 * Calcula níveis corretos baseado na profundidade do arquivo no microserviço
 */
function calculateCorrectLevels(importPath) {
  // Se importPath tem diretórios, adiciona níveis
  const depth = (importPath.match(/\//g) || []).length;
  return Math.max(4, 4 + depth);
}

/**
 * Processa um microserviço
 */
function processMicroservice(packageInfo) {
  console.log(`\n🔍 Processing ${packageInfo.name}...`);
  
  const srcPath = path.join(packageInfo.path, 'src');
  const files = getAllFiles(srcPath);
  
  console.log(`Found ${files.length} files to analyze`);
  
  const allImports = new Map(); // importPath -> {count, maxLevels}
  
  // Coleta todos os imports compartilhados
  files.forEach(file => {
    const imports = extractSharedImports(file);
    imports.forEach((levels, importPath) => {
      // Só processa se precisa de re-export
      if (needsReexport(levels, packageInfo.name)) {
        if (!allImports.has(importPath)) {
          allImports.set(importPath, { count: 0, maxLevels: levels });
        }
        const current = allImports.get(importPath);
        current.count++;
        current.maxLevels = Math.max(current.maxLevels, levels);
      }
    });
  });
  
  console.log(`Found ${allImports.size} unique shared imports`);
  
  let created = 0;
  let skipped = 0;
  let errors = 0;
  
  // Cria os re-exports
  allImports.forEach((info, importPath) => {
    const localPath = convertImportToLocalPath(importPath);
    
    // Detecta extensão correta
    let extension = '.ts';
    if (importPath.endsWith('.tsx')) {
      extension = '.tsx';
    } else if (importPath.endsWith('.ts')) {
      extension = '.ts';
    } else if (importPath.includes('/components/') || importPath.includes('Context') || importPath.endsWith('Modal') || importPath.endsWith('Dialog') || importPath.endsWith('Page')) {
      extension = '.tsx';
    }
    
    const targetPath = path.join(srcPath, localPath + extension);
    
    // Verifica se já existe
    if (fs.existsSync(targetPath)) {
      const content = fs.readFileSync(targetPath, 'utf-8');
      if (content.includes('Re-export from shared') || content.length < 200) {
        skipped++;
        return;
      }
    }
    
    try {
      createReexportFile(targetPath, importPath);
      created++;
    } catch (err) {
      console.error(`✗ Error creating ${targetPath}:`, err.message);
      errors++;
    }
  });
  
  console.log(`\n📊 ${packageInfo.name} Summary:`);
  console.log(`   Created: ${created} files`);
  console.log(`   Skipped: ${skipped} files (already exist)`);
  if (errors > 0) console.log(`   Errors: ${errors} files`);
}

/**
 * Main
 */
function main() {
  console.log('🚀 Starting automatic re-export generation...\n');
  
  PACKAGES.forEach(pkg => {
    try {
      processMicroservice(pkg);
    } catch (err) {
      console.error(`\n❌ Error processing ${pkg.name}:`, err.message);
    }
  });
  
  console.log('\n✨ Done! All re-exports have been generated.');
  console.log('💡 Restart your dev servers to see the changes.\n');
}

// Run
main();

