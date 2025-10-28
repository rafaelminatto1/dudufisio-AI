// components/atendimento/context/TreatmentPlanCard.tsx
import React from 'react';
import { Target, Calendar, TrendingUp } from 'lucide-react';
import type { TreatmentPlan } from '../../../types';

interface TreatmentPlanCardProps {
  plan: TreatmentPlan;
}

export const TreatmentPlanCard: React.FC<TreatmentPlanCardProps> = ({ plan }) => {
  const calculateProgress = () => {
    if (!plan.expectedSessions || plan.expectedSessions === 0) return 0;
    // Aqui você calcularia baseado nas sessões realizadas
    return 0; // Placeholder
  };

  const progress = calculateProgress();

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
        <Target className="w-4 h-4" />
        Plano de Tratamento
      </h4>

      <div className="p-3 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
        {/* Objetivo */}
        {plan.goals && plan.goals.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-slate-700 mb-1">Objetivos:</p>
            <ul className="space-y-1">
              {plan.goals.slice(0, 2).map((goal, index) => (
                <li key={index} className="text-xs text-slate-600 flex items-start gap-1">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span className="flex-1">{goal}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progresso */}
        {plan.expectedSessions && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-slate-600">Progresso</span>
              <span className="font-medium text-blue-700">{progress}%</span>
            </div>
            <div className="w-full h-2 bg-white rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              0/{plan.expectedSessions} sessões
            </p>
          </div>
        )}

        {/* Datas */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-slate-600">
            <Calendar className="w-3 h-3" />
            <span>Início: {new Date(plan.startDate).toLocaleDateString('pt-BR')}</span>
          </div>
          {plan.status === 'active' && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="w-3 h-3" />
              <span className="font-medium">Ativo</span>
            </div>
          )}
        </div>
      </div>

      {/* Diagnóstico */}
      {plan.diagnosis && (
        <div className="p-2 bg-slate-50 rounded border border-slate-200">
          <p className="text-xs text-slate-500 font-medium mb-1">Diagnóstico:</p>
          <p className="text-xs text-slate-700">{plan.diagnosis}</p>
        </div>
      )}
    </div>
  );
};
