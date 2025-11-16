/**
 * Automated JS/JSX to TS/TSX Migration Tool
 * Helps migrate JavaScript files to TypeScript with basic type inference
 */

import fs from 'fs';
import path from 'path';

interface MigrationReport {
  total: number;
  success: number;
  failed: number;
  skipped: number;
  files: {
    path: string;
    status: 'success' | 'failed' | 'skipped';
    reason?: string;
  }[];
}

const SKIP_PATTERNS = [
  /node_modules/,
  /dist/,
  /\.next/,
  /build/,
  /coverage/,
  /\.config\.js$/,
  /\.spec\.js$/,
  /\.test\.js$/,
];

/**
 * Check if file should be skipped
 */
function shouldSkip(filePath: string): boolean {
  return SKIP_PATTERNS.some(pattern => pattern.test(filePath));
}

/**
 * Convert JS/JSX file to TS/TSX
 */
function migrateFile(filePath: string): { success: boolean; reason?: string } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const ext = path.extname(filePath);
    const newExt = ext === '.jsx' ? '.tsx' : '.ts';
    const newPath = filePath.replace(new RegExp(`\\${ext}$`), newExt);

    // Basic transformations
    let newContent = content;

    // Add type annotations for common patterns
    newContent = addBasicTypes(newContent);

    // Write new file
    fs.writeFileSync(newPath, newContent, 'utf-8');

    // Delete old file
    fs.unlinkSync(filePath);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      reason: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Add basic type annotations
 */
function addBasicTypes(content: string): string {
  let result = content;

  // Convert function parameters to typed (basic inference)
  // Example: function foo(req, res) => function foo(req: any, res: any)
  result = result.replace(
    /function\s+(\w+)\s*\(([^)]+)\)/g,
    (match, funcName, params) => {
      const typedParams = params
        .split(',')
        .map((p: string) => {
          const paramName = p.trim();
          if (paramName && !paramName.includes(':')) {
            return `${paramName}: any`;
          }
          return p;
        })
        .join(', ');
      return `function ${funcName}(${typedParams})`;
    }
  );

  // Convert arrow functions
  result = result.replace(
    /const\s+(\w+)\s*=\s*\(([^)]+)\)\s*=>/g,
    (match, funcName, params) => {
      const typedParams = params
        .split(',')
        .map((p: string) => {
          const paramName = p.trim();
          if (paramName && !paramName.includes(':')) {
            return `${paramName}: any`;
          }
          return p;
        })
        .join(', ');
      return `const ${funcName} = (${typedParams}) =>`;
    }
  );

  // Add return type annotations for exports
  // This is basic - manual review still needed
  result = result.replace(
    /export\s+(async\s+)?function\s+(\w+)/g,
    'export $1function $2'
  );

  return result;
}

/**
 * Migrate all JS/JSX files in directory
 */
function migrateDirectory(dirPath: string): MigrationReport {
  const report: MigrationReport = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    files: [],
  };

  function processDir(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);

      if (stat.isDirectory()) {
        if (!shouldSkip(itemPath)) {
          processDir(itemPath);
        }
      } else if (stat.isFile()) {
        const ext = path.extname(itemPath);
        if ((ext === '.js' || ext === '.jsx') && !shouldSkip(itemPath)) {
          report.total++;
          console.log(`\nMigrating: ${itemPath}`);

          const result = migrateFile(itemPath);
          if (result.success) {
            report.success++;
            report.files.push({ path: itemPath, status: 'success' });
            console.log('✅ Success');
          } else {
            report.failed++;
            report.files.push({
              path: itemPath,
              status: 'failed',
              reason: result.reason,
            });
            console.log(`❌ Failed: ${result.reason}`);
          }
        }
      }
    }
  }

  processDir(dirPath);
  return report;
}

/**
 * Print migration report
 */
function printReport(report: MigrationReport) {
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('📊 MIGRATION REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log(`📁 Total files processed: ${report.total}`);
  console.log(`✅ Successfully migrated: ${report.success}`);
  console.log(`❌ Failed: ${report.failed}`);
  console.log(`⏭️  Skipped: ${report.skipped}\n`);

  if (report.failed > 0) {
    console.log('Failed files:');
    report.files
      .filter(f => f.status === 'failed')
      .forEach(f => {
        console.log(`  ❌ ${f.path}`);
        if (f.reason) console.log(`     ${f.reason}`);
      });
    console.log();
  }

  console.log('═══════════════════════════════════════════════════════');
  console.log('\n⚠️  IMPORTANT: Manual review required!');
  console.log('   - Add proper type definitions');
  console.log('   - Fix "any" types');
  console.log('   - Update imports');
  console.log('   - Run type-check: npm run type-check\n');

  // Save report
  const reportPath = path.join(process.cwd(), 'migration-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`📄 Full report saved to: ${reportPath}\n`);
}

/**
 * Main execution
 */
async function main() {
  const targetDir = process.argv[2] || process.cwd();

  console.log('🚀 Starting JS/JSX to TS/TSX migration...');
  console.log(`📂 Target directory: ${targetDir}\n`);

  if (!fs.existsSync(targetDir)) {
    console.error('❌ Directory not found!');
    process.exit(1);
  }

  const report = migrateDirectory(targetDir);
  printReport(report);

  if (report.failed > 0) {
    console.error('\n❌ Migration completed with errors!');
    process.exit(1);
  }

  console.log('\n✅ Migration completed successfully!');
  console.log('Run "npm run type-check" to verify TypeScript compilation.\n');
}

// Run if called directly
if (require.main === module) {
  main();
}

export { migrateDirectory, MigrationReport };
