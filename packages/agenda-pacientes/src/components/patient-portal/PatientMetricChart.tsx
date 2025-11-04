import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { SoapNote, TrackedMetric } from '../../types';

interface PatientMetricChartProps {
  metric: TrackedMetric;
  notes: SoapNote[];
}

const PatientMetricChart: React.FC<PatientMetricChartProps> = ({ metric, notes }) => {
  // Filtrar notas que têm dados para esta métrica
  const notesWithMetric = notes.filter(note => 
    note.metricResults?.some(mr => mr.metricId === metric.id)
  );

  // Se não há dados suficientes, não renderizar o gráfico
  if (notesWithMetric.length < 2) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }}></span>
            {metric.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-slate-500">
            <p>Dados insuficientes para exibir gráfico</p>
            <p className="text-sm mt-1">Complete mais sessões para ver sua evolução</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Preparar dados para o gráfico
  const chartData = notesWithMetric.map(note => {
    const metricResult = note.metricResults?.find(mr => mr.metricId === metric.id);
    return {
      date: new Date(note.date).toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      }),
      value: metricResult?.value || 0,
      fullDate: note.date,
      session: `Sessão ${notesWithMetric.indexOf(note) + 1}`
    };
  }).reverse(); // Ordem cronológica

  // Calcular estatísticas
  const latestValue = chartData[chartData.length - 1]?.value || 0;
  const initialValue = chartData[0]?.value || 0;
  const improvement = latestValue - initialValue;
  const improvementPercentage = initialValue > 0 ? (improvement / initialValue) * 100 : 0;

  const getImprovementColor = () => {
    if (improvement > 0) return 'text-green-600 bg-green-50';
    if (improvement < 0) return 'text-red-600 bg-red-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getImprovementIcon = () => {
    if (improvement > 0) return '📈';
    if (improvement < 0) return '📉';
    return '➡️';
  };

  const getImprovementLabel = () => {
    if (improvement > 0) return 'Melhora';
    if (improvement < 0) return 'Piora';
    return 'Estável';
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: metric.color }}></span>
            {metric.name}
          </div>
          <Badge className={`${getImprovementColor()} border-0`}>
            <span className="flex items-center gap-1">
              {getImprovementIcon()} {getImprovementLabel()}
            </span>
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Estatísticas */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-slate-800">{initialValue}</div>
              <div className="text-xs text-slate-500">Inicial</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{latestValue}</div>
              <div className="text-xs text-slate-500">Atual</div>
            </div>
            <div>
              <div className={`text-2xl font-bold ${improvement > 0 ? 'text-green-600' : improvement < 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {improvement > 0 ? '+' : ''}{improvement.toFixed(1)}
              </div>
              <div className="text-xs text-slate-500">Variação</div>
            </div>
          </div>

          {/* Gráfico */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="session" 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  stroke="#64748b"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  domain={['dataMin - 5', 'dataMax + 5']}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200">
                          <p className="font-semibold text-slate-800">{data.session}</p>
                          <p className="text-sm text-slate-600">{data.date}</p>
                          <p className="text-slate-800">
                            <span className="font-medium">{metric.name}:</span>{' '}
                            <span className="font-bold">{payload[0].value}</span> {metric.unit}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={metric.color}
                  strokeWidth={3}
                  dot={{ fill: metric.color, strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: metric.color, strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Meta */}
          {metric.targetValue && (
            <div className="text-center p-3 bg-slate-50 rounded-lg">
              <p className="text-sm text-slate-600">
                <span className="font-medium">Meta:</span> {metric.targetValue} {metric.unit}
              </p>
              {latestValue >= metric.targetValue ? (
                <p className="text-sm text-green-600 font-medium mt-1">🎉 Meta atingida!</p>
              ) : (
                <p className="text-sm text-slate-500 mt-1">
                  Faltam {metric.targetValue - latestValue} {metric.unit} para a meta
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientMetricChart;