/**
 * Timeline de Atribuições
 * Visualização cronológica das atribuições
 */

import React from 'react';
import { ExerciseAssignment } from '../../types/exercise';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import {
  CheckCircle,
  Clock,
  Play,
  Pause,
  XCircle,
  Calendar,
} from 'lucide-react';

interface AssignmentTimelineProps {
  assignments: ExerciseAssignment[];
}

const statusConfig = {
  assigned: {
    icon: Clock,
    color: 'text-blue-600 bg-blue-100',
    label: 'Atribuído',
  },
  in_progress: {
    icon: Play,
    color: 'text-yellow-600 bg-yellow-100',
    label: 'Em Progresso',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600 bg-green-100',
    label: 'Concluído',
  },
  paused: {
    icon: Pause,
    color: 'text-gray-600 bg-gray-100',
    label: 'Pausado',
  },
  cancelled: {
    icon: XCircle,
    color: 'text-red-600 bg-red-100',
    label: 'Cancelado',
  },
};

export const AssignmentTimeline: React.FC<AssignmentTimelineProps> = ({ assignments }) => {
  // Ordenar por data
  const sortedAssignments = [...assignments].sort(
    (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedAssignments.map((assignment, index) => {
        const config = statusConfig[assignment.status];
        const Icon = config.icon;
        const isLast = index === sortedAssignments.length - 1;

        return (
          <div key={assignment.id} className="flex gap-4">
            {/* Timeline Line */}
            <div className="flex flex-col items-center">
              <div className={`p-2 rounded-full ${config.color}`}>
                <Icon className="h-4 w-4" />
              </div>
              {!isLast && (
                <div className="w-0.5 h-full bg-gray-200 my-2" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {assignment.exercise?.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(assignment.assignedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className={config.color.split(' ')[0]}>
                      {config.label}
                    </Badge>
                  </div>

                  {assignment.instructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      {assignment.instructions}
                    </p>
                  )}

                  {assignment.progress && assignment.progress.length > 0 && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>{assignment.progress.length} sessão(ões) registrada(s)</span>
                        <span>
                          Última: {new Date(assignment.progress[assignment.progress.length - 1].sessionDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        );
      })}

      {sortedAssignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma atribuição ainda</p>
        </div>
      )}
    </div>
  );
};

