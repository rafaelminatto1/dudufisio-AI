/**
 * Script de Teste - Fluxo de Teleconsulta Jitsi Meet
 *
 * Testa:
 * 1. Criação de teleconsulta
 * 2. Geração de sala Jitsi
 * 3. Join tracking
 * 4. Finalização e avaliação
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

function generateRoomName() {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `dudufisio-${timestamp}-${random}`;
}

function generatePassword(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function testTeleconsultaFlow() {
  console.log('🧪 TESTE: Fluxo de Teleconsulta Jitsi Meet\n');

  try {
    // 1. Verificar se a tabela teleconsultas existe
    console.log('1️⃣ Verificando tabela teleconsultas...');
    const { data: teleconsultas, error: teleconsultasError } = await supabase
      .from('teleconsultas')
      .select('*')
      .limit(1);

    if (teleconsultasError) {
      console.error('❌ Erro ao acessar tabela teleconsultas:', teleconsultasError.message);
      return;
    }
    console.log('✅ Tabela teleconsultas acessível\n');

    // 2. Buscar paciente e terapeuta de teste
    console.log('2️⃣ Buscando paciente e terapeuta...');
    const { data: patients } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'patient')
      .limit(1);

    const { data: therapists } = await supabase
      .from('users')
      .select('id, full_name, email')
      .eq('role', 'therapist')
      .limit(1);

    if (!patients || patients.length === 0 || !therapists || therapists.length === 0) {
      console.log('⚠️ Paciente ou terapeuta não encontrado');
      return;
    }

    const patient = patients[0];
    const therapist = therapists[0];

    console.log(`✅ Paciente: ${patient.full_name} (${patient.email})`);
    console.log(`✅ Terapeuta: ${therapist.full_name} (${therapist.email})\n`);

    // 3. Criar uma teleconsulta
    console.log('3️⃣ Criando teleconsulta...');
    const roomName = generateRoomName();
    const moderatorPassword = generatePassword(10);
    const participantPassword = generatePassword(8);
    const scheduledStart = new Date();
    scheduledStart.setHours(scheduledStart.getHours() + 1); // 1 hora no futuro
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + 50); // 50 minutos de duração

    const { data: teleconsulta, error: createError } = await supabase
      .from('teleconsultas')
      .insert({
        patient_id: patient.id,
        therapist_id: therapist.id,
        room_name: roomName,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        moderator_password: moderatorPassword,
        participant_password: participantPassword,
        status: 'scheduled'
      })
      .select()
      .single();

    if (createError) {
      console.error('❌ Erro ao criar teleconsulta:', createError.message);
      return;
    }

    console.log('✅ Teleconsulta criada com sucesso!');
    console.log(`   ID: ${teleconsulta.id}`);
    console.log(`   Sala: ${teleconsulta.room_name}`);
    console.log(`   Início: ${new Date(teleconsulta.scheduled_start).toLocaleString('pt-BR')}`);
    console.log(`   Fim: ${new Date(teleconsulta.scheduled_end).toLocaleString('pt-BR')}`);
    console.log(`   Senha Moderador: ${teleconsulta.moderator_password}`);
    console.log(`   Senha Participante: ${teleconsulta.participant_password}\n`);

    // 4. Simular entrada do terapeuta (moderador)
    console.log('4️⃣ Simulando entrada do terapeuta...');
    const { data: therapistJoin, error: therapistJoinError } = await supabase
      .from('teleconsultas')
      .update({
        status: 'waiting',
        therapist_joined_at: new Date().toISOString()
      })
      .eq('id', teleconsulta.id)
      .select()
      .single();

    if (therapistJoinError) {
      console.error('❌ Erro ao registrar entrada do terapeuta:', therapistJoinError.message);
      return;
    }

    console.log('✅ Terapeuta entrou na sala');
    console.log(`   Status: ${therapistJoin.status}`);
    console.log(`   Entrada: ${new Date(therapistJoin.therapist_joined_at).toLocaleString('pt-BR')}\n`);

    // 5. Simular entrada do paciente
    console.log('5️⃣ Simulando entrada do paciente...');
    const { data: patientJoin, error: patientJoinError } = await supabase
      .from('teleconsultas')
      .update({
        status: 'in_progress',
        patient_joined_at: new Date().toISOString(),
        started_at: new Date().toISOString()
      })
      .eq('id', teleconsulta.id)
      .select()
      .single();

    if (patientJoinError) {
      console.error('❌ Erro ao registrar entrada do paciente:', patientJoinError.message);
      return;
    }

    console.log('✅ Paciente entrou na sala - Teleconsulta iniciada!');
    console.log(`   Status: ${patientJoin.status}`);
    console.log(`   Entrada paciente: ${new Date(patientJoin.patient_joined_at).toLocaleString('pt-BR')}`);
    console.log(`   Início: ${new Date(patientJoin.started_at).toLocaleString('pt-BR')}\n`);

    // 6. Simular teleconsulta em andamento (aguardar 3 segundos)
    console.log('6️⃣ Teleconsulta em andamento...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log('✅ Teleconsulta simulada (3 segundos)\n');

    // 7. Finalizar teleconsulta
    console.log('7️⃣ Finalizando teleconsulta...');
    const endedAt = new Date();
    const duration = Math.floor((endedAt - new Date(patientJoin.started_at)) / 1000 / 60); // em minutos

    const { data: completed, error: completeError } = await supabase
      .from('teleconsultas')
      .update({
        status: 'completed',
        ended_at: endedAt.toISOString(),
        duration_minutes: duration,
        connection_quality: 'excellent'
      })
      .eq('id', teleconsulta.id)
      .select()
      .single();

    if (completeError) {
      console.error('❌ Erro ao finalizar teleconsulta:', completeError.message);
      return;
    }

    console.log('✅ Teleconsulta finalizada!');
    console.log(`   Status: ${completed.status}`);
    console.log(`   Duração: ${completed.duration_minutes} minuto(s)`);
    console.log(`   Qualidade: ${completed.connection_quality}`);
    console.log(`   Finalizada em: ${new Date(completed.ended_at).toLocaleString('pt-BR')}\n`);

    // 8. Adicionar avaliação do paciente
    console.log('8️⃣ Adicionando avaliação do paciente...');
    const { data: evaluated, error: evalError } = await supabase
      .from('teleconsultas')
      .update({
        patient_rating: 5,
        patient_feedback: 'Excelente consulta! Muito satisfeito com o atendimento.'
      })
      .eq('id', teleconsulta.id)
      .select()
      .single();

    if (evalError) {
      console.error('❌ Erro ao adicionar avaliação:', evalError.message);
      return;
    }

    console.log('✅ Avaliação adicionada!');
    console.log(`   Nota: ${evaluated.patient_rating}/5 ⭐`);
    console.log(`   Feedback: ${evaluated.patient_feedback}\n`);

    // 9. Verificar histórico de teleconsultas
    console.log('9️⃣ Verificando histórico de teleconsultas...');
    const { data: allTeleconsultas, error: historyError } = await supabase
      .from('teleconsultas')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (historyError) {
      console.error('❌ Erro ao buscar histórico:', historyError.message);
      return;
    }

    console.log(`✅ Total de teleconsultas recentes: ${allTeleconsultas.length}`);
    allTeleconsultas.forEach((tc, index) => {
      console.log(`   ${index + 1}. ${tc.room_name} - ${tc.status} - ${new Date(tc.scheduled_start).toLocaleDateString('pt-BR')}`);
    });

    console.log('\n' + '='.repeat(60));
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📝 RESUMO:');
    console.log('   ✅ Tabela teleconsultas acessível');
    console.log('   ✅ Criação de teleconsulta funcionando');
    console.log('   ✅ Join tracking funcionando (terapeuta e paciente)');
    console.log('   ✅ Finalização e métricas funcionando');
    console.log('   ✅ Avaliação funcionando');
    console.log('   ✅ Histórico funcionando');
    console.log('\n🔗 PRÓXIMO PASSO:');
    console.log(`   Acesse: https://dudufisio-60g4yc9rv-rafael-minattos-projects.vercel.app/teleconsulta/${teleconsulta.id}`);
    console.log('   Para testar a videochamada completa com Jitsi Meet\n');
    console.log('📋 DADOS DA SALA:');
    console.log(`   Sala Jitsi: ${roomName}`);
    console.log(`   URL: https://meet.jit.si/${roomName}`);
    console.log(`   Senha Moderador (terapeuta): ${moderatorPassword}`);
    console.log(`   Senha Participante (paciente): ${participantPassword}\n`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error(error);
  }
}

// Executar teste
testTeleconsultaFlow();
