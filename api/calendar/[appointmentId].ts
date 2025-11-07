/**
 * Vercel Edge Function para gerar e servir arquivos .ics
 * Compatível com todos os calendários (Google, Apple, Outlook, Yahoo)
 * 
 * Rota: /api/calendar/[appointmentId].ics
 */

import { generateICS } from '../../lib/calendar/icsGenerator';
import { logger } from '../_lib/logger';

// Edge Runtime = resposta global instantânea
export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  try {
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const appointmentId = pathParts[pathParts.length - 1]?.replace('.ics', '');

    if (!appointmentId) {
      return new Response('Appointment ID is required', { status: 400 });
    }

    // Buscar appointment do Supabase
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

    const response = await fetch(
      `${supabaseUrl}/rest/v1/appointments?id=eq.${appointmentId}&select=*,patient:patients(*),therapist:users(*)`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    if (!response.ok) {
      return new Response('Appointment not found', { status: 404 });
    }

    const appointments = await response.json();
    const appointment = appointments[0];

    if (!appointment) {
      return new Response('Appointment not found', { status: 404 });
    }

    // Extrair dados do paciente e terapeuta
    const patient = appointment.patient || {};
    const therapist = appointment.therapist || {};

    // Gerar .ics
    const ics = generateICS({
      title: `Consulta - ${patient.name || patient.full_name || 'Paciente'}`,
      description: `Fisioterapia com ${therapist.full_name || therapist.name || 'Fisioterapeuta'}\n\nTipo: ${appointment.type || 'Sessão'}\nStatus: ${appointment.status || 'Agendado'}`,
      startTime: new Date(appointment.start_time),
      endTime: new Date(appointment.end_time),
      location: appointment.location || 'Clínica DuduFisio',
      organizer: {
        name: therapist.full_name || therapist.name || 'Fisioterapeuta',
        email: therapist.email || 'contato@dudufisio.com'
      },
      attendee: {
        name: patient.name || patient.full_name || 'Paciente',
        email: patient.email || ''
      },
      reminderHoursBefore: [24, 2] // Lembretes 24h e 2h antes
    });

    // Retornar .ics com headers corretos
    return new Response(ics, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="consulta-${appointmentId}.ics"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400', // Cache 1h no browser, 24h no CDN
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });

  } catch (error: unknown) {
    logger.error('Error generating .ics file:', { data: error as Error });
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(`Error: ${message}`, { status: 500 });
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

