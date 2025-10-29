// services/aiPredictionService.ts
import { PatientWithMonitoringMetrics } from '../types';
import { getGeminiClient } from './geminiService';

export interface AbandonmentPrediction {
  patientId: string;
  patientName: string;
  probabilityScore: number; // 0-100
  riskFactors: {
    factor: string;
    weight: number; // 0-1
    description: string;
  }[];
  recommendedActions: {
    action: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    estimatedImpact: string;
  }[];
  predictionDate: string;
  confidence: 'high' | 'medium' | 'low';
}

/**
 * Usa IA (Gemini) para prever probabilidade de abandono
 */
export async function predictPatientAbandonment(
  patient: PatientWithMonitoringMetrics,
  historicalData?: any
): Promise<AbandonmentPrediction> {
  try {
    const gemini = getGeminiClient();

    const prompt = `
Você é um especialista em análise preditiva de retenção de pacientes em clínicas de fisioterapia.

Analise o perfil do paciente abaixo e preveja a probabilidade de abandono do tratamento:

**Dados do Paciente:**
- Nome: ${patient.name}
- Taxa de Presença: ${patient.attendanceRate.toFixed(1)}%
- Faltas Consecutivas: ${patient.consecutiveMisses}
- Dias Sem Sessão: ${patient.daysSinceLastSession}
- Total de Sessões: ${patient.totalSessions}
- Total de Faltas: ${patient.totalMisses}
- Nível Médio de Dor: ${patient.averagePainLevel.toFixed(1)}/10
- Tendência de Dor: ${patient.painTrend}
- Nível de Risco Atual: ${patient.riskLevel}
- Razões de Risco: ${patient.riskReasons.join(', ')}

**Sua Tarefa:**
1. Calcule a probabilidade de abandono (0-100%)
2. Identifique os 3-5 principais fatores de risco com peso (0-1)
3. Sugira 3-5 ações recomendadas priorizadas
4. Avalie sua confiança na previsão (high/medium/low)

**Retorne APENAS um JSON válido no formato:**
{
  "probabilityScore": 75,
  "confidence": "high",
  "riskFactors": [
    {
      "factor": "Faltas consecutivas",
      "weight": 0.8,
      "description": "Paciente faltou 3 vezes seguidas, indicando desengajamento"
    }
  ],
  "recommendedActions": [
    {
      "action": "Contato urgente via WhatsApp",
      "priority": "high",
      "description": "Entrar em contato hoje para entender motivos das faltas",
      "estimatedImpact": "Pode reduzir probabilidade de abandono em 40%"
    }
  ]
}
`;

    const response = await gemini.generateText(prompt);
    
    // Extrair JSON da resposta
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Gemini não retornou JSON válido');
    }

    const prediction = JSON.parse(jsonMatch[0]);

    return {
      patientId: patient.id,
      patientName: patient.name,
      probabilityScore: prediction.probabilityScore || 50,
      riskFactors: prediction.riskFactors || [],
      recommendedActions: prediction.recommendedActions || [],
      predictionDate: new Date().toISOString(),
      confidence: prediction.confidence || 'medium',
    };

  } catch (error) {
    console.error('Erro ao prever abandono com IA:', error);
    
    // Fallback: Previsão baseada em regras
    return predictWithRules(patient);
  }
}

/**
 * Previsão baseada em regras (fallback sem IA)
 */
function predictWithRules(patient: PatientWithMonitoringMetrics): AbandonmentPrediction {
  let probabilityScore = 0;
  const riskFactors: AbandonmentPrediction['riskFactors'] = [];
  const recommendedActions: AbandonmentPrediction['recommendedActions'] = [];

  // Fator 1: Faltas consecutivas (peso alto)
  if (patient.consecutiveMisses >= 3) {
    probabilityScore += 40;
    riskFactors.push({
      factor: 'Faltas Consecutivas Críticas',
      weight: 0.9,
      description: `${patient.consecutiveMisses} faltas seguidas indicam alto risco de abandono`,
    });
    recommendedActions.push({
      action: 'Contato Urgente',
      priority: 'high',
      description: 'Ligar hoje para o paciente e entender os motivos',
      estimatedImpact: 'Pode reduzir abandono em 50%',
    });
  } else if (patient.consecutiveMisses >= 2) {
    probabilityScore += 25;
    riskFactors.push({
      factor: 'Faltas Consecutivas',
      weight: 0.7,
      description: `${patient.consecutiveMisses} faltas seguidas`,
    });
  }

  // Fator 2: Taxa de presença baixa
  if (patient.attendanceRate < 60) {
    probabilityScore += 30;
    riskFactors.push({
      factor: 'Taxa de Presença Muito Baixa',
      weight: 0.8,
      description: `Taxa de ${patient.attendanceRate.toFixed(1)}% está abaixo do ideal (75%)`,
    });
    recommendedActions.push({
      action: 'Conversa sobre Comprometimento',
      priority: 'high',
      description: 'Agendar conversa para entender barreiras ao tratamento',
      estimatedImpact: 'Pode melhorar adesão em 30%',
    });
  } else if (patient.attendanceRate < 75) {
    probabilityScore += 15;
    riskFactors.push({
      factor: 'Taxa de Presença Abaixo da Meta',
      weight: 0.5,
      description: `Taxa de ${patient.attendanceRate.toFixed(1)}%`,
    });
  }

  // Fator 3: Inatividade prolongada
  if (patient.daysSinceLastSession >= 30) {
    probabilityScore += 30;
    riskFactors.push({
      factor: 'Inatividade Prolongada',
      weight: 0.85,
      description: `${patient.daysSinceLastSession} dias sem sessão`,
    });
    recommendedActions.push({
      action: 'Campanha de Reengajamento',
      priority: 'high',
      description: 'Enviar mensagem personalizada via WhatsApp oferecendo reagendamento',
      estimatedImpact: 'Taxa de retorno: 35%',
    });
  } else if (patient.daysSinceLastSession >= 15) {
    probabilityScore += 15;
    riskFactors.push({
      factor: 'Tempo Desde Última Sessão',
      weight: 0.6,
      description: `${patient.daysSinceLastSession} dias`,
    });
  }

  // Fator 4: Piora de dor
  if (patient.painTrend === 'worsening') {
    probabilityScore += 20;
    riskFactors.push({
      factor: 'Piora no Quadro Clínico',
      weight: 0.7,
      description: 'Tendência de piora pode causar frustração e abandono',
    });
    recommendedActions.push({
      action: 'Revisão do Protocolo de Tratamento',
      priority: 'medium',
      description: 'Avaliar e ajustar tratamento com terapeuta responsável',
      estimatedImpact: 'Pode melhorar aderência em 25%',
    });
  }

  // Limitar score a 100
  probabilityScore = Math.min(100, probabilityScore);

  // Determinar confiança
  let confidence: 'high' | 'medium' | 'low';
  if (patient.totalSessions >= 10) {
    confidence = 'high';
  } else if (patient.totalSessions >= 5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Ação genérica se não tiver ações específicas
  if (recommendedActions.length === 0 && probabilityScore > 30) {
    recommendedActions.push({
      action: 'Monitoramento Ativo',
      priority: 'medium',
      description: 'Acompanhar de perto nas próximas sessões',
      estimatedImpact: 'Prevenção proativa',
    });
  }

  return {
    patientId: patient.id,
    patientName: patient.name,
    probabilityScore: Math.round(probabilityScore),
    riskFactors,
    recommendedActions,
    predictionDate: new Date().toISOString(),
    confidence,
  };
}

/**
 * Prevê abandono para múltiplos pacientes em lote
 */
export async function batchPredictAbandonment(
  patients: PatientWithMonitoringMetrics[],
  useAI: boolean = true
): Promise<AbandonmentPrediction[]> {
  if (!useAI) {
    // Usar regras para todos (mais rápido)
    return patients.map(p => predictWithRules(p));
  }

  // Usar IA apenas para pacientes de risco médio/alto (otimizar custo)
  const predictions: AbandonmentPrediction[] = [];

  for (const patient of patients) {
    if (patient.riskLevel === 'low' && patient.attendanceRate > 80) {
      // Baixo risco: usar regras (não gastar créditos de IA)
      predictions.push(predictWithRules(patient));
    } else {
      // Médio/Alto risco: usar IA
      try {
        const prediction = await predictPatientAbandonment(patient);
        predictions.push(prediction);
      } catch (error) {
        console.error(`Erro ao prever para ${patient.name}:`, error);
        predictions.push(predictWithRules(patient));
      }
    }
  }

  return predictions;
}

/**
 * Gera resumo de predições
 */
export function getPredictionSummary(predictions: AbandonmentPrediction[]): {
  averageProbability: number;
  highRiskCount: number;
  mediumRiskCount: number;
  lowRiskCount: number;
  topRiskFactors: { factor: string; count: number }[];
} {
  const highRiskCount = predictions.filter(p => p.probabilityScore >= 70).length;
  const mediumRiskCount = predictions.filter(p => p.probabilityScore >= 40 && p.probabilityScore < 70).length;
  const lowRiskCount = predictions.filter(p => p.probabilityScore < 40).length;

  const averageProbability = predictions.length > 0
    ? predictions.reduce((sum, p) => sum + p.probabilityScore, 0) / predictions.length
    : 0;

  // Contar fatores de risco mais comuns
  const factorCounts = new Map<string, number>();
  predictions.forEach(p => {
    p.riskFactors.forEach(rf => {
      const count = factorCounts.get(rf.factor) || 0;
      factorCounts.set(rf.factor, count + 1);
    });
  });

  const topRiskFactors = Array.from(factorCounts.entries())
    .map(([factor, count]) => ({ factor, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  return {
    averageProbability: Math.round(averageProbability),
    highRiskCount,
    mediumRiskCount,
    lowRiskCount,
    topRiskFactors,
  };
}


