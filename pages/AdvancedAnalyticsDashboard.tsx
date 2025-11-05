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
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from '@/components/charts/ChartsLazyOptimized';
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
  const forecastChartData = useMemo(() => {
    return demandForecast.slice(0, 14).map(f => ({
      date: format(f.date, 'dd/MM', { locale: ptBR }),
      previsto: f.predictedAppointments,
      confiança: f.confidence
    }));
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
      <div className="p-8 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-slate-200 rounded w-1/3" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-slate-200 rounded" />
            ))}
          </div>
          <div className="h-96 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Brain className="w-8 h-8 text-purple-600" />
            Analytics Avançado com IA
          </h1>
          <p className="text-muted-foreground">Previsões, recomendações e insights inteligentes</p>
        </div>

        <Button onClick={loadAnalytics} disabled={loadingAnalytics}>
          {loadingAnalytics ? 'Analisando...' : 'Atualizar Analytics'}
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <Badge variant="secondary">Total</Badge>
            </div>
            <p className="text-2xl font-bold">{kpis.total}</p>
            <p className="text-xs text-muted-foreground">Consultas</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <Badge variant="secondary">Receita</Badge>
            </div>
            <p className="text-2xl font-bold text-green-600">R$ {kpis.revenue.toLocaleString('pt-BR')}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <Badge variant="secondary">Pacientes</Badge>
            </div>
            <p className="text-2xl font-bold">{kpis.uniquePatients}</p>
            <p className="text-xs text-muted-foreground">Únicos</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-4">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-orange-600" />
              <Badge variant="secondary">Ticket Médio</Badge>
            </div>
            <p className="text-2xl font-bold">R$ {kpis.avgValue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Por consulta</p>
          </Card>
        </motion.div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="predictions" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Previsões
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Recomendações
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Brain className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Predictions Tab */}
        <TabsContent value="predictions" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold text-lg mb-4">Previsão de Demanda (Próximos 14 dias)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={forecastChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="previsto"
                  stroke="#3b82f6"
                  fill="#93c5fd"
                  fillOpacity={0.6}
                />
                <Line
                  type="monotone"
                  dataKey="confiança"
                  stroke="#10b981"
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </TabsContent>

        {/* Recommendations Tab */}
        <TabsContent value="recommendations" className="space-y-3">
          {recommendations.length === 0 ? (
            <Card className="p-12 text-center">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhuma recomendação no momento</p>
            </Card>
          ) : (
            recommendations.map((rec, index) => (
              <motion.div
                key={rec.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        rec.priority === 'critical' && "bg-red-100 text-red-600",
                        rec.priority === 'high' && "bg-orange-100 text-orange-600",
                        rec.priority === 'medium' && "bg-yellow-100 text-yellow-600",
                        rec.priority === 'low' && "bg-blue-100 text-blue-600"
                      )}>
                        <Lightbulb className="w-5 h-5" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{rec.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{rec.description}</p>

                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>+{rec.impact.estimatedChange}% {rec.impact.metric}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <CheckCircle className="w-4 h-4 text-blue-600" />
                            <span>{rec.impact.confidence}% confiança</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Badge className="capitalize">{rec.priority}</Badge>
                  </div>

                  {rec.actions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {rec.actions.map(action => (
                        <Button key={action.id} size="sm" variant="outline" className="gap-2">
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
        <TabsContent value="insights" className="space-y-3">
          {insights.length === 0 ? (
            <Card className="p-12 text-center">
              <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-muted-foreground">Coletando dados para gerar insights...</p>
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
                  "p-6 border-l-4",
                  insight.severity === 'critical' && "border-l-red-500 bg-red-50/50 dark:bg-red-950/20",
                  insight.severity === 'warning' && "border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20",
                  insight.severity === 'success' && "border-l-green-500 bg-green-50/50 dark:bg-green-950/20",
                  insight.severity === 'info' && "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                )}>
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      insight.severity === 'critical' && "bg-red-100 text-red-600",
                      insight.severity === 'warning' && "bg-yellow-100 text-yellow-600",
                      insight.severity === 'success' && "bg-green-100 text-green-600",
                      insight.severity === 'info' && "bg-blue-100 text-blue-600"
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
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{insight.title}</h3>
                        <Badge variant="outline" className="capitalize">{insight.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                      
                      {insight.data.changePercent !== undefined && (
                        <div className="mt-2">
                          <Badge variant="secondary" className={cn(
                            "gap-1",
                            insight.data.changePercent > 0 && "bg-green-100 text-green-800",
                            insight.data.changePercent < 0 && "bg-red-100 text-red-800"
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

