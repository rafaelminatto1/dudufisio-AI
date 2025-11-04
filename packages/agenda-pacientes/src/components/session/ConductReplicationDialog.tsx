/**
 * ConductReplicationDialog - Diálogo para replicação seletiva de condutas
 * Permite ao fisioterapeuta copiar campos específicos de sessões anteriores
 */

import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Checkbox } from '../ui/checkbox';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { SoapNote } from '../../types';
import { Copy, Check, X } from 'lucide-react';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

export interface ConductFields {
  techniques?: string[];
  exercises?: string[];
  equipment?: string[];
  homeExercises?: string[];
  recommendations?: string;
  duration?: number;
  frequency?: string;
}

interface ConductReplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedFields: ConductFields) => void;
  previousSessions: SoapNote[];
  patientName: string;
}

interface FieldSelection {
  techniques: boolean;
  exercises: boolean;
  equipment: boolean;
  homeExercises: boolean;
  recommendations: boolean;
  duration: boolean;
  frequency: boolean;
}

export const ConductReplicationDialog: React.FC<ConductReplicationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  previousSessions,
  patientName
}) => {
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);
  const [fieldSelection, setFieldSelection] = useState<FieldSelection>({
    techniques: false,
    exercises: false,
    equipment: false,
    homeExercises: false,
    recommendations: false,
    duration: false,
    frequency: false
  });

  const selectedSession = previousSessions[selectedSessionIndex];

  // Extrair campos da sessão selecionada
  const extractedFields = useMemo(() => {
    if (!selectedSession) return null;

    return {
      techniques: extractListFromText(selectedSession.objective, ['técnica', 'manipulação', 'mobilização']),
      exercises: extractListFromText(selectedSession.objective, ['exercício', 'treino', 'fortalecimento']),
      equipment: extractListFromText(selectedSession.objective, ['equipamento', 'aparelho', 'banda']),
      homeExercises: extractListFromText(selectedSession.plan, ['domiciliar', 'casa', 'home']),
      recommendations: selectedSession.plan || '',
      duration: 60, // Valor padrão
      frequency: '3x por semana' // Valor padrão
    };
  }, [selectedSession]);

  const handleFieldToggle = (field: keyof FieldSelection) => {
    setFieldSelection(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleApply = () => {
    if (!extractedFields) return;

    const selectedFields: ConductFields = {};
    
    if (fieldSelection.techniques && extractedFields.techniques.length > 0) {
      selectedFields.techniques = extractedFields.techniques;
    }
    if (fieldSelection.exercises && extractedFields.exercises.length > 0) {
      selectedFields.exercises = extractedFields.exercises;
    }
    if (fieldSelection.equipment && extractedFields.equipment.length > 0) {
      selectedFields.equipment = extractedFields.equipment;
    }
    if (fieldSelection.homeExercises && extractedFields.homeExercises.length > 0) {
      selectedFields.homeExercises = extractedFields.homeExercises;
    }
    if (fieldSelection.recommendations && extractedFields.recommendations) {
      selectedFields.recommendations = extractedFields.recommendations;
    }
    if (fieldSelection.duration) {
      selectedFields.duration = extractedFields.duration;
    }
    if (fieldSelection.frequency) {
      selectedFields.frequency = extractedFields.frequency;
    }

    onConfirm(selectedFields);
    onClose();
  };

  const hasSelection = Object.values(fieldSelection).some(Boolean);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Copy className="w-5 h-5 text-blue-600" />
            Replicar Conduta Anterior
          </DialogTitle>
          <DialogDescription>
            Selecione quais campos da sessão anterior deseja copiar para a nova sessão de {patientName}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-6">
          {/* Coluna Esquerda: Seleção de Sessão */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Selecione a Sessão</Label>
              <ScrollArea className="h-64 mt-2 border rounded-md">
                <div className="p-2 space-y-2">
                  {previousSessions.map((session, index) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSessionIndex(index)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        selectedSessionIndex === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-sm">
                            Sessão {session.sessionNumber || index + 1}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            {format(new Date(session.date), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        </div>
                        {selectedSessionIndex === index && (
                          <Check className="w-4 h-4 text-blue-600" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Preview da Sessão Selecionada */}
            {selectedSession && (
              <div className="border rounded-lg p-4 bg-slate-50">
                <h4 className="font-medium text-sm mb-2">Preview da Sessão</h4>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="font-medium">Subjetivo:</span>
                    <p className="text-slate-600 mt-1 line-clamp-2">{selectedSession.subjective}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="font-medium">Objetivo:</span>
                    <p className="text-slate-600 mt-1 line-clamp-2">{selectedSession.objective}</p>
                  </div>
                  <Separator />
                  <div>
                    <span className="font-medium">Plano:</span>
                    <p className="text-slate-600 mt-1 line-clamp-2">{selectedSession.plan}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Coluna Direita: Seleção de Campos */}
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Selecione os Campos para Replicar</Label>
              <div className="mt-2 space-y-3">
                {/* Técnicas */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="techniques"
                    checked={fieldSelection.techniques}
                    onCheckedChange={() => handleFieldToggle('techniques')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="techniques" className="cursor-pointer">
                      <div className="font-medium text-sm">Técnicas Aplicadas</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {extractedFields?.techniques.length || 0} técnica(s) encontrada(s)
                      </div>
                    </Label>
                    {fieldSelection.techniques && extractedFields?.techniques.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {extractedFields.techniques.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercícios */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="exercises"
                    checked={fieldSelection.exercises}
                    onCheckedChange={() => handleFieldToggle('exercises')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="exercises" className="cursor-pointer">
                      <div className="font-medium text-sm">Exercícios Prescritos</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {extractedFields?.exercises.length || 0} exercício(s) encontrado(s)
                      </div>
                    </Label>
                    {fieldSelection.exercises && extractedFields?.exercises.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {extractedFields.exercises.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Equipamentos */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="equipment"
                    checked={fieldSelection.equipment}
                    onCheckedChange={() => handleFieldToggle('equipment')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="equipment" className="cursor-pointer">
                      <div className="font-medium text-sm">Equipamentos Utilizados</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {extractedFields?.equipment.length || 0} equipamento(s) encontrado(s)
                      </div>
                    </Label>
                    {fieldSelection.equipment && extractedFields?.equipment.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {extractedFields.equipment.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Exercícios Domiciliares */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="homeExercises"
                    checked={fieldSelection.homeExercises}
                    onCheckedChange={() => handleFieldToggle('homeExercises')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="homeExercises" className="cursor-pointer">
                      <div className="font-medium text-sm">Exercícios Domiciliares</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {extractedFields?.homeExercises.length || 0} exercício(s) encontrado(s)
                      </div>
                    </Label>
                    {fieldSelection.homeExercises && extractedFields?.homeExercises.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {extractedFields.homeExercises.map((item, idx) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Recomendações */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="recommendations"
                    checked={fieldSelection.recommendations}
                    onCheckedChange={() => handleFieldToggle('recommendations')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="recommendations" className="cursor-pointer">
                      <div className="font-medium text-sm">Recomendações</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Copiar plano de tratamento
                      </div>
                    </Label>
                  </div>
                </div>

                {/* Duração */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="duration"
                    checked={fieldSelection.duration}
                    onCheckedChange={() => handleFieldToggle('duration')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="duration" className="cursor-pointer">
                      <div className="font-medium text-sm">Duração da Sessão</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {extractedFields?.duration} minutos
                      </div>
                    </Label>
                  </div>
                </div>

                {/* Frequência */}
                <div className="flex items-start space-x-3 p-3 border rounded-lg">
                  <Checkbox
                    id="frequency"
                    checked={fieldSelection.frequency}
                    onCheckedChange={() => handleFieldToggle('frequency')}
                  />
                  <div className="flex-1">
                    <Label htmlFor="frequency" className="cursor-pointer">
                      <div className="font-medium text-sm">Frequência de Retorno</div>
                      <div className="text-xs text-slate-500 mt-1">
                        {extractedFields?.frequency}
                      </div>
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-slate-600">
            {hasSelection ? (
              <span className="text-green-600 font-medium">
                {Object.values(fieldSelection).filter(Boolean).length} campo(s) selecionado(s)
              </span>
            ) : (
              'Nenhum campo selecionado'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
            <Button onClick={handleApply} disabled={!hasSelection}>
              <Check className="w-4 h-4 mr-2" />
              Aplicar Conduta
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// Função auxiliar para extrair listas de texto
function extractListFromText(text: string, keywords: string[]): string[] {
  if (!text) return [];
  
  const sentences = text.split(/[.!?;]/).filter(s => s.trim());
  const foundItems: string[] = [];
  
  sentences.forEach(sentence => {
    keywords.forEach(keyword => {
      if (sentence.toLowerCase().includes(keyword.toLowerCase())) {
        // Extrair a parte relevante da frase
        const match = sentence.match(new RegExp(`([^.!?]*${keyword}[^.!?]*)`, 'i'));
        if (match) {
          foundItems.push(match[1].trim());
        }
      }
    });
  });
  
  return [...new Set(foundItems)]; // Remove duplicatas
}

export default ConductReplicationDialog;

