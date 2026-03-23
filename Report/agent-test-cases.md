# AI Trip Agent - Test Cases & Use Cases

## Data Relationship Summary

```
┌─────────────────────────────────────────────────────────────────────┐
│                           HERO SECTION                               │
│  Readiness Score = flights(30%) + hotels(25%) + todos(20%)          │
│                   + packing(15%) + docs(5%) + contacts(5%)           │
│  Pending Actions = pending bookings + incomplete todos + low packing │
└─────────────────────────────────────────────────────────────────────┘
         ▲                    ▲                    ▲
         │                    │                    │
    ┌────┴────┐         ┌────┴────┐         ┌────┴────┐
    │ FLIGHTS │         │ HOTELS  │         │  TODOS  │
    │ SECTION │         │ SECTION │         │ SECTION │
    └────┬────┘         └────┬────┘         └────┬────┘
         │                    │                    │
         ▼                    ▼                    │
    ┌─────────────────────────────────┐           │
    │         DOCUMENTS SECTION        │◄──────────┘
    │  (booking_id links to bookings)  │
    └─────────────────────────────────┘
                    │
                    ▼
    ┌─────────────────────────────────┐
    │       ITINERARY SECTION          │
    │  Days → Activities → booking_id? │
    └─────────────────────────────────┘
```

---

## Test Case 1: Parse Flight Boarding Pass

### Input
Upload a boarding pass image/PDF with:
- Airline: Thai Airways
- Flight: TG315
- Route: DEL → BKK
- Date: Feb 15, 2026, 10:30 AM
- Confirmation: ABC123

### Expected Agent Response
```json
{
  "tool": "parse_flight",
  "data": {
    "airline": "Thai Airways",
    "flight_number": "TG315",
    "departure_airport": "DEL",
    "arrival_airport": "BKK",
    "departure_time": "2026-02-15T10:30:00",
    "confirmation_number": "ABC123"
  }
}
```

### Cascading Impacts After Apply

| Section | Impact |
|---------|--------|
| **Hero Stats** | Flights: 0/0 → 1/1 confirmed |
| **Readiness %** | +30% (flight weight) |
| **Pending Actions** | No change (flight is CONFIRMED) |
| **Flight Section** | New FlightCard appears with outbound variant |
| **Documents Section** | No change (document not auto-linked) |
| **Itinerary Section** | No change (no activity created) |

### Manual Follow-ups Needed
- [ ] Upload boarding pass document and link to this booking
- [ ] Create "Arrival Day" itinerary day for Feb 15
- [ ] Add "Arrive at Bangkok" activity with booking_id link

---

## Test Case 2: Parse Hotel Confirmation

### Input
Upload hotel confirmation email with:
- Hotel: Andaman Beach Resort
- Location: Karon Beach, Phuket
- Check-in: Feb 15, 2026
- Check-out: Feb 19, 2026
- Room: Deluxe Ocean View
- Confirmation: HTL456

### Expected Agent Response
```json
{
  "tool": "parse_hotel",
  "data": {
    "hotel_name": "Andaman Beach Resort",
    "address": "Karon Beach, Phuket",
    "check_in": "2026-02-15",
    "check_out": "2026-02-19",
    "room_type": "Deluxe Ocean View",
    "confirmation_number": "HTL456"
  }
}
```

### Cascading Impacts After Apply

| Section | Impact |
|---------|--------|
| **Hero Stats** | Hotels: 0/0 → 1/1 confirmed |
| **Readiness %** | +25% (hotel weight) |
| **Pending Actions** | No change (hotel is CONFIRMED) |
| **Hotel Section** | New HotelCard appears with "phuket" variant |
| **Itinerary Section** | No change (no days created) |

### Suggested Auto-actions (Future Enhancement)
- Auto-create itinerary days for Feb 15-19
- Auto-add "Check-in at Andaman Beach Resort" activity on Day 1
- Auto-add "Check-out" activity on Day 4

---

## Test Case 3: Parse Full Itinerary Text

### Input
```
Day 1 - Arrival in Bangkok
Arrive at Suvarnabhumi Airport around 11am. Take taxi to hotel.
Check into Marriott Sukhumvit. Rest and freshen up.
Evening: Street food tour at Chinatown (6pm-9pm)

Day 2 - Temples & Culture
Morning: Visit Grand Palace (9am-12pm)
Lunch at local restaurant
Afternoon: Wat Pho temple and Thai massage
Evening: Dinner cruise on Chao Phraya River

Day 3 - Travel to Phuket
Morning flight to Phuket (10am)
Afternoon: Check into beach resort
Evening: Sunset at Karon Beach
```

### Expected Agent Response
```json
{
  "tool": "parse_itinerary_text",
  "data": {
    "days": [
      {
        "day_number": 1,
        "title": "Arrival in Bangkok",
        "location": "Bangkok",
        "activities": [
          { "time": "11:00", "title": "Arrive at Suvarnabhumi Airport" },
          { "time": "12:00", "title": "Taxi to hotel" },
          { "time": "14:00", "title": "Check into Marriott Sukhumvit" },
          { "time": "18:00", "title": "Street food tour at Chinatown", "end_time": "21:00" }
        ]
      },
      {
        "day_number": 2,
        "title": "Temples & Culture",
        "location": "Bangkok",
        "activities": [
          { "time": "09:00", "title": "Visit Grand Palace", "end_time": "12:00" },
          { "time": "12:30", "title": "Lunch at local restaurant" },
          { "time": "14:00", "title": "Wat Pho temple and Thai massage" },
          { "time": "18:00", "title": "Dinner cruise on Chao Phraya River" }
        ]
      },
      {
        "day_number": 3,
        "title": "Travel to Phuket",
        "location": "Phuket",
        "activities": [
          { "time": "10:00", "title": "Morning flight to Phuket" },
          { "time": "14:00", "title": "Check into beach resort" },
          { "time": "17:30", "title": "Sunset at Karon Beach" }
        ]
      }
    ]
  }
}
```

### Cascading Impacts After Apply

| Section | Impact |
|---------|--------|
| **Hero Stats** | No direct impact (days don't affect readiness) |
| **Itinerary Section** | 3 new ExpandableDayCards created |
| **Day Themes** | Day 1-2: Gold (Bangkok), Day 3: Coral (Phuket) |

### Missing Linkages (Manual)
- Flight on Day 3 not linked to any booking
- Hotel check-ins not linked to bookings
- No todos generated for bookings

---

## Test Case 4: Natural Language Edit - Add Activity

### Input
```
"Add a visit to Wat Arun temple on Day 2 at 3pm after the Thai massage"
```

### Expected Agent Response
```json
{
  "tool": "add_activity",
  "data": {
    "day_number": 2,
    "time": "15:00",
    "title": "Visit Wat Arun temple",
    "description": "Temple of Dawn - beautiful riverside temple",
    "location": "Wat Arun, Bangkok"
  }
}
```

### Cascading Impacts After Apply

| Section | Impact |
|---------|--------|
| **Itinerary Section** | Day 2 card shows new activity at 3pm |
| **Activity Order** | Inserted between "Thai massage" and "Dinner cruise" |

---

## Test Case 5: Natural Language Edit - Move Activity

### Input
```
"Move the dinner cruise from Day 2 to Day 3 evening"
```

### Context Required
- Agent needs existing activity IDs
- Must match "dinner cruise" to activity_id

### Expected Agent Response
```json
{
  "tool": "move_activity",
  "data": {
    "activity_id": "uuid-of-dinner-cruise",
    "to_day_number": 3,
    "new_order": 4
  }
}
```

### Cascading Impacts After Apply

| Section | Impact |
|---------|--------|
| **Day 2** | Dinner cruise removed, reorder remaining activities |
| **Day 3** | Dinner cruise added at end |

---

## Test Case 6: Natural Language Edit - Delete Activity

### Input
```
"Remove the taxi to hotel activity from Day 1"
```

### Expected Agent Response
```json
{
  "tool": "delete_activity",
  "data": {
    "activity_id": "uuid-of-taxi-activity"
  }
}
```

---

## Test Case 7: Complex Multi-Change Scenario

### Input
```
"I just booked my Bangkok to Phuket flight. It's Thai Smile WE265 departing BKK at 10:15am arriving HKT at 11:45am on Feb 18. Also update Day 3 to say 'Travel Day' and add the flight as the first activity."
```

### Expected Agent Response (Multiple Tool Calls)
```json
[
  {
    "tool": "parse_flight",
    "data": {
      "airline": "Thai Smile",
      "flight_number": "WE265",
      "departure_airport": "BKK",
      "arrival_airport": "HKT",
      "departure_time": "2026-02-18T10:15:00",
      "arrival_time": "2026-02-18T11:45:00"
    }
  },
  {
    "tool": "update_day",
    "data": {
      "day_id": "uuid-of-day-3",
      "title": "Travel Day"
    }
  },
  {
    "tool": "add_activity",
    "data": {
      "day_number": 3,
      "time": "10:15",
      "title": "Flight BKK → HKT (Thai Smile WE265)",
      "description": "Arrive Phuket 11:45am"
    }
  }
]
```

### Cascading Impacts

| Section | Impact |
|---------|--------|
| **Hero Stats** | Flights: +1, Readiness +30% |
| **Flight Section** | New internal flight card |
| **Day 3 Card** | Title changed, new activity at top |

---

## Test Case 8: Booking Status Impact on Hero

### Scenario
Trip has:
- 2 flights (1 CONFIRMED, 1 PENDING)
- 2 hotels (both CONFIRMED)
- 5 todos (2 completed)
- 10 packing items (3 checked)
- 0 documents
- 2 emergency contacts

### Initial Readiness Calculation
```
Flights:    0.5  × 30% = 15%
Hotels:     1.0  × 25% = 25%
Todos:      0.4  × 20% = 8%
Packing:    0.3  × 15% = 4.5%
Documents:  0    × 5%  = 0%
Contacts:   1.0  × 5%  = 5%
─────────────────────────
Total:              57.5%
```

### After Confirming Pending Flight
```
Flights:    1.0  × 30% = 30%  (+15%)
─────────────────────────
New Total:          72.5%
```

### Pending Actions Before
- "Book Thai Airways TG316 (BKK → DEL)"
- "Complete visa application" (todo)
- "Book airport transfer" (todo)
- "+1 more todo items"
- "Complete packing checklist (30% done)"
- "Upload travel documents"

### Pending Actions After Confirming Flight
- ~~"Book Thai Airways TG316 (BKK → DEL)"~~ (removed)
- "Complete visa application" (todo)
- "Book airport transfer" (todo)
- "+1 more todo items"
- "Complete packing checklist (30% done)"
- "Upload travel documents"

---

## Future Enhancement Test Cases

### Test Case 9: Auto-Generate Todos from Bookings

When a PENDING flight is added, automatically create todos:
- [ ] "Confirm Thai Airways TG315 booking" (category: bookings)
- [ ] "Check in online 24h before departure" (category: before_trip)
- [ ] "Print/save boarding pass" (category: documents)

### Test Case 10: Link Document to Booking

When uploading a boarding pass:
1. Parse flight details
2. Match to existing booking (or create new)
3. Auto-set `document.booking_id` to matched booking
4. Document appears in Flight Card's attached docs

### Test Case 11: Smart Activity-Booking Linking

When parsing "Check into Marriott Sukhumvit" activity:
1. Search bookings for hotel matching "Marriott Sukhumvit"
2. If found, set `activity.booking_id`
3. Activity card shows booking status badge

### Test Case 12: Cascade Delete Warning

When deleting a day that has linked bookings:
```
⚠️ Warning: Day 3 contains activities linked to bookings:
- "Flight to Phuket" → linked to Thai Smile WE265

Delete day anyway? The bookings will remain but lose activity links.
[ Cancel ] [ Delete Day Only ] [ Delete Day & Bookings ]
```

---

## Edge Cases to Handle

### 1. Duplicate Flight Detection
If user uploads same boarding pass twice:
- Check for existing booking with same flight_number + departure_time
- Show: "This flight already exists. Update existing or create duplicate?"

### 2. Date Mismatch
If parsed flight date doesn't match trip dates:
- Show warning: "Flight date (Feb 20) is outside trip dates (Feb 15-19)"
- Allow user to proceed or cancel

### 3. Ambiguous Activity Reference
User says: "Delete the temple visit"
But Day 2 has both "Grand Palace" and "Wat Pho temple"
- Agent should ask: "Which temple visit? Grand Palace (9am) or Wat Pho (2pm)?"

### 4. Day Number vs Date
User says: "Add lunch on February 17th"
- Agent should calculate: Feb 17 = Day 3 (if trip starts Feb 15)
- Use day_number for consistency

### 5. Missing Context
User says: "Change the time to 2pm"
- Agent needs to ask: "Which activity would you like to reschedule to 2pm?"

---

## Testing Checklist

### Document Parsing
- [ ] Parse boarding pass (image)
- [ ] Parse boarding pass (PDF)
- [ ] Parse hotel confirmation email
- [ ] Parse multi-segment flight itinerary
- [ ] Handle poor image quality / unclear text

### Itinerary Parsing
- [ ] Parse simple day-by-day text
- [ ] Parse with specific times
- [ ] Parse without times (infer reasonable times)
- [ ] Parse multi-city itinerary
- [ ] Handle inconsistent formatting

### Natural Language Editing
- [ ] Add activity with time
- [ ] Add activity without time (infer from context)
- [ ] Update activity details
- [ ] Delete activity by name
- [ ] Move activity between days
- [ ] Update day title/location
- [ ] Handle ambiguous references

### Impact Verification
- [ ] Hero stats update correctly
- [ ] Readiness percentage recalculates
- [ ] Pending actions update
- [ ] Correct sections re-render
- [ ] Page refresh shows persisted changes

### Error Handling
- [ ] Invalid document type
- [ ] Unparseable text
- [ ] Missing required fields
- [ ] Database save failures
- [ ] API timeout handling
