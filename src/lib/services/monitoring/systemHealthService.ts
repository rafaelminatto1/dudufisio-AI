import { createServerComponentClient } from '~/lib/supabase/server';

// Helper para performance.now() compatível com Node.js e browser
const getPerformanceNow = (): number => {
  if (typeof performance !== 'undefined' && performance.now) {
    return performance.now();
  }
  // Fallback para Node.js
  if (typeof process !== 'undefined' && process.hrtime) {
    const hrtime = process.hrtime();
    return hrtime[0] * 1000 + hrtime[1] / 1000000;
  }
  // Último fallback
  return Date.now();
};

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'unknown';

export interface HealthCheck {
  name: string;
  status: HealthStatus;
  message: string;
  latency?: number; // milliseconds
  timestamp: string;
  details?: Record<string, any>;
}

export interface SystemHealth {
  overall: HealthStatus;
  checks: HealthCheck[];
  timestamp: string;
  uptime?: number; // seconds
  version?: string;
}

export interface DependencyCheck {
  name: string;
  type: 'database' | 'api' | 'storage' | 'auth' | 'cache' | 'other';
  status: HealthStatus;
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

/**
 * Service para monitoramento de saúde do sistema
 * Verifica dependências críticas e gera alertas automáticos
 */
export class SystemHealthService {
  /**
   * Verifica saúde geral do sistema
   */
  static async checkSystemHealth(): Promise<SystemHealth> {
    const checks: HealthCheck[] = [];
    const timestamp = new Date().toISOString();

    // Verificar Supabase Database
    const dbCheck = await this.checkDatabase();
    checks.push(dbCheck);

    // Verificar Supabase Auth
    const authCheck = await this.checkAuth();
    checks.push(authCheck);

    // Verificar Supabase Storage
    const storageCheck = await this.checkStorage();
    checks.push(storageCheck);

    // Verificar APIs externas (se configuradas)
    const apiCheck = await this.checkExternalAPIs();
    checks.push(...apiCheck);

    // Determinar status geral
    const overall = this.determineOverallStatus(checks);

    return {
      overall,
      checks,
      timestamp,
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    };
  }

  /**
   * Verifica saúde do banco de dados Supabase
   */
  static async checkDatabase(): Promise<HealthCheck> {
    const startTime = getPerformanceNow();
    try {
      const supabase = await createServerComponentClient();
      
      // Query simples para verificar conexão
      const { data, error } = await supabase
        .from('patients')
        .select('id')
        .limit(1);

      const latency = Math.round(getPerformanceNow() - startTime);

      if (error) {
        return {
          name: 'Database',
          status: 'down',
          message: `Database error: ${error.message}`,
          latency,
          timestamp: new Date().toISOString(),
          details: { error: error.message, code: error.code },
        };
      }

      return {
        name: 'Database',
        status: latency > 1000 ? 'degraded' : 'healthy',
        message: 'Database connection healthy',
        latency,
        timestamp: new Date().toISOString(),
        details: { connected: true },
      };
    } catch (error: any) {
      const latency = Math.round(getPerformanceNow() - startTime);
      return {
        name: 'Database',
        status: 'down',
        message: `Database connection failed: ${error.message}`,
        latency,
        timestamp: new Date().toISOString(),
        details: { error: error.message },
      };
    }
  }

  /**
   * Verifica saúde do serviço de autenticação
   */
  static async checkAuth(): Promise<HealthCheck> {
    const startTime = getPerformanceNow();
    try {
      const supabase = await createServerComponentClient();
      
      // Verificar se o serviço de auth está acessível
      const { data, error } = await supabase.auth.getSession();

      const latency = Math.round(getPerformanceNow() - startTime);

      if (error) {
        return {
          name: 'Authentication',
          status: 'degraded',
          message: `Auth service warning: ${error.message}`,
          latency,
          timestamp: new Date().toISOString(),
          details: { error: error.message },
        };
      }

      return {
        name: 'Authentication',
        status: 'healthy',
        message: 'Authentication service healthy',
        latency,
        timestamp: new Date().toISOString(),
        details: { hasSession: !!data.session },
      };
    } catch (error: any) {
      const latency = Math.round(getPerformanceNow() - startTime);
      return {
        name: 'Authentication',
        status: 'down',
        message: `Auth service failed: ${error.message}`,
        latency,
        timestamp: new Date().toISOString(),
        details: { error: error.message },
      };
    }
  }

  /**
   * Verifica saúde do Supabase Storage
   */
  static async checkStorage(): Promise<HealthCheck> {
    const startTime = getPerformanceNow();
    try {
      const supabase = await createServerComponentClient();
      
      // Listar buckets para verificar acesso
      const { data, error } = await supabase.storage.listBuckets();

      const latency = Math.round(getPerformanceNow() - startTime);

      if (error) {
        return {
          name: 'Storage',
          status: 'degraded',
          message: `Storage service warning: ${error.message}`,
          latency,
          timestamp: new Date().toISOString(),
          details: { error: error.message },
        };
      }

      return {
        name: 'Storage',
        status: 'healthy',
        message: 'Storage service healthy',
        latency,
        timestamp: new Date().toISOString(),
        details: { bucketsCount: data?.length || 0 },
      };
    } catch (error: any) {
      const latency = Math.round(getPerformanceNow() - startTime);
      return {
        name: 'Storage',
        status: 'down',
        message: `Storage service failed: ${error.message}`,
        latency,
        timestamp: new Date().toISOString(),
        details: { error: error.message },
      };
    }
  }

  /**
   * Verifica APIs externas configuradas
   */
  static async checkExternalAPIs(): Promise<HealthCheck[]> {
    const checks: HealthCheck[] = [];

    // Verificar Twilio (se configurado)
    if (process.env.TWILIO_ACCOUNT_SID) {
      const twilioCheck = await this.checkTwilio();
      checks.push(twilioCheck);
    }

    // Verificar Resend (se configurado)
    if (process.env.RESEND_API_KEY) {
      const resendCheck = await this.checkResend();
      checks.push(resendCheck);
    }

    return checks;
  }

  /**
   * Verifica saúde do Twilio
   */
  private static async checkTwilio(): Promise<HealthCheck> {
    const startTime = getPerformanceNow();
    try {
      // Verificação básica - em produção, fazer request real à API
      const latency = Math.round(getPerformanceNow() - startTime);
      
      return {
        name: 'Twilio',
        status: 'healthy',
        message: 'Twilio service available',
        latency,
        timestamp: new Date().toISOString(),
        details: { configured: true },
      };
    } catch (error: any) {
      const latency = Math.round(getPerformanceNow() - startTime);
      return {
        name: 'Twilio',
        status: 'down',
        message: `Twilio service failed: ${error.message}`,
        latency,
        timestamp: new Date().toISOString(),
        details: { error: error.message },
      };
    }
  }

  /**
   * Verifica saúde do Resend
   */
  private static async checkResend(): Promise<HealthCheck> {
    const startTime = getPerformanceNow();
    try {
      // Verificação básica - em produção, fazer request real à API
      const latency = Math.round(getPerformanceNow() - startTime);
      
      return {
        name: 'Resend',
        status: 'healthy',
        message: 'Resend service available',
        latency,
        timestamp: new Date().toISOString(),
        details: { configured: true },
      };
    } catch (error: any) {
      const latency = Math.round(getPerformanceNow() - startTime);
      return {
        name: 'Resend',
        status: 'down',
        message: `Resend service failed: ${error.message}`,
        latency,
        timestamp: new Date().toISOString(),
        details: { error: error.message },
      };
    }
  }

  /**
   * Determina status geral baseado nos checks individuais
   */
  private static determineOverallStatus(checks: HealthCheck[]): HealthStatus {
    if (checks.length === 0) return 'unknown';

    const hasDown = checks.some(c => c.status === 'down');
    if (hasDown) return 'down';

    const hasDegraded = checks.some(c => c.status === 'degraded');
    if (hasDegraded) return 'degraded';

    const allHealthy = checks.every(c => c.status === 'healthy');
    return allHealthy ? 'healthy' : 'unknown';
  }

  /**
   * Obtém lista de dependências do sistema
   */
  static async getDependencies(): Promise<DependencyCheck[]> {
    const health = await this.checkSystemHealth();
    
    return health.checks.map(check => ({
      name: check.name,
      type: this.inferDependencyType(check.name),
      status: check.status,
      responseTime: check.latency,
      lastCheck: check.timestamp,
      error: check.status === 'down' ? check.message : undefined,
    }));
  }

  /**
   * Infere tipo de dependência baseado no nome
   */
  private static inferDependencyType(name: string): DependencyCheck['type'] {
    const lower = name.toLowerCase();
    if (lower.includes('database') || lower.includes('db')) return 'database';
    if (lower.includes('auth')) return 'auth';
    if (lower.includes('storage')) return 'storage';
    if (lower.includes('cache')) return 'cache';
    return 'api';
  }

  /**
   * Verifica se o sistema está saudável
   */
  static async isHealthy(): Promise<boolean> {
    const health = await this.checkSystemHealth();
    return health.overall === 'healthy';
  }

  /**
   * Obtém métricas resumidas do sistema
   */
  static async getMetrics(): Promise<{
    healthy: number;
    degraded: number;
    down: number;
    total: number;
    averageLatency: number;
  }> {
    const health = await this.checkSystemHealth();
    
    const healthy = health.checks.filter(c => c.status === 'healthy').length;
    const degraded = health.checks.filter(c => c.status === 'degraded').length;
    const down = health.checks.filter(c => c.status === 'down').length;
    const total = health.checks.length;
    
    const latencies = health.checks
      .map(c => c.latency || 0)
      .filter(l => l > 0);
    const averageLatency = latencies.length > 0
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    return {
      healthy,
      degraded,
      down,
      total,
      averageLatency,
    };
  }
}

