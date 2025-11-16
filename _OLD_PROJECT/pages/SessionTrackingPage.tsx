/**
 * Página de Registro de Sessões
 * Tracking de progresso de exercícios
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useExercise } from '../contexts/ExerciseContext';
import { usePatient } from '../contexts/PatientContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { ArrowLeft, Save, Plus } from 'lucide-react';

interface SessionExerciseData {
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number;
  weight?: number;
  duration?: number;
  restTime?: number;
  difficulty: number;
  painLevel: number;
  completionRate: number;
  notes: string;
  isCompleted: boolean;
}

const SessionTrackingPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get('assignment');

  const { assignments, getPatientAssignments } = useExercise();
  const { patients, getAllPatients } = usePatient();

  const [selectedPatient, setSelectedPatient] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionExercises, setSessionExercises] = useState<SessionExerciseData[]>([]);
  const [sessionNotes, setSessionNotes] = useState('');
  const [overallRating, setOverallRating] = useState(5);

  useEffect(() => {
    getAllPatients();
    
    if (assignmentId) {
      const assignment = assignments.find(a => a.id === assignmentId);
      if (assignment) {
        setSelectedPatient(assignment.patientId);
        // Pré-carregar com o exercício da atribuição
        setSessionExercises([{
          exerciseId: assignment.exerciseId,
          exerciseName: assignment.exercise.name,
          sets: 3,
          reps: 12,
          difficulty: 5,
          painLevel: 1,
          completionRate: 100,
          notes: '',
          isCompleted: true,
        }]);
      }
    }
  }, [assignmentId, assignments]);

  // Carregar atribuições do paciente selecionado
  useEffect(() => {
    if (selectedPatient) {
      getPatientAssignments(selectedPatient);
    }
  }, [selectedPatient]);

  const patientAssignments = assignments.filter(a => a.patientId === selectedPatient && a.isActive);

  const updateExerciseData = (index: number, field: keyof SessionExerciseData, value: any) => {
    const updated = [...sessionExercises];
    updated[index] = { ...updated[index], [field]: value };
    setSessionExercises(updated);
  };

  const removeExercise = (index: number) => {
    setSessionExercises(sessionExercises.filter((_, i) => i !== index));
  };

  const addExerciseFromAssignment = (assignmentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    if (assignment) {
      setSessionExercises([...sessionExercises, {
        exerciseId: assignment.exerciseId,
        exerciseName: assignment.exercise.name,
        sets: 3,
        reps: 12,
        difficulty: 5,
        painLevel: 1,
        completionRate: 100,
        notes: '',
        isCompleted: true,
      }]);
    }
  };

  const handleSave = async () => {
    if (!selectedPatient) {
      alert('Selecione um paciente');
      return;
    }

    if (sessionExercises.length === 0) {
      alert('Adicione pelo menos um exercício');
      return;
    }

    const sessionData = {
      patientId: selectedPatient,
      sessionDate: new Date(sessionDate),
      exercises: sessionExercises,
      notes: sessionNotes,
      overallRating,
      isCompleted: true,
    };

    
    // Aqui você implementaria a gravação real
    navigate('/assignments');
  };

  return (
    <div className="p-lg space-y-xl max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/assignments')}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-text">Registrar Sessão</h1>
            <p className="text-gray-500 mt-xs">
              Registre o progresso do paciente nos exercícios
            </p>
          </div>
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-sm" />
          Salvar Sessão
        </Button>
      </div>

      {/* Informações da Sessão */}
      <Card>
        <CardHeader>
          <CardTitle>Informações da Sessão</CardTitle>
          <CardDescription>
            Dados gerais do atendimento
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-md">
          <div className="grid grid-cols-2 gap-md">
            {/* Paciente */}
            <div className="space-y-sm">
              <Label>Paciente *</Label>
              <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map(patient => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data */}
            <div className="space-y-sm">
              <Label>Data da Sessão *</Label>
              <Input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>
          </div>

          {/* Avaliação Geral */}
          <div className="space-y-sm">
            <Label>Avaliação Geral da Sessão (1-10)</Label>
            <div className="flex items-center gap-md">
              <Input
                type="range"
                min={1}
                max={10}
                value={overallRating}
                onChange={(e) => setOverallRating(parseInt(e.target.value))}
                className="flex-1"
              />
              <Badge className="min-w-[3rem] justify-center">
                {overallRating}/10
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exercícios da Sessão */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Exercícios Realizados</CardTitle>
              <CardDescription>
                Registre o desempenho em cada exercício
              </CardDescription>
            </div>
            {selectedPatient && patientAssignments.length > 0 && (
              <Select onValueChange={addExerciseFromAssignment}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Adicionar exercício" />
                </SelectTrigger>
                <SelectContent>
                  {patientAssignments.map(assign => (
                    <SelectItem key={assign.id} value={assign.id}>
                      {assign.exercise.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          {sessionExercises.map((exercise, index) => (
            <Card key={index} className="p-md">
              <div className="space-y-md">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{exercise.exerciseName}</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeExercise(index)}
                    className="text-error"
                  >
                    Remover
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-md">
                  <div>
                    <Label className="text-xs">Séries</Label>
                    <Input
                      type="number"
                      min={0}
                      value={exercise.sets}
                      onChange={(e) => updateExerciseData(index, 'sets', parseInt(e.target.value))}
                      className="mt-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Repetições</Label>
                    <Input
                      type="number"
                      min={0}
                      value={exercise.reps}
                      onChange={(e) => updateExerciseData(index, 'reps', parseInt(e.target.value))}
                      className="mt-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Peso (kg)</Label>
                    <Input
                      type="number"
                      min={0}
                      step={0.5}
                      value={exercise.weight || ''}
                      onChange={(e) => updateExerciseData(index, 'weight', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="mt-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-md">
                  <div>
                    <Label className="text-xs">Dificuldade (1-10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={exercise.difficulty}
                      onChange={(e) => updateExerciseData(index, 'difficulty', parseInt(e.target.value))}
                      className="mt-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Dor (1-10)</Label>
                    <Input
                      type="number"
                      min={1}
                      max={10}
                      value={exercise.painLevel}
                      onChange={(e) => updateExerciseData(index, 'painLevel', parseInt(e.target.value))}
                      className="mt-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Conclusão (%)</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={exercise.completionRate}
                      onChange={(e) => updateExerciseData(index, 'completionRate', parseInt(e.target.value))}
                      className="mt-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Observações</Label>
                  <Textarea
                    value={exercise.notes}
                    onChange={(e) => updateExerciseData(index, 'notes', e.target.value)}
                    placeholder="Notas sobre a execução..."
                    rows={2}
                    className="mt-xs"
                  />
                </div>
              </div>
            </Card>
          ))}

          {sessionExercises.length === 0 && (
            <div className="text-center py-3xl text-gray-500">
              <p className="mb-sm">Nenhum exercício adicionado</p>
              {selectedPatient && patientAssignments.length > 0 ? (
                <p className="text-sm">Use o dropdown acima para adicionar exercícios atribuídos</p>
              ) : (
                <p className="text-sm">Selecione um paciente primeiro</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas Gerais */}
      <Card>
        <CardHeader>
          <CardTitle>Notas da Sessão</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={sessionNotes}
            onChange={(e) => setSessionNotes(e.target.value)}
            placeholder="Observações gerais da sessão..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-sm">
        <Button variant="outline" onClick={() => navigate('/assignments')}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-sm" />
          Salvar Sessão
        </Button>
      </div>
    </div>
  );
};

export default SessionTrackingPage;

