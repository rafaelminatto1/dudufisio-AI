import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lista de exercícios com suas informações
const exercises = [
  // Esportiva (20)
  { id: 'ex-sport-001', name: 'Agachamento Unilateral (Pistol Squat)', specialty: 'esportiva', difficulty: 3, duration: 180, icon: '🏋️' },
  { id: 'ex-sport-002', name: 'Burpees com Salto', specialty: 'esportiva', difficulty: 3, duration: 180, icon: '🏃' },
  { id: 'ex-sport-003', name: 'Single Leg Romanian Deadlift', specialty: 'esportiva', difficulty: 2, duration: 150, icon: '🏋️‍♂️' },
  { id: 'ex-sport-004', name: 'Y-T-W com Halteres', specialty: 'esportiva', difficulty: 1, duration: 180, icon: '💪' },
  { id: 'ex-sport-005', name: 'Rotação de Tronco com Medicine Ball', specialty: 'esportiva', difficulty: 2, duration: 120, icon: '⚽' },
  { id: 'ex-sport-006', name: 'Prancha Lateral com Rotação', specialty: 'esportiva', difficulty: 2, duration: 120, icon: '🤸' },
  { id: 'ex-sport-007', name: 'Jump Squat', specialty: 'esportiva', difficulty: 3, duration: 60, icon: '🦘' },
  { id: 'ex-sport-008', name: 'Lunges Dinâmicos', specialty: 'esportiva', difficulty: 2, duration: 180, icon: '🦵' },
  { id: 'ex-sport-009', name: 'Mountain Climbers', specialty: 'esportiva', difficulty: 3, duration: 120, icon: '🏃‍♂️' },
  { id: 'ex-sport-010', name: 'Box Jumps', specialty: 'esportiva', difficulty: 3, duration: 90, icon: '📦' },
  { id: 'ex-sport-011', name: 'Turkish Get-up', specialty: 'esportiva', difficulty: 3, duration: 300, icon: '🏋️' },
  { id: 'ex-sport-012', name: 'Bear Crawl', specialty: 'esportiva', difficulty: 2, duration: 180, icon: '🐻' },
  { id: 'ex-sport-013', name: 'Kettlebell Swing', specialty: 'esportiva', difficulty: 2, duration: 240, icon: '⚖️' },
  { id: 'ex-sport-014', name: 'Battle Ropes', specialty: 'esportiva', difficulty: 3, duration: 120, icon: '🌊' },
  { id: 'ex-sport-015', name: 'Agachamento com Salto', specialty: 'esportiva', difficulty: 3, duration: 90, icon: '⚡' },
  { id: 'ex-sport-016', name: 'Pliométrico Lateral', specialty: 'esportiva', difficulty: 3, duration: 120, icon: '🔄' },
  { id: 'ex-sport-017', name: 'Dead Bug Avançado', specialty: 'esportiva', difficulty: 2, duration: 180, icon: '🐛' },
  { id: 'ex-sport-018', name: 'Hollow Body Hold', specialty: 'esportiva', difficulty: 2, duration: 120, icon: '🏹' },
  { id: 'ex-sport-019', name: 'Wall Ball Shots', specialty: 'esportiva', difficulty: 3, duration: 180, icon: '🎯' },
  { id: 'ex-sport-020', name: 'Sled Push', specialty: 'esportiva', difficulty: 3, duration: 240, icon: '🚛' },

  // Pós-operatória (20)
  { id: 'ex-post-001', name: 'Mobilização Passiva de Joelho', specialty: 'pós-operatória', difficulty: 1, duration: 300, icon: '🦵' },
  { id: 'ex-post-002', name: 'Contração Isométrica de Quadríceps', specialty: 'pós-operatória', difficulty: 1, duration: 60, icon: '🔒' },
  { id: 'ex-post-003', name: 'Alongamento de Isquiotibiais', specialty: 'pós-operatória', difficulty: 1, duration: 180, icon: '🤸‍♀️' },
  { id: 'ex-post-004', name: 'Exercício de Propriocepção', specialty: 'pós-operatória', difficulty: 2, duration: 240, icon: '⚖️' },
  { id: 'ex-post-005', name: 'Fortalecimento Progressivo', specialty: 'pós-operatória', difficulty: 2, duration: 300, icon: '💪' },
  { id: 'ex-post-006', name: 'Mobilização de Ombro', specialty: 'pós-operatória', difficulty: 1, duration: 180, icon: '🦾' },
  { id: 'ex-post-007', name: 'Ganho de ADM de Joelho', specialty: 'pós-operatória', difficulty: 1, duration: 240, icon: '📏' },
  { id: 'ex-post-008', name: 'Exercícios de CORE Pós-Cirurgia', specialty: 'pós-operatória', difficulty: 1, duration: 180, icon: '🎯' },
  { id: 'ex-post-009', name: 'Mobilização de Tornozelo', specialty: 'pós-operatória', difficulty: 1, duration: 120, icon: '🦶' },
  { id: 'ex-post-010', name: 'Fortalecimento de Glúteos', specialty: 'pós-operatória', difficulty: 2, duration: 240, icon: '🍑' },
  { id: 'ex-post-011', name: 'Alongamento de Peitoral', specialty: 'pós-operatória', difficulty: 1, duration: 120, icon: '🤗' },
  { id: 'ex-post-012', name: 'Exercícios Respiratórios', specialty: 'pós-operatória', difficulty: 1, duration: 180, icon: '🫁' },
  { id: 'ex-post-013', name: 'Mobilização de Coluna', specialty: 'pós-operatória', difficulty: 1, duration: 240, icon: '🦴' },
  { id: 'ex-post-014', name: 'Fortalecimento de Manguito', specialty: 'pós-operatória', difficulty: 2, duration: 180, icon: '🛡️' },
  { id: 'ex-post-015', name: 'Exercícios de Estabilidade', specialty: 'pós-operatória', difficulty: 2, duration: 300, icon: '⚖️' },
  { id: 'ex-post-016', name: 'Alongamento de Coxa', specialty: 'pós-operatória', difficulty: 1, duration: 120, icon: '🦵' },
  { id: 'ex-post-017', name: 'Mobilização de Punho', specialty: 'pós-operatória', difficulty: 1, duration: 180, icon: '✋' },
  { id: 'ex-post-018', name: 'Fortalecimento de Panturrilha', specialty: 'pós-operatória', difficulty: 1, duration: 180, icon: '🦵' },
  { id: 'ex-post-019', name: 'Exercícios de Coordenação', specialty: 'pós-operatória', difficulty: 2, duration: 240, icon: '🎯' },
  { id: 'ex-post-020', name: 'Reabilitação Funcional', specialty: 'pós-operatória', difficulty: 2, duration: 300, icon: '🏥' },

  // Geriátrica (15)
  { id: 'ex-geri-001', name: 'Exercício de Equilíbrio em Pé', specialty: 'geriátrica', difficulty: 1, duration: 120, icon: '⚖️' },
  { id: 'ex-geri-002', name: 'Marcha com Obstáculos', specialty: 'geriátrica', difficulty: 2, duration: 300, icon: '🚶' },
  { id: 'ex-geri-003', name: 'Fortalecimento de Membros Inferiores', specialty: 'geriátrica', difficulty: 1, duration: 240, icon: '🦵' },
  { id: 'ex-geri-004', name: 'Exercícios de Prevenção de Quedas', specialty: 'geriátrica', difficulty: 1, duration: 180, icon: '🛡️' },
  { id: 'ex-geri-005', name: 'Alongamento Suave', specialty: 'geriátrica', difficulty: 1, duration: 300, icon: '🤸' },
  { id: 'ex-geri-006', name: 'Fortalecimento de Core', specialty: 'geriátrica', difficulty: 1, duration: 180, icon: '🎯' },
  { id: 'ex-geri-007', name: 'Exercícios de Coordenação', specialty: 'geriátrica', difficulty: 2, duration: 240, icon: '🎯' },
  { id: 'ex-geri-008', name: 'Marcha Tandem', specialty: 'geriátrica', difficulty: 2, duration: 180, icon: '🚶‍♀️' },
  { id: 'ex-geri-009', name: 'Fortalecimento de Braços', specialty: 'geriátrica', difficulty: 1, duration: 180, icon: '💪' },
  { id: 'ex-geri-010', name: 'Exercícios Respiratórios', specialty: 'geriátrica', difficulty: 1, duration: 240, icon: '🫁' },
  { id: 'ex-geri-011', name: 'Equilíbrio em Uma Perna', specialty: 'geriátrica', difficulty: 2, duration: 120, icon: '🦵' },
  { id: 'ex-geri-012', name: 'Flexibilidade de Coluna', specialty: 'geriátrica', difficulty: 1, duration: 240, icon: '🦴' },
  { id: 'ex-geri-013', name: 'Exercícios de Memória Motora', specialty: 'geriátrica', difficulty: 2, duration: 300, icon: '🧠' },
  { id: 'ex-geri-014', name: 'Fortalecimento de Quadril', specialty: 'geriátrica', difficulty: 1, duration: 180, icon: '🦴' },
  { id: 'ex-geri-015', name: 'Exercícios de Agilidade', specialty: 'geriátrica', difficulty: 2, duration: 240, icon: '⚡' }
];

// Cores por especialidade
const colors = {
  'esportiva': '#3B82F6',
  'pós-operatória': '#10B981', 
  'geriátrica': '#F59E0B'
};

// Função para gerar SVG
function generateSVG(exercise, index) {
  const color = colors[exercise.specialty] || '#6B7280';
  const specialtyName = exercise.specialty.charAt(0).toUpperCase() + exercise.specialty.slice(1);
  
  return `<svg width="300" height="200" viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="300" height="200" fill="#F9FAFB" stroke="${color}" stroke-width="2" rx="8"/>
  
  <!-- Gradient overlay -->
  <defs>
    <linearGradient id="grad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${color};stop-opacity:0.1" />
      <stop offset="100%" style="stop-color:${color};stop-opacity:0.05" />
    </linearGradient>
  </defs>
  <rect width="300" height="200" fill="url(#grad${index})" rx="8"/>
  
  <!-- Main icon -->
  <text x="150" y="80" text-anchor="middle" font-size="48" font-family="Arial, sans-serif">${exercise.icon}</text>
  
  <!-- Exercise name -->
  <text x="150" y="110" text-anchor="middle" font-size="14" font-weight="bold" font-family="Arial, sans-serif" fill="#1F2937">
    ${exercise.name.length > 30 ? exercise.name.substring(0, 30) + '...' : exercise.name}
  </text>
  
  <!-- Specialty badge -->
  <rect x="50" y="130" width="200" height="20" fill="${color}" rx="10"/>
  <text x="150" y="143" text-anchor="middle" font-size="12" font-weight="bold" font-family="Arial, sans-serif" fill="white">
    ${specialtyName}
  </text>
  
  <!-- Difficulty level -->
  <text x="150" y="165" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" fill="#6B7280">
    Nível ${exercise.difficulty}
  </text>
  
  <!-- Duration -->
  <text x="150" y="180" text-anchor="middle" font-size="10" font-family="Arial, sans-serif" fill="#9CA3AF">
    ${Math.floor(exercise.duration / 60)}:${(exercise.duration % 60).toString().padStart(2, '0')}
  </text>
</svg>`;
}

// Gerar imagens
const outputDir = path.join(__dirname, '..', 'public', 'images', 'exercises');

console.log('🎨 Gerando imagens SVG para exercícios...');

exercises.forEach((exercise, index) => {
  const svg = generateSVG(exercise, index);
  const filename = `${exercise.id}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ ${filename} - ${exercise.name}`);
});

console.log(`\n🎉 ${exercises.length} imagens SVG geradas!`);
console.log(`📁 Local: ${outputDir}`);
