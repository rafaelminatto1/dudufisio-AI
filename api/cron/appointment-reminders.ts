// ==================================================
// VERCEL CRON JOB: appointment-reminders
// ==================================================
// Executa a cada hora e envia lembretes de consultas
// - 24h antes: Lembrete inicial
// - 2h antes: Lembrete final
// ==================================================
// Configurado em vercel.json com schedule: "0 * * * *"
// ==================================================

import { createClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Tipos
interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  duration: number;
  appointment_type: string;
  status: string;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  notification_preferences: any;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificar autenticação do cron job
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL!;
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Buscar consultas nas próximas 24 horas e próximas 2 horas
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    // Consultas para lembrete de 24h (entre 24h e 25h no futuro)
    const { data: appointments24h, error: error24h } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', in24Hours.toISOString())
      .lt('start_time', in25Hours.toISOString())
      .eq('status', 'scheduled')
      .order('start_time');

    // Consultas para lembrete de 2h (entre 2h e 3h no futuro)
    const { data: appointments2h, error: error2h } = await supabase
      .from('appointments')
      .select('*')
      .gte('start_time', in2Hours.toISOString())
      .lt('start_time', in3Hours.toISOString())
      .eq('status', 'scheduled')
      .order('start_time');

    if (error24h || error2h) {
      throw new Error(error24h?.message || error2h?.message);
    }

    const results = {
      processed_24h: 0,
      processed_2h: 0,
      sent_notifications: 0,
      errors: [] as string[],
    };

    // Processar lembretes de 24h
    if (appointments24h && appointments24h.length > 0) {
      for (const appointment of appointments24h as Appointment[]) {
        try {
          await sendReminder(supabase, appointment, '24h');
          results.processed_24h++;
          results.sent_notifications++;
        } catch (error: any) {
          results.errors.push(`24h reminder failed for ${appointment.id}: ${error.message}`);
        }
      }
    }

    // Processar lembretes de 2h
    if (appointments2h && appointments2h.length > 0) {
      for (const appointment of appointments2h as Appointment[]) {
        try {
          await sendReminder(supabase, appointment, '2h');
          results.processed_2h++;
          results.sent_notifications++;
        } catch (error: any) {
          results.errors.push(`2h reminder failed for ${appointment.id}: ${error.message}`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error: any) {
    console.error('Cron job error:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

// Helper function para enviar lembrete
async function sendReminder(
  supabase: any,
  appointment: Appointment,
  reminderType: '24h' | '2h'
) {
  // Buscar dados do paciente
  const { data: patient, error: patientError } = await supabase
    .from('users')
    .select('*')
    .eq('id', appointment.patient_id)
    .single();

  if (patientError || !patient) {
    throw new Error(`Patient not found: ${appointment.patient_id}`);
  }

  // Buscar dados do terapeuta
  const { data: therapist, error: therapistError } = await supabase
    .from('therapists')
    .select('*')
    .eq('id', appointment.therapist_id)
    .single();

  if (therapistError || !therapist) {
    throw new Error(`Therapist not found: ${appointment.therapist_id}`);
  }

  // Verificar preferências de notificação do paciente
  const prefs = patient.notification_preferences || {};
  const notificationType = reminderType === '24h'
    ? 'appointment_reminder_24h'
    : 'appointment_reminder_2h';

  if (prefs[notificationType] === false) {
    return; // Paciente não quer receber este tipo de notificação
  }

  // Formatar data e hora
  const appointmentDate = new Date(appointment.start_time);
  const dateStr = appointmentDate.toLocaleDateString('pt-BR');
  const timeStr = appointmentDate.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Criar título e mensagem
  const title = reminderType === '24h'
    ? `Lembrete: Consulta amanhã às ${timeStr}`
    : `Lembrete: Consulta em 2 horas (${timeStr})`;

  const message = `Olá ${patient.full_name}! Você tem uma consulta agendada para ${dateStr} às ${timeStr} com ${therapist.name}.`;

  // Determinar canais baseado nas preferências
  const channels: string[] = ['in_app'];
  if (prefs.email !== false && patient.email) channels.push('email');
  if (prefs.sms !== false && patient.phone) channels.push('sms');
  if (prefs.whatsapp === true && patient.phone) channels.push('whatsapp');

  // Criar notificação usando a função do banco
  const { data: notificationId, error: notifError } = await supabase
    .rpc('create_notification', {
      p_user_id: patient.id,
      p_type: notificationType,
      p_title: title,
      p_message: message,
      p_data: {
        appointment_id: appointment.id,
        therapist_name: therapist.name,
        date: dateStr,
        time: timeStr,
        location: therapist.clinic_address || 'Clínica DuduFisio',
      },
      p_scheduled_for: new Date().toISOString(),
      p_channels: channels,
    });

  if (notifError) {
    throw new Error(`Failed to create notification: ${notifError.message}`);
  }

  // Se a função retornou NULL, significa que o usuário optou por não receber
  if (!notificationId) {
    return;
  }

  // Enviar email se necessário
  if (channels.includes('email') && patient.email) {
    const emailHtml = `
      <h1>Lembrete de Consulta</h1>
      <p>Olá ${patient.full_name}!</p>
      <p>Este é um lembrete sobre sua consulta agendada:</p>
      <ul>
        <li><strong>Data:</strong> ${dateStr}</li>
        <li><strong>Hora:</strong> ${timeStr}</li>
        <li><strong>Profissional:</strong> ${therapist.name}</li>
        <li><strong>Local:</strong> ${therapist.clinic_address || 'Clínica DuduFisio'}</li>
      </ul>
      <p>Aguardamos você!</p>
      <p><em>DuduFisio - Sua saúde em movimento</em></p>
    `;

    try {
      await callEdgeFunction(supabase, 'send-email', {
        to: patient.email,
        subject: title,
        html: emailHtml,
        text: message,
        notification_id: notificationId,
      });
    } catch (emailError: any) {
      console.error('Failed to send email:', emailError);
    }
  }

  // Enviar SMS se necessário
  if (channels.includes('sms') && patient.phone) {
    try {
      await callEdgeFunction(supabase, 'send-sms', {
        to: patient.phone,
        message: `${message} DuduFisio`,
        type: 'sms',
        notification_id: notificationId,
      });
    } catch (smsError: any) {
      console.error('Failed to send SMS:', smsError);
    }
  }

  // Enviar WhatsApp se necessário
  if (channels.includes('whatsapp') && patient.phone) {
    try {
      await callEdgeFunction(supabase, 'send-sms', {
        to: patient.phone,
        message: message,
        type: 'whatsapp',
        notification_id: notificationId,
      });
    } catch (whatsappError: any) {
      console.error('Failed to send WhatsApp:', whatsappError);
    }
  }
}

// Helper para chamar Edge Functions
async function callEdgeFunction(supabase: any, functionName: string, payload: any) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}
