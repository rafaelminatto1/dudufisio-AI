/**
 * InteractiveEvolutionChart - Gráfico interativo de evolução do paciente
 * Suporta múltiplos tipos: linha, barra, área, scatter
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
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
  ScatterChart,
  Scatter,
  ReferenceLine
} from 'recharts';
import { Download, TrendingUp, BarChart3, Activity, ScatterChart as ScatterIcon } from 'lucide-react';

export interface ChartConfig {
  type: 'line' | 'bar' | 'area' | 'scatter';
  metrics: string[];
  dateRange: {
    start: Date;
    end: Date;
  };
  groupBy?: 'session' | 'week' | 'month';
  showTrendline?: boolean;
  showAnnotations?: boolean;
  exportFormat?: 'png' | 'pdf' | 'svg';
}

export interface ChartDataPoint {
  date: string;
  sessionNumber: number;
  [key: string]: string | number; // Dynamic metric values
}

interface InteractiveEvolutionChartProps {
  patientId: string;
  data: ChartDataPoint[];
  config: ChartConfig;
  onExport?: (format: 'png' | 'pdf' | 'svg') => void;
  annotations?: Array<{
    date: string;
    label: string;
    color?: string;
  }>;
}

export const InteractiveEvolutionChart: React.FC<InteractiveEvolutionChartProps> = ({
  patientId,
  data,
  config,
  onExport,
  annotations = []
}) => {
  const [selectedMetric, setSelectedMetric] = useState<string>(config.metrics[0] || '');
  const [showTrendline, setShowTrendline] = useState(config.showTrendline || false);

  // Cores para diferentes métricas
  const metricColors = {
    painLevel: '#ef4444',
    kneeFlexion: '#3b82f6',
    kneeExtension: '#8b5cf6',
    quadricepsStrength: '#10b981',
    yBalance: '#f59e0b',
    schober: '#06b6d4',
    fingerFloor: '#ec4899'
  };

  // Calcular linha de tendência (média móvel simples)
  const trendlineData = useMemo(() => {
    if (!showTrendline || !selectedMetric) return [];

    const window = 3; // Média móvel de 3 pontos
    return data.map((point, index) => {
      const start = Math.max(0, index - Math.floor(window / 2));
      const end = Math.min(data.length, index + Math.ceil(window / 2));
      const slice = data.slice(start, end);
      const avg = slice.reduce((sum, p) => sum + (p[selectedMetric] as number), 0) / slice.length;
      
      return {
        ...point,
        trendline: avg
      };
    });
  }, [data, selectedMetric, showTrendline]);

  const chartData = showTrendline ? trendlineData : data;

  // Renderizar gráfico baseado no tipo
  const renderChart = () => {
    const color = metricColors[selectedMetric as keyof typeof metricColors] || '#3b82f6';

    switch (config.type) {
      case 'line':
        return (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              labelFormatter={(value) => `Sessão ${chartData.find(d => d.date === value)?.sessionNumber || ''}`}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={color} 
              strokeWidth={2}
              dot={{ fill: color, r: 4 }}
              name={selectedMetric}
            />
            {showTrendline && (
              <Line 
                type="monotone" 
                dataKey="trendline" 
                stroke={color} 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={false}
                name="Tendência"
              />
            )}
            {annotations.map((annotation, idx) => (
              <ReferenceLine 
                key={idx}
                x={annotation.date} 
                stroke={annotation.color || '#ef4444'} 
                strokeDasharray="3 3"
                label={{ value: annotation.label, position: 'top' }}
              />
            ))}
          </LineChart>
        );

      case 'bar':
        return (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              labelFormatter={(value) => `Sessão ${chartData.find(d => d.date === value)?.sessionNumber || ''}`}
            />
            <Legend />
            <Bar dataKey={selectedMetric} fill={color} name={selectedMetric} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(value) => new Date(value).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
            />
            <YAxis />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              labelFormatter={(value) => `Sessão ${chartData.find(d => d.date === value)?.sessionNumber || ''}`}
            />
            <Legend />
            <Area 
              type="monotone" 
              dataKey={selectedMetric} 
              stroke={color} 
              fill={color}
              fillOpacity={0.6}
              name={selectedMetric}
            />
          </AreaChart>
        );

      case 'scatter':
        return (
          <ScatterChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="sessionNumber" 
              name="Sessão"
            />
            <YAxis name={selectedMetric} />
            <Tooltip 
              contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb' }}
              cursor={{ strokeDasharray: '3 3' }}
            />
            <Legend />
            <Scatter 
              dataKey={selectedMetric} 
              fill={color} 
              name={selectedMetric}
            />
          </ScatterChart>
        );

      default:
        return null;
    }
  };

  const getChartIcon = () => {
    switch (config.type) {
      case 'line': return <TrendingUp className="w-4 h-4" />;
      case 'bar': return <BarChart3 className="w-4 h-4" />;
      case 'area': return <Activity className="w-4 h-4" />;
      case 'scatter': return <ScatterIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getChartIcon()}
            Evolução do Paciente
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{config.type}</Badge>
            {onExport && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onExport(config.exportFormat || 'png')}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Controles */}
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium text-slate-700 mb-2 block">
                Métrica
              </label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {config.metrics.map((metric) => (
                    <SelectItem key={metric} value={metric}>
                      {metric}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {config.type === 'line' && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="trendline"
                  checked={showTrendline}
                  onChange={(e) => setShowTrendline(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="trendline" className="text-sm text-slate-700">
                  Mostrar tendência
                </label>
              </div>
            )}
          </div>

          {/* Gráfico */}
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {renderChart()}
            </ResponsiveContainer>
          </div>

          {/* Informações adicionais */}
          <div className="text-xs text-slate-500 flex items-center justify-between">
            <span>
              {data.length} ponto(s) de dados
            </span>
            <span>
              Período: {new Date(config.dateRange.start).toLocaleDateString('pt-BR')} - {new Date(config.dateRange.end).toLocaleDateString('pt-BR')}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveEvolutionChart;

