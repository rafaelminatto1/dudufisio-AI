/**
 * EvolutionPrescribedExerciseRepository - Repository for evolution_prescribed_exercises junction table
 * Manages the relationship between session_evolutions and exercises
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type EvolutionPrescribedExerciseRow = Database['public']['Tables']['evolution_prescribed_exercises']['Row'];
type EvolutionPrescribedExerciseInsert = Database['public']['Tables']['evolution_prescribed_exercises']['Insert'];
type EvolutionPrescribedExerciseUpdate = Database['public']['Tables']['evolution_prescribed_exercises']['Update'];

export interface EvolutionPrescribedExerciseWithExercise extends EvolutionPrescribedExerciseRow {
  exercise?: Database['public']['Tables']['exercises']['Row'];
}

export class EvolutionPrescribedExerciseRepository extends BaseRepository<
  EvolutionPrescribedExerciseRow,
  EvolutionPrescribedExerciseInsert,
  EvolutionPrescribedExerciseUpdate
> {
  protected tableName = 'evolution_prescribed_exercises';

  /**
   * Find all exercises for a specific evolution (with exercise details)
   */
  async findByEvolution(
    evolutionId: string,
    options?: QueryOptions
  ): Promise<EvolutionPrescribedExerciseWithExercise[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('evolution_id', evolutionId)
      .order('position', { ascending: true });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByEvolution');
  }

  /**
   * Find all exercises for an evolution (IDs only)
   */
  async findByEvolutionSimple(
    evolutionId: string,
    options?: QueryOptions
  ): Promise<EvolutionPrescribedExerciseRow[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('evolution_id', evolutionId)
      .order('position', { ascending: true });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByEvolutionSimple');
  }

  /**
   * Find all evolutions where an exercise was prescribed
   */
  async findByExercise(
    exerciseId: string,
    options?: QueryOptions
  ): Promise<EvolutionPrescribedExerciseRow[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByExercise');
  }

  /**
   * Find exercises for a patient across all evolutions
   */
  async findByPatient(
    patientId: string,
    options?: QueryOptions
  ): Promise<EvolutionPrescribedExerciseWithExercise[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        exercise:exercises (*),
        evolution:session_evolutions!inner (
          patient_id
        )
      `)
      .eq('evolution.patient_id', patientId)
      .order('created_at', { ascending: false });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByPatient');
  }

  /**
   * Create multiple evolution exercises at once
   */
  async createMany(
    exercises: Omit<EvolutionPrescribedExerciseInsert, 'id' | 'created_at'>[]
  ): Promise<EvolutionPrescribedExerciseRow[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .insert(exercises)
      .select();

    if (error) {
      this.handleError(error, 'createMany');
    }

    return data || [];
  }

  /**
   * Replace all exercises for an evolution
   * Deletes existing and creates new ones
   */
  async replaceEvolutionExercises(
    evolutionId: string,
    exercises: Omit<EvolutionPrescribedExerciseInsert, 'id' | 'evolution_id' | 'created_at'>[]
  ): Promise<EvolutionPrescribedExerciseRow[]> {
    // Delete existing exercises
    await this.deleteByEvolution(evolutionId);

    // Create new ones
    const exercisesToInsert = exercises.map((ex, index) => ({
      ...ex,
      evolution_id: evolutionId,
      position: ex.position ?? index,
    }));

    return this.createMany(exercisesToInsert);
  }

  /**
   * Update exercise performance status
   */
  async updatePerformance(
    id: string,
    performed: boolean,
    painScore?: number,
    notes?: string
  ): Promise<EvolutionPrescribedExerciseRow> {
    return this.update(id, {
      performed,
      pain_score: painScore,
      notes,
      updated_at: new Date().toISOString(),
    });
  }

  /**
   * Bulk update performance for multiple exercises
   */
  async updateManyPerformance(
    updates: Array<{
      id: string;
      performed: boolean;
      painScore?: number;
      notes?: string;
    }>
  ): Promise<void> {
    const promises = updates.map(({ id, performed, painScore, notes }) =>
      this.updatePerformance(id, performed, painScore, notes)
    );

    await Promise.all(promises);
  }

  /**
   * Delete all exercises for an evolution
   */
  async deleteByEvolution(evolutionId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('evolution_id', evolutionId);

    if (error) {
      this.handleError(error, 'deleteByEvolution');
    }
  }

  /**
   * Delete specific exercises
   */
  async deleteMany(ids: string[]): Promise<void> {
    if (ids.length === 0) return;

    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .in('id', ids);

    if (error) {
      this.handleError(error, 'deleteMany');
    }
  }

  /**
   * Get exercise completion statistics for a patient
   */
  async getPatientCompletionStats(patientId: string): Promise<{
    totalPrescribed: number;
    totalPerformed: number;
    completionRate: number;
    averagePainScore: number | null;
  }> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        performed,
        pain_score,
        evolution:session_evolutions!inner (
          patient_id
        )
      `)
      .eq('evolution.patient_id', patientId);

    if (error) {
      this.handleError(error, 'getPatientCompletionStats');
    }

    const exercises = data || [];
    const totalPrescribed = exercises.length;
    const totalPerformed = exercises.filter(e => e.performed).length;
    const completionRate = totalPrescribed > 0 
      ? (totalPerformed / totalPrescribed) * 100 
      : 0;

    const painScores = exercises
      .filter(e => e.pain_score !== null && e.pain_score !== undefined)
      .map(e => e.pain_score as number);
    
    const averagePainScore = painScores.length > 0
      ? painScores.reduce((sum, score) => sum + score, 0) / painScores.length
      : null;

    return {
      totalPrescribed,
      totalPerformed,
      completionRate: Math.round(completionRate * 10) / 10,
      averagePainScore: averagePainScore ? Math.round(averagePainScore * 10) / 10 : null,
    };
  }

  /**
   * Get most commonly prescribed exercises for a patient
   */
  async getMostPrescribedExercises(
    patientId: string,
    limit: number = 10
  ): Promise<Array<{
    exerciseId: string;
    exerciseName: string;
    timesPresribed: number;
    completionRate: number;
  }>> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        exercise_id,
        performed,
        exercise:exercises (
          name
        ),
        evolution:session_evolutions!inner (
          patient_id
        )
      `)
      .eq('evolution.patient_id', patientId);

    if (error) {
      this.handleError(error, 'getMostPrescribedExercises');
    }

    // Aggregate by exercise
    const exerciseMap = new Map<string, {
      exerciseId: string;
      exerciseName: string;
      timesPresribed: number;
      timesPerformed: number;
    }>();

    (data || []).forEach(item => {
      const existing = exerciseMap.get(item.exercise_id);
      const exerciseName = (item.exercise as any)?.name || 'Unknown';
      
      if (existing) {
        existing.timesPresribed++;
        if (item.performed) existing.timesPerformed++;
      } else {
        exerciseMap.set(item.exercise_id, {
          exerciseId: item.exercise_id,
          exerciseName,
          timesPresribed: 1,
          timesPerformed: item.performed ? 1 : 0,
        });
      }
    });

    // Convert to array and calculate completion rates
    const results = Array.from(exerciseMap.values())
      .map(ex => ({
        exerciseId: ex.exerciseId,
        exerciseName: ex.exerciseName,
        timesPresribed: ex.timesPresribed,
        completionRate: Math.round((ex.timesPerformed / ex.timesPresribed) * 100),
      }))
      .sort((a, b) => b.timesPresribed - a.timesPresribed)
      .slice(0, limit);

    return results;
  }

  /**
   * Count exercises in an evolution
   */
  async countByEvolution(evolutionId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('evolution_id', evolutionId);

    if (error) {
      this.handleError(error, 'countByEvolution');
    }

    return count || 0;
  }
}

// Singleton instance
export const evolutionPrescribedExerciseRepository = new EvolutionPrescribedExerciseRepository();

