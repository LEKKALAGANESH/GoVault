import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - callback (auth callback route - must not interfere with OAuth flow)
     * - api/auth (API auth routes)
     * - public pages that don't need auth (/, /terms, /privacy, /share)
     */
    '/((?!_next/static|_next/image|favicon.ico|callback|api/auth|terms|privacy|share|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|ico)$).*)',
  ],
};
