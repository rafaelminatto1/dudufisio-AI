/**
 * Fixtures de usuários para testes E2E
 * Baseado nos mockUsers do sistema
 */

export const testUsers = {
  admin: {
    email: 'admin@dudufisio.com',
    password: 'demo123456',
    name: 'Roberto Silveira',
    role: 'Admin',
    expectedMenu: [
      'Dashboard',
      'Pacientes',
      'Agenda',
      'Exercícios',
      'Financeiro',
      'Relatórios',
      'WhatsApp',
      'Configurações',
    ],
  },
  therapist: {
    email: 'roberto@fisioflow.com',
    password: 'demo123456',
    name: 'Roberto Silveira',
    role: 'Fisioterapeuta',
    expectedMenu: [
      'Dashboard',
      'Pacientes',
      'Agenda',
      'Exercícios',
      'Biblioteca',
      'Acompanhamento',
    ],
  },
  patient: {
    email: 'paciente@teste.com',
    password: 'demo123456',
    name: 'João Silva',
    role: 'Paciente',
    expectedMenu: [
      'Meus Agendamentos',
      'Meus Exercícios',
      'Meu Histórico',
      'Perfil',
    ],
  },
  educadorFisico: {
    email: 'educador@fisioflow.com',
    password: 'demo123456',
    name: 'Carlos Educador',
    role: 'Educador Físico',
    expectedMenu: [
      'Dashboard',
      'Pacientes',
      'Agenda',
      'Exercícios',
    ],
  },
};

export const invalidCredentials = {
  invalidEmail: {
    email: 'inexistente@exemplo.com',
    password: 'senha123',
  },
  invalidPassword: {
    email: 'admin@dudufisio.com',
    password: 'senhaerrada',
  },
  emptyEmail: {
    email: '',
    password: 'demo123456',
  },
  emptyPassword: {
    email: 'admin@dudufisio.com',
    password: '',
  },
  malformedEmail: {
    email: 'emailinvalido',
    password: 'demo123456',
  },
};

export const testPatients = {
  new: {
    name: 'Teste E2E Paciente',
    cpf: '12345678901',
    email: 'teste.e2e@example.com',
    phone: '11999999999',
    birthDate: '1990-01-15',
    address: 'Rua Teste, 123',
    city: 'São Paulo',
    state: 'SP',
    zipCode: '01234-567',
  },
  existing: {
    name: 'Maria Santos',
    cpf: '98765432100',
  },
};









