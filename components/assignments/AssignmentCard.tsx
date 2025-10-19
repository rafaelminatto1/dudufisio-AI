/**
 * Card de Atribuição
 * Visualização de exercício atribuído a paciente
 */

import React from 'react';
import { ExerciseAssignment } from '../../types/exercise';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  User,
  Activity,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Edit,
  MoreHorizontal,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface AssignmentCardProps {
  assignment: ExerciseAssignment;
}

const statusConfig = {
  assigned: {
    label: 'Atribuído',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock,
  },
  in_progress: {
    label: 'Em Progresso',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Play,
  },
  completed: {
    label: 'Concluído',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle,
  },
  paused: {
    label: 'Pausado',
    color: 'bg-gray-100 text-gray-800',
    icon: Pause,
  },
  cancelled: {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: XCircle,
  },
};

export const AssignmentCard: React.FC<AssignmentCardProps> = ({ assignment }) => {
  const navigate = useNavigate();
  const config = statusConfig[assignment.status];
  const StatusIcon = config.icon;

  // Calcular progresso
  const totalSessions = assignment.progress?.length || 0;
  const completedSessions = assignment.progress?.filter(p => p.completionRate === 100).length || 0;
  const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

  // Calcular dias desde início
  const daysSinceStart = Math.floor(
    (new Date().getTime() - new Date(assignment.startDate).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg ${config.color}`}>
            <StatusIcon className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {assignment.exercise?.name}
                </h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>Paciente ID: {assignment.patientId.substring(0, 8)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>Início: {new Date(assignment.startDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4" />
                    <span>{daysSinceStart} dias</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Badge className={config.color}>
                  {config.label}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/assignments/${assignment.id}`)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/session-tracking?assignment=${assignment.id}`)}>
                      <Play className="mr-2 h-4 w-4" />
                      Registrar Sessão
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pause className="mr-2 h-4 w-4" />
                      Pausar
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Marcar Concluído
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Instructions */}
            {assignment.instructions && (
              <p className="text-sm text-gray-600">
                {assignment.instructions}
              </p>
            )}

            {/* Progress */}
            {totalSessions > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Progresso</span>
                  <span className="font-medium">
                    {completedSessions} / {totalSessions} sessões
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>
            )}

            {/* Footer Info */}
            <div className="flex items-center gap-4 text-xs text-gray-500 pt-2 border-t">
              <span>
                Atribuído em: {new Date(assignment.assignedAt).toLocaleDateString()}
              </span>
              {assignment.endDate && (
                <span>
                  Término previsto: {new Date(assignment.endDate).toLocaleDateString()}
                </span>
              )}
              {assignment.protocol && (
                <Badge variant="outline" className="text-xs">
                  Protocolo
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

