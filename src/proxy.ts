import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '~/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/recuperar-senha');
  const isDashboardPage = request.nextUrl.pathname.startsWith('/dashboard');

  // Redirecionar autenticados que tentam acessar páginas de auth
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Redirecionar não autenticados que tentam acessar dashboard
  if (!user && isDashboardPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

