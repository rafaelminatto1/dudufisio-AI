/**
 * Vercel Cron Job: Enviar Lembretes
 * Roda às 8h e 20h todos os dias
 * Envia lembretes para appointments nas próximas 24h
 */

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    // Verificar auth secret do Vercel Cron
    const authHeader = req.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return new Response('Missing Supabase configuration', { status: 500 });
    }

    // Buscar appointments nas próximas 24h
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await fetch(
      `${supabaseUrl}/rest/v1/appointments?start_time=gte.${now.toISOString()}&start_time=lt.${tomorrow.toISOString()}&status=eq.Agendado&select=*,patient:patients(*),calendar_link:calendar_links(*),therapist:users(*)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch appointments: ${response.statusText}`);
    }

    const appointments = await response.json();

    let sentCount = 0;

    // Enviar lembrete para cada appointment
    for (const apt of appointments || []) {
      if (apt.calendar_link && apt.patient?.phone) {
        try {
          await sendReminderWhatsApp(apt);
          sentCount++;
        } catch (error) {
          console.error(`Failed to send reminder for appointment ${apt.id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: sentCount,
        total: appointments?.length || 0,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error: any) {
    console.error('Error in send-reminders cron:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function sendReminderWhatsApp(appointment: any) {
  const startTime = new Date(appointment.start_time);
  const formattedTime = formatTime(startTime);
  const formattedDate = formatDate(startTime);
  
  const message = `🔔 *Lembrete: Consulta Amanhã*

Olá ${appointment.patient.name},

Sua consulta é amanhã (${formattedDate}) às ${formattedTime}.

👨‍⚕️ Profissional: ${appointment.therapist?.full_name || 'Fisioterapeuta'}
📍 Local: ${appointment.location || 'Clínica DuduFisio'}

📅 *Já adicionou ao seu calendário?*
${appointment.calendar_link.google_link}

_Se precisar reagendar ou cancelar, entre em contato conosco._

Clínica DuduFisio`;

  // Aqui você integraria com o sistema de WhatsApp existente
  // Por enquanto, apenas log
  console.log(`[WhatsApp Reminder] To: ${appointment.patient.phone}`);
  console.log(`[WhatsApp Reminder] Message: ${message}`);
  
  // TODO: Integrar com sistema de WhatsApp real
  // await sendWhatsAppMessage(appointment.patient.phone, message);
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });
}

