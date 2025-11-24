'use server';

import { createServerComponentClient } from '~/lib/supabase/server';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '~/types/database.types';

interface InactivePatient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  last_appointment_date: string | null;
  days_inactive: number;
  total_sessions: number;
}

/**
 * Busca pacientes inativos
 */
export async function getInactivePatients(daysThreshold = 30) {
  const supabase = await createServerComponentClient();

  const thresholdDate = new Date();
  thresholdDate.setDate(thresholdDate.getDate() - daysThreshold);

  // Busca pacientes sem agendamentos recentes
  const { data: patients, error } = await supabase
    .from('patients')
    .select(`
      *,
      appointments:appointments!patient_id (
        start_time,
        created_at
      )
    `)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    return { error: error.message, data: null };
  }

  // Filtra pacientes inativos
  const inactive = (patients || [])
    .map((patient: any) => {
      const appointments = (patient.appointments || []).filter((a: any) => !a.error);
      const lastAppointment = appointments.length > 0
        ? new Date(Math.max(...appointments.map((a: any) => {
            const dateStr = a.start_time || a.created_at;
            return dateStr ? new Date(dateStr).getTime() : 0;
          })))
        : null;

      const daysInactive = lastAppointment
        ? Math.floor((Date.now() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      return {
        id: patient.id,
        full_name: (patient as any).full_name || 'Paciente',
        email: patient.email,
        phone: patient.phone,
        last_appointment_date: lastAppointment?.toISOString() || null,
        days_inactive: daysInactive,
        total_sessions: appointments.length,
      };
    })
    .filter((p: any) => p.days_inactive >= daysThreshold)
    .sort((a: InactivePatient, b: InactivePatient) => b.days_inactive - a.days_inactive);

  return { data: inactive, error: null };
}

/**
 * Envia campanha de reengajamento
 */
export async function sendReengagementCampaign(patientId: string) {
  const supabase = await createServerComponentClient();

  // Busca dados do paciente
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('*')
    .eq('id', patientId)
    .single();

  if (patientError || !patient) {
    return { error: 'Paciente não encontrado' };
  }

  // TODO: Enviar mensagem de reengajamento via WhatsApp/Email
  // const message = `Olá ${patient.full_name}! Sentimos sua falta. Que tal agendar uma consulta?`;
  // await sendWhatsApp(patient.phone, message);

  // Registra envio da campanha
  await (supabase as any)
    .from('marketing_campaigns')
    .insert({
      patient_id: patientId,
      campaign_type: 'reengagement',
      sent_at: new Date().toISOString(),
    });

  return { error: null };
}

/**
 * Cria pesquisa NPS
 */
export async function createNPSSurvey(patientId: string) {
  const supabase = await createServerComponentClient();

  const { data: survey, error } = await supabase
    .from('nps_surveys')
    .insert({
      patient_id: patientId,
      status: 'pending',
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    return { error: error.message, data: null };
  }

  // TODO: Enviar link da pesquisa via WhatsApp/Email

  return { data: survey, error: null };
}