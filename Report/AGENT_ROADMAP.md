# AI Trip Agent - Development Roadmap

> **Last Updated:** January 19, 2026
> **Branch:** `feature/edit-itinerary`
> **Status:** Phase 1 Complete

---

## Overview

The AI Trip Agent helps users manage their trip by:
- Parsing travel documents (boarding passes, hotel confirmations)
- Converting unstructured itinerary text to structured data
- Accepting natural language commands to edit the itinerary

**Tech Stack:**
- OpenAI SDK with OpenRouter endpoint
- Tool calling (function calling) approach
- GPT-4o model (vision-capable for documents)

---

## Progress Tracker

### ✅ Phase 1: Core Infrastructure (COMPLETE)

| Task | Status | Files | Notes |
|------|--------|-------|-------|
| Install OpenAI SDK | ✅ Done | `package.json` | Using OpenRouter endpoint |
| Create agent types | ✅ Done | `src/lib/agent/types.ts` | Request/response types, tool params |
| Create OpenRouter client | ✅ Done | `src/lib/agent/client.ts` | Configurable model selection |
| Define tool schemas | ✅ Done | `src/lib/agent/tools.ts` | 10 tools defined |
| Create system prompts | ✅ Done | `src/lib/agent/prompts.ts` | Context-aware prompts |
| Build agent API | ✅ Done | `src/app/api/trips/[tripId]/agent/route.ts` | Processes requests |
| Build apply API | ✅ Done | `src/app/api/trips/[tripId]/agent/apply/route.ts` | Applies changes to DB |
| Create chat UI | ✅ Done | `src/components/trip-view2/trip-agent-chat.tsx` | Floating button + panel |
| Integrate into trip page | ✅ Done | `src/app/(app)/trips/[slug]/page.tsx` | Owner-only access |
| TypeScript build passes | ✅ Done | - | No errors |

**Tools Implemented:**
- `parse_flight` - Extract flight from document
- `parse_hotel` - Extract hotel from document
- `parse_itinerary_text` - Convert text to structured days
- `add_day` / `update_day` / `delete_day` - Day management
- `add_activity` / `update_activity` / `delete_activity` / `move_activity` - Activity management

---

### ✅ Phase 2: Testing & Validation (COMPLETE)

| Task | Status | Notes |
|------|--------|-------|
| Add OPENROUTER_API_KEY to env | ✅ Done | API key configured |
| Playwright tests created | ✅ Done | 7 tests in `agent.authenticated.spec.ts` |
| Test AI button visibility | ✅ Done | Button shows for trip owner |
| Test chat panel open/close | ✅ Done | Panel slides in/out correctly |
| Test input/send functionality | ✅ Done | Messages sent to AI |
| Test AI response handling | ✅ Done | Responses displayed correctly |
| Test itinerary text parsing | ✅ Done | Multi-day itinerary parsed to structured format |
| Test document parsing (flight) | 🔲 Todo | Upload boarding pass image |
| Test document parsing (hotel) | 🔲 Todo | Upload hotel confirmation |
| Verify hero stats update | 🔲 Todo | Check readiness recalculation |

---

### ✅ Phase 3: Smart Linking (PARTIAL)

**Goal:** Automatically link related data when creating/parsing

| Task | Status | Priority | Description |
|------|--------|----------|-------------|
| Auto-link activities to bookings | ✅ Done | High | Created `smart-linking.ts` module |
| Flight matching logic | ✅ Done | High | Match by flight number, airport codes, airline |
| Hotel matching logic | ✅ Done | High | Match by hotel name, check-in/out context |
| Integration in apply API | ✅ Done | High | `add_activity` and `parse_itinerary_text` use smart linking |
| Auto-link documents to bookings | 🔲 Todo | High | Match boarding pass to flight by flight number |
| Smart date inference | 🔲 Todo | Medium | "Feb 17" → Day 3 (calculate from trip start) |
| Duplicate detection | 🔲 Todo | Medium | Warn if same flight already exists |

**Implementation Notes:**
```typescript
// When adding activity with flight-related title
if (activity.title.toLowerCase().includes('flight')) {
  const matchingBooking = findBookingByRoute(activity.title);
  if (matchingBooking) {
    activity.booking_id = matchingBooking.id;
  }
}
```

---

### ✅ Phase 4: Auto-Generated Data (COMPLETE)

**Goal:** Create related data automatically when bookings are added

| Task | Status | Priority | Description |
|------|--------|----------|-------------|
| Generate todos for flight bookings | ✅ Done | High | Confirm booking, online check-in, save boarding pass |
| Generate todos for hotel bookings | ✅ Done | High | Confirm booking, save confirmation, check-in time |
| Created `auto-todos.ts` module | ✅ Done | High | Reusable functions for generating todos |
| Integration in apply API | ✅ Done | High | `parse_flight` and `parse_hotel` auto-generate todos |
| Generate itinerary days from hotel | 🔲 Todo | Medium | Hotel check-in → check-out days |
| Generate arrival/departure activities | 🔲 Todo | Low | Auto-add flight activities |

**Implementation Notes:**
```typescript
// When flight booking added
if (booking.type === 'FLIGHT' && booking.status === 'PENDING') {
  await createTodo({
    title: `Confirm ${booking.airline} ${booking.flight_number} booking`,
    category: 'bookings',
    trip_id: booking.trip_id
  });
}
```

---

### 🔲 Phase 5: Enhanced Context Awareness

**Goal:** Agent understands full trip context for smarter responses

| Task | Status | Priority | Description |
|------|--------|----------|-------------|
| Include all bookings in context | 🔲 Todo | High | Agent knows existing flights/hotels |
| Include todos in context | 🔲 Todo | Medium | Can mark todos complete |
| Ambiguity resolution | 🔲 Todo | Medium | "Which temple?" when multiple exist |
| Date validation | 🔲 Todo | Medium | Warn if date outside trip range |
| Conflict detection | 🔲 Todo | Low | "You have another activity at 3pm" |

---

### 🔲 Phase 6: Cascade Operations

**Goal:** Handle related data when modifying/deleting

| Task | Status | Priority | Description |
|------|--------|----------|-------------|
| Delete day warning | 🔲 Todo | High | Warn about linked activities/bookings |
| Delete booking cascade | 🔲 Todo | Medium | Unlink activities, don't delete |
| Update booking cascade | 🔲 Todo | Low | Update linked activity times |
| Reorder days | 🔲 Todo | Low | Renumber all days after insert/delete |

---

### 🔲 Phase 7: Advanced Features

| Task | Status | Priority | Description |
|------|--------|----------|-------------|
| Multi-turn conversation | 🔲 Todo | Medium | Remember previous messages |
| Undo last change | 🔲 Todo | Medium | Revert most recent apply |
| Batch changes | 🔲 Todo | Low | Apply multiple changes at once |
| Export itinerary | 🔲 Todo | Low | Generate PDF/text from structured data |
| Import from other apps | 🔲 Todo | Low | Parse TripIt, Google Trips exports |

---

## Data Relationships Reference

```
Trip
├── Bookings (FLIGHT, HOTEL)
│   ├── → Hero Stats (count, confirmed)
│   ├── → Pending Actions (if PENDING)
│   ├── ← Documents (booking_id)
│   └── ← Activities (booking_id) [optional]
│
├── ItineraryDays
│   └── Activities
│       └── booking_id? [links to Booking]
│
├── Todos → Hero (completed count) → Readiness
├── PackingItems → Hero (checked count) → Readiness
├── Documents → Hero (count) → Readiness
└── EmergencyContacts → Hero (count) → Readiness

Hero Readiness = flights(30%) + hotels(25%) + todos(20%)
              + packing(15%) + docs(5%) + contacts(5%)
```

---

## Environment Setup

```bash
# Required environment variables
OPENROUTER_API_KEY=sk-or-v1-xxx  # Get from https://openrouter.ai/keys

# Optional: Change default model
# In src/lib/agent/client.ts
export const DEFAULT_MODEL = "openai/gpt-4o";  // or "anthropic/claude-3.5-sonnet"
```

---

## Testing Checklist

### Manual Testing Steps

1. **Setup**
   ```bash
   # Add API key to .env.local
   echo "OPENROUTER_API_KEY=your-key-here" >> .env.local

   # Start dev server
   npm run dev
   ```

2. **Access Agent**
   - Go to `/trips/[your-trip-slug]`
   - Must be logged in as trip owner
   - Click sparkle button (bottom-right)

3. **Test Document Parsing**
   - Click upload icon
   - Select boarding pass image
   - Verify extracted flight details
   - Click "Apply" to save

4. **Test Natural Language**
   - Type: "Add breakfast at hotel on Day 1 at 8am"
   - Verify proposed change shows activity details
   - Click "Apply" to save
   - Verify activity appears in Day 1 card

---

## Files Reference

```
src/lib/agent/
├── index.ts          # Exports
├── types.ts          # TypeScript interfaces
├── client.ts         # OpenRouter client setup
├── tools.ts          # Tool definitions (10 tools)
└── prompts.ts        # System prompts

src/app/api/trips/[tripId]/agent/
├── route.ts          # POST: Process agent requests
└── apply/route.ts    # POST: Apply confirmed changes

src/components/trip-view2/
└── trip-agent-chat.tsx  # Chat UI component

docs/
├── AGENT_ROADMAP.md     # This file
└── agent-test-cases.md  # Detailed test scenarios
```

---

## Changelog

### 2026-01-19 (Evening)
- ✅ Phase 2 complete: Testing & Validation
- ✅ Added test IDs to TripAgentChat component
- ✅ Created Playwright test suite (7 tests)
- ✅ All tests passing:
  - AI button visibility
  - Chat panel open/close
  - Input/send functionality
  - AI response handling
  - Itinerary text parsing
- ✅ Fixed trip URL in tests (use UUID not slug)
- ✅ Updated Playwright config with auth setup project

### 2026-01-19 (Morning)
- ✅ Phase 1 complete: Core infrastructure built
- ✅ Created 10 tool definitions
- ✅ Built agent API with OpenRouter integration
- ✅ Built apply API for database operations
- ✅ Created floating chat UI component
- ✅ Integrated into trip page (owner-only)
- ✅ TypeScript build passing
- 📝 Created test cases document
- 📝 Created this roadmap

---

## Next Steps

1. **Add OpenRouter API key** to `.env.local`
2. **Test basic parsing** with real documents
3. **Document any issues** found during testing
4. **Start Phase 3** (Smart Linking) after Phase 2 validation
