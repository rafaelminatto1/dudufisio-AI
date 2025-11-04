/**
 * Preview de Protocolo
 * Visualização resumida dos exercícios do protocolo
 */

import React from 'react';
import { ExerciseProtocol, ProtocolExercise } from '../../types/exercise';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Clock, Repeat, Dumbbell, Timer } from 'lucide-react';

interface ProtocolPreviewProps {
  protocol: Partial<ExerciseProtocol>;
  exercises: ProtocolExercise[];
}

export const ProtocolPreview: React.FC<ProtocolPreviewProps> = ({
  protocol,
  exercises,
}) => {
  const totalSets = exercises.reduce((sum, ex) => sum + ex.sets, 0);
  const totalReps = exercises.reduce((sum, ex) => sum + (ex.reps * ex.sets), 0);
  const avgRestTime = exercises.length > 0
    ? Math.round(exercises.reduce((sum, ex) => sum + (ex.restTime || 0), 0) / exercises.length)
    : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preview do Protocolo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Resumo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Exercícios</p>
              <p className="text-sm font-medium">{exercises.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Repeat className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Total de Séries</p>
              <p className="text-sm font-medium">{totalSets}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Total de Reps</p>
              <p className="text-sm font-medium">{totalReps}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500">Descanso Médio</p>
              <p className="text-sm font-medium">{avgRestTime}s</p>
            </div>
          </div>
        </div>

        {/* Info do Protocolo */}
        {protocol.name && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">{protocol.name}</h4>
            {protocol.description && (
              <p className="text-sm text-gray-600 mb-2">{protocol.description}</p>
            )}
            <div className="flex gap-2">
              {protocol.duration && (
                <Badge variant="outline">
                  {protocol.duration} semanas
                </Badge>
              )}
              {protocol.frequency && (
                <Badge variant="outline">
                  {protocol.frequency}x / semana
                </Badge>
              )}
              {protocol.intensity && (
                <Badge variant="outline">
                  Intensidade: {
                    protocol.intensity === 'low' ? 'Baixa' :
                    protocol.intensity === 'moderate' ? 'Moderada' :
                    protocol.intensity === 'high' ? 'Alta' : 'Muito Alta'
                  }
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Lista de Exercícios */}
        {exercises.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Exercícios ({exercises.length})</h4>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {exercises.map((ex, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-primary">#{ex.order}</span>
                          <span className="font-medium text-gray-900">
                            {ex.exercise?.name || 'Exercício'}
                          </span>
                          {ex.isOptional && (
                            <Badge variant="secondary" className="text-xs">
                              Opcional
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-3 text-sm text-gray-600">
                          <span>{ex.sets} séries</span>
                          <span>{ex.reps} reps</span>
                          {ex.weight && <span>{ex.weight}kg</span>}
                          {ex.duration && <span>{ex.duration}min</span>}
                          {ex.restTime && <span>{ex.restTime}s descanso</span>}
                        </div>
                        {ex.notes && (
                          <p className="text-xs text-gray-500 mt-1">{ex.notes}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {exercises.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum exercício adicionado ainda</p>
            <p className="text-sm">Use o seletor acima para adicionar exercícios</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

