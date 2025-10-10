/**
 * Mental Health Service - Supabase Implementation
 * Serviço para integração com saúde mental
 */

import { supabase } from '../../lib/supabase';

export interface MentalHealthScreening {
  id: string;
  patient_id: string;
  screening_date: string;
  scale_used: string;
  had_anxiety_score?: number;
  had_depression_score?: number;
  phq9_score?: number;
  gad7_score?: number;
  pss_score?: number;
  who5_score?: number;
  anxiety_level?: string;
  depression_level?: string;
  overall_wellbeing?: string;
  requires_referral: boolean;
  referral_urgency?: string;
  screened_by: string;
  notes?: string;
  created_at: string;
}

export interface MentalHealthReferral {
  id: string;
  patient_id: string;
  screening_id?: string;
  referral_date: string;
  referred_by: string;
  referral_type: string;
  urgency: string;
  reason: string;
  clinical_summary: string;
  professional_name?: string;
  professional_contact?: string;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  outcome?: string;
  follow_up_plan?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

class MentalHealthServiceSupabase {
  /**
   * Buscar triagens de saúde mental
   */
  async getScreenings(patientId: string): Promise<MentalHealthScreening[]> {
    const { data, error } = await supabase
      .from('mental_health_screenings')
      .select('*')
      .eq('patient_id', patientId)
      .order('screening_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Criar nova triagem
   */
  async createScreening(screening: Partial<MentalHealthScreening>): Promise<MentalHealthScreening> {
    // Calcular níveis baseados nos scores
    if (screening.had_anxiety_score !== undefined) {
      screening.anxiety_level = this.interpretHADAnxiety(screening.had_anxiety_score);
    }

    if (screening.had_depression_score !== undefined) {
      screening.depression_level = this.interpretHADDepression(screening.had_depression_score);
    }

    if (screening.phq9_score !== undefined) {
      screening.depression_level = this.interpretPHQ9(screening.phq9_score);
    }

    if (screening.gad7_score !== undefined) {
      screening.anxiety_level = this.interpretGAD7(screening.gad7_score);
    }

    // Determinar necessidade de encaminhamento
    screening.requires_referral = this.needsReferral(screening);
    
    if (screening.requires_referral) {
      screening.referral_urgency = this.determineUrgency(screening);
    }

    const { data, error } = await supabase
      .from('mental_health_screenings')
      .insert(screening)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar encaminhamentos
   */
  async getReferrals(patientId: string): Promise<MentalHealthReferral[]> {
    const { data, error } = await supabase
      .from('mental_health_referrals')
      .select('*')
      .eq('patient_id', patientId)
      .order('referral_date', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Criar encaminhamento
   */
  async createReferral(referral: Partial<MentalHealthReferral>): Promise<MentalHealthReferral> {
    const { data, error } = await supabase
      .from('mental_health_referrals')
      .insert(referral)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Atualizar status de encaminhamento
   */
  async updateReferralStatus(id: string, status: string, updates?: any): Promise<MentalHealthReferral> {
    const { data, error } = await supabase
      .from('mental_health_referrals')
      .update({ status, ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Buscar alertas ativos de saúde mental
   */
  async getActiveAlerts(patientId?: string) {
    let query = supabase
      .from('mental_health_alerts')
      .select('*')
      .eq('status', 'active')
      .order('triggered_at', { ascending: false });

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar pacientes que precisam de atenção
   */
  async getPriorityPatients() {
    const { data, error } = await supabase
      .from('patients_mental_health_priority')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  /**
   * Interpretar HAD Anxiety Score
   */
  private interpretHADAnxiety(score: number): string {
    if (score >= 15) return 'severe';
    if (score >= 11) return 'moderate';
    if (score >= 8) return 'mild';
    return 'minimal';
  }

  /**
   * Interpretar HAD Depression Score
   */
  private interpretHADDepression(score: number): string {
    if (score >= 15) return 'severe';
    if (score >= 11) return 'moderate';
    if (score >= 8) return 'mild';
    return 'minimal';
  }

  /**
   * Interpretar PHQ-9 Score
   */
  private interpretPHQ9(score: number): string {
    if (score >= 20) return 'severe';
    if (score >= 15) return 'moderately_severe';
    if (score >= 10) return 'moderate';
    if (score >= 5) return 'mild';
    return 'minimal';
  }

  /**
   * Interpretar GAD-7 Score
   */
  private interpretGAD7(score: number): string {
    if (score >= 15) return 'severe';
    if (score >= 10) return 'moderate';
    if (score >= 5) return 'mild';
    return 'minimal';
  }

  /**
   * Determinar se precisa de encaminhamento
   */
  private needsReferral(screening: Partial<MentalHealthScreening>): boolean {
    // Encaminhar se scores indicam severidade moderada ou maior
    if (screening.anxiety_level && ['moderate', 'moderately_severe', 'severe'].includes(screening.anxiety_level)) {
      return true;
    }
    if (screening.depression_level && ['moderate', 'moderately_severe', 'severe'].includes(screening.depression_level)) {
      return true;
    }
    return false;
  }

  /**
   * Determinar urgência do encaminhamento
   */
  private determineUrgency(screening: Partial<MentalHealthScreening>): string {
    if (screening.anxiety_level === 'severe' || screening.depression_level === 'severe') {
      return 'urgent';
    }
    if (screening.anxiety_level === 'moderately_severe' || screening.depression_level === 'moderately_severe') {
      return 'urgent';
    }
    return 'routine';
  }
}

export const mentalHealthServiceSupabase = new MentalHealthServiceSupabase();












