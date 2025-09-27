import React from 'react';
import { Role } from '../../types';
import { useAuth } from '../../contexts/AppContext';
import { AlertTriangle, Lock, ChevronLeft } from 'lucide-react';

/**
 * 🛡️ PERMISSION-BASED ACCESS CONTROL SYSTEM
 *
 * Professional role-based access control with granular permissions
 * Based on enterprise security patterns and best practices
 */

// 🔐 Permission definitions following enterprise patterns
export type Permission =
  // Patient Management
  | 'patients:read' | 'patients:write' | 'patients:delete'
  | 'patients:export' | 'patients:import'

  // Appointment Management
  | 'appointments:read' | 'appointments:write' | 'appointments:delete'
  | 'appointments:schedule' | 'appointments:reschedule'

  // Treatment Management
  | 'treatments:read' | 'treatments:write' | 'treatments:delete'
  | 'treatments:prescribe' | 'treatments:modify'

  // Reports & Analytics
  | 'reports:read' | 'reports:write' | 'reports:export'
  | 'analytics:view' | 'analytics:admin'

  // Financial
  | 'financial:read' | 'financial:write' | 'financial:export'
  | 'billing:manage' | 'billing:view'

  // System Administration
  | 'admin:users' | 'admin:settings' | 'admin:audit'
  | 'admin:integrations' | 'admin:backup'

  // Exercise & Materials
  | 'exercises:read' | 'exercises:write' | 'exercises:delete'
  | 'materials:read' | 'materials:write'

  // AI Features
  | 'ai:generate_reports' | 'ai:risk_analysis' | 'ai:recommendations'

  // Profile Management
  | 'profile:read' | 'profile:write' | 'profile:2fa'

  // Notifications
  | 'notifications:read' | 'notifications:send';

// 🎯 Role-based permission matrix - Enterprise-grade RBAC
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.Admin]: [
    // Full system access
    'patients:read', 'patients:write', 'patients:delete', 'patients:export', 'patients:import',
    'appointments:read', 'appointments:write', 'appointments:delete', 'appointments:schedule', 'appointments:reschedule',
    'treatments:read', 'treatments:write', 'treatments:delete', 'treatments:prescribe', 'treatments:modify',
    'reports:read', 'reports:write', 'reports:export',
    'analytics:view', 'analytics:admin',
    'financial:read', 'financial:write', 'financial:export', 'billing:manage', 'billing:view',
    'admin:users', 'admin:settings', 'admin:audit', 'admin:integrations', 'admin:backup',
    'exercises:read', 'exercises:write', 'exercises:delete',
    'materials:read', 'materials:write',
    'ai:generate_reports', 'ai:risk_analysis', 'ai:recommendations',
    'profile:read', 'profile:write', 'profile:2fa',
    'notifications:read', 'notifications:send'
  ],

  [Role.Therapist]: [
    // Clinical operations focused
    'patients:read', 'patients:write', 'patients:export',
    'appointments:read', 'appointments:write', 'appointments:schedule', 'appointments:reschedule',
    'treatments:read', 'treatments:write', 'treatments:prescribe', 'treatments:modify',
    'reports:read', 'reports:write', 'reports:export',
    'analytics:view',
    'billing:view',
    'exercises:read', 'exercises:write',
    'materials:read', 'materials:write',
    'ai:generate_reports', 'ai:risk_analysis', 'ai:recommendations',
    'profile:read', 'profile:write', 'profile:2fa',
    'notifications:read'
  ],

  [Role.Patient]: [
    // Patient self-service portal
    'appointments:read', 'appointments:schedule',
    'treatments:read',
    'exercises:read',
    'materials:read',
    'profile:read', 'profile:write', 'profile:2fa',
    'notifications:read'
  ],

  [Role.EducadorFisico]: [
    // Exercise and materials management
    'exercises:read', 'exercises:write',
    'materials:read', 'materials:write',
    'patients:read', // Limited patient info for exercise planning
    'treatments:read', // Limited treatment info
    'profile:read', 'profile:write', 'profile:2fa',
    'notifications:read'
  ]
};

// 🔍 Permission checking utilities
export const hasPermission = (userRole: Role, permission: Permission): boolean => {
  return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
};

export const hasAnyPermission = (userRole: Role, permissions: Permission[]): boolean => {
  return permissions.some(permission => hasPermission(userRole, permission));
};

export const hasAllPermissions = (userRole: Role, permissions: Permission[]): boolean => {
  return permissions.every(permission => hasPermission(userRole, permission));
};

// 🛡️ Permission Guard Component Props
interface PermissionGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions; if false, requires ANY
  fallback?: React.ReactNode;
  showFallback?: boolean;
  redirectTo?: string;
}

// 🚫 Access Denied Component
const AccessDenied: React.FC<{ permission?: Permission; onBack?: () => void }> = ({
  permission,
  onBack
}) => (
  <div className="flex items-center justify-center min-h-[400px] p-6">
    <div className="max-w-md mx-auto text-center">
      <div className="mb-6">
        <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100">
          <Lock className="h-10 w-10 text-red-600" />
        </div>
      </div>

      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Acesso Negado
      </h3>

      <p className="text-gray-600 mb-6">
        Você não possui as permissões necessárias para acessar esta funcionalidade.
        {permission && (
          <span className="block mt-2 text-sm text-gray-500">
            Permissão necessária: <code className="bg-gray-100 px-2 py-1 rounded text-xs">{permission}</code>
          </span>
        )}
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {onBack && (
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        )}

        <button
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
        >
          <AlertTriangle className="w-4 h-4" />
          Solicitar Acesso
        </button>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Dica:</strong> Entre em contato com o administrador do sistema para solicitar as permissões necessárias.
        </p>
      </div>
    </div>
  </div>
);

// 🛡️ Main Permission Guard Component
const PermissionGuard: React.FC<PermissionGuardProps> = ({
  children,
  permission,
  permissions = [],
  requireAll = false,
  fallback,
  showFallback = true,
  redirectTo
}) => {
  const { user } = useAuth();

  // If no user is authenticated, deny access
  if (!user) {
    return showFallback ? (
      <AccessDenied permission={permission} />
    ) : null;
  }

  const userRole = user.role;
  let hasAccess = false;

  // Check single permission
  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  }
  // Check multiple permissions
  else if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = hasAllPermissions(userRole, permissions);
    } else {
      hasAccess = hasAnyPermission(userRole, permissions);
    }
  }
  // If no permissions specified, allow access (default behavior)
  else {
    hasAccess = true;
  }

  // Handle redirect if specified
  if (!hasAccess && redirectTo) {
    // In a real app, you'd use router.push or navigate here
    console.warn(`Access denied. Should redirect to: ${redirectTo}`);
  }

  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return showFallback ? (
      <AccessDenied
        permission={permission || permissions[0]}
        onBack={redirectTo ? () => window.history.back() : undefined}
      />
    ) : null;
  }

  return <>{children}</>;
};

// 🎨 HOC for permission checking
export const withPermission = <P extends object>(
  Component: React.ComponentType<P>,
  permission: Permission | Permission[],
  requireAll = false
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <PermissionGuard
      permission={Array.isArray(permission) ? undefined : permission}
      permissions={Array.isArray(permission) ? permission : undefined}
      requireAll={requireAll}
    >
      <Component {...props} />
    </PermissionGuard>
  );

  WrappedComponent.displayName = `withPermission(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// 🪝 Hook for permission checking in components
export const usePermissions = () => {
  const { user } = useAuth();

  return {
    hasPermission: (permission: Permission) =>
      user ? hasPermission(user.role, permission) : false,

    hasAnyPermission: (permissions: Permission[]) =>
      user ? hasAnyPermission(user.role, permissions) : false,

    hasAllPermissions: (permissions: Permission[]) =>
      user ? hasAllPermissions(user.role, permissions) : false,

    userPermissions: user ? ROLE_PERMISSIONS[user.role] || [] : []
  };
};

// 🔒 Utility component for conditional rendering based on permissions
export const IfPermission: React.FC<{
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ permission, permissions = [], requireAll = false, children, fallback }) => {
  const { hasPermission: checkPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  let hasAccess = false;

  if (permission) {
    hasAccess = checkPermission(permission);
  } else if (permissions.length > 0) {
    hasAccess = requireAll ? hasAllPermissions(permissions) : hasAnyPermission(permissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;