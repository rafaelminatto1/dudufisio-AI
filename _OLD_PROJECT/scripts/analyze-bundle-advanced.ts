#!/usr/bin/env tsx

/**
 * Advanced Bundle Analyzer Configuration
 * 
 * This script provides comprehensive bundle analysis with:
 * - Detailed size breakdown by module
 * - Performance impact analysis
 * - Optimization recommendations
 * - Historical tracking
 * - Export capabilities
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BundleAnalysis {
  timestamp: string;
  totalSize: number;
  gzipSize: number;
  modules: ModuleAnalysis[];
  chunks: ChunkAnalysis[];
  recommendations: OptimizationRecommendation[];
  performance: PerformanceMetrics;
}

interface ModuleAnalysis {
  name: string;
  size: number;
  gzipSize: number;
  percentage: number;
  type: 'dependency' | 'application' | 'asset';
  path: string;
}

interface ChunkAnalysis {
  name: string;
  size: number;
  modules: number;
  entry: boolean;
  initial: boolean;
}

interface OptimizationRecommendation {
  type: 'size' | 'performance' | 'security' | 'compatibility';
  priority: 'high' | 'medium' | 'low';
  description: string;
  impact: string;
  solution: string;
  estimatedSavings?: number;
}

interface PerformanceMetrics {
  loadTime: number;
  parseTime: number;
  executionTime: number;
  memoryUsage: number;
  lighthouseScore: number;
}

class AdvancedBundleAnalyzer {
  private projectRoot: string;
  private distPath: string;
  private analysisPath: string;

  constructor() {
    this.projectRoot = path.resolve(__dirname, '..');
    this.distPath = path.join(this.projectRoot, 'dist');
    this.analysisPath = path.join(this.projectRoot, 'bundle-analysis');
  }

  async runAnalysis(): Promise<void> {
    console.log('🔍 Starting Advanced Bundle Analysis...');
    console.log('=' .repeat(60));

    try {
      // Ensure analysis directory exists
      this.ensureAnalysisDirectory();

      // Run build with stats
      await this.runBuildWithStats();

      // Analyze the bundle
      const analysis = await this.analyzeBundle();

      // Generate recommendations
      analysis.recommendations = this.generateRecommendations(analysis);

      // Calculate performance metrics
      analysis.performance = await this.calculatePerformanceMetrics(analysis);

      // Save analysis results
      await this.saveAnalysis(analysis);

      // Generate HTML report
      await this.generateHTMLReport(analysis);

      // Print summary
      this.printSummary(analysis);

      console.log('\n✅ Advanced Bundle Analysis Complete!');
      console.log(`📊 Report saved to: ${path.join(this.analysisPath, 'bundle-analysis-latest.html')}`);

    } catch (error) {
      console.error('❌ Bundle analysis failed:', error);
      process.exit(1);
    }
  }

  private ensureAnalysisDirectory(): void {
    if (!fs.existsSync(this.analysisPath)) {
      fs.mkdirSync(this.analysisPath, { recursive: true });
    }
  }

  private async runBuildWithStats(): Promise<void> {
    console.log('📦 Building project with stats...');
    
    try {
      execSync('npm run build', {
        cwd: this.projectRoot,
        stdio: 'pipe',
        env: { ...process.env, NODE_ENV: 'production' }
      });

      // Generate webpack stats
      execSync('npx webpack --mode=production --json > bundle-analysis/stats.json', {
        cwd: this.projectRoot,
        stdio: 'pipe'
      });

    } catch (error) {
      console.warn('⚠️  Could not generate webpack stats, continuing with file analysis...');
    }
  }

  private async analyzeBundle(): Promise<BundleAnalysis> {
    console.log('📊 Analyzing bundle composition...');

    const modules: ModuleAnalysis[] = [];
    let totalSize = 0;
    let totalGzipSize = 0;

    // Analyze dist directory
    if (fs.existsSync(this.distPath)) {
      const files = this.getAllFiles(this.distPath);
      
      for (const file of files) {
        const stats = fs.statSync(file);
        const relativePath = path.relative(this.distPath, file);
        const gzipSize = await this.calculateGzipSize(file);

        const module: ModuleAnalysis = {
          name: path.basename(file),
          size: stats.size,
          gzipSize,
          percentage: 0, // Will be calculated later
          type: this.getFileType(file),
          path: relativePath
        };

        modules.push(module);
        totalSize += stats.size;
        totalGzipSize += gzipSize;
      }
    }

    // Calculate percentages
    modules.forEach(module => {
      module.percentage = (module.size / totalSize) * 100;
    });

    // Sort by size (largest first)
    modules.sort((a, b) => b.size - a.size);

    return {
      timestamp: new Date().toISOString(),
      totalSize,
      gzipSize: totalGzipSize,
      modules,
      chunks: this.analyzeChunks(),
      recommendations: [],
      performance: {
        loadTime: 0,
        parseTime: 0,
        executionTime: 0,
        memoryUsage: 0,
        lighthouseScore: 0
      }
    };
  }

  private getAllFiles(dir: string): string[] {
    const files: string[] = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        files.push(...this.getAllFiles(fullPath));
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private getFileType(filePath: string): ModuleAnalysis['type'] {
    const ext = path.extname(filePath).toLowerCase();
    
    if (['.js', '.mjs', '.ts'].includes(ext)) return 'dependency';
    if (['.css', '.scss', '.sass'].includes(ext)) return 'asset';
    if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'].includes(ext)) return 'asset';
    if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) return 'asset';
    
    return 'application';
  }

  private async calculateGzipSize(filePath: string): Promise<number> {
    try {
      const buffer = fs.readFileSync(filePath);
      const zlib = await import('zlib');
      const gzipped = zlib.gzipSync(buffer);
      return gzipped.length;
    } catch {
      return 0;
    }
  }

  private analyzeChunks(): ChunkAnalysis[] {
    const chunks: ChunkAnalysis[] = [];
    
    // This would typically come from webpack stats
    // For now, we'll analyze the main chunks
    const mainFiles = ['index.html', 'assets/index.js', 'assets/index.css'];
    
    mainFiles.forEach(file => {
      const filePath = path.join(this.distPath, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        chunks.push({
          name: file,
          size: stats.size,
          modules: 1,
          entry: file.includes('index.html'),
          initial: true
        });
      }
    });

    return chunks;
  }

  private generateRecommendations(analysis: BundleAnalysis): OptimizationRecommendation[] {
    const recommendations: OptimizationRecommendation[] = [];

    // Size-based recommendations
    const largeModules = analysis.modules.filter(m => m.size > 500 * 1024); // > 500KB
    if (largeModules.length > 0) {
      recommendations.push({
        type: 'size',
        priority: 'high',
        description: `Found ${largeModules.length} large modules (>500KB)`,
        impact: 'Significant impact on initial load time',
        solution: 'Consider code splitting, lazy loading, or removing unused dependencies',
        estimatedSavings: largeModules.reduce((acc, m) => acc + m.size * 0.3, 0)
      });
    }

    // Dependency analysis
    const dependencies = analysis.modules.filter(m => m.type === 'dependency');
    if (dependencies.length > 50) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        description: `High number of dependencies (${dependencies.length})`,
        impact: 'Increased bundle size and slower builds',
        solution: 'Review and remove unused dependencies, consider alternative lighter libraries',
        estimatedSavings: dependencies.length * 50 * 1024 // Estimate 50KB per dependency
      });
    }

    // Asset optimization
    const assets = analysis.modules.filter(m => m.type === 'asset');
    const unoptimizedAssets = assets.filter(a => 
      a.path.includes('.png') || a.path.includes('.jpg') || a.path.includes('.jpeg')
    );
    
    if (unoptimizedAssets.length > 0) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        description: `Found ${unoptimizedAssets.length} potentially unoptimized images`,
        impact: 'Larger bundle size and slower loading',
        solution: 'Convert images to WebP format, implement responsive images, use lazy loading',
        estimatedSavings: unoptimizedAssets.reduce((acc, a) => acc + a.size * 0.4, 0)
      });
    }

    // Performance recommendations
    if (analysis.totalSize > 2 * 1024 * 1024) { // > 2MB total
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'Total bundle size exceeds 2MB',
        impact: 'Poor performance on slow networks and mobile devices',
        solution: 'Implement code splitting, optimize dependencies, use tree shaking',
        estimatedSavings: analysis.totalSize * 0.25
      });
    }

    return recommendations;
  }

  private async calculatePerformanceMetrics(analysis: BundleAnalysis): Promise<PerformanceMetrics> {
    // Simplified performance calculation
    const loadTime = Math.max(100, (analysis.totalSize / (100 * 1024)) * 100); // Rough estimate
    const parseTime = Math.max(50, (analysis.totalSize / (200 * 1024)) * 50);
    const executionTime = Math.max(100, (analysis.totalSize / (150 * 1024)) * 100);
    const memoryUsage = Math.max(50, (analysis.totalSize / (300 * 1024)) * 100);
    
    // Lighthouse score estimation (simplified)
    const lighthouseScore = Math.max(0, Math.min(100, 100 - (analysis.totalSize / (1024 * 1024)) * 10));

    return {
      loadTime,
      parseTime,
      executionTime,
      memoryUsage,
      lighthouseScore
    };
  }

  private async saveAnalysis(analysis: BundleAnalysis): Promise<void> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `bundle-analysis-${timestamp}.json`;
    const filepath = path.join(this.analysisPath, filename);
    
    fs.writeFileSync(filepath, JSON.stringify(analysis, null, 2));
    
    // Also save as latest
    const latestPath = path.join(this.analysisPath, 'bundle-analysis-latest.json');
    fs.writeFileSync(latestPath, JSON.stringify(analysis, null, 2));
  }

  private async generateHTMLReport(analysis: BundleAnalysis): Promise<void> {
    const html = this.generateHTMLContent(analysis);
    const filepath = path.join(this.analysisPath, 'bundle-analysis-latest.html');
    fs.writeFileSync(filepath, html);
  }

  private generateHTMLContent(analysis: BundleAnalysis): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Advanced Bundle Analysis - DuduFisio-AI</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f8fafc; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-value { font-size: 24px; font-weight: bold; color: #1e293b; }
        .stat-label { color: #64748b; font-size: 14px; }
        .section { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin-bottom: 24px; }
        .section-title { font-size: 18px; font-weight: 600; color: #1e293b; margin-bottom: 16px; }
        .module-list { max-height: 400px; overflow-y: auto; }
        .module-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-bottom: 1px solid #e2e8f0; }
        .module-name { font-weight: 500; color: #1e293b; }
        .module-size { color: #64748b; font-size: 14px; }
        .recommendation { background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 12px; border-left: 4px solid #3b82f6; }
        .recommendation-title { font-weight: 600; color: #1e293b; margin-bottom: 8px; }
        .recommendation-text { color: #64748b; font-size: 14px; line-height: 1.5; }
        .priority-high { border-left-color: #ef4444; }
        .priority-medium { border-left-color: #f59e0b; }
        .priority-low { border-left-color: #10b981; }
        .performance-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }
        .performance-item { text-align: center; }
        .performance-value { font-size: 20px; font-weight: bold; color: #1e293b; }
        .performance-label { color: #64748b; font-size: 12px; }
        .timestamp { color: #64748b; font-size: 12px; text-align: right; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔍 Advanced Bundle Analysis</h1>
            <p>Comprehensive analysis of your application bundle</p>
            <div class="timestamp">Generated: ${new Date(analysis.timestamp).toLocaleString()}</div>
        </div>

        <div class="stats">
            <div class="stat-card">
                <div class="stat-value">${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB</div>
                <div class="stat-label">Total Bundle Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${(analysis.gzipSize / 1024 / 1024).toFixed(2)} MB</div>
                <div class="stat-label">Gzipped Size</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${analysis.modules.length}</div>
                <div class="stat-label">Total Modules</div>
            </div>
            <div class="stat-card">
                <div class="stat-value">${Math.round(analysis.performance.lighthouseScore)}</div>
                <div class="stat-label">Estimated Lighthouse Score</div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📊 Performance Metrics</div>
            <div class="performance-grid">
                <div class="performance-item">
                    <div class="performance-value">${analysis.performance.loadTime.toFixed(0)}ms</div>
                    <div class="performance-label">Estimated Load Time</div>
                </div>
                <div class="performance-item">
                    <div class="performance-value">${analysis.performance.parseTime.toFixed(0)}ms</div>
                    <div class="performance-label">Parse Time</div>
                </div>
                <div class="performance-item">
                    <div class="performance-value">${analysis.performance.executionTime.toFixed(0)}ms</div>
                    <div class="performance-label">Execution Time</div>
                </div>
                <div class="performance-item">
                    <div class="performance-value">${analysis.performance.memoryUsage.toFixed(0)}MB</div>
                    <div class="performance-label">Memory Usage</div>
                </div>
            </div>
        </div>

        <div class="section">
            <div class="section-title">📦 Largest Modules</div>
            <div class="module-list">
                ${analysis.modules.slice(0, 20).map(module => `
                    <div class="module-item">
                        <div>
                            <div class="module-name">${module.name}</div>
                            <div style="font-size: 12px; color: #64748b;">${module.path}</div>
                        </div>
                        <div class="module-size">
                            ${(module.size / 1024).toFixed(1)} KB (${module.percentage.toFixed(1)}%)
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="section">
            <div class="section-title">💡 Optimization Recommendations</div>
            ${analysis.recommendations.map(rec => `
                <div class="recommendation priority-${rec.priority}">
                    <div class="recommendation-title">
                        ${rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢'} 
                        ${rec.description}
                    </div>
                    <div class="recommendation-text">
                        <strong>Impact:</strong> ${rec.impact}<br>
                        <strong>Solution:</strong> ${rec.solution}
                        ${rec.estimatedSavings ? `<br><strong>Potential Savings:</strong> ${(rec.estimatedSavings / 1024).toFixed(1)} KB` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
    `;
  }

  private printSummary(analysis: BundleAnalysis): void {
    console.log('\n📊 Bundle Analysis Summary:');
    console.log(`   Total Size: ${(analysis.totalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Gzipped Size: ${(analysis.gzipSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   Total Modules: ${analysis.modules.length}`);
    console.log(`   Recommendations: ${analysis.recommendations.length}`);
    
    if (analysis.recommendations.length > 0) {
      console.log('\n⚠️  Top Recommendations:');
      analysis.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`   ${index + 1}. ${rec.description} (${rec.priority} priority)`);
      });
    }
  }
}

// Run the analyzer
const analyzer = new AdvancedBundleAnalyzer();
analyzer.runAnalysis().catch(error => {
  console.error('Bundle analysis failed:', error);
  process.exit(1);
});