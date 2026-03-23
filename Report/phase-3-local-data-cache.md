# Phase 3: Local Data Cache (Read-Only Fallback)

## Overview

Cache all Supabase data in IndexedDB (via Dexie) so that previously viewed trips remain accessible when Supabase is down. This is a **write-through cache** — every successful fetch writes to IndexedDB, and reads fall back to IndexedDB when Supabase fails.

---

## New Files

### `src/lib/db/local-cache.ts`

**Purpose:** Define Dexie database schema and provide cache read/write helpers.

```ts
import Dexie, { type Table } from 'dexie';
import type {
  Trip, Traveler, Booking, ItineraryDay, Activity,
  SurvivalTip, Phrase, PackingItem, EmergencyContact, TripTodo,
} from '@/lib/types';

// Extended types with cache metadata
interface CachedTrip extends Trip {
  _cachedAt: number; // Unix timestamp
}

interface CachedTripData {
  tripId: string;
  travelers: Traveler[];
  bookings: Booking[];
  itinerary_days: (ItineraryDay & { activities: Activity[] })[];
  survival_tips: SurvivalTip[];
  phrases: Phrase[];
  packing_items: PackingItem[];
  emergency_contacts: EmergencyContact[];
  todos: TripTodo[];
  _cachedAt: number;
}

class GoVaultDB extends Dexie {
  trips!: Table<CachedTrip, string>;
  tripData!: Table<CachedTripData, string>;

  constructor() {
    super('govault-cache');

    this.version(1).stores({
      trips: 'id, owner_id, slug, _cachedAt',
      tripData: 'tripId, _cachedAt',
    });
  }
}

export const db = new GoVaultDB();

// --- Cache Writers (called after successful Supabase fetches) ---

export async function cacheTrips(trips: Trip[]): Promise<void> {
  const now = Date.now();
  await db.trips.bulkPut(
    trips.map(t => ({ ...t, _cachedAt: now }))
  );
}

export async function cacheTripData(
  tripId: string,
  data: Omit<CachedTripData, 'tripId' | '_cachedAt'>
): Promise<void> {
  await db.tripData.put({
    tripId,
    ...data,
    _cachedAt: Date.now(),
  });
}

// --- Cache Readers (called when Supabase fails) ---

export async function getCachedTrips(ownerId: string): Promise<CachedTrip[] | null> {
  const trips = await db.trips.where('owner_id').equals(ownerId).toArray();
  return trips.length > 0 ? trips : null;
}

export async function getCachedTripBySlug(slug: string): Promise<CachedTrip | null> {
  return await db.trips.where('slug').equals(slug).first() ?? null;
}

export async function getCachedTripById(id: string): Promise<CachedTrip | null> {
  return await db.trips.get(id) ?? null;
}

export async function getCachedTripData(tripId: string): Promise<CachedTripData | null> {
  return await db.tripData.get(tripId) ?? null;
}

// --- Cache Management ---

export async function clearCache(): Promise<void> {
  await db.trips.clear();
  await db.tripData.clear();
}

export async function getCacheAge(tripId: string): Promise<number | null> {
  const data = await db.tripData.get(tripId);
  return data ? Date.now() - data._cachedAt : null;
}
```

**Schema design decisions:**
- **Two tables**: `trips` (list view) and `tripData` (detail view with all relations)
- **`_cachedAt` timestamp**: Know how stale the data is
- **No documents table**: Documents contain base64 data that would exhaust IndexedDB storage
- **Flat `tripData`**: Store all related data (travelers, bookings, days, etc.) in one record per trip — simpler than 9 separate tables, and we always load all of it together

---

## Modified Files

### `src/app/(app)/trips/page.tsx`

**Current behavior:** Fetches trips from Supabase. Shows error if fetch fails.

**New behavior:** Try Supabase first → cache result. If Supabase fails → serve from cache with stale indicator.

```diff
  import { createClient } from "@/lib/supabase/server";
+ import { cacheTrips, getCachedTrips } from "@/lib/db/local-cache";

  export default async function TripsPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ... existing user check ...

    let trips = null;
    let error = null;
+   let fromCache = false;

    try {
      const result = await supabase
        .from("trips")
        .select(`*, travelers (*), trip_todos (*), bookings (*), itinerary_days (*)`)
        .eq("owner_id", user.id)
        .order("start_date", { ascending: true });

      trips = result.data;
      error = result.error;
+
+     // Cache successful fetch
+     if (trips && trips.length > 0) {
+       await cacheTrips(trips);
+     }
    } catch (e) {
      console.error("Failed to fetch trips:", e);
-     error = e;
+     // Try local cache
+     const cached = await getCachedTrips(user.id);
+     if (cached) {
+       trips = cached;
+       fromCache = true;
+     } else {
+       error = e;
+     }
    }

    // ... rest of component ...
+   // Pass fromCache to UI to show stale data indicator
  }
```

### `src/app/(app)/trips/[slug]/page.tsx`

**Current behavior:** Fetches trip + all related data from Supabase. Shows 404 if not found.

**New behavior:** Try Supabase → cache all data. If Supabase fails → load from cache.

```diff
  import { createClient } from "@/lib/supabase/server";
+ import { cacheTripData, getCachedTripById, getCachedTripBySlug, getCachedTripData } from "@/lib/db/local-cache";

  export default async function TripDetailPage({ params }: PageProps) {
    const { slug } = await params;
    const supabase = await createClient();

    // ... existing trip lookup ...

+   // If Supabase fetch fails, try cache
+   if (error || !trip) {
+     const cached = isUUID(slug)
+       ? await getCachedTripById(slug)
+       : await getCachedTripBySlug(slug);
+
+     if (cached) {
+       trip = cached;
+       error = null;
+       // Load full trip data from cache
+       const cachedData = await getCachedTripData(cached.id);
+       // ... use cachedData for travelers, bookings, days, etc.
+     }
+   }

    // After successful Supabase fetch, cache everything:
+   if (!fromCache) {
+     await cacheTripData(tripId, {
+       travelers: travelers || [],
+       bookings: bookings || [],
+       itinerary_days: days || [],
+       survival_tips: survivalTips || [],
+       phrases: phrases || [],
+       packing_items: packingItems || [],
+       emergency_contacts: emergencyContacts || [],
+       todos: todos || [],
+     });
+   }

    // ... rest of component ...
  }
```

---

## Stale Data Indicator

When serving from cache, show a subtle indicator:

```tsx
{fromCache && (
  <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-center">
    <p className="text-blue-700 text-xs">
      Showing cached data from {formatTimeAgo(cacheAge)}. Some information may be outdated.
    </p>
  </div>
)}
```

---

## What Gets Cached vs What Doesn't

| Data | Cached | Reason |
|------|--------|--------|
| Trip metadata | Yes | Small, essential |
| Travelers | Yes | Small, needed for display |
| Bookings (flights, hotels) | Yes | Core trip data |
| Itinerary days + activities | Yes | Core trip data |
| Survival tips | Yes | Small, static |
| Phrases | Yes | Small, static |
| Packing items | Yes | Small, user edits often |
| Emergency contacts | Yes | Critical safety data |
| Todos | Yes | User edits often |
| Documents (files) | **No** | Base64 data too large for IndexedDB |
| Document metadata | Yes | Small, shows document list |
| Expenses | Yes | Core trip data |

---

## Concerns

| Concern | Mitigation |
|---------|------------|
| Cache grows indefinitely | Add a `clearOldCache()` that removes trips not viewed in 30 days |
| Dexie runs only on client | Cache writes happen in client components or API calls; server components pass data to client for caching |
| IndexedDB blocked in private browsing (Safari) | Wrap all Dexie calls in try/catch; degrade to no-cache silently |
| Stale cache shows deleted trips | Cache has `_cachedAt`; could add TTL-based eviction |
