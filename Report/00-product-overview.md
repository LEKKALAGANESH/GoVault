# GoVault: Product Overview

## One-Liner
**AI-powered travel companion that turns scattered confirmations into a beautiful, organized journey.**

## Core Differentiator
Unlike TripIt (manual, clunky UI) or Wanderlog (planning-focused), GoVault is **AI-first**:
- AI parses any booking email or receipt photo
- AI builds itineraries from natural language ("5 days in Phuket with a toddler")
- AI assistant knows your entire trip context
- AI tracks expenses from photos and chat

---

## The Problem

After booking a trip, travelers face a frustrating reality:
- Flight confirmations in Gmail
- Hotel booking in another email thread
- Activity tickets as PDFs somewhere
- Expenses tracked in... nowhere
- Emergency numbers Googled in panic

When you actually travel, you're digging through emails at immigration, screenshotting hotel addresses to WhatsApp, and returning home with no idea how much you actually spent.

---

## The Insight

**Most travel tools focus on planning. Almost none focus on execution.**

The journey from "trip booked" to "trip completed" is underserved. This is when travelers need:
- All info in one place
- Offline access (critical!)
- Real-time expense tracking
- Shareable with travel companions
- Emergency info at fingertips

---

## The Solution: GoVault

A beautiful, offline-first trip tracker for the **post-booking traveler**.

### Core Value Props

| For | Value |
|-----|-------|
| **The Organizer** | One place for all bookings, documents, and details |
| **The Budget-Conscious** | Know exactly what you're spending, as you spend it |
| **The Family Traveler** | Share with everyone, from tech-savvy to elderly |
| **The Prepared Traveler** | Emergency info, documents, everything offline |

---

## Key Differentiators

1. **Post-Booking Focus** — Not another trip planner. Starts where others end.
2. **Expense Tracking Built-In** — Integrated with itinerary, not a separate app.
3. **Offline-First** — Everything works without internet. Critical for travel.
4. **Beautiful & Shareable** — Not a spreadsheet. Something you're proud to share.
5. **Family-Ready** — Multi-generational travel considerations baked in.

---

## Business Model

### Primary: Freemium
- **Free Tier**: 1 active trip, basic features, 5 documents
- **Pro** ($4.99/trip or $29/year): Unlimited trips, expenses, documents, sharing

### Secondary: B2B
- Travel agencies white-label for clients
- Tour operators bundle with packages
- Corporate travel management add-on

### Tertiary: Partnerships
- Travel insurance affiliate
- Currency exchange partners
- Experience booking integrations

---

## Target Users

### Primary: Family Trip Organizers
30-45 year olds planning trips with parents, kids, or extended family. High pain, high willingness to pay for organization.

### Secondary: Frequent Leisure Travelers
Take 3-5 trips/year. Want expense insights and beautiful trip records.

### Tertiary: Group Trip Coordinators
Friends traveling together. Need shared visibility and expense splitting.

---

## MVP Scope (V1.0)

### Must Have
- [ ] Trip creation & management
- [ ] Day-by-day itinerary builder
- [ ] Flight & hotel booking cards
- [ ] Document upload & offline storage
- [ ] Expense tracking with multi-currency
- [ ] Budget tracking
- [ ] Trip sharing (invite travelers)
- [ ] Emergency contact hub
- [ ] Packing & to-do checklists
- [ ] PWA with full offline support

### Won't Have (V1)
- Email parsing / auto-import
- Calendar sync
- Post-trip analytics
- Native mobile apps
- Live flight tracking
- AI recommendations

---

## Document Index

| Document | Purpose |
|----------|---------|
| [01-jobs-to-be-done.md](./01-jobs-to-be-done.md) | User needs analysis, personas, jobs framework |
| [02-feature-specification.md](./02-feature-specification.md) | Detailed feature requirements |
| [03-customer-validation-and-integrations.md](./03-customer-validation-and-integrations.md) | Real customer quotes, integration strategy |
| [04-ai-features-and-monetization.md](./04-ai-features-and-monetization.md) | AI-first features, subscription model |
| [05-ai-architecture-and-new-features.md](./05-ai-architecture-and-new-features.md) | Gemini setup, privacy controls, ratings |
| [06-ai-agent-capabilities.md](./06-ai-agent-capabilities.md) | Complete AI functionality list |
| [07-user-stories.md](./07-user-stories.md) | Implementable user stories by epic |
| [08-tech-architecture.md](./08-tech-architecture.md) | System design, stack, database, APIs |
| 09-ux-screens.md | (Next) Wireframes, user flows |

---

## Decisions Made

| Question | Decision |
|----------|----------|
| AI Model | Google Gemini (Flash for most, Pro for complex) |
| Architecture | Single agent with specialized tools (not multi-agent) |
| Free tier AI | No AI in free tier (manual only) |
| Launch market | India-focused (UPI, INR pricing, Hindi support) |
| Privacy | 3-tier: Owner, Co-Planner (full access), Viewer (itinerary only) |

## Open Questions for Review

### Product Questions
1. **Expense splitting depth**: Full Splitwise-like settlement, or just tracking who paid?
2. **Onboarding**: AI-guided setup ("Tell me about your trip") vs manual form?
3. **Rating system**: 5-star only, or add tags like "kid-friendly", "value-for-money"?

### Technical Questions
1. **Offline + AI**: Queue AI requests for when online, or graceful degradation?
2. **Document storage**: Self-hosted vs cloud provider (S3, Cloudflare R2)?
3. **PWA vs Native**: PWA for MVP, but when to go native?

### Business Questions
1. **India pricing**: ₹399/trip or ₹299? ₹1,999/year or ₹1,499?
2. **Beta program**: How many users? How long before paid launch?

---

## Next Steps

1. **Review JTBD & Features** — Align on scope and priorities
2. **Write User Stories** — Break features into implementable chunks
3. **Tech Architecture** — Stack decisions, system design
4. **UX Design** — Wireframes, user flows, component library
5. **Build MVP** — Sprint planning, development

---

## Success Vision

> "Before GoVault, I had 30 emails, a messy Google Doc, and anxiety. Now I open one app and everything is there. My mom can see the itinerary. I know exactly what we spent. And when my kid got sick, I had the hospital number in 2 taps."

— Future GoVault user
