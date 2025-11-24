import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { Database } from '~/types/database.types';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email?: string;
  };
  supabase?: ReturnType<typeof createServerClient<Database>>;
}

/**
 * Cria um cliente Supabase para API Routes
 */
export function createApiSupabaseClient(request: NextRequest) {
  const response = NextResponse.next();

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  return { supabase, response };
}

/**
 * Valida autenticação Supabase na requisição
 */
export async function validateAuth(request: NextRequest) {
  const { supabase, response } = createApiSupabaseClient(request);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: 'Não autenticado',
      status: 401,
      user: null,
      supabase: null,
    };
  }

  return {
    error: null,
    status: 200,
    user,
    supabase,
    response,
  };
}

/**
 * Valida token de teste (para ambiente de desenvolvimento/teste)
 */
export function validateTestToken(request: NextRequest) {
  const testMode = process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'development';
  const testApiKey = process.env.TEST_API_KEY;

  if (!testMode) {
    return { valid: false, reason: 'Modo de teste não habilitado' };
  }

  const authHeader = request.headers.get('authorization');
  const apiKey = authHeader?.replace('Bearer ', '');

  // Se TEST_API_KEY não estiver definida, aceita qualquer token em desenvolvimento
  if (!testApiKey && process.env.NODE_ENV === 'development') {
    return { valid: true, testMode: true };
  }

  if (apiKey === testApiKey) {
    return { valid: true, testMode: true };
  }

  return { valid: false, reason: 'Token de teste inválido' };
}

/**
 * Middleware de autenticação flexível
 * Suporta autenticação Supabase e tokens de teste
 */
export async function authenticate(request: NextRequest) {
  // Tenta autenticação Supabase primeiro
  const authResult = await validateAuth(request);

  if (!authResult.error) {
    return {
      authenticated: true,
      user: authResult.user,
      supabase: authResult.supabase,
      response: authResult.response,
      testMode: false,
    };
  }

  // Se falhar, tenta token de teste
  const testResult = validateTestToken(request);

  if (testResult.valid) {
    const { supabase, response } = createApiSupabaseClient(request);
    return {
      authenticated: true,
      user: { id: 'test-user', email: 'test@example.com' },
      supabase,
      response,
      testMode: true,
    };
  }

  return {
    authenticated: false,
    error: authResult.error,
    testMode: false,
  };
}

/**
 * Wrapper de handler com autenticação automática
 */
export function withAuth(
  handler: (
    request: NextRequest,
    context: {
      user: { id: string; email?: string };
      supabase: ReturnType<typeof createServerClient<Database>>;
      testMode: boolean;
    }
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const authResult = await authenticate(request);

    if (!authResult.authenticated) {
      return NextResponse.json(
        { error: authResult.error || 'Não autenticado' },
        { status: 401 }
      );
    }

    try {
      return await handler(
        request,
        {
          user: authResult.user!,
          supabase: authResult.supabase!,
          testMode: authResult.testMode,
        }
      );
    } catch (error: unknown) {
      console.error('API Error:', error);
      let errorMessage = 'Erro interno do servidor';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  };
}

/**
 * Valida CRON_SECRET para endpoints de cron jobs
 */
export function validateCronSecret(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const testMode = process.env.TEST_MODE === 'true' || process.env.NODE_ENV === 'development';

  // Em modo de teste, não requer CRON_SECRET
  if (testMode) {
    return { valid: true, testMode: true };
  }

  const authHeader = request.headers.get('authorization');
  const providedSecret = authHeader?.replace('Bearer ', '');

  if (!cronSecret) {
    return { valid: false, reason: 'CRON_SECRET não configurado' };
  }

  if (providedSecret === cronSecret) {
    return { valid: true, testMode: false };
  }

  return { valid: false, reason: 'CRON_SECRET inválido' };
}

/**
 * Wrapper para handlers de cron jobs
 */
export function withCronAuth(
  handler: (request: NextRequest, testMode: boolean) => Promise<NextResponse>
) {
  return async (request: NextRequest) => {
    const validation = validateCronSecret(request);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason || 'Não autorizado' },
        { status: 401 }
      );
    }

    try {
      return await handler(request, validation.testMode ?? false);
    } catch (error: unknown) {
      console.error('Cron Job Error:', error);
      let errorMessage = 'Erro interno do servidor';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper para extrair parâmetros de query string
 */
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const params: Record<string, string> = {};

  searchParams.forEach((value, key) => {
    params[key] = value;
  });

  return params;
}

/**
 * Helper para parse de body JSON com tratamento de erros
 */
export async function parseBody<T = unknown>(request: NextRequest): Promise<{ data: T | null; error: string | null }> {
  try {
    const body = await request.json();
    return { data: body as T, error: null };
  } catch (error: unknown) {
    let errorMessage = 'Body inválido ou não é JSON';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { data: null, error: errorMessage };
  }
}

/**
 * Helper para resposta de sucesso padronizada
 */
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}

/**
 * Helper para resposta de erro padronizada
 */
export function errorResponse(error: string, status = 400) {
  return NextResponse.json(
    { success: false, error },
    { status }
  );
}
