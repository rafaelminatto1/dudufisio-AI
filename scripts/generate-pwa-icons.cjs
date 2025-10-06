#!/usr/bin/env node

/**
 * Script para gerar ícones PWA em diferentes tamanhos
 *
 * Uso:
 *   node scripts/generate-pwa-icons.js
 *
 * Requer:
 *   npm install sharp (já instalado)
 *
 * Alternativa sem dependências:
 *   Use ferramentas online como:
 *   - https://realfavicongenerator.net/
 *   - https://favicon.io/
 *   - https://www.pwabuilder.com/imageGenerator
 */

const fs = require('fs');
const path = require('path');

console.log('📱 PWA Icon Generator\n');

// Verifica se sharp está disponível
let sharp;
try {
  sharp = require('sharp');
  console.log('✅ Sharp encontrado - gerando ícones...\n');
} catch (error) {
  console.log('⚠️  Sharp não encontrado.');
  console.log('\nPara gerar os ícones automaticamente, instale sharp:');
  console.log('  npm install sharp\n');
  console.log('Alternativas:');
  console.log('  1. Use ferramentas online:');
  console.log('     - https://realfavicongenerator.net/');
  console.log('     - https://favicon.io/');
  console.log('     - https://www.pwabuilder.com/imageGenerator');
  console.log('\n  2. Use design tools (Figma, Photoshop, etc):');
  console.log('     - Crie imagens 192x192px e 512x512px');
  console.log('     - Salve como icon-192x192.png e icon-512x512.png');
  console.log('     - Coloque em public/\n');
  process.exit(0);
}

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

const sizes = [
  { name: 'icon-192x192.png', size: 192 },
  { name: 'icon-512x512.png', size: 512 },
  { name: 'badge-72x72.png', size: 72 },
];

async function generateIcons() {
  if (!fs.existsSync(svgPath)) {
    console.error('❌ Arquivo icon.svg não encontrado em public/');
    console.log('\nCrie um arquivo SVG primeiro ou use uma imagem PNG como base.\n');
    process.exit(1);
  }

  for (const { name, size } of sizes) {
    const outputPath = path.join(publicDir, name);

    try {
      await sharp(svgPath)
        .resize(size, size)
        .png()
        .toFile(outputPath);

      console.log(`✅ ${name} gerado (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${name}:`, error.message);
    }
  }

  console.log('\n🎉 Ícones PWA gerados com sucesso!');
  console.log('\nArquivos criados:');
  sizes.forEach(({ name }) => {
    console.log(`  - public/${name}`);
  });
  console.log('\n📝 Próximos passos:');
  console.log('  1. Verifique os ícones em public/');
  console.log('  2. Teste o PWA no navegador');
  console.log('  3. Use ferramentas como Lighthouse para validar\n');
}

// Verifica se está sendo executado diretamente
if (require.main === module) {
  generateIcons().catch(console.error);
}

module.exports = { generateIcons };
