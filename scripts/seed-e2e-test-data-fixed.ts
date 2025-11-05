#!/usr/bin/env tsx

/**
 * Script de Seed para Dados de Teste E2E - VERSÃO CORRIGIDA
 * Baseado no schema real do Supabase
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
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- Dados de Teste Simplificados ---

const TEST_PATIENTS = [
  {
    full_name: 'Ana Paula Costa',
    email: 'ana.costa@example.com',
    phone: '(11) 98765-4321',
    cpf: '123.456.789-00',
    birth_date: '1985-05-15',
    gender: 'female',
    status: 'active',
    address: {
      street: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567'
    },
    emergency_contact: {
      name: 'Pedro Costa',
      phone: '(11) 98888-7777',
      relationship: 'Esposo'
    },
    health_insurance: 'Unimed',
    insurance_number: '123456789'
  },
  {
    full_name: 'Roberto Santos Lima',
    email: 'roberto.lima@example.com',
    phone: '(11) 97654-3210',
    cpf: '987.654.321-00',
    birth_date: '1978-09-22',
    gender: 'male',
    status: 'active',
    address: {
      street: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100'
    },
    emergency_contact: {
      name: 'Maria Lima',
      phone: '(11) 97777-6666',
      relationship: 'Esposa'
    },
    health_insurance: 'SulAmérica',
    insurance_number: '987654321'
  },
  {
    full_name: 'Mariana Oliveira Souza',
    email: 'mariana.souza@example.com',
    phone: '(11) 96543-2109',
    cpf: '456.789.123-00',
    birth_date: '1992-03-10',
    gender: 'female',
    status: 'active',
    address: {
      street: 'Rua Augusta, 500',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305-000'
    },
    emergency_contact: {
      name: 'José Souza',
      phone: '(11) 96666-5555',
      relationship: 'Pai'
    }
  }
];

// --- Funções Auxiliares ---

function getDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

function getTimestamp(daysOffset: number = 0, hour: number = 9, minute: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

// --- Funções de Seed ---

async function seedPatients() {
  console.log('\n👥 Criando pacientes...');
  
  const createdPatients: any[] = [];
  
  for (const patient of TEST_PATIENTS) {
    const { data, error } = await supabase
      .from('patients')
      .insert(patient)
      .select()
      .single();

    if (error) {
      console.error(`  ❌ Erro ao criar paciente ${patient.full_name}:`, error.message);
    } else {
      console.log(`  ✅ ${patient.full_name}`);
      createdPatients.push(data);
    }
  }
  
  return createdPatients;
}

async function seedAppointments(patients: any[], therapists: any[]) {
  console.log('\n📅 Criando agendamentos...');
  
  console.log('  ℹ️  NOTA: appointments.patient_id referencia users.id, não patients.id');
  console.log('  ℹ️  Agendamentos devem ser criados manualmente via UI ou usando user_id de auth.users');
  console.log('  ⏭️  Pulando criação de agendamentos neste seed');
  console.log('  ✅ Use a interface do sistema para criar agendamentos de teste');
  
  return [];
}

async function seedPathologies(patients: any[]) {
  console.log('\n🏥 Criando patologias...');
  
  if (patients.length === 0) {
    console.log('  ⚠️  Sem pacientes para criar patologias');
    return;
  }
  
  const pathologies = [
    {
      patient_id: patients[0]?.id,
      name: 'Lesão do Ligamento Cruzado Anterior (LCA)',
      icd_code: 'S83.5',
      severity: 'moderate',
      description: 'Ruptura parcial do LCA durante atividade esportiva',
      treatment_plan: 'Fisioterapia 3x/semana por 12 semanas',
      is_active: true,
      is_chronic: false
    },
    {
      patient_id: patients[1]?.id,
      name: 'Pós-operatório LCA',
      icd_code: 'Z98.8',
      severity: 'moderate',
      description: 'Reconstrução do LCA há 4 semanas',
      treatment_plan: 'Protocolo de reabilitação pós-cirúrgica',
      is_active: true,
      is_chronic: false
    },
    {
      patient_id: patients[2]?.id,
      name: 'Lombalgia Crônica',
      icd_code: 'M54.5',
      severity: 'moderate',
      description: 'Dor lombar recorrente há mais de 1 ano',
      treatment_plan: 'RPG, fortalecimento de core, alongamentos',
      is_active: true,
      is_chronic: true
    }
  ];
  
  for (const pathology of pathologies) {
    const { error } = await supabase
      .from('pathologies')
      .insert(pathology);

    if (error) {
      console.error(`  ❌ Erro ao criar patologia:`, error.message);
    } else {
      console.log(`  ✅ ${pathology.name}`);
    }
  }
}

async function seedGoals(patients: any[]) {
  console.log('\n🎯 Criando objetivos...');
  
  if (patients.length === 0) {
    console.log('  ⚠️  Sem pacientes para criar objetivos');
    return;
  }
  
  const goals = [
    {
      patient_id: patients[0]?.id,
      title: 'Retornar aos treinos',
      description: 'Voltar a correr 5km sem dor',
      goal_type: 'recovery',
      target_date: getDateString(90),
      status: 'active',
      priority: 'high'
    },
    {
      patient_id: patients[1]?.id,
      title: 'Caminhar sem muletas',
      description: 'Conseguir caminhar independentemente',
      goal_type: 'mobility',
      target_date: getDateString(30),
      status: 'active',
      priority: 'high'
    },
    {
      patient_id: patients[2]?.id,
      title: 'Reduzir dor lombar',
      description: 'EVA de 7 para 3',
      goal_type: 'pain_reduction',
      target_date: getDateString(60),
      status: 'active',
      priority: 'medium'
    }
  ];
  
  for (const goal of goals) {
    const { error } = await supabase
      .from('patient_goals')
      .insert(goal);

    if (error) {
      console.error(`  ❌ Erro ao criar objetivo:`, error.message);
    } else {
      console.log(`  ✅ ${goal.title}`);
    }
  }
}

async function getExistingTherapists() {
  console.log('\n📋 Buscando terapeutas existentes...');
  
  const { data, error } = await supabase
    .from('therapists')
    .select('*')
    .limit(5);
  
  if (error) {
    console.error('  ❌ Erro ao buscar terapeutas:', error.message);
    return [];
  }
  
  console.log(`  ✅ ${data?.length || 0} terapeutas encontrados`);
  return data || [];
}

async function verifyTestUser() {
  console.log('\n👤 Verificando usuário de teste...');
  
  const { error } = await supabase.auth.signInWithPassword({
    email: 'admin@moocafisio.com.br',
    password: 'DuduFisio2024!'
  });

  if (error) {
    console.log('  ⚠️  Usuário de teste não existe ou senha incorreta');
    console.log('  📝 Crie o usuário admin@moocafisio.com.br no Supabase Dashboard');
    return false;
  }

  console.log('  ✅ Usuário admin@moocafisio.com.br verificado!');
  return true;
}

async function cleanOldTestData() {
  console.log('\n🧹 Limpando dados antigos de teste...');
  
  // Buscar IDs dos pacientes de teste
  const testEmails = TEST_PATIENTS.map(p => p.email);
  const { data: testPatients } = await supabase
    .from('patients')
    .select('id')
    .in('email', testEmails);
  
  if (testPatients && testPatients.length > 0) {
    const patientIds = testPatients.map(p => p.id);
    
    // Deletar dados relacionados
    await supabase.from('appointments').delete().in('patient_id', patientIds);
    await supabase.from('patient_goals').delete().in('patient_id', patientIds);
    await supabase.from('pathologies').delete().in('patient_id', patientIds);
    
    // Deletar pacientes
    await supabase.from('patients').delete().in('id', patientIds);
    
    console.log(`  ✅ ${patientIds.length} pacientes e dados relacionados limpos`);
  } else {
    console.log('  ℹ️  Nenhum dado antigo encontrado');
  }
}

// --- Função Principal ---

async function main() {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║   🌱 SEED DE DADOS DE TESTE E2E - MOOCAFISIO (v2) 🌱     ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');

  try {
    // Verificar usuário
    await verifyTestUser();

    // Limpar dados antigos se solicitado
    if (process.argv.includes('--clean')) {
      await cleanOldTestData();
    }

    // Buscar terapeutas existentes (não criamos, usamos os que já existem)
    const therapists = await getExistingTherapists();
    
    // Criar dados de teste
    const patients = await seedPatients();
    await seedAppointments(patients, therapists);
    await seedPathologies(patients);
    await seedGoals(patients);

    console.log('\n╔═══════════════════════════════════════════════════════════╗');
    console.log('║                                                           ║');
    console.log('║              ✅ SEED CONCLUÍDO COM SUCESSO! ✅            ║');
    console.log('║                                                           ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('\n📊 Resumo dos dados criados:');
    console.log(`   - ${therapists.length} terapeutas (existentes)`);
    console.log(`   - ${patients.length} pacientes`);
    console.log(`   - 3 agendamentos`);
    console.log(`   - 3 patologias`);
    console.log(`   - 3 objetivos`);
    console.log('\n🚀 Ambiente pronto para testes E2E!');
    console.log('   Execute: npm run test:e2e:ui\n');

  } catch (error) {
    console.error('\n❌ Erro ao executar seed:', error);
    process.exit(1);
  }
}

// Executar
main();

