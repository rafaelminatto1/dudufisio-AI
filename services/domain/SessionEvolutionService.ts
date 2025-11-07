/**
 * SessionEvolutionService - Lógica de negócio para evoluções de sessão
 * Usa SessionEvolutionRepository para acesso ao banco
 * Contém validações, transformações e regras de negócio
 */

import { 
  sessionEvolutionRepository, 
  type SessionEvolutionFilters,
  type SessionEvolutionWithExercises 
} from '../repositories/SessionEvolutionRepository';
import { evolutionPrescribedExerciseRepository } from '../repositories/EvolutionPrescribedExerciseRepository';
import type { SessionEvolution } from '@/types';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';
import { generatePlanText } from '@/lib/evolution/conductsFormatter';
import type { Conduct } from '@/types/conducts';

type SessionEvolutionRow = Database['public']['Tables']['session_evolutions']['Row'];
type SessionEvolutionInsert = Database['public']['Tables']['session_evolutions']['Insert'];

export class SessionEvolutionService {
  /**
   * Busca evoluções por paciente
   */
  async getByPatient(patientId: string): Promise<SessionEvolution[]> {
    return withSupabaseQuery(
      async () => {
        const evolutions = await sessionEvolutionRepository.findByPatientId(patientId);
        return evolutions.map(e => this.transformToSessionEvolution(e));
      },
      {
        operation: 'getByPatient',
        fallbackMessage: 'Erro ao buscar evoluções do paciente',
      }
    );
  }

  /**
   * Busca evolução por session_id
   */
  async getBySession(sessionId: string): Promise<SessionEvolution | null> {
    return withSupabaseQuery(
      async () => {
        const evolution = await sessionEvolutionRepository.findBySessionId(sessionId);
        return evolution ? this.transformToSessionEvolution(evolution) : null;
      },
      {
        operation: 'getBySession',
        fallbackMessage: 'Erro ao buscar evolução da sessão',
      }
    );
  }

  /**
   * Busca última evolução do paciente
   */
  async getLatestByPatient(patientId: string): Promise<SessionEvolution | null> {
    return withSupabaseQuery(
      async () => {
        const evolution = await sessionEvolutionRepository.findLatestByPatient(patientId);
        return evolution ? this.transformToSessionEvolution(evolution) : null;
      },
      {
        operation: 'getLatestByPatient',
        fallbackMessage: 'Erro ao buscar última evolução',
      }
    );
  }

  /**
   * Busca evoluções com filtros
   */
  async findMany(filters?: SessionEvolutionFilters): Promise<SessionEvolution[]> {
    return withSupabaseQuery(
      async () => {
        const evolutions = await sessionEvolutionRepository.findMany(filters);
        return evolutions.map(e => this.transformToSessionEvolution(e));
      },
      {
        operation: 'findMany',
        fallbackMessage: 'Erro ao buscar evoluções',
      }
    );
  }

  /**
   * Salva evolução de sessão (incluindo exercícios prescritos)
   */
  async save(
    data: Omit<SessionEvolution, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<SessionEvolution> {
    return withSupabaseMutation(
      async () => {
        // Validações
        this.validateSessionEvolution(data);

        // Se houver condutas estruturadas, gerar texto do plano automaticamente
        let planText = data.plan || '';
        if (data.conducts && data.conducts.length > 0) {
          planText = generatePlanText(
            data.conducts as Conduct[],
            data.planGeneralNotes
          );
        }

        // Transformar para formato do DB
        const dbData = this.transformToDbFormat({
          ...data,
          plan: planText,
        });

        let savedEvolution: SessionEvolutionRow;
        const isUpdate = !!(data as any).id;

        if (isUpdate) {
          // Update
          savedEvolution = await sessionEvolutionRepository.update(
            (data as any).id,
            dbData
          );
          secureLogger.info('Evolução atualizada', { 
            evolutionId: (data as any).id 
          });
        } else {
          // Create
          savedEvolution = await sessionEvolutionRepository.create(dbData);
          secureLogger.info('Evolução criada', { 
            sessionId: data.sessionId 
          });
        }

        // Save prescribed exercises in junction table
        if (data.prescribedExercises && data.prescribedExercises.length > 0) {
          const exercisesToSave = data.prescribedExercises.map((ex, index) => ({
            evolution_id: savedEvolution.id,
            exercise_id: ex.exerciseId,
            position: ex.position ?? index,
            sets: ex.sets,
            reps: ex.reps,
            hold_time_seconds: ex.holdTimeSeconds,
            rest_time_seconds: ex.restTimeSeconds,
            intensity: ex.intensity,
            performed: ex.performed,
            pain_score: ex.painScore,
            notes: ex.notes,
          }));

          await evolutionPrescribedExerciseRepository.replaceEvolutionExercises(
            savedEvolution.id,
            exercisesToSave
          );
        }

        // Emitir evento
        eventService.emit('sessions:changed');

        // Fetch the complete evolution with exercises
        const completeEvolution = await sessionEvolutionRepository.findById(savedEvolution.id);
        return this.transformToSessionEvolution(completeEvolution);
      },
      {
        operation: 'save',
        fallbackMessage: 'Erro ao salvar evolução',
      }
    );
  }

  /**
   * Deleta uma evolução
   */
  async delete(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        await sessionEvolutionRepository.delete(id);
        secureLogger.info('Evolução deletada', { evolutionId: id });
        eventService.emit('sessions:changed');
      },
      {
        operation: 'delete',
        fallbackMessage: 'Erro ao deletar evolução',
      }
    );
  }

  /**
   * Valida dados da evolução
   */
  private validateSessionEvolution(evolution: Partial<SessionEvolution>): void {
    if (!evolution.sessionId) {
      throw new Error('Session ID é obrigatório');
    }

    if (!evolution.patientId) {
      throw new Error('Patient ID é obrigatório');
    }

    if (!evolution.subjective && !evolution.objective) {
      throw new Error('Pelo menos Subjetivo ou Objetivo deve ser preenchido');
    }
  }

  /**
   * Transforma SessionEvolutionRow do DB para SessionEvolution da aplicação
   */
  private transformToSessionEvolution(row: SessionEvolutionRow | SessionEvolutionWithExercises): SessionEvolution {
    const withExercises = row as SessionEvolutionWithExercises;
    
    // Transform prescribed exercises from junction table
    const prescribedExercises = (withExercises.evolution_prescribed_exercises || [])
      .sort((a, b) => a.position - b.position)
      .map(pe => ({
        exerciseId: pe.exercise?.id || '',
        exercise: pe.exercise,
        position: pe.position,
        sets: pe.sets,
        reps: pe.reps,
        holdTimeSeconds: pe.hold_time_seconds,
        restTimeSeconds: pe.rest_time_seconds,
        intensity: pe.intensity,
        performed: pe.performed,
        painScore: pe.pain_score,
        notes: pe.notes,
      }));

    return {
      id: row.id,
      sessionId: row.session_id,
      patientId: row.patient_id,
      subjective: row.subjective || '',
      objective: row.objective || '',
      assessment: row.assessment || '',
      plan: row.plan || '',
      conducts: (row.conducts as any) || [],
      planGeneralNotes: row.plan_general_notes || undefined,
      prescribedExercises: prescribedExercises.length > 0 ? prescribedExercises : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  /**
   * Transforma SessionEvolution da aplicação para formato do DB
   */
  private transformToDbFormat(evolution: Partial<SessionEvolution>): Partial<SessionEvolutionInsert> {
    return {
      session_id: evolution.sessionId,
      patient_id: evolution.patientId,
      subjective: evolution.subjective || null,
      objective: evolution.objective || null,
      assessment: evolution.assessment || null,
      plan: evolution.plan || null,
      conducts: evolution.conducts as any || null,
      plan_general_notes: evolution.planGeneralNotes || null,
    };
  }
}

// Singleton instance
export const sessionEvolutionService = new SessionEvolutionService();

