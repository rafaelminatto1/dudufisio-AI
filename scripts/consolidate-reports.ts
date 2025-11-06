#!/usr/bin/env tsx
/**
 * Script para Consolidar Migration Reports
 * Consolida todos os relatórios de migração em um único arquivo
 */

import fs from 'fs';
import path from 'path';

interface MigrationResult {
  file: string;
  success: boolean;
  changesCount: number;
  changes: Array<{ type: string; count: number }>;
  error?: string;
}

function main() {
  console.log('\n📊 Consolidando Migration Reports...\n');

  const reportPath = path.join(process.cwd(), 'migration-report.json');
  
  if (!fs.existsSync(reportPath)) {
    console.log('❌ migration-report.json não encontrado');
    process.exit(1);
  }

  const currentReport: MigrationResult[] = JSON.parse(
    fs.readFileSync(reportPath, 'utf-8')
  );

  // Estatísticas gerais
  const stats = {
    timestamp: new Date().toISOString(),
    summary: {
      totalPages: 144,
      initialBatch: 19,
      lote1: 30,
      lote2: 45,
      lote3: 48,
      additionalPages: 2,
    },
    totalChanges: 0,
    changesByType: {} as Record<string, number>,
    batches: {
      initial: {
        pages: 19,
        changes: 701, // Do relatório anterior
        breakdown: {
          'Cores': 298,
          'Espaçamento': 354,
          'Shadows': 27,
          'Border Radius': 22,
        }
      },
      lote1: {
        pages: 30,
        changes: 0,
        breakdown: {} as Record<string, number>
      },
      lote2: {
        pages: 45,
        changes: 0,
        breakdown: {} as Record<string, number>
      },
      lote3: {
        pages: 48,
        changes: 0,
        breakdown: {} as Record<string, number>
      }
    }
  };

  // Processar relatório atual
  currentReport.forEach(result => {
    if (result.success) {
      stats.totalChanges += result.changesCount;
      
      result.changes.forEach(change => {
        const type = change.type;
        stats.changesByType[type] = (stats.changesByType[type] || 0) + change.count;
      });
    }
  });

  // Adicionar mudanças do batch inicial
  stats.totalChanges += 701;
  stats.changesByType['Cores'] = (stats.changesByType['Cores'] || 0) + 298;
  stats.changesByType['Espaçamento'] = (stats.changesByType['Espaçamento'] || 0) + 354;
  stats.changesByType['Shadows'] = (stats.changesByType['Shadows'] || 0) + 27;
  stats.changesByType['Border Radius'] = (stats.changesByType['Border Radius'] || 0) + 22;

  console.log('📈 Estatísticas Consolidadas:');
  console.log(`   Total de Páginas: ${stats.summary.totalPages}`);
  console.log(`   Total de Mudanças: ${stats.totalChanges}`);
  console.log('\n📊 Mudanças por Tipo:');
  Object.entries(stats.changesByType).forEach(([type, count]) => {
    console.log(`   - ${type}: ${count}`);
  });

  // Salvar consolidado
  const consolidatedPath = path.join(process.cwd(), 'migration-report-final.json');
  fs.writeFileSync(consolidatedPath, JSON.stringify(stats, null, 2));

  console.log(`\n✅ Relatório consolidado salvo em: migration-report-final.json\n`);
}

main();

