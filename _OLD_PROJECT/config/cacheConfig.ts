/**
 * 🚀 CACHE CONFIGURATION
 *
 * Configuração centralizada de TTL (Time-To-Live) para caches
 * Baseado em padrões de uso real do sistema
 */

export const CacheTTL = {
  // Dados que mudam raramente - Cache longo
  STATIC_DATA: {
    USER_SETTINGS: 30 * 60 * 1000,      // 30 minutos
    THERAPIST_LIST: 15 * 60 * 1000,     // 15 minutos
    PROTOCOLS: 60 * 60 * 1000,          // 1 hora
    EXERCISES: 60 * 60 * 1000,          // 1 hora
    GROUPS: 10 * 60 * 1000,             // 10 minutos
  },

  // Dados que mudam moderadamente - Cache médio
  MODERATE_DATA: {
    PATIENTS: 5 * 60 * 1000,            // 5 minutos
    APPOINTMENTS: 2 * 60 * 1000,        // 2 minutos
    REPORTS: 10 * 60 * 1000,            // 10 minutos
    ANALYTICS: 5 * 60 * 1000,           // 5 minutos
    INVENTORY: 5 * 60 * 1000,           // 5 minutos
  },

  // Dados em tempo real - Cache curto
  REALTIME_DATA: {
    DASHBOARD_STATS: 30 * 1000,         // 30 segundos
    TODAYS_APPOINTMENTS: 15 * 1000,     // 15 segundos
    NOTIFICATIONS: 10 * 1000,           // 10 segundos
    ONLINE_USERS: 5 * 1000,             // 5 segundos
    WAITLIST: 30 * 1000,                // 30 segundos
  },

  // Dados críticos - Sem cache ou cache muito curto
  CRITICAL_DATA: {
    CURRENT_SESSION: 0,                 // Sem cache
    PAYMENT_STATUS: 5 * 1000,           // 5 segundos
    AUDIT_LOGS: 1 * 60 * 1000,          // 1 minuto
  },
} as const;

/**
 * Configuração de stale-while-revalidate
 * Dados podem ser servidos stale por até X ms enquanto revalida em background
 */
export const StaleWhileRevalidate = {
  PATIENTS: 30 * 1000,                  // 30 segundos
  APPOINTMENTS: 15 * 1000,              // 15 segundos
  ANALYTICS: 2 * 60 * 1000,             // 2 minutos
  REPORTS: 5 * 60 * 1000,               // 5 minutos
} as const;

/**
 * Configuração de cache por ambiente
 */
export const getCacheTTLByEnv = (baseTimeout: number): number => {
  const env = process.env.NODE_ENV;

  switch (env) {
    case 'development':
      return baseTimeout * 0.5; // Cache mais curto em dev para ver mudanças
    case 'production':
      return baseTimeout;
    case 'test':
      return 0; // Sem cache em testes
    default:
      return baseTimeout;
  }
};

/**
 * Estratégias de invalidação de cache
 */
export const CacheInvalidationStrategy = {
  // Invalidar quando usuário faz ação
  ON_MUTATION: [
    'patients',
    'appointments',
    'sessions',
    'reports',
  ],

  // Invalidar por tempo
  TIME_BASED: [
    'analytics',
    'dashboard-stats',
    'inventory',
  ],

  // Invalidar por evento externo (websocket, etc)
  EVENT_BASED: [
    'notifications',
    'waitlist',
    'online-users',
  ],

  // Nunca invalidar (até reload da página)
  PERSIST_UNTIL_RELOAD: [
    'user-settings',
    'app-config',
  ],
} as const;

/**
 * Helper para obter TTL baseado em tipo de dado
 */
export const getTTL = (dataType: string): number => {
  // Priorizar realtime
  if (dataType in CacheTTL.REALTIME_DATA) {
    return getCacheTTLByEnv(CacheTTL.REALTIME_DATA[dataType as keyof typeof CacheTTL.REALTIME_DATA]);
  }

  // Depois critical
  if (dataType in CacheTTL.CRITICAL_DATA) {
    return getCacheTTLByEnv(CacheTTL.CRITICAL_DATA[dataType as keyof typeof CacheTTL.CRITICAL_DATA]);
  }

  // Depois moderate
  if (dataType in CacheTTL.MODERATE_DATA) {
    return getCacheTTLByEnv(CacheTTL.MODERATE_DATA[dataType as keyof typeof CacheTTL.MODERATE_DATA]);
  }

  // Por último static
  if (dataType in CacheTTL.STATIC_DATA) {
    return getCacheTTLByEnv(CacheTTL.STATIC_DATA[dataType as keyof typeof CacheTTL.STATIC_DATA]);
  }

  // Default: 1 minuto
  return getCacheTTLByEnv(60 * 1000);
};

/**
 * Configuração de tamanho máximo de cache
 */
export const CacheSize = {
  MAX_ENTRIES: 100,           // Máximo de entradas no cache
  MAX_MEMORY_MB: 50,          // Máximo de memória (estimado)
  CLEANUP_THRESHOLD: 0.8,     // Limpar quando chegar a 80%
} as const;

/**
 * Prioridades de cache (para quando precisar limpar)
 */
export enum CachePriority {
  CRITICAL = 1,    // Nunca remover
  HIGH = 2,        // Remover por último
  MEDIUM = 3,      // Remover se necessário
  LOW = 4,         // Remover primeiro
}

export const getCachePriority = (dataType: string): CachePriority => {
  if (dataType in CacheTTL.CRITICAL_DATA) return CachePriority.CRITICAL;
  if (dataType in CacheTTL.REALTIME_DATA) return CachePriority.HIGH;
  if (dataType in CacheTTL.MODERATE_DATA) return CachePriority.MEDIUM;
  return CachePriority.LOW;
};
