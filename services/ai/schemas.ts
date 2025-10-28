/**
 * Schemas Zod para Validação de Entrada - Serviços AI
 * 
 * Valida todas as entradas dos serviços de IA para prevenir:
 * - Injection attacks
 * - Dados malformados
 * - Payloads excessivamente grandes
 * - Dados sensíveis não sanitizados
 */

import { z } from 'zod';

// ============================================================================
// SCHEMAS BÁSICOS
// ============================================================================

/**
 * Schema para UUIDs válidos
 */
export const uuidSchema = z.string().uuid({
  message: 'ID inválido. Deve ser um UUID válido.'
});

/**
 * Schema para texto genérico com limitações de segurança
 */
export const safeTextSchema = z.string()
  .min(1, 'Texto não pode estar vazio')
  .max(10000, 'Texto muito longo (máximo 10000 caracteres)')
  .trim();

/**
 * Schema para prompts de IA
 */
export const promptSchema = z.string()
  .min(1, 'Prompt não pode estar vazio')
  .max(4000, 'Prompt muito longo (máximo 4000 caracteres)')
  .trim()
  .refine(
    (val) => !val.includes('<script>'),
    'Prompt contém conteúdo potencialmente malicioso'
  );

/**
 * Schema para tokens de limite
 */
export const tokenLimitSchema = z.number()
  .int('Limite de tokens deve ser um número inteiro')
  .min(100, 'Limite mínimo de 100 tokens')
  .max(8000, 'Limite máximo de 8000 tokens')
  .default(2000);

// ============================================================================
// SCHEMAS DE CONSULTA AI
// ============================================================================

/**
 * Schema para consulta básica de IA
 */
export const aiQuerySchema = z.object({
  prompt: promptSchema,
  patientId: uuidSchema.optional(),
  therapistId: uuidSchema.optional(),
  maxTokens: tokenLimitSchema.optional(),
  temperature: z.number().min(0).max(2).default(0.7).optional(),
  context: z.string().max(2000).optional(),
});

export type AIQuery = z.infer<typeof aiQuerySchema>;

/**
 * Schema para análise de progresso do paciente
 */
export const patientProgressAnalysisSchema = z.object({
  patientId: uuidSchema,
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  focusAreas: z.array(z.string()).max(10).optional(),
  additionalContext: z.string().max(1000).optional(),
});

export type PatientProgressAnalysis = z.infer<typeof patientProgressAnalysisSchema>;

/**
 * Schema para geração de nota SOAP
 */
export const soapNoteGenerationSchema = z.object({
  patientId: uuidSchema,
  subjective: safeTextSchema.max(2000),
  objective: safeTextSchema.max(2000),
  assessment: safeTextSchema.max(1000).optional(),
  plan: safeTextSchema.max(1000).optional(),
  sessionId: uuidSchema.optional(),
});

export type SOAPNoteGeneration = z.infer<typeof soapNoteGenerationSchema>;

/**
 * Schema para sugestão de protocolo de tratamento
 */
export const treatmentProtocolSuggestionSchema = z.object({
  diagnosis: z.string().min(3).max(500),
  patientAge: z.number().int().min(0).max(150),
  patientGender: z.enum(['M', 'F', 'Other']).optional(),
  limitations: z.string().max(1000).optional(),
  goals: z.array(z.string().max(200)).max(5).optional(),
  comorbidities: z.array(z.string().max(100)).max(10).optional(),
});

export type TreatmentProtocolSuggestion = z.infer<typeof treatmentProtocolSuggestionSchema>;

// ============================================================================
// SCHEMAS DE EXERCÍCIOS
// ============================================================================

/**
 * Schema para busca de exercícios
 */
export const exerciseSearchSchema = z.object({
  query: z.string().min(2).max(200).optional(),
  bodyPart: z.enum([
    'Coluna Cervical',
    'Coluna Torácica', 
    'Coluna Lombar',
    'Ombro',
    'Cotovelo',
    'Punho/Mão',
    'Quadril',
    'Joelho',
    'Tornozelo/Pé',
    'Core',
    'Corpo Todo'
  ]).optional(),
  category: z.enum([
    'Alongamento',
    'Fortalecimento',
    'Mobilidade',
    'Equilíbrio',
    'Cardio',
    'Propriocepção'
  ]).optional(),
  difficulty: z.enum(['Iniciante', 'Intermediário', 'Avançado']).optional(),
  limit: z.number().int().min(1).max(50).default(20),
  offset: z.number().int().min(0).default(0),
});

export type ExerciseSearch = z.infer<typeof exerciseSearchSchema>;

/**
 * Schema para criação de protocolo de exercícios
 */
export const exerciseProtocolCreationSchema = z.object({
  patientId: uuidSchema,
  name: z.string().min(3).max(200),
  description: z.string().max(1000).optional(),
  exerciseIds: z.array(uuidSchema).min(1).max(20),
  duration: z.string().max(100).optional(),
  frequency: z.string().max(100).optional(),
  instructions: z.string().max(2000).optional(),
  goals: z.array(z.string().max(200)).max(5).optional(),
});

export type ExerciseProtocolCreation = z.infer<typeof exerciseProtocolCreationSchema>;

// ============================================================================
// SCHEMAS DE RELATÓRIOS
// ============================================================================

/**
 * Schema para geração de relatório de evolução
 */
export const evolutionReportSchema = z.object({
  patientId: uuidSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  includeTests: z.boolean().default(true),
  includeExercises: z.boolean().default(true),
  includeMeasurements: z.boolean().default(true),
  includePhotos: z.boolean().default(false),
  format: z.enum(['pdf', 'html', 'json']).default('pdf'),
});

export type EvolutionReport = z.infer<typeof evolutionReportSchema>;

// ============================================================================
// SCHEMAS DE AGENDAMENTO
// ============================================================================

/**
 * Schema para criação de agendamento
 */
export const appointmentCreationSchema = z.object({
  patientId: uuidSchema,
  therapistId: uuidSchema,
  date: z.string().datetime(),
  duration: z.number().int().min(15).max(240).default(60),
  type: z.enum(['Avaliação', 'Sessão', 'Reavaliação', 'Retorno']),
  notes: z.string().max(1000).optional(),
  isRecurrent: z.boolean().default(false),
  recurrencePattern: z.object({
    frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
    endDate: z.string().datetime(),
    daysOfWeek: z.array(z.number().int().min(0).max(6)).optional(),
  }).optional(),
});

export type AppointmentCreation = z.infer<typeof appointmentCreationSchema>;

// ============================================================================
// SCHEMAS DE ANÁLISE DE IMAGEM
// ============================================================================

/**
 * Schema para análise de imagem (postura, mapa corporal, etc)
 */
export const imageAnalysisSchema = z.object({
  imageUrl: z.string().url('URL de imagem inválida'),
  analysisType: z.enum(['posture', 'bodyMap', 'exercise', 'movement']),
  patientId: uuidSchema.optional(),
  additionalContext: z.string().max(500).optional(),
});

export type ImageAnalysis = z.infer<typeof imageAnalysisSchema>;

// ============================================================================
// SCHEMAS DE VALIDAÇÃO DE PACIENTE
// ============================================================================

/**
 * Schema para dados básicos de paciente
 */
export const patientBasicDataSchema = z.object({
  name: z.string().min(3).max(200),
  dateOfBirth: z.string().datetime(),
  gender: z.enum(['M', 'F', 'Other']),
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve conter 11 dígitos').optional(),
  email: z.string().email('Email inválido').optional(),
  phone: z.string().regex(/^\d{10,11}$/, 'Telefone inválido').optional(),
});

export type PatientBasicData = z.infer<typeof patientBasicDataSchema>;

// ============================================================================
// FUNÇÕES AUXILIARES DE VALIDAÇÃO
// ============================================================================

/**
 * Valida e sanitiza entrada com schema Zod
 */
export function validateAndSanitize<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  try {
    const validated = schema.parse(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

/**
 * Valida de forma assíncrona (útil para validações com banco de dados)
 */
export async function validateAndSanitizeAsync<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): Promise<{ success: true; data: T } | { success: false; errors: string[] }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      );
      return { success: false, errors };
    }
    return { success: false, errors: ['Erro de validação desconhecido'] };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  // Schemas básicos
  uuidSchema,
  safeTextSchema,
  promptSchema,
  tokenLimitSchema,

  // Schemas de AI
  aiQuerySchema,
  patientProgressAnalysisSchema,
  soapNoteGenerationSchema,
  treatmentProtocolSuggestionSchema,

  // Schemas de exercícios
  exerciseSearchSchema,
  exerciseProtocolCreationSchema,

  // Schemas de relatórios
  evolutionReportSchema,

  // Schemas de agendamento
  appointmentCreationSchema,

  // Schemas de análise
  imageAnalysisSchema,

  // Schemas de paciente
  patientBasicDataSchema,

  // Funções auxiliares
  validateAndSanitize,
  validateAndSanitizeAsync,
};

