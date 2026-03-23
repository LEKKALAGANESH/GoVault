# AI Agent Capabilities

## Overview

GoVault uses a **single AI agent** (Gemini 2.0 Flash) with multiple specialized capabilities. The agent has access to the full trip context and can perform various tasks through tool calling.

---

## Complete AI Functionality List

### 1. BOOKING PARSER

**Purpose**: Extract structured booking data from any input format

#### 1a. Email Parsing
```
Input: Forwarded booking confirmation email (any language, any provider)
Output: Structured booking object (flight/hotel/activity/transport)
```

**Capabilities**:
- Parse airline confirmation emails (any airline worldwide)
- Parse hotel booking emails (Booking.com, Airbnb, direct hotel, OTAs)
- Parse car rental confirmations
- Parse train/bus bookings (Trainline, IRCTC, regional providers)
- Parse activity/tour bookings (Viator, GetYourGuide, Klook)
- Handle multi-language emails (translate + extract)
- Handle forwarded/nested email threads
- Extract: confirmation numbers, dates, times, locations, costs, passenger names

#### 1b. Document Parsing (Vision)
```
Input: PDF ticket, screenshot, photo of confirmation
Output: Structured booking object
```

**Capabilities**:
- OCR on boarding passes (PDF and images)
- OCR on hotel vouchers
- OCR on e-tickets
- OCR on handwritten itineraries (basic)
- Extract QR/barcode data when visible
- Handle poor quality images with best-effort extraction

#### 1c. Manual Entry Assist
```
Input: Partial/messy user input ("flight to bangkok on 15th march AI 456")
Output: Structured booking with smart defaults, ask clarifying questions
```

**Capabilities**:
- Parse natural language booking descriptions
- Infer missing fields (airline from flight number, airport from city)
- Ask clarifying questions for ambiguous input
- Suggest corrections for obvious errors

---

### 2. ITINERARY GENERATOR

**Purpose**: Create day-by-day travel plans from requirements

#### 2a. Full Itinerary from Scratch
```
Input: Destination, dates, traveler profiles, preferences
Output: Complete day-by-day itinerary with activities, meals, logistics
```

**Capabilities**:
- Generate multi-day itineraries
- Balance activity intensity across days
- Account for travel time between locations
- Suggest appropriate meal spots
- Include rest/buffer time
- Consider weather/seasonal factors
- Add local tips and cultural notes

#### 2b. Context-Aware Planning
```
Input: Trip context (travelers, preferences, constraints)
Output: Personalized suggestions
```

**Capabilities**:
- **Toddler-aware**: Nap times, kid-friendly venues, stroller accessibility
- **Senior-aware**: Limited walking, seated activities, AC availability
- **Dietary-aware**: Vegetarian restaurants, allergy-safe options
- **Budget-aware**: Free activities, affordable alternatives
- **Mobility-aware**: Wheelchair access, elevator availability
- **Interest-aware**: Beach lover, foodie, culture buff, adventure seeker

#### 2c. Single Day/Activity Suggestions
```
Input: "What should we do tomorrow afternoon?"
Output: 2-3 activity options with reasoning
```

**Capabilities**:
- Suggest activities for specific time slots
- Fill gaps in existing itinerary
- Provide alternatives when plans change
- Suggest based on location proximity
- Consider what's already been done (avoid repetition)

#### 2d. Itinerary Optimization
```
Input: Existing itinerary
Output: Suggested improvements
```

**Capabilities**:
- Identify scheduling conflicts
- Optimize route order (minimize travel time)
- Suggest better time slots
- Flag unrealistic timings
- Recommend rest days when over-scheduled

---

### 3. EXPENSE TRACKER

**Purpose**: Log and categorize trip expenses with minimal friction

#### 3a. Receipt Scanner (Vision)
```
Input: Photo of receipt (any language)
Output: Amount, currency, merchant, category
```

**Capabilities**:
- OCR on printed receipts
- OCR on handwritten bills
- Multi-currency recognition
- Automatic category detection
- Handle receipts in any language
- Extract itemized details when clear

#### 3b. Natural Language Expense Entry
```
Input: "Spent 500 baht on dinner at the hotel"
Output: Structured expense entry
```

**Capabilities**:
- Parse conversational expense descriptions
- Infer category from context
- Default to trip's current location currency
- Handle split expense descriptions ("lunch for 4")
- Parse batch entries ("200 for taxi, 150 for water, 80 for snacks")

#### 3c. Smart Categorization
```
Input: Expense with merchant name
Output: Auto-assigned category and tags
```

**Capabilities**:
- Categorize: Food, Transport, Activities, Shopping, Accommodation, Health, Tips, Other
- Sub-categorize: Breakfast/Lunch/Dinner, Taxi/Metro/Fuel
- Tag: Business expense, Splittable, Reimbursable

#### 3d. Budget Monitoring
```
Input: Current expenses + budget
Output: Alerts, insights, recommendations
```

**Capabilities**:
- Track spend vs budget (total and by category)
- Proactive alerts when approaching limits
- Daily/weekly spend summaries
- Comparison to similar trips (if history exists)

---

### 4. TRAVEL ASSISTANT (Chat)

**Purpose**: Answer questions and help with trip-related tasks

#### 4a. Trip Information Queries
```
User: "What time is our flight tomorrow?"
Agent: Looks up flight, provides details + suggestions
```

**Capabilities**:
- Answer questions about bookings (times, confirmation numbers, addresses)
- Provide directions to hotels/activities
- Remind about upcoming reservations
- Share relevant documents

#### 4b. Local Recommendations
```
User: "Find me a veg restaurant near the hotel"
Agent: Searches, filters, presents options
```

**Capabilities**:
- Restaurant recommendations with filters
- Nearby attractions and activities
- Pharmacy/hospital/ATM locations
- Shopping suggestions
- Transportation options

#### 4c. Travel Advice
```
User: "What should I wear to the temple?"
Agent: Provides cultural/practical guidance
```

**Capabilities**:
- Dress code guidance for venues
- Tipping customs by country
- Safety advisories
- Visa/entry requirements
- Local etiquette tips
- Weather-appropriate suggestions

#### 4d. Problem Solving
```
User: "My mom isn't feeling well"
Agent: Emergency info, nearby hospitals, rebooking suggestions
```

**Capabilities**:
- Emergency contact information
- Medical facility recommendations
- Flight rebooking guidance
- Lost document procedures
- Insurance claim guidance
- Alternative plan suggestions

#### 4e. Itinerary Modifications
```
User: "Move dinner to 8pm and cancel the museum"
Agent: Updates itinerary, confirms changes
```

**Capabilities**:
- Add/remove/modify activities via chat
- Reschedule items
- Swap alternatives
- Adjust for delays/changes

---

### 5. SMART IMPORTER

**Purpose**: Automatically detect and import trip-related information

#### 5a. Email Detection (with Gmail integration)
```
Input: Connected Gmail account
Output: Auto-detected bookings for user approval
```

**Capabilities**:
- Scan inbox for booking confirmations
- Match bookings to existing trips by date
- Create new trip suggestions
- Present drafts for user review/approval
- Handle updates to existing bookings

#### 5b. Calendar Integration
```
Input: Connected Google/Apple Calendar
Output: Synced trip events
```

**Capabilities**:
- Import calendar events as activities
- Export trip itinerary to calendar
- Two-way sync (optional)
- Handle timezone conversions

#### 5c. Document Organization
```
Input: Uploaded documents
Output: Auto-categorized, linked to bookings
```

**Capabilities**:
- Identify document type (boarding pass, hotel voucher, ticket, insurance)
- Link to relevant booking
- Extract key details for quick reference
- Suggest missing documents

---

### 6. PLACE RATER

**Purpose**: Capture and recall user experiences at places visited

#### 6a. Rating Collection
```
Input: Place visited + user feedback
Output: Structured rating with tags
```

**Capabilities**:
- Accept 5-star ratings
- Accept quick tags (kid-friendly, veg-options, overpriced, worth-wait)
- Accept free-text reviews
- Accept photos
- Link rating to itinerary activity

#### 6b. Memory Recall
```
User: "What did we think of that restaurant in Phuket?"
Agent: Retrieves rating, review, photos
```

**Capabilities**:
- Search past ratings by place, trip, or criteria
- Summarize trip highlights based on ratings
- Recommend revisits or avoids for future trips

#### 6c. Recommendation Enhancement
```
Input: Past ratings + new trip
Output: Personalized suggestions
```

**Capabilities**:
- Learn preferences from ratings (likes seafood, dislikes crowded places)
- Adjust future recommendations based on patterns
- Warn about places similar to poorly-rated ones

---

### 7. POST-TRIP ANALYST

**Purpose**: Generate insights and summaries after trip completion

#### 7a. Trip Summary Generation
```
Input: Completed trip data
Output: Shareable trip summary
```

**Capabilities**:
- Generate trip overview (destinations, duration, highlights)
- Create expense breakdown with visualizations
- Compile best-rated places
- Assemble photo timeline
- Export to PDF or shareable link

#### 7b. Expense Insights
```
Input: Trip expenses
Output: Analysis and learnings
```

**Capabilities**:
- Category breakdown (pie chart data)
- Daily spend trends
- Per-person costs
- Budget accuracy analysis
- Comparison to previous trips

#### 7c. Future Trip Suggestions
```
Input: Completed trip + ratings
Output: Recommendations for similar future trips
```

**Capabilities**:
- Suggest similar destinations
- Recommend based on what user enjoyed
- Provide budget estimates based on history

---

## Agent Tools Summary

| Tool Name | Category | Input | Output |
|-----------|----------|-------|--------|
| `parse_email` | Booking Parser | Email content | Booking object |
| `parse_document` | Booking Parser | Image/PDF | Booking object |
| `parse_manual_entry` | Booking Parser | Natural language | Booking object |
| `generate_itinerary` | Itinerary | Requirements | Day-by-day plan |
| `suggest_activities` | Itinerary | Context + constraints | Activity options |
| `optimize_itinerary` | Itinerary | Existing itinerary | Improvements |
| `parse_receipt` | Expense | Receipt image | Expense object |
| `parse_expense_text` | Expense | Natural language | Expense object |
| `categorize_expense` | Expense | Expense details | Category + tags |
| `check_budget` | Expense | Current spend | Alerts/insights |
| `answer_query` | Assistant | Question + context | Answer |
| `search_places` | Assistant | Query + filters | Place results |
| `get_travel_advice` | Assistant | Topic + location | Guidance |
| `modify_itinerary` | Assistant | Change request | Updated itinerary |
| `scan_emails` | Importer | Gmail access | Booking drafts |
| `sync_calendar` | Importer | Calendar access | Synced events |
| `organize_document` | Importer | Document | Categorized doc |
| `add_rating` | Rater | Place + feedback | Rating object |
| `recall_ratings` | Rater | Query | Past ratings |
| `generate_summary` | Analyst | Trip data | Summary |
| `analyze_expenses` | Analyst | Expenses | Insights |

---

## Context Available to Agent

The agent has access to full trip context on every call:

```typescript
interface AgentContext {
  // Trip basics
  trip: {
    id: string;
    name: string;
    destinations: string[];
    start_date: Date;
    end_date: Date;
    status: "planning" | "active" | "completed";
  };

  // Who's traveling
  travelers: {
    name: string;
    age?: number;
    dietary?: string[];
    mobility?: string;
    preferences?: string[];
  }[];

  // All bookings
  bookings: {
    flights: Flight[];
    hotels: Hotel[];
    transport: Transport[];
    activities: Activity[];
  };

  // Current itinerary
  itinerary: {
    day: number;
    date: Date;
    activities: ItineraryItem[];
  }[];

  // Financial
  budget?: {
    total: number;
    by_category: Record<string, number>;
  };
  expenses: Expense[];

  // Documents
  documents: Document[];

  // Ratings
  ratings: PlaceRating[];

  // User preferences (learned over time)
  preferences: {
    cuisine: string[];
    activity_types: string[];
    budget_level: "budget" | "mid" | "luxury";
    pace: "relaxed" | "moderate" | "packed";
  };
}
```

---

## Example Agent Interactions

### Example 1: Email Parsing
```
User: [Forwards Air India confirmation email]

Agent calls: parse_email(email_content)

Agent: "I found your flight booking:

✈️ Air India Express IX 938
   Hyderabad → Phuket
   Feb 28, 2026 • 06:10 - 11:40
   PNR: ABC123

I've added this to your Thailand trip and created Day 1 arrival.
Want me to suggest activities for your first afternoon in Phuket?"
```

### Example 2: Itinerary Generation
```
User: "Plan day 2 for us. We want to see elephants but nothing too tiring for my mom."

Agent calls: generate_itinerary(day=2, constraints={elderly_traveler: true, must_include: "elephants"})

Agent: "Here's a relaxed Day 2:

🐘 Day 2: Elephants & Easy Exploration

09:30 - Phuket Elephant Sanctuary
        Canopy Walkway Experience (2-3 hours)
        → Elevated walkways, no hiking required
        → Stroller-friendly, shaded rest areas

13:00 - Lunch: Tu Kab Khao
        Award-winning Thai • AC seating • Veg options
        → 20 min drive from sanctuary

15:00 - Return to hotel for rest
        → Pool time for Kiaraa

17:30 - Optional: Phuket Old Town walk
        → Only if energy permits
        → Can skip without missing much

I kept the afternoon open for rest. Should I add dinner options?"
```

### Example 3: Expense from Photo
```
User: [Sends photo of Thai receipt]

Agent calls: parse_receipt(image)

Agent: "Got it!

🧾 Expense added:
   Restaurant: ครัวแม่ศรี (Krua Mae Sri)
   Amount: ฿680
   Category: Food & Dining
   Split: All 4 travelers (฿170 each)

Daily total: ฿1,240 | Trip total: ฿8,450
You're 12% under budget 👍"
```

### Example 4: Problem Solving
```
User: "We missed our internal flight to Bangkok. What do we do?"

Agent calls: answer_query(type="emergency", context=current_booking)

Agent: "Don't panic! Here's what to do:

1️⃣ Immediate: Go to Nok Air counter at HKT airport
   📞 Call: 1318 (Nok Air Thailand)

2️⃣ Options:
   • Next Nok Air flight: DD 7523 at 15:30 (likely fee to change)
   • Alternative: Thai AirAsia has a 14:00 flight (~฿2,500/person)
   • Backup: Thai Lion Air at 16:15

3️⃣ Your Bangkok hotel check-in is 14:00
   → I'll update Chatrium that you'll arrive late
   → Their number: 02 307 0100

Want me to search for the best rebooking option?"
```

### Example 5: Memory Recall
```
User: "What was that amazing restaurant we went to on day 3?"

Agent calls: recall_ratings(trip_id, day=3)

Agent: "On Day 3 you had lunch at Three Monkeys Restaurant!

⭐⭐⭐⭐⭐ Your rating: 5 stars
📝 Your note: 'Incredible jungle setting! The mango sticky rice was the best we've ever had. Kiaraa loved the smoothies.'

Tags: #kid-friendly #instagrammable #worth-the-wait

📍 Location: Chalong, Phuket
🔗 Google Maps link

Want me to find similar restaurants for your next trip?"
```
