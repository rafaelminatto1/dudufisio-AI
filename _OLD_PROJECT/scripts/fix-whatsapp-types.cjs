#!/usr/bin/env node

/**
 * Script para adicionar type assertions em serviços WhatsApp
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'services/whatsapp/WhatsAppSchedulingService.ts',
  'services/whatsapp/WhatsAppAutomation.ts',
  'services/whatsapp/WhatsAppNotificationService.ts',
  'services/whatsapp/rateLimiter.ts',
];

let totalFiles = 0;
let totalFixes = 0;

function fixWhatsAppTypes(content) {
  let modified = false;
  let fixes = 0;
  
  // Pattern: .insert({ ... }) -> .insert({ ... } as any)
  const insertPattern = /\.insert\(\s*\{([^}]+)\}\s*\)/g;
  content = content.replace(insertPattern, (match, body) => {
    if (match.includes('as any')) {
      return match;
    }
    modified = true;
    fixes++;
    return `.insert({${body}} as any)`;
  });
  
  // Pattern: .update({ ... }) -> .update({ ... } as any)
  const updatePattern = /\.update\(\s*\{([^}]+)\}\s*\)/g;
  content = content.replace(updatePattern, (match, body) => {
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
    const { content: newContent, modified, fixes } = fixWhatsAppTypes(content);
    
    if (modified) {
      fs.writeFileSync(fullPath, newContent, 'utf8');
      totalFixes += fixes;
      console.log(`✓ ${filePath} - ${fixes} correções aplicadas`);
    }
  } catch (error) {
    console.error(`✗ Erro ao processar ${filePath}:`, error.message);
  }
}

console.log('🔧 Corrigindo tipos WhatsApp...\n');

for (const file of FILES) {
  processFile(file);
}

console.log('\n✅ Correção concluída!');
console.log(`📊 Estatísticas:`);
console.log(`   - Arquivos verificados: ${totalFiles}`);
console.log(`   - Correções aplicadas: ${totalFixes}`);

