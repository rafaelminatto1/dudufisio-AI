import { z } from 'zod';
// Validation schemas
export const createSessionSchema = z.object({
    procedures_performed: z
        .string()
        .max(2000, 'Procedimentos devem ter no máximo 2000 caracteres')
        .optional(),
    pain_level_before: z
        .number()
        .min(0, 'Nível de dor deve estar entre 0 e 10')
        .max(10, 'Nível de dor deve estar entre 0 e 10')
        .int('Nível de dor deve ser um número inteiro')
        .optional(),
    pain_level_after: z
        .number()
        .min(0, 'Nível de dor deve estar entre 0 e 10')
        .max(10, 'Nível de dor deve estar entre 0 e 10')
        .int('Nível de dor deve ser um número inteiro')
        .optional(),
    progress_notes: z
        .string()
        .max(2000, 'Notas de progresso devem ter no máximo 2000 caracteres')
        .optional(),
    next_session_notes: z
        .string()
        .max(1000, 'Notas para próxima sessão devem ter no máximo 1000 caracteres')
        .optional(),
    exercises_prescribed: z
        .string()
        .max(2000, 'Exercícios prescritos devem ter no máximo 2000 caracteres')
        .optional()
});
export const updateSessionSchema = createSessionSchema;
// Helper functions
export function calculatePainImprovement(painBefore, painAfter) {
    if (painBefore === null || painBefore === undefined || painAfter === null || painAfter === undefined) {
        return 0;
    }
    return painBefore - painAfter;
}
export function getProgressLevel(improvement) {
    if (improvement >= 3)
        return 'excellent';
    if (improvement >= 2)
        return 'good';
    if (improvement >= 1)
        return 'fair';
    return 'poor';
}
export function getProgressLevelLabel(level) {
    const labels = {
        excellent: 'Excelente',
        good: 'Bom',
        fair: 'Regular',
        poor: 'Ruim'
    };
    return labels[level];
}
export function getProgressLevelColor(level) {
    const colors = {
        excellent: 'green',
        good: 'blue',
        fair: 'yellow',
        poor: 'red'
    };
    return colors[level];
}
export function getPainLevelLabel(painLevel) {
    if (painLevel === 0)
        return 'Sem dor';
    if (painLevel <= 2)
        return 'Dor leve';
    if (painLevel <= 5)
        return 'Dor moderada';
    if (painLevel <= 8)
        return 'Dor intensa';
    return 'Dor muito intensa';
}
export function formatSessionDate(createdAt) {
    const date = new Date(createdAt);
    return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}
export function formatSessionDateTime(createdAt) {
    const date = new Date(createdAt);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}
// Session validation helpers
export function isSessionComplete(session) {
    return !!(session.procedures_performed ||
        session.progress_notes ||
        (session.pain_level_before !== null && session.pain_level_after !== null));
}
export function hasRequiredSessionData(session) {
    return !!(session.procedures_performed ||
        session.progress_notes ||
        session.pain_level_before !== undefined ||
        session.pain_level_after !== undefined);
}
// Common session procedures (for autocomplete/suggestions)
export const COMMON_PROCEDURES = [
    'Mobilização articular',
    'Massagem terapêutica',
    'Exercícios de fortalecimento',
    'Exercícios de alongamento',
    'Eletroterapia',
    'Crioterapia',
    'Termoterapia',
    'Exercícios de propriocepção',
    'Treinamento de marcha',
    'Exercícios respiratórios',
    'Mobilização neural',
    'Técnicas de relaxamento',
    'Drenagem linfática',
    'Exercícios funcionais',
    'Treino de equilíbrio'
];
// Session goals and outcomes
export const SESSION_GOALS = [
    'Redução da dor',
    'Melhora da amplitude de movimento',
    'Aumento da força muscular',
    'Melhora da função',
    'Redução da inflamação',
    'Melhora do equilíbrio',
    'Aumento da resistência',
    'Correção postural',
    'Educação do paciente',
    'Prevenção de recidivas'
];
