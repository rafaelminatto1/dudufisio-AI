#!/usr/bin/env node

/**
 * 🚀 POST-BUILD OPTIMIZATION SCRIPT
 * Otimizações avançadas após o build para melhorar performance de deploy
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const DIST_DIR = path.join(process.cwd(), 'dist');
const ASSETS_DIR = path.join(DIST_DIR, 'assets');

console.log('🚀 Iniciando otimizações pós-build...');

// 1. Compressão adicional de assets
function compressAssets() {
  console.log('📦 Comprimindo assets...');
  
  try {
    // Comprimir CSS adicional
    const cssFiles = fs.readdirSync(ASSETS_DIR).filter(file => file.endsWith('.css'));
    cssFiles.forEach(file => {
      const filePath = path.join(ASSETS_DIR, file);
      const content = fs.readFileSync(filePath, 'utf8');
      
      // Remover comentários e espaços extras
      const optimized = content
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comentários CSS
        .replace(/\s+/g, ' ') // Reduz espaços múltiplos
        .replace(/;\s*}/g, '}') // Remove ; antes de }
        .trim();
      
      fs.writeFileSync(filePath, optimized);
      console.log(`  ✅ Otimizado: ${file}`);
    });
  } catch (error) {
    console.warn('⚠️  Erro na compressão de CSS:', error.message);
  }
}

// 2. Otimização de imagens
function optimizeImages() {
  console.log('🖼️  Otimizando imagens...');
  
  try {
    const imageFiles = fs.readdirSync(ASSETS_DIR).filter(file => 
      /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
    );
    
    console.log(`  📊 Encontradas ${imageFiles.length} imagens`);
  } catch (error) {
    console.warn('⚠️  Erro na otimização de imagens:', error.message);
  }
}

// 3. Geração de manifest de cache
function generateCacheManifest() {
  console.log('📋 Gerando manifest de cache...');
  
  try {
    const assets = [];
    
    function scanDirectory(dir, baseDir = '') {
      const files = fs.readdirSync(dir);
      
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
          scanDirectory(filePath, path.join(baseDir, file));
        } else {
          const relativePath = path.join(baseDir, file).replace(/\\/g, '/');
          const size = stat.size;
          const ext = path.extname(file);
          
          assets.push({
            path: `/${relativePath}`,
            size,
            type: ext,
            hash: file.match(/-([a-f0-9]{8})\./)?.[1] || 'no-hash'
          });
        }
      });
    }
    
    scanDirectory(ASSETS_DIR, 'assets');
    
    const manifest = {
      version: Date.now(),
      assets,
      totalSize: assets.reduce((sum, asset) => sum + asset.size, 0),
      buildTime: new Date().toISOString()
    };
    
    fs.writeFileSync(
      path.join(DIST_DIR, 'cache-manifest.json'),
      JSON.stringify(manifest, null, 2)
    );
    
    console.log(`  ✅ Manifest criado com ${assets.length} assets`);
  } catch (error) {
    console.warn('⚠️  Erro na geração do manifest:', error.message);
  }
}

// 4. Otimização do index.html
function optimizeIndexHtml() {
  console.log('📄 Otimizando index.html...');
  
  try {
    const indexPath = path.join(DIST_DIR, 'index.html');
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Adicionar preload hints para recursos críticos
    const criticalAssets = fs.readdirSync(ASSETS_DIR)
      .filter(file => file.includes('index-') && file.endsWith('.js'))
      .slice(0, 1); // Apenas o bundle principal
    
    const preloadLinks = criticalAssets.map(asset => 
      `<link rel="preload" href="/assets/${asset}" as="script">`
    ).join('\n    ');
    
    // Inserir preload links no head
    content = content.replace(
      '</head>',
      `    ${preloadLinks}\n  </head>`
    );
    
    // Adicionar resource hints
    const resourceHints = `
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    <link rel="preconnect" href="https://api.supabase.co">`;
    
    content = content.replace(
      '</head>',
      `    ${resourceHints}\n  </head>`
    );
    
    fs.writeFileSync(indexPath, content);
    console.log('  ✅ index.html otimizado');
  } catch (error) {
    console.warn('⚠️  Erro na otimização do HTML:', error.message);
  }
}

// 5. Análise de bundle size
function analyzeBundleSize() {
  console.log('📊 Analisando tamanho do bundle...');
  
  try {
    const stats = {
      totalSize: 0,
      gzipSize: 0,
      files: []
    };
    
    const files = fs.readdirSync(ASSETS_DIR);
    
    files.forEach(file => {
      const filePath = path.join(ASSETS_DIR, file);
      const stat = fs.statSync(filePath);
      
      stats.files.push({
        name: file,
        size: stat.size,
        sizeKB: Math.round(stat.size / 1024 * 100) / 100
      });
      
      stats.totalSize += stat.size;
    });
    
    // Ordenar por tamanho
    stats.files.sort((a, b) => b.size - a.size);
    
    console.log(`  📦 Total de arquivos: ${stats.files.length}`);
    console.log(`  📏 Tamanho total: ${Math.round(stats.totalSize / 1024)} KB`);
    
    // Mostrar os 5 maiores arquivos
    console.log('  🔝 Maiores arquivos:');
    stats.files.slice(0, 5).forEach(file => {
      console.log(`    - ${file.name}: ${file.sizeKB} KB`);
    });
    
    // Salvar estatísticas
    fs.writeFileSync(
      path.join(DIST_DIR, 'build-stats.json'),
      JSON.stringify(stats, null, 2)
    );
    
  } catch (error) {
    console.warn('⚠️  Erro na análise do bundle:', error.message);
  }
}

// Executar todas as otimizações
async function runOptimizations() {
  const startTime = Date.now();
  
  try {
    compressAssets();
    optimizeImages();
    generateCacheManifest();
    optimizeIndexHtml();
    analyzeBundleSize();
    
    const duration = Date.now() - startTime;
    console.log(`\n✅ Otimizações concluídas em ${duration}ms`);
    
  } catch (error) {
    console.error('❌ Erro nas otimizações:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runOptimizations();
}

module.exports = { runOptimizations };