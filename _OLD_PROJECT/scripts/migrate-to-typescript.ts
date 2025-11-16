/**
 * Script automatizado para migração TypeScript em batch
 * Criado: 06/11/2025
 * 
 * Migra múltiplos arquivos JS/JSX para TS/TSX
 * Com análise de tipos, interfaces e correções automáticas
 */

import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve, extname, basename } from 'path';

// ============================================================================
// TYPES
// ============================================================================

interface MigrationResult {
  source: string;
  target: string;
  success: boolean;
  linesAdded: number;
  interfacesCreated: number;
  errors?: string[];
}

interface BatchMigrationStats {
  total: number;
  successful: number;
  failed: number;
  linesProcessed: number;
  interfacesCreated: number;
  duration: number;
}

// ============================================================================
// MIGRATION RULES
// ============================================================================

const MIGRATION_RULES = {
  // Remover PropTypes
  removePropTypes: true,
  
  // Adicionar tipos para useState
  addStateTypes: true,
  
  // Adicionar tipos para useEffect deps
  addEffectTypes: true,
  
  // Adicionar return types para functions
  addReturnTypes: true,
  
  // Criar interfaces de Props
  createPropsInterfaces: true,
};

// ============================================================================
// TYPE INFERENCE
// ============================================================================

/**
 * Infere tipo básico de uma variável useState
 */
function inferStateType(initialValue: string): string {
  if (initialValue === 'null') return 'null';
  if (initialValue === 'undefined') return 'undefined';
  if (initialValue === 'true' || initialValue === 'false') return 'boolean';
  if (initialValue === '[]') return 'any[]';
  if (initialValue === '{}') return 'Record<string, any>';
  if (initialValue.match(/^\d+$/)) return 'number';
  if (initialValue.match(/^["'`]/)) return 'string';
  if (initialValue.startsWith('() =>')) return 'unknown';
  
  return 'any'; // fallback
}

/**
 * Extrai interfaces de Props de um component
 */
function extractPropsInterface(content: string, componentName: string): string | null {
  // Procurar por desestruturação de props
  const propsMatch = content.match(/\(\s*{\s*([^}]+)\s*}\s*\)/);
  if (!propsMatch) return null;
  
  const props = propsMatch[1]
    .split(',')
    .map(p => p.trim())
    .filter(p => p.length > 0);
  
  if (props.length === 0) return null;
  
  let interfaceCode = `interface ${componentName}Props {\n`;
  
  for (const prop of props) {
    const [name] = prop.split('=').map(s => s.trim());
    interfaceCode += `  ${name}: any; // TODO: Define proper type\n`;
  }
  
  interfaceCode += '}\n\n';
  
  return interfaceCode;
}

/**
 * Adiciona tipos para useState hooks
 */
function addStateTypes(content: string): string {
  // Padrão: const [state, setState] = useState(initialValue);
  const stateRegex = /const\s+\[([^\]]+)\]\s+=\s+useState\(([^)]*)\);/g;
  
  return content.replace(stateRegex, (match, stateVars, initialValue) => {
    const [stateName] = stateVars.split(',').map((s: string) => s.trim());
    const type = inferStateType(initialValue.trim());
    
    return `const [${stateVars}] = useState<${type}>(${initialValue});`;
  });
}

/**
 * Adiciona React.FC para functional components
 */
function addReactFC(content: string): string {
  // Pattern: export const ComponentName = ({ props }) => {
  const componentRegex = /export\s+const\s+(\w+)\s+=\s+\(\s*{\s*([^}]*)\s*}\s*\)\s+=>/g;
  
  return content.replace(componentRegex, (match, componentName, props) => {
    if (props.trim()) {
      return `export const ${componentName}: React.FC<${componentName}Props> = ({ ${props} }) =>`;
    }
    return `export const ${componentName}: React.FC = () =>`;
  });
}

/**
 * Remove PropTypes (não necessário em TypeScript)
 */
function removePropTypes(content: string): string {
  // Remove import de prop-types
  content = content.replace(/import\s+PropTypes\s+from\s+['"]prop-types['"];\s*\n/g, '');
  
  // Remove definições de propTypes
  content = content.replace(/\w+\.propTypes\s+=\s+{[^}]*};\s*\n/g, '');
  
  return content;
}

/**
 * Adiciona import do React corretamente
 */
function fixReactImport(content: string): string {
  // Se já tem import React, não fazer nada
  if (content.includes('import React')) return content;
  
  // Adicionar import React no início
  return `import React from 'react';\n${content}`;
}

// ============================================================================
// MAIN MIGRATION FUNCTION
// ============================================================================

/**
 * Migra um arquivo JS/JSX para TS/TSX
 */
function migrateFile(sourcePath: string): MigrationResult {
  const ext = extname(sourcePath);
  const targetExt = ext === '.jsx' ? '.tsx' : '.ts';
  const targetPath = sourcePath.replace(ext, targetExt);
  
  const result: MigrationResult = {
    source: sourcePath,
    target: targetPath,
    success: false,
    linesAdded: 0,
    interfacesCreated: 0,
    errors: [],
  };
  
  try {
    let content = readFileSync(sourcePath, 'utf-8');
    const originalLines = content.split('\n').length;
    
    // Aplicar transformações
    if (MIGRATION_RULES.removePropTypes) {
      content = removePropTypes(content);
    }
    
    if (MIGRATION_RULES.addStateTypes) {
      content = addStateTypes(content);
    }
    
    if (MIGRATION_RULES.createPropsInterfaces) {
      const componentName = basename(sourcePath, ext);
      const propsInterface = extractPropsInterface(content, componentName);
      
      if (propsInterface) {
        // Inserir interface após imports
        const importEnd = content.lastIndexOf('import ') + content.substring(content.lastIndexOf('import ')).indexOf(';\n') + 2;
        content = content.substring(0, importEnd) + '\n' + propsInterface + content.substring(importEnd);
        result.interfacesCreated++;
      }
    }
    
    if (ext === '.jsx') {
      content = addReactFC(content);
    }
    
    content = fixReactImport(content);
    
    // Adicionar header de migração
    const header = `/**\n * MIGRADO PARA TYPESCRIPT: ${new Date().toISOString().split('T')[0]}\n * Migração automática via script\n */\n\n`;
    content = header + content;
    
    const newLines = content.split('\n').length;
    result.linesAdded = newLines - originalLines;
    
    // Escrever arquivo novo
    writeFileSync(targetPath, content, 'utf-8');
    
    // Deletar arquivo antigo
    unlinkSync(sourcePath);
    
    result.success = true;
  } catch (error) {
    result.errors = [error instanceof Error ? error.message : String(error)];
  }
  
  return result;
}

/**
 * Migra múltiplos arquivos em batch
 */
function migrateBatch(files: string[]): BatchMigrationStats {
  const startTime = Date.now();
  
  const stats: BatchMigrationStats = {
    total: files.length,
    successful: 0,
    failed: 0,
    linesProcessed: 0,
    interfacesCreated: 0,
    duration: 0,
  };
  
  for (const file of files) {
    if (!existsSync(file)) {
      console.warn(`⚠️  Arquivo não encontrado: ${file}`);
      stats.failed++;
      continue;
    }
    
    console.log(`🔄 Migrando: ${file}`);
    const result = migrateFile(file);
    
    if (result.success) {
      stats.successful++;
      stats.linesProcessed += result.linesAdded;
      stats.interfacesCreated += result.interfacesCreated;
      console.log(`✅ Migrado: ${result.target}`);
    } else {
      stats.failed++;
      console.error(`❌ Falhou: ${file}`);
      console.error(`   Erros: ${result.errors?.join(', ')}`);
    }
  }
  
  stats.duration = Date.now() - startTime;
  
  return stats;
}

// ============================================================================
// CLI
// ============================================================================

const filesToMigrate = [
  // Contexts
  'contexts/ExerciseContext.jsx',
  
  // Hooks críticos (top 10)
  'hooks/supabase/useSupabaseAppointments.js',
  'hooks/supabase/useSupabaseAuth.js',
  'hooks/supabase/useSupabasePatients.js',
  'hooks/useAITools.js',
  'hooks/useAlerts.js',
  'hooks/useAppointments.js',
  'hooks/useAuditLogs.js',
  'hooks/useBackup.js',
  'hooks/useBodyMap.js',
  'hooks/useClinicalAnalytics.js',
];

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║                                                           ║');
console.log('║   🚀 MIGRAÇÃO AUTOMÁTICA PARA TYPESCRIPT 🚀              ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');
console.log(`📁 Arquivos para migrar: ${filesToMigrate.length}`);
console.log('');

const stats = migrateBatch(filesToMigrate);

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('                  📊 RELATÓRIO FINAL');
console.log('═══════════════════════════════════════════════════════════');
console.log(`Total de arquivos:        ${stats.total}`);
console.log(`✅ Bem-sucedidos:         ${stats.successful}`);
console.log(`❌ Falharam:              ${stats.failed}`);
console.log(`📝 Linhas processadas:    ${stats.linesProcessed}`);
console.log(`🎯 Interfaces criadas:    ${stats.interfacesCreated}`);
console.log(`⏱️  Duração:               ${(stats.duration / 1000).toFixed(2)}s`);
console.log('═══════════════════════════════════════════════════════════');
console.log('');

if (stats.failed > 0) {
  console.log('⚠️  Alguns arquivos falharam. Verifique os erros acima.');
  process.exit(1);
} else {
  console.log('🎉 MIGRAÇÃO COMPLETA COM SUCESSO!');
  process.exit(0);
}

