/**
 * Service para integração com ExerciseDB API
 * Importa exercícios de bibliotecas externas
 * Adaptado para Next.js App Router
 */

export interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
  bodyPart: string;
  equipment: string;
  instructions: string[];
  imageUrl?: string;
  videoUrl?: string;
}

/**
 * Service para integração com ExerciseDB API
 */
export class ExerciseDBService {
  private static readonly API_BASE_URL = 'https://exercisedb.p.rapidapi.com';
  private static readonly CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
  private static cache: Map<string, { data: Exercise[]; timestamp: number }> = new Map();

  /**
   * Busca exercícios por parte do corpo
   */
  static async searchByBodyPart(bodyPart: string): Promise<{ data: Exercise[]; error: any }> {
    try {
      const cacheKey = `bodyPart_${bodyPart}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { data: cached, error: null };
      }

      const apiKey = process.env.EXERCISEDB_API_KEY;
      if (!apiKey) {
        console.warn('ExerciseDB API Key não configurada, retornando dados mock');
        return { data: this.getMockExercises(), error: null };
      }

      const response = await fetch(
        `${this.API_BASE_URL}/exercises/bodyPart/${bodyPart}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ExerciseDB API error: ${response.statusText}`);
      }

      const data: ExerciseDBExercise[] = await response.json();
      const exercises = data.map(this.transformToExercise);

      this.setCache(cacheKey, exercises);
      return { data: exercises, error: null };
    } catch (error) {
      console.error('Error fetching exercises by body part:', error);
      return { data: this.getMockExercises(), error };
    }
  }

  /**
   * Busca exercícios por equipamento
   */
  static async searchByEquipment(equipment: string): Promise<{ data: Exercise[]; error: any }> {
    try {
      const cacheKey = `equipment_${equipment}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { data: cached, error: null };
      }

      const apiKey = process.env.EXERCISEDB_API_KEY;
      if (!apiKey) {
        return { data: this.getMockExercises(), error: null };
      }

      const response = await fetch(
        `${this.API_BASE_URL}/exercises/equipment/${equipment}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ExerciseDB API error: ${response.statusText}`);
      }

      const data: ExerciseDBExercise[] = await response.json();
      const exercises = data.map(this.transformToExercise);

      this.setCache(cacheKey, exercises);
      return { data: exercises, error: null };
    } catch (error) {
      console.error('Error fetching exercises by equipment:', error);
      return { data: [], error };
    }
  }

  /**
   * Busca exercícios por nome
   */
  static async searchByName(name: string): Promise<{ data: Exercise[]; error: any }> {
    try {
      const cacheKey = `name_${name}`;
      const cached = this.getCached(cacheKey);
      if (cached) {
        return { data: cached, error: null };
      }

      const apiKey = process.env.EXERCISEDB_API_KEY;
      if (!apiKey) {
        return { data: this.getMockExercises(), error: null };
      }

      const response = await fetch(
        `${this.API_BASE_URL}/exercises/name/${name}`,
        {
          headers: {
            'X-RapidAPI-Key': apiKey,
            'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`ExerciseDB API error: ${response.statusText}`);
      }

      const data: ExerciseDBExercise[] = await response.json();
      const exercises = data.map(this.transformToExercise);

      this.setCache(cacheKey, exercises);
      return { data: exercises, error: null };
    } catch (error) {
      console.error('Error fetching exercises by name:', error);
      return { data: [], error };
    }
  }

  /**
   * Transforma exercício do ExerciseDB para formato interno
   */
  private static transformToExercise(dbExercise: ExerciseDBExercise): Exercise {
    return {
      id: dbExercise.id,
      name: dbExercise.name,
      description: dbExercise.instructions.join(' '),
      category: dbExercise.bodyPart,
      difficulty: 'medium' as const,
      bodyPart: dbExercise.bodyPart,
      equipment: dbExercise.equipment,
      instructions: dbExercise.instructions,
      imageUrl: dbExercise.gifUrl,
    };
  }

  /**
   * Obtém dados do cache
   */
  private static getCached(key: string): Exercise[] | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  }

  /**
   * Armazena dados no cache
   */
  private static setCache(key: string, data: Exercise[]): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Retorna exercícios mock quando API não está disponível
   */
  private static getMockExercises(): Exercise[] {
    return [
      {
        id: 'mock-1',
        name: 'Flexão de Braço',
        description: 'Exercício para fortalecimento do peitoral e braços',
        category: 'peito',
        difficulty: 'medium',
        bodyPart: 'chest',
        equipment: 'bodyweight',
        instructions: [
          'Deite-se de bruços',
          'Apoie as mãos no chão',
          'Empurre o corpo para cima',
          'Volte à posição inicial',
        ],
      },
      {
        id: 'mock-2',
        name: 'Agachamento',
        description: 'Exercício para fortalecimento das pernas',
        category: 'pernas',
        difficulty: 'easy',
        bodyPart: 'legs',
        equipment: 'bodyweight',
        instructions: [
          'Fique em pé com pés afastados',
          'Flexione os joelhos',
          'Desça até formar 90 graus',
          'Volte à posição inicial',
        ],
      },
    ];
  }
}

