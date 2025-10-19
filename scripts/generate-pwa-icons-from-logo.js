const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Script para gerar ícones PWA a partir do logo Activity Fisioterapia
 * 
 * Gera os seguintes tamanhos:
 * - 192x192 (Android home screen)
 * - 512x512 (Android splash screen)
 * - 180x180 (Apple Touch Icon)
 * - 32x32 (Favicon)
 */

const sizes = [
  { size: 192, name: 'icon-192.png' },
  { size: 512, name: 'icon-512.png' },
  { size: 180, name: 'apple-touch-icon.png' },
  { size: 32, name: 'favicon-32.png' },
];

// Caminho do logo fonte (você precisará adicionar o logo aqui)
const logoSource = path.join(__dirname, '../assets/logo-activity.png');
const outputDir = path.join(__dirname, '../public');

// Verificar se o logo existe
if (!fs.existsSync(logoSource)) {
  console.error('❌ Logo não encontrado em:', logoSource);
  console.log('📝 Por favor, adicione o logo Activity Fisioterapia em: assets/logo-activity.png');
  console.log('   O logo deve ser PNG com fundo transparente ou preto.');
  process.exit(1);
}

async function generateIcons() {
  console.log('🎨 Gerando ícones PWA a partir do logo Activity Fisioterapia...\n');
  
  // Criar diretório public se não existir
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  for (const { size, name } of sizes) {
    try {
      const outputPath = path.join(outputDir, name);
      
      await sharp(logoSource)
        .resize(size, size, { 
          fit: 'contain', 
          background: { r: 0, g: 0, b: 0, alpha: 1 } // Fundo preto
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Gerado: ${name} (${size}x${size})`);
    } catch (error) {
      console.error(`❌ Erro ao gerar ${name}:`, error.message);
    }
  }
  
  console.log('\n🎉 Todos os ícones PWA foram gerados com sucesso!');
  console.log('📦 Localização: public/');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Verifique os ícones gerados em public/');
  console.log('   2. Execute: npm run build');
  console.log('   3. Teste o PWA com Lighthouse');
}

// Executar
generateIcons().catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});


