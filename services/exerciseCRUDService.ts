import { supabase } from '@/lib/supabaseClient';
import { Exercise } from '@/types';

export class ExerciseCRUDService {
  /**
   * Get all exercises with optional filters
   */
  static async getAll(filters?: {
    category?: string;
    difficulty?: number[];
    bodyParts?: string[];
    equipment?: string[];
    search?: string;
  }): Promise<Exercise[]> {
    let query = supabase
      .from('exercises')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.category) {
      query = query.eq('category', filters.category);
    }

    if (filters?.difficulty && filters.difficulty.length === 2) {
      const [min, max] = filters.difficulty;
      query = query.gte('difficulty', min).lte('difficulty', max);
    }

    if (filters?.bodyParts && filters.bodyParts.length > 0) {
      query = query.overlaps('body_parts', filters.bodyParts);
    }

    if (filters?.equipment && filters.equipment.length > 0) {
      query = query.overlaps('equipment', filters.equipment);
    }

    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Get exercise by ID
   */
  static async getById(id: string): Promise<Exercise | null> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Create a new exercise
   */
  static async create(exercise: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .insert([exercise])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update an exercise
   */
  static async update(id: string, exercise: Partial<Exercise>): Promise<Exercise> {
    const { data, error } = await supabase
      .from('exercises')
      .update(exercise)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Delete an exercise
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase.from('exercises').delete().eq('id', id);

    if (error) throw error;
  }

  /**
   * Get exercises by category
   */
  static async getByCategory(category: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .eq('category', category)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Get exercises by body part
   */
  static async getByBodyPart(bodyPart: string): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .contains('body_parts', [bodyPart])
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Search exercises
   */
  static async search(query: string, limit: number = 20): Promise<Exercise[]> {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Get popular exercises
   */
  static async getPopular(limit: number = 10): Promise<Exercise[]> {
    // TODO: Implement usage tracking
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .limit(limit);

    if (error) throw error;
    return data || [];
  }
}

