/**
 * Utility simples para notificações de paciente
 * Substitui implementação anterior que tinha JSX inline
 */

export const patientToasts = {
  created: (name: string) => {
    console.log(`✅ Paciente ${name} criado com sucesso`);
  },
  updated: (name: string) => {
    console.log(`✅ Paciente ${name} atualizado com sucesso`);
  },
  deleted: (name: string) => {
    console.log(`✅ Paciente ${name} deletado com sucesso`);
  },
  duplicateCPF: () => {
    console.warn('⚠️ CPF já cadastrado');
  },
  duplicateEmail: () => {
    console.warn('⚠️ Email já cadastrado');
  },
  createError: (message: string) => {
    console.error('❌ Erro ao criar paciente:', message);
  },
  updateError: (message: string) => {
    console.error('❌ Erro ao atualizar paciente:', message);
  },
  deleteError: (message: string) => {
    console.error('❌ Erro ao deletar paciente:', message);
  },
  loadError: () => {
    console.error('❌ Erro ao carregar pacientes');
  },
};

