/**
 * Serviço de Integração com ExerciseDB API
 * Importa exercícios de bibliotecas externas
 */

import { Exercise } from '../../types/exercise';

const EXERCISEDB_API_KEY = import.meta.env.VITE_EXERCISEDB_API_KEY || '';
const EXERCISEDB_BASE_URL = 'https://exercisedb.p.rapidapi.com';

interface ExerciseDBExercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  secondaryMuscles: string[];
  instructions: string[];
}

class ExerciseDBService {
  private headers = {
    'X-RapidAPI-Key': EXERCISEDB_API_KEY,
    'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com',
  };

  /**
   * Buscar exercícios por parte do corpo
   */
  async searchByBodyPart(bodyPart: string): Promise<Exercise[]> {
    if (!EXERCISEDB_API_KEY) {
      console.warn('ExerciseDB API Key não configurada');
      return this.getMockExercises();
    }

    try {
      const response = await fetch(
        `${EXERCISEDB_BASE_URL}/exercises/bodyPart/${bodyPart}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Erro ao buscar exercícios');

      const data: ExerciseDBExercise[] = await response.json();
      return data.map(this.transformToExercise);
    } catch (error) {
      console.error('Erro ExerciseDB API:', error);
      return this.getMockExercises();
    }
  }

  /**
   * Buscar exercícios por equipamento
   */
  async searchByEquipment(equipment: string): Promise<Exercise[]> {
    if (!EXERCISEDB_API_KEY) {
      return this.getMockExercises();
    }

    try {
      const response = await fetch(
        `${EXERCISEDB_BASE_URL}/exercises/equipment/${equipment}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Erro ao buscar exercícios');

      const data: ExerciseDBExercise[] = await response.json();
      return data.map(this.transformToExercise);
    } catch (error) {
      console.error('Erro ExerciseDB API:', error);
      return [];
    }
  }

  /**
   * Buscar por nome
   */
  async searchByName(name: string): Promise<Exercise[]> {
    if (!EXERCISEDB_API_KEY) {
      return this.getMockExercises();
    }

    try {
      const response = await fetch(
        `${EXERCISEDB_BASE_URL}/exercises/name/${name}`,
        { headers: this.headers }
      );

      if (!response.ok) throw new Error('Erro ao buscar exercícios');

      const data: ExerciseDBExercise[] = await response.json();
      return data.map(this.transformToExercise);
    } catch (error) {
      console.error('Erro ExerciseDB API:', error);
      return [];
    }
  }

  /**
   * Transformar exercício da API para formato interno
   */
  private transformToExercise(apiExercise: ExerciseDBExercise): Partial<Exercise> {
    return {
      name: apiExercise.name,
      description: `Exercício focado em ${apiExercise.target}`,
      category: this.mapBodyPartToCategory(apiExercise.bodyPart),
      difficulty: 'intermediate',
      targetMuscles: [apiExercise.target, ...apiExercise.secondaryMuscles],
      equipment: [this.mapEquipment(apiExercise.equipment)],
      instructions: apiExercise.instructions,
      media: [{
        type: 'image',
        url: apiExercise.gifUrl,
        name: `${apiExercise.name}-demo`,
        thumbnailUrl: apiExercise.gifUrl,
      }],
      source: 'external',
      externalId: apiExercise.id,
      isActive: true,
      isPublic: true,
    };
  }

  /**
   * Mapear parte do corpo para categoria
   */
  private mapBodyPartToCategory(bodyPart: string): string {
    const map: Record<string, string> = {
      'back': 'Fortalecimento',
      'cardio': 'Cardiovascular',
      'chest': 'Fortalecimento',
      'lower arms': 'Fortalecimento',
      'lower legs': 'Fortalecimento',
      'neck': 'Alongamento',
      'shoulders': 'Fortalecimento',
      'upper arms': 'Fortalecimento',
      'upper legs': 'Fortalecimento',
      'waist': 'Core',
    };
    return map[bodyPart.toLowerCase()] || 'Outro';
  }

  /**
   * Mapear equipamento
   */
  private mapEquipment(equipment: string): string {
    const map: Record<string, string> = {
      'body weight': 'Peso corporal',
      'cable': 'Polia',
      'dumbbell': 'Halter',
      'barbell': 'Barra',
      'kettlebell': 'Kettlebell',
      'resistance band': 'Faixa elástica',
      'medicine ball': 'Bola medicinal',
    };
    return map[equipment.toLowerCase()] || equipment;
  }

  /**
   * Exercícios mock para quando API não está disponível
   */
  private getMockExercises(): Exercise[] {
    return [
      {
        id: 'mock-1',
        name: 'Agachamento Livre',
        description: 'Exercício fundamental de fortalecimento de membros inferiores',
        category: 'Fortalecimento',
        difficulty: 'intermediate',
        targetMuscles: ['Quadríceps', 'Glúteos', 'Isquiotibiais'],
        equipment: ['Peso corporal'],
        instructions: [
          'Posicione os pés na largura dos ombros',
          'Desça controladamente flexionando joelhos e quadril',
          'Mantenha o tronco ereto',
          'Retorne à posição inicial',
        ],
        sets: 3,
        reps: 12,
        source: 'internal',
        isActive: true,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        contraindications: [],
        precautions: [],
        benefits: [],
        media: [],
        tags: [],
      } as Exercise,
    ];
  }
}

export const exerciseDBService = new ExerciseDBService();

