import { z } from 'zod';

// User Role enum
export const UserRole = {
  ADMIN: 'admin',
  FISIOTERAPEUTA: 'fisioterapeuta',
  ESTAGIARIO: 'estagiario',
  PACIENTE: 'paciente'
} as const;

export type UserRoleType = typeof UserRole[keyof typeof UserRole];

// Base User interface
export interface User {
  id: string;
  email: string;
  role: UserRoleType;
  created_at: string;
  updated_at: string;
  active: boolean;
}

// Extended user with profile information
export interface UserProfile extends User {
  profile?: {
    full_name?: string;
    phone?: string;
    avatar_url?: string;
  } | null;
}

// Authentication related types
export interface AuthUser extends User {
  access_token?: string;
  refresh_token?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterUserRequest {
  email: string;
  password: string;
  role: UserRoleType;
  full_name?: string;
  phone?: string;
}

export interface UpdateUserRequest {
  email?: string;
  role?: UserRoleType;
  active?: boolean;
  full_name?: string;
  phone?: string;
}

// Role-based permissions
export interface RolePermissions {
  canViewPatients: boolean;
  canEditPatients: boolean;
  canDeletePatients: boolean;
  canManageAppointments: boolean;
  canViewReports: boolean;
  canManageUsers: boolean;
  canManageSettings: boolean;
  canAccessFinancial: boolean;
  canPrescribeExercises: boolean;
  canViewBodyMap: boolean;
  canEditBodyMap: boolean;
}

// Session information
export interface UserSession {
  user: User;
  permissions: RolePermissions;
  expires_at: string;
}

// Validation schemas
export const loginSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),

  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
});

export const registerUserSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .min(1, 'Email é obrigatório'),

  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(100, 'Senha deve ter no máximo 100 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),

  role: z.enum(['admin', 'fisioterapeuta', 'estagiario', 'paciente'], {
    errorMap: () => ({ message: 'Função deve ser: admin, fisioterapeuta, estagiário ou paciente' })
  }),

  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional(),

  phone: z
    .string()
    .regex(/^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato brasileiro (+55 XX XXXXX-XXXX)')
    .optional()
});

export const updateUserSchema = z.object({
  email: z
    .string()
    .email('Email inválido')
    .optional(),

  role: z.enum(['admin', 'fisioterapeuta', 'estagiario', 'paciente']).optional(),

  active: z.boolean().optional(),

  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .optional(),

  phone: z
    .string()
    .regex(/^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato brasileiro')
    .optional()
});

// Role permission definitions
export const ROLE_PERMISSIONS: Record<UserRoleType, RolePermissions> = {
  admin: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: true,
    canManageAppointments: true,
    canViewReports: true,
    canManageUsers: true,
    canManageSettings: true,
    canAccessFinancial: true,
    canPrescribeExercises: true,
    canViewBodyMap: true,
    canEditBodyMap: true
  },
  fisioterapeuta: {
    canViewPatients: true,
    canEditPatients: true,
    canDeletePatients: false,
    canManageAppointments: true,
    canViewReports: true,
    canManageUsers: false,
    canManageSettings: false,
    canAccessFinancial: false,
    canPrescribeExercises: true,
    canViewBodyMap: true,
    canEditBodyMap: true
  },
  estagiario: {
    canViewPatients: true,
    canEditPatients: false,
    canDeletePatients: false,
    canManageAppointments: true,
    canViewReports: false,
    canManageUsers: false,
    canManageSettings: false,
    canAccessFinancial: false,
    canPrescribeExercises: false,
    canViewBodyMap: true,
    canEditBodyMap: false
  },
  paciente: {
    canViewPatients: false, // Only their own data
    canEditPatients: false,
    canDeletePatients: false,
    canManageAppointments: false, // Only view their own
    canViewReports: false, // Only their own
    canManageUsers: false,
    canManageSettings: false,
    canAccessFinancial: false,
    canPrescribeExercises: false,
    canViewBodyMap: false, // Only their own
    canEditBodyMap: false
  }
};

// Helper functions
export function getUserRoleLabel(role: UserRoleType): string {
  const labels = {
    admin: 'Administrador',
    fisioterapeuta: 'Fisioterapeuta',
    estagiario: 'Estagiário',
    paciente: 'Paciente'
  };
  return labels[role];
}

export function getUserRoleColor(role: UserRoleType): string {
  const colors = {
    admin: 'red',
    fisioterapeuta: 'blue',
    estagiario: 'green',
    paciente: 'gray'
  };
  return colors[role];
}

export function getUserPermissions(role: UserRoleType): RolePermissions {
  return ROLE_PERMISSIONS[role];
}

export function canUserAccess(userRole: UserRoleType, permission: keyof RolePermissions): boolean {
  return ROLE_PERMISSIONS[userRole][permission];
}

export function isHealthcareProfessional(role: UserRoleType): boolean {
  return role === 'fisioterapeuta' || role === 'estagiario';
}

export function canManagePatientData(role: UserRoleType): boolean {
  return role === 'admin' || role === 'fisioterapeuta';
}

export function canViewAllReports(role: UserRoleType): boolean {
  return role === 'admin' || role === 'fisioterapeuta';
}

export function getDefaultDashboardRoute(role: UserRoleType): string {
  const routes = {
    admin: '/dashboard/admin',
    fisioterapeuta: '/dashboard/fisioterapeuta',
    estagiario: '/dashboard/fisioterapeuta', // Same as fisioterapeuta
    paciente: '/dashboard/paciente'
  };
  return routes[role];
}

// LGPD compliance helpers
export function canRequestDataExport(role: UserRoleType): boolean {
  return role === 'paciente'; // Patients can request their data
}

export function canRequestDataDeletion(role: UserRoleType): boolean {
  return role === 'paciente'; // Patients can request account deletion
}

export function requiresConsentForDataProcessing(role: UserRoleType): boolean {
  return role === 'paciente'; // Patients need explicit consent
}