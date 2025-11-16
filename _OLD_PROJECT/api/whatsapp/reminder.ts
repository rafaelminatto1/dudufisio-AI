import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getMetaWhatsAppService } from '../../services/whatsapp/MetaWhatsAppService';
import { getSupabaseAdminClient } from '../../lib/supabaseAdminClient';
import { sendReminderForAppointment, type Appointment, type ReminderType } from '../cron/appointment-reminders';

const ALLOWED_ROLES = new Set(['admin', 'therapist', 'coordinator']);

interface ReminderRequestBody {
  appointmentId?: string;
  reminderType?: ReminderType;
  force?: boolean;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient();
    if (!supabaseAdmin) {
      return res.status(500).json({ error: 'Supabase client não configurado' });
    }

    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de acesso obrigatório' });
    }

    const accessToken = authHeader.split(' ')[1] ?? '';
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(accessToken);

    if (authError || !authData?.user) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const user = authData.user;
    const role = (user.user_metadata?.role || user.app_metadata?.role || '').toLowerCase();

    if (!ALLOWED_ROLES.has(role)) {
      return res.status(403).json({ error: 'Permissão insuficiente' });
    }

    let parsedBody: ReminderRequestBody;
    try {
      parsedBody =
        typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
    } catch {
      return res.status(400).json({ error: 'JSON inválido' });
    }

    const appointmentId = parsedBody.appointmentId;
    const reminderType = (parsedBody.reminderType ?? '24h') as ReminderType;
    const force = parsedBody.force ?? true;

    if (!appointmentId) {
      return res.status(400).json({ error: 'appointmentId é obrigatório' });
    }

    const { data: appointment, error: appointmentError } = await supabaseAdmin
      .from('appointments')
      .select(
        'id, patient_id, therapist_id, start_time, status, confirmed, reminder_sent_7d, reminder_sent_24h, reminder_sent_2h, whatsapp_conversation_id'
      )
      .eq('id', appointmentId)
      .maybeSingle();

    if (appointmentError) {
      return res.status(500).json({ error: appointmentError.message });
    }

    if (!appointment) {
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }

    const whatsappService = getMetaWhatsAppService();

    const messageId = await sendReminderForAppointment(
      supabaseAdmin,
      whatsappService,
      appointment as Appointment,
      reminderType,
      { force }
    );

    return res.status(200).json({ success: true, messageId });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return res.status(500).json({ error: message });
  }
}
