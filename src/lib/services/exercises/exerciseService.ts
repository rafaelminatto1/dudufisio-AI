import { createServerComponentClient } from '~/lib/supabase/server';
import { Database } from '~/types/database.types';

type Exercise = Database['public']['Tables']['exercises_library']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises_library']['Insert'];
type ExerciseUpdate = Database['public']['Tables']['exercises_library']['Update'];

export interface ExerciseFilters {
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  search?: string;
}

/**
 * Service para gerenciar exercícios
 * Adaptado para Next.js App Router
 */
export class ExerciseService {
  /**
   * Lista todos os exercícios com filtros opcionais
   */
  static async getExercises(filters?: ExerciseFilters) {
    try {
      const supabase = await createServerComponentClient();
      let query = supabase
        .from('exercises_library')
        .select('*')
        .order('name', { ascending: true });

      if (filters?.category) {
        query = query.eq('category', filters.category);
      }

      if (filters?.difficulty) {
        query = query.eq('difficulty', filters.difficulty);
      }

      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching exercises:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca um exercício por ID
   */
  static async getExerciseById(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching exercise:', error);
      return { data: null, error };
    }
  }

  /**
   * Cria um novo exercício
   */
  static async createExercise(exercise: ExerciseInsert) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .insert(exercise)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error creating exercise:', error);
      return { data: null, error };
    }
  }

  /**
   * Atualiza um exercício
   */
  static async updateExercise(id: string, updates: ExerciseUpdate) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating exercise:', error);
      return { data: null, error };
    }
  }

  /**
   * Deleta um exercício
   */
  static async deleteExercise(id: string) {
    try {
      const supabase = await createServerComponentClient();
      const { error } = await supabase
        .from('exercises_library')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { data: true, error: null };
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca exercícios por categoria
   */
  static async getExercisesByCategory(category: string) {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching exercises by category:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca exercícios por dificuldade
   */
  static async getExercisesByDifficulty(difficulty: 'easy' | 'medium' | 'hard') {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .eq('difficulty', difficulty)
        .order('name', { ascending: true });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching exercises by difficulty:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém categorias únicas de exercícios
   */
  static async getCategories() {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;

      // Extrair categorias únicas
      const categories = Array.from(new Set((data || []).map((e: any) => e.category).filter(Boolean)));
      return { data: categories, error: null };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { data: null, error };
    }
  }
}

