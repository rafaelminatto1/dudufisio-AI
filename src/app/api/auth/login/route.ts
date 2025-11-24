import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { parseBody, successResponse, errorResponse } from '~/lib/api/middleware';
import type { Database } from '~/types/database.types';

interface LoginRequest {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login - Autentica usuário
 *
 * Body:
 * {
 *   "email": "string (required)",
 *   "password": "string (required)"
 * }
 *
 * Retorna:
 * {
 *   "success": true,
 *   "data": {
 *     "user": { ... },
 *     "session": { ... },
 *     "access_token": "string"
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  const { data: body, error: parseError } = await parseBody<LoginRequest>(request);

  if (parseError || !body) {
    return errorResponse(parseError || 'Body inválido', 400);
  }

  // Validações básicas
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    return errorResponse('Email válido é obrigatório', 400);
  }

  if (!body.password || body.password.length < 6) {
    return errorResponse('Senha deve ter no mínimo 6 caracteres', 400);
  }

  const response = NextResponse.next();

  // Cria cliente Supabase para API Route
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

  try {
    // Tenta fazer login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    });

    if (error) {
      // Mensagens de erro mais amigáveis
      let errorMessage = error.message;
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'Email ou senha inválidos';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'Email não confirmado. Verifique sua caixa de entrada.';
      }

      return NextResponse.json(
        { success: false, error: errorMessage },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return errorResponse('Erro ao autenticar. Tente novamente.', 401);
    }

    // Retorna resposta com cookies configurados
    return NextResponse.json(
      {
        success: true,
        data: {
          user: {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          },
          session: {
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at,
          },
        },
      },
      {
        status: 200,
        headers: response.headers,
      }
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return errorResponse(error.message || 'Erro ao fazer login', 500);
  }
}

/**
 * GET /api/auth/login - Verifica status de autenticação
 *
 * Retorna informações do usuário atualmente autenticado
 */
export async function GET(request: NextRequest) {
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

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado', authenticated: false },
        { status: 401 }
      );
    }

    return successResponse({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata,
      },
    });
  } catch (error: any) {
    console.error('Auth check error:', error);
    return errorResponse(error.message || 'Erro ao verificar autenticação', 500);
  }
}
