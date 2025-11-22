import { NextRequest } from 'next/server';
import { withAuth, parseBody, successResponse, errorResponse, getQueryParams } from '~/lib/api/middleware';
import { getAppointments } from '~/lib/actions/agenda';
import type { Database } from '~/types/database.types';

type AppointmentInsert = Database['public']['Tables']['appointments']['Insert'];

/**
 * GET /api/appointments - Lista agendamentos com filtros
 *
 * Query params:
 * - startDate: string ISO date (filtro data início)
 * - endDate: string ISO date (filtro data fim)
 * - therapistId: string UUID (filtro por fisioterapeuta)
 * - resourceId: string UUID (filtro por recurso)
 * - status: string (filtro por status: scheduled, confirmed, completed, cancelled, no_show)
 *
 * Exemplo: /api/appointments?startDate=2025-01-01&endDate=2025-01-31&status=scheduled
 */
export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const params = getQueryParams(request);

  const filters = {
    startDate: params.startDate,
    endDate: params.endDate,
    therapistId: params.therapistId,
    resourceId: params.resourceId,
    status: params.status,
  };

  const result = await getAppointments(filters);

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse({
    appointments: result.data,
    count: result.data?.length || 0,
    filters: filters,
  });
});

/**
 * POST /api/appointments - Cria novo agendamento
 *
 * Body:
 * {
 *   "patient_id": "string UUID (required)",
 *   "therapist_id": "string UUID (optional)",
 *   "start_time": "string ISO datetime (required)",
 *   "end_time": "string ISO datetime (required)",
 *   "service_type": "string (optional)",
 *   "status": "scheduled|confirmed|completed|cancelled|no_show (optional, default: scheduled)",
 *   "notes": "string (optional)",
 *   "send_notification": "boolean (optional, default: false)"
 * }
 */
export const POST = withAuth(async (request: NextRequest, { supabase, user }) => {
  const { data: body, error: parseError } = await parseBody<AppointmentInsert & { send_notification?: boolean }>(
    request
  );

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Validações básicas
  if (!body.patient_id) {
    return errorResponse('ID do paciente é obrigatório', 400);
  }

  if (!(body as any).start_time) {
    return errorResponse('Data/hora de início é obrigatória', 400);
  }

  if (!(body as any).end_time) {
    return errorResponse('Data/hora de término é obrigatória', 400);
  }

  // Valida datas
  const startTime = new Date((body as any).start_time);
  const endTime = new Date((body as any).end_time);

  if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
    return errorResponse('Data/hora inválida', 400);
  }

  if (endTime <= startTime) {
    return errorResponse('Data/hora de término deve ser após a data/hora de início', 400);
  }

  // Verifica se paciente existe
  const { data: patient, error: patientError } = await supabase
    .from('patients')
    .select('id')
    .eq('id', body.patient_id)
    .is('deleted_at', null)
    .single();

  if (patientError || !patient) {
    return errorResponse('Paciente não encontrado', 404);
  }

  // Verifica se fisioterapeuta existe (se fornecido)
  if (body.therapist_id) {
    const { data: therapist, error: therapistError } = await (supabase as any)
      .from('therapists')
      .select('id')
      .eq('id', body.therapist_id)
      .single();

    if (therapistError || !therapist) {
      return errorResponse('Fisioterapeuta não encontrado', 404);
    }
  }

  // Verifica conflitos de horário
  const { data: conflicts } = await supabase
    .from('appointments')
    .select('id')
    .neq('status', 'cancelled')
    .or(
      `and(start_time.lte.${(body as any).start_time},end_time.gt.${(body as any).start_time}),and(start_time.lt.${(body as any).end_time},end_time.gte.${(body as any).end_time})`
    );

  if (conflicts && conflicts.length > 0) {
    return errorResponse('Conflito de horário com outro agendamento', 409);
  }

  // Cria agendamento
  const appointmentData: any = {
    patient_id: body.patient_id,
    therapist_id: body.therapist_id,
    start_time: (body as any).start_time,
    end_time: (body as any).end_time,
    service_type: body.service_type,
    status: body.status || 'scheduled',
    notes: body.notes,
    created_by: user.id,
  };

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert(appointmentData)
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

  // TODO: Implementar notificação automática se send_notification=true
  // Isso dependeria do serviço de notificações existente

  return successResponse(appointment, 201);
});
