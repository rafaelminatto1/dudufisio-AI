import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ler o arquivo de exercícios
const exercisesFile = path.join(__dirname, '..', 'data', 'exercisesLibraryData.ts');
let content = fs.readFileSync(exercisesFile, 'utf8');

console.log('🖼️ Atualizando URLs das imagens nos exercícios...');

// Substituir todas as URLs de imagem placeholder por URLs reais
const imageUpdates = [
  // Esportiva
  { id: 'ex-sport-001', newUrl: '/images/exercises/ex-sport-001.svg' },
  { id: 'ex-sport-002', newUrl: '/images/exercises/ex-sport-002.svg' },
  { id: 'ex-sport-003', newUrl: '/images/exercises/ex-sport-003.svg' },
  { id: 'ex-sport-004', newUrl: '/images/exercises/ex-sport-004.svg' },
  { id: 'ex-sport-005', newUrl: '/images/exercises/ex-sport-005.svg' },
  { id: 'ex-sport-006', newUrl: '/images/exercises/ex-sport-006.svg' },
  { id: 'ex-sport-007', newUrl: '/images/exercises/ex-sport-007.svg' },
  { id: 'ex-sport-008', newUrl: '/images/exercises/ex-sport-008.svg' },
  { id: 'ex-sport-009', newUrl: '/images/exercises/ex-sport-009.svg' },
  { id: 'ex-sport-010', newUrl: '/images/exercises/ex-sport-010.svg' },
  { id: 'ex-sport-011', newUrl: '/images/exercises/ex-sport-011.svg' },
  { id: 'ex-sport-012', newUrl: '/images/exercises/ex-sport-012.svg' },
  { id: 'ex-sport-013', newUrl: '/images/exercises/ex-sport-013.svg' },
  { id: 'ex-sport-014', newUrl: '/images/exercises/ex-sport-014.svg' },
  { id: 'ex-sport-015', newUrl: '/images/exercises/ex-sport-015.svg' },
  { id: 'ex-sport-016', newUrl: '/images/exercises/ex-sport-016.svg' },
  { id: 'ex-sport-017', newUrl: '/images/exercises/ex-sport-017.svg' },
  { id: 'ex-sport-018', newUrl: '/images/exercises/ex-sport-018.svg' },
  { id: 'ex-sport-019', newUrl: '/images/exercises/ex-sport-019.svg' },
  { id: 'ex-sport-020', newUrl: '/images/exercises/ex-sport-020.svg' },

  // Pós-operatória
  { id: 'ex-post-001', newUrl: '/images/exercises/ex-post-001.svg' },
  { id: 'ex-post-002', newUrl: '/images/exercises/ex-post-002.svg' },
  { id: 'ex-post-003', newUrl: '/images/exercises/ex-post-003.svg' },
  { id: 'ex-post-004', newUrl: '/images/exercises/ex-post-004.svg' },
  { id: 'ex-post-005', newUrl: '/images/exercises/ex-post-005.svg' },
  { id: 'ex-post-006', newUrl: '/images/exercises/ex-post-006.svg' },
  { id: 'ex-post-007', newUrl: '/images/exercises/ex-post-007.svg' },
  { id: 'ex-post-008', newUrl: '/images/exercises/ex-post-008.svg' },
  { id: 'ex-post-009', newUrl: '/images/exercises/ex-post-009.svg' },
  { id: 'ex-post-010', newUrl: '/images/exercises/ex-post-010.svg' },
  { id: 'ex-post-011', newUrl: '/images/exercises/ex-post-011.svg' },
  { id: 'ex-post-012', newUrl: '/images/exercises/ex-post-012.svg' },
  { id: 'ex-post-013', newUrl: '/images/exercises/ex-post-013.svg' },
  { id: 'ex-post-014', newUrl: '/images/exercises/ex-post-014.svg' },
  { id: 'ex-post-015', newUrl: '/images/exercises/ex-post-015.svg' },
  { id: 'ex-post-016', newUrl: '/images/exercises/ex-post-016.svg' },
  { id: 'ex-post-017', newUrl: '/images/exercises/ex-post-017.svg' },
  { id: 'ex-post-018', newUrl: '/images/exercises/ex-post-018.svg' },
  { id: 'ex-post-019', newUrl: '/images/exercises/ex-post-019.svg' },
  { id: 'ex-post-020', newUrl: '/images/exercises/ex-post-020.svg' },

  // Geriátrica
  { id: 'ex-geri-001', newUrl: '/images/exercises/ex-geri-001.svg' },
  { id: 'ex-geri-002', newUrl: '/images/exercises/ex-geri-002.svg' },
  { id: 'ex-geri-003', newUrl: '/images/exercises/ex-geri-003.svg' },
  { id: 'ex-geri-004', newUrl: '/images/exercises/ex-geri-004.svg' },
  { id: 'ex-geri-005', newUrl: '/images/exercises/ex-geri-005.svg' },
  { id: 'ex-geri-006', newUrl: '/images/exercises/ex-geri-006.svg' },
  { id: 'ex-geri-007', newUrl: '/images/exercises/ex-geri-007.svg' },
  { id: 'ex-geri-008', newUrl: '/images/exercises/ex-geri-008.svg' },
  { id: 'ex-geri-009', newUrl: '/images/exercises/ex-geri-009.svg' },
  { id: 'ex-geri-010', newUrl: '/images/exercises/ex-geri-010.svg' },
  { id: 'ex-geri-011', newUrl: '/images/exercises/ex-geri-011.svg' },
  { id: 'ex-geri-012', newUrl: '/images/exercises/ex-geri-012.svg' },
  { id: 'ex-geri-013', newUrl: '/images/exercises/ex-geri-013.svg' },
  { id: 'ex-geri-014', newUrl: '/images/exercises/ex-geri-014.svg' },
  { id: 'ex-geri-015', newUrl: '/images/exercises/ex-geri-015.svg' }
];

let updateCount = 0;

// Atualizar cada exercício
imageUpdates.forEach(({ id, newUrl }) => {
  // Procurar por imageUrl: 'https://example.com/...' e substituir
  const regex = new RegExp(`(id: '${id}'[\\s\\S]*?imageUrl: ')[^']*(')`, 'g');
  const match = content.match(regex);
  
  if (match) {
    content = content.replace(regex, `$1${newUrl}$2`);
    updateCount++;
    console.log(`✅ ${id} → ${newUrl}`);
  } else {
    console.log(`⚠️ ${id} não encontrado`);
  }
});

// Salvar o arquivo atualizado
fs.writeFileSync(exercisesFile, content, 'utf8');

console.log(`\n🎉 ${updateCount} exercícios atualizados com imagens SVG!`);
console.log('📁 Arquivo salvo: data/exercisesLibraryData.ts');
