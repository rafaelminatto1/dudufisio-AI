#!/usr/bin/env node
/**
 * Remove re-exports órfãos (arquivos .ts que não têm arquivo original correspondente)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PACKAGES = [
  'packages/agenda-pacientes',
  'packages/tratamentos',
  'packages/financeiro'
];

function getAllReexportFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist'].includes(file)) {
        getAllReexportFiles(filePath, fileList);
      }
    } else if (file.match(/\.tsx?$/)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      // Detecta se é um re-export
      if (content.includes('// Re-export from shared') || 
          content.match(/^export \* from ['"]\.\.\/\.\.\/\.\.\//)) {
        fileList.push(filePath);
      }
    }
  });
  
  return fileList;
}

function isOrphanReexport(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Extrai o caminho do re-export
  const match = content.match(/export \* from ['"]([^'"]+)['"]/);
  if (!match) return false;
  
  const targetPath = match[1];
  const fileDir = path.dirname(filePath);
  
  // Resolve o caminho absoluto do arquivo alvo
  const absoluteTargetPath = path.resolve(fileDir, targetPath);
  
  // Verifica se o arquivo alvo existe (com extensões .ts, .tsx, .js, .jsx)
  const extensions = ['.ts', '.tsx', '.js', '.jsx', ''];
  const exists = extensions.some(ext => {
    const fullPath = absoluteTargetPath + ext;
    return fs.existsSync(fullPath);
  });
  
  return !exists;
}

function main() {
  console.log('🧹 Limpando re-exports órfãos...\n');
  
  let totalRemoved = 0;
  
  PACKAGES.forEach(pkg => {
    console.log(`\n📦 Processing ${pkg}...`);
    const srcPath = path.join(pkg, 'src');
    const reexports = getAllReexportFiles(srcPath);
    
    console.log(`Found ${reexports.length} potential re-export files`);
    
    let removed = 0;
    reexports.forEach(file => {
      if (isOrphanReexport(file)) {
        try {
          fs.unlinkSync(file);
          console.log(`✓ Removed orphan: ${path.relative(process.cwd(), file)}`);
          removed++;
        } catch (err) {
          console.error(`✗ Error removing ${file}:`, err.message);
        }
      }
    });
    
    console.log(`   Removed: ${removed} orphan files`);
    totalRemoved += removed;
  });
  
  console.log(`\n✨ Done! Removed ${totalRemoved} orphan re-exports total.\n`);
}

main();

