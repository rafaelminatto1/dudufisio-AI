/**
 * SurgeryPhaseIndicator - Indicador de fase pós-cirúrgica com protocolos
 * Mostra em qual fase do protocolo de reabilitação o paciente está
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Activity, Clock, Target, AlertTriangle, CheckCircle } from 'lucide-react';
import { Surgery } from '../../types';
import differenceInDays from 'date-fns/differenceInDays';
import format from 'date-fns/format';
import { ptBR } from 'date-fns/locale';

export interface ProtocolPhase {
  name: string;
  startDay: number;
  endDay: number;
  color: string;
  objectives: string[];
  milestones: string[];
  restrictions: string[];
  exercises: string[];
}

export interface ProtocolRecommendation {
  phase: string;
  recommendations: string[];
  contraindications: string[];
}

interface SurgeryPhaseIndicatorProps {
  surgery: Surgery;
  currentDate?: Date;
  protocol?: string;
  showRecommendations?: boolean;
}

// Protocolos de reabilitação
const PROTOCOLS: Record<string, ProtocolPhase[]> = {
  LCA_Reconstruction: [
    {
      name: 'Fase Aguda (0-14 dias)',
      startDay: 0,
      endDay: 14,
      color: '#ef4444',
      objectives: [
        'Controlar edema e dor',
        'Manter extensão completa',
        'Proteção da reconstrução'
      ],
      milestones: [
        'Extensão completa do joelho',
        'Controle de edema',
        'Amplitude de flexão > 90°'
      ],
      restrictions: [
        'Sem carga completa',
        'Uso de muletas',
        'Evitar flexão > 90°'
      ],
      exercises: [
        'Exercícios isométricos do quadríceps',
        'Flexão/extensão ativa assistida',
        'Elevação da perna estendida'
      ]
    },
    {
      name: 'Fase Subaguda (15-42 dias)',
      startDay: 15,
      endDay: 42,
      color: '#f59e0b',
      objectives: [
        'Progredir amplitude de movimento',
        'Iniciar fortalecimento',
        'Retirar muletas'
      ],
      milestones: [
        'Amplitude de flexão > 120°',
        'Retirada de muletas',
        'Marcha sem apoio'
      ],
      restrictions: [
        'Evitar rotação do joelho',
        'Sem esportes de impacto'
      ],
      exercises: [
        'Exercícios de cadeia cinética fechada',
        'Fortalecimento do quadríceps',
        'Treino de marcha'
      ]
    },
    {
      name: 'Fase de Reabilitação (43-90 dias)',
      startDay: 43,
      endDay: 90,
      color: '#3b82f6',
      objectives: [
        'Ganho completo de amplitude',
        'Fortalecimento avançado',
        'Preparação para retorno ao esporte'
      ],
      milestones: [
        'Amplitude de flexão > 135°',
        'Força do quadríceps > 80% do contralateral',
        'Teste de salto unilateral'
      ],
      restrictions: [
        'Evitar esportes de contato',
        'Progredir gradualmente'
      ],
      exercises: [
        'Exercícios pliométricos',
        'Treino de agilidade',
        'Exercícios funcionais específicos do esporte'
      ]
    },
    {
      name: 'Fase de Retorno (90+ dias)',
      startDay: 91,
      endDay: 180,
      color: '#10b981',
      objectives: [
        'Retorno gradual ao esporte',
        'Manutenção de ganhos',
        'Prevenção de nova lesão'
      ],
      milestones: [
        'Retorno ao esporte',
        'Sem limitações funcionais',
        'Alta da fisioterapia'
      ],
      restrictions: [
        'Retorno gradual',
        'Monitoramento contínuo'
      ],
      exercises: [
        'Exercícios de manutenção',
        'Treino específico do esporte',
        'Programa de prevenção'
      ]
    }
  ],
  Meniscectomy: [
    {
      name: 'Fase Aguda (0-7 dias)',
      startDay: 0,
      endDay: 7,
      color: '#ef4444',
      objectives: ['Controlar dor e edema', 'Manter amplitude de movimento'],
      milestones: ['Controle de dor', 'Amplitude > 90°'],
      restrictions: ['Carga parcial', 'Uso de muletas'],
      exercises: ['Exercícios isométricos', 'Flexão/extensão ativa']
    },
    {
      name: 'Fase de Reabilitação (8-42 dias)',
      startDay: 8,
      endDay: 42,
      color: '#3b82f6',
      objectives: ['Ganho de amplitude', 'Fortalecimento', 'Retorno funcional'],
      milestones: ['Amplitude completa', 'Retirada de muletas'],
      restrictions: ['Evitar esportes de impacto'],
      exercises: ['Fortalecimento', 'Exercícios funcionais']
    },
    {
      name: 'Fase de Retorno (43+ dias)',
      startDay: 43,
      endDay: 90,
      color: '#10b981',
      objectives: ['Retorno ao esporte', 'Manutenção'],
      milestones: ['Retorno completo'],
      restrictions: [],
      exercises: ['Exercícios de manutenção']
    }
  ]
};

export const SurgeryPhaseIndicator: React.FC<SurgeryPhaseIndicatorProps> = ({
  surgery,
  currentDate = new Date(),
  protocol = 'LCA_Reconstruction',
  showRecommendations = true
}) => {
  const daysSinceSurgery = differenceInDays(currentDate, new Date(surgery.date));
  const protocolPhases = PROTOCOLS[protocol] || PROTOCOLS.LCA_Reconstruction;

  // Determinar fase atual
  const currentPhase = protocolPhases.find(
    phase => daysSinceSurgery >= phase.startDay && daysSinceSurgery <= phase.endDay
  ) || protocolPhases[protocolPhases.length - 1];

  const currentPhaseIndex = protocolPhases.findIndex(p => p === currentPhase);
  const progressInPhase = ((daysSinceSurgery - currentPhase.startDay) / 
    (currentPhase.endDay - currentPhase.startDay)) * 100;

  // Verificar próximos marcos
  const nextMilestones = currentPhase.milestones.filter((_, idx) => idx < 2);

  // Verificar restrições atuais
  const hasActiveRestrictions = currentPhase.restrictions.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          Protocolo de Reabilitação
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informações da Cirurgia */}
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-sm text-slate-900">{surgery.name}</span>
            <Badge variant="outline" className="text-xs">
              {format(new Date(surgery.date), 'dd/MM/yyyy', { locale: ptBR })}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{daysSinceSurgery} dias pós-operatório</span>
            </div>
          </div>
        </div>

        {/* Fase Atual */}
        <div className="p-4 rounded-lg border-2" style={{ borderColor: currentPhase.color, backgroundColor: `${currentPhase.color}10` }}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: currentPhase.color }} />
                <h4 className="font-semibold text-slate-900">{currentPhase.name}</h4>
              </div>
              <div className="text-xs text-slate-600">
                Dias {currentPhase.startDay}-{currentPhase.endDay} pós-operatório
              </div>
            </div>
            <Badge 
              className="text-xs"
              style={{ backgroundColor: currentPhase.color, color: 'white' }}
            >
              Fase {currentPhaseIndex + 1}/{protocolPhases.length}
            </Badge>
          </div>

          {/* Progresso na Fase */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
              <span>Progresso na fase</span>
              <span>{progressInPhase.toFixed(0)}%</span>
            </div>
            <Progress value={progressInPhase} className="h-2" />
          </div>

          {/* Objetivos da Fase */}
          <div className="space-y-2">
            <div className="text-xs font-medium text-slate-700">Objetivos:</div>
            <ul className="text-xs text-slate-600 space-y-1">
              {currentPhase.objectives.map((objective, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <Target className="w-3 h-3 mt-0.5 text-blue-600 flex-shrink-0" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Marcos da Fase */}
        {nextMilestones.length > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-1">
              <Target className="w-3 h-3" />
              Próximos Marcos
            </div>
            <ul className="text-xs text-blue-800 space-y-1">
              {nextMilestones.map((milestone, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3" />
                  <span>{milestone}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Restrições */}
        {hasActiveRestrictions && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              <div className="font-medium mb-1">Restrições Atuais:</div>
              <ul className="space-y-1">
                {currentPhase.restrictions.map((restriction, idx) => (
                  <li key={idx}>• {restriction}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recomendações de Exercícios */}
        {showRecommendations && currentPhase.exercises.length > 0 && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xs font-medium text-green-900 mb-2">
              Exercícios Recomendados:
            </div>
            <div className="flex flex-wrap gap-2">
              {currentPhase.exercises.map((exercise, idx) => (
                <Badge key={idx} variant="outline" className="text-xs bg-white">
                  {exercise}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Timeline de Fases */}
        <div className="pt-2">
          <div className="text-xs font-medium text-slate-700 mb-2">Fases do Protocolo:</div>
          <div className="space-y-2">
            {protocolPhases.map((phase, idx) => {
              const isPast = daysSinceSurgery > phase.endDay;
              const isCurrent = phase === currentPhase;
              const isFuture = daysSinceSurgery < phase.startDay;

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3 p-2 rounded border ${
                    isCurrent ? 'border-blue-500 bg-blue-50' :
                    isPast ? 'border-green-200 bg-green-50' :
                    'border-slate-200 bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isPast ? 'bg-green-500' :
                      isCurrent ? 'bg-blue-500' :
                      'bg-slate-300'
                    }`}
                  />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-900">{phase.name}</div>
                    <div className="text-xs text-slate-500">
                      Dias {phase.startDay}-{phase.endDay}
                    </div>
                  </div>
                  {isPast && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {isCurrent && <Clock className="w-4 h-4 text-blue-600" />}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurgeryPhaseIndicator;

