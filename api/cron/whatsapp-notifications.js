/**
 * WhatsApp Notifications Cron Job
 * Vercel Cron Function
 * DuduFisio-AI
 */

export default async function handler(req, res) {
  // Verificar authorization (Vercel Cron envia automaticamente)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    console.error('❌ Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    console.log('🚀 Iniciando cron job de notificações WhatsApp');
    console.log(`📅 Data/Hora: ${new Date().toISOString()}`);

    // Importar serviço dinamicamente
    const { getWhatsAppNotificationService } = require('../../services/whatsapp/WhatsAppNotificationService');
    const { supabase } = require('../../lib/supabase');

    // Buscar todas as clínicas ativas
    const { data: clinics, error: clinicsError } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('is_active', true);

    if (clinicsError) throw clinicsError;

    if (!clinics || clinics.length === 0) {
      console.log('⚠️  Nenhuma clínica ativa encontrada');
      return res.status(200).json({
        success: true,
        message: 'No active clinics found',
        clinicsProcessed: 0,
      });
    }

    console.log(`📊 Processando ${clinics.length} clínica(s)...`);

    const notificationService = getWhatsAppNotificationService();
    const results = [];

    for (const clinic of clinics) {
      console.log(`\n🏥 Processando clínica: ${clinic.name} (${clinic.id})`);
      
      try {
        await notificationService.runDailyNotifications(clinic.id);
        
        results.push({
          clinicId: clinic.id,
          clinicName: clinic.name,
          status: 'success',
        });

        console.log(`✅ Notificações enviadas para ${clinic.name}`);
      } catch (error) {
        console.error(`❌ Erro ao processar ${clinic.name}:`, error);
        
        results.push({
          clinicId: clinic.id,
          clinicName: clinic.name,
          status: 'error',
          error: error.message,
        });
      }
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;

    console.log('\n📊 Resumo da execução:');
    console.log(`✅ Sucesso: ${successCount}`);
    console.log(`❌ Erros: ${errorCount}`);
    console.log(`🏁 Total processado: ${results.length}`);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      clinicsProcessed: results.length,
      successCount,
      errorCount,
      results,
    });

  } catch (error) {
    console.error('❌ Erro fatal no cron job:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

