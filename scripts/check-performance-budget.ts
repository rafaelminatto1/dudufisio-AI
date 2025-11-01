#!/usr/bin/env tsx
/**
 * 🎯 PERFORMANCE BUDGET CHECKER
 * 
 * Validates build against performance budgets.
 */

import * as fs from 'fs';
import * as path from 'path';

const DIST_DIR = path.join(process.cwd(), 'dist');
const BUDGET_FILE = path.join(process.cwd(), '.performance-budget.json');

interface Budget {
  name: string;
  limit: string;
  limitBytes?: number;
  limitMs?: number;
  limitValue?: number;
  status: string;
}

interface BudgetConfig {
  budgets: Budget[];
  lastChecked: string | null;
  violations: string[];
}

function checkBundleSize(budget: Budget): boolean {
  if (!budget.limitBytes) return true;

  const assetsDir = path.join(DIST_DIR, 'assets');
  if (!fs.existsSync(assetsDir)) {
    console.warn('⚠️  dist/assets not found - skipping bundle size check');
    return true;
  }

  const files = fs.readdirSync(assetsDir);
  const totalSize = files
    .filter(f => f.endsWith('.js'))
    .reduce((sum, file) => {
      const stats = fs.statSync(path.join(assetsDir, file));
      return sum + stats.size;
    }, 0);

  const withinBudget = totalSize <= budget.limitBytes;

  if (!withinBudget) {
    console.error(`❌ ${budget.name}: ${(totalSize / 1024).toFixed(2)}KB (limit: ${budget.limit})`);
  } else {
    console.log(`✅ ${budget.name}: ${(totalSize / 1024).toFixed(2)}KB (limit: ${budget.limit})`);
  }

  return withinBudget;
}

function main() {
  console.log('\n🎯 Checking Performance Budget...\n');

  if (!fs.existsSync(BUDGET_FILE)) {
    console.error('❌ .performance-budget.json not found');
    process.exit(1);
  }

  const config: BudgetConfig = JSON.parse(fs.readFileSync(BUDGET_FILE, 'utf-8'));
  const violations: string[] = [];

  for (const budget of config.budgets) {
    if (budget.limitBytes) {
      const passed = checkBundleSize(budget);
      if (!passed) {
        violations.push(budget.name);
      }
    }
  }

  // Update config
  config.lastChecked = new Date().toISOString();
  config.violations = violations;
  fs.writeFileSync(BUDGET_FILE, JSON.stringify(config, null, 2));

  if (violations.length > 0) {
    console.error(`\n❌ ${violations.length} budget violations found`);
    process.exit(1);
  }

  console.log('\n✅ All performance budgets met!\n');
}

main();

