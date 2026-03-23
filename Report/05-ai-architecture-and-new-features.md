# AI Architecture & New Features

## AI Model: Google Gemini 2.0

### Recommended Models

| Task | Model | Why |
|------|-------|-----|
| Primary (all tasks) | **Gemini 2.0 Flash** | Latest, fast, multimodal, best price/performance |
| Complex reasoning | **Gemini 2.5 Pro** | When Flash needs backup for complex itineraries |
| Image/Document OCR | Gemini 2.0 Flash | Native multimodal - text, images, PDFs |

### Gemini 2.0 Flash Capabilities
- **1M token context window** — can hold entire trip history
- **Native multimodal** — images, PDFs, audio in same call
- **Structured output** — JSON mode for reliable parsing
- **Function calling** — native tool use support
- **Fast** — optimized for low latency

---

## Single Agent vs Multi-Agent

### Recommendation: **Single Agent with Specialized Tools**

For MVP, a multi-agent system is overkill. Instead, use **one orchestrating agent** with different tools/modes.

```
┌─────────────────────────────────────────────────────┐
│                   GoVault Agent                    │
│                  (Gemini 1.5 Flash)                  │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  Parse   │  │  Plan    │  │  Chat    │          │
│  │  Tool    │  │  Tool    │  │  Tool    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ Expense  │  │  Search  │  │  Rate    │          │
│  │  Tool    │  │  Tool    │  │  Tool    │          │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Why Single Agent?

| Approach | Pros | Cons |
|----------|------|------|
| **Single Agent** | Simple, fast, cheap, easier to debug | Less specialized |
| Multi-Agent | Specialized experts | Complex orchestration, higher latency, more expensive |

**For GoVault MVP**: Single agent handles all tasks. The "specialization" comes from:
1. Different system prompts per task
2. Different tools available per context
3. Routing logic (simple if/else, not another agent)

### Agent Tools

```typescript
// Tool definitions for the GoVault Agent

tools: [
  {
    name: "parse_booking",
    description: "Extract booking details from email or document",
    parameters: { content: string, type: "email" | "image" | "pdf" }
  },
  {
    name: "generate_itinerary",
    description: "Create day-by-day itinerary from requirements",
    parameters: { destination, dates, travelers, preferences, existing_bookings }
  },
  {
    name: "parse_expense",
    description: "Extract expense from text or receipt image",
    parameters: { input: string, image_url?: string }
  },
  {
    name: "search_places",
    description: "Find restaurants, activities, attractions",
    parameters: { query, location, type, filters }
  },
  {
    name: "answer_question",
    description: "Answer user question about their trip",
    parameters: { question, trip_context }
  },
  {
    name: "add_rating",
    description: "Record user's rating and review of a place",
    parameters: { place_id, rating, review_text, photos }
  }
]
```

### When to Consider Multi-Agent (V2+)

Move to multi-agent if:
1. Single agent accuracy drops below 85%
2. Latency becomes unacceptable (>5s for simple queries)
3. Need truly specialized reasoning (e.g., flight rebooking logic)

Potential future agents:
- **Flight Expert**: Handles rebooking, status, airline policies
- **Local Guide**: Deep knowledge of specific destinations
- **Budget Optimizer**: Finds deals, suggests savings

---

## India-Focused: Why It Matters

### Product Implications

| Area | India-Specific Consideration |
|------|------------------------------|
| **Payments** | UPI integration, Razorpay, Indian card support |
| **Currency** | INR as default, familiar formatting (₹1,00,000) |
| **Language** | Hindi UI option, Hinglish in AI responses |
| **Destinations** | Pre-built knowledge of Thailand, Dubai, Bali, Singapore, Europe (common Indian destinations) |
| **Travel Patterns** | Family trips (3-gen common), wedding season travel, festival holidays |
| **Documents** | Indian passport specifics, visa requirements from India |
| **Pricing** | ₹399/trip (~$4.99), ₹1,999/year (~$25) feels right for India |

### Marketing Implications

| Channel | India Relevance |
|---------|-----------------|
| Instagram/YouTube | Travel influencers huge in India |
| WhatsApp | Primary sharing mechanism |
| Google Play | Android dominant (95%+ market) |
| SEO | "Thailand trip planner", "Bali itinerary" |

### AI Knowledge Focus

Train/prompt the AI with knowledge of:
- Visa requirements FROM India (Thailand visa-free, Dubai visa-on-arrival, etc.)
- Indian vegetarian preferences (very common)
- Festival calendars (Diwali travel, summer holidays)
- Budget expectations (Indian travelers are value-conscious)
- Common booking platforms (MakeMyTrip, Yatra, Goibibo, Cleartrip)

---

## New Feature: Place Ratings & Reviews

### User Story
> As a traveler, I want to rate and review places I visited, so I can remember my experience and help future travelers.

### Data Model

```typescript
interface PlaceRating {
  id: string;
  trip_id: string;
  place: {
    name: string;
    type: "restaurant" | "hotel" | "activity" | "attraction" | "other";
    location: {
      address: string;
      coordinates: { lat: number; lng: number };
      google_place_id?: string;
    };
  };
  rating: 1 | 2 | 3 | 4 | 5;  // Star rating
  review: {
    text?: string;           // Optional written review
    tags?: string[];         // Quick tags: "kid-friendly", "great-view", "overpriced"
    visited_date: Date;
    photos?: string[];       // User photos
  };
  visibility: "private" | "shared" | "public";  // Who can see this
  created_at: Date;
  updated_at: Date;
}
```

### UI Concept

```
┌─────────────────────────────────────────┐
│ 🍽️ Tu Kab Khao Restaurant              │
│ Phuket Old Town • Thai                  │
│                                         │
│ Your Rating: ⭐⭐⭐⭐⭐                  │
│                                         │
│ Quick Tags:                             │
│ [✓ Veg Options] [✓ Worth the Wait]     │
│ [ ] Kid Menu   [ ] Overpriced          │
│                                         │
│ Notes:                                  │
│ ┌─────────────────────────────────────┐ │
│ │ Amazing Massaman curry! Ask for    │ │
│ │ less spicy for kids. Waited 20min  │ │
│ │ but worth it.                      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ 📷 Add Photos                           │
│                                         │
│ Visibility: [Shared with trip] ▼       │
│                                         │
│           [Save Rating]                 │
└─────────────────────────────────────────┘
```

### AI Integration

```
User: "How was that restaurant we went to on day 2?"

AI: "You visited Tu Kab Khao on March 1st and rated it 5 stars!
     You noted: 'Amazing Massaman curry! Ask for less spicy for kids.'

     Want to see your photos from there?"
```

---

## New Feature: Privacy & Sharing Controls

### Permission Model

```
┌─────────────────────────────────────────────────────────────┐
│                    TRIP SHARING MODEL                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Owner (You)                                                 │
│  └── Full access to everything                               │
│                                                              │
│  Co-Planners (Family/Close Friends)                          │
│  └── Can see: Everything including sensitive info            │
│  └── Can edit: Itinerary, expenses, bookings                 │
│  └── Can add: Documents, expenses, ratings                   │
│                                                              │
│  Viewers (Extended family, friends following along)          │
│  └── Can see: Itinerary, places, public notes                │
│  └── CANNOT see: PNR, booking refs, costs, documents         │
│  └── Can add: Nothing (read-only)                            │
│                                                              │
│  Public Link (Blog embed, social share)                      │
│  └── Can see: Curated itinerary only                         │
│  └── CANNOT see: Any sensitive info, costs, documents        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Data Sensitivity Classification

| Data Type | Owner | Co-Planner | Viewer | Public |
|-----------|-------|------------|--------|--------|
| Trip name & dates | ✅ | ✅ | ✅ | ✅ |
| Itinerary (activities) | ✅ | ✅ | ✅ | ✅ |
| Place names & locations | ✅ | ✅ | ✅ | ✅ |
| Notes (non-sensitive) | ✅ | ✅ | ✅ | Optional |
| **PNR / Booking refs** | ✅ | ✅ | ❌ | ❌ |
| **Ticket numbers** | ✅ | ✅ | ❌ | ❌ |
| **Booking documents** | ✅ | ✅ | ❌ | ❌ |
| **Costs & expenses** | ✅ | ✅ | ❌ | ❌ |
| **Seat assignments** | ✅ | ✅ | ❌ | ❌ |
| **Hotel confirmation #** | ✅ | ✅ | ❌ | ❌ |
| **Personal notes** | ✅ | ✅ | ❌ | ❌ |
| Ratings & reviews | ✅ | ✅ | ✅ | Optional |
| Photos | ✅ | ✅ | Optional | Optional |

### UI: Invite Flow

```
┌─────────────────────────────────────────┐
│ 👥 Share Trip                           │
├─────────────────────────────────────────┤
│                                         │
│ Co-Planners (can see everything)        │
│ ┌─────────────────────────────────────┐ │
│ │ 👩 Kriti          Owner             │ │
│ │ 👵 Neena          Co-Planner    ✕   │ │
│ │ + Add co-planner (email/phone)      │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ Viewers (itinerary only, no sensitive)  │
│ ┌─────────────────────────────────────┐ │
│ │ 🔗 Copy viewer link                 │ │
│ │ 📱 Share via WhatsApp               │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ ⚙️ Privacy Settings                     │
│ ┌─────────────────────────────────────┐ │
│ │ ☑ Hide costs from viewers           │ │
│ │ ☑ Hide booking refs from viewers    │ │
│ │ ☐ Allow viewers to see photos       │ │
│ │ ☐ Allow viewers to see my ratings   │ │
│ └─────────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### Viewer Experience

When a viewer opens a shared trip:

```
┌─────────────────────────────────────────┐
│ 🌴 Thailand 2026                        │
│ Shared by Prakhar                       │
│ Feb 28 - Mar 7 • 8 days                 │
├─────────────────────────────────────────┤
│                                         │
│ Day 1 - Saturday, Feb 28                │
│ ─────────────────────────               │
│ ✈️ 06:10 Flight to Phuket               │
│    Air India Express                    │
│    [Booking details hidden]             │
│                                         │
│ 🏨 Centara Grand Beach Resort           │
│    Karon Beach, Phuket                  │
│    [Confirmation hidden]                │
│                                         │
│ 🌅 17:30 Sunset at Karon Beach          │
│                                         │
│ 🍽️ 19:00 Dinner: Tandoori Flames       │
│    Indian • Near hotel                  │
│                                         │
│ ─────────────────────────               │
│ 💡 Want to plan a similar trip?         │
│    [Create your own on GoVault]       │
│                                         │
└─────────────────────────────────────────┘
```

### Technical Implementation

```typescript
// Field-level access control
interface TripField {
  value: any;
  sensitivity: "public" | "viewer" | "co-planner" | "owner";
}

// When serializing for API response
function filterTripForRole(trip: Trip, role: UserRole): FilteredTrip {
  const allowedSensitivity = {
    owner: ["public", "viewer", "co-planner", "owner"],
    co_planner: ["public", "viewer", "co-planner"],
    viewer: ["public", "viewer"],
    public: ["public"]
  };

  return filterFields(trip, allowedSensitivity[role]);
}

// Booking example
const booking = {
  airline: { value: "Air India Express", sensitivity: "public" },
  flight_number: { value: "IX 938", sensitivity: "public" },
  pnr: { value: "ABC123", sensitivity: "co-planner" },  // Hidden from viewers
  ticket_number: { value: "098-123456", sensitivity: "co-planner" },
  cost: { value: 15000, sensitivity: "co-planner" },
  documents: { value: [...], sensitivity: "co-planner" }
};
```

---

## Updated Feature Priority

| Feature | Priority | Notes |
|---------|----------|-------|
| Core trip CRUD | P0 | MVP |
| Itinerary builder | P0 | MVP |
| AI parsing (Gemini Flash) | P0 | MVP - key differentiator |
| Document upload | P0 | MVP |
| Expense tracking | P0 | MVP |
| **Privacy controls** | P0 | MVP - critical for trust |
| Offline mode | P0 | MVP |
| **Sharing (with privacy)** | P1 | MVP |
| **Place ratings** | P1 | MVP - enhances memory/value |
| AI chat assistant | P1 | Post-MVP |
| AI itinerary generation | P1 | Post-MVP |
| Flight status | P2 | Post-MVP |

---

## Testing Plan (Free Tier for Development)

During development and beta:
- All features available free
- AI usage tracked but not limited
- Gather usage data for pricing decisions
- Beta users get lifetime discount on launch

Post-launch free tier:
- 1 active trip
- Manual entry only (no AI)
- Basic sharing (viewer only)
- Limited documents (5)
- No expense tracking
