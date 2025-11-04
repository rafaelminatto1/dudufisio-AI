import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export interface TrendDataPoint {
  date: string;
  riskScore: number; // 0-10
  attendanceRate: number; // 0-100
  painLevel: number; // 0-10
  predicted?: boolean; // Se é previsão
}

interface TrendAnalysisChartProps {
  data: TrendDataPoint[];
  patientName?: string;
}

export const TrendAnalysisChart: React.FC<TrendAnalysisChartProps> = ({ 
  data,
  patientName 
}) => {
  // Separar dados históricos e previsões
  const historicalData = data.filter(d => !d.predicted);
  const predictedData = data.filter(d => d.predicted);
  
  // Calcular tendência
  const getTrend = () => {
    if (historicalData.length < 2) return 'stable';
    
    const first = historicalData[0].riskScore;
    const last = historicalData[historicalData.length - 1].riskScore;
    const change = last - first;
    
    if (change > 1) return 'worsening';
    if (change < -1) return 'improving';
    return 'stable';
  };

  const trend = getTrend();

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return <TrendingDown className="w-5 h-5 text-green-600" />;
      case 'worsening':
        return <TrendingUp className="w-5 h-5 text-red-600" />;
      default:
        return <Minus className="w-5 h-5 text-slate-600" />;
    }
  };

  const getTrendLabel = () => {
    switch (trend) {
      case 'improving':
        return <span className="text-green-600 font-semibold">Melhorando</span>;
      case 'worsening':
        return <span className="text-red-600 font-semibold">Piorando</span>;
      default:
        return <span className="text-slate-600 font-semibold">Estável</span>;
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
          <p className="font-semibold text-slate-900 mb-2">
            {formatDate(data.date)}
            {data.predicted && <span className="text-xs text-blue-600 ml-2">(Previsão)</span>}
          </p>
          <div className="space-y-1 text-sm">
            <p className="text-red-600">
              Score de Risco: <span className="font-semibold">{data.riskScore.toFixed(1)}</span>
            </p>
            <p className="text-blue-600">
              Taxa Presença: <span className="font-semibold">{data.attendanceRate.toFixed(0)}%</span>
            </p>
            <p className="text-amber-600">
              Nível Dor: <span className="font-semibold">{data.painLevel.toFixed(1)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Análise de Tendência</CardTitle>
            <CardDescription>
              {patientName ? `Evolução de ${patientName}` : 'Evolução ao longo do tempo'}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getTrendIcon()}
            {getTrendLabel()}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart 
            data={data} 
            margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              className="text-xs"
              stroke="#64748b"
            />
            <YAxis 
              yAxisId="left"
              domain={[0, 10]}
              className="text-xs"
              stroke="#64748b"
              label={{ value: 'Score / Dor', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              className="text-xs"
              stroke="#64748b"
              label={{ value: 'Presença (%)', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              iconType="line"
            />
            
            {/* Linha de referência para risco alto */}
            <ReferenceLine 
              yAxisId="left" 
              y={7} 
              stroke="#ef4444" 
              strokeDasharray="3 3"
              label={{ value: 'Risco Alto', fontSize: 10, fill: '#ef4444' }}
            />

            {/* Linhas de dados */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="riskScore"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 4 }}
              activeDot={{ r: 6 }}
              name="Score de Risco"
              strokeDasharray={predictedData.length > 0 ? "5 5" : undefined}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="attendanceRate"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
              name="Taxa de Presença"
              strokeDasharray={predictedData.length > 0 ? "5 5" : undefined}
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="painLevel"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ fill: '#f59e0b', r: 4 }}
              activeDot={{ r: 6 }}
              name="Nível de Dor"
              strokeDasharray={predictedData.length > 0 ? "5 5" : undefined}
            />
          </LineChart>
        </ResponsiveContainer>

        {predictedData.length > 0 && (
          <div className="mt-4 text-xs text-slate-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium text-blue-900">📊 Previsão para próximos 30 dias</p>
            <p className="mt-1">
              Baseado no histórico, projetamos que o score de risco {trend === 'worsening' ? 'continuará aumentando' : trend === 'improving' ? 'continuará melhorando' : 'permanecerá estável'}.
            </p>
          </div>
        )}
      </CardContent>
    </>
  );
};

