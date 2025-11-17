import { createServerComponentClient } from '~/lib/supabase/server';
import { ExerciseService } from './exerciseService';

/**
 * Service para gerenciar biblioteca de exercícios
 * Adaptado para Next.js App Router
 */
export class ExerciseLibraryService {
  /**
   * Obtém dados completos da biblioteca (exercícios e categorias)
   */
  static async getLibraryData() {
    try {
      const [exercisesResult, categoriesResult] = await Promise.all([
        ExerciseService.getExercises(),
        ExerciseService.getCategories(),
      ]);

      return {
        data: {
          exercises: exercisesResult.data || [],
          categories: categoriesResult.data || [],
        },
        error: exercisesResult.error || categoriesResult.error || null,
      };
    } catch (error) {
      console.error('Error fetching library data:', error);
      return { data: null, error };
    }
  }

  /**
   * Busca exercícios na biblioteca
   */
  static async searchExercises(query: string) {
    try {
      return await ExerciseService.getExercises({ search: query });
    } catch (error) {
      console.error('Error searching exercises:', error);
      return { data: null, error };
    }
  }

  /**
   * Obtém exercícios agrupados por categoria
   */
  static async getExercisesByCategory() {
    try {
      const supabase = await createServerComponentClient();
      const { data, error } = await supabase
        .from('exercises_library')
        .select('*')
        .order('category', { ascending: true })
        .order('name', { ascending: true });

      if (error) throw error;

      // Agrupar por categoria
      const grouped = (data || []).reduce((acc: any, exercise: any) => {
        const category = exercise.category || 'Sem Categoria';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(exercise);
        return acc;
      }, {});

      return { data: grouped, error: null };
    } catch (error) {
      console.error('Error grouping exercises by category:', error);
      return { data: null, error };
    }
  }
}

