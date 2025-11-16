// services/integratedProtocolsService.ts
import { Protocol, ProtocolCategory, EvidenceLevel } from '../types';
import { getProtocols as getSystemProtocols, saveProtocol } from './protocolsService';
import { getClinicalProtocols } from '../lib/clinical-content-loader';
import { exerciseProtocolService } from './exerciseProtocolService';

// Função para converter protocolo clínico para formato do sistema
function convertClinicalProtocolToSystemFormat(clinicalProtocol: any): Protocol {
  return {
    id: `clinical-${clinicalProtocol.id}`,
    name: clinicalProtocol.title,
    description: clinicalProtocol.summary,
    category: mapSpecialtyToCategory(clinicalProtocol.specialty),
    evidenceLevel: mapEvidenceLevel(clinicalProtocol.evidenceLevel),
    definition: clinicalProtocol.description,
    inclusionCriteria: clinicalProtocol.inclusionCriteria || [],
    exclusionCriteria: clinicalProtocol.exclusionCriteria || [],
    treatmentPlan: clinicalProtocol.phases.map((phase: any) => ({
      name: phase.name,
      description: phase.description,
      duration: {
        min: phase.durationWeeks || 2,
        max: phase.durationWeeks || 8,
        unit: 'weeks'
      },
      objectives: phase.objectives || [],
      exerciseProgram: phase.exercises?.map((ex: any) => ({
        exerciseName: ex.name,
        sets: ex.sets || 3,
        repetitions: ex.repetitions || 10,
        duration: ex.duration || 30,
        restTime: ex.restTime || 60,
        notes: ex.notes || ''
      })) || []
    })),
    phases: clinicalProtocol.phases.map((phase: any) => phase.name),
    dischargeCriteria: clinicalProtocol.dischargeCriteria || [],
    successRate: 85, // Default success rate for clinical protocols
    timesUsed: 0,
    averageOutcomes: {},
    estimatedDuration: {
      min: Math.min(...clinicalProtocol.phases.map((p: any) => p.durationWeeks || 2)),
      max: Math.max(...clinicalProtocol.phases.map((p: any) => p.durationWeeks || 8)),
      unit: 'weeks'
    },
    tags: clinicalProtocol.tags || [],
    references: clinicalProtocol.references?.map((ref: any) => ({
      id: `ref-${Date.now()}-${Math.random()}`,
      title: ref.title || ref,
      authors: ref.authors || 'N/A',
      journal: ref.journal || 'N/A',
      year: ref.year || new Date().getFullYear(),
      doi: ref.doi || '',
      relevanceScore: 8,
      evidenceLevel: '1A',
      url: ref.url || ''
    })) || [],
    isActive: true,
    status: 'approved',
    version: '1.0',
    lastUpdated: new Date().toISOString().split('T')[0],
    createdBy: 'clinical-content-system',
    reviewedBy: ['clinical-content-system'],
    approvedAt: new Date().toISOString().split('T')[0],
    // Campos adicionais para integração
    clinicalId: clinicalProtocol.id,
    specialty: clinicalProtocol.specialty,
    linkedExercises: exerciseProtocolService.getExercisesForProtocol(clinicalProtocol.id)
  };
}

// Mapear especialidades para categorias do sistema
function mapSpecialtyToCategory(specialty: string): ProtocolCategory {
  const categoryMap: { [key: string]: ProtocolCategory } = {
    'esportiva': ProtocolCategory.Sports,
    'pos-operatoria': ProtocolCategory.Orthopedic,
    'geriatrica': ProtocolCategory.Neurological // Mais apropriado para geriatria
  };
  return categoryMap[specialty] || ProtocolCategory.Orthopedic;
}

// Mapear níveis de evidência
function mapEvidenceLevel(level: string): EvidenceLevel {
  const levelMap: { [key: string]: EvidenceLevel } = {
    '1A': EvidenceLevel.IA,
    '1B': EvidenceLevel.IB,
    '2A': EvidenceLevel.IIA,
    '2B': EvidenceLevel.IIB,
    '3': EvidenceLevel.IIB,
    '4': EvidenceLevel.IIB
  };
  return levelMap[level] || EvidenceLevel.IIA;
}

// Serviço integrado de protocolos
export class IntegratedProtocolsService {
  private clinicalProtocols: Protocol[] = [];
  private systemProtocols: Protocol[] = [];

  constructor() {
    this.loadClinicalProtocols();
    this.loadSystemProtocols();
  }

  private async loadClinicalProtocols() {
    try {
      const clinicalData = getClinicalProtocols();
      this.clinicalProtocols = clinicalData.map(convertClinicalProtocolToSystemFormat);
      
    } catch (error) {
      console.error('❌ Erro ao carregar protocolos clínicos:', error);
      this.clinicalProtocols = [];
    }
  }

  private async loadSystemProtocols() {
    try {
      this.systemProtocols = await getSystemProtocols();
      
    } catch (error) {
      console.error('❌ Erro ao carregar protocolos do sistema:', error);
      this.systemProtocols = [];
    }
  }

  // Obter todos os protocolos (sistema + clínico)
  async getAllProtocols(filters?: {
    category?: ProtocolCategory;
    evidenceLevel?: EvidenceLevel;
    isActive?: boolean;
    searchTerm?: string;
    specialty?: string;
    includeClinical?: boolean;
    includeSystem?: boolean;
  }): Promise<Protocol[]> {
    let protocols: Protocol[] = [];

    // Incluir protocolos clínicos se solicitado
    if (filters?.includeClinical !== false) {
      protocols = [...protocols, ...this.clinicalProtocols];
    }

    // Incluir protocolos do sistema se solicitado
    if (filters?.includeSystem !== false) {
      protocols = [...protocols, ...this.systemProtocols];
    }

    // Aplicar filtros
    if (filters?.category) {
      protocols = protocols.filter(p => p.category === filters.category);
    }

    if (filters?.evidenceLevel) {
      protocols = protocols.filter(p => p.evidenceLevel === filters.evidenceLevel);
    }

    if (filters?.isActive !== undefined) {
      protocols = protocols.filter(p => p.isActive === filters.isActive);
    }

    if (filters?.specialty) {
      protocols = protocols.filter(p => (p as any).specialty === filters.specialty);
    }

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      protocols = protocols.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower) ||
        p.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }

    return protocols.sort((a, b) => b.timesUsed - a.timesUsed);
  }

  // Obter protocolos por especialidade
  async getProtocolsBySpecialty(specialty: string): Promise<Protocol[]> {
    return this.getAllProtocols({ specialty, includeSystem: false });
  }

  // Obter protocolos clínicos com exercícios vinculados
  async getClinicalProtocolsWithExercises(): Promise<Array<Protocol & { linkedExercises: any[] }>> {
    return this.clinicalProtocols.map(protocol => ({
      ...protocol,
      linkedExercises: exerciseProtocolService.getExercisesForProtocol((protocol as any).clinicalId)
    }));
  }

  // Obter estatísticas integradas
  async getIntegratedStats() {
    const allProtocols = await this.getAllProtocols();
    const clinicalProtocols = this.clinicalProtocols;
    const systemProtocols = this.systemProtocols;

    const specialties = {
      esportiva: clinicalProtocols.filter(p => (p as any).specialty === 'esportiva').length,
      'pos-operatoria': clinicalProtocols.filter(p => (p as any).specialty === 'pos-operatoria').length,
      geriatrica: clinicalProtocols.filter(p => (p as any).specialty === 'geriatrica').length
    };

    const categories = allProtocols.reduce((acc, protocol) => {
      acc[protocol.category] = (acc[protocol.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const evidenceLevels = allProtocols.reduce((acc, protocol) => {
      acc[protocol.evidenceLevel] = (acc[protocol.evidenceLevel] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    return {
      totalProtocols: allProtocols.length,
      clinicalProtocols: clinicalProtocols.length,
      systemProtocols: systemProtocols.length,
      specialties,
      categories,
      evidenceLevels,
      protocolsWithExercises: clinicalProtocols.filter(p => 
        exerciseProtocolService.getExercisesForProtocol((p as any).clinicalId).length > 0
      ).length
    };
  }

  // Prescrever protocolo clínico
  async prescribeClinicalProtocol(
    protocolId: string,
    patientId: string,
    prescribedBy: string
  ): Promise<any> {
    const protocol = this.clinicalProtocols.find(p => p.id === protocolId);
    if (!protocol) {
      throw new Error('Protocolo clínico não encontrado');
    }

    // Usar o serviço de protocolos do sistema para prescrever
    return await saveProtocol({
      ...protocol,
      timesUsed: protocol.timesUsed + 1
    });
  }

  // Obter recomendações de protocolos baseadas em diagnóstico
  async getProtocolRecommendations(diagnosis: string, patientAge?: number): Promise<Protocol[]> {
    const allProtocols = await this.getAllProtocols();
    
    // Filtrar por diagnóstico
    const diagnosisLower = diagnosis.toLowerCase();
    let recommendations = allProtocols.filter(protocol => {
      return protocol.name.toLowerCase().includes(diagnosisLower) ||
             protocol.description.toLowerCase().includes(diagnosisLower) ||
             protocol.tags.some(tag => tag.toLowerCase().includes(diagnosisLower));
    });

    // Filtrar por idade se fornecida
    if (patientAge !== undefined) {
      if (patientAge >= 65) {
        // Priorizar protocolos geriátricos
        recommendations = recommendations.sort((a, b) => {
          const aGeriatric = (a as any).specialty === 'geriatrica' ? 1 : 0;
          const bGeriatric = (b as any).specialty === 'geriatrica' ? 1 : 0;
          return bGeriatric - aGeriatric;
        });
      } else if (patientAge <= 18) {
        // Priorizar protocolos pediátricos (se existirem)
        recommendations = recommendations.filter(p => p.category === ProtocolCategory.Pediatric);
      }
    }

    return recommendations.slice(0, 5); // Top 5 recomendações
  }

  // Refresh dados
  async refresh() {
    await this.loadClinicalProtocols();
    await this.loadSystemProtocols();
  }
}

// Instância singleton
export const integratedProtocolsService = new IntegratedProtocolsService();

// Funções de conveniência
export const getIntegratedProtocols = (filters?: any) => 
  integratedProtocolsService.getAllProtocols(filters);

export const getClinicalProtocolsWithExercises = () => 
  integratedProtocolsService.getClinicalProtocolsWithExercises();

export const getIntegratedStats = () => 
  integratedProtocolsService.getIntegratedStats();

export const prescribeClinicalProtocol = (protocolId: string, patientId: string, prescribedBy: string) => 
  integratedProtocolsService.prescribeClinicalProtocol(protocolId, patientId, prescribedBy);

export const getProtocolRecommendations = (diagnosis: string, patientAge?: number) => 
  integratedProtocolsService.getProtocolRecommendations(diagnosis, patientAge);
