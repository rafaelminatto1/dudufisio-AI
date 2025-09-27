/**
 * > AI ANALYTICS PAGE - DUDUFISIO-AI
 *
 * Dashboard completo de analytics com IA para análises preditivas,
 * insights clínicos e métricas inteligentes da clínica.
 */

import React, { useState, useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import PermissionGuard, { IfPermission } from '../components/auth/PermissionGuard';
import { useData } from '../contexts/AppContext';
import { geminiService } from '../services/geminiService';
import {
  Brain, TrendingUp, Users, Calendar, Activity, AlertTriangle,
  Eye, Target, Zap, BarChart3, PieChart, LineChart,
  Lightbulb, Shield, Clock, CheckCircle2, ArrowUpRight,
  ArrowDownRight, Sparkles, Bot, RefreshCw, Download,
  Filter, Search, ChevronRight, Star, Award, Heart
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

interface AIPrediction {
  id: string;
  type: 'demand' | 'outcome' | 'risk' | 'efficiency' | 'revenue';
  title: string;
  description: string;
  prediction: string;
  confidence: number; // 0-100
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
  actionable: boolean;
  recommendations: string[];
  dataPoints: number;
  trend: 'up' | 'down' | 'stable';
  value?: number;
  previousValue?: number;
}

interface PatientInsight {
  patientId: string;
  patientName: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  predictions: {
    adherence: number;
    outcome: number;
    dropoutRisk: number;
    recoveryTime: number;
  };
  recommendations: string[];
  lastUpdate: string;
}

interface TreatmentEffectiveness {
  protocolId: string;
  protocolName: string;
  successRate: number;
  averageRecoveryTime: number;
  patientSatisfaction: number;
  costEffectiveness: number;
  patientsCompleted: number;
  trend: 'improving' | 'declining' | 'stable';
  recommendations: string[];
}

interface OperationalInsight {
  metric: string;
  currentValue: number;
  predictedValue: number;
  variance: number;
  trend: 'positive' | 'negative' | 'neutral';
  aiRecommendation: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
}

const AiAnalyticsPage: React.FC = () => {
  const { user, patients, appointments } = useData();
  const [activeTab, setActiveTab] = useState('overview');
  const [predictions, setPredictions] = useState<AIPrediction[]>([]);
  const [patientInsights, setPatientInsights] = useState<PatientInsight[]>([]);
  const [treatmentEffectiveness, setTreatmentEffectiveness] = useState<TreatmentEffectiveness[]>([]);
  const [operationalInsights, setOperationalInsights] = useState<OperationalInsight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<string>('');

  useEffect(() => {
    loadAIAnalytics();
  }, []);

  const loadAIAnalytics = async () => {
    try {
      setIsLoading(true);

      // Simular análises de IA (em produção, usar APIs reais)
      await Promise.all([
        generatePredictions(),
        generatePatientInsights(),
        analyzeTreatmentEffectiveness(),
        generateOperationalInsights()
      ]);

      setLastUpdate(new Date().toLocaleString('pt-BR'));
    } catch (error) {
      console.error('L Erro ao carregar analytics de IA:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePredictions = async (): Promise<void> => {
    const mockPredictions: AIPrediction[] = [
      {
        id: '1',
        type: 'demand',
        title: 'Pico de Demanda Previsto',
        description: 'Aumento de 35% na demanda por consultas nos próximos 15 dias',
        prediction: 'Baseado no histórico sazonal e tendências locais, prevemos um aumento significativo de agendamentos',
        confidence: 89,
        timeframe: 'Próximos 15 dias',
        impact: 'high',
        actionable: true,
        recommendations: [
          'Ajustar agenda para comportar 35% mais consultas',
          'Considerar horas extras ou terapeutas temporários',
          'Preparar materiais adicionais para atendimento'
        ],
        dataPoints: 1250,
        trend: 'up',
        value: 135,
        previousValue: 100
      },
      {
        id: '2',
        type: 'outcome',
        title: 'Melhoria em Resultados Clínicos',
        description: 'Protocolos de lombalgia mostram 25% mais eficácia com ajustes de IA',
        prediction: 'Otimizações baseadas em ML melhoraram significativamente os outcomes',
        confidence: 92,
        timeframe: 'Últimos 30 dias',
        impact: 'high',
        actionable: true,
        recommendations: [
          'Expandir protocolos otimizados para outras condições',
          'Treinar equipe nos novos protocolos',
          'Documentar melhores práticas identificadas'
        ],
        dataPoints: 890,
        trend: 'up',
        value: 88,
        previousValue: 71
      },
      {
        id: '3',
        type: 'risk',
        title: 'Risco de Abandono Identificado',
        description: '12 pacientes com alta probabilidade de abandono nas próximas 2 semanas',
        prediction: 'Análise comportamental identificou padrões de abandono precoce',
        confidence: 84,
        timeframe: 'Próximas 2 semanas',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Contato proativo com pacientes em risco',
          'Ajustar planos de tratamento para maior engajamento',
          'Implementar estratégias de retenção personalizadas'
        ],
        dataPoints: 2100,
        trend: 'down',
        value: 12,
        previousValue: 18
      },
      {
        id: '4',
        type: 'efficiency',
        title: 'Otimização de Agenda',
        description: 'IA sugere redistribuição que aumenta eficiência em 18%',
        prediction: 'Algoritmo identifica padrões ótimos de agendamento baseado em histórico',
        confidence: 91,
        timeframe: 'Implementação imediata',
        impact: 'medium',
        actionable: true,
        recommendations: [
          'Implementar sugestões automáticas de horários',
          'Redistribuir tipos de consulta por período',
          'Otimizar intervalos entre consultas'
        ],
        dataPoints: 3200,
        trend: 'up',
        value: 118,
        previousValue: 100
      },
      {
        id: '5',
        type: 'revenue',
        title: 'Projeção de Receita',
        description: 'Receita projetada 22% acima do mês anterior',
        prediction: 'Combinação de demanda alta e otimizações resulta em crescimento expressivo',
        confidence: 87,
        timeframe: 'Final do mês',
        impact: 'high',
        actionable: false,
        recommendations: [
          'Monitorar métricas financeiras de perto',
          'Preparar infraestrutura para crescimento',
          'Avaliar investimentos em expansão'
        ],
        dataPoints: 1800,
        trend: 'up',
        value: 122000,
        previousValue: 100000
      }
    ];

    setPredictions(mockPredictions);
  };

  const generatePatientInsights = async (): Promise<void> => {
    const mockInsights: PatientInsight[] = [
      {
        patientId: '1',
        patientName: 'Ana Beatriz Costa',
        riskLevel: 'high',
        predictions: {
          adherence: 45,
          outcome: 72,
          dropoutRisk: 68,
          recoveryTime: 85
        },
        recommendations: [
          'Reduzir frequência inicial das sessões',
          'Implementar gamificação no tratamento',
          'Acompanhamento mais próximo via WhatsApp'
        ],
        lastUpdate: new Date().toISOString()
      },
      {
        patientId: '2',
        patientName: 'Carlos Eduardo Silva',
        riskLevel: 'low',
        predictions: {
          adherence: 92,
          outcome: 89,
          dropoutRisk: 15,
          recoveryTime: 75
        },
        recommendations: [
          'Manter protocolo atual',
          'Consideração para alta precoce',
          'Paciente modelo para estudos de caso'
        ],
        lastUpdate: new Date().toISOString()
      },
      {
        patientId: '3',
        patientName: 'Maria dos Santos',
        riskLevel: 'medium',
        predictions: {
          adherence: 68,
          outcome: 81,
          dropoutRisk: 32,
          recoveryTime: 90
        },
        recommendations: [
          'Ajustar horários para melhor conveniência',
          'Incluir exercícios domiciliares',
          'Feedback mais frequente sobre progresso'
        ],
        lastUpdate: new Date().toISOString()
      }
    ];

    setPatientInsights(mockInsights);
  };

  const analyzeTreatmentEffectiveness = async (): Promise<void> => {
    const mockEffectiveness: TreatmentEffectiveness[] = [
      {
        protocolId: '1',
        protocolName: 'Protocolo Lombalgia Aguda',
        successRate: 89,
        averageRecoveryTime: 21,
        patientSatisfaction: 94,
        costEffectiveness: 87,
        patientsCompleted: 156,
        trend: 'improving',
        recommendations: [
          'Expandir uso para outras condições similares',
          'Documentar fatores de sucesso',
          'Treinar toda equipe no protocolo'
        ]
      },
      {
        protocolId: '2',
        protocolName: 'Reabilitação Pós-Cirúrgica Joelho',
        successRate: 78,
        averageRecoveryTime: 45,
        patientSatisfaction: 86,
        costEffectiveness: 72,
        patientsCompleted: 89,
        trend: 'stable',
        recommendations: [
          'Revisar fase inicial do protocolo',
          'Incluir mais exercícios funcionais',
          'Melhorar educação do paciente'
        ]
      },
      {
        protocolId: '3',
        protocolName: 'Fisioterapia Respiratória COVID',
        successRate: 95,
        averageRecoveryTime: 18,
        patientSatisfaction: 97,
        costEffectiveness: 93,
        patientsCompleted: 234,
        trend: 'improving',
        recommendations: [
          'Protocolo exemplar - manter exatamente',
          'Usar como base para outros protocolos respiratórios',
          'Publicar resultados em revista científica'
        ]
      }
    ];

    setTreatmentEffectiveness(mockEffectiveness);
  };

  const generateOperationalInsights = async (): Promise<void> => {
    const mockOperational: OperationalInsight[] = [
      {
        metric: 'Taxa de Ocupação',
        currentValue: 78,
        predictedValue: 89,
        variance: 11,
        trend: 'positive',
        aiRecommendation: 'Aumentar disponibilidade de horários nos próximos 15 dias',
        urgency: 'medium'
      },
      {
        metric: 'Tempo Médio de Atendimento',
        currentValue: 45,
        predictedValue: 42,
        variance: -3,
        trend: 'positive',
        aiRecommendation: 'Otimizações de protocolo resultando em maior eficiência',
        urgency: 'low'
      },
      {
        metric: 'Satisfação do Paciente',
        currentValue: 87,
        predictedValue: 91,
        variance: 4,
        trend: 'positive',
        aiRecommendation: 'Melhorias em comunicação estão impactando positivamente',
        urgency: 'low'
      },
      {
        metric: 'Taxa de No-Show',
        currentValue: 12,
        predictedValue: 8,
        variance: -4,
        trend: 'positive',
        aiRecommendation: 'Sistema de lembretes automatizados mostrando eficácia',
        urgency: 'low'
      },
      {
        metric: 'Custo por Sessão',
        currentValue: 85,
        predictedValue: 78,
        variance: -7,
        trend: 'positive',
        aiRecommendation: 'Otimizações operacionais reduzindo custos sem impacto na qualidade',
        urgency: 'low'
      }
    ];

    setOperationalInsights(mockOperational);
  };

  const refreshAIAnalytics = async () => {
    setIsGeneratingInsights(true);
    try {
      // Simular chamada para IA
      await new Promise(resolve => setTimeout(resolve, 3000));
      await loadAIAnalytics();
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 80) return 'text-blue-600 bg-blue-50';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (risk: string): string => {
    switch (risk) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
      case 'positive':
      case 'improving':
        return <ArrowUpRight className="w-4 h-4 text-green-600" />;
      case 'down':
      case 'negative':
      case 'declining':
        return <ArrowDownRight className="w-4 h-4 text-red-600" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-gray-400" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center gap-3">
          <Bot className="w-8 h-8 animate-pulse text-sky-600" />
          <div>
            <div className="text-lg font-semibold text-gray-900">Analisando dados com IA...</div>
            <div className="text-sm text-gray-600">Processando insights e previsões</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PermissionGuard permission="analytics:read">
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <PageHeader
            title="IA & Analytics"
            subtitle="Insights inteligentes e análises preditivas para sua clínica"
          />

          <div className="flex items-center gap-3">
            <div className="text-sm text-gray-600">
              Última atualização: {lastUpdate}
            </div>
            <button
              onClick={refreshAIAnalytics}
              disabled={isGeneratingInsights}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors disabled:opacity-50"
            >
              {isGeneratingInsights ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {isGeneratingInsights ? 'Gerando...' : 'Gerar Insights'}
            </button>
          </div>
        </div>

        {/* AI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-purple-700">Insights Ativos</p>
                <p className="text-2xl font-bold text-purple-900">{predictions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500 rounded-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-700">Confiança Média</p>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(predictions.reduce((acc, p) => acc + p.confidence, 0) / predictions.length)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-6 border border-orange-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-orange-500 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-orange-700">Pacientes em Risco</p>
                <p className="text-2xl font-bold text-orange-900">
                  {patientInsights.filter(p => p.riskLevel === 'high' || p.riskLevel === 'critical').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-500 rounded-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-700">Protocolos Otimizados</p>
                <p className="text-2xl font-bold text-blue-900">
                  {treatmentEffectiveness.filter(t => t.trend === 'improving').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="predictions">Previsões</TabsTrigger>
            <TabsTrigger value="patients">Pacientes</TabsTrigger>
            <TabsTrigger value="treatments">Tratamentos</TabsTrigger>
            <TabsTrigger value="operations">Operacional</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Top Predictions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Principais Insights de IA
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {predictions.slice(0, 3).map((prediction) => (
                    <div key={prediction.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{prediction.title}</h4>
                            {getTrendIcon(prediction.trend)}
                          </div>
                          <p className="text-gray-600 text-sm mb-3">{prediction.description}</p>
                          <div className="flex items-center gap-4 text-xs">
                            <span className={`px-2 py-1 rounded-full ${getConfidenceColor(prediction.confidence)}`}>
                              {prediction.confidence}% confiança
                            </span>
                            <span className="text-gray-500">{prediction.timeframe}</span>
                            <span className={`px-2 py-1 rounded-full ${
                              prediction.impact === 'high' ? 'bg-red-100 text-red-700' :
                              prediction.impact === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              Impacto {prediction.impact}
                            </span>
                          </div>
                        </div>
                        {prediction.actionable && (
                          <button className="ml-4 text-sky-600 hover:text-sky-700">
                            <ChevronRight className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Operational Metrics */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                    Métricas Operacionais
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {operationalInsights.slice(0, 3).map((insight, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{insight.metric}</p>
                          <p className="text-sm text-gray-600">{insight.aiRecommendation}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-gray-900">
                              {insight.currentValue}
                              {insight.metric.includes('Taxa') || insight.metric.includes('Satisfação') ? '%' : ''}
                            </span>
                            {getTrendIcon(insight.trend)}
                          </div>
                          <p className="text-xs text-gray-500">
                            Prev: {insight.predictedValue}
                            {insight.metric.includes('Taxa') || insight.metric.includes('Satisfação') ? '%' : ''}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Treatment Performance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-500" />
                    Performance de Tratamentos
                  </h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {treatmentEffectiveness.slice(0, 3).map((treatment, index) => (
                      <div key={index} className="border-l-4 border-sky-500 pl-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{treatment.protocolName}</p>
                            <p className="text-sm text-gray-600">
                              {treatment.patientsCompleted} pacientes " {treatment.averageRecoveryTime} dias avg
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-600">
                                {treatment.successRate}%
                              </span>
                              {getTrendIcon(treatment.trend)}
                            </div>
                            <div className="flex gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${
                                  i < Math.floor(treatment.patientSatisfaction / 20)
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`} />
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Predictions Tab */}
          <TabsContent value="predictions" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Previsões e Insights de IA</h3>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-400" />
                    <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                      <option>Todas as previsões</option>
                      <option>Alta confiança (>90%)</option>
                      <option>Ação necessária</option>
                      <option>Alto impacto</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {predictions.map((prediction) => (
                    <div key={prediction.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-sky-100 rounded-lg">
                          {prediction.type === 'demand' && <TrendingUp className="w-6 h-6 text-sky-600" />}
                          {prediction.type === 'outcome' && <Target className="w-6 h-6 text-sky-600" />}
                          {prediction.type === 'risk' && <AlertTriangle className="w-6 h-6 text-sky-600" />}
                          {prediction.type === 'efficiency' && <Zap className="w-6 h-6 text-sky-600" />}
                          {prediction.type === 'revenue' && <BarChart3 className="w-6 h-6 text-sky-600" />}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xl font-semibold text-gray-900">{prediction.title}</h4>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(prediction.trend)}
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(prediction.confidence)}`}>
                                {prediction.confidence}% confiança
                              </span>
                            </div>
                          </div>

                          <p className="text-gray-600 mb-4">{prediction.description}</p>

                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Análise Detalhada:</h5>
                            <p className="text-gray-700 text-sm">{prediction.prediction}</p>
                          </div>

                          {prediction.value && prediction.previousValue && (
                            <div className="flex items-center gap-4 mb-4">
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Valor Atual</p>
                                <p className="text-lg font-bold text-gray-900">
                                  {prediction.type === 'revenue' ? `R$ ${prediction.previousValue.toLocaleString()}` : prediction.previousValue}
                                  {prediction.type === 'demand' || prediction.type === 'efficiency' ? '%' : ''}
                                </p>
                              </div>
                              <ChevronRight className="w-4 h-4 text-gray-400" />
                              <div className="text-center">
                                <p className="text-sm text-gray-500">Valor Previsto</p>
                                <p className="text-lg font-bold text-sky-600">
                                  {prediction.type === 'revenue' ? `R$ ${prediction.value.toLocaleString()}` : prediction.value}
                                  {prediction.type === 'demand' || prediction.type === 'efficiency' ? '%' : ''}
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                            <span>Baseado em {prediction.dataPoints.toLocaleString()} pontos de dados</span>
                            <span>{prediction.timeframe}</span>
                          </div>

                          {prediction.actionable && prediction.recommendations.length > 0 && (
                            <div className="border-t border-gray-200 pt-4">
                              <h5 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                Recomendações de Ação:
                              </h5>
                              <ul className="space-y-1">
                                {prediction.recommendations.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                    {rec}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-500" />
                  Insights de Pacientes por IA
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  {patientInsights.map((insight) => (
                    <div key={insight.patientId} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{insight.patientName}</h4>
                          <p className="text-sm text-gray-600">ID: {insight.patientId}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskColor(insight.riskLevel)}`}>
                          Risco {insight.riskLevel}
                        </span>
                      </div>

                      {/* Prediction Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                              <circle
                                cx="32" cy="32" r="28"
                                stroke="#3b82f6" strokeWidth="4" fill="none"
                                strokeDasharray={`${insight.predictions.adherence * 1.76} 176`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">{insight.predictions.adherence}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Aderência</p>
                        </div>

                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                              <circle
                                cx="32" cy="32" r="28"
                                stroke="#10b981" strokeWidth="4" fill="none"
                                strokeDasharray={`${insight.predictions.outcome * 1.76} 176`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">{insight.predictions.outcome}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Sucesso</p>
                        </div>

                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                              <circle
                                cx="32" cy="32" r="28"
                                stroke="#ef4444" strokeWidth="4" fill="none"
                                strokeDasharray={`${insight.predictions.dropoutRisk * 1.76} 176`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">{insight.predictions.dropoutRisk}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Risco Abandono</p>
                        </div>

                        <div className="text-center">
                          <div className="relative w-16 h-16 mx-auto mb-2">
                            <svg className="w-16 h-16 transform -rotate-90">
                              <circle cx="32" cy="32" r="28" stroke="#e5e7eb" strokeWidth="4" fill="none" />
                              <circle
                                cx="32" cy="32" r="28"
                                stroke="#8b5cf6" strokeWidth="4" fill="none"
                                strokeDasharray={`${insight.predictions.recoveryTime * 1.76} 176`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-gray-900">{insight.predictions.recoveryTime}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-600">Recuperação</p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Heart className="w-4 h-4 text-red-500" />
                          Recomendações Personalizadas:
                        </h5>
                        <div className="space-y-2">
                          {insight.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Treatments Tab */}
          <TabsContent value="treatments" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-500" />
                  Eficácia de Tratamentos
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-6">
                  {treatmentEffectiveness.map((treatment, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">{treatment.protocolName}</h4>
                          <p className="text-sm text-gray-600">{treatment.patientsCompleted} pacientes concluídos</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(treatment.trend)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            treatment.successRate >= 90 ? 'bg-green-100 text-green-700' :
                            treatment.successRate >= 80 ? 'bg-blue-100 text-blue-700' :
                            treatment.successRate >= 70 ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {treatment.successRate}% sucesso
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-sky-600">{treatment.successRate}%</div>
                          <div className="text-sm text-gray-600">Taxa de Sucesso</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{treatment.averageRecoveryTime}</div>
                          <div className="text-sm text-gray-600">Dias (média)</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{treatment.patientSatisfaction}%</div>
                          <div className="text-sm text-gray-600">Satisfação</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-orange-600">{treatment.costEffectiveness}%</div>
                          <div className="text-sm text-gray-600">Custo-Efetividade</div>
                        </div>
                      </div>

                      {/* Progress Bars */}
                      <div className="space-y-3 mb-6">
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Taxa de Sucesso</span>
                            <span>{treatment.successRate}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-sky-600 h-2 rounded-full"
                              style={{ width: `${treatment.successRate}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Satisfação do Paciente</span>
                            <span>{treatment.patientSatisfaction}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${treatment.patientSatisfaction}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Custo-Efetividade</span>
                            <span>{treatment.costEffectiveness}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-orange-600 h-2 rounded-full"
                              style={{ width: `${treatment.costEffectiveness}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Recommendations */}
                      <div className="border-t border-gray-200 pt-4">
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                          <Lightbulb className="w-4 h-4 text-yellow-500" />
                          Recomendações de Melhoria:
                        </h5>
                        <div className="space-y-2">
                          {treatment.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-gray-700">{rec}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Operations Tab */}
          <TabsContent value="operations" className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Insights Operacionais
                </h3>
              </div>
              <div className="p-6">
                <div className="grid gap-6">
                  {operationalInsights.map((insight, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-lg font-semibold text-gray-900">{insight.metric}</h4>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(insight.trend)}
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            insight.urgency === 'critical' ? 'bg-red-100 text-red-700' :
                            insight.urgency === 'high' ? 'bg-orange-100 text-orange-700' :
                            insight.urgency === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {insight.urgency}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">
                            {insight.currentValue}
                            {insight.metric.includes('Taxa') || insight.metric.includes('Satisfação') ? '%' : ''}
                          </div>
                          <div className="text-sm text-gray-600">Valor Atual</div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-sky-600">
                            {insight.predictedValue}
                            {insight.metric.includes('Taxa') || insight.metric.includes('Satisfação') ? '%' : ''}
                          </div>
                          <div className="text-sm text-gray-600">Previsão IA</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-3xl font-bold ${
                            insight.variance > 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {insight.variance > 0 ? '+' : ''}{insight.variance}
                            {insight.metric.includes('Taxa') || insight.metric.includes('Satisfação') ? '%' : ''}
                          </div>
                          <div className="text-sm text-gray-600">Variação</div>
                        </div>
                      </div>

                      <div className="bg-blue-50 rounded-lg p-4">
                        <h5 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Bot className="w-4 h-4" />
                          Recomendação de IA:
                        </h5>
                        <p className="text-blue-800 text-sm">{insight.aiRecommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Export and Actions */}
        <IfPermission permission="analytics:export">
          <div className="flex justify-end">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" />
              Exportar Relatório de IA
            </button>
          </div>
        </IfPermission>
      </div>
    </PermissionGuard>
  );
};

export default AiAnalyticsPage;