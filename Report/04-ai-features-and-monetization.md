# AI-First Features & Monetization Strategy

## Vision: AI-Powered Trip Companion

GoVault isn't just a tracker — it's an **AI travel assistant** that understands your trip context and actively helps you organize, optimize, and enjoy your journey.

---

## AI Feature Categories

### 1. Smart Import (AI Parsing)

**Problem**: Users forward booking emails, but parsing fails or requires manual cleanup.

**AI Solution**:
| Feature | Description | AI Model |
|---------|-------------|----------|
| **Universal Email Parser** | Parse ANY booking confirmation email, not just known templates | GPT-4o / Claude |
| **Document OCR + Extraction** | Extract booking details from PDF tickets, screenshots | Vision model |
| **Multi-language Support** | Parse emails in any language | Multilingual LLM |
| **Ambiguity Resolution** | "Is this a layover or two separate bookings?" — AI asks clarifying questions | Conversational AI |

**User Experience**:
```
User: [Forwards email in German from obscure regional airline]
AI: "I found a flight booking:
     - Lufthansa LH 456
     - Frankfurt → Mumbai
     - March 15, 2026 at 14:30
     - Confirmation: ABC123

     Should I add this to your Thailand trip or create a new trip?"
```

---

### 2. AI Itinerary Builder (Core Differentiator)

**Problem**: Building a day-by-day itinerary is tedious. Users spend hours on Google and blogs.

**AI Solution**:

#### 2a. Natural Language Trip Planning
```
User: "I'm going to Phuket for 5 days with my toddler and elderly mom.
       We like beaches but nothing too strenuous."

AI: "Here's a suggested itinerary for your family:

     Day 1: Arrival & Settle In
     - 11:40 Arrive Phuket (based on your flight)
     - 14:00 Check into Centara Grand Karon (confirmed booking)
     - 16:00 Gentle beach time at Karon Beach (calm waves, good for toddlers)
     - 19:00 Dinner: Tandoori Flames (Indian, 5 min from hotel)

     Day 2: Elephants & Old Town
     - 09:30 Phuket Elephant Sanctuary (elevated walkways - stroller friendly!)
     ...

     I've kept mornings relaxed for toddler nap time. Want me to adjust anything?"
```

#### 2b. Context-Aware Suggestions
AI understands your travel party and constraints:

| Context | AI Behavior |
|---------|-------------|
| Traveling with toddler | Suggests nap-friendly schedules, kid-friendly restaurants, stroller accessibility notes |
| Elderly traveler | Avoids stairs, suggests seated activities, notes AC availability |
| Vegetarian preferences | Filters restaurant suggestions, adds "veg options" tags |
| Budget constraints | Suggests free activities, affordable restaurants |
| Mobility limitations | Wheelchair accessibility info, shorter walking distances |

#### 2c. Smart Time Optimization
```
AI: "I noticed you have a 3-hour gap between Big Buddha (16:00) and dinner (19:30).

     Options:
     1. Add sunset drinks at After Beach Bar (10 min from Big Buddha)
     2. Move Big Buddha to 17:00 for sunset views
     3. Keep the gap as buffer time (recommended with toddler)

     What works for your family?"
```

#### 2d. Local Knowledge Integration
AI pulls from curated knowledge + web search:
- "Sunday is Lard Yai Walking Street market — want to add it to Day 2?"
- "Heads up: Big Buddha requires covered shoulders. I've added a reminder."
- "That restaurant is closed Mondays. Here are alternatives..."

---

### 3. AI Expense Assistant

**Problem**: Logging expenses is tedious. Users forget or give up.

**AI Solution**:

#### 3a. Receipt Scanning
```
User: [Takes photo of Thai receipt]

AI: "Got it! I see:
     - Restaurant: ครัวคุณแม่ (Krua Khun Mae)
     - Amount: ฿450 (~$13 USD)
     - Category: Food & Dining
     - Date: Today

     Split among all 4 travelers? [Yes] [No, just me]"
```

#### 3b. Conversational Expense Entry
```
User: "Spent 200 baht on taxi to the hotel"

AI: "Added: ฿200 ($5.60) for Transport
     Paid by: You
     Split: All travelers

     Your daily spend is now ฿1,450 ($41). You're 15% under budget!"
```

#### 3c. Proactive Budget Alerts
```
AI: "Heads up! You've spent 70% of your Food budget with 3 days left.

     Options:
     1. Adjust budget (+$100)
     2. See cheaper restaurant alternatives
     3. Dismiss"
```

---

### 4. AI Travel Assistant (Chat Interface)

A persistent chat interface that knows your entire trip context.

**Example Conversations**:

```
User: "What time is our flight tomorrow?"
AI: "Your flight IX 938 departs at 06:10 from Hyderabad.
     You should leave for the airport by 03:30.
     Want me to set a reminder?"
```

```
User: "Find me a vegetarian restaurant near the hotel for tonight"
AI: "Here are 3 veg-friendly options near Centara Grand Karon:

     1. Tandoori Flames (Indian) - 5 min walk - $$
        Great reviews for paneer dishes

     2. Pad Thai Shop (Thai) - 8 min walk - $
        Has veg Pad Thai, very affordable

     3. Little India (Indian) - 10 min walk - $$
        AC seating, kid menu available

     Want me to add one to tonight's itinerary?"
```

```
User: "My mom isn't feeling well. What should I do?"
AI: "I'm sorry to hear that. Here's what I suggest:

     🏥 Nearest Hospital: Bangkok Hospital Phuket
        📞 076 254 425 (tap to call)
        📍 15 min by Grab from your hotel

     💊 For minor issues, there's a Boots pharmacy
        at Karon Plaza (5 min walk)

     🆘 Emergency: Tourist Police 1155

     Should I help you rearrange tomorrow's plans?"
```

---

### 5. AI Post-Trip Insights

**After the trip, AI generates**:

#### Trip Summary
```
"Your Thailand Adventure - March 2026

📍 2 cities: Phuket, Bangkok
📅 8 days, 7 nights
👨‍👩‍👧‍👦 4 travelers

💰 Total Spend: $2,450 ($306/person)
   - Flights: $800 (33%)
   - Hotels: $650 (27%)
   - Food: $480 (20%)
   - Activities: $320 (13%)
   - Transport: $200 (8%)

🌟 Highlights:
   - Phang Nga Bay canoe tour
   - Elephant sanctuary visit
   - Chatuchak Weekend Market

📸 47 photos captured

[Generate Shareable Summary] [Export to PDF]"
```

#### Budget Learnings
```
"Compared to your last trip (Japan 2024):
- You spent 30% less on food
- Transport was 2x more expensive
- You stayed under budget by $200

For your next Asia trip, I'd suggest budgeting:
- $60/day for a family of 4
- $15-20/day for transport"
```

---

## AI Architecture

### Model Selection

| Feature | Model | Rationale |
|---------|-------|-----------|
| Email/receipt parsing | GPT-4o / Claude 3.5 | Best at extraction |
| Itinerary generation | Claude 3.5 Sonnet | Best at structured output |
| Chat assistant | GPT-4o-mini / Claude Haiku | Fast, cheap, good enough |
| Image OCR | GPT-4o Vision | Best multimodal |
| Embeddings | OpenAI ada-002 | Cheap, fast similarity |

### Context Management
```
Trip Context (always included):
- Trip dates, destinations
- Travelers (names, ages, needs)
- All bookings
- Current itinerary
- Budget & expenses
- User preferences

Query: User message + relevant trip context
→ AI generates response
→ Parse structured actions (add expense, modify itinerary, etc.)
```

### Cost Optimization
| Tier | AI Usage | Est. Cost/Trip |
|------|----------|----------------|
| Free | 10 AI queries | $0.05 |
| Pro | Unlimited | $0.50-2.00 |
| Heavy user | 200+ queries | $3-5 |

At $4.99/trip or $29/year, AI costs are sustainable with healthy margins.

---

## Monetization Strategy

### Subscription Tiers

#### Free Tier
- 1 active trip
- Manual entry only (no AI import)
- Basic itinerary view
- 5 document uploads
- 20 expenses per trip
- No AI assistant
- Offline access for current trip

**Purpose**: Try before you buy, viral sharing (recipients see value)

---

#### Pro Tier — $4.99/trip OR $29/year

**AI Features**:
- ✅ AI email/document parsing (unlimited)
- ✅ AI itinerary suggestions
- ✅ AI receipt scanning
- ✅ AI travel assistant (chat)
- ✅ AI post-trip insights

**Core Features**:
- ✅ Unlimited active trips
- ✅ Unlimited documents
- ✅ Unlimited expenses
- ✅ Multi-currency + auto-conversion
- ✅ Trip sharing (unlimited viewers/editors)
- ✅ Expense splitting & settlement
- ✅ Flight status alerts
- ✅ Offline access (all trips)
- ✅ Data export (PDF, CSV)
- ✅ Priority support

---

#### Team/Family Tier — $49/year (up to 5 members)

Everything in Pro, plus:
- ✅ Shared trip library
- ✅ Family member profiles (dietary, medical, preferences)
- ✅ Collaborative trip planning
- ✅ Shared expense categories
- ✅ Admin controls

---

### Pricing Psychology

| Model | Price | Best For |
|-------|-------|----------|
| Per-trip | $4.99 | Occasional travelers (1-2 trips/year) |
| Annual | $29 | Frequent travelers (3+ trips/year) |
| Family | $49 | Families who travel together |

**Conversion Hooks**:
1. Free trip → Hit document limit → Upgrade prompt
2. Free trip → Try AI parsing → "Upgrade for unlimited"
3. Share trip → Recipient sees value → Creates account → Converts

---

### Revenue Projections

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Free users | 50,000 | 200,000 | 500,000 |
| Conversion rate | 5% | 7% | 10% |
| Paid users | 2,500 | 14,000 | 50,000 |
| ARPU | $25 | $28 | $30 |
| Revenue | $62,500 | $392,000 | $1,500,000 |

---

## AI Competitive Moat

### Why AI Makes Us Defensible

1. **Data Flywheel**: More trips → Better AI training → Better suggestions → More users
2. **Personalization**: AI learns user preferences over time
3. **Switching Cost**: Users invest in AI understanding their travel style
4. **Network Effects**: Shared trips expose more users to AI value

### Competitive Response

| Competitor | AI Status | Our Advantage |
|------------|-----------|---------------|
| TripIt | No AI | They're SAP-owned, slow to innovate |
| Wanderlog | Basic AI planning | No expense tracking, no document parsing |
| Google Trips | Dead | Google abandoned consumer travel |
| Notion | Generic AI | No travel-specific features |

---

## AI Development Roadmap

### Phase 1: MVP (Month 1-3)
- [ ] Email parsing (GPT-4o)
- [ ] Receipt OCR (Vision API)
- [ ] Basic chat assistant

### Phase 2: Smart Suggestions (Month 4-6)
- [ ] Itinerary generation from natural language
- [ ] Context-aware restaurant/activity suggestions
- [ ] Proactive alerts and reminders

### Phase 3: Personalization (Month 7-12)
- [ ] Learn user preferences over trips
- [ ] Predictive budget suggestions
- [ ] Trip templates from past trips

### Phase 4: Advanced (Year 2)
- [ ] Voice interface
- [ ] Real-time translation assist
- [ ] Local guide recommendations
- [ ] Group consensus building ("AI suggests best time for everyone")

---

## Sample AI Prompts (Implementation Reference)

### Email Parsing Prompt
```
You are a travel booking parser. Extract structured data from this email.

Return JSON:
{
  "type": "flight|hotel|car|activity|train|other",
  "provider": "airline/hotel name",
  "confirmation": "booking reference",
  "dates": {
    "start": "ISO date",
    "end": "ISO date"
  },
  "details": {
    // type-specific fields
  },
  "raw_text": "original relevant text"
}

If uncertain, include "confidence": 0.0-1.0 and "questions": ["clarifying questions"]

Email content:
[EMAIL HERE]
```

### Itinerary Generation Prompt
```
You are a travel planning assistant. Create a day-by-day itinerary.

Trip context:
- Destination: {destination}
- Dates: {start} to {end}
- Travelers: {traveler_profiles}
- Preferences: {preferences}
- Existing bookings: {bookings}
- Budget: {budget}

Generate an itinerary that:
1. Works around existing bookings (flights, hotels)
2. Accounts for traveler needs (age, mobility, dietary)
3. Balances activities with rest time
4. Stays within budget
5. Includes practical details (travel time, tips)

Format as structured JSON with:
- day_number
- date
- activities: [{time, title, description, location, duration, cost_estimate, tags}]
- meals: [{time, name, cuisine, price_range, notes}]
- notes: general day notes
```

### Expense Entry Prompt
```
Parse this expense input. User is on a trip to {destination}.

Input: "{user_input}"
Image (if any): {image_description}

Return:
{
  "amount": number,
  "currency": "THB|USD|EUR|etc",
  "category": "food|transport|activity|shopping|accommodation|other",
  "merchant": "name if identifiable",
  "date": "ISO date, default today",
  "split": "all|solo",
  "confidence": 0.0-1.0
}
```

---

## Success Metrics for AI Features

| Metric | Target | Measurement |
|--------|--------|-------------|
| Parse success rate | >90% | Bookings correctly extracted |
| AI query satisfaction | >4.0/5 | User ratings on responses |
| Itinerary acceptance | >60% | Users keep AI suggestions |
| Receipt scan accuracy | >85% | Correct amount/merchant |
| Chat resolution rate | >70% | Questions answered without escalation |
| Cost per user/month | <$0.50 | AI API costs |
