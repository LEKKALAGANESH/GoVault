<p align="center">
  <img src="https://img.icons8.com/fluency/96/airplane-take-off.png" alt="GoVault Logo" width="80" />
</p>

<h1 align="center">GoVault</h1>

<p align="center">
  <strong>Your Smart Travel Companion</strong><br/>
  Turn scattered confirmations into a beautiful, organized journey.
</p>

<p align="center">
  <a href="#features">Features</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#quick-start">Quick Start</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#tech-stack">Tech Stack</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#architecture">Architecture</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#testing">Testing</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#documentation">Docs</a>&nbsp;&nbsp;|&nbsp;&nbsp;
  <a href="#license">License</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Tailwind-4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Tested_with-Playwright-2EAD33?logo=playwright&logoColor=white" alt="Playwright" />
  <a href="https://github.com/LEKKALAGANESH/GoVault/actions/workflows/playwright.yml"><img src="https://github.com/LEKKALAGANESH/GoVault/actions/workflows/playwright.yml/badge.svg" alt="E2E Tests" /></a>
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License" />
</p>

---

## Overview

**GoVault** is an AI-powered travel planning app that bridges the gap between booking a trip and living it. Most travel tools focus on discovery and planning. GoVault focuses on **execution** -- organizing flights, hotels, expenses, and itineraries into one beautiful, offline-ready experience.

> *"Most travel apps help you plan. GoVault helps you travel."*

---

## Features

**Booking Vault** -- Flights, hotels, transport, and activities organized with confirmation numbers, documents, and status tracking.

**AI-Powered Import** -- Forward a booking email, snap a receipt, or paste itinerary text. GPT-4o extracts everything automatically.

**Day-by-Day Itinerary** -- Visual timeline with activities, energy levels, restaurant suggestions, and local tips.

**Expense Tracker** -- Log expenses in any currency with category breakdowns.

**Family-Aware** -- Add traveler profiles (adults, seniors, children, infants) with dietary and mobility needs. AI tailors suggestions accordingly.

**Offline-Ready** -- Everything works without internet. Changes sync when connectivity returns.

**Smart Sharing** -- Share read-only views with family, or co-plan with travel partners. Privacy controls built in.

**Travel Survival Kit** -- Local language phrases, packing checklists, emergency contacts, and survival tips per destination.

---

## Quick Start

### Prerequisites

- **Node.js** 18+
- **Supabase** project ([create one free](https://supabase.com/dashboard))
- **OpenRouter** API key ([get one](https://openrouter.ai/keys)) -- optional, for AI features

### Setup

```bash
# 1. Clone the repository
git clone https://github.com/LEKKALAGANESH/GoVault.git
cd GoVault

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
```

Edit `.env.local` with your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key
OPENROUTER_API_KEY=sk-or-v1-your-key        # Optional
UNSPLASH_ACCESS_KEY=your-key                 # Optional
```

```bash
# 4. Start development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Turbopack) |
| `npm run build` | Create production build |
| `npm start` | Run production server |
| `npm run lint` | Run ESLint |
| `npx playwright test` | Run E2E tests (see [Testing](#testing)) |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Language | [TypeScript 5](https://typescriptlang.org) |
| UI | [React 19](https://react.dev), [Tailwind CSS 4](https://tailwindcss.com), [Shadcn UI](https://ui.shadcn.com) |
| Database | [Supabase](https://supabase.com) (PostgreSQL + Auth + Storage + RLS) |
| AI | [OpenRouter](https://openrouter.ai) (GPT-4o) via OpenAI SDK |
| State | [Zustand](https://zustand-demo.pmnd.rs) |
| Forms | [React Hook Form](https://react-hook-form.com) + [Zod](https://zod.dev) |
| Local Storage | [Dexie](https://dexie.org) (IndexedDB wrapper) |
| Testing | [Playwright](https://playwright.dev) |

---

## Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── (app)/                    # Protected routes (requires auth)
│   │   ├── layout.tsx            # Auth guard + app shell
│   │   └── trips/                # Trip list, detail, and creation
│   ├── (auth)/                   # Authentication
│   │   ├── login/                # Google OAuth + Magic Link
│   │   └── callback/             # OAuth callback handler
│   ├── api/                      # API routes
│   │   ├── auth/                 # Auth callback
│   │   └── trips/[tripId]/       # Trip CRUD, AI agent, documents
│   ├── share/[slug]/             # Public shared trip view
│   ├── layout.tsx                # Root layout (fonts, metadata)
│   └── page.tsx                  # Landing page
│
├── components/
│   ├── ui/                       # Shadcn UI primitives
│   ├── trip/                     # Trip list components
│   └── trip-view2/               # Trip detail view components
│
├── lib/
│   ├── supabase/                 # Supabase clients
│   │   ├── client.ts             # Browser client (with 5s timeout)
│   │   ├── server.ts             # Server component client
│   │   ├── service.ts            # Service role client (bypasses RLS)
│   │   ├── middleware.ts         # Auth session refresh + error handling
│   │   └── env.ts                # Environment validation
│   ├── agent/                    # AI agent (document parsing, itinerary editing)
│   ├── types/                    # TypeScript interfaces
│   └── defaults/                 # Default data (Thailand trip template)
│
└── proxy.ts                      # Middleware (auth + route protection)
```

### Request Flow

```
Browser Request
  └─> proxy.ts (middleware)
        ├─> Public route (/,/terms,/share) ──> Skip auth, serve page
        └─> Protected route (/trips/*)
              └─> updateSession() ──> supabase.auth.getUser()
                    ├─> Success + user ──> Serve page
                    ├─> Success + no user ──> Redirect /login
                    └─> Failure (timeout/down) ──> Redirect /login?error=service_unavailable
```

### Data Model

```
Trip ─┬── Travelers        (adults, seniors, children, infants)
      ├── Bookings          (flights, hotels, transport, activities)
      ├── Itinerary Days ── Activities
      ├── Documents         (uploaded files linked to bookings)
      ├── Trip Todos        (pre-trip checklist)
      ├── Survival Tips     (destination-specific advice)
      ├── Phrases           (local language essentials)
      ├── Packing Items     (categorized checklist)
      └── Emergency Contacts
```

---

## Error Handling & Resilience

GoVault is built to handle Supabase downtime gracefully:

- **5-second fetch timeout** on all Supabase clients prevents 26s hangs from TCP timeout
- **Environment validation** logs clear warnings if Supabase URL or keys are missing
- **Middleware try/catch** lets public routes pass through and redirects protected routes with a user-friendly error
- **Layout try/catch** prevents app crashes when auth checks fail

A comprehensive **6-phase offline resilience plan** is documented in the `Report/` folder, covering health detection, offline banners, local caching, write queues, sync reconciliation, and login handling.

---

## Testing

GoVault uses [Playwright](https://playwright.dev) for end-to-end testing across the full application.

### Test Suite

| Test File | Tests | Area | Auth Required |
|-----------|-------|------|---------------|
| `landing.spec.ts` | 4 | Hero, features, family section, navigation | No |
| `login.spec.ts` | 5 | Login form, OAuth, magic link, validation | No |
| `agent.authenticated.spec.ts` | 7 | AI chat panel, message sending, responses | Yes |
| `agent-improvements.authenticated.spec.ts` | 14 | Packing lists, phrases, document upload, itinerary editing | Yes |
| `ai-features.authenticated.spec.ts` | 3 | AI generation, chat suggestions, API | Yes |
| `view2.authenticated.spec.ts` | 2 | Trip detail view, visual sections | Yes |

**Total: 35 tests** covering landing pages, authentication, AI agent interactions, and trip management.

### Running Tests

```bash
# Run all unauthenticated tests (no login needed)
npx playwright test --project=chromium

# Capture auth state for authenticated tests (opens browser for manual login)
npx playwright test auth.setup --headed

# Run authenticated tests (requires auth setup first)
npx playwright test --project=chromium-authenticated

# Run all tests
npx playwright test

# View test report
npx playwright show-report
```

### Test Architecture

```
tests/
├── auth.setup.ts                              # Auth fixture (manual OAuth login capture)
├── landing.spec.ts                            # Public: landing page tests
├── login.spec.ts                              # Public: login page tests
├── agent.authenticated.spec.ts                # Protected: AI agent tests
├── agent-improvements.authenticated.spec.ts   # Protected: AI agent advanced tests
├── ai-features.authenticated.spec.ts          # Protected: AI feature tests
└── view2.authenticated.spec.ts                # Protected: trip detail view tests
```

Tests are split into two Playwright projects:
- **`chromium`** -- Unauthenticated tests (landing, login) that run without any auth state
- **`chromium-authenticated`** -- Protected route tests that use saved auth state from `auth.setup.ts`

### CI/CD

Tests run automatically on every push and pull request via GitHub Actions. The workflow installs dependencies, builds the app, and runs the Playwright test suite.

[![E2E Tests](https://github.com/LEKKALAGANESH/GoVault/actions/workflows/playwright.yml/badge.svg)](https://github.com/LEKKALAGANESH/GoVault/actions/workflows/playwright.yml)

---

## Documentation

All product and technical documentation lives in the [`Report/`](./Report) folder:

### Product & Design

| Document | Description |
|----------|-------------|
| [Product Overview](./Report/00-product-overview.md) | Vision, differentiators, and target users |
| [Jobs to Be Done](./Report/01-jobs-to-be-done.md) | Market analysis and user needs |
| [Feature Specification](./Report/02-feature-specification.md) | MVP feature matrix with priorities |
| [Customer Validation](./Report/03-customer-validation-and-integrations.md) | Real user quotes and integration strategy |
| [UX Screens](./Report/09-ux-screens.md) | Wireframes and design principles |
| [User Stories](./Report/07-user-stories.md) | Acceptance criteria per feature |

### AI & Technical

| Document | Description |
|----------|-------------|
| [AI Features & Monetization](./Report/04-ai-features-and-monetization.md) | AI capabilities and business model |
| [AI Architecture](./Report/05-ai-architecture-and-new-features.md) | Model selection and integration details |
| [AI Agent Capabilities](./Report/06-ai-agent-capabilities.md) | Tool calling, parsing, and editing specs |
| [Agent Architecture](./Report/AGENT_ARCHITECTURE.md) | How the AI agent works end-to-end |
| [Agent Improvement Proposal](./Report/AI_AGENT_IMPROVEMENT_PROPOSAL.md) | Technical analysis and proposed improvements |
| [Agent Test Cases](./Report/agent-test-cases.md) | Test scenarios for AI features |
| [Agent Roadmap](./Report/AGENT_ROADMAP.md) | Development phases and status |
| [Tech Architecture](./Report/08-tech-architecture.md) | Stack decisions and system design |
| [Admin Dashboard Spec](./Report/ADMIN_DASHBOARD_SPEC.md) | Analytics dashboard technical spec |
| [Project Documentation](./Report/PROJECT_DOCUMENTATION.md) | Comprehensive project documentation |

### Offline Resilience (Planned)

| Phase | Document | Complexity |
|-------|----------|------------|
| 1 | [Health Detection](./Report/phase-1-health-detection.md) | Low |
| 2 | [Offline Banner](./Report/phase-2-offline-banner.md) | Low |
| 3 | [Local Data Cache](./Report/phase-3-local-data-cache.md) | Medium |
| 4 | [Local Write Queue](./Report/phase-4-local-write-queue.md) | High |
| 5 | [Sync & Reconciliation](./Report/phase-5-sync-reconciliation.md) | High |
| 6 | [Login Page Handling](./Report/phase-6-login-page-handling.md) | Medium |

---

## Deployment

### Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

1. Connect your GitHub repository
2. Add environment variables in Vercel dashboard
3. Deploy

### Self-Hosted

```bash
npm run build
npm start
```

Runs on port `3000` by default. Set `PORT` environment variable to customize.

---

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

This project is licensed under the **MIT License**. See the [LICENSE](./LICENSE) file for details.

---

<p align="center">
  Made with care for travelers who'd rather travel than organize.
</p>
