import { NextRequest } from 'next/server';
import { withAuth, parseBody, successResponse, errorResponse } from '~/lib/api/middleware';
import type { Database } from '~/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type AppointmentUpdate = Database['public']['Tables']['appointments']['Update'];

// Tipo estendido para atualização de agendamento
interface UpdateAppointmentRequest {
  patient_id?: string;
  therapist_id?: string;
  start_time?: string;
  end_time?: string;
  service_type?: string;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  cancellation_reason?: string;
}

/**
 * GET /api/appointments/[id] - Busca agendamento por ID
 *
 * Exemplo: /api/appointments/123e4567-e89b-12d3-a456-426614174000
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request: NextRequest, { supabase }) => {
    const params = await context.params;
    const appointmentId = params.id;

  if (!appointmentId) {
    return errorResponse('ID do agendamento é obrigatório', 400);
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(
      `
      *,
      patients:patient_id (
        full_name,
        phone,
        email,
        cpf
      ),
      therapists:therapist_id (
        full_name,
        email
      )
    `
    )
    .eq('id', appointmentId)
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 400);
  }

  if (!data) {
    return errorResponse('Agendamento não encontrado', 404);
  }

    return successResponse(data);
  })(request);
}

/**
 * PUT /api/appointments/[id] - Atualiza agendamento
 *
 * Body (todos os campos são opcionais):
 * {
 *   "patient_id": "string UUID",
 *   "therapist_id": "string UUID",
 *   "start_time": "string ISO datetime",
 *   "end_time": "string ISO datetime",
 *   "service_type": "string",
 *   "status": "scheduled|confirmed|completed|cancelled|no_show",
 *   "notes": "string",
 *   "cancellation_reason": "string (se status=cancelled)"
 * }
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request: NextRequest, { supabase, user }) => {
    const params = await context.params;
    const appointmentId = params.id;

  if (!appointmentId) {
    return errorResponse('ID do agendamento é obrigatório', 400);
  }

  const { data: body, error: parseError } = await parseBody<UpdateAppointmentRequest>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Valida datas se fornecidas
  if (body.start_time && body.end_time) {
    const startTime = new Date(body.start_time);
    const endTime = new Date(body.end_time);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return errorResponse('Data/hora inválida', 400);
    }

    if (endTime <= startTime) {
      return errorResponse('Data/hora de término deve ser após a data/hora de início', 400);
    }
  }

  // Verifica se agendamento existe
  const { data: existing, error: existingError } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('id', appointmentId)
    .single();

  if (existingError || !existing) {
    return errorResponse('Agendamento não encontrado', 404);
  }

  // Verifica se paciente existe (se fornecido)
  if (body.patient_id) {
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id')
      .eq('id', body.patient_id)
      .is('deleted_at', null)
      .single();

    if (patientError || !patient) {
      return errorResponse('Paciente não encontrado', 404);
    }
  }

  // Verifica se fisioterapeuta existe (se fornecido)
  if (body.therapist_id) {
    const { data: therapist, error: therapistError } = await (supabase as SupabaseClient<Database>)
      .from('therapists')
      .select('id')
      .eq('id', body.therapist_id)
      .single();

    if (therapistError || !therapist) {
      return errorResponse('Fisioterapeuta não encontrado', 404);
    }
  }

  // Se está mudando horário, verifica conflitos
  if (body.start_time || body.end_time) {
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .neq('id', appointmentId)
      .neq('status', 'cancelled');

    // TODO: Implementar verificação de conflito mais robusta
  }

  // Atualiza agendamento
  const updateData: AppointmentUpdate = {
    ...body,
    updated_at: new Date().toISOString(),
  };

  const { data: appointment, error } = await supabase
    .from('appointments')
    .update(updateData)
    .eq('id', appointmentId)
    .select(
      `
      *,
      patients:patient_id (
        full_name,
        phone,
        email
      ),
      therapists:therapist_id (
        full_name
      )
    `
    )
    .single();

  if (error) {
    return errorResponse(error.message, 400);
  }

    return successResponse(appointment);
  })(request);
}

/**
 * DELETE /api/appointments/[id] - Cancela agendamento
 *
 * Query params:
 * - reason: string (motivo do cancelamento, opcional)
 *
 * Exemplo: DELETE /api/appointments/123?reason=Paciente solicitou
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (request: NextRequest, { supabase, user }) => {
    const params = await context.params;
    const appointmentId = params.id;

  if (!appointmentId) {
    return errorResponse('ID do agendamento é obrigatório', 400);
  }

  const { searchParams } = new URL(request.url);
  const reason = searchParams.get('reason');

  // Verifica se agendamento existe
  const { data: existing, error: existingError } = await supabase
    .from('appointments')
    .select('id, status')
    .eq('id', appointmentId)
    .single();

  if (existingError || !existing) {
    return errorResponse('Agendamento não encontrado', 404);
  }

  if (existing.status === 'cancelled') {
    return errorResponse('Agendamento já está cancelado', 400);
  }

  // Atualiza status para cancelado
  const { data: appointment, error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancellation_reason: reason || undefined,
      cancelled_at: new Date().toISOString(),
      updated_by: user.id,
    } as AppointmentUpdate)
    .eq('id', appointmentId)
    .select()
    .single();

  if (error) {
    return errorResponse(error.message, 400);
  }

    return successResponse({
      message: 'Agendamento cancelado com sucesso',
      appointment,
    });
  })(request);
}