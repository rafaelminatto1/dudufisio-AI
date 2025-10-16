/**
 * components/patient/GoalsCard.tsx
 * 
 * Card de metas ativas com progress bars e predição
 */

import React, { useState, useEffect } from 'react';
import { Target, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { goalsService } from '@/services/supabase/goalsService';
import { PatientGoal } from '@/types';
import { StatusBadge } from '@/components/ui/StatusBadge';

interface GoalsCardProps {
  patientId: string;
}

export function GoalsCard({ patientId }: GoalsCardProps) {
  const [goals, setGoals] = useState<PatientGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [historicalSuccessRate, setHistoricalSuccessRate] = useState(0);

  useEffect(() => {
    loadGoals();
  }, [patientId]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const activeGoals = await goalsService.getActiveGoals(patientId);
      setGoals(activeGoals);
      
      const rate = await goalsService.getHistoricalSuccessRate(patientId);
      setHistoricalSuccessRate(rate);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'performance': return '🏃';
      case 'recovery': return '💊';
      case 'fitness': return '💪';
      case 'lifestyle': return '🏠';
      case 'medical': return '🏥';
      case 'mobility': return '🚶';
      case 'strength': return '⚡';
      case 'pain_reduction': return '😌';
      case 'functional': return '✨';
      default: return '🎯';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'medium': return 'bg-health-info-100 text-health-info-700 border-health-info-300';
      case 'high': return 'bg-health-warning-100 text-health-warning-700 border-health-warning-300';
      case 'critical': return 'bg-health-danger-100 text-health-danger-700 border-health-danger-300';
      default: return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      case 'critical': return 'Crítica';
      default: return 'Média';
    }
  };

  const goalsAtRisk = goals.filter(g => g.currentProgress < 50);

  if (loading) {
    return (
      <Card className="border-l-4 border-l-health-success-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-health-success-500" />
            Metas Ativas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-health-success-500 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-l-4 border-l-health-success-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5 text-health-success-500" />
          Metas Ativas
          <Badge variant="outline" className="ml-auto">{goals.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {goals.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Target className="w-12 h-12 mx-auto mb-4 text-slate-300" />
            <p>Nenhuma meta ativa</p>
          </div>
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {goals.slice(0, 3).map((goal) => {
                const isAtRisk = goal.currentProgress < 50;
                
                return (
                  <div key={goal.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <span className="text-sm">{getCategoryIcon(goal.category)}</span>
                          <h4 className="font-medium text-sm text-slate-900">{goal.title}</h4>
                        </div>
                        {goal.targetDate && (
                          <p className="text-xs text-slate-600">
                            📅 {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                          </p>
                        )}
                      </div>
                      <Badge className={`${getPriorityColor(goal.priority)} text-xs`}>
                        {getPriorityLabel(goal.priority)}
                      </Badge>
                    </div>
                    
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-slate-600">Progresso</span>
                        <span className="text-xs font-semibold text-health-primary-600">
                          {goal.currentProgress}%
                        </span>
                      </div>
                      <Progress value={goal.currentProgress} className="h-1.5" />
                    </div>

                    {isAtRisk && (
                      <div className="mt-2 p-1.5 bg-health-warning-50 rounded text-xs">
                        <p className="text-health-warning-700 font-medium">
                          ⚠️ Meta em risco
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {goals.length > 3 && (
              <p className="text-xs text-center text-slate-500 mb-3">
                +{goals.length - 3} meta(s) adicional(is)
              </p>
            )}

            {/* Taxa de Sucesso Histórica */}
            <div className="p-3 bg-health-success-50 rounded-lg border border-health-success-200">
              <p className="text-xs font-semibold text-health-success-700 mb-2">
                Taxa de Sucesso Histórica
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <Progress value={historicalSuccessRate} className="h-2" />
                </div>
                <span className="text-sm font-bold text-health-success-600">
                  {historicalSuccessRate}%
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {goals.filter(g => g.status === 'completed').length} de {goals.length + goals.filter(g => g.status === 'completed').length} metas alcançadas
              </p>
            </div>

            {/* Alerta de Metas em Risco */}
            {goalsAtRisk.length > 0 && (
              <div className="mt-3 p-2 bg-health-warning-50 rounded border border-health-warning-200">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-health-warning-600" />
                  <p className="text-xs font-medium text-health-warning-700">
                    {goalsAtRisk.length} meta(s) em risco
                  </p>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Progresso abaixo de 50%
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

