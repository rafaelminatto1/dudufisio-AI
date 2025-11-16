import React from 'react';
import { TrendingUp, Users, Calendar, Clock } from 'lucide-react';
import CollapsibleCard from '../CollapsibleCard';

interface MetricsCardProps {
  metrics: {
    totalSessions: number;
    treatmentDays: number;
    firstSessionDate: string;
    lastSessionDate: string;
  };
  defaultExpanded?: boolean;
  onToggle?: (expanded: boolean) => void;
}

/**
 * Card com métricas de acompanhamento do paciente
 */
const MetricsCard: React.FC<MetricsCardProps> = ({
  metrics,
  defaultExpanded = false,
  onToggle,
}) => {
  return (
    <CollapsibleCard
      id="metrics"
      title="Métricas"
      icon={<TrendingUp className="w-5 h-5" />}
      defaultExpanded={defaultExpanded}
      onToggle={onToggle}
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Sessões Realizadas */}
        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-800">Sessões</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">
            {metrics.totalSessions}
          </div>
        </div>

        {/* Dias de Tratamento */}
        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-green-600" />
            <span className="text-xs font-medium text-green-800">Dias</span>
          </div>
          <div className="text-2xl font-bold text-green-900">
            {metrics.treatmentDays}
          </div>
        </div>

        {/* Primeira Sessão */}
        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-800">Primeira Sessão</span>
          </div>
          <div className="text-sm font-semibold text-purple-900">
            {metrics.firstSessionDate !== 'N/A' 
              ? metrics.firstSessionDate 
              : 'Não registrada'}
          </div>
        </div>

        {/* Última Sessão */}
        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200 col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-orange-600" />
            <span className="text-xs font-medium text-orange-800">Última Sessão</span>
          </div>
          <div className="text-sm font-semibold text-orange-900">
            {metrics.lastSessionDate !== 'N/A' 
              ? metrics.lastSessionDate 
              : 'Não registrada'}
          </div>
        </div>
      </div>

      {/* Indicador de progresso */}
      {metrics.totalSessions > 0 && (
        <div className="mt-4 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
            <span>Progresso do Tratamento</span>
            <span className="font-medium">
              {metrics.totalSessions} sessões em {metrics.treatmentDays} dias
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all"
              style={{
                width: `${Math.min((metrics.totalSessions / 10) * 100, 100)}%`,
              }}
            />
          </div>
        </div>
      )}
    </CollapsibleCard>
  );
};

export default MetricsCard;

