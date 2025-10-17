import { supabasePatientService } from './supabase/patientServiceSupabase';
import { PatientStatus } from '../types';

// Marcador para identificar dados de demonstração
const DEMO_MARKER = '[DEMO]';

export interface DemoDataStats {
  patients: number;
  appointments: number;
  therapists: number;
}

const samplePatients = [
  {
    name: `${DEMO_MARKER} Ana Silva Santos`,
    email: 'ana.silva.demo@email.com',
    phone: '(11) 98765-4321',
    birthDate: '1985-03-15',
    status: PatientStatus.Active,
    cpf: '123.456.789-01',
    address: { street: 'Rua das Flores, 123', city: 'São Paulo', state: 'SP', zip: '01234-567' },
    emergencyContact: { name: 'João Silva', phone: '(11) 98765-1234' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Carlos Oliveira`,
    email: 'carlos.oliveira.demo@email.com',
    phone: '(21) 99876-5432',
    birthDate: '1990-07-22',
    status: PatientStatus.Active,
    cpf: '234.567.890-12',
    address: { street: 'Av. Principal, 456', city: 'Rio de Janeiro', state: 'RJ', zip: '20000-000' },
    emergencyContact: { name: 'Maria Oliveira', phone: '(21) 99876-1111' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Maria Fernandes`,
    email: 'maria.fernandes.demo@email.com',
    phone: '(11) 97654-3210',
    birthDate: '1978-11-30',
    status: PatientStatus.Active,
    cpf: '345.678.901-23',
    address: { street: 'Rua Central, 789', city: 'São Paulo', state: 'SP', zip: '04567-890' },
    emergencyContact: { name: 'Pedro Fernandes', phone: '(11) 97654-9999' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-out' as const,
  },
  {
    name: `${DEMO_MARKER} João Pedro Costa`,
    email: 'joao.costa.demo@email.com',
    phone: '(11) 96543-2109',
    birthDate: '1995-05-10',
    status: PatientStatus.Active,
    cpf: '456.789.012-34',
    address: { street: 'Alameda dos Anjos, 321', city: 'São Paulo', state: 'SP', zip: '01230-456' },
    emergencyContact: { name: 'Ana Costa', phone: '(11) 96543-8888' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Patricia Souza`,
    email: 'patricia.souza.demo@email.com',
    phone: '(11) 95432-1098',
    birthDate: '1982-09-18',
    status: PatientStatus.Inactive,
    cpf: '567.890.123-45',
    address: { street: 'Rua do Comércio, 654', city: 'São Paulo', state: 'SP', zip: '03456-789' },
    emergencyContact: { name: 'Roberto Souza', phone: '(11) 95432-7777' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Roberto Lima`,
    email: 'roberto.lima.demo@email.com',
    phone: '(11) 94321-0987',
    birthDate: '1970-12-25',
    status: PatientStatus.Discharged,
    cpf: '678.901.234-56',
    address: { street: 'Praça da República, 987', city: 'São Paulo', state: 'SP', zip: '02345-678' },
    emergencyContact: { name: 'Sandra Lima', phone: '(11) 94321-6666' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-out' as const,
  },
  {
    name: `${DEMO_MARKER} Fernanda Alves`,
    email: 'fernanda.alves.demo@email.com',
    phone: '(11) 93210-9876',
    birthDate: '1988-04-05',
    status: PatientStatus.Active,
    cpf: '789.012.345-67',
    address: { street: 'Rua da Paz, 147', city: 'São Paulo', state: 'SP', zip: '05678-901' },
    emergencyContact: { name: 'Lucas Alves', phone: '(11) 93210-5555' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Lucas Martins`,
    email: 'lucas.martins.demo@email.com',
    phone: '(11) 92109-8765',
    birthDate: '1992-08-14',
    status: PatientStatus.Active,
    cpf: '890.123.456-78',
    address: { street: 'Av. da Liberdade, 258', city: 'São Paulo', state: 'SP', zip: '04321-234' },
    emergencyContact: { name: 'Julia Martins', phone: '(11) 92109-4444' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Sandra Rodrigues`,
    email: 'sandra.rodrigues.demo@email.com',
    phone: '(11) 91098-7654',
    birthDate: '1987-02-20',
    status: PatientStatus.Active,
    cpf: '901.234.567-89',
    address: { street: 'Rua Augusta, 1500', city: 'São Paulo', state: 'SP', zip: '01310-100' },
    emergencyContact: { name: 'Paulo Rodrigues', phone: '(11) 91098-3333' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-in' as const,
  },
  {
    name: `${DEMO_MARKER} Ricardo Santos`,
    email: 'ricardo.santos.demo@email.com',
    phone: '(11) 90987-6543',
    birthDate: '1975-06-12',
    status: PatientStatus.Active,
    cpf: '012.345.678-90',
    address: { street: 'Av. Paulista, 1000', city: 'São Paulo', state: 'SP', zip: '01310-000' },
    emergencyContact: { name: 'Carla Santos', phone: '(11) 90987-2222' },
    avatarUrl: '',
    consentGiven: true,
    whatsappConsent: 'opt-out' as const,
  },
];

/**
 * Popula o banco de dados com dados de demonstração
 */
export async function populateDemoData(): Promise<DemoDataStats> {
  const stats: DemoDataStats = {
    patients: 0,
    appointments: 0,
    therapists: 0,
  };

  console.log('🌱 Iniciando população de dados de demonstração...');

  // 1. Popular pacientes
  for (const patientData of samplePatients) {
    try {
      // Verificar se já existe um paciente com esse email
      const existing = await supabasePatientService.searchPatients(patientData.email);
      if (existing.length === 0) {
        await supabasePatientService.createPatient(patientData as any);
        stats.patients++;
        console.log(`✅ Paciente criado: ${patientData.name}`);
      } else {
        console.log(`⚠️ Paciente já existe: ${patientData.name}`);
      }
    } catch (error: any) {
      console.error(`❌ Erro ao criar paciente ${patientData.name}:`, error.message);
    }
  }

  console.log(`✨ Dados de demonstração populados com sucesso!`);
  console.log(`📊 Estatísticas: ${stats.patients} pacientes criados`);

  return stats;
}

/**
 * Remove todos os dados de demonstração do banco
 */
export async function clearDemoData(): Promise<DemoDataStats> {
  const stats: DemoDataStats = {
    patients: 0,
    appointments: 0,
    therapists: 0,
  };

  console.log('🗑️ Iniciando limpeza de dados de demonstração...');

  try {
    // 1. Buscar todos os pacientes de demonstração
    const allPatients = await supabasePatientService.getAllPatients();
    const demoPatients = allPatients.filter(p => p.name.includes(DEMO_MARKER));

    // 2. Deletar cada paciente de demonstração
    for (const patient of demoPatients) {
      try {
        await supabasePatientService.deletePatient(patient.id);
        stats.patients++;
        console.log(`✅ Paciente removido: ${patient.name}`);
      } catch (error: any) {
        console.error(`❌ Erro ao remover paciente ${patient.name}:`, error.message);
      }
    }

    console.log(`✨ Dados de demonstração removidos com sucesso!`);
    console.log(`📊 Estatísticas: ${stats.patients} pacientes removidos`);
  } catch (error: any) {
    console.error('❌ Erro ao limpar dados de demonstração:', error.message);
    throw error;
  }

  return stats;
}

/**
 * Verifica se existem dados de demonstração no banco
 */
export async function hasDemoData(): Promise<boolean> {
  try {
    const allPatients = await supabasePatientService.getAllPatients();
    return allPatients.some(p => p.name.includes(DEMO_MARKER));
  } catch (error) {
    console.error('Erro ao verificar dados de demonstração:', error);
    return false;
  }
}

/**
 * Conta quantos dados de demonstração existem
 */
export async function countDemoData(): Promise<DemoDataStats> {
  const stats: DemoDataStats = {
    patients: 0,
    appointments: 0,
    therapists: 0,
  };

  try {
    const allPatients = await supabasePatientService.getAllPatients();
    stats.patients = allPatients.filter(p => p.name.includes(DEMO_MARKER)).length;
  } catch (error) {
    console.error('Erro ao contar dados de demonstração:', error);
  }

  return stats;
}
