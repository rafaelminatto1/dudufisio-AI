// src/lib/utils/reminders.ts
import { createClient } from '@supabase/supabase-js';

interface ReminderProcessingResult {
  success: boolean;
  processed?: number;
  sent?: number;
  failed?: number;
  errors?: string[];
  timestamp: string;
  message?: string;
  error?: string;
}

export async function processDailyReminders(): Promise<ReminderProcessingResult> {
  try {
    console.log('[CronLembretes] Iniciando processamento de lembretes diários...');

    // Inicializar cliente Supabase com service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    const twentyFourHoursFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const twentyFourHoursAndFifteenMinutesFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 15 * 60 * 1000); // Adiciona um buffer de 15 minutos

    // Buscar consultas agendadas para aproximadamente 24 horas a partir de agora
    const { data: appointments, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        id,
        start_time,
        status,
        patient_id,
        therapist_id,
        reminder_sent,
        patients:patient_id (
          id,
          full_name,
          email,
          phone
        ),
        therapists:therapist_id (
          id,
          user_id,
          users:user_id (
            email
          )
        )
      `)
      .gte('start_time', twentyFourHoursFromNow.toISOString())
      .lte('start_time', twentyFourHoursAndFifteenMinutesFromNow.toISOString()) // Busca em uma janela de 15 minutos
      .eq('status', 'scheduled')
      .is('reminder_sent', false)
      .limit(100);

    if (appointmentsError) {
      console.error('[CronLembretes] Erro ao buscar consultas:', appointmentsError);
      throw appointmentsError;
    }

    if (!appointments || appointments.length === 0) {
      console.log('[CronLembretes] Nenhuma consulta pendente de lembrete');
      return {
        success: true,
        processed: 0,
        message: 'No appointments to process',
        timestamp: new Date().toISOString()
      };
    }

    console.log(`[CronLembretes] Encontradas ${appointments.length} consultas para processar`);

    // Processar cada consulta
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const appointment of appointments) {
      try {
        // Lógica de envio de notificação via Evolution API (WhatsApp)
        console.log(`[CronLembretes] Simulando envio de lembrete para paciente ${appointment.patients?.full_name} (${appointment.patients?.phone}) sobre consulta ${appointment.id} em ${appointment.start_time}`);
        // TODO: Implementar a chamada real à Evolution API aqui
        // Exemplo: await EvolutionAPIService.sendMessage(appointment.patients?.phone, "Seu lembrete de consulta...");
        
        // Por enquanto, apenas marcar como enviado
        const { error: updateError } = await supabase
          .from('appointments')
          .update({ reminder_sent: true, reminder_sent_at: new Date().toISOString() })
          .eq('id', appointment.id);

        if (updateError) {
          throw updateError;
        }

        results.processed++;
        results.sent++;

        console.log(`[CronLembretes] Lembrete processado para consulta ${appointment.id}`);
      } catch (error) {
        results.failed++;
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.errors.push(`Appointment ${appointment.id}: ${errorMessage}`);
        console.error(`[CronLembretes] Erro ao processar consulta ${appointment.id}:`, error);
      }
    }

    console.log(`[CronLembretes] Processamento concluído: ${results.sent} enviados, ${results.failed} falharam`);

    return {
      success: true,
      processed: results.processed,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('[CronLembretes] Erro fatal:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    };
  }
}
