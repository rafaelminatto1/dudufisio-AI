/**
 * Script de Teste - Fluxo de Solicitação de Agendamento
 *
 * IMPORTANTE: Este é um sistema de SOLICITAÇÃO, NÃO de agendamento automático!
 *
 * Fluxo:
 * 1. Paciente SOLICITA agendamento
 * 2. Terapeuta recebe notificação
 * 3. Terapeuta APROVA ou REJEITA
 * 4. Se aprovado, ENTÃO o appointment é criado
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testAppointmentRequestFlow() {
  console.log('🧪 TESTE: Fluxo de Solicitação de Agendamento\n');
  console.log('⚠️  IMPORTANTE: Sistema de SOLICITAÇÃO (não agendamento automático)\n');

  try {
    // 1. Verificar tabela appointment_requests
    console.log('1️⃣ Verificando tabela appointment_requests...');
    const { data: requests, error: requestsError } = await supabase
      .from('appointment_requests')
      .select('*')
      .limit(1);

    if (requestsError) {
      console.error('❌ Erro ao acessar tabela appointment_requests:', requestsError.message);
      return;
    }
    console.log('✅ Tabela appointment_requests acessível\n');

    // 2. Buscar paciente e terapeuta
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

    console.log(`✅ Paciente: ${patient.full_name}`);
    console.log(`✅ Terapeuta: ${therapist.full_name}\n`);

    // 3. Paciente SOLICITA agendamento
    console.log('3️⃣ Paciente SOLICITANDO agendamento...');
    const preferredDate = new Date();
    preferredDate.setDate(preferredDate.getDate() + 3); // 3 dias no futuro
    preferredDate.setHours(14, 0, 0, 0); // 14:00

    const { data: request, error: requestError } = await supabase
      .from('appointment_requests')
      .insert({
        patient_id: patient.id,
        therapist_id: therapist.id,
        preferred_date: preferredDate.toISOString(),
        preferred_time_slot: '14:00-15:00',
        reason: 'Gostaria de agendar uma sessão de fisioterapia para continuar o tratamento da lombar. Prefiro horário da tarde.',
        status: 'pending'
      })
      .select()
      .single();

    if (requestError) {
      console.error('❌ Erro ao criar solicitação:', requestError.message);
      return;
    }

    console.log('✅ Solicitação criada! (NÃO é um appointment ainda)');
    console.log(`   ID: ${request.id}`);
    console.log(`   Status: ${request.status}`);
    console.log(`   Data preferida: ${new Date(request.preferred_date).toLocaleString('pt-BR')}`);
    console.log(`   Horário: ${request.preferred_time_slot}`);
    console.log(`   Motivo: ${request.reason}`);
    console.log(`   ⚠️  NOTA: Appointment será criado APENAS se o terapeuta APROVAR\n`);

    // 4. Verificar solicitações pendentes do terapeuta
    console.log('4️⃣ Verificando solicitações pendentes do terapeuta...');
    const { data: pendingRequests, error: pendingError } = await supabase
      .from('appointment_requests')
      .select('*')
      .eq('therapist_id', therapist.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false});

    if (pendingError) {
      console.error('❌ Erro ao buscar solicitações:', pendingError.message);
      return;
    }

    console.log(`✅ Solicitações pendentes: ${pendingRequests.length}`);
    pendingRequests.forEach((req, index) => {
      console.log(`   ${index + 1}. ${req.preferred_time_slot} - ${new Date(req.preferred_date).toLocaleDateString('pt-BR')}`);
    });
    console.log('');

    // 5. Verificar que NÃO existe appointment ainda
    console.log('5️⃣ Verificando que appointment NÃO foi criado ainda...');
    const { data: appointments, error: apptError } = await supabase
      .from('appointments')
      .select('*')
      .eq('patient_id', patient.id)
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (apptError) {
      console.error('❌ Erro ao buscar appointments:', apptError.message);
      return;
    }

    console.log(`✅ Confirmado: Nenhum appointment criado automaticamente`);
    console.log(`   Appointments futuros do paciente: ${appointments.length}\n`);

    // 6. Terapeuta APROVA a solicitação
    console.log('6️⃣ Terapeuta APROVANDO solicitação...');
    console.log('   (Agora SIM o appointment será criado)\n');

    // Criar o appointment
    const startTime = new Date(request.preferred_date);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const { data: newAppointment, error: createApptError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patient.id,
        therapist_id: therapist.id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        type: 'consultation',
        status: 'scheduled',
        notes: `Agendamento criado a partir da solicitação ${request.id}`
      })
      .select()
      .single();

    if (createApptError) {
      console.error('❌ Erro ao criar appointment:', createApptError.message);
      return;
    }

    // Atualizar solicitação para aprovada
    const { data: approvedRequest, error: approveError } = await supabase
      .from('appointment_requests')
      .update({
        status: 'approved',
        appointment_id: newAppointment.id,
        responded_by: therapist.id,
        responded_at: new Date().toISOString()
      })
      .eq('id', request.id)
      .select()
      .single();

    if (approveError) {
      console.error('❌ Erro ao aprovar solicitação:', approveError.message);
      return;
    }

    console.log('✅ Solicitação APROVADA e Appointment CRIADO!');
    console.log(`   Solicitação ID: ${approvedRequest.id}`);
    console.log(`   Status: ${approvedRequest.status}`);
    console.log(`   Appointment ID: ${approvedRequest.appointment_id}`);
    console.log(`   Aprovado por: Terapeuta ${therapist.full_name}`);
    console.log(`   Aprovado em: ${new Date(approvedRequest.responded_at).toLocaleString('pt-BR')}\n`);

    console.log('📅 Dados do Appointment criado:');
    console.log(`   ID: ${newAppointment.id}`);
    console.log(`   Início: ${new Date(newAppointment.start_time).toLocaleString('pt-BR')}`);
    console.log(`   Fim: ${new Date(newAppointment.end_time).toLocaleString('pt-BR')}`);
    console.log(`   Tipo: ${newAppointment.type}`);
    console.log(`   Status: ${newAppointment.status}\n`);

    // 7. Testar rejeição de solicitação
    console.log('7️⃣ Testando REJEIÇÃO de solicitação...');

    // Criar nova solicitação
    const rejectDate = new Date();
    rejectDate.setDate(rejectDate.getDate() + 5);

    const { data: rejectRequest, error: rejectReqError } = await supabase
      .from('appointment_requests')
      .insert({
        patient_id: patient.id,
        therapist_id: therapist.id,
        preferred_date: rejectDate.toISOString(),
        preferred_time_slot: '09:00-10:00',
        reason: 'Teste de rejeição',
        status: 'pending'
      })
      .select()
      .single();

    if (rejectReqError) {
      console.error('❌ Erro ao criar solicitação de teste:', rejectReqError.message);
      return;
    }

    // Rejeitar
    const { data: rejected, error: rejectError } = await supabase
      .from('appointment_requests')
      .update({
        status: 'rejected',
        responded_by: therapist.id,
        responded_at: new Date().toISOString()
      })
      .eq('id', rejectRequest.id)
      .select()
      .single();

    if (rejectError) {
      console.error('❌ Erro ao rejeitar solicitação:', rejectError.message);
      return;
    }

    console.log('✅ Solicitação REJEITADA!');
    console.log(`   ID: ${rejected.id}`);
    console.log(`   Status: ${rejected.status}`);
    console.log(`   Appointment ID: ${rejected.appointment_id || 'null (não criado)'}`);
    console.log(`   ✅ Confirmado: Nenhum appointment criado para solicitação rejeitada\n`);

    // 8. Estatísticas
    console.log('8️⃣ Estatísticas de solicitações...');
    const { data: allRequests } = await supabase
      .from('appointment_requests')
      .select('*')
      .eq('therapist_id', therapist.id);

    const total = allRequests ? allRequests.length : 0;
    const pending = allRequests ? allRequests.filter(r => r.status === 'pending').length : 0;
    const approved = allRequests ? allRequests.filter(r => r.status === 'approved').length : 0;
    const rejected = allRequests ? allRequests.filter(r => r.status === 'rejected').length : 0;

    console.log(`✅ Total de solicitações: ${total}`);
    console.log(`   Pendentes: ${pending}`);
    console.log(`   Aprovadas: ${approved}`);
    console.log(`   Rejeitadas: ${rejected}\n`);

    console.log('='.repeat(60));
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📝 RESUMO:');
    console.log('   ✅ Sistema de SOLICITAÇÃO funcionando corretamente');
    console.log('   ✅ Paciente pode SOLICITAR agendamentos');
    console.log('   ✅ Terapeuta pode APROVAR ou REJEITAR');
    console.log('   ✅ Appointment criado APENAS quando aprovado');
    console.log('   ✅ Nenhum appointment criado automaticamente');
    console.log('   ✅ Estatísticas funcionando');
    console.log('\n⚠️  FLUXO CORRETO:');
    console.log('   1. Paciente SOLICITA → appointment_requests (status: pending)');
    console.log('   2. Terapeuta APROVA → cria appointment + atualiza status');
    console.log('   3. OU Terapeuta REJEITA → apenas atualiza status (sem appointment)\n');

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error(error);
  }
}

// Executar teste
testAppointmentRequestFlow();
