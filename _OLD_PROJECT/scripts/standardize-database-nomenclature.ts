#!/usr/bin/env tsx

/**
 * Database Nomenclature Standardization Script
 * 
 * This script standardizes database table and column names across the DuduFisio-AI project
 * following consistent naming conventions and best practices.
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Database configuration
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

interface TableStandardization {
  currentName: string;
  recommendedName: string;
  columns: ColumnStandardization[];
  reason: string;
}

interface ColumnStandardization {
  currentName: string;
  recommendedName: string;
  dataType: string;
  reason: string;
}

interface NomenclatureReport {
  timestamp: string;
  totalTables: number;
  standardizedTables: number;
  recommendations: TableStandardization[];
  inconsistencies: string[];
  bestPractices: string[];
}

class DatabaseNomenclatureStandardizer {
  private supabase: any;
  private report: NomenclatureReport;

  constructor() {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
      throw new Error('Supabase credentials not found in environment variables');
    }

    this.supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
    this.report = {
      timestamp: new Date().toISOString(),
      totalTables: 0,
      standardizedTables: 0,
      recommendations: [],
      inconsistencies: [],
      bestPractices: []
    };
  }

  async runStandardization(): Promise<void> {
    console.log('🏗️  Starting Database Nomenclature Standardization...');
    console.log('=' .repeat(60));

    try {
      // Get current database schema
      const schema = await this.getDatabaseSchema();
      
      // Analyze naming conventions
      const analysis = await this.analyzeNomenclature(schema);
      
      // Generate recommendations
      this.generateRecommendations(analysis);
      
      // Check for inconsistencies
      this.checkInconsistencies(analysis);
      
      // Generate best practices guide
      this.generateBestPractices();
      
      // Save report
      await this.saveReport();
      
      // Generate SQL migration script
      await this.generateMigrationScript();
      
      console.log('\n✅ Database Nomenclature Standardization Complete!');
      console.log(`📋 Report saved to: scripts/reports/database-nomenclature-report-${new Date().toISOString().split('T')[0]}.json`);
      
    } catch (error) {
      console.error('❌ Database standardization failed:', error);
      process.exit(1);
    }
  }

  private async getDatabaseSchema(): Promise<any[]> {
    console.log('📊 Fetching database schema...');
    
    const { data, error } = await this.supabase
      .rpc('get_table_schema');
    
    if (error) {
      throw new Error(`Failed to fetch schema: ${error.message}`);
    }

    return data || [];
  }

  private async analyzeNomenclature(schema: any[]): Promise<any> {
    console.log('🔍 Analyzing naming conventions...');
    
    const analysis = {
      tables: new Map<string, any>(),
      namingPatterns: {
        snake_case: 0,
        camelCase: 0,
        PascalCase: 0,
        UPPER_CASE: 0,
        mixed: 0
      },
      prefixes: new Map<string, number>(),
      suffixes: new Map<string, number>()
    };

    for (const table of schema) {
      const tableName = table.table_name;
      
      // Analyze table name pattern
      const pattern = this.identifyNamingPattern(tableName);
      analysis.namingPatterns[pattern]++;
      
      // Extract prefixes and suffixes
      this.extractAffixes(tableName, analysis.prefixes, analysis.suffixes);
      
      // Store table analysis
      analysis.tables.set(tableName, {
        ...table,
        pattern,
        columns: await this.analyzeColumns(tableName)
      });
    }

    return analysis;
  }

  private identifyNamingPattern(name: string): string {
    if (/^[a-z]+(_[a-z]+)*$/.test(name)) return 'snake_case';
    if (/^[a-z]+([A-Z][a-z]*)*$/.test(name)) return 'camelCase';
    if (/^[A-Z][a-z]*([A-Z][a-z]*)*$/.test(name)) return 'PascalCase';
    if (/^[A-Z]+(_[A-Z]+)*$/.test(name)) return 'UPPER_CASE';
    return 'mixed';
  }

  private extractAffixes(name: string, prefixes: Map<string, number>, suffixes: Map<string, number>): void {
    const parts = name.split('_');
    
    if (parts.length > 1) {
      const prefix = parts[0];
      prefixes.set(prefix, (prefixes.get(prefix) || 0) + 1);
      
      const suffix = parts[parts.length - 1];
      suffixes.set(suffix, (suffixes.get(suffix) || 0) + 1);
    }
  }

  private async analyzeColumns(tableName: string): Promise<any[]> {
    const { data, error } = await this.supabase
      .rpc('get_column_info', { table_name: tableName });
    
    if (error) {
      console.warn(`Warning: Could not analyze columns for table ${tableName}: ${error.message}`);
      return [];
    }

    return (data || []).map((column: any) => ({
      ...column,
      pattern: this.identifyNamingPattern(column.column_name),
      isStandardized: this.isColumnNameStandardized(column.column_name, column.data_type)
    }));
  }

  private isColumnNameStandardized(columnName: string, dataType: string): boolean {
    // Common column naming patterns
    const standardPatterns = [
      { pattern: /_id$/, types: ['uuid', 'integer', 'bigint'] },
      { pattern: /_at$/, types: ['timestamp', 'timestamptz'] },
      { pattern: /_date$/, types: ['date', 'timestamp'] },
      { pattern: /_count$/, types: ['integer', 'bigint'] },
      { pattern: /_amount$/, types: ['numeric', 'decimal', 'money'] },
      { pattern: /_status$/, types: ['text', 'varchar', 'enum'] },
      { pattern: /_type$/, types: ['text', 'varchar', 'enum'] },
      { pattern: /_flag$/, types: ['boolean'] },
      { pattern: /_url$/, types: ['text', 'varchar'] },
      { pattern: /_email$/, types: ['text', 'varchar'] }
    ];

    return standardPatterns.some(({ pattern, types }) => 
      pattern.test(columnName) && types.some(type => dataType.includes(type))
    );
  }

  private generateRecommendations(analysis: any): void {
    console.log('💡 Generating standardization recommendations...');
    
    for (const [tableName, tableData] of analysis.tables) {
      const recommendations: TableStandardization = {
        currentName: tableName,
        recommendedName: this.recommendTableName(tableName),
        columns: [],
        reason: ''
      };

      // Check if table name needs standardization
      if (tableData.pattern !== 'snake_case') {
        recommendations.reason = `Table name should use snake_case convention (current: ${tableData.pattern})`;
      }

      // Analyze columns
      for (const column of tableData.columns) {
        if (!column.isStandardized) {
          const recommendedName = this.recommendColumnName(column.column_name, column.data_type);
          if (recommendedName !== column.column_name) {
            recommendations.columns.push({
              currentName: column.column_name,
              recommendedName,
              dataType: column.data_type,
              reason: 'Column name does not follow standard naming conventions'
            });
          }
        }
      }

      // Only add if there are recommendations
      if (recommendations.reason || recommendations.columns.length > 0) {
        this.report.recommendations.push(recommendations);
      }
    }
  }

  private recommendTableName(currentName: string): string {
    // Convert to snake_case
    let recommended = currentName
      .replace(/([A-Z])/g, '_$1') // camelCase/PascalCase to snake_case
      .toLowerCase()
      .replace(/^_/, '') // Remove leading underscore
      .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores

    // Add common prefixes if missing
    const commonPrefixes = ['tbl_', 'tb_', 't_'];
    const hasPrefix = commonPrefixes.some(prefix => recommended.startsWith(prefix));
    
    if (!hasPrefix && !recommended.endsWith('_table')) {
      recommended = `tbl_${recommended}`;
    }

    return recommended;
  }

  private recommendColumnName(currentName: string, dataType: string): string {
    let recommended = currentName
      .replace(/([A-Z])/g, '_$1')
      .toLowerCase()
      .replace(/^_/, '')
      .replace(/^_+|_+$/g, '');

    // Add appropriate suffixes based on data type
    if (dataType.includes('uuid') || dataType.includes('integer') || dataType.includes('bigint')) {
      if (!recommended.endsWith('_id') && !recommended.endsWith('_uuid')) {
        recommended = `${recommended}_id`;
      }
    } else if (dataType.includes('timestamp') || dataType.includes('date')) {
      if (!recommended.endsWith('_at') && !recommended.endsWith('_date')) {
        recommended = `${recommended}_at`;
      }
    } else if (dataType.includes('boolean')) {
      if (!recommended.endsWith('_flag') && !recommended.endsWith('_is')) {
        recommended = `${recommended}_flag`;
      }
    } else if (dataType.includes('numeric') || dataType.includes('decimal') || dataType.includes('money')) {
      if (!recommended.endsWith('_amount') && !recommended.endsWith('_value')) {
        recommended = `${recommended}_amount`;
      }
    }

    return recommended;
  }

  private checkInconsistencies(analysis: any): void {
    console.log('🔍 Checking for naming inconsistencies...');
    
    const inconsistencies: string[] = [];
    
    // Check for mixed naming patterns in the same table
    for (const [tableName, tableData] of analysis.tables) {
      const patterns = new Set(tableData.columns.map((col: any) => col.pattern));
      if (patterns.size > 1) {
        inconsistencies.push(
          `Table "${tableName}" uses mixed naming patterns: ${Array.from(patterns).join(', ')}`
        );
      }
    }

    // Check for inconsistent prefixes across tables
    const prefixes = Array.from(analysis.prefixes.entries());
    if (prefixes.length > 3) {
      inconsistencies.push(
        `Multiple table prefixes detected: ${prefixes.map(([p, c]) => `${p}(${c})`).join(', ')}`
      );
    }

    this.report.inconsistencies = inconsistencies;
  }

  private generateBestPractices(): void {
    console.log('📋 Generating best practices guide...');
    
    this.report.bestPractices = [
      'Use snake_case for all table and column names',
      'Add _id suffix for primary and foreign key columns',
      'Add _at suffix for timestamp columns (created_at, updated_at, deleted_at)',
      'Add _flag suffix for boolean columns',
      'Add _amount suffix for monetary/numeric columns',
      'Use descriptive, singular names for tables (user, appointment, payment)',
      'Avoid abbreviations unless they are industry standard',
      'Use consistent prefixes for related tables (tbl_user, tbl_user_profile)',
      'Reserve common column names: id, created_at, updated_at, deleted_at',
      'Use lowercase letters, numbers, and underscores only'
    ];
  }

  private async saveReport(): Promise<void> {
    console.log('💾 Saving standardization report...');
    
    const reportPath = path.join(__dirname, 'reports');
    if (!fs.existsSync(reportPath)) {
      fs.mkdirSync(reportPath, { recursive: true });
    }

    const filename = `database-nomenclature-report-${new Date().toISOString().split('T')[0]}.json`;
    const filepath = path.join(reportPath, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(this.report, null, 2));
    
    // Also save as latest
    const latestPath = path.join(reportPath, 'database-nomenclature-report-latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(this.report, null, 2));
  }

  private async generateMigrationScript(): Promise<void> {
    console.log('🔄 Generating migration SQL script...');
    
    const migrations: string[] = [
      '-- Database Nomenclature Standardization Migration',
      `-- Generated on: ${new Date().toISOString()}`,
      '-- This script standardizes table and column names following best practices',
      '',
      'BEGIN;',
      ''
    ];

    for (const recommendation of this.report.recommendations) {
      if (recommendation.currentName !== recommendation.recommendedName) {
        migrations.push(`-- Rename table: ${recommendation.currentName} -> ${recommendation.recommendedName}`);
        migrations.push(`ALTER TABLE "${recommendation.currentName}" RENAME TO "${recommendation.recommendedName}";`);
        migrations.push('');
      }

      for (const column of recommendation.columns) {
        if (column.currentName !== column.recommendedName) {
          migrations.push(`-- Rename column in ${recommendation.recommendedName}: ${column.currentName} -> ${column.recommendedName}`);
          migrations.push(`ALTER TABLE "${recommendation.recommendedName}" RENAME COLUMN "${column.currentName}" TO "${column.recommendedName}";`);
          migrations.push('');
        }
      }
    }

    migrations.push('-- Add standard columns if missing');
    migrations.push('-- ALTER TABLE "your_table" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
    migrations.push('-- ALTER TABLE "your_table" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW();');
    migrations.push('');
    migrations.push('COMMIT;');

    const migrationPath = path.join(__dirname, 'reports');
    const filename = `database-nomenclature-migration-${new Date().toISOString().split('T')[0]}.sql`;
    const filepath = path.join(migrationPath, filename);
    
    fs.writeFileSync(filepath, migrations.join('\n'));
  }
}

// Run the standardizer
async function runStandardization(): Promise<void> {
  try {
    const standardizer = new DatabaseNomenclatureStandardizer();
    await standardizer.runStandardization();
  } catch (error) {
    console.error('Failed to run database nomenclature standardization:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runStandardization();
}

export { DatabaseNomenclatureStandardizer };