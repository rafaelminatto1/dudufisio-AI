// ==================================================
// VERCEL CRON JOB: daily-summary
// ==================================================
// Executa diariamente às 8h e envia resumo para terapeutas
// - Consultas do dia
// - Novos pacientes
// - Tarefas pendentes
// ==================================================
// Configurado em vercel.json com schedule: "0 8 * * *"
// ==================================================

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { logger } from '../../lib/logger';

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

    // Data de hoje
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar todos os terapeutas ativos
    const { data: therapists, error: therapistsError } = await supabase
      .from('therapists')
      .select('*')
      .eq('is_active', true);

    if (therapistsError) {
      throw new Error(therapistsError.message);
    }

    const results = {
      processed_therapists: 0,
      sent_emails: 0,
      errors: [] as string[],
    };

    // Processar cada terapeuta
    for (const therapist of therapists || []) {
      try {
        // Buscar usuário do terapeuta
        const { data: user, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('therapist_id', therapist.id)
          .single();

        if (userError || !user) {
          results.errors.push(`User not found for therapist ${therapist.id}`);
          continue;
        }

        // Verificar preferências
        const prefs = (user.notification_preferences as Record<string, unknown>) || {};
        if (prefs['system'] === false) {
          continue; // Não quer receber notificações do sistema
        }

        // Buscar consultas do dia
        const { data: appointments, error: appointmentsError } = await supabase
          .from('appointments')
          .select('*, patients:patient_id(*)')
          .eq('therapist_id', therapist.id)
          .gte('start_time', today.toISOString())
          .lt('start_time', tomorrow.toISOString())
          .order('start_time');

        if (appointmentsError) {
          throw new Error(appointmentsError.message);
        }

        // Buscar pacientes novos (cadastrados nos últimos 7 dias)
        const lastWeek = new Date(today);
        lastWeek.setDate(lastWeek.getDate() - 7);

        const { data: newPatients, error: newPatientsError } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'patient')
          .gte('created_at', lastWeek.toISOString())
          .order('created_at', { ascending: false });

        if (newPatientsError) {
          throw new Error(newPatientsError.message);
        }

        // Montar resumo
        const summary = {
          therapist_name: therapist.name,
          date: today.toLocaleDateString('pt-BR'),
          appointments_count: appointments?.length || 0,
          appointments: appointments || [],
          new_patients_count: newPatients?.length || 0,
          new_patients: newPatients?.slice(0, 5) || [], // Top 5
        };

        // Criar notificação
        const title = `Resumo Diário - ${summary.date}`;
        const message = `Bom dia! Você tem ${summary.appointments_count} consulta(s) hoje.`;

        const { data: notificationId, error: notifError } = await supabase
          .rpc('create_notification', {
            p_user_id: user.id,
            p_type: 'system_announcement',
            p_title: title,
            p_message: message,
            p_data: summary,
            p_scheduled_for: new Date().toISOString(),
            p_channels: ['email', 'in_app'],
          });

        if (notifError) {
          throw new Error(`Failed to create notification: ${notifError.message}`);
        }

        if (!notificationId) {
          continue; // Usuário optou por não receber
        }

        // Enviar email com resumo detalhado
        if (user.email) {
          const emailHtml = buildSummaryEmail(summary);

          try {
            await callEdgeFunction(supabase, 'send-email', {
              to: user.email,
              subject: title,
              html: emailHtml,
              text: message,
              notification_id: notificationId,
            });

            results.sent_emails++;
          } catch (emailError: unknown) {
            const message = emailError instanceof Error ? emailError.message : String(emailError);
            results.errors.push(`Email failed for ${user.email}: ${message}`);
          }
        }

        results.processed_therapists++;
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        results.errors.push(`Therapist ${therapist.id}: ${message}`);
      }
    }

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

// Helper para montar email de resumo
type Appointment = {
  start_time: string;
  appointment_type: string;
  patients?: {
    full_name: string;
  };
};

type Patient = {
  created_at: string;
  full_name: string;
};

type Summary = {
  therapist_name: string;
  date: string;
  appointments_count: number;
  appointments: Appointment[];
  new_patients_count: number;
  new_patients: Patient[];
};

function buildSummaryEmail(summary: Summary): string {
  let appointmentsList = '';
  if (summary.appointments_count > 0) {
    appointmentsList = '<ul>';
    for (const apt of summary.appointments) {
      const time = new Date(apt.start_time).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit'
      });
      const patientName = apt.patients?.full_name || 'Paciente';
      appointmentsList += `<li><strong>${time}</strong> - ${patientName} (${apt.appointment_type})</li>`;
    }
    appointmentsList += '</ul>';
  } else {
    appointmentsList = '<p><em>Nenhuma consulta agendada para hoje.</em></p>';
  }

  let newPatientsList = '';
  if (summary.new_patients_count > 0) {
    newPatientsList = '<ul>';
    for (const patient of summary.new_patients) {
      const date = new Date(patient.created_at).toLocaleDateString('pt-BR');
      newPatientsList += `<li>${patient.full_name} - Cadastrado em ${date}</li>`;
    }
    newPatientsList += '</ul>';
    if (summary.new_patients_count > 5) {
      newPatientsList += `<p><em>... e mais ${summary.new_patients_count - 5} paciente(s)</em></p>`;
    }
  } else {
    newPatientsList = '<p><em>Nenhum paciente novo nos últimos 7 dias.</em></p>';
  }

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    h2 {
      color: #1e40af;
      margin-top: 30px;
    }
    .summary-box {
      background-color: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    li:last-child {
      border-bottom: none;
    }
    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
      font-size: 0.9em;
      color: #6b7280;
    }
  </style>
</head>
<body>
  <h1>Resumo Diário - ${summary.date}</h1>

  <div class="summary-box">
    <p><strong>Olá, ${summary.therapist_name}!</strong></p>
    <p>Aqui está o resumo do seu dia:</p>
    <ul>
      <li><strong>${summary.appointments_count}</strong> consulta(s) agendada(s)</li>
      <li><strong>${summary.new_patients_count}</strong> paciente(s) novo(s) na última semana</li>
    </ul>
  </div>

  <h2>📅 Consultas de Hoje</h2>
  ${appointmentsList}

  <h2>✨ Pacientes Novos</h2>
  ${newPatientsList}

  <div class="footer">
    <p><strong>DuduFisio AI</strong></p>
    <p>Sistema de Gestão para Clínicas de Fisioterapia</p>
    <p><em>Esta é uma mensagem automática. Para alterar suas preferências de notificação, acesse suas configurações no sistema.</em></p>
  </div>
</body>
</html>
  `;
}

// Helper para chamar Edge Functions
async function callEdgeFunction(
  supabase: SupabaseClient,
  functionName: string,
  payload: Record<string, unknown>
) {
  const { data, error } = await supabase.functions.invoke(functionName, {
    body: payload,
  });

  if (error) {
    throw error;
  }

  return data;
}
