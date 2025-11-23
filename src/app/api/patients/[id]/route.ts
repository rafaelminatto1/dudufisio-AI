import { NextRequest } from 'next/server';
import { withAuth, parseBody, successResponse, errorResponse } from '~/lib/api/middleware';
import { getPatientById, updatePatient, deletePatient, type UpdatePatientData } from '~/lib/actions/patients';
import { User, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '~/types/database.types';

interface RouteContext {
  params: Promise<{ id: string }>;
}

interface AuthContext {
  supabase: SupabaseClient<Database>;
  user: User;
}

/**
 * GET /api/patients/[id] - Busca paciente por ID
 *
 * Exemplo: /api/patients/123e4567-e89b-12d3-a456-426614174000
 */
export const GET = withAuth(async (request: NextRequest, { supabase, user }: AuthContext, routeContext?: RouteContext) => {
  const params = await routeContext?.params;
  const patientId = params?.id;

  if (!patientId) {
    return errorResponse('ID do paciente é obrigatório', 400);
  }

  const result = await getPatientById(patientId);

  if (result.error) {
    return errorResponse(result.error, result.error.includes('não encontrado') ? 404 : 400);
  }

  if (!result.data) {
    return errorResponse('Paciente não encontrado', 404);
  }

  return successResponse(result.data);
});

/**
 * PUT /api/patients/[id] - Atualiza paciente
 *
 * Body (todos os campos são opcionais exceto o que você quer atualizar):
 * {
 *   "full_name": "string",
 *   "email": "string",
 *   "phone": "string",
 *   "cpf": "string",
 *   "birth_date": "string ISO date",
 *   "gender": "male|female|other|prefer_not_to_say",
 *   "address": { ... },
 *   "emergency_contact": { ... },
 *   "notes": "string"
 * }
 */
export const PUT = withAuth(async (request: NextRequest, { supabase, user }: AuthContext, routeContext?: RouteContext) => {
  const params = await routeContext?.params;
  const patientId = params?.id;

  if (!patientId) {
    return errorResponse('ID do paciente é obrigatório', 400);
  }

  const { data: body, error: parseError } = await parseBody<Partial<UpdatePatientData>>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Validações básicas (apenas se os campos forem fornecidos)
  if (body.full_name !== undefined && body.full_name.trim().length === 0) {
    return errorResponse('Nome completo não pode ser vazio', 400);
  }

  if (body.email !== undefined && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return errorResponse('Email inválido', 400);
  }

  if (body.phone !== undefined && body.phone.trim().length === 0) {
    return errorResponse('Telefone não pode ser vazio', 400);
  }

  if (body.birth_date !== undefined) {
    const birthDate = new Date(body.birth_date);
    if (isNaN(birthDate.getTime())) {
      return errorResponse('Data de nascimento inválida', 400);
    }
  }

  // Chama o Server Action
  const result = await updatePatient({
    id: patientId,
    ...body,
  });

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse(result.data);
});

/**
 * DELETE /api/patients/[id] - Deleta paciente (soft delete)
 *
 * Exemplo: DELETE /api/patients/123e4567-e89b-12d3-a456-426614174000
 */
export const DELETE = withAuth(async (request: NextRequest, { supabase, user }: AuthContext, routeContext?: RouteContext) => {
  const params = await routeContext?.params;
  const patientId = params?.id;

  if (!patientId) {
    return errorResponse('ID do paciente é obrigatório', 400);
  }

  const result = await deletePatient(patientId);

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse({ message: 'Paciente deletado com sucesso', id: patientId });
});