// src/lib/utils/whatsapp_scheduler.ts
import { createClient } from '@supabase/supabase-js';
import { sendWhatsAppTemplateMessage } from '../services/whatsapp_client';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  patient_id: string;
  start_time: string;
  patients: {
    full_name: string;
    phone: string;
  } | null;
}

/**
 * Busca por agendamentos que ocorrerão em 24 horas e envia um lembrete de confirmação via WhatsApp.
 * Esta função é projetada para ser executada por um cron job (ex: Inngest).
 */
export async function sendDailyAppointmentReminders() {
  console.log('[WhatsAppScheduler] Iniciando o envio de lembretes diários...');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Credenciais do Supabase não configuradas');
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  // Busca agendamentos para as próximas 24-48 horas que ainda não foram confirmados.
  const { data: appointments, error } = await supabase
    .from('appointments')
    .select(`
      id,
      patient_id,
      start_time,
      patients (
        full_name,
        phone
      )
    `)
    .gte('start_time', tomorrow.toISOString())
    .lt('start_time', dayAfterTomorrow.toISOString())
    .eq('status', 'Agendado'); // Apenas agendamentos que não foram confirmados/cancelados

  if (error) {
    console.error('[WhatsAppScheduler] Erro ao buscar agendamentos:', error.message);
    throw new Error('Erro ao buscar agendamentos.');
  }

  if (!appointments || appointments.length === 0) {
    console.log('[WhatsAppScheduler] Nenhum agendamento para notificar hoje.');
    return { success: true, message: 'Nenhum agendamento para notificar.' };
  }

  let sentCount = 0;
  for (const appointment of appointments) {
    // Acessa o paciente. A relação é 1:1, então esperamos um objeto.
    // Tratamos como se pudesse ser um array para segurança de tipo.
    const patient = Array.isArray(appointment.patients) ? appointment.patients[0] : appointment.patients;
    if (patient && patient.phone && patient.full_name) {
      const result = await sendWhatsAppTemplateMessage(
        patient.phone,
        'lembrete_agendamento_24h', // Nome do template no WhatsApp
        {
          patient_name: patient.full_name,
          appointment_time: format(new Date(appointment.start_time), "HH:mm 'de' dd/MM/yyyy"),
          confirmation_link: `${process.env.NEXT_PUBLIC_BASE_URL}/confirm/${appointment.id}?status=confirmado`,
          cancellation_link: `${process.env.NEXT_PUBLIC_BASE_URL}/confirm/${appointment.id}?status=cancelado`,
        }
      );

      if (result.success) {
        sentCount++;
        // Opcional: Atualizar o status do agendamento para 'Lembrete Enviado'
        await supabase
          .from('appointments')
          .update({ status: 'Lembrete Enviado' })
          .eq('id', appointment.id);
      }
    }
  }

  console.log(`[WhatsAppScheduler] ${sentCount} de ${appointments.length} lembretes enviados com sucesso.`);
  return { success: true, message: `${sentCount} lembretes enviados.` };
}
