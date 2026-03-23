# Phase 6: Login Page Offline Handling

## Overview

Handle the authentication flow when Supabase is unreachable. Since OAuth and magic links both require Supabase Auth, new logins are impossible offline. However, users with existing cached sessions can still access their data.

---

## Modified Files

### `src/app/(auth)/login/page.tsx`

**Current behavior:** Always shows login form with Google OAuth and magic link options.

**New behavior:** Detect Supabase status and adjust the UI accordingly.

#### Changes:

```diff
  function LoginContent() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
+   const [supabaseDown, setSupabaseDown] = useState(false);
    const searchParams = useSearchParams();

    const supabase = createClient();

+   // Check if Supabase is reachable
+   useEffect(() => {
+     async function checkConnection() {
+       try {
+         await supabase.auth.getSession();
+         setSupabaseDown(false);
+       } catch {
+         setSupabaseDown(true);
+       }
+     }
+     checkConnection();
+   }, []);

    // Show error from callback (including service_unavailable from middleware)
    useEffect(() => {
      const error = searchParams.get("error");
      const errorMessage = searchParams.get("message");
      if (error) {
+       if (error === "service_unavailable") {
+         setSupabaseDown(true);
+       }
        setMessage({
          type: "error",
          text: `Login failed: ${error}${errorMessage ? ` - ${errorMessage}` : ""}`,
        });
      }
    }, [searchParams]);

    // ... existing handlers ...

    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          {/* ... existing logo ... */}

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h1 className="text-2xl font-bold text-navy text-center mb-2">
              Welcome to GoVault
            </h1>

+           {supabaseDown ? (
+             <OfflineLoginState />
+           ) : (
              <>
                <p className="text-muted-foreground text-center mb-6">
                  Sign in to manage your trips
                </p>
                {/* ... existing Google + Magic Link form ... */}
              </>
+           )}

            {/* Message */}
            {message && (
              <div className={`mt-4 p-3 rounded-lg text-sm ${...}`}>
                {message.text}
              </div>
            )}
          </div>

          {/* Footer */}
          {/* ... existing terms/privacy links ... */}
        </div>
      </div>
    );
  }
```

---

### New Component: `OfflineLoginState` (inline in login page)

```tsx
function OfflineLoginState() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [hasCachedSession, setHasCachedSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if there's a cached auth session in cookies/storage
    async function checkCachedSession() {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          setHasCachedSession(true);
        }
      } catch {
        // getSession reads from local storage first, so this might still work
      }
      setCheckingSession(false);
    }
    checkCachedSession();
  }, []);

  if (checkingSession) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-teal mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">Checking connection...</p>
      </div>
    );
  }

  return (
    <div className="text-center py-6">
      <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <WifiOff className="w-8 h-8 text-amber-500" />
      </div>

      <h2 className="text-lg font-semibold text-navy mb-2">
        Service Temporarily Unavailable
      </h2>

      <p className="text-muted-foreground text-sm mb-6">
        Our servers are currently unreachable. This is usually temporary.
      </p>

      {hasCachedSession ? (
        <>
          <p className="text-sm text-teal-700 bg-teal-50 rounded-lg p-3 mb-4">
            You have a cached session. You can continue viewing your trips
            offline, but some features may be limited.
          </p>
          <Button
            className="w-full bg-teal hover:bg-teal-dark text-white"
            onClick={() => router.push('/trips')}
          >
            Continue Offline
          </Button>
        </>
      ) : (
        <p className="text-sm text-gray-500">
          Please try again in a few minutes. If the problem persists,
          check your internet connection.
        </p>
      )}

      <Button
        variant="outline"
        className="w-full mt-3"
        onClick={() => window.location.reload()}
      >
        <RefreshCw className="w-4 h-4 mr-2" />
        Try Again
      </Button>
    </div>
  );
}
```

---

## User Experience Flow

### Scenario 1: Supabase Down + No Cached Session (New User)

```
User opens /login
  → Health check fails
  → Shows "Service Temporarily Unavailable"
  → Shows "Try Again" button
  → No login form (it wouldn't work anyway)
```

### Scenario 2: Supabase Down + Has Cached Session (Returning User)

```
User opens /login (redirected from middleware)
  → Health check fails
  → Shows "Service Temporarily Unavailable"
  → Detects cached session in localStorage
  → Shows "Continue Offline" button
  → User clicks → navigates to /trips
  → Trips page loads from IndexedDB cache (Phase 3)
  → Offline banner shows at top (Phase 2)
```

### Scenario 3: Supabase Down + Session Expired

```
User opens /login (redirected from middleware)
  → Health check fails
  → Cached session exists but token is expired
  → getSession() returns session (reads from localStorage, doesn't validate)
  → User clicks "Continue Offline"
  → Trips page loads from IndexedDB cache
  → When Supabase comes back, session refresh fails
  → User redirected to login to re-authenticate
```

### Scenario 4: Middleware Redirects with Error

```
User tries /trips
  → Middleware catches getUser() failure
  → Redirects to /login?error=service_unavailable&message=...
  → Login page reads URL params
  → Sets supabaseDown = true
  → Shows offline login state
```

---

## Concerns

| Concern | Mitigation |
|---------|------------|
| Cached session might be expired | `getSession()` reads from localStorage without server validation; let users through and handle token refresh failure later |
| Security: allowing access without server auth check | Only cached data is shown (already on the user's device); no new server data is exposed |
| User expects full functionality offline | Clear messaging: "some features may be limited" |
| Multiple tabs: one online, one offline | Each tab runs its own health check; status may differ briefly |
| "Continue Offline" leads to empty trips (never cached) | Show "No cached trips available. Your trips will appear once the connection is restored." |
