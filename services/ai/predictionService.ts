/**
 * services/ai/predictionService.ts
 * 
 * Serviço de análise preditiva usando IA (Gemini)
 */

import { generateText } from '../geminiService';
import { Surgery, Pathology, PatientGoal } from '@/types';

export interface PredictionResult {
  predictedDischargeDate: string;
  daysToDischarge: number;
  confidence: number;
  similarCasesCount: number;
}

export interface RecidiveRiskResult {
  risk: number; // 0-100
  confidence: number;
  factors: string[];
  recommendations: string[];
}

export interface SatisfactionPrediction {
  score: number; // 0-10
  confidence: number;
  factors: string[];
}

export interface AIRecommendation {
  text: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export class PredictionService {
  
  /**
   * Predizer data de alta do paciente
   */
  async predictDischargeDate(
    surgery: Surgery | null,
    pathologies: Pathology[],
    goals: PatientGoal[],
    currentSessionNumber: number
  ): Promise<PredictionResult> {
    try {
      const prompt = `
Analise o caso do paciente e preveja a data de alta:

CIRURGIA:
${surgery ? `
- Nome: ${surgery.name}
- Data: ${surgery.date}
- Tempo de recuperação estimado: ${surgery.recoveryTimeDays} dias
- Complicações: ${surgery.complications || 'Nenhuma'}
` : 'Nenhuma cirurgia registrada'}

PATOLOGIAS ATIVAS:
${pathologies.map(p => `- ${p.name} (${p.severity}, ${p.status})`).join('\n') || 'Nenhuma'}

METAS ATIVAS:
${goals.filter(g => g.status === 'active').map(g => `- ${g.title} (${g.currentProgress}% completo)`).join('\n') || 'Nenhuma'}

SESSÕES REALIZADAS: ${currentSessionNumber}

Com base em padrões clínicos similares, preveja:
1. Data estimada de alta (formato: YYYY-MM-DD)
2. Número de dias até a alta
3. Nível de confiança (0-100)
4. Número estimado de casos similares na base de dados

Responda APENAS em formato JSON:
{
  "predictedDate": "YYYY-MM-DD",
  "daysToDischarge": número,
  "confidence": número,
  "similarCases": número
}
`;

      const response = await generateText(prompt);
      const result = JSON.parse(response);

      return {
        predictedDischargeDate: result.predictedDate,
        daysToDischarge: result.daysToDischarge,
        confidence: result.confidence,
        similarCasesCount: result.similarCases
      };
    } catch (error) {
      console.error('Erro ao prever data de alta:', error);
      // Retornar valores padrão em caso de erro
      return {
        predictedDischargeDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        daysToDischarge: 90,
        confidence: 50,
        similarCasesCount: 0
      };
    }
  }

  /**
   * Predizer risco de recidiva
   */
  async predictRecidiveRisk(
    surgery: Surgery | null,
    pathologies: Pathology[],
    adherenceRate: number,
    painReduction: number
  ): Promise<RecidiveRiskResult> {
    try {
      const prompt = `
Analise o risco de recidiva do paciente:

CIRURGIA:
${surgery ? `
- Nome: ${surgery.name}
- Data: ${surgery.date}
- Complicações: ${surgery.complications || 'Nenhuma'}
` : 'Nenhuma cirurgia registrada'}

PATOLOGIAS:
${pathologies.map(p => `- ${p.name} (${p.severity})`).join('\n') || 'Nenhuma'}

ADERÊNCIA AO TRATAMENTO: ${adherenceRate}%
REDUÇÃO DE DOR: ${painReduction}%

Com base nos fatores de risco, calcule:
1. Risco de recidiva (0-100)
2. Nível de confiança (0-100)
3. Principais fatores de risco
4. Recomendações para reduzir o risco

Responda APENAS em formato JSON:
{
  "risk": número,
  "confidence": número,
  "factors": ["fator1", "fator2"],
  "recommendations": ["recomendação1", "recomendação2"]
}
`;

      const response = await generateText(prompt);
      const result = JSON.parse(response);

      return {
        risk: result.risk,
        confidence: result.confidence,
        factors: result.factors,
        recommendations: result.recommendations
      };
    } catch (error) {
      console.error('Erro ao prever risco de recidiva:', error);
      return {
        risk: 50,
        confidence: 50,
        factors: ['Dados insuficientes'],
        recommendations: ['Continuar monitoramento']
      };
    }
  }

  /**
   * Predizer satisfação esperada do paciente
   */
  async predictSatisfaction(
    painReduction: number,
    functionalGain: number,
    adherenceRate: number,
    goalsCompleted: number
  ): Promise<SatisfactionPrediction> {
    try {
      const prompt = `
Preveja a satisfação esperada do paciente:

REDUÇÃO DE DOR: ${painReduction}%
GANHO FUNCIONAL: ${functionalGain}%
ADERÊNCIA: ${adherenceRate}%
METAS ALCANÇADAS: ${goalsCompleted}

Com base em feedback de pacientes similares, preveja:
1. Score de satisfação (0-10)
2. Nível de confiança (0-100)
3. Fatores que influenciam a satisfação

Responda APENAS em formato JSON:
{
  "score": número,
  "confidence": número,
  "factors": ["fator1", "fator2"]
}
`;

      const response = await generateText(prompt);
      const result = JSON.parse(response);

      return {
        score: result.score,
        confidence: result.confidence,
        factors: result.factors
      };
    } catch (error) {
      console.error('Erro ao prever satisfação:', error);
      return {
        score: 7,
        confidence: 50,
        factors: ['Dados insuficientes']
      };
    }
  }

  /**
   * Gerar recomendações inteligentes
   */
  async generateRecommendations(
    surgery: Surgery | null,
    pathologies: Pathology[],
    goals: PatientGoal[],
    adherenceRate: number,
    painLevel: number
  ): Promise<AIRecommendation[]> {
    try {
      const prompt = `
Gere recomendações clínicas personalizadas para o paciente:

CIRURGIA: ${surgery ? surgery.name : 'Nenhuma'}
PATOLOGIAS: ${pathologies.map(p => p.name).join(', ') || 'Nenhuma'}
METAS ATIVAS: ${goals.filter(g => g.status === 'active').length}
ADERÊNCIA: ${adherenceRate}%
NÍVEL DE DOR ATUAL: ${painLevel}/10

Gere 3-5 recomendações práticas e acionáveis.
Priorize por importância (high, medium, low).

Responda APENAS em formato JSON:
{
  "recommendations": [
    {
      "text": "texto da recomendação",
      "priority": "high|medium|low",
      "category": "categoria"
    }
  ]
}
`;

      const response = await generateText(prompt);
      const result = JSON.parse(response);

      return result.recommendations || [];
    } catch (error) {
      console.error('Erro ao gerar recomendações:', error);
      return [
        {
          text: 'Continue o protocolo de tratamento conforme prescrito',
          priority: 'medium',
          category: 'Tratamento'
        }
      ];
    }
  }

  /**
   * Predizer progresso de uma meta
   */
  async predictGoalProgress(
    goal: PatientGoal,
    currentProgress: number,
    daysElapsed: number,
    targetDays: number
  ): Promise<{ likelihood: number; predictedCompletionDate: string }> {
    try {
      const prompt = `
Preveja a probabilidade de conclusão da meta:

META: ${goal.title}
CATEGORIA: ${goal.category}
PROGRESSO ATUAL: ${currentProgress}%
DIAS DECORRIDOS: ${daysElapsed}
DIAS ALVO: ${targetDays}

Calcule:
1. Probabilidade de alcançar a meta (0-100)
2. Data prevista de conclusão (YYYY-MM-DD)

Responda APENAS em formato JSON:
{
  "likelihood": número,
  "predictedCompletionDate": "YYYY-MM-DD"
}
`;

      const response = await generateText(prompt);
      const result = JSON.parse(response);

      return {
        likelihood: result.likelihood,
        predictedCompletionDate: result.predictedCompletionDate
      };
    } catch (error) {
      console.error('Erro ao prever progresso da meta:', error);
      const progressRate = currentProgress / daysElapsed;
      const remainingProgress = 100 - currentProgress;
      const estimatedDays = Math.ceil(remainingProgress / progressRate);
      const completionDate = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);

      return {
        likelihood: 70,
        predictedCompletionDate: completionDate.toISOString().split('T')[0]
      };
    }
  }
}

// Exportar instância singleton
export const predictionService = new PredictionService();

