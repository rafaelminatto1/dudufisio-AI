/**
 * Utility simples para notificações de paciente
 * Substitui implementação anterior que tinha JSX inline
 */
export const patientToasts = {
    created: (name) => {
        console.log(`✅ Paciente ${name} criado com sucesso`);
    },
    updated: (name) => {
        console.log(`✅ Paciente ${name} atualizado com sucesso`);
    },
    deleted: (name) => {
        console.log(`✅ Paciente ${name} deletado com sucesso`);
    },
    duplicateCPF: () => {
        console.warn('⚠️ CPF já cadastrado');
    },
    duplicateEmail: () => {
        console.warn('⚠️ Email já cadastrado');
    },
    createError: (message) => {
        console.error('❌ Erro ao criar paciente:', message);
    },
    updateError: (message) => {
        console.error('❌ Erro ao atualizar paciente:', message);
    },
    deleteError: (message) => {
        console.error('❌ Erro ao deletar paciente:', message);
    },
    loadError: () => {
        console.error('❌ Erro ao carregar pacientes');
    },
};
