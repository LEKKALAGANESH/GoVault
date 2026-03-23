# Technical Architecture

## Overview

GoVault is a **PWA-first**, **offline-capable**, **AI-powered** travel companion with a focus on mobile experience.

---

## Tech Stack

### Frontend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **Next.js 14** (App Router) | SSR, great DX, easy deployment |
| Language | **TypeScript** | Type safety, better tooling |
| Styling | **Tailwind CSS** | Rapid UI development, small bundle |
| UI Components | **shadcn/ui** | Beautiful, accessible, customizable |
| State Management | **Zustand** | Simple, works well with offline |
| Forms | **React Hook Form + Zod** | Validation, good UX |
| PWA | **next-pwa** | Service worker, offline support |
| Offline Storage | **IndexedDB (Dexie.js)** | Local-first data storage |

### Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js** | JavaScript ecosystem |
| Framework | **Next.js API Routes** | Unified codebase, serverless |
| Database | **PostgreSQL** (Supabase) | Relational, great for structured data |
| ORM | **Prisma** | Type-safe queries, migrations |
| Auth | **Supabase Auth** | Social login, magic link, JWT |
| File Storage | **Supabase Storage** / Cloudflare R2 | Document uploads |
| Real-time | **Supabase Realtime** | Live updates for shared trips |

### AI
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Primary Model | **Google Gemini 2.0 Flash** | Fast, multimodal, cost-effective |
| Fallback Model | **Gemini 2.5 Pro** | Complex reasoning |
| SDK | **@google/generative-ai** | Official SDK |
| Structured Output | **Zod + AI SDK** | Type-safe AI responses |

### Infrastructure
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Hosting | **Vercel** | Easy Next.js deployment, edge functions |
| Database | **Supabase** (managed Postgres) | Generous free tier, real-time |
| CDN | **Vercel Edge** | Fast static assets |
| Email | **Resend** | Transactional emails, webhooks |
| Monitoring | **Vercel Analytics + Sentry** | Performance, error tracking |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (PWA)                             │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Next.js App (React)                                     │    │
│  │  ├── Pages/Routes                                        │    │
│  │  ├── Components (shadcn/ui)                              │    │
│  │  ├── Zustand Store                                       │    │
│  │  └── Dexie.js (IndexedDB)  ←── Offline Data             │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                    Service Worker (PWA)                          │
│                    ├── Cache API responses                       │
│                    ├── Background sync                           │
│                    └── Push notifications                        │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE / API                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  Next.js API Routes                                      │    │
│  │  ├── /api/trips/*         Trip CRUD                      │    │
│  │  ├── /api/bookings/*      Booking management             │    │
│  │  ├── /api/expenses/*      Expense tracking               │    │
│  │  ├── /api/ai/*            AI endpoints                   │    │
│  │  ├── /api/auth/*          Authentication                 │    │
│  │  └── /api/webhooks/*      Email ingestion                │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
┌──────────────────┐  ┌──────────────┐  ┌──────────────────┐
│    SUPABASE      │  │   GEMINI AI  │  │   FILE STORAGE   │
│  ┌────────────┐  │  │              │  │                  │
│  │ PostgreSQL │  │  │ 2.0 Flash   │  │  Supabase Storage│
│  │            │  │  │ 2.5 Pro     │  │  or              │
│  │ • Users    │  │  │              │  │  Cloudflare R2   │
│  │ • Trips    │  │  │ Tools:       │  │                  │
│  │ • Bookings │  │  │ • Parse     │  │  • Documents     │
│  │ • Expenses │  │  │ • Generate  │  │  • Receipts      │
│  │ • Documents│  │  │ • Chat      │  │  • Photos        │
│  │ • Ratings  │  │  │              │  │                  │
│  └────────────┘  │  └──────────────┘  └──────────────────┘
│                  │
│  ┌────────────┐  │
│  │ Realtime   │  │  ← Live updates for shared trips
│  └────────────┘  │
│                  │
│  ┌────────────┐  │
│  │ Auth       │  │  ← Google, Email magic link
│  └────────────┘  │
└──────────────────┘
```

---

## Database Schema

### Core Tables

```prisma
// schema.prisma

// ============ USERS ============
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  avatar_url    String?
  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  owned_trips   Trip[]    @relation("TripOwner")
  trip_members  TripMember[]
  expenses_paid Expense[] @relation("ExpensePayer")
}

// ============ TRIPS ============
model Trip {
  id            String    @id @default(cuid())
  name          String
  destinations  String[]  // Array of city/country names
  start_date    DateTime
  end_date      DateTime
  cover_image   String?
  status        TripStatus @default(PLANNING)

  owner_id      String
  owner         User      @relation("TripOwner", fields: [owner_id], references: [id])

  // Settings
  budget_total  Decimal?
  budget_currency String  @default("INR")
  home_currency String    @default("INR")

  // Sharing
  viewer_link_id String?  @unique @default(cuid())
  viewer_settings Json?   // {hide_costs, hide_refs, show_photos, show_ratings}

  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  // Relations
  members       TripMember[]
  travelers     Traveler[]
  bookings      Booking[]
  itinerary_days ItineraryDay[]
  expenses      Expense[]
  documents     Document[]
  ratings       Rating[]
}

enum TripStatus {
  PLANNING
  ACTIVE
  COMPLETED
  ARCHIVED
}

// ============ TRIP MEMBERS ============
model TripMember {
  id        String    @id @default(cuid())
  trip_id   String
  user_id   String
  role      MemberRole
  joined_at DateTime  @default(now())

  trip      Trip      @relation(fields: [trip_id], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [user_id], references: [id])

  @@unique([trip_id, user_id])
}

enum MemberRole {
  OWNER
  CO_PLANNER
  VIEWER
}

// ============ TRAVELERS ============
model Traveler {
  id            String    @id @default(cuid())
  trip_id       String
  name          String
  age           Int?
  relationship  String?   // Self, Spouse, Child, Parent, Friend

  // Special needs
  dietary       String[]  // vegetarian, vegan, gluten-free, etc.
  mobility      String?   // wheelchair, limited-walking, etc.
  notes         String?

  trip          Trip      @relation(fields: [trip_id], references: [id], onDelete: Cascade)

  // Relations
  expense_splits ExpenseSplit[]
}

// ============ BOOKINGS ============
model Booking {
  id            String      @id @default(cuid())
  trip_id       String
  type          BookingType
  status        BookingStatus @default(CONFIRMED)

  // Common fields
  provider      String?     // Airline name, Hotel name, etc.
  confirmation  String?     // PNR, Booking ref

  // Type-specific data stored as JSON
  details       Json        // FlightDetails | HotelDetails | TransportDetails | ActivityDetails

  // Cost
  cost_amount   Decimal?
  cost_currency String?

  // Metadata
  source        String?     // manual, email_import, document_scan
  raw_import    Json?       // Original parsed data

  created_at    DateTime    @default(now())
  updated_at    DateTime    @updatedAt

  trip          Trip        @relation(fields: [trip_id], references: [id], onDelete: Cascade)
  documents     Document[]
  itinerary_items ItineraryItem[]
}

enum BookingType {
  FLIGHT
  HOTEL
  TRANSPORT
  ACTIVITY
}

enum BookingStatus {
  CONFIRMED
  PENDING
  CANCELLED
}

// Type-specific details (stored in `details` JSON field)
//
// FlightDetails {
//   flight_number: string
//   airline: string
//   departure: { airport: string, city: string, time: DateTime }
//   arrival: { airport: string, city: string, time: DateTime }
//   duration_minutes: number
//   seats: { traveler_id: string, seat: string }[]
//   ticket_numbers: { traveler_id: string, ticket: string }[]
// }
//
// HotelDetails {
//   name: string
//   address: string
//   coordinates: { lat: number, lng: number }
//   check_in: DateTime
//   check_out: DateTime
//   room_type: string
//   contact_phone: string
//   notes: string
// }
//
// TransportDetails {
//   transport_type: 'train' | 'bus' | 'car_rental' | 'transfer' | 'ferry'
//   pickup: { location: string, time: DateTime }
//   dropoff: { location: string, time: DateTime }
//   vehicle_type?: string
// }
//
// ActivityDetails {
//   name: string
//   location: string
//   date: DateTime
//   duration_minutes: number
//   meeting_point: string
//   ticket_count: number
// }

// ============ ITINERARY ============
model ItineraryDay {
  id        String    @id @default(cuid())
  trip_id   String
  date      DateTime
  day_number Int
  location  String?
  notes     String?

  trip      Trip      @relation(fields: [trip_id], references: [id], onDelete: Cascade)
  items     ItineraryItem[]

  @@unique([trip_id, date])
}

model ItineraryItem {
  id            String    @id @default(cuid())
  day_id        String

  type          ItemType
  title         String
  description   String?

  start_time    DateTime?
  end_time      DateTime?

  location      String?
  location_coords Json?   // { lat, lng }

  status        ItemStatus @default(CONFIRMED)

  // Link to booking if applicable
  booking_id    String?
  booking       Booking?  @relation(fields: [booking_id], references: [id])

  // Link to expense if applicable
  expense_id    String?

  // Ordering
  sort_order    Int       @default(0)

  day           ItineraryDay @relation(fields: [day_id], references: [id], onDelete: Cascade)

  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt
}

enum ItemType {
  FLIGHT
  CHECKIN
  CHECKOUT
  ACTIVITY
  MEAL
  TRANSPORT
  FREE_TIME
  CUSTOM
}

enum ItemStatus {
  CONFIRMED
  TENTATIVE
  COMPLETED
  CANCELLED
}

// ============ EXPENSES ============
model Expense {
  id            String    @id @default(cuid())
  trip_id       String

  amount        Decimal
  currency      String

  // Converted to home currency
  amount_home   Decimal?
  exchange_rate Decimal?

  category      ExpenseCategory
  subcategory   String?

  description   String?
  merchant      String?

  date          DateTime  @default(now())

  // Payment
  payment_method String?
  paid_by_id    String?
  paid_by       User?     @relation("ExpensePayer", fields: [paid_by_id], references: [id])

  // Split
  is_split      Boolean   @default(false)
  splits        ExpenseSplit[]

  // Source
  source        String?   // manual, receipt_scan, chat
  receipt_url   String?

  created_at    DateTime  @default(now())
  updated_at    DateTime  @updatedAt

  trip          Trip      @relation(fields: [trip_id], references: [id], onDelete: Cascade)
}

enum ExpenseCategory {
  FOOD
  TRANSPORT
  ACCOMMODATION
  ACTIVITIES
  SHOPPING
  HEALTH
  COMMUNICATION
  TIPS
  OTHER
}

model ExpenseSplit {
  id          String    @id @default(cuid())
  expense_id  String
  traveler_id String
  amount      Decimal

  expense     Expense   @relation(fields: [expense_id], references: [id], onDelete: Cascade)
  traveler    Traveler  @relation(fields: [traveler_id], references: [id])

  @@unique([expense_id, traveler_id])
}

// ============ DOCUMENTS ============
model Document {
  id          String    @id @default(cuid())
  trip_id     String

  name        String
  type        DocumentType
  mime_type   String
  file_url    String
  file_size   Int

  // Link to booking if applicable
  booking_id  String?
  booking     Booking?  @relation(fields: [booking_id], references: [id])

  // Link to traveler if applicable
  traveler_id String?

  // AI-extracted data
  extracted_data Json?

  created_at  DateTime  @default(now())

  trip        Trip      @relation(fields: [trip_id], references: [id], onDelete: Cascade)
}

enum DocumentType {
  BOARDING_PASS
  HOTEL_VOUCHER
  TICKET
  PASSPORT
  VISA
  INSURANCE
  RECEIPT
  OTHER
}

// ============ RATINGS ============
model Rating {
  id          String    @id @default(cuid())
  trip_id     String

  place_name  String
  place_type  PlaceType
  place_address String?
  place_coords Json?     // { lat, lng }
  google_place_id String?

  rating      Int       // 1-5
  tags        String[]  // kid-friendly, veg-options, etc.
  review      String?
  photos      String[]  // URLs

  visited_date DateTime?

  visibility  Visibility @default(SHARED)

  created_at  DateTime  @default(now())
  updated_at  DateTime  @updatedAt

  trip        Trip      @relation(fields: [trip_id], references: [id], onDelete: Cascade)
}

enum PlaceType {
  RESTAURANT
  HOTEL
  ACTIVITY
  ATTRACTION
  SHOP
  OTHER
}

enum Visibility {
  PRIVATE
  SHARED
  PUBLIC
}
```

---

## API Structure

### REST Endpoints

```
Authentication
POST   /api/auth/login          # Magic link / Google OAuth
POST   /api/auth/logout
GET    /api/auth/me             # Current user

Trips
GET    /api/trips               # List user's trips
POST   /api/trips               # Create trip
GET    /api/trips/:id           # Get trip details
PUT    /api/trips/:id           # Update trip
DELETE /api/trips/:id           # Delete trip
GET    /api/trips/:id/share     # Get viewer link data (public)

Trip Members
GET    /api/trips/:id/members
POST   /api/trips/:id/members   # Invite member
DELETE /api/trips/:id/members/:memberId

Travelers
GET    /api/trips/:id/travelers
POST   /api/trips/:id/travelers
PUT    /api/trips/:id/travelers/:travelerId
DELETE /api/trips/:id/travelers/:travelerId

Bookings
GET    /api/trips/:id/bookings
POST   /api/trips/:id/bookings
GET    /api/trips/:id/bookings/:bookingId
PUT    /api/trips/:id/bookings/:bookingId
DELETE /api/trips/:id/bookings/:bookingId

Itinerary
GET    /api/trips/:id/itinerary              # Full itinerary
GET    /api/trips/:id/itinerary/:date        # Single day
POST   /api/trips/:id/itinerary/items        # Add item
PUT    /api/trips/:id/itinerary/items/:itemId
DELETE /api/trips/:id/itinerary/items/:itemId
PUT    /api/trips/:id/itinerary/reorder      # Reorder items

Expenses
GET    /api/trips/:id/expenses
POST   /api/trips/:id/expenses
PUT    /api/trips/:id/expenses/:expenseId
DELETE /api/trips/:id/expenses/:expenseId
GET    /api/trips/:id/expenses/summary       # Category breakdown

Documents
GET    /api/trips/:id/documents
POST   /api/trips/:id/documents              # Upload
DELETE /api/trips/:id/documents/:docId
GET    /api/trips/:id/documents/:docId/url   # Signed download URL

Ratings
GET    /api/trips/:id/ratings
POST   /api/trips/:id/ratings
PUT    /api/trips/:id/ratings/:ratingId
DELETE /api/trips/:id/ratings/:ratingId

AI Endpoints
POST   /api/ai/parse-email      # Parse forwarded booking email
POST   /api/ai/parse-document   # Parse uploaded document/image
POST   /api/ai/parse-receipt    # Parse receipt image
POST   /api/ai/parse-expense    # Parse natural language expense
POST   /api/ai/chat             # Chat with trip context
POST   /api/ai/generate-itinerary  # Generate itinerary from requirements
POST   /api/ai/suggest-activities  # Get activity suggestions

Webhooks
POST   /api/webhooks/email      # Incoming forwarded emails (from Resend)

Utilities
GET    /api/currency/rates      # Exchange rates
GET    /api/places/search       # Google Places search
```

---

## AI Integration Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Request Flow                           │
└─────────────────────────────────────────────────────────────┘

User Action (e.g., upload receipt)
         │
         ▼
┌─────────────────────┐
│  /api/ai/parse-*    │
│                     │
│  1. Validate input  │
│  2. Load trip ctx   │
│  3. Build prompt    │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  AI Service Layer   │
│                     │
│  • Select model     │
│  • Add tools        │
│  • Set JSON schema  │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Google Gemini API  │
│                     │
│  gemini-2.0-flash   │
│  (multimodal)       │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Response Parser    │
│                     │
│  • Validate schema  │
│  • Handle errors    │
│  • Extract data     │
└─────────────────────┘
         │
         ▼
┌─────────────────────┐
│  Return to Client   │
│                     │
│  • Draft object     │
│  • Confidence score │
│  • Clarifications   │
└─────────────────────┘
```

### AI Service Code Structure

```typescript
// lib/ai/agent.ts

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function runAgent(params: {
  task: "parse_email" | "parse_document" | "parse_receipt" | "parse_expense" | "chat" | "generate_itinerary";
  input: string | { text?: string; image?: string };
  tripContext?: TripContext;
}) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const systemPrompt = getSystemPrompt(params.task, params.tripContext);
  const userPrompt = buildUserPrompt(params.task, params.input);

  const result = await model.generateContent([
    { role: "user", parts: [{ text: systemPrompt + "\n\n" + userPrompt }] },
  ]);

  const response = JSON.parse(result.response.text());
  return validateResponse(params.task, response);
}

// lib/ai/prompts.ts

export function getSystemPrompt(task: string, context?: TripContext): string {
  const baseContext = context ? `
Trip Context:
- Name: ${context.name}
- Dates: ${context.start_date} to ${context.end_date}
- Destinations: ${context.destinations.join(", ")}
- Travelers: ${context.travelers.map(t => `${t.name} (${t.age || "adult"})`).join(", ")}
- Budget: ${context.budget_total} ${context.budget_currency}
` : "";

  const prompts: Record<string, string> = {
    parse_email: `You are a travel booking parser. Extract structured booking data from the email.
${baseContext}
Return JSON matching this schema:
{
  "type": "flight" | "hotel" | "transport" | "activity",
  "provider": string,
  "confirmation": string,
  "details": { ... type-specific fields },
  "cost": { "amount": number, "currency": string },
  "confidence": 0-1
}`,

    parse_receipt: `You are an expense parser. Extract expense details from this receipt image.
${baseContext}
Return JSON:
{
  "amount": number,
  "currency": string,
  "merchant": string,
  "category": "food" | "transport" | "activity" | "shopping" | "other",
  "date": "YYYY-MM-DD",
  "confidence": 0-1
}`,

    // ... other prompts
  };

  return prompts[task];
}
```

---

## Offline & Sync Strategy

### Local-First Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    OFFLINE STRATEGY                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│   User Action   │────▶│  Local Store    │────▶│    UI       │
│                 │     │  (IndexedDB)    │     │   Update    │
└─────────────────┘     └─────────────────┘     └─────────────┘
                               │
                               │ Background Sync
                               ▼
                        ┌─────────────────┐
                        │   Sync Queue    │
                        │                 │
                        │ • Create ops    │
                        │ • Update ops    │
                        │ • Delete ops    │
                        └─────────────────┘
                               │
                               │ When online
                               ▼
                        ┌─────────────────┐
                        │   Server API    │
                        └─────────────────┘
```

### IndexedDB Schema (Dexie.js)

```typescript
// lib/db/local.ts

import Dexie, { Table } from 'dexie';

interface LocalTrip {
  id: string;
  data: Trip;
  lastSynced: number;
  pendingChanges: boolean;
}

interface LocalBooking {
  id: string;
  tripId: string;
  data: Booking;
  lastSynced: number;
  pendingChanges: boolean;
}

interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  recordId: string;
  data: any;
  timestamp: number;
  status: 'pending' | 'syncing' | 'failed';
  retries: number;
}

class GoVaultDB extends Dexie {
  trips!: Table<LocalTrip>;
  bookings!: Table<LocalBooking>;
  expenses!: Table<LocalExpense>;
  documents!: Table<LocalDocument>;
  itineraryItems!: Table<LocalItineraryItem>;
  ratings!: Table<LocalRating>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('govault');
    this.version(1).stores({
      trips: 'id, lastSynced',
      bookings: 'id, tripId, lastSynced',
      expenses: 'id, tripId, lastSynced',
      documents: 'id, tripId, lastSynced',
      itineraryItems: 'id, dayId, tripId, lastSynced',
      ratings: 'id, tripId, lastSynced',
      syncQueue: 'id, status, timestamp',
    });
  }
}

export const db = new GoVaultDB();
```

### Sync Manager

```typescript
// lib/sync/manager.ts

export class SyncManager {
  private isOnline: boolean = navigator.onLine;
  private isSyncing: boolean = false;

  constructor() {
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());
  }

  async queueOperation(op: Omit<SyncOperation, 'id' | 'timestamp' | 'status' | 'retries'>) {
    await db.syncQueue.add({
      ...op,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      status: 'pending',
      retries: 0,
    });

    if (this.isOnline) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.isSyncing || !this.isOnline) return;
    this.isSyncing = true;

    try {
      const pending = await db.syncQueue
        .where('status')
        .equals('pending')
        .sortBy('timestamp');

      for (const op of pending) {
        await this.processOperation(op);
      }
    } finally {
      this.isSyncing = false;
    }
  }

  private async processOperation(op: SyncOperation) {
    try {
      await db.syncQueue.update(op.id, { status: 'syncing' });

      // Call appropriate API based on operation
      await this.callAPI(op);

      // Remove from queue on success
      await db.syncQueue.delete(op.id);
    } catch (error) {
      // Retry logic
      if (op.retries < 3) {
        await db.syncQueue.update(op.id, {
          status: 'pending',
          retries: op.retries + 1
        });
      } else {
        await db.syncQueue.update(op.id, { status: 'failed' });
      }
    }
  }
}
```

---

## File/Folder Structure

```
govault/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, callback)
│   │   ├── login/page.tsx
│   │   └── callback/page.tsx
│   ├── (app)/                    # Authenticated app routes
│   │   ├── layout.tsx            # App shell with nav
│   │   ├── page.tsx              # Dashboard / trip list
│   │   ├── trips/
│   │   │   ├── new/page.tsx      # Create trip
│   │   │   └── [tripId]/
│   │   │       ├── page.tsx      # Trip dashboard
│   │   │       ├── itinerary/page.tsx
│   │   │       ├── bookings/page.tsx
│   │   │       ├── expenses/page.tsx
│   │   │       ├── documents/page.tsx
│   │   │       ├── ratings/page.tsx
│   │   │       └── settings/page.tsx
│   │   └── settings/page.tsx     # User settings
│   ├── share/[linkId]/page.tsx   # Public viewer page
│   ├── api/                      # API routes
│   │   ├── auth/[...supabase]/route.ts
│   │   ├── trips/route.ts
│   │   ├── trips/[tripId]/route.ts
│   │   ├── ai/
│   │   │   ├── parse-email/route.ts
│   │   │   ├── parse-document/route.ts
│   │   │   ├── parse-receipt/route.ts
│   │   │   ├── chat/route.ts
│   │   │   └── generate-itinerary/route.ts
│   │   └── webhooks/
│   │       └── email/route.ts
│   ├── layout.tsx                # Root layout
│   └── globals.css
│
├── components/
│   ├── ui/                       # shadcn/ui components
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripForm.tsx
│   │   └── TripDashboard.tsx
│   ├── bookings/
│   │   ├── BookingCard.tsx
│   │   ├── FlightCard.tsx
│   │   ├── HotelCard.tsx
│   │   └── BookingForm.tsx
│   ├── itinerary/
│   │   ├── DayCard.tsx
│   │   ├── ActivityItem.tsx
│   │   └── Timeline.tsx
│   ├── expenses/
│   │   ├── ExpenseList.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── ExpenseSummary.tsx
│   ├── ai/
│   │   ├── ChatInterface.tsx
│   │   ├── ParsingPreview.tsx
│   │   └── SuggestionCard.tsx
│   └── shared/
│       ├── Header.tsx
│       ├── Navigation.tsx
│       ├── OfflineIndicator.tsx
│       └── LoadingStates.tsx
│
├── lib/
│   ├── ai/
│   │   ├── agent.ts              # AI agent orchestration
│   │   ├── prompts.ts            # System prompts
│   │   └── schemas.ts            # Response schemas (Zod)
│   ├── db/
│   │   ├── prisma.ts             # Prisma client
│   │   └── local.ts              # Dexie IndexedDB
│   ├── sync/
│   │   ├── manager.ts            # Sync orchestration
│   │   └── conflicts.ts          # Conflict resolution
│   ├── api/
│   │   ├── client.ts             # API client
│   │   └── hooks.ts              # React Query hooks
│   ├── auth/
│   │   └── supabase.ts           # Supabase client
│   ├── utils/
│   │   ├── currency.ts           # Currency conversion
│   │   ├── dates.ts              # Date formatting
│   │   └── validation.ts         # Shared validators
│   └── store/
│       ├── trips.ts              # Zustand store for trips
│       ├── ui.ts                 # UI state
│       └── sync.ts               # Sync state
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── public/
│   ├── manifest.json             # PWA manifest
│   ├── icons/
│   └── sw.js                     # Service worker
│
├── types/
│   ├── trip.ts
│   ├── booking.ts
│   ├── expense.ts
│   └── ai.ts
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## Security Considerations

### Authentication
- Supabase Auth with JWT tokens
- Magic link (passwordless) primary
- Google OAuth secondary
- Row-level security (RLS) in Postgres

### Authorization
```sql
-- Example RLS policies

-- Users can only see their own trips or trips they're members of
CREATE POLICY "Users can view own trips" ON trips
  FOR SELECT USING (
    owner_id = auth.uid() OR
    id IN (SELECT trip_id FROM trip_members WHERE user_id = auth.uid())
  );

-- Documents inherit trip access
CREATE POLICY "Documents follow trip access" ON documents
  FOR SELECT USING (
    trip_id IN (
      SELECT id FROM trips WHERE owner_id = auth.uid()
      UNION
      SELECT trip_id FROM trip_members WHERE user_id = auth.uid()
    )
  );
```

### Data Privacy
- Sensitive fields (PNR, costs) filtered server-side for viewers
- Documents encrypted at rest (Supabase Storage)
- HTTPS everywhere
- No sensitive data in localStorage (only IndexedDB with encryption option)

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Time to Interactive | < 3s |
| Largest Contentful Paint | < 2.5s |
| API response time (p95) | < 500ms |
| AI response time (p95) | < 5s |
| Offline switch | Instant (< 100ms) |
| Sync queue processing | Background, non-blocking |

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRODUCTION SETUP                          │
└─────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │   Vercel     │
                    │  (Frontend)  │
                    │              │
                    │ • Next.js    │
                    │ • Edge Funcs │
                    │ • CDN        │
                    └──────────────┘
                           │
          ┌────────────────┼────────────────┐
          ▼                ▼                ▼
   ┌────────────┐   ┌────────────┐   ┌────────────┐
   │ Supabase   │   │  Gemini    │   │  Resend    │
   │            │   │  AI API    │   │  (Email)   │
   │ • Postgres │   │            │   │            │
   │ • Auth     │   │ gemini-2.0 │   │ Webhooks   │
   │ • Storage  │   │ -flash     │   │ for email  │
   │ • Realtime │   │            │   │ forwarding │
   └────────────┘   └────────────┘   └────────────┘

Environment Variables:
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- GEMINI_API_KEY
- RESEND_API_KEY
```
