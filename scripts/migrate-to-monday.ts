#!/usr/bin/env tsx
/**
 * Script de Migração Automatizada para Monday.com Design System
 * 
 * Aplica substituições de cores, espaçamento e tipografia em páginas
 * do MoocaFisio para o design system Monday.com
 * 
 * Uso:
 *   npx tsx scripts/migrate-to-monday.ts --dry-run
 *   npx tsx scripts/migrate-to-monday.ts --apply
 *   npx tsx scripts/migrate-to-monday.ts --file=pages/CRMPage.tsx
 */

import fs from 'fs';
import path from 'path';

// ============================================
// CONFIGURAÇÃO DE SUBSTITUIÇÕES
// ============================================

const COLOR_REPLACEMENTS: Record<string, string> = {
  // Backgrounds Slate → Neutral
  'bg-slate-50': 'bg-neutral-bgAlt',
  'bg-slate-100': 'bg-neutral-bgDark',
  'bg-slate-200': 'bg-neutral-bgDark',
  'bg-slate-900': 'bg-neutral-text',
  
  // Text Slate → Neutral
  'text-slate-900': 'text-neutral-text',
  'text-slate-800': 'text-neutral-text',
  'text-slate-700': 'text-neutral-text',
  'text-slate-600': 'text-neutral-textSecondary',
  'text-slate-500': 'text-neutral-textSecondary',
  'text-slate-400': 'text-neutral-textTertiary',
  
  // Borders Slate → Neutral
  'border-slate-200': 'border-neutral-border',
  'border-slate-300': 'border-neutral-border',
  
  // Fisio colors → Monday.com
  'bg-fisio-primary-600': 'bg-primary',
  'bg-fisio-primary-500': 'bg-primary',
  'text-fisio-primary-600': 'text-primary',
  'bg-fisio-neutral-50': 'bg-neutral-bgAlt',
  'text-fisio-neutral-800': 'text-neutral-text',
  'border-fisio-neutral-200': 'border-neutral-border',
  
  // Blue → Primary
  'bg-blue-500': 'bg-primary',
  'bg-blue-600': 'bg-primary',
  'bg-blue-700': 'bg-primary-hover',
  'text-blue-600': 'text-primary',
  'text-blue-700': 'text-primary',
  'bg-blue-100': 'bg-primary-light',
  'bg-blue-50': 'bg-primary-light',
  'border-blue-200': 'border-primary',
  
  // Sky → Primary
  'bg-sky-500': 'bg-primary',
  'bg-sky-600': 'bg-primary-hover',
  'bg-sky-700': 'bg-primary-hover',
  'text-sky-600': 'text-primary',
  'text-sky-700': 'text-primary',
  'bg-sky-100': 'bg-primary-light',
  'bg-sky-50': 'bg-primary-light',
  'border-sky-100': 'border-primary',
  
  // Green → Success
  'text-green-600': 'text-success',
  'text-green-700': 'text-success',
  'text-green-800': 'text-success',
  'bg-green-100': 'bg-success-light',
  'bg-green-50': 'bg-success-light',
  'bg-green-500': 'bg-success',
  'border-green-200': 'border-success',
  'border-green-300': 'border-success',
  
  // Red → Error
  'text-red-600': 'text-error',
  'text-red-700': 'text-error',
  'text-red-800': 'text-error',
  'bg-red-100': 'bg-error-light',
  'bg-red-50': 'bg-error-light',
  'bg-red-500': 'bg-error',
  'border-red-200': 'border-error',
  'border-red-300': 'border-error',
  'border-red-500': 'border-error',
  
  // Orange/Yellow → Warning
  'text-orange-600': 'text-warning',
  'text-orange-700': 'text-warning',
  'text-orange-800': 'text-warning',
  'bg-orange-100': 'bg-warning-light',
  'bg-orange-50': 'bg-warning-light',
  'border-orange-200': 'border-warning',
  'text-yellow-600': 'text-warning',
  'bg-yellow-100': 'bg-warning-light',
  'bg-yellow-50': 'bg-warning-light',
  
  // Gray → Neutral (Generic)
  'bg-gray-50': 'bg-neutral-bgAlt',
  'bg-gray-100': 'bg-neutral-bgDark',
  'text-gray-900': 'text-neutral-text',
  'text-gray-600': 'text-neutral-textSecondary',
  'text-gray-400': 'text-neutral-textTertiary',
  'border-gray-200': 'border-neutral-border',
  
  // Shadcn muted → Neutral
  'text-muted-foreground': 'text-neutral-textSecondary',
};

const SPACING_REPLACEMENTS: Record<string, string> = {
  // Space Y
  'space-y-8': 'space-y-3xl',
  'space-y-6': 'space-y-xl',
  'space-y-4': 'space-y-md',
  'space-y-2': 'space-y-sm',
  'space-y-3': 'space-y-sm',
  
  // Gap
  'gap-6': 'gap-lg',
  'gap-4': 'gap-md',
  'gap-2': 'gap-sm',
  'gap-3': 'gap-md',
  'gap-8': 'gap-xl',
  
  // Padding
  'p-8': 'p-xl',
  'p-6': 'p-lg',
  'p-4': 'p-md',
  'p-2': 'p-sm',
  'p-3': 'p-md',
  
  // Padding X/Y
  'py-8': 'py-3xl',
  'py-6': 'py-xl',
  'py-4': 'py-md',
  'py-2': 'py-sm',
  'px-8': 'px-xl',
  'px-6': 'px-lg',
  'px-4': 'px-md',
  'px-2': 'px-sm',
  'px-3': 'px-md',
  
  // Margin
  'mb-8': 'mb-3xl',
  'mb-6': 'mb-xl',
  'mb-4': 'mb-md',
  'mb-2': 'mb-sm',
  'mb-3': 'mb-md',
  'mt-8': 'mt-3xl',
  'mt-6': 'mt-xl',
  'mt-4': 'mt-md',
  'mt-2': 'mt-sm',
  'mt-1': 'mt-xs',
  'mr-2': 'mr-sm',
  'mr-1': 'mr-xs',
  'ml-2': 'ml-sm',
  'ml-1': 'ml-xs',
};

const SHADOW_REPLACEMENTS: Record<string, string> = {
  'shadow-sm': 'shadow-card',
  'shadow-md': 'shadow-cardHover',
  'shadow-lg': 'shadow-cardActive',
  'hover:shadow-lg': 'hover:shadow-cardHover',
  'hover:shadow-md': 'hover:shadow-cardHover',
};

const RADIUS_REPLACEMENTS: Record<string, string> = {
  'rounded-xl': 'rounded-card',
  'rounded-2xl': 'rounded-cardLarge',
};

// ============================================
// PÁGINAS DE ALTA PRIORIDADE
// ============================================

const HIGH_PRIORITY_PAGES = [
  'pages/CRMDashboardPage.tsx',
  'pages/AnalyticsDashboardPage.tsx',
  'pages/NotificationCenterPage.tsx',
  'pages/GamificationDashboard.tsx',
  'pages/AdvancedAnalyticsDashboard.tsx',
  'pages/AcompanhamentoPage.tsx',
  'pages/SessionEvolutionPage.tsx',
  'pages/AppointmentListPage.tsx',
  'pages/CheckInPage.tsx',
  'pages/UserManagementPage.tsx',
  'pages/SettingsPage.tsx',
  'pages/ReportsPage.tsx',
];

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

interface MigrationResult {
  file: string;
  success: boolean;
  changesCount: number;
  changes: Array<{ type: string; count: number }>;
  error?: string;
}

function applyReplacements(
  content: string,
  replacements: Record<string, string>,
  type: string
): { content: string; count: number } {
  let newContent = content;
  let count = 0;

  Object.entries(replacements).forEach(([oldValue, newValue]) => {
    const regex = new RegExp(oldValue, 'g');
    const matches = (newContent.match(regex) || []).length;
    if (matches > 0) {
      newContent = newContent.replace(regex, newValue);
      count += matches;
    }
  });

  return { content: newContent, count };
}

function addTypographyImportIfNeeded(content: string, filePath: string): string {
  // Verifica se já tem import de Typography
  if (content.includes("from '../src/components/ui/Typography'") ||
      content.includes('from "@/components/ui/Typography"')) {
    return content;
  }

  // Verifica se o arquivo usa h1, h2, h3 ou p que poderiam ser Typography
  const usesHeadings = /className="text-(3xl|2xl|xl|lg).*font-bold/.test(content);
  const usesParagraphs = /className="text-(gray|slate)-600/.test(content);

  if (usesHeadings || usesParagraphs) {
    // Adiciona import após os outros imports
    const importRegex = /(import.*from.*;\n)(?!import)/;
    const typographyImport = `import { H1, H2, H3, H4, Body, Small } from '../src/components/ui/Typography';\n`;
    
    return content.replace(importRegex, `$1${typographyImport}`);
  }

  return content;
}

function migratePage(filePath: string, dryRun: boolean = true): MigrationResult {
  const fullPath = path.join(process.cwd(), filePath);

  try {
    // Ler arquivo
    if (!fs.existsSync(fullPath)) {
      return {
        file: filePath,
        success: false,
        changesCount: 0,
        changes: [],
        error: 'Arquivo não encontrado',
      };
    }

    let content = fs.readFileSync(fullPath, 'utf-8');
    const originalContent = content;
    const changes: Array<{ type: string; count: number }> = [];

    // Aplicar substituições
    const colorResult = applyReplacements(content, COLOR_REPLACEMENTS, 'cores');
    content = colorResult.content;
    if (colorResult.count > 0) {
      changes.push({ type: 'Cores', count: colorResult.count });
    }

    const spacingResult = applyReplacements(content, SPACING_REPLACEMENTS, 'espaçamento');
    content = spacingResult.content;
    if (spacingResult.count > 0) {
      changes.push({ type: 'Espaçamento', count: spacingResult.count });
    }

    const shadowResult = applyReplacements(content, SHADOW_REPLACEMENTS, 'shadows');
    content = shadowResult.content;
    if (shadowResult.count > 0) {
      changes.push({ type: 'Shadows', count: shadowResult.count });
    }

    const radiusResult = applyReplacements(content, RADIUS_REPLACEMENTS, 'radius');
    content = radiusResult.content;
    if (radiusResult.count > 0) {
      changes.push({ type: 'Border Radius', count: radiusResult.count });
    }

    // Adicionar import Typography se necessário
    content = addTypographyImportIfNeeded(content, filePath);

    const totalChanges = changes.reduce((sum, c) => sum + c.count, 0);

    // Salvar se não for dry-run
    if (!dryRun && content !== originalContent) {
      fs.writeFileSync(fullPath, content, 'utf-8');
    }

    return {
      file: filePath,
      success: true,
      changesCount: totalChanges,
      changes,
    };
  } catch (error: any) {
    return {
      file: filePath,
      success: false,
      changesCount: 0,
      changes: [],
      error: error.message,
    };
  }
}

// ============================================
// MAIN
// ============================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const applyChanges = args.includes('--apply');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const singleFile = fileArg ? fileArg.split('=')[1] : null;

  console.log('\n🎨 Script de Migração Monday.com\n');
  console.log('='.repeat(60));
  console.log(`Modo: ${applyChanges ? '✅ APLICAR MUDANÇAS' : dryRun ? '👁️  DRY-RUN (Preview)' : '⚠️  Use --dry-run ou --apply'}\n`);

  if (!dryRun && !applyChanges) {
    console.log('⚠️  Por favor, especifique --dry-run ou --apply\n');
    console.log('Exemplos:');
    console.log('  npx tsx scripts/migrate-to-monday.ts --dry-run');
    console.log('  npx tsx scripts/migrate-to-monday.ts --apply');
    console.log('  npx tsx scripts/migrate-to-monday.ts --dry-run --file=pages/CRMPage.tsx\n');
    process.exit(1);
  }

  // Determinar quais arquivos processar
  const filesToProcess = singleFile ? [singleFile] : HIGH_PRIORITY_PAGES;

  console.log(`📄 Processando ${filesToProcess.length} arquivo(s)...\n`);

  const results: MigrationResult[] = [];
  let totalChanges = 0;

  filesToProcess.forEach((file, index) => {
    console.log(`[${index + 1}/${filesToProcess.length}] Processando: ${file}`);
    
    const result = migratePage(file, dryRun);
    results.push(result);

    if (result.success) {
      if (result.changesCount > 0) {
        console.log(`  ✅ ${result.changesCount} substituições aplicadas:`);
        result.changes.forEach(change => {
          console.log(`     - ${change.type}: ${change.count}`);
        });
        totalChanges += result.changesCount;
      } else {
        console.log(`  ⏭️  Nenhuma mudança necessária`);
      }
    } else {
      console.log(`  ❌ Erro: ${result.error}`);
    }
    console.log('');
  });

  // Resumo final
  console.log('='.repeat(60));
  console.log('\n📊 RESUMO DA MIGRAÇÃO\n');
  console.log(`Total de arquivos: ${results.length}`);
  console.log(`Sucesso: ${results.filter(r => r.success).length}`);
  console.log(`Erros: ${results.filter(r => !r.success).length}`);
  console.log(`Total de mudanças: ${totalChanges}\n`);

  // Detalhamento por tipo
  const changesByType: Record<string, number> = {};
  results.forEach(result => {
    result.changes.forEach(change => {
      changesByType[change.type] = (changesByType[change.type] || 0) + change.count;
    });
  });

  if (Object.keys(changesByType).length > 0) {
    console.log('Mudanças por tipo:');
    Object.entries(changesByType).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    console.log('');
  }

  // Salvar relatório
  const reportPath = path.join(process.cwd(), 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log(`📝 Relatório salvo em: migration-report.json\n`);

  if (dryRun) {
    console.log('👁️  DRY-RUN: Nenhum arquivo foi modificado.');
    console.log('   Execute com --apply para aplicar as mudanças.\n');
  } else {
    console.log('✅ Mudanças aplicadas com sucesso!');
    console.log('   Verifique os arquivos e execute npm run lint\n');
  }
}

// Executar
main();

