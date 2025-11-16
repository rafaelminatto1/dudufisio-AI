#!/usr/bin/env node
/**
 * Corrige imports para @/shared/utils e @/shared/format
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

const IMPORT_FIXES = {
  'from "@/shared/utils"': 'from "@/shared/lib/utils"',
  'from "@/shared/format"': 'from "@/shared/lib/format"',
  'from "@/shared/types"': 'from "@/shared/types/index"',
};

function getAllFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(file)) {
        getAllFiles(filePath, fileList);
      }
    } else if (file.match(/\.tsx?$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  Object.entries(IMPORT_FIXES).forEach(([wrong, correct]) => {
    if (content.includes(wrong)) {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, correct);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
    return 1;
  }
  
  return 0;
}

function main() {
  console.log('🔧 Corrigindo imports @/shared...\n');
  
  let totalFixes = 0;
  
  PACKAGES.forEach(pkg => {
    console.log(`\n📦 Processing ${pkg}...`);
    const srcPath = path.join(pkg, 'src');
    const files = getAllFiles(srcPath);
    
    let pkgFixes = 0;
    files.forEach(file => {
      pkgFixes += fixFile(file);
    });
    
    console.log(`   ${pkgFixes} fixes applied`);
    totalFixes += pkgFixes;
  });
  
  console.log(`\n✨ Done! Applied ${totalFixes} fixes total.\n`);
}

main();

