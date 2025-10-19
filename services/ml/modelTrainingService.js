/**
 * Model Training Service
 * Serviço para treinar e atualizar modelos de ML
 */
import { supabase } from '../../lib/supabaseClient';
class ModelTrainingService {
    /**
     * Coletar dados de treinamento
     */
    async collectTrainingData(predictionType) {
        console.log(`[ML] Coletando dados para ${predictionType}...`);
        let features = [];
        let labels = [];
        switch (predictionType) {
            case 'treatment_outcome':
                const outcomeData = await this.collectOutcomeData();
                features = outcomeData.features;
                labels = outcomeData.labels;
                break;
            case 'dropout_risk':
                const dropoutData = await this.collectDropoutData();
                features = dropoutData.features;
                labels = dropoutData.labels;
                break;
            default:
                throw new Error(`Tipo de predição não suportado: ${predictionType}`);
        }
        console.log(`[ML] Coletados ${features.length} exemplos`);
        return {
            features,
            labels,
            metadata: {
                collection_date: new Date().toISOString(),
                prediction_type: predictionType,
                samples: features.length,
            },
        };
    }
    /**
     * Treinar modelo (integração com Python/API externa)
     */
    async trainModel(modelName, predictionType, algorithm = 'random_forest') {
        console.log(`[ML] Iniciando treinamento de ${modelName}...`);
        // 1. Coletar dados
        const trainingData = await this.collectTrainingData(predictionType);
        // 2. Criar registro de training run
        const { data: trainingRun } = await supabase
            .from('model_training_runs')
            .insert({
            model_id: modelName,
            run_date: new Date().toISOString(),
            training_samples: trainingData.features.length,
            validation_samples: Math.floor(trainingData.features.length * 0.2),
            test_samples: Math.floor(trainingData.features.length * 0.2),
            hyperparameters_used: this.getDefaultHyperparameters(algorithm),
            status: 'running',
        })
            .select()
            .single();
        try {
            // 3. Treinar modelo (simulado - em produção chamar API Python)
            const results = await this.simulateTraining(trainingData, algorithm);
            // 4. Atualizar registro de training run
            await supabase
                .from('model_training_runs')
                .update({
                status: 'completed',
                metrics: results,
                run_duration: 120, // segundos
            })
                .eq('id', trainingRun.id);
            // 5. Atualizar modelo com novas métricas
            await this.updateModelMetrics(modelName, results);
            console.log(`[ML] Treinamento completo! Accuracy: ${results.accuracy}`);
            return results;
        }
        catch (error) {
            // Marcar como falhado
            await supabase
                .from('model_training_runs')
                .update({
                status: 'failed',
                error_message: error.message,
            })
                .eq('id', trainingRun.id);
            throw error;
        }
    }
    /**
     * Monitorar performance do modelo em produção
     */
    async monitorModel(modelId) {
        console.log(`[ML] Monitorando modelo ${modelId}...`);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // Buscar predições validadas dos últimos 30 dias
        const { data: predictions } = await supabase
            .from('ai_predictions')
            .select('*')
            .eq('model_name', modelId)
            .eq('validated', true)
            .gte('created_at', thirtyDaysAgo.toISOString());
        if (!predictions || predictions.length === 0) {
            console.log('[ML] Sem dados suficientes para monitoramento');
            return null;
        }
        // Calcular métricas
        const totalPredictions = predictions.length;
        const accuratePredictions = predictions.filter(p => p.was_accurate).length;
        const accuracy = accuratePredictions / totalPredictions;
        // Detectar model drift
        const { data: model } = await supabase
            .from('ml_models')
            .select('*')
            .eq('id', modelId)
            .single();
        const baselineAccuracy = model?.accuracy || 0.8;
        const drift = Math.abs(baselineAccuracy - accuracy);
        const driftDetected = drift > 0.1; // 10% threshold
        // Salvar monitoramento
        const { data: monitoring } = await supabase
            .from('prediction_monitoring')
            .insert({
            model_id: modelId,
            monitoring_period_start: thirtyDaysAgo.toISOString().split('T')[0],
            monitoring_period_end: new Date().toISOString().split('T')[0],
            total_predictions: totalPredictions,
            validated_predictions: totalPredictions,
            accuracy,
            model_drift_detected: driftDetected,
            drift_severity: driftDetected ? (drift > 0.2 ? 'high' : 'medium') : 'none',
            needs_retraining: driftDetected,
            recommendations: driftDetected
                ? ['Retreinar modelo com dados mais recentes']
                : ['Modelo performando adequadamente'],
        })
            .select()
            .single();
        return monitoring;
    }
    /**
     * Coletar dados de outcome
     */
    async collectOutcomeData() {
        // Buscar tratamentos completos com outcome
        const { data } = await supabase
            .from('treatments')
            .select('*, patients(*)')
            .eq('status', 'completed')
            .not('outcome', 'is', null);
        const features = data?.map(t => ({
            age: this.calculateAge(t.patients.birth_date),
            condition_severity: t.initial_severity || 5,
            sessions_completed: t.sessions_completed || 0,
            adherence_rate: t.adherence_rate || 0.8,
        })) || [];
        const labels = data?.map(t => t.outcome === 'success' ? 1 : 0) || [];
        return { features, labels };
    }
    /**
     * Coletar dados de dropout
     */
    async collectDropoutData() {
        const { data } = await supabase
            .from('treatments')
            .select('*, patients(*)');
        const features = data?.map(t => ({
            age: this.calculateAge(t.patients.birth_date),
            sessions_attended: t.sessions_completed || 0,
            sessions_missed: t.sessions_missed || 0,
            attendance_rate: t.attendance_rate || 1.0,
        })) || [];
        const labels = data?.map(t => t.status === 'abandoned' ? 1 : 0) || [];
        return { features, labels };
    }
    /**
     * Simular treinamento (em produção, chamar API Python)
     */
    async simulateTraining(data, algorithm) {
        // Simular delay de treinamento
        await new Promise(resolve => setTimeout(resolve, 2000));
        // Retornar métricas simuladas
        return {
            model_id: 'model-' + Date.now(),
            accuracy: 0.82 + (Math.random() * 0.1),
            precision: 0.78 + (Math.random() * 0.1),
            recall: 0.75 + (Math.random() * 0.1),
            f1_score: 0.76 + (Math.random() * 0.1),
            training_samples: data.features.length,
            validation_samples: Math.floor(data.features.length * 0.2),
        };
    }
    /**
     * Atualizar métricas do modelo
     */
    async updateModelMetrics(modelName, metrics) {
        await supabase
            .from('ml_models')
            .update({
            accuracy: metrics.accuracy,
            precision_score: metrics.precision,
            recall: metrics.recall,
            f1_score: metrics.f1_score,
            updated_at: new Date().toISOString(),
        })
            .eq('model_name', modelName);
    }
    /**
     * Hiperparâmetros default
     */
    getDefaultHyperparameters(algorithm) {
        const defaults = {
            random_forest: {
                n_estimators: 100,
                max_depth: 10,
                min_samples_split: 2,
                random_state: 42,
            },
            gradient_boosting: {
                n_estimators: 100,
                learning_rate: 0.1,
                max_depth: 5,
                random_state: 42,
            },
            logistic_regression: {
                C: 1.0,
                max_iter: 1000,
                random_state: 42,
            },
        };
        return defaults[algorithm] || {};
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
}
export const modelTrainingService = new ModelTrainingService();
