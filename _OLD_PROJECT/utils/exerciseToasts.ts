import { logger } from '../lib/logger';

const CONTEXT = 'exerciseToasts';

const logInfo = (message: string, data?: Record<string, unknown>) => {
  logger.info(message, { context: CONTEXT, data });
};

const logWarn = (message: string, data?: Record<string, unknown>) => {
  logger.warn(message, { context: CONTEXT, data });
};

const logError = (message: string, data?: Record<string, unknown>) => {
  logger.error(message, { context: CONTEXT, data });
};

export const exerciseToasts = {
  createSuccess: (exerciseName: string) => {
    logInfo(`Exercício "${exerciseName}" criado com sucesso!`, { exerciseName });
  },
  updateSuccess: (exerciseName: string) => {
    logInfo(`Exercício "${exerciseName}" atualizado com sucesso!`, { exerciseName });
  },
  deleteSuccess: (exerciseName: string) => {
    logInfo(`Exercício "${exerciseName}" excluído com sucesso!`, { exerciseName });
  },
  duplicateSuccess: (exerciseName: string) => {
    logInfo(`Exercício "${exerciseName}" duplicado com sucesso!`, { exerciseName });
  },
  categoryCreated: (categoryName: string) => {
    logInfo(`Categoria "${categoryName}" criada com sucesso!`, { categoryName });
  },
  categoryUpdated: (categoryName: string) => {
    logInfo(`Categoria "${categoryName}" atualizada com sucesso!`, { categoryName });
  },
  categoryDeleted: (categoryName: string) => {
    logInfo(`Categoria "${categoryName}" excluída com sucesso!`, { categoryName });
  },
  protocolCreated: (protocolName: string) => {
    logInfo(`Protocolo "${protocolName}" criado com sucesso!`, { protocolName });
  },
  protocolUpdated: (protocolName: string) => {
    logInfo(`Protocolo "${protocolName}" atualizado com sucesso!`, { protocolName });
  },
  protocolDeleted: (protocolName: string) => {
    logInfo(`Protocolo "${protocolName}" excluído com sucesso!`, { protocolName });
  },
  assignmentCreated: (patientName: string, exerciseName: string) => {
    logInfo(`Exercício "${exerciseName}" atribuído a ${patientName}!`, { exerciseName, patientName });
  },
  assignmentCompleted: (exerciseName: string) => {
    logInfo(`Atribuição de "${exerciseName}" marcada como concluída!`, { exerciseName });
  },
  createError: (error: string) => {
    logError('Erro ao criar exercício.', { error });
  },
  updateError: (error: string) => {
    logError('Erro ao atualizar exercício.', { error });
  },
  deleteError: (error: string) => {
    logError('Erro ao excluir exercício.', { error });
  },
  loadError: (error: string) => {
    logError('Erro ao carregar exercícios.', { error });
  },
  validationError: (error: string) => {
    logWarn('Erro de validação.', { error });
  },
  noExercisesFound: () => {
    logWarn('Nenhum exercício encontrado com os filtros aplicados.');
  },
  loadingData: () => {
    logInfo('Carregando exercícios...');
  },
  exportSuccess: (count: number) => {
    logInfo(`${count} exercício(s) exportado(s) com sucesso!`, { count });
  },
  importSuccess: (count: number) => {
    logInfo(`${count} exercício(s) importado(s) com sucesso!`, { count });
  },
  exportError: (error: string) => {
    logError('Erro ao exportar exercícios.', { error });
  },
  importError: (error: string) => {
    logError('Erro ao importar exercícios.', { error });
  },
};
