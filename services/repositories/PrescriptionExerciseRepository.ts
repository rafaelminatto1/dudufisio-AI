/**
 * PrescriptionExerciseRepository - Repository for prescription_exercises junction table
 * Manages the relationship between patient_exercise_prescriptions and exercises
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type PrescriptionExerciseRow = Database['public']['Tables']['prescription_exercises']['Row'];
type PrescriptionExerciseInsert = Database['public']['Tables']['prescription_exercises']['Insert'];
type PrescriptionExerciseUpdate = Database['public']['Tables']['prescription_exercises']['Update'];

export interface PrescriptionExerciseWithExercise extends PrescriptionExerciseRow {
  exercise?: Database['public']['Tables']['exercises']['Row'];
}

export class PrescriptionExerciseRepository extends BaseRepository<
  PrescriptionExerciseRow,
  PrescriptionExerciseInsert,
  PrescriptionExerciseUpdate
> {
  protected tableName = 'prescription_exercises';

  /**
   * Find all exercises for a specific prescription (with exercise details)
   */
  async findByPrescription(
    prescriptionId: string,
    options?: QueryOptions
  ): Promise<PrescriptionExerciseWithExercise[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('prescription_id', prescriptionId)
      .order('position', { ascending: true });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByPrescription');
  }

  /**
   * Find all exercises for a prescription (IDs only)
   */
  async findByPrescriptionSimple(
    prescriptionId: string,
    options?: QueryOptions
  ): Promise<PrescriptionExerciseRow[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('prescription_id', prescriptionId)
      .order('position', { ascending: true });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByPrescriptionSimple');
  }

  /**
   * Find all prescriptions using a specific exercise
   */
  async findByExercise(
    exerciseId: string,
    options?: QueryOptions
  ): Promise<PrescriptionExerciseRow[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('exercise_id', exerciseId)
      .order('created_at', { ascending: false });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByExercise');
  }

  /**
   * Create multiple prescription exercises at once
   */
  async createMany(
    exercises: Omit<PrescriptionExerciseInsert, 'id' | 'created_at'>[]
  ): Promise<PrescriptionExerciseRow[]> {
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
   * Replace all exercises for a prescription
   * Deletes existing and creates new ones
   */
  async replacePrescriptionExercises(
    prescriptionId: string,
    exercises: Omit<PrescriptionExerciseInsert, 'id' | 'prescription_id' | 'created_at'>[]
  ): Promise<PrescriptionExerciseRow[]> {
    // Delete existing exercises
    await this.deleteByPrescription(prescriptionId);

    // Create new ones
    const exercisesToInsert = exercises.map((ex, index) => ({
      ...ex,
      prescription_id: prescriptionId,
      position: ex.position ?? index,
    }));

    return this.createMany(exercisesToInsert);
  }

  /**
   * Update positions of exercises (for reordering)
   */
  async updatePositions(
    updates: Array<{ id: string; position: number }>
  ): Promise<void> {
    const promises = updates.map(({ id, position }) =>
      this.update(id, { position })
    );

    await Promise.all(promises);
  }

  /**
   * Delete all exercises for a prescription
   */
  async deleteByPrescription(prescriptionId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('prescription_id', prescriptionId);

    if (error) {
      this.handleError(error, 'deleteByPrescription');
    }
  }

  /**
   * Delete specific exercises from a prescription
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
   * Check if an exercise is prescribed to any patient
   */
  async isExercisePrescribed(exerciseId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('exercise_id', exerciseId)
      .limit(1);

    if (error) {
      this.handleError(error, 'isExercisePrescribed');
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Count exercises in a prescription
   */
  async countByPrescription(prescriptionId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('prescription_id', prescriptionId);

    if (error) {
      this.handleError(error, 'countByPrescription');
    }

    return count || 0;
  }

  /**
   * Get exercise usage statistics for a patient
   */
  async getPatientExerciseStats(patientId: string): Promise<{
    exerciseId: string;
    totalPrescriptions: number;
  }[]> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select(`
        exercise_id,
        prescription:patient_exercise_prescriptions!inner (
          patient_id
        )
      `)
      .eq('prescription.patient_id', patientId);

    if (error) {
      this.handleError(error, 'getPatientExerciseStats');
    }

    // Aggregate by exercise_id
    const stats = (data || []).reduce((acc, item) => {
      const existing = acc.find(s => s.exerciseId === item.exercise_id);
      if (existing) {
        existing.totalPrescriptions++;
      } else {
        acc.push({ exerciseId: item.exercise_id, totalPrescriptions: 1 });
      }
      return acc;
    }, [] as { exerciseId: string; totalPrescriptions: number }[]);

    return stats;
  }
}

// Singleton instance
export const prescriptionExerciseRepository = new PrescriptionExerciseRepository();

