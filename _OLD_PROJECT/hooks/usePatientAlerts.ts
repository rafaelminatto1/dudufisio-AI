import { useState, useEffect } from 'react';
import { 
  getMandatoryAssessments,
  getAssessmentHistory,
  calculateAssessmentStatistics 
} from '../services/patientTrackingService';
import type { MandatoryAssessment, AssessmentStatistics } from '../types';

export interface PatientAlert {
  id: string;
  type: 'missing_test' | 'regression' | 'reminder' | 'milestone';
  severity: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  actionUrl?: string;
  createdAt: string;
}

export function usePatientAlerts(patientId: string, currentSessionNumber?: number) {
  const [alerts, setAlerts] = useState<PatientAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (patientId) {
      checkAlerts();
    }
  }, [patientId, currentSessionNumber]);

  const checkAlerts = async () => {
    try {
      setLoading(true);
      const newAlerts: PatientAlert[] = [];

      // 1. Verificar testes obrigatórios não aplicados
      const mandatoryTests = await getMandatoryAssessments(patientId, true);
      
      for (const test of mandatoryTests) {
        // Verificar se há testes atrasados
        if (test.endDate && new Date(test.endDate) < new Date()) {
          newAlerts.push({
            id: `missing_test_${test.id}`,
            type: 'missing_test',
            severity: 'high',
            title: 'Teste Obrigatório Vencido',
            message: `O teste obrigatório está com prazo vencido desde ${new Date(test.endDate).toLocaleDateString('pt-BR')}`,
            createdAt: new Date().toISOString()
          });
        }
      }

      // 2. Verificar regressões em métricas
      const assessmentHistory = await getAssessmentHistory(patientId);
      const uniqueFields = [...new Set(assessmentHistory.map(a => a.fieldName))];
      
      for (const fieldName of uniqueFields) {
        try {
          const stats = await calculateAssessmentStatistics(patientId, fieldName);
          
          // Alertar se regressão significativa (>10%)
          if (stats.trend === 'declining' && Math.abs(stats.percentChange) > 10) {
            newAlerts.push({
              id: `regression_${fieldName}`,
              type: 'regression',
              severity: 'high',
              title: `Regressão Detectada: ${fieldName}`,
              message: `Houve uma piora de ${Math.abs(stats.percentChange).toFixed(1)}% nesta métrica. Valor atual: ${stats.latest}${stats.unit || ''}`,
              actionUrl: `/patients/${patientId}?tab=reports`,
              createdAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(`Erro ao verificar estatísticas de ${fieldName}:`, error);
        }
      }

      // 3. Verificar marcos (milestones) próximos
      if (currentSessionNumber) {
        for (const test of mandatoryTests) {
          if (test.frequencyType === 'milestones' && test.milestoneSessions) {
            const nextMilestone = test.milestoneSessions.find(m => m > currentSessionNumber);
            const currentMilestone = test.milestoneSessions.find(m => m === currentSessionNumber);
            
            if (currentMilestone) {
              newAlerts.push({
                id: `milestone_${test.id}_${currentMilestone}`,
                type: 'milestone',
                severity: 'medium',
                title: 'Marco de Avaliação',
                message: `Esta é a sessão ${currentMilestone} - avaliação obrigatória programada`,
                createdAt: new Date().toISOString()
              });
            } else if (nextMilestone && nextMilestone - currentSessionNumber === 1) {
              newAlerts.push({
                id: `reminder_${test.id}_${nextMilestone}`,
                type: 'reminder',
                severity: 'low',
                title: 'Lembrete de Avaliação',
                message: `Próxima sessão (${nextMilestone}) terá avaliação obrigatória`,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
      }

      // Ordenar por severidade e data
      newAlerts.sort((a, b) => {
        const severityOrder = { high: 0, medium: 1, low: 2 };
        if (severityOrder[a.severity] !== severityOrder[b.severity]) {
          return severityOrder[a.severity] - severityOrder[b.severity];
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setAlerts(newAlerts);
    } catch (error) {
      console.error('Erro ao verificar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (alertId: string) => {
    setAlerts(alerts.filter(a => a.id !== alertId));
  };

  return {
    alerts,
    loading,
    refreshAlerts: checkAlerts,
    dismissAlert
  };
}

export default usePatientAlerts;




