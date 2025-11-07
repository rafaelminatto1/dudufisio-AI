/**
 * Patient Churn Prediction Model
 * Uses machine learning to predict patient churn risk
 * Based on: appointment history, payment behavior, engagement metrics
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PatientData {
  id: string;
  appointmentHistory: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    lastAppointmentDate: Date | null;
  };
  paymentHistory: {
    totalPaid: number;
    pendingPayments: number;
    averagePaymentDelay: number;
    hasOverduePayments: boolean;
  };
  engagementMetrics: {
    exerciseCompletionRate: number;
    portalLoginFrequency: number;
    messageResponseRate: number;
    surveyCompletionRate: number;
  };
  treatmentProgress: {
    sessionsPlanned: number;
    sessionsCompleted: number;
    goalAchievementRate: number;
    painReductionScore: number;
  };
  demographics: {
    ageGroup: string;
    distanceFromClinic: number;
    hasInsurance: boolean;
  };
}

export interface ChurnPrediction {
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  contributingFactors: {
    factor: string;
    impact: number;
    recommendation: string;
  }[];
  recommendations: string[];
  nextBestAction: string;
  estimatedChurnDate: Date | null;
}

/**
 * Calculate churn risk score using weighted factors
 */
export function calculateChurnRisk(patient: PatientData): ChurnPrediction {
  let riskScore = 0;
  const factors: ChurnPrediction['contributingFactors'] = [];
  const recommendations: string[] = [];

  // 1. Appointment Attendance (30% weight)
  const appointmentScore = calculateAppointmentScore(patient.appointmentHistory);
  riskScore += appointmentScore * 0.3;
  
  if (appointmentScore > 60) {
    factors.push({
      factor: 'Alto índice de faltas',
      impact: appointmentScore * 0.3,
      recommendation: 'Entrar em contato e entender barreiras de comparecimento',
    });
    recommendations.push('Implementar sistema de lembretes automáticos');
  }

  // 2. Engagement (25% weight)
  const engagementScore = calculateEngagementScore(patient.engagementMetrics);
  riskScore += engagementScore * 0.25;
  
  if (engagementScore > 50) {
    factors.push({
      factor: 'Baixo engajamento com tratamento',
      impact: engagementScore * 0.25,
      recommendation: 'Aumentar interação através de mensagens personalizadas',
    });
    recommendations.push('Enviar conteúdo educativo personalizado');
  }

  // 3. Payment Behavior (20% weight)
  const paymentScore = calculatePaymentScore(patient.paymentHistory);
  riskScore += paymentScore * 0.2;
  
  if (paymentScore > 40) {
    factors.push({
      factor: 'Problemas financeiros',
      impact: paymentScore * 0.2,
      recommendation: 'Oferecer opções de pagamento flexíveis',
    });
    recommendations.push('Discutir planos de pagamento alternativos');
  }

  // 4. Treatment Progress (15% weight)
  const progressScore = calculateProgressScore(patient.treatmentProgress);
  riskScore += progressScore * 0.15;
  
  if (progressScore > 40) {
    factors.push({
      factor: 'Progresso abaixo do esperado',
      impact: progressScore * 0.15,
      recommendation: 'Revisar plano de tratamento com o paciente',
    });
    recommendations.push('Agendar consulta de reavaliação');
  }

  // 5. Time Since Last Appointment (10% weight)
  const timeScore = calculateTimeScore(patient.appointmentHistory.lastAppointmentDate);
  riskScore += timeScore * 0.1;
  
  if (timeScore > 60) {
    factors.push({
      factor: 'Ausência prolongada',
      impact: timeScore * 0.1,
      recommendation: 'Contato imediato para reagendamento',
    });
    recommendations.push('Ligar e oferecer horários convenientes');
  }

  // Determine risk level
  let riskLevel: ChurnPrediction['riskLevel'];
  if (riskScore >= 75) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';
  else riskLevel = 'low';

  // Next best action
  const nextBestAction = determineNextBestAction(riskScore, factors);

  // Estimate churn date
  const estimatedChurnDate = estimateChurnDate(riskScore, patient);

  return {
    riskScore: Math.round(riskScore),
    riskLevel,
    contributingFactors: factors.sort((a, b) => b.impact - a.impact),
    recommendations,
    nextBestAction,
    estimatedChurnDate,
  };
}

/**
 * Calculate appointment attendance score (higher = worse)
 */
function calculateAppointmentScore(history: PatientData['appointmentHistory']): number {
  if (history.total === 0) return 50;

  const completionRate = history.completed / history.total;
  const cancelRate = history.cancelled / history.total;
  const noShowRate = history.noShow / history.total;

  // Penalize no-shows more than cancellations
  return (1 - completionRate) * 100 + noShowRate * 50;
}

/**
 * Calculate engagement score (higher = worse)
 */
function calculateEngagementScore(metrics: PatientData['engagementMetrics']): number {
  const avgEngagement = (
    (1 - metrics.exerciseCompletionRate) +
    (1 - metrics.messageResponseRate) +
    (1 - metrics.surveyCompletionRate)
  ) / 3;

  const loginPenalty = metrics.portalLoginFrequency < 1 ? 30 : 0;

  return avgEngagement * 100 + loginPenalty;
}

/**
 * Calculate payment behavior score (higher = worse)
 */
function calculatePaymentScore(history: PatientData['paymentHistory']): number {
  let score = 0;

  if (history.hasOverduePayments) score += 50;
  if (history.pendingPayments > 0) score += 20;
  if (history.averagePaymentDelay > 7) score += 30;

  return Math.min(score, 100);
}

/**
 * Calculate treatment progress score (higher = worse)
 */
function calculateProgressScore(progress: PatientData['treatmentProgress']): number {
  const completionRate = progress.sessionsCompleted / Math.max(progress.sessionsPlanned, 1);
  const goalRate = progress.goalAchievementRate;
  const painImprovement = Math.max(0, progress.painReductionScore);

  const progressScore = (completionRate + goalRate + painImprovement / 10) / 3;

  return (1 - progressScore) * 100;
}

/**
 * Calculate time since last appointment score (higher = worse)
 */
function calculateTimeScore(lastAppointmentDate: Date | null): number {
  if (!lastAppointmentDate) return 100;

  const daysSince = Math.floor(
    (Date.now() - lastAppointmentDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysSince > 60) return 100;
  if (daysSince > 45) return 80;
  if (daysSince > 30) return 60;
  if (daysSince > 21) return 40;
  if (daysSince > 14) return 20;
  return 0;
}

/**
 * Determine the next best action to prevent churn
 */
function determineNextBestAction(
  riskScore: number,
  factors: ChurnPrediction['contributingFactors']
): string {
  if (riskScore >= 75) {
    return 'URGENTE: Ligar imediatamente e oferecer consulta gratuita de reavaliação';
  }

  if (riskScore >= 50) {
    const topFactor = factors[0]?.factor || 'engagement';
    if (topFactor.includes('faltas')) {
      return 'Entrar em contato por WhatsApp e entender barreiras';
    }
    if (topFactor.includes('engajamento')) {
      return 'Enviar mensagem personalizada com conteúdo relevante';
    }
    if (topFactor.includes('financeiro')) {
      return 'Agendar conversa sobre opções de pagamento';
    }
    return 'Agendar ligação de check-in com o paciente';
  }

  if (riskScore >= 25) {
    return 'Enviar pesquisa de satisfação e manter contato regular';
  }

  return 'Continuar monitoramento e manter qualidade do atendimento';
}

/**
 * Estimate when patient might churn
 */
function estimateChurnDate(riskScore: number, patient: PatientData): Date | null {
  if (riskScore < 25) return null;

  const lastDate = patient.appointmentHistory.lastAppointmentDate;
  if (!lastDate) return null;

  // Base estimation on risk score
  let daysUntilChurn = 90; // default
  
  if (riskScore >= 75) daysUntilChurn = 14;
  else if (riskScore >= 50) daysUntilChurn = 30;
  else if (riskScore >= 25) daysUntilChurn = 60;

  const churnDate = new Date(lastDate);
  churnDate.setDate(churnDate.getDate() + daysUntilChurn);

  return churnDate;
}

/**
 * Use AI to enhance churn prediction with contextual insights
 */
export async function enhanceChurnPredictionWithAI(
  patient: PatientData,
  prediction: ChurnPrediction
): Promise<{
  enhancedRecommendations: string[];
  personalizedMessage: string;
  retentionStrategy: string;
}> {
  const apiKey = process.env.GOOGLE_AI_API_KEY;
  
  if (!apiKey) {
    console.warn('Google AI API key not configured');
    return {
      enhancedRecommendations: prediction.recommendations,
      personalizedMessage: 'Por favor, entre em contato conosco para discutir seu tratamento.',
      retentionStrategy: prediction.nextBestAction,
    };
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
Você é um especialista em retenção de pacientes em clínicas de fisioterapia.

Dados do Paciente:
- Risco de Churn: ${prediction.riskLevel} (${prediction.riskScore}%)
- Principais fatores: ${prediction.contributingFactors.map(f => f.factor).join(', ')}
- Taxa de conclusão de exercícios: ${patient.engagementMetrics.exerciseCompletionRate * 100}%
- Última consulta: ${patient.appointmentHistory.lastAppointmentDate?.toLocaleDateString() || 'Nunca'}

Com base nisso, forneça:
1. 3 recomendações específicas e acionáveis para reter este paciente
2. Uma mensagem personalizada e empática para enviar ao paciente
3. Uma estratégia de retenção de curto prazo (próximos 30 dias)

Formato de resposta JSON:
{
  "recommendations": ["rec1", "rec2", "rec3"],
  "message": "mensagem personalizada",
  "strategy": "estratégia de retenção"
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Try to parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        enhancedRecommendations: parsed.recommendations || prediction.recommendations,
        personalizedMessage: parsed.message || '',
        retentionStrategy: parsed.strategy || prediction.nextBestAction,
      };
    }

    return {
      enhancedRecommendations: prediction.recommendations,
      personalizedMessage: text,
      retentionStrategy: prediction.nextBestAction,
    };
  } catch (error) {
    console.error('Error enhancing churn prediction with AI:', error);
    return {
      enhancedRecommendations: prediction.recommendations,
      personalizedMessage: 'Por favor, entre em contato conosco para discutir seu tratamento.',
      retentionStrategy: prediction.nextBestAction,
    };
  }
}

/**
 * Batch analyze all patients for churn risk
 */
export async function batchAnalyzeChurnRisk(
  patients: PatientData[]
): Promise<Map<string, ChurnPrediction>> {
  const predictions = new Map<string, ChurnPrediction>();

  for (const patient of patients) {
    const prediction = calculateChurnRisk(patient);
    predictions.set(patient.id, prediction);
  }

  return predictions;
}

/**
 * Get patients at high risk (for dashboard alerts)
 */
export function getHighRiskPatients(
  predictions: Map<string, ChurnPrediction>
): string[] {
  return Array.from(predictions.entries())
    .filter(([_, pred]) => pred.riskLevel === 'high' || pred.riskLevel === 'critical')
    .sort((a, b) => b[1].riskScore - a[1].riskScore)
    .map(([id, _]) => id);
}
