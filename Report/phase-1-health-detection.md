# Phase 1: Supabase Health Detection

## Overview

Detect whether Supabase is reachable and expose connection status to the entire app via a Zustand store. This is the foundation for all offline behavior.

---

## New Files

### `src/lib/supabase/health.ts`

**Purpose:** Lightweight health check function with retry logic.

```ts
import { createClient } from './client';

export type SupabaseStatus = 'online' | 'offline' | 'checking';

const RETRY_ATTEMPTS = 2;
const RETRY_DELAY_MS = 2000;
const HEALTH_TIMEOUT_MS = 3000;

export async function checkSupabaseHealth(): Promise<SupabaseStatus> {
  for (let attempt = 1; attempt <= RETRY_ATTEMPTS; attempt++) {
    try {
      const supabase = createClient();
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);

      // Use getSession() instead of getUser() — it reads from local cache first,
      // then validates with the server. Lighter than getUser() which always hits the server.
      await supabase.auth.getSession();

      clearTimeout(timeout);
      return 'online';
    } catch (error) {
      console.warn(`[GoVault] Health check attempt ${attempt}/${RETRY_ATTEMPTS} failed:`, error);

      if (attempt < RETRY_ATTEMPTS) {
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  return 'offline';
}
```

**Key design choices:**
- Uses `getSession()` not `getUser()` — lighter, uses cached session first
- 3-second timeout (shorter than the 5s client timeout) for faster detection
- 2 retries with 2-second gap to avoid false positives from transient network blips
- Returns simple status enum, no exceptions thrown

---

### `src/lib/stores/connection-store.ts`

**Purpose:** Global Zustand store that tracks connection status and triggers periodic health checks.

```ts
import { create } from 'zustand';
import { checkSupabaseHealth, type SupabaseStatus } from '@/lib/supabase/health';

interface ConnectionState {
  status: SupabaseStatus;
  lastOnline: Date | null;
  lastChecked: Date | null;
  pendingChanges: number;

  // Actions
  checkNow: () => Promise<void>;
  startPolling: () => () => void;   // returns cleanup function
  incrementPending: () => void;
  decrementPending: (count?: number) => void;
  resetPending: () => void;
}

const POLL_INTERVAL_ONLINE = 60_000;   // 60s when online
const POLL_INTERVAL_OFFLINE = 30_000;  // 30s when offline (check more often)

export const useConnectionStore = create<ConnectionState>((set, get) => ({
  status: 'checking',
  lastOnline: null,
  lastChecked: null,
  pendingChanges: 0,

  checkNow: async () => {
    const result = await checkSupabaseHealth();
    set({
      status: result,
      lastChecked: new Date(),
      ...(result === 'online' ? { lastOnline: new Date() } : {}),
    });
  },

  startPolling: () => {
    // Immediately check
    get().checkNow();

    const intervalId = setInterval(() => {
      const { status } = get();
      const interval = status === 'online' ? POLL_INTERVAL_ONLINE : POLL_INTERVAL_OFFLINE;
      // Only re-check if enough time has passed
      const lastChecked = get().lastChecked;
      if (!lastChecked || Date.now() - lastChecked.getTime() >= interval) {
        get().checkNow();
      }
    }, POLL_INTERVAL_OFFLINE); // Use shorter interval as the tick rate

    return () => clearInterval(intervalId);
  },

  incrementPending: () => set(s => ({ pendingChanges: s.pendingChanges + 1 })),
  decrementPending: (count = 1) => set(s => ({ pendingChanges: Math.max(0, s.pendingChanges - count) })),
  resetPending: () => set({ pendingChanges: 0 }),
}));
```

**Polling strategy:**
- When **online**: check every 60 seconds (don't waste bandwidth)
- When **offline**: check every 30 seconds (detect recovery faster)
- `startPolling()` returns a cleanup function for React `useEffect`
- `checkNow()` can be called manually (e.g., "Retry now" button)

---

## Integration Points

1. **`src/app/(app)/layout.tsx`** — Initialize polling on mount via a client component wrapper
2. **`src/components/offline-banner.tsx`** (Phase 2) — Reads `status` from store
3. **`src/lib/db/sync-engine.ts`** (Phase 5) — Watches for `online` transition to trigger sync

---

## Concerns & Mitigations

| Concern | Mitigation |
|---------|------------|
| `getSession()` might succeed even if DB is down (cached token) | Phase 2 banner also triggers on fetch errors in data-loading components |
| Polling drains battery on mobile | 60s interval when online is conservative; could add `visibilitychange` listener to pause when tab is hidden |
| False positive "offline" from slow network | 2 retries with 2s gap; 3s timeout is generous for a health check |
| Store resets on page navigation (SSR) | Zustand persists in-memory across client navigations; SSR pages don't read it |
