/**
 * Mental Health Service - Supabase Implementation
 * Serviço para integração com saúde mental
 */
import { supabase } from '../../lib/supabase';
class MentalHealthServiceSupabase {
    /**
     * Buscar triagens de saúde mental
     */
    async getScreenings(patientId) {
        const { data, error } = await supabase
            .from('mental_health_screenings')
            .select('*')
            .eq('patient_id', patientId)
            .order('screening_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Criar nova triagem
     */
    async createScreening(screening) {
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
        if (error)
            throw error;
        return data;
    }
    /**
     * Buscar encaminhamentos
     */
    async getReferrals(patientId) {
        const { data, error } = await supabase
            .from('mental_health_referrals')
            .select('*')
            .eq('patient_id', patientId)
            .order('referral_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Criar encaminhamento
     */
    async createReferral(referral) {
        const { data, error } = await supabase
            .from('mental_health_referrals')
            .insert(referral)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Atualizar status de encaminhamento
     */
    async updateReferralStatus(id, status, updates) {
        const { data, error } = await supabase
            .from('mental_health_referrals')
            .update({ status, ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Buscar alertas ativos de saúde mental
     */
    async getActiveAlerts(patientId) {
        let query = supabase
            .from('mental_health_alerts')
            .select('*')
            .eq('status', 'active')
            .order('triggered_at', { ascending: false });
        if (patientId) {
            query = query.eq('patient_id', patientId);
        }
        const { data, error } = await query;
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Buscar pacientes que precisam de atenção
     */
    async getPriorityPatients() {
        const { data, error } = await supabase
            .from('patients_mental_health_priority')
            .select('*');
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Interpretar HAD Anxiety Score
     */
    interpretHADAnxiety(score) {
        if (score >= 15)
            return 'severe';
        if (score >= 11)
            return 'moderate';
        if (score >= 8)
            return 'mild';
        return 'minimal';
    }
    /**
     * Interpretar HAD Depression Score
     */
    interpretHADDepression(score) {
        if (score >= 15)
            return 'severe';
        if (score >= 11)
            return 'moderate';
        if (score >= 8)
            return 'mild';
        return 'minimal';
    }
    /**
     * Interpretar PHQ-9 Score
     */
    interpretPHQ9(score) {
        if (score >= 20)
            return 'severe';
        if (score >= 15)
            return 'moderately_severe';
        if (score >= 10)
            return 'moderate';
        if (score >= 5)
            return 'mild';
        return 'minimal';
    }
    /**
     * Interpretar GAD-7 Score
     */
    interpretGAD7(score) {
        if (score >= 15)
            return 'severe';
        if (score >= 10)
            return 'moderate';
        if (score >= 5)
            return 'mild';
        return 'minimal';
    }
    /**
     * Determinar se precisa de encaminhamento
     */
    needsReferral(screening) {
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
    determineUrgency(screening) {
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
