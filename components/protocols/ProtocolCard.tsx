/**
 * Card de Protocolo
 * Visualização compacta para lista/grid
 */

import React from 'react';
import { ExerciseProtocol } from '../../types/exercise';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Edit, Trash2, Copy, Users, Clock, Zap } from 'lucide-react';

interface ProtocolCardProps {
  protocol: ExerciseProtocol;
  onEdit?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
}

const intensityColors: Record<string, string> = {
  low: 'bg-green-100 text-green-800',
  moderate: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  very_high: 'bg-red-100 text-red-800',
};

const intensityLabels: Record<string, string> = {
  low: 'Baixa',
  moderate: 'Moderada',
  high: 'Alta',
  very_high: 'Muito Alta',
};

export const ProtocolCard: React.FC<ProtocolCardProps> = ({
  protocol,
  onEdit,
  onDelete,
  onDuplicate,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{protocol.name}</CardTitle>
            <p className="text-sm text-gray-600 line-clamp-2">
              {protocol.description}
            </p>
          </div>
          <Badge 
            variant={protocol.isActive ? 'default' : 'secondary'}
            className="ml-2"
          >
            {protocol.isActive ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Intensidade */}
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-gray-400" />
          <Badge className={intensityColors[protocol.intensity]}>
            {intensityLabels[protocol.intensity]}
          </Badge>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {protocol.exercises.length} exercícios
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-gray-600">
              {protocol.duration} semanas
            </span>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <span className="text-gray-600">
              {protocol.frequency}x por semana
            </span>
          </div>
        </div>

        {/* Condições Alvo */}
        {protocol.targetConditions.length > 0 && (
          <div>
            <p className="text-xs text-gray-500 mb-1">Condições Alvo:</p>
            <div className="flex flex-wrap gap-1">
              {protocol.targetConditions.slice(0, 3).map((condition, idx) => (
                <Badge key={idx} variant="outline" className="text-xs">
                  {condition}
                </Badge>
              ))}
              {protocol.targetConditions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{protocol.targetConditions.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2 border-t pt-4">
        {onEdit && (
          <Button variant="outline" size="sm" onClick={onEdit} className="flex-1">
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        )}
        {onDuplicate && (
          <Button variant="outline" size="sm" onClick={onDuplicate}>
            <Copy className="h-4 w-4" />
          </Button>
        )}
        {onDelete && (
          <Button variant="outline" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

