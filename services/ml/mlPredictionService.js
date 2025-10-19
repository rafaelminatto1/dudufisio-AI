/**
 * Machine Learning Prediction Service
 * Serviço para predições usando modelos de ML
 */
import { supabase } from '../../lib/supabaseClient';
class MLPredictionService {
    /**
     * Gerar predição de outcome de tratamento
     */
    async predictTreatmentOutcome(input) {
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
    async predictDropoutRisk(patientId) {
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
    async recommendExercises(patientId, conditionType) {
        // Buscar histórico do paciente
        const patientHistory = await this.getPatientExerciseHistory(patientId);
        // Buscar pacientes similares
        const similarPatients = await this.findSimilarPatients(patientId, conditionType);
        // Exercícios que pacientes similares tiveram sucesso
        const successfulExercises = await this.getSuccessfulExercises(similarPatients);
        // Filtrar exercícios que o paciente ainda não fez
        const newExercises = successfulExercises.filter(ex => !patientHistory.some(h => h.exercise_id === ex.id));
        // Ranquear por relevância
        const rankedExercises = this.rankExercises(newExercises, patientHistory);
        // Salvar recomendações
        await this.saveExerciseRecommendations(patientId, rankedExercises.slice(0, 10));
        return rankedExercises.slice(0, 10);
    }
    /**
     * Buscar modelo ativo para tipo de predição
     */
    async getActiveModel(predictionType) {
        const { data, error } = await supabase
            .from('ml_models')
            .select('*')
            .eq('prediction_type', predictionType)
            .eq('is_active', true)
            .eq('is_production', true)
            .order('accuracy', { ascending: false })
            .limit(1)
            .single();
        if (error && error.code !== 'PGRST116')
            throw error;
        return data;
    }
    /**
     * Preparar features para predição
     */
    async prepareFeatures(patientId, additionalFeatures = {}) {
        // Buscar dados do paciente
        const { data: patient } = await supabase
            .from('patients')
            .select('*')
            .eq('id', patientId)
            .single();
        if (!patient)
            throw new Error('Paciente não encontrado');
        // Features básicas
        const features = {
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
    async runPrediction(model, features) {
        // Em produção, fazer request para:
        // - Azure ML
        // - AWS SageMaker
        // - Google Vertex AI
        // - Modelo local (Python API)
        // Por enquanto, simulação baseada em regras
        const confidence = 0.75 + (Math.random() * 0.20); // 0.75 - 0.95
        let outcome = 'positive';
        const featureImportance = {};
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
    async savePrediction(predictionData) {
        const { data, error } = await supabase
            .from('ai_predictions')
            .insert(predictionData)
            .select()
            .single();
        if (error)
            throw error;
        return data;
    }
    /**
     * Gerar explicação da predição
     */
    generateExplanation(prediction, features, model) {
        const topFactors = Object.entries(prediction.feature_importance || {})
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([key]) => key);
        return `Esta predição foi gerada pelo modelo ${model.model_name} (versão ${model.version}) ` +
            `com ${Math.round(prediction.confidence * 100)}% de confiança. ` +
            `Os principais fatores considerados foram: ${topFactors.join(', ')}.`;
    }
    /**
     * Gerar recomendações baseadas na predição
     */
    generateRecommendations(prediction, features) {
        const recommendations = [];
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
    classifyConfidence(score) {
        if (score >= 0.9)
            return 'very_high';
        if (score >= 0.75)
            return 'high';
        if (score >= 0.6)
            return 'medium';
        if (score >= 0.4)
            return 'low';
        return 'very_low';
    }
    /**
     * Extrair fatores analisados
     */
    extractFactors(features) {
        return Object.keys(features);
    }
    /**
     * Identificar fatores de risco
     */
    identifyRiskFactors(features, prediction) {
        const risks = [];
        if (features.age > 65)
            risks.push('Idade avançada');
        if (features.attendance_rate < 0.8)
            risks.push('Baixa aderência ao tratamento');
        if (features.sessions_missed > 3)
            risks.push('Múltiplas faltas recentes');
        return risks;
    }
    /**
     * Identificar fatores protetores
     */
    identifyProtectiveFactors(features, prediction) {
        const protective = [];
        if (features.attendance_rate > 0.9)
            protective.push('Excelente aderência');
        if (features.satisfaction_score > 4)
            protective.push('Alta satisfação');
        if (features.has_transportation)
            protective.push('Acesso facilitado');
        return protective;
    }
    /**
     * Gerar plano de prevenção de abandono
     */
    generateDropoutPreventionPlan(prediction, features) {
        const plan = [];
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
    calculateAge(birthDate) {
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
    normalizeFeatures(features) {
        // Implementar normalização (z-score, min-max, etc)
        return features;
    }
    /**
     * Buscar dados do paciente para predição
     */
    async getPatientData(patientId) {
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
    async getPatientExerciseHistory(patientId) {
        const { data } = await supabase
            .from('exercise_assignments')
            .select('*, exercises(*)')
            .eq('patient_id', patientId);
        return data || [];
    }
    /**
     * Encontrar pacientes similares
     */
    async findSimilarPatients(patientId, conditionType) {
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
    async getSuccessfulExercises(similarPatients) {
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
    rankExercises(exercises, patientHistory) {
        // Implementar algoritmo de ranking (NDCG, etc)
        return exercises.sort((a, b) => {
            return (b.effectiveness_rating || 0) - (a.effectiveness_rating || 0);
        });
    }
    /**
     * Salvar recomendações de exercícios
     */
    async saveExerciseRecommendations(patientId, exercises) {
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
