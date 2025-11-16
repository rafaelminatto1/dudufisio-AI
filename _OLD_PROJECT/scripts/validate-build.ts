#!/usr/bin/env tsx
/**
 * 🔍 BUILD VALIDATION SCRIPT
 * 
 * Valida o build de produção para garantir que:
 * - Todos os chunks referenciados no HTML existem
 * - Service worker está acessível
 * - Manifest.json está correto
 * - Assets críticos estão presentes
 * - Não há referências quebradas
 * 
 * Uso: npm run validate ou tsx scripts/validate-build.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg: string) => console.log(`${colors.blue}ℹ ${colors.reset}${msg}`),
  success: (msg: string) => console.log(`${colors.green}✓ ${colors.reset}${msg}`),
  warning: (msg: string) => console.log(`${colors.yellow}⚠ ${colors.reset}${msg}`),
  error: (msg: string) => console.log(`${colors.red}✖ ${colors.reset}${msg}`),
  title: (msg: string) => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
};

interface ValidationResult {
  passed: number;
  failed: number;
  warnings: number;
  errors: string[];
}

const result: ValidationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  errors: [],
};

/**
 * Diretório dist
 */
const DIST_DIR = path.join(process.cwd(), 'dist');

/**
 * Verificar se diretório dist existe
 */
function checkDistExists(): boolean {
  log.title('🔍 Verificando build...');
  
  if (!fs.existsSync(DIST_DIR)) {
    log.error(`Diretório 'dist' não encontrado em: ${DIST_DIR}`);
    log.info('Execute "npm run build" antes de validar');
    return false;
  }
  
  log.success(`Diretório dist encontrado: ${DIST_DIR}`);
  return true;
}

/**
 * Verificar index.html
 */
function validateIndexHtml(): boolean {
  log.title('📄 Validando index.html...');
  
  const indexPath = path.join(DIST_DIR, 'index.html');
  
  if (!fs.existsSync(indexPath)) {
    log.error('index.html não encontrado!');
    result.failed++;
    result.errors.push('index.html ausente');
    return false;
  }
  
  const html = fs.readFileSync(indexPath, 'utf-8');
  
  // Extrair referências de assets
  const scriptMatches = html.matchAll(/src="([^"]+)"/g);
  const linkMatches = html.matchAll(/href="([^"]+)"/g);
  
  const assets: string[] = [];
  
  for (const match of scriptMatches) {
    assets.push(match[1]);
  }
  
  for (const match of linkMatches) {
    const href = match[1];
    // Apenas assets locais (não URLs externas)
    if (href.startsWith('/') || href.startsWith('./') || href.startsWith('assets/')) {
      assets.push(href);
    }
  }
  
  log.info(`Encontrados ${assets.length} assets referenciados no HTML`);
  
  // Verificar se assets existem
  let missingAssets = 0;
  
  for (const asset of assets) {
    const assetPath = path.join(DIST_DIR, asset.replace(/^\//, ''));
    
    if (!fs.existsSync(assetPath)) {
      log.error(`Asset ausente: ${asset}`);
      missingAssets++;
      result.errors.push(`Asset ausente: ${asset}`);
    }
  }
  
  if (missingAssets > 0) {
    log.error(`${missingAssets} assets ausentes encontrados`);
    result.failed += missingAssets;
    return false;
  }
  
  log.success('Todos os assets referenciados existem');
  result.passed++;
  return true;
}

/**
 * Verificar service worker
 */
function validateServiceWorker(): boolean {
  log.title('🔧 Validando Service Worker...');
  
  const swPath = path.join(DIST_DIR, 'service-worker.js');
  
  if (!fs.existsSync(swPath)) {
    log.warning('service-worker.js não encontrado (pode ser intencional em dev)');
    result.warnings++;
    return true; // Não é erro crítico
  }
  
  const swContent = fs.readFileSync(swPath, 'utf-8');
  
  // Verificações básicas
  if (swContent.length < 100) {
    log.error('Service worker parece estar vazio ou corrompido');
    result.failed++;
    result.errors.push('Service worker inválido');
    return false;
  }
  
  log.success('Service worker válido');
  result.passed++;
  return true;
}

/**
 * Verificar manifest.json
 */
function validateManifest(): boolean {
  log.title('📱 Validando manifest.json...');
  
  const manifestPath = path.join(DIST_DIR, 'manifest.json');
  
  if (!fs.existsSync(manifestPath)) {
    log.warning('manifest.json não encontrado (PWA não configurado)');
    result.warnings++;
    return true;
  }
  
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    
    // Verificar campos obrigatórios PWA
    const required = ['name', 'short_name', 'start_url', 'display', 'icons'];
    const missing = required.filter(field => !manifest[field]);
    
    if (missing.length > 0) {
      log.error(`Campos ausentes no manifest: ${missing.join(', ')}`);
      result.failed++;
      result.errors.push(`Manifest inválido: campos ausentes`);
      return false;
    }
    
    // Verificar ícones
    if (manifest.icons && Array.isArray(manifest.icons)) {
      let missingIcons = 0;
      
      for (const icon of manifest.icons) {
        const iconPath = path.join(DIST_DIR, icon.src.replace(/^\//, ''));
        if (!fs.existsSync(iconPath)) {
          log.warning(`Ícone ausente: ${icon.src}`);
          missingIcons++;
        }
      }
      
      if (missingIcons > 0) {
        log.warning(`${missingIcons} ícones do manifest ausentes`);
        result.warnings += missingIcons;
      }
    }
    
    log.success('Manifest válido');
    result.passed++;
    return true;
  } catch (error) {
    log.error(`Erro ao parsear manifest: ${error}`);
    result.failed++;
    result.errors.push('Manifest JSON inválido');
    return false;
  }
}

/**
 * Verificar assets críticos
 */
function validateCriticalAssets(): boolean {
  log.title('🎯 Validando assets críticos...');
  
  const assetsDir = path.join(DIST_DIR, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    log.error('Diretório assets/ não encontrado');
    result.failed++;
    result.errors.push('Diretório assets ausente');
    return false;
  }
  
  const files = fs.readdirSync(assetsDir);
  
  // Verificar se há arquivos JS e CSS
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const cssFiles = files.filter(f => f.endsWith('.css'));
  
  log.info(`Encontrados ${jsFiles.length} arquivos JS e ${cssFiles.length} arquivos CSS`);
  
  if (jsFiles.length === 0) {
    log.error('Nenhum arquivo JS encontrado em assets/');
    result.failed++;
    result.errors.push('Nenhum JS em assets/');
    return false;
  }
  
  if (cssFiles.length === 0) {
    log.warning('Nenhum arquivo CSS encontrado (pode ser inline)');
    result.warnings++;
  }
  
  // Verificar chunks vendor essenciais
  const hasVendorReact = jsFiles.some(f => f.includes('vendor-react'));
  
  if (!hasVendorReact) {
    log.warning('Chunk vendor-react não encontrado (pode ter nome diferente)');
    result.warnings++;
  } else {
    log.success('Chunks vendor encontrados');
  }
  
  result.passed++;
  return true;
}

/**
 * Verificar tamanhos de arquivos
 */
function validateFileSizes(): void {
  log.title('📊 Verificando tamanhos de arquivos...');
  
  const assetsDir = path.join(DIST_DIR, 'assets');
  
  if (!fs.existsSync(assetsDir)) {
    return;
  }
  
  const files = fs.readdirSync(assetsDir);
  const SIZE_LIMIT_MB = 2; // Limite de 2MB por chunk
  const SIZE_LIMIT_BYTES = SIZE_LIMIT_MB * 1024 * 1024;
  
  let largeFiles = 0;
  
  for (const file of files) {
    if (!file.endsWith('.js')) continue;
    
    const filePath = path.join(assetsDir, file);
    const stats = fs.statSync(filePath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
    
    if (stats.size > SIZE_LIMIT_BYTES) {
      log.warning(`Arquivo grande (${sizeMB}MB): ${file}`);
      largeFiles++;
    }
  }
  
  if (largeFiles > 0) {
    log.warning(`${largeFiles} arquivos acima de ${SIZE_LIMIT_MB}MB`);
    result.warnings += largeFiles;
  } else {
    log.success('Todos os chunks estão dentro do limite de tamanho');
  }
}

/**
 * Gerar relatório final
 */
function generateReport(): void {
  log.title('📋 Relatório Final');
  
  console.log(`
  ✅ Validações passadas: ${colors.green}${result.passed}${colors.reset}
  ⚠️  Avisos:              ${colors.yellow}${result.warnings}${colors.reset}
  ❌ Erros:               ${colors.red}${result.failed}${colors.reset}
  `);
  
  if (result.errors.length > 0) {
    log.title('❌ Erros Encontrados:');
    result.errors.forEach((error, i) => {
      console.log(`  ${i + 1}. ${error}`);
    });
  }
  
  if (result.failed === 0) {
    log.success('\n🎉 Build validado com sucesso!');
    log.info('✓ Pronto para deploy');
  } else {
    log.error('\n❌ Build falhou na validação');
    log.info('Corrija os erros acima antes de fazer deploy');
  }
}

/**
 * Main
 */
async function main() {
  console.log(`
${colors.bright}${colors.cyan}
╔═══════════════════════════════════════╗
║   🔍 BUILD VALIDATION SCRIPT         ║
╚═══════════════════════════════════════╝
${colors.reset}
  `);
  
  // Verificações
  if (!checkDistExists()) {
    process.exit(1);
  }
  
  validateIndexHtml();
  validateServiceWorker();
  validateManifest();
  validateCriticalAssets();
  validateFileSizes();
  
  // Relatório
  generateReport();
  
  // Exit code
  process.exit(result.failed > 0 ? 1 : 0);
}

// Executar
main().catch((error) => {
  log.error(`Erro fatal: ${error.message}`);
  console.error(error);
  process.exit(1);
});

