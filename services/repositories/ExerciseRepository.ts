/**
 * ExerciseRepository - Repository para exercícios terapêuticos
 * Responsável por operações de banco de dados relacionadas a exercises
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];
type ExerciseUpdate = Database['public']['Tables']['exercises']['Update'];

export interface ExerciseFilters {
  category?: string;
  difficulty?: string | string[];
  muscleGroups?: string[];
  equipment?: string[];
  isActive?: boolean;
  search?: string;
}

export class ExerciseRepository extends BaseRepository<
  ExerciseRow,
  ExerciseInsert,
  ExerciseUpdate
> {
  protected tableName = 'exercises';

  /**
   * Busca exercícios com filtros
   */
  async findMany(
    filters?: ExerciseFilters,
    options?: QueryOptions
  ): Promise<ExerciseRow[]> {
    let query = this.supabase.from(this.tableName).select('*');

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.difficulty) {
      if (Array.isArray(filters.difficulty)) {
        query = query.in('difficulty_level', filters.difficulty);
      } else {
        query = query.eq('difficulty_level', filters.difficulty);
      }
    }

    if (filters?.muscleGroups && filters.muscleGroups.length > 0) {
      query = query.overlaps('muscle_groups', filters.muscleGroups);
    }

    if (filters?.equipment && filters.equipment.length > 0) {
      query = query.overlaps('equipment', filters.equipment);
    }

    if (filters?.isActive !== undefined) {
      query = query.eq('is_active', filters.isActive);
    }

    if (filters?.search && filters.search.length >= 2) {
      const searchTerm = `%${filters.search}%`;
      query = query.or(
        `name.ilike.${searchTerm},description.ilike.${searchTerm}`
      );
    }

    query = this.applyOptions(query, options);

    if (!options?.sort) {
      query = query.order('name', { ascending: true });
    }

    return this.executeQuery(() => query, 'findMany');
  }

  /**
   * Busca exercícios por categoria
   */
  async findByCategory(
    category: string,
    options?: QueryOptions
  ): Promise<ExerciseRow[]> {
    return this.findMany({ category }, options);
  }

  /**
   * Busca exercícios por dificuldade
   */
  async findByDifficulty(
    difficulty: string,
    options?: QueryOptions
  ): Promise<ExerciseRow[]> {
    return this.findMany({ difficulty }, options);
  }

  /**
   * Busca exercícios ativos
   */
  async findActive(options?: QueryOptions): Promise<ExerciseRow[]> {
    return this.findMany({ isActive: true }, options);
  }

  /**
   * Busca exercícios por grupo muscular
   */
  async findByMuscleGroup(
    muscleGroup: string,
    options?: QueryOptions
  ): Promise<ExerciseRow[]> {
    return this.findMany({ muscleGroups: [muscleGroup] }, options);
  }

  /**
   * Busca textual
   */
  async search(query: string, options?: QueryOptions): Promise<ExerciseRow[]> {
    if (query.length < 2) {
      return [];
    }

    return this.findMany({ search: query }, options);
  }

  /**
   * Busca protocolos de exercícios com seus exercícios relacionados
   */
  async findProtocols(filters?: { pathology?: string }): Promise<any[]> {
    let query = this.supabase
      .from('exercise_protocols')
      .select(`
        *,
        protocol_exercises (
          id,
          position,
          sets,
          reps,
          hold_time_seconds,
          rest_time_seconds,
          frequency_per_week,
          intensity,
          notes,
          exercise:exercises (*)
        )
      `)
      .order('name', { ascending: true });

    if (filters?.pathology) {
      query = query.eq('pathology', filters.pathology);
    }

    const { data, error } = await query;

    if (error) {
      this.handleError(error, 'findProtocols');
    }

    // Transform data to include exercises array sorted by position
    const protocols = (data || []).map(protocol => ({
      ...protocol,
      exercises: (protocol.protocol_exercises || [])
        .sort((a: any, b: any) => a.position - b.position)
        .map((pe: any) => ({
          exerciseId: pe.exercise?.id,
          exercise: pe.exercise,
          position: pe.position,
          sets: pe.sets,
          reps: pe.reps,
          holdTimeSeconds: pe.hold_time_seconds,
          restTimeSeconds: pe.rest_time_seconds,
          frequencyPerWeek: pe.frequency_per_week,
          intensity: pe.intensity,
          notes: pe.notes,
        })),
    }));

    return protocols;
  }
}

// Singleton instance
export const exerciseRepository = new ExerciseRepository();

