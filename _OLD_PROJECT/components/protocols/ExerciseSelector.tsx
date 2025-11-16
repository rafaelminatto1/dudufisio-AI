/**
 * Seletor de Exercícios para Protocolos
 * Modal com busca e seleção múltipla
 */

import React, { useState, useEffect } from 'react';
import { useExercise } from '../../contexts/ExerciseContext';
import { Exercise } from '../../types/exercise';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { ScrollArea } from '../ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Search, X, Check } from 'lucide-react';

interface ExerciseSelectorProps {
  open: boolean;
  onClose: () => void;
  onSelect: (exercises: Exercise[]) => void;
  selectedIds?: string[];
}

export const ExerciseSelector: React.FC<ExerciseSelectorProps> = ({
  open,
  onClose,
  onSelect,
  selectedIds = [],
}) => {
  const { exercises, categories, getAllExercises, getAllCategories } = useExercise();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedExercises, setSelectedExercises] = useState<Set<string>>(new Set(selectedIds));
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);

  useEffect(() => {
    if (open) {
      getAllExercises();
      getAllCategories();
      setSelectedExercises(new Set(selectedIds));
    }
  }, [open, selectedIds]);

  // Filtrar exercícios
  useEffect(() => {
    let results = exercises.filter(ex => ex.isActive);

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(ex =>
        ex.name.toLowerCase().includes(query) ||
        ex.description.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      results = results.filter(ex => ex.category === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      results = results.filter(ex => ex.difficulty === selectedDifficulty);
    }

    setFilteredExercises(results);
  }, [searchQuery, selectedCategory, selectedDifficulty, exercises]);

  const toggleExercise = (exerciseId: string) => {
    const newSelected = new Set(selectedExercises);
    if (newSelected.has(exerciseId)) {
      newSelected.delete(exerciseId);
    } else {
      newSelected.add(exerciseId);
    }
    setSelectedExercises(newSelected);
  };

  const handleConfirm = () => {
    const selected = exercises.filter(ex => selectedExercises.has(ex.id));
    onSelect(selected);
    onClose();
  };

  const handleClear = () => {
    setSelectedExercises(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Selecionar Exercícios</DialogTitle>
          <DialogDescription>
            Escolha os exercícios para incluir no protocolo
          </DialogDescription>
        </DialogHeader>

        {/* Filters */}
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar exercícios..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Dificuldade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="beginner">Iniciante</SelectItem>
                <SelectItem value="intermediate">Intermediário</SelectItem>
                <SelectItem value="advanced">Avançado</SelectItem>
                <SelectItem value="expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Selected Count */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">
              {selectedExercises.size} exercício(s) selecionado(s)
            </span>
            {selectedExercises.size > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClear}>
                <X className="h-4 w-4 mr-1" />
                Limpar Seleção
              </Button>
            )}
          </div>
        </div>

        {/* Exercise List */}
        <ScrollArea className="h-[400px] border rounded-lg">
          <div className="p-4 space-y-2">
            {filteredExercises.map(exercise => (
              <div
                key={exercise.id}
                className={`
                  p-3 border rounded-lg cursor-pointer transition-colors
                  ${selectedExercises.has(exercise.id)
                    ? 'border-primary bg-primary/5'
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
                onClick={() => toggleExercise(exercise.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedExercises.has(exercise.id)}
                    onCheckedChange={() => toggleExercise(exercise.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900">{exercise.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {exercise.difficulty === 'beginner' ? 'Iniciante' :
                         exercise.difficulty === 'intermediate' ? 'Intermediário' :
                         exercise.difficulty === 'advanced' ? 'Avançado' : 'Expert'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {exercise.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      {exercise.targetMuscles.slice(0, 3).map((muscle, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {selectedExercises.has(exercise.id) && (
                    <Check className="h-5 w-5 text-primary" />
                  )}
                </div>
              </div>
            ))}

            {filteredExercises.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>Nenhum exercício encontrado</p>
                <p className="text-sm">Tente ajustar os filtros</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={selectedExercises.size === 0}>
            Adicionar {selectedExercises.size > 0 ? `(${selectedExercises.size})` : ''}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

