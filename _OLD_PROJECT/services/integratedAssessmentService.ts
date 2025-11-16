// services/integratedAssessmentService.ts
import { Protocol, ProtocolCategory } from '../types';
import { SpecializedAssessment, ScoringCriteria } from '../types/clinicalContent';
import { integratedProtocolsService } from './integratedProtocolsService';
import { getAssessments } from '../lib/clinical-content-loader';
import { AssessmentsService } from './clinicalContentService';

// Interface para resultado de avaliação
export interface AssessmentResult {
  assessmentId: string;
  patientId: string;
  assessedBy: string;
  assessedAt: string;
  scores: AssessmentScore[];
  totalScore?: number;
  interpretation: string;
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  recommendedProtocols: string[];
  notes?: string;
}

export interface AssessmentScore {
  criteriaId: string;
  criteriaName: string;
  score: number;
  maxScore: number;
  interpretation: string;
}

// Regras de recomendação de protocolos baseadas em avaliações
interface RecommendationRule {
  assessmentId: string;
  scoreRange: { min: number; max: number };
  severity: 'normal' | 'mild' | 'moderate' | 'severe';
  recommendedProtocolIds: string[];
  recommendedSpecialties: string[];
  keywords: string[];
}

// Regras de recomendação predefinidas
const RECOMMENDATION_RULES: RecommendationRule[] = [
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
  private assessmentsService: AssessmentsService;
  private assessmentResults: Map<string, AssessmentResult[]> = new Map();

  constructor() {
    this.assessmentsService = new AssessmentsService();
  }

  // Obter todas as avaliações
  async getAllAssessments(): Promise<SpecializedAssessment[]> {
    try {
      // Combinar avaliações do sistema com avaliações clínicas
      const clinicalAssessments = getAssessments();
      const systemAssessments = this.assessmentsService.getAll();
      
      // Converter avaliações clínicas para o formato do sistema
      const convertedClinicalAssessments = clinicalAssessments.map(this.convertClinicalAssessment);
      
      return [...systemAssessments, ...convertedClinicalAssessments];
    } catch (error) {
      console.error('Erro ao carregar avaliações:', error);
      return this.assessmentsService.getAll();
    }
  }

  // Converter avaliação clínica para formato do sistema
  private convertClinicalAssessment(clinicalAssessment: any): SpecializedAssessment {
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
  async getAssessmentsBySpecialty(specialty: string): Promise<SpecializedAssessment[]> {
    const allAssessments = await this.getAllAssessments();
    return allAssessments.filter(a => a.specialty === specialty);
  }

  // Criar resultado de avaliação
  async createAssessmentResult(result: Omit<AssessmentResult, 'recommendedProtocols'>): Promise<AssessmentResult> {
    // Gerar recomendações de protocolos baseadas no resultado
    const recommendedProtocols = await this.generateProtocolRecommendations(
      result.assessmentId,
      result.totalScore || 0,
      result.severity
    );

    const fullResult: AssessmentResult = {
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
  async generateProtocolRecommendations(
    assessmentId: string,
    totalScore: number,
    severity: 'normal' | 'mild' | 'moderate' | 'severe'
  ): Promise<string[]> {
    // Encontrar regras aplicáveis
    const applicableRules = RECOMMENDATION_RULES.filter(
      rule =>
        rule.assessmentId === assessmentId &&
        totalScore >= rule.scoreRange.min &&
        totalScore <= rule.scoreRange.max
    );

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
    const recommendedIds = new Set<string>();
    const recommendedSpecialties = new Set<string>();
    const keywords = new Set<string>();

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
        const filtered = protocols.filter(protocol =>
          keywordArray.some(keyword =>
            protocol.name.toLowerCase().includes(keyword.toLowerCase()) ||
            protocol.description.toLowerCase().includes(keyword.toLowerCase()) ||
            protocol.tags.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
          )
        );
        return filtered.slice(0, 3).map(p => p.id);
      }

      return protocols.slice(0, 3).map(p => p.id);
    }

    return Array.from(recommendedIds);
  }

  // Obter avaliação por ID
  async getAssessmentById(assessmentId: string): Promise<SpecializedAssessment | null> {
    const allAssessments = await this.getAllAssessments();
    return allAssessments.find(a => a.id === assessmentId) || null;
  }

  // Obter resultados de avaliação do paciente
  async getPatientAssessmentResults(patientId: string): Promise<AssessmentResult[]> {
    return this.assessmentResults.get(patientId) || [];
  }

  // Obter recomendações de protocolos para um paciente baseado em suas avaliações
  async getPatientProtocolRecommendations(patientId: string): Promise<Protocol[]> {
    const results = await this.getPatientAssessmentResults(patientId);
    
    if (results.length === 0) {
      return [];
    }

    // Coletar todos os IDs de protocolos recomendados
    const protocolIds = new Set<string>();
    results.forEach(result => {
      result.recommendedProtocols.forEach(id => protocolIds.add(id));
    });

    // Buscar protocolos
    const allProtocols = await integratedProtocolsService.getAllProtocols();
    const recommendedProtocols = allProtocols.filter(p => protocolIds.has(p.id));

    // Ordenar por relevância (protocolos recomendados em múltiplas avaliações primeiro)
    const protocolCounts = new Map<string, number>();
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
  calculateAssessmentScore(scores: AssessmentScore[]): {
    totalScore: number;
    maxScore: number;
    percentage: number;
    severity: 'normal' | 'mild' | 'moderate' | 'severe';
  } {
    const totalScore = scores.reduce((sum, s) => sum + s.score, 0);
    const maxScore = scores.reduce((sum, s) => sum + s.maxScore, 0);
    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    let severity: 'normal' | 'mild' | 'moderate' | 'severe';
    if (percentage >= 80) {
      severity = 'normal';
    } else if (percentage >= 60) {
      severity = 'mild';
    } else if (percentage >= 40) {
      severity = 'moderate';
    } else {
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
    }, {} as { [key: string]: number });

    const bySeverity = allResults.reduce((acc, result) => {
      acc[result.severity] = (acc[result.severity] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

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
  addRecommendationRule(rule: RecommendationRule): void {
    RECOMMENDATION_RULES.push(rule);
  }

  // Obter regras de recomendação para uma avaliação
  getRecommendationRules(assessmentId: string): RecommendationRule[] {
    return RECOMMENDATION_RULES.filter(rule => rule.assessmentId === assessmentId);
  }
}

// Instância singleton
export const integratedAssessmentService = new IntegratedAssessmentService();

// Funções de conveniência
export const getAllAssessments = () => integratedAssessmentService.getAllAssessments();
export const getAssessmentsBySpecialty = (specialty: string) => integratedAssessmentService.getAssessmentsBySpecialty(specialty);
export const createAssessmentResult = (result: Omit<AssessmentResult, 'recommendedProtocols'>) => integratedAssessmentService.createAssessmentResult(result);
export const getPatientProtocolRecommendations = (patientId: string) => integratedAssessmentService.getPatientProtocolRecommendations(patientId);
export const getAssessmentStats = () => integratedAssessmentService.getAssessmentStats();
