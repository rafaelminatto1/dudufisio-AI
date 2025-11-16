import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from '@/components/charts/ChartsLazyOptimized';
import { TestEvolutionData, ChartType } from '../../types';

/**
 * Gráfico de evolução interativo
 * Suporta múltiplos tipos: barras, linha, área
 * Tooltip com detalhes, zoom, legenda configurável
 */

interface EvolutionChartProps {
  data: TestEvolutionData[];
  chartType?: ChartType;
  title?: string;
  showGoalLine?: boolean;
  goalValue?: number;
  color?: string;
  height?: number;
}

export const EvolutionChart: React.FC<EvolutionChartProps> = ({
  data,
  chartType = 'line',
  title,
  showGoalLine = false,
  goalValue,
  color = '#3b82f6',
  height = 300,
}) => {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
        <p className="text-slate-500">Sem dados para exibir</p>
      </div>
    );
  }

  // Preparar dados para o gráfico
  const chartData = data.map((item) => ({
    sessao: `#${item.sessionNumber}`,
    valor: item.value,
    data: new Date(item.sessionDate).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    }),
    observacoes: item.notes || '',
    variacao: item.variation,
    percentual: item.percentChange,
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-slate-900 mb-1">{data.sessao}</p>
          <p className="text-sm text-slate-600 mb-2">{data.data}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-slate-600">Valor:</span>{' '}
              <span className="font-semibold text-blue-600">
                {data.valor} {data.unit || ''}
              </span>
            </p>
            {data.variacao !== undefined && data.variacao !== 0 && (
              <p className="text-xs">
                <span className="text-slate-600">Variação:</span>{' '}
                <span className={data.variacao > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.variacao > 0 ? '+' : ''}{data.variacao.toFixed(1)}
                </span>
              </p>
            )}
            {data.percentual !== undefined && data.percentual !== 0 && (
              <p className="text-xs">
                <span className="text-slate-600">Percentual:</span>{' '}
                <span className={data.percentual > 0 ? 'text-green-600' : 'text-red-600'}>
                  {data.percentual > 0 ? '+' : ''}{data.percentual.toFixed(1)}%
                </span>
              </p>
            )}
            {data.observacoes && (
              <p className="text-xs text-slate-600 mt-2 pt-2 border-t border-slate-200">
                {data.observacoes}
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      {title && (
        <h4 className="font-semibold text-slate-900 mb-4">{title}</h4>
      )}

      <ResponsiveContainer width="100%" height={height}>
        {chartType === 'bar' ? (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="sessao"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showGoalLine && goalValue !== undefined && (
              <ReferenceLine
                y={goalValue}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: 'Meta', position: 'right', fill: '#22c55e' }}
              />
            )}
            <Bar
              dataKey="valor"
              fill={color}
              radius={[6, 6, 0, 0]}
              name={data[0]?.testName || 'Valor'}
            />
          </BarChart>
        ) : chartType === 'area' ? (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="sessao"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showGoalLine && goalValue !== undefined && (
              <ReferenceLine
                y={goalValue}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: 'Meta', position: 'right', fill: '#22c55e' }}
              />
            )}
            <Area
              type="monotone"
              dataKey="valor"
              fill={color}
              fillOpacity={0.3}
              stroke={color}
              strokeWidth={2}
              name={data[0]?.testName || 'Valor'}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="sessao"
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              stroke="#64748b"
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            {showGoalLine && goalValue !== undefined && (
              <ReferenceLine
                y={goalValue}
                stroke="#22c55e"
                strokeDasharray="5 5"
                label={{ value: 'Meta', position: 'right', fill: '#22c55e' }}
              />
            )}
            <Line
              type="monotone"
              dataKey="valor"
              stroke={color}
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              activeDot={{ r: 6 }}
              name={data[0]?.testName || 'Valor'}
            />
          </LineChart>
        )}
      </ResponsiveContainer>

      {/* Legend com informações adicionais */}
      {data.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
          <div>
            <span>Total de medições: </span>
            <span className="font-semibold text-slate-900">{data.length}</span>
          </div>
          <div>
            <span>Unidade: </span>
            <span className="font-semibold text-slate-900">{data[0].unit}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvolutionChart;

