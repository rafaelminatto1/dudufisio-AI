import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env.local
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

// Set environment variables for the script
process.env.VITE_SUPABASE_URL = process.env.VITE_SUPABASE_URL || '';
process.env.VITE_SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || '';

import { supabasePatientService } from '../services/supabase/patientServiceSupabase';
import { PatientStatus } from '../types';

const samplePatients = [
  {
    name: 'Ana Silva Santos',
    email: 'ana.silva@email.com',
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
    name: 'Carlos Oliveira',
    email: 'carlos.oliveira@email.com',
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
    name: 'Maria Fernandes',
    email: 'maria.fernandes@email.com',
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
    name: 'João Pedro Costa',
    email: 'joao.costa@email.com',
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
    name: 'Patricia Souza',
    email: 'patricia.souza@email.com',
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
    name: 'Roberto Lima',
    email: 'roberto.lima@email.com',
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
    name: 'Fernanda Alves',
    email: 'fernanda.alves@email.com',
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
    name: 'Lucas Martins',
    email: 'lucas.martins@email.com',
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
];

async function seedPatients() {
  console.log('🌱 Iniciando seed de pacientes de exemplo...\n');

  for (const patientData of samplePatients) {
    try {
      const created = await supabasePatientService.createPatient(patientData as any);
      console.log(`✅ Paciente criado: ${created.name} (ID: ${created.id})`);
    } catch (error: any) {
      console.error(`❌ Erro ao criar paciente ${patientData.name}:`, error.message);
    }
  }

  console.log('\n✨ Seed finalizado!');
}

// Executar o seed
seedPatients().catch(console.error);
