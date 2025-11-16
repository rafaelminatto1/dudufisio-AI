/**
 * AI Insights Dashboard - Feature NOVA
 * Criado: 06/11/2025
 * 
 * Dashboard com previsões em tempo real usando IA:
 * - Preve cancelamentos de consultas
 * - Identifica pacientes em risco de churn
 * - Sugere melhores horários para agendamentos
 * - Analisa padrões de tratamento
 * - Recommendations personalizadas
 * 
 * Tecnologias: Gemini AI, Real-time analytics, Predictive models
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, TrendingUp, AlertTriangle, Clock, Users, Activity, Zap, Target } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// TYPES
// ============================================================================

interface PredictedCancellation {
  appointmentId: string;
  patientName: string;
  date: string;
  time: string;
  risk: 'high' | 'medium' | 'low';
  confidence: number;
  reasons: string[];
  suggestedAction: string;
}

interface ChurnRiskPatient {
  patientId: string;
  name: string;
  riskLevel: 'critical' | 'high' | 'medium' | 'low';
  score: number;
  factors: string[];
  recommendations: string[];
  lastVisit: string;
  missedAppointments: number;
}

interface OptimalTimeSlot {
  day: string;
  time: string;
  score: number;
  expectedAttendance: number;
  reasoning: string;
}

interface TreatmentPattern {
  condition: string;
  averageSessions: number;
  successRate: number;
  averageDuration: number;
  commonExercises: string[];
  insights: string[];
}

interface RealtimeInsight {
  id: string;
  type: 'opportunity' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: Date;
}

interface InsightMetrics {
  predictedCancellations: number;
  patientsAtRisk: number;
  revenueForecast: number;
  occupancyRate: number;
  averageNPS: number;
  trendsDirection: 'up' | 'down' | 'stable';
}

// ============================================================================
// AI SERVICE
// ============================================================================

class AIInsightsService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async predictCancellations(appointments: any[]): Promise<PredictedCancellation[]> {
    const prompt = `
Você é um analista de dados de uma clínica de fisioterapia. Analise os seguintes agendamentos e preveja quais têm maior probabilidade de cancelamento:

${JSON.stringify(appointments, null, 2)}

Considere fatores como:
- Histórico de cancelamentos do paciente
- Dia da semana e horário
- Tempo desde o último agendamento
- Condições climáticas (se disponível)
- Padrões históricos

Retorne um JSON com previsões no formato:
[{
  "appointmentId": "id",
  "patientName": "nome",
  "date": "data",
  "time": "hora",
  "risk": "high|medium|low",
  "confidence": 0.85,
  "reasons": ["motivo 1", "motivo 2"],
  "suggestedAction": "ação recomendada"
}]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extrair JSON da resposta
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao prever cancelamentos:', error);
      return [];
    }
  }

  async analyzeChurnRisk(patients: any[]): Promise<ChurnRiskPatient[]> {
    const prompt = `
Você é um especialista em retenção de pacientes. Analise os seguintes pacientes e identifique aqueles em risco de churn (abandono do tratamento):

${JSON.stringify(patients, null, 2)}

Considere:
- Frequência de comparecimento
- Tempo desde última visita
- Aderência ao tratamento
- Satisfação reportada
- Pagamentos em atraso
- Progresso no tratamento

Retorne JSON:
[{
  "patientId": "id",
  "name": "nome",
  "riskLevel": "critical|high|medium|low",
  "score": 0-100,
  "factors": ["fator 1", "fator 2"],
  "recommendations": ["recomendação 1", "recomendação 2"],
  "lastVisit": "data",
  "missedAppointments": 3
}]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao analisar churn:', error);
      return [];
    }
  }

  async findOptimalTimeSlots(historicalData: any[]): Promise<OptimalTimeSlot[]> {
    const prompt = `
Analise os dados históricos de agendamentos e identifique os melhores horários para maximizar comparecimento:

${JSON.stringify(historicalData, null, 2)}

Considere:
- Taxa de comparecimento por horário
- Dia da semana
- Perfil dos pacientes
- Capacidade da clínica

Retorne JSON:
[{
  "day": "segunda-feira",
  "time": "14:00",
  "score": 0-100,
  "expectedAttendance": 95,
  "reasoning": "explicação"
}]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao encontrar horários ótimos:', error);
      return [];
    }
  }

  async analyzeTreatmentPatterns(treatments: any[]): Promise<TreatmentPattern[]> {
    const prompt = `
Analise padrões de tratamento e identifique insights valiosos:

${JSON.stringify(treatments, null, 2)}

Identifique:
- Duração média por condição
- Taxa de sucesso
- Exercícios mais efetivos
- Padrões de evolução
- Oportunidades de melhoria

Retorne JSON:
[{
  "condition": "condição",
  "averageSessions": 12,
  "successRate": 0.85,
  "averageDuration": 90,
  "commonExercises": ["exercício 1", "exercício 2"],
  "insights": ["insight 1", "insight 2"]
}]
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      return [];
    } catch (error) {
      console.error('Erro ao analisar padrões:', error);
      return [];
    }
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

interface MetricCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend?: 'up' | 'down' | 'stable';
  color?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ icon, label, value, trend, color = 'blue' }) => {
  const trendIcon = trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→';
  const trendColor = trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-gray-500';

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className={`p-3 bg-${color}-100 rounded-full`}>
            {icon}
          </div>
          <div>
            <p className="text-sm text-gray-600">{label}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        {trend && (
          <span className={`text-2xl ${trendColor}`}>{trendIcon}</span>
        )}
      </div>
    </div>
  );
};

interface InsightAlertProps {
  insight: RealtimeInsight;
  onDismiss: () => void;
}

const InsightAlert: React.FC<InsightAlertProps> = ({ insight, onDismiss }) => {
  const getIcon = () => {
    switch (insight.type) {
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success': return <Target className="w-5 h-5 text-blue-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = () => {
    switch (insight.type) {
      case 'opportunity': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      case 'success': return 'bg-blue-50 border-blue-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`rounded-lg border-2 ${getBgColor()} p-4 mb-3 transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          {getIcon()}
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900">{insight.title}</h4>
            <p className="text-sm text-gray-700 mt-1">{insight.message}</p>
            {insight.action && (
              <button
                onClick={insight.action.onClick}
                className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium"
              >
                {insight.action.label}
              </button>
            )}
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD
// ============================================================================

export const AIInsightsDashboard: React.FC = () => {
  const [insights, setInsights] = useState<RealtimeInsight[]>([]);
  const [metrics, setMetrics] = useState<InsightMetrics>({
    predictedCancellations: 3,
    patientsAtRisk: 5,
    revenueForecast: 45000,
    occupancyRate: 82,
    averageNPS: 9.2,
    trendsDirection: 'up',
  });
  const [predictedCancellations, setPredictedCancellations] = useState<PredictedCancellation[]>([]);
  const [churnRisks, setChurnRisks] = useState<ChurnRiskPatient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simular carregamento de insights em tempo real
  useEffect(() => {
    const loadInsights = async () => {
      setIsLoading(true);
      
      // Simular chamadas à API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock data
      setInsights([
        {
          id: '1',
          type: 'opportunity',
          title: 'Oportunidade de Retenção',
          message: 'Paciente Maria Santos não agenda consulta há 3 semanas. Taxa de sucesso de recontato: 78%',
          action: {
            label: 'Enviar mensagem',
            onClick: () => alert('Mensagem enviada!'),
          },
          timestamp: new Date(),
        },
        {
          id: '2',
          type: 'warning',
          title: 'Alerta de Cancelamento',
          message: '3 consultas de amanhã têm 85% de probabilidade de cancelamento. Considere confirmação proativa.',
          action: {
            label: 'Confirmar agora',
            onClick: () => alert('Confirmações enviadas!'),
          },
          timestamp: new Date(),
        },
        {
          id: '3',
          type: 'success',
          title: 'Meta Alcançada',
          message: 'Taxa de ocupação atingiu 82% nesta semana, 5% acima da meta!',
          timestamp: new Date(),
        },
      ]);
      
      setPredictedCancellations([
        {
          appointmentId: 'APT-001',
          patientName: 'João Silva',
          date: '2025-11-08',
          time: '14:00',
          risk: 'high',
          confidence: 0.87,
          reasons: ['Histórico de 2 cancelamentos', 'Horário pós-almoço (baixa aderência)'],
          suggestedAction: 'Ligar 1h antes para confirmar',
        },
        {
          appointmentId: 'APT-002',
          patientName: 'Ana Costa',
          date: '2025-11-08',
          time: '16:00',
          risk: 'medium',
          confidence: 0.65,
          reasons: ['Primeira consulta após férias'],
          suggestedAction: 'Enviar lembrete por WhatsApp',
        },
      ]);
      
      setChurnRisks([
        {
          patientId: 'PAT-005',
          name: 'Maria Santos',
          riskLevel: 'critical',
          score: 92,
          factors: ['21 dias sem consulta', '2 consultas canceladas consecutivas', 'Baixa evolução percebida'],
          recommendations: ['Ligar pessoalmente hoje', 'Oferecer reavaliação gratuita', 'Ajustar plano de tratamento'],
          lastVisit: '2025-10-15',
          missedAppointments: 2,
        },
        {
          patientId: 'PAT-007',
          name: 'Pedro Oliveira',
          riskLevel: 'high',
          score: 78,
          factors: ['Pagamento em atraso', 'Comparecimento irregular'],
          recommendations: ['Negociar pagamento', 'Reengajar com novos objetivos'],
          lastVisit: '2025-10-28',
          missedAppointments: 1,
        },
      ]);
      
      setIsLoading(false);
    };

    loadInsights();
    
    // Atualizar insights a cada 2 minutos
    const interval = setInterval(loadInsights, 120000);
    
    return () => clearInterval(interval);
  }, []);

  const dismissInsight = useCallback((id: string) => {
    setInsights(prev => prev.filter(i => i.id !== id));
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Zap className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Analisando dados com IA...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Brain className="w-8 h-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900">AI Insights Dashboard</h1>
            <p className="text-gray-600">Inteligência artificial em tempo real para sua clínica</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="w-4 h-4" />
          <span>Atualizado há instantes</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          icon={<AlertTriangle className="w-6 h-6 text-red-600" />}
          label="Cancelamentos Previstos"
          value={metrics.predictedCancellations}
          trend="down"
          color="red"
        />
        <MetricCard
          icon={<Users className="w-6 h-6 text-yellow-600" />}
          label="Pacientes em Risco"
          value={metrics.patientsAtRisk}
          trend="stable"
          color="yellow"
        />
        <MetricCard
          icon={<TrendingUp className="w-6 h-6 text-green-600" />}
          label="Previsão de Receita"
          value={`R$ ${metrics.revenueForecast.toLocaleString()}`}
          trend="up"
          color="green"
        />
        <MetricCard
          icon={<Clock className="w-6 h-6 text-blue-600" />}
          label="Taxa de Ocupação"
          value={`${metrics.occupancyRate}%`}
          trend="up"
          color="blue"
        />
        <MetricCard
          icon={<Target className="w-6 h-6 text-purple-600" />}
          label="NPS Médio"
          value={metrics.averageNPS}
          trend="up"
          color="purple"
        />
      </div>

      {/* Real-time Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 text-yellow-500 mr-2" />
          Insights em Tempo Real
        </h2>
        {insights.length > 0 ? (
          <div>
            {insights.map(insight => (
              <InsightAlert
                key={insight.id}
                insight={insight}
                onDismiss={() => dismissInsight(insight.id)}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">Nenhum insight novo no momento</p>
        )}
      </div>

      {/* Predicted Cancellations */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Consultas com Risco de Cancelamento</h2>
        <div className="space-y-3">
          {predictedCancellations.map(pred => (
            <div
              key={pred.appointmentId}
              className={`p-4 rounded-lg border-2 ${
                pred.risk === 'high'
                  ? 'bg-red-50 border-red-200'
                  : pred.risk === 'medium'
                  ? 'bg-yellow-50 border-yellow-200'
                  : 'bg-green-50 border-green-200'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{pred.patientName}</h3>
                  <p className="text-sm text-gray-600">
                    {pred.date} às {pred.time} • Confiança: {(pred.confidence * 100).toFixed(0)}%
                  </p>
                  <div className="mt-2">
                    <p className="text-sm font-medium text-gray-700">Fatores de risco:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                      {pred.reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <p className="text-sm font-medium text-blue-700 mt-2">
                    💡 {pred.suggestedAction}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    pred.risk === 'high'
                      ? 'bg-red-600 text-white'
                      : pred.risk === 'medium'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-green-600 text-white'
                  }`}
                >
                  {pred.risk.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Churn Risk Patients */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Pacientes em Risco de Churn</h2>
        <div className="space-y-3">
          {churnRisks.map(patient => (
            <div
              key={patient.patientId}
              className={`p-4 rounded-lg border-2 ${
                patient.riskLevel === 'critical'
                  ? 'bg-red-50 border-red-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                  <p className="text-sm text-gray-600">
                    Última visita: {patient.lastVisit} • Score de risco: {patient.score}/100
                  </p>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-gray-700">Fatores:</p>
                    <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                      {patient.factors.map((factor, idx) => (
                        <li key={idx}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-3">
                    <p className="text-sm font-medium text-blue-700">Ações recomendadas:</p>
                    <ul className="text-sm text-blue-600 list-disc list-inside mt-1">
                      {patient.recommendations.map((rec, idx) => (
                        <li key={idx}>{rec}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    patient.riskLevel === 'critical'
                      ? 'bg-red-600 text-white'
                      : 'bg-yellow-600 text-white'
                  }`}
                >
                  {patient.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AIInsightsDashboard;

