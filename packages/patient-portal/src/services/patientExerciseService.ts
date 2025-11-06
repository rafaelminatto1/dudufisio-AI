/**
 * Serviço de Exercícios do Paciente
 * MoocaFisio - App para Pacientes
 */

import { getAuthHeaders } from './patientAuthService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface ExerciseVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  type: 'url' | 'storage' | 'youtube' | 'vimeo';
  duration?: number;
}

export interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  sets: number;
  reps: number;
  durationSeconds?: number;
  restSeconds?: number;
  frequencyPerWeek?: number;
  startDate: string;
  endDate?: string;
  notes?: string;
  completed: boolean;
  completionDates: string[];
  totalCompletions: number;
  video?: ExerciseVideo;
}

export interface ExercisesResponse {
  exercises: Exercise[];
  total: number;
  filter: string;
}

export interface CompleteExerciseData {
  setsCompleted?: number;
  repsCompleted?: number;
  durationSeconds?: number;
  difficultyLevel?: number; // 1-5
  painLevel?: number; // 0-10
  notes?: string;
}

export interface ExerciseCompletion {
  id: string;
  exerciseId: string;
  exerciseName: string;
  completedAt: string;
  completedDate: string;
  setsCompleted?: number;
  repsCompleted?: number;
  durationSeconds?: number;
  difficultyLevel?: number;
  painLevel?: number;
  notes?: string;
}

/**
 * Lista exercícios do paciente
 */
export async function getExercises(filter: 'all' | 'pending' | 'completed' = 'all'): Promise<Exercise[]> {
  const response = await fetch(`${API_URL}/patient/exercises?filter=${filter}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao carregar exercícios');
  }
  
  const data: ExercisesResponse = await response.json();
  return data.exercises;
}

/**
 * Marca exercício como concluído
 */
export async function completeExercise(
  exerciseId: string,
  data?: CompleteExerciseData
): Promise<ExerciseCompletion> {
  const response = await fetch(`${API_URL}/patient/exercises/${exerciseId}/complete`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data || {}),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao marcar exercício como concluído');
  }
  
  const result = await response.json();
  return result.completion;
}

/**
 * Obtém detalhes de um exercício específico
 */
export async function getExerciseDetails(exerciseId: string): Promise<Exercise> {
  const exercises = await getExercises();
  const exercise = exercises.find(e => e.id === exerciseId);
  
  if (!exercise) {
    throw new Error('Exercício não encontrado');
  }
  
  return exercise;
}

