import { logger } from '../lib/logger';

const CONTEXT = 'patientToasts';

export const patientToasts = {
    created: (name) => {
        logger.info(`Paciente ${name} criado com sucesso.`, {
            context: CONTEXT,
            data: { name },
        });
    },
    updated: (name) => {
        logger.info(`Paciente ${name} atualizado com sucesso.`, {
            context: CONTEXT,
            data: { name },
        });
    },
    deleted: (name) => {
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
    createError: (message) => {
        logger.error('Erro ao criar paciente.', {
            context: CONTEXT,
            data: { message },
        });
    },
    updateError: (message) => {
        logger.error('Erro ao atualizar paciente.', {
            context: CONTEXT,
            data: { message },
        });
    },
    deleteError: (message) => {
        logger.error('Erro ao deletar paciente.', {
            context: CONTEXT,
            data: { message },
        });
    },
    loadError: () => {
        logger.error('Erro ao carregar pacientes.', { context: CONTEXT });
    },
};
