// services/protocolsService.ts
import {
  Protocol,
  ProtocolCategory,
  EvidenceLevel,
  ProtocolPhase,
  ProtocolAnalytics,
  ProtocolLibraryStats,
  ProtocolPrescription,
  ProtocolCustomization,
  AssessmentResult,
  ProtocolOutcome,
  ProtocolModification,
  AssessmentTool,
  OutcomeMetric,
  ProtocolReference
} from '../types';

import {
  mockProtocols,
  mockProtocolAnalytics,
  mockProtocolLibraryStats,
  mockProtocolPrescriptions,
  mockAssessmentTools,
  mockOutcomeMetrics,
  mockProtocolReferences
} from '../data/mockProtocolsData';

import { generateClinicalMaterialContent } from './geminiService';

// In-memory storage for development
let protocols: Protocol[] = [...mockProtocols];
let protocolAnalytics: ProtocolAnalytics[] = [...mockProtocolAnalytics];
let protocolPrescriptions: ProtocolPrescription[] = [...mockProtocolPrescriptions];
let assessmentTools: AssessmentTool[] = [...mockAssessmentTools];
let outcomeMetrics: OutcomeMetric[] = [...mockOutcomeMetrics];
let protocolReferences: ProtocolReference[] = [...mockProtocolReferences];

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// ============================================================================
// PROTOCOL LIBRARY MANAGEMENT
// ============================================================================

export const getProtocols = async (filters?: {
  category?: ProtocolCategory;
  evidenceLevel?: EvidenceLevel;
  isActive?: boolean;
  searchTerm?: string;
}): Promise<Protocol[]> => {
  await delay(400);
  
  let filteredProtocols = [...protocols];
  
  if (filters?.category) {
    filteredProtocols = filteredProtocols.filter(p => p.category === filters.category);
  }
  
  if (filters?.evidenceLevel) {
    filteredProtocols = filteredProtocols.filter(p => p.evidenceLevel === filters.evidenceLevel);
  }
  
  if (filters?.isActive !== undefined) {
    filteredProtocols = filteredProtocols.filter(p => p.isActive === filters.isActive);
  }
  
  if (filters?.searchTerm) {
    const searchLower = filters.searchTerm.toLowerCase();
    filteredProtocols = filteredProtocols.filter(p => 
      p.name.toLowerCase().includes(searchLower) ||
      p.description.toLowerCase().includes(searchLower) ||
      p.tags.some(tag => tag.toLowerCase().includes(searchLower))
    );
  }
  
  return filteredProtocols.sort((a, b) => b.timesUsed - a.timesUsed);
};

export const getProtocolById = async (id: string): Promise<Protocol | null> => {
  await delay(200);
  return protocols.find(p => p.id === id) || null;
};

export const saveProtocol = async (protocolData: Omit<Protocol, 'id' | 'timesUsed' | 'averageOutcomes'> & { id?: string }): Promise<Protocol> => {
  await delay(500);
  
  if (protocolData.id) {
    // Update existing protocol
    const index = protocols.findIndex(p => p.id === protocolData.id);
    if (index > -1) {
      const existingProtocol = protocols[index];
      const updatedProtocol: Protocol = {
        ...existingProtocol,
        ...protocolData,
        lastUpdated: new Date().toISOString().split('T')[0],
        // Preserve usage statistics
        timesUsed: existingProtocol.timesUsed,
        averageOutcomes: existingProtocol.averageOutcomes
      };
      protocols[index] = updatedProtocol;
      return updatedProtocol;
    }
    throw new Error("Protocol not found");
  } else {
    // Create new protocol
    const newProtocol: Protocol = {
      id: `protocol_${Date.now()}`,
      ...protocolData,
      lastUpdated: new Date().toISOString().split('T')[0],
      timesUsed: 0,
      averageOutcomes: {}
    };
    protocols.unshift(newProtocol);
    return newProtocol;
  }
};

export const deleteProtocol = async (id: string): Promise<void> => {
  await delay(300);
  const index = protocols.findIndex(p => p.id === id);
  if (index > -1) {
    protocols.splice(index, 1);
    // Also remove related prescriptions and analytics
    protocolPrescriptions = protocolPrescriptions.filter(pp => pp.protocolId !== id);
    protocolAnalytics = protocolAnalytics.filter(pa => pa.protocolId !== id);
  } else {
    throw new Error("Protocol not found");
  }
};

export const duplicateProtocol = async (id: string, newName: string): Promise<Protocol> => {
  await delay(400);
  
  const originalProtocol = protocols.find(p => p.id === id);
  if (!originalProtocol) {
    throw new Error("Protocol not found");
  }
  
  const duplicatedProtocol: Protocol = {
    ...originalProtocol,
    id: `protocol_${Date.now()}`,
    name: newName,
    version: '1.0',
    status: 'draft',
    lastUpdated: new Date().toISOString().split('T')[0],
    timesUsed: 0,
    averageOutcomes: {},
    approvedAt: undefined
  };
  
  protocols.unshift(duplicatedProtocol);
  return duplicatedProtocol;
};

// ============================================================================
// PROTOCOL SUGGESTIONS AND AI INTEGRATION
// ============================================================================

export const getProtocolSuggestions = async (diagnosis: string): Promise<Protocol[]> => {
  await delay(300);
  const lowerDiagnosis = diagnosis.toLowerCase();
  
  // Enhanced search logic
  return protocols.filter(p => {
    // Direct name/description match
    if (p.name.toLowerCase().includes(lowerDiagnosis) || 
        p.description.toLowerCase().includes(lowerDiagnosis)) {
      return true;
    }
    
    // Tag matching
    if (p.tags.some(tag => tag.toLowerCase().includes(lowerDiagnosis))) {
      return true;
    }
    
    // Specific condition matching
    const conditionMappings = {
      'lca': ['lca', 'ligamento cruzado', 'joelho'],
      'avc': ['avc', 'acidente vascular', 'hemiplegia', 'neurolog'],
      'lombalgia': ['lombar', 'coluna', 'dor nas costas'],
      'ombro': ['ombro', 'manguito rotador', 'glenoumeral'],
      'quadril': ['quadril', 'coxofemoral', 'artrose'],
      'cervical': ['cervical', 'pescoço', 'whiplash']
    };
    
    for (const [condition, keywords] of Object.entries(conditionMappings)) {
      if (lowerDiagnosis.includes(condition)) {
        return keywords.some(keyword => 
          p.name.toLowerCase().includes(keyword) ||
          p.description.toLowerCase().includes(keyword) ||
          p.tags.some(tag => tag.toLowerCase().includes(keyword))
        );
      }
    }
    
    return false;
  }).sort((a, b) => b.successRate! - a.successRate!);
};

export const generateProtocolContent = async (protocol: Protocol): Promise<string> => {
  // Enhanced content generation using existing Gemini service
  const prompt = `Gere um conteúdo detalhado para o protocolo clínico: ${protocol.name}
  
  Categoria: ${protocol.category}
  Descrição: ${protocol.description}
  
  Inclua:
  - Definição da condição
  - Critérios de inclusão e exclusão
  - Fases do tratamento
  - Exercícios específicos
  - Critérios de progressão
  - Evidências científicas
  
  Formato em markdown com estrutura clara e profissional.`;
  
  try {
    return await generateClinicalMaterialContent({
      nome_material: protocol.name,
      tipo_material: 'Protocolo Clínico'
    });
  } catch (error) {
    // Fallback content
    return generateFallbackProtocolContent(protocol);
  }
};

const generateFallbackProtocolContent = (protocol: Protocol): string => {
  return `# ${protocol.name}

## Definição
${protocol.definition}

## Critérios de Inclusão
${protocol.inclusionCriteria.map(c => `- ${c}`).join('\n')}

## Critérios de Exclusão
${protocol.exclusionCriteria.map(c => `- ${c}`).join('\n')}

## Fases do Tratamento

${protocol.treatmentPlan.map(phase => `
### ${phase.name}
**Duração:** ${phase.duration.min}-${phase.duration.max} ${phase.duration.unit}

**Objetivos:**
${phase.objectives.map(obj => `- ${obj}`).join('\n')}

**Exercícios:**
${phase.exerciseProgram.map(ex => `- ${ex.exerciseName}: ${ex.sets}x${ex.repetitions}`).join('\n')}
`).join('\n')}

## Critérios de Alta
${protocol.dischargeCriteria.map(c => `- ${c}`).join('\n')}

## Evidências Científicas
Nível de Evidência: ${protocol.evidenceLevel}
${protocol.references.map(ref => `- ${ref.title} (${ref.year})`).join('\n')}
`;
};

// ============================================================================
// PROTOCOL PRESCRIPTION MANAGEMENT
// ============================================================================

export const prescribeProtocol = async (
  protocolId: string,
  patientId: string,
  prescribedBy: string,
  customizations?: ProtocolCustomization[],
  additionalNotes?: string
): Promise<ProtocolPrescription> => {
  await delay(400);
  
  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) {
    throw new Error("Protocol not found");
  }
  
  const newPrescription: ProtocolPrescription = {
    id: `prescription_${Date.now()}`,
    protocolId,
    patientId,
    prescribedBy,
    prescribedAt: new Date().toISOString(),
    currentPhase: protocol.phases[0], // Start with first phase
    startDate: new Date().toISOString().split('T')[0],
    estimatedEndDate: calculateEstimatedEndDate(protocol),
    customizations: customizations || [],
    excludedInterventions: [],
    additionalNotes: additionalNotes || '',
    phaseHistory: [],
    assessmentResults: [],
    adherenceRate: 100, // Start at 100%
    outcomes: [],
    complications: [],
    modifications: [],
    status: 'active'
  };
  
  protocolPrescriptions.unshift(newPrescription);
  
  // Update protocol usage statistics
  protocol.timesUsed += 1;
  
  return newPrescription;
};

const calculateEstimatedEndDate = (protocol: Protocol): string => {
  const startDate = new Date();
  const estimatedDays = protocol.estimatedDuration.max * (
    protocol.estimatedDuration.unit === 'weeks' ? 7 :
    protocol.estimatedDuration.unit === 'months' ? 30 : 1
  );
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + estimatedDays);
  
  return endDate.toISOString().split('T')[0];
};

export const getProtocolPrescriptions = async (filters?: {
  patientId?: string;
  protocolId?: string;
  prescribedBy?: string;
  status?: string;
}): Promise<ProtocolPrescription[]> => {
  await delay(300);
  
  let filteredPrescriptions = [...protocolPrescriptions];
  
  if (filters?.patientId) {
    filteredPrescriptions = filteredPrescriptions.filter(pp => pp.patientId === filters.patientId);
  }
  
  if (filters?.protocolId) {
    filteredPrescriptions = filteredPrescriptions.filter(pp => pp.protocolId === filters.protocolId);
  }
  
  if (filters?.prescribedBy) {
    filteredPrescriptions = filteredPrescriptions.filter(pp => pp.prescribedBy === filters.prescribedBy);
  }
  
  if (filters?.status) {
    filteredPrescriptions = filteredPrescriptions.filter(pp => pp.status === filters.status);
  }
  
  return filteredPrescriptions.sort((a, b) => new Date(b.prescribedAt).getTime() - new Date(a.prescribedAt).getTime());
};

export const updateProtocolPrescription = async (
  prescriptionId: string,
  updates: Partial<ProtocolPrescription>
): Promise<ProtocolPrescription> => {
  await delay(400);
  
  const index = protocolPrescriptions.findIndex(pp => pp.id === prescriptionId);
  if (index === -1) {
    throw new Error("Protocol prescription not found");
  }
  
  protocolPrescriptions[index] = { ...protocolPrescriptions[index], ...updates };
  return protocolPrescriptions[index];
};

export const addAssessmentResult = async (
  prescriptionId: string,
  assessment: Omit<AssessmentResult, 'id'>
): Promise<AssessmentResult> => {
  await delay(300);
  
  const prescription = protocolPrescriptions.find(pp => pp.id === prescriptionId);
  if (!prescription) {
    throw new Error("Protocol prescription not found");
  }
  
  const newAssessment: AssessmentResult = {
    id: `assessment_${Date.now()}`,
    ...assessment
  };
  
  prescription.assessmentResults.push(newAssessment);
  return newAssessment;
};

export const recordProtocolOutcome = async (
  prescriptionId: string,
  outcome: Omit<ProtocolOutcome, 'assessedAt'>
): Promise<ProtocolOutcome> => {
  await delay(300);
  
  const prescription = protocolPrescriptions.find(pp => pp.id === prescriptionId);
  if (!prescription) {
    throw new Error("Protocol prescription not found");
  }
  
  const newOutcome: ProtocolOutcome = {
    ...outcome,
    assessedAt: new Date().toISOString()
  };
  
  prescription.outcomes.push(newOutcome);
  return newOutcome;
};

export const addProtocolModification = async (
  prescriptionId: string,
  modification: Omit<ProtocolModification, 'id' | 'modifiedAt'>
): Promise<ProtocolModification> => {
  await delay(300);
  
  const prescription = protocolPrescriptions.find(pp => pp.id === prescriptionId);
  if (!prescription) {
    throw new Error("Protocol prescription not found");
  }
  
  const newModification: ProtocolModification = {
    id: `mod_${Date.now()}`,
    modifiedAt: new Date().toISOString(),
    ...modification
  };
  
  prescription.modifications.push(newModification);
  return newModification;
};

// ============================================================================
// PROTOCOL ANALYTICS
// ============================================================================

export const getProtocolAnalytics = async (protocolId?: string): Promise<ProtocolAnalytics[]> => {
  await delay(400);
  
  if (protocolId) {
    const analytics = protocolAnalytics.find(pa => pa.protocolId === protocolId);
    return analytics ? [analytics] : [];
  }
  
  return [...protocolAnalytics].sort((a, b) => b.successRate - a.successRate);
};

export const getProtocolLibraryStats = async (): Promise<ProtocolLibraryStats> => {
  await delay(300);
  
  // Calculate real-time stats
  const totalProtocols = protocols.length;
  const activeProtocols = protocols.filter(p => p.isActive).length;
  
  const protocolsByCategory = protocols.reduce((acc, protocol) => {
    acc[protocol.category] = (acc[protocol.category] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const protocolsByEvidenceLevel = protocols.reduce((acc, protocol) => {
    acc[protocol.evidenceLevel] = (acc[protocol.evidenceLevel] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const mostUsed = [...protocols]
    .sort((a, b) => b.timesUsed - a.timesUsed)
    .slice(0, 5);
  
  const highestRated = [...protocols]
    .filter(p => p.successRate)
    .sort((a, b) => b.successRate! - a.successRate!)
    .slice(0, 5);
  
  const recentlyUpdated = [...protocols]
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime())
    .slice(0, 5);
  
  const pendingReview = protocols.filter(p => p.status === 'review').length;
  
  const averageSuccessRate = protocols.reduce((sum, p) => sum + (p.successRate || 0), 0) / protocols.length;
  
  return {
    totalProtocols,
    protocolsByCategory,
    protocolsByEvidenceLevel,
    recentlyUpdated,
    mostUsed,
    highestRated,
    pendingReview,
    averageSuccessRate
  };
};

export const generateProtocolReport = async (
  protocolId: string,
  dateRange?: { start: string; end: string }
): Promise<{
  protocol: Protocol;
  analytics: ProtocolAnalytics;
  prescriptions: ProtocolPrescription[];
  summary: {
    totalPrescriptions: number;
    activeCount: number;
    completedCount: number;
    averageAdherence: number;
    successRate: number;
    commonModifications: string[];
  };
}> => {
  await delay(500);
  
  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) {
    throw new Error("Protocol not found");
  }
  
  const analytics = protocolAnalytics.find(pa => pa.protocolId === protocolId);
  if (!analytics) {
    throw new Error("Analytics not found for protocol");
  }
  
  let prescriptions = protocolPrescriptions.filter(pp => pp.protocolId === protocolId);
  
  // Apply date range filter if provided
  if (dateRange) {
    prescriptions = prescriptions.filter(pp => {
      const prescribedDate = new Date(pp.prescribedAt);
      return prescribedDate >= new Date(dateRange.start) && prescribedDate <= new Date(dateRange.end);
    });
  }
  
  const totalPrescriptions = prescriptions.length;
  const activeCount = prescriptions.filter(pp => pp.status === 'active').length;
  const completedCount = prescriptions.filter(pp => pp.status === 'completed').length;
  
  const averageAdherence = prescriptions.reduce((sum, pp) => sum + pp.adherenceRate, 0) / totalPrescriptions;
  
  const successfulCompletions = prescriptions.filter(pp => 
    pp.status === 'completed' && 
    pp.outcomes.some(outcome => outcome.clinicallySignificant)
  ).length;
  const successRate = (successfulCompletions / completedCount) * 100 || 0;
  
  const allModifications = prescriptions.flatMap(pp => pp.modifications);
  const modificationCounts = allModifications.reduce((acc, mod) => {
    acc[mod.description] = (acc[mod.description] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });
  
  const commonModifications = Object.entries(modificationCounts)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([desc]) => desc);
  
  return {
    protocol,
    analytics,
    prescriptions,
    summary: {
      totalPrescriptions,
      activeCount,
      completedCount,
      averageAdherence,
      successRate,
      commonModifications
    }
  };
};

// ============================================================================
// ASSESSMENT TOOLS AND OUTCOME METRICS
// ============================================================================

export const getAssessmentTools = async (filters?: {
  type?: string;
  specialty?: string;
}): Promise<AssessmentTool[]> => {
  await delay(200);
  
  let filteredTools = [...assessmentTools];
  
  if (filters?.type) {
    filteredTools = filteredTools.filter(tool => tool.type === filters.type);
  }
  
  return filteredTools.sort((a, b) => a.name.localeCompare(b.name));
};

export const getOutcomeMetrics = async (filters?: {
  type?: 'primary' | 'secondary';
}): Promise<OutcomeMetric[]> => {
  await delay(200);
  
  let filteredMetrics = [...outcomeMetrics];
  
  if (filters?.type) {
    filteredMetrics = filteredMetrics.filter(metric => metric.type === filters.type);
  }
  
  return filteredMetrics.sort((a, b) => a.name.localeCompare(b.name));
};

// ============================================================================
// PROTOCOL EVIDENCE AND REFERENCES
// ============================================================================

export const getProtocolReferences = async (protocolId?: string): Promise<ProtocolReference[]> => {
  await delay(200);
  
  if (protocolId) {
    const protocol = protocols.find(p => p.id === protocolId);
    return protocol?.references || [];
  }
  
  return [...protocolReferences].sort((a, b) => b.relevanceScore - a.relevanceScore);
};

export const addReferenceToProtocol = async (
  protocolId: string,
  reference: Omit<ProtocolReference, 'id'>
): Promise<ProtocolReference> => {
  await delay(300);
  
  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) {
    throw new Error("Protocol not found");
  }
  
  const newReference: ProtocolReference = {
    id: `ref_${Date.now()}`,
    ...reference
  };
  
  protocol.references.push(newReference);
  protocolReferences.push(newReference);
  
  return newReference;
};

// ============================================================================
// PROTOCOL APPROVAL WORKFLOW
// ============================================================================

export const submitProtocolForReview = async (protocolId: string): Promise<Protocol> => {
  await delay(300);
  
  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) {
    throw new Error("Protocol not found");
  }
  
  if (protocol.status !== 'draft') {
    throw new Error("Only draft protocols can be submitted for review");
  }
  
  protocol.status = 'review';
  protocol.lastUpdated = new Date().toISOString().split('T')[0];
  
  return protocol;
};

export const approveProtocol = async (
  protocolId: string,
  reviewedBy: string
): Promise<Protocol> => {
  await delay(300);
  
  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) {
    throw new Error("Protocol not found");
  }
  
  if (protocol.status !== 'review') {
    throw new Error("Only protocols under review can be approved");
  }
  
  protocol.status = 'approved';
  protocol.approvedAt = new Date().toISOString().split('T')[0];
  protocol.reviewedBy = protocol.reviewedBy ? [...protocol.reviewedBy, reviewedBy] : [reviewedBy];
  protocol.lastUpdated = new Date().toISOString().split('T')[0];
  
  return protocol;
};

export const rejectProtocol = async (
  protocolId: string,
  reason: string,
  reviewedBy: string
): Promise<Protocol> => {
  await delay(300);
  
  const protocol = protocols.find(p => p.id === protocolId);
  if (!protocol) {
    throw new Error("Protocol not found");
  }
  
  if (protocol.status !== 'review') {
    throw new Error("Only protocols under review can be rejected");
  }
  
  protocol.status = 'draft';
  protocol.reviewedBy = protocol.reviewedBy ? [...protocol.reviewedBy, reviewedBy] : [reviewedBy];
  protocol.lastUpdated = new Date().toISOString().split('T')[0];
  
  // Add rejection reason to protocol (could be stored in a separate field)
  // For now, we'll add it as a tag
  if (!protocol.tags.includes(`rejected: ${reason}`)) {
    protocol.tags.push(`rejected: ${reason}`);
  }
  
  return protocol;
};
