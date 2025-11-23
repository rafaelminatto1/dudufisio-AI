import { NextRequest } from 'next/server';
import { withAuth, parseBody, successResponse, errorResponse } from '~/lib/api/middleware';
import { saveSessionEvolution } from '~/lib/actions/sessions';
import type { Database } from '~/types/database.types';
import { SupabaseClient } from '@supabase/supabase-js';

type SessionEvolutionUpdate = Database['public']['Tables']['session_evolutions']['Update'];

interface RouteContext {
  params: Promise<{ id: string }>;
}

// Tipo para atualização de sessão
interface UpdateSessionRequest {
  session_date?: string;
  subjective?: string;
  objective?: string;
  assessment?: string;
  plan?: string;
  conducts?: Record<string, unknown>;
  pain_level?: number;
  session_number?: number;
}

// Tipo para dados da sessão existente
interface ExistingSession {
  id: string;
  patient_id: string;
  therapist_id?: string;
}

/**
 * GET /api/treatments/[id] - Busca sessão/evolução por ID
 *
 * Exemplo: /api/treatments/123e4567-e89b-12d3-a456-426614174000
 */
export const GET = withAuth(async (request: NextRequest, { supabase }, routeContext?: RouteContext) => {
  const params = await routeContext?.params;
  const sessionId = params?.id;

  if (!sessionId) {
    return errorResponse('ID da sessão é obrigatório', 400);
  }

  const { data, error } = await supabase
    .from('session_evolutions')
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
    .eq('id', sessionId)
    .single();

  if (error) {
    return errorResponse(error.message, error.code === 'PGRST116' ? 404 : 400);
  }

  if (!data) {
    return errorResponse('Sessão não encontrada', 404);
  }

  return successResponse(data);
});

/**
 * PUT /api/treatments/[id] - Atualiza sessão/evolução (SOAP notes)
 *
 * Body (todos os campos são opcionais):
 * {
 *   "session_date": "string ISO datetime",
 *   "subjective": "string (S do SOAP)",
 *   "objective": "string (O do SOAP)",
 *   "assessment": "string (A do SOAP)",
 *   "plan": "string (P do SOAP)",
 *   "conducts": "object (condutas realizadas)",
 *   "pain_level": "number 0-10",
 *   "session_number": "number"
 * }
 */
export const PUT = withAuth(async (request: NextRequest, { supabase, user }, routeContext?: RouteContext) => {
  const params = await routeContext?.params;
  const sessionId = params?.id;

  if (!sessionId) {
    return errorResponse('ID da sessão é obrigatório', 400);
  }

  const { data: body, error: parseError } = await parseBody<UpdateSessionRequest>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Valida data se fornecida
  if (body.session_date) {
    const sessionDate = new Date(body.session_date);
    if (isNaN(sessionDate.getTime())) {
      return errorResponse('Data da sessão inválida', 400);
    }
  }

  // Valida pain_level se fornecido
  if (body.pain_level !== undefined && (body.pain_level < 0 || body.pain_level > 10)) {
    return errorResponse('Nível de dor deve estar entre 0 e 10', 400);
  }

  // Verifica se sessão existe e obtém therapist_id
  const { data: existing, error: existingError } = await (supabase as SupabaseClient<Database>)
    .from('session_evolutions')
    .select('id, patient_id, therapist_id')
    .eq('id', sessionId)
    .single();

  if (existingError || !existing) {
    return errorResponse('Sessão não encontrada', 404);
  }

  const existingSession = existing as ExistingSession;

  // Se não tiver therapist_id na sessão, busca do usuário autenticado
  let therapistId = existingSession.therapist_id;

  if (!therapistId && user?.id) {
    const { data: therapist, error: therapistError } = await (supabase as SupabaseClient<Database>)
      .from('therapists')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (!therapistError && therapist) {
      therapistId = therapist.id;
    }
  }

  if (!therapistId) {
    return errorResponse('Não foi possível identificar o fisioterapeuta', 400);
  }

  // Atualiza a sessão
  const result = await saveSessionEvolution(sessionId, {
    patient_id: existingSession.patient_id,
    therapist_id: therapistId,
    session_date: body.session_date || new Date().toISOString(),
    subjective: body.subjective,
    objective: body.objective,
    assessment: body.assessment,
    plan: body.plan,
    conducts: body.conducts,
    pain_level: body.pain_level,
    session_number: body.session_number,
  });

  if (result.error) {
    return errorResponse(result.error, 400);
  }

  return successResponse(result.data);
});

/**
 * POST /api/treatments/[id]/generate-document - Gera documento clínico com IA
 *
 * Body:
 * {
 *   "document_type": "evolution|prescription|report|certificate (required)",
 *   "include_history": "boolean (optional, default: false)",
 *   "custom_instructions": "string (optional)"
 * }
 *
 * Retorna:
 * {
 *   "success": true,
 *   "data": {
 *     "document_type": "string",
 *     "content": "string (conteúdo gerado)",
 *     "generated_at": "string ISO datetime"
 *   }
 * }
 */
export const POST = withAuth(async (request: NextRequest, { supabase }, routeContext?: RouteContext) => {
  const params = await routeContext?.params;
  const sessionId = params?.id;

  if (!sessionId) {
    return errorResponse('ID da sessão é obrigatório', 400);
  }

  const { data: body, error: parseError } = await parseBody<{
    document_type: 'evolution' | 'prescription' | 'report' | 'certificate';
    include_history?: boolean;
    custom_instructions?: string;
  }>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  if (!body.document_type) {
    return errorResponse('Tipo de documento é obrigatório', 400);
  }

  const validTypes = ['evolution', 'prescription', 'report', 'certificate'];
  if (!validTypes.includes(body.document_type)) {
    return errorResponse(
      `Tipo de documento inválido. Use: ${validTypes.join(', ')}`,
      400
    );
  }

  // Busca sessão com dados relacionados
  const { data: session, error: sessionError } = await supabase
    .from('session_evolutions')
    .select(
      `
      *,
      patients:patient_id (
        full_name,
        birth_date,
        cpf,
        phone
      ),
      therapists:therapist_id (
        full_name,
        registration_number
      )
    `
    )
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    return errorResponse('Sessão não encontrada', 404);
  }

  // TODO: Integrar com serviço de IA para gerar documento
  // Por enquanto, retorna um mock
  const mockContent = generateMockDocument(body.document_type, session);

  return successResponse({
    document_type: body.document_type,
    content: mockContent,
    generated_at: new Date().toISOString(),
    session_id: sessionId,
  });
});

/**
 * Mock para geração de documento (substituir por IA real)
 */
function generateMockDocument(
  type: string,
  session: Database['public']['Tables']['session_evolutions']['Row'] & {
    patients: Database['public']['Tables']['patients']['Row'] | null;
    therapists: Database['public']['Tables']['therapists']['Row'] | null;
  }
): string {
  const patientName = session.patients?.full_name || 'Paciente';
  const therapistName = session.therapists?.full_name || 'Fisioterapeuta';
  const date = new Date(session.session_date).toLocaleDateString('pt-BR');

  switch (type) {
    case 'evolution':
      return `EVOLUÇÃO FISIOTERAPÊUTICA

Paciente: ${patientName}
Data: ${date}
Fisioterapeuta: ${therapistName}

SUBJETIVO:
${session.subjective || 'Não informado'}

OBJETIVO:
${session.objective || 'Não informado'}

AVALIAÇÃO:
${session.assessment || 'Não informado'}

PLANO:
${session.plan || 'Não informado'}

Nível de Dor: ${session.pain_level || 'Não informado'}/10
`;

    case 'prescription':
      return `PRESCRIÇÃO FISIOTERAPÊUTICA

Paciente: ${patientName}
Data: ${date}
Fisioterapeuta: ${therapistName}

CONDUTA PRESCRITA:
${session.plan || 'Conforme avaliação'}

Este documento é válido por 30 dias a partir da data de emissão.
`;

    case 'report':
      return `RELATÓRIO FISIOTERAPÊUTICO

Paciente: ${patientName}
Data: ${date}
Fisioterapeuta: ${therapistName}

RESUMO DA SESSÃO:
${session.assessment || 'Sessão realizada conforme plano de tratamento.'}

Observações: ${session.objective || 'Nenhuma observação adicional.'}
`;

    case 'certificate':
      return `ATESTADO DE COMPARECIMENTO

Atesto para os devidos fins que ${patientName} compareceu à sessão de fisioterapia em ${date}.

${therapistName}
Fisioterapeuta
CREFITO: ${session.therapists?.registration_number || 'N/A'}
`;

    default:
      return 'Documento não disponível';
  }
}