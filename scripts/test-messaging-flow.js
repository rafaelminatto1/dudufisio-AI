/**
 * Script de Teste - Fluxo de Mensagens
 *
 * Testa:
 * 1. Envio de mensagens
 * 2. Recebimento e leitura
 * 3. Threads de conversação
 * 4. Arquivamento
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Erro: Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY não encontradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testMessagingFlow() {
  console.log('🧪 TESTE: Fluxo de Mensagens\n');

  try {
    // 1. Verificar tabela patient_messages
    console.log('1️⃣ Verificando tabela patient_messages...');
    const { data: messages, error: messagesError } = await supabase
      .from('patient_messages')
      .select('*')
      .limit(1);

    if (messagesError) {
      console.error('❌ Erro ao acessar tabela patient_messages:', messagesError.message);
      return;
    }
    console.log('✅ Tabela patient_messages acessível\n');

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

    // 3. Paciente envia mensagem para terapeuta
    console.log('3️⃣ Paciente enviando mensagem...');
    const { data: msg1, error: msg1Error } = await supabase
      .from('patient_messages')
      .insert({
        sender_id: patient.id,
        recipient_id: therapist.id,
        subject: 'Dúvida sobre tratamento',
        message: 'Olá Dr(a). ' + therapist.full_name + ', gostaria de saber se posso fazer exercícios em casa entre as sessões?',
        is_read: false
      })
      .select()
      .single();

    if (msg1Error) {
      console.error('❌ Erro ao enviar mensagem:', msg1Error.message);
      return;
    }

    console.log('✅ Mensagem enviada!');
    console.log(`   ID: ${msg1.id}`);
    console.log(`   Assunto: ${msg1.subject}`);
    console.log(`   Mensagem: ${msg1.message}`);
    console.log(`   Lida: ${msg1.is_read ? 'Sim' : 'Não'}\n`);

    // 4. Verificar mensagens não lidas do terapeuta
    console.log('4️⃣ Verificando mensagens não lidas do terapeuta...');
    const { data: unreadMessages, error: unreadError } = await supabase
      .from('patient_messages')
      .select('*')
      .eq('recipient_id', therapist.id)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (unreadError) {
      console.error('❌ Erro ao buscar mensagens não lidas:', unreadError.message);
      return;
    }

    console.log(`✅ Mensagens não lidas: ${unreadMessages.length}`);
    unreadMessages.forEach((msg, index) => {
      console.log(`   ${index + 1}. ${msg.subject} - ${new Date(msg.created_at).toLocaleString('pt-BR')}`);
    });
    console.log('');

    // 5. Terapeuta marca mensagem como lida
    console.log('5️⃣ Terapeuta marcando mensagem como lida...');
    const { data: readMsg, error: readError } = await supabase
      .from('patient_messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', msg1.id)
      .select()
      .single();

    if (readError) {
      console.error('❌ Erro ao marcar como lida:', readError.message);
      return;
    }

    console.log('✅ Mensagem marcada como lida');
    console.log(`   Lida em: ${new Date(readMsg.read_at).toLocaleString('pt-BR')}\n`);

    // 6. Terapeuta responde (cria thread)
    console.log('6️⃣ Terapeuta respondendo...');
    const { data: reply, error: replyError } = await supabase
      .from('patient_messages')
      .insert({
        sender_id: therapist.id,
        recipient_id: patient.id,
        subject: 'RE: Dúvida sobre tratamento',
        message: 'Olá ' + patient.full_name + '! Sim, você pode fazer os exercícios que passamos. Recomendo fazer 2x ao dia, pela manhã e à tarde. Qualquer dúvida, me avise!',
        is_read: false,
        parent_message_id: msg1.id
      })
      .select()
      .single();

    if (replyError) {
      console.error('❌ Erro ao enviar resposta:', replyError.message);
      return;
    }

    console.log('✅ Resposta enviada!');
    console.log(`   ID: ${reply.id}`);
    console.log(`   Assunto: ${reply.subject}`);
    console.log(`   Mensagem: ${reply.message}`);
    console.log(`   Parent ID: ${reply.parent_message_id}\n`);

    // 7. Buscar thread completa
    console.log('7️⃣ Buscando thread completa...');
    const { data: thread, error: threadError } = await supabase
      .from('patient_messages')
      .select('*')
      .or(`id.eq.${msg1.id},parent_message_id.eq.${msg1.id}`)
      .order('created_at', { ascending: true });

    if (threadError) {
      console.error('❌ Erro ao buscar thread:', threadError.message);
      return;
    }

    console.log(`✅ Thread com ${thread.length} mensagens:`);
    thread.forEach((msg, index) => {
      const sender = msg.sender_id === patient.id ? patient.full_name : therapist.full_name;
      console.log(`   ${index + 1}. ${sender}: ${msg.message.substring(0, 50)}...`);
    });
    console.log('');

    // 8. Paciente arquiva a thread
    console.log('8️⃣ Paciente arquivando thread...');
    const { error: archiveError } = await supabase
      .from('patient_messages')
      .update({ is_archived: true })
      .eq('id', msg1.id);

    if (archiveError) {
      console.error('❌ Erro ao arquivar:', archiveError.message);
      return;
    }

    console.log('✅ Thread arquivada!\n');

    // 9. Estatísticas de mensagens
    console.log('9️⃣ Estatísticas de mensagens...');
    const { data: allMessages } = await supabase
      .from('patient_messages')
      .select('*');

    const totalMessages = allMessages ? allMessages.length : 0;
    const unreadCount = allMessages ? allMessages.filter(m => !m.is_read).length : 0;
    const archivedCount = allMessages ? allMessages.filter(m => m.is_archived).length : 0;

    console.log(`✅ Total de mensagens: ${totalMessages}`);
    console.log(`   Não lidas: ${unreadCount}`);
    console.log(`   Arquivadas: ${archivedCount}\n`);

    console.log('=' .repeat(60));
    console.log('🎉 TESTE CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📝 RESUMO:');
    console.log('   ✅ Tabela patient_messages acessível');
    console.log('   ✅ Envio de mensagens funcionando');
    console.log('   ✅ Marcação de leitura funcionando');
    console.log('   ✅ Sistema de threads funcionando');
    console.log('   ✅ Arquivamento funcionando');
    console.log('   ✅ Estatísticas funcionando');
    console.log('\n🔗 PRÓXIMO PASSO:');
    console.log('   Acesse o portal do paciente para ver a interface de mensagens');
    console.log(`   URL: https://dudufisio-60g4yc9rv-rafael-minattos-projects.vercel.app/patient-portal/messages\n`);

  } catch (error) {
    console.error('❌ Erro inesperado:', error.message);
    console.error(error);
  }
}

// Executar teste
testMessagingFlow();
