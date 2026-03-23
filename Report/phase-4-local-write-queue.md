# Phase 4: Local Write Queue (Offline Mutations)

## Overview

When the user is offline and makes changes (check a packing item, add a todo, edit itinerary), queue those mutations in IndexedDB instead of failing. When Supabase comes back online, the sync engine (Phase 5) processes the queue.

---

## New Files

### `src/lib/db/sync-queue.ts`

**Purpose:** FIFO queue of pending mutations stored in IndexedDB.

```ts
import Dexie, { type Table } from 'dexie';

export type SyncOperation = 'insert' | 'update' | 'delete' | 'upsert';

export interface QueuedMutation {
  id: string;              // Auto-generated UUID
  table: string;           // Supabase table name (e.g., 'trip_todos', 'packing_items')
  operation: SyncOperation;
  recordId?: string;       // ID of the record being modified (for update/delete)
  payload: Record<string, unknown>;  // The data to send
  tripId: string;          // Which trip this belongs to
  createdAt: number;       // Unix timestamp — used for conflict resolution
  retries: number;         // Number of sync attempts
  lastError?: string;      // Last error message if sync failed
  status: 'pending' | 'syncing' | 'failed';
}

class SyncQueueDB extends Dexie {
  mutations!: Table<QueuedMutation, string>;

  constructor() {
    super('govault-sync-queue');

    this.version(1).stores({
      mutations: 'id, table, tripId, status, createdAt',
    });
  }
}

export const syncQueueDb = new SyncQueueDB();

// --- Queue Operations ---

export async function enqueue(mutation: Omit<QueuedMutation, 'id' | 'retries' | 'status'>): Promise<void> {
  await syncQueueDb.mutations.add({
    ...mutation,
    id: crypto.randomUUID(),
    retries: 0,
    status: 'pending',
  });
}

export async function getPendingMutations(): Promise<QueuedMutation[]> {
  return syncQueueDb.mutations
    .where('status')
    .equals('pending')
    .sortBy('createdAt');
}

export async function getFailedMutations(): Promise<QueuedMutation[]> {
  return syncQueueDb.mutations
    .where('status')
    .equals('failed')
    .toArray();
}

export async function getPendingCount(): Promise<number> {
  return syncQueueDb.mutations
    .where('status')
    .anyOf(['pending', 'syncing'])
    .count();
}

export async function markSyncing(id: string): Promise<void> {
  await syncQueueDb.mutations.update(id, { status: 'syncing' });
}

export async function markFailed(id: string, error: string): Promise<void> {
  const mutation = await syncQueueDb.mutations.get(id);
  if (mutation) {
    await syncQueueDb.mutations.update(id, {
      status: 'failed',
      retries: mutation.retries + 1,
      lastError: error,
    });
  }
}

export async function removeMutation(id: string): Promise<void> {
  await syncQueueDb.mutations.delete(id);
}

export async function clearQueue(): Promise<void> {
  await syncQueueDb.mutations.clear();
}

export async function retryFailed(): Promise<void> {
  await syncQueueDb.mutations
    .where('status')
    .equals('failed')
    .modify({ status: 'pending', lastError: undefined });
}
```

---

### `src/lib/db/offline-mutations.ts`

**Purpose:** High-level mutation functions that check online/offline status and either call Supabase directly or queue locally.

```ts
import { useConnectionStore } from '@/lib/stores/connection-store';
import { enqueue } from './sync-queue';
import { db } from './local-cache';

type MutationTarget = {
  table: string;
  tripId: string;
};

// Generic offline-aware mutation wrapper
export async function offlineMutation(
  target: MutationTarget,
  operation: 'insert' | 'update' | 'delete',
  recordId: string | undefined,
  payload: Record<string, unknown>,
  onlineAction: () => Promise<void>,
): Promise<{ queued: boolean }> {
  const status = useConnectionStore.getState().status;

  if (status === 'online') {
    try {
      await onlineAction();
      return { queued: false };
    } catch (error) {
      // If the online action fails, fall through to queue
      console.warn('[GoVault] Online mutation failed, queuing locally:', error);
    }
  }

  // Queue for later sync
  await enqueue({
    table: target.table,
    tripId: target.tripId,
    operation,
    recordId,
    payload,
    createdAt: Date.now(),
  });

  // Also update local cache so the UI reflects the change immediately
  // (specific cache update logic depends on the table)

  useConnectionStore.getState().incrementPending();
  return { queued: true };
}
```

---

## Which Mutations to Support Offline

Not all mutations make sense offline. Prioritize high-frequency user actions:

| Mutation | Table | Offline Support | Reason |
|----------|-------|----------------|--------|
| Toggle packing item | `packing_items` | Yes | Very frequent, simple boolean flip |
| Toggle todo | `trip_todos` | Yes | Very frequent, simple boolean flip |
| Add todo | `trip_todos` | Yes | Users add todos on the go |
| Edit todo | `trip_todos` | Yes | Quick text edits |
| Delete todo | `trip_todos` | Yes | Simple delete |
| Add activity | `activities` | Maybe (Phase 2) | More complex, needs day_id |
| Edit activity | `activities` | Maybe (Phase 2) | Complex nested data |
| Upload document | `documents` + storage | **No** | Requires Supabase Storage upload |
| Create trip | `trips` | **No** | Complex, needs server-side slug generation |
| Delete trip | `trips` | **No** | Destructive, should confirm online |
| Add booking | `bookings` | **No** | Usually done via AI parser, needs server |

---

## Local Cache Update on Queue

When a mutation is queued, the local IndexedDB cache must also be updated so the UI reflects the change immediately:

```ts
// Example: Toggle packing item
export async function togglePackingItemOffline(tripId: string, itemId: string, checked: boolean) {
  return offlineMutation(
    { table: 'packing_items', tripId },
    'update',
    itemId,
    { checked },
    async () => {
      // Online: call API directly
      const response = await fetch(`/api/trips/${tripId}/packing/${itemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ checked }),
      });
      if (!response.ok) throw new Error('Failed to update packing item');
    }
  );

  // Update local cache for immediate UI feedback
  const cached = await db.tripData.get(tripId);
  if (cached) {
    const updatedItems = cached.packing_items.map(item =>
      item.id === itemId ? { ...item, checked } : item
    );
    await db.tripData.update(tripId, { packing_items: updatedItems });
  }
}
```

---

## Integration with Existing API Routes

The existing API routes (`/api/trips/[tripId]/todos`, `/api/trips/[tripId]/bookings`, etc.) remain unchanged. The offline layer intercepts on the **client side** before the fetch call is made.

**Pattern for client components:**

```ts
// Before (online-only):
const response = await fetch(`/api/trips/${tripId}/todos`, { method: 'POST', body });

// After (offline-aware):
const { queued } = await offlineMutation(
  { table: 'trip_todos', tripId },
  'insert',
  undefined,
  todoData,
  () => fetch(`/api/trips/${tripId}/todos`, { method: 'POST', body }),
);
if (queued) {
  // Show "saved locally" indicator
}
```

---

## Concerns

| Concern | Mitigation |
|---------|------------|
| Queue grows large if user is offline for days | Cap at 100 pending mutations; warn user at 80 |
| UUID generation for new records | Use `crypto.randomUUID()` on client; Supabase accepts client-generated UUIDs |
| Ordering matters (e.g., create day then add activity) | Queue is FIFO; related operations maintain order |
| User deletes something they just created offline | Both operations in queue; sync engine processes in order |
| Payload schema mismatch | Queue stores raw payload; sync engine validates before sending |
