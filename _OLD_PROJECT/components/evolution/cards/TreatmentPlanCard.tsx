import React from 'react';
import { Target, Activity, Clock, BarChart3 } from 'lucide-react';
import { TreatmentPlan } from '../../../types';
import CollapsibleCard from '../CollapsibleCard';

interface TreatmentPlanCardProps {
  treatmentPlan: TreatmentPlan;
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * Card com informações do plano de tratamento
 */
const TreatmentPlanCard: React.FC<TreatmentPlanCardProps> = ({
  treatmentPlan,
  defaultExpanded = false,
  onToggle,
}) => {
  return (
    <CollapsibleCard
      id="treatment-plan"
      title="Plano de Tratamento"
      icon={<Target className="w-5 h-5" />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      <div className="space-y-4">
        {/* Objetivos do Tratamento */}
        <div>
          <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
            <Target className="w-3.5 h-3.5" />
            Objetivos
          </h4>
          <p className="text-sm text-slate-600 leading-relaxed">
            {treatmentPlan.treatmentGoals}
          </p>
        </div>

        {/* Informações do Plano */}
        <div className="grid grid-cols-2 gap-3">
          {/* Frequência */}
          <div className="p-2.5 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Activity className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Frequência</span>
            </div>
            <div className="text-sm font-semibold text-blue-900">
              {treatmentPlan.frequencyPerWeek}x/semana
            </div>
          </div>

          {/* Duração */}
          <div className="p-2.5 bg-green-50 rounded-lg">
            <div className="flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-green-600" />
              <span className="text-xs font-medium text-green-800">Duração</span>
            </div>
            <div className="text-sm font-semibold text-green-900">
              {treatmentPlan.durationWeeks} semanas
            </div>
          </div>
        </div>

        {/* Modalidades */}
        {treatmentPlan.modalities && treatmentPlan.modalities.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2 flex items-center gap-1">
              <BarChart3 className="w-3.5 h-3.5" />
              Modalidades
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {treatmentPlan.modalities.map((modality, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-md"
                >
                  {modality}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Medidas de Resultado */}
        {treatmentPlan.outcomeMeasures && treatmentPlan.outcomeMeasures.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-700 mb-2">
              Medidas de Resultado
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {treatmentPlan.outcomeMeasures.map((measure, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md"
                >
                  {measure}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Diagnóstico COFFITO */}
        {treatmentPlan.coffitoDiagnosisCodes && (
          <div className="pt-3 border-t border-slate-200">
            <p className="text-xs text-slate-500">Código COFFITO</p>
            <p className="text-sm font-mono text-slate-700 mt-1">
              {treatmentPlan.coffitoDiagnosisCodes}
            </p>
          </div>
        )}

        {/* CREFITO do Profissional */}
        {treatmentPlan.createdByCrefito && (
          <div className="text-xs text-slate-500">
            Criado por: CREFITO {treatmentPlan.createdByCrefito}
          </div>
        )}
      </div>
    </CollapsibleCard>
  );
};

export default TreatmentPlanCard;

