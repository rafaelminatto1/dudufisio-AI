#!/usr/bin/env node

/**
 * Centralised dependency cleanup script to ensure consistent behaviour
 * across different environments (Windows, WSL, CI).
 *
 * - Removes root node_modules
 * - Removes workspace node_modules (supports simple `dir/*` workspaces)
 * - Clears local pnpm store directories
 */

const path = require("path");
const fs = require("fs/promises");
const { existsSync } = require("fs");

const repoRoot = path.resolve(__dirname, "..");
const packageJsonPath = path.join(repoRoot, "package.json");

const PNPM_STORE_DIRS = [
  ".pnpm-store",
  "node_modules/.pnpm",
  "node_modules/.cache/pnpm",
];

async function pathExists(target) {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

async function removeDir(target) {
  if (!(await pathExists(target))) {
    return false;
  }

  await fs.rm(target, { recursive: true, force: true });
  console.log(`Removed ${path.relative(repoRoot, target) || "."}`);
  return true;
}

async function cleanWorkspaceNodeModules(workspace) {
  const normalized = workspace.replace(/\\/g, "/").replace(/\/+$/, "");

  if (normalized.endsWith("/*")) {
    const baseDir = normalized.slice(0, -2);
    const absoluteBase = path.join(repoRoot, baseDir);

    if (!existsSync(absoluteBase)) {
      return;
    }

    const entries = await fs.readdir(absoluteBase, {
      withFileTypes: true,
    });

    await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map((entry) =>
          removeDir(path.join(absoluteBase, entry.name, "node_modules"))
        )
    );
  } else {
    await removeDir(path.join(repoRoot, normalized, "node_modules"));
  }
}

async function cleanWorkspaces() {
  if (!(await pathExists(packageJsonPath))) {
    return;
  }

  const pkg = JSON.parse(await fs.readFile(packageJsonPath, "utf8"));
  let workspaces = [];

  if (Array.isArray(pkg.workspaces)) {
    workspaces = pkg.workspaces;
  } else if (pkg.workspaces && Array.isArray(pkg.workspaces.packages)) {
    workspaces = pkg.workspaces.packages;
  }

  await Promise.all(workspaces.map(cleanWorkspaceNodeModules));
}

async function cleanPnpmStores() {
  await Promise.all(
    PNPM_STORE_DIRS.map((relativePath) =>
      removeDir(path.join(repoRoot, relativePath))
    )
  );
}

async function main() {
  console.log("🔄  Cleaning dependency directories...");
  await removeDir(path.join(repoRoot, "node_modules"));
  await cleanWorkspaces();
  await cleanPnpmStores();
  console.log("✅  Dependency cleanup complete.");
}

main().catch((error) => {
  console.error("❌  Dependency cleanup failed:", error);
  process.exitCode = 1;
});

