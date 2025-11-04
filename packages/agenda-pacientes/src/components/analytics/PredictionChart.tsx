import React from 'react';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { DemandForecast } from '../../types/analytics';
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { TrendingUp, Calendar } from 'lucide-react';

interface PredictionChartProps {
  forecasts: DemandForecast[];
  title?: string;
  showConfidence?: boolean;
  className?: string;
}

const PredictionChart: React.FC<PredictionChartProps> = ({
  forecasts,
  title = 'Previsão de Demanda',
  showConfidence = true,
  className
}) => {
  const chartData = forecasts.map(f => ({
    date: format(f.date, 'dd/MM', { locale: ptBR }),
    fullDate: format(f.date, 'dd/MM/yyyy', { locale: ptBR }),
    previsto: f.predictedAppointments,
    confianca: f.confidence,
    minimo: Math.max(0, f.predictedAppointments - Math.round(f.predictedAppointments * 0.1)),
    maximo: f.predictedAppointments + Math.round(f.predictedAppointments * 0.1)
  }));

  const avgPredicted = Math.round(
    forecasts.reduce((sum, f) => sum + f.predictedAppointments, 0) / forecasts.length
  );

  const avgConfidence = Math.round(
    forecasts.reduce((sum, f) => sum + f.confidence, 0) / forecasts.length
  );

  return (
    <Card className={className}>
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Média Prevista</p>
              <p className="font-bold text-lg">{avgPredicted}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Confiança</p>
              <p className="font-bold text-lg text-green-600">{avgConfidence}%</p>
            </div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorPrevisto" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              className="text-xs"
              tick={{ fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: any, name: string) => {
                if (name === 'previsto') return [value, 'Consultas Previstas'];
                if (name === 'confianca') return [`${value}%`, 'Confiança'];
                return [value, name];
              }}
              labelFormatter={(label) => {
                const item = chartData.find(d => d.date === label);
                return item?.fullDate || label;
              }}
            />
            <Legend />

            {/* Reference line for average */}
            <ReferenceLine
              y={avgPredicted}
              stroke="#64748b"
              strokeDasharray="3 3"
              label={{ value: 'Média', position: 'right', fontSize: 12 }}
            />

            {/* Confidence interval as area */}
            <Area
              type="monotone"
              dataKey="maximo"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.2}
            />
            <Area
              type="monotone"
              dataKey="minimo"
              stroke="none"
              fill="#93c5fd"
              fillOpacity={0.2}
            />

            {/* Main prediction line */}
            <Area
              type="monotone"
              dataKey="previsto"
              stroke="#3b82f6"
              strokeWidth={3}
              fill="url(#colorPrevisto)"
            />

            {/* Confidence line */}
            {showConfidence && (
              <Line
                type="monotone"
                dataKey="confianca"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded" />
            Previsão
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-200 rounded" />
            Intervalo de Confiança
          </div>
          {showConfidence && (
            <div className="flex items-center gap-1">
              <div className="w-3 h-0.5 bg-green-500" style={{ width: '16px' }} />
              Confiança (%)
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PredictionChart;

