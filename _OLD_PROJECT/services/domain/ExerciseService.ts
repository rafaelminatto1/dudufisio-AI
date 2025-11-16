/**
 * ExerciseService - Lógica de negócio para exercícios terapêuticos
 * Usa ExerciseRepository para acesso ao banco
 * Contém validações, transformações e regras de negócio
 */

import { exerciseRepository, type ExerciseFilters } from '../repositories/ExerciseRepository';
import type { Exercise } from '@/types';
import type { Database } from '@/types/supabase';
import { eventService } from '../eventService';
import { secureLogger } from '@/lib/secureLogger';
import { withSupabaseQuery, withSupabaseMutation } from '@/lib/supabase/errorHandler';

type ExerciseRow = Database['public']['Tables']['exercises']['Row'];
type ExerciseInsert = Database['public']['Tables']['exercises']['Insert'];

export class ExerciseService {
  /**
   * Busca todos os exercícios com filtros opcionais
   */
  async getAll(filters?: ExerciseFilters): Promise<Exercise[]> {
    return withSupabaseQuery(
      async () => {
        const exercises = await exerciseRepository.findMany(filters);
        return exercises.map(e => this.transformToExercise(e));
      },
      {
        operation: 'getAll',
        fallbackMessage: 'Erro ao buscar exercícios',
      }
    );
  }

  /**
   * Busca exercício por ID
   */
  async getById(id: string): Promise<Exercise | null> {
    return withSupabaseQuery(
      async () => {
        const exercise = await exerciseRepository.findById(id);
        return exercise ? this.transformToExercise(exercise) : null;
      },
      {
        operation: 'getById',
        fallbackMessage: 'Erro ao buscar exercício',
      }
    );
  }

  /**
   * Busca exercícios por categoria
   */
  async getByCategory(category: string): Promise<Exercise[]> {
    return withSupabaseQuery(
      async () => {
        const exercises = await exerciseRepository.findByCategory(category);
        return exercises.map(e => this.transformToExercise(e));
      },
      {
        operation: 'getByCategory',
        fallbackMessage: 'Erro ao buscar exercícios da categoria',
      }
    );
  }

  /**
   * Busca exercícios por dificuldade
   */
  async getByDifficulty(difficulty: string): Promise<Exercise[]> {
    return withSupabaseQuery(
      async () => {
        const exercises = await exerciseRepository.findByDifficulty(difficulty);
        return exercises.map(e => this.transformToExercise(e));
      },
      {
        operation: 'getByDifficulty',
        fallbackMessage: 'Erro ao buscar exercícios por dificuldade',
      }
    );
  }

  /**
   * Busca exercícios ativos
   */
  async getActive(): Promise<Exercise[]> {
    return withSupabaseQuery(
      async () => {
        const exercises = await exerciseRepository.findActive();
        return exercises.map(e => this.transformToExercise(e));
      },
      {
        operation: 'getActive',
        fallbackMessage: 'Erro ao buscar exercícios ativos',
      }
    );
  }

  /**
   * Busca exercícios por grupo muscular
   */
  async getByMuscleGroup(muscleGroup: string): Promise<Exercise[]> {
    return withSupabaseQuery(
      async () => {
        const exercises = await exerciseRepository.findByMuscleGroup(muscleGroup);
        return exercises.map(e => this.transformToExercise(e));
      },
      {
        operation: 'getByMuscleGroup',
        fallbackMessage: 'Erro ao buscar exercícios por grupo muscular',
      }
    );
  }

  /**
   * Busca textual
   */
  async search(query: string): Promise<Exercise[]> {
    return withSupabaseQuery(
      async () => {
        const exercises = await exerciseRepository.search(query);
        return exercises.map(e => this.transformToExercise(e));
      },
      {
        operation: 'search',
        fallbackMessage: 'Erro ao buscar exercícios',
      }
    );
  }

  /**
   * Busca protocolos de exercícios
   */
  async getProtocols(filters?: { pathology?: string }): Promise<any[]> {
    return withSupabaseQuery(
      async () => {
        return exerciseRepository.findProtocols(filters);
      },
      {
        operation: 'getProtocols',
        fallbackMessage: 'Erro ao buscar protocolos',
      }
    );
  }

  /**
   * Cria ou atualiza um exercício
   */
  async save(exerciseData: Exercise): Promise<Exercise> {
    return withSupabaseMutation(
      async () => {
        // Validações de negócio
        this.validateExercise(exerciseData);

        // Transformar para formato do DB
        const dbData = this.transformToDbFormat(exerciseData);

        let savedExercise: ExerciseRow;

        if (exerciseData.id) {
          // Update
          savedExercise = await exerciseRepository.update(exerciseData.id, dbData);
          secureLogger.info('Exercício atualizado', { exerciseId: exerciseData.id });
        } else {
          // Create
          savedExercise = await exerciseRepository.create(dbData);
          secureLogger.info('Exercício criado', { exerciseId: savedExercise.id });
        }

        // Emitir evento para invalidar cache
        eventService.emit('exercises:changed');

        return this.transformToExercise(savedExercise);
      },
      {
        operation: 'save',
        fallbackMessage: 'Erro ao salvar exercício',
      }
    );
  }

  /**
   * Deleta um exercício
   */
  async delete(id: string): Promise<void> {
    return withSupabaseMutation(
      async () => {
        await exerciseRepository.delete(id);
        secureLogger.info('Exercício deletado', { exerciseId: id });
        eventService.emit('exercises:changed');
      },
      {
        operation: 'delete',
        fallbackMessage: 'Erro ao deletar exercício',
      }
    );
  }

  /**
   * Valida dados do exercício
   */
  private validateExercise(exercise: Exercise): void {
    if (!exercise.name || exercise.name.trim().length < 3) {
      throw new Error('Nome do exercício é obrigatório (mínimo 3 caracteres)');
    }

    if (!exercise.category) {
      throw new Error('Categoria é obrigatória');
    }

    if (!exercise.difficulty_level) {
      throw new Error('Nível de dificuldade é obrigatório');
    }

    const validDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!validDifficulties.includes(exercise.difficulty_level)) {
      throw new Error('Nível de dificuldade inválido');
    }
  }

  /**
   * Transforma ExerciseRow do DB para Exercise da aplicação
   */
  private transformToExercise(row: ExerciseRow): Exercise {
    return {
      id: row.id,
      name: row.name,
      description: row.description || '',
      category: row.category,
      muscle_groups: (row.muscle_groups as string[]) || [],
      equipment: (row.equipment as string[]) || [],
      difficulty_level: (row.difficulty_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
      duration_minutes: row.duration_minutes || undefined,
      repetitions: row.repetitions || undefined,
      sets: row.sets || undefined,
      instructions: (row.instructions as string[]) || [],
      precautions: (row.precautions as string[]) || [],
      benefits: (row.benefits as string[]) || [],
      video_url: row.video_url || undefined,
      image_urls: (row.image_urls as string[]) || [],
      tags: (row.tags as string[]) || [],
      is_active: row.is_active !== false,
      created_by: row.created_by || undefined,
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  }

  /**
   * Transforma Exercise da aplicação para formato do DB
   */
  private transformToDbFormat(exercise: Exercise): Partial<ExerciseInsert> {
    return {
      name: exercise.name,
      description: exercise.description || null,
      category: exercise.category,
      muscle_groups: exercise.muscle_groups || null,
      equipment: exercise.equipment || null,
      difficulty_level: exercise.difficulty_level,
      duration_minutes: exercise.duration_minutes || null,
      repetitions: exercise.repetitions || null,
      sets: exercise.sets || null,
      instructions: exercise.instructions || null,
      precautions: exercise.precautions || null,
      benefits: exercise.benefits || null,
      video_url: exercise.video_url || null,
      image_urls: exercise.image_urls || null,
      tags: exercise.tags || null,
      is_active: exercise.is_active !== false,
      created_by: exercise.created_by || null,
    };
  }
}

// Singleton instance
export const exerciseService = new ExerciseService();

