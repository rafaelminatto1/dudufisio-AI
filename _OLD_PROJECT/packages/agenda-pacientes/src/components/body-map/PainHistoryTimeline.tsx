/**
 * PAIN HISTORY TIMELINE
 * Timeline visual mostrando a evolução da dor ao longo do tempo
 */

import React, { useMemo } from 'react';
import type { BodyMapSession } from '../../types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from '@/components/charts/ChartsLazyOptimized';
import { Calendar, TrendingDown, TrendingUp, Minus, CheckCircle2 } from 'lucide-react';
import { getPainLevelColor } from '../../services/bodyMapService';

interface PainHistoryTimelineProps {
  sessions: BodyMapSession[];
  selectedRegion?: string;
  showTrend?: boolean;
}

const PainHistoryTimeline: React.FC<PainHistoryTimelineProps> = ({
  sessions,
  selectedRegion,
  showTrend = true,
}) => {
  // Preparar dados para o gráfico
  const chartData = useMemo(() => {
    return sessions
      .sort((a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime())
      .map(session => {
        const sessionRegions = session.painRegions || [];
        
        // Se tem região selecionada, pegar apenas dela
        const relevantRegions = selectedRegion
          ? sessionRegions.filter(r => r.bodyRegion === selectedRegion)
          : sessionRegions.filter(r => r.isActive);

        const avgPain = relevantRegions.length > 0
          ? relevantRegions.reduce((sum, r) => sum + r.painLevel, 0) / relevantRegions.length
          : session.painFree ? 0 : session.overallPainLevel;

        const maxPain = relevantRegions.length > 0
          ? Math.max(...relevantRegions.map(r => r.painLevel))
          : session.overallPainLevel;

        return {
          date: new Date(session.sessionDate).toLocaleDateString('pt-BR', { 
            day: '2-digit', 
            month: '2-digit' 
          }),
          fullDate: new Date(session.sessionDate),
          avgPain: parseFloat(avgPain.toFixed(1)),
          maxPain,
          activeRegions: relevantRegions.length,
          painFree: session.painFree,
          sessionId: session.id,
        };
      });
  }, [sessions, selectedRegion]);

  // Calcular tendência
  const trend = useMemo(() => {
    if (chartData.length < 2) return 'stable';
    
    const first = chartData[0].avgPain;
    const last = chartData[chartData.length - 1].avgPain;
    const change = ((last - first) / first) * 100;

    if (change < -10) return 'improving';
    if (change > 10) return 'worsening';
    return 'stable';
  }, [chartData]);

  // Estatísticas rápidas
  const stats = useMemo(() => {
    if (chartData.length === 0) return { avg: 0, min: 0, max: 0, change: 0 };

    const avgPainLevels = chartData.map(d => d.avgPain);
    const avg = avgPainLevels.reduce((sum, val) => sum + val, 0) / avgPainLevels.length;
    const min = Math.min(...avgPainLevels);
    const max = Math.max(...avgPainLevels);
    const change = chartData.length > 1 
      ? ((chartData[chartData.length - 1].avgPain - chartData[0].avgPain) / chartData[0].avgPain) * 100
      : 0;

    return { avg, min, max, change };
  }, [chartData]);

  if (sessions.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          Sem Histórico Disponível
        </h3>
        <p className="text-sm text-slate-500">
          Nenhuma sessão de mapa corporal foi registrada ainda
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Média de Dor</div>
          <div className="text-2xl font-bold text-slate-800">
            {stats.avg.toFixed(1)}
            <span className="text-sm font-normal text-slate-500">/10</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Mínima</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.min}
            <span className="text-sm font-normal text-slate-500">/10</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Máxima</div>
          <div className="text-2xl font-bold text-red-600">
            {stats.max}
            <span className="text-sm font-normal text-slate-500">/10</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-600 mb-1">Tendência</div>
          <div className="flex items-center gap-2">
            {trend === 'improving' && (
              <>
                <TrendingDown className="w-5 h-5 text-green-600" />
                <span className="text-green-600 font-bold">Melhorando</span>
              </>
            )}
            {trend === 'worsening' && (
              <>
                <TrendingUp className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-bold">Piorando</span>
              </>
            )}
            {trend === 'stable' && (
              <>
                <Minus className="w-5 h-5 text-amber-600" />
                <span className="text-amber-600 font-bold">Estável</span>
              </>
            )}
          </div>
          {stats.change !== 0 && (
            <div className={`text-xs mt-1 ${
              stats.change < 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {stats.change > 0 ? '+' : ''}{stats.change.toFixed(1)}%
            </div>
          )}
        </div>
      </div>

      {/* Gráfico de Linha */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Evolução da Dor ao Longo do Tempo
        </h3>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="painGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 10]} 
              ticks={[0, 2, 4, 6, 8, 10]}
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1e293b',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
              formatter={(value: any) => [`${value}/10`, 'Dor Média']}
            />
            <Area
              type="monotone"
              dataKey="avgPain"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#painGradient)"
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline de Eventos */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-800 mb-4">
          Histórico de Sessões
        </h3>

        <div className="space-y-4">
          {chartData.map((data, index) => (
            <div
              key={data.sessionId}
              className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0"
            >
              {/* Timeline marker */}
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                  style={{ backgroundColor: getPainLevelColor(data.avgPain) }}
                >
                  {data.avgPain}
                </div>
                {index < chartData.length - 1 && (
                  <div className="w-0.5 h-8 bg-slate-200 my-1" />
                )}
              </div>

              {/* Conteúdo */}
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-slate-800">
                    {data.fullDate.toLocaleDateString('pt-BR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                  {data.painFree && (
                    <div className="flex items-center gap-1 text-green-600 text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Sem dor
                    </div>
                  )}
                </div>

                <div className="text-sm text-slate-600">
                  {data.activeRegions > 0 && (
                    <span>
                      {data.activeRegions} {data.activeRegions === 1 ? 'região' : 'regiões'} com dor
                    </span>
                  )}
                  {data.maxPain > data.avgPain && (
                    <span className="ml-2 text-red-600">
                      • Pico de {data.maxPain}/10
                    </span>
                  )}
                </div>

                {/* Barra de progresso */}
                <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${(data.avgPain / 10) * 100}%`,
                      backgroundColor: getPainLevelColor(data.avgPain),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PainHistoryTimeline;

