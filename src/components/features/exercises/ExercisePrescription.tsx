'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Label } from '~/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select';
import { Plus, X } from 'lucide-react';
import { getExercises, prescribeExercise } from '~/lib/actions/exercises';
import { toast } from 'sonner';

interface ExercisePrescriptionProps {
  patientId: string;
  onPrescribe?: () => void;
}

export function ExercisePrescription({ patientId, onPrescribe }: ExercisePrescriptionProps) {
  const [exercises, setExercises] = useState<any[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Array<{
    exercise_id: string;
    exercise_name: string;
    sets?: number;
    reps?: number;
    frequency_per_week?: number;
    duration_seconds?: number;
    instructions?: string;
  }>>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    const result = await getExercises({});
    if (result.data) {
      setExercises(result.data);
    }
  };

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    setSelectedExercises([
      ...selectedExercises,
      {
        exercise_id: exerciseId,
        exercise_name: exercise.name,
        sets: 3,
        reps: 10,
        frequency_per_week: 3,
      },
    ]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleUpdateExercise = (index: number, field: string, value: any) => {
    const updated = [...selectedExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSelectedExercises(updated);
  };

  const handlePrescribe = async () => {
    setLoading(true);
    try {
      for (const exercise of selectedExercises) {
        await prescribeExercise({
          patient_id: patientId,
          exercise_id: exercise.exercise_id,
          sets: exercise.sets,
          reps: exercise.reps,
          frequency_per_week: exercise.frequency_per_week,
          duration_seconds: exercise.duration_seconds,
          instructions: exercise.instructions,
        });
      }
      toast.success('Exercícios prescritos com sucesso!');
      setSelectedExercises([]);
      onPrescribe?.();
    } catch (error) {
      toast.error('Erro ao prescrever exercícios');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prescrição de Exercícios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seletor de exercício */}
        <div className="space-y-2">
          <Label>Adicionar Exercício</Label>
          <div className="flex gap-2">
            <Select onValueChange={handleAddExercise}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um exercício" />
              </SelectTrigger>
              <SelectContent>
                {exercises.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Lista de exercícios selecionados */}
        {selectedExercises.length > 0 && (
          <div className="space-y-4">
            {selectedExercises.map((exercise, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{exercise.exercise_name}</CardTitle>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveExercise(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Séries</Label>
                      <Input
                        type="number"
                        value={exercise.sets || ''}
                        onChange={(e) => handleUpdateExercise(index, 'sets', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Repetições</Label>
                      <Input
                        type="number"
                        value={exercise.reps || ''}
                        onChange={(e) => handleUpdateExercise(index, 'reps', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Frequência/Semana</Label>
                      <Input
                        type="number"
                        value={exercise.frequency_per_week || ''}
                        onChange={(e) => handleUpdateExercise(index, 'frequency_per_week', parseInt(e.target.value) || 0)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Duração (seg)</Label>
                      <Input
                        type="number"
                        value={exercise.duration_seconds || ''}
                        onChange={(e) => handleUpdateExercise(index, 'duration_seconds', parseInt(e.target.value) || 0)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Instruções</Label>
                    <Input
                      value={exercise.instructions || ''}
                      onChange={(e) => handleUpdateExercise(index, 'instructions', e.target.value)}
                      placeholder="Instruções específicas..."
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button onClick={handlePrescribe} disabled={loading} className="w-full">
              {loading ? 'Prescrevendo...' : 'Prescrever Exercícios'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

