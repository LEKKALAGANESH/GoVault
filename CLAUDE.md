# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

GoVault is an AI-powered travel companion built with Next.js 16 (App Router), React 19, TypeScript, Supabase, and Tailwind CSS 4. It organizes flights, hotels, expenses, and itineraries into one offline-ready experience.

## Architecture

**Next.js App Router structure:**
- **`src/app/`** — Pages and API routes (App Router)
- **`src/components/`** — React components (Shadcn UI + custom)
- **`src/lib/`** — Utilities, Supabase clients, AI agent, types
- **`src/proxy.ts`** — Middleware (auth + route protection)

**Key subsystems:**
- **Supabase** (`src/lib/supabase/`) — Auth, database, storage with 5s timeout and env validation
- **AI Agent** (`src/lib/agent/`) — OpenRouter (GPT-4o) for document parsing, itinerary editing, packing lists, phrases
- **Types** (`src/lib/types/index.ts`) — All TypeScript interfaces

**Auth flow:**
- Middleware (`proxy.ts` → `middleware.ts`) checks auth on every non-public route
- Google OAuth + Magic Link via Supabase Auth
- Protected routes under `(app)/`, public routes under `(auth)/`

## Development

```bash
cp .env.example .env.local   # Fill in Supabase + OpenRouter keys
npm install
npm run dev
```

## Data Persistence

- **Server:** Supabase PostgreSQL with Row Level Security
- **Local:** Dexie (IndexedDB) for offline cache (planned)
- **Auth state:** Cookies managed by `@supabase/ssr`

## Testing

```bash
npx playwright test                          # Run unauthenticated tests
npx playwright test auth.setup --headed      # Capture auth state (manual login)
npx playwright test --project=chromium-authenticated  # Run authenticated tests
```

## Key Conventions

- All Supabase clients use `AbortSignal.timeout(5000)` to prevent hanging
- Environment validation via `src/lib/supabase/env.ts`
- Brand name: **GoVault** (not TripVault)
- CSS custom properties: `--gold`, `--teal`, `--coral`, `--navy`
