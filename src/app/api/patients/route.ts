import { NextRequest } from 'next/server';
import { withAuth, parseBody, successResponse, errorResponse, getQueryParams } from '~/lib/api/middleware';
import { createPatient, getPatients, type CreatePatientData } from '~/lib/actions/patients';

/**
 * GET /api/patients - Lista pacientes com filtros
 *
 * Query params:
 * - search: string (busca por nome, email, telefone, CPF)
 * - status: string (filtro por status)
 * - limit: number (quantidade de resultados, padrão: 50)
 * - offset: number (paginação, padrão: 0)
 *
 * Exemplo: /api/patients?search=João&limit=10&offset=0
 */
export const GET = withAuth(async (request: NextRequest, { supabase }) => {
  const params = getQueryParams(request);

  const filters = {
    search: params.search,
    status: params.status,
    limit: params.limit ? parseInt(params.limit, 10) : 50,
    offset: params.offset ? parseInt(params.offset, 10) : 0,
  };

  const result = await getPatients(filters);

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse({
    patients: result.data,
    count: result.count,
    pagination: {
      limit: filters.limit,
      offset: filters.offset,
      hasMore: result.count ? result.count > (filters.offset + filters.limit) : false,
    },
  });
});

/**
 * POST /api/patients - Cria novo paciente
 *
 * Body:
 * {
 *   "full_name": "string (required)",
 *   "email": "string (required)",
 *   "phone": "string (required)",
 *   "cpf": "string (optional)",
 *   "birth_date": "string ISO date (required)",
 *   "gender": "male|female|other|prefer_not_to_say (optional)",
 *   "address": {
 *     "street": "string",
 *     "number": "string",
 *     "complement": "string",
 *     "neighborhood": "string",
 *     "city": "string",
 *     "state": "string",
 *     "zipcode": "string"
 *   },
 *   "emergency_contact": {
 *     "name": "string",
 *     "phone": "string",
 *     "relationship": "string"
 *   },
 *   "notes": "string (optional)"
 * }
 */
export const POST = withAuth(async (request: NextRequest, { supabase }) => {
  const { data: body, error: parseError } = await parseBody<CreatePatientData>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Validações básicas
  if (!body.full_name || body.full_name.trim().length === 0) {
    return errorResponse('Nome completo é obrigatório', 400);
  }

  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return errorResponse('Email válido é obrigatório', 400);
  }

  if (!body.phone || body.phone.trim().length === 0) {
    return errorResponse('Telefone é obrigatório', 400);
  }

  if (!body.birth_date) {
    return errorResponse('Data de nascimento é obrigatória', 400);
  }

  // Valida data de nascimento
  const birthDate = new Date(body.birth_date);
  if (isNaN(birthDate.getTime())) {
    return errorResponse('Data de nascimento inválida', 400);
  }

  // Chama o Server Action
  const result = await createPatient(body);

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse(result.data, 201);
});
