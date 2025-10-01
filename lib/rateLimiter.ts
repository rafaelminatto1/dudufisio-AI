interface RateLimitConfig {
  windowMs: number; // Janela de tempo em ms
  maxRequests: number; // Máximo de requisições por janela
  keyGenerator?: (req: any) => string; // Função para gerar chave única
  skipSuccessfulRequests?: boolean; // Pular requisições bem-sucedidas
  skipFailedRequests?: boolean; // Pular requisições com falha
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Limpeza automática de entradas expiradas a cada minuto
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60000);
  }

  /**
   * Verifica se a requisição está dentro do limite
   */
  isAllowed(
    key: string, 
    config: RateLimitConfig
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const entry = this.store.get(key);

    // Se não existe entrada ou expirou, criar nova
    if (!entry || now > entry.resetTime) {
      const newEntry: RateLimitEntry = {
        count: 1,
        resetTime: now + config.windowMs
      };
      
      this.store.set(key, newEntry);
      
      return {
        allowed: true,
        remaining: config.maxRequests - 1,
        resetTime: newEntry.resetTime
      };
    }

    // Se ainda está na janela de tempo
    if (entry.count >= config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime
      };
    }

    // Incrementar contador
    entry.count++;
    this.store.set(key, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Limpa entradas expiradas
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Reseta o limite para uma chave específica
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Retorna estatísticas do rate limiter
   */
  getStats(): { totalKeys: number; entries: Array<{ key: string; count: number; resetTime: number }> } {
    const entries = Array.from(this.store.entries()).map(([key, entry]) => ({
      key,
      count: entry.count,
      resetTime: entry.resetTime
    }));

    return {
      totalKeys: this.store.size,
      entries
    };
  }

  /**
   * Destrói o rate limiter e limpa recursos
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.store.clear();
  }
}

// Instância global do rate limiter
export const rateLimiter = new RateLimiter();

// Configurações predefinidas
export const RATE_LIMITS = {
  // API geral - 100 req/min
  API: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 100
  },
  
  // Autenticação - 5 tentativas/min
  AUTH: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 5
  },
  
  // Upload de arquivos - 10 req/hora
  UPLOAD: {
    windowMs: 60 * 60 * 1000, // 1 hora
    maxRequests: 10
  },
  
  // WhatsApp - 50 msg/min
  WHATSAPP: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 50
  },
  
  // Email - 20 email/min
  EMAIL: {
    windowMs: 60 * 1000, // 1 minuto
    maxRequests: 20
  }
} as const;

// Hook para usar rate limiting em componentes React
export const useRateLimit = (config: RateLimitConfig) => {
  const checkLimit = (key: string) => {
    return rateLimiter.isAllowed(key, config);
  };

  const resetLimit = (key: string) => {
    rateLimiter.reset(key);
  };

  return { checkLimit, resetLimit };
};

// Middleware para APIs
export const createRateLimitMiddleware = (config: RateLimitConfig) => {
  return (req: any, res: any, next: any) => {
    const key = config.keyGenerator ? config.keyGenerator(req) : req.ip || 'anonymous';
    const result = rateLimiter.isAllowed(key, config);

    // Adicionar headers de rate limit
    res.set({
      'X-RateLimit-Limit': config.maxRequests.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': new Date(result.resetTime).toISOString()
    });

    if (!result.allowed) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      });
    }

    next();
  };
};

// Utilitário para gerar chaves baseadas em IP + User Agent
export const createIPKey = (req: any): string => {
  const ip = req.ip || req.connection?.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';
  return `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 10)}`;
};

// Utilitário para gerar chaves baseadas em usuário autenticado
export const createUserKey = (req: any): string => {
  const userId = req.user?.id || req.session?.userId || 'anonymous';
  return `user:${userId}`;
};
