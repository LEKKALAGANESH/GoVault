# Phase 2: Offline Banner Component

## Overview

A persistent, non-dismissable banner at the top of the app layout that notifies users when Supabase is unreachable. Includes a "Retry now" button and a pending changes counter.

---

## New Files

### `src/components/offline-banner.tsx`

**Purpose:** Client component that reads from `useConnectionStore` and renders appropriately.

```tsx
"use client";

import { useEffect } from "react";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { WifiOff, RefreshCw, Loader2, CheckCircle } from "lucide-react";

export function OfflineBanner() {
  const { status, pendingChanges, checkNow, startPolling } = useConnectionStore();

  useEffect(() => {
    const cleanup = startPolling();
    return cleanup;
  }, [startPolling]);

  // Don't render anything when online and no pending info
  if (status === 'online') return null;
  if (status === 'checking') return null; // Don't flash on initial load

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Pulsing offline indicator */}
          <div className="relative">
            <WifiOff className="w-5 h-5 text-amber-600" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          </div>

          <div>
            <p className="text-amber-800 text-sm font-medium">
              You're currently offline
            </p>
            <p className="text-amber-600 text-xs">
              Your changes are saved locally and will sync when the connection is restored.
              {pendingChanges > 0 && (
                <span className="font-semibold ml-1">
                  ({pendingChanges} pending {pendingChanges === 1 ? 'change' : 'changes'})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Retry button */}
        <button
          onClick={checkNow}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700
                     bg-amber-100 hover:bg-amber-200 rounded-full transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry now
        </button>
      </div>
    </div>
  );
}
```

### `src/components/sync-toast.tsx`

**Purpose:** Toast notification shown when connection restores and sync completes.

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useConnectionStore } from "@/lib/stores/connection-store";
import { CheckCircle } from "lucide-react";

export function SyncToast() {
  const status = useConnectionStore(s => s.status);
  const prevStatus = useRef(status);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    // Detect transition from offline → online
    if (prevStatus.current === 'offline' && status === 'online') {
      setShowToast(true);
      const timeout = setTimeout(() => setShowToast(false), 4000);
      return () => clearTimeout(timeout);
    }
    prevStatus.current = status;
  }, [status]);

  if (!showToast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-green-50 border border-green-200
                    rounded-lg shadow-lg px-4 py-3 flex items-center gap-2 animate-in
                    slide-in-from-bottom-4">
      <CheckCircle className="w-5 h-5 text-green-600" />
      <p className="text-green-800 text-sm font-medium">Connection restored</p>
    </div>
  );
}
```

---

## Modified Files

### `src/app/(app)/layout.tsx`

Add the `OfflineBanner` and `SyncToast` components:

```diff
  import { redirect } from "next/navigation";
  import { createClient } from "@/lib/supabase/server";
  import { AppHeader } from "@/components/app-header";
+ import { OfflineBanner } from "@/components/offline-banner";
+ import { SyncToast } from "@/components/sync-toast";

  export default async function AppLayout({ children }) {
    // ... existing auth logic ...

    return (
      <div className="min-h-screen bg-cream">
+       <OfflineBanner />
        <AppHeader user={user} />
        <main className="pb-20">{children}</main>
+       <SyncToast />
      </div>
    );
  }
```

---

## UX Behavior

| State | Banner | Toast |
|-------|--------|-------|
| Online (normal) | Hidden | Hidden |
| Checking (initial) | Hidden | Hidden |
| Offline | Shown (amber, non-dismissable) | Hidden |
| Transition: offline → online | Hides | Shows for 4 seconds |
| Online with pending changes | Hidden (sync handles it) | "X changes synced" |

---

## Design Decisions

- **Non-dismissable**: Users must know they're offline. Dismissable banners get ignored.
- **Amber/warning color**: Not red (it's not an error, data is safe). Not green (it's not good news).
- **Pending changes count**: Gives users confidence their work isn't lost.
- **Retry button**: Empowers users to manually trigger reconnection check.
- **No banner during `checking`**: Prevents flash on initial page load.
