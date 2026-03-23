# AI Agent Architecture Improvement Proposal

> **Document Purpose**: Technical analysis of current AI agent architecture with proposed improvements for maintainability, reliability, and extensibility.

---

## Executive Summary

The current AI agent implementation is **functional but has grown organically** into a monolithic structure that will become increasingly difficult to maintain and extend. This document identifies 12 key architectural issues and proposes improvements organized into 4 implementation phases.

**Key Statistics (Current State):**

- `agent/route.ts`: **1,389 lines** (monolithic handler)
- `apply/route.ts`: **1,062 lines** (monolithic handler)
- `trip-agent-chat.tsx`: **881 lines** (UI with business logic)
- Tool count: **25+ tools** (no grouping)
- Action types: **8 distinct actions** (all in one switch)

---

## Table of Contents

1. [Current Architecture Analysis](#1-current-architecture-analysis)
2. [Identified Issues](#2-identified-issues)
3. [Proposed Architecture](#3-proposed-architecture)
4. [Implementation Phases](#4-implementation-phases)
5. [Detailed Improvements](#5-detailed-improvements)
6. [Migration Strategy](#6-migration-strategy)

---

## 1. Current Architecture Analysis

### Current Flow Diagram

```
+------------------------------------------------------------------+
|                    CURRENT ARCHITECTURE                          |
+------------------------------------------------------------------+
|                                                                  |
|  trip-agent-chat.tsx (881 lines)                                 |
|  +-------------------------------------------------------------+ |
|  |  - Action type detection (regex in UI)                      | |
|  |  - Message state management                                 | |
|  |  - File upload handling                                     | |
|  |  - Apply changes logic                                      | |
|  |  - Suggestion handling                                      | |
|  +-------------------------------------------------------------+ |
|                              |                                   |
|                              v                                   |
|  POST /api/trips/[tripId]/agent (1389 lines)                     |
|  +-------------------------------------------------------------+ |
|  |  - Auth check (inline)                                      | |
|  |  - Trip ownership check (inline)                            | |
|  |  - Switch statement for 8 action types                      | |
|  |  - Context building (inline, repeated)                      | |
|  |  - Prompt building (inline)                                 | |
|  |  - AI call (single, no retry)                               | |
|  |  - Response parsing (inline)                                | |
|  |  - Suggestion generation (inline)                           | |
|  +-------------------------------------------------------------+ |
|                              |                                   |
|                              v                                   |
|  POST /api/trips/[tripId]/agent/apply (1062 lines)               |
|  +-------------------------------------------------------------+ |
|  |  - Auth check (duplicated)                                  | |
|  |  - Trip ownership check (duplicated)                        | |
|  |  - Switch statement for 25+ tools                           | |
|  |  - Database operations (inline)                             | |
|  |  - Smart linking (function call)                            | |
|  |  - Auto-todos (function call)                               | |
|  |  - Document upload (inline)                                 | |
|  +-------------------------------------------------------------+ |
|                                                                  |
+------------------------------------------------------------------+
```

### What Works Well

| Aspect               | Description                                         |
| -------------------- | --------------------------------------------------- |
| **Tool calling**     | Uses OpenAI function calling effectively            |
| **Smart linking**    | Auto-links activities to bookings                   |
| **Auto-todos**       | Generates todos for bookings                        |
| **Multi-extraction** | Single paste extracts itinerary + packing + phrases |
| **Validation**       | Checks for date/location conflicts                  |
| **Logging**          | Structured JSON logging for analytics               |

---

## 2. Identified Issues

### Issue #1: Monolithic Route Handlers

```
+-------------------------------------------------------------------+
|  PROBLEM: Giant switch statements                                 |
+-------------------------------------------------------------------+
|                                                                   |
|  agent/route.ts:                                                  |
|  switch (body.action) {                                           |
|    case "PARSE_DOCUMENT":      // ~70 lines                       |
|    case "PARSE_ITINERARY":     // ~350 lines (!!)                 |
|    case "EDIT_ITINERARY":      // ~25 lines                       |
|    case "GENERATE_PACKING":    // ~70 lines                       |
|    case "GENERATE_PHRASES":    // ~15 lines                       |
|    case "GENERATE_TODOS":      // ~170 lines                      |
|    case "GENERATE_ITINERARY_PROMPT": // ~50 lines                 |
|  }                                                                |
|                                                                   |
|  IMPACT:                                                          |
|  - Cannot test individual handlers                                |
|  - Cannot reuse handler logic                                     |
|  - Difficult to read and maintain                                 |
|  - No clear boundaries                                            |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #2: Action Detection in UI

```
+-------------------------------------------------------------------+
|  PROBLEM: Business logic in React component                       |
+-------------------------------------------------------------------+
|                                                                   |
|  trip-agent-chat.tsx (lines 141-194):                             |
|                                                                   |
|  // Regex patterns to detect action type                          |
|  const hasDayPattern = /day\s*[1-9]|day\s*one.../i.test(input);   |
|  const isLongText = input.length > 200;                           |
|  const isDeleteCommand = /\b(delete|remove|clear)\b/i.test(...);  |
|                                                                   |
|  if (isDeleteCommand) {                                           |
|    action = "EDIT_ITINERARY";                                     |
|  } else if (isLongText && hasDayPattern) {                        |
|    action = "PARSE_ITINERARY";                                    |
|  } ...                                                            |
|                                                                   |
|  IMPACT:                                                          |
|  - Logic duplicated if we add another client                      |
|  - Cannot test action detection in isolation                      |
|  - Fragile regex patterns                                         |
|  - UI knows too much about backend                                |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #3: No Error Recovery

```
+-------------------------------------------------------------------+
|  PROBLEM: Single AI call with no fallback                         |
+-------------------------------------------------------------------+
|                                                                   |
|  Current:                                                         |
|  +-- Make 1 AI call                                               |
|  +-- If fails -> return error to user                             |
|  +-- If succeeds -> return result                                 |
|                                                                   |
|  Missing:                                                         |
|  +-- Retry with backoff                                           |
|  +-- Fallback to simpler model                                    |
|  +-- Partial result recovery                                      |
|  +-- Graceful degradation                                         |
|                                                                   |
|  IMPACT:                                                          |
|  - Transient API failures fail the whole operation                |
|  - Rate limits cause user-facing errors                           |
|  - No way to recover from partial success                         |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #4: Context Rebuilt Every Request

```
+-------------------------------------------------------------------+
|  PROBLEM: No context caching                                      |
+-------------------------------------------------------------------+
|                                                                   |
|  Every request:                                                   |
|  1. Fetch trip data                                               |
|  2. Fetch travelers                                               |
|  3. Fetch bookings                                                |
|  4. Fetch itinerary days                                          |
|  5. Fetch activities                                              |
|  6. Fetch todos                                                   |
|  7. Fetch packing items                                           |
|  8. Fetch phrases                                                 |
|                                                                   |
|  = 8+ database queries per AI request                             |
|                                                                   |
|  IMPACT:                                                          |
|  - Slow response times                                            |
|  - Unnecessary database load                                      |
|  - Context could be stale between parallel requests               |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #5: Duplicated Auth/Validation

```
+-------------------------------------------------------------------+
|  PROBLEM: Same code in multiple files                             |
+-------------------------------------------------------------------+
|                                                                   |
|  agent/route.ts (lines 51-78):                                    |
|  const supabase = await createClient();                           |
|  const { data: { user } } = await supabase.auth.getUser();        |
|  if (!user) return NextResponse.json({ error: "Unauthorized" });  |
|  const { data: trip } = await supabase.from("trips")...           |
|  if (trip.owner_id !== user.id) return NextResponse.json({...});  |
|                                                                   |
|  agent/apply/route.ts (lines 152-179):                            |
|  const supabase = await createClient();                // SAME    |
|  const { data: { user } } = await supabase.auth.getUser(); // SAME|
|  if (!user) return NextResponse.json({ error: "Unauthorized" });  |
|  const { data: trip } = await supabase.from("trips")...   // SAME |
|  if (trip.owner_id !== user.id) return NextResponse.json({...});  |
|                                                                   |
|  IMPACT:                                                          |
|  - Bug fixes need to be applied in multiple places                |
|  - Easy to miss edge cases in one location                        |
|  - No single source of truth                                      |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #6: Inline Prompt Building

```
+-------------------------------------------------------------------+
|  PROBLEM: Prompts scattered across route handler                  |
+-------------------------------------------------------------------+
|                                                                   |
|  agent/route.ts contains inline prompts:                          |
|                                                                   |
|  - Line 207: Itinerary parser prompt (inline string)              |
|  - Line 269: Packing extraction prompt (inline string)            |
|  - Line 299: Packing suggestion prompt (inline string)            |
|  - Line 389: Phrases extraction prompt (inline string)            |
|  - Line 429: Phrases suggestion prompt (inline string)            |
|  - Line 685: Todo analysis prompt (inline, 60+ lines!)            |
|                                                                   |
|  While prompts.ts exists, many prompts are still inline.          |
|                                                                   |
|  IMPACT:                                                          |
|  - Hard to A/B test different prompts                             |
|  - Cannot version prompts                                         |
|  - Difficult to find and update all prompts                       |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #7: No Tool Grouping

```
+-------------------------------------------------------------------+
|  PROBLEM: 25+ tools in flat structure                             |
+-------------------------------------------------------------------+
|                                                                   |
|  tools.ts exports all tools in one array.                         |
|  getToolsForAction() filters by action, but:                      |
|                                                                   |
|  - No logical grouping (parsing, editing, generation)             |
|  - No capability hierarchy                                        |
|  - Hard to understand tool relationships                          |
|  - No tool composition                                            |
|                                                                   |
|  Current tool list:                                               |
|  parse_flight, parse_hotel, parse_activity,                       |
|  parse_itinerary_text, add_day, update_day, delete_day,           |
|  add_activity, update_activity, delete_activity, move_activity,   |
|  delete_booking, delete_all_bookings, delete_todo,                |
|  delete_all_todos, generate_packing_list, generate_phrases,       |
|  delete_all_packing, delete_all_phrases, update_trip_dates,       |
|  update_travelers, update_trip_metadata, ...                      |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #8: No Streaming Support

```
+-------------------------------------------------------------------+
|  PROBLEM: User waits for complete response                        |
+-------------------------------------------------------------------+
|                                                                   |
|  Current:                                                         |
|  User sends message --> Waits 3-10 seconds --> Gets full response |
|                                                                   |
|  Expected:                                                        |
|  User sends message --> Sees partial response streaming           |
|                                                                   |
|  IMPACT:                                                          |
|  - Poor perceived performance                                     |
|  - User doesn't know if request is processing                     |
|  - Long operations feel broken                                    |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #9: No Transaction Boundaries

```
+-------------------------------------------------------------------+
|  PROBLEM: Partial failures leave inconsistent state               |
+-------------------------------------------------------------------+
|                                                                   |
|  apply/route.ts processes changes sequentially:                   |
|                                                                   |
|  for (const change of body.changes) {                             |
|    const result = await applyChange(supabase, tripId, change);    |
|    applied.push(result);                                          |
|  }                                                                |
|                                                                   |
|  If change #3 of 5 fails:                                         |
|  - Changes 1-2 are committed                                      |
|  - Changes 3-5 are not                                            |
|  - No rollback mechanism                                          |
|                                                                   |
|  IMPACT:                                                          |
|  - Database in inconsistent state                                 |
|  - User sees partial results                                      |
|  - No way to retry failed changes                                 |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #10: Limited Conversation Memory

```
+-------------------------------------------------------------------+
|  PROBLEM: Only last 10 messages, no summarization                 |
+-------------------------------------------------------------------+
|                                                                   |
|  trip-agent-chat.tsx (lines 197-203):                             |
|                                                                   |
|  const conversationHistory = messages                             |
|    .filter(m => m.role === "user" || ...)                         |
|    .slice(-10)  // Hard limit of 10                               |
|    .map(m => ({ role: m.role, content: m.content }));             |
|                                                                   |
|  Missing:                                                         |
|  - Conversation summarization for long sessions                   |
|  - Important context preservation                                 |
|  - Token-aware truncation                                         |
|                                                                   |
|  IMPACT:                                                          |
|  - Context lost in long conversations                             |
|  - AI forgets earlier instructions                                |
|  - No long-term memory                                            |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #11: No Middleware/Pipeline

```
+-------------------------------------------------------------------+
|  PROBLEM: Cross-cutting concerns mixed with business logic        |
+-------------------------------------------------------------------+
|                                                                   |
|  agent/route.ts mixes:                                            |
|  - Logging (logAgentEvent calls throughout)                       |
|  - Authentication (inline checks)                                 |
|  - Validation (inline checks)                                     |
|  - Rate limiting (none!)                                          |
|  - Error handling (try/catch)                                     |
|  - Business logic                                                 |
|                                                                   |
|  Missing middleware for:                                          |
|  - Request validation                                             |
|  - Rate limiting                                                  |
|  - Cost tracking                                                  |
|  - Usage analytics                                                |
|  - A/B testing                                                    |
|                                                                   |
+-------------------------------------------------------------------+
```

### Issue #12: No Type-Safe Tool Execution

```
+-------------------------------------------------------------------+
|  PROBLEM: Tool arguments parsed at runtime                        |
+-------------------------------------------------------------------+
|                                                                   |
|  apply/route.ts:                                                  |
|                                                                   |
|  const { tool, data } = change;                                   |
|  switch (tool) {                                                  |
|    case "parse_flight":                                           |
|      // data is Record<string, unknown>                           |
|      // No compile-time type safety                               |
|      await supabase.from("bookings").insert({                     |
|        airline: data.airline,  // Could be undefined              |
|        flight_number: data.flight_number,  // Could be wrong type |
|      });                                                          |
|  }                                                                |
|                                                                   |
|  IMPACT:                                                          |
|  - Runtime errors from malformed AI responses                     |
|  - No TypeScript help for tool handlers                           |
|  - Easy to miss required fields                                   |
|                                                                   |
+-------------------------------------------------------------------+
```

---

## 3. Proposed Architecture

### Target Architecture Diagram

```
+-------------------------------------------------------------------+
|                    PROPOSED ARCHITECTURE                          |
+-------------------------------------------------------------------+
|                                                                   |
|  +-------------------------------------------------------------+  |
|  |  PRESENTATION LAYER                                         |  |
|  |  trip-agent-chat.tsx (~300 lines)                           |  |
|  |  +-- UI rendering only                                      |  |
|  |  +-- State management (messages, loading)                   |  |
|  |  +-- No business logic                                      |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  API LAYER (Thin)                                           |  |
|  |  POST /api/trips/[tripId]/agent (~50 lines)                 |  |
|  |  +-- Route definition only                                  |  |
|  |  +-- Calls AgentOrchestrator                                |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  MIDDLEWARE LAYER                                           |  |
|  |  +-- AuthMiddleware (shared)                                |  |
|  |  +-- RateLimitMiddleware (new)                              |  |
|  |  +-- ValidationMiddleware (new)                             |  |
|  |  +-- LoggingMiddleware (existing, extracted)                |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  ORCHESTRATION LAYER                                        |  |
|  |  AgentOrchestrator                                          |  |
|  |  +-- Route to appropriate handler                           |  |
|  |  +-- Manage context lifecycle                               |  |
|  |  +-- Coordinate multi-step operations                       |  |
|  |  +-- Handle retries and fallbacks                           |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|         +--------------------+--------------------+               |
|         |                    |                    |               |
|         v                    v                    v               |
|  +-------------+    +---------------+    +---------------+        |
|  | ACTION      |    | ACTION        |    | ACTION        |        |
|  | HANDLERS    |    | HANDLERS      |    | HANDLERS      |        |
|  +-------------+    +---------------+    +---------------+        |
|  | Document    |    | Itinerary     |    | Generation    |        |
|  | Handler     |    | Handler       |    | Handler       |        |
|  | - parse     |    | - parse       |    | - packing     |        |
|  | - validate  |    | - edit        |    | - phrases     |        |
|  +-------------+    | - multi-step  |    | - todos       |        |
|                     +---------------+    +---------------+        |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  AI CLIENT LAYER                                            |  |
|  |  AIClient (abstraction over OpenRouter)                     |  |
|  |  +-- Retry with exponential backoff                         |  |
|  |  +-- Model fallback (GPT-4o -> GPT-4-mini)                  |  |
|  |  +-- Streaming support                                      |  |
|  |  +-- Token tracking                                         |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  TOOL REGISTRY                                              |  |
|  |  +-- Parsing Tools (parse_flight, parse_hotel, etc.)        |  |
|  |  +-- Editing Tools (add_day, update_activity, etc.)         |  |
|  |  +-- Generation Tools (generate_packing, etc.)              |  |
|  |  +-- Management Tools (delete_*, update_trip_*)             |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  EXECUTION LAYER                                            |  |
|  |  ToolExecutor                                               |  |
|  |  +-- Type-safe tool execution                               |  |
|  |  +-- Transaction management                                 |  |
|  |  +-- Rollback support                                       |  |
|  +-------------------------------------------------------------+  |
|                              |                                    |
|                              v                                    |
|  +-------------------------------------------------------------+  |
|  |  DATA LAYER                                                 |  |
|  |  +-- TripRepository (all trip data access)                  |  |
|  |  +-- ContextCache (trip context caching)                    |  |
|  +-------------------------------------------------------------+  |
|                                                                   |
+-------------------------------------------------------------------+
```

### Key Principles

| Principle                 | Description                          |
| ------------------------- | ------------------------------------ |
| **Single Responsibility** | Each module has one reason to change |
| **Dependency Injection**  | Dependencies passed in, not imported |
| **Thin API Layer**        | Routes delegate to orchestrator      |
| **Type Safety**           | Full TypeScript coverage             |
| **Testability**           | Each layer independently testable    |
| **Graceful Degradation**  | Fallbacks at every level             |

---

## 4. Implementation Phases

### Phase Overview

```
+------------------------------------------------------------------+
|                    IMPLEMENTATION PHASES                          |
+------------------------------------------------------------------+
|                                                                   |
|  PHASE 1: FOUNDATION (Week 1-2)                                   |
|  +-------------------------------------------------------------+ |
|  | Priority: HIGH | Risk: LOW | Effort: MEDIUM                  | |
|  |                                                              | |
|  | 1.1 Extract action handlers from route.ts                    | |
|  | 1.2 Create shared middleware (auth, validation)              | |
|  | 1.3 Move action detection to server-side                     | |
|  | 1.4 Centralize all prompts in prompts.ts                     | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  PHASE 2: RELIABILITY (Week 3-4)                                  |
|  +-------------------------------------------------------------+ |
|  | Priority: HIGH | Risk: MEDIUM | Effort: MEDIUM               | |
|  |                                                              | |
|  | 2.1 Add AI client with retry/fallback                        | |
|  | 2.2 Implement context caching                                | |
|  | 2.3 Add transaction support for apply                        | |
|  | 2.4 Add rate limiting                                        | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  PHASE 3: TYPE SAFETY (Week 5-6)                                  |
|  +-------------------------------------------------------------+ |
|  | Priority: MEDIUM | Risk: LOW | Effort: MEDIUM                | |
|  |                                                              | |
|  | 3.1 Create typed tool registry                               | |
|  | 3.2 Add Zod schemas for all tool arguments                   | |
|  | 3.3 Type-safe tool executor                                  | |
|  | 3.4 Improve TypeScript strictness                            | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  PHASE 4: ADVANCED (Week 7-8)                                     |
|  +-------------------------------------------------------------+ |
|  | Priority: LOW | Risk: HIGH | Effort: HIGH                    | |
|  |                                                              | |
|  | 4.1 Add streaming responses                                  | |
|  | 4.2 Implement conversation summarization                     | |
|  | 4.3 Add A/B testing for prompts                              | |
|  | 4.4 Usage analytics dashboard                                | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

---

## 5. Detailed Improvements

### 5.1 Extract Action Handlers

**Current:**

```typescript
// agent/route.ts (1389 lines)
switch (body.action) {
  case "PARSE_DOCUMENT": {
    // 70 lines of inline code
  }
  case "PARSE_ITINERARY": {
    // 350 lines of inline code
  }
  // ... more cases
}
```

**Proposed:**

```typescript
// src/lib/agent/handlers/index.ts
export const actionHandlers: Record<AgentActionType, ActionHandler> = {
  PARSE_DOCUMENT: parseDocumentHandler,
  PARSE_ITINERARY: parseItineraryHandler,
  EDIT_ITINERARY: editItineraryHandler,
  GENERATE_PACKING: generatePackingHandler,
  GENERATE_PHRASES: generatePhrasesHandler,
  GENERATE_TODOS: generateTodosHandler,
  GENERATE_ITINERARY_PROMPT: generateItineraryPromptHandler,
};

// src/lib/agent/handlers/parse-document.ts
export const parseDocumentHandler: ActionHandler = async (context) => {
  const { tripContext, document, aiClient } = context;

  // Document type detection
  const parser =
    document.mimeType === "application/pdf"
      ? new PdfDocumentParser()
      : new ImageDocumentParser();

  // Extract content
  const content = await parser.extract(document);

  // AI processing
  const result = await aiClient.complete({
    systemPrompt: getDocumentParsePrompt(tripContext),
    userMessage: content,
    tools: getParsingTools(),
  });

  return result;
};
```

**Benefits:**

- Each handler ~50-100 lines
- Independently testable
- Easy to understand
- Can be replaced/modified independently

---

### 5.2 Server-Side Action Detection

**Current (in UI):**

```typescript
// trip-agent-chat.tsx
const hasDayPattern = /day\s*[1-9]|day\s*one.../i.test(input);
const isDeleteCommand = /\b(delete|remove|clear)\b/i.test(input);
// ... 50+ lines of regex logic
```

**Proposed:**

```typescript
// src/lib/agent/action-detector.ts
export class ActionDetector {
  private patterns: ActionPattern[] = [
    {
      action: "EDIT_ITINERARY",
      priority: 100, // Highest priority
      match: (input) => /\b(delete|remove|clear|erase)\b/i.test(input),
    },
    {
      action: "PARSE_ITINERARY",
      priority: 90,
      match: (input) => input.length > 200 && /day\s*\d/i.test(input),
    },
    {
      action: "GENERATE_PACKING",
      priority: 80,
      match: (input) => /pack(ing)?|what (to|should i) pack/i.test(input),
    },
    // ... more patterns
  ];

  detect(input: string, hasDocument: boolean): AgentActionType {
    if (hasDocument) return "PARSE_DOCUMENT";

    const matches = this.patterns
      .filter((p) => p.match(input))
      .sort((a, b) => b.priority - a.priority);

    return matches[0]?.action ?? "EDIT_ITINERARY";
  }
}

// API route (thin)
const detector = new ActionDetector();
const action = detector.detect(body.text, !!body.document);
```

**Benefits:**

- Centralized detection logic
- Testable with unit tests
- Priority-based matching
- Easy to add new patterns

---

### 5.3 AI Client with Retry/Fallback

**Current:**

```typescript
// Single call, no retry
const completion = await openai.chat.completions.create({
  model: VISION_MODEL,
  messages: [...],
});
// If this fails, user sees error
```

**Proposed:**

```typescript
// src/lib/agent/ai-client.ts
export class AIClient {
  private models = ["gpt-4o", "gpt-4o-mini"];

  async complete(request: AIRequest): Promise<AIResponse> {
    let lastError: Error | null = null;

    for (const model of this.models) {
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          const response = await this.makeRequest(model, request);

          // Track token usage
          this.trackUsage(model, response.usage);

          return response;
        } catch (error) {
          lastError = error as Error;

          if (this.isRetryable(error)) {
            await this.backoff(attempt);
            continue;
          }

          break; // Non-retryable error, try next model
        }
      }
    }

    throw new AIClientError("All models failed", lastError);
  }

  private backoff(attempt: number): Promise<void> {
    const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private isRetryable(error: unknown): boolean {
    // Rate limits, timeouts, 5xx errors are retryable
    if (error instanceof Error) {
      return (
        error.message.includes("rate_limit") ||
        error.message.includes("timeout") ||
        error.message.includes("500")
      );
    }
    return false;
  }
}
```

**Benefits:**

- Automatic retry on transient failures
- Fallback to cheaper model
- Token usage tracking
- Configurable retry policy

---

### 5.4 Context Caching

**Current:**

```typescript
// Every request fetches everything
const { data: days } = await supabase.from("itinerary_days")...;
const { data: bookings } = await supabase.from("bookings")...;
const { data: travelers } = await supabase.from("travelers")...;
// ... 8+ queries
```

**Proposed:**

```typescript
// src/lib/agent/context-cache.ts
export class TripContextCache {
  private cache = new Map<string, CachedContext>();
  private TTL = 60_000; // 1 minute

  async getContext(
    tripId: string,
    supabase: SupabaseClient,
  ): Promise<TripContext> {
    const cached = this.cache.get(tripId);

    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.context;
    }

    // Parallel fetch all data
    const [trip, days, bookings, travelers] = await Promise.all([
      supabase.from("trips").select("*").eq("id", tripId).single(),
      supabase
        .from("itinerary_days")
        .select("*, activities(*)")
        .eq("trip_id", tripId),
      supabase.from("bookings").select("*").eq("trip_id", tripId),
      supabase.from("travelers").select("*").eq("trip_id", tripId),
    ]);

    const context: TripContext = {
      trip: trip.data,
      days: days.data,
      bookings: bookings.data,
      travelers: travelers.data,
    };

    this.cache.set(tripId, { context, timestamp: Date.now() });

    return context;
  }

  invalidate(tripId: string): void {
    this.cache.delete(tripId);
  }
}
```

**Benefits:**

- Reduced database load
- Faster response times
- Parallel fetching
- Explicit invalidation

---

### 5.5 Type-Safe Tool Registry

**Current:**

```typescript
// tools.ts - flat array, no type safety
export const ALL_TOOLS = [
  { type: "function", function: { name: "parse_flight", ... } },
  { type: "function", function: { name: "parse_hotel", ... } },
  // ... 25+ tools
];

// apply/route.ts - no type safety
const { tool, data } = change; // data is Record<string, unknown>
```

**Proposed:**

```typescript
// src/lib/agent/tools/registry.ts
import { z } from "zod";

// Define schemas for each tool's arguments
const ParseFlightSchema = z.object({
  airline: z.string().optional(),
  flight_number: z.string(),
  departure_airport: z.string(),
  arrival_airport: z.string(),
  departure_time: z.string().datetime().optional(),
  arrival_time: z.string().datetime().optional(),
  confirmation_number: z.string().optional(),
  seats: z.string().optional(),
});

type ParseFlightArgs = z.infer<typeof ParseFlightSchema>;

// Tool definition with schema
const parseFlightTool: Tool<ParseFlightArgs> = {
  name: "parse_flight",
  description: "Extract flight booking details from a document",
  schema: ParseFlightSchema,
  category: "parsing",
  execute: async (args, context) => {
    // args is typed as ParseFlightArgs!
    const { data, error } = await context.supabase.from("bookings").insert({
      trip_id: context.tripId,
      type: "FLIGHT",
      airline: args.airline,
      flight_number: args.flight_number,
      // ... all fields are type-checked
    });

    return { success: !error, data };
  },
};

// Tool registry
export const toolRegistry = new ToolRegistry([
  // Parsing tools
  parseFlightTool,
  parseHotelTool,
  parseActivityTool,
  parseItineraryTool,

  // Editing tools
  addDayTool,
  updateDayTool,
  deleteDayTool,
  // ...
]);

// Usage
const result = await toolRegistry.execute("parse_flight", rawArgs, context);
// Validates args against schema, throws if invalid
```

**Benefits:**

- Compile-time type safety
- Runtime validation
- Self-documenting
- Grouped by category

---

### 5.6 Transaction Support

**Current:**

```typescript
// Changes applied one by one, no rollback
for (const change of body.changes) {
  const result = await applyChange(...); // If this fails, previous are committed
  applied.push(result);
}
```

**Proposed:**

```typescript
// src/lib/agent/tool-executor.ts
export class ToolExecutor {
  async executeAll(
    changes: ProposedChange[],
    context: ExecutionContext
  ): Promise<ExecutionResult> {
    const operations: PendingOperation[] = [];

    try {
      // Validate all changes first
      for (const change of changes) {
        const tool = this.registry.get(change.tool);
        const validatedArgs = tool.schema.parse(change.data);
        operations.push({ tool, args: validatedArgs });
      }

      // Execute in transaction
      const results = await context.supabase.rpc('apply_changes_transaction', {
        operations: operations.map(op => ({
          tool: op.tool.name,
          args: op.args,
        })),
      });

      return { success: true, results };
    } catch (error) {
      // All changes rolled back
      return {
        success: false,
        error: error.message,
        partialResults: [],
      };
    }
  }
}

// Alternative: Soft transaction with compensation
async executeSoft(changes: ProposedChange[]): Promise<ExecutionResult> {
  const completed: CompletedOperation[] = [];

  try {
    for (const change of changes) {
      const result = await this.executeSingle(change);
      completed.push({ change, result, rollback: result.rollbackFn });
    }

    return { success: true, results: completed.map(c => c.result) };
  } catch (error) {
    // Rollback completed operations in reverse order
    for (const op of completed.reverse()) {
      await op.rollback();
    }

    return { success: false, error: error.message };
  }
}
```

**Benefits:**

- All-or-nothing execution
- Explicit rollback support
- Consistent database state
- Better error recovery

---

## 6. Migration Strategy

### Incremental Migration Path

```
+------------------------------------------------------------------+
|                    MIGRATION STRATEGY                             |
+------------------------------------------------------------------+
|                                                                   |
|  STEP 1: Add New Structure (Non-Breaking)                         |
|  +-------------------------------------------------------------+ |
|  | Create new directories:                                      | |
|  | src/lib/agent/                                               | |
|  |   handlers/           # Action handlers                      | |
|  |     parse-document.ts                                        | |
|  |     parse-itinerary.ts                                       | |
|  |     edit-itinerary.ts                                        | |
|  |     ...                                                      | |
|  |   tools/              # Typed tool definitions               | |
|  |     registry.ts                                              | |
|  |     parsing/                                                 | |
|  |     editing/                                                 | |
|  |     generation/                                              | |
|  |   middleware/         # Shared middleware                    | |
|  |     auth.ts                                                  | |
|  |     validation.ts                                            | |
|  |     rate-limit.ts                                            | |
|  |   orchestrator.ts     # Main orchestrator                    | |
|  |   action-detector.ts  # Action detection                     | |
|  |   ai-client.ts        # AI client abstraction                | |
|  |   context-cache.ts    # Context caching                      | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  STEP 2: Create Handlers (Parallel to Existing)                   |
|  +-------------------------------------------------------------+ |
|  | For each action type:                                        | |
|  | 1. Extract logic from route.ts to handler                    | |
|  | 2. Add tests for handler                                     | |
|  | 3. Wire handler through orchestrator                         | |
|  | 4. Test in staging                                           | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  STEP 3: Switch Traffic (Feature Flag)                            |
|  +-------------------------------------------------------------+ |
|  | const USE_NEW_ARCHITECTURE = process.env.USE_NEW_ARCH;       | |
|  |                                                              | |
|  | if (USE_NEW_ARCHITECTURE) {                                  | |
|  |   return orchestrator.handle(request);                       | |
|  | } else {                                                     | |
|  |   return legacyHandler(request); // Old code                 | |
|  | }                                                            | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  STEP 4: Remove Legacy Code                                       |
|  +-------------------------------------------------------------+ |
|  | Once new architecture is stable:                             | |
|  | 1. Remove feature flag                                       | |
|  | 2. Delete old switch statements                              | |
|  | 3. Update documentation                                      | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

### Testing Strategy

```
+------------------------------------------------------------------+
|                    TESTING STRATEGY                               |
+------------------------------------------------------------------+
|                                                                   |
|  UNIT TESTS (per handler):                                        |
|  +-------------------------------------------------------------+ |
|  | describe('ParseDocumentHandler', () => {                     | |
|  |   it('extracts flight from PDF', async () => {               | |
|  |     const handler = new ParseDocumentHandler(mockAIClient);  | |
|  |     const result = await handler.execute({                   | |
|  |       document: { base64: '...', mimeType: 'application/pdf'}| |
|  |       tripContext: mockTripContext,                          | |
|  |     });                                                      | |
|  |     expect(result.proposedChanges).toContainEqual(           | |
|  |       expect.objectContaining({ tool: 'parse_flight' })      | |
|  |     );                                                       | |
|  |   });                                                        | |
|  | });                                                          | |
|  +-------------------------------------------------------------+ |
|                                                                   |
|  INTEGRATION TESTS (end-to-end):                                  |
|  +-------------------------------------------------------------+ |
|  | describe('Agent Integration', () => {                        | |
|  |   it('parses itinerary and creates days', async () => {      | |
|  |     // Setup test trip                                       | |
|  |     const trip = await createTestTrip();                     | |
|  |                                                              | |
|  |     // Call API                                              | |
|  |     const response = await request(app)                      | |
|  |       .post(`/api/trips/${trip.id}/agent`)                   | |
|  |       .send({ action: 'PARSE_ITINERARY', text: '...' });     | |
|  |                                                              | |
|  |     // Verify response                                       | |
|  |     expect(response.body.proposedChanges).toHaveLength(2);   | |
|  |                                                              | |
|  |     // Apply changes                                         | |
|  |     await request(app)                                       | |
|  |       .post(`/api/trips/${trip.id}/agent/apply`)             | |
|  |       .send({ changes: response.body.proposedChanges });     | |
|  |                                                              | |
|  |     // Verify database                                       | |
|  |     const days = await db.itinerary_days.findMany(...);      | |
|  |     expect(days).toHaveLength(2);                            | |
|  |   });                                                        | |
|  | });                                                          | |
|  +-------------------------------------------------------------+ |
|                                                                   |
+------------------------------------------------------------------+
```

---

## Summary

### Priority Matrix

| Issue                  | Severity | Effort | Phase |
| ---------------------- | -------- | ------ | ----- |
| Monolithic handlers    | HIGH     | MEDIUM | 1     |
| Action detection in UI | HIGH     | LOW    | 1     |
| No error recovery      | HIGH     | MEDIUM | 2     |
| No context caching     | MEDIUM   | LOW    | 2     |
| Duplicated auth        | MEDIUM   | LOW    | 1     |
| Inline prompts         | LOW      | LOW    | 1     |
| No tool grouping       | MEDIUM   | MEDIUM | 3     |
| No streaming           | LOW      | HIGH   | 4     |
| No transactions        | MEDIUM   | MEDIUM | 2     |
| Limited memory         | LOW      | MEDIUM | 4     |
| No middleware          | MEDIUM   | MEDIUM | 2     |
| No type safety         | MEDIUM   | MEDIUM | 3     |

### Expected Outcomes

| Metric              | Current | After Phase 2 | After Phase 4 |
| ------------------- | ------- | ------------- | ------------- |
| route.ts lines      | 1,389   | ~200          | ~100          |
| Test coverage       | ~0%     | ~60%          | ~80%          |
| Response time (P50) | ~3s     | ~2s           | ~1.5s         |
| Error rate          | ~5%     | ~1%           | <0.5%         |
| AI cost/request     | $0.05   | $0.04         | $0.03         |

---

## Next Steps

1. **Review this proposal** with the team
2. **Prioritize** which issues to address first
3. **Create tickets** for Phase 1 work
4. **Start with handler extraction** (lowest risk, highest value)

---

**Document Version**: 1.0
**Created**: 2026-02-04
**Author**: Claude (AI Analysis)
