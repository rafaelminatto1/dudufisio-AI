import { Pathology } from '../types';
import * as patientService from './patientService';
import { shouldUseSupabase, shouldFallbackToMock, logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para gerenciamento de patologias dos pacientes
 * CRUD completo para histórico de patologias ativas e resolvidas
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

// ============================================================================
// SUPABASE/MOCK FUNCTIONS
// ============================================================================

async function getPathologiesFromSupabase(patientId: string): Promise<Pathology[]> {
  logDataSource('supabase', `getPathologies(${patientId})`);
  const patient = await patientService.getPatientById(patientId);
  return patient?.pathologies || [];
}

async function getPathologiesFromMock(patientId: string): Promise<Pathology[]> {
  logDataSource('mock', `getPathologies(${patientId})`);
  return [];
}

// ============================================================================
// CRUD OPERATIONS (Dual Mode)
// ============================================================================

/**
 * Busca todas as patologias de um paciente
 * Tenta Supabase primeiro, fallback para Mock
 */
export async function getPathologiesByPatientId(patientId: string): Promise<Pathology[]> {
  try {
    if (shouldUseSupabase()) {
      try {
        return await getPathologiesFromSupabase(patientId);
      } catch (error) {
        if (shouldFallbackToMock()) {
          return await getPathologiesFromMock(patientId);
        }
        throw error;
      }
    }
    return await getPathologiesFromMock(patientId);
  } catch (error) {
    console.error('Erro ao buscar patologias:', error);
    throw error;
  }
}

/**
 * Busca patologias ativas (em tratamento)
 */
export async function getActivePathologies(patientId: string): Promise<Pathology[]> {
  try {
    const pathologies = await getPathologiesByPatientId(patientId);
    return pathologies.filter(p => p.status === 'active' || p.status === 'chronic' || p.status === 'monitoring');
  } catch (error) {
    console.error('Erro ao buscar patologias ativas:', error);
    return [];
  }
}

/**
 * Busca patologias resolvidas/tratadas
 */
export async function getResolvedPathologies(patientId: string): Promise<Pathology[]> {
  try {
    const pathologies = await getPathologiesByPatientId(patientId);
    return pathologies.filter(p => p.status === 'resolved');
  } catch (error) {
    console.error('Erro ao buscar patologias resolvidas:', error);
    return [];
  }
}

/**
 * Adiciona nova patologia ao paciente
 */
export async function addPathology(
  patientId: string,
  pathology: Omit<Pathology, 'id' | 'patientId' | 'createdAt' | 'updatedAt'>
): Promise<Pathology> {
  try {
    const patient = await patientService.getPatientById(patientId);
    if (!patient) {
      throw new Error(`Paciente ${patientId} não encontrado`);
    }

    // Validar data de diagnóstico
    const diagnosisDate = new Date(pathology.diagnosisDate);
    if (diagnosisDate > new Date()) {
      throw new Error('Data de diagnóstico não pode ser no futuro');
    }

    const newPathology: Pathology = {
      ...pathology,
      id: `pathology_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      status: pathology.status || 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedPathologies = [...(patient.pathologies || []), newPathology];
    
    await patientService.updatePatient(patientId, {
      pathologies: updatedPathologies,
    });

    return newPathology;
  } catch (error) {
    console.error('Erro ao adicionar patologia:', error);
    throw error;
  }
}

/**
 * Atualiza dados de uma patologia
 */
export async function updatePathology(
  pathologyId: string,
  data: Partial<Omit<Pathology, 'id' | 'patientId' | 'createdAt'>>
): Promise<Pathology> {
  try {
    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p =>
      p.pathologies?.some(path => path.id === pathologyId)
    );

    if (!patient) {
      throw new Error(`Patologia ${pathologyId} não encontrada`);
    }

    const pathology = patient.pathologies?.find(path => path.id === pathologyId);
    if (!pathology) {
      throw new Error(`Patologia ${pathologyId} não encontrada`);
    }

    // Validar data de diagnóstico se estiver sendo atualizada
    if (data.diagnosisDate) {
      const diagnosisDate = new Date(data.diagnosisDate);
      if (diagnosisDate > new Date()) {
        throw new Error('Data de diagnóstico não pode ser no futuro');
      }
    }

    const updatedPathology: Pathology = {
      ...pathology,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    const updatedPathologies = patient.pathologies?.map(path =>
      path.id === pathologyId ? updatedPathology : path
    ) || [];

    await patientService.updatePatient(patient.id, {
      pathologies: updatedPathologies,
    });

    return updatedPathology;
  } catch (error) {
    console.error('Erro ao atualizar patologia:', error);
    throw error;
  }
}

/**
 * Marca patologia como resolvida
 */
export async function markAsResolved(pathologyId: string): Promise<Pathology> {
  return updatePathology(pathologyId, {
    status: 'resolved',
  });
}

/**
 * Marca patologia como ativa
 */
export async function markAsActive(pathologyId: string): Promise<Pathology> {
  return updatePathology(pathologyId, {
    status: 'active',
  });
}

/**
 * Remove uma patologia
 */
export async function deletePathology(pathologyId: string): Promise<void> {
  try {
    const allPatients = await patientService.getAllPatients();
    const patient = allPatients.find(p =>
      p.pathologies?.some(path => path.id === pathologyId)
    );

    if (!patient) {
      throw new Error(`Patologia ${pathologyId} não encontrada`);
    }

    const updatedPathologies = patient.pathologies?.filter(path => path.id !== pathologyId) || [];

    await patientService.updatePatient(patient.id, {
      pathologies: updatedPathologies,
    });
  } catch (error) {
    console.error('Erro ao deletar patologia:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Formata informações da patologia para exibição
 */
export function formatPathologyInfo(pathology: Pathology): {
  statusText: string;
  statusColor: string;
  severityText?: string;
  severityColor?: string;
  timeSinceDiagnosis: string;
} {
  const statusTexts: Record<Pathology['status'], string> = {
    active: 'Em Tratamento',
    resolved: 'Resolvida',
    chronic: 'Crônica',
    monitoring: 'Em Monitoramento',
  };

  const statusColors: Record<Pathology['status'], string> = {
    active: 'bg-red-100 text-red-800',
    resolved: 'bg-green-100 text-green-800',
    chronic: 'bg-orange-100 text-orange-800',
    monitoring: 'bg-blue-100 text-blue-800',
  };

  const severityTexts: Record<NonNullable<Pathology['severity']>, string> = {
    mild: 'Leve',
    moderate: 'Moderada',
    severe: 'Grave',
    critical: 'Crítica',
  };

  const severityColors: Record<NonNullable<Pathology['severity']>, string> = {
    mild: 'bg-green-100 text-green-800',
    moderate: 'bg-yellow-100 text-yellow-800',
    severe: 'bg-orange-100 text-orange-800',
    critical: 'bg-red-100 text-red-800',
  };

  // Calcular tempo desde diagnóstico
  const diagnosisDate = new Date(pathology.diagnosisDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - diagnosisDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  let timeSinceDiagnosis: string;
  if (diffDays < 30) {
    timeSinceDiagnosis = `há ${diffDays} dia${diffDays !== 1 ? 's' : ''}`;
  } else if (diffDays < 365) {
    const months = Math.floor(diffDays / 30);
    timeSinceDiagnosis = `há ${months} mês${months !== 1 ? 'es' : ''}`;
  } else {
    const years = Math.floor(diffDays / 365);
    const remainingMonths = Math.floor((diffDays % 365) / 30);
    if (remainingMonths > 0) {
      timeSinceDiagnosis = `há ${years} ano${years !== 1 ? 's' : ''} e ${remainingMonths} mês${remainingMonths !== 1 ? 'es' : ''}`;
    } else {
      timeSinceDiagnosis = `há ${years} ano${years !== 1 ? 's' : ''}`;
    }
  }

  return {
    statusText: statusTexts[pathology.status],
    statusColor: statusColors[pathology.status],
    severityText: pathology.severity ? severityTexts[pathology.severity] : undefined,
    severityColor: pathology.severity ? severityColors[pathology.severity] : undefined,
    timeSinceDiagnosis,
  };
}

/**
 * Busca patologias por região afetada
 */
export async function getPathologiesByRegion(
  patientId: string,
  region: string
): Promise<Pathology[]> {
  try {
    const pathologies = await getPathologiesByPatientId(patientId);
    return pathologies.filter(p =>
      p.affectedRegion?.toLowerCase().includes(region.toLowerCase())
    );
  } catch (error) {
    console.error('Erro ao buscar patologias por região:', error);
    return [];
  }
}

/**
 * Busca patologias por CID
 */
export async function getPathologiesByICD(
  patientId: string,
  icdCode: string
): Promise<Pathology[]> {
  try {
    const pathologies = await getPathologiesByPatientId(patientId);
    return pathologies.filter(p =>
      p.icdCode?.toLowerCase().includes(icdCode.toLowerCase())
    );
  } catch (error) {
    console.error('Erro ao buscar patologias por CID:', error);
    return [];
  }
}

/**
 * Ordena patologias por severidade e data
 */
export function sortPathologiesBySeverity(pathologies: Pathology[]): Pathology[] {
  const severityOrder: Record<string, number> = {
    critical: 4,
    severe: 3,
    moderate: 2,
    mild: 1,
  };

  return [...pathologies].sort((a, b) => {
    // Primeiro por severidade
    const severityA = a.severity ? severityOrder[a.severity] || 0 : 0;
    const severityB = b.severity ? severityOrder[b.severity] || 0 : 0;
    const severityDiff = severityB - severityA;
    if (severityDiff !== 0) return severityDiff;

    // Depois por data de diagnóstico (mais recente primeiro)
    return new Date(b.diagnosisDate).getTime() - new Date(a.diagnosisDate).getTime();
  });
}

/**
 * Verifica se patologia requer medições obrigatórias
 * (Ex: LCA requer medição de amplitude do joelho)
 */
export function requiresMandatoryTests(pathology: Pathology): boolean {
  const pathologiesWithMandatoryTests = [
    'lca', 'lesão do ligamento cruzado anterior',
    'lcp', 'lesão do ligamento cruzado posterior',
    'menisco',
    'artrose',
    'avc', 'acidente vascular cerebral',
    'fratura',
  ];

  const pathologyName = pathology.name.toLowerCase();
  return pathologiesWithMandatoryTests.some(p => pathologyName.includes(p));
}

/**
 * Sugestões de testes obrigatórios baseados na patologia
 */
export function suggestMandatoryTests(pathology: Pathology): string[] {
  const pathologyName = pathology.name.toLowerCase();
  const suggestions: string[] = [];

  if (pathologyName.includes('lca') || pathologyName.includes('ligamento cruzado')) {
    suggestions.push('Amplitude de movimento do joelho');
    suggestions.push('Teste de Lachman');
    suggestions.push('Força do quadríceps');
  }

  if (pathologyName.includes('menisco')) {
    suggestions.push('Amplitude de movimento do joelho');
    suggestions.push('Teste de McMurray');
  }

  if (pathologyName.includes('artrose')) {
    suggestions.push('Amplitude de movimento');
    suggestions.push('Escala de dor (EVA)');
    suggestions.push('Teste funcional de marcha');
  }

  if (pathologyName.includes('avc') || pathologyName.includes('acidente vascular')) {
    suggestions.push('Escala de Ashworth (espasticidade)');
    suggestions.push('Teste de força muscular');
    suggestions.push('Teste de equilíbrio');
    suggestions.push('Marcha');
  }

  if (pathologyName.includes('fratura')) {
    suggestions.push('Amplitude de movimento');
    suggestions.push('Escala de dor (EVA)');
    suggestions.push('Edema');
  }

  return suggestions;
}

