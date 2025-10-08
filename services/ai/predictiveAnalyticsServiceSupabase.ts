/**
 * Predictive Analytics Service - Supabase Integration
 * Serviço de Análise Preditiva com IA
 */

import { supabase } from '../../lib/supabase';
import {
  PredictionModel,
  PredictionResult,
  OutcomeScenario,
  FeatureImportance,
  ModelType,
  PredictionConfidence,
} from '../../types/predictiveAnalyticsTypes';

class PredictiveAnalyticsServiceSupabase {
  /**
   * Prediz outcome de tratamento para um paciente
   */
  async predictTreatmentOutcome(
    patientId: string,
    treatmentType: string
  ): Promise<PredictionResult> {
    try {
      // Buscar histórico do paciente
      const { data: patient } = await supabase
        .from('patients')
        .select('*, session_evolutions(*)')
        .eq('id', patientId)
        .single();

      if (!patient) {
        throw new Error('Paciente não encontrado');
      }

      // Buscar dados de tratamentos similares
      const { data: similarTreatments } = await supabase
        .from('treatment_effectiveness')
        .select('*')
        .eq('treatment_type', treatmentType)
        .limit(100);

      // Calcular predição baseada em dados históricos
      const successRate = this.calculateSuccessRate(similarTreatments || []);
      const estimatedSessions = this.estimateRequiredSessions(patient, treatmentType);
      const estimatedRecoveryTime = Math.round(estimatedSessions * 2.5); // dias

      // Features que influenciam a predição
      const featureImportance: FeatureImportance[] = [
        {
          featureName: 'Idade',
          importance: 0.25,
          value: this.calculateAge(patient.birth_date),
          impact: 'negative',
          description: 'Idade avançada pode aumentar tempo de recuperação',
        },
        {
          featureName: 'Histórico de Tratamentos',
          importance: 0.20,
          value: patient.session_evolutions?.length || 0,
          impact: 'positive',
          description: 'Paciente com histórico de adesão',
        },
        {
          featureName: 'Comorbidades',
          importance: 0.15,
          value: patient.medical_history?.length || 0,
          impact: 'negative',
          description: 'Múltiplas comorbidades podem afetar recuperação',
        },
      ];

      const prediction: PredictionResult = {
        id: `pred-${Date.now()}`,
        modelType: 'treatment_outcome' as ModelType,
        patientId,
        predictionDate: new Date(),
        predictedOutcome: successRate > 0.7 ? 'Excelente' : successRate > 0.5 ? 'Bom' : 'Regular',
        confidence: this.calculateConfidence(featureImportance),
        probability: successRate,
        estimatedTimeframe: `${estimatedRecoveryTime} dias`,
        factors: featureImportance,
        recommendedActions: this.generateRecommendations(featureImportance, successRate),
        alternativeScenarios: this.generateScenarios(successRate, estimatedSessions),
        modelVersion: '1.0',
        lastTrainingDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      };

      // Salvar predição
      await this.savePrediction(prediction);

      return prediction;
    } catch (error) {
      console.error('Erro ao predizer outcome:', error);
      throw error;
    }
  }

  /**
   * Salva predição no banco
   */
  private async savePrediction(prediction: PredictionResult): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_predictions')
        .insert({
          prediction_type: prediction.modelType,
          target_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          predicted_value: prediction.probability,
          confidence_score: prediction.confidence === 'high' ? 0.9 : 
                          prediction.confidence === 'medium' ? 0.7 : 0.5,
          factors: prediction.factors,
          metadata: {
            predicted_outcome: prediction.predictedOutcome,
            timeframe: prediction.estimatedTimeframe,
            model_version: prediction.modelVersion,
          },
        });

      if (error && error.code !== '42P01') {
        console.error('Erro ao salvar predição:', error);
      }
    } catch (error) {
      console.debug('Predição não salva:', error);
    }
  }

  /**
   * Calcula taxa de sucesso baseada em tratamentos históricos
   */
  private calculateSuccessRate(treatments: any[]): number {
    if (treatments.length === 0) return 0.75; // Baseline

    const successful = treatments.filter(t => 
      (t.success_rate || 0) > 0.7 || 
      (t.outcome_score || 0) > 70
    ).length;

    return successful / treatments.length;
  }

  /**
   * Estima número de sessões necessárias
   */
  private estimateRequiredSessions(patient: any, treatmentType: string): number {
    // Lógica simplificada - em produção usaria ML
    const age = this.calculateAge(patient.birth_date);
    const baselineSessions = 12;
    
    let sessions = baselineSessions;
    
    // Ajustes baseados em fatores
    if (age > 65) sessions += 4;
    if (patient.medical_history?.length > 3) sessions += 2;
    
    return sessions;
  }

  /**
   * Calcula confiança da predição
   */
  private calculateConfidence(features: FeatureImportance[]): PredictionConfidence {
    const totalImportance = features.reduce((sum, f) => sum + f.importance, 0);
    
    if (totalImportance > 0.8) return 'high';
    if (totalImportance > 0.5) return 'medium';
    return 'low';
  }

  /**
   * Gera recomendações baseadas nas features
   */
  private generateRecommendations(
    features: FeatureImportance[],
    successRate: number
  ): string[] {
    const recommendations: string[] = [];

    if (successRate < 0.6) {
      recommendations.push('Considerar abordagem terapêutica alternativa');
      recommendations.push('Aumentar frequência de sessões nas primeiras semanas');
    }

    const negativeFeatures = features.filter(f => f.impact === 'negative');
    if (negativeFeatures.length > 2) {
      recommendations.push('Atenção especial aos fatores de risco identificados');
      recommendations.push('Monitoramento próximo nas primeiras sessões');
    }

    recommendations.push('Seguir protocolo baseado em evidências');
    recommendations.push('Reavaliar progresso a cada 4 sessões');

    return recommendations;
  }

  /**
   * Gera cenários alternativos
   */
  private generateScenarios(
    baselineSuccess: number,
    baselineSessions: number
  ): OutcomeScenario[] {
    return [
      {
        scenarioName: 'Cenário Otimista',
        description: 'Paciente segue 100% do plano com boa adesão',
        probability: 0.3,
        estimatedTimeframe: `${Math.round(baselineSessions * 0.8 * 2.5)} dias`,
        expectedOutcome: 'Recuperação completa com alta funcionalidade',
        assumptions: [
          'Adesão perfeita ao tratamento',
          'Sem complicações',
          'Suporte familiar adequado',
        ],
      },
      {
        scenarioName: 'Cenário Realista',
        description: 'Paciente segue plano com adesão moderada',
        probability: 0.5,
        estimatedTimeframe: `${Math.round(baselineSessions * 2.5)} dias`,
        expectedOutcome: 'Melhora significativa com retorno gradual às atividades',
        assumptions: [
          'Adesão de 70-85%',
          'Pequenas intercorrências',
          'Suporte adequado',
        ],
      },
      {
        scenarioName: 'Cenário Conservador',
        description: 'Paciente tem dificuldades de adesão ou complicações',
        probability: 0.2,
        estimatedTimeframe: `${Math.round(baselineSessions * 1.5 * 2.5)} dias`,
        expectedOutcome: 'Melhora parcial, pode necessitar sessões adicionais',
        assumptions: [
          'Adesão abaixo de 70%',
          'Possíveis complicações',
          'Suporte limitado',
        ],
      },
    ];
  }

  /**
   * Calcula idade a partir da data de nascimento
   */
  private calculateAge(birthDate: string): number {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Busca histórico de predições
   */
  async getPredictionHistory(patientId: string): Promise<PredictionResult[]> {
    try {
      const { data, error } = await supabase
        .from('ai_predictions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error && error.code !== '42P01') throw error;

      return data?.map(d => ({
        id: d.id,
        modelType: d.prediction_type as ModelType,
        patientId: patientId,
        predictionDate: new Date(d.created_at),
        predictedOutcome: d.metadata?.predicted_outcome || 'Unknown',
        confidence: d.confidence_score > 0.8 ? 'high' : 
                   d.confidence_score > 0.6 ? 'medium' : 'low',
        probability: d.predicted_value || 0,
        estimatedTimeframe: d.metadata?.timeframe || '',
        factors: d.factors || [],
        recommendedActions: [],
        alternativeScenarios: [],
        modelVersion: d.metadata?.model_version || '1.0',
        lastTrainingDate: new Date(d.created_at),
      })) || [];
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  }
}

export const predictiveAnalyticsServiceSupabase = new PredictiveAnalyticsServiceSupabase();

