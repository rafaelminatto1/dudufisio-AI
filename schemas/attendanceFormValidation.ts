/**
 * Schema de Validação para Formulário de Atendimento
 *
 * Estende o soapNoteSchema com campos específicos da página de atendimento:
 * - Escala de dor
 * - Pontos de dor no mapa corporal
 * - Métricas customizadas do paciente
 */

import { z } from 'zod';

// =============================================================================
// SCHEMA DE PONTO DE DOR
// =============================================================================

export const painPointSchema = z.object({
  part: z.string()
    .min(1, 'Parte do corpo é obrigatória'),
  observation: z.string()
    .min(1, 'Observação é obrigatória')
    .max(500, 'Observação muito longa (máx 500 caracteres)'),
});

export type PainPoint = z.infer<typeof painPointSchema>;

// =============================================================================
// SCHEMA DE RESULTADO DE MÉTRICA
// =============================================================================

export const metricResultSchema = z.object({
  metricId: z.string()
    .min(1, 'ID da métrica é obrigatório'),
  value: z.number()
    .min(0, 'Valor da métrica deve ser positivo')
    .max(10000, 'Valor da métrica muito alto'),
});

export type MetricResult = z.infer<typeof metricResultSchema>;

// =============================================================================
// SCHEMA COMPLETO DO FORMULÁRIO DE ATENDIMENTO
// =============================================================================

/**
 * Schema para o formulário de atendimento/prontuário
 * Inclui validação de todos os campos necessários para uma sessão SOAP completa
 */
export const attendanceFormSchema = z.object({
  // ===== CAMPOS SOAP (Obrigatórios) =====
  subjective: z.string()
    .min(10, 'Campo Subjetivo deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Subjetivo muito longo (máx 5000 caracteres)'),

  objective: z.string()
    .min(10, 'Campo Objetivo deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Objetivo muito longo (máx 5000 caracteres)'),

  assessment: z.string()
    .min(10, 'Campo Avaliação deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Avaliação muito longo (máx 5000 caracteres)'),

  plan: z.string()
    .min(10, 'Campo Plano deve ter no mínimo 10 caracteres')
    .max(5000, 'Campo Plano muito longo (máx 5000 caracteres)'),

  // ===== ESCALA DE DOR (Opcional) =====
  painScale: z.number()
    .int('Escala de dor deve ser um número inteiro')
    .min(0, 'Escala de dor mínima é 0')
    .max(10, 'Escala de dor máxima é 10')
    .optional(),

  // ===== PONTOS DE DOR NO MAPA CORPORAL (Opcional) =====
  painPoints: z.array(painPointSchema)
    .max(20, 'Máximo de 20 pontos de dor permitidos')
    .default([]),

  // ===== MÉTRICAS CUSTOMIZADAS (Opcional) =====
  metricResults: z.array(metricResultSchema)
    .max(50, 'Máximo de 50 métricas permitidas')
    .default([]),

  // ===== ANEXOS (Opcional) =====
  attachments: z.array(z.instanceof(File))
    .max(10, 'Máximo de 10 anexos permitidos')
    .default([]),
});

export type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

// =============================================================================
// SCHEMA PARCIAL PARA AUTO-SAVE
// =============================================================================

/**
 * Schema mais flexível para auto-save
 * Permite campos vazios durante o preenchimento
 */
export const attendanceFormAutoSaveSchema = attendanceFormSchema.partial();

export type AttendanceFormAutoSaveData = z.infer<typeof attendanceFormAutoSaveSchema>;

// =============================================================================
// VALIDAÇÃO PROGRESSIVA POR CAMPO
// =============================================================================

/**
 * Schemas individuais para validação em tempo real (onBlur)
 */
export const fieldSchemas = {
  subjective: z.string()
    .min(10, 'Mínimo 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),

  objective: z.string()
    .min(10, 'Mínimo 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),

  assessment: z.string()
    .min(10, 'Mínimo 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),

  plan: z.string()
    .min(10, 'Mínimo 10 caracteres')
    .max(5000, 'Máximo 5000 caracteres'),

  painScale: z.number()
    .int()
    .min(0)
    .max(10)
    .optional(),
};

// =============================================================================
// HELPERS DE VALIDAÇÃO
// =============================================================================

/**
 * Calcula progresso do preenchimento do formulário
 * @param data Dados parciais do formulário
 * @returns Porcentagem de preenchimento (0-100)
 */
export function calculateFormCompletion(data: Partial<AttendanceFormData>): number {
  const requiredFields: (keyof AttendanceFormData)[] = ['subjective', 'objective', 'assessment', 'plan'];
  const completedFields = requiredFields.filter(field => {
    const value = data[field];
    return typeof value === 'string' && value.trim().length >= 10;
  });

  return Math.round((completedFields.length / requiredFields.length) * 100);
}

/**
 * Verifica se o formulário está pronto para finalização
 * @param data Dados do formulário
 * @returns true se todos os campos obrigatórios estão preenchidos
 */
export function isFormReadyToFinish(data: Partial<AttendanceFormData>): boolean {
  const result = attendanceFormSchema.safeParse(data);
  return result.success;
}

/**
 * Obtém erros de validação em formato amigável
 * @param data Dados do formulário
 * @returns Objeto com erros por campo
 */
export function getFormErrors(data: Partial<AttendanceFormData>): Record<string, string> {
  const result = attendanceFormSchema.safeParse(data);

  if (result.success) return {};

  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const field = err.path[0]?.toString();
    if (field && !errors[field]) {
      errors[field] = err.message;
    }
  });

  return errors;
}

// =============================================================================
// EXPORTS
// =============================================================================

export default {
  attendanceFormSchema,
  attendanceFormAutoSaveSchema,
  painPointSchema,
  metricResultSchema,
  fieldSchemas,
  calculateFormCompletion,
  isFormReadyToFinish,
  getFormErrors,
};
