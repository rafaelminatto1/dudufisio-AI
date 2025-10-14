/**
 * Script para iniciar o WhatsApp Web Service
 * DuduFisio-AI - Integração WhatsApp + CRM
 * 
 * Uso:
 *   npm run start:whatsapp
 *   
 * Produção (PM2):
 *   npm run whatsapp:pm2
 */

import { getWhatsAppWebService } from '../services/whatsapp/WhatsAppWebService';

async function main() {
  console.clear();
  
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                                                           ║');
  console.log('║      🚀 WHATSAPP WEB SERVICE - DUDUFISIO-AI 🚀           ║');
  console.log('║                                                           ║');
  console.log('╠═══════════════════════════════════════════════════════════╣');
  console.log('║                                                           ║');
  console.log('║  📱 Número Fixo da Clínica                                ║');
  console.log('║  🤖 Automação de CRM e WhatsApp                           ║');
  console.log('║  💰 Custo: R$ 0 por mensagem                              ║');
  console.log('║  📊 Mensagens ilimitadas                                  ║');
  console.log('║  ⚡ Economia de 60-70% vs API paga                        ║');
  console.log('║                                                           ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log('');

  try {
    const whatsappService = getWhatsAppWebService();
    
    // Iniciar serviço
    await whatsappService.start();

    // Handlers de processo
    process.on('SIGINT', async () => {
      console.log('');
      console.log('🛑 Recebido sinal de interrupção (Ctrl+C)...');
      await shutdown(whatsappService);
    });

    process.on('SIGTERM', async () => {
      console.log('');
      console.log('🛑 Recebido sinal de término...');
      await shutdown(whatsappService);
    });

    process.on('uncaughtException', async (error) => {
      console.error('');
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ ERRO NÃO CAPTURADO');
      console.error('═══════════════════════════════════════════════════════');
      console.error(error);
      console.error('═══════════════════════════════════════════════════════');
      await shutdown(whatsappService);
    });

    process.on('unhandledRejection', async (reason, promise) => {
      console.error('');
      console.error('═══════════════════════════════════════════════════════');
      console.error('❌ PROMISE REJEITADA NÃO TRATADA');
      console.error('═══════════════════════════════════════════════════════');
      console.error('Motivo:', reason);
      console.error('Promise:', promise);
      console.error('═══════════════════════════════════════════════════════');
      await shutdown(whatsappService);
    });

    // Status check periódico
    setInterval(() => {
      const stats = whatsappService.getStats();
      const info = whatsappService.getInfo();
      
      if (stats.connected) {
        console.log('');
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 STATUS DO SERVIÇO');
        console.log('═══════════════════════════════════════════════════════');
        console.log(`✅ Conectado: SIM`);
        console.log(`📱 Número: ${info?.wid?.user || 'N/A'}`);
        console.log(`📬 Fila: ${stats.queueSize} mensagens`);
        console.log(`🕐 Horário: ${new Date().toLocaleString('pt-BR')}`);
        console.log('═══════════════════════════════════════════════════════');
      } else {
        console.log('⚠️  Status: Desconectado | Reconectando...');
      }
    }, 300000); // A cada 5 minutos

    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SERVIÇO INICIADO COM SUCESSO!');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 DICAS:');
    console.log('   • Para parar: Ctrl+C');
    console.log('   • Logs salvos em: logs/whatsapp.log');
    console.log('   • Sessão salva em: whatsapp-session/');
    console.log('');
    console.log('📝 PRÓXIMOS PASSOS:');
    console.log('   1. Aguarde conexão (se QR Code, escaneie)');
    console.log('   2. Envie mensagem de teste do seu celular');
    console.log('   3. Veja o lead sendo criado no CRM');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('⏳ Aguardando mensagens...');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ ERRO FATAL AO INICIAR SERVIÇO');
    console.error('═══════════════════════════════════════════════════════');
    console.error(error);
    console.error('');
    console.error('💡 POSSÍVEIS SOLUÇÕES:');
    console.error('   1. Verifique se todas as dependências estão instaladas:');
    console.error('      npm install whatsapp-web.js qrcode-terminal');
    console.error('');
    console.error('   2. Remova a sessão antiga e tente novamente:');
    console.error('      rm -rf whatsapp-session/');
    console.error('      npm run start:whatsapp');
    console.error('');
    console.error('   3. Verifique as variáveis de ambiente em .env.local');
    console.error('');
    console.error('═══════════════════════════════════════════════════════');
    console.error('');
    process.exit(1);
  }
}

async function shutdown(whatsappService: any) {
  console.log('');
  console.log('═══════════════════════════════════════════════════════');
  console.log('🛑 INICIANDO SHUTDOWN GRACIOSO');
  console.log('═══════════════════════════════════════════════════════');
  
  try {
    await whatsappService.stop();
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ SHUTDOWN COMPLETADO COM SUCESSO');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    console.log('💾 Sessão preservada');
    console.log('📊 Dados salvos');
    console.log('👋 Até logo!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════');
    console.log('');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante shutdown:', error);
    process.exit(1);
  }
}

// Iniciar
main().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});
