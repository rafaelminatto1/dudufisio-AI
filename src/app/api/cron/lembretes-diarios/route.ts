import { NextRequest, NextResponse } from 'next/server';
import { processDailyReminders } from '~/lib/utils/reminders';

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

    const result = await processDailyReminders();

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error, timestamp: result.timestamp },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      processed: result.processed,
      sent: result.sent,
      failed: result.failed,
      errors: result.errors,
      timestamp: result.timestamp
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

