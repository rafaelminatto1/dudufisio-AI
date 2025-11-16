import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Activity, AlertCircle, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LineChart, Line, ResponsiveContainer } from '@/components/charts/ChartsLazyOptimized';
import type { AssessmentStatistics, AssessmentChartData } from '../../types';
import { 
  getAssessmentHistory,
  calculateAssessmentStatistics,
  getAssessmentChartData 
} from '../../services/patientTrackingService';

interface MetricsDashboardProps {
  patientId: string;
}

interface MetricCardData extends AssessmentStatistics {
  chartData: AssessmentChartData[];
}

export const MetricsDashboard: React.FC<MetricsDashboardProps> = ({ patientId }) => {
  const [metrics, setMetrics] = useState<MetricCardData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, [patientId]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Buscar histórico completo
      const assessments = await getAssessmentHistory(patientId);
      
      // Pegar campos únicos
      const uniqueFields = [...new Set(assessments.map(a => a.fieldName))];
      
      // Calcular estatísticas e dados de gráfico para cada campo
      const metricsPromises = uniqueFields.map(async (fieldName) => {
        const [statistics, chartData] = await Promise.all([
          calculateAssessmentStatistics(patientId, fieldName),
          getAssessmentChartData(patientId, fieldName)
        ]);
        
        return {
          ...statistics,
          chartData
        };
      });
      
      const metricsData = await Promise.all(metricsPromises);
      
      // Ordenar por mais recente primeiro
      metricsData.sort((a, b) => b.count - a.count);
      
      setMetrics(metricsData);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendColor = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      case 'stable':
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const getTrendIcon = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4" />;
      case 'stable':
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTrendLabel = (trend: 'improving' | 'stable' | 'declining') => {
    switch (trend) {
      case 'improving':
        return 'Melhorando';
      case 'declining':
        return 'Piorando';
      case 'stable':
      default:
        return 'Estável';
    }
  };

  const renderSparkline = (data: AssessmentChartData[]) => {
    if (data.length < 2) return null;

    // Preparar dados para o gráfico
    const chartData = data.map((d, idx) => ({
      index: idx,
      value: d.value
    }));

    return (
      <div className="h-16 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <Line
              type="monotone"
              dataKey="value"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-slate-600">Carregando métricas...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (metrics.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center">
            <Activity className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600 mb-2">Nenhuma métrica registrada</p>
            <p className="text-sm text-slate-500">
              Adicione avaliações para visualizar as métricas do paciente
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900">Métricas de Acompanhamento</h2>
        <Badge variant="secondary">
          {metrics.length} {metrics.length === 1 ? 'Métrica' : 'Métricas'}
        </Badge>
      </div>

      {/* Grid de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.fieldName} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-sm font-medium text-slate-600 mb-1">
                    {metric.fieldName}
                  </CardTitle>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-slate-900">
                      {metric.latest}
                    </span>
                    {metric.unit && (
                      <span className="text-sm text-slate-500">{metric.unit}</span>
                    )}
                  </div>
                </div>
                <Badge className={`${getTrendColor(metric.trend)} flex items-center gap-1`}>
                  {getTrendIcon(metric.trend)}
                  {getTrendLabel(metric.trend)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Sparkline */}
              {renderSparkline(metric.chartData)}

              {/* Estatísticas */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Média</p>
                  <p className="font-semibold text-slate-900">
                    {metric.average} {metric.unit}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Variação</p>
                  <p className={`font-semibold ${
                    metric.percentChange > 0 
                      ? 'text-green-600' 
                      : metric.percentChange < 0 
                      ? 'text-red-600' 
                      : 'text-slate-600'
                  }`}>
                    {metric.percentChange > 0 ? '+' : ''}{metric.percentChange.toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Mínimo</p>
                  <p className="font-semibold text-slate-900">
                    {metric.min} {metric.unit}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Máximo</p>
                  <p className="font-semibold text-slate-900">
                    {metric.max} {metric.unit}
                  </p>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {metric.count} {metric.count === 1 ? 'medição' : 'medições'}
                </div>
                {metric.trend === 'declining' && (
                  <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-3 h-3" />
                    Atenção
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legenda de Trends */}
      <Card className="bg-slate-50">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600 font-medium">Legenda de Tendências:</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Badge className="bg-green-50 text-green-600">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Melhorando
                </Badge>
                <span className="text-slate-500">Melhora &gt; 5%</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-slate-50 text-slate-600">
                  <Activity className="w-3 h-3 mr-1" />
                  Estável
                </Badge>
                <span className="text-slate-500">Variação &lt; 5%</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-red-50 text-red-600">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  Piorando
                </Badge>
                <span className="text-slate-500">Piora &gt; 5%</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            * Para métricas de dor e edema, a lógica é invertida: diminuição = melhora
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricsDashboard;

