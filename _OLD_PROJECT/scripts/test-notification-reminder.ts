#!/usr/bin/env tsx
/**
 * Gera um lembrete de agendamento artificial e executa o job de processamento.
 * Uso:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/test-notification-reminder.ts
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de rodar o script.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function pickAppointment() {
  const { data, error } = await supabase
    .from('appointments')
    .select(
      `id, start_time, patient_id,
       patient:patients(id, name, phone, user_id),
       therapist:therapists(id, name)`
    )
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) {
    throw new Error('Nenhum agendamento encontrado. Cadastre um para testar.');
  }

  if (!data.patient?.user_id) {
    throw new Error('O paciente do agendamento escolhido não possui user_id vinculado.');
  }

  return data;
}

async function insertNotificationSchedule(appointment: any) {
  const scheduledFor = new Date(Date.now() - 60 * 1000).toISOString(); // 1 min atrás para ser processado agora

  const { data, error } = await supabase
    .from('notification_schedules')
    .insert({
      appointment_id: appointment.id,
      user_id: appointment.patient.user_id,
      scheduled_for: scheduledFor,
      notification_type: 'reminder_24h',
      sent: false,
      metadata: {
        patientName: appointment.patient.name ?? 'Paciente Teste',
        therapistName: appointment.therapist?.name ?? 'Fisioterapeuta',
        startTime: appointment.start_time,
      },
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id as string;
}

async function runReminderJob() {
  const { data, error } = await supabase.rpc('invoke_process_appointment_reminders');
  if (error) throw error;
  return data;
}

async function fetchNotificationLogs(scheduleId: string) {
  const { data, error } = await supabase
    .from('notification_logs')
    .select('*')
    .eq('notification_id', scheduleId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

async function main() {
  console.log('🔎 Procurando um agendamento existente...');
  const appointment = await pickAppointment();
  console.log('✅ Agendamento selecionado:', appointment.id);

  console.log('📝 Inserindo notificação agendada fake...');
  const scheduleId = await insertNotificationSchedule(appointment);
  console.log('✅ Notificação agendada criada com ID:', scheduleId);

  console.log('⚙️ Executando o job de lembretes...');
  await runReminderJob();
  console.log('✅ Job executado.');

  console.log('🔍 Buscando logs gerados...');
  const logs = await fetchNotificationLogs(scheduleId);
  if (logs.length === 0) {
    console.warn('Nenhum log encontrado para a notificação. Verifique tokens push/SMS/WhatsApp do paciente.');
  } else {
    console.table(logs);
  }
}

main().catch((err) => {
  console.error('❌ Erro no teste de lembrete:', err);
  process.exit(1);
});

