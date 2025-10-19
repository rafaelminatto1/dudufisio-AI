/**
 * Sports Rehabilitation Service - Supabase Integration
 * Serviço de Reabilitação Esportiva com Integração Real ao Supabase
 */
import { supabase } from '../../lib/supabaseClient';
class SportsRehabServiceSupabase {
    /**
     * Cria ou atualiza perfil de atleta
     */
    async upsertAthleteProfile(profile) {
        const { data, error } = await supabase
            .from('athlete_profiles')
            .upsert({
            patient_id: profile.patientId,
            sport_type: profile.sportType,
            position: profile.position,
            competition_level: profile.competitionLevel,
            years_practicing: profile.yearsPracticing,
            hours_per_week: profile.hoursPerWeek,
            competition_frequency: profile.competitionFrequency,
            dominant_side: profile.dominantSide,
            current_phase: profile.currentPhase,
            target_return_date: profile.targetReturnDate?.toISOString(),
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar perfil de atleta:', error);
            throw error;
        }
        return this.mapDatabaseToAthleteProfile(data);
    }
    /**
     * Busca perfil de atleta por ID do paciente
     */
    async getAthleteProfile(patientId) {
        const { data, error } = await supabase
            .from('athlete_profiles')
            .select('*')
            .eq('patient_id', patientId)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Erro ao buscar perfil de atleta:', error);
            throw error;
        }
        return this.mapDatabaseToAthleteProfile(data);
    }
    /**
     * Salva critérios de retorno ao esporte
     */
    async saveReturnToSportCriteria(criteria) {
        const { data, error } = await supabase
            .from('return_to_sport_criteria')
            .insert({
            athlete_id: criteria.athleteId,
            assessment_date: criteria.assessmentDate.toISOString().split('T')[0],
            assessed_by: criteria.assessedBy,
            pain_level: criteria.painLevel,
            swelling_present: criteria.swellingPresent,
            overall_score: criteria.overallScore,
            clearance_status: criteria.clearanceStatus,
            notes: criteria.notes,
            approved: criteria.approved,
            approved_by: criteria.approvedBy,
            approved_at: criteria.approvedAt?.toISOString(),
            next_assessment_date: criteria.nextAssessmentDate?.toISOString().split('T')[0],
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar critérios RTS:', error);
            throw error;
        }
        return this.mapDatabaseToRTSCriteria(data);
    }
    /**
     * Busca critérios de retorno ao esporte
     */
    async getReturnToSportCriteria(athleteId) {
        const { data, error } = await supabase
            .from('return_to_sport_criteria')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('assessment_date', { ascending: false });
        if (error) {
            console.error('Erro ao buscar critérios RTS:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToRTSCriteria);
    }
    /**
     * Salva teste funcional
     */
    async saveFunctionalTest(test) {
        const { data, error } = await supabase
            .from('functional_tests')
            .insert({
            rts_criteria_id: test.rtsCriteriaId,
            test_name: test.testName,
            category: test.category,
            description: test.description,
            affected_side: test.affectedSide,
            unaffected_side: test.unaffectedSide,
            symmetry_index: test.symmetryIndex,
            score: test.score,
            unit: test.unit,
            compared_to_norm: test.comparedToNorm,
            passed_criteria: test.passedCriteria,
            criteria_threshold: test.criteriaThreshold,
            test_date: test.testDate.toISOString().split('T')[0],
            video_url: test.videoUrl,
            notes: test.notes,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar teste funcional:', error);
            throw error;
        }
        return this.mapDatabaseToFunctionalTest(data);
    }
    /**
     * Busca testes funcionais
     */
    async getFunctionalTests(rtsCriteriaId) {
        const { data, error } = await supabase
            .from('functional_tests')
            .select('*')
            .eq('rts_criteria_id', rtsCriteriaId)
            .order('test_date', { ascending: false });
        if (error) {
            console.error('Erro ao buscar testes funcionais:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToFunctionalTest);
    }
    /**
     * Salva métrica de desempenho
     */
    async savePerformanceMetric(metric) {
        const { data, error } = await supabase
            .from('performance_metrics')
            .insert({
            athlete_id: metric.athleteId,
            metric_type: metric.metricType,
            metric_name: metric.metricName,
            value: metric.value,
            unit: metric.unit,
            metric_date: metric.metricDate.toISOString().split('T')[0],
            context: metric.context,
            compared_to_baseline: metric.comparedToBaseline,
            compared_to_norm: metric.comparedToNorm,
            trend: metric.trend,
            notes: metric.notes,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar métrica de desempenho:', error);
            throw error;
        }
        return this.mapDatabaseToPerformanceMetric(data);
    }
    /**
     * Busca métricas de desempenho
     */
    async getPerformanceMetrics(athleteId, metricType) {
        let query = supabase
            .from('performance_metrics')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('metric_date', { ascending: false });
        if (metricType) {
            query = query.eq('metric_type', metricType);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar métricas:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToPerformanceMetric);
    }
    /**
     * Salva monitoramento de carga
     */
    async saveLoadMonitoring(load) {
        const { data, error } = await supabase
            .from('load_monitoring')
            .upsert({
            athlete_id: load.athleteId,
            week_year: load.weekYear,
            total_load: load.totalLoad,
            average_load: load.averageLoad,
            acute_load: load.acuteLoad,
            chronic_load: load.chronicLoad,
            acwr: load.acwr,
            monotony: load.monotony,
            strain: load.strain,
            risk_level: load.riskLevel,
            recommendations: load.recommendations,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar monitoramento de carga:', error);
            throw error;
        }
        return this.mapDatabaseToLoadMonitoring(data);
    }
    /**
     * Busca monitoramento de carga
     */
    async getLoadMonitoring(athleteId, weeks) {
        let query = supabase
            .from('load_monitoring')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('week_year', { ascending: false });
        if (weeks) {
            query = query.limit(weeks);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar monitoramento de carga:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToLoadMonitoring);
    }
    /**
     * Atualiza progressão da reabilitação
     */
    async updateRehabProgression(progression) {
        const { data, error } = await supabase
            .from('rehab_progressions')
            .upsert({
            id: progression.id,
            athlete_id: progression.athleteId,
            current_phase: progression.currentPhase,
            phase_start_date: progression.phaseStartDate.toISOString().split('T')[0],
            estimated_phase_completion: progression.estimatedPhaseCompletion?.toISOString().split('T')[0],
            overall_progress: progression.overallProgress,
            estimated_return_date: progression.estimatedReturnDate?.toISOString().split('T')[0],
            notes: progression.notes,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao atualizar progressão:', error);
            throw error;
        }
        return this.mapDatabaseToRehabProgression(data);
    }
    /**
     * Busca progressão da reabilitação
     */
    async getRehabProgression(athleteId) {
        const { data, error } = await supabase
            .from('rehab_progressions')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
        if (error) {
            if (error.code === 'PGRST116') {
                return null;
            }
            console.error('Erro ao buscar progressão:', error);
            throw error;
        }
        return this.mapDatabaseToRehabProgression(data);
    }
    /**
     * Salva sessão de treinamento
     */
    async saveTrainingSession(session) {
        const { data, error } = await supabase
            .from('sport_training_sessions')
            .insert({
            athlete_id: session.athleteId,
            session_date: session.sessionDate.toISOString().split('T')[0],
            session_type: session.sessionType,
            phase: session.phase,
            duration: session.duration,
            heart_rate_avg: session.heartRateAvg,
            heart_rate_max: session.heartRateMax,
            perceived_exertion: session.perceivedExertion,
            fatigue_level: session.fatigueLevel,
            pain_level: session.painLevel,
            performance_rating: session.performanceRating,
            objectives: session.objectives,
            objectives_achieved: session.objectivesAchieved,
            notes: session.notes,
            conducted_by: session.conductedBy,
        })
            .select()
            .single();
        if (error) {
            console.error('Erro ao salvar sessão de treinamento:', error);
            throw error;
        }
        return this.mapDatabaseToTrainingSession(data);
    }
    /**
     * Busca sessões de treinamento
     */
    async getTrainingSessions(athleteId, limit) {
        let query = supabase
            .from('sport_training_sessions')
            .select('*')
            .eq('athlete_id', athleteId)
            .order('session_date', { ascending: false });
        if (limit) {
            query = query.limit(limit);
        }
        const { data, error } = await query;
        if (error) {
            console.error('Erro ao buscar sessões:', error);
            throw error;
        }
        return data.map(this.mapDatabaseToTrainingSession);
    }
    /**
     * Busca estatísticas do atleta
     */
    async getAthleteStatistics(athleteId) {
        // Buscar métricas recentes
        const metrics = await this.getPerformanceMetrics(athleteId);
        // Buscar cargas recentes
        const loads = await this.getLoadMonitoring(athleteId, 4);
        // Buscar progressão
        const progression = await this.getRehabProgression(athleteId);
        // Buscar sessões recentes
        const sessions = await this.getTrainingSessions(athleteId, 10);
        return {
            totalSessions: sessions.length,
            averagePainLevel: sessions.reduce((sum, s) => sum + (s.painLevel || 0), 0) / sessions.length || 0,
            averageExertion: sessions.reduce((sum, s) => sum + (s.perceivedExertion || 0), 0) / sessions.length || 0,
            currentPhase: progression?.currentPhase,
            overallProgress: progression?.overallProgress,
            recentMetrics: metrics.slice(0, 5),
            recentLoads: loads,
        };
    }
    // ========== MAPPERS ==========
    mapDatabaseToAthleteProfile(data) {
        return {
            id: data.id,
            patientId: data.patient_id,
            sportType: data.sport_type,
            position: data.position,
            competitionLevel: data.competition_level,
            yearsPracticing: data.years_practicing,
            hoursPerWeek: parseFloat(data.hours_per_week),
            competitionFrequency: data.competition_frequency,
            dominantSide: data.dominant_side,
            currentPhase: data.current_phase,
            targetReturnDate: data.target_return_date ? new Date(data.target_return_date) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
    mapDatabaseToRTSCriteria(data) {
        return {
            id: data.id,
            athleteId: data.athlete_id,
            assessmentDate: new Date(data.assessment_date),
            assessedBy: data.assessed_by,
            painLevel: data.pain_level,
            swellingPresent: data.swelling_present,
            overallScore: parseFloat(data.overall_score),
            clearanceStatus: data.clearance_status,
            notes: data.notes,
            approved: data.approved,
            approvedBy: data.approved_by,
            approvedAt: data.approved_at ? new Date(data.approved_at) : undefined,
            nextAssessmentDate: data.next_assessment_date ? new Date(data.next_assessment_date) : undefined,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            romAssessment: undefined, // TODO: buscar se necessário
            strengthTests: [], // TODO: buscar se necessário
            functionalTests: [], // TODO: buscar se necessário
            psychologicalAssessment: undefined, // TODO: buscar se necessário
        };
    }
    mapDatabaseToFunctionalTest(data) {
        return {
            id: data.id,
            rtsCriteriaId: data.rts_criteria_id,
            testName: data.test_name,
            category: data.category,
            description: data.description,
            affectedSide: data.affected_side ? parseFloat(data.affected_side) : undefined,
            unaffectedSide: data.unaffected_side ? parseFloat(data.unaffected_side) : undefined,
            symmetryIndex: data.symmetry_index ? parseFloat(data.symmetry_index) : undefined,
            score: data.score ? parseFloat(data.score) : undefined,
            unit: data.unit,
            comparedToNorm: data.compared_to_norm ? parseFloat(data.compared_to_norm) : undefined,
            passedCriteria: data.passed_criteria,
            criteriaThreshold: parseFloat(data.criteria_threshold),
            testDate: new Date(data.test_date),
            videoUrl: data.video_url,
            notes: data.notes,
            createdAt: new Date(data.created_at),
        };
    }
    mapDatabaseToPerformanceMetric(data) {
        return {
            id: data.id,
            athleteId: data.athlete_id,
            metricType: data.metric_type,
            metricName: data.metric_name,
            value: parseFloat(data.value),
            unit: data.unit,
            metricDate: new Date(data.metric_date),
            context: data.context,
            comparedToBaseline: data.compared_to_baseline ? parseFloat(data.compared_to_baseline) : undefined,
            comparedToNorm: data.compared_to_norm ? parseFloat(data.compared_to_norm) : undefined,
            trend: data.trend,
            notes: data.notes,
            createdAt: new Date(data.created_at),
        };
    }
    mapDatabaseToLoadMonitoring(data) {
        return {
            id: data.id,
            athleteId: data.athlete_id,
            weekYear: data.week_year,
            totalLoad: parseFloat(data.total_load),
            averageLoad: parseFloat(data.average_load),
            acuteLoad: parseFloat(data.acute_load),
            chronicLoad: parseFloat(data.chronic_load),
            acwr: parseFloat(data.acwr),
            monotony: parseFloat(data.monotony),
            strain: parseFloat(data.strain),
            riskLevel: data.risk_level,
            recommendations: data.recommendations || [],
            createdAt: new Date(data.created_at),
        };
    }
    mapDatabaseToRehabProgression(data) {
        return {
            id: data.id,
            athleteId: data.athlete_id,
            currentPhase: data.current_phase,
            phaseStartDate: new Date(data.phase_start_date),
            estimatedPhaseCompletion: data.estimated_phase_completion ? new Date(data.estimated_phase_completion) : undefined,
            overallProgress: parseFloat(data.overall_progress),
            estimatedReturnDate: data.estimated_return_date ? new Date(data.estimated_return_date) : undefined,
            notes: data.notes,
            phaseGoals: [], // TODO: buscar se necessário
            completedPhases: [], // TODO: buscar se necessário
            progressionCriteria: [], // TODO: buscar se necessário
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
        };
    }
    mapDatabaseToTrainingSession(data) {
        return {
            id: data.id,
            athleteId: data.athlete_id,
            sessionDate: new Date(data.session_date),
            sessionType: data.session_type,
            phase: data.phase,
            duration: data.duration,
            heartRateAvg: data.heart_rate_avg,
            heartRateMax: data.heart_rate_max,
            perceivedExertion: data.perceived_exertion,
            fatigueLevel: data.fatigue_level,
            painLevel: data.pain_level,
            performanceRating: data.performance_rating,
            objectives: data.objectives || [],
            objectivesAchieved: data.objectives_achieved,
            notes: data.notes,
            conductedBy: data.conducted_by,
            exercises: [], // TODO: buscar se necessário
            createdAt: new Date(data.created_at),
        };
    }
}
export const sportsRehabServiceSupabase = new SportsRehabServiceSupabase();
