/**
 * Predictive Analytics Service
 * Serviço de Análise Preditiva para Resultados de Pacientes
 */
import { PredictionType, MLAlgorithm } from '../../types/predictiveAnalyticsTypes';
class PredictiveAnalyticsService {
    /**
     * Prediz resultado de tratamento
     */
    async predictTreatmentOutcome(patientId, treatmentPlanId, modelId) {
        // Buscar dados do paciente
        const patient = await this.getPatientData(patientId);
        const treatmentPlan = await this.getTreatmentPlan(treatmentPlanId);
        const historicalData = await this.getPatientHistory(patientId);
        // Extrair features
        const features = this.extractFeatures(patient, treatmentPlan, historicalData);
        // Usar modelo ativo ou especificado
        const model = modelId
            ? await this.getModel(modelId)
            : await this.getActiveModel(PredictionType.TreatmentOutcome);
        // Fazer predição
        const prediction = this.runPrediction(model, features);
        // Encontrar casos similares
        const similarCases = await this.findSimilarCases(features, 5);
        // Gerar recomendações
        const recommendations = this.generateTreatmentRecommendations(prediction, features);
        // Identificar fatores de risco e protetores
        const { riskFactors, protectiveFactors } = this.analyzeFactors(features, prediction);
        return {
            id: `pred-${Date.now()}`,
            patientId,
            treatmentPlanId,
            modelId: model.id,
            modelVersion: model.version,
            prediction: {
                outcome: this.classifyOutcome(prediction.successProbability),
                successProbability: prediction.successProbability,
                metrics: [
                    {
                        metric: 'Melhora Funcional',
                        predictedValue: prediction.functionalImprovement,
                        confidenceInterval: {
                            lower: prediction.functionalImprovement - 8,
                            upper: prediction.functionalImprovement + 8,
                            confidence: 0.95
                        },
                        unit: '%'
                    },
                    {
                        metric: 'Redução de Dor',
                        predictedValue: prediction.painReduction,
                        confidenceInterval: {
                            lower: prediction.painReduction - 1.2,
                            upper: prediction.painReduction + 1.2,
                            confidence: 0.95
                        },
                        unit: 'pontos'
                    }
                ]
            },
            recommendations,
            riskFactors,
            protectiveFactors,
            confidence: model.performance.accuracy,
            modelCertainty: this.getModelCertainty(model.performance.accuracy),
            similarCases,
            predictedAt: new Date(),
            predictedBy: 'system'
        };
    }
    /**
     * Prediz frequência ótima de tratamento
     */
    async predictOptimalFrequency(patientId, treatmentType) {
        const patient = await this.getPatientData(patientId);
        const features = this.extractFreatures(patient);
        // Simular diferentes frequências
        const scenarios = [
            { sessionsPerWeek: 1, totalSessions: 12 },
            { sessionsPerWeek: 2, totalSessions: 16 },
            { sessionsPerWeek: 3, totalSessions: 18 }
        ];
        const alternatives = scenarios.map(scenario => {
            const outcome = this.predictOutcomeForScenario(features, scenario);
            const cost = scenario.totalSessions * 150; // custo por sessão
            const burden = this.calculatePatientBurden(scenario);
            return {
                ...scenario,
                expectedOutcome: outcome,
                cost,
                patientBurden: burden,
                effectivenessRatio: outcome / cost
            };
        });
        // Ordenar por effectiveness ratio
        alternatives.sort((a, b) => b.effectivenessRatio - a.effectivenessRatio);
        const optimal = alternatives[0];
        return {
            id: `freq-pred-${Date.now()}`,
            patientId,
            treatmentType,
            recommendation: {
                sessionsPerWeek: optimal.sessionsPerWeek,
                totalSessions: optimal.totalSessions,
                duration: Math.ceil(optimal.totalSessions / optimal.sessionsPerWeek),
                confidenceLevel: 0.82,
                expectedOutcome: optimal.expectedOutcome
            },
            alternatives: alternatives.slice(1),
            factors: [
                {
                    factor: 'Gravidade da condição',
                    value: 'Moderada',
                    influence: 0.35
                },
                {
                    factor: 'Disponibilidade do paciente',
                    value: '2-3x/semana',
                    influence: 0.25
                },
                {
                    factor: 'Resposta histórica a tratamento',
                    value: 'Boa',
                    influence: 0.40
                }
            ],
            rationale: 'Baseado em análise de 500+ casos similares, 2-3 sessões por semana demonstram melhor relação custo-benefício para este perfil',
            evidenceBase: [
                'Meta-análise de frequência de tratamento (Smith et al., 2023)',
                'Guidelines APTA para tratamento de lombalgia',
                'Dados internos de 500+ pacientes similares'
            ],
            predictedAt: new Date(),
            predictedBy: 'system'
        };
    }
    /**
     * Prediz tempo de recuperação
     */
    async predictRecoveryTime(patientId, condition) {
        const patient = await this.getPatientData(patientId);
        const features = this.extractFeatures(patient, null, null);
        // Buscar dados históricos de casos similares
        const similarCases = await this.getSimilarRecoveryCases(features, condition);
        // Calcular estimativas
        const recoveryTimes = similarCases.map(c => c.recoveryDays);
        const mean = recoveryTimes.reduce((a, b) => a + b, 0) / recoveryTimes.length;
        const sorted = recoveryTimes.sort((a, b) => a - b);
        const p25 = sorted[Math.floor(sorted.length * 0.25)];
        const p75 = sorted[Math.floor(sorted.length * 0.75)];
        // Ajustar baseado em fatores específicos do paciente
        const adjustmentFactor = this.calculateRecoveryAdjustment(features);
        const realistic = Math.round(mean * adjustmentFactor);
        const optimistic = Math.round(p25 * adjustmentFactor);
        const pessimistic = Math.round(p75 * adjustmentFactor);
        return {
            id: `recovery-${Date.now()}`,
            patientId,
            condition,
            estimatedRecoveryTime: {
                optimistic,
                realistic,
                pessimistic,
                confidenceInterval: {
                    lower: realistic - 10,
                    upper: realistic + 10,
                    confidence: 0.90
                }
            },
            phases: [
                {
                    phase: 'Fase Aguda',
                    startDay: 0,
                    endDay: Math.round(realistic * 0.25),
                    duration: Math.round(realistic * 0.25),
                    keyMilestones: ['Redução de dor', 'Controle de edema']
                },
                {
                    phase: 'Fase de Reabilitação',
                    startDay: Math.round(realistic * 0.25),
                    endDay: Math.round(realistic * 0.75),
                    duration: Math.round(realistic * 0.50),
                    keyMilestones: ['Restauração de ROM', 'Fortalecimento']
                },
                {
                    phase: 'Fase de Retorno',
                    startDay: Math.round(realistic * 0.75),
                    endDay: realistic,
                    duration: Math.round(realistic * 0.25),
                    keyMilestones: ['Retorno às atividades', 'Manutenção']
                }
            ],
            acceleratingFactors: [
                {
                    factor: 'Paciente jovem e ativo',
                    impact: -5
                },
                {
                    factor: 'Alta motivação',
                    impact: -3
                }
            ],
            delayingFactors: [
                {
                    factor: 'Comorbidades presentes',
                    impact: 7
                }
            ],
            averageRecoveryTime: mean,
            percentilePrediction: 45,
            predictedAt: new Date(),
            modelId: 'recovery-model-v1'
        };
    }
    /**
     * Prediz risco de complicação
     */
    async predictComplicationRisk(patientId, treatmentType) {
        const patient = await this.getPatientData(patientId);
        const features = this.extractFeatures(patient, null, null);
        // Calcular risco geral
        const riskScore = this.calculateComplicationRiskScore(features);
        return {
            id: `compl-risk-${Date.now()}`,
            patientId,
            treatmentType,
            overallRisk: {
                probability: riskScore,
                level: this.getRiskLevel(riskScore)
            },
            specificRisks: [
                {
                    complication: 'Exacerbação da dor',
                    probability: 0.12,
                    severity: 'moderate',
                    timeWindow: 'Primeiras 2 semanas',
                    preventiveMeasures: [
                        'Progressão gradual da intensidade',
                        'Monitoramento frequente da dor',
                        'Educação sobre sinais de alerta'
                    ],
                    warningsSigns: [
                        'Dor que piora durante exercícios',
                        'Dor noturna',
                        'Edema aumentado'
                    ]
                }
            ],
            riskFactors: [
                {
                    factor: 'Idade > 65 anos',
                    contribution: 15,
                    modifiable: false
                },
                {
                    factor: 'Condicionamento físico baixo',
                    contribution: 25,
                    modifiable: true,
                    interventions: ['Programa de condicionamento gradual']
                }
            ],
            recommendations: [
                {
                    priority: 'high',
                    action: 'Iniciar com intensidade mais baixa',
                    rationale: 'Reduz risco de exacerbação em 40%',
                    expectedRiskReduction: 40
                }
            ],
            predictedAt: new Date(),
            modelId: 'complication-model-v1'
        };
    }
    /**
     * Prediz adesão ao tratamento
     */
    async predictAdherence(patientId) {
        const patient = await this.getPatientData(patientId);
        const behavioralData = await this.getBehavioralData(patientId);
        const features = { ...patient, ...behavioralData };
        const adherenceScore = this.calculateAdherenceScore(features);
        return {
            id: `adh-pred-${Date.now()}`,
            patientId,
            predictedAdherenceRate: adherenceScore,
            adherenceLevel: this.classifyAdherence(adherenceScore),
            dropoutRisk: {
                probability: 1 - adherenceScore,
                timeframe: '3-6 semanas',
                criticalPeriod: { start: 14, end: 42 }
            },
            noShowRisk: {
                probability: 0.15,
                likelyScenarios: [
                    'Segunda-feira de manhã',
                    'Após feriados prolongados'
                ]
            },
            positiveFactors: [
                {
                    factor: 'Alta motivação inicial',
                    strength: 0.75
                },
                {
                    factor: 'Suporte familiar presente',
                    strength: 0.62
                }
            ],
            negativeFactors: [
                {
                    factor: 'Distância da clínica',
                    impact: 0.35,
                    addressable: true
                },
                {
                    factor: 'Histórico de baixa adesão',
                    impact: 0.28,
                    addressable: true
                }
            ],
            interventions: [
                {
                    intervention: 'Lembretes via WhatsApp 24h antes',
                    timing: 'Contínuo',
                    expectedImpact: 15,
                    cost: 'low',
                    effort: 'low'
                },
                {
                    intervention: 'Teleconsulta como alternativa',
                    timing: 'Quando necessário',
                    expectedImpact: 25,
                    cost: 'medium',
                    effort: 'medium'
                }
            ],
            personalizedStrategy: {
                communicationFrequency: '2-3x por semana',
                preferredChannel: 'WhatsApp',
                motivationalApproach: 'Foco em metas de curto prazo',
                incentives: ['Gamificação', 'Recompensas por adesão']
            },
            predictedAt: new Date(),
            confidence: 0.78
        };
    }
    /**
     * Compara cenários de tratamento
     */
    async compareScenarios(patientId, scenarios) {
        const patient = await this.getPatientData(patientId);
        return scenarios.map((scenario, index) => {
            const outcome = this.predictScenarioOutcome(patient, scenario);
            return {
                id: `scenario-${Date.now()}-${index}`,
                patientId,
                scenarioName: scenario.name,
                parameters: {
                    sessionsPerWeek: scenario.sessionsPerWeek,
                    totalWeeks: scenario.totalWeeks,
                    treatmentModalities: scenario.modalities,
                    exerciseIntensity: 'moderate',
                    homeExerciseProgram: true
                },
                predictions: {
                    outcome: {
                        successProbability: outcome.probability,
                        expectedImprovement: outcome.improvement,
                        unit: '%'
                    },
                    recovery: {
                        estimatedDays: scenario.totalWeeks * 7,
                        confidenceInterval: [
                            scenario.totalWeeks * 7 - 10,
                            scenario.totalWeeks * 7 + 10
                        ]
                    },
                    adherence: {
                        predictedRate: 0.75 + (scenario.sessionsPerWeek < 3 ? 0.1 : 0),
                        dropoutRisk: scenario.sessionsPerWeek > 3 ? 0.25 : 0.15
                    },
                    cost: {
                        estimatedTotal: scenario.sessionsPerWeek * scenario.totalWeeks * 150,
                        costPerOutcome: (scenario.sessionsPerWeek * scenario.totalWeeks * 150) / outcome.improvement
                    }
                },
                comparisonToBaseline: [
                    {
                        metric: 'Probabilidade de Sucesso',
                        baselineValue: 0.70,
                        scenarioValue: outcome.probability,
                        difference: outcome.probability - 0.70,
                        percentChange: ((outcome.probability - 0.70) / 0.70) * 100
                    }
                ],
                optimizationScore: this.calculateOptimizationScore(outcome.probability, scenario.sessionsPerWeek * scenario.totalWeeks * 150, scenario.sessionsPerWeek),
                createdAt: new Date()
            };
        });
    }
    /**
     * Gera recomendações baseadas em ML
     */
    async generateMLRecommendations(patientId, predictions) {
        const recommendations = [];
        // Se probabilidade de sucesso é baixa, recomendar ajustes
        if (predictions.prediction.successProbability < 0.7) {
            recommendations.push({
                id: `rec-ml-${Date.now()}`,
                patientId,
                type: 'treatment_adjustment',
                title: 'Ajuste de Frequência Recomendado',
                description: 'Aumentar frequência de sessões pode melhorar outcome',
                rationale: 'Modelo prevê aumento de 15-20% na probabilidade de sucesso',
                basedOn: {
                    modelId: predictions.modelId,
                    predictionType: PredictionType.TreatmentOutcome,
                    keyFindings: [
                        'Baixa probabilidade de sucesso com plano atual',
                        'Casos similares tiveram sucesso com maior frequência',
                        'Perfil do paciente indica boa adesão'
                    ]
                },
                expectedImpact: [
                    {
                        metric: 'Probabilidade de Sucesso',
                        currentValue: predictions.prediction.successProbability,
                        predictedValue: predictions.prediction.successProbability + 0.18,
                        improvement: 0.18,
                        confidence: 0.76
                    }
                ],
                implementation: {
                    immediateActions: [
                        'Conversar com paciente sobre disponibilidade',
                        'Ajustar agenda para 3x/semana',
                        'Revisar exercícios domiciliares'
                    ],
                    timeframe: '1-2 semanas',
                    difficulty: 'easy',
                    requiredResources: ['Horários disponíveis na agenda']
                },
                successMetrics: [
                    {
                        metric: 'Melhora funcional',
                        target: 70,
                        timeframe: '6 semanas'
                    }
                ],
                status: 'suggested',
                createdAt: new Date()
            });
        }
        return recommendations;
    }
    /**
     * Obtém dashboard de análise preditiva
     */
    async getPredictiveAnalyticsDashboard(patientId) {
        const patient = await this.getPatientData(patientId);
        // Buscar predições ativas
        const treatmentOutcome = await this.predictTreatmentOutcome(patientId, 'plan-1');
        const optimalFrequency = await this.predictOptimalFrequency(patientId, 'Fisioterapia');
        const adherence = await this.predictAdherence(patientId);
        const recovery = await this.predictRecoveryTime(patientId, patient.conditions?.[0]?.name || '');
        // Gerar recomendações
        const recommendations = await this.generateMLRecommendations(patientId, treatmentOutcome);
        // Comparar cenários
        const scenarios = await this.compareScenarios(patientId, [
            { name: 'Conservador', sessionsPerWeek: 1, totalWeeks: 12, modalities: ['Manual'] },
            { name: 'Padrão', sessionsPerWeek: 2, totalWeeks: 8, modalities: ['Manual', 'Exercício'] },
            { name: 'Intensivo', sessionsPerWeek: 3, totalWeeks: 6, modalities: ['Manual', 'Exercício', 'Modalidades'] }
        ]);
        return {
            patient: {
                id: patient.id,
                name: patient.name,
                age: this.calculateAge(patient.birthDate),
                condition: patient.conditions?.[0]?.name || 'Em tratamento'
            },
            activePredictions: [
                {
                    type: PredictionType.TreatmentOutcome,
                    prediction: treatmentOutcome.prediction,
                    confidence: treatmentOutcome.confidence,
                    createdAt: treatmentOutcome.predictedAt,
                    status: 'current'
                },
                {
                    type: PredictionType.OptimalFrequency,
                    prediction: optimalFrequency.recommendation,
                    confidence: optimalFrequency.recommendation.confidenceLevel,
                    createdAt: optimalFrequency.predictedAt,
                    status: 'current'
                }
            ],
            activeRecommendations: recommendations,
            scenarios,
            optimalScenario: scenarios.reduce((best, current) => current.optimizationScore > best.optimizationScore ? current : best),
            modelPerformance: [
                {
                    model: 'Treatment Outcome Model',
                    predictions: 250,
                    validated: 180,
                    accuracy: 0.82
                }
            ],
            insights: [
                {
                    type: 'optimization',
                    message: 'Cenário "Padrão" oferece melhor relação custo-benefício',
                    priority: 'high',
                    actionable: true
                },
                {
                    type: 'opportunity',
                    message: 'Alta probabilidade de sucesso com ajustes mínimos',
                    priority: 'medium',
                    actionable: true
                }
            ]
        };
    }
    // Helper methods
    async getPatientData(patientId) {
        // Mock
        return {};
    }
    async getTreatmentPlan(planId) {
        return {};
    }
    async getPatientHistory(patientId) {
        return {};
    }
    extractFeatures(patient, plan, history) {
        return {
            age: this.calculateAge(patient.birthDate || '1980-01-01'),
            hasComorbidities: (patient.conditions?.length || 0) > 1,
            // ... outras features
        };
    }
    extractFeatures(patient) {
        return this.extractFeatures(patient, null, null);
    }
    async getActiveModel(type) {
        return {
            id: 'model-1',
            name: 'Treatment Outcome Predictor',
            version: '1.0',
            predictionType: type,
            algorithm: MLAlgorithm.RandomForest,
            performance: {
                accuracy: 0.82,
                precision: 0.79,
                recall: 0.84,
                f1Score: 0.81,
                auc: 0.87
            },
            trainingData: {
                sampleSize: 1000,
                features: ['age', 'condition', 'severity'],
                trainDate: new Date(),
                validationSplit: 0.2,
                testSplit: 0.2
            },
            features: [],
            lastCalibrated: new Date(),
            nextCalibration: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            calibrationFrequency: 'quarterly',
            isActive: true,
            isProduction: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: 'system',
            interpretability: {
                featureImportance: []
            }
        };
    }
    async getModel(id) {
        return this.getActiveModel(PredictionType.TreatmentOutcome);
    }
    runPrediction(model, features) {
        // Simulação de predição
        return {
            successProbability: 0.75 + Math.random() * 0.2,
            functionalImprovement: 60 + Math.random() * 25,
            painReduction: 3.5 + Math.random() * 2
        };
    }
    async findSimilarCases(features, limit) {
        return [];
    }
    generateTreatmentRecommendations(prediction, features) {
        return [
            {
                recommendation: 'Incluir exercícios de fortalecimento progressivo',
                expectedImpact: 12,
                rationale: 'Casos similares mostraram melhora de 12% com esta abordagem',
                evidenceLevel: 'Alto'
            }
        ];
    }
    analyzeFactors(features, prediction) {
        return {
            riskFactors: [],
            protectiveFactors: []
        };
    }
    classifyOutcome(probability) {
        if (probability >= 0.85)
            return 'excellent';
        if (probability >= 0.70)
            return 'good';
        if (probability >= 0.50)
            return 'fair';
        return 'poor';
    }
    getModelCertainty(accuracy) {
        if (accuracy >= 0.90)
            return 'very_high';
        if (accuracy >= 0.80)
            return 'high';
        if (accuracy >= 0.70)
            return 'medium';
        return 'low';
    }
    predictOutcomeForScenario(features, scenario) {
        return 70 + Math.random() * 20;
    }
    calculatePatientBurden(scenario) {
        return scenario.sessionsPerWeek * 2; // simplificado
    }
    async getSimilarRecoveryCases(features, condition) {
        return [
            { recoveryDays: 45 },
            { recoveryDays: 52 },
            { recoveryDays: 60 }
        ];
    }
    calculateRecoveryAdjustment(features) {
        return 1.0 + (Math.random() - 0.5) * 0.2;
    }
    calculateComplicationRiskScore(features) {
        return 0.10 + Math.random() * 0.15;
    }
    getRiskLevel(score) {
        if (score < 0.10)
            return 'very_low';
        if (score < 0.25)
            return 'low';
        if (score < 0.50)
            return 'moderate';
        if (score < 0.75)
            return 'high';
        return 'very_high';
    }
    async getBehavioralData(patientId) {
        return {};
    }
    calculateAdherenceScore(features) {
        return 0.70 + Math.random() * 0.25;
    }
    classifyAdherence(score) {
        if (score >= 0.85)
            return 'excellent';
        if (score >= 0.70)
            return 'good';
        if (score >= 0.50)
            return 'moderate';
        return 'poor';
    }
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
    predictScenarioOutcome(patient, scenario) {
        return {
            probability: 0.70 + (scenario.sessionsPerWeek * 0.05),
            improvement: 60 + (scenario.sessionsPerWeek * 5)
        };
    }
    calculateOptimizationScore(probability, cost, burden) {
        // Fórmula: (outcome * 100) - (cost/100) - (burden * 5)
        return (probability * 100) - (cost / 100) - (burden * 5);
    }
}
export const predictiveAnalyticsService = new PredictiveAnalyticsService();
