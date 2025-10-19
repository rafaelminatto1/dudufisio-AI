/**
 * Risk Stratification Service - Supabase Integration
 * Serviço de Estratificação de Risco com Integração Real ao Supabase
 */
import { supabase } from '../../lib/supabaseClient';
class RiskStratificationServiceSupabase {
    /**
     * Salva uma avaliação de risco no banco
     */
    async saveRiskAssessment(assessment) {
        const { data, error } = await supabase
            .from('risk_assessments')
            .insert({
            patient_id: assessment.patientId,
            patient_name: assessment.patientName,
            risk_type: assessment.riskType,
            risk_level: assessment.riskLevel,
            score: assessment.score,
            confidence: assessment.confidence,
            assessed_at: assessment.assessedAt.toISOString(),
            assessed_by: assessment.assessedBy,
            valid_until: assessment.validUntil.toISOString(),
            previous_score: assessment.previousScore,
            trend: assessment.trend,
            notes: assessment.notes,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar avaliação de risco:', error);
            throw error;
        }
        // Salvar fatores de risco
        if (assessment.factors && assessment.factors.length > 0) {
            await this.saveRiskFactors(data.id, assessment.factors);
        }
        // Salvar recomendações
        if (assessment.recommendations && assessment.recommendations.length > 0) {
            await this.saveRecommendations(data.id, assessment.recommendations);
        }
        return this.mapDatabaseToAssessment(data);
    }
    /**
     * Salva fatores de risco
     */
    async saveRiskFactors(assessmentId, factors) {
        const factorsToInsert = factors.map(factor => ({
            assessment_id: assessmentId,
            name: factor.name,
            category: factor.category,
            value: factor.value,
            weight: factor.weight,
            contribution: factor.contribution,
            description: factor.description,
            is_modifiable: factor.isModifiable,
        }));
        const { error } = await supabase
            .from('risk_factors')
            .insert(factorsToInsert);
        if (error) {
            console.error('Erro ao salvar fatores de risco:', error);
            throw error;
        }
    }
    /**
     * Salva recomendações
     */
    async saveRecommendations(assessmentId, recommendations) {
        const recommendationsToInsert = recommendations.map(rec => ({
            assessment_id: assessmentId,
            priority: rec.priority,
            action: rec.action,
            rationale: rec.rationale,
            target_factors: rec.targetFactors,
            estimated_impact: rec.estimatedImpact,
            category: rec.category,
            assigned_to: rec.assignedTo,
            due_date: rec.dueDate?.toISOString(),
            completed: rec.completed,
            completed_at: rec.completedAt?.toISOString(),
            completed_by: rec.completedBy,
        }));
        const { error } = await supabase
            .from('risk_recommendations')
            .insert(recommendationsToInsert);
        if (error) {
            console.error('Erro ao salvar recomendações:', error);
            throw error;
        }
    }
    /**
     * Busca avaliações de risco de um paciente
     */
    async getPatientAssessments(patientId, riskType) {
        let query = supabase
            .from('risk_assessments')
            .select(`
        *,
        risk_factors (*),
        risk_recommendations (*)
      `)
            .eq('patient_id', patientId)
            .order('assessed_at', { ascending: false });
        if (riskType) {
            query = query.eq('risk_type', riskType);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar avaliações de risco:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToAssessment);
    }
    /**
     * Busca perfil de risco completo do paciente
     */
    async getPatientRiskProfile(patientId) {
        const { data, error } = await supabase
            .from('risk_profiles')
            .select('*')
            .eq('patient_id', patientId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                // Não encontrado - retornar null
                return null;
            }
            console.error('Erro ao buscar perfil de risco:', error);
            throw error;
        }
        // Buscar avaliações associadas
        const assessments = await this.getPatientAssessments(patientId);
        return {
            patientId: data.patient_id,
            assessments,
            overallRiskLevel: data.overall_risk_level,
            highestRisks: data.highest_risks,
            lastAssessmentDate: new Date(data.last_assessment_date),
            nextAssessmentDue: new Date(data.next_assessment_due),
        };
    }
    /**
     * Cria ou atualiza perfil de risco
     */
    async upsertRiskProfile(profile) {
        const { error } = await supabase
            .from('risk_profiles')
            .upsert({
            patient_id: profile.patientId,
            overall_risk_level: profile.overallRiskLevel,
            highest_risks: profile.highestRisks,
            last_assessment_date: profile.lastAssessmentDate.toISOString(),
            next_assessment_due: profile.nextAssessmentDue.toISOString(),
        });
        if (error) {
            console.error('Erro ao salvar perfil de risco:', error);
            throw error;
        }
    }
    /**
     * Cria alerta de risco
     */
    async createRiskAlert(alert) {
        const { data, error } = await supabase
            .from('risk_alerts')
            .insert({
            patient_id: alert.patientId,
            patient_name: alert.patientName,
            assessment_id: alert.assessmentId,
            risk_type: alert.riskType,
            risk_level: alert.riskLevel,
            score: alert.score,
            triggered_at: alert.triggeredAt.toISOString(),
            acknowledged: alert.acknowledged,
            acknowledged_by: alert.acknowledgedBy,
            acknowledged_at: alert.acknowledgedAt?.toISOString(),
            resolved: alert.resolved,
            resolved_at: alert.resolvedAt?.toISOString(),
            resolved_by: alert.resolvedBy,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao criar alerta de risco:', error);
            throw error;
        }
        return this.mapDatabaseToAlert(data);
    }
    /**
     * Busca alertas ativos
     */
    async getActiveAlerts(patientId) {
        let query = supabase
            .from('risk_alerts')
            .select('*')
            .eq('resolved', false)
            .order('triggered_at', { ascending: false });
        if (patientId) {
            query = query.eq('patient_id', patientId);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar alertas:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToAlert);
    }
    /**
     * Marca alerta como reconhecido
     */
    async acknowledgeAlert(alertId, acknowledgedBy) {
        const { error } = await supabase
            .from('risk_alerts')
            .update({
            acknowledged: true,
            acknowledged_by: acknowledgedBy,
            acknowledged_at: new Date().toISOString(),
        })
            .eq('id', alertId);
        if (error) {
            console.error('Erro ao reconhecer alerta:', error);
            throw error;
        }
    }
    /**
     * Marca alerta como resolvido
     */
    async resolveAlert(alertId, resolvedBy) {
        const { error } = await supabase
            .from('risk_alerts')
            .update({
            resolved: true,
            resolved_by: resolvedBy,
            resolved_at: new Date().toISOString(),
        })
            .eq('id', alertId);
        if (error) {
            console.error('Erro ao resolver alerta:', error);
            throw error;
        }
    }
    /**
     * Busca pacientes de alto risco
     */
    async getHighRiskPatients(riskLevel) {
        let query = supabase
            .from('risk_profiles')
            .select(`
        *,
        patients (
          id,
          full_name,
          email,
          phone,
          birth_date
        )
      `);
        if (riskLevel) {
            query = query.eq('overall_risk_level', riskLevel);
        }
        else {
            query = query.in('overall_risk_level', ['high', 'critical']);
        }
        query = query.order('last_assessment_date', { ascending: false });
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar pacientes de alto risco:', error);
            throw error;
        }
        return data;
    }
    /**
     * Busca estatísticas de risco
     */
    async getRiskStatistics(startDate, endDate) {
        let query = supabase
            .from('risk_assessments')
            .select('risk_type, risk_level, score, assessed_at');
        if (startDate) {
            query = query.gte('assessed_at', startDate.toISOString());
        }
        if (endDate) {
            query = query.lte('assessed_at', endDate.toISOString());
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar estatísticas:', error);
            throw error;
        }
        // Calcular estatísticas
        const stats = {
            totalAssessments: data.length,
            byRiskLevel: {
                low: data.filter(a => a.risk_level === 'low').length,
                moderate: data.filter(a => a.risk_level === 'moderate').length,
                high: data.filter(a => a.risk_level === 'high').length,
                critical: data.filter(a => a.risk_level === 'critical').length,
            },
            byRiskType: {},
            averageScore: data.reduce((sum, a) => sum + a.score, 0) / data.length || 0,
        };
        // Contar por tipo
        data.forEach(a => {
            stats.byRiskType[a.risk_type] = (stats.byRiskType[a.risk_type] || 0) + 1;
        });
        return stats;
    }
    /**
     * Mapeia dados do banco para RiskAssessment
     */
    mapDatabaseToAssessment(data) {
        return {
            id: data.id,
            patientId: data.patient_id,
            patientName: data.patient_name,
            riskType: data.risk_type,
            riskLevel: data.risk_level,
            score: parseFloat(data.score),
            confidence: parseFloat(data.confidence),
            assessedAt: new Date(data.assessed_at),
            assessedBy: data.assessed_by,
            validUntil: new Date(data.valid_until),
            previousScore: data.previous_score ? parseFloat(data.previous_score) : undefined,
            trend: data.trend,
            notes: data.notes,
            factors: data.risk_factors?.map((f) => this.mapDatabaseToFactor(f)) || [],
            recommendations: data.risk_recommendations?.map((r) => this.mapDatabaseToRecommendation(r)) || [],
        };
    }
    /**
     * Mapeia dados do banco para RiskFactor
     */
    mapDatabaseToFactor(data) {
        return {
            id: data.id,
            name: data.name,
            category: data.category,
            value: data.value,
            weight: parseFloat(data.weight),
            contribution: parseFloat(data.contribution),
            description: data.description,
            isModifiable: data.is_modifiable,
        };
    }
    /**
     * Mapeia dados do banco para RiskRecommendation
     */
    mapDatabaseToRecommendation(data) {
        return {
            id: data.id,
            priority: data.priority,
            action: data.action,
            rationale: data.rationale,
            targetFactors: data.target_factors,
            estimatedImpact: data.estimated_impact,
            category: data.category,
            assignedTo: data.assigned_to,
            dueDate: data.due_date ? new Date(data.due_date) : undefined,
            completed: data.completed,
            completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
            completedBy: data.completed_by,
        };
    }
    /**
     * Mapeia dados do banco para RiskAlert
     */
    mapDatabaseToAlert(data) {
        return {
            id: data.id,
            patientId: data.patient_id,
            patientName: data.patient_name,
            assessmentId: data.assessment_id,
            riskType: data.risk_type,
            riskLevel: data.risk_level,
            score: parseFloat(data.score),
            triggeredAt: new Date(data.triggered_at),
            acknowledged: data.acknowledged,
            acknowledgedBy: data.acknowledged_by,
            acknowledgedAt: data.acknowledged_at ? new Date(data.acknowledged_at) : undefined,
            resolved: data.resolved,
            resolvedAt: data.resolved_at ? new Date(data.resolved_at) : undefined,
            resolvedBy: data.resolved_by,
            actions: [], // TODO: buscar actions se necessário
        };
    }
}
export const riskStratificationServiceSupabase = new RiskStratificationServiceSupabase();
