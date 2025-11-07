/**
 * SessionEvolutionRepository - Repository para evoluções de sessão
 * Responsável por operações de banco de dados relacionadas a session_evolutions
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type SessionEvolutionRow = Database['public']['Tables']['session_evolutions']['Row'];
type SessionEvolutionInsert = Database['public']['Tables']['session_evolutions']['Insert'];
type SessionEvolutionUpdate = Database['public']['Tables']['session_evolutions']['Update'];

export interface SessionEvolutionWithExercises extends SessionEvolutionRow {
  evolution_prescribed_exercises?: Array<{
    id: string;
    position: number;
    sets?: number;
    reps?: number;
    hold_time_seconds?: number;
    rest_time_seconds?: number;
    intensity?: string;
    performed?: boolean;
    pain_score?: number;
    notes?: string;
    exercise?: Database['public']['Tables']['exercises']['Row'];
  }>;
}

export interface SessionEvolutionFilters {
  patientId?: string;
  sessionId?: string;
  startDate?: string | Date;
  endDate?: string | Date;
}

export class SessionEvolutionRepository extends BaseRepository<
  SessionEvolutionRow,
  SessionEvolutionInsert,
  SessionEvolutionUpdate
> {
  protected tableName = 'session_evolutions';

  /**
   * Busca evoluções com filtros (incluindo exercícios prescritos)
   */
  async findMany(
    filters?: SessionEvolutionFilters,
    options?: QueryOptions
  ): Promise<SessionEvolutionWithExercises[]> {
    let query = this.supabase.from(this.tableName).select(`
      *,
      evolution_prescribed_exercises (
        id,
        position,
        sets,
        reps,
        hold_time_seconds,
        rest_time_seconds,
        intensity,
        performed,
        pain_score,
        notes,
        exercise:exercises (*)
      )
    `);

    if (filters?.patientId) {
      query = query.eq('patient_id', filters.patientId);
    }

    if (filters?.sessionId) {
      query = query.eq('session_id', filters.sessionId);
    }

    if (filters?.startDate) {
      const date = typeof filters.startDate === 'string' 
        ? filters.startDate 
        : filters.startDate.toISOString();
      query = query.gte('created_at', date);
    }

    if (filters?.endDate) {
      const date = typeof filters.endDate === 'string' 
        ? filters.endDate 
        : filters.endDate.toISOString();
      query = query.lte('created_at', date);
    }

    query = this.applyOptions(query, options);

    if (!options?.sort) {
      query = query.order('created_at', { ascending: false });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Busca evolução por session_id (incluindo exercícios prescritos)
   */
  async findBySessionId(sessionId: string): Promise<SessionEvolutionWithExercises | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        evolution_prescribed_exercises (
          id,
          position,
          sets,
          reps,
          hold_time_seconds,
          rest_time_seconds,
          intensity,
          performed,
          pain_score,
          notes,
          exercise:exercises (*)
        )
      `)
      .eq('session_id', sessionId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findBySessionId');
    }

    return data;
  }

  /**
   * Busca evoluções de um paciente
   */
  async findByPatientId(
    patientId: string,
    options?: QueryOptions
  ): Promise<SessionEvolutionWithExercises[]> {
    return this.findMany({ patientId }, options);
  }

  /**
   * Busca última evolução do paciente (incluindo exercícios prescritos)
   */
  async findLatestByPatient(patientId: string): Promise<SessionEvolutionWithExercises | null> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        *,
        evolution_prescribed_exercises (
          id,
          position,
          sets,
          reps,
          hold_time_seconds,
          rest_time_seconds,
          intensity,
          performed,
          pain_score,
          notes,
          exercise:exercises (*)
        )
      `)
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      this.handleError(error, 'findLatestByPatient');
    }

    return data;
  }
}

// Singleton instance
export const sessionEvolutionRepository = new SessionEvolutionRepository();

