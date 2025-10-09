/**
 * ExerciseContext - Gerenciamento global de exercícios
 * CRUD completo com persistência, validação e otimização
 */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { Exercise, ExerciseCategory, ExerciseProtocol, ExerciseAssignment, ExerciseSearchFilters } from '../types/exercise';
import { ExerciseFormSchema } from '../schemas/exerciseValidation';
import { v4 as uuidv4 } from 'uuid';
import { exerciseToasts } from '../utils/exerciseToasts';
import { 
  auditService, 
  logExerciseCreate, 
  logExerciseUpdate, 
  logExerciseDelete, 
  logExerciseDuplicate,
  logProtocolCreate
} from '../services/auditService';

// Tipos para o Context
interface ExerciseContextType {
  // Estado
  exercises: Exercise[];
  categories: ExerciseCategory[];
  protocols: ExerciseProtocol[];
  assignments: ExerciseAssignment[];
  currentExercise: Exercise | null;
  isLoading: boolean;
  error: string | null;

  // CRUD Exercícios
  getAllExercises: () => Promise<Exercise[]>;
  getExercise: (id: string) => Promise<Exercise | null>;
  createExercise: (exercise: Partial<Exercise>) => Promise<Exercise>;
  updateExercise: (id: string, exercise: Partial<Exercise>) => Promise<Exercise>;
  deleteExercise: (id: string) => Promise<void>;
  
  // Busca e Filtros
  searchExercises: (filters: ExerciseSearchFilters) => Promise<Exercise[]>;
  filterByCategory: (categoryId: string) => Promise<Exercise[]>;
  filterByDifficulty: (difficulty: string) => Promise<Exercise[]>;
  
  // Categorias
  getAllCategories: () => Promise<ExerciseCategory[]>;
  createCategory: (category: Partial<ExerciseCategory>) => Promise<ExerciseCategory>;
  updateCategory: (id: string, category: Partial<ExerciseCategory>) => Promise<ExerciseCategory>;
  deleteCategory: (id: string) => Promise<void>;
  
  // Protocolos
  getAllProtocols: () => Promise<ExerciseProtocol[]>;
  createProtocol: (protocol: Partial<ExerciseProtocol>) => Promise<ExerciseProtocol>;
  updateProtocol: (id: string, protocol: Partial<ExerciseProtocol>) => Promise<ExerciseProtocol>;
  deleteProtocol: (id: string) => Promise<void>;
  
  // Atribuições
  assignExerciseToPatient: (patientId: string, exerciseId: string, data?: Partial<ExerciseAssignment>) => Promise<ExerciseAssignment>;
  getPatientAssignments: (patientId: string) => Promise<ExerciseAssignment[]>;
  updateAssignment: (id: string, data: Partial<ExerciseAssignment>) => Promise<ExerciseAssignment>;
  completeAssignment: (id: string) => Promise<void>;
  
  // Utilitários
  duplicateExercise: (id: string) => Promise<Exercise>;
  exportExercises: (ids: string[]) => Promise<void>;
  importExercises: (data: any) => Promise<void>;
}

const ExerciseContext = createContext<ExerciseContextType | undefined>(undefined);

// Provider Component
export const ExerciseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<ExerciseCategory[]>([]);
  const [protocols, setProtocols] = useState<ExerciseProtocol[]>([]);
  const [assignments, setAssignments] = useState<ExerciseAssignment[]>([]);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar dados do localStorage na inicialização
  useEffect(() => {
    const loadData = () => {
      try {
        const storedExercises = localStorage.getItem('exercises');
        const storedCategories = localStorage.getItem('exerciseCategories');
        const storedProtocols = localStorage.getItem('exerciseProtocols');
        const storedAssignments = localStorage.getItem('exerciseAssignments');

        if (storedExercises) setExercises(JSON.parse(storedExercises));
        if (storedCategories) setCategories(JSON.parse(storedCategories));
        if (storedProtocols) setProtocols(JSON.parse(storedProtocols));
        if (storedAssignments) setAssignments(JSON.parse(storedAssignments));

        // Inicializar com dados mock se vazio
        if (!storedCategories) {
          const mockCategories = createMockCategories();
          setCategories(mockCategories);
          localStorage.setItem('exerciseCategories', JSON.stringify(mockCategories));
        }

        if (!storedExercises) {
          const mockExercises = createMockExercises();
          setExercises(mockExercises);
          localStorage.setItem('exercises', JSON.stringify(mockExercises));
        }
      } catch (error) {
        console.error('Erro ao carregar dados do localStorage:', error);
      }
    };

    loadData();
  }, []);

  // Persistir no localStorage quando houver mudanças
  useEffect(() => {
    localStorage.setItem('exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem('exerciseCategories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('exerciseProtocols', JSON.stringify(protocols));
  }, [protocols]);

  useEffect(() => {
    localStorage.setItem('exerciseAssignments', JSON.stringify(assignments));
  }, [assignments]);

  // CRUD Exercícios
  const getAllExercises = useCallback(async (): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300)); // Simular delay de API
      setIsLoading(false);
      return exercises;
    } catch (err) {
      setError('Erro ao buscar exercícios');
      setIsLoading(false);
      throw err;
    }
  }, [exercises]);

  const getExercise = useCallback(async (id: string): Promise<Exercise | null> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const exercise = exercises.find(ex => ex.id === id) || null;
      setCurrentExercise(exercise);
      setIsLoading(false);
      return exercise;
    } catch (err) {
      setError('Erro ao buscar exercício');
      setIsLoading(false);
      throw err;
    }
  }, [exercises]);

  const createExercise = useCallback(async (exerciseData: Partial<Exercise>): Promise<Exercise> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const newExercise: Exercise = {
        id: uuidv4(),
        name: exerciseData.name || '',
        description: exerciseData.description || '',
        category: exerciseData.category || '',
        targetMuscles: exerciseData.targetMuscles || [],
        secondaryMuscles: exerciseData.secondaryMuscles || [],
        equipment: exerciseData.equipment || ['none'],
        difficulty: exerciseData.difficulty || 'beginner',
        instructions: exerciseData.instructions || [],
        tips: exerciseData.tips || [],
        variations: exerciseData.variations || [],
        contraindications: exerciseData.contraindications || [],
        tags: exerciseData.tags || [],
        keywords: exerciseData.keywords || [],
        bodyParts: exerciseData.bodyParts || [],
        source: exerciseData.source || 'user',
        isCustom: exerciseData.isCustom || true,
        isPublic: exerciseData.isPublic || false,
        isActive: exerciseData.isActive !== undefined ? exerciseData.isActive : true,
        createdBy: exerciseData.createdBy || 'current-user',
        assignedPatients: exerciseData.assignedPatients || [],
        protocols: exerciseData.protocols || [],
        progressionLevel: exerciseData.progressionLevel || 1,
        prerequisites: exerciseData.prerequisites || [],
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        totalRatings: 0,
        ...exerciseData
      };

      setExercises(prev => [...prev, newExercise]);
      setIsLoading(false);
      
      // Toast e auditoria
      exerciseToasts.createSuccess(newExercise.name);
      logExerciseCreate(newExercise.id, newExercise.name);
      
      return newExercise;
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido';
      setError(errorMessage);
      setIsLoading(false);
      exerciseToasts.createError(errorMessage);
      throw err;
    }
  }, []);

  const updateExercise = useCallback(async (id: string, exerciseData: Partial<Exercise>): Promise<Exercise> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const exerciseIndex = exercises.findIndex(ex => ex.id === id);
      if (exerciseIndex === -1) {
        throw new Error('Exercício não encontrado');
      }

      const originalExercise = exercises[exerciseIndex];
      const updatedExercise: Exercise = {
        ...originalExercise,
        ...exerciseData,
        updatedAt: new Date()
      };

      const newExercises = [...exercises];
      newExercises[exerciseIndex] = updatedExercise;
      setExercises(newExercises);
      setCurrentExercise(updatedExercise);
      setIsLoading(false);

      // Toast e auditoria
      exerciseToasts.updateSuccess(updatedExercise.name);
      logExerciseUpdate(id, updatedExercise.name, originalExercise, updatedExercise);
      
      return updatedExercise;
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido';
      setError(errorMessage);
      setIsLoading(false);
      exerciseToasts.updateError(errorMessage);
      throw err;
    }
  }, [exercises]);

  const deleteExercise = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const exercise = exercises.find(ex => ex.id === id);
      if (!exercise) {
        throw new Error('Exercício não encontrado');
      }

      setExercises(prev => prev.filter(ex => ex.id !== id));
      setIsLoading(false);

      // Toast e auditoria
      exerciseToasts.deleteSuccess(exercise.name);
      logExerciseDelete(id, exercise.name);
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro desconhecido';
      setError(errorMessage);
      setIsLoading(false);
      exerciseToasts.deleteError(errorMessage);
      throw err;
    }
  }, [exercises]);

  // Busca e Filtros
  const searchExercises = useCallback(async (filters: ExerciseSearchFilters): Promise<Exercise[]> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      let results = [...exercises];

      if (filters.query) {
        const query = filters.query.toLowerCase();
        results = results.filter(ex =>
          ex.name.toLowerCase().includes(query) ||
          ex.description.toLowerCase().includes(query) ||
          ex.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      if (filters.category) {
        results = results.filter(ex => ex.category === filters.category);
      }

      if (filters.difficulty) {
        results = results.filter(ex => ex.difficulty === filters.difficulty);
      }

      if (filters.equipment && filters.equipment.length > 0) {
        results = results.filter(ex =>
          ex.equipment.some(eq => filters.equipment?.includes(eq))
        );
      }

      if (filters.targetMuscles && filters.targetMuscles.length > 0) {
        results = results.filter(ex =>
          ex.targetMuscles.some(muscle => filters.targetMuscles?.includes(muscle))
        );
      }

      if (filters.isActive !== undefined) {
        results = results.filter(ex => ex.isActive === filters.isActive);
      }

      if (filters.isPublic !== undefined) {
        results = results.filter(ex => ex.isPublic === filters.isPublic);
      }

      setIsLoading(false);
      return results;
    } catch (err) {
      setError('Erro ao buscar exercícios');
      setIsLoading(false);
      throw err;
    }
  }, [exercises]);

  const filterByCategory = useCallback(async (categoryId: string): Promise<Exercise[]> => {
    return searchExercises({ category: categoryId });
  }, [searchExercises]);

  const filterByDifficulty = useCallback(async (difficulty: string): Promise<Exercise[]> => {
    return searchExercises({ difficulty: difficulty as any });
  }, [searchExercises]);

  // Categorias
  const getAllCategories = useCallback(async (): Promise<ExerciseCategory[]> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsLoading(false);
      return categories;
    } catch (err) {
      setError('Erro ao buscar categorias');
      setIsLoading(false);
      throw err;
    }
  }, [categories]);

  const createCategory = useCallback(async (categoryData: Partial<ExerciseCategory>): Promise<ExerciseCategory> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const newCategory: ExerciseCategory = {
        id: uuidv4(),
        name: categoryData.name || '',
        description: categoryData.description || '',
        color: categoryData.color || '#3B82F6',
        icon: categoryData.icon || 'Activity',
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
        sortOrder: categoryData.sortOrder || categories.length,
        ...categoryData
      };

      setCategories(prev => [...prev, newCategory]);
      setIsLoading(false);
      return newCategory;
    } catch (err) {
      setError('Erro ao criar categoria');
      setIsLoading(false);
      throw err;
    }
  }, [categories]);

  const updateCategory = useCallback(async (id: string, categoryData: Partial<ExerciseCategory>): Promise<ExerciseCategory> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const categoryIndex = categories.findIndex(cat => cat.id === id);
      if (categoryIndex === -1) {
        throw new Error('Categoria não encontrada');
      }

      const updatedCategory: ExerciseCategory = {
        ...categories[categoryIndex],
        ...categoryData
      };

      const newCategories = [...categories];
      newCategories[categoryIndex] = updatedCategory;
      setCategories(newCategories);
      setIsLoading(false);
      return updatedCategory;
    } catch (err) {
      setError('Erro ao atualizar categoria');
      setIsLoading(false);
      throw err;
    }
  }, [categories]);

  const deleteCategory = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setCategories(prev => prev.filter(cat => cat.id !== id));
      setIsLoading(false);
    } catch (err) {
      setError('Erro ao deletar categoria');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Protocolos
  const getAllProtocols = useCallback(async (): Promise<ExerciseProtocol[]> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      setIsLoading(false);
      return protocols;
    } catch (err) {
      setError('Erro ao buscar protocolos');
      setIsLoading(false);
      throw err;
    }
  }, [protocols]);

  const createProtocol = useCallback(async (protocolData: Partial<ExerciseProtocol>): Promise<ExerciseProtocol> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const newProtocol: ExerciseProtocol = {
        id: uuidv4(),
        name: protocolData.name || '',
        description: protocolData.description || '',
        exercises: protocolData.exercises || [],
        duration: protocolData.duration || 4,
        frequency: protocolData.frequency || 3,
        intensity: protocolData.intensity || 'moderate',
        targetConditions: protocolData.targetConditions || [],
        createdBy: protocolData.createdBy || 'current-user',
        isPublic: protocolData.isPublic || false,
        isActive: protocolData.isActive !== undefined ? protocolData.isActive : true,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...protocolData
      };

      setProtocols(prev => [...prev, newProtocol]);
      setIsLoading(false);
      return newProtocol;
    } catch (err) {
      setError('Erro ao criar protocolo');
      setIsLoading(false);
      throw err;
    }
  }, []);

  const updateProtocol = useCallback(async (id: string, protocolData: Partial<ExerciseProtocol>): Promise<ExerciseProtocol> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const protocolIndex = protocols.findIndex(prot => prot.id === id);
      if (protocolIndex === -1) {
        throw new Error('Protocolo não encontrado');
      }

      const updatedProtocol: ExerciseProtocol = {
        ...protocols[protocolIndex],
        ...protocolData,
        updatedAt: new Date()
      };

      const newProtocols = [...protocols];
      newProtocols[protocolIndex] = updatedProtocol;
      setProtocols(newProtocols);
      setIsLoading(false);
      return updatedProtocol;
    } catch (err) {
      setError('Erro ao atualizar protocolo');
      setIsLoading(false);
      throw err;
    }
  }, [protocols]);

  const deleteProtocol = useCallback(async (id: string): Promise<void> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));
      setProtocols(prev => prev.filter(prot => prot.id !== id));
      setIsLoading(false);
    } catch (err) {
      setError('Erro ao deletar protocolo');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Atribuições
  const assignExerciseToPatient = useCallback(async (
    patientId: string,
    exerciseId: string,
    data?: Partial<ExerciseAssignment>
  ): Promise<ExerciseAssignment> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 400));

      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (!exercise) {
        throw new Error('Exercício não encontrado');
      }

      const newAssignment: ExerciseAssignment = {
        id: uuidv4(),
        patientId,
        exerciseId,
        exercise,
        assignedBy: 'current-user',
        assignedAt: new Date(),
        startDate: new Date(),
        status: 'assigned',
        progress: [],
        isActive: true,
        ...data
      };

      setAssignments(prev => [...prev, newAssignment]);
      setIsLoading(false);
      return newAssignment;
    } catch (err) {
      setError('Erro ao atribuir exercício');
      setIsLoading(false);
      throw err;
    }
  }, [exercises]);

  const getPatientAssignments = useCallback(async (patientId: string): Promise<ExerciseAssignment[]> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const patientAssignments = assignments.filter(assign => assign.patientId === patientId);
      setIsLoading(false);
      return patientAssignments;
    } catch (err) {
      setError('Erro ao buscar atribuições do paciente');
      setIsLoading(false);
      throw err;
    }
  }, [assignments]);

  const updateAssignment = useCallback(async (id: string, data: Partial<ExerciseAssignment>): Promise<ExerciseAssignment> => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300));

      const assignmentIndex = assignments.findIndex(assign => assign.id === id);
      if (assignmentIndex === -1) {
        throw new Error('Atribuição não encontrada');
      }

      const updatedAssignment: ExerciseAssignment = {
        ...assignments[assignmentIndex],
        ...data
      };

      const newAssignments = [...assignments];
      newAssignments[assignmentIndex] = updatedAssignment;
      setAssignments(newAssignments);
      setIsLoading(false);
      return updatedAssignment;
    } catch (err) {
      setError('Erro ao atualizar atribuição');
      setIsLoading(false);
      throw err;
    }
  }, [assignments]);

  const completeAssignment = useCallback(async (id: string): Promise<void> => {
    return updateAssignment(id, { status: 'completed', isActive: false });
  }, [updateAssignment]);

  // Utilitários
  const duplicateExercise = useCallback(async (id: string): Promise<Exercise> => {
    const exercise = await getExercise(id);
    if (!exercise) {
      throw new Error('Exercício não encontrado');
    }

    const duplicated = await createExercise({
      ...exercise,
      id: undefined,
      name: `${exercise.name} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0
    });

    return duplicated;
  }, [getExercise, createExercise]);

  const exportExercises = useCallback(async (ids: string[]): Promise<void> => {
    const exercisesToExport = exercises.filter(ex => ids.includes(ex.id));
    const exportData = {
      exercises: exercisesToExport,
      exportDate: new Date(),
      version: '1.0'
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `exercises-export-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);

    console.log('✅ Exercícios exportados:', ids.length);
  }, [exercises]);

  const importExercises = useCallback(async (data: any): Promise<void> => {
    setIsLoading(true);
    try {
      const importedExercises = data.exercises || [];
      const newExercises = importedExercises.map((ex: any) => ({
        ...ex,
        id: uuidv4(),
        createdAt: new Date(),
        updatedAt: new Date()
      }));

      setExercises(prev => [...prev, ...newExercises]);
      setIsLoading(false);
      console.log('✅ Exercícios importados:', newExercises.length);
    } catch (err) {
      setError('Erro ao importar exercícios');
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Memoizar o valor do contexto
  const value = useMemo(() => ({
    exercises,
    categories,
    protocols,
    assignments,
    currentExercise,
    isLoading,
    error,
    getAllExercises,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
    filterByCategory,
    filterByDifficulty,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllProtocols,
    createProtocol,
    updateProtocol,
    deleteProtocol,
    assignExerciseToPatient,
    getPatientAssignments,
    updateAssignment,
    completeAssignment,
    duplicateExercise,
    exportExercises,
    importExercises
  }), [
    exercises,
    categories,
    protocols,
    assignments,
    currentExercise,
    isLoading,
    error,
    getAllExercises,
    getExercise,
    createExercise,
    updateExercise,
    deleteExercise,
    searchExercises,
    filterByCategory,
    filterByDifficulty,
    getAllCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    getAllProtocols,
    createProtocol,
    updateProtocol,
    deleteProtocol,
    assignExerciseToPatient,
    getPatientAssignments,
    updateAssignment,
    completeAssignment,
    duplicateExercise,
    exportExercises,
    importExercises
  ]);

  return (
    <ExerciseContext.Provider value={value}>
      {children}
    </ExerciseContext.Provider>
  );
};

// Hook customizado
export const useExercise = (): ExerciseContextType => {
  const context = useContext(ExerciseContext);
  if (context === undefined) {
    throw new Error('useExercise deve ser usado dentro de um ExerciseProvider');
  }
  return context;
};

// Funções para criar dados mock
function createMockCategories(): ExerciseCategory[] {
  return [
    {
      id: uuidv4(),
      name: 'Mobilidade',
      description: 'Exercícios para melhorar amplitude de movimento',
      color: '#3B82F6',
      icon: 'Maximize',
      isActive: true,
      sortOrder: 0
    },
    {
      id: uuidv4(),
      name: 'Fortalecimento',
      description: 'Exercícios de resistência muscular',
      color: '#EF4444',
      icon: 'Dumbbell',
      isActive: true,
      sortOrder: 1
    },
    {
      id: uuidv4(),
      name: 'Alongamento',
      description: 'Exercícios de flexibilidade',
      color: '#10B981',
      icon: 'Move',
      isActive: true,
      sortOrder: 2
    },
    {
      id: uuidv4(),
      name: 'Equilíbrio',
      description: 'Exercícios para propriocepção',
      color: '#F59E0B',
      icon: 'Scale',
      isActive: true,
      sortOrder: 3
    },
    {
      id: uuidv4(),
      name: 'Respiratório',
      description: 'Exercícios respiratórios',
      color: '#8B5CF6',
      icon: 'Wind',
      isActive: true,
      sortOrder: 4
    }
  ];
}

function createMockExercises(): Exercise[] {
  const categories = createMockCategories();
  
  return [
    {
      id: uuidv4(),
      name: 'Agachamento Básico',
      description: 'Exercício fundamental para fortalecimento de membros inferiores',
      category: categories[1].id,
      targetMuscles: ['Quadríceps', 'Glúteos'],
      secondaryMuscles: ['Isquiotibiais', 'Panturrilha'],
      equipment: ['none'],
      difficulty: 'beginner',
      instructions: [
        'Fique em pé com os pés na largura dos ombros',
        'Flexione os joelhos e quadris, mantendo as costas retas',
        'Desça até as coxas ficarem paralelas ao chão',
        'Retorne à posição inicial empurrando pelos calcanhares'
      ],
      tips: [
        'Mantenha os joelhos alinhados com os pés',
        'Não deixe os joelhos ultrapassarem os pés',
        'Olhe para frente durante todo o movimento'
      ],
      variations: ['Agachamento com peso', 'Agachamento búlgaro'],
      contraindications: ['Lesão aguda no joelho', 'Dor lombar severa'],
      sets: 3,
      reps: 15,
      restTime: 60,
      tags: ['membros inferiores', 'funcional'],
      keywords: ['squat', 'legs', 'lower body'],
      bodyParts: ['Pernas', 'Glúteos'],
      source: 'system',
      isCustom: false,
      isPublic: true,
      isActive: true,
      createdBy: 'system',
      assignedPatients: [],
      protocols: [],
      progressionLevel: 1,
      prerequisites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      totalRatings: 0
    },
    {
      id: uuidv4(),
      name: 'Flexão de Braço',
      description: 'Exercício clássico para fortalecimento de membros superiores',
      category: categories[1].id,
      targetMuscles: ['Peitoral', 'Tríceps'],
      secondaryMuscles: ['Deltoides', 'Core'],
      equipment: ['mat'],
      difficulty: 'intermediate',
      instructions: [
        'Posicione-se em prancha com mãos na largura dos ombros',
        'Mantenha o corpo alinhado da cabeça aos pés',
        'Flexione os cotovelos descendo o corpo',
        'Empurre de volta até a posição inicial'
      ],
      tips: [
        'Mantenha o core contraído',
        'Não deixe o quadril cair',
        'Respire de forma controlada'
      ],
      variations: ['Flexão no joelho', 'Flexão diamante', 'Flexão explosiva'],
      contraindications: ['Lesão de ombro', 'Lesão de punho'],
      sets: 3,
      reps: 12,
      restTime: 90,
      tags: ['membros superiores', 'força'],
      keywords: ['push-up', 'chest', 'upper body'],
      bodyParts: ['Peito', 'Braços', 'Ombros'],
      source: 'system',
      isCustom: false,
      isPublic: true,
      isActive: true,
      createdBy: 'system',
      assignedPatients: [],
      protocols: [],
      progressionLevel: 2,
      prerequisites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      totalRatings: 0
    },
    {
      id: uuidv4(),
      name: 'Prancha Isométrica',
      description: 'Exercício de estabilização do core',
      category: categories[1].id,
      targetMuscles: ['Reto Abdominal', 'Transverso Abdominal'],
      secondaryMuscles: ['Oblíquos', 'Eretores da espinha'],
      equipment: ['mat'],
      difficulty: 'beginner',
      instructions: [
        'Posicione-se em prancha sobre os antebraços',
        'Mantenha o corpo reto da cabeça aos pés',
        'Contraía o abdômen e glúteos',
        'Segure a posição pelo tempo determinado'
      ],
      tips: [
        'Não deixe o quadril cair ou subir',
        'Mantenha o pescoço neutro',
        'Respire normalmente'
      ],
      variations: ['Prancha lateral', 'Prancha com elevação de perna'],
      contraindications: ['Lesão lombar aguda', 'Hérnia discal'],
      duration: 30,
      tags: ['core', 'estabilidade'],
      keywords: ['plank', 'core', 'stability'],
      bodyParts: ['Abdômen', 'Core'],
      source: 'system',
      isCustom: false,
      isPublic: true,
      isActive: true,
      createdBy: 'system',
      assignedPatients: [],
      protocols: [],
      progressionLevel: 1,
      prerequisites: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      totalRatings: 0
    }
  ];
}

export default ExerciseContext;
