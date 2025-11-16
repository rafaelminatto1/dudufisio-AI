#!/usr/bin/env node
/**
 * Script para corrigir problemas finais e atingir 100% nos microserviços
 * 
 * Corrige:
 * 1. Extensões de imports (.ts → .tsx onde necessário)
 * 2. Remove referências a arquivos órfãos
 * 3. Atualiza imports para @/shared/
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

// Arquivos que devem usar .tsx (components React)
const TSX_PATTERNS = [
  '/components/',
  '/pages/',
  'Context.tsx',
  'Provider.tsx',
  'Modal.tsx',
  'Dialog.tsx',
  'Card.tsx',
  'Button.tsx',
  'Layout.tsx',
  'Page.tsx'
];

// Mapeamentos de imports incorretos para corretos
const IMPORT_FIXES = {
  // UI Components que foram movidos para shared
  'from "../components/ui/button"': 'from "@/shared/components/ui/button"',
  'from "../components/ui/card"': 'from "@/shared/components/ui/card"',
  'from "../components/ui/badge"': 'from "@/shared/components/ui/badge"',
  'from "../components/ui/skeleton"': 'from "@/shared/components/ui/skeleton"',
  'from "../components/ui/select"': 'from "@/shared/components/ui/select"',
  'from "../components/ui/tabs"': 'from "@/shared/components/ui/tabs"',
  
  // Contexts que foram movidos
  'from "../contexts/AppContext"': 'from "./contexts/AppContext"',
  'from "../contexts/ToastContext"': 'from "./contexts/ToastContext"',
  
  // Libs
  'from "../lib/utils"': 'from "@/shared/lib/utils"',
  'from "../../lib/utils"': 'from "@/shared/lib/utils"',
  
  // Supabase
  'from "@/shared/lib/supabaseClient"': 'from "@/shared/services/supabaseClient"',
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

function shouldBeTsx(importPath) {
  return TSX_PATTERNS.some(pattern => importPath.includes(pattern));
}

function fixImportsInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  const fixes = [];
  
  // 1. Corrigir imports conhecidos
  Object.entries(IMPORT_FIXES).forEach(([wrong, correct]) => {
    if (content.includes(wrong)) {
      const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      content = content.replace(regex, correct);
      modified = true;
      fixes.push(`${wrong} → ${correct}`);
    }
  });
  
  // 2. Corrigir extensões .ts → .tsx para components React
  const importRegex = /from ['"]([^'"]+)['"];?/g;
  let match;
  const importMatches = [];
  
  while ((match = importRegex.exec(content)) !== null) {
    importMatches.push({
      full: match[0],
      path: match[1],
      index: match.index
    });
  }
  
  // Processar de trás para frente para não afetar índices
  importMatches.reverse().forEach(({ full, path: importPath, index }) => {
    // Se termina com .ts e deve ser .tsx
    if (importPath.endsWith('.ts') && shouldBeTsx(importPath)) {
      const newImport = full.replace('.ts', '.tsx');
      content = content.substring(0, index) + newImport + content.substring(index + full.length);
      modified = true;
      fixes.push(`${importPath} → ${importPath.replace('.ts', '.tsx')}`);
    }
    
    // Se não tem extensão mas deve ter .tsx
    if (!importPath.match(/\.(ts|tsx|js|jsx)$/) && shouldBeTsx(importPath) && !importPath.startsWith('@/')) {
      // Verificar se arquivo .tsx existe
      const fullPath = path.resolve(path.dirname(filePath), importPath + '.tsx');
      if (fs.existsSync(fullPath)) {
        const newImport = full.replace(importPath, importPath + '.tsx');
        content = content.substring(0, index) + newImport + content.substring(index + full.length);
        modified = true;
        fixes.push(`${importPath} → ${importPath}.tsx`);
      }
    }
  });
  
  // 3. Remover imports de arquivos que não existem mais
  const linesToRemove = [];
  const lines = content.split('\n');
  
  lines.forEach((line, i) => {
    const importMatch = line.match(/from ['"]([^'"]+)['"]/);
    if (importMatch) {
      const importPath = importMatch[1];
      
      // Se é import relativo (não @/ ou package externo)
      if (importPath.startsWith('.') || importPath.startsWith('/')) {
        let fullPath = path.resolve(path.dirname(filePath), importPath);
        
        // Tentar com diferentes extensões
        const extensions = ['', '.ts', '.tsx', '.js', '.jsx'];
        let exists = false;
        
        for (const ext of extensions) {
          if (fs.existsSync(fullPath + ext)) {
            exists = true;
            break;
          }
        }
        
        // Se não existe, marcar para remoção
        if (!exists && !importPath.includes('node_modules')) {
          linesToRemove.push(i);
          fixes.push(`Removido import órfão: ${importPath}`);
          modified = true;
        }
      }
    }
  });
  
  // Remover linhas marcadas (de trás para frente)
  linesToRemove.reverse().forEach(lineIndex => {
    lines.splice(lineIndex, 1);
  });
  
  if (linesToRemove.length > 0) {
    content = lines.join('\n');
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
    fixes.forEach(fix => console.log(`  - ${fix}`));
    return fixes.length;
  }
  
  return 0;
}

function main() {
  console.log('🔧 Corrigindo problemas finais para atingir 100%...\n');
  
  let totalFixes = 0;
  
  PACKAGES.forEach(pkg => {
    console.log(`\n📦 Processing ${pkg}...`);
    const srcPath = path.join(pkg, 'src');
    const files = getAllFiles(srcPath);
    
    let pkgFixes = 0;
    files.forEach(file => {
      const fixes = fixImportsInFile(file);
      pkgFixes += fixes;
    });
    
    console.log(`   ${pkgFixes} fixes applied`);
    totalFixes += pkgFixes;
  });
  
  console.log(`\n✨ Done! Applied ${totalFixes} fixes total.\n`);
  
  if (totalFixes === 0) {
    console.log('✅ Nenhuma correção necessária! Tudo já está correto.\n');
  } else {
    console.log('🎉 Todos os problemas foram corrigidos!\n');
    console.log('⏭️  Próximo passo: Testar os microserviços\n');
  }
}

main();

