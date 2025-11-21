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

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const notificationService = new AppointmentNotificationService();

    // Envia lembretes 24h antes
    const remindersResult = await notificationService.sendReminders24hBefore();

    // Envia mensagens de aniversário
    const birthdaysResult = await notificationService.sendBirthdayMessages();

    return NextResponse.json({
      success: true,
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
