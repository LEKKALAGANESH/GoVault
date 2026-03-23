# GoVault - Complete Project Documentation

> **Document Purpose**: Comprehensive documentation of the GoVault application - an AI-powered trip documentation platform (not trip planning).

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Core Philosophy](#2-core-philosophy)
3. [Application Architecture](#3-application-architecture)
4. [AI Agent Architecture](#4-ai-agent-architecture)
5. [Database Schema](#5-database-schema)
6. [API Structure](#6-api-structure)
7. [Component Structure](#7-component-structure)
8. [User Workflows](#8-user-workflows)
9. [AI Agent Workflows](#9-ai-agent-workflows)
10. [Technology Stack](#10-technology-stack)
11. [Implementation Status](#11-implementation-status)
12. [File Structure Reference](#12-file-structure-reference)

---

## 1. Product Vision

### One-Liner

**AI-powered travel companion that turns scattered confirmations into a beautiful, organized journey.**

### Critical Distinction

```
+----------------------------------------------------------+
|                    WHAT WE ARE NOT                        |
+----------------------------------------------------------+
|                                                           |
|   X  Trip Planning Platform                               |
|   X  Flight/Hotel Booking Service                         |
|   X  Price Comparison Engine                              |
|   X  Itinerary Generator from Scratch                     |
|                                                           |
+----------------------------------------------------------+

+----------------------------------------------------------+
|                      WHAT WE ARE                          |
+----------------------------------------------------------+
|                                                           |
|   +  Trip Documentation Platform                          |
|   +  Travel Document Organizer                            |
|   +  AI-Powered Content Parser                            |
|   +  Trip Companion During Travel                         |
|   +  Post-Booking Trip Tracker                            |
|                                                           |
+----------------------------------------------------------+
```

### The Problem We Solve

```
+------------------------------------------------------------------+
|                     THE TRAVELER'S CHAOS                          |
+------------------------------------------------------------------+
|                                                                   |
|  After booking a trip, travelers face:                            |
|                                                                   |
|  +-- Flight confirmations        --> Buried in Gmail             |
|  +-- Hotel vouchers              --> Different email thread      |
|  +-- Activity tickets            --> PDFs somewhere              |
|  +-- Emergency contacts          --> Googled in panic            |
|  +-- Packing lists               --> Mental notes (forgotten)    |
|  +-- Local phrases               --> Never prepared              |
|  +-- Itinerary                   --> Messy Google Doc            |
|                                                                   |
|  RESULT: Digging through emails at immigration,                   |
|          screenshotting hotel addresses to WhatsApp               |
|                                                                   |
+------------------------------------------------------------------+
```

### Our Solution

```
+------------------------------------------------------------------+
|                      GOVAULT SOLUTION                           |
+------------------------------------------------------------------+
|                                                                   |
|                    POST-BOOKING FOCUS                             |
|         (Starts where other travel apps end)                      |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  |  USER HAS BOOKED TRIP    -->    GOVAULT ORGANIZES IT      | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  Features:                                                        |
|  +-- AI parses booking confirmations (email/PDF/photo)           |
|  +-- AI structures pasted itineraries                            |
|  +-- AI generates packing lists from trip context                |
|  +-- AI generates local phrases for destination                  |
|  +-- All documents in one place (offline available)              |
|  +-- Natural language editing of trip data                       |
|  +-- Share trip with travel companions                           |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 2. Core Philosophy

### Trip Documentation vs Trip Planning

```
+------------------------------------------------------------------+
|                    PHILOSOPHY COMPARISON                          |
+------------------------------------------------------------------+
|                                                                   |
|  TRIP PLANNING (What we DON'T do):                                |
|  ================================                                  |
|  "Where should I go?"         --> NOT our domain                 |
|  "Find me cheap flights"      --> NOT our domain                 |
|  "Which hotel is best?"       --> NOT our domain                 |
|  "Create itinerary for Paris" --> NOT our domain                 |
|                                                                   |
|  TRIP DOCUMENTATION (What we DO):                                 |
|  =================================                                 |
|  "I booked this flight"       --> Parse & store it               |
|  "Here's my itinerary text"   --> Structure & organize it        |
|  "What should I pack?"        --> Generate based on your trip    |
|  "Useful Thai phrases?"       --> Generate for your destination  |
|  "Move dinner to 8pm"         --> Edit your existing itinerary   |
|  "Show my hotel address"      --> Quick access during travel     |
|                                                                   |
+------------------------------------------------------------------+
```

### AI Agent Role

```
+------------------------------------------------------------------+
|                   AI AGENT PHILOSOPHY                             |
+------------------------------------------------------------------+
|                                                                   |
|  The AI Agent is a TRIP COMPANION, not a TRIP PLANNER             |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  |                    AI CAPABILITIES                           | |
|  +-------------------------------------------------------------+ |
|  |                                                              | |
|  |  DOCUMENT PARSING:                                           | |
|  |  +-- Parse flight confirmations (PDF/image)                  | |
|  |  +-- Parse hotel vouchers                                    | |
|  |  +-- Parse activity tickets                                  | |
|  |  +-- Extract structured data from chaos                      | |
|  |                                                              | |
|  |  CONTENT STRUCTURING:                                        | |
|  |  +-- Convert pasted itinerary text to structured days        | |
|  |  +-- Extract packing items from user's text                  | |
|  |  +-- Extract phrases from user's text                        | |
|  |  +-- Enhance with AI suggestions                             | |
|  |                                                              | |
|  |  CONTENT GENERATION (Context-Aware):                         | |
|  |  +-- Packing list based on destination/duration/travelers    | |
|  |  +-- Local phrases based on destination                      | |
|  |  +-- Todo items for bookings                                 | |
|  |                                                              | |
|  |  ITINERARY EDITING:                                          | |
|  |  +-- Natural language commands                               | |
|  |  +-- Add/update/delete days and activities                   | |
|  |  +-- Move activities between days                            | |
|  |                                                              | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 3. Application Architecture

### System Overview

```
+------------------------------------------------------------------+
|                    SYSTEM ARCHITECTURE                            |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  |                    CLIENT (PWA)                             |  |
|  |  +-------------------------------------------------------+  |  |
|  |  |  Next.js 16 App (React 19)                            |  |  |
|  |  |  +-- App Router pages                                 |  |  |
|  |  |  +-- Shadcn/ui components                             |  |  |
|  |  |  +-- Zustand state management                         |  |  |
|  |  |  +-- Dexie.js (IndexedDB) for offline                 |  |  |
|  |  +-------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |                    API LAYER                                |  |
|  |  +-------------------------------------------------------+  |  |
|  |  |  Next.js API Routes (Serverless)                      |  |  |
|  |  |  +-- /api/trips/*          Trip CRUD                  |  |  |
|  |  |  +-- /api/trips/[id]/agent AI processing              |  |  |
|  |  |  +-- /api/trips/[id]/agent/apply  Apply changes       |  |  |
|  |  |  +-- /api/auth/*           Authentication             |  |  |
|  |  +-------------------------------------------------------+  |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|              +---------------+---------------+                    |
|              |               |               |                    |
|              v               v               v                    |
|  +----------------+  +-------------+  +------------------+        |
|  |   SUPABASE     |  |  OPENROUTER |  |  FILE STORAGE    |        |
|  |  +-----------+ |  |  (AI)       |  |                  |        |
|  |  | PostgreSQL| |  |  +--------+ |  |  Supabase        |        |
|  |  | +-------+ | |  |  | GPT-4o | |  |  Storage         |        |
|  |  | | trips | | |  |  +--------+ |  |  +-- Documents   |        |
|  |  | | days  | | |  |             |  |  +-- Receipts    |        |
|  |  | | etc.  | | |  |  Vision    |  |  +-- Photos       |        |
|  |  | +-------+ | |  |  capable    |  |                  |        |
|  |  +-----------+ |  +-------------+  +------------------+        |
|  |                |                                               |
|  |  +-----------+ |                                               |
|  |  | Auth      | |  <-- Google OAuth, Magic Link                 |
|  |  +-----------+ |                                               |
|  |                |                                               |
|  |  +-----------+ |                                               |
|  |  | Realtime  | |  <-- Live updates for shared trips            |
|  |  +-----------+ |                                               |
|  +----------------+                                               |
|                                                                   |
+------------------------------------------------------------------+
```

### Page Structure

```
+------------------------------------------------------------------+
|                      PAGE STRUCTURE                               |
+------------------------------------------------------------------+
|                                                                   |
|  PUBLIC ROUTES:                                                   |
|  +-- /                      Landing page                          |
|  +-- /login                 Authentication                        |
|  +-- /share/[slug]          Public trip viewer                    |
|  +-- /privacy               Privacy policy                        |
|  +-- /terms                 Terms of service                      |
|                                                                   |
|  AUTHENTICATED ROUTES:                                            |
|  +-- /trips                 Trip listing                          |
|  +-- /trips/new             Create new trip                       |
|  +-- /trips/[slug]          Trip dashboard (overview)             |
|  +-- /trips/[slug]/itinerary    Day-by-day view                   |
|  +-- /trips/[slug]/bookings     Flights, hotels, activities       |
|  +-- /trips/[slug]/expenses     Expense tracking                  |
|  +-- /trips/[slug]/extras       Packing, phrases, todos           |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 4. AI Agent Architecture

### Agent Overview

```
+------------------------------------------------------------------+
|                   AI AGENT OVERVIEW                               |
+------------------------------------------------------------------+
|                                                                   |
|  NAME: GoVault AI Agent                                         |
|  MODEL: GPT-4o via OpenRouter (vision-capable)                    |
|  APPROACH: Tool calling (function calling)                        |
|                                                                   |
|  +-------------------------------------------------------------+ |
|  |                    CORE COMPONENTS                           | |
|  +-------------------------------------------------------------+ |
|  |                                                              | |
|  |  Location           | Purpose                                | |
|  |  -------------------|--------------------------------------  | |
|  |  src/lib/agent/     | Types, prompts, tools, client config   | |
|  |  src/app/api/.../agent/     | Processing & applying changes  | |
|  |  src/components/.../chat    | Chat UI interface              | |
|  |                                                              | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Supported Actions

```
+------------------------------------------------------------------+
|                   AGENT ACTIONS                                   |
+------------------------------------------------------------------+
|                                                                   |
|  1. PARSE_DOCUMENT                                                |
|  +-------------------------------------------------------------+ |
|  |  Input:  PDF or image file (base64 encoded)                  | |
|  |  Process: Vision model for images, text extraction for PDFs  | |
|  |  Output:  Flight, hotel, or activity booking data            | |
|  |  Post:    Creates booking + linked document + auto todos     | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  2. PARSE_ITINERARY                                               |
|  +-------------------------------------------------------------+ |
|  |  Input:  Unstructured text (pasted itinerary)                | |
|  |  Process: Multi-step extraction:                             | |
|  |           1. Extract day-by-day itinerary                    | |
|  |           2. Extract + enhance packing list                  | |
|  |           3. Extract + enhance local phrases                 | |
|  |  Output:  Structured days/activities + packing + phrases     | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  3. EDIT_ITINERARY                                                |
|  +-------------------------------------------------------------+ |
|  |  Input:  Natural language instruction + conversation history | |
|  |  Process: AI with full trip context (days, activities, UUIDs)| |
|  |  Output:  Tool calls for add/update/delete/move operations   | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  4. GENERATE_PACKING                                              |
|  +-------------------------------------------------------------+ |
|  |  Input:  Trip context (destination, duration, travelers)     | |
|  |  Process: AI generates destination-specific checklist        | |
|  |  Output:  20-35 items with categories                        | |
|  |  Considers: Baby/kid/senior travelers, weather, activities   | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  5. GENERATE_PHRASES                                              |
|  +-------------------------------------------------------------+ |
|  |  Input:  Trip destination                                    | |
|  |  Process: Auto-detect language, generate useful phrases      | |
|  |  Output:  Romanized phrases with phonetic pronunciation      | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  6. GENERATE_TODOS                                                |
|  +-------------------------------------------------------------+ |
|  |  Input:  Current itinerary analysis                          | |
|  |  Process: AI identifies preparation tasks                    | |
|  |  Output:  Prioritized todo list by category                  | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  7. CAPTURE_TRIP_INFO                                             |
|  +-------------------------------------------------------------+ |
|  |  Input:  Conversation text                                   | |
|  |  Process: Extract trip details                               | |
|  |  Output:  Travelers, destinations, dates                     | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Agent Tools (25+)

```
+------------------------------------------------------------------+
|                      AGENT TOOLS                                  |
+------------------------------------------------------------------+
|                                                                   |
|  DOCUMENT PARSING:                                                |
|  +-- parse_flight          Extract flight details                 |
|  +-- parse_hotel           Extract hotel details                  |
|  +-- parse_activity        Extract activity/tour details          |
|                                                                   |
|  ITINERARY MANAGEMENT:                                            |
|  +-- parse_itinerary_text  Parse days/activities from text        |
|  +-- add_day               Add new day to itinerary               |
|  +-- update_day            Modify existing day                    |
|  +-- delete_day            Remove day from itinerary              |
|  +-- add_activity          Add activity to a day                  |
|  +-- update_activity       Modify existing activity               |
|  +-- delete_activity       Remove activity                        |
|  +-- move_activity         Move activity to different day         |
|                                                                   |
|  BOOKING MANAGEMENT:                                              |
|  +-- delete_booking        Delete single booking                  |
|  +-- delete_all_bookings   Delete all bookings (by type)          |
|                                                                   |
|  TODO MANAGEMENT:                                                 |
|  +-- delete_todo           Delete single todo                     |
|  +-- delete_all_todos      Delete all todos                       |
|                                                                   |
|  CONTENT GENERATION:                                              |
|  +-- generate_packing_list Generate packing items                 |
|  +-- generate_phrases      Generate language phrases              |
|  +-- delete_all_packing    Clear all packing items                |
|  +-- delete_all_phrases    Clear all phrases                      |
|                                                                   |
|  TRIP METADATA:                                                   |
|  +-- update_trip_dates     Change dates + recalculate day dates   |
|  +-- update_travelers      Update traveler information            |
|  +-- update_trip_metadata  Update destination info                |
|                                                                   |
+------------------------------------------------------------------+
```

### Processing Flow

```
+------------------------------------------------------------------+
|                  AGENT PROCESSING FLOW                            |
+------------------------------------------------------------------+
|                                                                   |
|  User Input (document/text/command)                               |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Agent Request] --> POST /api/trips/[tripId]/agent       |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Validate] --> Check auth & trip ownership               |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Determine Action] --> Route to handler based on type    |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Build Context] --> Fetch trip data, travelers, itinerary|    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [AI Processing] --> Call OpenRouter with prompts & tools |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Parse Response] --> Extract tool calls from AI response |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Proposed Changes] --> Return to user for review         |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [User Confirms] --> POST /api/trips/[tripId]/agent/apply |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Apply Changes] --> Execute database operations          |    |
|  +----------------------------------------------------------+    |
|      |                                                            |
|      v                                                            |
|  +----------------------------------------------------------+    |
|  | [Return Results] --> Notify user of applied changes      |    |
|  +----------------------------------------------------------+    |
|                                                                   |
+------------------------------------------------------------------+
```

### Data Flow Diagram

```
+------------------------------------------------------------------+
|                     DATA FLOW DIAGRAM                             |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  |   UI Layer (trip-agent-chat.tsx)                           |  |
|  |   +-- Chat interface                                       |  |
|  |   +-- File upload                                          |  |
|  |   +-- Message history (SessionStorage)                     |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |   POST /api/trips/[tripId]/agent                           |  |
|  +------------------------------------------------------------+  |
|  |   1. Authenticate & verify ownership                       |  |
|  |   2. Fetch context (trip, travelers)                       |  |
|  |   3. Select tools for action type                          |  |
|  |   4. Build system prompt                                   |  |
|  |   5. Call OpenRouter API                                   |  |
|  |   6. Parse tool calls from response                        |  |
|  |   7. Return ProposedChanges                                |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|                    +------------------+                           |
|                    |   User Review    |                           |
|                    |   & Confirm      |                           |
|                    +------------------+                           |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |   POST /api/trips/[tripId]/agent/apply                     |  |
|  +------------------------------------------------------------+  |
|  |   For each ProposedChange:                                 |  |
|  |   +-- Execute database operation                           |  |
|  |   +-- Smart link to bookings                               |  |
|  |   +-- Auto-generate todos                                  |  |
|  |   +-- Handle document uploads                              |  |
|  |   +-- Check for conflicts                                  |  |
|  +------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +------------------------------------------------------------+  |
|  |   Supabase Database                                        |  |
|  |   +-- trips, itinerary_days, activities                    |  |
|  |   +-- bookings, packing_items, phrases                     |  |
|  |   +-- trip_todos, documents, travelers                     |  |
|  +------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

### Smart Features

```
+------------------------------------------------------------------+
|                    SMART FEATURES                                 |
+------------------------------------------------------------------+
|                                                                   |
|  1. SMART LINKING                                                 |
|  +-------------------------------------------------------------+ |
|  |  When adding activities, auto-link to matching bookings:    | |
|  |                                                              | |
|  |  Activity Title        -->  Matched By                       | |
|  |  "Flight to Bangkok"   -->  Flight number, airport, airline  | |
|  |  "Check in at Marriott"-->  Hotel name                       | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  2. AUTO-GENERATED TODOS                                          |
|  +-------------------------------------------------------------+ |
|  |  When booking is added:                                      | |
|  |                                                              | |
|  |  FLIGHTS:                                                    | |
|  |  +-- Check-in reminder                                       | |
|  |  +-- Boarding pass reminder                                  | |
|  |  +-- Confirmation verification                               | |
|  |                                                              | |
|  |  HOTELS:                                                     | |
|  |  +-- Confirmation reminder                                   | |
|  |  +-- Save details reminder                                   | |
|  |  +-- Check-in time note                                      | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  3. CONFLICT DETECTION                                            |
|  +-------------------------------------------------------------+ |
|  |  +-- Date conflicts: Bookings outside trip dates            | |
|  |  +-- Location conflicts: Bookings to different destinations | |
|  |  +-- Generates suggestions to resolve conflicts             | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  4. MULTI-EXTRACTION                                              |
|  +-------------------------------------------------------------+ |
|  |  For PARSE_ITINERARY, extracts THREE content types:          | |
|  |                                                              | |
|  |  1. Itinerary days/activities (primary)                     | |
|  |  2. Packing list items (enhanced with AI suggestions)       | |
|  |  3. Local phrases (enhanced with AI suggestions)            | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 5. Database Schema

### Entity Relationship

```
+------------------------------------------------------------------+
|                   DATABASE RELATIONSHIPS                          |
+------------------------------------------------------------------+
|                                                                   |
|  Trip                                                             |
|  +-- owner_id (User)                                              |
|  |                                                                |
|  +-- Travelers[] (trip members info)                              |
|  |   +-- name, age, dietary, mobility                             |
|  |                                                                |
|  +-- Bookings[] (FLIGHT, HOTEL, ACTIVITY)                         |
|  |   +-- type, provider, confirmation, details                    |
|  |   +-- cost_amount, cost_currency                               |
|  |   +-- Documents[] (linked)                                     |
|  |   +-- Activities[] (linked via booking_id)                     |
|  |                                                                |
|  +-- ItineraryDays[]                                              |
|  |   +-- date, day_number, location, notes                        |
|  |   +-- Activities[]                                             |
|  |       +-- type, title, description                             |
|  |       +-- start_time, end_time                                 |
|  |       +-- booking_id (optional link)                           |
|  |                                                                |
|  +-- PackingItems[]                                               |
|  |   +-- name, category, is_checked                               |
|  |                                                                |
|  +-- Phrases[]                                                    |
|  |   +-- english, local, romanized, category                      |
|  |                                                                |
|  +-- Todos[]                                                      |
|  |   +-- title, category, is_completed                            |
|  |                                                                |
|  +-- Documents[]                                                  |
|      +-- name, type, file_url, booking_id                         |
|                                                                   |
+------------------------------------------------------------------+
```

### Hero Stats Calculation

```
+------------------------------------------------------------------+
|                    HERO READINESS                                 |
+------------------------------------------------------------------+
|                                                                   |
|  Readiness Score = Weighted Average of:                           |
|                                                                   |
|  +-----------------------------------------------------------+   |
|  | Category     | Weight | Calculation                        |   |
|  +-----------------------------------------------------------+   |
|  | Flights      |  30%   | confirmed / total flights          |   |
|  | Hotels       |  25%   | confirmed / total hotels           |   |
|  | Todos        |  20%   | completed / total todos            |   |
|  | Packing      |  15%   | checked / total items              |   |
|  | Documents    |   5%   | has boarding pass & hotel voucher  |   |
|  | Contacts     |   5%   | has emergency contacts             |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 6. API Structure

### REST Endpoints

```
+------------------------------------------------------------------+
|                      API ENDPOINTS                                |
+------------------------------------------------------------------+
|                                                                   |
|  AUTHENTICATION:                                                  |
|  +-- POST /api/auth/callback     OAuth callback                   |
|  +-- GET  /api/auth/me           Current user                     |
|                                                                   |
|  TRIPS:                                                           |
|  +-- GET  /api/trips             List user's trips                |
|  +-- POST /api/trips             Create trip                      |
|  +-- GET  /api/trips/:id         Get trip details                 |
|  +-- PUT  /api/trips/:id         Update trip                      |
|  +-- DELETE /api/trips/:id       Delete trip                      |
|                                                                   |
|  TRAVELERS:                                                       |
|  +-- GET  /api/trips/:id/travelers                                |
|  +-- POST /api/trips/:id/travelers                                |
|  +-- PUT  /api/trips/:id/travelers/:travelerId                    |
|  +-- DELETE /api/trips/:id/travelers/:travelerId                  |
|                                                                   |
|  BOOKINGS:                                                        |
|  +-- GET  /api/trips/:id/bookings                                 |
|  +-- POST /api/trips/:id/bookings                                 |
|  +-- DELETE /api/trips/:id/bookings/:bookingId                    |
|                                                                   |
|  DOCUMENTS:                                                       |
|  +-- GET  /api/trips/:id/documents                                |
|  +-- POST /api/trips/:id/documents                                |
|  +-- DELETE /api/trips/:id/documents/:docId                       |
|                                                                   |
|  TODOS:                                                           |
|  +-- GET  /api/trips/:id/todos                                    |
|  +-- POST /api/trips/:id/todos                                    |
|  +-- PUT  /api/trips/:id/todos/:todoId                            |
|  +-- DELETE /api/trips/:id/todos/:todoId                          |
|                                                                   |
|  AI AGENT:                                                        |
|  +-- POST /api/trips/:id/agent         Process AI request         |
|  +-- POST /api/trips/:id/agent/apply   Apply confirmed changes    |
|                                                                   |
|  CONTENT GENERATION:                                              |
|  +-- POST /api/trips/:id/generate-content                         |
|       Body: { type: "packing" | "phrases" | "todos" }             |
|                                                                   |
|  STATS:                                                           |
|  +-- GET  /api/trips/:id/stats         Hero stats                 |
|                                                                   |
+------------------------------------------------------------------+
```

### Agent Request/Response Types

```
+------------------------------------------------------------------+
|                 AGENT REQUEST/RESPONSE                            |
+------------------------------------------------------------------+
|                                                                   |
|  AgentRequest:                                                    |
|  +-----------------------------------------------------------+   |
|  | {                                                          |   |
|  |   action: "PARSE_DOCUMENT" | "PARSE_ITINERARY" |           |   |
|  |           "EDIT_ITINERARY" | "GENERATE_PACKING" |          |   |
|  |           "GENERATE_PHRASES" | "GENERATE_TODOS"            |   |
|  |   content?: string          // Text input                  |   |
|  |   file?: string             // Base64 encoded file         |   |
|  |   fileName?: string                                        |   |
|  |   mimeType?: string                                        |   |
|  |   conversationHistory?: Message[]                          |   |
|  | }                                                          |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
|  AgentResponse:                                                   |
|  +-----------------------------------------------------------+   |
|  | {                                                          |   |
|  |   success: boolean                                         |   |
|  |   message: string                                          |   |
|  |   proposedChanges: ProposedChange[]                        |   |
|  |   suggestions?: AgentSuggestion[]                          |   |
|  |   detectedLocations?: string[]                             |   |
|  | }                                                          |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
|  ProposedChange:                                                  |
|  +-----------------------------------------------------------+   |
|  | {                                                          |   |
|  |   id: string                                               |   |
|  |   tool: string          // e.g., "parse_flight"           |   |
|  |   description: string   // Human-readable                  |   |
|  |   data: Record<string, unknown>  // Tool parameters        |   |
|  | }                                                          |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
|  ApplyResponse:                                                   |
|  +-----------------------------------------------------------+   |
|  | {                                                          |   |
|  |   success: boolean                                         |   |
|  |   message: string                                          |   |
|  |   appliedCount: number                                     |   |
|  |   results: Array<{                                         |   |
|  |     changeId: string                                       |   |
|  |     success: boolean                                       |   |
|  |     error?: string                                         |   |
|  |   }>                                                       |   |
|  |   warnings?: string[]                                      |   |
|  | }                                                          |   |
|  +-----------------------------------------------------------+   |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 7. Component Structure

### UI Components

```
+------------------------------------------------------------------+
|                   COMPONENT STRUCTURE                             |
+------------------------------------------------------------------+
|                                                                   |
|  src/components/                                                  |
|  |                                                                |
|  +-- ui/                        (Shadcn/ui base components)       |
|  |   +-- button, card, dialog, input, label, etc.                 |
|  |                                                                |
|  +-- itinerary/                 (Itinerary display)               |
|  |   +-- day-card.tsx           Day container with activities     |
|  |   +-- activity-card.tsx      Single activity display           |
|  |   +-- energy-badge.tsx       Activity intensity indicator      |
|  |                                                                |
|  +-- trip-view2/                (Trip view components)            |
|  |   +-- beach-sections-wrapper.tsx   Section containers          |
|  |   +-- booking-documents.tsx        Booking doc display         |
|  |   +-- document-upload-modal.tsx    Upload UI                   |
|  |   +-- documents-section.tsx        Document list               |
|  |   +-- trip-agent-chat.tsx          AI chat interface           |
|  |   +-- ... more components                                      |
|  |                                                                |
|  +-- app-header.tsx             (Global header)                   |
|                                                                   |
+------------------------------------------------------------------+
```

### Trip Agent Chat Component

```
+------------------------------------------------------------------+
|                 TRIP AGENT CHAT UI                                |
+------------------------------------------------------------------+
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  Floating Action Button (Bottom Right)                     |  |
|  |  +-- Sparkle icon                                          |  |
|  |  +-- Shows only for trip owner                             |  |
|  |  +-- Opens chat panel on click                             |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  +------------------------------------------------------------+  |
|  |  Chat Panel (Slide-in from right)                          |  |
|  |  +-------------------------------------------------------+ |  |
|  |  | Header: "AI Assistant" + Close button                  | |  |
|  |  +-------------------------------------------------------+ |  |
|  |  | Message Area:                                          | |  |
|  |  | +-- User messages (right aligned)                      | |  |
|  |  | +-- AI messages (left aligned)                         | |  |
|  |  | +-- Proposed changes (expandable cards)                | |  |
|  |  | +-- Applied confirmations                              | |  |
|  |  +-------------------------------------------------------+ |  |
|  |  | Input Area:                                            | |  |
|  |  | +-- Text input                                         | |  |
|  |  | +-- File upload button                                 | |  |
|  |  | +-- Send button                                        | |  |
|  |  +-------------------------------------------------------+ |  |
|  +------------------------------------------------------------+  |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 8. User Workflows

### Workflow 1: Create Trip

```
+------------------------------------------------------------------+
|                   CREATE TRIP WORKFLOW                           |
+------------------------------------------------------------------+
|                                                                  |
|  START                                                           |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  User clicks "New Trip"                                  |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Enter trip name                                         |    |
|  |  e.g., "Thailand Adventure 2026"                         |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Enter destination(s)                                    |    |
|  |  e.g., "Phuket, Thailand"                                |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Enter travel dates                                      |    |
|  |  Start: Feb 15, 2026  End: Feb 22, 2026                  |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Add travelers                                           |    |
|  |  +-- Self (30, vegetarian)                               |    |
|  |  +-- Spouse (28)                                         |    |
|  |  +-- Child (2, needs stroller)                           |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  TRIP CREATED                                            |    |
|  |  --> Redirect to trip dashboard                          |    |
|  |  --> Empty itinerary days generated                      |    |
|  +----------------------------------------------------------+    |
|                                                                  |
|  END                                                             |
|                                                                  |
+------------------------------------------------------------------+
```

### Workflow 2: Add Booking via AI

```
+------------------------------------------------------------------+
|                ADD BOOKING VIA AI WORKFLOW                       |
+------------------------------------------------------------------+
|                                                                  |
|  START: User has flight confirmation PDF                         |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Click AI button (sparkle icon)                          |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Chat panel opens                                        |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Click upload icon, select PDF                           |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI processes document (GPT-4o vision)                   |    |
|  |  +-- Extracts flight number                              |    |
|  |  +-- Extracts departure/arrival times                    |    |
|  |  +-- Extracts airports                                   |    |
|  |  +-- Extracts PNR/confirmation                           |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI shows proposed changes:                              |    |
|  |                                                          |    |
|  |  "I found your flight booking:                           |    |
|  |                                                          |    |
|  |  Air India AI 938                                        |    |
|  |  Hyderabad --> Phuket                                    |    |
|  |  Feb 15, 2026 | 06:10 - 11:40                            |    |
|  |  PNR: ABC123"                                            |    |
|  |                                                          |    |
|  |  [Apply Changes] [Discard]                               |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  User clicks "Apply Changes"                             |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  System applies changes:                                 |    |
|  |  +-- Creates booking record                              |    |
|  |  +-- Links uploaded document                             |    |
|  |  +-- Auto-generates todos:                               |    |
|  |      +-- "Confirm AI 938 booking"                        |    |
|  |      +-- "Complete online check-in"                      |    |
|  |      +-- "Save boarding pass"                            |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  SUCCESS: Booking added to trip                          |    |
|  |  --> Hero stats updated                                  |    |
|  |  --> Booking visible in Bookings tab                     |    |
|  +----------------------------------------------------------+    |
|                                                                  |
|  END                                                             |
|                                                                  |
+------------------------------------------------------------------+
```

### Workflow 3: Paste Itinerary Text

```
+------------------------------------------------------------------+
|              PASTE ITINERARY TEXT WORKFLOW                       |
+------------------------------------------------------------------+
|                                                                  |
|  START: User has itinerary from ChatGPT/travel agent             |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Open AI chat panel                                      |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Paste itinerary text:                                   |    |
|  |                                                          |    |
|  |  "Day 1 - Arrival                                        |    |
|  |   Morning: Flight lands at 11:40am                       |    |
|  |   Afternoon: Check in to Marriott                        |    |
|  |   Evening: Dinner at local restaurant                    |    |
|  |                                                          |    |
|  |   Day 2 - Explore                                        |    |
|  |   9am: Visit Grand Palace                                |    |
|  |   12pm: Lunch                                            |    |
|  |   3pm: River cruise                                      |    |
|  |                                                          |    |
|  |   Packing: sunscreen, hat, comfortable shoes             |    |
|  |   Phrases: Hello = Sawadee, Thank you = Khob khun"       |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI processes (MULTI-EXTRACTION):                        |    |
|  |                                                          |    |
|  |  Step 1: Extract itinerary days                          |    |
|  |  +-- Day 1 with 3 activities                             |    |
|  |  +-- Day 2 with 3 activities                             |    |
|  |                                                          |    |
|  |  Step 2: Extract + enhance packing items                 |    |
|  |  +-- User items: sunscreen, hat, shoes                   |    |
|  |  +-- AI adds: passport, charger, medication              |    |
|  |                                                          |    |
|  |  Step 3: Extract + enhance phrases                       |    |
|  |  +-- User phrases: Hello, Thank you                      |    |
|  |  +-- AI adds: Excuse me, How much?, Where is...          |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI shows proposed changes:                              |    |
|  |                                                          |    |
|  |  ITINERARY:                                              |    |
|  |  +-- 2 days, 6 activities                                |    |
|  |                                                          |    |
|  |  PACKING (8 items):                                      |    |
|  |  +-- sunscreen, hat, comfortable shoes...                |    |
|  |                                                          |    |
|  |  PHRASES (8 phrases):                                    |    |
|  |  +-- Hello = Sawadee (sa-wa-dee)...                      |    |
|  |                                                          |    |
|  |  [Apply All] [Apply Itinerary Only] [Discard]            |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  User clicks "Apply All"                                 |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  System applies all changes:                             |    |
|  |  +-- Creates/updates itinerary days                      |    |
|  |  +-- Creates activities with times                       |    |
|  |  +-- Creates packing items                               |    |
|  |  +-- Creates phrases                                     |    |
|  |  +-- Smart-links activities to bookings (if matched)     |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  SUCCESS: Trip populated with structured data            |    |
|  +----------------------------------------------------------+    |
|                                                                  |
|  END                                                             |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 9. AI Agent Workflows

### Workflow: Document Parsing

```
+------------------------------------------------------------------+
|               DOCUMENT PARSING WORKFLOW                          |
+------------------------------------------------------------------+
|                                                                  |
|  INPUT: PDF/Image file (base64)                                  |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Detect file type                                        |    |
|  |  +-- PDF: Extract text using unpdf library               |    |
|  |  +-- Image: Use GPT-4o vision directly                   |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Build system prompt with trip context:                  |    |
|  |  +-- Trip name, dates, destinations                      |    |
|  |  +-- Existing travelers                                  |    |
|  |  +-- Current bookings (to avoid duplicates)              |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Send to OpenRouter (GPT-4o)                             |    |
|  |  +-- System prompt + document content                    |    |
|  |  +-- Available tools: parse_flight, parse_hotel,         |    |
|  |                       parse_activity                     |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI returns tool call:                                   |    |
|  |  {                                                       |    |
|  |    tool: "parse_flight",                                 |    |
|  |    data: {                                               |    |
|  |      airline: "Air India",                               |    |
|  |      flight_number: "AI 938",                            |    |
|  |      departure: { ... },                                 |    |
|  |      arrival: { ... },                                   |    |
|  |      pnr: "ABC123"                                       |    |
|  |    }                                                     |    |
|  |  }                                                       |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Return ProposedChanges to user                          |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  On Apply:                                               |    |
|  |  +-- Create booking in database                          |    |
|  |  +-- Upload document to storage                          |    |
|  |  +-- Link document to booking                            |    |
|  |  +-- Generate auto-todos                                 |    |
|  |  +-- Check for conflicts (dates, locations)              |    |
|  +----------------------------------------------------------+    |
|                                                                  |
|  OUTPUT: Booking created with linked document and todos          |
|                                                                  |
+------------------------------------------------------------------+
```

### Workflow: Edit Itinerary

```
+------------------------------------------------------------------+
|               EDIT ITINERARY WORKFLOW                            |
+------------------------------------------------------------------+
|                                                                  |
|  INPUT: Natural language command                                 |
|         e.g., "Move dinner to 8pm and add spa at 3pm"            |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Load full trip context:                                 |    |
|  |  +-- All days with UUIDs                                 |    |
|  |  +-- All activities with UUIDs                           |    |
|  |  +-- All bookings with UUIDs                             |    |
|  |  +-- Conversation history (if any)                       |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Build edit prompt:                                      |    |
|  |  +-- CRITICAL: Use UUIDs not dates for day IDs           |    |
|  |  +-- Include available tools and parameters              |    |
|  |  +-- Provide full context for disambiguation             |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Send to OpenRouter (GPT-4o)                             |    |
|  |  +-- Available tools:                                    |    |
|  |      add_day, update_day, delete_day                     |    |
|  |      add_activity, update_activity, delete_activity      |    |
|  |      move_activity                                       |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI returns multiple tool calls:                         |    |
|  |  [                                                       |    |
|  |    { tool: "update_activity",                            |    |
|  |      data: { activity_id: "uuid1", end_time: "20:00" }}, |    |
|  |    { tool: "add_activity",                               |    |
|  |      data: { day_id: "uuid2", title: "Spa",              |    |
|  |              start_time: "15:00" }}                      |    |
|  |  ]                                                       |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Return ProposedChanges to user for review               |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  On Apply:                                               |    |
|  |  +-- Execute each tool call in sequence                  |    |
|  |  +-- Smart-link new activities to bookings               |    |
|  |  +-- Return success/failure for each change              |    |
|  +----------------------------------------------------------+    |
|                                                                  |
|  OUTPUT: Itinerary updated with all changes applied              |
|                                                                  |
+------------------------------------------------------------------+
```

### Workflow: Generate Packing List

```
+------------------------------------------------------------------+
|            GENERATE PACKING LIST WORKFLOW                        |
+------------------------------------------------------------------+
|                                                                  |
|  INPUT: User requests packing list                               |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Gather trip context:                                    |    |
|  |  +-- Destination(s): Phuket, Thailand                    |    |
|  |  +-- Duration: 7 days                                    |    |
|  |  +-- Dates: Feb 15-22 (dry season, hot)                  |    |
|  |  +-- Travelers:                                          |    |
|  |      +-- Adult (30, vegetarian)                          |    |
|  |      +-- Adult (28)                                      |    |
|  |      +-- Toddler (2)                                     |    |
|  |  +-- Activities in itinerary: beach, temple, spa         |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  AI generates context-aware packing list:                |    |
|  |                                                          |    |
|  |  ESSENTIALS:                                             |    |
|  |  +-- Passport, visa docs                                 |    |
|  |  +-- Travel insurance docs                               |    |
|  |  +-- Phone charger                                       |    |
|  |                                                          |    |
|  |  CLOTHING (Hot weather, 7 days):                         |    |
|  |  +-- Light cotton clothes                                |    |
|  |  +-- Swimwear                                            |    |
|  |  +-- Cover-up for temples (shoulders/knees)              |    |
|  |                                                          |    |
|  |  BABY ITEMS (Toddler present):                           |    |
|  |  +-- Diapers                                             |    |
|  |  +-- Baby sunscreen                                      |    |
|  |  +-- Stroller                                            |    |
|  |  +-- Snacks                                              |    |
|  |                                                          |    |
|  |  HEALTH:                                                 |    |
|  |  +-- Sunscreen SPF 50+                                   |    |
|  |  +-- Insect repellent                                    |    |
|  |  +-- Basic medications                                   |    |
|  |                                                          |    |
|  |  Total: 25-35 items                                      |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  Return ProposedChanges                                  |    |
|  +----------------------------------------------------------+    |
|    |                                                             |
|    v                                                             |
|  +----------------------------------------------------------+    |
|  |  On Apply:                                               |    |
|  |  +-- Create packing items in database                    |    |
|  |  +-- Each item unchecked by default                      |    |
|  +----------------------------------------------------------+    |
|                                                                  |
|  OUTPUT: Packing list created with categorized items             |
|                                                                  |
+------------------------------------------------------------------+
```

---

## 10. Technology Stack

### Stack Summary

```
+------------------------------------------------------------------+
|                    TECHNOLOGY STACK                              |
+------------------------------------------------------------------+
|                                                                  |
|  FRONTEND:                                                       |
|  +-------------------------------------------------------------+ |
|  | Technology        | Version  | Purpose                      | |
|  +-------------------------------------------------------------+ |
|  | Next.js           | 16.1.2   | React framework (App Router) | |
|  | React             | 19.2.3   | UI library                   | |
|  | TypeScript        | 5.x      | Type safety                  | |
|  | Tailwind CSS      | 4.x      | Styling                      | |
|  | Shadcn/ui         | -        | UI components                | |
|  | Zustand           | 5.x      | State management             | |
|  | React Hook Form   | 7.x      | Form handling                | |
|  | Zod               | 4.x      | Validation                   | |
|  | Dexie.js          | 4.x      | IndexedDB (offline)          | |
|  | date-fns          | 4.x      | Date utilities               | |
|  | Lucide React      | 0.56x    | Icons                        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  BACKEND:                                                        |
|  +-------------------------------------------------------------+ |
|  | Technology        | Version  | Purpose                      | |
|  +-------------------------------------------------------------+ |
|  | Next.js API       | 16.1.2   | Serverless API routes        | |
|  | Supabase          | 2.90     | PostgreSQL + Auth + Storage  | |
|  | OpenAI SDK        | 6.x      | AI client (OpenRouter)       | |
|  | unpdf             | 1.x      | PDF text extraction          | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  AI:                                                             |
|  +-------------------------------------------------------------+ |
|  | Technology        | Via      | Purpose                      | |
|  +-------------------------------------------------------------+ |
|  | GPT-4o            | OpenRouter| Primary AI model (vision)   | |
|  | Tool Calling      | OpenAI SDK| Structured outputs          | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  INFRASTRUCTURE:                                                 |
|  +-------------------------------------------------------------+ |
|  | Technology        | Purpose                                 | |
|  +-------------------------------------------------------------+ |
|  | Vercel            | Hosting (Next.js optimized)             | |
|  | Supabase          | Database, Auth, Storage, Realtime       | |
|  | Playwright        | E2E testing                             | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### Environment Variables

```
+-------------------------------------------------------------------+
|                 ENVIRONMENT VARIABLES                             |
+-------------------------------------------------------------------+
|                                                                   |
|  # Supabase                                                       |
|  NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co                 |
|  NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx                             |
|  SUPABASE_SERVICE_ROLE_KEY=eyJxxx                                 |
|                                                                   |
|  # AI (OpenRouter)                                                |
|  OPENROUTER_API_KEY=sk-or-v1-xxx                                  |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## 11. Implementation Status

### Phase Overview

```
+---------------------------------------------------------------=---+
|                 IMPLEMENTATION STATUS                             |
+-------------------------------------------------------------------+
|                                                                   |
|  PHASE 1: Core Infrastructure                     [COMPLETE]      |
|  +-------------------------------------------------------------+ |
|  | +-- Agent types and interfaces                              | |
|  | +-- OpenRouter client setup                                 | |
|  | +-- Tool definitions (10 tools)                             | |
|  | +-- System prompts                                          | |
|  | +-- Agent API endpoint                                      | |
|  | +-- Apply API endpoint                                      | |
|  | +-- Chat UI component                                       | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  PHASE 2: Testing & Validation                    [COMPLETE]     |
|  +-------------------------------------------------------------+ |
|  | +-- Playwright test suite (7 tests)                         | |
|  | +-- AI button visibility tests                              | |
|  | +-- Chat panel tests                                        | |
|  | +-- Itinerary parsing tests                                 | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  PHASE 3: Smart Linking                           [PARTIAL]      |
|  +-------------------------------------------------------------+ |
|  | +-- Auto-link activities to bookings          [DONE]        | |
|  | +-- Flight matching logic                     [DONE]        | |
|  | +-- Hotel matching logic                      [DONE]        | |
|  | +-- Document to booking linking               [TODO]        | |
|  | +-- Duplicate detection                       [TODO]        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  PHASE 4: Auto-Generated Data                     [COMPLETE]     |
|  +-------------------------------------------------------------+ |
|  | +-- Auto-generate todos for flights           [DONE]        | |
|  | +-- Auto-generate todos for hotels            [DONE]        | |
|  | +-- Auto-todos module                         [DONE]        | |
|  +-------------------------------------------------------------+ |
|                                                                  |
|  PHASE 5: Enhanced Context Awareness              [TODO]         |
|  PHASE 6: Cascade Operations                      [TODO]         |
|  PHASE 7: Advanced Features                       [TODO]         |
|                                                                  |
+------------------------------------------------------------------+
```

### Tools Implementation Status

```
+-------------------------------------------------------------------+
|                    TOOLS STATUS                                   |
+-------------------------------------------------------------------+
|                                                                   |
|  Tool Name              | Status    | Notes                       |
|  -----------------------|-----------|-----------------------------+
|  parse_flight           | DONE      | Extracts flight from doc    |
|  parse_hotel            | DONE      | Extracts hotel from doc     |
|  parse_activity         | DONE      | Extracts activity from doc  |
|  parse_itinerary_text   | DONE      | Multi-extraction enabled    |
|  add_day                | DONE      | Creates new day             |
|  update_day             | DONE      | Modifies day                |
|  delete_day             | DONE      | Removes day                 |
|  add_activity           | DONE      | With smart linking          |
|  update_activity        | DONE      | Modifies activity           |
|  delete_activity        | DONE      | Removes activity            |
|  move_activity          | DONE      | Between days                |
|  generate_packing_list  | DONE      | Context-aware               |
|  generate_phrases       | DONE      | Romanized output            |
|  delete_booking         | DONE      | Single booking              |
|  delete_all_bookings    | DONE      | Batch delete                |
|  delete_todo            | DONE      | Single todo                 |
|  delete_all_todos       | DONE      | Batch delete                |
|  delete_all_packing     | DONE      | Clear packing list          |
|  delete_all_phrases     | DONE      | Clear phrases               |
|  update_trip_dates      | DONE      | Auto-recalculates           |
|  update_travelers       | DONE      | Traveler info               |
|  update_trip_metadata   | DONE      | Destination info            |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## 12. File Structure Reference

### Complete File Tree

```
+-------------------------------------------------------------------+
|                    FILE STRUCTURE                                 |
+-------------------------------------------------------------------+
|                                                                   |
|  itinerary-viewer/                                                |
|  |                                                                |
|  +-- src/                                                         |
|  |   +-- app/                                                     |
|  |   |   +-- (app)/                     # Authenticated routes    |
|  |   |   |   +-- layout.tsx                                       |
|  |   |   |   +-- trips/                                           |
|  |   |   |       +-- page.tsx           # Trip listing            |
|  |   |   |       +-- new/page.tsx       # Create trip             |
|  |   |   |       +-- [slug]/                                      |
|  |   |   |           +-- page.tsx       # Trip dashboard          |
|  |   |   |           +-- itinerary/page.tsx                       |
|  |   |   |           +-- bookings/page.tsx                        |
|  |   |   |           +-- expenses/page.tsx                        |
|  |   |   |           +-- extras/page.tsx                          |
|  |   |   |                                                        |
|  |   |   +-- (auth)/                    # Auth routes             |
|  |   |   |   +-- login/page.tsx                                   |
|  |   |   |   +-- callback/page.tsx                                |
|  |   |   |                                                        |
|  |   |   +-- api/                       # API routes              |
|  |   |   |   +-- auth/callback/route.ts                           |
|  |   |   |   +-- trip-id/route.ts                                 |
|  |   |   |   +-- trips/                                           |
|  |   |   |       +-- [tripId]/                                    |
|  |   |   |           +-- route.ts                                 |
|  |   |   |           +-- agent/                                   |
|  |   |   |           |   +-- route.ts   # AI processing           |
|  |   |   |           |   +-- apply/route.ts # Apply changes       |
|  |   |   |           +-- bookings/route.ts                        |
|  |   |   |           +-- documents/route.ts                       |
|  |   |   |           +-- todos/route.ts                           |
|  |   |   |           +-- travelers/route.ts                       |
|  |   |   |           +-- stats/route.ts                           |
|  |   |   |           +-- generate-content/route.ts                |
|  |   |   |                                                        |
|  |   |   +-- share/[slug]/page.tsx      # Public viewer           |
|  |   |   +-- privacy/page.tsx                                     |
|  |   |   +-- terms/page.tsx                                       |
|  |   |   +-- layout.tsx                 # Root layout             |
|  |   |   +-- page.tsx                   # Landing                 |
|  |   |   +-- globals.css                                          |
|  |   |                                                            |
|  |   +-- components/                                              |
|  |   |   +-- ui/                        # Shadcn components       |
|  |   |   +-- itinerary/                                           |
|  |   |   |   +-- day-card.tsx                                     |
|  |   |   |   +-- activity-card.tsx                                |
|  |   |   |   +-- energy-badge.tsx                                 |
|  |   |   +-- trip-view2/                                          |
|  |   |   |   +-- trip-agent-chat.tsx    # AI chat UI              |
|  |   |   |   +-- ... (other components)                           |
|  |   |   +-- app-header.tsx                                       |
|  |   |                                                            |
|  |   +-- lib/                                                     |
|  |       +-- agent/                     # AI agent core           |
|  |       |   +-- types.ts               # Type definitions        |
|  |       |   +-- client.ts              # OpenRouter client       |
|  |       |   +-- tools.ts               # Tool definitions        |
|  |       |   +-- prompts.ts             # System prompts          |
|  |       |   +-- auto-todos.ts          # Auto-todo generation    |
|  |       |   +-- smart-linking.ts       # Booking linking         |
|  |       +-- supabase/                  # Supabase clients        |
|  |       +-- utils/                     # Utilities               |
|  |                                                                |
|  +-- docs/                              # Documentation           |
|  |   +-- 00-product-overview.md                                   |
|  |   +-- 01-jobs-to-be-done.md                                    |
|  |   +-- 02-feature-specification.md                              |
|  |   +-- ... (more docs)                                          |
|  |   +-- AGENT_ROADMAP.md               # Implementation tracker  |
|  |   +-- agent-test-cases.md                                      |
|  |                                                                |
|  +-- scripts/                           # Utility scripts         |
|  +-- public/                            # Static assets           |
|  +-- .env.local                         # Environment vars        |
|  +-- package.json                                                 |
|  +-- CLAUDE.md                          # AI assistant guide      |
|  +-- AGENT_ARCHITECTURE.md              # Agent tech details      |
|  +-- PROJECT_DOCUMENTATION.md           # This file               |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## Document History

| Version | Date       | Author | Changes               |
| ------- | ---------- | ------ | --------------------- |
| 1.0     | 2026-02-04 | Claude | Initial documentation |

---

**End of Document**

_This documentation covers the GoVault application as a trip documentation platform (not trip planning). The AI agent assists users in organizing, structuring, and enhancing their already-booked trips._
