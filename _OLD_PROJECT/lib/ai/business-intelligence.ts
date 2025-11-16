/**
 * Advanced Business Intelligence Module
 * AI-powered analytics and insights for clinic management
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface ClinicMetrics {
  financial: {
    revenue: {
      total: number;
      byService: Record<string, number>;
      byPaymentMethod: Record<string, number>;
      trend: 'up' | 'down' | 'stable';
    };
    expenses: {
      total: number;
      byCategory: Record<string, number>;
    };
    profitMargin: number;
    arpu: number; // Average Revenue Per User
    ltv: number; // Lifetime Value
  };
  operational: {
    appointmentUtilization: number;
    averageWaitTime: number;
    sessionDuration: number;
    cancellationRate: number;
    noShowRate: number;
    therapistProductivity: Record<string, number>;
  };
  patient: {
    totalActive: number;
    newPatients: number;
    churnRate: number;
    satisfactionScore: number;
    nps: number; // Net Promoter Score
    retentionRate: number;
  };
  growth: {
    monthOverMonth: number;
    yearOverYear: number;
    projectedGrowth: number;
  };
  period: {
    start: Date;
    end: Date;
  };
}

interface BIInsights {
  summary: string;
  keyFindings: Finding[];
  recommendations: Recommendation[];
  alerts: Alert[];
  predictions: Prediction[];
  benchmarks: Benchmark[];
}

interface Finding {
  category: 'financial' | 'operational' | 'patient' | 'growth';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  priority: 'critical' | 'high' | 'medium' | 'low';
  metrics: Record<string, number | string>;
}

interface Recommendation {
  title: string;
  description: string;
  expectedImpact: string;
  implementationSteps: string[];
  estimatedROI: number;
  timeframe: string;
  resources: string[];
}

interface Alert {
  type: 'warning' | 'critical' | 'info';
  title: string;
  description: string;
  actionRequired: string;
  deadline?: Date;
}

interface Prediction {
  metric: string;
  current: number;
  predicted: number;
  confidence: number;
  timeframe: string;
  factors: string[];
}

interface Benchmark {
  metric: string;
  value: number;
  industryAverage: number;
  topPerformers: number;
  percentile: number;
}

/**
 * Generate comprehensive BI insights
 */
export async function generateBIInsights(
  metrics: ClinicMetrics
): Promise<BIInsights> {
  const keyFindings = analyzeMetrics(metrics);
  const alerts = generateAlerts(metrics);
  const predictions = generatePredictions(metrics);
  const benchmarks = compareToBenchmarks(metrics);

  // Use AI to generate recommendations
  const recommendations = await generateAIRecommendations(metrics, keyFindings);

  // Generate executive summary
  const summary = await generateExecutiveSummary(metrics, keyFindings);

  return {
    summary,
    keyFindings,
    recommendations,
    alerts,
    predictions,
    benchmarks,
  };
}

/**
 * Analyze metrics and extract key findings
 */
function analyzeMetrics(metrics: ClinicMetrics): Finding[] {
  const findings: Finding[] = [];

  // Financial analysis
  if (metrics.financial.profitMargin < 0.2) {
    findings.push({
      category: 'financial',
      title: 'Margem de lucro abaixo do ideal',
      description: `Margem de lucro de ${(metrics.financial.profitMargin * 100).toFixed(1)}% está abaixo dos 20% recomendados.`,
      impact: 'negative',
      priority: 'high',
      metrics: {
        current: metrics.financial.profitMargin,
        target: 0.2,
      },
    });
  }

  // Revenue trend
  if (metrics.financial.revenue.trend === 'down') {
    findings.push({
      category: 'financial',
      title: 'Queda na receita',
      description: 'Tendência de queda na receita detectada',
      impact: 'negative',
      priority: 'high',
      metrics: { trend: metrics.financial.revenue.trend },
    });
  }

  // Operational efficiency
  if (metrics.operational.appointmentUtilization < 0.7) {
    findings.push({
      category: 'operational',
      title: 'Baixa utilização da agenda',
      description: `Taxa de ocupação de ${(metrics.operational.appointmentUtilization * 100).toFixed(1)}% indica capacidade ociosa.`,
      impact: 'negative',
      priority: 'high',
      metrics: {
        current: metrics.operational.appointmentUtilization,
        target: 0.85,
      },
    });
  }

  // Cancellation rate
  if (metrics.operational.cancellationRate > 0.15) {
    findings.push({
      category: 'operational',
      title: 'Taxa de cancelamento elevada',
      description: `${(metrics.operational.cancellationRate * 100).toFixed(1)}% de cancelamentos afetam produtividade`,
      impact: 'negative',
      priority: 'medium',
      metrics: {
        current: metrics.operational.cancellationRate,
        target: 0.10,
      },
    });
  }

  // Patient satisfaction
  if (metrics.patient.satisfactionScore < 4) {
    findings.push({
      category: 'patient',
      title: 'Satisfação do paciente necessita atenção',
      description: `Score de ${metrics.patient.satisfactionScore.toFixed(1)}/5 está abaixo do ideal`,
      impact: 'negative',
      priority: 'high',
      metrics: {
        current: metrics.patient.satisfactionScore,
        target: 4.5,
      },
    });
  }

  // Churn rate
  if (metrics.patient.churnRate > 0.2) {
    findings.push({
      category: 'patient',
      title: 'Taxa de churn preocupante',
      description: `${(metrics.patient.churnRate * 100).toFixed(1)}% dos pacientes estão abandonando o tratamento`,
      impact: 'negative',
      priority: 'critical',
      metrics: {
        current: metrics.patient.churnRate,
        acceptable: 0.15,
      },
    });
  }

  // Positive findings
  if (metrics.patient.nps > 50) {
    findings.push({
      category: 'patient',
      title: 'Excelente Net Promoter Score',
      description: `NPS de ${metrics.patient.nps} indica forte satisfação e lealdade`,
      impact: 'positive',
      priority: 'low',
      metrics: { nps: metrics.patient.nps },
    });
  }

  if (metrics.growth.monthOverMonth > 0.1) {
    findings.push({
      category: 'growth',
      title: 'Crescimento acelerado',
      description: `Crescimento de ${(metrics.growth.monthOverMonth * 100).toFixed(1)}% MoM é excepcional`,
      impact: 'positive',
      priority: 'low',
      metrics: { growth: metrics.growth.monthOverMonth },
    });
  }

  return findings.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return (priorityOrder[a.priority as keyof typeof priorityOrder] || 99) - 
           (priorityOrder[b.priority as keyof typeof priorityOrder] || 99);
  });
}

/**
 * Generate alerts based on metrics
 */
function generateAlerts(metrics: ClinicMetrics): Alert[] {
  const alerts: Alert[] = [];

  // Critical financial alert
  if (metrics.financial.profitMargin < 0.1) {
    alerts.push({
      type: 'critical',
      title: 'Margem de lucro crítica',
      description: 'Margem abaixo de 10% requer ação imediata',
      actionRequired: 'Revisar estrutura de custos e preços',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  }

  // High churn warning
  if (metrics.patient.churnRate > 0.25) {
    alerts.push({
      type: 'warning',
      title: 'Taxa de churn elevada',
      description: 'Mais de 25% dos pacientes estão abandonando',
      actionRequired: 'Implementar programa de retenção urgente',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });
  }

  // Low utilization
  if (metrics.operational.appointmentUtilization < 0.6) {
    alerts.push({
      type: 'warning',
      title: 'Capacidade ociosa significativa',
      description: 'Menos de 60% da agenda está sendo utilizada',
      actionRequired: 'Aumentar marketing e otimizar agendamento',
    });
  }

  // Positive alerts
  if (metrics.growth.monthOverMonth > 0.15) {
    alerts.push({
      type: 'info',
      title: 'Crescimento acelerado detectado',
      description: 'Considere expandir equipe e infraestrutura',
      actionRequired: 'Planejar escalabilidade',
    });
  }

  return alerts;
}

/**
 * Generate predictions for key metrics
 */
function generatePredictions(metrics: ClinicMetrics): Prediction[] {
  const predictions: Prediction[] = [];

  // Revenue prediction
  const revenueGrowth = metrics.growth.monthOverMonth;
  const predictedRevenue = metrics.financial.revenue.total * (1 + revenueGrowth);
  
  predictions.push({
    metric: 'Receita próximo mês',
    current: metrics.financial.revenue.total,
    predicted: predictedRevenue,
    confidence: 0.75,
    timeframe: '30 dias',
    factors: ['Crescimento histórico', 'Tendência atual', 'Sazonalidade'],
  });

  // Patient growth
  const patientGrowth = metrics.patient.newPatients / Math.max(metrics.patient.totalActive, 1);
  const predictedPatients = Math.round(
    metrics.patient.totalActive * (1 + patientGrowth - metrics.patient.churnRate)
  );

  predictions.push({
    metric: 'Pacientes ativos próximo mês',
    current: metrics.patient.totalActive,
    predicted: predictedPatients,
    confidence: 0.7,
    timeframe: '30 dias',
    factors: ['Novos pacientes', 'Taxa de churn', 'Retenção'],
  });

  // Capacity utilization
  if (metrics.operational.appointmentUtilization < 0.9) {
    const predictedUtilization = Math.min(
      metrics.operational.appointmentUtilization * (1 + revenueGrowth),
      1.0
    );

    predictions.push({
      metric: 'Utilização da agenda',
      current: metrics.operational.appointmentUtilization,
      predicted: predictedUtilization,
      confidence: 0.65,
      timeframe: '60 dias',
      factors: ['Crescimento de pacientes', 'Otimização operacional'],
    });
  }

  return predictions;
}

/**
 * Compare metrics to industry benchmarks
 */
function compareToBenchmarks(metrics: ClinicMetrics): Benchmark[] {
  // These would ideally come from a database of industry standards
  const industryBenchmarks = {
    profitMargin: { average: 0.25, topPerformers: 0.35 },
    utilizationRate: { average: 0.75, topPerformers: 0.90 },
    cancellationRate: { average: 0.12, topPerformers: 0.05 },
    nps: { average: 40, topPerformers: 70 },
    satisfactionScore: { average: 4.2, topPerformers: 4.7 },
  };

  function calculatePercentile(value: number, avg: number, top: number): number {
    if (value >= top) return 95;
    if (value >= avg) return 50 + ((value - avg) / (top - avg)) * 45;
    return (value / avg) * 50;
  }

  return [
    {
      metric: 'Margem de Lucro',
      value: metrics.financial.profitMargin,
      industryAverage: industryBenchmarks.profitMargin.average,
      topPerformers: industryBenchmarks.profitMargin.topPerformers,
      percentile: calculatePercentile(
        metrics.financial.profitMargin,
        industryBenchmarks.profitMargin.average,
        industryBenchmarks.profitMargin.topPerformers
      ),
    },
    {
      metric: 'Taxa de Utilização',
      value: metrics.operational.appointmentUtilization,
      industryAverage: industryBenchmarks.utilizationRate.average,
      topPerformers: industryBenchmarks.utilizationRate.topPerformers,
      percentile: calculatePercentile(
        metrics.operational.appointmentUtilization,
        industryBenchmarks.utilizationRate.average,
        industryBenchmarks.utilizationRate.topPerformers
      ),
    },
    {
      metric: 'Net Promoter Score',
      value: metrics.patient.nps,
      industryAverage: industryBenchmarks.nps.average,
      topPerformers: industryBenchmarks.nps.topPerformers,
      percentile: calculatePercentile(
        metrics.patient.nps,
        industryBenchmarks.nps.average,
        industryBenchmarks.nps.topPerformers
      ),
    },
  ];
}

/**
 * Use AI to generate strategic recommendations
 */
async function generateAIRecommendations(
  metrics: ClinicMetrics,
  findings: Finding[]
): Promise<Recommendation[]> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!apiKey) {
    return generateDefaultRecommendations(findings);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Você é um consultor especializado em gestão de clínicas de fisioterapia.

MÉTRICAS DA CLÍNICA:
- Margem de lucro: ${(metrics.financial.profitMargin * 100).toFixed(1)}%
- Utilização da agenda: ${(metrics.operational.appointmentUtilization * 100).toFixed(1)}%
- Taxa de cancelamento: ${(metrics.operational.cancellationRate * 100).toFixed(1)}%
- Satisfação: ${metrics.patient.satisfactionScore.toFixed(1)}/5
- NPS: ${metrics.patient.nps}
- Taxa de churn: ${(metrics.patient.churnRate * 100).toFixed(1)}%
- Crescimento MoM: ${(metrics.growth.monthOverMonth * 100).toFixed(1)}%

PRINCIPAIS PROBLEMAS:
${findings.filter(f => f.impact === 'negative').map(f => `- ${f.title}: ${f.description}`).join('\n')}

Forneça 3-5 recomendações estratégicas específicas e acionáveis em JSON:
[
  {
    "title": "título curto",
    "description": "descrição detalhada",
    "expectedImpact": "impacto esperado com números",
    "implementationSteps": ["passo1", "passo2", "passo3"],
    "estimatedROI": número entre 0 e 10,
    "timeframe": "prazo de implementação",
    "resources": ["recurso1", "recurso2"]
  }
]
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const arrayMatch = text.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
      return JSON.parse(arrayMatch[0]);
    }

    return generateDefaultRecommendations(findings);
  } catch (error) {
    console.error('Error generating AI recommendations:', error);
    return generateDefaultRecommendations(findings);
  }
}

/**
 * Generate default recommendations
 */
function generateDefaultRecommendations(findings: Finding[]): Recommendation[] {
  const recommendations: Recommendation[] = [];

  const hasChurnIssue = findings.some(f => f.title.includes('churn'));
  const hasUtilizationIssue = findings.some(f => f.title.includes('utilização'));
  const hasFinancialIssue = findings.some(f => f.category === 'financial' && f.impact === 'negative');

  if (hasChurnIssue) {
    recommendations.push({
      title: 'Implementar Programa de Retenção de Pacientes',
      description: 'Desenvolver sistema de acompanhamento proativo para identificar e reter pacientes em risco',
      expectedImpact: 'Redução de 30-40% na taxa de churn em 3 meses',
      implementationSteps: [
        'Identificar pacientes em risco usando modelo preditivo',
        'Criar protocolo de contato proativo',
        'Treinar equipe em técnicas de retenção',
        'Implementar programa de benefícios para pacientes fiéis',
      ],
      estimatedROI: 8,
      timeframe: '2-3 meses',
      resources: ['CRM', 'Treinamento de equipe', 'Budget para incentivos'],
    });
  }

  if (hasUtilizationIssue) {
    recommendations.push({
      title: 'Otimizar Agendamento e Reduzir Horários Ociosos',
      description: 'Implementar estratégias para aumentar a taxa de ocupação da agenda',
      expectedImpact: 'Aumento de 15-20% na utilização em 60 dias',
      implementationSteps: [
        'Analisar horários de pico e baixa demanda',
        'Oferecer descontos em horários ociosos',
        'Facilitar reagendamentos',
        'Implementar lista de espera automatizada',
      ],
      estimatedROI: 7,
      timeframe: '1-2 meses',
      resources: ['Sistema de agendamento inteligente', 'Campanhas de marketing'],
    });
  }

  if (hasFinancialIssue) {
    recommendations.push({
      title: 'Revisar Estrutura de Custos e Preços',
      description: 'Análise detalhada de custos e ajuste estratégico de preços',
      expectedImpact: 'Melhoria de 5-10% na margem de lucro',
      implementationSteps: [
        'Mapear todos os custos fixos e variáveis',
        'Benchmarking de preços com concorrentes',
        'Identificar serviços com melhor margem',
        'Implementar novos serviços premium',
      ],
      estimatedROI: 9,
      timeframe: '1 mês',
      resources: ['Análise financeira', 'Pesquisa de mercado'],
    });
  }

  return recommendations;
}

/**
 * Generate executive summary
 */
async function generateExecutiveSummary(
  metrics: ClinicMetrics,
  findings: Finding[]
): Promise<string> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  const defaultSummary = `
Análise do período de ${metrics.period.start.toLocaleDateString()} a ${metrics.period.end.toLocaleDateString()}:

Receita Total: R$ ${metrics.financial.revenue.total.toLocaleString()}
Margem de Lucro: ${(metrics.financial.profitMargin * 100).toFixed(1)}%
Pacientes Ativos: ${metrics.patient.totalActive}
Taxa de Utilização: ${(metrics.operational.appointmentUtilization * 100).toFixed(1)}%

${findings.length} pontos de atenção identificados.
`;

  if (!apiKey) {
    return defaultSummary;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Crie um resumo executivo conciso (máximo 200 palavras) para esta análise de clínica:

Métricas: ${JSON.stringify(metrics, null, 2)}
Principais achados: ${JSON.stringify(findings.slice(0, 5), null, 2)}

O resumo deve ser objetivo, destacar pontos críticos e indicar prioridades de ação.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating summary:', error);
    return defaultSummary;
  }
}

/**
 * Export BI report
 */
export function exportBIReport(insights: BIInsights, metrics: ClinicMetrics) {
  return {
    title: 'Relatório de Business Intelligence',
    period: {
      start: metrics.period.start,
      end: metrics.period.end,
    },
    generatedAt: new Date(),
    insights,
    rawMetrics: metrics,
  };
}
