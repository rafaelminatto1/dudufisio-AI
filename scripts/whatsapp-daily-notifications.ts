/**
 * WhatsApp Daily Notifications Cron Job
 * Script para executar notificações diárias
 * DuduFisio-AI
 * 
 * Execute diariamente às 9h
 */

import { getWhatsAppNotificationService } from '../services/whatsapp/WhatsAppNotificationService';
import { supabase } from '../lib/supabase';

async function runDailyNotifications() {
  console.log('🚀 Iniciando envio de notificações diárias WhatsApp...');
  console.log(`📅 Data: ${new Date().toISOString()}`);

  try {
    // Buscar todas as clínicas ativas
    const { data: clinics, error } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('is_active', true);

    if (error) throw error;

    if (!clinics || clinics.length === 0) {
      console.log('⚠️  Nenhuma clínica ativa encontrada');
      return;
    }

    console.log(`📊 Processando ${clinics.length} clínica(s)...`);

    const notificationService = getWhatsAppNotificationService();

    for (const clinic of clinics) {
      console.log(`\n🏥 Processando clínica: ${clinic.name}`);
      
      try {
        await notificationService.runDailyNotifications(clinic.id);
        console.log(`✅ Notificações enviadas para ${clinic.name}`);
      } catch (error) {
        console.error(`❌ Erro ao processar ${clinic.name}:`, error);
      }
    }

    console.log('\n🎉 Processo de notificações diárias concluído!');
  } catch (error) {
    console.error('❌ Erro fatal no processo de notificações:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runDailyNotifications()
    .then(() => {
      console.log('✅ Script finalizado com sucesso');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Script finalizado com erro:', error);
      process.exit(1);
    });
}

export { runDailyNotifications };

