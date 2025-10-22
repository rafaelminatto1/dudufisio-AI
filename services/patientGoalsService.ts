import { PatientGoal } from '../types';
import * as patientService from './patientService';
import { differenceInDays, formatDistanceToNow, isBefore, isAfter, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { shouldUseSupabase, shouldFallbackToMock, logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para gerenciamento de objetivos/metas dos pacientes
 * CRUD completo + cálculo de countdown e progresso
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

// ============================================================================
// SUPABASE/MOCK FUNCTIONS
// ============================================================================

async function getGoalsFromSupabase(patientId: string): Promise<PatientGoal[]> {
  logDataSource('supabase', `getGoals(${patientId})`);
  const patient = await patientService.getPatientById(patientId);
  return patient?.goals || [];
}

async function getGoalsFromMock(patientId: string): Promise<PatientGoal[]> {
  logDataSource('mock', `getGoals(${patientId})`);
  return [];
}

// ============================================================================
// CRUD OPERATIONS (Dual Mode)
// ============================================================================

/**
 * Busca todos os objetivos de um paciente
 * Tenta Supabase primeiro, fallback para Mock
 */
export async function getGoalsByPatientId(patientId: string): Promise<PatientGoal[]> {
  try {
    if (shouldUseSupabase()) {
      try {
        return await getGoalsFromSupabase(patientId);
      } catch (error) {
        if (shouldFallbackToMock()) {
          return await getGoalsFromMock(patientId);
        }
        throw error;
      }
    }
    return await getGoalsFromMock(patientId);
  } catch (error) {
    console.error('Erro ao buscar objetivos:', error);
    throw error;
  }
}

/**
 * Adiciona novo objetivo ao paciente
 */
export async function addGoal(
  patientId: string,
  goal: Omit<PatientGoal, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>
): Promise<PatientGoal> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient) {
      throw new Error(`Paciente ${patientId} não encontrado`);
    }

    // Validar data alvo
    if (goal.targetDate) {
      const targetDate = new Date(goal.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isBefore(targetDate, today)) {
        throw new Error('Data alvo não pode ser no passado');
      }
    }

    const newGoal: PatientGoal = {
      ...goal,
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      currentProgress: goal.currentProgress || 0,
      status: goal.status || 'active',
      priority: goal.priority || 'medium',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedGoals = [...(patient.goals || []), newGoal];
    
    await patientService.updatePatient(patientId, {
      goals: updatedGoals,
    });

    return newGoal;
  } catch (error) {
    console.error('Erro ao adicionar objetivo:', error);
    throw error;
  }
}

/**
 * Atualiza progresso de um objetivo
 */
export async function updateGoalProgress(
  goalId: string,
  progress: number,
  currentValue?: string
): Promise<PatientGoal> {
  try {
    if (progress < 0 || progress > 100) {
      throw new Error('Progresso deve estar entre 0 e 100');
    }

    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p =>
      p.goals?.some(g => g.id === goalId)
    );

    if (!patient) {
      throw new Error(`Objetivo ${goalId} não encontrado`);
    }

    const goal = patient.goals?.find(g => g.id === goalId);
    if (!goal) {
      throw new Error(`Objetivo ${goalId} não encontrado`);
    }

    const updatedGoal: PatientGoal = {
      ...goal,
      currentProgress: progress,
      currentValue: currentValue || goal.currentValue,
      status: progress >= 100 ? 'completed' : goal.status,
      achievedAt: progress >= 100 ? new Date().toISOString() : goal.achievedAt,
      updatedAt: new Date().toISOString(),
    };

    const updatedGoals = patient.goals?.map(g =>
      g.id === goalId ? updatedGoal : g
    ) || [];

    await patientService.updatePatient(patient.id, {
      goals: updatedGoals,
    });

    return updatedGoal;
  } catch (error) {
    console.error('Erro ao atualizar progresso do objetivo:', error);
    throw error;
  }
}

/**
 * Atualiza dados de um objetivo
 */
export async function updateGoal(
  goalId: string,
  data: Partial<Omit<PatientGoal, 'id' | 'patientId' | 'createdAt'>>
): Promise<PatientGoal> {
  try {
    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p =>
      p.goals?.some(g => g.id === goalId)
    );

    if (!patient) {
      throw new Error(`Objetivo ${goalId} não encontrado`);
    }

    const goal = patient.goals?.find(g => g.id === goalId);
    if (!goal) {
      throw new Error(`Objetivo ${goalId} não encontrado`);
    }

    // Validar data alvo se estiver sendo atualizada
    if (data.targetDate) {
      const targetDate = new Date(data.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isBefore(targetDate, today)) {
        throw new Error('Data alvo não pode ser no passado');
      }
    }

    const updatedGoal: PatientGoal = {
      ...goal,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updatedGoals = patient.goals?.map(g =>
      g.id === goalId ? updatedGoal : g
    ) || [];

    await patientService.updatePatient(patient.id, {
      goals: updatedGoals,
    });

    return updatedGoal;
  } catch (error) {
    console.error('Erro ao atualizar objetivo:', error);
    throw error;
  }
}

/**
 * Remove um objetivo
 */
export async function deleteGoal(goalId: string): Promise<void> {
  try {
    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p =>
      p.goals?.some(g => g.id === goalId)
    );

    if (!patient) {
      throw new Error(`Objetivo ${goalId} não encontrado`);
    }

    const updatedGoals = patient.goals?.filter(g => g.id !== goalId) || [];

    await patientService.updatePatient(patient.id, {
      goals: updatedGoals,
    });
  } catch (error) {
    console.error('Erro ao deletar objetivo:', error);
    throw error;
  }
}

/**
 * Marca objetivo como concluído
 */
export async function markGoalCompleted(goalId: string): Promise<PatientGoal> {
  return updateGoalProgress(goalId, 100);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calcula countdown para data alvo
 */
export function calculateCountdown(targetDate: string): {
  days: number;
  formatted: string;
  isOverdue: boolean;
  isUrgent: boolean; // < 7 dias
} {
  try {
    const target = new Date(targetDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);

    const days = differenceInDays(target, now);
    const isOverdue = days < 0;
    const isUrgent = days >= 0 && days <= 7;

    let formatted: string;
    if (isOverdue) {
      formatted = `Atrasado há ${Math.abs(days)} dia${Math.abs(days) !== 1 ? 's' : ''}`;
    } else if (days === 0) {
      formatted = 'Hoje!';
    } else if (days === 1) {
      formatted = 'Amanhã';
    } else if (days <= 30) {
      formatted = `${days} dias restantes`;
    } else if (days <= 365) {
      const weeks = Math.floor(days / 7);
      formatted = `${weeks} semana${weeks !== 1 ? 's' : ''} restantes`;
    } else {
      const years = Math.floor(days / 365);
      const remainingDays = days % 365;
      formatted = `${years} ano${years !== 1 ? 's' : ''} e ${remainingDays} dias`;
    }

    return {
      days,
      formatted,
      isOverdue,
      isUrgent,
    };
  } catch (error) {
    console.error('Erro ao calcular countdown:', error);
    return {
      days: 0,
      formatted: 'Data inválida',
      isOverdue: false,
      isUrgent: false,
    };
  }
}

/**
 * Formata informações do objetivo para exibição
 */
export function formatGoalInfo(goal: PatientGoal): {
  countdown?: ReturnType<typeof calculateCountdown>;
  progressText: string;
  statusText: string;
  priorityColor: string;
  statusColor: string;
} {
  const countdown = goal.targetDate ? calculateCountdown(goal.targetDate) : undefined;
  
  const progressText = goal.currentValue
    ? `${goal.currentValue} / ${goal.targetValue || '?'}`
    : `${goal.currentProgress || 0}%`;

  const statusTexts: Record<PatientGoal['status'], string> = {
    active: 'Ativo',
    completed: 'Concluído',
    paused: 'Pausado',
    cancelled: 'Cancelado',
    archived: 'Arquivado',
  };

  const priorityColors: Record<PatientGoal['priority'], string> = {
    low: 'bg-gray-100 text-gray-800',
    medium: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  const statusColors: Record<PatientGoal['status'], string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    paused: 'bg-yellow-100 text-yellow-800',
    cancelled: 'bg-gray-100 text-gray-800',
    archived: 'bg-slate-100 text-slate-800',
  };

  return {
    countdown,
    progressText,
    statusText: statusTexts[goal.status],
    priorityColor: priorityColors[goal.priority],
    statusColor: statusColors[goal.status],
  };
}

/**
 * Filtra objetivos ativos
 */
export async function getActiveGoals(patientId: string): Promise<PatientGoal[]> {
  try {
    const goals = await getGoalsByPatientId(patientId);
    return goals.filter(g => g.status === 'active');
  } catch (error) {
    console.error('Erro ao buscar objetivos ativos:', error);
    return [];
  }
}

/**
 * Filtra objetivos próximos do vencimento
 */
export async function getUpcomingGoals(patientId: string, daysAhead = 30): Promise<PatientGoal[]> {
  try {
    const goals = await getActiveGoals(patientId);
    const futureDate = addDays(new Date(), daysAhead);

    return goals.filter(g => {
      if (!g.targetDate) return false;
      const targetDate = new Date(g.targetDate);
      return isAfter(targetDate, new Date()) && isBefore(targetDate, futureDate);
    });
  } catch (error) {
    console.error('Erro ao buscar objetivos próximos:', error);
    return [];
  }
}

/**
 * Filtra objetivos atrasados
 */
export async function getOverdueGoals(patientId: string): Promise<PatientGoal[]> {
  try {
    const goals = await getActiveGoals(patientId);
    const now = new Date();

    return goals.filter(g => {
      if (!g.targetDate) return false;
      const targetDate = new Date(g.targetDate);
      return isBefore(targetDate, now);
    });
  } catch (error) {
    console.error('Erro ao buscar objetivos atrasados:', error);
    return [];
  }
}

/**
 * Ordena objetivos por prioridade e data
 */
export function sortGoalsByPriorityAndDate(goals: PatientGoal[]): PatientGoal[] {
  const priorityOrder: Record<PatientGoal['priority'], number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  return [...goals].sort((a, b) => {
    // Primeiro por prioridade
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Depois por data alvo (mais próximo primeiro)
    if (a.targetDate && b.targetDate) {
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    }
    if (a.targetDate) return -1;
    if (b.targetDate) return 1;

    return 0;
  });
}

