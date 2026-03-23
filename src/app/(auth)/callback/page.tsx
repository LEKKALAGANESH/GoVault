"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Plane } from "lucide-react";

export default function CallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleCallback = async () => {
      // Get the URL hash and search params
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const searchParams = new URLSearchParams(window.location.search);

      // Check for errors first
      const errorParam = searchParams.get("error") || hashParams.get("error");
      const errorDescription = searchParams.get("error_description") || hashParams.get("error_description");

      if (errorParam) {
        setError(`${errorParam}: ${errorDescription || "Unknown error"}`);
        setTimeout(() => {
          router.push(`/login?error=${encodeURIComponent(errorParam)}&message=${encodeURIComponent(errorDescription || "")}`);
        }, 2000);
        return;
      }

      // Check for auth code in URL (PKCE flow)
      const code = searchParams.get("code");

      if (code) {
        // Exchange code for session
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          setError(exchangeError.message);
          setTimeout(() => {
            router.push(`/login?error=session_error&message=${encodeURIComponent(exchangeError.message)}`);
          }, 2000);
          return;
        }
      }

      // Check for tokens in hash (implicit flow) or if session was already established
      const accessToken = hashParams.get("access_token");

      if (accessToken) {
        // Session should be automatically set by Supabase client
        // Just verify it worked
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setError("Failed to establish session");
          setTimeout(() => {
            router.push("/login?error=session_error");
          }, 2000);
          return;
        }
      }

      // Verify we have a session
      const { data: { session } } = await supabase.auth.getSession();

      if (session) {
        // Success! Redirect to trips
        router.push("/trips");
      } else {
        // No session established, might need to wait for auth state change
        // Listen for auth state change
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            subscription.unsubscribe();
            router.push("/trips");
          }
        });

        // Timeout after 5 seconds
        setTimeout(() => {
          subscription.unsubscribe();
          router.push("/login?error=timeout&message=Authentication%20timed%20out");
        }, 5000);
      }
    };

    handleCallback();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-teal flex items-center justify-center mx-auto mb-4">
          <Plane className="w-8 h-8 text-white" />
        </div>

        {error ? (
          <>
            <h1 className="text-xl font-semibold text-red-600 mb-2">Authentication Error</h1>
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting to login...</p>
          </>
        ) : (
          <>
            <Loader2 className="w-8 h-8 animate-spin text-teal mx-auto mb-4" />
            <h1 className="text-xl font-semibold text-navy mb-2">Signing you in...</h1>
            <p className="text-muted-foreground">Please wait while we complete authentication</p>
          </>
        )}
      </div>
    </div>
  );
}
