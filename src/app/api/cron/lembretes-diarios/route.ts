import { NextResponse } from 'next/server';
import { AppointmentNotificationService } from '~/lib/services/communications/appointmentNotificationService';

/**
 * Cron job para enviar lembretes diários
 * Executar via Vercel Cron ou similar
 */
export async function GET(request: Request) {
  // Verifica se é uma requisição autorizada (ex: header secreto)
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  const testMode = process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'development';

  // Em modo de teste/desenvolvimento, não requer CRON_SECRET
  if (!testMode) {
    if (!cronSecret) {
      return NextResponse.json({ error: 'Cron secret not configured' }, { status: 500 });
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else {
    console.log('[CronReminders] Executando em modo de teste/desenvolvimento');
  }

  try {
    const notificationService = new AppointmentNotificationService();

    // Envia lembretes 24h antes
    const remindersResult = await notificationService.sendReminders24hBefore();

    // Envia mensagens de aniversário
    const birthdaysResult = await notificationService.sendBirthdayMessages();

    return NextResponse.json({
      success: true,
      test_mode: testMode,
      reminders: {
        sent: remindersResult.sent,
        error: remindersResult.error,
      },
      birthdays: {
        sent: birthdaysResult.sent,
        error: birthdaysResult.error,
      },
    });
  } catch (error) {
    console.error('Erro no cron job:', error);
    return NextResponse.json(
      { error: 'Erro ao processar notificações' },
      { status: 500 }
    );
  }
}
