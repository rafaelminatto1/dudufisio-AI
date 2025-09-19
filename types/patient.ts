import { z } from 'zod';

// Enums for Patient
export const MaritalStatus = {
  SINGLE: 'single',
  MARRIED: 'married',
  DIVORCED: 'divorced',
  WIDOWED: 'widowed'
} as const;

export type MaritalStatusType = typeof MaritalStatus[keyof typeof MaritalStatus];

// Base Patient interface
export interface Patient {
  id: string;
  user_id?: string | null;

  // Required fields
  full_name: string;
  cpf: string;
  birth_date: string; // ISO date string
  phone: string;
  email?: string | null;

  // Optional fields
  address?: string | null;
  profession?: string | null;
  marital_status?: MaritalStatusType | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  photo_url?: string | null;
  general_notes?: string | null;

  // System fields
  active: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
}

// Request/Response types
export interface CreatePatientRequest {
  full_name: string;
  cpf: string;
  birth_date: string;
  phone: string;
  email?: string;
  address?: string;
  profession?: string;
  marital_status?: MaritalStatusType;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  general_notes?: string;
}

export interface UpdatePatientRequest {
  full_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  profession?: string;
  marital_status?: MaritalStatusType;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  general_notes?: string;
}

export interface PatientDetails extends Patient {
  appointments_count: number;
  last_appointment?: string | null;
  next_appointment?: string | null;
}

export interface PatientSummary {
  id: string;
  full_name: string;
  phone: string;
}

// Validation schemas using Zod
export const createPatientSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(200, 'Nome deve ter no máximo 200 caracteres')
    .regex(/^[A-Za-zÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),

  cpf: z
    .string()
    .length(11, 'CPF deve ter 11 dígitos')
    .regex(/^\d{11}$/, 'CPF deve conter apenas números')
    .refine(validateCPF, 'CPF inválido'),

  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD')
    .refine(date => new Date(date) < new Date(), 'Data de nascimento deve ser no passado'),

  phone: z
    .string()
    .regex(/^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/, 'Telefone deve estar no formato brasileiro (+55 XX XXXXX-XXXX)'),

  email: z
    .string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),

  address: z.string().max(500, 'Endereço deve ter no máximo 500 caracteres').optional(),
  profession: z.string().max(100, 'Profissão deve ter no máximo 100 caracteres').optional(),
  marital_status: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
  emergency_contact_name: z.string().max(200, 'Nome do contato deve ter no máximo 200 caracteres').optional(),
  emergency_contact_phone: z
    .string()
    .regex(/^\+55\s?\d{2}\s?\d{4,5}-?\d{4}$/, 'Telefone de emergência deve estar no formato brasileiro')
    .optional()
    .or(z.literal('')),
  general_notes: z.string().optional()
});

export const updatePatientSchema = createPatientSchema.partial().omit({
  cpf: true,
  birth_date: true
});

// CPF validation function
function validateCPF(cpf: string): boolean {
  // Remove any non-digit characters
  const digits = cpf.replace(/\D/g, '');

  // Check length
  if (digits.length !== 11) return false;

  // Check for same digits (invalid CPFs like 111.111.111-11)
  if (/^(\d)\1{10}$/.test(digits)) return false;

  // Calculate verification digits
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(digits[i]) * (10 - i);
  }

  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  if (parseInt(digits[9]) !== firstDigit) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(digits[i]) * (11 - i);
  }

  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return parseInt(digits[10]) === secondDigit;
}

// Helper functions
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, '');
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 13 && digits.startsWith('55')) {
    return `+55 ${digits.slice(2, 4)} ${digits.slice(4, 9)}-${digits.slice(9)}`;
  }
  return phone;
}

export function getPatientAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}