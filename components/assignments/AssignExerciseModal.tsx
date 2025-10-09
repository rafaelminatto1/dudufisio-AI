/**
 * Modal de Atribuição de Exercícios
 * Interface para atribuir exercícios ou protocolos a pacientes
 */

import React, { useState, useEffect } from 'react';
import { useExercise } from '../../contexts/ExerciseContext';
import { usePatient } from '../../contexts/PatientContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Calendar } from 'lucide-react';

interface AssignExerciseModalProps {
  open: boolean;
  onClose: () => void;
  preSelectedPatientId?: string;
  preSelectedExerciseId?: string;
}

export const AssignExerciseModal: React.FC<AssignExerciseModalProps> = ({
  open,
  onClose,
  preSelectedPatientId,
  preSelectedExerciseId,
}) => {
  const { exercises, protocols, assignExerciseToPatient, getAllExercises, getAllProtocols } = useExercise();
  const { patients, getAllPatients } = usePatient();

  const [selectedPatient, setSelectedPatient] = useState(preSelectedPatientId || '');
  const [selectedExercise, setSelectedExercise] = useState(preSelectedExerciseId || '');
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [assignType, setAssignType] = useState<'exercise' | 'protocol'>('exercise');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [instructions, setInstructions] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      getAllPatients();
      getAllExercises();
      getAllProtocols();
    }
  }, [open]);

  const handleAssign = async () => {
    if (!selectedPatient) {
      alert('Selecione um paciente');
      return;
    }

    if (assignType === 'exercise' && !selectedExercise) {
      alert('Selecione um exercício');
      return;
    }

    if (assignType === 'protocol' && !selectedProtocol) {
      alert('Selecione um protocolo');
      return;
    }

    try {
      const data = {
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : undefined,
        instructions,
        notes,
        status: 'assigned' as const,
        protocolId: assignType === 'protocol' ? selectedProtocol : undefined,
      };

      if (assignType === 'exercise') {
        await assignExerciseToPatient(selectedPatient, selectedExercise, data);
      } else {
        // Atribuir todos exercícios do protocolo
        const protocol = protocols.find(p => p.id === selectedProtocol);
        if (protocol) {
          for (const protocolEx of protocol.exercises) {
            await assignExerciseToPatient(selectedPatient, protocolEx.exerciseId, {
              ...data,
              protocolId: protocol.id,
            });
          }
        }
      }

      console.log('✅ Exercício(s) atribuído(s) com sucesso');
      handleClose();
    } catch (error) {
      console.error('❌ Erro ao atribuir:', error);
    }
  };

  const handleClose = () => {
    setSelectedPatient('');
    setSelectedExercise('');
    setSelectedProtocol('');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setInstructions('');
    setNotes('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Atribuir Exercício</DialogTitle>
          <DialogDescription>
            Atribua um exercício ou protocolo a um paciente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Tipo de Atribuição */}
          <Tabs value={assignType} onValueChange={(v) => setAssignType(v as any)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="exercise">Exercício Individual</TabsTrigger>
              <TabsTrigger value="protocol">Protocolo Completo</TabsTrigger>
            </TabsList>

            <TabsContent value="exercise" className="space-y-4 mt-4">
              {/* Paciente */}
              <div className="space-y-2">
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

              {/* Exercício */}
              <div className="space-y-2">
                <Label>Exercício *</Label>
                <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um exercício" />
                  </SelectTrigger>
                  <SelectContent>
                    {exercises.filter(ex => ex.isActive).map(exercise => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name} - {exercise.difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="protocol" className="space-y-4 mt-4">
              {/* Paciente */}
              <div className="space-y-2">
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

              {/* Protocolo */}
              <div className="space-y-2">
                <Label>Protocolo *</Label>
                <Select value={selectedProtocol} onValueChange={setSelectedProtocol}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um protocolo" />
                  </SelectTrigger>
                  <SelectContent>
                    {protocols.filter(p => p.isActive).map(protocol => (
                      <SelectItem key={protocol.id} value={protocol.id}>
                        {protocol.name} - {protocol.exercises.length} exercícios
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Info do Protocolo */}
              {selectedProtocol && (() => {
                const protocol = protocols.find(p => p.id === selectedProtocol);
                return protocol ? (
                  <div className="p-3 bg-blue-50 rounded-lg space-y-1">
                    <p className="text-sm font-medium text-blue-900">{protocol.name}</p>
                    <p className="text-xs text-blue-700">{protocol.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {protocol.duration} semanas
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {protocol.frequency}x/semana
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {protocol.exercises.length} exercícios
                      </Badge>
                    </div>
                  </div>
                ) : null;
              })()}
            </TabsContent>
          </Tabs>

          {/* Datas */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data de Início *</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Data de Término</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate}
              />
            </div>
          </div>

          {/* Instruções */}
          <div className="space-y-2">
            <Label>Instruções Específicas</Label>
            <Textarea
              placeholder="Instruções personalizadas para este paciente..."
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              rows={3}
            />
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <Label>Observações</Label>
            <Textarea
              placeholder="Notas adicionais..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleAssign}>
            Atribuir {assignType === 'protocol' ? 'Protocolo' : 'Exercício'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

