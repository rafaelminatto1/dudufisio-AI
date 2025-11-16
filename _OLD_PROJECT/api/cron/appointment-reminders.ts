// ==================================================
// VERCEL CRON JOB: appointment-reminders
// ==================================================
// Executa a cada hora e envia lembretes de consultas
// - 24h antes: Lembrete inicial
// - 2h antes: Lembrete final
// ==================================================
// Configurado em vercel.json com schedule: "0 * * * *"
// ==================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from '../_lib/logger';
import { getMetaWhatsAppService } from '../../services/whatsapp/MetaWhatsAppService';

// Tipos
export interface Appointment {
  id: string;
  patient_id: string;
  therapist_id: string;
  start_time: string;
  duration: number;
  appointment_type: string;
  status: string;
  reminder_sent_7d?: string | null;
  reminder_sent_24h?: string | null;
  reminder_sent_2h?: string | null;
  whatsapp_conversation_id?: string | null;
  confirmed?: boolean | null;
}

export type ReminderType = '7d' | '24h' | '2h';

interface CronResults {
  processed_7d: number;
  processed_24h: number;
  processed_2h: number;
  sent_notifications: number;
  errors: string[];
}

// User interface removida (não utilizada)

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Verificar autenticação do cron job
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !supabaseServiceKey) {
      return res.status(500).json({ error: 'Missing Supabase configuration' });
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const whatsappService = getMetaWhatsAppService();

    // Buscar consultas nas janelas configuradas
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const in8Days = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000);
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);
    const in2Hours = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    const in3Hours = new Date(now.getTime() + 3 * 60 * 60 * 1000);

    const { data: appointments7d, error: error7d } = await supabase
      .from('appointments')
      .select(
        'id, patient_id, therapist_id, start_time, status, confirmed, reminder_sent_7d, reminder_sent_24h, reminder_sent_2h, whatsapp_conversation_id'
      )
      .gte('start_time', in7Days.toISOString())
      .lt('start_time', in8Days.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .is('reminder_sent_7d', null)
      .order('start_time');

    const { data: appointments24h, error: error24h } = await supabase
      .from('appointments')
      .select(
        'id, patient_id, therapist_id, start_time, status, confirmed, reminder_sent_7d, reminder_sent_24h, reminder_sent_2h, whatsapp_conversation_id'
      )
      .gte('start_time', in24Hours.toISOString())
      .lt('start_time', in25Hours.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .is('reminder_sent_24h', null)
      .order('start_time');

    const { data: appointments2h, error: error2h } = await supabase
      .from('appointments')
      .select(
        'id, patient_id, therapist_id, start_time, status, confirmed, reminder_sent_7d, reminder_sent_24h, reminder_sent_2h, whatsapp_conversation_id'
      )
      .gte('start_time', in2Hours.toISOString())
      .lt('start_time', in3Hours.toISOString())
      .in('status', ['scheduled', 'confirmed'])
      .is('reminder_sent_2h', null)
      .order('start_time');

    if (error7d || error24h || error2h) {
      throw new Error(
        error7d?.message || error24h?.message || error2h?.message || 'Unknown Supabase error'
      );
    }

    const results: CronResults = {
      processed_7d: 0,
      processed_24h: 0,
      processed_2h: 0,
      sent_notifications: 0,
      errors: [],
    };

    await processReminderBatch(
      supabase,
      whatsappService,
      (appointments7d as Appointment[]) ?? [],
      '7d',
      results
    );

    await processReminderBatch(
      supabase,
      whatsappService,
      (appointments24h as Appointment[]) ?? [],
      '24h',
      results
    );

    await processReminderBatch(
      supabase,
      whatsappService,
      (appointments2h as Appointment[]) ?? [],
      '2h',
      results
    );

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });
  } catch (error: unknown) {
    logger.error('Cron job error:', { data: error as Error });
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

async function processReminderBatch(
  supabase: SupabaseClient,
  whatsappService: ReturnType<typeof getMetaWhatsAppService>,
  appointments: Appointment[],
  reminderType: ReminderType,
  results: CronResults
) {
  if (!appointments || appointments.length === 0) {
    return;
  }

  const resultKey =
    reminderType === '7d'
      ? 'processed_7d'
      : reminderType === '24h'
      ? 'processed_24h'
      : 'processed_2h';

  for (const appointment of appointments) {
    try {
      const messageId = await sendReminderForAppointment(
        supabase,
        whatsappService,
        appointment,
        reminderType
      );

      if (messageId) {
        (results as Record<string, number>)[resultKey]++;
        results.sent_notifications++;
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      results.errors.push(`${reminderType} reminder failed for ${appointment.id}: ${message}`);
    }
  }
}

export async function sendReminderForAppointment(
  supabase: SupabaseClient,
  whatsappService: ReturnType<typeof getMetaWhatsAppService>,
  appointment: Appointment,
  reminderType: ReminderType,
  options: { force?: boolean } = {}
): Promise<string | null> {
  const { force = false } = options;
  const reminderColumn =
    reminderType === '7d'
      ? 'reminder_sent_7d'
      : reminderType === '24h'
      ? 'reminder_sent_24h'
      : 'reminder_sent_2h';

  if (!force && (appointment as Record<string, unknown>)[reminderColumn]) {
    return null;
  }

  if (!force && appointment.confirmed && reminderType !== '2h') {
    return null;
  }

  const patient = await loadPatientContext(supabase, appointment.patient_id);
  if (!patient) {
    throw new Error(`Patient not found: ${appointment.patient_id}`);
  }

  if (!patient.phone) {
    throw new Error(`Patient ${patient.id} has no phone configured`);
  }

  const notificationType =
    reminderType === '7d'
      ? 'appointment_reminder_7d'
      : reminderType === '24h'
      ? 'appointment_reminder_24h'
      : 'appointment_reminder_2h';

  const preference = patient.notificationPreferences?.[notificationType] as boolean | undefined;

  if (preference === false) {
    return null;
  }

  const therapistName = await loadTherapistName(supabase, appointment.therapist_id);

  const appointmentDate = new Date(appointment.start_time);
  const dateStr = formatDatePt(appointmentDate);
  const timeStr = formatTimePt(appointmentDate);

  const messageId = await whatsappService.sendAppointmentReminder(
    patient.phone,
    {
      patientName: patient.name,
      date: dateStr,
      time: timeStr,
      therapistName,
      clinicName: patient.clinicName,
      clinicAddress: patient.clinicAddress,
      reminderType,
    },
    patient.clinicId ?? undefined,
    {
      category: 'reminder',
      appointmentId: appointment.id,
      patientId: patient.id,
      clinicId: patient.clinicId,
      metadata: {
        reminder_type: reminderType,
      },
    }
  );

  const timestamp = new Date().toISOString();
  const updatePayload: Record<string, unknown> = {
    [reminderColumn]: timestamp,
    reminder_sent: true,
    reminder_sent_at: timestamp,
  };

  if (!appointment.whatsapp_conversation_id && messageId) {
    updatePayload.whatsapp_conversation_id = messageId;
  }

  await supabase.from('appointments').update(updatePayload).eq('id', appointment.id);

  return messageId;
}

interface PatientContext {
  id: string;
  name: string;
  phone: string | null;
  notificationPreferences?: Record<string, unknown>;
  clinicId?: string | null;
  clinicName?: string;
  clinicAddress?: string;
}

const patientCache = new Map<string, PatientContext>();

async function loadPatientContext(
  supabase: SupabaseClient,
  patientId: string
): Promise<PatientContext | null> {
  if (patientCache.has(patientId)) {
    return patientCache.get(patientId) ?? null;
  }

  const { data: patientRow, error } = await supabase
    .from('patients')
    .select('id, full_name, phone, user_id')
    .eq('id', patientId)
    .single();

  if (error || !patientRow) {
    return null;
  }

  let name = patientRow.full_name ?? 'Paciente';
  let notificationPreferences: Record<string, unknown> | undefined;
  const clinicId: string | null = process.env.DEFAULT_CLINIC_ID ?? 'default-clinic';
  const clinicName = process.env.DEFAULT_CLINIC_NAME ?? 'Clínica DuduFisio';
  const clinicAddress = process.env.DEFAULT_CLINIC_ADDRESS ?? 'Clínica DuduFisio';

  if (patientRow.user_id) {
    const { data: userRow } = await supabase
      .from('users')
      .select('full_name, notification_preferences')
      .eq('id', patientRow.user_id)
      .single();

    if (userRow?.full_name) {
      name = userRow.full_name;
    }

    notificationPreferences = userRow?.notification_preferences as
      | Record<string, unknown>
      | undefined;

  }

  const context: PatientContext = {
    id: patientRow.id,
    name,
    phone: patientRow.phone,
    notificationPreferences,
    clinicId,
    clinicName,
    clinicAddress,
  };

  patientCache.set(patientId, context);
  return context;
}

const therapistNameCache = new Map<string, string>();

async function loadTherapistName(
  supabase: SupabaseClient,
  therapistId: string
): Promise<string> {
  if (therapistNameCache.has(therapistId)) {
    return therapistNameCache.get(therapistId)!;
  }

  const { data: therapistRow } = await supabase
    .from('therapists')
    .select('user_id')
    .eq('id', therapistId)
    .single();

  if (therapistRow?.user_id) {
    const { data: userRow } = await supabase
      .from('users')
      .select('full_name')
      .eq('id', therapistRow.user_id)
      .single();

    if (userRow?.full_name) {
      therapistNameCache.set(therapistId, userRow.full_name);
      return userRow.full_name;
    }
  }

  therapistNameCache.set(therapistId, 'Profissional da equipe');
  return 'Profissional da equipe';
}

function formatDatePt(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimePt(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
