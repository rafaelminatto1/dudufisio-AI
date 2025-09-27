// services/exerciseService.ts
import { supabase } from '../lib/supabase';

export interface Exercise {
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
      return data || [];
    } catch (error) {
      console.error('Erro ao buscar exercícios:', error);
      throw error;
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
      return data;
    } catch (error) {
      console.error('Erro ao buscar exercício:', error);
      throw error;
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
      return data;
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
      return data;
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
        muscle_groups: ['Peitoral', 'Tríceps', 'Deltoides'],
        equipment: ['Corpo'],
        difficulty_level: 'intermediate',
        duration_minutes: 5,
        repetitions: 15,
        sets: 3,
        instructions: [
          'Deite-se de bruços no chão',
          'Coloque as mãos no chão na largura dos ombros',
          'Mantenha o corpo reto',
          'Empurre o corpo para cima'
        ],
        precautions: ['Não arquear as costas', 'Manter o core contraído'],
        benefits: ['Fortalece peitoral', 'Melhora estabilidade do core'],
        video_url: '',
        image_urls: [],
        tags: ['fortalecimento', 'casa', 'básico'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Agachamento',
        description: 'Exercício fundamental para fortalecimento dos membros inferiores.',
        category: 'Fortalecimento',
        muscle_groups: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
        equipment: ['Corpo'],
        difficulty_level: 'beginner',
        duration_minutes: 5,
        repetitions: 20,
        sets: 3,
        instructions: [
          'Fique em pé com os pés na largura dos quadris',
          'Flexione os joelhos como se fosse sentar',
          'Mantenha as costas retas',
          'Retorne à posição inicial'
        ],
        precautions: ['Não deixar os joelhos ultrapassarem os pés', 'Manter o peso nos calcanhares'],
        benefits: ['Fortalece pernas', 'Melhora equilíbrio', 'Funcional'],
        video_url: '',
        image_urls: [],
        tags: ['fortalecimento', 'pernas', 'funcional'],
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    ];
  }
}

export const exerciseService = new ExerciseService();
export default exerciseService;