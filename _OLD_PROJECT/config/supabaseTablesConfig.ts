/**
 * Configuração de Tabelas Supabase para Sistema de Evolução
 * Define quais tabelas usar e flags de comportamento
 */

export const SESSION_TABLES = {
  // Novas tabelas específicas
  session_evolutions: 'session_evolutions',
  conduct_templates: 'conduct_templates',
  medical_insights: 'medical_insights',
  
  // Tabelas existentes (usar JSONB quando possível)
  patients: 'patients', // Contém: surgeries, goals, pathologies em JSONB
  assessment_test_configs: 'assessment_test_configs',
  appointments: 'appointments',
  soap_notes: 'soap_notes',
} as const;

/**
 * Flags de configuração do sistema híbrido
 */

// Se true, tenta Supabase primeiro
export const USE_SUPABASE = true;

// Se true, usa Mock como fallback quando Supabase falhar
export const MOCK_FALLBACK = true;

// Se true, mostra logs de qual fonte de dados está sendo usada
export const DEBUG_DATA_SOURCE = true;

// Se true, força uso de Mock (útil para desenvolvimento)
export const FORCE_MOCK_MODE = false;

/**
 * Helper para verificar se deve usar Supabase
 */
export function shouldUseSupabase(): boolean {
  if (FORCE_MOCK_MODE) return false;
  return USE_SUPABASE;
}

/**
 * Helper para verificar se deve fazer fallback para Mock
 */
export function shouldFallbackToMock(): boolean {
  return MOCK_FALLBACK;
}

/**
 * Log de fonte de dados (apenas se DEBUG ativado)
 */
export function logDataSource(source: 'supabase' | 'mock', operation: string): void {
  if (DEBUG_DATA_SOURCE) {
    const emoji = source === 'supabase' ? '🟢' : '🟡';
    console.log(`${emoji} [${source.toUpperCase()}] ${operation}`);
  }
}

/**
 * Estratégia de dados por tabela
 * Define se cada entidade deve usar tabela dedicada ou JSONB
 */
export const DATA_STRATEGY = {
  // Usar JSONB existente (já funciona)
  surgeries: 'jsonb', // patients.surgeries
  goals: 'jsonb', // patients.goals
  pathologies: 'jsonb', // patients.pathologies
  
  // Usar tabelas dedicadas (melhor performance e queries)
  session_evolutions: 'table',
  conduct_templates: 'table',
  medical_insights: 'table',
  test_results: 'jsonb', // em session_evolutions.tests_performed
} as const;

export type DataStrategy = typeof DATA_STRATEGY[keyof typeof DATA_STRATEGY];

/**
 * Helper para verificar estratégia de uma entidade
 */
export function getDataStrategy(entity: keyof typeof DATA_STRATEGY): DataStrategy {
  return DATA_STRATEGY[entity];
}

export default {
  SESSION_TABLES,
  USE_SUPABASE,
  MOCK_FALLBACK,
  DEBUG_DATA_SOURCE,
  FORCE_MOCK_MODE,
  DATA_STRATEGY,
  shouldUseSupabase,
  shouldFallbackToMock,
  logDataSource,
  getDataStrategy,
};

