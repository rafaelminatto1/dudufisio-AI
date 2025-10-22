import { SessionEvolution } from '../types';
import { shouldUseSupabase, shouldFallbackToMock, logDataSource } from '../config/supabaseTablesConfig';

/**
 * Service para gerenciamento de evoluções de sessão
 * Armazena dados completos de cada sessão para análise e evolução
 * MODO HÍBRIDO: Tenta Supabase primeiro, fallback para Mock
 */

// Mock data storage (em produção, usar Supabase)
let mockSessionEvolutions: SessionEvolution[] = [];

// ============================================================================
// CRUD OPERATIONS
// ============================================================================

/**
 * Busca evolução de uma sessão específica
 */
export async function getSessionEvolution(sessionId: string): Promise<SessionEvolution | null> {
  try {
    // TODO: Implementar busca no Supabase quando tabela estiver criada
    // if (shouldUseSupabase()) {
    //   logDataSource('supabase', `getSessionEvolution(${sessionId})`);
    //   const { data } = await supabase.from('session_evolutions').select('*').eq('session_id', sessionId).single();
    //   if (data) return data;
    // }
    
    logDataSource('mock', `getSessionEvolution(${sessionId})`);
    const session = mockSessionEvolutions.find(s => s.sessionId === sessionId);
    return session || null;
  } catch (error) {
    console.error('Erro ao buscar evolução da sessão:', error);
    return null;
  }
}

/**
 * Salva evolução de uma sessão
 */
export async function saveSessionEvolution(
  data: Omit<SessionEvolution, 'id' | 'createdAt' | 'updatedAt'>
): Promise<SessionEvolution> {
  try {
    const newSession: SessionEvolution = {
      ...data,
      id: `session_evolution_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockSessionEvolutions.push(newSession);
    return newSession;
  } catch (error) {
    console.error('Erro ao salvar evolução da sessão:', error);
    throw error;
  }
}

/**
 * Atualiza evolução de uma sessão
 */
export async function updateSessionEvolution(
  sessionId: string,
  data: Partial<Omit<SessionEvolution, 'id' | 'sessionId' | 'patientId' | 'createdAt'>>
): Promise<SessionEvolution> {
  try {
    const sessionIndex = mockSessionEvolutions.findIndex(s => s.sessionId === sessionId);
    
    if (sessionIndex === -1) {
      throw new Error(`Sessão ${sessionId} não encontrada`);
    }

    const updatedSession: SessionEvolution = {
      ...mockSessionEvolutions[sessionIndex],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockSessionEvolutions[sessionIndex] = updatedSession;
    return updatedSession;
  } catch (error) {
    console.error('Erro ao atualizar evolução da sessão:', error);
    throw error;
  }
}

/**
 * Remove evolução de uma sessão
 */
export async function deleteSessionEvolution(sessionId: string): Promise<void> {
  try {
    mockSessionEvolutions = mockSessionEvolutions.filter(s => s.sessionId !== sessionId);
  } catch (error) {
    console.error('Erro ao deletar evolução da sessão:', error);
    throw error;
  }
}

/**
 * Busca todas as evoluções de um paciente
 */
export async function getEvolutionsByPatientId(patientId: string): Promise<SessionEvolution[]> {
  try {
    const sessions = mockSessionEvolutions.filter(s => s.patientId === patientId);
    return sessions.sort((a, b) => a.sessionNumber - b.sessionNumber);
  } catch (error) {
    console.error('Erro ao buscar evoluções do paciente:', error);
    return [];
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Busca última sessão do paciente
 */
export async function getLatestSession(patientId: string): Promise<SessionEvolution | null> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    if (sessions.length === 0) return null;
    
    return sessions[sessions.length - 1];
  } catch (error) {
    console.error('Erro ao buscar última sessão:', error);
    return null;
  }
}

/**
 * Busca últimas N sessões do paciente
 */
export async function getRecentSessions(
  patientId: string,
  limit = 10
): Promise<SessionEvolution[]> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    return sessions.slice(-limit).reverse();
  } catch (error) {
    console.error('Erro ao buscar sessões recentes:', error);
    return [];
  }
}

/**
 * Calcula número total de sessões do paciente
 */
export async function getTotalSessions(patientId: string): Promise<number> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    return sessions.length;
  } catch (error) {
    console.error('Erro ao contar sessões:', error);
    return 0;
  }
}

/**
 * Busca sessões por período
 */
export async function getSessionsByDateRange(
  patientId: string,
  startDate: string,
  endDate: string
): Promise<SessionEvolution[]> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    const start = new Date(startDate);
    const end = new Date(endDate);

    return sessions.filter(s => {
      const sessionDate = new Date(s.sessionDate);
      return sessionDate >= start && sessionDate <= end;
    });
  } catch (error) {
    console.error('Erro ao buscar sessões por período:', error);
    return [];
  }
}

/**
 * Busca sessões por terapeuta
 */
export async function getSessionsByTherapist(
  patientId: string,
  therapistId: string
): Promise<SessionEvolution[]> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    return sessions.filter(s => s.therapistId === therapistId);
  } catch (error) {
    console.error('Erro ao buscar sessões por terapeuta:', error);
    return [];
  }
}

/**
 * Calcula duração média das sessões
 */
export async function getAverageSessionDuration(patientId: string): Promise<number> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    const sessionsWithDuration = sessions.filter(s => s.duration);
    
    if (sessionsWithDuration.length === 0) return 0;

    const totalDuration = sessionsWithDuration.reduce(
      (sum, s) => sum + (s.duration || 0),
      0
    );

    return Math.round(totalDuration / sessionsWithDuration.length);
  } catch (error) {
    console.error('Erro ao calcular duração média:', error);
    return 0;
  }
}

/**
 * Busca sessões com tag específica
 */
export async function getSessionsByTag(
  patientId: string,
  tag: string
): Promise<SessionEvolution[]> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    return sessions.filter(s =>
      s.tags?.some(t => t.toLowerCase().includes(tag.toLowerCase()))
    );
  } catch (error) {
    console.error('Erro ao buscar sessões por tag:', error);
    return [];
  }
}

/**
 * Calcula frequência de palavras-chave nas sessões (para análise)
 */
export async function analyzeKeywords(patientId: string): Promise<Record<string, number>> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);
    const keywords: Record<string, number> = {};

    sessions.forEach(session => {
      const text = [
        session.subjective || '',
        session.objective || '',
        session.assessment || '',
        session.plan || '',
      ].join(' ').toLowerCase();

      // Palavras-chave relevantes
      const relevantWords = [
        'dor', 'melhora', 'piora', 'edema', 'amplitude', 'força',
        'equilíbrio', 'marcha', 'função', 'atividade', 'esporte',
        'limitação', 'progresso', 'estável', 'recuperação',
      ];

      relevantWords.forEach(word => {
        const count = (text.match(new RegExp(word, 'gi')) || []).length;
        keywords[word] = (keywords[word] || 0) + count;
      });
    });

    return keywords;
  } catch (error) {
    console.error('Erro ao analisar palavras-chave:', error);
    return {};
  }
}

/**
 * Gera resumo estatístico das sessões
 */
export async function getSessionSummary(patientId: string): Promise<{
  totalSessions: number;
  averageDuration: number;
  firstSessionDate: string | null;
  lastSessionDate: string | null;
  therapists: string[];
  mostCommonTags: string[];
  averagePainLevel: number;
}> {
  try {
    const sessions = await getEvolutionsByPatientId(patientId);

    if (sessions.length === 0) {
      return {
        totalSessions: 0,
        averageDuration: 0,
        firstSessionDate: null,
        lastSessionDate: null,
        therapists: [],
        mostCommonTags: [],
        averagePainLevel: 0,
      };
    }

    // Terapeutas únicos
    const therapists = [...new Set(sessions.map(s => s.therapistName))];

    // Tags mais comuns
    const tagCounts: Record<string, number> = {};
    sessions.forEach(s => {
      s.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    const mostCommonTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Nível médio de dor
    const sessionsWithPain = sessions.filter(s => s.painLevel !== undefined);
    const averagePainLevel = sessionsWithPain.length > 0
      ? sessionsWithPain.reduce((sum, s) => sum + (s.painLevel || 0), 0) / sessionsWithPain.length
      : 0;

    return {
      totalSessions: sessions.length,
      averageDuration: await getAverageSessionDuration(patientId),
      firstSessionDate: sessions[0].sessionDate,
      lastSessionDate: sessions[sessions.length - 1].sessionDate,
      therapists,
      mostCommonTags,
      averagePainLevel: Math.round(averagePainLevel * 10) / 10,
    };
  } catch (error) {
    console.error('Erro ao gerar resumo de sessões:', error);
    throw error;
  }
}

// ============================================================================
// MOCK DATA HELPERS (para desenvolvimento)
// ============================================================================

/**
 * Popula dados mock para testes
 */
export function populateMockData(patientId: string, numSessions = 10): void {
  mockSessionEvolutions = [];
  
  for (let i = 1; i <= numSessions; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (numSessions - i) * 7); // Uma sessão por semana

    const session: SessionEvolution = {
      id: `session_evolution_mock_${i}`,
      sessionId: `session_${i}`,
      patientId,
      sessionNumber: i,
      sessionDate: date.toISOString(),
      therapistId: 'therapist_1',
      therapistName: 'Dr. Roberto Silva',
      subjective: `Paciente relata dor ${10 - i}/10, ${i > 5 ? 'com melhora' : 'sem mudanças significativas'}.`,
      objective: `ROM: ${60 + i * 5}° de flexão do joelho, força 4/5.`,
      assessment: `Evolução ${i > 5 ? 'positiva' : 'gradual'}, paciente respondendo ao tratamento.`,
      plan: 'Continuar com exercícios de fortalecimento e mobilização.',
      testsPerformed: [
        {
          id: `test_${i}_1`,
          testName: 'Amplitude de movimento do joelho',
          testType: 'amplitude',
          value: 60 + i * 5,
          unit: 'graus',
          side: 'right',
          assessedAt: date.toISOString(),
        },
        {
          id: `test_${i}_2`,
          testName: 'Escala de dor (EVA)',
          testType: 'pain',
          value: 10 - i,
          unit: 'pontos',
          assessedAt: date.toISOString(),
        },
      ],
      painLevel: 10 - i,
      duration: 45 + Math.floor(Math.random() * 15),
      tags: i > 5 ? ['melhora', 'progresso'] : ['estável'],
      createdAt: date.toISOString(),
      updatedAt: date.toISOString(),
    };

    mockSessionEvolutions.push(session);
  }
}

/**
 * Limpa dados mock
 */
export function clearMockData(): void {
  mockSessionEvolutions = [];
}

