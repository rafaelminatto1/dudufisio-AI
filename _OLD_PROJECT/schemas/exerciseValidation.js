/**
 * Schemas de Validação Zod para Sistema de Exercícios
 * Validação completa e profissional para todos os tipos de exercícios
 */
import { z } from 'zod';
// Schemas Base
export const ExerciseDifficultySchema = z.enum(['beginner', 'intermediate', 'advanced', 'expert']);
export const ExerciseSourceSchema = z.enum(['system', 'user', 'imported', 'external']);
export const EquipmentTypeSchema = z.enum([
    'none', 'dumbbell', 'barbell', 'resistance_band', 'stability_ball',
    'mat', 'chair', 'wall', 'other'
]);
export const ProgressionLevelSchema = z.number().int().min(1).max(5);
export const ProtocolIntensitySchema = z.enum(['low', 'moderate', 'high', 'very_high']);
export const AssignmentStatusSchema = z.enum(['assigned', 'in_progress', 'completed', 'paused', 'cancelled']);
// Schema para Categoria de Exercício
export const ExerciseCategorySchema = z.object({
    id: z.string().uuid('ID deve ser um UUID válido'),
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(100, 'Nome deve ter no máximo 100 caracteres')
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras e espaços'),
    description: z.string()
        .max(500, 'Descrição deve ter no máximo 500 caracteres')
        .optional(),
    color: z.string()
        .regex(/^#[0-9A-F]{6}$/i, 'Cor deve ser um código hexadecimal válido (ex: #FF0000)'),
    icon: z.string()
        .min(1, 'Ícone é obrigatório')
        .max(50, 'Nome do ícone deve ter no máximo 50 caracteres'),
    parentId: z.string().uuid('ID do pai deve ser um UUID válido').optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0)
});
// Schema para Exercício
export const ExerciseSchema = z.object({
    id: z.string().uuid('ID deve ser um UUID válido'),
    // Informações Básicas
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    description: z.string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
    category: z.string().uuid('Categoria deve ser um UUID válido'),
    subcategory: z.string()
        .max(100, 'Subcategoria deve ter no máximo 100 caracteres')
        .optional(),
    // Características Físicas
    targetMuscles: z.array(z.string().min(1, 'Músculo alvo não pode estar vazio'))
        .min(1, 'Pelo menos um músculo alvo deve ser especificado')
        .max(10, 'Máximo 10 músculos alvos permitidos'),
    secondaryMuscles: z.array(z.string().min(1, 'Músculo secundário não pode estar vazio'))
        .max(10, 'Máximo 10 músculos secundários permitidos')
        .default([]),
    equipment: z.array(EquipmentTypeSchema)
        .min(1, 'Pelo menos um equipamento deve ser especificado'),
    difficulty: ExerciseDifficultySchema,
    // Instruções e Conteúdo
    instructions: z.array(z.string().min(10, 'Instrução deve ter pelo menos 10 caracteres'))
        .min(1, 'Pelo menos uma instrução deve ser fornecida')
        .max(20, 'Máximo 20 instruções permitidas'),
    tips: z.array(z.string().min(5, 'Dica deve ter pelo menos 5 caracteres'))
        .max(15, 'Máximo 15 dicas permitidas')
        .default([]),
    variations: z.array(z.string().min(5, 'Variação deve ter pelo menos 5 caracteres'))
        .max(10, 'Máximo 10 variações permitidas')
        .default([]),
    contraindications: z.array(z.string().min(5, 'Contraindicação deve ter pelo menos 5 caracteres'))
        .max(10, 'Máximo 10 contraindicações permitidas')
        .default([]),
    // Parâmetros de Execução
    duration: z.number()
        .int()
        .min(1, 'Duração deve ser pelo menos 1 minuto')
        .max(180, 'Duração não pode exceder 180 minutos')
        .optional(),
    sets: z.number()
        .int()
        .min(1, 'Número de séries deve ser pelo menos 1')
        .max(50, 'Número de séries não pode exceder 50')
        .optional(),
    reps: z.number()
        .int()
        .min(1, 'Número de repetições deve ser pelo menos 1')
        .max(1000, 'Número de repetições não pode exceder 1000')
        .optional(),
    weight: z.number()
        .min(0, 'Peso não pode ser negativo')
        .max(1000, 'Peso não pode exceder 1000kg')
        .optional(),
    distance: z.number()
        .min(0, 'Distância não pode ser negativa')
        .max(50000, 'Distância não pode exceder 50km')
        .optional(),
    restTime: z.number()
        .int()
        .min(0, 'Tempo de descanso não pode ser negativo')
        .max(3600, 'Tempo de descanso não pode exceder 1 hora')
        .optional(),
    // Mídia
    imageUrl: z.string()
        .url('URL da imagem deve ser válida')
        .optional()
        .or(z.literal('')),
    videoUrl: z.string()
        .url('URL do vídeo deve ser válida')
        .optional()
        .or(z.literal('')),
    thumbnailUrl: z.string()
        .url('URL da miniatura deve ser válida')
        .optional()
        .or(z.literal('')),
    // Classificação e Tags
    tags: z.array(z.string().min(1, 'Tag não pode estar vazia'))
        .max(20, 'Máximo 20 tags permitidas')
        .default([]),
    keywords: z.array(z.string().min(1, 'Palavra-chave não pode estar vazia'))
        .max(30, 'Máximo 30 palavras-chave permitidas')
        .default([]),
    bodyParts: z.array(z.string().min(1, 'Parte do corpo não pode estar vazia'))
        .max(15, 'Máximo 15 partes do corpo permitidas')
        .default([]),
    // Metadados
    source: ExerciseSourceSchema,
    sourceId: z.string()
        .max(100, 'ID da fonte deve ter no máximo 100 caracteres')
        .optional(),
    isCustom: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    isActive: z.boolean().default(true),
    // Relacionamentos
    createdBy: z.string().uuid('ID do criador deve ser um UUID válido'),
    assignedPatients: z.array(z.string().uuid('ID do paciente deve ser um UUID válido'))
        .default([]),
    protocols: z.array(z.string().uuid('ID do protocolo deve ser um UUID válido'))
        .default([]),
    // Progressão
    progressionLevel: ProgressionLevelSchema,
    prerequisites: z.array(z.string().uuid('ID do pré-requisito deve ser um UUID válido'))
        .default([]),
    // Auditoria
    createdAt: z.date(),
    updatedAt: z.date(),
    lastUsedAt: z.date().optional(),
    // Estatísticas
    usageCount: z.number().int().min(0).default(0),
    averageRating: z.number()
        .min(0, 'Avaliação média não pode ser negativa')
        .max(10, 'Avaliação média não pode exceder 10')
        .optional(),
    totalRatings: z.number().int().min(0).default(0)
});
// Schema para Formulário de Exercício
export const ExerciseFormSchema = z.object({
    name: z.string()
        .min(1, 'Nome é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    description: z.string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
    category: z.string()
        .min(1, 'Categoria é obrigatória'),
    subcategory: z.string()
        .max(100, 'Subcategoria deve ter no máximo 100 caracteres')
        .optional(),
    targetMuscles: z.array(z.string().min(1, 'Músculo alvo não pode estar vazio'))
        .min(1, 'Pelo menos um músculo alvo deve ser especificado'),
    secondaryMuscles: z.array(z.string().min(1, 'Músculo secundário não pode estar vazio'))
        .default([]),
    equipment: z.array(EquipmentTypeSchema)
        .min(1, 'Pelo menos um equipamento deve ser especificado'),
    difficulty: ExerciseDifficultySchema,
    instructions: z.array(z.string().min(10, 'Instrução deve ter pelo menos 10 caracteres'))
        .min(1, 'Pelo menos uma instrução deve ser fornecida'),
    tips: z.array(z.string().min(5, 'Dica deve ter pelo menos 5 caracteres'))
        .default([]),
    variations: z.array(z.string().min(5, 'Variação deve ter pelo menos 5 caracteres'))
        .default([]),
    contraindications: z.array(z.string().min(5, 'Contraindicação deve ter pelo menos 5 caracteres'))
        .default([]),
    duration: z.number()
        .int()
        .min(1)
        .max(180)
        .optional(),
    sets: z.number()
        .int()
        .min(1)
        .max(50)
        .optional(),
    reps: z.number()
        .int()
        .min(1)
        .max(1000)
        .optional(),
    weight: z.number()
        .min(0)
        .max(1000)
        .optional(),
    distance: z.number()
        .min(0)
        .max(50000)
        .optional(),
    restTime: z.number()
        .int()
        .min(0)
        .max(3600)
        .optional(),
    imageUrl: z.string().url().optional().or(z.literal('')),
    videoUrl: z.string().url().optional().or(z.literal('')),
    thumbnailUrl: z.string().url().optional().or(z.literal('')),
    tags: z.array(z.string().min(1))
        .default([]),
    keywords: z.array(z.string().min(1))
        .default([]),
    bodyParts: z.array(z.string().min(1))
        .default([]),
    source: ExerciseSourceSchema,
    sourceId: z.string().max(100).optional(),
    isCustom: z.boolean().default(false),
    isPublic: z.boolean().default(false),
    isActive: z.boolean().default(true),
    progressionLevel: ProgressionLevelSchema,
    prerequisites: z.array(z.string().min(1))
        .default([])
});
// Schema para Protocolo de Exercício
export const ExerciseProtocolSchema = z.object({
    id: z.string().uuid(),
    name: z.string()
        .min(1, 'Nome do protocolo é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    description: z.string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
    exercises: z.array(z.object({
        exerciseId: z.string().uuid('ID do exercício deve ser um UUID válido'),
        order: z.number().int().min(1, 'Ordem deve ser pelo menos 1'),
        sets: z.number().int().min(1).max(50),
        reps: z.number().int().min(1).max(1000),
        duration: z.number().int().min(1).max(180).optional(),
        weight: z.number().min(0).max(1000).optional(),
        restTime: z.number().int().min(0).max(3600).optional(),
        notes: z.string().max(500).optional(),
        isOptional: z.boolean().default(false)
    })).min(1, 'Protocolo deve conter pelo menos um exercício'),
    duration: z.number()
        .int()
        .min(1, 'Duração deve ser pelo menos 1 semana')
        .max(52, 'Duração não pode exceder 52 semanas'),
    frequency: z.number()
        .int()
        .min(1, 'Frequência deve ser pelo menos 1 sessão por semana')
        .max(7, 'Frequência não pode exceder 7 sessões por semana'),
    intensity: ProtocolIntensitySchema,
    targetConditions: z.array(z.string().min(1))
        .max(10, 'Máximo 10 condições alvo permitidas')
        .default([]),
    createdBy: z.string().uuid(),
    isPublic: z.boolean().default(false),
    isActive: z.boolean().default(true),
    createdAt: z.date(),
    updatedAt: z.date()
});
// Schema para Atribuição de Exercício
export const ExerciseAssignmentSchema = z.object({
    id: z.string().uuid(),
    patientId: z.string().uuid('ID do paciente deve ser um UUID válido'),
    exerciseId: z.string().uuid('ID do exercício deve ser um UUID válido'),
    protocolId: z.string().uuid('ID do protocolo deve ser um UUID válido').optional(),
    assignedBy: z.string().uuid('ID do responsável deve ser um UUID válido'),
    assignedAt: z.date(),
    startDate: z.date(),
    endDate: z.date().optional(),
    status: AssignmentStatusSchema,
    instructions: z.string().max(1000).optional(),
    notes: z.string().max(1000).optional(),
    isActive: z.boolean().default(true)
});
// Schema para Progresso de Exercício
export const ExerciseProgressSchema = z.object({
    id: z.string().uuid(),
    assignmentId: z.string().uuid(),
    sessionDate: z.date(),
    sets: z.number().int().min(0).max(50),
    reps: z.number().int().min(0).max(1000),
    weight: z.number().min(0).max(1000).optional(),
    duration: z.number().int().min(0).max(180).optional(),
    difficulty: z.number()
        .int()
        .min(1, 'Dificuldade deve ser entre 1 e 10')
        .max(10, 'Dificuldade deve ser entre 1 e 10'),
    painLevel: z.number()
        .int()
        .min(1, 'Nível de dor deve ser entre 1 e 10')
        .max(10, 'Nível de dor deve ser entre 1 e 10'),
    completionRate: z.number()
        .min(0, 'Taxa de conclusão deve ser entre 0 e 100')
        .max(100, 'Taxa de conclusão deve ser entre 0 e 100'),
    notes: z.string().max(1000).optional(),
    recordedBy: z.string().uuid(),
    recordedAt: z.date()
});
// Schema para Sessão de Exercício
export const ExerciseSessionSchema = z.object({
    id: z.string().uuid(),
    patientId: z.string().uuid(),
    therapistId: z.string().uuid(),
    sessionDate: z.date(),
    exercises: z.array(z.object({
        exerciseId: z.string().uuid(),
        sets: z.number().int().min(0).max(50),
        reps: z.number().int().min(0).max(1000),
        weight: z.number().min(0).max(1000).optional(),
        duration: z.number().int().min(0).max(180).optional(),
        restTime: z.number().int().min(0).max(3600).optional(),
        difficulty: z.number().int().min(1).max(10),
        painLevel: z.number().int().min(1).max(10),
        completionRate: z.number().min(0).max(100),
        notes: z.string().max(1000).optional(),
        isCompleted: z.boolean().default(false)
    })).min(1, 'Sessão deve conter pelo menos um exercício'),
    totalDuration: z.number().int().min(1, 'Duração total deve ser pelo menos 1 minuto'),
    notes: z.string().max(2000).optional(),
    overallRating: z.number()
        .min(1, 'Avaliação geral deve ser entre 1 e 10')
        .max(10, 'Avaliação geral deve ser entre 1 e 10'),
    isCompleted: z.boolean().default(false),
    createdAt: z.date(),
    updatedAt: z.date()
});
// Schema para Template de Exercício
export const ExerciseTemplateSchema = z.object({
    id: z.string().uuid(),
    name: z.string()
        .min(1, 'Nome do template é obrigatório')
        .max(200, 'Nome deve ter no máximo 200 caracteres'),
    description: z.string()
        .min(10, 'Descrição deve ter pelo menos 10 caracteres')
        .max(2000, 'Descrição deve ter no máximo 2000 caracteres'),
    category: z.string().min(1, 'Categoria é obrigatória'),
    exercises: z.array(z.object({
        exerciseId: z.string().uuid(),
        order: z.number().int().min(1),
        sets: z.number().int().min(1).max(50),
        reps: z.number().int().min(1).max(1000),
        duration: z.number().int().min(1).max(180).optional(),
        weight: z.number().min(0).max(1000).optional(),
        restTime: z.number().int().min(0).max(3600).optional(),
        notes: z.string().max(500).optional()
    })).min(1, 'Template deve conter pelo menos um exercício'),
    targetAudience: z.array(z.string().min(1))
        .max(10, 'Máximo 10 públicos-alvo permitidos')
        .default([]),
    duration: z.number().int().min(1).max(52),
    difficulty: ExerciseDifficultySchema,
    isPublic: z.boolean().default(false),
    usageCount: z.number().int().min(0).default(0),
    rating: z.number().min(0).max(10).optional(),
    createdBy: z.string().uuid(),
    createdAt: z.date(),
    updatedAt: z.date()
});
// Schema para Filtros de Busca
export const ExerciseSearchFiltersSchema = z.object({
    query: z.string().max(200).optional(),
    category: z.string().uuid().optional(),
    difficulty: ExerciseDifficultySchema.optional(),
    equipment: z.array(EquipmentTypeSchema).optional(),
    targetMuscles: z.array(z.string().min(1)).optional(),
    bodyParts: z.array(z.string().min(1)).optional(),
    tags: z.array(z.string().min(1)).optional(),
    isActive: z.boolean().optional(),
    isPublic: z.boolean().optional(),
    createdBy: z.string().uuid().optional()
});
// Schema para Importação
export const ImportOptionsSchema = z.object({
    overwriteExisting: z.boolean().default(false),
    createNewCategories: z.boolean().default(true),
    assignToCurrentUser: z.boolean().default(true),
    makePublic: z.boolean().default(false)
});
// Schema para Exportação
export const ExerciseExportDataSchema = z.object({
    exercises: z.array(ExerciseSchema),
    categories: z.array(ExerciseCategorySchema),
    protocols: z.array(ExerciseProtocolSchema),
    templates: z.array(ExerciseTemplateSchema),
    exportDate: z.date(),
    exportedBy: z.string().uuid()
});
// Funções de Validação Personalizadas
export const validateExerciseName = (name) => {
    return name.length >= 1 && name.length <= 200 && /^[a-zA-ZÀ-ÿ0-9\s\-_()]+$/.test(name);
};
export const validateExerciseDescription = (description) => {
    return description.length >= 10 && description.length <= 2000;
};
export const validateExerciseInstructions = (instructions) => {
    return instructions.length >= 1 &&
        instructions.length <= 20 &&
        instructions.every(instruction => instruction.length >= 10);
};
export const validateExerciseParameters = (exercise) => {
    const { duration, sets, reps, weight, distance } = exercise;
    // Pelo menos um parâmetro deve ser fornecido
    const hasParameter = duration || sets || reps || weight || distance;
    if (!hasParameter)
        return false;
    // Validações individuais
    if (duration && (duration < 1 || duration > 180))
        return false;
    if (sets && (sets < 1 || sets > 50))
        return false;
    if (reps && (reps < 1 || reps > 1000))
        return false;
    if (weight && (weight < 0 || weight > 1000))
        return false;
    if (distance && (distance < 0 || distance > 50000))
        return false;
    return true;
};
// Mensagens de erro personalizadas em português
export const ExerciseValidationMessages = {
    REQUIRED_FIELD: 'Este campo é obrigatório',
    INVALID_UUID: 'ID deve ser um UUID válido',
    NAME_TOO_SHORT: 'Nome deve ter pelo menos 1 caractere',
    NAME_TOO_LONG: 'Nome deve ter no máximo 200 caracteres',
    DESCRIPTION_TOO_SHORT: 'Descrição deve ter pelo menos 10 caracteres',
    DESCRIPTION_TOO_LONG: 'Descrição deve ter no máximo 2000 caracteres',
    INVALID_DIFFICULTY: 'Dificuldade deve ser: beginner, intermediate, advanced ou expert',
    INVALID_EQUIPMENT: 'Equipamento inválido',
    INSTRUCTIONS_REQUIRED: 'Pelo menos uma instrução deve ser fornecida',
    INSTRUCTIONS_TOO_MANY: 'Máximo 20 instruções permitidas',
    INSTRUCTION_TOO_SHORT: 'Instrução deve ter pelo menos 10 caracteres',
    TARGET_MUSCLES_REQUIRED: 'Pelo menos um músculo alvo deve ser especificado',
    EQUIPMENT_REQUIRED: 'Pelo menos um equipamento deve ser especificado',
    INVALID_URL: 'URL inválida',
    INVALID_DATE: 'Data inválida',
    INVALID_NUMBER: 'Número inválido',
    VALUE_OUT_OF_RANGE: 'Valor fora do intervalo permitido'
};
