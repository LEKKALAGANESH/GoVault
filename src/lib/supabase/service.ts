import { createClient } from '@supabase/supabase-js';
import { getSupabaseUrl } from './env';

const SUPABASE_TIMEOUT_MS = 5000;

// Service role client - bypasses RLS
// Only use in trusted server-side code (API routes) where you manually verify authorization
export function createServiceClient() {
  const supabaseUrl = getSupabaseUrl();
  const secretKey = process.env.SUPABASE_SECRET_KEY!;

  if (!secretKey) {
    throw new Error('SUPABASE_SECRET_KEY is not set');
  }

  return createClient(supabaseUrl, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      fetch: (url, options) =>
        fetch(url, { ...options, signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS) }),
    },
  });
}
