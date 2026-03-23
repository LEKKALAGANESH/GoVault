import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');
  const origin = requestUrl.origin;

  // Get redirect URL from cookie (set during login)
  const cookieStore = await cookies();
  const redirectUrl = cookieStore.get('auth_redirect')?.value;

  // Handle errors from OAuth provider
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error)}&message=${encodeURIComponent(errorDescription || '')}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Auth exchange error:', exchangeError);
      return NextResponse.redirect(
        `${origin}/login?error=session_error&message=${encodeURIComponent(exchangeError.message)}`
      );
    }

    // Clear the redirect cookie
    const response = NextResponse.redirect(redirectUrl ? `${origin}${redirectUrl}` : `${origin}/trips`);
    response.cookies.delete('auth_redirect');
    return response;
  }

  // No code provided, redirect to login
  return NextResponse.redirect(`${origin}/login?error=no_code&message=No%20authorization%20code%20provided`);
}
