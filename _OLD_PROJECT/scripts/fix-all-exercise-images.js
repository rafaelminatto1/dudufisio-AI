import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o arquivo de exercícios
const exercisesFile = path.join(__dirname, '..', 'data', 'exercisesLibraryData.ts');
let content = fs.readFileSync(exercisesFile, 'utf8');

console.log('🖼️ Corrigindo TODAS as URLs de imagem dos exercícios...');

// Substituir todas as URLs de exemplo por URLs reais baseadas no ID
content = content.replace(
  /imageUrl: 'https:\/\/example\.com\/[^']*'/g, 
  (match) => {
    // Extrair o ID do exercício do contexto anterior
    const linesBefore = content.substring(0, content.indexOf(match)).split('\n');
    let exerciseId = null;
    
    // Procurar pelo ID nas últimas 10 linhas antes da imagem
    for (let i = linesBefore.length - 1; i >= Math.max(0, linesBefore.length - 10); i--) {
      const line = linesBefore[i];
      const idMatch = line.match(/id:\s*'([^']+)'/);
      if (idMatch) {
        exerciseId = idMatch[1];
        break;
      }
    }
    
    if (exerciseId) {
      const newUrl = `/images/exercises/${exerciseId}.svg`;
      console.log(`✅ ${exerciseId} → ${newUrl}`);
      return `imageUrl: '${newUrl}'`;
    }
    
    return match; // Se não encontrar ID, manter original
  }
);

// Salvar o arquivo atualizado
fs.writeFileSync(exercisesFile, content, 'utf8');

console.log('\n🎉 Todas as URLs de imagem foram atualizadas!');
console.log('📁 Arquivo salvo: data/exercisesLibraryData.ts');
