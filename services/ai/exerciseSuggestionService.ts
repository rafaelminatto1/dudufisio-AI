/**
 * Serviço de Sugestão de Exercícios com IA
 * Sugere exercícios terapêuticos baseados no quadro clínico do paciente
 */

import { suggestExercises as geminiSuggestExercises, isGeminiConfigured } from '../geminiService';
import type { ExerciseSuggestionInput, SuggestedExercise } from '../../types';

/**
 * Sugere exercícios terapêuticos baseados no quadro clínico
 * @param input - Dados do paciente para sugestão
 * @returns Lista de exercícios sugeridos com justificativa
 */
export async function suggestExercises(input: ExerciseSuggestionInput): Promise<SuggestedExercise[]> {
  // Validar entrada
  validateInput(input);

  // Verificar se API está configurada
  if (!isGeminiConfigured()) {
    throw new Error('API Gemini não configurada');
  }

  try {
    const exercises = await geminiSuggestExercises(input);
    
    // Validar e limpar exercícios
    const cleanedExercises = exercises.map(cleanExercise);
    
    return cleanedExercises;
  } catch (error) {
    console.error('Erro ao sugerir exercícios:', error);
    throw new Error('Falha ao sugerir exercícios. Tente novamente.');
  }
}

/**
 * Valida os dados de entrada
 */
function validateInput(input: ExerciseSuggestionInput): void {
  if (!input.diagnosis || input.diagnosis.trim().length === 0) {
    throw new Error('Diagnóstico é obrigatório');
  }

  if (input.diagnosis.trim().length < 5) {
    throw new Error('Diagnóstico muito curto. Mínimo: 5 caracteres');
  }
}

/**
 * Limpa e valida um exercício sugerido
 */
function cleanExercise(exercise: SuggestedExercise): SuggestedExercise {
  return {
    name: exercise.name.trim(),
    description: exercise.description.trim(),
    sets: Math.max(1, Math.min(10, exercise.sets)), // Entre 1 e 10
    reps: Math.max(1, Math.min(50, exercise.reps)), // Entre 1 e 50
    rationale: exercise.rationale.trim(),
  };
}

/**
 * Filtra exercícios por categoria (útil para interface)
 */
export function categorizeExercises(exercises: SuggestedExercise[]): {
  [category: string]: SuggestedExercise[];
} {
  const categories: { [key: string]: SuggestedExercise[] } = {
    fortalecimento: [],
    alongamento: [],
    mobilidade: [],
    equilibrio: [],
    outros: [],
  };

  exercises.forEach((exercise) => {
    const name = exercise.name.toLowerCase();
    
    if (name.includes('fortalecimento') || name.includes('força')) {
      categories.fortalecimento.push(exercise);
    } else if (name.includes('alongamento') || name.includes('flexibilidade')) {
      categories.alongamento.push(exercise);
    } else if (name.includes('mobilidade') || name.includes('adm')) {
      categories.mobilidade.push(exercise);
    } else if (name.includes('equilíbrio') || name.includes('propriocepção')) {
      categories.equilibrio.push(exercise);
    } else {
      categories.outros.push(exercise);
    }
  });

  return categories;
}

/**
 * Converte exercício sugerido para formato de exercício domiciliar
 * Útil para adicionar diretamente ao plano do paciente
 */
export function convertToHomeExercise(suggested: SuggestedExercise): {
  name: string;
  description: string;
  repetitions: number;
  sets: number;
  instructions: string;
} {
  return {
    name: suggested.name,
    description: suggested.description,
    repetitions: suggested.reps,
    sets: suggested.sets,
    instructions: `${suggested.description}\n\n${suggested.rationale}`,
  };
}

/**
 * Gera resumo textual dos exercícios sugeridos
 * Útil para copiar/colar em campos de texto
 */
export function generateExercisesSummary(exercises: SuggestedExercise[]): string {
  return exercises
    .map((ex, index) => {
      return `${index + 1}. ${ex.name}
   - Descrição: ${ex.description}
   - Séries: ${ex.sets} | Repetições: ${ex.reps}
   - Por quê: ${ex.rationale}`;
    })
    .join('\n\n');
}

