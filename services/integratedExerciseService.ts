// services/integratedExerciseService.ts
import React from 'react';
import { Exercise } from '../types';
import { exerciseService } from './exerciseService';
import { getExercises } from '../lib/clinical-content-loader';
import { exerciseProtocolService } from './exerciseProtocolService';

// Função para converter exercícios do sistema clínico para o formato do sistema
function convertClinicalExerciseToSystemFormat(clinicalExercise: any): Exercise {
  return {
    id: `clinical-${clinicalExercise.id}`,
    name: clinicalExercise.name,
    description: clinicalExercise.description,
    category: mapClinicalCategoryToSystemCategory(clinicalExercise.specialty),
    bodyParts: clinicalExercise.targetMuscles || [],
    difficulty: mapDifficultyLevel(clinicalExercise.difficulty),
    equipment: clinicalExercise.equipment || ['Corpo'],
    instructions: clinicalExercise.instructions || [],
    media: {
      videoUrl: clinicalExercise.videoUrl || '',
      thumbnailUrl: clinicalExercise.imageUrl || '',
      duration: clinicalExercise.duration || 300
    },
    contraindications: clinicalExercise.contraindications || [],
    indications: clinicalExercise.benefits || [],
    modifications: clinicalExercise.variations ? {
      easier: clinicalExercise.variations.find((v: any) => v.type === 'easier')?.description || '',
      harder: clinicalExercise.variations.find((v: any) => v.type === 'harder')?.description || ''
    } : {},
    // Campos adicionais para integração
    tags: clinicalExercise.tags || [],
    clinicalId: clinicalExercise.id,
    specialty: clinicalExercise.specialty,
    linkedProtocols: exerciseProtocolService.getProtocolsForExercise(clinicalExercise.id)
  };
}

// Mapear especialidades clínicas para categorias do sistema
function mapClinicalCategoryToSystemCategory(specialty: string): string {
  const categoryMap: { [key: string]: string } = {
    'esportiva': 'Fisioterapia Esportiva',
    'pos-operatoria': 'Fisioterapia Pós-Operatória', 
    'geriatrica': 'Fisioterapia Gerontológica'
  };
  return categoryMap[specialty] || 'Geral';
}

// Mapear níveis de dificuldade
function mapDifficultyLevel(difficulty: string): number {
  const difficultyMap: { [key: string]: number } = {
    'beginner': 1,
    'intermediate': 2,
    'advanced': 3,
    'expert': 4,
    'professional': 5
  };
  return difficultyMap[difficulty] || 1;
}

// Serviço integrado que combina exercícios do sistema e conteúdo clínico
export class IntegratedExerciseService {
  private clinicalExercises: any[] = [];
  private systemExercises: Exercise[] = [];

  constructor() {
    this.loadClinicalExercises();
    this.loadSystemExercises();
  }

  private async loadClinicalExercises() {
    try {
      const clinicalData = getExercises();
      
      
      this.clinicalExercises = clinicalData.map(convertClinicalExerciseToSystemFormat);
      
      
    } catch (error) {
      console.error('❌ Erro ao carregar exercícios clínicos:', error);
      this.clinicalExercises = [];
    }
  }

  private async loadSystemExercises() {
    try {
      this.systemExercises = exerciseService.getMockExercises();
      
    } catch (error) {
      console.error('❌ Erro ao carregar exercícios do sistema:', error);
      this.systemExercises = [];
    }
  }

  // Obter todos os exercícios (sistema + clínico)
  getAllExercises(): Exercise[] {
    return [...this.systemExercises, ...this.clinicalExercises];
  }

  // Obter exercícios por categoria
  getExercisesByCategory(category: string): Exercise[] {
    return this.getAllExercises().filter(ex => ex.category === category);
  }

  // Obter categorias únicas
  getCategories(): string[] {
    const allExercises = this.getAllExercises();
    const categories = [...new Set(allExercises.map(ex => ex.category))];
    return categories.sort();
  }

  // Obter partes do corpo únicas
  getBodyParts(): string[] {
    const allExercises = this.getAllExercises();
    const bodyParts = [...new Set(allExercises.flatMap(ex => ex.bodyParts))];
    return bodyParts.sort();
  }

  // Obter equipamentos únicos
  getEquipment(): string[] {
    const allExercises = this.getAllExercises();
    const equipment = [...new Set(allExercises.flatMap(ex => ex.equipment))];
    return equipment.sort();
  }

  // Buscar exercícios
  searchExercises(query: string, filters?: {
    category?: string;
    bodyParts?: string[];
    difficulty?: number;
    equipment?: string[];
    specialty?: string;
  }): Exercise[] {
    let exercises = this.getAllExercises();

    // Busca por texto
    if (query) {
      const searchQuery = query.toLowerCase();
      exercises = exercises.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery) ||
        exercise.description.toLowerCase().includes(searchQuery) ||
        exercise.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    // Filtros
    if (filters?.category) {
      exercises = exercises.filter(exercise => exercise.category === filters.category);
    }

    if (filters?.difficulty) {
      exercises = exercises.filter(exercise => exercise.difficulty <= filters.difficulty!);
    }

    if (filters?.bodyParts && filters.bodyParts.length > 0) {
      exercises = exercises.filter(exercise =>
        filters.bodyParts!.some(part => exercise.bodyParts.includes(part))
      );
    }

    if (filters?.equipment && filters.equipment.length > 0) {
      exercises = exercises.filter(exercise =>
        filters.equipment!.some(equip => exercise.equipment.includes(equip))
      );
    }

    if (filters?.specialty) {
      exercises = exercises.filter(exercise => 
        (exercise as any).specialty === filters.specialty
      );
    }

    return exercises;
  }

  // Obter exercícios vinculados a protocolos
  getExercisesLinkedToProtocols(): Exercise[] {
    return this.getAllExercises().filter(ex => 
      (ex as any).linkedProtocols && (ex as any).linkedProtocols.length > 0
    );
  }

  // Obter exercícios por especialidade
  getExercisesBySpecialty(specialty: string): Exercise[] {
    return this.getAllExercises().filter(ex => 
      (ex as any).specialty === specialty
    );
  }

  // Obter estatísticas
  getStatistics() {
    const allExercises = this.getAllExercises();
    const categories = this.getCategories();
    const bodyParts = this.getBodyParts();
    const equipment = this.getEquipment();
    
    return {
      totalExercises: allExercises.length,
      systemExercises: this.systemExercises.length,
      clinicalExercises: this.clinicalExercises.length,
      totalCategories: categories.length,
      totalBodyParts: bodyParts.length,
      totalEquipment: equipment.length,
      exercisesWithProtocols: this.getExercisesLinkedToProtocols().length,
      specialties: {
        esportiva: this.getExercisesBySpecialty('esportiva').length,
        'pos-operatoria': this.getExercisesBySpecialty('pos-operatoria').length,
        geriatrica: this.getExercisesBySpecialty('geriatrica').length
      }
    };
  }

  // Refresh dados
  async refresh() {
    await this.loadClinicalExercises();
    await this.loadSystemExercises();
  }
}

// Instância singleton
export const integratedExerciseService = new IntegratedExerciseService();

// Hook personalizado para usar o serviço integrado
export function useIntegratedExercises() {
  const [exercises, setExercises] = React.useState<Exercise[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      setError(null);
      await integratedExerciseService.refresh();
      setExercises(integratedExerciseService.getAllExercises());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar exercícios');
    } finally {
      setLoading(false);
    }
  };

  return {
    exercises,
    categories: integratedExerciseService.getCategories(),
    bodyParts: integratedExerciseService.getBodyParts(),
    equipment: integratedExerciseService.getEquipment(),
    statistics: integratedExerciseService.getStatistics(),
    loading,
    error,
    refresh: loadExercises,
    searchExercises: integratedExerciseService.searchExercises.bind(integratedExerciseService),
    getExercisesByCategory: integratedExerciseService.getExercisesByCategory.bind(integratedExerciseService),
    getExercisesBySpecialty: integratedExerciseService.getExercisesBySpecialty.bind(integratedExerciseService),
    getExercisesLinkedToProtocols: integratedExerciseService.getExercisesLinkedToProtocols.bind(integratedExerciseService)
  };
}
