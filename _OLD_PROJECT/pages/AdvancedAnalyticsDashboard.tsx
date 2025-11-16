import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAppointments } from '../hooks/useAppointments';
import { useData } from '../contexts/AppContext';
import { predictionService } from '../services/ai/predictionService';
import { recommendationService } from '../services/ai/recommendationService';
import { insightsService } from '../services/ai/insightsService';
import { Prediction, Recommendation, Insight, DemandForecast } from '../types/analytics';
import {
  TrendingUp,
  Brain,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
  DollarSign,
  Users,
  ArrowRight
} from 'lucide-react';
import { NivoAreaLineChart, type AreaLineSerie } from '@/components/charts/nivo';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';

const AdvancedAnalyticsDashboard: React.FC = () => {
  const { appointments, loading } = useAppointments();
  const { therapists } = useData();

  const [demandForecast, setDemandForecast] = useState<DemandForecast[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  useEffect(() => {
    if (!loading && appointments.length > 0) {
      loadAnalytics();
    }
  }, [loading, appointments]);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);

    try {
      // 1. Demand prediction
      const forecast = await predictionService.predictDemand(appointments, 30);
      setDemandForecast(forecast);

      // 2. Recommendations
      const scheduleOpt = await recommendationService.suggestScheduleOptimizations(
        appointments,
        therapists
      );

      setRecommendations([
        {
          id: `rec-opt-${Date.now()}`,
          type: 'optimization',
          title: 'Otimizações Sugeridas',
          description: `${scheduleOpt.length} sugestões para melhorar sua operação`,
          priority: 'high',
          impact: {
            metric: 'efficiency',
            estimatedChange: 15,
            confidence: 80
          },
          actions: scheduleOpt.map(s => ({
            id: s.title,
            label: s.title,
            description: s.description,
            actionType: 'navigate',
            actionData: {}
          })),
          createdAt: new Date(),
          status: 'active'
        }
      ]);

      // 3. Insights
      const noShowInsights = await insightsService.analyzeNoShowPatterns(appointments);
      const trendInsights = await insightsService.analyzeTrends(
        appointments.filter(apt => apt.startTime >= subDays(new Date(), 30)),
        appointments.filter(apt => {
          const time = apt.startTime.getTime();
          const now = Date.now();
          return time >= now - 60 * 24 * 60 * 60 * 1000 && time < now - 30 * 24 * 60 * 60 * 1000;
        })
      );

      setInsights([...noShowInsights, ...trendInsights]);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Chart data
  const forecastSeries = useMemo<AreaLineSerie[]>(() => {
    const dates = demandForecast.slice(0, 14).map(f => ({
      label: format(f.date, 'dd/MM', { locale: ptBR }),
      predicted: f.predictedAppointments,
      confidence: f.confidence,
    }));

    const seriesList: AreaLineSerie[] = [
      {
        id: 'previsto',
        label: 'Consultas previstas',
        color: '#2563eb',
        data: dates.map(entry => ({ x: entry.label, y: entry.predicted })),
        area: { enabled: true, opacity: 0.35, fill: '#93c5fd' },
      },
      {
        id: 'confiança',
        label: 'Confiança (%)',
        color: '#10b981',
        data: dates.map(entry => ({ x: entry.label, y: entry.confidence })),
      },
    ];

    return seriesList;
  }, [demandForecast]);

  const kpis = useMemo(() => {
    const total = appointments.length;
    const revenue = appointments.reduce((sum, apt) => sum + apt.value, 0);
    const uniquePatients = new Set(appointments.map(apt => apt.patientId)).size;
    const avgValue = total > 0 ? revenue / total : 0;

    return { total, revenue, uniquePatients, avgValue };
  }, [appointments]);

  if (loading || loadingAnalytics) {
    return (
      <div className="p-xl space-y-xl">
        <div className="animate-pulse space-y-md">
          <div className="h-12 bg-neutral-bgDark rounded w-1/3" />
          <div className="grid grid-cols-4 gap-md">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-neutral-bgDark rounded" />
            ))}
          </div>
          <div className="h-96 bg-neutral-bgDark rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-lg space-y-xl max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-sm">
            <Brain className="w-8 h-8 text-purple-600" />
            Analytics Avançado com IA
          </h1>
          <p className="text-neutral-textSecondary">Previsões, recomendações e insights inteligentes</p>
        </div>

        <Button onClick={loadAnalytics} disabled={loadingAnalytics}>
          {loadingAnalytics ? 'Analisando...' : 'Atualizar Analytics'}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <Calendar className="w-5 h-5 text-primary" />
              <Badge variant="secondary">Total</Badge>
            </div>
            <p className="text-2xl font-bold">{kpis.total}</p>
            <p className="text-xs text-neutral-textSecondary">Consultas</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <DollarSign className="w-5 h-5 text-success" />
              <Badge variant="secondary">Receita</Badge>
            </div>
            <p className="text-2xl font-bold text-success">R$ {kpis.revenue.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-neutral-textSecondary">Total</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <Users className="w-5 h-5 text-purple-600" />
              <Badge variant="secondary">Pacientes</Badge>
            </div>
            <p className="text-2xl font-bold">{kpis.uniquePatients}</p>
            <p className="text-xs text-neutral-textSecondary">Únicos</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-md">
            <div className="flex items-center justify-between mb-sm">
              <BarChart3 className="w-5 h-5 text-warning" />
              <Badge variant="secondary">Ticket Médio</Badge>
            </div>
            <p className="text-2xl font-bold">R$ {kpis.avgValue.toFixed(2)}</p>
            <p className="text-xs text-neutral-textSecondary">Por consulta</p>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="predictions" className="space-y-md">
        <TabsList>
          <TabsTrigger value="predictions" className="gap-sm">
            <TrendingUp className="w-4 h-4" />
            Previsões
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-sm">
            <Lightbulb className="w-4 h-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-sm">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-md">
          <Card className="p-lg">
            <h3 className="font-semibold text-lg mb-md">Previsão de Demanda (Próximos 14 dias)</h3>
            <NivoAreaLineChart
              series={forecastSeries}
              height={320}
              yFormat={value =>
                typeof value === 'number' ? value.toLocaleString('pt-BR', { maximumFractionDigits: 0 }) : `${value}`
              }
            />
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-sm">
          {recommendations.length === 0 ? (
            <Card className="p-12 text-center">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-md" />
              <p className="text-neutral-textSecondary">Nenhuma recomendação no momento</p>
            </Card>
          ) : (
            recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-lg">
                  <div className="flex items-start justify-between mb-md">
                    <div className="flex items-start gap-md">
                      <div className={cn(
                        "p-sm rounded-lg",
                        rec.priority === 'critical' && "bg-error-light text-error",
                        rec.priority === 'high' && "bg-warning-light text-warning",
                        rec.priority === 'medium' && "bg-warning-light text-warning",
                        rec.priority === 'low' && "bg-primary-light text-primary"
                      )}>
                        <Lightbulb className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{rec.title}</h3>
                        <p className="text-sm text-neutral-textSecondary mb-md">{rec.description}</p>

                        <div className="flex items-center gap-md text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-success" />
                            <span>+{rec.impact.estimatedChange}% {rec.impact.metric}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-primary" />
                            <span>{rec.impact.confidence}% confiança</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Badge className="capitalize">{rec.priority}</Badge>
                  </div>

                  {rec.actions.length > 0 && (
                    <div className="flex flex-wrap gap-sm">
                      {rec.actions.map(action => (
                        <Button key={action.id} size="sm" variant="outline" className="gap-sm">
                          {action.label}
                          <ArrowRight className="w-3 h-3" />
                        </Button>
                      ))}
                    </div>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights" className="space-y-sm">
          {insights.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-md" />
              <p className="text-neutral-textSecondary">Coletando dados para gerar insights...</p>
            </Card>
          ) : (
            insights.map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={cn(
                  "p-lg border-l-4",
                  insight.severity === 'critical' && "border-l-red-500 bg-error-light/50 dark:bg-red-950/20",
                  insight.severity === 'warning' && "border-l-yellow-500 bg-warning-light/50 dark:bg-yellow-950/20",
                  insight.severity === 'success' && "border-l-green-500 bg-success-light/50 dark:bg-green-950/20",
                  insight.severity === 'info' && "border-l-blue-500 bg-primary-light/50 dark:bg-blue-950/20"
                )}>
                  <div className="flex items-start gap-md">
                    <div className={cn(
                      "p-sm rounded-lg",
                      insight.severity === 'critical' && "bg-error-light text-error",
                      insight.severity === 'warning' && "bg-warning-light text-warning",
                      insight.severity === 'success' && "bg-success-light text-success",
                      insight.severity === 'info' && "bg-primary-light text-primary"
                    )}>
                      {insight.severity === 'warning' || insight.severity === 'critical' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : insight.severity === 'success' ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Brain className="w-5 h-5" />
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-sm">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant="outline" className="capitalize">{insight.category}</Badge>
                      </div>
                      <p className="text-sm text-neutral-textSecondary">{insight.description}</p>
                      
                      {insight.data.changePercent !== undefined && (
                        <div className="mt-sm">
                          <Badge variant="secondary" className={cn(
                            "gap-1",
                            insight.data.changePercent > 0 && "bg-success-light text-success",
                            insight.data.changePercent < 0 && "bg-error-light text-error"
                          )}>
                            {insight.data.changePercent > 0 ? '+' : ''}
                            {insight.data.changePercent.toFixed(1)}%
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalyticsDashboard;

