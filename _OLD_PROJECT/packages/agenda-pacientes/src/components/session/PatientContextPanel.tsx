/**
 * PatientContextPanel - Painel de contexto do paciente durante sessão
 * Exibe informações relevantes: cirurgias, patologias, metas, testes obrigatórios
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { 
  Calendar, 
  Activity, 
  Target, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Patient, Surgery, Pathology, PatientGoal } from '../../types';
import { getMandatoryAssessmentsForSession } from '../../services/patientTrackingService';
import format from 'date-fns/format';
import differenceInDays from 'date-fns/differenceInDays';
import differenceInWeeks from 'date-fns/differenceInWeeks';
import differenceInMonths from 'date-fns/differenceInMonths';
import { ptBR } from 'date-fns/locale';

interface PatientContextPanelProps {
  patient: Patient;
  sessionNumber: number;
  timing?: 'before' | 'during' | 'after';
}

export const PatientContextPanel: React.FC<PatientContextPanelProps> = ({ 
  patient, 
  sessionNumber,
  timing = 'during'
}) => {
  const [mandatoryTests, setMandatoryTests] = useState<any[]>([]);
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    const loadMandatoryTests = async () => {
      setLoadingTests(true);
      try {
        const tests = await getMandatoryAssessmentsForSession(
          patient.id, 
          sessionNumber, 
          timing
        );
        setMandatoryTests(tests);
      } catch (error) {
        console.error('Erro ao carregar testes obrigatórios:', error);
      } finally {
        setLoadingTests(false);
      }
    };

    loadMandatoryTests();
  }, [patient.id, sessionNumber, timing]);

  return (
    <div className="space-y-4">
      {/* Tempo de Tratamento */}
      <TreatmentDurationCard 
        registrationDate={patient.registration_date || patient.registrationDate}
        firstAppointmentDate={patient.first_appointment_date}
      />

      {/* Cirurgias com tempo decorrido */}
      {patient.surgeries && patient.surgeries.length > 0 && (
        <SurgeriesTimelineCard surgeries={patient.surgeries} />
      )}

      {/* Patologias ativas vs resolvidas */}
      {patient.pathologies && patient.pathologies.length > 0 && (
        <PathologiesStatusCard pathologies={patient.pathologies} />
      )}

      {/* Metas com countdown */}
      {patient.goals && patient.goals.length > 0 && (
        <GoalsProgressCard goals={patient.goals} />
      )}

      {/* Alertas de testes obrigatórios */}
      {mandatoryTests.length > 0 && (
        <MandatoryTestsAlertCard tests={mandatoryTests} />
      )}
    </div>
  );
};

// Componente: Tempo de Tratamento
const TreatmentDurationCard: React.FC<{
  registrationDate?: string;
  firstAppointmentDate?: string;
}> = ({ registrationDate, firstAppointmentDate }) => {
  const calculateDuration = () => {
    const startDate = firstAppointmentDate || registrationDate;
    if (!startDate) return null;

    const start = new Date(startDate);
    const now = new Date();
    const days = differenceInDays(now, start);
    const weeks = differenceInWeeks(now, start);
    const months = differenceInMonths(now, start);

    if (months > 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'}`;
    } else if (weeks > 0) {
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'}`;
    } else {
      return `${days} ${days === 1 ? 'dia' : 'dias'}`;
    }
  };

  const duration = calculateDuration();

  if (!duration) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-600" />
          Tempo de Tratamento
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-900">{duration}</div>
        {firstAppointmentDate && (
          <p className="text-xs text-slate-500 mt-1">
            Desde {format(new Date(firstAppointmentDate), "dd/MM/yyyy", { locale: ptBR })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

// Componente: Cirurgias com Timeline
const SurgeriesTimelineCard: React.FC<{ surgeries: Surgery[] }> = ({ surgeries }) => {
  const getSurgeryTime = (surgeryDate: string) => {
    const surgery = new Date(surgeryDate);
    const now = new Date();
    const days = differenceInDays(now, surgery);
    const weeks = differenceInWeeks(now, surgery);
    const months = differenceInMonths(now, surgery);

    if (months > 0) {
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    } else if (weeks > 0) {
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
    } else {
      return `${days} ${days === 1 ? 'dia' : 'dias'} atrás`;
    }
  };

  const getPhaseIndicator = (surgeryDate: string) => {
    const days = differenceInDays(new Date(), new Date(surgeryDate));
    
    if (days < 14) {
      return { label: 'Fase Aguda', color: 'bg-red-100 text-red-700 border-red-200' };
    } else if (days < 42) {
      return { label: 'Fase Subaguda', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' };
    } else if (days < 90) {
      return { label: 'Reabilitação', color: 'bg-blue-100 text-blue-700 border-blue-200' };
    } else {
      return { label: 'Retorno ao Esporte', color: 'bg-green-100 text-green-700 border-green-200' };
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-purple-600" />
          Cirurgias ({surgeries.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {surgeries.map((surgery, index) => {
          const phase = getPhaseIndicator(surgery.date);
          return (
            <div 
              key={index}
              className="p-3 rounded-lg border-l-4 bg-slate-50 border-slate-300"
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-slate-900">{surgery.name}</h4>
                <Badge variant="outline" className={phase.color}>
                  {phase.label}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-slate-600 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(surgery.date), "dd/MM/yyyy", { locale: ptBR })}
                </p>
                <p className="text-xs text-slate-500">
                  {getSurgeryTime(surgery.date)}
                </p>
                {surgery.description && (
                  <p className="text-xs text-slate-600 mt-1">{surgery.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// Componente: Status de Patologias
const PathologiesStatusCard: React.FC<{ pathologies: Pathology[] }> = ({ pathologies }) => {
  const activePathologies = pathologies.filter(p => p.status === 'active');
  const resolvedPathologies = pathologies.filter(p => p.status === 'resolved');

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-green-600" />
          Patologias
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Patologias Ativas */}
        {activePathologies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-3 h-3 text-red-600" />
              <span className="text-xs font-medium text-slate-700">
                Em Tratamento ({activePathologies.length})
              </span>
            </div>
            <div className="space-y-1">
              {activePathologies.map((pathology) => (
                <div key={pathology.id} className="text-xs text-slate-600 bg-red-50 p-2 rounded">
                  <span className="font-medium">{pathology.name}</span>
                  {pathology.severity && (
                    <Badge variant="destructive" className="ml-2 text-xs">
                      {pathology.severity}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Patologias Resolvidas */}
        {resolvedPathologies.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-slate-700">
                Resolvidas ({resolvedPathologies.length})
              </span>
            </div>
            <div className="space-y-1">
              {resolvedPathologies.map((pathology) => (
                <div key={pathology.id} className="text-xs text-slate-600 bg-green-50 p-2 rounded">
                  <span className="font-medium line-through">{pathology.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Componente: Progresso de Metas
const GoalsProgressCard: React.FC<{ goals: PatientGoal[] }> = ({ goals }) => {
  const activeGoals = goals.filter(g => g.status === 'active');

  const getTimeToTarget = (targetDate?: string) => {
    if (!targetDate) return null;
    
    const target = new Date(targetDate);
    const now = new Date();
    const days = differenceInDays(target, now);
    
    if (days < 0) return 'Prazo vencido';
    if (days < 7) return `${days} dias restantes`;
    if (days < 30) return `${Math.floor(days / 7)} semanas restantes`;
    return `${Math.floor(days / 30)} meses restantes`;
  };

  if (activeGoals.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-600" />
          Metas Ativas ({activeGoals.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeGoals.map((goal) => {
          const timeRemaining = getTimeToTarget(goal.targetDate);
          const isNearDeadline = timeRemaining && timeRemaining.includes('dias');
          
          return (
            <div 
              key={goal.id}
              className={`p-3 rounded-lg border ${
                isNearDeadline ? 'border-orange-300 bg-orange-50' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-medium text-sm text-slate-900">{goal.title}</h4>
                {timeRemaining && (
                  <Badge variant={isNearDeadline ? 'destructive' : 'outline'} className="text-xs">
                    {timeRemaining}
                  </Badge>
                )}
              </div>
              {goal.description && (
                <p className="text-xs text-slate-600 mb-2">{goal.description}</p>
              )}
              {goal.currentProgress !== undefined && (
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div 
                    className="bg-orange-600 h-1.5 rounded-full transition-all"
                    style={{ width: `${goal.currentProgress}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

// Componente: Alertas de Testes Obrigatórios
const MandatoryTestsAlertCard: React.FC<{ tests: any[] }> = ({ tests }) => {
  return (
    <Alert variant="destructive" className="border-red-500 bg-red-50">
      <AlertTriangle className="h-5 w-5 text-red-600" />
      <AlertTitle className="text-sm font-semibold text-red-900">
        ⚠️ Medições Obrigatórias Pendentes
      </AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="space-y-1 text-xs text-red-800">
          {tests.map((test, index) => (
            <li key={index} className="flex items-center gap-2">
              <span className="w-1 h-1 bg-red-600 rounded-full" />
              {test.testName}
              {test.frequencyType === 'every_session' && (
                <Badge variant="destructive" className="text-xs">Obrigatória</Badge>
              )}
            </li>
          ))}
        </ul>
      </AlertDescription>
    </Alert>
  );
};

export default PatientContextPanel;

