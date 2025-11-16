/**
 * Serviço de Estatísticas do Paciente
 * MoocaFisio - App para Pacientes
 */

import { getAuthHeaders } from './patientAuthService';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export interface PatientStats {
  exercisesTotal: number;
  exercisesCompleted: number;
  exercisesToday: number;
  completionRate: number;
  currentStreak: number;
  longestStreak: number;
  totalSessions: number;
  sessionsAttendanceRate: number;
  lastExerciseAt?: string;
  lastLoginAt?: string;
}

export interface ProgressDataPoint {
  date: string;
  count: number;
  dayOfWeek: string;
}

export interface NextSession {
  id: string;
  date: string;
  time: string;
  endTime: string;
  type: string;
  therapist?: {
    id: string;
    name: string;
  };
}

export interface StatsResponse {
  stats: PatientStats;
  progressData: ProgressDataPoint[];
  nextSession?: NextSession;
}

/**
 * Obtém estatísticas do paciente
 */
export async function getStats(): Promise<StatsResponse> {
  const response = await fetch(`${API_URL}/patient/stats`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao carregar estatísticas');
  }
  
  return await response.json();
}

/**
 * Obtém apenas os dados de progresso
 */
export async function getProgressData(): Promise<ProgressDataPoint[]> {
  const data = await getStats();
  return data.progressData;
}

/**
 * Obtém apenas a próxima sessão
 */
export async function getNextSession(): Promise<NextSession | null> {
  const data = await getStats();
  return data.nextSession || null;
}

