#!/usr/bin/env node

/**
 * Script para adicionar type assertions 'as any' em operações Supabase
 * para corrigir erros de tipo temporariamente
 */

const fs = require('fs');
const path = require('path');

// Arquivos a processar
const FILES = [
  'services/supabase/patientService.ts',
  'services/supabase/goalsService.ts',
  'services/supabase/assessmentTestService.ts',
  'services/supabase/pathologyService.ts',
  'services/supabase/surgeryService.ts',
  'services/supabase/patientServiceSupabase.ts',
];

let totalFiles = 0;
let totalFixes = 0;

function fixSupabaseTypes(content) {
  let modified = false;
  let fixes = 0;
  
  // Pattern 1: .insert({ ... }) -> .insert({ ... } as any)
  const insertPattern = /\.insert\(\s*\{([^}]+)\}\s*\)/g;
  content = content.replace(insertPattern, (match, body) => {
    // Verificar se já tem 'as any'
    if (match.includes('as any')) {
      return match;
    }
    modified = true;
    fixes++;
    return `.insert({${body}} as any)`;
  });
  
  // Pattern 2: .update({ ... }) -> .update({ ... } as any)
  const updatePattern = /\.update\(\s*\{([^}]+)\}\s*\)/g;
  content = content.replace(updatePattern, (match, body) => {
    // Verificar se já tem 'as any'
    if (match.includes('as any')) {
      return match;
    }
    modified = true;
    fixes++;
    return `.update({${body}} as any)`;
  });
  
  return { content, modified, fixes };
}

function processFile(filePath) {
  const fullPath = path.resolve(filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠ Arquivo não encontrado: ${fullPath}`);
    return;
  }
  
  totalFiles++;
  
  try {
    const content = fs.readFileSync(fullPath, 'utf8');
    const { content: newContent, modified, fixes } = fixSupabaseTypes(content);
    
    if (modified) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      totalFixes += fixes;
      console.log(`✓ ${filePath} - ${fixes} correções aplicadas`);
    }
  } catch (error) {
    console.error(`✗ Erro ao processar ${filePath}:`, error.message);
  }
}

// Executar
console.log('🔧 Adicionando type assertions para Supabase...\n');

for (const file of FILES) {
  processFile(file);
}

console.log('\n✅ Correção concluída!');
console.log(`📊 Estatísticas:`);
console.log(`   - Arquivos verificados: ${totalFiles}`);
console.log(`   - Correções aplicadas: ${totalFixes}`);

