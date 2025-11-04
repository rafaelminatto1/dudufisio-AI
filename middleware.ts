// middleware.ts
import { withAuth, NextRequestWithAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';

// Feature flag to enable/disable middleware behavior safely
const EDGE_MIDDLEWARE_ENABLED = process.env.ENABLE_EDGE_MIDDLEWARE === 'true';

// Simple in-memory rate limiter (Edge-compatible)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 min
const RATE_LIMIT_MAX = 120; // 120 req/min por IP
const requestsMap = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string) {
  const now = Date.now();
  const rec = requestsMap.get(ip);
  if (!rec || now > rec.resetAt) {
    requestsMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, reset: RATE_LIMIT_WINDOW_MS };
  }
  if (rec.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, reset: rec.resetAt - now };
  }
  rec.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - rec.count, reset: rec.resetAt - now };
}

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    // Early exit if middleware is disabled via env flag
    if (!EDGE_MIDDLEWARE_ENABLED) {
      return NextResponse.next();
    }

    const { token } = request.nextauth;
    const { pathname } = request.nextUrl;

    // Zone/route-based caching strategy
    const response = NextResponse.next();
    const isStaticAsset = pathname.startsWith('/assets/') || pathname.endsWith('.css') || pathname.endsWith('.js');
    const isHtml = pathname === '/' || pathname.endsWith('.html');
    const isApi = pathname.startsWith('/api/');

    if (isStaticAsset) {
      response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (isHtml) {
      response.headers.set('Cache-Control', 'public, max-age=0, must-revalidate, s-maxage=86400');
    } else if (isApi) {
      response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=60');
    } else {
      // Default app pages
      response.headers.set('Cache-Control', 'public, max-age=0, s-maxage=600');
    }

    // Basic security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Rate limiting only on selected routes
    if (isApi || pathname.startsWith('/dashboard') || pathname.startsWith('/reports')) {
      const ip = request.ip ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
      const rl = rateLimit(ip);
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString());
      response.headers.set('X-RateLimit-Remaining', rl.remaining.toString());
      response.headers.set('X-RateLimit-Reset', Math.ceil(rl.reset / 1000).toString());
      if (!rl.allowed) {
        return new NextResponse('Too Many Requests', { status: 429, headers: response.headers });
      }
    }

    if (token && pathname === '/login') {
        let defaultPath = '/dashboard';
        if (token.role === Role.PACIENTE) defaultPath = '/portal/dashboard';
        if (token.role === Role.PARCEIRO) defaultPath = '/partner/dashboard';
        return NextResponse.redirect(new URL(defaultPath, request.url));
    }
    
    const isTherapistPortal = !pathname.startsWith('/portal') && !pathname.startsWith('/partner');
    const isPatientPortal = pathname.startsWith('/portal');
    const isPartnerPortal = pathname.startsWith('/partner');

    const allowedTherapistRoles: Role[] = [Role.ADMIN, Role.FISIOTERAPEUTA, Role.ESTAGIARIO];

    if (isTherapistPortal && !allowedTherapistRoles.includes(token?.role as Role)) {
        return NextResponse.redirect(new URL('/login', request.url)); 
    }

    if (isPatientPortal && token?.role !== Role.PACIENTE) {
         return NextResponse.redirect(new URL('/login', request.url));
    }
    
    if (isPartnerPortal && token?.role !== Role.PARCEIRO) {
         return NextResponse.redirect(new URL('/login', request.url));
    }

    // Default allow with headers applied
    return response;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/login',
    },
  }
);

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|icon-192.png|icon-512.png).*)',
  ],
};
