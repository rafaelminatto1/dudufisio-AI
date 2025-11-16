/**
 * RoleGuard - Proteção por Permissões (RBAC)
 * 
 * Componente que protege rotas baseado em roles/permissões do usuário.
 * Redireciona para /unauthorized se usuário não tiver permissão.
 * 
 * Baseado em BUSINESS_RULES.md (RN-020 a RN-022)
 * 
 * Hierarquia de Roles:
 * - Admin: Acesso total
 * - Therapist: Gestão de pacientes e atendimentos
 * - Educator: Visualização limitada e prescrição de exercícios
 * - Patient: Apenas portal do paciente
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Tipos de roles do sistema
export type Role = 'admin' | 'therapist' | 'educator' | 'patient';

// Mapa de permissões por role
export const ROLE_PERMISSIONS: Record<Role, string[]> = {
  admin: [
    'users.view',
    'users.create',
    'users.edit',
    'users.delete',
    'patients.all',
    'appointments.all',
    'financial.all',
    'reports.all',
    'settings.all',
    'audit.view',
  ],
  therapist: [
    'patients.view',
    'patients.create',
    'patients.edit',
    'appointments.view',
    'appointments.create',
    'appointments.edit',
    'soap_notes.all',
    'exercises.view',
    'exercises.prescribe',
    'reports.view_own',
  ],
  educator: [
    'patients.view_assigned',
    'exercises.view',
    'exercises.prescribe',
    'appointments.view_own',
    'progress.view_assigned',
  ],
  patient: [
    'profile.view_own',
    'profile.edit_own',
    'appointments.view_own',
    'appointments.request',
    'exercises.view_own',
    'progress.view_own',
    'communication.send',
  ],
};

// Hierarquia de roles (do maior para o menor)
const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 4,
  therapist: 3,
  educator: 2,
  patient: 1,
};

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole?: Role;
  requiredPermission?: string;
  requireAll?: boolean; // Se true, requer todas as permissões. Se false, requer pelo menos uma
  redirectTo?: string;
  fallback?: React.ReactNode;
  showUnauthorized?: boolean;
}

/**
 * Verifica se usuário tem a role necessária
 */
export function hasRole(userRole: Role | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Verifica se usuário tem a permissão necessária
 */
export function hasPermission(userRole: Role | undefined, permission: string): boolean {
  if (!userRole) return false;
  
  const permissions = ROLE_PERMISSIONS[userRole];
  return permissions.includes(permission);
}

/**
 * Verifica se usuário tem todas as permissões necessárias
 */
export function hasAllPermissions(userRole: Role | undefined, permissions: string[]): boolean {
  if (!userRole) return false;
  
  return permissions.every(permission => hasPermission(userRole, permission));
}

/**
 * Verifica se usuário tem pelo menos uma das permissões necessárias
 */
export function hasAnyPermission(userRole: Role | undefined, permissions: string[]): boolean {
  if (!userRole) return false;
  
  return permissions.some(permission => hasPermission(userRole, permission));
}

/**
 * RoleGuard Component
 * 
 * Uso:
 * ```tsx
 * // Proteger por role
 * <RoleGuard requiredRole="therapist">
 *   <PatientListPage />
 * </RoleGuard>
 * 
 * // Proteger por permissão específica
 * <RoleGuard requiredPermission="patients.create">
 *   <CreatePatientButton />
 * </RoleGuard>
 * ```
 */
export function RoleGuard({
  children,
  requiredRole,
  requiredPermission,
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback,
  showUnauthorized = false,
}: RoleGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Obtém role do usuário (assumindo que está em user.role ou user.user_metadata.role)
  const userRole = (user as any)?.role || (user as any)?.user_metadata?.role as Role | undefined;
  
  // Verifica se usuário tem permissão
  const hasAccess = React.useMemo(() => {
    if (!user || !userRole) return false;
    
    // Verifica role se fornecido
    if (requiredRole && !hasRole(userRole, requiredRole)) {
      return false;
    }
    
    // Verifica permissão se fornecida
    if (requiredPermission) {
      const permissions = Array.isArray(requiredPermission) ? requiredPermission : [requiredPermission];
      
      if (requireAll) {
        return hasAllPermissions(userRole, permissions);
      } else {
        return hasAnyPermission(userRole, permissions);
      }
    }
    
    return true;
  }, [user, userRole, requiredRole, requiredPermission, requireAll]);
  
  useEffect(() => {
    if (!hasAccess && user) {
      navigate(redirectTo, { replace: true });
    }
  }, [hasAccess, user, navigate, redirectTo]);
  
  // Se não tem acesso
  if (!hasAccess) {
    if (showUnauthorized) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
            <p className="text-xl text-gray-600 mb-8">Acesso não autorizado</p>
            <p className="text-gray-500">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      );
    }
    return null;
  }
  
  // Se tem acesso, renderiza children
  return <>{children}</>;
}

/**
 * Hook para verificar permissões programaticamente
 */
export function useRoleGuard() {
  const { user } = useAuth();
  const userRole = (user as any)?.role || (user as any)?.user_metadata?.role as Role | undefined;
  
  return {
    userRole,
    hasRole: (requiredRole: Role) => hasRole(userRole, requiredRole),
    hasPermission: (permission: string) => hasPermission(userRole, permission),
    hasAllPermissions: (permissions: string[]) => hasAllPermissions(userRole, permissions),
    hasAnyPermission: (permissions: string[]) => hasAnyPermission(userRole, permissions),
    isAdmin: userRole === 'admin',
    isTherapist: userRole === 'therapist',
    isEducator: userRole === 'educator',
    isPatient: userRole === 'patient',
  };
}

/**
 * Higher Order Component para proteger componentes por role
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  requiredRole: Role,
  options?: Omit<RoleGuardProps, 'children' | 'requiredRole'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard requiredRole={requiredRole} {...options}>
        <Component {...props} />
      </RoleGuard>
    );
  };
}

export default RoleGuard;

