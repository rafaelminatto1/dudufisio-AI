import React from 'react';
import { Role } from '../types';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { ShieldX } from 'lucide-react';

interface RoleGuardProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  children,
  fallback
}) => {
  const { user } = useSupabaseAuth();

  // Check if user has permission
  const hasPermission = user && allowedRoles.includes(user.role);

  if (!hasPermission) {
    return fallback || (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <ShieldX className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">
            Acesso Negado
          </h3>
          <p className="text-red-600 mb-4">
            Você não tem permissão para acessar esta página.
          </p>
          <div className="text-sm text-red-500">
            <p>Seu perfil: <strong>{user?.role || 'Não identificado'}</strong></p>
            <p>Perfis permitidos: <strong>{allowedRoles.join(', ')}</strong></p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface DataFilterProps {
  userRole: Role;
  userId?: string;
  patientId?: string;
  children: (filteredData: any) => React.ReactNode;
  data: any[];
  filterType: 'appointments' | 'patients' | 'financial' | 'reports';
}

export const DataFilter: React.FC<DataFilterProps> = ({
  userRole,
  userId,
  patientId,
  children,
  data,
  filterType
}) => {
  const getFilteredData = () => {
    switch (userRole) {
      case Role.Patient:
        // Pacientes só veem seus próprios dados
        switch (filterType) {
          case 'appointments':
            return data.filter(item => item.patientId === patientId);
          case 'patients':
            return []; // Pacientes não devem ver lista de pacientes
          case 'financial':
            return data.filter(item => item.patientId === patientId);
          case 'reports':
            return data.filter(item => item.patientId === patientId);
          default:
            return [];
        }

      case Role.EducadorFisico:
        // Educadores físicos veem apenas seus clientes
        switch (filterType) {
          case 'appointments':
            return data.filter(item => item.therapistId === userId);
          case 'patients':
            return data.filter(item => item.assignedTherapistId === userId);
          case 'financial':
            return data.filter(item => item.therapistId === userId);
          default:
            return data;
        }

      case Role.Therapist:
        // Terapeutas veem todos os dados clínicos, mas financeiro limitado
        switch (filterType) {
          case 'financial':
            return data.filter(item =>
              item.therapistId === userId ||
              item.type === 'appointment_revenue'
            );
          default:
            return data;
        }

      case Role.Admin:
        // Admins veem tudo
        return data;

      default:
        return [];
    }
  };

  return <>{children(getFilteredData())}</>;
};

// Hook para verificar permissões
export const usePermissions = () => {
  const { user } = useSupabaseAuth();

  const hasPermission = (requiredRoles: Role[]) => {
    return user && requiredRoles.includes(user.role);
  };

  const canViewPatientList = () => {
    return hasPermission([Role.Admin, Role.Therapist, Role.EducadorFisico]);
  };

  const canViewFinancials = () => {
    return hasPermission([Role.Admin, Role.Therapist]);
  };

  const canViewAllAppointments = () => {
    return hasPermission([Role.Admin, Role.Therapist]);
  };

  const canViewReports = () => {
    return hasPermission([Role.Admin, Role.Therapist]);
  };

  const canManageUsers = () => {
    return hasPermission([Role.Admin]);
  };

  return {
    user,
    hasPermission,
    canViewPatientList,
    canViewFinancials,
    canViewAllAppointments,
    canViewReports,
    canManageUsers
  };
};

export default RoleGuard;