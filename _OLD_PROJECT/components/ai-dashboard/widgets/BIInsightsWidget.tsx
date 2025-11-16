/**
 * Business Intelligence Insights Widget
 * Displays AI-powered analytics and recommendations
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Calendar,
  AlertCircle,
  Lightbulb,
  Target,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface BIInsightsWidgetProps {
  variant?: 'summary' | 'full';
}

// Mock data - would come from generateBIInsights
const mockInsights = {
  summary: 'Receita cresceu 8% MoM. Atenção para taxa de cancelamento (12%) e utilização da agenda (78%). Implementar retenção proativa.',
  keyMetrics: [
    {
      label: 'Receita Mensal',
      value: 'R$ 125.000',
      change: '+8%',
      trend: 'up',
      target: 'R$ 150.000',
    },
    {
      label: 'Margem de Lucro',
      value: '24%',
      change: '+2%',
      trend: 'up',
      target: '30%',
    },
    {
      label: 'Taxa de Utilização',
      value: '78%',
      change: '+5%',
      trend: 'up',
      target: '85%',
    },
    {
      label: 'NPS',
      value: '52',
      change: '+8',
      trend: 'up',
      target: '70',
    },
  ],
  alerts: [
    {
      type: 'warning',
      title: 'Taxa de cancelamento elevada',
      description: '12% de cancelamentos afetam produtividade',
      actionRequired: 'Implementar lembretes automáticos',
    },
    {
      type: 'info',
      title: 'Crescimento acelerado',
      description: 'Crescimento de 8% MoM é excepcional',
      actionRequired: 'Planejar expansão de equipe',
    },
  ],
  recommendations: [
    {
      title: 'Otimizar Agendamento',
      description: 'Reduzir horários ociosos com estratégias de preço dinâmico',
      impact: 'Aumento de 15-20% na utilização',
      roi: 7,
      timeframe: '1-2 meses',
    },
    {
      title: 'Programa de Retenção',
      description: 'Sistema proativo para identificar pacientes em risco',
      impact: 'Redução de 30-40% no churn',
      roi: 8,
      timeframe: '2-3 meses',
    },
  ],
  predictions: [
    {
      metric: 'Receita próximo mês',
      current: 125000,
      predicted: 135000,
      confidence: 75,
    },
    {
      metric: 'Pacientes ativos',
      current: 280,
      predicted: 295,
      confidence: 70,
    },
  ],
};

export function BIInsightsWidget({ variant = 'summary' }: BIInsightsWidgetProps) {
  if (variant === 'summary') {
    return (
      <Card className="border-blue-200 bg-gradient-to-br from-white to-blue-50/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">Business Intelligence</CardTitle>
            </div>
            <Badge variant="outline" className="bg-blue-50">
              IA Ativa
            </Badge>
          </div>
          <CardDescription>Insights e recomendações estratégicas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Executive Summary */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-slate-700">{mockInsights.summary}</p>
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {mockInsights.keyMetrics.slice(0, 4).map((metric, idx) => (
              <div key={idx} className="p-3 bg-white rounded-lg border border-slate-200">
                <p className="text-xs text-slate-600 mb-1">{metric.label}</p>
                <div className="flex items-end justify-between">
                  <p className="text-lg font-bold text-slate-900">{metric.value}</p>
                  <div className="flex items-center gap-1">
                    {metric.trend === 'up' ? (
                      <ArrowUpRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-red-600" />
                    )}
                    <span className={`text-xs font-semibold ${
                      metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Alert */}
          {mockInsights.alerts[0] && (
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">
                    {mockInsights.alerts[0].title}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">
                    {mockInsights.alerts[0].description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Top Recommendation */}
          {mockInsights.recommendations[0] && (
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-purple-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-semibold text-sm text-slate-900">
                      {mockInsights.recommendations[0].title}
                    </p>
                    <Badge className="bg-purple-600 text-xs">
                      ROI {mockInsights.recommendations[0].roi}/10
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600">
                    {mockInsights.recommendations[0].impact}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {mockInsights.keyMetrics.map((metric, idx) => (
          <Card key={idx}>
            <CardContent className="p-6">
              <p className="text-sm text-slate-600 mb-2">{metric.label}</p>
              <div className="flex items-end justify-between mb-2">
                <p className="text-3xl font-bold text-slate-900">{metric.value}</p>
                <div className="flex items-center gap-1">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                  <span className={`text-sm font-semibold ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">Meta: {metric.target}</span>
                </div>
                <Progress 
                  value={(parseFloat(metric.value.replace(/[^\d.]/g, '')) / parseFloat(metric.target.replace(/[^\d.]/g, ''))) * 100} 
                  className="h-1"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Alertas
            </CardTitle>
            <CardDescription>Pontos que requerem atenção</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInsights.alerts.map((alert, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-4 rounded-lg border-2 ${
                    alert.type === 'warning' 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className={`w-5 h-5 mt-0.5 ${
                      alert.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
                    }`} />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900 mb-1">
                        {alert.title}
                      </h4>
                      <p className="text-sm text-slate-600 mb-2">
                        {alert.description}
                      </p>
                      <div className="flex items-center gap-2 text-xs">
                        <Target className="w-3 h-3" />
                        <span className="font-medium">Ação: {alert.actionRequired}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5" />
              Recomendações Estratégicas
            </CardTitle>
            <CardDescription>Ações priorizadas por ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockInsights.recommendations.map((rec, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 rounded-lg border-2 border-purple-200 bg-purple-50"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{rec.title}</h4>
                    <Badge className="bg-purple-600">ROI {rec.roi}/10</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{rec.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-purple-700 font-semibold">{rec.impact}</span>
                    <span className="text-slate-600">Prazo: {rec.timeframe}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Previsões (Próximos 30 Dias)
          </CardTitle>
          <CardDescription>Baseado em machine learning</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mockInsights.predictions.map((pred, idx) => {
              const percentChange = ((pred.predicted - pred.current) / pred.current) * 100;
              const isPositive = percentChange > 0;

              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-sm text-slate-600 mb-3">{pred.metric}</p>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-xs text-slate-500">Atual</p>
                      <p className="text-xl font-bold text-slate-900">
                        {pred.current.toLocaleString('pt-BR')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {isPositive ? (
                        <ArrowUpRight className="w-5 h-5 text-green-600" />
                      ) : (
                        <ArrowDownRight className="w-5 h-5 text-red-600" />
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Previsão</p>
                      <p className="text-xl font-bold text-purple-600">
                        {pred.predicted.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-semibold ${
                      isPositive ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {percentChange > 0 ? '+' : ''}{percentChange.toFixed(1)}%
                    </span>
                    <span className="text-slate-600">
                      Confiança: {pred.confidence}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
