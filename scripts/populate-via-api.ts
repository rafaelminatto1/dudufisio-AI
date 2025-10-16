/**
 * Script para popular o banco de dados usando a API do Supabase
 *
 * Este script:
 * 1. Cria pacientes via API
 * 2. Cria sessões de body map
 * 3. Cria regiões de dor
 * 4. Gera relatório final
 *
 * Uso: npx tsx scripts/populate-via-api.ts
 */

import { createClient } from '@supabase/supabase-js';
import { resolve } from 'path';
import { readFileSync, existsSync } from 'fs';

// Função para fazer parse manual do .env
function parseEnvFile(filePath: string): Record<string, string> {
  const content = readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};

  content.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;

    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      env[key] = value;
    }
  });

  return env;
}

// Carregar variáveis de ambiente
const envPath = resolve(process.cwd(), '.env.local');
if (!existsSync(envPath)) {
  console.error('❌ Arquivo .env.local não encontrado!');
  process.exit(1);
}

const envVars = parseEnvFile(envPath);
const supabaseUrl = envVars.VITE_SUPABASE_URL;
const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Dados dos pacientes
const patientsData = [
  { cpf: '123.456.789-01', full_name: 'Maria Silva Santos', email: 'maria.silva@email.com', phone: '+5511987654321', birth_date: '1985-03-15' },
  { cpf: '234.567.890-12', full_name: 'João Santos Oliveira', email: 'joao.santos@email.com', phone: '+5511976543210', birth_date: '1978-07-22' },
  { cpf: '345.678.901-23', full_name: 'Ana Oliveira Costa', email: 'ana.oliveira@email.com', phone: '+5511965432109', birth_date: '1992-11-08' },
  { cpf: '456.789.012-34', full_name: 'Carlos Pereira Lima', email: 'carlos.pereira@email.com', phone: '+5511954321098', birth_date: '1965-04-30' },
  { cpf: '567.890.123-45', full_name: 'Júlia Costa Rodrigues', email: 'julia.costa@email.com', phone: '+5511943210987', birth_date: '1988-09-14' },
  { cpf: '678.901.234-56', full_name: 'Roberto Almeida Souza', email: 'roberto.almeida@email.com', phone: '+5511932109876', birth_date: '1972-12-25' },
  { cpf: '789.012.345-67', full_name: 'Patrícia Ferreira Dias', email: 'patricia.ferreira@email.com', phone: '+5511921098765', birth_date: '1995-06-18' },
  { cpf: '890.123.456-78', full_name: 'Fernando Rodrigues Silva', email: 'fernando.rodrigues@email.com', phone: '+5511910987654', birth_date: '1980-02-07' },
  { cpf: '901.234.567-89', full_name: 'Camila Martins Alves', email: 'camila.martins@email.com', phone: '+5511909876543', birth_date: '1990-08-29' },
  { cpf: '012.345.678-90', full_name: 'Ricardo Lima Barbosa', email: 'ricardo.lima@email.com', phone: '+5511898765432', birth_date: '1968-05-11' }
];

async function createPatients() {
  console.log('\n👥 Criando pacientes...');

  const createdPatients: any[] = [];

  for (const patient of patientsData) {
    // Verificar se já existe
    const { data: existing } = await supabase
      .from('patients')
      .select('*')
      .eq('email', patient.email)
      .single();

    if (existing) {
      console.log(`   ⚠️  Paciente ${patient.full_name} já existe`);
      createdPatients.push(existing);
      continue;
    }

    // Criar novo paciente
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();

    if (error) {
      console.error(`   ❌ Erro ao criar ${patient.full_name}: ${error.message}`);
      continue;
    }

    console.log(`   ✅ ${patient.full_name} criado`);
    createdPatients.push(data);
  }

  console.log(`\n   📊 Total de pacientes: ${createdPatients.length}`);
  return createdPatients;
}

async function createBodyMapSessions(patients: any[]) {
  console.log('\n🗺️  Criando sessões de body map...');

  const sessions: any[] = [];

  // Criar 3 sessões para cada um dos primeiros 5 pacientes
  for (let i = 0; i < Math.min(5, patients.length); i++) {
    const patient = patients[i];

    // Sessão 1: Dor inicial (14 dias atrás)
    const session1Data = {
      patient_id: patient.id,
      session_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      main_complaint_region: 'lombar',
      main_complaint_description: 'Dor lombar intensa após atividade física',
      overall_pain_level: 7,
      pain_free: false,
      notes: 'Paciente relata dor ao realizar movimentos de flexão. Iniciado tratamento.'
    };

    const { data: session1, error: error1 } = await supabase
      .from('body_map_sessions')
      .insert([session1Data])
      .select()
      .single();

    if (error1) {
      console.error(`   ❌ Erro ao criar sessão 1 para ${patient.full_name}: ${error1.message}`);
    } else {
      console.log(`   ✅ Sessão 1 criada para ${patient.full_name} (dor: 7/10)`);
      sessions.push(session1);
    }

    // Sessão 2: Evolução (7 dias atrás)
    const session2Data = {
      patient_id: patient.id,
      session_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      main_complaint_region: 'lombar',
      main_complaint_description: 'Melhora significativa da dor',
      overall_pain_level: 4,
      pain_free: false,
      notes: 'Paciente apresenta boa evolução. Continuidade do protocolo.'
    };

    const { data: session2, error: error2 } = await supabase
      .from('body_map_sessions')
      .insert([session2Data])
      .select()
      .single();

    if (error2) {
      console.error(`   ❌ Erro ao criar sessão 2 para ${patient.full_name}: ${error2.message}`);
    } else {
      console.log(`   ✅ Sessão 2 criada para ${patient.full_name} (dor: 4/10)`);
      sessions.push(session2);
    }

    // Sessão 3: Evolução recente (1 dia atrás)
    const session3Data = {
      patient_id: patient.id,
      session_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      main_complaint_region: 'lombar',
      main_complaint_description: 'Dor praticamente controlada',
      overall_pain_level: 2,
      pain_free: false,
      notes: 'Excelente progresso. Paciente praticamente sem queixas.'
    };

    const { data: session3, error: error3 } = await supabase
      .from('body_map_sessions')
      .insert([session3Data])
      .select()
      .single();

    if (error3) {
      console.error(`   ❌ Erro ao criar sessão 3 para ${patient.full_name}: ${error3.message}`);
    } else {
      console.log(`   ✅ Sessão 3 criada para ${patient.full_name} (dor: 2/10)`);
      sessions.push(session3);
    }
  }

  console.log(`\n   📊 Total de sessões criadas: ${sessions.length}`);
  return sessions;
}

async function createPainRegions(sessions: any[]) {
  console.log('\n📍 Criando regiões de dor...');

  let regionsCreated = 0;

  for (const session of sessions.slice(0, 10)) {
    const painLevel = session.overall_pain_level;

    // Região lombar (principal)
    const mainRegionData = {
      body_map_session_id: session.id,
      patient_id: session.patient_id,
      body_region: 'lombar',
      body_side: 'back',
      coordinates_x: 50.0,
      coordinates_y: 40.0,
      pain_level: painLevel,
      pain_types: ['aguda'],
      is_main_complaint: true
    };

    const { error: mainError } = await supabase
      .from('body_map_pain_regions')
      .insert([mainRegionData]);

    if (mainError) {
      console.error(`   ❌ Erro ao criar região principal: ${mainError.message}`);
    } else {
      regionsCreated++;
    }

    // Se dor > 5, adicionar região secundária
    if (painLevel > 5) {
      const secondaryRegionData = {
        body_map_session_id: session.id,
        patient_id: session.patient_id,
        body_region: 'gluteo_direito',
        body_side: 'back',
        coordinates_x: 45.0,
        coordinates_y: 50.0,
        pain_level: Math.max(1, painLevel - 3),
        pain_types: ['latejante'],
        is_main_complaint: false
      };

      const { error: secondaryError } = await supabase
        .from('body_map_pain_regions')
        .insert([secondaryRegionData]);

      if (!secondaryError) {
        regionsCreated++;
      }
    }
  }

  console.log(`   ✅ Total de regiões de dor criadas: ${regionsCreated}`);
  return regionsCreated;
}

async function generateReport() {
  console.log('\n📊 Gerando relatório final...');

  // Contar pacientes
  const { count: patientCount } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  // Contar sessões
  const { count: sessionCount } = await supabase
    .from('body_map_sessions')
    .select('*', { count: 'exact', head: true });

  // Contar regiões
  const { count: regionCount } = await supabase
    .from('body_map_pain_regions')
    .select('*', { count: 'exact', head: true });

  // Buscar último paciente com sessões
  const { data: latestPatient } = await supabase
    .from('patients')
    .select(`
      id,
      full_name,
      email,
      body_map_sessions (count)
    `)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('          ✅ SISTEMA POPULADO COM SUCESSO!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log('📊 ESTATÍSTICAS:');
  console.log(`   • Total de Pacientes: ${patientCount || 0}`);
  console.log(`   • Total de Sessões de Body Map: ${sessionCount || 0}`);
  console.log(`   • Total de Regiões de Dor: ${regionCount || 0}`);
  console.log('');

  if (latestPatient) {
    console.log('🎯 TESTAR AGORA:');
    console.log(`   1. Acesse: http://localhost:5175/patients/${latestPatient.id}`);
    console.log('   2. Login: admin@dudufisio.com / demo123456');
    console.log('   3. Clique na aba "Mapa de Dor"');
    console.log('');
    console.log(`   👤 Paciente: ${latestPatient.full_name}`);
    console.log(`   📧 Email: ${latestPatient.email}`);
    console.log('');
  }

  console.log('📋 PRÓXIMOS PASSOS:');
  console.log('   • Explorar a lista de pacientes');
  console.log('   • Ver histórico de sessões');
  console.log('   • Criar novas sessões pela interface');
  console.log('   • Testar gráficos e relatórios');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
}

async function main() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('   🎲 POPULAR SISTEMA COMPLETO VIA API');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  console.log(`📦 Projeto: dudufisio-AI`);
  console.log(`🌐 URL: ${supabaseUrl}`);
  console.log('');

  try {
    // 1. Criar pacientes
    const patients = await createPatients();

    if (patients.length === 0) {
      console.error('\n❌ Nenhum paciente foi criado. Abortando.');
      return;
    }

    // 2. Criar sessões de body map
    const sessions = await createBodyMapSessions(patients);

    // 3. Criar regiões de dor
    await createPainRegions(sessions);

    // 4. Gerar relatório
    await generateReport();

  } catch (error: any) {
    console.error('\n❌ ERRO:', error.message);
    throw error;
  }
}

main().catch(error => {
  console.error('\n❌ ERRO FATAL:', error.message);
  process.exit(1);
});
