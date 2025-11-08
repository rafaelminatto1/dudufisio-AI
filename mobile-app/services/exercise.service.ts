import type { Exercise, ExerciseProgressPoint } from '../types';

export async function fetchExercises(): Promise<Exercise[]> {
  // Endpoint real pode ser configurado no futuro.
  return Promise.resolve([
    {
      id: 'exercise-1',
      name: 'Agachamento assistido',
      description: '3 séries de 10 repetições com supervisão do terapeuta.',
      difficulty: 'iniciante',
      focusArea: 'Joelhos',
      recommendedSets: 3,
      recommendedReps: 10,
      videoUrl: 'https://dudufisio.video/agachamento.mp4',
    },
    {
      id: 'exercise-2',
      name: 'Prancha lateral',
      description: 'Fortalecimento de core. Manter posição por 30s de cada lado.',
      difficulty: 'intermediário',
      focusArea: 'Core',
      recommendedSets: 3,
      recommendedReps: 30,
    },
  ]);
}

export async function fetchProgress(): Promise<ExerciseProgressPoint[]> {
  const today = new Date();
  const formatter = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

  return Array.from({ length: 5 }, (_, idx) => {
    const d = new Date(today);
    d.setDate(d.getDate() - idx * 2);
    return {
      date: formatter.format(d),
      completedExercises: Math.max(1, Math.floor(Math.random() * 6)),
    };
  }).reverse();
}

