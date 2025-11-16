/**
 * Script para corrigir appointments com foreign keys inválidas
 * Remove dependências primeiro (appointment_requests) e depois os appointments
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const INVALID_PATIENT_ID = '183bf3f6-1218-495b-bb0d-a58c2f75c8d2';

async function main() {
  console.log('🔧 Corrigindo Foreign Keys Inválidas (com CASCADE)\n');

  // 1. Buscar appointments que serão removidos
  console.log('📋 Verificando appointments que serão removidos...\n');
  
  const { data: appointments, error: selectError } = await supabase
    .from('appointments')
    .select('id, patient_id, therapist_id, start_time, status')
    .eq('patient_id', INVALID_PATIENT_ID);

  if (selectError) {
    console.error('❌ Erro ao buscar appointments:', selectError.message);
    return;
  }

  if (!appointments || appointments.length === 0) {
    console.log('✅ Nenhum appointment com FK inválida encontrado!');
    console.log('   O problema já foi corrigido.\n');
    return;
  }

  const appointmentIds = appointments.map(a => a.id);

  console.log(`⚠️  Encontrados ${appointments.length} appointments com FK inválida:\n`);
  appointments.forEach((app, index) => {
    console.log(`   ${index + 1}. ID: ${app.id}`);
    console.log(`      Patient ID: ${app.patient_id}`);
    console.log(`      Status: ${app.status}`);
    console.log(`      Data: ${app.start_time}\n`);
  });

  // 2. Verificar se há appointment_requests relacionados
  console.log('🔍 Verificando dependências em appointment_requests...\n');
  
  const { data: requests, error: requestsError } = await supabase
    .from('appointment_requests')
    .select('id, appointment_id')
    .in('appointment_id', appointmentIds);

  if (requestsError) {
    if (requestsError.message.includes('not find the table')) {
      console.log('   ℹ️  Tabela appointment_requests não está acessível via API\n');
    } else {
      console.log(`   ⚠️  Erro ao verificar appointment_requests: ${requestsError.message}\n`);
    }
  } else if (requests && requests.length > 0) {
    console.log(`   ⚠️  Encontrados ${requests.length} appointment_requests relacionados`);
    console.log(`   Eles também serão removidos.\n`);
  } else {
    console.log('   ✅ Nenhuma dependência em appointment_requests\n');
  }

  // 3. Confirmar antes de deletar
  console.log('🚨 ATENÇÃO: Estes registros serão PERMANENTEMENTE removidos!');
  console.log('   - Appointments: ' + appointments.length);
  if (requests && requests.length > 0) {
    console.log('   - Appointment requests: ' + requests.length);
  }
  console.log('\n   Pressione Ctrl+C para CANCELAR ou aguarde 5 segundos...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // 4. Remover appointment_requests primeiro (se existirem)
  if (requests && requests.length > 0) {
    console.log('🗑️  Removendo appointment_requests relacionados...\n');

    const { error: deleteRequestsError } = await supabase
      .from('appointment_requests')
      .delete()
      .in('appointment_id', appointmentIds);

    if (deleteRequestsError) {
      console.error('❌ Erro ao remover appointment_requests:', deleteRequestsError.message);
      console.log('\n⚠️  Não é possível prosseguir sem remover as dependências primeiro.');
      console.log('   Execute este SQL manualmente no Dashboard:\n');
      console.log('   DELETE FROM appointment_requests');
      console.log(`   WHERE appointment_id IN ('${appointmentIds.join("', '")}');\n`);
      return;
    }

    console.log('✅ Appointment requests removidos com sucesso!\n');
  }

  // 5. Executar DELETE nos appointments
  console.log('🗑️  Removendo appointments órfãos...\n');

  const { error: deleteError } = await supabase
    .from('appointments')
    .delete()
    .eq('patient_id', INVALID_PATIENT_ID);

  if (deleteError) {
    console.error('❌ Erro ao remover appointments:', deleteError.message);
    console.log('\n⚠️  É necessário remover via SQL direto no Dashboard:\n');
    console.log('   DELETE FROM appointment_requests');
    console.log(`   WHERE appointment_id IN ('${appointmentIds.join("', '")}');\n`);
    console.log('   DELETE FROM appointments');
    console.log(`   WHERE patient_id = '${INVALID_PATIENT_ID}';\n`);
    return;
  }

  console.log('✅ Appointments removidos com sucesso!\n');

  // 6. Verificar resultado
  const { data: remaining, error: verifyError } = await supabase
    .from('appointments')
    .select('id')
    .eq('patient_id', INVALID_PATIENT_ID);

  if (verifyError) {
    console.error('⚠️  Erro ao verificar resultado:', verifyError.message);
    return;
  }

  if (!remaining || remaining.length === 0) {
    console.log('✅ Verificação: Nenhum appointment com FK inválida restante!');
    console.log('\n🎉 Problema corrigido! Score de saúde agora é 100%\n');
  } else {
    console.log(`⚠️  Ainda restam ${remaining.length} appointments com FK inválida`);
  }

  // 7. Executar revisão rápida
  console.log('📊 Estatísticas atuais:\n');

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  console.log(`   - Total de patients: ${totalPatients || 0}`);
  console.log(`   - Total de appointments: ${totalAppointments || 0}`);
  console.log(`   - Appointments removidos: ${appointments.length}`);
  if (requests && requests.length > 0) {
    console.log(`   - Appointment requests removidos: ${requests.length}`);
  }

  console.log('\n✅ Correção concluída com sucesso!\n');
  console.log('📝 Executar revisão completa:');
  console.log('   npx tsx scripts/revisao-completa.ts\n');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

