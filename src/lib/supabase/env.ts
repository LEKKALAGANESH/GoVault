const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let validated = false;

export function validateSupabaseEnv() {
  if (validated) return;
  validated = true;

  const warnings: string[] = [];

  if (!SUPABASE_URL) {
    warnings.push("NEXT_PUBLIC_SUPABASE_URL is not set");
  } else {
    try {
      const url = new URL(SUPABASE_URL);
      if (!url.hostname.endsWith(".supabase.co") && !url.hostname.includes("localhost")) {
        warnings.push(
          `NEXT_PUBLIC_SUPABASE_URL hostname "${url.hostname}" doesn't look like a Supabase URL`
        );
      }
    } catch {
      warnings.push(
        `NEXT_PUBLIC_SUPABASE_URL is not a valid URL: "${SUPABASE_URL}"`
      );
    }
  }

  if (!SUPABASE_ANON_KEY) {
    warnings.push("NEXT_PUBLIC_SUPABASE_ANON_KEY is not set");
  }

  if (warnings.length > 0) {
    console.warn(
      `\n[GoVault] Supabase configuration issues:\n${warnings.map((w) => `  - ${w}`).join("\n")}\n`
    );
  }
}

export function getSupabaseUrl(): string {
  validateSupabaseEnv();
  return SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey(): string {
  validateSupabaseEnv();
  return SUPABASE_ANON_KEY ?? "";
}
