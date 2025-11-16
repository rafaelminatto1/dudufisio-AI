/**
 * Componente: ExerciseSelector
 * Seletor de exercícios da biblioteca com busca e filtros
 */

import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { exerciseService } from '@/services/exerciseService';
import { Exercise, PrescribedExercise } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ExerciseSelectorProps {
  onSelect: (exercises: PrescribedExercise[]) => void;
  selectedExercises: PrescribedExercise[];
}

export function ExerciseSelector({ onSelect, selectedExercises }: ExerciseSelectorProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>(
    selectedExercises.map(e => e.exerciseId)
  );

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    try {
      setLoading(true);
      const data = await exerciseService.getAllExercises();
      setExercises(data);
    } catch (error) {
      console.error('Erro ao carregar exercícios:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExercises = exercises.filter(ex => {
    const searchLower = search.toLowerCase();
    return (
      ex.name.toLowerCase().includes(searchLower) ||
      ex.category?.toLowerCase().includes(searchLower) ||
      ex.bodyParts?.some((bp: string) => bp.toLowerCase().includes(searchLower))
    );
  });

  const toggleExercise = (exercise: Exercise) => {
    const isSelected = selectedIds.includes(exercise.id);
    
    if (isSelected) {
      const newIds = selectedIds.filter(id => id !== exercise.id);
      setSelectedIds(newIds);
      onSelect(selectedExercises.filter(e => e.exerciseId !== exercise.id));
    } else {
      const newIds = [...selectedIds, exercise.id];
      setSelectedIds(newIds);
      
      // Criar PrescribedExercise com valores padrão
      const prescribedExercise: PrescribedExercise = {
        id: `prescribed_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        exerciseId: exercise.id,
        exercise: exercise,
        sets: 3,
        reps: 10,
        load: '',
        duration: '',
        notes: ''
      };
      
      onSelect([...selectedExercises, prescribedExercise]);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-gray-200 animate-pulse rounded-lg" />
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-gray-200 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Buscar exercícios por nome, categoria ou região..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Contador de selecionados */}
      {selectedIds.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900">
            {selectedIds.length} exercício(s) selecionado(s)
          </p>
        </div>
      )}

      {/* Lista de exercícios */}
      <div className="max-h-96 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-3">
        {filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">Nenhum exercício encontrado</p>
            <p className="text-xs mt-1">Tente ajustar sua busca</p>
          </div>
        ) : (
          filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              onClick={() => toggleExercise(exercise)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                selectedIds.includes(exercise.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(exercise.id)}
                  onChange={() => {}}
                  className="w-4 h-4 text-primary rounded focus:ring-primary"
                />
                
                {exercise.media?.thumbnailUrl && (
                  <img
                    src={exercise.media.thumbnailUrl}
                    alt={exercise.name}
                    className="w-12 h-12 rounded object-cover"
                  />
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{exercise.name}</p>
                  <div className="flex items-center gap-2 mt-1">
                    {exercise.category && (
                      <Badge variant="secondary" className="text-xs">
                        {exercise.category}
                      </Badge>
                    )}
                    {exercise.difficulty && (
                      <span className="text-xs text-gray-500">
                        Nível {exercise.difficulty}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Exercícios selecionados - Preview */}
      {selectedIds.length > 0 && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <p className="text-sm font-medium text-green-900 mb-2">
            Exercícios Selecionados
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedExercises.map((prescribedEx) => (
              <span
                key={prescribedEx.id}
                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm"
              >
                {prescribedEx.exercise.name}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExercise(prescribedEx.exercise);
                  }}
                  className="hover:text-green-900 ml-1"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

