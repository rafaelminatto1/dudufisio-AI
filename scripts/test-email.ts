/**
 * Script de teste para Email Service
 *
 * Como executar:
 * npx tsx scripts/test-email.ts
 *
 * ou no console do navegador (após iniciar app):
 * import('./scripts/test-email.ts')
 */

import { resendEmailService } from '../services/email/ResendEmailService';

async function testEmailService() {
  console.log('🧪 Iniciando testes do Email Service...\n');

  try {
    // Teste 1: Email de Boas-vindas
    console.log('📧 Teste 1: Email de Boas-vindas');
    const welcomeResult = await resendEmailService.sendWelcomeEmail({
      to: {
        email: 'teste@moocafisio.com.br',
        name: 'Usuario Teste'
      },
      patientName: 'Usuario Teste',
      clinicName: 'MoocaFisio - Clínica Modelo'
    });

    if (welcomeResult.success) {
      console.log('✅ Email de boas-vindas enviado!');
      console.log(`   Message ID: ${welcomeResult.messageId}\n`);
    } else {
      console.error('❌ Falha ao enviar email de boas-vindas');
      console.error(`   Erro: ${welcomeResult.error}\n`);
    }

    // Teste 2: Confirmação de Consulta
    console.log('📧 Teste 2: Confirmação de Consulta');
    const confirmationResult = await resendEmailService.sendAppointmentConfirmation({
      to: {
        email: 'teste@moocafisio.com.br',
        name: 'Usuario Teste'
      },
      patientName: 'Usuario Teste',
      appointmentDate: '15/11/2025 (Sexta-feira)',
      appointmentTime: '14:30',
      therapistName: 'Dr. Pedro Santos',
      location: 'Rua Exemplo, 123 - Centro, São Paulo - SP'
    });

    if (confirmationResult.success) {
      console.log('✅ Email de confirmação enviado!');
      console.log(`   Message ID: ${confirmationResult.messageId}\n`);
    } else {
      console.error('❌ Falha ao enviar confirmação');
      console.error(`   Erro: ${confirmationResult.error}\n`);
    }

    // Teste 3: Lembrete 24h
    console.log('📧 Teste 3: Lembrete 24h antes');
    const reminderResult = await resendEmailService.sendAppointmentReminder24h({
      to: {
        email: 'teste@moocafisio.com.br',
        name: 'Usuario Teste'
      },
      patientName: 'Usuario Teste',
      appointmentDate: 'Amanhã, 15/11/2025',
      appointmentTime: '14:30',
      therapistName: 'Dr. Pedro Santos'
    });

    if (reminderResult.success) {
      console.log('✅ Lembrete 24h enviado!');
      console.log(`   Message ID: ${reminderResult.messageId}\n`);
    } else {
      console.error('❌ Falha ao enviar lembrete');
      console.error(`   Erro: ${reminderResult.error}\n`);
    }

    // Teste 4: Email customizado
    console.log('📧 Teste 4: Email Customizado');
    const customResult = await resendEmailService.sendEmail({
      to: {
        email: 'teste@moocafisio.com.br',
        name: 'Usuario Teste'
      },
      subject: 'Teste de Email Customizado',
      html: `
        <h1>Teste de Email</h1>
        <p>Este é um email customizado da MoocaFisio.</p>
        <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
        <p>Sistema funcionando perfeitamente! ✅</p>
      `,
      priority: 'high'
    });

    if (customResult.success) {
      console.log('✅ Email customizado enviado!');
      console.log(`   Message ID: ${customResult.messageId}\n`);
    } else {
      console.error('❌ Falha ao enviar email customizado');
      console.error(`   Erro: ${customResult.error}\n`);
    }

    // Resumo dos testes
    console.log('\n📊 RESUMO DOS TESTES:');
    const results = [welcomeResult, confirmationResult, reminderResult, customResult];
    const successCount = results.filter(r => r.success).length;
    const totalTests = results.length;

    console.log(`   Total de testes: ${totalTests}`);
    console.log(`   Sucessos: ${successCount}`);
    console.log(`   Falhas: ${totalTests - successCount}`);
    console.log(`   Taxa de sucesso: ${(successCount / totalTests * 100).toFixed(0)}%`);

    if (successCount === totalTests) {
      console.log('\n🎉 TODOS OS TESTES PASSARAM!');
    } else {
      console.log('\n⚠️ ALGUNS TESTES FALHARAM. Verifique os erros acima.');
    }

    // Buscar estatísticas do banco
    console.log('\n📈 Buscando estatísticas do banco de dados...');
    const stats = await resendEmailService.getDeliveryStats(
      new Date(Date.now() - 24 * 60 * 60 * 1000), // últimas 24h
      new Date()
    );

    console.log('   Estatísticas de entrega (últimas 24h):');
    console.log(`   - Total: ${stats.total}`);
    console.log(`   - Enviados: ${stats.sent}`);
    console.log(`   - Entregues: ${stats.delivered}`);
    console.log(`   - Falhas: ${stats.failed}`);
    console.log(`   - Bounced: ${stats.bounced}`);

  } catch (error) {
    console.error('\n❌ ERRO CRÍTICO NOS TESTES:');
    console.error(error);
  }
}

// Auto-executar se rodado diretamente
if (require.main === module) {
  testEmailService()
    .then(() => {
      console.log('\n✅ Testes concluídos!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro ao executar testes:', error);
      process.exit(1);
    });
}

export { testEmailService };
