/**
 * Geriatric Care Service - Supabase Implementation
 * Serviço para módulo de cuidados geriátricos
 */
import { supabase } from '../../lib/supabase';
class GeriatricServiceSupabase {
    /**
     * Buscar avaliações geriátricas de um paciente
     */
    async getAssessments(patientId) {
        const { data, error } = await supabase
            .from('geriatric_assessments')
            .select('*')
            .eq('patient_id', patientId)
            .order('assessment_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Buscar última avaliação geriátrica
     */
    async getLatestAssessment(patientId) {
        const { data, error } = await supabase
            .from('geriatric_assessments')
            .select('*')
            .eq('patient_id', patientId)
            .order('assessment_date', { ascending: false })
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        return data;
    }
    /**
     * Criar nova avaliação geriátrica
     */
    async createAssessment(assessment) {
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
        if (error)
            throw error;
        return data;
    }
    /**
     * Atualizar avaliação existente
     */
    async updateAssessment(id, updates) {
        const { data, error } = await supabase
            .from('geriatric_assessments')
            .update(updates)
            .eq('id', id)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Deletar avaliação
     */
    async deleteAssessment(id) {
        const { error } = await supabase
            .from('geriatric_assessments')
            .delete()
            .eq('id', id);
        if (error)
            throw error;
    }
    /**
     * Buscar planos de prevenção de quedas
     */
    async getFallPreventionPlans(patientId) {
        const { data, error } = await supabase
            .from('fall_prevention_plans')
            .select('*')
            .eq('patient_id', patientId)
            .order('plan_date', { ascending: false });
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Criar plano de prevenção de quedas
     */
    async createFallPreventionPlan(plan) {
        const { data, error } = await supabase
            .from('fall_prevention_plans')
            .insert(plan)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Buscar sessões de treino cognitivo
     */
    async getCognitiveTrainingSessions(patientId, limit = 20) {
        const { data, error } = await supabase
            .from('cognitive_training_sessions')
            .select('*')
            .eq('patient_id', patientId)
            .order('session_date', { ascending: false })
            .limit(limit);
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Adicionar sessão de treino cognitivo
     */
    async addCognitiveSession(session) {
        const { data, error } = await supabase
            .from('cognitive_training_sessions')
            .insert(session)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Buscar pacientes geriátricos de alto risco
     */
    async getHighRiskPatients() {
        const { data, error } = await supabase
            .from('high_risk_elderly_patients')
            .select('*');
        if (error)
            throw error;
        return data || [];
    }
    /**
     * Calcular risco de queda pela Escala de Morse
     */
    calculateMorseFallRisk(score) {
        if (score >= 45)
            return 'high_risk';
        if (score >= 25)
            return 'moderate_risk';
        if (score > 0)
            return 'low_risk';
        return 'no_risk';
    }
    /**
     * Calcular risco pelo TUG (Timed Up and Go)
     */
    calculateTUGRisk(time) {
        if (time >= 20)
            return 'high_risk';
        if (time >= 14)
            return 'moderate_risk';
        if (time >= 10)
            return 'low_risk';
        return 'no_risk';
    }
    /**
     * Interpretar score do MEEM (Mini Exame Estado Mental)
     */
    calculateCognitiveStatus(score) {
        if (score >= 24)
            return 'normal';
        if (score >= 18)
            return 'mild_impairment';
        if (score >= 10)
            return 'moderate_impairment';
        return 'severe_impairment';
    }
}
export const geriatricServiceSupabase = new GeriatricServiceSupabase();
