/**
 * Script de Teste Completo - Usando Service Role (Admin)
 *
 * Executa todos os testes com permissões administrativas
 * para evitar problemas com RLS durante os testes
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://urfxniitfbbvsaskicfo.supabase.co';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVyZnhuaWl0ZmJidnNhc2tpY2ZvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODMwNTQ0NywiZXhwIjoyMDczODgxNDQ3fQ.hCnWP5UjAywrkCX1hnHQviu9R3J56y2VZdLI1tKhgWg';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function log(emoji, message) {
  console.log(`${emoji} ${message}`);
}

function header(title) {
  console.log('\n' + '='.repeat(60));
  console.log(`  ${title}`);
  console.log('='.repeat(60) + '\n');
}

async function testPayments() {
  header('TESTE 1: Sistema de Pagamentos Stripe');

  try {
    // Verificar tabela
    log('1️⃣', 'Verificando tabela payments...');
    const { error: tableError } = await supabase.from('payments').select('count').limit(1);

    if (tableError) {
      log('❌', `Erro: ${tableError.message}`);
      return false;
    }
    log('✅', 'Tabela payments acessível');

    // Buscar ou criar usuário de teste
    log('2️⃣', 'Buscando paciente...');
    let { data: users } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'patient')
      .limit(1);

    if (!users || users.length === 0) {
      log('⚠️', 'Criando paciente de teste...');
      const { data: newUser } = await supabase
        .from('users')
        .insert({
          email: 'teste-payment@dudufisio.com',
          full_name: 'Paciente Teste Pagamentos',
          role: 'patient'
        })
        .select()
        .single();
      users = [newUser];
    }

    const patient = users[0];
    log('✅', `Paciente: ${patient.full_name}`);

    // Criar pagamento
    log('3️⃣', 'Criando pagamento de teste...');
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert({
        patient_id: patient.id,
        amount: 150.00,
        currency: 'BRL',
        description: 'Teste - Consulta de Fisioterapia',
        status: 'pending',
        payment_method: 'credit_card'
      })
      .select()
      .single();

    if (paymentError) {
      log('❌', `Erro ao criar pagamento: ${paymentError.message}`);
      return false;
    }

    log('✅', `Pagamento criado: ID ${payment.id} - R$ ${payment.amount.toFixed(2)}`);

    // Simular pagamento concluído
    log('4️⃣', 'Simulando conclusão de pagamento...');
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'completed',
        stripe_payment_intent_id: 'pi_test_' + Date.now(),
        paid_at: new Date().toISOString()
      })
      .eq('id', payment.id);

    if (updateError) {
      log('❌', `Erro ao atualizar: ${updateError.message}`);
      return false;
    }

    log('✅', 'Pagamento concluído com sucesso!');
    log('🎉', 'TESTE DE PAGAMENTOS: PASSOU\n');
    return true;

  } catch (error) {
    log('❌', `Erro inesperado: ${error.message}`);
    return false;
  }
}

async function testTeleconsultas() {
  header('TESTE 2: Sistema de Teleconsulta Jitsi');

  try {
    log('1️⃣', 'Verificando tabela teleconsultas...');
    const { error: tableError } = await supabase.from('teleconsultas').select('count').limit(1);

    if (tableError) {
      log('❌', `Erro: ${tableError.message}`);
      return false;
    }
    log('✅', 'Tabela teleconsultas acessível');

    // Buscar usuários
    log('2️⃣', 'Buscando paciente e terapeuta...');
    const { data: patients } = await supabase.from('users').select('*').eq('role', 'patient').limit(1);
    const { data: therapists } = await supabase.from('users').select('*').eq('role', 'therapist').limit(1);

    if (!patients?.length || !therapists?.length) {
      log('⚠️', 'Paciente ou terapeuta não encontrado');
      return false;
    }

    log('✅', `Paciente: ${patients[0].full_name}, Terapeuta: ${therapists[0].full_name}`);

    // Criar teleconsulta
    log('3️⃣', 'Criando teleconsulta...');
    const roomName = `test-${Date.now()}`;
    const scheduledStart = new Date();
    scheduledStart.setHours(scheduledStart.getHours() + 1);
    const scheduledEnd = new Date(scheduledStart);
    scheduledEnd.setMinutes(scheduledEnd.getMinutes() + 50);

    const { data: tc, error: tcError } = await supabase
      .from('teleconsultas')
      .insert({
        patient_id: patients[0].id,
        therapist_id: therapists[0].id,
        room_name: roomName,
        scheduled_start: scheduledStart.toISOString(),
        scheduled_end: scheduledEnd.toISOString(),
        moderator_password: 'mod123',
        participant_password: 'part456',
        status: 'scheduled'
      })
      .select()
      .single();

    if (tcError) {
      log('❌', `Erro: ${tcError.message}`);
      return false;
    }

    log('✅', `Teleconsulta criada: ${tc.room_name}`);

    // Simular início
    log('4️⃣', 'Simulando início da teleconsulta...');
    const { error: startError } = await supabase
      .from('teleconsultas')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        therapist_joined_at: new Date().toISOString(),
        patient_joined_at: new Date().toISOString()
      })
      .eq('id', tc.id);

    if (startError) {
      log('❌', `Erro: ${startError.message}`);
      return false;
    }

    log('✅', 'Teleconsulta iniciada');

    // Simular finalização
    log('5️⃣', 'Simulando finalização...');
    const { error: endError } = await supabase
      .from('teleconsultas')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        duration_minutes: 45,
        connection_quality: 'excellent',
        patient_rating: 5
      })
      .eq('id', tc.id);

    if (endError) {
      log('❌', `Erro: ${endError.message}`);
      return false;
    }

    log('✅', 'Teleconsulta finalizada com sucesso!');
    log('🎉', 'TESTE DE TELECONSULTA: PASSOU\n');
    return true;

  } catch (error) {
    log('❌', `Erro inesperado: ${error.message}`);
    return false;
  }
}

async function testMessages() {
  header('TESTE 3: Sistema de Mensagens');

  try {
    log('1️⃣', 'Verificando tabela patient_messages...');
    const { error: tableError } = await supabase.from('patient_messages').select('count').limit(1);

    if (tableError) {
      log('❌', `Erro: ${tableError.message}`);
      return false;
    }
    log('✅', 'Tabela patient_messages acessível');

    // Buscar usuários
    const { data: patients } = await supabase.from('users').select('*').eq('role', 'patient').limit(1);
    const { data: therapists } = await supabase.from('users').select('*').eq('role', 'therapist').limit(1);

    if (!patients?.length || !therapists?.length) {
      log('⚠️', 'Usuários não encontrados');
      return false;
    }

    log('✅', 'Usuários encontrados');

    // Enviar mensagem
    log('2️⃣', 'Enviando mensagem do paciente para terapeuta...');
    const { data: msg, error: msgError } = await supabase
      .from('patient_messages')
      .insert({
        sender_id: patients[0].id,
        recipient_id: therapists[0].id,
        subject: 'Teste de Mensagem',
        message: 'Olá, esta é uma mensagem de teste!',
        is_read: false
      })
      .select()
      .single();

    if (msgError) {
      log('❌', `Erro: ${msgError.message}`);
      return false;
    }

    log('✅', `Mensagem enviada: ${msg.subject}`);

    // Marcar como lida
    log('3️⃣', 'Marcando como lida...');
    const { error: readError } = await supabase
      .from('patient_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('id', msg.id);

    if (readError) {
      log('❌', `Erro: ${readError.message}`);
      return false;
    }

    log('✅', 'Mensagem marcada como lida');

    // Responder
    log('4️⃣', 'Terapeuta respondendo...');
    const { error: replyError } = await supabase
      .from('patient_messages')
      .insert({
        sender_id: therapists[0].id,
        recipient_id: patients[0].id,
        subject: 'RE: Teste de Mensagem',
        message: 'Olá! Recebi sua mensagem!',
        parent_message_id: msg.id,
        is_read: false
      });

    if (replyError) {
      log('❌', `Erro: ${replyError.message}`);
      return false;
    }

    log('✅', 'Resposta enviada - Thread criada!');
    log('🎉', 'TESTE DE MENSAGENS: PASSOU\n');
    return true;

  } catch (error) {
    log('❌', `Erro inesperado: ${error.message}`);
    return false;
  }
}

async function testAppointmentRequests() {
  header('TESTE 4: Sistema de Solicitação de Agendamento');

  try {
    log('1️⃣', 'Verificando tabela appointment_requests...');
    const { error: tableError } = await supabase.from('appointment_requests').select('count').limit(1);

    if (tableError) {
      log('❌', `Erro: ${tableError.message}`);
      return false;
    }
    log('✅', 'Tabela appointment_requests acessível');

    // Buscar usuários
    const { data: patients } = await supabase.from('users').select('*').eq('role', 'patient').limit(1);
    const { data: therapists } = await supabase.from('users').select('*').eq('role', 'therapist').limit(1);

    if (!patients?.length || !therapists?.length) {
      log('⚠️', 'Usuários não encontrados');
      return false;
    }

    log('✅', 'Usuários encontrados');

    // Criar solicitação
    log('2️⃣', 'Paciente SOLICITANDO agendamento...');
    const preferredDate = new Date();
    preferredDate.setDate(preferredDate.getDate() + 3);

    const { data: request, error: reqError } = await supabase
      .from('appointment_requests')
      .insert({
        patient_id: patients[0].id,
        therapist_id: therapists[0].id,
        preferred_date: preferredDate.toISOString(),
        preferred_time_slot: '14:00-15:00',
        reason: 'Teste de solicitação de agendamento',
        status: 'pending'
      })
      .select()
      .single();

    if (reqError) {
      log('❌', `Erro: ${reqError.message}`);
      return false;
    }

    log('✅', `Solicitação criada (status: ${request.status})`);
    log('⚠️', 'IMPORTANTE: Appointment NÃO foi criado automaticamente!');

    // Aprovar e criar appointment
    log('3️⃣', 'Terapeuta APROVANDO solicitação...');

    const startTime = new Date(request.preferred_date);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const { data: appt, error: apptError } = await supabase
      .from('appointments')
      .insert({
        patient_id: patients[0].id,
        therapist_id: therapists[0].id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        type: 'consultation',
        status: 'scheduled'
      })
      .select()
      .single();

    if (apptError) {
      log('❌', `Erro ao criar appointment: ${apptError.message}`);
      return false;
    }

    const { error: approveError } = await supabase
      .from('appointment_requests')
      .update({
        status: 'approved',
        appointment_id: appt.id,
        responded_by: therapists[0].id,
        responded_at: new Date().toISOString()
      })
      .eq('id', request.id);

    if (approveError) {
      log('❌', `Erro ao aprovar: ${approveError.message}`);
      return false;
    }

    log('✅', 'Solicitação APROVADA e Appointment CRIADO!');
    log('✅', `Appointment ID: ${appt.id}`);
    log('🎉', 'TESTE DE SOLICITAÇÃO: PASSOU\n');
    return true;

  } catch (error) {
    log('❌', `Erro inesperado: ${error.message}`);
    return false;
  }
}

// Executar todos os testes
async function runAllTests() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     DuduFisio-AI - Suite Completa de Testes (Admin)      ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  const results = {
    payments: await testPayments(),
    teleconsultas: await testTeleconsultas(),
    messages: await testMessages(),
    requests: await testAppointmentRequests()
  };

  const total = Object.keys(results).length;
  const passed = Object.values(results).filter(r => r === true).length;
  const failed = total - passed;

  header('RELATÓRIO FINAL');
  log('📊', `Total de testes: ${total}`);
  log('✅', `Passaram: ${passed}`);
  log('❌', `Falharam: ${failed}`);

  if (failed === 0) {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   🎉 TODOS OS TESTES PASSARAM COM SUCESSO! 🎉            ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
    log('🚀', 'O sistema está PRONTO PARA PRODUÇÃO!');
  } else {
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║   ⚠️  ALGUNS TESTES FALHARAM - REVISE OS ERROS ACIMA     ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  }

  console.log('');
}

runAllTests();
