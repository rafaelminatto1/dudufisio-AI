/**
 * Role-Based Access Control (RBAC)
 * Define permissões por role
 */

export type UserRole = 'admin' | 'fisioterapeuta' | 'recepcionista' | 'financeiro' | 'paciente';

interface Permission {
  resource: string;
  actions: string[];
}

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { resource: '*', actions: ['*'] }, // Admin tem acesso total
  ],
  fisioterapeuta: [
    { resource: 'patients', actions: ['read', 'create', 'update'] },
    { resource: 'appointments', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'treatments', actions: ['read', 'create', 'update'] },
    { resource: 'session_evolutions', actions: ['read', 'create', 'update'] },
    { resource: 'exercises', actions: ['read', 'create', 'update'] },
    { resource: 'reports', actions: ['read'] },
  ],
  recepcionista: [
    { resource: 'patients', actions: ['read', 'create', 'update'] },
    { resource: 'appointments', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'waitlist', actions: ['read', 'create', 'update', 'delete'] },
  ],
  financeiro: [
    { resource: 'patients', actions: ['read'] },
    { resource: 'appointments', actions: ['read'] },
    { resource: 'financial_transactions', actions: ['read', 'create', 'update'] },
    { resource: 'patient_packages', actions: ['read', 'create', 'update'] },
    { resource: 'reports', actions: ['read'] },
  ],
  paciente: [
    { resource: 'own_profile', actions: ['read', 'update'] },
    { resource: 'own_appointments', actions: ['read'] },
    { resource: 'own_exercises', actions: ['read', 'update'] },
  ],
};

/**
 * Verifica se usuário tem permissão para ação em recurso
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string
): boolean {
  const permissions = ROLE_PERMISSIONS[userRole] || [];

  // Admin tem acesso total
  if (userRole === 'admin') {
    return true;
  }

  // Verifica permissões específicas
  for (const perm of permissions) {
    // Wildcard para recurso
    if (perm.resource === '*' || perm.resource === resource) {
      // Wildcard para ações
      if (perm.actions.includes('*') || perm.actions.includes(action)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Verifica se usuário pode acessar recurso de outro usuário
 */
export function canAccessResource(
  userRole: UserRole,
  resourceUserId: string,
  currentUserId: string
): boolean {
  // Admin pode acessar tudo
  if (userRole === 'admin') {
    return true;
  }

  // Paciente só pode acessar seus próprios recursos
  if (userRole === 'paciente') {
    return resourceUserId === currentUserId;
  }

  // Outros roles podem acessar recursos de pacientes
  return true;
}

/**
 * Filtra recursos baseado em permissões
 */
export function filterByPermissions<T extends { user_id?: string }>(
  userRole: UserRole,
  userId: string,
  resources: T[]
): T[] {
  if (userRole === 'admin') {
    return resources;
  }

  if (userRole === 'paciente') {
    return resources.filter((r) => r.user_id === userId);
  }

  // Outros roles podem ver recursos de pacientes
  return resources;
}

