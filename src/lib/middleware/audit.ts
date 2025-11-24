/**
 * Middleware de auditoria para compliance LGPD
 */

import { logAuditEvent } from '~/lib/utils/security';

interface AuditContext {
  userId: string;
  userRole: string;
  ipAddress?: string;
  userAgent?: string;
}

/**
 * Wrapper para Server Actions com auditoria
 */
export function withAudit<T extends (...args: unknown[]) => Promise<unknown>>(
  action: T,
  resourceType: string,
  actionName: 'create' | 'read' | 'update' | 'delete'
): T {
  return (async (...args: Parameters<T>) => {
    // TODO: Obter contexto do usuário
    const context: AuditContext = {
      userId: 'system', // TODO: Obter do Supabase auth
      userRole: 'admin',
    };

    try {
      const result = await action(...args);

      // Log de sucesso
      await logAuditEvent(
        `${actionName}_${resourceType}`,
        context.userId,
        resourceType,
        (result as any)?.data?.id || 'unknown',
        actionName,
        {
          success: true,
          args: args.map((arg) => {
            // Remove dados sensíveis antes de logar
            if (typeof arg === 'object' && arg !== null) {
              const sanitized = { ...arg };
              if ('cpf' in sanitized) sanitized.cpf = '***';
              if ('phone' in sanitized) sanitized.phone = '***';
              return sanitized;
            }
            return arg;
          }),
        }
      );

      return result;
    } catch (error: unknown) {
      // Log de erro
      await logAuditEvent(
        `${actionName}_${resourceType}_error`,
        context.userId,
        resourceType,
        'unknown',
        actionName,
        {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      );

      throw error;
    }
  }) as T;
}

/**
 * Hook para auditoria de acesso a dados sensíveis
 */
export function auditDataAccess(
  resourceType: string,
  resourceId: string,
  userId: string
) {
  logAuditEvent(
    `access_${resourceType}`,
    userId,
    resourceType,
    resourceId,
    'read',
    {
      timestamp: new Date().toISOString(),
    }
  );
}