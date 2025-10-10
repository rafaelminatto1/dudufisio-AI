/**
 * Validators Centralizados - DuduFisio-AI
 * 
 * Este arquivo contém todos os validadores centralizados do sistema.
 * Baseado nas regras de negócio definidas em BUSINESS_RULES.md
 */

import { z } from 'zod';

// =============================================================================
// VALIDADOR DE CPF
// =============================================================================

/**
 * Valida CPF brasileiro seguindo algoritmo de dígitos verificadores
 * @param cpf - CPF no formato 000.000.000-00 ou apenas números
 * @returns true se válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  
  // CPF deve ter exatamente 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Rejeita CPFs com todos os dígitos iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Valida primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(9))) return false;
  
  // Valida segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleanCPF.charAt(10))) return false;
  
  return true;
}

/**
 * Formata CPF para o padrão 000.000.000-00
 */
export function formatCPF(cpf: string): string {
  const cleanCPF = cpf.replace(/[^\d]/g, '');
  return cleanCPF.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

// =============================================================================
// VALIDADOR DE TELEFONE BRASILEIRO
// =============================================================================

/**
 * Valida telefone brasileiro (celular ou fixo)
 * @param phone - Telefone no formato (00) 00000-0000 ou (00) 0000-0000
 * @returns true se válido, false caso contrário
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  // Deve ter 10 (fixo) ou 11 (celular) dígitos
  if (cleanPhone.length !== 10 && cleanPhone.length !== 11) return false;
  
  // DDD deve ser válido (11 a 99)
  const ddd = parseInt(cleanPhone.substring(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  
  // Se for celular (11 dígitos), primeiro dígito deve ser 9
  if (cleanPhone.length === 11 && cleanPhone.charAt(2) !== '9') return false;
  
  return true;
}

/**
 * Formata telefone para padrão brasileiro
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, '');
  
  if (cleanPhone.length === 11) {
    // Celular: (00) 00000-0000
    return cleanPhone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  } else if (cleanPhone.length === 10) {
    // Fixo: (00) 0000-0000
    return cleanPhone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  
  return phone;
}

// =============================================================================
// VALIDADOR DE CEP
// =============================================================================

/**
 * Valida CEP brasileiro
 */
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.length === 8;
}

/**
 * Formata CEP para padrão 00000-000
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/[^\d]/g, '');
  return cleanCEP.replace(/(\d{5})(\d{3})/, '$1-$2');
}

// =============================================================================
// VALIDADOR DE HORÁRIOS DE AGENDAMENTO
// =============================================================================

/**
 * Verifica se horário está dentro do horário comercial
 * Baseado em BUSINESS_RULES.md (RN-012)
 */
export function isBusinessHours(date: Date): boolean {
  const hour = date.getHours();
  const day = date.getDay(); // 0=Domingo, 6=Sábado
  
  // Domingo fechado
  if (day === 0) return false;
  
  // Sábado: 08:00 - 14:00
  if (day === 6) return hour >= 8 && hour < 14;
  
  // Segunda a Sexta: 07:00 - 20:00
  return hour >= 7 && hour < 20;
}

/**
 * Valida duração de agendamento
 * Baseado em BUSINESS_RULES.md (RN-011)
 */
export function validateAppointmentDuration(durationMinutes: number): boolean {
  return durationMinutes >= 30 && durationMinutes <= 240;
}

/**
 * Verifica se duas datas têm sobreposição de horário
 */
export function hasTimeOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return start1 < end2 && end1 > start2;
}

// =============================================================================
// SCHEMAS ZOD PARA ENTIDADES PRINCIPAIS
// =============================================================================

/**
 * Schema Zod para validação de CPF
 */
export const cpfSchema = z.string()
  .regex(/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'CPF deve estar no formato 000.000.000-00')
  .refine(validateCPF, 'CPF inválido');

/**
 * Schema Zod para validação de telefone
 */
export const phoneSchema = z.string()
  .regex(/^\(\d{2}\) \d{4,5}-\d{4}$/, 'Telefone deve estar no formato (00) 00000-0000')
  .refine(validatePhone, 'Telefone inválido');

/**
 * Schema Zod para validação de email
 */
export const emailSchema = z.string()
  .email('Email inválido')
  .toLowerCase();

/**
 * Schema Zod para validação de CEP
 */
export const cepSchema = z.string()
  .regex(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000')
  .refine(validateCEP, 'CEP inválido');

/**
 * Schema Zod para validação de senha
 * Baseado em BUSINESS_RULES.md (RN-005)
 */
export const passwordSchema = z.string()
  .min(8, 'Senha deve ter no mínimo 8 caracteres')
  .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
  .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
  .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
  .regex(/[@$!%*?&]/, 'Senha deve conter pelo menos um caractere especial (@$!%*?&)');

/**
 * Schema Zod para validação de data de nascimento
 * Baseado em BUSINESS_RULES.md (RN-004)
 */
export const birthDateSchema = z.date()
  .max(new Date(), 'Data de nascimento não pode ser no futuro')
  .refine((date) => {
    const age = (new Date().getTime() - date.getTime()) / (1000 * 60 * 60 * 24 * 365);
    return age <= 150;
  }, 'Data de nascimento inválida');

// =============================================================================
// SCHEMA COMPLETO DE PACIENTE
// =============================================================================

/**
 * Schema Zod completo para criação de paciente
 * Baseado em types.ts e BUSINESS_RULES.md
 */
export const patientCreateSchema = z.object({
  // Dados Pessoais (obrigatórios)
  full_name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(255, 'Nome deve ter no máximo 255 caracteres'),
  
  cpf: cpfSchema,
  
  phone: phoneSchema,
  
  // Dados Pessoais (opcionais)
  email: emailSchema.optional(),
  
  phone_alt: phoneSchema.optional(),
  
  date_of_birth: birthDateSchema.optional(),
  
  gender: z.enum(['male', 'female', 'other']).optional(),
  
  // Endereço (todos opcionais)
  address_street: z.string().max(255).optional(),
  address_number: z.string().max(10).optional(),
  address_complement: z.string().max(100).optional(),
  address_neighborhood: z.string().max(100).optional(),
  address_city: z.string().max(100).optional(),
  address_state: z.string().length(2, 'Estado deve ter 2 caracteres').optional(),
  address_zip_code: cepSchema.optional(),
  
  // Clínico (opcionais)
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  emergency_contact_name: z.string().max(255).optional(),
  emergency_contact_phone: phoneSchema.optional(),
  
  // Relacionamentos
  therapist_id: z.string().uuid().optional(),
});

/**
 * Schema Zod para atualização de paciente
 */
export const patientUpdateSchema = patientCreateSchema.partial();

// =============================================================================
// SCHEMA DE AGENDAMENTO
// =============================================================================

/**
 * Schema Zod para criação de agendamento
 * Baseado em BUSINESS_RULES.md (RN-010, RN-011, RN-012)
 */
export const appointmentCreateSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  
  therapist_id: z.string().uuid('ID de terapeuta inválido'),
  
  appointment_date: z.date()
    .refine(isBusinessHours, 'Agendamento fora do horário comercial'),
  
  duration_minutes: z.number()
    .int('Duração deve ser um número inteiro')
    .refine(validateAppointmentDuration, 'Duração deve estar entre 30 e 240 minutos'),
  
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'canceled', 'no_show'])
    .default('scheduled'),
  
  is_recurring: z.boolean().default(false),
  
  notes: z.string().max(1000).optional(),
  
  // Financeiro
  price: z.number().positive().optional(),
  payment_method: z.enum(['cash', 'debit_card', 'credit_card', 'pix', 'bank_transfer', 'health_insurance']).optional(),
});

/**
 * Schema Zod para atualização de agendamento
 */
export const appointmentUpdateSchema = appointmentCreateSchema.partial();

// =============================================================================
// SCHEMA DE NOTA SOAP
// =============================================================================

/**
 * Schema Zod para nota SOAP
 * Baseado em BUSINESS_RULES.md (RN-040)
 */
export const soapNoteSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  
  therapist_id: z.string().uuid('ID de terapeuta inválido'),
  
  appointment_id: z.string().uuid().optional(),
  
  // Campos SOAP (todos obrigatórios)
  subjective: z.string()
    .min(10, 'Campo Subjetivo deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Subjetivo muito longo'),
  
  objective: z.string()
    .min(10, 'Campo Objetivo deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Objetivo muito longo'),
  
  assessment: z.string()
    .min(10, 'Campo Avaliação deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Avaliação muito longo'),
  
  plan: z.string()
    .min(10, 'Campo Plano deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Plano muito longo'),
});

// =============================================================================
// SCHEMA DE PRESCRIÇÃO DE EXERCÍCIO
// =============================================================================

/**
 * Schema Zod para prescrição de exercício
 * Baseado em BUSINESS_RULES.md (RN-041)
 */
export const exercisePrescriptionSchema = z.object({
  patient_id: z.string().uuid('ID de paciente inválido'),
  
  exercise_id: z.string().uuid('ID de exercício inválido'),
  
  therapist_id: z.string().uuid('ID de terapeuta inválido'),
  
  // Parâmetros (validações baseadas em regras de negócio)
  sets: z.number()
    .int('Séries deve ser um número inteiro')
    .min(1, 'Mínimo 1 série')
    .max(10, 'Máximo 10 séries'),
  
  reps: z.number()
    .int('Repetições deve ser um número inteiro')
    .min(1, 'Mínimo 1 repetição')
    .max(100, 'Máximo 100 repetições'),
  
  duration_seconds: z.number()
    .int('Duração deve ser um número inteiro')
    .positive('Duração deve ser positiva')
    .optional(),
  
  frequency: z.string()
    .min(1, 'Frequência é obrigatória')
    .max(100, 'Frequência muito longa'),
  
  notes: z.string().max(1000).optional(),
  
  start_date: z.date(),
  
  end_date: z.date().optional(),
  
  status: z.enum(['active', 'paused', 'completed', 'canceled'])
    .default('active'),
}).refine(
  (data) => !data.end_date || data.end_date > data.start_date,
  'Data final deve ser posterior à data inicial'
);

// =============================================================================
// UTILIDADES DE VALIDAÇÃO
// =============================================================================

/**
 * Helper para validar e formatar dados
 */
export function validateAndFormat<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: z.ZodError } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    return { success: false, errors: result.error };
  }
}

/**
 * Helper para extrair mensagens de erro do Zod
 */
export function getZodErrorMessages(error: z.ZodError): string[] {
  return error.errors.map((err) => `${err.path.join('.')}: ${err.message}`);
}

/**
 * Helper para validar múltiplos valores
 */
export function validateBatch<T>(
  schema: z.ZodSchema<T>,
  items: unknown[]
): Array<{ index: number; success: boolean; data?: T; errors?: z.ZodError }> {
  return items.map((item, index) => {
    const result = schema.safeParse(item);
    return {
      index,
      success: result.success,
      data: result.success ? result.data : undefined,
      errors: !result.success ? result.error : undefined,
    };
  });
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  // Validadores de formato
  validateCPF,
  validatePhone,
  validateCEP,
  formatCPF,
  formatPhone,
  formatCEP,
  
  // Validadores de negócio
  isBusinessHours,
  validateAppointmentDuration,
  hasTimeOverlap,
  
  // Schemas Zod
  cpfSchema,
  phoneSchema,
  emailSchema,
  cepSchema,
  passwordSchema,
  birthDateSchema,
  patientCreateSchema,
  patientUpdateSchema,
  appointmentCreateSchema,
  appointmentUpdateSchema,
  soapNoteSchema,
  exercisePrescriptionSchema,
  
  // Utilidades
  validateAndFormat,
  getZodErrorMessages,
  validateBatch,
};

