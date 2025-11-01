#!/usr/bin/env tsx
/**
 * 📊 BUNDLE SIZE TRACKER
 * 
 * Track bundle size history and alert on regressions.
 */

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';

const DIST_DIR = path.join(process.cwd(), 'dist');
const STATS_DIR = path.join(process.cwd(), 'build-stats');
const HISTORY_FILE = path.join(STATS_DIR, 'bundle-history.json');
const MAX_GROWTH_PERCENT = 5;

interface BundleInfo {
  name: string;
  size: number;
  sizeKB: string;
}

interface BuildRecord {
  date: string;
  commit: string;
  bundles: Record<string, string>;
  total: string;
  totalBytes: number;
}

function getBundleSizes(): BundleInfo[] {
  const assetsDir = path.join(DIST_DIR, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    throw new Error('dist/assets not found - run build first');
  }

  const files = fs.readdirSync(assetsDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));

  return jsFiles.map(file => {
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    
    return {
      name: file,
      size: stats.size,
      sizeKB: `${(stats.size / 1024).toFixed(2)}KB`,
    };
  });
}

function getCurrentCommit(): string {
  try {
    return execSync('git rev-parse --short HEAD').toString().trim();
  } catch {
    return 'unknown';
  }
}

function loadHistory(): BuildRecord[] {
  if (!fs.existsSync(HISTORY_FILE)) {
    return [];
  }
  
  const data = fs.readFileSync(HISTORY_FILE, 'utf-8');
  const parsed = JSON.parse(data);
  
  return parsed.builds || [];
}

function saveHistory(builds: BuildRecord[]): void {
  if (!fs.existsSync(STATS_DIR)) {
    fs.mkdirSync(STATS_DIR, { recursive: true });
  }

  fs.writeFileSync(
    HISTORY_FILE,
    JSON.stringify({ builds }, null, 2)
  );
}

function main() {
  console.log('\n📊 Tracking Bundle Sizes...\n');

  const bundles = getBundleSizes();
  const totalBytes = bundles.reduce((sum, b) => sum + b.size, 0);
  
  const record: BuildRecord = {
    date: new Date().toISOString(),
    commit: getCurrentCommit(),
    bundles: Object.fromEntries(bundles.map(b => [b.name, b.sizeKB])),
    total: `${(totalBytes / 1024).toFixed(2)}KB`,
    totalBytes,
  };

  const history = loadHistory();
  const previousRecord = history[history.length - 1];

  // Check for regressions
  if (previousRecord) {
    const growth = ((totalBytes - previousRecord.totalBytes) / previousRecord.totalBytes) * 100;
    
    console.log(`Current: ${record.total}`);
    console.log(`Previous: ${previousRecord.total}`);
    console.log(`Growth: ${growth.toFixed(2)}%\n`);

    if (growth > MAX_GROWTH_PERCENT) {
      console.error(`❌ Bundle size regression! Growth: ${growth.toFixed(2)}% (limit: ${MAX_GROWTH_PERCENT}%)`);
      process.exit(1);
    }
  }

  // Save
  history.push(record);
  if (history.length > 100) {
    history.shift(); // Keep last 100
  }
  
  saveHistory(history);

  console.log('✅ Bundle size tracked successfully\n');
}

main();

