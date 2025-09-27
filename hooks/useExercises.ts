// hooks/useExercises.ts
import { useState, useEffect } from 'react';
import { exerciseService, Exercise, CreateExerciseRequest, UpdateExerciseRequest } from '../services/exerciseService';

interface UseExercisesState {
  exercises: Exercise[];
  loading: boolean;
  error: string | null;
}

export function useExercises() {
  const [state, setState] = useState<UseExercisesState>({
    exercises: [],
    loading: true,
    error: null,
  });

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // For now, use mock data until Supabase tables are ready
      const exercises = exerciseService.getMockExercises();
      setState(prev => ({ ...prev, exercises, loading: false }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Erro ao carregar exercícios',
      }));
    }
  };

  const createExercise = async (exerciseData: CreateExerciseRequest): Promise<Exercise> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      // Mock creation for now
      const newExercise: Exercise = {
        id: Math.random().toString(36).substr(2, 9),
        ...exerciseData,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        exercises: [newExercise, ...prev.exercises],
      }));

      return newExercise;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao criar exercício';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const updateExercise = async (id: string, exerciseData: UpdateExerciseRequest): Promise<Exercise> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      const updatedExercise = state.exercises.find(ex => ex.id === id);
      if (!updatedExercise) {
        throw new Error('Exercício não encontrado');
      }

      const updated = {
        ...updatedExercise,
        ...exerciseData,
        updated_at: new Date().toISOString(),
      };

      setState(prev => ({
        ...prev,
        exercises: prev.exercises.map(exercise =>
          exercise.id === id ? updated : exercise
        ),
      }));

      if (selectedExercise?.id === id) {
        setSelectedExercise(updated);
      }

      return updated;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao atualizar exercício';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const deleteExercise = async (id: string): Promise<void> => {
    try {
      setState(prev => ({ ...prev, error: null }));

      setState(prev => ({
        ...prev,
        exercises: prev.exercises.filter(exercise => exercise.id !== id),
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao deletar exercício';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const getExerciseById = async (id: string): Promise<Exercise | null> => {
    try {
      const exercise = state.exercises.find(ex => ex.id === id) || null;
      setSelectedExercise(exercise);
      return exercise;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Erro ao buscar exercício',
      }));
      return null;
    }
  };

  const searchExercises = (query: string, filters?: {
    category?: string;
    muscle_groups?: string[];
    difficulty_level?: string;
    equipment?: string[];
  }): Exercise[] => {
    let filtered = state.exercises;

    // Text search
    if (query) {
      const searchQuery = query.toLowerCase();
      filtered = filtered.filter(exercise =>
        exercise.name.toLowerCase().includes(searchQuery) ||
        exercise.description.toLowerCase().includes(searchQuery) ||
        exercise.tags.some(tag => tag.toLowerCase().includes(searchQuery))
      );
    }

    // Apply filters
    if (filters?.category) {
      filtered = filtered.filter(exercise => exercise.category === filters.category);
    }

    if (filters?.difficulty_level) {
      filtered = filtered.filter(exercise => exercise.difficulty_level === filters.difficulty_level);
    }

    if (filters?.muscle_groups && filters.muscle_groups.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.muscle_groups!.some(group => exercise.muscle_groups.includes(group))
      );
    }

    if (filters?.equipment && filters.equipment.length > 0) {
      filtered = filtered.filter(exercise =>
        filters.equipment!.some(equip => exercise.equipment.includes(equip))
      );
    }

    return filtered;
  };

  const getExercisesByCategory = (category: string): Exercise[] => {
    return state.exercises.filter(exercise => exercise.category === category);
  };

  const getCategories = (): string[] => {
    const categories = [...new Set(state.exercises.map(ex => ex.category))];
    return categories.sort();
  };

  const getMuscleGroups = (): string[] => {
    const allGroups = state.exercises.flatMap(ex => ex.muscle_groups);
    const uniqueGroups = [...new Set(allGroups)];
    return uniqueGroups.sort();
  };

  const getEquipment = (): string[] => {
    const allEquipment = state.exercises.flatMap(ex => ex.equipment);
    const uniqueEquipment = [...new Set(allEquipment)];
    return uniqueEquipment.sort();
  };

  const refreshExercises = () => {
    loadExercises();
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: null }));
  };

  return {
    exercises: state.exercises,
    loading: state.loading,
    error: state.error,
    selectedExercise,
    setSelectedExercise,
    createExercise,
    updateExercise,
    deleteExercise,
    getExerciseById,
    searchExercises,
    getExercisesByCategory,
    getCategories,
    getMuscleGroups,
    getEquipment,
    refreshExercises,
    clearError,
  };
}

export default useExercises;