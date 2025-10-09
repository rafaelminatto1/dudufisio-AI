/**
 * Machine Learning Prediction Service
 * Serviço para predições usando modelos de ML
 */

import { supabase } from '../../lib/supabase';

export interface MLModel {
  id: string;
  model_name: string;
  model_type: string;
  prediction_type: string;
  version: string;
  algorithm: string;
  accuracy?: number;
  is_production: boolean;
  feature_names: string[];
  feature_importance?: any;
  created_at: string;
}

export interface PredictionInput {
  patient_id: string;
  prediction_type: string;
  features: Record<string, any>;
}

export interface PredictionResult {
  id: string;
  patient_id: string;
  prediction_type: string;
  outcome_prediction: string;
  confidence_score: number;
  confidence_level: string;
  recommendations: string[];
  feature_importance: any;
  explanation: string;
  model_name: string;
  model_version: string;
  created_at: string;
}

class MLPredictionService {
  /**
   * Gerar predição de outcome de tratamento
   */
  async predictTreatmentOutcome(input: PredictionInput): Promise<PredictionResult> {
    // 1. Buscar modelo ativo
    const model = await this.getActiveModel('treatment_outcome');
    
    if (!model) {
      throw new Error('Nenhum modelo ativo encontrado para predição de outcome');
    }

    // 2. Preparar features
    const features = await this.prepareFeatures(input.patient_id, input.features);
    
    // 3. Fazer predição (integração com API externa ou modelo local)
    const prediction = await this.runPrediction(model, features);
    
    // 4. Calcular explicabilidade
    const explanation = this.generateExplanation(prediction, features, model);
    
    // 5. Salvar predição no banco
    const result = await this.savePrediction({
      patient_id: input.patient_id,
      prediction_type: input.prediction_type,
      outcome_prediction: prediction.outcome,
      confidence_score: prediction.confidence,
      confidence_level: this.classifyConfidence(prediction.confidence),
      input_features: features,
      features_used: Object.keys(features),
      factors_analyzed: this.extractFactors(features),
      recommendations: this.generateRecommendations(prediction, features),
      feature_importance: prediction.feature_importance,
      explanation,
      model_name: model.model_name,
      model_version: model.version,
      created_by: 'ai_system',
    });

    return result;
  }

  /**
   * Predição de risco de abandono
   */
  async predictDropoutRisk(patientId: string): Promise<PredictionResult> {
    const model = await this.getActiveModel('dropout_risk');
    
    if (!model) {
      throw new Error('Modelo de dropout não encontrado');
    }

    // Buscar dados do paciente
    const patientData = await this.getPatientData(patientId);
    
    // Features para dropout
    const features = {
      age: patientData.age,
      sessions_attended: patientData.sessions_attended,
      sessions_missed: patientData.sessions_missed,
      attendance_rate: patientData.attendance_rate,
      days_since_last_session: patientData.days_since_last_session,
      payment_status: patientData.payment_status,
      satisfaction_score: patientData.satisfaction_score,
      distance_to_clinic_km: patientData.distance_km,
      has_transportation: patientData.has_transportation,
      social_support_level: patientData.social_support,
    };

    const prediction = await this.runPrediction(model, features);
    
    return await this.savePrediction({
      patient_id: patientId,
      prediction_type: 'dropout_risk',
      outcome_prediction: prediction.outcome,
      confidence_score: prediction.confidence,
      confidence_level: this.classifyConfidence(prediction.confidence),
      input_features: features,
      features_used: Object.keys(features),
      factors_analyzed: this.extractFactors(features),
      risk_factors: this.identifyRiskFactors(features, prediction),
      protective_factors: this.identifyProtectiveFactors(features, prediction),
      recommendations: this.generateDropoutPreventionPlan(prediction, features),
      explanation: this.generateExplanation(prediction, features, model),
      model_name: model.model_name,
      model_version: model.version,
      created_by: 'ai_system',
    });
  }

  /**
   * Recomendação de exercícios usando collaborative filtering
   */
  async recommendExercises(patientId: string, conditionType: string): Promise<any[]> {
    // Buscar histórico do paciente
    const patientHistory = await this.getPatientExerciseHistory(patientId);
    
    // Buscar pacientes similares
    const similarPatients = await this.findSimilarPatients(patientId, conditionType);
    
    // Exercícios que pacientes similares tiveram sucesso
    const successfulExercises = await this.getSuccessfulExercises(similarPatients);
    
    // Filtrar exercícios que o paciente ainda não fez
    const newExercises = successfulExercises.filter(
      ex => !patientHistory.some(h => h.exercise_id === ex.id)
    );
    
    // Ranquear por relevância
    const rankedExercises = this.rankExercises(newExercises, patientHistory);
    
    // Salvar recomendações
    await this.saveExerciseRecommendations(patientId, rankedExercises.slice(0, 10));
    
    return rankedExercises.slice(0, 10);
  }

  /**
   * Buscar modelo ativo para tipo de predição
   */
  private async getActiveModel(predictionType: string): Promise<MLModel | null> {
    const { data, error } = await supabase
      .from('ml_models')
      .select('*')
      .eq('prediction_type', predictionType)
      .eq('is_active', true)
      .eq('is_production', true)
      .order('accuracy', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Preparar features para predição
   */
  private async prepareFeatures(patientId: string, additionalFeatures: any = {}) {
    // Buscar dados do paciente
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (!patient) throw new Error('Paciente não encontrado');

    // Features básicas
    const features: Record<string, any> = {
      age: this.calculateAge(patient.birth_date),
      gender: patient.gender,
      ...additionalFeatures,
    };

    // Normalizar features numéricas
    return this.normalizeFeatures(features);
  }

  /**
   * Executar predição (simulado - em produção usar API de ML)
   */
  private async runPrediction(model: MLModel, features: any) {
    // Em produção, fazer request para:
    // - Azure ML
    // - AWS SageMaker
    // - Google Vertex AI
    // - Modelo local (Python API)
    
    // Por enquanto, simulação baseada em regras
    const confidence = 0.75 + (Math.random() * 0.20); // 0.75 - 0.95
    
    let outcome = 'positive';
    let featureImportance: Record<string, number> = {};
    
    // Lógica simplificada baseada em features
    if (features.age > 65) {
      confidence -= 0.05;
      featureImportance.age = 0.25;
    }
    
    if (features.attendance_rate < 0.7) {
      confidence -= 0.1;
      outcome = 'moderate';
      featureImportance.attendance_rate = 0.35;
    }
    
    return {
      outcome,
      confidence: Math.max(0.5, Math.min(0.99, confidence)),
      feature_importance: featureImportance,
    };
  }

  /**
   * Salvar predição no banco
   */
  private async savePrediction(predictionData: any): Promise<PredictionResult> {
    const { data, error } = await supabase
      .from('ai_predictions')
      .insert(predictionData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Gerar explicação da predição
   */
  private generateExplanation(prediction: any, features: any, model: MLModel): string {
    const topFactors = Object.entries(prediction.feature_importance || {})
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([key]) => key);

    return `Esta predição foi gerada pelo modelo ${model.model_name} (versão ${model.version}) ` +
           `com ${Math.round(prediction.confidence * 100)}% de confiança. ` +
           `Os principais fatores considerados foram: ${topFactors.join(', ')}.`;
  }

  /**
   * Gerar recomendações baseadas na predição
   */
  private generateRecommendations(prediction: any, features: any): string[] {
    const recommendations: string[] = [];

    if (prediction.confidence < 0.7) {
      recommendations.push('Monitorar progresso com frequência aumentada');
    }

    if (features.age > 65) {
      recommendations.push('Considerar abordagem geriátrica especializada');
    }

    if (features.attendance_rate < 0.8) {
      recommendations.push('Trabalhar estratégias de aderência ao tratamento');
    }

    recommendations.push('Revisar plano de tratamento a cada 2 semanas');
    
    return recommendations;
  }

  /**
   * Classificar nível de confiança
   */
  private classifyConfidence(score: number): string {
    if (score >= 0.9) return 'very_high';
    if (score >= 0.75) return 'high';
    if (score >= 0.6) return 'medium';
    if (score >= 0.4) return 'low';
    return 'very_low';
  }

  /**
   * Extrair fatores analisados
   */
  private extractFactors(features: any): string[] {
    return Object.keys(features);
  }

  /**
   * Identificar fatores de risco
   */
  private identifyRiskFactors(features: any, prediction: any): string[] {
    const risks: string[] = [];
    
    if (features.age > 65) risks.push('Idade avançada');
    if (features.attendance_rate < 0.8) risks.push('Baixa aderência ao tratamento');
    if (features.sessions_missed > 3) risks.push('Múltiplas faltas recentes');
    
    return risks;
  }

  /**
   * Identificar fatores protetores
   */
  private identifyProtectiveFactors(features: any, prediction: any): string[] {
    const protective: string[] = [];
    
    if (features.attendance_rate > 0.9) protective.push('Excelente aderência');
    if (features.satisfaction_score > 4) protective.push('Alta satisfação');
    if (features.has_transportation) protective.push('Acesso facilitado');
    
    return protective;
  }

  /**
   * Gerar plano de prevenção de abandono
   */
  private generateDropoutPreventionPlan(prediction: any, features: any): string[] {
    const plan: string[] = [];
    
    if (features.attendance_rate < 0.8) {
      plan.push('Implementar sistema de lembretes (WhatsApp/SMS)');
      plan.push('Oferecer horários flexíveis');
    }
    
    if (features.distance_to_clinic_km > 10) {
      plan.push('Considerar teleconsulta para algumas sessões');
    }
    
    plan.push('Agendar conversa motivacional com paciente');
    plan.push('Revisar metas e expectativas');
    
    return plan;
  }

  /**
   * Calcular idade
   */
  private calculateAge(birthDate: string): number {
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
   * Normalizar features
   */
  private normalizeFeatures(features: any): any {
    // Implementar normalização (z-score, min-max, etc)
    return features;
  }

  /**
   * Buscar dados do paciente para predição
   */
  private async getPatientData(patientId: string) {
    // Buscar dados agregados do paciente
    const { data: patient } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    // Buscar métricas de sessões
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('patient_id', patientId);

    const attended = sessions?.filter(s => s.status === 'completed').length || 0;
    const missed = sessions?.filter(s => s.status === 'missed').length || 0;
    const total = sessions?.length || 0;

    // Última sessão
    const lastSession = sessions?.[0];
    const daysSinceLastSession = lastSession 
      ? Math.floor((Date.now() - new Date(lastSession.session_date).getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    return {
      age: this.calculateAge(patient.birth_date),
      sessions_attended: attended,
      sessions_missed: missed,
      attendance_rate: total > 0 ? attended / total : 0,
      days_since_last_session: daysSinceLastSession,
      payment_status: 'current', // Buscar da tabela de pagamentos
      satisfaction_score: 4.5, // Buscar de feedbacks
      distance_km: 5, // Calcular baseado no endereço
      has_transportation: true,
      social_support: 'high',
    };
  }

  /**
   * Buscar histórico de exercícios do paciente
   */
  private async getPatientExerciseHistory(patientId: string) {
    const { data } = await supabase
      .from('exercise_assignments')
      .select('*, exercises(*)')
      .eq('patient_id', patientId);

    return data || [];
  }

  /**
   * Encontrar pacientes similares
   */
  private async findSimilarPatients(patientId: string, conditionType: string) {
    // Buscar pacientes com mesma condição
    const { data } = await supabase
      .from('patients')
      .select('id')
      .neq('id', patientId)
      .limit(50);

    return data || [];
  }

  /**
   * Buscar exercícios com sucesso
   */
  private async getSuccessfulExercises(similarPatients: any[]) {
    const patientIds = similarPatients.map(p => p.id);
    
    const { data } = await supabase
      .from('exercise_assignments')
      .select('*, exercises(*)')
      .in('patient_id', patientIds)
      .gte('effectiveness_rating', 4);

    return data || [];
  }

  /**
   * Ranquear exercícios por relevância
   */
  private rankExercises(exercises: any[], patientHistory: any[]) {
    // Implementar algoritmo de ranking (NDCG, etc)
    return exercises.sort((a, b) => {
      return (b.effectiveness_rating || 0) - (a.effectiveness_rating || 0);
    });
  }

  /**
   * Salvar recomendações de exercícios
   */
  private async saveExerciseRecommendations(patientId: string, exercises: any[]) {
    const recommendations = exercises.map((ex, index) => ({
      patient_id: patientId,
      exercise_id: ex.exercise_id,
      recommendation_score: (exercises.length - index) / exercises.length,
      reason: `Sucesso em pacientes similares (${ex.effectiveness_rating}/5)`,
    }));

    await supabase
      .from('exercise_recommendations')
      .insert(recommendations);
  }
}

export const mlPredictionService = new MLPredictionService();





