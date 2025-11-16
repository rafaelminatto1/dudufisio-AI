/**
 * ProtocolExerciseRepository - Repository for protocol_exercises junction table
 * Manages the relationship between exercise_protocols and exercises
 */

import { BaseRepository } from './BaseRepository';
import type { Database } from '@/types/supabase';
import type { QueryOptions } from '../types/RepositoryTypes';

type ProtocolExerciseRow = Database['public']['Tables']['protocol_exercises']['Row'];
type ProtocolExerciseInsert = Database['public']['Tables']['protocol_exercises']['Insert'];
type ProtocolExerciseUpdate = Database['public']['Tables']['protocol_exercises']['Update'];

export interface ProtocolExerciseWithExercise extends ProtocolExerciseRow {
  exercise?: Database['public']['Tables']['exercises']['Row'];
}

export class ProtocolExerciseRepository extends BaseRepository<
  ProtocolExerciseRow,
  ProtocolExerciseInsert,
  ProtocolExerciseUpdate
> {
  protected tableName = 'protocol_exercises';

  /**
   * Find all exercises for a specific protocol (with exercise details)
   */
  async findByProtocol(
    protocolId: string,
    options?: QueryOptions
  ): Promise<ProtocolExerciseWithExercise[]> {
    let query = this.supabase
      .from(this.tableName)
      .select(`
        *,
        exercise:exercises (*)
      `)
      .eq('protocol_id', protocolId)
      .order('position', { ascending: true });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByProtocol');
  }

  /**
   * Find all exercises for a protocol (IDs only)
   */
  async findByProtocolSimple(
    protocolId: string,
    options?: QueryOptions
  ): Promise<ProtocolExerciseRow[]> {
    let query = this.supabase
      .from(this.tableName)
      .select('*')
      .eq('protocol_id', protocolId)
      .order('position', { ascending: true });

    query = this.applyOptions(query, options);

    return this.executeQuery(() => query, 'findByProtocolSimple');
  }

  /**
   * Create multiple protocol exercises at once
   */
  async createMany(
    exercises: Omit<ProtocolExerciseInsert, 'id' | 'created_at'>[]
  ): Promise<ProtocolExerciseRow[]> {
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
   * Replace all exercises for a protocol
   * Deletes existing and creates new ones in a transaction
   */
  async replaceProtocolExercises(
    protocolId: string,
    exercises: Omit<ProtocolExerciseInsert, 'id' | 'protocol_id' | 'created_at'>[]
  ): Promise<ProtocolExerciseRow[]> {
    // Delete existing exercises
    await this.deleteByProtocol(protocolId);

    // Create new ones
    const exercisesToInsert = exercises.map((ex, index) => ({
      ...ex,
      protocol_id: protocolId,
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
    // Update each position
    const promises = updates.map(({ id, position }) =>
      this.update(id, { position })
    );

    await Promise.all(promises);
  }

  /**
   * Delete all exercises for a protocol
   */
  async deleteByProtocol(protocolId: string): Promise<void> {
    const { error } = await this.supabase
      .from(this.tableName)
      .delete()
      .eq('protocol_id', protocolId);

    if (error) {
      this.handleError(error, 'deleteByProtocol');
    }
  }

  /**
   * Delete specific exercises from a protocol
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
   * Check if an exercise is used in any protocol
   */
  async isExerciseUsed(exerciseId: string): Promise<boolean> {
    const { data, error } = await this.supabase
      .from(this.tableName)
      .select('id')
      .eq('exercise_id', exerciseId)
      .limit(1);

    if (error) {
      this.handleError(error, 'isExerciseUsed');
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Count exercises in a protocol
   */
  async countByProtocol(protocolId: string): Promise<number> {
    const { count, error } = await this.supabase
      .from(this.tableName)
      .select('*', { count: 'exact', head: true })
      .eq('protocol_id', protocolId);

    if (error) {
      this.handleError(error, 'countByProtocol');
    }

    return count || 0;
  }
}

// Singleton instance
export const protocolExerciseRepository = new ProtocolExerciseRepository();

