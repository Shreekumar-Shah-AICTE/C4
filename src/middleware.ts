/**
 * Edge middleware applying a per-request nonce-based CSP and the standard
 * hardening headers to every response. The nonce is forwarded on the request so
 * Next.js can stamp it onto its own bootstrap scripts.
 */

import { NextResponse, type NextRequest } from 'next/server';

import { contentSecurityPolicy, securityHeaders } from '@/server/security';

const HYPHEN_PATTERN = /-/g;

export function middleware(request: NextRequest): NextResponse {
  const nonce = crypto.randomUUID().replace(HYPHEN_PATTERN, '');
  const csp = contentSecurityPolicy(nonce);

  // Next.js reads the CSP nonce from the *request* headers and stamps it onto
  // its own bootstrap scripts, so the strict `strict-dynamic` policy allows
  // hydration. The same policy (plus hardening) is set on the response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);
  requestHeaders.set('Content-Security-Policy', csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  for (const [key, value] of Object.entries(securityHeaders(nonce))) {
    response.headers.set(key, value);
  }
  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
