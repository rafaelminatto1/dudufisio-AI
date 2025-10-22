import { ConductTemplate } from '../types';
import * as sessionEvolutionService from './sessionEvolutionService';
import { shouldUseSupabase, shouldFallbackToMock, logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para gerenciamento de templates de conduta
 * Permite salvar e replicar condutas entre sessões
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

// Mock data storage (em produção, usar Supabase)
let mockConductTemplates: ConductTemplate[] = [];

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Busca todos os templates de conduta salvos de um paciente
 */
export async function getSavedConducts(patientId: string): Promise<ConductTemplate[]> {
  try {
    // TODO: Implementar busca no Supabase quando tabela estiver criada
    // if (shouldUseSupabase()) {
    //   logDataSource('supabase', `getSavedConducts(${patientId})`);
    //   const { data } = await supabase.from('conduct_templates').select('*').eq('patient_id', patientId).eq('is_template', true);
    //   if (data) return data;
    // }
    
    logDataSource('mock', `getSavedConducts(${patientId})`);
    return mockConductTemplates
      .filter(t => t.patientId === patientId && t.isTemplate)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error('Erro ao buscar condutas salvas:', error);
    return [];
  }
}

/**
 * Salva conduta como template
 */
export async function saveConductAsTemplate(
  patientId: string,
  conduct: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    tests?: Array<{
      testName: string;
      testType: string;
      unit: string;
    }>;
  },
  name: string,
  sourceSessionId?: string
): Promise<ConductTemplate> {
  try {
    const newTemplate: ConductTemplate = {
      id: `conduct_template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      patientId,
      name,
      description: `Template criado em ${new Date().toLocaleDateString('pt-BR')}`,
      ...conduct,
      sourceSessionId,
      sourceSessionDate: sourceSessionId
        ? (await sessionEvolutionService.getSessionEvolution(sourceSessionId))?.sessionDate
        : undefined,
      timesUsed: 0,
      createdAt: new Date().toISOString(),
      isTemplate: true,
    };

    mockConductTemplates.push(newTemplate);
    return newTemplate;
  } catch (error) {
    console.error('Erro ao salvar template de conduta:', error);
    throw error;
  }
}

/**
 * Replica uma conduta (incrementa contador de uso)
 */
export async function replicateConduct(conductId: string): Promise<ConductTemplate> {
  try {
    const templateIndex = mockConductTemplates.findIndex(t => t.id === conductId);
    
    if (templateIndex === -1) {
      throw new Error(`Template ${conductId} não encontrado`);
    }

    const template = mockConductTemplates[templateIndex];
    const updatedTemplate: ConductTemplate = {
      ...template,
      timesUsed: template.timesUsed + 1,
    };

    mockConductTemplates[templateIndex] = updatedTemplate;
    return updatedTemplate;
  } catch (error) {
    console.error('Erro ao replicar conduta:', error);
    throw error;
  }
}

/**
 * Remove um template de conduta
 */
export async function deleteConduct(conductId: string): Promise<void> {
  try {
    mockConductTemplates = mockConductTemplates.filter(t => t.id !== conductId);
  } catch (error) {
    console.error('Erro ao deletar conduta:', error);
    throw error;
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Converte sessão anterior em template temporário
 */
export async function createTempTemplateFromSession(
  sessionId: string
): Promise<ConductTemplate | null> {
  try {
    const session = await sessionEvolutionService.getSessionEvolution(sessionId);
    if (!session) return null;

    const tempTemplate: ConductTemplate = {
      id: `temp_${sessionId}`,
      patientId: session.patientId,
      name: `Sessão #${session.sessionNumber}`,
      description: `Conduta da sessão ${session.sessionNumber} - ${new Date(session.sessionDate).toLocaleDateString('pt-BR')}`,
      subjective: session.subjective,
      objective: session.objective,
      assessment: session.assessment,
      plan: session.plan,
      tests: session.testsPerformed.map(test => ({
        testName: test.testName,
        testType: test.testType,
        unit: test.unit,
      })),
      sourceSessionId: sessionId,
      sourceSessionDate: session.sessionDate,
      timesUsed: 0,
      createdAt: session.createdAt,
      isTemplate: false, // Não é um template salvo, é temporário
    };

    return tempTemplate;
  } catch (error) {
    console.error('Erro ao criar template temporário:', error);
    return null;
  }
}

/**
 * Busca últimas N condutas (de sessões anteriores)
 */
export async function getRecentConducts(
  patientId: string,
  limit = 10
): Promise<ConductTemplate[]> {
  try {
    const sessions = await sessionEvolutionService.getRecentSessions(patientId, limit);
    
    const conducts: ConductTemplate[] = [];
    for (const session of sessions) {
      const template = await createTempTemplateFromSession(session.sessionId);
      if (template) {
        conducts.push(template);
      }
    }

    return conducts;
  } catch (error) {
    console.error('Erro ao buscar condutas recentes:', error);
    return [];
  }
}

/**
 * Busca condutas mais usadas
 */
export async function getMostUsedConducts(patientId: string, limit = 5): Promise<ConductTemplate[]> {
  try {
    const templates = await getSavedConducts(patientId);
    return templates
      .filter(t => t.timesUsed > 0)
      .sort((a, b) => b.timesUsed - a.timesUsed)
      .slice(0, limit);
  } catch (error) {
    console.error('Erro ao buscar condutas mais usadas:', error);
    return [];
  }
}

/**
 * Aplica template de conduta (retorna dados para preencher formulário)
 */
export function applyTemplate(template: ConductTemplate): {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  tests?: Array<{
    testName: string;
    testType: string;
    unit: string;
  }>;
} {
  return {
    subjective: template.subjective,
    objective: template.objective,
    assessment: template.assessment,
    plan: template.plan,
    tests: template.tests,
  };
}

/**
 * Aplica apenas campos selecionados do template
 */
export function applyPartialTemplate(
  template: ConductTemplate,
  fields: {
    includeSubjective?: boolean;
    includeObjective?: boolean;
    includeAssessment?: boolean;
    includePlan?: boolean;
    includeTests?: boolean;
  }
): {
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  tests?: Array<{
    testName: string;
    testType: string;
    unit: string;
  }>;
} {
  return {
    subjective: fields.includeSubjective ? template.subjective : undefined,
    objective: fields.includeObjective ? template.objective : undefined,
    assessment: fields.includeAssessment ? template.assessment : undefined,
    plan: fields.includePlan ? template.plan : undefined,
    tests: fields.includeTests ? template.tests : undefined,
  };
}

/**
 * Atualiza template existente
 */
export async function updateConductTemplate(
  conductId: string,
  data: Partial<Pick<ConductTemplate, 'name' | 'description' | 'subjective' | 'objective' | 'assessment' | 'plan' | 'tests'>>
): Promise<ConductTemplate> {
  try {
    const templateIndex = mockConductTemplates.findIndex(t => t.id === conductId);
    
    if (templateIndex === -1) {
      throw new Error(`Template ${conductId} não encontrado`);
    }

    const updatedTemplate: ConductTemplate = {
      ...mockConductTemplates[templateIndex],
      ...data,
    };

    mockConductTemplates[templateIndex] = updatedTemplate;
    return updatedTemplate;
  } catch (error) {
    console.error('Erro ao atualizar template:', error);
    throw error;
  }
}

/**
 * Busca condutas similares (baseado em texto)
 */
export async function findSimilarConducts(
  patientId: string,
  searchText: string
): Promise<ConductTemplate[]> {
  try {
    const templates = await getSavedConducts(patientId);
    const lowerSearch = searchText.toLowerCase();

    return templates.filter(t => {
      const searchableText = [
        t.name,
        t.description || '',
        t.subjective || '',
        t.objective || '',
        t.assessment || '',
        t.plan || '',
      ].join(' ').toLowerCase();

      return searchableText.includes(lowerSearch);
    });
  } catch (error) {
    console.error('Erro ao buscar condutas similares:', error);
    return [];
  }
}

/**
 * Exporta template para JSON
 */
export function exportTemplateToJSON(template: ConductTemplate): string {
  return JSON.stringify(template, null, 2);
}

/**
 * Importa template de JSON
 */
export async function importTemplateFromJSON(
  patientId: string,
  jsonData: string
): Promise<ConductTemplate> {
  try {
    const data = JSON.parse(jsonData);
    
    // Validar estrutura básica
    if (!data.name) {
      throw new Error('Template inválido: nome obrigatório');
    }

    return saveConductAsTemplate(
      patientId,
      {
        subjective: data.subjective,
        objective: data.objective,
        assessment: data.assessment,
        plan: data.plan,
        tests: data.tests,
      },
      data.name
    );
  } catch (error) {
    console.error('Erro ao importar template:', error);
    throw error;
  }
}

// ============================================================================
// MOCK DATA HELPERS
// ============================================================================

/**
 * Popula dados mock para testes
 */
export function populateMockData(patientId: string): void {
  mockConductTemplates = [
    {
      id: 'conduct_mock_1',
      patientId,
      name: 'Conduta Padrão - Lesão LCA',
      description: 'Template padrão para reabilitação de LCA',
      subjective: 'Paciente relata dor leve, amplitude melhorando.',
      objective: 'ROM: 90° flexão, força 4/5, sem edema.',
      assessment: 'Evolução positiva, paciente respondendo bem.',
      plan: 'Continuar fortalecimento quadríceps, iniciar propriocepção.',
      tests: [
        { testName: 'Amplitude de movimento do joelho', testType: 'amplitude', unit: 'graus' },
        { testName: 'Força do quadríceps', testType: 'strength', unit: 'grau' },
      ],
      timesUsed: 5,
      createdAt: new Date().toISOString(),
      isTemplate: true,
    },
    {
      id: 'conduct_mock_2',
      patientId,
      name: 'Conduta - Dor Lombar',
      description: 'Template para tratamento de lombalgia',
      subjective: 'Paciente com dor lombar, melhora com movimento.',
      objective: 'Amplitude flexão: 70°, sem irradiação.',
      assessment: 'Dor mecânica, responde a exercícios.',
      plan: 'Exercícios de estabilização core, alongamentos.',
      tests: [
        { testName: 'Teste de Schober', testType: 'functional', unit: 'cm' },
        { testName: 'Escala de dor (EVA)', testType: 'pain', unit: 'pontos' },
      ],
      timesUsed: 3,
      createdAt: new Date().toISOString(),
      isTemplate: true,
    },
  ];
}

/**
 * Limpa dados mock
 */
export function clearMockData(): void {
  mockConductTemplates = [];
}

