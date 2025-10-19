const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

/**
 * Script para converter imagens para WebP
 * 
 * Converte todas as imagens em public/images para WebP
 * Mantém as originais como fallback
 */

const inputDir = path.join(__dirname, '../public/images');
const outputDir = path.join(__dirname, '../public/images');

// Extensões de imagem suportadas
const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif'];

async function convertToWebP(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ 
        quality: 85,
        effort: 4 // 0-6, maior = melhor compressão mas mais lento
      })
      .toFile(outputPath);
    
    // Obter tamanhos
    const originalStats = fs.statSync(inputPath);
    const webpStats = fs.statSync(outputPath);
    const reduction = ((1 - webpStats.size / originalStats.size) * 100).toFixed(1);
    
    console.log(`✅ ${path.basename(inputPath)} → ${path.basename(outputPath)} (${reduction}% menor)`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao converter ${inputPath}:`, error.message);
    return false;
  }
}

async function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  let converted = 0;
  let failed = 0;
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Processar subdiretórios recursivamente
      const { converted: subConverted, failed: subFailed } = await processDirectory(filePath);
      converted += subConverted;
      failed += subFailed;
    } else {
      const ext = path.extname(file).toLowerCase();
      
      if (imageExtensions.includes(ext)) {
        const webpPath = filePath.replace(ext, '.webp');
        
        // Verificar se já existe WebP
        if (fs.existsSync(webpPath)) {
          console.log(`⏭️  ${file} já tem versão WebP, pulando...`);
          continue;
        }
        
        const success = await convertToWebP(filePath, webpPath);
        if (success) {
          converted++;
        } else {
          failed++;
        }
      }
    }
  }
  
  return { converted, failed };
}

async function main() {
  console.log('🎨 Convertendo imagens para WebP...\n');
  
  // Verificar se o diretório existe
  if (!fs.existsSync(inputDir)) {
    console.log('📁 Diretório não encontrado:', inputDir);
    console.log('   Criando diretório...');
    fs.mkdirSync(inputDir, { recursive: true });
    console.log('✅ Diretório criado. Adicione imagens e execute novamente.');
    return;
  }
  
  const { converted, failed } = await processDirectory(inputDir);
  
  console.log('\n📊 Resumo:');
  console.log(`   ✅ Convertidas: ${converted}`);
  console.log(`   ❌ Falhas: ${failed}`);
  console.log('\n🎉 Conversão concluída!');
  console.log('\n📝 Próximos passos:');
  console.log('   1. Atualizar LazyImage para usar WebP com fallback');
  console.log('   2. Testar em diferentes navegadores');
  console.log('   3. Verificar redução de bundle size');
}

main().catch(error => {
  console.error('💥 Erro fatal:', error);
  process.exit(1);
});

