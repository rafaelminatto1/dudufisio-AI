/**
 * > CLINICAL ANALYTICS PAGE - DUDUFISIO-AI
 *
 * Página completa de analytics clínicos com métricas avançadas,
 * análises de outcomes, comparações de tratamentos e insights baseados em evidências.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LazyLineChart, LazyBarChart, LazyPieChart, LazyAreaChart } from '../components/charts/LazyCharts';
import PageHeader from '../components/PageHeader';
import {
  HeartPulse, TrendingUp, TrendingDown, Activity, Users, Calendar,
  Brain, Target, Award, Clock, Stethoscope, ClipboardCheck,
  BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  Filter, Download, RefreshCw, AlertTriangle, CheckCircle2,
  Star, Eye, Settings, FileText, ChevronRight, ArrowUpRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';
import useClinicalAnalytics from '../hooks/useClinicalAnalytics';

interface ClinicalMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  benchmark?: number;
  category: 'outcome' | 'efficiency' | 'satisfaction' | 'safety';
}

interface TreatmentOutcome {
  protocolId: string;
  protocolName: string;
  totalPatients: number;
  successRate: number;
  averageDuration: number;
  satisfactionScore: number;
  painReduction: number;
  functionalImprovement: number;
  adherenceRate: number;
  complicationRate: number;
  trend: 'improving' | 'declining' | 'stable';
}

interface PatientSegmentation {
  segment: string;
  patients: number;
  percentage: number;
  averageOutcome: number;
  characteristics: string[];
}

interface ClinicalAlert {
  id: string;
  type: 'warning' | 'info' | 'success' | 'critical';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'outcome' | 'safety' | 'efficiency' | 'compliance';
  timestamp: string;
  actionRequired: boolean;
}

interface OutcomeMetrics {
  month: string;
  painReduction: number;
  functionalImprovement: number;
  qualityOfLife: number;
  returnToWork: number;
  patientSatisfaction: number;
}

const ClinicalAnalyticsPage: React.FC = () => {
  const { kpis, painEvolution, successByPathology, isLoading } = useClinicalAnalytics();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMetric, setSelectedMetric] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<string>('3months');

  // Enhanced analytics state
  const [clinicalMetrics, setClinicalMetrics] = useState<ClinicalMetric[]>([]);
  const [treatmentOutcomes, setTreatmentOutcomes] = useState<TreatmentOutcome[]>([]);
  const [patientSegmentation, setPatientSegmentation] = useState<PatientSegmentation[]>([]);
  const [clinicalAlerts, setClinicalAlerts] = useState<ClinicalAlert[]>([]);
  const [outcomeMetrics, setOutcomeMetrics] = useState<OutcomeMetrics[]>([]);
  const [isLoadingEnhanced, setIsLoadingEnhanced] = useState(true);

  // 🚀 Função de carregamento memoizada
  const loadEnhancedClinicalData = useCallback(async () => {
    try {
      setIsLoadingEnhanced(true);

      await Promise.all([
        loadClinicalMetrics(),
        loadTreatmentOutcomes(),
        loadPatientSegmentation(),
        loadClinicalAlerts(),
        loadOutcomeMetrics()
      ]);
    } catch (error) {
      console.error('Error loading enhanced clinical data:', error);
    } finally {
      setIsLoadingEnhanced(false);
    }
  }, [timeRange]);

  useEffect(() => {
    loadEnhancedClinicalData();
  }, [loadEnhancedClinicalData]);

  const loadClinicalMetrics = async (): Promise<void> => {
    const metrics: ClinicalMetric[] = [
      {
        id: '1',
        name: 'Taxa de Recuperação Completa',
        value: 87.5,
        unit: '%',
        trend: 'up',
        change: 5.2,
        benchmark: 85,
        category: 'outcome'
      },
      {
        id: '2',
        name: 'Redução Média da Dor (EVA)',
        value: 6.8,
        unit: 'pontos',
        trend: 'up',
        change: 0.8,
        benchmark: 6.0,
        category: 'outcome'
      },
      {
        id: '3',
        name: 'Tempo Médio de Tratamento',
        value: 14.2,
        unit: 'sessões',
        trend: 'down',
        change: -1.5,
        benchmark: 16,
        category: 'efficiency'
      },
      {
        id: '4',
        name: 'Satisfação do Paciente (NPS)',
        value: 82,
        unit: 'pontos',
        trend: 'up',
        change: 3.1,
        benchmark: 80,
        category: 'satisfaction'
      },
      {
        id: '5',
        name: 'Taxa de Aderência',
        value: 91.3,
        unit: '%',
        trend: 'stable',
        change: 0.2,
        benchmark: 90,
        category: 'efficiency'
      },
      {
        id: '6',
        name: 'Taxa de Complicações',
        value: 2.1,
        unit: '%',
        trend: 'down',
        change: -0.8,
        benchmark: 3,
        category: 'safety'
      }
    ];
    setClinicalMetrics(metrics);
  };

  const loadTreatmentOutcomes = async (): Promise<void> => {
    const outcomes: TreatmentOutcome[] = [
      {
        protocolId: '1',
        protocolName: 'Reabilitação Lombar',
        totalPatients: 156,
        successRate: 89.7,
        averageDuration: 12.5,
        satisfactionScore: 8.4,
        painReduction: 7.2,
        functionalImprovement: 85.3,
        adherenceRate: 92.1,
        complicationRate: 1.9,
        trend: 'improving'
      },
      {
        protocolId: '2',
        protocolName: 'Reabilitação Pós-Cirúrgica Joelho',
        totalPatients: 89,
        successRate: 82.0,
        averageDuration: 18.3,
        satisfactionScore: 7.8,
        painReduction: 6.5,
        functionalImprovement: 78.9,
        adherenceRate: 88.7,
        complicationRate: 3.4,
        trend: 'stable'
      },
      {
        protocolId: '3',
        protocolName: 'Fisioterapia Respiratória',
        totalPatients: 234,
        successRate: 94.4,
        averageDuration: 8.7,
        satisfactionScore: 9.1,
        painReduction: 5.8,
        functionalImprovement: 91.2,
        adherenceRate: 95.3,
        complicationRate: 0.9,
        trend: 'improving'
      },
      {
        protocolId: '4',
        protocolName: 'Reabilitação Ombro',
        totalPatients: 67,
        successRate: 76.1,
        averageDuration: 16.8,
        satisfactionScore: 7.3,
        painReduction: 5.9,
        functionalImprovement: 72.4,
        adherenceRate: 84.2,
        complicationRate: 4.5,
        trend: 'declining'
      }
    ];
    setTreatmentOutcomes(outcomes);
  };

  const loadPatientSegmentation = async (): Promise<void> => {
    const segmentation: PatientSegmentation[] = [
      {
        segment: 'Jovens Atletas (18-30)',
        patients: 145,
        percentage: 22.3,
        averageOutcome: 92.5,
        characteristics: ['Alta aderência', 'Recuperação rápida', 'Motivação elevada']
      },
      {
        segment: 'Adultos Ativos (31-50)',
        patients: 298,
        percentage: 45.8,
        averageOutcome: 85.7,
        characteristics: ['Boa aderência', 'Resultados consistentes', 'Equilibrio vida-trabalho']
      },
      {
        segment: 'Idosos (51-70)',
        patients: 167,
        percentage: 25.7,
        averageOutcome: 78.3,
        characteristics: ['Comorbidades', 'Recuperação mais lenta', 'Necessita suporte extra']
      },
      {
        segment: 'Idosos Frágeis (70+)',
        patients: 40,
        percentage: 6.2,
        averageOutcome: 68.9,
        characteristics: ['Múltiplas comorbidades', 'Risco elevado', 'Cuidados especiais']
      }
    ];
    setPatientSegmentation(segmentation);
  };

  const loadClinicalAlerts = async (): Promise<void> => {
    const alerts: ClinicalAlert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'Taxa de Abandono Elevada',
        message: 'Protocolo de reabilitação de ombro apresenta 15% de abandono acima da média',
        severity: 'medium',
        category: 'efficiency',
        timestamp: new Date().toISOString(),
        actionRequired: true
      },
      {
        id: '2',
        type: 'success',
        title: 'Meta de Satisfação Atingida',
        message: 'NPS de fisioterapia respiratória atingiu 91 pontos, superando a meta',
        severity: 'low',
        category: 'outcome',
        timestamp: new Date().toISOString(),
        actionRequired: false
      },
      {
        id: '3',
        type: 'critical',
        title: 'Aumento de Complicações',
        message: 'Protocolo pós-cirúrgico joelho com aumento de 2x nas complicações',
        severity: 'critical',
        category: 'safety',
        timestamp: new Date().toISOString(),
        actionRequired: true
      }
    ];
    setClinicalAlerts(alerts);
  };

  const loadOutcomeMetrics = async (): Promise<void> => {
    const outcomes: OutcomeMetrics[] = [
      {
        month: 'Jan',
        painReduction: 6.2,
        functionalImprovement: 78.5,
        qualityOfLife: 82.1,
        returnToWork: 89.3,
        patientSatisfaction: 8.1
      },
      {
        month: 'Fev',
        painReduction: 6.5,
        functionalImprovement: 81.2,
        qualityOfLife: 83.7,
        returnToWork: 91.2,
        patientSatisfaction: 8.3
      },
      {
        month: 'Mar',
        painReduction: 6.8,
        functionalImprovement: 83.9,
        qualityOfLife: 85.4,
        returnToWork: 93.1,
        patientSatisfaction: 8.4
      },
      {
        month: 'Abr',
        painReduction: 7.1,
        functionalImprovement: 85.7,
        qualityOfLife: 87.2,
        returnToWork: 94.8,
        patientSatisfaction: 8.6
      }
    ];
    setOutcomeMetrics(outcomes);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'improving':
        return <ArrowUpRight className="w-4 h-4 text-success" />;
      case 'down':
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-error" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical': return 'bg-error-light text-error border-error';
      case 'high': return 'bg-warning-light text-warning border-warning';
      case 'medium': return 'bg-warning-light text-yellow-800 border-yellow-200';
      case 'low': return 'bg-success-light text-success border-success';
      default: return 'bg-neutral-bgDark text-gray-800 border-neutral-border';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'warning': return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'info': return <Brain className="w-5 h-5 text-blue-500" />;
      default: return <Brain className="w-5 h-5 text-gray-500" />;
    }
  };

  if (isLoading || isLoadingEnhanced) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-md">
          <Activity className="w-8 h-8 animate-pulse text-primary" />
          <div>
            <div className="text-lg font-semibold text-neutral-text">Analisando dados clínicos...</div>
            <div className="text-sm text-neutral-textSecondary">Processando métricas e outcomes</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="clinical_analytics:read">
      <div className="p-lg max-w-7xl mx-auto space-y-xl">
        <div className="flex items-center justify-between">
          <PageHeader
            title="Analytics Clínicos"
            subtitle="Análises avançadas de performance clínica e outcomes de tratamentos"
          />

          <div className="flex items-center gap-md">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="rounded-lg border-gray-300 bg-white shadow-card focus:ring-sky-500 focus:border-sky-500"
            >
              <option value="1month">Último Mês</option>
              <option value="3months">Últimos 3 Meses</option>
              <option value="6months">Últimos 6 Meses</option>
              <option value="1year">Último Ano</option>
            </select>
            <button className="flex items-center gap-sm px-md py-sm bg-primary-hover text-white rounded-lg hover:bg-primary-hover transition-colors">
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </div>

        {/* Clinical Alerts */}
        {clinicalAlerts.length > 0 && (
          <div className="bg-white rounded-lg shadow-card border border-neutral-border p-md">
            <h3 className="text-lg font-semibold text-neutral-text mb-md flex items-center gap-sm">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Alertas Clínicos
            </h3>
            <div className="space-y-sm">
              {clinicalAlerts.map((alert: any) => (
                <div key={alert.id} className={`border rounded-lg p-md ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start gap-md">
                    {getAlertIcon(alert.type)}
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-xs">{alert.message}</p>
                      {alert.actionRequired && (
                        <button className="text-xs mt-sm px-sm py-1 bg-white rounded border font-medium hover:bg-neutral-bgAlt">
                          Ação Necessária
                        </button>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {clinicalMetrics.map((metric: any) => (
            <div key={metric.id} className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
              <div className="flex items-center justify-between mb-md">
                <div className={`p-md rounded-lg ${
                  metric.category === 'outcome' ? 'bg-success-light' :
                  metric.category === 'efficiency' ? 'bg-primary-light' :
                  metric.category === 'satisfaction' ? 'bg-purple-100' :
                  'bg-warning-light'
                }`}>
                  {metric.category === 'outcome' && <Target className="w-6 h-6 text-success" />}
                  {metric.category === 'efficiency' && <Clock className="w-6 h-6 text-primary" />}
                  {metric.category === 'satisfaction' && <Star className="w-6 h-6 text-purple-600" />}
                  {metric.category === 'safety' && <AlertTriangle className="w-6 h-6 text-warning" />}
                </div>
                {getTrendIcon(metric.trend)}
              </div>

              <h3 className="text-sm font-medium text-neutral-textSecondary mb-1">{metric.name}</h3>
              <div className="flex items-baseline gap-sm">
                <span className="text-2xl font-bold text-neutral-text">
                  {metric.value}
                </span>
                <span className="text-sm text-gray-500">{metric.unit}</span>
              </div>

              <div className="flex items-center justify-between mt-3 text-sm">
                <span className={`flex items-center gap-1 ${
                  metric.change > 0 ? 'text-success' : metric.change < 0 ? 'text-error' : 'text-neutral-textSecondary'
                }`}>
                  {metric.change > 0 ? '+' : ''}{metric.change}
                  {metric.unit === '%' ? 'pp' : metric.unit}
                </span>
                {metric.benchmark && (
                  <span className="text-gray-500">
                    Meta: {metric.benchmark}{metric.unit}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-xl">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="outcomes">Outcomes</TabsTrigger>
            <TabsTrigger value="protocols">Protocolos</TabsTrigger>
            <TabsTrigger value="segmentation">Segmentação</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-xl">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
              {/* Pain Evolution */}
              <div className="lg:col-span-2 bg-white rounded-lg shadow-card border border-neutral-border">
                <div className="p-lg border-b border-neutral-border">
                  <h3 className="text-lg font-semibold text-neutral-text">Evolução da Dor (EVA) por Sessão</h3>
                </div>
                <div className="p-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={painEvolution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="session" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="avgPain" stroke="#ef4444" strokeWidth={2} name="Dor Média" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Success by Pathology */}
              <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                <div className="p-lg border-b border-neutral-border">
                  <h3 className="text-lg font-semibold text-neutral-text">Taxa de Sucesso por Patologia</h3>
                </div>
                <div className="p-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={successByPathology} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Bar dataKey="successRate" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Additional Overview Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {/* Patient Distribution */}
              <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                <div className="p-lg border-b border-neutral-border">
                  <h3 className="text-lg font-semibold text-neutral-text">Distribuição por Faixa Etária</h3>
                </div>
                <div className="p-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={patientSegmentation}
                        dataKey="percentage"
                        nameKey="segment"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                      >
                        {patientSegmentation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][index]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Outcome Trends */}
              <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                <div className="p-lg border-b border-neutral-border">
                  <h3 className="text-lg font-semibold text-neutral-text">Tendências de Outcomes</h3>
                </div>
                <div className="p-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={outcomeMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="painReduction" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} name="Redução da Dor" />
                      <Area type="monotone" dataKey="functionalImprovement" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Melhora Funcional" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Outcomes Tab */}
          <TabsContent value="outcomes" className="space-y-xl">
            <div className="bg-white rounded-lg shadow-card border border-neutral-border">
              <div className="p-lg border-b border-neutral-border">
                <h3 className="text-lg font-semibold text-neutral-text">Métricas de Outcome Detalhadas</h3>
              </div>
              <div className="p-lg">
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={outcomeMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="painReduction" stroke="#ef4444" strokeWidth={2} name="Redução da Dor (EVA)" />
                    <Line type="monotone" dataKey="functionalImprovement" stroke="#3b82f6" strokeWidth={2} name="Melhora Funcional (%)" />
                    <Line type="monotone" dataKey="qualityOfLife" stroke="#10b981" strokeWidth={2} name="Qualidade de Vida (%)" />
                    <Line type="monotone" dataKey="returnToWork" stroke="#f59e0b" strokeWidth={2} name="Retorno ao Trabalho (%)" />
                    <Line type="monotone" dataKey="patientSatisfaction" stroke="#8b5cf6" strokeWidth={2} name="Satisfação (0-10)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outcome Distribution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
              <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                <div className="p-lg border-b border-neutral-border">
                  <h3 className="text-lg font-semibold text-neutral-text">Distribuição de Outcomes</h3>
                </div>
                <div className="p-lg">
                  <ResponsiveContainer width="100%" height={300}>
                    <RadialBarChart cx="50%" cy="50%" innerRadius="10%" outerRadius="80%" data={[
                      { name: 'Excelente', value: 45, fill: '#10b981' },
                      { name: 'Bom', value: 35, fill: '#3b82f6' },
                      { name: 'Regular', value: 15, fill: '#f59e0b' },
                      { name: 'Ruim', value: 5, fill: '#ef4444' }
                    ]}>
                      <RadialBar dataKey="value" cornerRadius={10} />
                      <Tooltip />
                      <Legend />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-card border border-neutral-border">
                <div className="p-lg border-b border-neutral-border">
                  <h3 className="text-lg font-semibold text-neutral-text">Comparação com Benchmarks</h3>
                </div>
                <div className="p-lg space-y-md">
                  {clinicalMetrics.slice(0, 4).map((metric: any) => (
                    <div key={metric.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span>{metric.name}</span>
                        <span>{metric.value}{metric.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            metric.value >= (metric.benchmark || 0) ? 'bg-success-light0' : 'bg-warning-light0'
                          }`}
                          style={{ width: `${Math.min((metric.value / (metric.benchmark || 100)) * 100, 100)}%` }}
                        />
                      </div>
                      {metric.benchmark && (
                        <div className="text-xs text-gray-500 mt-xs">
                          Benchmark: {metric.benchmark}{metric.unit}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Protocols Tab */}
          <TabsContent value="protocols" className="space-y-xl">
            <div className="bg-white rounded-lg shadow-card border border-neutral-border">
              <div className="p-lg border-b border-neutral-border">
                <h3 className="text-lg font-semibold text-neutral-text">Performance dos Protocolos de Tratamento</h3>
              </div>
              <div className="p-lg">
                <div className="space-y-xl">
                  {treatmentOutcomes.map((protocol: any) => (
                    <div key={protocol.protocolId} className="border border-neutral-border rounded-lg p-lg">
                      <div className="flex items-center justify-between mb-md">
                        <div>
                          <h4 className="text-lg font-semibold text-neutral-text">{protocol.protocolName}</h4>
                          <p className="text-sm text-neutral-textSecondary">{protocol.totalPatients} pacientes tratados</p>
                        </div>
                        <div className="flex items-center gap-sm">
                          {getTrendIcon(protocol.trend)}
                          <span className={`px-md py-1 rounded-full text-sm font-medium ${
                            protocol.successRate >= 90 ? 'bg-success-light text-success' :
                            protocol.successRate >= 80 ? 'bg-primary-light text-primary' :
                            protocol.successRate >= 70 ? 'bg-warning-light text-yellow-700' :
                            'bg-error-light text-error'
                          }`}>
                            {protocol.successRate}% sucesso
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-lg mb-xl">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-success">{protocol.satisfactionScore}</div>
                          <div className="text-sm text-neutral-textSecondary">Satisfação (0-10)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-primary">{protocol.painReduction}</div>
                          <div className="text-sm text-neutral-textSecondary">Redução Dor (EVA)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{protocol.functionalImprovement}%</div>
                          <div className="text-sm text-neutral-textSecondary">Melhora Funcional</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-warning">{protocol.adherenceRate}%</div>
                          <div className="text-sm text-neutral-textSecondary">Aderência</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Taxa de Sucesso</span>
                            <span>{protocol.successRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-success-light0 h-2 rounded-full"
                              style={{ width: `${protocol.successRate}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Taxa de Complicações</span>
                            <span>{protocol.complicationRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-error-light0 h-2 rounded-full"
                              style={{ width: `${protocol.complicationRate * 10}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Segmentation Tab */}
          <TabsContent value="segmentation" className="space-y-xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
              {patientSegmentation.map((segment, index) => (
                <div key={index} className="bg-white rounded-lg shadow-card border border-neutral-border p-lg">
                  <div className="flex items-center justify-between mb-md">
                    <h3 className="text-lg font-semibold text-neutral-text">{segment.segment}</h3>
                    <span className="text-sm text-gray-500">{segment.percentage}% dos pacientes</span>
                  </div>

                  <div className="mb-md">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Outcome Médio</span>
                      <span className="font-medium">{segment.averageOutcome}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full ${
                          segment.averageOutcome >= 90 ? 'bg-success-light0' :
                          segment.averageOutcome >= 80 ? 'bg-primary' :
                          segment.averageOutcome >= 70 ? 'bg-warning-light0' :
                          'bg-error-light0'
                        }`}
                        style={{ width: `${segment.averageOutcome}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-sm">
                    <h4 className="font-medium text-neutral-text">Características:</h4>
                    <ul className="space-y-1">
                      {segment.characteristics.map((char, idx) => (
                        <li key={idx} className="text-sm text-neutral-textSecondary flex items-center gap-sm">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          {char}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-md pt-4 border-t border-neutral-border">
                    <span className="text-lg font-bold text-neutral-text">{segment.patients}</span>
                    <span className="text-sm text-neutral-textSecondary ml-xs">pacientes ativos</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-xl">
            <div className="bg-white rounded-lg shadow-card border border-neutral-border">
              <div className="p-lg border-b border-neutral-border">
                <h3 className="text-lg font-semibold text-neutral-text flex items-center gap-sm">
                  <FileText className="w-5 h-5 text-purple-600" />
                  Relatórios Clínicos
                </h3>
              </div>
              <div className="p-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
                  <div className="border border-neutral-border rounded-lg p-lg hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-md mb-md">
                      <div className="p-md bg-success-light rounded-lg">
                        <Target className="w-6 h-6 text-success" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-text">Relatório de Outcomes</h4>
                        <p className="text-sm text-neutral-textSecondary">Análise completa de resultados</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-sm py-sm px-md border border-green-600 text-success rounded-lg hover:bg-success-light transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-neutral-border rounded-lg p-lg hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-md mb-md">
                      <div className="p-md bg-primary-light rounded-lg">
                        <BarChart3 className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-text">Performance de Protocolos</h4>
                        <p className="text-sm text-neutral-textSecondary">Eficácia por tratamento</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-sm py-sm px-md border border-blue-600 text-primary rounded-lg hover:bg-primary-light transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-neutral-border rounded-lg p-lg hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-md mb-md">
                      <div className="p-md bg-purple-100 rounded-lg">
                        <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-text">Segmentação de Pacientes</h4>
                        <p className="text-sm text-neutral-textSecondary">Análise por perfil demográfico</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-sm py-sm px-md border border-purple-600 text-purple-600 rounded-lg hover:bg-purple-50 transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-neutral-border rounded-lg p-lg hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-md mb-md">
                      <div className="p-md bg-warning-light rounded-lg">
                        <AlertTriangle className="w-6 h-6 text-warning" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-text">Relatório de Qualidade</h4>
                        <p className="text-sm text-neutral-textSecondary">Indicadores de qualidade e segurança</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-sm py-sm px-md border border-orange-600 text-warning rounded-lg hover:bg-warning-light transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-neutral-border rounded-lg p-lg hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-md mb-md">
                      <div className="p-md bg-error-light rounded-lg">
                        <Stethoscope className="w-6 h-6 text-error" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-text">Auditoria Clínica</h4>
                        <p className="text-sm text-neutral-textSecondary">Compliance e regulamentações</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-sm py-sm px-md border border-red-600 text-error rounded-lg hover:bg-error-light transition-colors">
                      <Download className="w-4 h-4" />
                      Gerar Relatório
                    </button>
                  </div>

                  <div className="border border-neutral-border rounded-lg p-lg hover:border-sky-300 transition-colors cursor-pointer">
                    <div className="flex items-center gap-md mb-md">
                      <div className="p-md bg-primary-light rounded-lg">
                        <Settings className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-neutral-text">Relatório Personalizado</h4>
                        <p className="text-sm text-neutral-textSecondary">Configure métricas específicas</p>
                      </div>
                    </div>
                    <button className="w-full flex items-center justify-center gap-sm py-sm px-md border border-sky-600 text-primary rounded-lg hover:bg-primary-light transition-colors">
                      <Settings className="w-4 h-4" />
                      Configurar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export Actions */}
        <IfPermission permission="clinical_analytics:export">
          <div className="flex justify-end gap-md">
            <button className="flex items-center gap-sm px-md py-sm border border-gray-300 rounded-lg hover:bg-neutral-bgAlt transition-colors">
              <Download className="w-4 h-4" />
              Exportar Analytics
            </button>
            <button className="flex items-center gap-sm px-md py-sm bg-primary-hover text-white rounded-lg hover:bg-primary-hover transition-colors">
              <Eye className="w-4 h-4" />
              Visualizar Detalhes
            </button>
          </div>
        </IfPermission>
      </div>
    </PermissionGuard>
  );
};

export default ClinicalAnalyticsPage;

// Incremental Static Regeneration (safe defaults)
export async function getStaticProps() {
  return {
    props: {},
    // Revalidate every 10 minutes to keep analytics UI fresh
    revalidate: 600,
  };
}
