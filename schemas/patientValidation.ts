/**
 * schemas/patientValidation.ts
 * Schema de validação profissional completo para pacientes
 * Utiliza Zod com mensagens customizadas e refinements avançados
 */

import { z } from 'zod';

// ============================================================================
// REGEX PATTERNS
// ============================================================================

const CPF_REGEX = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const PHONE_REGEX = /^\(\d{2}\)\s?\d{4,5}-\d{4}$/;
const CEP_REGEX = /^\d{5}-?\d{3}$/;
const CRM_REGEX = /^\d{4,6}$/;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Valida CPF brasileiro
 */
function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  digit = 11 - (sum % 11);
  if (digit >= 10) digit = 0;
  if (digit !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Valida se a data é válida e não é futura
 */
function validateBirthDate(date: string): boolean {
  const birthDate = new Date(date);
  const today = new Date();
  return birthDate < today;
}

/**
 * Calcula a idade a partir da data de nascimento
 */
function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// ============================================================================
// ENUMS
// ============================================================================

export const GenderEnum = z.enum(['male', 'female', 'other', 'prefer_not_to_say'], {
  errorMap: () => ({ message: 'Selecione um gênero válido' }),
});

export const MaritalStatusEnum = z.enum(['single', 'married', 'divorced', 'widowed', 'other'], {
  errorMap: () => ({ message: 'Selecione um estado civil válido' }),
});

export const BloodTypeEnum = z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], {
  errorMap: () => ({ message: 'Selecione um tipo sanguíneo válido' }),
});

export const SmokingStatusEnum = z.enum(['never', 'former', 'current'], {
  errorMap: () => ({ message: 'Selecione um status de tabagismo válido' }),
});

export const AlcoholConsumptionEnum = z.enum(['never', 'occasional', 'moderate', 'heavy'], {
  errorMap: () => ({ message: 'Selecione um nível de consumo de álcool válido' }),
});

export const PhysicalActivityLevelEnum = z.enum(['sedentary', 'light', 'moderate', 'intense'], {
  errorMap: () => ({ message: 'Selecione um nível de atividade física válido' }),
});

export const InsuranceTypeEnum = z.enum(['none', 'private', 'public', 'both'], {
  errorMap: () => ({ message: 'Selecione um tipo de convênio válido' }),
});

export const PatientStatusEnum = z.enum(['Active', 'Inactive', 'Discharged', 'Suspended'], {
  errorMap: () => ({ message: 'Selecione um status válido' }),
});

// ============================================================================
// NESTED SCHEMAS
// ============================================================================

/**
 * Schema para endereço
 */
export const AddressSchema = z.object({
  street: z.string({
    required_error: 'Rua é obrigatória',
    invalid_type_error: 'Rua deve ser um texto',
  }).min(3, 'Rua deve ter pelo menos 3 caracteres'),
  
  number: z.string({
    required_error: 'Número é obrigatório',
  }).min(1, 'Número é obrigatório'),
  
  complement: z.string().optional(),
  
  neighborhood: z.string({
    required_error: 'Bairro é obrigatório',
  }).min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  
  city: z.string({
    required_error: 'Cidade é obrigatória',
  }).min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  
  state: z.string({
    required_error: 'Estado é obrigatório',
  }).length(2, 'Estado deve ter 2 caracteres (ex: SP)').toUpperCase(),
  
  zipCode: z.string({
    required_error: 'CEP é obrigatório',
  }).regex(CEP_REGEX, 'CEP inválido. Use o formato: 12345-678'),
  
  country: z.string().default('Brasil'),
});

/**
 * Schema para contato de emergência
 */
export const EmergencyContactSchema = z.object({
  name: z.string({
    required_error: 'Nome do contato de emergência é obrigatório',
  }).min(2, 'Nome deve ter pelo menos 2 caracteres'),
  
  relationship: z.string({
    required_error: 'Relacionamento é obrigatório',
  }).min(2, 'Relacionamento deve ter pelo menos 2 caracteres'),
  
  phone: z.string({
    required_error: 'Telefone de emergência é obrigatório',
  }).regex(PHONE_REGEX, 'Telefone inválido. Use o formato: (11) 99999-9999'),
  
  phone2: z.string().regex(PHONE_REGEX, 'Telefone inválido').optional().or(z.literal('')),
  
  email: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
});

/**
 * Schema para convênio
 */
export const InsuranceSchema = z.object({
  type: InsuranceTypeEnum,
  provider: z.string().optional(),
  planName: z.string().optional(),
  policyNumber: z.string().optional(),
  validUntil: z.string().optional(),
  coveragePercentage: z.number().min(0).max(100).optional(),
}).superRefine((data, ctx) => {
  // Se o tipo não é "none", os campos de convênio são obrigatórios
  if (data.type !== 'none') {
    if (!data.provider || data.provider.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['provider'],
        message: 'Operadora é obrigatória quando há convênio',
      });
    }
    
    if (!data.planName || data.planName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['planName'],
        message: 'Nome do plano é obrigatório quando há convênio',
      });
    }
    
    if (!data.policyNumber || data.policyNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['policyNumber'],
        message: 'Número da apólice é obrigatório quando há convênio',
      });
    }
  }
});

// ============================================================================
// MAIN PATIENT FORM SCHEMA
// ============================================================================

/**
 * Schema principal para formulário de paciente
 * Inclui todas as validações e refinements necessários
 */
export const PatientFormSchema = z.object({
  // ========== DADOS PESSOAIS ==========
  name: z.string({
    required_error: 'Nome completo é obrigatório',
    invalid_type_error: 'Nome deve ser um texto',
  })
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome não pode ter mais de 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
  
  email: z.string({
    required_error: 'Email é obrigatório',
  })
    .email('Email inválido. Use o formato: usuario@exemplo.com')
    .toLowerCase(),
  
  phone: z.string({
    required_error: 'Telefone é obrigatório',
  })
    .regex(PHONE_REGEX, 'Telefone inválido. Use o formato: (11) 99999-9999'),
  
  phone2: z.string()
    .regex(PHONE_REGEX, 'Telefone secundário inválido')
    .optional()
    .or(z.literal('')),
  
  cpf: z.string({
    required_error: 'CPF é obrigatório',
  })
    .regex(CPF_REGEX, 'CPF inválido. Use o formato: 123.456.789-00')
    .refine(validateCPF, {
      message: 'CPF inválido. Verifique os dígitos',
    }),
  
  rg: z.string()
    .min(5, 'RG deve ter pelo menos 5 caracteres')
    .optional()
    .or(z.literal('')),
  
  birthDate: z.string({
    required_error: 'Data de nascimento é obrigatória',
  })
    .refine(validateBirthDate, {
      message: 'Data de nascimento inválida ou futura',
    })
    .refine((date) => {
      const age = calculateAge(date);
      return age >= 0 && age <= 120;
    }, {
      message: 'Idade deve estar entre 0 e 120 anos',
    }),
  
  gender: GenderEnum,
  
  maritalStatus: MaritalStatusEnum,
  
  occupation: z.string()
    .min(2, 'Profissão deve ter pelo menos 2 caracteres')
    .optional()
    .or(z.literal('')),
  
  // ========== ENDEREÇO ==========
  street: z.string({
    required_error: 'Rua é obrigatória',
  }).min(3, 'Rua deve ter pelo menos 3 caracteres'),
  
  number: z.string({
    required_error: 'Número é obrigatório',
  }).min(1, 'Número é obrigatório'),
  
  complement: z.string().optional().or(z.literal('')),
  
  neighborhood: z.string({
    required_error: 'Bairro é obrigatório',
  }).min(2, 'Bairro deve ter pelo menos 2 caracteres'),
  
  city: z.string({
    required_error: 'Cidade é obrigatória',
  }).min(2, 'Cidade deve ter pelo menos 2 caracteres'),
  
  state: z.string({
    required_error: 'Estado é obrigatório',
  }).length(2, 'Estado deve ter 2 caracteres (ex: SP)').toUpperCase(),
  
  zipCode: z.string({
    required_error: 'CEP é obrigatório',
  }).regex(CEP_REGEX, 'CEP inválido. Use o formato: 12345-678'),
  
  // ========== CONTATO DE EMERGÊNCIA ==========
  emergencyName: z.string({
    required_error: 'Nome do contato de emergência é obrigatório',
  }).min(2, 'Nome deve ter pelo menos 2 caracteres'),
  
  emergencyRelationship: z.string({
    required_error: 'Relacionamento é obrigatório',
  }).min(2, 'Relacionamento deve ter pelo menos 2 caracteres'),
  
  emergencyPhone: z.string({
    required_error: 'Telefone de emergência é obrigatório',
  }).regex(PHONE_REGEX, 'Telefone inválido. Use o formato: (11) 99999-9999'),
  
  emergencyPhone2: z.string()
    .regex(PHONE_REGEX, 'Telefone secundário inválido')
    .optional()
    .or(z.literal('')),
  
  emergencyEmail: z.string()
    .email('Email inválido')
    .optional()
    .or(z.literal('')),
  
  // ========== INFORMAÇÕES DE SAÚDE ==========
  bloodType: BloodTypeEnum.optional(),
  
  height: z.number({
    invalid_type_error: 'Altura deve ser um número',
  })
    .min(30, 'Altura mínima: 30cm')
    .max(250, 'Altura máxima: 250cm')
    .optional(),
  
  weight: z.number({
    invalid_type_error: 'Peso deve ser um número',
  })
    .min(1, 'Peso mínimo: 1kg')
    .max(300, 'Peso máximo: 300kg')
    .optional(),
  
  allergies: z.string()
    .max(500, 'Alergias não podem exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  chronicDiseases: z.string()
    .max(500, 'Doenças crônicas não podem exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  currentMedications: z.string()
    .max(500, 'Medicações não podem exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  previousSurgeries: z.string()
    .max(500, 'Cirurgias não podem exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  familyHistory: z.string()
    .max(500, 'Histórico familiar não pode exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  smokingStatus: SmokingStatusEnum,
  
  alcoholConsumption: AlcoholConsumptionEnum,
  
  physicalActivityLevel: PhysicalActivityLevelEnum,
  
  // ========== DIAGNÓSTICO E TRATAMENTO ==========
  mainDiagnosis: z.string()
    .min(3, 'Diagnóstico deve ter pelo menos 3 caracteres')
    .max(200, 'Diagnóstico não pode exceder 200 caracteres')
    .optional()
    .or(z.literal('')),
  
  conditions: z.string()
    .max(500, 'Condições não podem exceder 500 caracteres')
    .optional()
    .or(z.literal('')),
  
  referringDoctor: z.string()
    .min(3, 'Nome do médico deve ter pelo menos 3 caracteres')
    .max(100, 'Nome do médico não pode exceder 100 caracteres')
    .optional()
    .or(z.literal('')),
  
  referringDoctorCRM: z.string()
    .regex(CRM_REGEX, 'CRM inválido. Use apenas números (4-6 dígitos)')
    .optional()
    .or(z.literal('')),
  
  // ========== PLANO DE TRATAMENTO ==========
  totalPlannedSessions: z.number({
    invalid_type_error: 'Número de sessões deve ser um número',
  })
    .int('Número de sessões deve ser um número inteiro')
    .min(1, 'Mínimo de 1 sessão')
    .max(200, 'Máximo de 200 sessões')
    .optional(),
  
  preferredDaysOfWeek: z.array(z.string()).optional(),
  
  preferredTimeSlots: z.array(z.string()).optional(),
  
  // ========== CONVÊNIO ==========
  insuranceType: InsuranceTypeEnum,
  
  insuranceProvider: z.string()
    .min(2, 'Nome da operadora deve ter pelo menos 2 caracteres')
    .optional()
    .or(z.literal('')),
  
  insurancePlanName: z.string()
    .min(2, 'Nome do plano deve ter pelo menos 2 caracteres')
    .optional()
    .or(z.literal('')),
  
  insurancePolicyNumber: z.string()
    .min(3, 'Número da apólice deve ter pelo menos 3 caracteres')
    .optional()
    .or(z.literal('')),
  
  insuranceValidUntil: z.string().optional().or(z.literal('')),
  
  // ========== STATUS E OBSERVAÇÕES ==========
  status: PatientStatusEnum,
  
  observations: z.string()
    .max(1000, 'Observações não podem exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  internalNotes: z.string()
    .max(1000, 'Notas internas não podem exceder 1000 caracteres')
    .optional()
    .or(z.literal('')),
  
  // ========== CONSENTIMENTOS ==========
  hasConsentForm: z.boolean({
    required_error: 'Consentimento é obrigatório',
  }),
  
  hasDataPrivacyConsent: z.boolean({
    required_error: 'Consentimento de privacidade é obrigatório',
  }),
  
}).superRefine((data, ctx) => {
  // Validação: Se tem médico, deve ter CRM
  if (data.referringDoctor && data.referringDoctor.trim() !== '') {
    if (!data.referringDoctorCRM || data.referringDoctorCRM.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['referringDoctorCRM'],
        message: 'CRM é obrigatório quando há médico encaminhador',
      });
    }
  }
  
  // Validação: Consentimentos devem ser true
  if (!data.hasConsentForm) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['hasConsentForm'],
      message: 'É necessário aceitar o termo de consentimento',
    });
  }
  
  if (!data.hasDataPrivacyConsent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['hasDataPrivacyConsent'],
      message: 'É necessário aceitar a política de privacidade',
    });
  }
  
  // Validação: Se tem convênio, campos obrigatórios
  if (data.insuranceType !== 'none') {
    if (!data.insuranceProvider || data.insuranceProvider.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['insuranceProvider'],
        message: 'Operadora é obrigatória quando há convênio',
      });
    }
    
    if (!data.insurancePlanName || data.insurancePlanName.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['insurancePlanName'],
        message: 'Nome do plano é obrigatório quando há convênio',
      });
    }
    
    if (!data.insurancePolicyNumber || data.insurancePolicyNumber.trim() === '') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['insurancePolicyNumber'],
        message: 'Número da apólice é obrigatório quando há convênio',
      });
    }
  }
  
  // Validação: Calcular BMI se altura e peso estiverem presentes
  if (data.height && data.weight) {
    const bmi = data.weight / ((data.height / 100) ** 2);
    
    if (bmi < 10 || bmi > 60) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['weight'],
        message: 'IMC calculado está fora da faixa saudável (10-60). Verifique altura e peso',
      });
    }
  }
});

// ============================================================================
// TYPES
// ============================================================================

export type PatientFormInput = z.infer<typeof PatientFormSchema>;

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formata telefone para exibição
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
}

/**
 * Formata CEP para exibição
 */
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '');
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
}

