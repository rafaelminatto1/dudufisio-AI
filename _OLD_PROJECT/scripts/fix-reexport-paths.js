#!/usr/bin/env node
/**
 * Corrige os caminhos dos re-exports para apontar para shared/*
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

function getAllTsFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist'].includes(file)) {
        getAllTsFiles(filePath, fileList);
      }
    } else if (file.match(/\.tsx?$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixReexportPath(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Padrões a corrigir
  const fixes = [
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components/g, to: "from '../../../../shared/components" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/types['"]/g, to: "from '../../../../shared/types'" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/lib/g, to: "from '../../../../shared/lib" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/contexts/g, to: "from '../../../../shared/contexts" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/hooks/g, to: "from '../../../../shared/hooks" },
    { from: /from ['"]\.\.\/\.\.\/\.\.\/\.\.\/ui/g, to: "from '../../../../shared/ui" },
  ];
  
  fixes.forEach(fix => {
    if (fix.from.test(content)) {
      content = content.replace(fix.from, fix.to);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔧 Fixing re-export paths...\n');
  
  let totalFixed = 0;
  
  PACKAGES.forEach(pkg => {
    console.log(`\n📦 Processing ${pkg}...`);
    const srcPath = path.join(pkg, 'src');
    const files = getAllTsFiles(srcPath);
    
    let fixed = 0;
    files.forEach(file => {
      if (fixReexportPath(file)) {
        fixed++;
      }
    });
    
    console.log(`   Fixed: ${fixed} files`);
    totalFixed += fixed;
  });
  
  console.log(`\n✨ Done! Fixed ${totalFixed} files total.\n`);
}

main();

