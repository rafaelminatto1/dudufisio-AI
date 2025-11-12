#!/usr/bin/env node
// Vercel Ignore Build Step
// Sair com código 0 => IGNORA o build
// Sair com código != 0 => PROSSEGUE com o build

const { execSync } = require('node:child_process');

function getChangedFiles() {
  try {
    const prev = process.env.VERCEL_GIT_PREVIOUS_SHA;
    const curr = process.env.VERCEL_GIT_COMMIT_SHA;
    if (prev && curr) {
      const out = execSync(`git diff --name-only ${prev} ${curr}`, { stdio: ['ignore', 'pipe', 'ignore'] })
        .toString()
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean);
      if (out.length > 0) return out;
    }
  } catch (_) {}
  // Fallback conservador: prosseguir com build
  return null;
}

function shouldSkip(files) {
  // Padrões considerados "safe" para ignorar build
  const skipPatterns = [
    /^README\.md$/i,
    /^LICENSE$/i,
    /^CHANGELOG\.md$/i,
    /^docs\//i,
    /\.md$/i,
    /^\.github\//i,
    /^\.vscode\//i,
    /^tests?\//i,
    /^playwright\-report\//i,
    /^test\-results\//i,
    /\.(spec|test)\.(t|j)sx?$/i,
    /^checkly\//i,
    /^\.husky\//i,
  ];

  // Caso algum arquivo não seja "ignorable", não pular
  return files.every((f) => skipPatterns.some((re) => re.test(f)));
}

(function main() {
  const files = getChangedFiles();
  if (!files) {
    // Sem informações confiáveis: prosseguir com build
    process.stdout.write('Proceed: no diff info.\n');
    process.exit(1);
  }

  if (files.length === 0) {
    process.stdout.write('Skip: no changes.\n');
    process.exit(0);
  }

  if (shouldSkip(files)) {
    process.stdout.write(`Skip: only docs/tests/ci changed (files=${files.length}).\n`);
    process.exit(0);
  }

  process.stdout.write(`Proceed: relevant changes detected (files=${files.length}).\n`);
  process.exit(1);
})();

