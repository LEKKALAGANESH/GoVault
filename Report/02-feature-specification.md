# Feature Specification

## Product: GoVault
**Version**: 1.0 MVP
**Last Updated**: January 2026

---

## Feature Overview

| Feature Area | Priority | MVP | Description |
|--------------|----------|-----|-------------|
| Trip Management | P0 | Yes | Create, edit, manage trips |
| Itinerary Builder | P0 | Yes | Day-by-day schedule with activities |
| Booking Vault | P0 | Yes | Store flights, hotels, transport bookings |
| Document Storage | P0 | Yes | Upload and access confirmations, tickets |
| Expense Tracker | P0 | Yes | Log, categorize, analyze trip expenses |
| Offline Mode | P0 | Yes | Full functionality without internet |
| Trip Sharing | P1 | Yes | Share with travel companions |
| Emergency Hub | P1 | Yes | Quick access emergency info |
| Checklists | P1 | Yes | Packing lists, to-dos |
| Trip Insights | P2 | No | Post-trip analytics and memories |
| Smart Import | P2 | No | Email parsing, calendar sync |

---

## F1: Trip Management

### F1.1 Create Trip
**Priority**: P0 | **MVP**: Yes

**Description**: Users can create a new trip with basic details.

**Inputs**:
- Trip name (required)
- Destination(s) (required, supports multiple)
- Start date (required)
- End date (required)
- Cover image (optional, default based on destination)
- Trip type (optional): Solo, Couple, Family, Friends, Business

**Behaviors**:
- Auto-calculate trip duration
- Auto-populate destination timezone
- Generate shareable trip URL
- Pre-populate emergency numbers for destination country

**Validation**:
- End date must be after start date
- Trip name max 100 characters
- At least one destination required

---

### F1.2 Trip Dashboard
**Priority**: P0 | **MVP**: Yes

**Description**: Central hub showing trip overview and quick actions.

**Components**:
- Trip header (name, dates, countdown/day indicator)
- Quick stats: Days remaining, Travelers, Budget vs Spent
- Today's schedule (if during trip)
- Recent activity feed
- Quick actions: Add booking, Log expense, View documents

**States**:
- Pre-trip: Shows countdown, to-dos, booking checklist
- During trip: Shows today's itinerary, quick expense entry
- Post-trip: Shows summary, total expenses, memories

---

### F1.3 Multi-Trip Management
**Priority**: P1 | **MVP**: Yes

**Description**: View and manage multiple trips.

**Features**:
- Trip list with filters (Upcoming, Active, Past)
- Sort by date, name, destination
- Archive/delete trips
- Duplicate trip as template

---

## F2: Itinerary Builder

### F2.1 Day View
**Priority**: P0 | **MVP**: Yes

**Description**: View and manage activities for a single day.

**Components**:
- Day header (date, day number, location)
- Activity timeline (chronological)
- Day summary/notes
- Weather info (for upcoming days)
- Energy level indicator (Low/Medium/High day)

**Activity Types**:
- Flight/Transport
- Check-in/Check-out
- Activity/Experience
- Meal/Restaurant
- Free time
- Custom

**Activity Fields**:
- Time (start, optional end)
- Title
- Location/Address (with map link)
- Notes
- Linked booking (optional)
- Linked expense (optional)
- Status: Confirmed, Tentative, Completed

---

### F2.2 Full Itinerary View
**Priority**: P0 | **MVP**: Yes

**Description**: See entire trip at a glance.

**Views**:
- Timeline view (vertical scroll through all days)
- Calendar view (month grid with activity dots)
- Map view (all locations plotted)

**Features**:
- Collapse/expand days
- Drag to reorder activities
- Quick add activity to any day
- Filter by activity type

---

### F2.3 Activity Management
**Priority**: P0 | **MVP**: Yes

**Description**: Add, edit, delete activities.

**Quick Add**:
- Minimal required fields (time, title)
- Smart defaults based on time (morning = breakfast suggestion)

**Full Edit**:
- All activity fields
- Attach documents
- Link to booking
- Add to expenses
- Set reminders

**Bulk Actions**:
- Move activities between days
- Duplicate activity
- Delete multiple

---

## F3: Booking Vault

### F3.1 Flight Bookings
**Priority**: P0 | **MVP**: Yes

**Description**: Store and display flight information.

**Fields**:
- Airline
- Flight number
- Departure: Airport (code + name), Date, Time
- Arrival: Airport (code + name), Date, Time
- Duration
- PNR/Booking reference
- Ticket numbers (per traveler)
- Seat assignments (per traveler)
- Baggage allowance
- Status: Confirmed, Pending, Cancelled
- Booking source (where booked)
- Cost

**Features**:
- Visual flight card (departure → arrival)
- Multiple segments for connections
- Attach boarding pass (PDF/image)
- Flight status integration (future: live updates)
- Add to calendar

---

### F3.2 Accommodation Bookings
**Priority**: P0 | **MVP**: Yes

**Description**: Store hotel/stay information.

**Fields**:
- Property name
- Property type: Hotel, Airbnb, Resort, Hostel, Other
- Address (with map embed)
- Check-in: Date, Time
- Check-out: Date, Time
- Room type
- Booking reference
- Contact phone
- Cost (per night, total)
- Amenities (tags)
- Notes (parking, wifi password, etc.)

**Features**:
- Visual stay card with nights count
- Attach confirmation documents
- Direct call/map buttons
- Link to itinerary days automatically

---

### F3.3 Transport Bookings
**Priority**: P1 | **MVP**: Yes

**Description**: Store ground transport (trains, buses, transfers, car rentals).

**Types**:
- Train
- Bus
- Airport transfer
- Car rental
- Ferry
- Other

**Fields** (vary by type):
- Provider/Company
- Booking reference
- Pickup: Location, Date, Time
- Dropoff: Location, Date, Time
- Vehicle type (for rentals)
- Cost

---

### F3.4 Activity Bookings
**Priority**: P1 | **MVP**: Yes

**Description**: Store tours, experiences, reservations.

**Fields**:
- Activity name
- Provider
- Date, Time
- Duration
- Location/Meeting point
- Booking reference
- Tickets (number of)
- Cost
- Cancellation policy
- Notes

---

## F4: Document Storage

### F4.1 Document Upload
**Priority**: P0 | **MVP**: Yes

**Description**: Upload and store travel documents.

**Supported Formats**:
- PDF
- Images (JPG, PNG, HEIC)
- Future: Email forwarding

**Upload Methods**:
- File picker
- Camera capture
- Drag and drop (web)
- Share sheet (mobile)

**Organization**:
- Auto-categorize by type (boarding pass, hotel confirmation, etc.)
- Link to specific booking
- Tag with traveler name
- Custom folders

---

### F4.2 Document Viewer
**Priority**: P0 | **MVP**: Yes

**Description**: View stored documents.

**Features**:
- In-app PDF viewer
- Image zoom/pan
- Full-screen mode
- Share/export
- Print option

---

### F4.3 Offline Document Access
**Priority**: P0 | **MVP**: Yes

**Description**: Documents available without internet.

**Behaviors**:
- Auto-download all documents when on WiFi
- Manual "Download for offline" option
- Clear offline cache option
- Storage usage indicator

---

## F5: Expense Tracker

### F5.1 Quick Expense Entry
**Priority**: P0 | **MVP**: Yes

**Description**: Log expenses with minimal friction.

**Required Fields**:
- Amount
- Currency (default to destination currency)
- Category

**Optional Fields**:
- Description/Merchant
- Date (default today)
- Payment method
- Paid by (which traveler)
- Split among (which travelers)
- Receipt photo
- Linked activity

**Categories** (customizable):
- Flights
- Accommodation
- Food & Dining
- Transport
- Activities & Entertainment
- Shopping
- Health & Medical
- Communication (SIM, WiFi)
- Tips
- Other

---

### F5.2 Expense List
**Priority**: P0 | **MVP**: Yes

**Description**: View all trip expenses.

**Views**:
- Chronological list
- By category
- By day
- By payer

**Features**:
- Search expenses
- Filter by category, date range, payer
- Edit/delete expense
- Running total always visible
- Currency conversion to home currency

---

### F5.3 Budget Tracking
**Priority**: P0 | **MVP**: Yes

**Description**: Set and track trip budget.

**Features**:
- Set total trip budget
- Set category budgets (optional)
- Visual progress bar (spent vs budget)
- Over-budget warnings
- Daily average spending

---

### F5.4 Multi-Currency Support
**Priority**: P0 | **MVP**: Yes

**Description**: Handle expenses in multiple currencies.

**Features**:
- Set home currency
- Log expenses in any currency
- Auto-conversion using daily rates
- Manual rate override option
- Show both original and converted amounts

---

### F5.5 Expense Splitting
**Priority**: P1 | **MVP**: Yes

**Description**: Track shared expenses among travelers.

**Features**:
- Mark expense as split
- Select which travelers to split among
- Equal split or custom amounts
- Track who paid
- Settlement summary (who owes whom)
- Export split summary

---

### F5.6 Expense Insights
**Priority**: P2 | **MVP**: No

**Description**: Post-trip expense analytics.

**Reports**:
- Total by category (pie chart)
- Daily spending trend (line chart)
- Per-person breakdown
- Comparison to budget
- Cost per day average

---

## F6: Offline Mode

### F6.1 Offline Data Sync
**Priority**: P0 | **MVP**: Yes

**Description**: Full app functionality without internet.

**Offline Available**:
- All trip data (itinerary, bookings, expenses)
- All uploaded documents
- Emergency information
- Checklists

**Sync Behavior**:
- Auto-sync when online
- Visual indicator of sync status
- Conflict resolution (last write wins with notification)
- Queue changes made offline

---

### F6.2 PWA Support
**Priority**: P0 | **MVP**: Yes

**Description**: Installable web app with native-like experience.

**Features**:
- Add to home screen prompt
- App icon and splash screen
- Works without browser chrome
- Push notifications (when online)
- Background sync

---

## F7: Trip Sharing

### F7.1 Invite Travelers
**Priority**: P1 | **MVP**: Yes

**Description**: Share trip with companions.

**Invite Methods**:
- Email invite
- Share link
- QR code

**Permission Levels**:
- Viewer: Read-only access
- Editor: Can add/edit activities, expenses
- Admin: Full control including delete

---

### F7.2 Collaborative Features
**Priority**: P1 | **MVP**: Yes

**Description**: Work together on trip.

**Features**:
- See who's viewing (presence indicators)
- Activity attribution (who added what)
- Comments on activities
- @mention travelers in notes

---

### F7.3 Public Sharing
**Priority**: P2 | **MVP**: No

**Description**: Share trip publicly (read-only).

**Features**:
- Generate public link
- Customizable visibility (hide expenses, personal notes)
- Embed widget for blogs
- Social sharing

---

## F8: Emergency Hub

### F8.1 Emergency Contacts
**Priority**: P1 | **MVP**: Yes

**Description**: Quick access to emergency information.

**Pre-populated**:
- Destination emergency numbers (police, ambulance, fire)
- Tourist police
- Nearest embassy/consulate for traveler nationality

**User Added**:
- Personal emergency contacts (family back home)
- Travel insurance hotline
- Hotel contact numbers
- Airline customer service

---

### F8.2 SOS Feature
**Priority**: P1 | **MVP**: Yes

**Description**: Quick emergency communication.

**Features**:
- One-tap SOS button
- Pre-composed emergency message with:
  - Current location
  - Traveler names
  - Hotel contact
  - Emergency contact back home
- Share via WhatsApp, SMS, or email
- Optional: Emergency contact auto-notification

---

### F8.3 Medical Information
**Priority**: P2 | **MVP**: No

**Description**: Store medical info for emergencies.

**Fields**:
- Blood type
- Allergies
- Medications
- Medical conditions
- Doctor contact
- Insurance details

---

## F9: Checklists

### F9.1 Packing List
**Priority**: P1 | **MVP**: Yes

**Description**: Track packing progress.

**Features**:
- Pre-populated templates based on:
  - Destination (beach, city, cold weather)
  - Trip type (business, leisure)
  - Travelers (baby items, senior needs)
- Custom items
- Categories
- Check/uncheck items
- Per-traveler lists
- Reset for next trip

---

### F9.2 To-Do List
**Priority**: P1 | **MVP**: Yes

**Description**: Pre-trip task management.

**Template Tasks**:
- Book flights
- Book accommodation
- Apply for visa
- Get travel insurance
- Currency exchange
- Notify bank of travel
- Check passport validity
- Download offline maps

**Features**:
- Due dates
- Assign to traveler
- Priority levels
- Categories: Booking, Documents, Health, Logistics

---

## F10: Trip Insights (Post-MVP)

### F10.1 Trip Summary
**Priority**: P2 | **MVP**: No

**Description**: Post-trip recap.

**Includes**:
- Trip timeline with photos
- Total expenses breakdown
- Places visited map
- Stats (days, cities, countries)
- Shareable summary card

---

### F10.2 Travel Analytics
**Priority**: P2 | **MVP**: No

**Description**: Cross-trip insights.

**Features**:
- Total spend by year
- Countries visited
- Travel patterns (frequency, duration)
- Budget accuracy over time

---

## F11: Smart Import (Post-MVP)

### F11.1 Email Forwarding
**Priority**: P2 | **MVP**: No

**Description**: Forward confirmation emails to auto-populate bookings.

**Features**:
- Unique email address per user
- Parse common booking formats (airlines, hotels, Airbnb)
- Create booking draft for review

---

### F11.2 Calendar Sync
**Priority**: P2 | **MVP**: No

**Description**: Sync with external calendars.

**Features**:
- Export trip to Google/Apple Calendar
- Import events from calendar
- Two-way sync option

---

## Non-Functional Requirements

### Performance
- App load time: <2 seconds
- Expense entry: <10 seconds end-to-end
- Document upload: <5 seconds for 5MB file
- Offline switch: Seamless, no user action needed

### Security
- End-to-end encryption for documents
- Secure authentication (OAuth, magic link)
- GDPR compliant data handling
- Option to delete all data

### Accessibility
- WCAG 2.1 AA compliance
- Screen reader support
- High contrast mode
- Scalable fonts

### Platforms
- Web (responsive, all modern browsers)
- iOS (PWA initially, native later)
- Android (PWA initially, native later)

---

## MVP Scope Summary

### In MVP (V1.0)
- Trip CRUD
- Day-by-day itinerary
- Flight & hotel booking cards
- Document upload & offline access
- Expense tracking with multi-currency
- Basic budget tracking
- Trip sharing (view + edit)
- Emergency hub
- Packing & to-do checklists
- PWA with offline support

### Post-MVP (V1.x)
- Email parsing for booking import
- Calendar sync
- Trip insights & analytics
- Public sharing & embedding
- Medical information storage
- Native mobile apps

---

## Success Metrics

| Metric | Target (MVP) | Measurement |
|--------|--------------|-------------|
| Trip completion rate | >60% | Trips with >5 activities added |
| Document upload rate | >2 per trip | Average docs per trip |
| Expense logging | >10 per trip | Average expenses per trip |
| Share rate | >30% | Trips shared with 1+ person |
| Return rate | >40% | Users creating 2nd trip within 6 months |
| Offline usage | >20% | Sessions with offline activity |
