'use server';

import { createServerComponentClient } from '~/lib/supabase/server';

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
        start_time
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
      const appointments = patient.appointments || [];
      const lastAppointment = appointments.length > 0
        ? new Date(Math.max(...appointments.map((a: any) => new Date(a.start_time).getTime())))
        : null;

      const daysInactive = lastAppointment
        ? Math.floor((Date.now() - lastAppointment.getTime()) / (1000 * 60 * 60 * 24))
        : Infinity;

      return {
        id: patient.id,
        full_name: patient.full_name,
        email: patient.email,
        phone: patient.phone,
        last_appointment_date: lastAppointment?.toISOString() || null,
        days_inactive: daysInactive,
        total_sessions: appointments.length,
      };
    })
    .filter((p: any) => p.days_inactive >= daysThreshold)
    .sort((a: any, b: any) => b.days_inactive - a.days_inactive);

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
  await supabase
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

