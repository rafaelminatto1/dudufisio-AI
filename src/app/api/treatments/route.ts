import { NextRequest } from 'next/server';
import { withAuth, parseBody, successResponse, errorResponse, getQueryParams } from '~/lib/api/middleware';
import { getPreviousSessions, saveSessionEvolution } from '~/lib/actions/sessions';
import type { Database } from '~/types/database.types';

type SessionEvolutionInsert = Database['public']['Tables']['session_evolutions']['Insert'];

/**
 * GET /api/treatments - Lista sessões/evoluções
 *
 * Query params:
 * - patient_id: string UUID (required - buscar por paciente)
 * - limit: number (quantidade de resultados, padrão: 10)
 *
 * Exemplo: /api/treatments?patient_id=123e4567-e89b-12d3-a456-426614174000&limit=20
 */
export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const params = getQueryParams(request);

  if (!params.patient_id) {
    return errorResponse('patient_id é obrigatório', 400);
  }

  const limit = params.limit ? parseInt(params.limit, 10) : 10;

  const result = await getPreviousSessions(params.patient_id, undefined, limit);

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse({
    sessions: result.data,
    count: result.data?.length || 0,
    patient_id: params.patient_id,
  });
});

/**
 * POST /api/treatments - Cria nova sessão/evolução
 *
 * Body:
 * {
 *   "patient_id": "string UUID (required)",
 *   "therapist_id": "string UUID (required)",
 *   "treatment_id": "string UUID (optional)",
 *   "appointment_id": "string UUID (optional)",
 *   "session_number": "number (optional)",
 *   "session_date": "string ISO datetime (required)",
 *   "subjective": "string (optional - S do SOAP)",
 *   "objective": "string (optional - O do SOAP)",
 *   "assessment": "string (optional - A do SOAP)",
 *   "plan": "string (optional - P do SOAP)",
 *   "conducts": "object (optional - condutas realizadas)",
 *   "pain_level": "number 0-10 (optional)"
 * }
 */
export const POST = withAuth(async (request: NextRequest, { supabase, user }) => {
  const { data: body, error: parseError } = await parseBody<SessionEvolutionInsert>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Validações básicas
  if (!body.patient_id) {
    return errorResponse('ID do paciente é obrigatório', 400);
  }

  if (!body.therapist_id) {
    return errorResponse('ID do fisioterapeuta é obrigatório', 400);
  }

  if (!body.session_date) {
    return errorResponse('Data da sessão é obrigatória', 400);
  }

  // Valida data
  const sessionDate = new Date(body.session_date);
  if (isNaN(sessionDate.getTime())) {
    return errorResponse('Data da sessão inválida', 400);
  }

  // Valida pain_level se fornecido
  if (body.pain_level !== undefined && (body.pain_level < 0 || body.pain_level > 10)) {
    return errorResponse('Nível de dor deve estar entre 0 e 10', 400);
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

  // Verifica se fisioterapeuta existe
  const { data: therapist, error: therapistError } = await (supabase as any)
    .from('therapists')
    .select('id')
    .eq('id', body.therapist_id)
    .single();

  if (therapistError || !therapist) {
    return errorResponse('Fisioterapeuta não encontrado', 404);
  }

  // Cria a sessão
  const result = await saveSessionEvolution(null, {
    patient_id: body.patient_id,
    therapist_id: body.therapist_id,
    treatment_id: body.treatment_id,
    appointment_id: body.appointment_id,
    session_number: body.session_number,
    session_date: body.session_date,
    subjective: body.subjective,
    objective: body.objective,
    assessment: body.assessment,
    plan: body.plan,
    conducts: body.conducts,
    pain_level: body.pain_level,
  });

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse(result.data, 201);
});
