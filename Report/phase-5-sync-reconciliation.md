# Phase 5: Sync & Reconciliation

## Overview

When the connection restores (detected by health check transitioning from `offline` → `online`), process the pending mutation queue and reconcile local changes with the server.

---

## New Files

### `src/lib/db/sync-engine.ts`

**Purpose:** Flush the sync queue to Supabase in FIFO order, handle errors, and notify the user.

```ts
import { createClient } from '@/lib/supabase/client';
import {
  getPendingMutations,
  markSyncing,
  markFailed,
  removeMutation,
  type QueuedMutation,
} from './sync-queue';
import { useConnectionStore } from '@/lib/stores/connection-store';

const MAX_RETRIES = 3;

interface SyncResult {
  total: number;
  synced: number;
  failed: number;
  errors: Array<{ mutation: QueuedMutation; error: string }>;
}

export async function flushSyncQueue(): Promise<SyncResult> {
  const mutations = await getPendingMutations();
  const result: SyncResult = { total: mutations.length, synced: 0, failed: 0, errors: [] };

  if (mutations.length === 0) return result;

  const supabase = createClient();

  for (const mutation of mutations) {
    // Skip if exceeded max retries
    if (mutation.retries >= MAX_RETRIES) {
      await markFailed(mutation.id, `Exceeded ${MAX_RETRIES} retry attempts`);
      result.failed++;
      result.errors.push({ mutation, error: 'Max retries exceeded' });
      continue;
    }

    await markSyncing(mutation.id);

    try {
      await executeMutation(supabase, mutation);
      await removeMutation(mutation.id);
      result.synced++;
      useConnectionStore.getState().decrementPending();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      await markFailed(mutation.id, errorMsg);
      result.failed++;
      result.errors.push({ mutation, error: errorMsg });
    }
  }

  return result;
}

async function executeMutation(supabase: ReturnType<typeof createClient>, mutation: QueuedMutation) {
  const { table, operation, recordId, payload } = mutation;

  switch (operation) {
    case 'insert': {
      const { error } = await supabase.from(table).insert(payload);
      if (error) throw new Error(`Insert failed: ${error.message}`);
      break;
    }

    case 'update': {
      if (!recordId) throw new Error('Update requires recordId');
      const { error } = await supabase.from(table).update(payload).eq('id', recordId);
      if (error) throw new Error(`Update failed: ${error.message}`);
      break;
    }

    case 'delete': {
      if (!recordId) throw new Error('Delete requires recordId');
      const { error } = await supabase.from(table).delete().eq('id', recordId);
      if (error) throw new Error(`Delete failed: ${error.message}`);
      break;
    }

    case 'upsert': {
      const { error } = await supabase.from(table).upsert(payload);
      if (error) throw new Error(`Upsert failed: ${error.message}`);
      break;
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
```

---

### `src/lib/db/sync-watcher.ts`

**Purpose:** React hook that watches for online transition and triggers sync automatically.

```ts
"use client";

import { useEffect, useRef } from 'react';
import { useConnectionStore } from '@/lib/stores/connection-store';
import { flushSyncQueue } from './sync-engine';
import { getPendingCount } from './sync-queue';

export function useSyncOnReconnect(
  onSyncComplete?: (result: { synced: number; failed: number }) => void
) {
  const status = useConnectionStore(s => s.status);
  const prevStatus = useRef(status);
  const syncing = useRef(false);

  useEffect(() => {
    // Detect offline → online transition
    if (prevStatus.current === 'offline' && status === 'online' && !syncing.current) {
      syncing.current = true;

      (async () => {
        const pendingCount = await getPendingCount();
        if (pendingCount === 0) {
          syncing.current = false;
          return;
        }

        console.log(`[GoVault] Connection restored. Syncing ${pendingCount} pending changes...`);
        const result = await flushSyncQueue();

        console.log(`[GoVault] Sync complete: ${result.synced} synced, ${result.failed} failed`);

        if (result.errors.length > 0) {
          console.warn('[GoVault] Failed mutations:', result.errors);
        }

        onSyncComplete?.({ synced: result.synced, failed: result.failed });
        syncing.current = false;
      })();
    }

    prevStatus.current = status;
  }, [status, onSyncComplete]);
}
```

---

## Conflict Resolution Strategy: Last-Write-Wins

```
Timeline:
  User A (offline):  edits todo title at T=100  → queued locally
  User B (online):   edits same todo at T=150   → saved to Supabase
  User A reconnects: sync queue sends update     → overwrites User B's change (T=100 < T=150)
```

**Why last-write-wins?**
- Simple, predictable behavior
- GoVault is primarily a single-user app (co-planners are rare)
- Full CRDT or operational transform is massive overkill
- Supabase's `updated_at` column provides server-side timestamps

**Enhancement for later:** Before syncing, compare `createdAt` (local queue timestamp) with the record's `updated_at` on the server. If server is newer, flag as conflict instead of blindly overwriting.

---

## Integration with SyncToast (Phase 2)

Update the `SyncToast` component to show sync results:

```tsx
export function SyncToast() {
  const [syncResult, setSyncResult] = useState<{ synced: number; failed: number } | null>(null);

  useSyncOnReconnect((result) => {
    setSyncResult(result);
    setTimeout(() => setSyncResult(null), 5000);
  });

  if (!syncResult) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 ...">
      {syncResult.failed === 0 ? (
        <p>✓ {syncResult.synced} changes synced successfully</p>
      ) : (
        <p>⚠ {syncResult.synced} synced, {syncResult.failed} failed — tap to review</p>
      )}
    </div>
  );
}
```

---

## Failed Sync Review UI

For mutations that fail after 3 retries, show a review panel:

```
┌──────────────────────────────────────────────┐
│  ⚠ 2 changes couldn't be synced             │
│                                              │
│  ☐ Update todo "Book temple tour"            │
│    Error: Record not found (deleted by       │
│    another user)                             │
│    [Retry] [Discard]                         │
│                                              │
│  ☐ Toggle packing item "Sunscreen"           │
│    Error: Network timeout                    │
│    [Retry] [Discard]                         │
│                                              │
│  [Retry All]  [Discard All]                  │
└──────────────────────────────────────────────┘
```

This could be a modal dialog or an expandable section in the offline banner.

---

## Processing Order & Edge Cases

| Scenario | Handling |
|----------|---------|
| Create then update same record | Process in FIFO order; create runs first, then update |
| Create then delete same record | Both run in order; create then delete. Net effect: no record |
| Update a record that was deleted on server | Sync fails → mark as failed → user reviews |
| Two updates to same record | Both run in order; last one wins |
| Insert with client-generated UUID conflicts with server | Supabase rejects duplicate; mark as failed |
| Queue has 50+ items | Process all sequentially; show progress bar |

---

## Concerns

| Concern | Mitigation |
|---------|------------|
| Sync takes too long with many items | Process in batches of 10 with progress indicator |
| Network drops again mid-sync | `markSyncing` items that were in flight get stuck; add a cleanup that resets `syncing` → `pending` on startup |
| RLS denies the mutation | Catch Supabase error, mark as failed with clear message |
| User closes tab during sync | Mutations remain in queue; next session picks up where it left off |
| Concurrent sync from multiple tabs | Use Dexie's built-in locking; or add a `syncing` flag in localStorage |
