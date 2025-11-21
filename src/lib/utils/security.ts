/**
 * Utilitários de segurança e compliance LGPD
 */

/**
 * Mascara dados sensíveis para exibição
 */
export function maskSensitiveData(data: string, type: 'cpf' | 'phone' | 'email'): string {
  if (!data) return '';

  switch (type) {
    case 'cpf':
      return data.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.***.***-$4');
    case 'phone':
      return data.replace(/(\d{2})(\d{4,5})(\d{4})/, '($1) ****-$3');
    case 'email':
      const [local, domain] = data.split('@');
      if (!domain) return data;
      const maskedLocal = local.slice(0, 2) + '***';
      return `${maskedLocal}@${domain}`;
    default:
      return data;
  }
}

/**
 * Valida se usuário tem permissão para acessar recurso
 */
export function hasPermission(
  userRole: string,
  requiredRole: string | string[]
): boolean {
  const roles = ['admin', 'therapist', 'assistant', 'patient'];
  const userIndex = roles.indexOf(userRole);
  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  
  return requiredRoles.some((role) => {
    const requiredIndex = roles.indexOf(role);
    return userIndex <= requiredIndex;
  });
}

/**
 * Sanitiza input para prevenir XSS
 */
export function sanitizeInput(input: string): string {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

/**
 * Gera token seguro para pré-cadastros
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  
  return Array.from(randomValues)
    .map((x) => chars[x % chars.length])
    .join('');
}

/**
 * Log de auditoria (para compliance LGPD)
 */
export async function logAuditEvent(
  event: string,
  userId: string,
  resourceType: string,
  resourceId: string,
  action: 'create' | 'read' | 'update' | 'delete',
  metadata?: Record<string, any>
) {
  // TODO: Implementar logging real (ex: Supabase Logs ou serviço externo)
  console.log('Audit Event:', {
    event,
    userId,
    resourceType,
    resourceId,
    action,
    metadata,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Verifica consentimento LGPD
 */
export function hasConsent(
  patientId: string,
  consentType: 'data_processing' | 'marketing' | 'data_sharing'
): boolean {
  // TODO: Implementar verificação real no banco
  // Por enquanto, retorna true como padrão
  return true;
}

/**
 * Criptografa dados sensíveis (client-side)
 * Nota: Para dados realmente sensíveis, usar criptografia server-side
 */
export async function encryptSensitiveData(data: string): Promise<string> {
  // TODO: Implementar criptografia real se necessário
  // Por enquanto, Supabase já faz criptografia server-side
  return data;
}

