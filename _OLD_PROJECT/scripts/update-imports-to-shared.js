#!/usr/bin/env node
/**
 * Atualiza imports relativos para usar @/shared/ quando apropriado
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

// Mapeamento de imports que devem ir para shared
const SHARED_MAPPINGS = {
  'components/ui/': '@/shared/components/ui/',
  'components/layout/': '@/shared/components/layout/',
  '../../../shared/components': '@/shared/components',
  '../../../../shared/components': '@/shared/components',
  '../../../../../shared/components': '@/shared/components',
  '../../shared/lib': '@/shared/lib',
  '../../../shared/lib': '@/shared/lib',
  '../../../../shared/lib': '@/shared/lib',
};

function getAllTsxFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!['node_modules', 'dist'].includes(file)) {
        getAllTsxFiles(filePath, fileList);
      }
    } else if (file.match(/\.tsx?$/)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function updateImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  
  // Atualiza cada mapeamento
  Object.entries(SHARED_MAPPINGS).forEach(([from, to]) => {
    const pattern = new RegExp(`from ['"]${from.replace(/\//g, '\\/')}`, 'g');
    if (pattern.test(content)) {
      content = content.replace(pattern, `from '${to}`);
      modified = true;
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Updated: ${path.relative(process.cwd(), filePath)}`);
    return true;
  }
  
  return false;
}

function main() {
  console.log('🔄 Atualizando imports para usar @/shared/...\n');
  
  let totalUpdated = 0;
  
  PACKAGES.forEach(pkg => {
    console.log(`\n📦 Processing ${pkg}...`);
    const srcPath = path.join(pkg, 'src');
    const files = getAllTsxFiles(srcPath);
    
    let updated = 0;
    files.forEach(file => {
      if (updateImportsInFile(file)) {
        updated++;
      }
    });
    
    console.log(`   Updated: ${updated} files`);
    totalUpdated += updated;
  });
  
  console.log(`\n✨ Done! Updated ${totalUpdated} files total.\n`);
}

main();

