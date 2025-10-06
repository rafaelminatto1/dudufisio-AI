#!/usr/bin/env node

/**
 * Script para migrar componentes forwardRef para React 19
 * Converte React.forwardRef para sintaxe de props normais
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de arquivos para migrar
const filesToMigrate = [
  'components/ui/tabs.tsx',
  'components/ui/select.tsx',
  'components/ui/alert.tsx',
  'components/ui/dialog.tsx',
  'components/ui/slider.tsx',
  'components/ui/form.tsx',
  'components/ui/scroll-area.tsx',
  'components/ui/label.tsx',
  'components/ui/toast.tsx',
  'components/ui/textarea.tsx',
  'components/ui/table.tsx',
  'components/ui/command.tsx',
  'components/ui/tooltip.tsx',
  'components/ui/switch.tsx',
  'components/ui/avatar.tsx',
  'components/ui/separator.tsx',
  'components/ui/popover.tsx'
];

function migrateForwardRef(content) {
  // Padrão para encontrar React.forwardRef
  const forwardRefPattern = /React\.forwardRef<([^,]+),\s*([^>]+)>\s*\(\s*\(\s*{\s*([^}]+)\s*},\s*ref\s*\)\s*=>\s*{([^}]+)}\s*\)/g;
  
  // Padrão para encontrar interfaces
  const interfacePattern = /export\s+interface\s+(\w+)\s+extends\s+([^{]+)\s*{([^}]+)}/g;
  
  let migratedContent = content;
  
  // Migrar interfaces para incluir ref
  migratedContent = migratedContent.replace(interfacePattern, (match, interfaceName, extendsClause, body) => {
    if (!body.includes('ref?:')) {
      return `${match}\n  ref?: React.Ref<any>`;
    }
    return match;
  });
  
  // Migrar forwardRef para função normal
  migratedContent = migratedContent.replace(forwardRefPattern, (match, refType, propsType, destructuredProps, functionBody) => {
    // Extrair nome do componente (assumindo que está na linha anterior)
    const lines = migratedContent.split('\n');
    const matchIndex = migratedContent.indexOf(match);
    const beforeMatch = migratedContent.substring(0, matchIndex);
    const linesBefore = beforeMatch.split('\n');
    
    // Procurar por const ComponentName = ou function ComponentName
    let componentName = 'Component';
    for (let i = linesBefore.length - 1; i >= 0; i--) {
      const line = linesBefore[i].trim();
      if (line.startsWith('const ') && line.includes('=')) {
        componentName = line.split('=')[0].replace('const ', '').trim();
        break;
      }
    }
    
    // Criar nova sintaxe
    const newFunction = `const ${componentName} = ({ ${destructuredProps}, ref, ...props }: ${propsType} & { ref?: React.Ref<${refType}> }) => {
${functionBody}
}`;
    
    return newFunction;
  });
  
  return migratedContent;
}

function migrateFile(filePath) {
  try {
    const fullPath = path.join(path.dirname(__dirname), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`❌ Arquivo não encontrado: ${filePath}`);
      return;
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    const migratedContent = migrateForwardRef(content);
    
    if (content !== migratedContent) {
      fs.writeFileSync(fullPath, migratedContent, 'utf8');
      console.log(`✅ Migrado: ${filePath}`);
    } else {
      console.log(`⏭️  Nenhuma mudança necessária: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Erro ao migrar ${filePath}:`, error.message);
  }
}

// Executar migração
console.log('🚀 Iniciando migração de forwardRef para React 19...\n');

filesToMigrate.forEach(migrateFile);

console.log('\n✅ Migração concluída!');
console.log('\n📝 Próximos passos:');
console.log('1. Verificar se os tipos estão corretos');
console.log('2. Executar npm run type-check');
console.log('3. Executar npm run lint');
console.log('4. Testar a aplicação');
