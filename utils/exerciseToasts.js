import { logger } from '../lib/logger';

const CONTEXT = 'exerciseToasts';

const logInfo = (message, data) => {
    logger.info(message, { context: CONTEXT, data });
};

const logWarn = (message, data) => {
    logger.warn(message, { context: CONTEXT, data });
};

const logError = (message, data) => {
    logger.error(message, { context: CONTEXT, data });
};

export const exerciseToasts = {
    createSuccess: (exerciseName) => {
        logInfo(`Exercício "${exerciseName}" criado com sucesso!`, { exerciseName });
    },
    updateSuccess: (exerciseName) => {
        logInfo(`Exercício "${exerciseName}" atualizado com sucesso!`, { exerciseName });
    },
    deleteSuccess: (exerciseName) => {
        logInfo(`Exercício "${exerciseName}" excluído com sucesso!`, { exerciseName });
    },
    duplicateSuccess: (exerciseName) => {
        logInfo(`Exercício "${exerciseName}" duplicado com sucesso!`, { exerciseName });
    },
    categoryCreated: (categoryName) => {
        logInfo(`Categoria "${categoryName}" criada com sucesso!`, { categoryName });
    },
    categoryUpdated: (categoryName) => {
        logInfo(`Categoria "${categoryName}" atualizada com sucesso!`, { categoryName });
    },
    categoryDeleted: (categoryName) => {
        logInfo(`Categoria "${categoryName}" excluída com sucesso!`, { categoryName });
    },
    protocolCreated: (protocolName) => {
        logInfo(`Protocolo "${protocolName}" criado com sucesso!`, { protocolName });
    },
    protocolUpdated: (protocolName) => {
        logInfo(`Protocolo "${protocolName}" atualizado com sucesso!`, { protocolName });
    },
    protocolDeleted: (protocolName) => {
        logInfo(`Protocolo "${protocolName}" excluído com sucesso!`, { protocolName });
    },
    assignmentCreated: (patientName, exerciseName) => {
        logInfo(`Exercício "${exerciseName}" atribuído a ${patientName}!`, { exerciseName, patientName });
    },
    assignmentCompleted: (exerciseName) => {
        logInfo(`Atribuição de "${exerciseName}" marcada como concluída!`, { exerciseName });
    },
    createError: (error) => {
        logError('Erro ao criar exercício.', { error });
    },
    updateError: (error) => {
        logError('Erro ao atualizar exercício.', { error });
    },
    deleteError: (error) => {
        logError('Erro ao excluir exercício.', { error });
    },
    loadError: (error) => {
        logError('Erro ao carregar exercícios.', { error });
    },
    validationError: (error) => {
        logWarn('Erro de validação.', { error });
    },
    noExercisesFound: () => {
        logWarn('Nenhum exercício encontrado com os filtros aplicados.');
    },
    loadingData: () => {
        logInfo('Carregando exercícios...');
    },
    exportSuccess: (count) => {
        logInfo(`${count} exercício(s) exportado(s) com sucesso!`, { count });
    },
    importSuccess: (count) => {
        logInfo(`${count} exercício(s) importado(s) com sucesso!`, { count });
    },
    exportError: (error) => {
        logError('Erro ao exportar exercícios.', { error });
    },
    importError: (error) => {
        logError('Erro ao importar exercícios.', { error });
    },
};
