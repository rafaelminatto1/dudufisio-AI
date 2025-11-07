/**
 * Advanced Bundle Analyzer
 * Analyzes bundle size, identifies duplicates, and provides optimization recommendations
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

interface BundleAnalysis {
  totalSize: number;
  chunks: ChunkInfo[];
  duplicates: DuplicatePackage[];
  recommendations: string[];
  treeshake: TreeshakeAnalysis;
}

interface ChunkInfo {
  name: string;
  size: number;
  percentage: number;
  modules: ModuleInfo[];
}

interface ModuleInfo {
  name: string;
  size: number;
}

interface DuplicatePackage {
  name: string;
  versions: string[];
  totalSize: number;
  locations: string[];
}

interface TreeshakeAnalysis {
  unused: string[];
  sideEffects: string[];
}

const WARN_SIZE_MB = 1; // Warn if chunk > 1MB
const ERROR_SIZE_MB = 2; // Error if chunk > 2MB

/**
 * Analyze bundle using Rollup visualizer output
 */
async function analyzeBundleSize(): Promise<BundleAnalysis> {
  console.log('🔍 Analyzing bundle size and dependencies...\n');

  const distPath = path.join(process.cwd(), 'dist');
  
  if (!fs.existsSync(distPath)) {
    throw new Error('Build not found. Run "npm run build" first.');
  }

  const analysis: BundleAnalysis = {
    totalSize: 0,
    chunks: [],
    duplicates: [],
    recommendations: [],
    treeshake: {
      unused: [],
      sideEffects: [],
    },
  };

  // Analyze JavaScript bundles
  const assetsPath = path.join(distPath, 'assets');
  if (fs.existsSync(assetsPath)) {
    const files = fs.readdirSync(assetsPath);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    for (const file of jsFiles) {
      const filePath = path.join(assetsPath, file);
      const stats = fs.statSync(filePath);
      const sizeInMB = stats.size / (1024 * 1024);
      
      analysis.totalSize += stats.size;
      
      analysis.chunks.push({
        name: file,
        size: stats.size,
        percentage: 0, // Will calculate after total
        modules: [], // TODO: Parse modules from sourcemap
      });

      // Check size thresholds
      if (sizeInMB > ERROR_SIZE_MB) {
        analysis.recommendations.push(
          `❌ CRITICAL: ${file} is ${sizeInMB.toFixed(2)}MB (> ${ERROR_SIZE_MB}MB limit)`
        );
      } else if (sizeInMB > WARN_SIZE_MB) {
        analysis.recommendations.push(
          `⚠️  WARNING: ${file} is ${sizeInMB.toFixed(2)}MB (> ${WARN_SIZE_MB}MB threshold)`
        );
      }
    }

    // Calculate percentages
    analysis.chunks.forEach(chunk => {
      chunk.percentage = (chunk.size / analysis.totalSize) * 100;
    });
  }

  // Analyze package.json dependencies
  await analyzeDependencies(analysis);

  // Check for common optimization opportunities
  checkOptimizationOpportunities(analysis);

  return analysis;
}

/**
 * Analyze dependencies for duplicates and large packages
 */
async function analyzeDependencies(analysis: BundleAnalysis) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const allDeps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  // Check for known large packages
  const largePackages = [
    '@radix-ui',
    '@tiptap',
    'framer-motion',
    'recharts',
    '@react-pdf/renderer',
    'firebase',
  ];

  for (const pkgPrefix of largePackages) {
    const matches = Object.keys(allDeps).filter(dep => dep.startsWith(pkgPrefix));
    if (matches.length > 0) {
      analysis.recommendations.push(
        `📦 Consider lazy loading: ${matches.join(', ')}`
      );
    }
  }

  // Check for duplicate versions (requires npm ls)
  try {
    const npmLsOutput = execSync('npm ls --json --depth=0', { 
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore'] 
    });
    const npmData = JSON.parse(npmLsOutput);
    
    // Analyze for version conflicts
    const versionMap = new Map<string, Set<string>>();
    
    function traverseDeps(deps: any, prefix = '') {
      if (!deps) return;
      
      for (const [name, info] of Object.entries(deps)) {
        if (typeof info === 'object' && info !== null) {
          const version = (info as any).version;
          if (version) {
            if (!versionMap.has(name)) {
              versionMap.set(name, new Set());
            }
            versionMap.get(name)!.add(version);
          }
        }
      }
    }
    
    traverseDeps(npmData.dependencies);
    
    // Find packages with multiple versions
    for (const [name, versions] of versionMap.entries()) {
      if (versions.size > 1) {
        analysis.duplicates.push({
          name,
          versions: Array.from(versions),
          totalSize: 0, // Would need to calculate from node_modules
          locations: [],
        });
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not analyze dependencies with npm ls');
  }
}

/**
 * Check for common optimization opportunities
 */
function checkOptimizationOpportunities(analysis: BundleAnalysis) {
  const packageJsonPath = path.join(process.cwd(), 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const deps = packageJson.dependencies || {};

  // Check for moment.js (suggest date-fns instead)
  if (deps['moment']) {
    analysis.recommendations.push(
      '💡 Replace moment.js with date-fns (already installed) - saves ~200KB'
    );
  }

  // Check for lodash (suggest lodash-es)
  if (deps['lodash'] && !deps['lodash-es']) {
    analysis.recommendations.push(
      '💡 Use lodash-es instead of lodash for better tree-shaking'
    );
  }

  // Check if using individual @radix-ui packages (good!)
  const radixPackages = Object.keys(deps).filter(k => k.startsWith('@radix-ui/'));
  if (radixPackages.length > 5) {
    analysis.recommendations.push(
      `✅ Using individual Radix UI packages (${radixPackages.length}) - good for tree-shaking`
    );
  }

  // Check for AWS SDK v2 (suggest v3)
  if (deps['aws-sdk']) {
    analysis.recommendations.push(
      '💡 Migrate to AWS SDK v3 (@aws-sdk/*) for modular imports'
    );
  }

  // Suggest code splitting for large chunks
  const largeChunks = analysis.chunks.filter(c => c.size > WARN_SIZE_MB * 1024 * 1024);
  if (largeChunks.length > 0) {
    analysis.recommendations.push(
      `💡 Implement code splitting for: ${largeChunks.map(c => c.name).join(', ')}`
    );
  }
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Print analysis report
 */
function printReport(analysis: BundleAnalysis) {
  console.log('═══════════════════════════════════════════════════════');
  console.log('📊 BUNDLE ANALYSIS REPORT');
  console.log('═══════════════════════════════════════════════════════\n');

  // Total size
  console.log(`📦 Total Bundle Size: ${formatBytes(analysis.totalSize)}\n`);

  // Top chunks
  console.log('📁 Largest Chunks:');
  console.log('─────────────────────────────────────────────────────');
  const sortedChunks = [...analysis.chunks].sort((a, b) => b.size - a.size);
  sortedChunks.slice(0, 10).forEach((chunk, idx) => {
    const sizeStr = formatBytes(chunk.size).padEnd(12);
    const percentStr = `${chunk.percentage.toFixed(2)}%`.padStart(8);
    const icon = chunk.size > ERROR_SIZE_MB * 1024 * 1024 ? '🔴' : 
                 chunk.size > WARN_SIZE_MB * 1024 * 1024 ? '🟡' : '🟢';
    console.log(`${icon} ${(idx + 1).toString().padStart(2)}. ${sizeStr} ${percentStr}  ${chunk.name}`);
  });
  console.log();

  // Duplicates
  if (analysis.duplicates.length > 0) {
    console.log('⚠️  Duplicate Dependencies:');
    console.log('─────────────────────────────────────────────────────');
    analysis.duplicates.forEach(dup => {
      console.log(`📦 ${dup.name}: ${dup.versions.join(', ')}`);
    });
    console.log();
  }

  // Recommendations
  if (analysis.recommendations.length > 0) {
    console.log('💡 Optimization Recommendations:');
    console.log('─────────────────────────────────────────────────────');
    analysis.recommendations.forEach((rec, idx) => {
      console.log(`${idx + 1}. ${rec}`);
    });
    console.log();
  }

  console.log('═══════════════════════════════════════════════════════');

  // Save report to file
  const reportPath = path.join(process.cwd(), 'bundle-analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(analysis, null, 2));
  console.log(`\n📄 Full report saved to: ${reportPath}`);
}

/**
 * Main execution
 */
async function main() {
  try {
    const analysis = await analyzeBundleSize();
    printReport(analysis);

    // Exit with error if critical issues found
    const criticalIssues = analysis.recommendations.filter(r => r.includes('CRITICAL'));
    if (criticalIssues.length > 0) {
      console.error('\n❌ Critical bundle size issues detected!');
      process.exit(1);
    }

    console.log('\n✅ Bundle analysis complete!');
  } catch (error) {
    console.error('❌ Error during bundle analysis:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { analyzeBundleSize, BundleAnalysis };
