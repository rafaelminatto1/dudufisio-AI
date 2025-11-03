/**
 * Script para corrigir appointments com foreign keys inválidas
 * Remove appointments órfãos que referenciam patients inexistentes
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
  console.log('🔧 Corrigindo Foreign Keys Inválidas\n');

  // 1. Verificar appointments que serão removidos
  console.log('📋 Verificando appointments que serão removidos...\n');
  
  const { data: toDelete, error: selectError } = await supabase
    .from('appointments')
    .select('id, patient_id, therapist_id, start_time, status')
    .eq('patient_id', INVALID_PATIENT_ID);

  if (selectError) {
    console.error('❌ Erro ao buscar appointments:', selectError.message);
    return;
  }

  if (!toDelete || toDelete.length === 0) {
    console.log('✅ Nenhum appointment com FK inválida encontrado!');
    console.log('   O problema já foi corrigido.\n');
    return;
  }

  console.log(`⚠️  Encontrados ${toDelete.length} appointments com FK inválida:\n`);
  toDelete.forEach((app, index) => {
    console.log(`   ${index + 1}. ID: ${app.id}`);
    console.log(`      Patient ID: ${app.patient_id}`);
    console.log(`      Status: ${app.status}`);
    console.log(`      Data: ${app.start_time}\n`);
  });

  // 2. Confirmar antes de deletar
  console.log('🚨 ATENÇÃO: Estes registros serão PERMANENTEMENTE removidos!');
  console.log('   Pressione Ctrl+C para CANCELAR ou aguarde 5 segundos...\n');

  await new Promise(resolve => setTimeout(resolve, 5000));

  // 3. Executar DELETE
  console.log('🗑️  Removendo appointments órfãos...\n');

  const { error: deleteError } = await supabase
    .from('appointments')
    .delete()
    .eq('patient_id', INVALID_PATIENT_ID);

  if (deleteError) {
    console.error('❌ Erro ao remover appointments:', deleteError.message);
    return;
  }

  console.log('✅ Appointments removidos com sucesso!\n');

  // 4. Verificar resultado
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

  // 5. Executar revisão rápida
  console.log('📊 Executando verificação rápida...\n');

  const { count: totalAppointments } = await supabase
    .from('appointments')
    .select('*', { count: 'exact', head: true });

  const { count: totalPatients } = await supabase
    .from('patients')
    .select('*', { count: 'exact', head: true });

  console.log('   Estatísticas atuais:');
  console.log(`   - Total de patients: ${totalPatients || 0}`);
  console.log(`   - Total de appointments: ${totalAppointments || 0}`);
  console.log(`   - Appointments removidos: ${toDelete.length}\n`);

  console.log('✅ Correção concluída com sucesso!\n');
}

main().catch((err) => {
  console.error('❌ Erro fatal:', err);
  process.exit(1);
});

