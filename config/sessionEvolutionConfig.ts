/**
 * Configuração do Sistema de Evolução de Sessão
 * Define qual modo de interface usar
 */

export type SessionEvolutionMode = 'page' | 'modal' | 'expansion';

/**
 * Modo de interface de evolução de sessão
 * - 'page': Página nova com rota /atendimento/:appointmentId/evolucao
 * - 'modal': Modal fullscreen que abre sobre a agenda
 * - 'expansion': Expande a SessionFormPage existente
 */
export const SESSION_EVOLUTION_MODE: SessionEvolutionMode =
  (import.meta.env.VITE_SESSION_MODE as SessionEvolutionMode) || 'modal';

/**
 * Configurações de layout
 */
export const LAYOUT_CONFIG = {
  // Desktop: 4 colunas
  fourColumns: {
    col1Width: '30%', // SOAP Form
    col2Width: '25%', // Histórico
    col3Width: '25%', // Evolução/Testes
    col4Width: '20%', // Resumo
  },
  
  // Tablet: 2 colunas
  twoColumns: {
    col1Width: '50%',
    col2Width: '50%',
  },
  
  // Mobile: 1 coluna
  mobileColumns: {
    width: '100%',
  },
};

/**
 * Configurações de features
 */
export const FEATURES_CONFIG = {
  // Alertas de testes obrigatórios
  mandatoryTestAlerts: {
    enabled: true,
    blockSaveOnCritical: true,
    showWarningOnImportant: true,
    showInfoOnLow: true,
  },
  
  // Replicação de condutas
  conductReplication: {
    enabled: true,
    showRecentSessions: 10,
    enableTemplates: true,
  },
  
  // Insights médicos automáticos
  medicalInsights: {
    enabled: true,
    autoGenerate: true,
    showSuggestedText: true,
  },
  
  // Gráficos de evolução
  evolutionCharts: {
    enabled: true,
    defaultChartType: 'line' as 'bar' | 'line' | 'area' | 'radar',
    enableExport: true,
    exportFormats: ['png', 'svg', 'csv'] as const,
  },
  
  // Sistema de autosave
  autosave: {
    enabled: true,
    debounceMs: 2500,
  },
};

/**
 * Configurações de validação
 */
export const VALIDATION_CONFIG = {
  soap: {
    subjectiveMinLength: 10,
    objectiveMinLength: 10,
    assessmentMinLength: 10,
    planMinLength: 10,
  },
  
  painScale: {
    min: 0,
    max: 10,
  },
  
  tests: {
    requireUnitOfMeasure: true,
    allowNegativeValues: false,
  },
};

/**
 * Configurações de UI/UX
 */
export const UI_CONFIG = {
  animations: {
    enabled: true,
    duration: 300, // ms
  },
  
  toast: {
    duration: 3000, // ms
    position: 'top-right' as const,
  },
  
  modal: {
    closeOnEsc: true,
    closeOnOverlayClick: false,
  },
  
  colors: {
    critical: {
      bg: 'bg-red-50',
      text: 'text-red-800',
      border: 'border-red-300',
    },
    important: {
      bg: 'bg-orange-50',
      text: 'text-orange-800',
      border: 'border-orange-300',
    },
    low: {
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-300',
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-800',
      border: 'border-green-300',
    },
  },
};

/**
 * Helper functions
 */
export const isPageMode = () => SESSION_EVOLUTION_MODE === 'page';
export const isModalMode = () => SESSION_EVOLUTION_MODE === 'modal';
export const isExpansionMode = () => SESSION_EVOLUTION_MODE === 'expansion';

/**
 * Retorna URL para evolução de sessão
 */
export const getSessionEvolutionUrl = (appointmentId: string): string => {
  switch (SESSION_EVOLUTION_MODE) {
    case 'page':
      return `/atendimento/${appointmentId}/evolucao`;
    case 'modal':
      // Modal não usa navegação de URL
      return '#';
    case 'expansion':
      return `/session/${appointmentId}`;
    default:
      return `/atendimento/${appointmentId}/evolucao`;
  }
};

/**
 * Debug mode
 */
export const DEBUG_MODE = import.meta.env.DEV;

/**
 * Log configurações no console (apenas em desenvolvimento)
 */
if (DEBUG_MODE) {
  console.log('🔧 Session Evolution Config:', {
    mode: SESSION_EVOLUTION_MODE,
    features: FEATURES_CONFIG,
    validation: VALIDATION_CONFIG,
  });
}
