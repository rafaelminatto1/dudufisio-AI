/**
 * Verificar quais appointments têm referências inválidas para patients
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('🔍 Verificando integridade de Foreign Keys\n');

  // Buscar todos os appointments
  const { data: appointments, error: appError } = await supabase
    .from('appointments')
    .select('id, patient_id, therapist_id, start_time, status');

  if (appError) {
    console.error('❌ Erro ao buscar appointments:', appError.message);
    return;
  }

  if (!appointments || appointments.length === 0) {
    console.log('ℹ️  Nenhum appointment encontrado');
    return;
  }

  console.log(`📋 Total de appointments: ${appointments.length}\n`);

  let invalidPatientRefs = 0;
  let invalidTherapistRefs = 0;

  // Verificar cada appointment
  for (const app of appointments) {
    // Verificar patient_id
    const { data: patient, error: patError } = await supabase
      .from('patients')
      .select('id, full_name')
      .eq('id', app.patient_id)
      .maybeSingle();

    if (patError || !patient) {
      invalidPatientRefs++;
      console.log(`❌ Appointment ${app.id}:`);
      console.log(`   Patient ID: ${app.patient_id} - NÃO ENCONTRADO`);
      console.log(`   Status: ${app.status}`);
      console.log(`   Data: ${app.start_time}\n`);
    }

    // Verificar therapist_id
    if (app.therapist_id) {
      const { data: therapist, error: therError } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('id', app.therapist_id)
        .eq('role', 'therapist')
        .maybeSingle();

      if (therError || !therapist) {
        invalidTherapistRefs++;
        console.log(`⚠️  Appointment ${app.id}:`);
        console.log(`   Therapist ID: ${app.therapist_id} - NÃO ENCONTRADO ou não é therapist`);
        console.log(`   Patient: ${app.patient_id}`);
        console.log(`   Data: ${app.start_time}\n`);
      }
    }
  }

  console.log('\n📊 RESUMO:');
  console.log(`   Total appointments: ${appointments.length}`);
  console.log(`   Referências inválidas de patient: ${invalidPatientRefs}`);
  console.log(`   Referências inválidas de therapist: ${invalidTherapistRefs}`);

  if (invalidPatientRefs > 0) {
    console.log('\n⚠️  AÇÃO RECOMENDADA:');
    console.log('   - Corrigir ou remover appointments com patient_id inválido');
    console.log('   - Ou criar os patients faltantes');
  }

  if (invalidTherapistRefs > 0) {
    console.log('\n⚠️  AÇÃO RECOMENDADA:');
    console.log('   - Corrigir therapist_id nos appointments');
    console.log('   - Ou criar usuários com role therapist');
  }

  if (invalidPatientRefs === 0 && invalidTherapistRefs === 0) {
    console.log('\n✅ Todas as referências estão válidas!');
  }
}

main().catch(console.error);

