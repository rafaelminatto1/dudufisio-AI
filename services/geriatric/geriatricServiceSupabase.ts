/**
 * Geriatric Care Service - Supabase Implementation
 * Serviço para módulo de cuidados geriátricos
 */

import { supabase } from '../../lib/supabase';

export interface GeriatricAssessment {
  id: string;
  patient_id: string;
  assessment_date: string;
  assessed_by: string;
  morse_score?: number;
  fall_risk_level?: string;
  berg_score?: number;
  tug_time?: number;
  meem_score?: number;
  cognitive_status?: string;
  gds_score?: number;
  depression_risk?: string;
  katz_score?: number;
  independence_level?: string;
  lawton_score?: number;
  mna_score?: number;
  nutritional_status?: string;
  overall_assessment: string;
  recommendations: string[];
  intervention_plan: string;
  next_assessment_date?: string;
  created_at: string;
  updated_at: string;
}

export interface FallPreventionPlan {
  id: string;
  patient_id: string;
  assessment_id?: string;
  plan_date: string;
  created_by: string;
  environmental_modifications: string[];
  assistive_devices: string[];
  exercise_program: string;
  medication_review_needed: boolean;
  vision_assessment_needed: boolean;
  goals: string[];
  timeline: string;
  status: string;
  review_date?: string;
  effectiveness_rating?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class GeriatricServiceSupabase {
  /**
   * Buscar avaliações geriátricas de um paciente
   */
  async getAssessments(patientId: string): Promise<GeriatricAssessment[]> {
    const { data, error } = await supabase
      .from('geriatric_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('assessment_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar última avaliação geriátrica
   */
  async getLatestAssessment(patientId: string): Promise<GeriatricAssessment | null> {
    const { data, error } = await supabase
      .from('geriatric_assessments')
      .select('*')
      .eq('patient_id', patientId)
      .order('assessment_date', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  /**
   * Criar nova avaliação geriátrica
   */
  async createAssessment(assessment: Partial<GeriatricAssessment>): Promise<GeriatricAssessment> {
    // Calcular fall risk level baseado no Morse score
    if (assessment.morse_score) {
      assessment.fall_risk_level = this.calculateMorseFallRisk(assessment.morse_score);
    }

    // Calcular TUG risk level
    if (assessment.tug_time) {
      assessment.tug_risk_level = this.calculateTUGRisk(assessment.tug_time);
    }

    // Calcular cognitive status baseado no MEEM
    if (assessment.meem_score) {
      assessment.cognitive_status = this.calculateCognitiveStatus(assessment.meem_score);
    }

    const { data, error } = await supabase
      .from('geriatric_assessments')
      .insert(assessment)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar avaliação existente
   */
  async updateAssessment(
    id: string,
    updates: Partial<GeriatricAssessment>
  ): Promise<GeriatricAssessment> {
    const { data, error } = await supabase
      .from('geriatric_assessments')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar avaliação
   */
  async deleteAssessment(id: string): Promise<void> {
    const { error } = await supabase
      .from('geriatric_assessments')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Buscar planos de prevenção de quedas
   */
  async getFallPreventionPlans(patientId: string): Promise<FallPreventionPlan[]> {
    const { data, error } = await supabase
      .from('fall_prevention_plans')
      .select('*')
      .eq('patient_id', patientId)
      .order('plan_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Criar plano de prevenção de quedas
   */
  async createFallPreventionPlan(plan: Partial<FallPreventionPlan>): Promise<FallPreventionPlan> {
    const { data, error } = await supabase
      .from('fall_prevention_plans')
      .insert(plan)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar sessões de treino cognitivo
   */
  async getCognitiveTrainingSessions(patientId: string, limit: number = 20) {
    const { data, error } = await supabase
      .from('cognitive_training_sessions')
      .select('*')
      .eq('patient_id', patientId)
      .order('session_date', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  }

  /**
   * Adicionar sessão de treino cognitivo
   */
  async addCognitiveSession(session: any) {
    const { data, error } = await supabase
      .from('cognitive_training_sessions')
      .insert(session)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar pacientes geriátricos de alto risco
   */
  async getHighRiskPatients() {
    const { data, error } = await supabase
      .from('high_risk_elderly_patients')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  /**
   * Calcular risco de queda pela Escala de Morse
   */
  private calculateMorseFallRisk(score: number): string {
    if (score >= 45) return 'high_risk';
    if (score >= 25) return 'moderate_risk';
    if (score > 0) return 'low_risk';
    return 'no_risk';
  }

  /**
   * Calcular risco pelo TUG (Timed Up and Go)
   */
  private calculateTUGRisk(time: number): string {
    if (time >= 20) return 'high_risk';
    if (time >= 14) return 'moderate_risk';
    if (time >= 10) return 'low_risk';
    return 'no_risk';
  }

  /**
   * Interpretar score do MEEM (Mini Exame Estado Mental)
   */
  private calculateCognitiveStatus(score: number): string {
    if (score >= 24) return 'normal';
    if (score >= 18) return 'mild_impairment';
    if (score >= 10) return 'moderate_impairment';
    return 'severe_impairment';
  }
}

export const geriatricServiceSupabase = new GeriatricServiceSupabase();









