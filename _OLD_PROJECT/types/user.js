import { z } from 'zod';
// User Role enum
export const UserRole = {
    ADMIN: 'admin',
    FISIOTERAPEUTA: 'fisioterapeuta',
    ESTAGIARIO: 'estagiario',
    PACIENTE: 'paciente'
};
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
export const ROLE_PERMISSIONS = {
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
export function getUserRoleLabel(role) {
    const labels = {
        admin: 'Administrador',
        fisioterapeuta: 'Fisioterapeuta',
        estagiario: 'Estagiário',
        paciente: 'Paciente'
    };
    return labels[role];
}
export function getUserRoleColor(role) {
    const colors = {
        admin: 'red',
        fisioterapeuta: 'blue',
        estagiario: 'green',
        paciente: 'gray'
    };
    return colors[role];
}
export function getUserPermissions(role) {
    return ROLE_PERMISSIONS[role];
}
export function canUserAccess(userRole, permission) {
    return ROLE_PERMISSIONS[userRole][permission];
}
export function isHealthcareProfessional(role) {
    return role === 'fisioterapeuta' || role === 'estagiario';
}
export function canManagePatientData(role) {
    return role === 'admin' || role === 'fisioterapeuta';
}
export function canViewAllReports(role) {
    return role === 'admin' || role === 'fisioterapeuta';
}
export function getDefaultDashboardRoute(role) {
    const routes = {
        admin: '/dashboard/admin',
        fisioterapeuta: '/dashboard/fisioterapeuta',
        estagiario: '/dashboard/fisioterapeuta', // Same as fisioterapeuta
        paciente: '/dashboard/paciente'
    };
    return routes[role];
}
// LGPD compliance helpers
export function canRequestDataExport(role) {
    return role === 'paciente'; // Patients can request their data
}
export function canRequestDataDeletion(role) {
    return role === 'paciente'; // Patients can request account deletion
}
export function requiresConsentForDataProcessing(role) {
    return role === 'paciente'; // Patients need explicit consent
}
