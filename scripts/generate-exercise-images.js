const fs = require('fs');
const path = require('path');

// Cores por especialidade
const specialtyColors = {
  'esportiva': '#3B82F6', // Azul
  'pós-operatória': '#10B981', // Verde
  'geriátrica': '#F59E0B', // Amarelo
  'fortalecimento': '#8B5CF6' // Roxo
};

// Ícones por tipo de exercício
const exerciseIcons = {
  // Esportiva
  'Agachamento': '🏋️',
  'Prancha': '🤸',
  'Burpees': '🏃',
  'Salto': '🦘',
  'Pliométrico': '⚡',
  'Funcional': '💪',
  'Medicine Ball': '⚽',
  'Deadlift': '🏋️‍♂️',
  'Squat': '🦵',
  'Core': '🎯',
  
  // Pós-operatória
  'Mobilização': '🔄',
  'Amplitude': '📏',
  'Isométrico': '🔒',
  'Propriocepção': '⚖️',
  'Alongamento': '🤸‍♀️',
  'Fortaleciemento': '💪',
  
  // Geriátrica
  'Equilíbrio': '⚖️',
  'Marcha': '🚶',
  'Quedas': '🛡️',
  'Flexibilidade': '🤸',
  'Coordenacao': '🎯'
};

// Função para obter ícone baseado no nome do exercício
function getExerciseIcon(exerciseName, specialty) {
  const name = exerciseName.toLowerCase();
  
  // Buscar por palavras-chave
  for (const [keyword, icon] of Object.entries(exerciseIcons)) {
    if (name.includes(keyword.toLowerCase())) {
      return icon;
    }
  }
  
  // Fallback por especialidade
  switch (specialty) {
    case 'esportiva': return '🏃‍♂️';
    case 'pós-operatória': return '🏥';
    case 'geriátrica': return '👴';
    default: return '💪';
  }
}

// Função para gerar SVG
function generateExerciseSVG(exercise, index) {
  const color = specialtyColors[exercise.specialty] || '#6B7280';
  const icon = getExerciseIcon(exercise.name, exercise.specialty);
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
  <text x="150" y="80" text-anchor="middle" font-size="48" font-family="Arial, sans-serif">${icon}</text>
  
  <!-- Exercise name -->
  <text x="150" y="110" text-anchor="middle" font-size="14" font-weight="bold" font-family="Arial, sans-serif" fill="#1F2937">
    ${exercise.name.length > 30 ? exercise.name.substring(0, 30) + '...' : exercise.name}
  </text>
  
  <!-- Specialty -->
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

// Carregar dados dos exercícios
const exercisesData = require('../data/exercisesLibraryData.ts');

// Função para processar os dados (simulação já que não podemos importar TS diretamente)
const EXERCISES_LIBRARY = [
  // Esportiva
  { id: 'ex-sport-001', name: 'Agachamento Unilateral (Pistol Squat)', specialty: 'esportiva', difficulty: 3, duration: 180 },
  { id: 'ex-sport-002', name: 'Burpees com Salto', specialty: 'esportiva', difficulty: 3, duration: 180 },
  { id: 'ex-sport-003', name: 'Single Leg Romanian Deadlift', specialty: 'esportiva', difficulty: 2, duration: 150 },
  { id: 'ex-sport-004', name: 'Y-T-W com Halteres', specialty: 'esportiva', difficulty: 1, duration: 180 },
  { id: 'ex-sport-005', name: 'Rotação de Tronco com Medicine Ball', specialty: 'esportiva', difficulty: 2, duration: 120 },
  
  // Pós-operatória
  { id: 'ex-post-001', name: 'Mobilização Passiva de Joelho', specialty: 'pós-operatória', difficulty: 1, duration: 300 },
  { id: 'ex-post-002', name: 'Contração Isométrica de Quadríceps', specialty: 'pós-operatória', difficulty: 1, duration: 60 },
  { id: 'ex-post-003', name: 'Alongamento de Isquiotibiais', specialty: 'pós-operatória', difficulty: 1, duration: 180 },
  
  // Geriátrica
  { id: 'ex-geri-001', name: 'Exercício de Equilíbrio em Pé', specialty: 'geriátrica', difficulty: 1, duration: 120 },
  { id: 'ex-geri-002', name: 'Marcha com Obstáculos', specialty: 'geriátrica', difficulty: 2, duration: 300 },
  { id: 'ex-geri-003', name: 'Fortalecimento de Membros Inferiores', specialty: 'geriátrica', difficulty: 1, duration: 240 }
];

// Gerar imagens para todos os exercícios
const outputDir = path.join(__dirname, '..', 'public', 'images', 'exercises');

console.log('🎨 Gerando imagens para exercícios...');

EXERCISES_LIBRARY.forEach((exercise, index) => {
  const svg = generateExerciseSVG(exercise, index);
  const filename = `${exercise.id}.svg`;
  const filepath = path.join(outputDir, filename);
  
  fs.writeFileSync(filepath, svg);
  console.log(`✅ Gerada: ${filename}`);
});

console.log(`\n🎉 ${EXERCISES_LIBRARY.length} imagens geradas com sucesso!`);
console.log(`📁 Local: ${outputDir}`);
