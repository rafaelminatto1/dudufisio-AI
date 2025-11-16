import React from 'react';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { TrendingDown } from 'lucide-react';

export interface FunnelStage {
  stage: string;
  count: number;
  percentage: number;
  dropoffRate?: number;
}

interface RetentionFunnelChartProps {
  data: FunnelStage[];
}

export const RetentionFunnelChart: React.FC<RetentionFunnelChartProps> = ({ data }) => {
  const maxCount = data[0]?.count || 0;

  const getStageColor = (index: number) => {
    const colors = [
      'bg-blue-500',
      'bg-blue-400',
      'bg-green-400',
      'bg-green-500',
      'bg-emerald-500',
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-lg">Funil de Retenção</CardTitle>
        <CardDescription>Taxa de abandono por fase do tratamento</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-2">
          {data.map((stage, index) => {
            const width = (stage.count / maxCount) * 100;
            const hasDropoff = stage.dropoffRate && stage.dropoffRate > 0;

            return (
              <div key={index} className="relative">
                {/* Barra do funil */}
                <div className="relative group">
                  <div 
                    className={`${getStageColor(index)} rounded-r-lg transition-all hover:shadow-lg cursor-pointer`}
                    style={{ width: `${width}%`, minWidth: '20%' }}
                  >
                    <div className="flex items-center justify-between px-4 py-3">
                      <span className="text-white font-semibold text-sm">{stage.stage}</span>
                      <span className="text-white font-bold">{stage.count}</span>
                    </div>
                  </div>

                  {/* Tooltip */}
                  <div className="absolute left-0 -top-16 z-10 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg whitespace-nowrap">
                      <p className="font-semibold">{stage.stage}</p>
                      <p>Pacientes: {stage.count}</p>
                      <p>Percentual: {stage.percentage.toFixed(1)}%</p>
                      {hasDropoff && (
                        <p className="text-red-400">Abandono: {stage.dropoffRate?.toFixed(1)}%</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Indicador de dropoff */}
                {hasDropoff && (
                  <div className="flex items-center gap-2 mt-1 ml-4 text-xs text-red-600">
                    <TrendingDown className="w-3 h-3" />
                    <span className="font-medium">{stage.dropoffRate?.toFixed(1)}% abandonam nesta fase</span>
                  </div>
                )}

                {/* Percentual do total */}
                <div className="ml-4 mt-1 text-xs text-slate-500">
                  {stage.percentage.toFixed(1)}% do total inicial
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumo */}
        <div className="mt-6 grid grid-cols-3 gap-4 text-center">
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{data[0]?.count || 0}</p>
            <p className="text-xs text-slate-600 mt-1">Início</p>
          </div>
          <div className="bg-green-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{data[data.length - 1]?.count || 0}</p>
            <p className="text-xs text-slate-600 mt-1">Completaram</p>
          </div>
          <div className="bg-red-50 p-3 rounded-lg">
            <p className="text-2xl font-bold text-red-600">
              {data[data.length - 1] 
                ? ((1 - data[data.length - 1].percentage / 100) * 100).toFixed(0)
                : 0}%
            </p>
            <p className="text-xs text-slate-600 mt-1">Taxa de Abandono</p>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-4 text-xs text-slate-600 bg-amber-50 p-3 rounded-lg">
          <p className="font-medium text-amber-900 mb-1">💡 Insight</p>
          <p>
            Identifique em qual fase os pacientes mais abandonam o tratamento para implementar ações preventivas.
          </p>
        </div>
      </CardContent>
    </>
  );
};

