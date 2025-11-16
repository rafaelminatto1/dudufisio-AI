import { logger } from '../lib/logger';

const CONTEXT = 'patientToasts';

/**
 * Utility simples para notificações de paciente.
 * Substitui implementações antigas baseadas em JSX inline.
 */
export const patientToasts = {
  created: (name: string) => {
    logger.info(`Paciente ${name} criado com sucesso.`, {
      context: CONTEXT,
      data: { name },
    });
  },
  updated: (name: string) => {
    logger.info(`Paciente ${name} atualizado com sucesso.`, {
      context: CONTEXT,
      data: { name },
    });
  },
  deleted: (name: string) => {
    logger.info(`Paciente ${name} removido com sucesso.`, {
      context: CONTEXT,
      data: { name },
    });
  },
  duplicateCPF: () => {
    logger.warn('CPF já cadastrado para outro paciente.', { context: CONTEXT });
  },
  duplicateEmail: () => {
    logger.warn('E-mail já cadastrado para outro paciente.', { context: CONTEXT });
  },
  createError: (message: string) => {
    logger.error('Erro ao criar paciente.', {
      context: CONTEXT,
      data: { message },
    });
  },
  updateError: (message: string) => {
    logger.error('Erro ao atualizar paciente.', {
      context: CONTEXT,
      data: { message },
    });
  },
  deleteError: (message: string) => {
    logger.error('Erro ao deletar paciente.', {
      context: CONTEXT,
      data: { message },
    });
  },
  loadError: () => {
    logger.error('Erro ao carregar pacientes.', { context: CONTEXT });
  },
};
