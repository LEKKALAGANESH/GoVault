# GoVault AI Agent Architecture

This document describes how the AI agent works in the GoVault application.

## Overview

The GoVault AI Agent is a multi-purpose assistant that helps users manage trip planning through:

- Document parsing (flight confirmations, hotel vouchers, activity tickets)
- Itinerary structuring from unstructured text
- Intelligent content generation (packing lists, local phrases, todos)
- Natural language editing of trip data

It uses **OpenRouter with GPT-4o** as the AI backbone and integrates with **Supabase** for data persistence.

---

## Architecture

### Core Components

| Component     | Location                                        | Purpose                              |
| ------------- | ----------------------------------------------- | ------------------------------------ |
| Agent Library | `src/lib/agent/`                                | Types, prompts, tools, client config |
| API Routes    | `src/app/api/trips/[tripId]/agent/`             | Processing and applying changes      |
| UI Component  | `src/components/trip-view2/trip-agent-chat.tsx` | Chat interface                       |

### Processing Flow

```
User Input (document/text/command)
    ↓
[Agent Request] → POST /api/trips/[tripId]/agent
    ↓
[Validate] → Check auth & trip ownership
    ↓
[Determine Action] → Route to handler based on action type
    ↓
[Build Context] → Fetch trip data, travelers, current itinerary
    ↓
[AI Processing] → Call OpenRouter with prompts & tools
    ↓
[Parse Response] → Extract tool calls from AI response
    ↓
[Proposed Changes] → Return to user for review
    ↓
[User Confirms] → POST /api/trips/[tripId]/agent/apply
    ↓
[Apply Changes] → Execute database operations
    ↓
[Return Results] → Notify user of applied changes
```

---

## Supported Actions

### 1. PARSE_DOCUMENT

- **Input**: PDF or image file (base64 encoded)
- **Process**: Vision model for images, text extraction for PDFs
- **Output**: Flight, hotel, or activity booking data
- **Post-apply**: Creates booking record + linked document + auto-generated todos

### 2. PARSE_ITINERARY

- **Input**: Unstructured text (pasted itinerary)
- **Process**: Multi-step extraction
  1. Extract day-by-day itinerary
  2. Extract + enhance packing list
  3. Extract + enhance local phrases
- **Output**: Structured days/activities + packing items + phrases
- **Features**: Deduplication, smart enhancement of user content

### 3. EDIT_ITINERARY

- **Input**: Natural language instruction + conversation history
- **Process**: AI with full trip context (all days, activities, bookings with UUIDs)
- **Output**: Tool calls for add/update/delete/move operations
- **Features**: Multi-turn conversation support

### 4. GENERATE_PACKING

- **Input**: Trip context (destination, duration, travelers)
- **Process**: AI generates destination-specific checklist
- **Output**: 20-35 items with categories
- **Considers**: Baby/kid/senior travelers, weather, activities

### 5. GENERATE_PHRASES

- **Input**: Trip destination
- **Process**: Auto-detect language, generate useful phrases
- **Output**: Romanized phrases with phonetic pronunciation
- **Note**: No native scripts, only romanized text

### 6. GENERATE_TODOS

- **Input**: Current itinerary analysis
- **Process**: AI identifies bookable items and preparation tasks
- **Output**: Prioritized todo list by category

### 7. GENERATE_ITINERARY_PROMPT

- **Input**: Optional preferences
- **Process**: Template generation (not AI-driven)
- **Output**: Copy-paste prompt for ChatGPT/Claude

### 8. CAPTURE_TRIP_INFO

- **Input**: Conversation text
- **Process**: Extract trip details
- **Output**: Travelers, destinations, dates

---

## Tools

The agent has access to **25+ structured tools**:

### Document Parsing

- `parse_flight` - Extract flight details
- `parse_hotel` - Extract hotel details
- `parse_activity` - Extract activity/tour details

### Itinerary Management

- `parse_itinerary_text` - Parse days and activities from text
- `add_day` / `update_day` / `delete_day`
- `add_activity` / `update_activity` / `delete_activity`
- `move_activity` - Move activity to different day

### Booking Management

- `delete_booking` - Delete single booking
- `delete_all_bookings` - Delete all bookings (optionally by type)

### Todo Management

- `delete_todo` / `delete_all_todos`

### Content Generation

- `generate_packing_list` - Generate packing items
- `generate_phrases` - Generate language phrases
- `delete_all_packing` / `delete_all_phrases`

### Trip Metadata

- `update_trip_dates` - Change dates + auto-recalculate day dates
- `update_travelers` - Update traveler information
- `update_trip_metadata` - Update destination info

---

## System Prompts

Each action type uses a specialized prompt with trip context:

### Document Parsing (`DOCUMENT_PARSE_PROMPT`)

- Instructions for extracting flight/hotel/activity data
- Trip context for validation (destination, dates, travelers)
- Enforces ISO 8601 date format, no timezone conversions

### Itinerary Parsing (`ITINERARY_PARSE_PROMPT`)

- Time conversion rules (vague times → HH:MM)
- Emphasis on extracting ALL content types
- Guidance on identifying bookable activities

### Editing (`getEditPrompt`)

- Full trip context with UUIDs for all entities
- Available tools and parameters
- Critical: Use UUIDs not dates for day IDs

### Packing/Phrases

- Destination-aware context
- Traveler type considerations
- Format requirements (romanized text for phrases)

---

## Smart Features

### 1. Smart Linking

When adding activities, the system automatically links them to matching bookings:

- **Flight keywords** → Match by flight number, airport code, airline
- **Hotel keywords** → Match by hotel name

### 2. Auto-Generated Todos

- **Flights**: Check-in reminder, boarding pass, confirmation
- **Hotels**: Confirmation, save details, check-in time
- **Activities**: Booking reminders for bookable items

### 3. Conflict Detection

- **Date conflicts**: Bookings outside trip dates
- **Location conflicts**: Bookings to different destinations
- Generates suggestions to resolve conflicts

### 4. Error Recovery

- **Date-as-ID correction**: If AI uses a date instead of UUID, queries DB for correct ID
- **PDF fallback**: Uses text extraction if vision model fails

### 5. Multi-Extraction

For PARSE_ITINERARY, extracts three content types in sequence:

1. Itinerary days/activities (primary)
2. Packing list items (enhanced with AI suggestions)
3. Local phrases (enhanced with AI suggestions)

---

## Key Files

| File                                                                 | Purpose                                                  |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| [types.ts](src/lib/agent/types.ts)                                   | Type definitions for actions, tools, requests, responses |
| [prompts.ts](src/lib/agent/prompts.ts)                               | System prompts for each action type                      |
| [tools.ts](src/lib/agent/tools.ts)                                   | Tool definitions (JSON Schema format)                    |
| [auto-todos.ts](src/lib/agent/auto-todos.ts)                         | Auto-generated todo logic                                |
| [route.ts](src/app/api/trips/[tripId]/agent/route.ts)                | Main agent endpoint                                      |
| [apply/route.ts](src/app/api/trips/[tripId]/agent/apply/route.ts)    | Apply changes endpoint                                   |
| [trip-agent-chat.tsx](src/components/trip-view2/trip-agent-chat.tsx) | Chat UI component                                        |

---

## Data Flow Diagram

```
┌─────────────────────────────────────────┐
│   UI Layer (trip-agent-chat.tsx)        │
│  - Chat interface                       │
│  - File upload                          │
│  - Message history (SessionStorage)     │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   POST /api/trips/[tripId]/agent        │
├─────────────────────────────────────────┤
│  1. Authenticate & verify ownership     │
│  2. Fetch context (trip, travelers)     │
│  3. Select tools for action type        │
│  4. Build system prompt                 │
│  5. Call OpenRouter API                 │
│  6. Parse tool calls from response      │
│  7. Return ProposedChanges              │
└──────────────┬──────────────────────────┘
               │
               ↓
          ┌────────────┐
          │ User Review│
          │ & Confirm  │
          └────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   POST /api/trips/[tripId]/agent/apply  │
├─────────────────────────────────────────┤
│  For each ProposedChange:               │
│  - Execute database operation           │
│  - Smart link to bookings               │
│  - Auto-generate todos                  │
│  - Handle document uploads              │
│  - Check for conflicts                  │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│   Supabase Database                     │
│  - trips, itinerary_days, activities    │
│  - bookings, packing_items, phrases     │
│  - trip_todos, documents, travelers     │
└─────────────────────────────────────────┘
```

---

## Response Types

### AgentResponse (from /agent)

```typescript
{
  success: boolean
  message: string
  proposedChanges: ProposedChange[]
  suggestions?: AgentSuggestion[]
  detectedLocations?: string[]
}
```

### ProposedChange

```typescript
{
  id: string;
  tool: string; // e.g., "parse_flight", "add_activity"
  description: string; // Human-readable
  data: Record<string, unknown>; // Tool parameters
}
```

### ApplyResponse (from /agent/apply)

```typescript
{
  success: boolean
  message: string
  appliedCount: number
  results: Array<{ changeId: string, success: boolean, error?: string }>
  warnings?: string[]
}
```

---

## Technical Details

- **AI Model**: OpenRouter → GPT-4o (vision-capable)
- **PDF Processing**: `unpdf` library (Next.js compatible)
- **Date Format**: ISO 8601, no timezone conversions
- **Conversation State**: SessionStorage in browser
- **Logging**: Structured JSON logs for monitoring
