import { integratedProtocolsService } from './integratedProtocolsService';
import { getAssessments } from '../lib/clinical-content-loader';
import { AssessmentsService } from './clinicalContentService';
// Regras de recomendação predefinidas
const RECOMMENDATION_RULES = [
    // Avaliação Funcional Esportiva
    {
        assessmentId: 'aval-esp-001',
        scoreRange: { min: 0, max: 50 },
        severity: 'severe',
        recommendedProtocolIds: ['clinical-protocol-sport-001', 'clinical-protocol-sport-002'],
        recommendedSpecialties: ['esportiva'],
        keywords: ['joelho', 'lesão', 'atleta', 'força', 'potência']
    },
    {
        assessmentId: 'aval-esp-001',
        scoreRange: { min: 51, max: 70 },
        severity: 'moderate',
        recommendedProtocolIds: ['clinical-protocol-sport-001'],
        recommendedSpecialties: ['esportiva'],
        keywords: ['atleta', 'recuperação', 'força']
    },
    {
        assessmentId: 'aval-esp-001',
        scoreRange: { min: 71, max: 100 },
        severity: 'mild',
        recommendedProtocolIds: [],
        recommendedSpecialties: ['esportiva'],
        keywords: ['prevenção', 'manutenção']
    },
    // Avaliação Pós-Operatória de Joelho
    {
        assessmentId: 'aval-pos-001',
        scoreRange: { min: 0, max: 40 },
        severity: 'severe',
        recommendedProtocolIds: ['clinical-protocol-postop-001', 'clinical-protocol-postop-002'],
        recommendedSpecialties: ['pos-operatoria'],
        keywords: ['joelho', 'cirurgia', 'reabilitação', 'pós-operatório']
    },
    {
        assessmentId: 'aval-pos-001',
        scoreRange: { min: 41, max: 70 },
        severity: 'moderate',
        recommendedProtocolIds: ['clinical-protocol-postop-001'],
        recommendedSpecialties: ['pos-operatoria'],
        keywords: ['joelho', 'reabilitação']
    },
    // Avaliação Pós-Operatória de Quadril
    {
        assessmentId: 'aval-pos-002',
        scoreRange: { min: 0, max: 45 },
        severity: 'severe',
        recommendedProtocolIds: ['clinical-protocol-postop-003'],
        recommendedSpecialties: ['pos-operatoria'],
        keywords: ['quadril', 'cirurgia', 'artroplastia']
    },
    // Avaliação de Risco de Quedas
    {
        assessmentId: 'aval-geri-001',
        scoreRange: { min: 0, max: 40 },
        severity: 'severe',
        recommendedProtocolIds: ['clinical-protocol-geri-001'],
        recommendedSpecialties: ['geriatrica'],
        keywords: ['idoso', 'queda', 'equilíbrio', 'prevenção']
    },
    {
        assessmentId: 'aval-geri-001',
        scoreRange: { min: 41, max: 70 },
        severity: 'moderate',
        recommendedProtocolIds: ['clinical-protocol-geri-001', 'clinical-protocol-geri-002'],
        recommendedSpecialties: ['geriatrica'],
        keywords: ['idoso', 'equilíbrio']
    },
    // Avaliação de Capacidade Funcional do Idoso
    {
        assessmentId: 'aval-geri-002',
        scoreRange: { min: 0, max: 50 },
        severity: 'severe',
        recommendedProtocolIds: ['clinical-protocol-geri-002'],
        recommendedSpecialties: ['geriatrica'],
        keywords: ['idoso', 'autonomia', 'funcional']
    }
];
// Serviço integrado de avaliações e protocolos
export class IntegratedAssessmentService {
    constructor() {
        this.assessmentResults = new Map();
        this.assessmentsService = new AssessmentsService();
    }
    // Obter todas as avaliações
    async getAllAssessments() {
        try {
            // Combinar avaliações do sistema com avaliações clínicas
            const clinicalAssessments = getAssessments();
            const systemAssessments = this.assessmentsService.getAll();
            // Converter avaliações clínicas para o formato do sistema
            const convertedClinicalAssessments = clinicalAssessments.map(this.convertClinicalAssessment);
            return [...systemAssessments, ...convertedClinicalAssessments];
        }
        catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            return this.assessmentsService.getAll();
        }
    }
    // Converter avaliação clínica para formato do sistema
    convertClinicalAssessment(clinicalAssessment) {
        return {
            id: `clinical-${clinicalAssessment.id}`,
            title: clinicalAssessment.title,
            specialty: clinicalAssessment.specialty,
            description: clinicalAssessment.description,
            purpose: clinicalAssessment.purpose,
            targetPopulation: clinicalAssessment.targetPopulation,
            duration: clinicalAssessment.duration,
            materials: clinicalAssessment.materials || [],
            procedures: clinicalAssessment.procedures || [],
            scoringCriteria: clinicalAssessment.scoringCriteria || [],
            interpretationGuide: clinicalAssessment.interpretationGuide || [],
            references: clinicalAssessment.references || [],
            images: clinicalAssessment.images || [],
            tags: clinicalAssessment.tags || [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }
    // Obter avaliações por especialidade
    async getAssessmentsBySpecialty(specialty) {
        const allAssessments = await this.getAllAssessments();
        return allAssessments.filter(a => a.specialty === specialty);
    }
    // Criar resultado de avaliação
    async createAssessmentResult(result) {
        // Gerar recomendações de protocolos baseadas no resultado
        const recommendedProtocols = await this.generateProtocolRecommendations(result.assessmentId, result.totalScore || 0, result.severity);
        const fullResult = {
            ...result,
            recommendedProtocols
        };
        // Armazenar resultado
        const patientResults = this.assessmentResults.get(result.patientId) || [];
        patientResults.push(fullResult);
        this.assessmentResults.set(result.patientId, patientResults);
        return fullResult;
    }
    // Gerar recomendações de protocolos baseadas no resultado da avaliação
    async generateProtocolRecommendations(assessmentId, totalScore, severity) {
        // Encontrar regras aplicáveis
        const applicableRules = RECOMMENDATION_RULES.filter(rule => rule.assessmentId === assessmentId &&
            totalScore >= rule.scoreRange.min &&
            totalScore <= rule.scoreRange.max);
        if (applicableRules.length === 0) {
            // Sem regras específicas, recomendar por especialidade
            const assessment = await this.getAssessmentById(assessmentId);
            if (assessment) {
                const protocols = await integratedProtocolsService.getAllProtocols({
                    specialty: assessment.specialty
                });
                return protocols.slice(0, 3).map(p => p.id);
            }
            return [];
        }
        // Coletar protocolos recomendados de todas as regras aplicáveis
        const recommendedIds = new Set();
        const recommendedSpecialties = new Set();
        const keywords = new Set();
        applicableRules.forEach(rule => {
            rule.recommendedProtocolIds.forEach(id => recommendedIds.add(id));
            rule.recommendedSpecialties.forEach(specialty => recommendedSpecialties.add(specialty));
            rule.keywords.forEach(keyword => keywords.add(keyword));
        });
        // Se não há protocolos específicos, buscar por especialidade e keywords
        if (recommendedIds.size === 0 && recommendedSpecialties.size > 0) {
            const protocols = await integratedProtocolsService.getAllProtocols({
                specialty: Array.from(recommendedSpecialties)[0]
            });
            // Filtrar por keywords se disponíveis
            if (keywords.size > 0) {
                const keywordArray = Array.from(keywords);
                const filtered = protocols.filter(protocol => keywordArray.some(keyword => protocol.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    protocol.description.toLowerCase().includes(keyword.toLowerCase()) ||
                    protocol.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))));
                return filtered.slice(0, 3).map(p => p.id);
            }
            return protocols.slice(0, 3).map(p => p.id);
        }
        return Array.from(recommendedIds);
    }
    // Obter avaliação por ID
    async getAssessmentById(assessmentId) {
        const allAssessments = await this.getAllAssessments();
        return allAssessments.find(a => a.id === assessmentId) || null;
    }
    // Obter resultados de avaliação do paciente
    async getPatientAssessmentResults(patientId) {
        return this.assessmentResults.get(patientId) || [];
    }
    // Obter recomendações de protocolos para um paciente baseado em suas avaliações
    async getPatientProtocolRecommendations(patientId) {
        const results = await this.getPatientAssessmentResults(patientId);
        if (results.length === 0) {
            return [];
        }
        // Coletar todos os IDs de protocolos recomendados
        const protocolIds = new Set();
        results.forEach(result => {
            result.recommendedProtocols.forEach(id => protocolIds.add(id));
        });
        // Buscar protocolos
        const allProtocols = await integratedProtocolsService.getAllProtocols();
        const recommendedProtocols = allProtocols.filter(p => protocolIds.has(p.id));
        // Ordenar por relevância (protocolos recomendados em múltiplas avaliações primeiro)
        const protocolCounts = new Map();
        results.forEach(result => {
            result.recommendedProtocols.forEach(id => {
                protocolCounts.set(id, (protocolCounts.get(id) || 0) + 1);
            });
        });
        return recommendedProtocols.sort((a, b) => {
            const countA = protocolCounts.get(a.id) || 0;
            const countB = protocolCounts.get(b.id) || 0;
            return countB - countA;
        });
    }
    // Calcular score de avaliação
    calculateAssessmentScore(scores) {
        const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
        const maxScore = scores.reduce((sum, s) => sum + s.maxScore, 0);
        const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        let severity;
        if (percentage >= 80) {
            severity = 'normal';
        }
        else if (percentage >= 60) {
            severity = 'mild';
        }
        else if (percentage >= 40) {
            severity = 'moderate';
        }
        else {
            severity = 'severe';
        }
        return { totalScore, maxScore, percentage, severity };
    }
    // Obter estatísticas de avaliações
    async getAssessmentStats() {
        const allAssessments = await this.getAllAssessments();
        const allResults = Array.from(this.assessmentResults.values()).flat();
        const bySpecialty = allAssessments.reduce((acc, assessment) => {
            acc[assessment.specialty] = (acc[assessment.specialty] || 0) + 1;
            return acc;
        }, {});
        const bySeverity = allResults.reduce((acc, result) => {
            acc[result.severity] = (acc[result.severity] || 0) + 1;
            return acc;
        }, {});
        const totalAssessments = allAssessments.length;
        const totalResults = allResults.length;
        const averageRecommendations = totalResults > 0
            ? allResults.reduce((sum, r) => sum + r.recommendedProtocols.length, 0) / totalResults
            : 0;
        return {
            totalAssessments,
            totalResults,
            bySpecialty,
            bySeverity,
            averageRecommendations: averageRecommendations.toFixed(1)
        };
    }
    // Adicionar regra de recomendação personalizada
    addRecommendationRule(rule) {
        RECOMMENDATION_RULES.push(rule);
    }
    // Obter regras de recomendação para uma avaliação
    getRecommendationRules(assessmentId) {
        return RECOMMENDATION_RULES.filter(rule => rule.assessmentId === assessmentId);
    }
}
// Instância singleton
export const integratedAssessmentService = new IntegratedAssessmentService();
// Funções de conveniência
export const getAllAssessments = () => integratedAssessmentService.getAllAssessments();
export const getAssessmentsBySpecialty = (specialty) => integratedAssessmentService.getAssessmentsBySpecialty(specialty);
export const createAssessmentResult = (result) => integratedAssessmentService.createAssessmentResult(result);
export const getPatientProtocolRecommendations = (patientId) => integratedAssessmentService.getPatientProtocolRecommendations(patientId);
export const getAssessmentStats = () => integratedAssessmentService.getAssessmentStats();
