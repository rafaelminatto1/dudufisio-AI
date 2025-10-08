// services/exerciseService.ts
import { supabase } from '../lib/supabase';
import { Exercise } from '../types';

export interface ExerciseServiceExercise {
  id: string;
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  duration_minutes?: number;
  repetitions?: number;
  sets?: number;
  instructions: string[];
  precautions: string[];
  benefits: string[];
  video_url?: string;
  image_urls: string[];
  tags: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExerciseProtocol {
  id: string;
  name: string;
  description: string;
  category: string;
  pathology: string;
  phase: 'acute' | 'subacute' | 'chronic' | 'maintenance';
  exercises: ProtocolExercise[];
  duration_weeks: number;
  frequency_per_week: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ProtocolExercise {
  exercise_id: string;
  exercise: Exercise;
  order: number;
  sets: number;
  repetitions: number;
  duration_seconds?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface CreateExerciseRequest {
  name: string;
  description: string;
  category: string;
  muscle_groups: string[];
  equipment: string[];
  difficulty_level: Exercise['difficulty_level'];
  duration_minutes?: number;
  repetitions?: number;
  sets?: number;
  instructions: string[];
  precautions: string[];
  benefits: string[];
  video_url?: string;
  image_urls: string[];
  tags: string[];
}

export interface UpdateExerciseRequest {
  name?: string;
  description?: string;
  category?: string;
  muscle_groups?: string[];
  equipment?: string[];
  difficulty_level?: Exercise['difficulty_level'];
  duration_minutes?: number;
  repetitions?: number;
  sets?: number;
  instructions?: string[];
  precautions?: string[];
  benefits?: string[];
  video_url?: string;
  image_urls?: string[];
  tags?: string[];
  is_active?: boolean;
}

export interface CreateProtocolRequest {
  name: string;
  description: string;
  category: string;
  pathology: string;
  phase: ExerciseProtocol['phase'];
  exercises: Omit<ProtocolExercise, 'exercise'>[];
  duration_weeks: number;
  frequency_per_week: number;
}

class ExerciseService {
  // Exercise CRUD operations
  async getAllExercises(): Promise<Exercise[]> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      return (data || []).map((exercise: any) => ({
        ...exercise,
        description: exercise.description || '',
        benefits: exercise.benefits || [],
        contraindications: exercise.contraindications || [],
        instructions: exercise.instructions || [],
        equipment: exercise.equipment || [],
        difficulty_level: (exercise.difficulty_level as 'beginner' | 'intermediate' | 'advanced') || 'beginner',
        duration: (exercise as any).duration || 0,
        repetitions: (exercise as any).repetitions || 0,
        sets: (exercise as any).sets || 0,
        rest_time: (exercise as any).rest_time || 0,
        video_url: exercise.video_url || '',
        image_urls: exercise.image_urls || [],
        muscle_groups: exercise.muscle_groups || [],
        tags: exercise.tags || [],
        created_at: exercise.created_at || new Date().toISOString(),
        updated_at: exercise.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.warn('⚠️ Erro ao buscar exercícios do Supabase, usando dados mock:', error);
      // Fallback para dados mock em caso de erro
      return this.getMockExercises();
    }
  }

  async getExerciseById(id: string): Promise<Exercise | null> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        description: data.description || '',
        benefits: data.benefits || [],
        contraindications: data.contraindications || [],
        instructions: data.instructions || [],
        equipment: data.equipment || [],
        difficulty_level: data.difficulty_level || 'beginner',
        duration: (data as any).duration || 0,
        repetitions: (data as any).repetitions || 0,
        sets: (data as any).sets || 0,
        rest_time: (data as any).rest_time || 0,
        video_url: data.video_url || '',
        image_urls: data.image_urls || [],
        muscle_groups: data.muscle_groups || [],
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      } : null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar exercício por ID do Supabase, usando dados mock:', error);
      // Fallback para dados mock em caso de erro
      const mockExercises = this.getMockExercises();
      return mockExercises.find(ex => ex.id === id) || null;
    }
  }

  async getExerciseByName(name: string): Promise<Exercise | null> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        description: data.description || '',
        benefits: data.benefits || [],
        contraindications: data.contraindications || [],
        instructions: data.instructions || [],
        equipment: data.equipment || [],
        difficulty_level: data.difficulty_level || 'beginner',
        duration: (data as any).duration || 0,
        repetitions: (data as any).repetitions || 0,
        sets: (data as any).sets || 0,
        rest_time: (data as any).rest_time || 0,
        video_url: data.video_url || '',
        image_urls: data.image_urls || [],
        muscle_groups: data.muscle_groups || [],
        created_at: data.created_at || new Date().toISOString(),
        updated_at: data.updated_at || new Date().toISOString()
      } : null;
    } catch (error) {
      console.warn('⚠️ Erro ao buscar exercício por nome do Supabase, usando dados mock:', error);
      // Fallback para dados mock
      const mockExercises = this.getMockExercises();
      return mockExercises.find(ex => ex.name === name) || null;
    }
  }

  async createExercise(exerciseData: CreateExerciseRequest): Promise<Exercise> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert([{
          ...exerciseData,
          is_active: true,
        }])
        .select()
        .single();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Erro ao criar exercício:', error);
      throw error;
    }
  }

  async updateExercise(id: string, exerciseData: UpdateExerciseRequest): Promise<Exercise> {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .update({
          ...exerciseData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data as any;
    } catch (error) {
      console.error('Erro ao atualizar exercício:', error);
      throw error;
    }
  }

  async deleteExercise(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Erro ao deletar exercício:', error);
      throw error;
    }
  }

  // Mock data for demonstration
  getMockExercises(): Exercise[] {
    return [
      {
        id: '1',
        name: 'Flexão de Braço',
        description: 'Exercício para fortalecimento dos músculos do peitoral, tríceps e deltoides.',
        category: 'Fortalecimento',
        bodyParts: ['Peitoral', 'Tríceps', 'Deltoides'],
        difficulty: 2,
        equipment: ['Corpo'],
        instructions: [
          'Deite-se de bruços no chão',
          'Coloque as mãos no chão na largura dos ombros',
          'Mantenha o corpo reto',
          'Empurre o corpo para cima'
        ],
        media: {
          videoUrl: 'https://www.youtube.com/watch?v=IODxDxX7oi4',
          thumbnailUrl: 'https://images.pexels.com/photos/1552242/pexels-photo-1552242.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
          duration: 300
        },
        contraindications: ['Não arquear as costas', 'Manter o core contraído'],
        indications: ['Fortalece peitoral', 'Melhora estabilidade do core'],
        modifications: {
          easier: 'Apoiar os joelhos no chão',
          harder: 'Adicionar elevação dos pés'
        }
      },
      {
        id: '2',
        name: 'Agachamento',
        description: 'Exercício fundamental para fortalecimento dos membros inferiores.',
        category: 'Fortalecimento',
        bodyParts: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
        difficulty: 1,
        equipment: ['Corpo'],
        instructions: [
          'Fique em pé com os pés na largura dos quadris',
          'Flexione os joelhos como se fosse sentar',
          'Mantenha as costas retas',
          'Retorne à posição inicial'
        ],
        media: {
          videoUrl: 'https://www.youtube.com/watch?v=YaXPRqUwItQ',
          thumbnailUrl: 'https://images.pexels.com/photos/6456272/pexels-photo-6456272.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=750&w=1260',
          duration: 300
        },
        contraindications: ['Não deixar os joelhos ultrapassarem os pés', 'Manter o peso nos calcanhares'],
        indications: ['Fortalece pernas', 'Melhora equilíbrio', 'Funcional'],
        modifications: {
          easier: 'Usar apoio para sentar',
          harder: 'Adicionar salto no final'
        }
      }
    ];
  }
}

export const exerciseService = new ExerciseService();

// Export getExerciseByName as standalone function for compatibility
export const getExerciseByName = (name: string) => exerciseService.getExerciseByName(name);

export default exerciseService;