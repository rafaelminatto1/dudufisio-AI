/**
 * Seção de Exercícios Atribuídos ao Paciente
 * Integração do sistema de exercícios com detalhes do paciente
 */

import React, { useEffect, useState } from 'react';
import { ExerciseAssignment } from '../../types/exercise';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { AssignExerciseModal } from '../assignments/AssignExerciseModal';
import {
  Plus,
  Activity,
  Calendar,
  TrendingUp,
  CheckCircle,
  Clock,
  Play,
  ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ExerciseAssignmentSectionProps {
  patientId: string;
}

const statusConfig = {
  assigned: { label: 'Atribuído', color: 'bg-blue-100 text-blue-800', icon: Clock },
  in_progress: { label: 'Em Progresso', color: 'bg-yellow-100 text-yellow-800', icon: Play },
  completed: { label: 'Concluído', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  paused: { label: 'Pausado', color: 'bg-gray-100 text-gray-800', icon: Clock },
  cancelled: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: Clock },
};

export const ExerciseAssignmentSection: React.FC<ExerciseAssignmentSectionProps> = ({
  patientId,
}) => {
  const navigate = useNavigate();
  const { assignments, getPatientAssignments, isLoading } = useExercise();
  
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [patientAssignments, setPatientAssignments] = useState<ExerciseAssignment[]>([]);

  useEffect(() => {
    loadAssignments();
  }, [patientId]);

  const loadAssignments = async () => {
    const data = await getPatientAssignments(patientId);
    setPatientAssignments(data);
  };

  const activeAssignments = patientAssignments.filter(a => a.isActive);
  const completedAssignments = patientAssignments.filter(a => a.status === 'completed');

  // Estatísticas
  const stats = {
    total: patientAssignments.length,
    active: activeAssignments.length,
    completed: completedAssignments.length,
    totalSessions: patientAssignments.reduce((sum, a) => sum + (a.progress?.length || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Exercícios Atribuídos</h2>
          <p className="text-gray-500 mt-1">
            Acompanhe os exercícios e protocolos deste paciente
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/session-tracking?patient=${patientId}`)}
          >
            <Play className="h-4 w-4 mr-2" />
            Registrar Sessão
          </Button>
          <Button onClick={() => setShowAssignModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Atribuir Exercício
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Atribuições</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ativos</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
            <p className="text-xs text-muted-foreground">Em andamento</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sessões</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSessions}</div>
            <p className="text-xs text-muted-foreground">Registradas</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Atribuições Ativas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Atribuições Ativas</CardTitle>
              <CardDescription>
                Exercícios e protocolos em andamento
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/assignments')}
            >
              Ver Todas
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {activeAssignments.length > 0 ? (
            <div className="space-y-3">
              {activeAssignments.slice(0, 5).map((assignment) => {
                const config = statusConfig[assignment.status];
                const StatusIcon = config.icon;
                const totalSessions = assignment.progress?.length || 0;
                const completedSessions = assignment.progress?.filter(p => p.completionRate === 100).length || 0;
                const progressPercentage = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

                return (
                  <Card key={assignment.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${config.color}`}>
                        <StatusIcon className="h-4 w-4" />
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {assignment.exercise.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                              <Calendar className="h-3 w-3" />
                              <span>
                                Início: {new Date(assignment.startDate).toLocaleDateString()}
                              </span>
                              {assignment.protocol && (
                                <Badge variant="outline" className="text-xs">
                                  Protocolo
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Badge className={config.color}>
                            {config.label}
                          </Badge>
                        </div>

                        {assignment.instructions && (
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {assignment.instructions}
                          </p>
                        )}

                        {totalSessions > 0 && (
                          <div className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-gray-600">Progresso</span>
                              <span className="font-medium">
                                {completedSessions} / {totalSessions} sessões
                              </span>
                            </div>
                            <Progress value={progressPercentage} className="h-1.5" />
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}

              {activeAssignments.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/assignments')}
                >
                  Ver Todas ({activeAssignments.length})
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="mb-2">Nenhum exercício atribuído ainda</p>
              <Button onClick={() => setShowAssignModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Atribuir Primeiro Exercício
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Progresso */}
      {stats.totalSessions > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resumo de Progresso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalSessions}</div>
                <p className="text-sm text-gray-600">Sessões Totais</p>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((stats.completed / stats.total) * 100)}%
                </div>
                <p className="text-sm text-gray-600">Taxa de Conclusão</p>
              </div>
              <div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/progress-dashboard?patient=${patientId}`)}
                >
                  Ver Dashboard Completo
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de Atribuição */}
      <AssignExerciseModal
        open={showAssignModal}
        onClose={() => {
          setShowAssignModal(false);
          loadAssignments(); // Recarregar após atribuir
        }}
        preSelectedPatientId={patientId}
      />
    </div>
  );
};

