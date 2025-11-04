#!/usr/bin/env tsx

/**
 * Script de Seed para Dados de Teste E2E
 * Cria dados consistentes no Supabase para testes automatizados
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Carregar variáveis de ambiente
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  console.error('Verifique seu arquivo .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Dados de Teste ---

const TEST_USER = {
  email: 'admin@dudufisio.com',
  password: 'DuduFisio2024!',
  fullName: 'Administrador Teste',
  role: 'admin'
};

const TEST_THERAPISTS = [
  {
    id: 'therapist-1',
    name: 'Dr. Carlos Silva',
    color: 'blue',
    crefito: '12345-F'
  },
  {
    id: 'therapist-2',
    name: 'Dra. Maria Santos',
    color: 'purple',
    crefito: '67890-F'
  },
  {
    id: 'therapist-3',
    name: 'Dr. João Oliveira',
    color: 'teal',
    crefito: '11111-F'
  }
];

const TEST_PATIENTS = [
  {
    id: 'patient-1',
    full_name: 'Ana Paula Costa',
    email: 'ana.costa@example.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    birth_date: '1985-05-15',
    gender: 'Feminino',
    status: 'Active',
    address: 'Rua das Flores, 123',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234-567',
    emergency_contact: 'Pedro Costa',
    emergency_phone: '(11) 98888-7777',
    health_insurance: 'Unimed',
    health_insurance_number: '123456789',
    observations: 'Paciente com histórico de lesão no joelho esquerdo'
  },
  {
    id: 'patient-2',
    full_name: 'Roberto Santos Lima',
    email: 'roberto.lima@example.com',
    phone: '(11) 97654-3210',
    cpf: '987.654.321-00',
    birth_date: '1978-09-22',
    gender: 'Masculino',
    status: 'Active',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01310-100',
    emergency_contact: 'Maria Lima',
    emergency_phone: '(11) 97777-6666',
    health_insurance: 'SulAmérica',
    health_insurance_number: '987654321',
    observations: 'Pós-cirúrgico de LCA, iniciou fisioterapia há 3 semanas'
  },
  {
    id: 'patient-3',
    full_name: 'Mariana Oliveira Souza',
    email: 'mariana.souza@example.com',
    phone: '(11) 96543-2109',
    cpf: '456.789.123-00',
    birth_date: '1992-03-10',
    gender: 'Feminino',
    status: 'Active',
    address: 'Rua Augusta, 500',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01305-000',
    emergency_contact: 'José Souza',
    emergency_phone: '(11) 96666-5555',
    observations: 'Atleta amadora, dor lombar crônica'
  }
];

const TEST_APPOINTMENTS = [
  {
    id: 'appt-1',
    patient_id: 'patient-1',
    therapist_id: 'therapist-1',
    start_time: `${getDateString(0)}T09:00:00`, // Hoje
    end_time: `${getDateString(0)}T10:00:00`,
    status: 'scheduled',
    appointment_type: 'Consulta',
    notes: 'Primeira sessão pós-cirúrgica'
  },
  {
    id: 'appt-2',
    patient_id: 'patient-2',
    therapist_id: 'therapist-2',
    start_time: `${getDateString(0)}T10:00:00`, // Hoje
    end_time: `${getDateString(0)}T11:00:00`,
    status: 'scheduled',
    appointment_type: 'Fisioterapia',
    notes: 'Reabilitação de joelho'
  },
  {
    id: 'appt-3',
    patient_id: 'patient-3',
    therapist_id: 'therapist-1',
    start_time: `${getDateString(1)}T14:00:00`, // Amanhã
    end_time: `${getDateString(1)}T15:00:00`,
    status: 'scheduled',
    appointment_type: 'RPG',
    notes: 'Tratamento de lombalgia'
  },
  {
    id: 'appt-4',
    patient_id: 'patient-1',
    therapist_id: 'therapist-3',
    start_time: `${getDateString(-1)}T15:00:00`, // Ontem
    end_time: `${getDateString(-1)}T16:00:00`,
    status: 'completed',
    appointment_type: 'Fisioterapia',
    notes: 'Sessão de fortalecimento'
  }
];

const TEST_PATHOLOGIES = [
  {
    id: 'path-1',
    patient_id: 'patient-1',
    name: 'Lesão do Ligamento Cruzado Anterior (LCA)',
    icd_code: 'S83.5',
    diagnosis_date: '2024-08-15',
    status: 'active',
    severity: 'moderate',
    affected_region: 'Joelho esquerdo',
    description: 'Ruptura parcial do LCA durante atividade esportiva',
    treatment_plan: 'Fisioterapia 3x/semana por 12 semanas'
  },
  {
    id: 'path-2',
    patient_id: 'patient-2',
    name: 'Pós-operatório LCA',
    icd_code: 'Z98.8',
    diagnosis_date: '2024-10-01',
    status: 'active',
    severity: 'moderate',
    affected_region: 'Joelho direito',
    description: 'Reconstrução do LCA há 4 semanas',
    treatment_plan: 'Protocolo de reabilitação pós-cirúrgica'
  },
  {
    id: 'path-3',
    patient_id: 'patient-3',
    name: 'Lombalgia Crônica',
    icd_code: 'M54.5',
    diagnosis_date: '2023-05-10',
    status: 'chronic',
    severity: 'moderate',
    affected_region: 'Coluna lombar',
    description: 'Dor lombar recorrente há mais de 1 ano',
    treatment_plan: 'RPG, fortalecimento de core, alongamentos'
  }
];

const TEST_GOALS = [
  {
    id: 'goal-1',
    patient_id: 'patient-1',
    title: 'Retornar aos treinos',
    description: 'Voltar a correr 5km sem dor',
    target_date: getDateString(90),
    current_progress: 40,
    status: 'in_progress'
  },
  {
    id: 'goal-2',
    patient_id: 'patient-2',
    title: 'Caminhar sem muletas',
    description: 'Conseguir caminhar independentemente',
    target_date: getDateString(30),
    current_progress: 65,
    status: 'in_progress'
  },
  {
    id: 'goal-3',
    patient_id: 'patient-3',
    title: 'Reduzir dor lombar',
    description: 'EVA de 7 para 3',
    target_date: getDateString(60),
    current_progress: 50,
    status: 'in_progress'
  }
];

// --- Funções Auxiliares ---

function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function getTimestamp(): string {
  return new Date().toISOString();
}

// --- Funções de Seed ---

async function seedTherapists() {
  console.log('\n📋 Criando terapeutas...');
  
  for (const therapist of TEST_THERAPISTS) {
    const { error } = await supabase
      .from('therapists')
      .upsert({
        ...therapist,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Erro ao criar terapeuta ${therapist.name}:`, error.message);
    } else {
      console.log(`  ✅ ${therapist.name}`);
    }
  }
}

async function seedPatients() {
  console.log('\n👥 Criando pacientes...');
  
  for (const patient of TEST_PATIENTS) {
    const { error } = await supabase
      .from('patients')
      .upsert({
        ...patient,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Erro ao criar paciente ${patient.fullName}:`, error.message);
    } else {
      console.log(`  ✅ ${patient.fullName}`);
    }
  }
}

async function seedAppointments() {
  console.log('\n📅 Criando agendamentos...');
  
  for (const appointment of TEST_APPOINTMENTS) {
    const { error } = await supabase
      .from('appointments')
      .upsert({
        ...appointment,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Erro ao criar agendamento:`, error.message);
    } else {
      console.log(`  ✅ Agendamento para ${appointment.date} às ${appointment.time}`);
    }
  }
}

async function seedPathologies() {
  console.log('\n🏥 Criando patologias...');
  
  for (const pathology of TEST_PATHOLOGIES) {
    const { error } = await supabase
      .from('pathologies')
      .upsert({
        ...pathology,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Erro ao criar patologia:`, error.message);
    } else {
      console.log(`  ✅ ${pathology.name}`);
    }
  }
}

async function seedGoals() {
  console.log('\n🎯 Criando objetivos...');
  
  for (const goal of TEST_GOALS) {
    const { error } = await supabase
      .from('patient_goals')
      .upsert({
        ...goal,
        created_at: getTimestamp(),
        updated_at: getTimestamp()
      }, { onConflict: 'id' });

    if (error) {
      console.error(`  ❌ Erro ao criar objetivo:`, error.message);
    } else {
      console.log(`  ✅ ${goal.title}`);
    }
  }
}

async function verifyTestUser() {
  console.log('\n👤 Verificando usuário de teste...');
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email: TEST_USER.email,
    password: TEST_USER.password
  });

  if (error) {
    console.log('  ⚠️  Usuário de teste não existe ou senha incorreta');
    console.log('  📝 Instruções para criar usuário:');
    console.log('     1. Acesse o Supabase Dashboard');
    console.log('     2. Vá em Authentication > Users');
    console.log('     3. Clique em "Add User"');
    console.log('     4. Preencha:');
    console.log(`        Email: ${TEST_USER.email}`);
    console.log(`        Password: ${TEST_USER.password}`);
    console.log('     5. Marque "Auto Confirm User"');
    console.log('     6. Clique em "Create User"');
    return false;
  }

  console.log(`  ✅ Usuário ${TEST_USER.email} verificado com sucesso!`);
  return true;
}

async function cleanOldTestData() {
  console.log('\n🧹 Limpando dados antigos de teste...');
  
  // Limpar agendamentos de teste
  await supabase.from('appointments').delete().in('id', TEST_APPOINTMENTS.map(a => a.id));
  console.log('  ✅ Agendamentos limpos');
  
  // Limpar objetivos de teste
  await supabase.from('patient_goals').delete().in('id', TEST_GOALS.map(g => g.id));
  console.log('  ✅ Objetivos limpos');
  
  // Limpar patologias de teste
  await supabase.from('pathologies').delete().in('id', TEST_PATHOLOGIES.map(p => p.id));
  console.log('  ✅ Patologias limpas');
  
  // Limpar pacientes de teste
  await supabase.from('patients').delete().in('id', TEST_PATIENTS.map(p => p.id));
  console.log('  ✅ Pacientes limpos');
  
  // Limpar terapeutas de teste
  await supabase.from('therapists').delete().in('id', TEST_THERAPISTS.map(t => t.id));
  console.log('  ✅ Terapeutas limpos');
}

// --- Função Principal ---

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║     🌱 SEED DE DADOS DE TESTE E2E - MOOCAFISIO 🌱        ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    // Verificar usuário de teste
    const userExists = await verifyTestUser();
    if (!userExists) {
      console.log('\n⚠️  Crie o usuário de teste antes de continuar');
      console.log('   O seed de dados será executado, mas os testes não funcionarão sem o usuário.\n');
    }

    // Opcionalmente limpar dados antigos
    const shouldClean = process.argv.includes('--clean');
    if (shouldClean) {
      await cleanOldTestData();
    }

    // Criar dados de teste
    await seedTherapists();
    await seedPatients();
    await seedAppointments();
    await seedPathologies();
    await seedGoals();

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║              ✅ SEED CONCLUÍDO COM SUCESSO! ✅            ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`   - ${TEST_THERAPISTS.length} terapeutas`);
    console.log(`   - ${TEST_PATIENTS.length} pacientes`);
    console.log(`   - ${TEST_APPOINTMENTS.length} agendamentos`);
    console.log(`   - ${TEST_PATHOLOGIES.length} patologias`);
    console.log(`   - ${TEST_GOALS.length} objetivos`);
    console.log('\n🚀 Ambiente pronto para testes E2E!');
    console.log('   Execute: npm run test:e2e:ui\n');

  } catch (error) {
    console.error('\n❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

// Executar
main();

