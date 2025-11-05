/**
 * Componente: PrescribedExerciseList
 * Lista de exercícios prescritos com parâmetros editáveis
 */

import React from 'react';
import { Trash2, GripVertical } from 'lucide-react';
import { PrescribedExercise } from '@/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface PrescribedExerciseListProps {
  exercises: PrescribedExercise[];
  onUpdate: (exercises: PrescribedExercise[]) => void;
}

export function PrescribedExerciseList({ exercises, onUpdate }: PrescribedExerciseListProps) {
  const handleUpdateExercise = (index: number, field: keyof PrescribedExercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate(updated);
  };

  const handleRemoveExercise = (index: number) => {
    const updated = exercises.filter((_, i) => i !== index);
    onUpdate(updated);
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500 text-sm">
          Nenhum exercício prescrito ainda
        </p>
        <p className="text-gray-400 text-xs mt-1">
          Use o botão acima para adicionar exercícios
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700">
          {exercises.length} exercício(s) prescrito(s)
        </p>
      </div>

      {exercises.map((prescribedEx, index) => (
        <Card key={prescribedEx.id} className="overflow-hidden border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Drag handle (visual apenas) */}
              <div className="flex items-start pt-2">
                <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
              </div>

              {/* Thumbnail */}
              {prescribedEx.exercise.media?.thumbnailUrl && (
                <img
                  src={prescribedEx.exercise.media.thumbnailUrl}
                  alt={prescribedEx.exercise.name}
                  className="w-16 h-16 rounded object-cover flex-shrink-0"
                />
              )}
              
              <div className="flex-1 space-y-3">
                {/* Nome e categoria */}
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {prescribedEx.exercise.name}
                  </h4>
                  {prescribedEx.exercise.category && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      {prescribedEx.exercise.category}
                    </Badge>
                  )}
                </div>

                {/* Parâmetros do exercício */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Séries
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={prescribedEx.sets}
                      onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 1)}
                      className="text-sm h-9"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Repetições
                    </label>
                    <Input
                      type="number"
                      min="1"
                      value={prescribedEx.reps}
                      onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value) || 1)}
                      className="text-sm h-9"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Carga
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 5kg"
                      value={prescribedEx.load || ''}
                      onChange={(e) => handleUpdateExercise(index, 'load', e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">
                      Tempo
                    </label>
                    <Input
                      type="text"
                      placeholder="Ex: 30seg"
                      value={prescribedEx.duration || ''}
                      onChange={(e) => handleUpdateExercise(index, 'duration', e.target.value)}
                      className="text-sm h-9"
                    />
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">
                    Observações
                  </label>
                  <Textarea
                    placeholder="Instruções específicas para este exercício..."
                    value={prescribedEx.notes || ''}
                    onChange={(e) => handleUpdateExercise(index, 'notes', e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
              
              {/* Botão remover */}
              <div className="flex items-start pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveExercise(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  title="Remover exercício"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

