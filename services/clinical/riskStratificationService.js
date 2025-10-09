/**
 * Risk Stratification Service
 * Serviço de Estratificação de Risco Clínico
 */
import { RiskType, RiskLevel, } from '../../types/riskTypes';
// Mock data para demonstração
const RISK_THRESHOLDS = {
    [RiskType.Fall]: {
        riskType: RiskType.Fall,
        low: { min: 0, max: 25 },
        moderate: { min: 26, max: 50 },
        high: { min: 51, max: 75 },
        critical: { min: 76, max: 100 }
    },
    [RiskType.Deconditioning]: {
        riskType: RiskType.Deconditioning,
        low: { min: 0, max: 30 },
        moderate: { min: 31, max: 55 },
        high: { min: 56, max: 75 },
        critical: { min: 76, max: 100 }
    },
    [RiskType.Abandonment]: {
        riskType: RiskType.Abandonment,
        low: { min: 0, max: 20 },
        moderate: { min: 21, max: 45 },
        high: { min: 46, max: 70 },
        critical: { min: 71, max: 100 }
    },
    [RiskType.NoShow]: {
        riskType: RiskType.NoShow,
        low: { min: 0, max: 15 },
        moderate: { min: 16, max: 40 },
        high: { min: 41, max: 65 },
        critical: { min: 66, max: 100 }
    },
    [RiskType.Complication]: {
        riskType: RiskType.Complication,
        low: { min: 0, max: 25 },
        moderate: { min: 26, max: 50 },
        high: { min: 51, max: 75 },
        critical: { min: 76, max: 100 }
    },
    [RiskType.Readmission]: {
        riskType: RiskType.Readmission,
        low: { min: 0, max: 25 },
        moderate: { min: 26, max: 50 },
        high: { min: 51, max: 75 },
        critical: { min: 76, max: 100 }
    },
    [RiskType.ChronicPain]: {
        riskType: RiskType.ChronicPain,
        low: { min: 0, max: 30 },
        moderate: { min: 31, max: 55 },
        high: { min: 56, max: 75 },
        critical: { min: 76, max: 100 }
    },
    [RiskType.FunctionalDecline]: {
        riskType: RiskType.FunctionalDecline,
        low: { min: 0, max: 25 },
        moderate: { min: 26, max: 50 },
        high: { min: 51, max: 75 },
        critical: { min: 76, max: 100 }
    }
};
class RiskStratificationService {
    /**
     * Calcula o score de risco para um paciente
     */
    async calculateRiskScore(patientId, riskType, factors) {
        // Normaliza os pesos dos fatores
        const totalWeight = factors.reduce((sum, f) => sum + (f.weight || 0), 0);
        // Calcula o score ponderado
        const weightedScore = factors.reduce((score, factor) => {
            const normalizedWeight = (factor.weight || 0) / totalWeight;
            const factorScore = this.evaluateFactor(factor);
            return score + (factorScore * normalizedWeight * 100);
        }, 0);
        return Math.min(100, Math.max(0, weightedScore));
    }
    /**
     * Avalia um fator de risco individual
     */
    evaluateFactor(factor) {
        // Lógica simplificada - em produção seria mais sofisticada
        if (typeof factor.value === 'boolean') {
            return factor.value ? 1 : 0;
        }
        if (typeof factor.value === 'number') {
            return Math.min(1, Math.max(0, factor.value));
        }
        return 0.5; // valor padrão para outros tipos
    }
    /**
     * Determina o nível de risco baseado no score
     */
    determineRiskLevel(score, riskType) {
        const thresholds = RISK_THRESHOLDS[riskType];
        if (score >= thresholds.critical.min)
            return RiskLevel.Critical;
        if (score >= thresholds.high.min)
            return RiskLevel.High;
        if (score >= thresholds.moderate.min)
            return RiskLevel.Moderate;
        return RiskLevel.Low;
    }
    /**
     * Realiza avaliação completa de risco para um paciente
     */
    async assessPatientRisk(patient, riskType, additionalData) {
        // Coleta fatores de risco baseados no tipo
        const factors = await this.collectRiskFactors(patient, riskType, additionalData);
        // Calcula o score
        const score = await this.calculateRiskScore(patient.id, riskType, factors);
        // Determina o nível de risco
        const riskLevel = this.determineRiskLevel(score, riskType);
        // Gera recomendações
        const recommendations = this.generateRecommendations(riskType, riskLevel, factors);
        // Calcula confiança da predição
        const confidence = this.calculateConfidence(factors);
        const assessment = {
            id: `risk-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            patientId: patient.id,
            patientName: patient.name,
            riskType,
            riskLevel,
            score,
            confidence,
            factors: factors,
            recommendations,
            assessedAt: new Date(),
            assessedBy: 'system',
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        };
        return assessment;
    }
    /**
     * Coleta fatores de risco específicos para cada tipo
     */
    async collectRiskFactors(patient, riskType, additionalData) {
        const factors = [];
        // Fatores demográficos comuns
        const age = this.calculateAge(patient.birthDate);
        factors.push({
            id: 'age',
            name: 'Idade',
            category: 'demographic',
            value: age,
            weight: 0.15,
            contribution: 0,
            isModifiable: false
        });
        // Fatores específicos por tipo de risco
        switch (riskType) {
            case RiskType.Fall:
                factors.push(...this.collectFallRiskFactors(patient, age));
                break;
            case RiskType.Abandonment:
                factors.push(...this.collectAbandonmentRiskFactors(patient, additionalData));
                break;
            case RiskType.NoShow:
                factors.push(...this.collectNoShowRiskFactors(patient, additionalData));
                break;
            case RiskType.Deconditioning:
                factors.push(...this.collectDeconditioningRiskFactors(patient, additionalData));
                break;
            case RiskType.ChronicPain:
                factors.push(...this.collectChronicPainRiskFactors(patient, additionalData));
                break;
            default:
                // Fatores genéricos
                break;
        }
        return factors;
    }
    /**
     * Fatores de risco de queda
     */
    collectFallRiskFactors(patient, age) {
        const factors = [];
        // Idade avançada
        factors.push({
            id: 'fall-age-risk',
            name: 'Risco por Idade',
            category: 'demographic',
            value: age >= 65 ? 0.8 : age >= 50 ? 0.4 : 0.1,
            weight: 0.2,
            contribution: 0,
            isModifiable: false
        });
        // Histórico de quedas (simulado - seria obtido do histórico real)
        const hasHistoryOfFalls = patient.medicalAlerts?.toLowerCase().includes('queda') || false;
        factors.push({
            id: 'fall-history',
            name: 'Histórico de Quedas',
            category: 'clinical',
            value: hasHistoryOfFalls,
            weight: 0.25,
            contribution: 0,
            isModifiable: false
        });
        // Medicações de risco (simulado)
        factors.push({
            id: 'fall-medications',
            name: 'Medicações de Risco',
            category: 'clinical',
            value: 0.3, // placeholder
            weight: 0.15,
            contribution: 0,
            isModifiable: true,
            description: 'Uso de medicações que aumentam risco de queda'
        });
        // Déficit de equilíbrio (simulado)
        factors.push({
            id: 'fall-balance',
            name: 'Déficit de Equilíbrio',
            category: 'clinical',
            value: 0.5, // placeholder
            weight: 0.25,
            contribution: 0,
            isModifiable: true,
            description: 'Avaliado por testes de equilíbrio'
        });
        // Ambiente doméstico
        factors.push({
            id: 'fall-environment',
            name: 'Riscos Ambientais',
            category: 'environmental',
            value: 0.4, // placeholder
            weight: 0.15,
            contribution: 0,
            isModifiable: true,
            description: 'Tapetes, iluminação, escadas, etc.'
        });
        return factors;
    }
    /**
     * Fatores de risco de abandono
     */
    collectAbandonmentRiskFactors(patient, additionalData) {
        const factors = [];
        // Frequência de comparecimento
        if (additionalData?.appointments) {
            const appointments = additionalData.appointments;
            const completedAppointments = appointments.filter(a => a.status === 'Realizado').length;
            const totalAppointments = appointments.length;
            const adherenceRate = totalAppointments > 0 ? completedAppointments / totalAppointments : 1;
            factors.push({
                id: 'abandon-adherence',
                name: 'Taxa de Adesão',
                category: 'behavioral',
                value: 1 - adherenceRate, // Invertido: baixa adesão = maior risco
                weight: 0.3,
                contribution: 0,
                isModifiable: true,
                description: `${(adherenceRate * 100).toFixed(0)}% de comparecimento`
            });
        }
        // Distância/Acesso
        factors.push({
            id: 'abandon-access',
            name: 'Dificuldade de Acesso',
            category: 'social',
            value: 0.3, // placeholder - seria calculado com base em endereço
            weight: 0.15,
            contribution: 0,
            isModifiable: true,
            description: 'Distância e dificuldade de transporte'
        });
        // Satisfação com tratamento (baseado em notas SOAP)
        factors.push({
            id: 'abandon-satisfaction',
            name: 'Satisfação com Tratamento',
            category: 'behavioral',
            value: 0.2, // placeholder
            weight: 0.25,
            contribution: 0,
            isModifiable: true,
            description: 'Percepção de progresso e satisfação'
        });
        // Fatores socioeconômicos
        factors.push({
            id: 'abandon-socioeconomic',
            name: 'Fatores Socioeconômicos',
            category: 'social',
            value: 0.4, // placeholder
            weight: 0.2,
            contribution: 0,
            isModifiable: true,
            description: 'Questões financeiras e suporte social'
        });
        // Complexidade do tratamento
        factors.push({
            id: 'abandon-complexity',
            name: 'Complexidade do Tratamento',
            category: 'clinical',
            value: 0.3, // placeholder
            weight: 0.1,
            contribution: 0,
            isModifiable: true,
            description: 'Dificuldade de seguir o plano de tratamento'
        });
        return factors;
    }
    /**
     * Fatores de risco de falta (no-show)
     */
    collectNoShowRiskFactors(patient, additionalData) {
        const factors = [];
        // Histórico de faltas
        if (additionalData?.appointments) {
            const appointments = additionalData.appointments;
            const noShows = appointments.filter(a => a.status === 'Faltou').length;
            const total = appointments.length;
            const noShowRate = total > 0 ? noShows / total : 0;
            factors.push({
                id: 'noshow-history',
                name: 'Histórico de Faltas',
                category: 'behavioral',
                value: noShowRate,
                weight: 0.35,
                contribution: 0,
                isModifiable: true,
                description: `${noShows} faltas em ${total} agendamentos`
            });
        }
        // Confirmação de agendamento
        factors.push({
            id: 'noshow-confirmation',
            name: 'Confirmação de Agendamento',
            category: 'behavioral',
            value: 0.3, // placeholder - seria baseado em confirmações recentes
            weight: 0.25,
            contribution: 0,
            isModifiable: true,
            description: 'Taxa de confirmação de agendamentos'
        });
        // Tempo de antecedência do agendamento
        factors.push({
            id: 'noshow-lead-time',
            name: 'Tempo de Antecedência',
            category: 'behavioral',
            value: 0.2, // placeholder
            weight: 0.15,
            contribution: 0,
            isModifiable: false,
            description: 'Agendamentos com pouca antecedência têm maior risco'
        });
        // Engajamento com comunicações
        factors.push({
            id: 'noshow-engagement',
            name: 'Engajamento com Comunicações',
            category: 'behavioral',
            value: 0.25, // placeholder
            weight: 0.15,
            contribution: 0,
            isModifiable: true,
            description: 'Resposta a lembretes e comunicações'
        });
        // Horário do agendamento
        factors.push({
            id: 'noshow-time-slot',
            name: 'Horário do Agendamento',
            category: 'behavioral',
            value: 0.15, // placeholder
            weight: 0.1,
            contribution: 0,
            isModifiable: true,
            description: 'Alguns horários têm maior taxa de falta'
        });
        return factors;
    }
    /**
     * Fatores de risco de descondicionamento
     */
    collectDeconditioningRiskFactors(patient, additionalData) {
        const factors = [];
        // Nível de atividade física
        factors.push({
            id: 'decond-activity-level',
            name: 'Nível de Atividade Física',
            category: 'behavioral',
            value: 0.4, // placeholder
            weight: 0.3,
            contribution: 0,
            isModifiable: true,
            description: 'Frequência e intensidade de atividade física'
        });
        // Comorbidades
        const hasMultipleConditions = (patient.conditions?.length || 0) > 2;
        factors.push({
            id: 'decond-comorbidities',
            name: 'Comorbidades',
            category: 'clinical',
            value: hasMultipleConditions ? 0.7 : 0.3,
            weight: 0.2,
            contribution: 0,
            isModifiable: false,
            description: `${patient.conditions?.length || 0} condições registradas`
        });
        // Tempo de inatividade
        factors.push({
            id: 'decond-inactivity-duration',
            name: 'Tempo de Inatividade',
            category: 'clinical',
            value: 0.5, // placeholder
            weight: 0.25,
            contribution: 0,
            isModifiable: false,
            description: 'Duração do período de inatividade/repouso'
        });
        // Motivação/Autocuidado
        factors.push({
            id: 'decond-motivation',
            name: 'Motivação e Autocuidado',
            category: 'behavioral',
            value: 0.35, // placeholder
            weight: 0.15,
            contribution: 0,
            isModifiable: true,
            description: 'Engajamento com programa de exercícios domiciliares'
        });
        // Suporte social
        factors.push({
            id: 'decond-social-support',
            name: 'Suporte Social',
            category: 'social',
            value: 0.3, // placeholder
            weight: 0.1,
            contribution: 0,
            isModifiable: true,
            description: 'Apoio familiar e social para atividade física'
        });
        return factors;
    }
    /**
     * Fatores de risco de dor crônica
     */
    collectChronicPainRiskFactors(patient, additionalData) {
        const factors = [];
        // Duração da dor
        factors.push({
            id: 'pain-duration',
            name: 'Duração da Dor',
            category: 'clinical',
            value: 0.6, // placeholder
            weight: 0.25,
            contribution: 0,
            isModifiable: false,
            description: 'Tempo desde o início dos sintomas'
        });
        // Intensidade da dor
        if (additionalData?.soapNotes && additionalData.soapNotes.length > 0) {
            const recentNotes = additionalData.soapNotes.slice(-5);
            const avgPain = recentNotes.reduce((sum, note) => sum + (note.painScale || 0), 0) / recentNotes.length;
            factors.push({
                id: 'pain-intensity',
                name: 'Intensidade da Dor',
                category: 'clinical',
                value: avgPain / 10,
                weight: 0.2,
                contribution: 0,
                isModifiable: true,
                description: `Média de ${avgPain.toFixed(1)}/10 nas últimas avaliações`
            });
        }
        // Aspectos psicológicos
        factors.push({
            id: 'pain-psychological',
            name: 'Fatores Psicológicos',
            category: 'clinical',
            value: 0.5, // placeholder
            weight: 0.2,
            contribution: 0,
            isModifiable: true,
            description: 'Ansiedade, depressão, catastrofização'
        });
        // Resposta ao tratamento
        factors.push({
            id: 'pain-treatment-response',
            name: 'Resposta ao Tratamento',
            category: 'clinical',
            value: 0.4, // placeholder
            weight: 0.2,
            contribution: 0,
            isModifiable: true,
            description: 'Melhora com tratamentos anteriores'
        });
        // Interferência funcional
        factors.push({
            id: 'pain-functional-interference',
            name: 'Interferência Funcional',
            category: 'clinical',
            value: 0.55, // placeholder
            weight: 0.15,
            contribution: 0,
            isModifiable: true,
            description: 'Impacto da dor nas atividades diárias'
        });
        return factors;
    }
    /**
     * Gera recomendações baseadas no risco
     */
    generateRecommendations(riskType, riskLevel, factors) {
        const recommendations = [];
        // Recomendações genéricas baseadas no nível de risco
        if (riskLevel === RiskLevel.Critical || riskLevel === RiskLevel.High) {
            recommendations.push({
                id: `rec-${Date.now()}-1`,
                priority: 'high',
                action: 'Agendar avaliação presencial urgente',
                rationale: `Paciente apresenta risco ${riskLevel} de ${this.getRiskTypeName(riskType)}`,
                targetFactors: factors.filter(f => f.value > 0.6).map(f => f.id || ''),
                estimatedImpact: 30,
                category: 'intervention',
                completed: false
            });
        }
        // Recomendações específicas por tipo
        switch (riskType) {
            case RiskType.Fall:
                recommendations.push(...this.generateFallRecommendations(riskLevel, factors));
                break;
            case RiskType.Abandonment:
                recommendations.push(...this.generateAbandonmentRecommendations(riskLevel, factors));
                break;
            case RiskType.NoShow:
                recommendations.push(...this.generateNoShowRecommendations(riskLevel, factors));
                break;
            // ... outros tipos
        }
        return recommendations;
    }
    generateFallRecommendations(riskLevel, factors) {
        const recommendations = [];
        if (riskLevel !== RiskLevel.Low) {
            recommendations.push({
                id: `rec-fall-${Date.now()}-1`,
                priority: riskLevel === RiskLevel.Critical ? 'high' : 'medium',
                action: 'Implementar programa de treino de equilíbrio',
                rationale: 'Treino de equilíbrio reduz risco de quedas em 24%',
                targetFactors: ['fall-balance'],
                estimatedImpact: 25,
                category: 'intervention',
                completed: false
            });
            recommendations.push({
                id: `rec-fall-${Date.now()}-2`,
                priority: 'medium',
                action: 'Avaliar ambiente domiciliar e modificar riscos',
                rationale: 'Modificações ambientais reduzem risco de quedas',
                targetFactors: ['fall-environment'],
                estimatedImpact: 15,
                category: 'prevention',
                completed: false
            });
        }
        return recommendations;
    }
    generateAbandonmentRecommendations(riskLevel, factors) {
        const recommendations = [];
        if (riskLevel !== RiskLevel.Low) {
            recommendations.push({
                id: `rec-abandon-${Date.now()}-1`,
                priority: 'high',
                action: 'Contato telefônico para entender barreiras ao tratamento',
                rationale: 'Identificar e endereçar barreiras aumenta adesão',
                targetFactors: ['abandon-adherence', 'abandon-satisfaction'],
                estimatedImpact: 35,
                category: 'intervention',
                completed: false
            });
            recommendations.push({
                id: `rec-abandon-${Date.now()}-2`,
                priority: 'medium',
                action: 'Considerar opções de atendimento domiciliar ou teleconsulta',
                rationale: 'Reduzir barreiras de acesso melhora adesão',
                targetFactors: ['abandon-access'],
                estimatedImpact: 25,
                category: 'intervention',
                completed: false
            });
        }
        return recommendations;
    }
    generateNoShowRecommendations(riskLevel, factors) {
        const recommendations = [];
        if (riskLevel !== RiskLevel.Low) {
            recommendations.push({
                id: `rec-noshow-${Date.now()}-1`,
                priority: 'high',
                action: 'Enviar lembretes múltiplos (WhatsApp, SMS, ligação)',
                rationale: 'Lembretes reduzem no-show em 29%',
                targetFactors: ['noshow-confirmation'],
                estimatedImpact: 30,
                category: 'prevention',
                completed: false
            });
            recommendations.push({
                id: `rec-noshow-${Date.now()}-2`,
                priority: 'medium',
                action: 'Solicitar confirmação ativa do paciente',
                rationale: 'Confirmação ativa aumenta comparecimento',
                targetFactors: ['noshow-engagement'],
                estimatedImpact: 20,
                category: 'prevention',
                completed: false
            });
        }
        return recommendations;
    }
    /**
     * Calcula a confiança da predição
     */
    calculateConfidence(factors) {
        // Lógica simplificada - quanto mais fatores com dados reais, maior a confiança
        const factorsWithData = factors.filter(f => f.value !== undefined && f.value !== null);
        const completeness = factorsWithData.length / factors.length;
        // Ajusta confiança baseado na completude dos dados
        return Math.min(0.95, 0.5 + (completeness * 0.45));
    }
    /**
     * Calcula idade a partir da data de nascimento
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
     * Retorna nome descritivo do tipo de risco
     */
    getRiskTypeName(riskType) {
        const names = {
            [RiskType.Fall]: 'Queda',
            [RiskType.Deconditioning]: 'Descondicionamento',
            [RiskType.Abandonment]: 'Abandono do Tratamento',
            [RiskType.NoShow]: 'Falta',
            [RiskType.Complication]: 'Complicação',
            [RiskType.Readmission]: 'Readmissão',
            [RiskType.ChronicPain]: 'Dor Crônica',
            [RiskType.FunctionalDecline]: 'Declínio Funcional'
        };
        return names[riskType] || riskType;
    }
    /**
     * Obtém perfil de risco completo de um paciente
     */
    async getPatientRiskProfile(patient, additionalData) {
        // Avalia todos os tipos de risco
        const riskTypes = [
            RiskType.Fall,
            RiskType.Abandonment,
            RiskType.NoShow,
            RiskType.Deconditioning,
            RiskType.ChronicPain
        ];
        const assessments = [];
        for (const riskType of riskTypes) {
            const assessment = await this.assessPatientRisk(patient, riskType, additionalData);
            assessments.push(assessment);
        }
        // Determina nível geral de risco
        const highestRiskLevel = assessments.reduce((max, a) => {
            const levels = [RiskLevel.Low, RiskLevel.Moderate, RiskLevel.High, RiskLevel.Critical];
            return levels.indexOf(a.riskLevel) > levels.indexOf(max) ? a.riskLevel : max;
        }, RiskLevel.Low);
        // Identifica riscos mais altos
        const highestRisks = assessments
            .filter(a => a.riskLevel === RiskLevel.High || a.riskLevel === RiskLevel.Critical)
            .map(a => a.riskType);
        return {
            patientId: patient.id,
            assessments,
            overallRiskLevel: highestRiskLevel,
            highestRisks,
            lastAssessmentDate: new Date(),
            nextAssessmentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
        };
    }
    /**
     * Gera analytics de risco para o período
     */
    async getRiskAnalytics(startDate, endDate, patientIds) {
        // Mock data - em produção buscaria do banco
        return {
            period: { start: startDate, end: endDate },
            totalAssessments: 150,
            riskDistribution: {
                [RiskLevel.Low]: 80,
                [RiskLevel.Moderate]: 45,
                [RiskLevel.High]: 20,
                [RiskLevel.Critical]: 5
            },
            topRiskTypes: [
                { type: RiskType.NoShow, count: 35, averageScore: 45 },
                { type: RiskType.Abandonment, count: 28, averageScore: 52 },
                { type: RiskType.Fall, count: 22, averageScore: 38 }
            ],
            interventionEffectiveness: {
                totalInterventions: 45,
                successRate: 0.78,
                averageRiskReduction: 18
            },
            highRiskPatients: 25,
            criticalAlerts: 5
        };
    }
    /**
     * Cria alerta de risco
     */
    async createRiskAlert(assessment) {
        if (assessment.riskLevel === RiskLevel.High || assessment.riskLevel === RiskLevel.Critical) {
            const alert = {
                id: `alert-${Date.now()}`,
                patientId: assessment.patientId,
                patientName: assessment.patientName,
                riskType: assessment.riskType,
                riskLevel: assessment.riskLevel,
                score: assessment.score,
                triggeredAt: new Date(),
                acknowledged: false,
                resolved: false,
                actions: []
            };
            // Aqui você notificaria os usuários apropriados
            return alert;
        }
        throw new Error('Alert only created for High or Critical risk levels');
    }
}
export const riskStratificationService = new RiskStratificationService();
