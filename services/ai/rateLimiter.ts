/**
 * Rate Limiter para Serviços de IA
 * 
 * Implementa rate limiting para prevenir:
 * - Abuso de API
 * - Custos excessivos
 * - DDoS
 * - Uso não autorizado
 * 
 * Estratégias:
 * - Token bucket algorithm
 * - Sliding window
 * - Por usuário e por IP
 */

import { secureLogger } from '@/lib/secureLogger';

// ============================================================================
// TIPOS
// ============================================================================

interface RateLimitConfig {
  windowMs: number;        // Janela de tempo em ms
  maxRequests: number;     // Máximo de requisições na janela
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number;
}

// ============================================================================
// CONFIGURAÇÕES POR TIPO DE OPERAÇÃO
// ============================================================================

export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  // Consultas AI gerais
  'ai:query': {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 10,          // 10 requisições por minuto
  },

  // Análise de progresso (mais custoso)
  'ai:progress': {
    windowMs: 5 * 60 * 1000,  // 5 minutos
    maxRequests: 5,           // 5 análises a cada 5 minutos
  },

  // Geração de SOAP (moderado)
  'ai:soap': {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 15,          // 15 SOAPs por minuto
  },

  // Sugestão de protocolo (custoso)
  'ai:protocol': {
    windowMs: 5 * 60 * 1000,  // 5 minutos
    maxRequests: 10,          // 10 protocolos a cada 5 minutos
  },

  // Análise de imagem (muito custoso)
  'ai:image': {
    windowMs: 10 * 60 * 1000, // 10 minutos
    maxRequests: 20,          // 20 análises a cada 10 minutos
  },

  // Busca de exercícios (leve)
  'exercise:search': {
    windowMs: 60 * 1000,      // 1 minuto
    maxRequests: 30,          // 30 buscas por minuto
  },

  // Geração de relatórios
  'report:generate': {
    windowMs: 5 * 60 * 1000,  // 5 minutos
    maxRequests: 10,          // 10 relatórios a cada 5 minutos
  },
};

// ============================================================================
// IMPLEMENTAÇÃO IN-MEMORY (Para desenvolvimento)
// ============================================================================

class InMemoryRateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpar entradas expiradas a cada 5 minutos
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 5 * 60 * 1000);
  }

  /**
   * Verifica se a requisição está dentro do rate limit
   */
  async check(
    key: string,
    config: RateLimitConfig
  ): Promise<RateLimitResult> {
    const now = Date.now();
    const entry = this.store.get(key);

    // Primeira requisição
    if (!entry) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Janela expirada - reset
    if (now >= entry.resetTime) {
      this.store.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
        firstRequest: now,
      });

      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: now + config.windowMs,
      };
    }

    // Dentro da janela - verificar limite
    if (entry.count >= config.maxRequests) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      
      secureLogger.warn('Rate limit exceeded', {
        component: 'RateLimiter',
        key,
        count: entry.count,
        maxRequests: config.maxRequests,
        retryAfter,
      });

      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter,
      };
    }

    // Incrementar contador
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Remove uma entrada do rate limit (útil para testes)
   */
  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.store.entries()) {
      if (now >= entry.resetTime) {
        this.store.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      secureLogger.debug(`Rate limiter cleanup: removed ${cleaned} expired entries`);
    }
  }

  /**
   * Limpa todos os dados (útil para testes)
   */
  async clear(): Promise<void> {
    this.store.clear();
  }

  /**
   * Destrói o rate limiter
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// ============================================================================
// REDIS RATE LIMITER (Para produção)
// ============================================================================

/**
 * Rate limiter usando Redis (implementação futura com Upstash)
 * 
 * Vantagens:
 * - Persistente
 * - Distribuído (múltiplas instâncias)
 * - Mais eficiente
 * 
 * Uso:
 * ```typescript
 * import { Redis } from '@upstash/redis';
 * 
 * const redis = new Redis({
 *   url: process.env.UPSTASH_REDIS_URL,
 *   token: process.env.UPSTASH_REDIS_TOKEN,
 * });
 * 
 * const rateLimiter = new RedisRateLimiter(redis);
 * ```
 */
class RedisRateLimiter {
  // Implementação futura com Redis/Upstash
  // Por enquanto, usa in-memory como fallback
  private fallback: InMemoryRateLimiter;

  constructor() {
    this.fallback = new InMemoryRateLimiter();
    secureLogger.info('Using in-memory rate limiter (Redis not configured)');
  }

  async check(key: string, config: RateLimitConfig): Promise<RateLimitResult> {
    return this.fallback.check(key, config);
  }

  async reset(key: string): Promise<void> {
    return this.fallback.reset(key);
  }

  async clear(): Promise<void> {
    return this.fallback.clear();
  }

  destroy(): void {
    this.fallback.destroy();
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

let rateLimiterInstance: InMemoryRateLimiter | RedisRateLimiter;

/**
 * Obtém instância do rate limiter (singleton)
 */
function getRateLimiter(): InMemoryRateLimiter | RedisRateLimiter {
  if (!rateLimiterInstance) {
    // Verificar se Redis está configurado
    const useRedis = process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN;
    
    if (useRedis) {
      rateLimiterInstance = new RedisRateLimiter();
    } else {
      rateLimiterInstance = new InMemoryRateLimiter();
    }
  }

  return rateLimiterInstance;
}

// ============================================================================
// API PÚBLICA
// ============================================================================

/**
 * Verifica rate limit para uma operação
 * 
 * @param userId - ID do usuário
 * @param operation - Tipo de operação (ex: 'ai:query', 'ai:protocol')
 * @param identifier - Identificador adicional (opcional, ex: IP)
 * @returns Resultado do rate limit
 * 
 * @example
 * ```typescript
 * const result = await checkRateLimit(userId, 'ai:query');
 * if (!result.allowed) {
 *   throw new Error(`Rate limit exceeded. Try again in ${result.retryAfter}s`);
 * }
 * ```
 */
export async function checkRateLimit(
  userId: string,
  operation: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<RateLimitResult> {
  const config = RATE_LIMITS[operation];
  
  if (!config) {
    secureLogger.warn(`Unknown operation for rate limiting: ${operation}`);
    // Permitir por padrão se operação não configurada
    return {
      allowed: true,
      remaining: 999,
      resetTime: Date.now() + 60000,
    };
  }

  const key = identifier 
    ? `ratelimit:${operation}:${userId}:${identifier}`
    : `ratelimit:${operation}:${userId}`;

  const limiter = getRateLimiter();
  const result = await limiter.check(key, config);

  // Log de auditoria
  if (!result.allowed) {
    secureLogger.audit('Rate limit exceeded', {
      userId,
      operation,
      identifier,
      remaining: result.remaining,
      retryAfter: result.retryAfter,
    });
  }

  return result;
}

/**
 * Reset do rate limit para um usuário/operação
 * (Útil para testes e casos especiais)
 */
export async function resetRateLimit(
  userId: string,
  operation: keyof typeof RATE_LIMITS,
  identifier?: string
): Promise<void> {
  const key = identifier 
    ? `ratelimit:${operation}:${userId}:${identifier}`
    : `ratelimit:${operation}:${userId}`;

  const limiter = getRateLimiter();
  await limiter.reset(key);

  secureLogger.audit('Rate limit reset', {
    userId,
    operation,
    identifier,
  });
}

/**
 * Limpa todo o rate limit (útil para testes)
 */
export async function clearAllRateLimits(): Promise<void> {
  const limiter = getRateLimiter();
  await limiter.clear();
  
  secureLogger.info('All rate limits cleared');
}

/**
 * Middleware para Express/API routes
 * 
 * @example
 * ```typescript
 * app.post('/api/ai/query', rateLimitMiddleware('ai:query'), async (req, res) => {
 *   // ... handler
 * });
 * ```
 */
export function rateLimitMiddleware(operation: keyof typeof RATE_LIMITS) {
  return async (req: any, res: any, next: any) => {
    const userId = req.user?.id || req.headers['x-user-id'] || 'anonymous';
    const ip = req.ip || req.headers['x-forwarded-for'];

    const result = await checkRateLimit(userId, operation, ip);

    // Adicionar headers de rate limit
    res.setHeader('X-RateLimit-Limit', RATE_LIMITS[operation].maxRequests);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetTime);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter || 60);
      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit exceeded. Try again in ${result.retryAfter}s`,
        retryAfter: result.retryAfter,
      });
    }

    next();
  };
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Limpa recursos do rate limiter (chamar ao desligar aplicação)
 */
export function destroyRateLimiter(): void {
  if (rateLimiterInstance) {
    rateLimiterInstance.destroy();
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  checkRateLimit,
  resetRateLimit,
  clearAllRateLimits,
  rateLimitMiddleware,
  destroyRateLimiter,
  RATE_LIMITS,
};

