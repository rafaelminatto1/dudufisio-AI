/**
 * Symptom Tracker Service - Supabase Implementation
 * Serviço para rastreamento avançado de sintomas
 */

import { supabase } from '../../lib/supabase';

export interface SymptomEntry {
  id: string;
  patient_id: string;
  diary_date: string;
  diary_time: string;
  symptom_type: string;
  symptom_description: string;
  severity: string;
  intensity: number;
  pain_location?: string;
  pain_quality?: string[];
  pain_radiation?: boolean;
  duration_minutes?: number;
  frequency?: string;
  triggering_factors?: string[];
  relieving_factors?: string[];
  activity_at_onset?: string;
  mood_state?: string;
  medication_taken?: string;
  medication_effective?: boolean;
  impact_on_function?: number;
  impact_on_sleep?: number;
  notes?: string;
  created_at: string;
}

export interface SymptomCorrelation {
  id: string;
  patient_id: string;
  correlation_type: string;
  primary_symptom: string;
  correlated_factor: string;
  correlation_coefficient: number;
  strength: string;
  direction: string;
  insights: string;
  recommendations: string[];
  confidence_level: number;
  created_at: string;
}

class SymptomTrackerServiceSupabase {
  /**
   * Buscar entradas do diário de sintomas
   */
  async getSymptomEntries(
    patientId: string,
    startDate?: string,
    endDate?: string
  ): Promise<SymptomEntry[]> {
    let query = supabase
      .from('symptom_diary')
      .select('*')
      .eq('patient_id', patientId)
      .order('diary_date', { ascending: false })
      .order('diary_time', { ascending: false });

    if (startDate) {
      query = query.gte('diary_date', startDate);
    }
    if (endDate) {
      query = query.lte('diary_date', endDate);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  }

  /**
   * Adicionar entrada no diário
   */
  async addSymptomEntry(entry: Partial<SymptomEntry>): Promise<SymptomEntry> {
    const { data, error } = await supabase
      .from('symptom_diary')
      .insert(entry)
      .select()
      .single();

    if (error) throw error;

    // Analisar se precisa criar alerta
    await this.checkForAlerts(data);

    return data;
  }

  /**
   * Atualizar entrada
   */
  async updateSymptomEntry(id: string, updates: Partial<SymptomEntry>): Promise<SymptomEntry> {
    const { data, error } = await supabase
      .from('symptom_diary')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Deletar entrada
   */
  async deleteSymptomEntry(id: string): Promise<void> {
    const { error } = await supabase
      .from('symptom_diary')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  /**
   * Buscar tendências de sintomas (últimos 7 dias)
   */
  async getSymptomTrends(patientId: string) {
    const { data, error } = await supabase
      .from('symptom_trends_7d')
      .select('*')
      .eq('patient_id', patientId)
      .order('day', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar correlações identificadas
   */
  async getCorrelations(patientId: string): Promise<SymptomCorrelation[]> {
    const { data, error } = await supabase
      .from('symptom_correlations')
      .select('*')
      .eq('patient_id', patientId)
      .order('correlation_coefficient', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar alertas de sintomas
   */
  async getSymptomAlerts(patientId: string) {
    const { data, error } = await supabase
      .from('symptom_alerts')
      .select('*')
      .eq('patient_id', patientId)
      .eq('acknowledged', false)
      .order('triggered_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Buscar padrões identificados
   */
  async getSymptomPatterns(patientId: string) {
    const { data, error } = await supabase
      .from('symptom_patterns')
      .select('*')
      .eq('patient_id', patientId)
      .order('clinical_significance', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Verificar se precisa criar alertas
   */
  private async checkForAlerts(entry: SymptomEntry) {
    // Alerta se intensidade muito alta
    if (entry.intensity >= 8) {
      await supabase.from('symptom_alerts').insert({
        patient_id: entry.patient_id,
        alert_type: 'severity_threshold',
        symptom_type: entry.symptom_type,
        alert_message: `Sintoma de alta intensidade registrado (${entry.intensity}/10)`,
        severity: entry.intensity >= 9 ? 'critical' : 'urgent',
        supporting_data: { entry_id: entry.id, intensity: entry.intensity },
      });
    }

    // Detectar tendência de piora (função do banco)
    const { data } = await supabase.rpc('detect_worsening_trend', {
      p_patient_id: entry.patient_id,
      p_symptom_type: entry.symptom_type,
      p_days: 7,
    });

    if (data === true) {
      await supabase.from('symptom_alerts').insert({
        patient_id: entry.patient_id,
        alert_type: 'worsening_trend',
        symptom_type: entry.symptom_type,
        alert_message: 'Tendência de piora detectada nos últimos 7 dias',
        severity: 'warning',
        supporting_data: { analysis_period: '7days' },
      });
    }
  }

  /**
   * Marcar alerta como reconhecido
   */
  async acknowledgeAlert(alertId: string, acknowledgedBy: string) {
    const { data, error } = await supabase
      .from('symptom_alerts')
      .update({
        acknowledged: true,
        acknowledged_by: acknowledgedBy,
        acknowledged_at: new Date().toISOString(),
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}

export const symptomTrackerServiceSupabase = new SymptomTrackerServiceSupabase();








