# UX Screens & Wireframes

## Design Principles

1. **Mobile-First**: Designed for phone, scales up to desktop
2. **One-Tap Actions**: Common tasks accessible in 1-2 taps
3. **Offline Obvious**: Clear indication of connectivity state
4. **AI Invisible**: AI should feel like magic, not a separate mode
5. **Beautiful Sharing**: Shared views should be impressive

---

## "Made with Love" Philosophy

The existing HTML reference shows what makes a trip feel personal. **GoVault should feel like a gift you're giving your travel companions, not a spreadsheet.**

### Personal Touches to Embed Throughout

| Element | Example from Reference |
|---------|----------------------|
| **Trip Identity** | "Thailand 2026 • 10th Anniversary Edition" with Thai greeting สวัสดี |
| **Traveler Context** | "👵 Neena (67)" and "👶 Kiaraa (20 mo)" - ages matter for planning |
| **Thoughtful Notes** | "Drop at top parking (no stairs for Neena)" |
| **Activity Awareness** | "Elevated bridges = no mud, stroller-friendly" |
| **Personal Moments** | "Kiaraa feeds bananas to giraffes!" |
| **Energy Awareness** | "🔋 Easy", "🔋 Medium", "🔋 Full Day" badges |
| **Day Context** | "Arrival & recovery day. Early flight = afternoon naps." |
| **Survival Wisdom** | "Nap time is sacred - plan around it!" |
| **Dedicated Sections** | "👶 Kiaraa's Essentials", "👵 Neena's Comfort" |

### Design Implications

1. **Trip headers should celebrate the occasion** — Not just "Thailand Trip" but the story ("Anniversary", "First International Trip with Baby")

2. **Traveler profiles drive the UI** — Show ages, dietary needs, mobility notes. Let them influence suggestions and warnings.

3. **Activity tips are first-class** — The 💡 tips ("stroller-friendly", "no stairs") are as important as times and locations.

4. **Energy levels matter** — Badge each day. Help users see the rhythm of rest vs. adventure.

5. **Food is personal** — Don't just say "Dinner". Say "Dal Makhani, Paneer Butter Masala" with veg tags and kid-friendly notes.

6. **Expenses are tracked, not displayed prominently** — Users want to know "what did we spend?" not see budget anxiety at every glance. Keep it accessible but not front-and-center.

---

## User Flows

### Flow 1: New User Onboarding
```
Landing Page → Sign Up (Google/Email) → Create First Trip → Add Booking → View Dashboard
```

### Flow 2: Add Booking via AI
```
Trip Dashboard → "Add Booking" → Forward Email / Upload Doc → AI Preview → Confirm → Booking Added
```

### Flow 3: Daily Trip Usage
```
Open App → Today's View → Check Activity → Log Expense (photo) → View Budget
```

### Flow 4: Share Trip
```
Trip Settings → Share → Invite Co-Planner (email) OR Copy Viewer Link → Recipient Opens Link
```

### Flow 5: Expense Logging
```
Quick Add Button → Photo Receipt OR Type "200 baht taxi" → AI Parses → Confirm → Saved
```

---

## Screen Index

| # | Screen | Priority |
|---|--------|----------|
| 1 | Landing Page | P0 |
| 2 | Login/Signup | P0 |
| 3 | Trip List (Home) | P0 |
| 4 | Create Trip | P0 |
| 5 | Trip Dashboard | P0 |
| 6 | Itinerary View | P0 |
| 7 | Day Detail | P0 |
| 8 | Add/Edit Activity | P0 |
| 9 | Bookings List | P0 |
| 10 | Booking Detail | P0 |
| 11 | Add Booking (Manual) | P0 |
| 12 | Add Booking (AI Import) | P0 |
| 13 | Expenses List | P0 |
| 14 | Add Expense | P0 |
| 15 | Expense Summary | P1 |
| 16 | Documents | P0 |
| 17 | AI Chat | P1 |
| 18 | Share Settings | P0 |
| 19 | Viewer (Public Link) | P0 |
| 20 | Ratings | P1 |
| 21 | Emergency Hub | P1 |
| 22 | Packing Checklist | P1 |

---

# Screen Wireframes

## 1. Landing Page

```
┌─────────────────────────────────────┐
│                                     │
│         [GoVault Logo]            │
│                                     │
│    Your AI Travel Companion         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │     [Hero Illustration]       │  │
│  │     Trip cards floating       │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  • All bookings in one place        │
│  • AI parses your confirmations     │
│  • Track expenses as you go         │
│  • Works offline                    │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     Get Started Free          │  │
│  └───────────────────────────────┘  │
│                                     │
│       Already have account?         │
│           [Sign In]                 │
│                                     │
└─────────────────────────────────────┘
```

---

## 2. Login/Signup

```
┌─────────────────────────────────────┐
│              ← Back                 │
│                                     │
│         [GoVault Logo]            │
│                                     │
│          Welcome back               │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📧  Continue with Google     │  │
│  └───────────────────────────────┘  │
│                                     │
│           ──── or ────              │
│                                     │
│  Email                              │
│  ┌───────────────────────────────┐  │
│  │  you@email.com                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │     Send Magic Link           │  │
│  └───────────────────────────────┘  │
│                                     │
│  We'll email you a login link.      │
│  No password needed.                │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Trip List (Home)

```
┌─────────────────────────────────────┐
│  GoVault              [Avatar]    │
├─────────────────────────────────────┤
│                                     │
│  Your Trips                         │
│                                     │
│  [Upcoming] [Active] [Past]         │
│  ─────────                          │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🇹🇭 ░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │    Thailand 2026              │  │
│  │    Feb 28 - Mar 7 • 8 days    │  │
│  │    In 45 days                 │  │
│  │    4 travelers • 3 bookings   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🇯🇵 ░░░░░░░░░░░░░░░░░░░░░░░░ │  │
│  │    Japan 2026                 │  │
│  │    Oct 10 - Oct 20            │  │
│  │    Planning                   │  │
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│    + Create New Trip               │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                     │
├─────────────────────────────────────┤
│  [🏠]    [➕]    [⚙️]              │
│  Home   Add    Settings             │
└─────────────────────────────────────┘
```

---

## 4. Create Trip

```
┌─────────────────────────────────────┐
│  ← Cancel          Create Trip      │
├─────────────────────────────────────┤
│                                     │
│  Trip Name                          │
│  ┌───────────────────────────────┐  │
│  │  Thailand 2026                │  │
│  └───────────────────────────────┘  │
│                                     │
│  What's the occasion? (optional)    │
│  ┌───────────────────────────────┐  │
│  │  10th Anniversary Edition     │  │
│  └───────────────────────────────┘  │
│  💡 "Honeymoon", "First trip with   │
│     baby", "Graduation trip"        │
│                                     │
│  Destination(s)                     │
│  ┌───────────────────────────────┐  │
│  │  🔍 Search city or country    │  │
│  └───────────────────────────────┘  │
│  [Phuket, Thailand ×]               │
│  [Bangkok, Thailand ×]              │
│                                     │
│  Dates                              │
│  ┌──────────────┐ ┌──────────────┐  │
│  │ Feb 28, 2026 │ │ Mar 7, 2026  │  │
│  │ Start        │ │ End          │  │
│  └──────────────┘ └──────────────┘  │
│  8 days / 7 nights                  │
│                                     │
│  Cover Image (optional)             │
│  ┌───────────────────────────────┐  │
│  │      [+ Add Photo]            │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │        Create Trip            │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Personal touch:** The "occasion" field lets users give their trip meaning — this shows prominently throughout the app.

---

## 4b. Add Travelers

```
┌─────────────────────────────────────┐
│  ← Back           Add Travelers     │
├─────────────────────────────────────┤
│                                     │
│  Who's traveling?                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 👨 Prakhar              [You] │  │
│  │    Adult                      │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 👩 Kriti                      │  │
│  │    Adult                      │  │
│  │    🏷️ Vegetarian              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 👵 Neena                      │  │
│  │    67 years old               │  │
│  │    🏷️ Vegetarian              │  │
│  │    🏷️ Limited mobility        │  │
│  │    💡 Will consider stairs,   │  │
│  │       walking distances       │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 👶 Kiaraa                     │  │
│  │    20 months old              │  │
│  │    💡 Will suggest nap times, │  │
│  │       stroller access, kid    │  │
│  │       friendly spots          │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐  │
│    + Add Traveler                  │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │          Continue             │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Why this matters:**
- Ages drive AI suggestions (nap times, activity intensity)
- Dietary tags filter restaurant recommendations
- Mobility notes affect activity choices ("no stairs for Neena")
- Traveler context flows through the entire itinerary

---

## 4c. Add Traveler Detail

```
┌─────────────────────────────────────┐
│  ← Cancel          Add Traveler     │
├─────────────────────────────────────┤
│                                     │
│  Name                               │
│  ┌───────────────────────────────┐  │
│  │  Neena                        │  │
│  └───────────────────────────────┘  │
│                                     │
│  Type                               │
│  [👨 Adult] [👴 Senior] [👶 Child]  │
│  [🧒 Infant]                        │
│                                     │
│  Age (helps us suggest better)      │
│  ┌───────────────────────────────┐  │
│  │  67                           │  │
│  └───────────────────────────────┘  │
│                                     │
│  Dietary Preferences                │
│  [☑ Vegetarian] [☐ Vegan]          │
│  [☐ Gluten-free] [☐ Halal]         │
│  [☐ No nuts]                        │
│                                     │
│  Mobility                           │
│  (●) No concerns                    │
│  ( ) Limited walking                │
│  ( ) Wheelchair access needed       │
│  ( ) Stroller needed                │
│                                     │
│  Notes (optional)                   │
│  ┌───────────────────────────────┐  │
│  │  Prefers AC places, avoid     │  │
│  │  long walks in sun            │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │         Add Traveler          │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 5. Trip Dashboard

```
┌─────────────────────────────────────┐
│  ← Trips                    [···]   │
├─────────────────────────────────────┤
│  ┌───────────────────────────────┐  │
│  │ 🇹🇭 Thailand 2026             │  │
│  │    10th Anniversary Edition   │  │
│  │    สวัสดี                      │  │
│  │                               │  │
│  │    Feb 28 - Mar 7 • 8 days    │  │
│  │    ⏱️ 45 days to go           │  │
│  └───────────────────────────────┘  │
│                                     │
│  Travelers                          │
│  ┌───────────────────────────────┐  │
│  │ 👨 Prakhar  👩 Kriti          │  │
│  │ 👵 Neena (67)  👶 Kiaraa (20mo)│  │
│  └───────────────────────────────┘  │
│                                     │
│  Coming Up                          │
│  ┌───────────────────────────────┐  │
│  │ Day 1 • Arrival in Phuket     │  │
│  │ 🔋 Easy day                   │  │
│  │ ✈️ 06:10 Depart HYD           │  │
│  │ 🏨 14:00 Centara Grand        │  │
│  │ 🌅 17:30 Sunset at Karon      │  │
│  └───────────────────────────────┘  │
│                                     │
│  Quick Actions                      │
│  ┌─────────┐ ┌─────────┐           │
│  │ ✈️ Add  │ │ 💰 Log  │           │
│  │ Booking │ │ Expense │           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐           │
│  │ 📄 Add  │ │ 🤖 Ask  │           │
│  │ Document│ │ AI      │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ ✈️ 3 │ │ 📄 5 │ │ 💰   │        │
│  │Book- │ │ Docs │ │₹45k  │        │
│  │ings  │ │      │ │spent │        │
│  └──────┘ └──────┘ └──────┘        │
│                                     │
├─────────────────────────────────────┤
│ [📋]  [✈️]  [📅]  [💰]  [📄]       │
│ Home  Book  Itin  Exp   Docs       │
└─────────────────────────────────────┘
```

**Key changes from standard dashboard:**
- Trip subtitle/occasion is prominent (not just dates)
- Travelers shown with ages/context upfront
- "Coming Up" shows the next day's rhythm, not stats
- Expenses shown as simple number (₹45k spent), not progress bar
- No budget anxiety — just facts

---

## 6. Itinerary View

```
┌─────────────────────────────────────┐
│  ← Trip             Itinerary       │
├─────────────────────────────────────┤
│                                     │
│  [Timeline] [Calendar] [Map]        │
│  ─────────                          │
│                                     │
│  Day 1 • Sat, Feb 28     🔋 Easy   │
│  Arrival in Phuket                  │
│  ┌───────────────────────────────┐  │
│  │ Arrival & recovery day.       │  │
│  │ Early flight = afternoon naps │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ 06:10  ✈️ Depart HYD          │  │
│  │        Air India IX 938       │  │
│  ├───────────────────────────────┤  │
│  │ 14:00  🏨 Centara Grand       │  │
│  │        Deluxe Suite w/ Pool   │  │
│  ├───────────────────────────────┤  │
│  │ 17:30  🌅 Sunset at Karon     │  │
│  │        Direct beach access    │  │
│  ├───────────────────────────────┤  │
│  │ 19:00  🍽️ Tandoori Flames    │  │
│  │        Indian • 5 min walk    │  │
│  │        🏷️ veg  👶 kid-friendly │  │
│  └───────────────────────────────┘  │
│                                     │
│  Day 2 • Sun, Mar 1    🔋 Medium   │
│  Elephants & Old Town        [▼]   │
│  ┌───────────────────────────────┐  │
│  │ Sanctuary has elevated walk-  │  │
│  │ ways (stroller-friendly!)     │  │
│  └───────────────────────────────┘  │
│                                     │
│  Day 3 • Mon, Mar 2    🔋 Full Day │
│  Phang Nga Bay               [▼]   │
│                                     │
│           [+ Add Activity]          │
│                                     │
├─────────────────────────────────────┤
│ [📋]  [✈️]  [📅]  [💰]  [📄]       │
└─────────────────────────────────────┘
```

**Key elements from reference HTML:**
- Energy badges (🔋 Easy/Medium/Full Day) on each day
- Day summary context box ("Arrival & recovery day...")
- Activity tips inline ("stroller-friendly!")
- Restaurant tags (veg, kid-friendly)
- Personal details ("Direct beach access")

---

## 7. Day Detail

```
┌─────────────────────────────────────┐
│  ← Itinerary       Day 1    [Edit]  │
├─────────────────────────────────────┤
│                                     │
│  Saturday, February 28              │
│  Arrival in Phuket       🔋 Easy   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 📋 Day Summary                │  │
│  │ Arrival & recovery day. Early │  │
│  │ flight = afternoon naps.      │  │
│  │ Private pool time and sunset  │  │
│  │ beach walk.                   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ──────────────────────────────     │
│                                     │
│  06:10                              │
│  ┌───────────────────────────────┐  │
│  │ ✈️ Depart Hyderabad (HYD)     │  │
│  │                               │  │
│  │ Air India Express IX 938      │  │
│  │ HYD → HKT • 4h 00m            │  │
│  │                               │  │
│  │ 💡 Be at airport by 04:00     │  │
│  │                               │  │
│  │ [View Booking] [Boarding Pass]│  │
│  └───────────────────────────────┘  │
│                                     │
│  11:40                              │
│  ┌───────────────────────────────┐  │
│  │ 🛬 Arrive Phuket (HKT)        │  │
│  │                               │  │
│  │ 💡 Visa on Arrival + baggage  │  │
│  │    (~45 min)                  │  │
│  └───────────────────────────────┘  │
│                                     │
│  14:00                              │
│  ┌───────────────────────────────┐  │
│  │ 🏨 Check-in Centara Grand     │  │
│  │                               │  │
│  │ Deluxe Suite with Private Pool│  │
│  │ Karon Beach, Phuket           │  │
│  │                               │  │
│  │ [View Booking] [📍 Map]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  17:30                              │
│  ┌───────────────────────────────┐  │
│  │ 🌅 Sunset at Karon Beach      │  │
│  │                               │  │
│  │ Direct beach access from hotel│  │
│  │                               │  │
│  │ [📍 Map] [✏️ Edit] [🗑️]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  19:00                              │
│  ┌───────────────────────────────┐  │
│  │ 🍽️ Dinner: Tandoori Flames   │  │
│  │                               │  │
│  │ Indian • 5 min from hotel     │  │
│  │ 🏷️ veg  👶 kid-friendly       │  │
│  │                               │  │
│  │ ┌─────────────────────────┐   │  │
│  │ │ 🍽️ Dal Makhani, Paneer  │   │  │
│  │ │    Butter Masala, Naan  │   │  │
│  │ └─────────────────────────┘   │  │
│  │                               │  │
│  │ [📍 Map] [⭐ Rate] [💰 Log]   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ──────────────────────────────     │
│                                     │
│  🍴 Alternative Restaurants         │
│  ┌───────────────────────────────┐  │
│  │ On The Rock                   │  │
│  │ Thai Seafood • Beachfront     │  │
│  │ 🏷️ veg-options • $$$$         │  │
│  ├───────────────────────────────┤  │
│  │ Pad Thai Shop Karon           │  │
│  │ Street Food • Local favorite  │  │
│  │ 🏷️ veg • $                    │  │
│  └───────────────────────────────┘  │
│                                     │
│        [+ Add Activity]             │
│                                     │
└─────────────────────────────────────┘
```

**Personal elements:**
- Day summary box at top with context
- 💡 Tips inline ("Be at airport by 04:00")
- Tags for dietary/family (🏷️ veg, 👶 kid-friendly)
- Specific food recommendations in highlighted box
- Alternative restaurants section (like HTML reference)

---

## 8. Add/Edit Activity

```
┌─────────────────────────────────────┐
│  ← Cancel            Add Activity   │
├─────────────────────────────────────┤
│                                     │
│  Type                               │
│  [🎯Activity] [🍽️Meal] [🚗Transport]│
│  [⏰Free Time] [Other]              │
│                                     │
│  Title *                            │
│  ┌───────────────────────────────┐  │
│  │  Sunset at Karon Beach        │  │
│  └───────────────────────────────┘  │
│                                     │
│  Time                               │
│  ┌──────────────┐ ┌──────────────┐  │
│  │  17:30       │ │  18:30       │  │
│  │  Start       │ │  End (opt)   │  │
│  └──────────────┘ └──────────────┘  │
│                                     │
│  Location                           │
│  ┌───────────────────────────────┐  │
│  │  🔍 Search or enter address   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Notes                              │
│  ┌───────────────────────────────┐  │
│  │  Direct beach access from     │  │
│  │  hotel. Bring camera!         │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Link to Booking (optional)         │
│  ┌───────────────────────────────┐  │
│  │  None selected            [▼] │  │
│  └───────────────────────────────┘  │
│                                     │
│  Status                             │
│  (●) Confirmed  ( ) Tentative       │
│                                     │
│  ┌───────────────────────────────┐  │
│  │         Save Activity         │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 9. Bookings List

```
┌─────────────────────────────────────┐
│  ← Trip                  Bookings   │
├─────────────────────────────────────┤
│                                     │
│  [All] [✈️Flights] [🏨Hotels] [🚗]  │
│  ────                               │
│                                     │
│  ✈️ Flights (3)                     │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  HYD ────✈️──── HKT           │  │
│  │  Air India Express • IX 938   │  │
│  │  Feb 28 • 06:10 - 11:40       │  │
│  │  [✓ Confirmed]                │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  HKT ────✈️──── DMK           │  │
│  │  Nok Air • DD XXXX            │  │
│  │  Mar 4 • 11:30 - 13:00        │  │
│  │  [⚠️ To Book]                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  🏨 Hotels (2)                      │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Centara Grand Beach Resort   │  │
│  │  Phuket • 4 nights            │  │
│  │  Feb 28 - Mar 4               │  │
│  │  [✓ Confirmed]                │  │
│  └───────────────────────────────┘  │
│                                     │
│        [+ Add Booking]              │
│                                     │
├─────────────────────────────────────┤
│ [📋]  [✈️]  [📅]  [💰]  [📄]       │
└─────────────────────────────────────┘
```

---

## 10. Booking Detail (Flight)

```
┌─────────────────────────────────────┐
│  ← Bookings                 [Edit]  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ░░░░░░░░░░░░░░░░░░░░░░░░░░  │  │
│  │      Air India Express        │  │
│  │           IX 938              │  │
│  │                               │  │
│  │   HYD ──────✈️────── HKT     │  │
│  │  06:10              11:40     │  │
│  │  Hyderabad         Phuket     │  │
│  │                               │  │
│  │      [✓ Confirmed]            │  │
│  └───────────────────────────────┘  │
│                                     │
│  Details                            │
│  ┌───────────────────────────────┐  │
│  │ Date       Sat, Feb 28, 2026  │  │
│  │ Duration   4h 00m             │  │
│  │ PNR        ABC123             │  │
│  │ Ticket #   098-1234567890     │  │
│  └───────────────────────────────┘  │
│                                     │
│  Seats                              │
│  ┌───────────────────────────────┐  │
│  │ Prakhar    12A                │  │
│  │ Kriti      12B                │  │
│  │ Neena      12C                │  │
│  │ Kiaraa     12D                │  │
│  └───────────────────────────────┘  │
│                                     │
│  Documents                          │
│  ┌───────────────────────────────┐  │
│  │ 📄 Boarding_Pass.pdf   [View] │  │
│  │ + Attach document             │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌─────────────────────────────┐    │
│  │   Add to Apple Wallet       │    │
│  └─────────────────────────────┘    │
│                                     │
└─────────────────────────────────────┘
```

---

## 11. Add Booking (Manual)

```
┌─────────────────────────────────────┐
│  ← Cancel             Add Booking   │
├─────────────────────────────────────┤
│                                     │
│  How would you like to add?         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📧  Forward Email            │  │
│  │      Send confirmation to:    │  │
│  │      trips@govault.app      │  │
│  │                    [Copy]     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  📷  Scan Document            │  │
│  │      Photo of ticket/voucher  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✏️  Enter Manually           │  │
│  │      Type booking details     │  │
│  └───────────────────────────────┘  │
│                                     │
│  ──────── OR ────────               │
│                                     │
│  Booking Type                       │
│  [✈️Flight] [🏨Hotel] [🚗Transport] │
│  [🎫Activity]                       │
│                                     │
│  (Form fields appear based on       │
│   selected type - see US-2.1)       │
│                                     │
└─────────────────────────────────────┘
```

---

## 12. Add Booking (AI Import Preview)

```
┌─────────────────────────────────────┐
│  ← Back                AI Import    │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🤖 I found a flight booking  │  │
│  │                               │  │
│  │  Confidence: 95%              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✈️ Air India Express         │  │
│  │     IX 938                    │  │
│  │                               │  │
│  │  HYD → HKT                    │  │
│  │  Feb 28, 2026                 │  │
│  │  06:10 - 11:40                │  │
│  │                               │  │
│  │  PNR: ABC123                  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ⚠️ Please verify:                  │
│  • Seats not detected - add them?   │
│  • Cost not found                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✏️ Edit Details              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  ✓  Confirm & Add Booking     │  │
│  └───────────────────────────────┘  │
│                                     │
│       [Try Again] [Enter Manually]  │
│                                     │
└─────────────────────────────────────┘
```

---

## 13. Expenses List

```
┌─────────────────────────────────────┐
│  ← Trip                  Expenses   │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  Trip Total: ₹45,000          │  │
│  │  ₹5,625 / day average         │  │
│  │                    [Summary →]│  │
│  └───────────────────────────────┘  │
│                                     │
│  [All] [Food] [Transport] [Activity]│
│  ────                               │
│                                     │
│  Today • Mar 1                      │
│  ┌───────────────────────────────┐  │
│  │ 🍽️ Tandoori Flames   ₹2,400  │  │
│  │    Dinner • Split 4 ways      │  │
│  │    Dal Makhani, Paneer...     │  │
│  ├───────────────────────────────┤  │
│  │ 🚕 Grab to Old Town    ₹450  │  │
│  │    Phuket → Old Town          │  │
│  └───────────────────────────────┘  │
│                                     │
│  Yesterday • Feb 28                 │
│  ┌───────────────────────────────┐  │
│  │ 🍽️ Airport lunch     ₹1,200  │  │
│  │    Before departure           │  │
│  ├───────────────────────────────┤  │
│  │ 🚕 Taxi to airport     ₹800  │  │
│  │    Home → HYD Airport         │  │
│  └───────────────────────────────┘  │
│                                     │
│                                     │
│       ┌─────────────────────┐       │
│       │  + Add Expense      │       │
│       └─────────────────────┘       │
│                                     │
├─────────────────────────────────────┤
│ [📋]  [✈️]  [📅]  [💰]  [📄]       │
└─────────────────────────────────────┘
```

**Key changes:**
- No budget progress bar — just total spent
- Daily average shown (useful info without anxiety)
- Summary link for those who want detailed breakdown
- Each expense has context (what was ordered, route taken)

---

## 14. Add Expense

```
┌─────────────────────────────────────┐
│  ← Cancel             Add Expense   │
├─────────────────────────────────────┤
│                                     │
│  Quick Add                          │
│  ┌───────────────────────────────┐  │
│  │  📷  Scan Receipt             │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │  💬  Type naturally           │  │
│  │  "500 baht dinner at hotel"   │  │
│  └───────────────────────────────┘  │
│                                     │
│  ──────── OR ────────               │
│                                     │
│  Amount *                           │
│  ┌────────────┐ ┌────────────────┐  │
│  │    500     │ │  THB (฿)    ▼  │  │
│  └────────────┘ └────────────────┘  │
│  ≈ ₹1,200 INR                       │
│                                     │
│  Category *                         │
│  [🍽️Food] [🚗Transport] [🎫Activity]│
│  [🛍️Shop] [💊Health] [Other]       │
│                                     │
│  Description                        │
│  ┌───────────────────────────────┐  │
│  │  Dinner at hotel restaurant   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Paid by                            │
│  ┌───────────────────────────────┐  │
│  │  Prakhar                   ▼  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Split expense?                     │
│  [Yes, split equally]  [No]         │
│                                     │
│  ┌───────────────────────────────┐  │
│  │        Save Expense           │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 15. Expense Summary

```
┌─────────────────────────────────────┐
│  ← Expenses              Summary    │
├─────────────────────────────────────┤
│                                     │
│  Thailand 2026                      │
│  10th Anniversary Edition           │
│                                     │
│  Total Spent                        │
│  ┌───────────────────────────────┐  │
│  │                               │  │
│  │        ₹45,000                │  │
│  │     8 days • 4 travelers      │  │
│  │                               │  │
│  │  ┌─────────────────────────┐  │  │
│  │  │ [PIE CHART]             │  │  │
│  │  │  Food 35%               │  │  │
│  │  │  Transport 25%          │  │  │
│  │  │  Activities 20%         │  │  │
│  │  │  Shopping 15%           │  │  │
│  │  │  Other 5%               │  │  │
│  │  └─────────────────────────┘  │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  By Category                        │
│  ┌───────────────────────────────┐  │
│  │ 🍽️ Food            ₹15,750   │  │
│  │    ₹494 / person / day        │  │
│  ├───────────────────────────────┤  │
│  │ 🚗 Transport        ₹11,250   │  │
│  │    Taxis, Grab, internal flts │  │
│  ├───────────────────────────────┤  │
│  │ 🎫 Activities        ₹9,000   │  │
│  │    Elephant, Phang Nga, Safari│  │
│  └───────────────────────────────┘  │
│                                     │
│  Useful Stats                       │
│  ┌───────────────────────────────┐  │
│  │ Daily average: ₹5,625/day     │  │
│  │ Per person:    ₹11,250 total  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Split Summary                      │
│  ┌───────────────────────────────┐  │
│  │ Prakhar paid: ₹25,000         │  │
│  │ Kriti paid: ₹20,000           │  │
│  │ ─────────────                 │  │
│  │ Kriti owes Prakhar: ₹2,500    │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │   📊 Compare to Budget        │  │
│  │      (tap to expand)          │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

**Key changes:**
- Total spent is the hero number (not budget comparison)
- Categories show useful context (what you spent on)
- Per-person and per-day stats are helpful
- Budget comparison is collapsed/optional — for users who want it

---

## 16. Documents

```
┌─────────────────────────────────────┐
│  ← Trip                 Documents   │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │      📁 Tap to upload         │  │
│  │   or drag files here          │  │
│  └───────────────────────────────┘  │
│                                     │
│  All Documents (8)                  │
│                                     │
│  ✈️ Flight Documents                │
│  ┌───────────────────────────────┐  │
│  │ 📄 Boarding_HYD_HKT.pdf       │  │
│  │    IX 938 • Feb 28            │  │
│  │              [View] [Delete]  │  │
│  ├───────────────────────────────┤  │
│  │ 📄 Booking_Confirmation.pdf   │  │
│  │    Nok Air • Mar 4            │  │
│  │              [View] [Delete]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  🏨 Hotel Documents                 │
│  ┌───────────────────────────────┐  │
│  │ 📄 Centara_Voucher.pdf        │  │
│  │    4 nights • Phuket          │  │
│  │              [View] [Delete]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  📋 Other                           │
│  ┌───────────────────────────────┐  │
│  │ 📄 Travel_Insurance.pdf       │  │
│  │    Policy document            │  │
│  │              [View] [Delete]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  ✓ All documents saved offline      │
│                                     │
├─────────────────────────────────────┤
│ [📋]  [✈️]  [📅]  [💰]  [📄]       │
└─────────────────────────────────────┘
```

---

## 17. AI Chat

```
┌─────────────────────────────────────┐
│  ← Trip                AI Assistant │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🤖 Hi! I know everything about│  │
│  │    your Thailand trip. Ask me │  │
│  │    anything!                  │  │
│  └───────────────────────────────┘  │
│                                     │
│        ┌─────────────────────────┐  │
│        │ What time is our flight │  │
│        │ tomorrow?               │  │
│        └─────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🤖 Your flight tomorrow:      │  │
│  │                               │  │
│  │ ✈️ Nok Air DD 7815            │  │
│  │    HKT → DMK                  │  │
│  │    11:30 departure            │  │
│  │                               │  │
│  │ You should leave the hotel    │  │
│  │ by 08:30 to be safe.          │  │
│  │                               │  │
│  │ [View Booking]                │  │
│  └───────────────────────────────┘  │
│                                     │
│        ┌─────────────────────────┐  │
│        │ Find veg restaurant     │  │
│        │ near hotel for tonight  │  │
│        └─────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🤖 Here are 3 veg-friendly    │  │
│  │    spots near Chatrium:       │  │
│  │                               │  │
│  │ 1. Govinda's - Pure veg       │  │
│  │    10 min walk • $$           │  │
│  │    [Add to Itinerary]         │  │
│  │                               │  │
│  │ 2. Ethos - Vegan Thai         │  │
│  │    15 min by Grab • $$        │  │
│  │    [Add to Itinerary]         │  │
│  └───────────────────────────────┘  │
│                                     │
├─────────────────────────────────────┤
│ ┌───────────────────────────────┐   │
│ │ Type a message...         [→] │   │
│ └───────────────────────────────┘   │
└─────────────────────────────────────┘
```

---

## 18. Share Settings

```
┌─────────────────────────────────────┐
│  ← Trip                     Share   │
├─────────────────────────────────────┤
│                                     │
│  Co-Planners                        │
│  Can see & edit everything          │
│  ┌───────────────────────────────┐  │
│  │ 👤 Prakhar (you)      Owner   │  │
│  ├───────────────────────────────┤  │
│  │ 👤 Kriti          Co-Planner  │  │
│  │    kriti@email.com     [✕]    │  │
│  ├───────────────────────────────┤  │
│  │ + Invite co-planner           │  │
│  └───────────────────────────────┘  │
│                                     │
│  Viewer Link                        │
│  Read-only, no sensitive info       │
│  ┌───────────────────────────────┐  │
│  │ govault.app/s/abc123        │  │
│  │                               │  │
│  │ [📋 Copy] [📱 WhatsApp]       │  │
│  └───────────────────────────────┘  │
│                                     │
│  Viewer Settings                    │
│  ┌───────────────────────────────┐  │
│  │ ☑ Hide costs & budget         │  │
│  │ ☑ Hide booking references     │  │
│  │ ☑ Hide documents              │  │
│  │ ☐ Show my ratings             │  │
│  │ ☐ Show photos                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🔄 Regenerate Link            │  │
│  │    (invalidates old link)     │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 19. Viewer (Public Link)

```
┌─────────────────────────────────────┐
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🇹🇭  Thailand 2026            │  │
│  │     Shared by Prakhar         │  │
│  │                               │  │
│  │     Feb 28 - Mar 7            │  │
│  │     8 days • Phuket, Bangkok  │  │
│  └───────────────────────────────┘  │
│                                     │
│  👨‍👩‍👧‍👦 Travelers                     │
│  Prakhar, Kriti, Neena, Kiaraa      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  Day 1 • Sat, Feb 28                │
│  Arrival Day                        │
│  ┌───────────────────────────────┐  │
│  │ 06:10  ✈️ Flight to Phuket    │  │
│  │        Air India Express      │  │
│  │        [Details hidden]       │  │
│  ├───────────────────────────────┤  │
│  │ 14:00  🏨 Check-in            │  │
│  │        Centara Grand          │  │
│  │        Karon Beach, Phuket    │  │
│  ├───────────────────────────────┤  │
│  │ 17:30  🌅 Karon Beach         │  │
│  │        Sunset time            │  │
│  ├───────────────────────────────┤  │
│  │ 19:00  🍽️ Tandoori Flames    │  │
│  │        Indian • Near hotel    │  │
│  └───────────────────────────────┘  │
│                                     │
│  Day 2 • Sun, Mar 1                 │
│  ...                                │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🌴 Plan your own trip on     │  │
│  │     GoVault                 │  │
│  │                               │  │
│  │     [Get Started Free]        │  │
│  └───────────────────────────────┘  │
│                                     │
│       Powered by GoVault          │
│                                     │
└─────────────────────────────────────┘
```

---

## 20. Ratings

```
┌─────────────────────────────────────┐
│  ← Trip                   Ratings   │
├─────────────────────────────────────┤
│                                     │
│  Your Reviews (6)                   │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🍽️ Tu Kab Khao               │  │
│  │    Phuket Old Town • Thai     │  │
│  │                               │  │
│  │    ⭐⭐⭐⭐⭐                   │  │
│  │    #veg-options #worth-wait   │  │
│  │                               │  │
│  │    "Amazing Massaman curry!"  │  │
│  │                               │  │
│  │    Mar 1 • Day 2              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🐘 Elephant Sanctuary         │  │
│  │    Phuket • Activity          │  │
│  │                               │  │
│  │    ⭐⭐⭐⭐⭐                   │  │
│  │    #kid-friendly #ethical     │  │
│  │                               │  │
│  │    "Kiaraa loved it!"         │  │
│  │                               │  │
│  │    Mar 1 • Day 2              │  │
│  └───────────────────────────────┘  │
│                                     │
│  ┌───────────────────────────────┐  │
│  │ 🌴 Three Monkeys              │  │
│  │    Chalong • Restaurant       │  │
│  │                               │  │
│  │    ⭐⭐⭐⭐                     │  │
│  │    #instagrammable            │  │
│  │                               │  │
│  │    "Great views, food okay"   │  │
│  └───────────────────────────────┘  │
│                                     │
│        [+ Rate a Place]             │
│                                     │
└─────────────────────────────────────┘
```

---

## 21. Add Rating

```
┌─────────────────────────────────────┐
│  ← Cancel               Rate Place  │
├─────────────────────────────────────┤
│                                     │
│  Place                              │
│  ┌───────────────────────────────┐  │
│  │  🔍 Search or select from     │  │
│  │     itinerary                 │  │
│  └───────────────────────────────┘  │
│                                     │
│  Selected: Tu Kab Khao              │
│  Phuket Old Town • Restaurant       │
│                                     │
│  Your Rating *                      │
│                                     │
│     ☆    ☆    ☆    ☆    ☆          │
│     1    2    3    4    5           │
│                                     │
│  Quick Tags                         │
│  ┌─────────┐ ┌─────────┐           │
│  │☐ Kid    │ │☐ Veg    │           │
│  │ Friendly│ │ Options │           │
│  └─────────┘ └─────────┘           │
│  ┌─────────┐ ┌─────────┐           │
│  │☐ Worth  │ │☐ Over-  │           │
│  │ the Wait│ │ priced  │           │
│  └─────────┘ └─────────┘           │
│                                     │
│  Your Review (optional)             │
│  ┌───────────────────────────────┐  │
│  │  Amazing Massaman curry!      │  │
│  │  Ask for less spicy for kids. │  │
│  │                               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Add Photos                         │
│  ┌───────────────────────────────┐  │
│  │  📷 [+] [+] [+]               │  │
│  └───────────────────────────────┘  │
│                                     │
│  Visibility                         │
│  (●) Shared with trip               │
│  ( ) Private (only me)              │
│                                     │
│  ┌───────────────────────────────┐  │
│  │         Save Rating           │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## 22. Emergency Hub

```
┌─────────────────────────────────────┐
│  ← Trip                  Emergency  │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐  │
│  │  🆘  SEND SOS                 │  │
│  │                               │  │
│  │  Tap to share your location   │  │
│  │  and trip details instantly   │  │
│  └───────────────────────────────┘  │
│                                     │
│  Thailand Emergency Numbers         │
│  ┌───────────────────────────────┐  │
│  │ 🚨 Tourist Police    [1155]   │  │
│  │ 🚑 Ambulance         [1669]   │  │
│  │ 👮 Police            [191]    │  │
│  │ 🔥 Fire              [199]    │  │
│  └───────────────────────────────┘  │
│                                     │
│  Hospitals Nearby                   │
│  ┌───────────────────────────────┐  │
│  │ 🏥 Bangkok Hospital Phuket    │  │
│  │    15 min from hotel          │  │
│  │    [📞 Call] [📍 Directions]  │  │
│  └───────────────────────────────┘  │
│                                     │
│  Your Hotels                        │
│  ┌───────────────────────────────┐  │
│  │ 🏨 Centara Grand Phuket       │  │
│  │    [📞 076 201 234]           │  │
│  ├───────────────────────────────┤  │
│  │ 🏨 Chatrium Bangkok           │  │
│  │    [📞 02 307 0100]           │  │
│  └───────────────────────────────┘  │
│                                     │
│  Embassy                            │
│  ┌───────────────────────────────┐  │
│  │ 🇮🇳 Indian Embassy Bangkok    │  │
│  │    [📞 02 258 0300]           │  │
│  │    24/7: 081 850 0025         │  │
│  └───────────────────────────────┘  │
│                                     │
│  Personal Emergency Contacts        │
│  ┌───────────────────────────────┐  │
│  │ + Add emergency contact       │  │
│  └───────────────────────────────┘  │
│                                     │
└─────────────────────────────────────┘
```

---

## Navigation Pattern

### Bottom Tab Bar (Mobile)
```
┌───────────────────────────────────────────┐
│  [📋]    [✈️]    [📅]    [💰]    [📄]    │
│  Home   Bookings  Itin   Expenses  Docs   │
└───────────────────────────────────────────┘
```

### Floating Action Button
- Present on Home, Bookings, Expenses screens
- Expands to: Add Booking, Log Expense, Ask AI

### Top App Bar
- Left: Back arrow or hamburger
- Center: Screen title
- Right: Context actions (Edit, Share, More)

---

## Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| < 640px (Mobile) | Single column, bottom tabs |
| 640-1024px (Tablet) | Two column where appropriate |
| > 1024px (Desktop) | Sidebar navigation, 3-column |

---

## Color System

```
Primary:    Teal (#1A5F5F)     - Main actions, headers
Secondary:  Gold (#D4A853)     - Accents, highlights
Background: Cream (#FDF8F0)    - Main background
Surface:    White (#FFFFFF)    - Cards, modals
Text:       Navy (#1C2B3A)     - Primary text
Muted:      Gray (#6B7280)     - Secondary text
Success:    Green (#059669)    - Confirmations
Warning:    Coral (#E07B5C)    - Alerts
Error:      Red (#DC2626)      - Errors, SOS
```

---

## Component Library (shadcn/ui)

| Component | Usage |
|-----------|-------|
| Button | Primary/secondary actions |
| Card | Booking cards, expense items |
| Dialog | Modals, confirmations |
| Sheet | Bottom sheets on mobile |
| Tabs | View switchers |
| Input | Form fields |
| Select | Dropdowns |
| Calendar | Date pickers |
| Avatar | User/traveler icons |
| Badge | Status indicators |
| Progress | Budget bars |
| Skeleton | Loading states |

---

## Offline Indicators

```
┌───────────────────────────────────────────┐
│  ⚡ You're offline                        │
│  Changes will sync when connected         │
└───────────────────────────────────────────┘

┌───────────────────────────────────────────┐
│  ✓ Back online • Syncing 3 changes...    │
└───────────────────────────────────────────┘
```
