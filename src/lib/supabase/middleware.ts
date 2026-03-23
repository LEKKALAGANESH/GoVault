import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseUrl, getSupabaseAnonKey } from './env';

const SUPABASE_TIMEOUT_MS = 5000;

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = getSupabaseUrl();
  const supabaseAnonKey = getSupabaseAnonKey();

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('[GoVault] Supabase env vars missing — skipping auth check');
    return supabaseResponse;
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        fetch: (url, options) =>
          fetch(url, { ...options, signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS) }),
      },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isProtectedRoute = request.nextUrl.pathname.startsWith('/trips');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login');

  try {
    // Refresh session if expired - required for Server Components
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Protected routes - redirect to login if not authenticated
    if (isProtectedRoute && !user) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('redirect', request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    // Redirect authenticated users away from auth pages
    if (isAuthRoute && user) {
      const url = request.nextUrl.clone();
      url.pathname = '/trips';
      return NextResponse.redirect(url);
    }
  } catch (error) {
    console.error('[GoVault] Supabase auth check failed:', error instanceof Error ? error.message : error);

    // Supabase is unreachable — redirect protected routes to login with error
    if (isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('error', 'service_unavailable');
      url.searchParams.set('message', 'Unable to verify authentication. Please try again.');
      return NextResponse.redirect(url);
    }

    // For public/auth routes, let the request through
  }

  return supabaseResponse;
}
