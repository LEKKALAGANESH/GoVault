import { createBrowserClient } from '@supabase/ssr';
import { getSupabaseUrl, getSupabaseAnonKey } from './env';

const SUPABASE_TIMEOUT_MS = 5000;

export function createClient() {
  return createBrowserClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      global: {
        fetch: (url, options) =>
          fetch(url, { ...options, signal: AbortSignal.timeout(SUPABASE_TIMEOUT_MS) }),
      },
    }
  );
}
