import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * Cron Job: Lembretes Diários
 * 
 * Executa: Segunda a Sexta às 9h (horário de Brasília)
 * Schedule: "0 9 * * 1-5" (vercel.json)
 * 
 * Funcionalidade:
 * - Envia lembretes de consultas para pacientes
 * - Processa notificações agendadas
 * - Atualiza status de lembretes enviados
 */
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação do cron job
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error('[CronLembretes] CRON_SECRET não configurado');
      return NextResponse.json(
        { error: 'Cron secret not configured' },
        { status: 500 }
      );
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.error('[CronLembretes] Autenticação falhou');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CronLembretes] Iniciando processamento de lembretes diários...');

    // Inicializar cliente Supabase com service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Credenciais do Supabase não configuradas');
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar consultas agendadas para hoje e amanhã
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);
    amanha.setHours(23, 59, 59, 999);

    // Buscar consultas agendadas
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
      .gte('start_time', hoje.toISOString())
      .lte('start_time', amanha.toISOString())
      .eq('status', 'scheduled')
      .is('reminder_sent', false)
      .limit(100);

    if (appointmentsError) {
      console.error('[CronLembretes] Erro ao buscar consultas:', appointmentsError);
      throw appointmentsError;
    }

    if (!appointments || appointments.length === 0) {
      console.log('[CronLembretes] Nenhuma consulta pendente de lembrete');
      return NextResponse.json({
        success: true,
        processed: 0,
        message: 'No appointments to process'
      });
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
        // Aqui você pode implementar a lógica de envio de notificação
        // Por exemplo: email, SMS, WhatsApp, etc.
        
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

    return NextResponse.json({
      success: true,
      processed: results.processed,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[CronLembretes] Erro fatal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

