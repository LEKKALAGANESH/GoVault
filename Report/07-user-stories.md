# User Stories

## Story Format
```
As a [persona],
I want to [action],
So that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
```

**Priority**: P0 (MVP), P1 (Fast-follow), P2 (Future)

---

# Epic 1: Trip Management

## US-1.1: Create New Trip
**Priority**: P0

As a traveler,
I want to create a new trip with basic details,
So that I have a container to organize all my travel information.

**Acceptance Criteria**:
- [ ] Can enter trip name (required)
- [ ] Can select destination(s) - autocomplete with city/country
- [ ] Can set start and end dates (date picker)
- [ ] Trip duration auto-calculated and displayed
- [ ] Can optionally add cover image
- [ ] Trip created and navigates to trip dashboard
- [ ] Validation: end date must be after start date

---

## US-1.2: Add Travelers to Trip
**Priority**: P0

As a trip organizer,
I want to add traveler profiles to my trip,
So that the AI can provide personalized recommendations.

**Acceptance Criteria**:
- [ ] Can add multiple travelers
- [ ] For each traveler: name, age (optional), relationship
- [ ] Can add special needs: dietary (veg, vegan, allergies), mobility
- [ ] Can mark travelers as children/seniors for AI context
- [ ] Can edit/remove travelers
- [ ] Default: creator is first traveler

---

## US-1.3: View Trip Dashboard
**Priority**: P0

As a traveler,
I want to see an overview of my trip,
So that I can quickly access key information and next actions.

**Acceptance Criteria**:
- [ ] Shows trip header: name, dates, destination, cover image
- [ ] Shows countdown (if pre-trip) or current day (if active)
- [ ] Shows traveler avatars/names
- [ ] Shows quick stats: total bookings, documents uploaded, expenses logged
- [ ] Shows budget vs spent (if budget set)
- [ ] Shows today's schedule (if during trip)
- [ ] Quick action buttons: Add booking, Log expense, View documents

---

## US-1.4: View All Trips
**Priority**: P0

As a user,
I want to see all my trips in one place,
So that I can navigate between trips and see my travel history.

**Acceptance Criteria**:
- [ ] Shows list/grid of all trips
- [ ] Each trip shows: name, dates, destination, cover image, status
- [ ] Trips grouped/filtered by: Upcoming, Active, Past
- [ ] Can sort by date, name
- [ ] Can search trips
- [ ] Shows empty state with "Create your first trip" CTA

---

## US-1.5: Edit Trip Details
**Priority**: P0

As a trip owner,
I want to edit trip details after creation,
So that I can update dates or destinations if plans change.

**Acceptance Criteria**:
- [ ] Can edit all fields from creation
- [ ] Changes reflect immediately across trip
- [ ] If dates change, prompt to adjust itinerary
- [ ] Edit history tracked (optional)

---

## US-1.6: Delete/Archive Trip
**Priority**: P1

As a user,
I want to delete or archive old trips,
So that my trip list stays organized.

**Acceptance Criteria**:
- [ ] Can archive trip (hides from main list, recoverable)
- [ ] Can permanently delete trip (requires confirmation)
- [ ] Deletion removes all associated data
- [ ] Can view archived trips separately

---

# Epic 2: Booking Management

## US-2.1: Add Flight Booking Manually
**Priority**: P0

As a traveler,
I want to manually add a flight booking,
So that all my flight details are in one place.

**Acceptance Criteria**:
- [ ] Can enter: airline, flight number, departure/arrival airports
- [ ] Can enter: departure/arrival date and time
- [ ] Can enter: PNR/confirmation number
- [ ] Can enter: seat assignments per traveler
- [ ] Can enter: ticket numbers (optional)
- [ ] Can mark status: Confirmed, Pending, Cancelled
- [ ] Flight card displays route visually (DEP → ARR)
- [ ] Can edit/delete booking

---

## US-2.2: Add Hotel Booking Manually
**Priority**: P0

As a traveler,
I want to manually add a hotel booking,
So that all my accommodation details are organized.

**Acceptance Criteria**:
- [ ] Can enter: hotel name, address
- [ ] Can enter: check-in date/time, check-out date/time
- [ ] Nights auto-calculated
- [ ] Can enter: room type, confirmation number
- [ ] Can enter: contact phone number
- [ ] Can add notes (parking, wifi password, etc.)
- [ ] Shows map embed of location
- [ ] Can edit/delete booking

---

## US-2.3: Add Transport Booking
**Priority**: P1

As a traveler,
I want to add ground transport bookings (train, car rental, transfer),
So that all transport is tracked.

**Acceptance Criteria**:
- [ ] Can select type: Train, Bus, Car Rental, Airport Transfer, Ferry
- [ ] Fields adjust based on type
- [ ] Can enter: provider, booking ref, pickup/dropoff locations and times
- [ ] For car rental: vehicle type, return location
- [ ] Can edit/delete booking

---

## US-2.4: Add Activity Booking
**Priority**: P1

As a traveler,
I want to add activity/tour bookings,
So that all reservations are tracked.

**Acceptance Criteria**:
- [ ] Can enter: activity name, provider
- [ ] Can enter: date, time, duration
- [ ] Can enter: location/meeting point
- [ ] Can enter: booking reference, ticket count
- [ ] Can add notes
- [ ] Can edit/delete booking

---

## US-2.5: Upload Document to Booking
**Priority**: P0

As a traveler,
I want to attach documents to a booking,
So that I can access tickets and confirmations easily.

**Acceptance Criteria**:
- [ ] Can upload PDF, JPG, PNG (max 10MB)
- [ ] Can take photo directly
- [ ] Document linked to specific booking
- [ ] Can view document in-app
- [ ] Can download/share document
- [ ] Can delete document
- [ ] Documents available offline

---

## US-2.6: View All Bookings
**Priority**: P0

As a traveler,
I want to see all bookings for my trip,
So that I have a complete overview.

**Acceptance Criteria**:
- [ ] Shows all bookings grouped by type
- [ ] Shows timeline view (chronological)
- [ ] Each booking shows key details at a glance
- [ ] Can tap to expand/view full details
- [ ] Visual indicators for status (confirmed, pending)

---

# Epic 3: Itinerary Builder

## US-3.1: View Day-by-Day Itinerary
**Priority**: P0

As a traveler,
I want to see my trip as a day-by-day schedule,
So that I know what's planned for each day.

**Acceptance Criteria**:
- [ ] Shows list of days from start to end date
- [ ] Each day shows: date, day number, location
- [ ] Each day expandable to show activities
- [ ] Activities shown as timeline with times
- [ ] Bookings (flights, hotels) auto-appear on relevant days
- [ ] Current day highlighted (if active trip)

---

## US-3.2: Add Activity to Day
**Priority**: P0

As a traveler,
I want to add activities to specific days,
So that I can build my itinerary.

**Acceptance Criteria**:
- [ ] Can add activity to any day
- [ ] Activity fields: time (start/end), title, description
- [ ] Can add location (address, map link)
- [ ] Can add notes
- [ ] Can select type: Activity, Meal, Transport, Free time
- [ ] Can link to existing booking (optional)
- [ ] Can mark as confirmed/tentative

---

## US-3.3: Edit/Delete Activity
**Priority**: P0

As a traveler,
I want to edit or remove activities,
So that I can adjust my plans.

**Acceptance Criteria**:
- [ ] Can edit all activity fields
- [ ] Can change time
- [ ] Can move to different day
- [ ] Can delete activity (with confirmation)
- [ ] Can duplicate activity

---

## US-3.4: Reorder Activities
**Priority**: P1

As a traveler,
I want to reorder activities within a day,
So that I can optimize my schedule.

**Acceptance Criteria**:
- [ ] Can drag-and-drop to reorder
- [ ] Can move activity to different day via drag or menu
- [ ] Times auto-adjust option (or manual)

---

## US-3.5: View Full Trip Timeline
**Priority**: P1

As a traveler,
I want to see my entire trip on one scrollable timeline,
So that I can see the big picture.

**Acceptance Criteria**:
- [ ] Shows all days in vertical scroll
- [ ] Days collapsible/expandable
- [ ] Shows bookings integrated with activities
- [ ] Jump-to-day navigation

---

# Epic 4: Expense Tracking

## US-4.1: Log Expense Manually
**Priority**: P0

As a traveler,
I want to quickly log an expense,
So that I can track my spending.

**Acceptance Criteria**:
- [ ] Can enter amount (required)
- [ ] Can select currency (defaults to destination currency)
- [ ] Can select category (Food, Transport, Activity, Shopping, etc.)
- [ ] Can enter description/merchant (optional)
- [ ] Can select date (defaults to today)
- [ ] Can select payment method
- [ ] Expense saved and total updated

---

## US-4.2: Set Trip Budget
**Priority**: P0

As a traveler,
I want to set a budget for my trip,
So that I can track spending against it.

**Acceptance Criteria**:
- [ ] Can set total trip budget
- [ ] Can optionally set budget by category
- [ ] Budget displayed on dashboard
- [ ] Spent vs budget shown as progress bar
- [ ] Shows remaining amount

---

## US-4.3: View All Expenses
**Priority**: P0

As a traveler,
I want to see all my trip expenses,
So that I know where my money went.

**Acceptance Criteria**:
- [ ] Shows list of all expenses
- [ ] Can filter by: category, date, payer
- [ ] Can sort by: date, amount
- [ ] Shows running total
- [ ] Shows total in home currency
- [ ] Can edit/delete expenses

---

## US-4.4: Multi-Currency Support
**Priority**: P0

As a traveler,
I want to log expenses in different currencies,
So that I can track spending across countries.

**Acceptance Criteria**:
- [ ] Can select any currency for expense
- [ ] Auto-converts to home currency
- [ ] Shows both original and converted amounts
- [ ] Exchange rates cached for offline use

---

## US-4.5: Split Expense Among Travelers
**Priority**: P1

As a group traveler,
I want to mark expenses as split,
So that I know who owes what.

**Acceptance Criteria**:
- [ ] Can mark expense as split
- [ ] Can select which travelers to split among
- [ ] Can choose equal split or custom amounts
- [ ] Can mark who paid
- [ ] Shows per-person share
- [ ] Settlement summary (who owes whom)

---

## US-4.6: View Expense Summary
**Priority**: P1

As a traveler,
I want to see expense breakdown by category,
So that I understand my spending patterns.

**Acceptance Criteria**:
- [ ] Shows pie/bar chart of expenses by category
- [ ] Shows daily spending trend
- [ ] Shows per-person breakdown (if travelers marked)
- [ ] Shows budget vs actual by category

---

# Epic 5: AI Features

## US-5.1: Parse Booking from Forwarded Email
**Priority**: P0

As a traveler,
I want to forward a booking email and have it parsed automatically,
So that I don't have to enter details manually.

**Acceptance Criteria**:
- [ ] Dedicated email address for forwarding (e.g., trips@govault.app)
- [ ] AI extracts booking details from email
- [ ] Creates draft booking for user review
- [ ] User confirms or edits before saving
- [ ] Handles flights, hotels, activities
- [ ] Works with any airline/hotel provider
- [ ] Works with non-English emails

---

## US-5.2: Parse Booking from Document
**Priority**: P0

As a traveler,
I want to upload a ticket/confirmation image and have it parsed,
So that I can quickly add bookings.

**Acceptance Criteria**:
- [ ] Can upload PDF or image
- [ ] AI extracts booking details via OCR
- [ ] Creates draft booking for review
- [ ] Handles boarding passes, hotel vouchers, e-tickets
- [ ] Shows confidence level for extraction
- [ ] Allows manual correction

---

## US-5.3: AI-Assisted Expense Entry
**Priority**: P0

As a traveler,
I want to take a photo of a receipt and have it parsed,
So that logging expenses is quick.

**Acceptance Criteria**:
- [ ] Can take photo or upload receipt image
- [ ] AI extracts: amount, currency, merchant, category
- [ ] Works with receipts in any language
- [ ] Creates draft expense for review
- [ ] Allows manual correction
- [ ] Handles poor quality images gracefully

---

## US-5.4: Natural Language Expense Entry
**Priority**: P0

As a traveler,
I want to type or speak an expense naturally,
So that I can log expenses without filling forms.

**Acceptance Criteria**:
- [ ] Can type: "200 baht taxi to hotel"
- [ ] AI parses into structured expense
- [ ] Infers category from context
- [ ] Defaults to trip's current currency
- [ ] Shows parsed result for confirmation

---

## US-5.5: AI Chat Assistant
**Priority**: P1

As a traveler,
I want to ask questions about my trip in natural language,
So that I can get quick answers.

**Acceptance Criteria**:
- [ ] Chat interface accessible from trip
- [ ] Can ask: "What time is our flight?"
- [ ] Can ask: "Where are we staying tonight?"
- [ ] AI responds with relevant trip information
- [ ] Can ask for document locations
- [ ] Maintains conversation context

---

## US-5.6: AI Itinerary Generation
**Priority**: P1

As a traveler,
I want to describe my trip and have AI generate an itinerary,
So that I don't have to plan from scratch.

**Acceptance Criteria**:
- [ ] Can describe trip in natural language
- [ ] AI generates day-by-day itinerary
- [ ] Considers traveler profiles (kids, seniors, dietary)
- [ ] Includes activities, meals, logistics
- [ ] User can accept, modify, or regenerate
- [ ] Can request changes ("make day 3 more relaxed")

---

## US-5.7: AI Activity Suggestions
**Priority**: P1

As a traveler,
I want AI to suggest activities based on context,
So that I can discover things to do.

**Acceptance Criteria**:
- [ ] AI suggests based on destination, dates, traveler profiles
- [ ] Can ask: "What should we do tomorrow afternoon?"
- [ ] Suggestions include: name, description, why it fits
- [ ] Can add suggestion to itinerary with one tap
- [ ] Considers what's already planned

---

## US-5.8: AI Local Recommendations
**Priority**: P1

As a traveler,
I want to ask AI for local recommendations,
So that I can find restaurants, attractions, etc.

**Acceptance Criteria**:
- [ ] Can ask: "Find vegetarian restaurant near hotel"
- [ ] AI searches and returns options
- [ ] Results include: name, type, distance, why recommended
- [ ] Can filter by dietary, budget, kid-friendly
- [ ] Can add to itinerary or save for later

---

# Epic 6: Sharing & Privacy

## US-6.1: Invite Co-Planner
**Priority**: P0

As a trip owner,
I want to invite others as co-planners,
So that we can plan together and they can see all details.

**Acceptance Criteria**:
- [ ] Can invite by email or phone number
- [ ] Invitee receives link to join trip
- [ ] Co-planner can see ALL trip info including sensitive data
- [ ] Co-planner can edit itinerary, add expenses, upload docs
- [ ] Can remove co-planner
- [ ] Shows list of current co-planners

---

## US-6.2: Generate Viewer Link
**Priority**: P0

As a trip owner,
I want to share a view-only link,
So that others can follow along without seeing sensitive info.

**Acceptance Criteria**:
- [ ] Can generate shareable link
- [ ] Link provides read-only access
- [ ] Viewers see itinerary, places, public notes
- [ ] Viewers do NOT see: PNR, booking refs, costs, documents
- [ ] Can share via WhatsApp, email, copy link
- [ ] Can revoke/regenerate link

---

## US-6.3: Configure Privacy Settings
**Priority**: P1

As a trip owner,
I want to control what viewers can see,
So that I can customize sharing.

**Acceptance Criteria**:
- [ ] Can toggle: hide costs from viewers
- [ ] Can toggle: hide booking references
- [ ] Can toggle: allow viewers to see photos
- [ ] Can toggle: allow viewers to see ratings
- [ ] Settings apply to all viewer links

---

## US-6.4: View Shared Trip (as Viewer)
**Priority**: P0

As a trip viewer,
I want to see the shared itinerary clearly,
So that I can follow along with the trip.

**Acceptance Criteria**:
- [ ] Opens shared link without requiring account
- [ ] Shows trip name, dates, destination
- [ ] Shows day-by-day itinerary with activities
- [ ] Shows places and notes (if allowed)
- [ ] Shows "[hidden]" placeholders for sensitive data
- [ ] Clean, beautiful read-only experience
- [ ] CTA to create own trip on GoVault

---

# Epic 7: Ratings & Reviews

## US-7.1: Rate a Place
**Priority**: P1

As a traveler,
I want to rate a place I visited,
So that I can remember my experience.

**Acceptance Criteria**:
- [ ] Can rate from itinerary activity or via "Add Rating"
- [ ] 5-star rating (required)
- [ ] Quick tags: kid-friendly, veg-options, overpriced, worth-wait, etc.
- [ ] Optional text review
- [ ] Optional photos
- [ ] Set visibility: private, shared, public
- [ ] Can edit rating later

---

## US-7.2: View My Ratings
**Priority**: P1

As a traveler,
I want to see all my ratings for a trip,
So that I can remember what I liked.

**Acceptance Criteria**:
- [ ] Shows list of all rated places
- [ ] Can filter by rating (show only 4-5 stars)
- [ ] Can filter by type (restaurants, activities)
- [ ] Shows on map
- [ ] Can tap to see full rating/review

---

## US-7.3: Recall Rating via AI
**Priority**: P1

As a traveler,
I want to ask AI about places I rated,
So that I can quickly recall experiences.

**Acceptance Criteria**:
- [ ] Can ask: "What was that restaurant on day 3?"
- [ ] AI looks up rating and returns details
- [ ] Includes rating, notes, photos
- [ ] Can ask: "What did we like in Phuket?"

---

# Epic 8: Documents & Offline

## US-8.1: Upload General Document
**Priority**: P0

As a traveler,
I want to upload travel documents not tied to a booking,
So that I have everything in one place.

**Acceptance Criteria**:
- [ ] Upload area in Documents section
- [ ] Accepts PDF, JPG, PNG
- [ ] Can name/categorize document
- [ ] Types: Passport, Visa, Insurance, Itinerary, Other
- [ ] Can assign to specific traveler
- [ ] Can view, download, delete

---

## US-8.2: View Documents Offline
**Priority**: P0

As a traveler,
I want my documents available without internet,
So that I can access them anywhere.

**Acceptance Criteria**:
- [ ] All documents cached locally
- [ ] Auto-downloads when on WiFi
- [ ] Shows offline indicator
- [ ] Can view documents without connection
- [ ] Shows last sync time

---

## US-8.3: Full Offline Mode
**Priority**: P0

As a traveler,
I want the entire app to work offline,
So that I can use it during flights or without data.

**Acceptance Criteria**:
- [ ] All trip data available offline
- [ ] Can view itinerary, bookings, expenses offline
- [ ] Can add/edit expenses offline (syncs when online)
- [ ] Can add/edit activities offline
- [ ] Changes queued and synced when connection restored
- [ ] Clear indication of offline mode
- [ ] AI features show "requires internet" gracefully

---

# Epic 9: Emergency & Utilities

## US-9.1: View Emergency Contacts
**Priority**: P1

As a traveler,
I want quick access to emergency information,
So that I'm prepared for problems.

**Acceptance Criteria**:
- [ ] Emergency section in trip
- [ ] Shows destination emergency numbers (auto-populated)
- [ ] Shows tourist police, ambulance, police
- [ ] Can add personal emergency contacts
- [ ] Can add hotel contact numbers
- [ ] One-tap to call any number

---

## US-9.2: SOS Quick Share
**Priority**: P1

As a traveler in trouble,
I want to quickly share my location and trip info,
So that someone can help me.

**Acceptance Criteria**:
- [ ] SOS button prominently visible
- [ ] One tap generates emergency message
- [ ] Message includes: location, traveler names, hotel contact, emergency contact
- [ ] Can share via WhatsApp, SMS, Email
- [ ] Works offline (queues for sending)

---

## US-9.3: Packing Checklist
**Priority**: P1

As a traveler preparing for a trip,
I want a packing checklist,
So that I don't forget important items.

**Acceptance Criteria**:
- [ ] Pre-populated based on destination and travelers
- [ ] Categories: Documents, Clothing, Electronics, Toiletries, etc.
- [ ] Special categories for kids, seniors
- [ ] Can check/uncheck items
- [ ] Can add custom items
- [ ] Progress indicator (X of Y packed)

---

## US-9.4: Pre-Trip To-Do List
**Priority**: P1

As a trip planner,
I want a to-do list of pre-trip tasks,
So that I don't forget important preparations.

**Acceptance Criteria**:
- [ ] Template tasks: book flights, hotels, visa, insurance, currency, etc.
- [ ] Can add custom tasks
- [ ] Can set due dates
- [ ] Can assign to traveler
- [ ] Check off completed tasks

---

# Priority Summary

## P0 (MVP) - Must ship
- US-1.1 to US-1.5: Trip CRUD
- US-2.1, US-2.2, US-2.5, US-2.6: Flights, Hotels, Documents
- US-3.1 to US-3.3: Basic itinerary
- US-4.1 to US-4.4: Expense tracking with multi-currency
- US-5.1 to US-5.4: AI parsing (email, document, receipt, NL expense)
- US-6.1, US-6.2, US-6.4: Basic sharing
- US-8.1 to US-8.3: Documents and offline

## P1 (Fast-follow)
- US-1.6: Archive/delete
- US-2.3, US-2.4: Transport, Activity bookings
- US-3.4, US-3.5: Reorder, timeline view
- US-4.5, US-4.6: Splitting, summary
- US-5.5 to US-5.8: AI chat, itinerary gen, suggestions
- US-6.3: Privacy settings
- US-7.1 to US-7.3: Ratings
- US-9.1 to US-9.4: Emergency, checklists

## P2 (Future)
- Calendar sync
- Flight status alerts
- Post-trip insights
- Public sharing
- Native apps
