/**
 * WhatsApp Notifications Cron Job
 * Vercel Cron Function
 * DuduFisio-AI
 */
const { logger } = require('../../lib/logger');

export default async function handler(req, res) {
  // Verificar authorization (Vercel Cron envia automaticamente)
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    logger.error('❌ Unauthorized cron request');
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    logger.info('🚀 Iniciando cron job de notificações WhatsApp');
    logger.info(`📅 Data/Hora: ${new Date().toISOString()}`);

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
      logger.info('⚠️  Nenhuma clínica ativa encontrada');
      return res.status(200).json({
        success: true,
        message: 'No active clinics found',
        clinicsProcessed: 0,
      });
    }

    logger.info(`📊 Processando ${clinics.length} clínica(s)...`);

    const notificationService = getWhatsAppNotificationService();
    const results = [];

    for (const clinic of clinics) {
      logger.info(`\n🏥 Processando clínica: ${clinic.name} (${clinic.id})`);
      
      try {
        await notificationService.runDailyNotifications(clinic.id);
        
        results.push({
          clinicId: clinic.id,
          clinicName: clinic.name,
          status: 'success',
        });

        logger.info(`✅ Notificações enviadas para ${clinic.name}`);
      } catch (error) {
        logger.error(`❌ Erro ao processar ${clinic.name}:`, { data: error });
        
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

    logger.info('\n📊 Resumo da execução:');
    logger.info(`✅ Sucesso: ${successCount}`);
    logger.info(`❌ Erros: ${errorCount}`);
    logger.info(`🏁 Total processado: ${results.length}`);

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      clinicsProcessed: results.length,
      successCount,
      errorCount,
      results,
    });

  } catch (error) {
    logger.error('❌ Erro fatal no cron job:', { data: error });
    
    return res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
}

