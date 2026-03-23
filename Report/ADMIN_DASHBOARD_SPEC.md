# GoVault Admin Analytics Dashboard - Technical Specification

## Executive Summary

A separate admin dashboard project to monitor GoVault usage, track AI agent interactions, and analyze user behavior. This dashboard provides visibility into who's using the platform, their trips, AI query patterns, and agent decision traces.

---

## Table of Contents

1. [Project Architecture](#1-project-architecture)
2. [Database Schema (New Tables)](#2-database-schema-new-tables)
3. [Backend API Specification](#3-backend-api-specification)
4. [Frontend Screens](#4-frontend-screens)
5. [AI Agent Logging Integration](#5-ai-agent-logging-integration)
6. [Implementation Phases](#6-implementation-phases)
7. [Tech Stack Recommendation](#7-tech-stack-recommendation)

---

## 1. Project Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     ADMIN DASHBOARD (New Project)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   Next.js    │  │   Charts     │  │   Data Tables        │  │
│  │   App Router │  │   (Recharts) │  │   (TanStack Table)   │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SHARED SUPABASE DATABASE                      │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ Existing Tables│  │ Analytics      │  │ AI Trace         │  │
│  │ (trips, users) │  │ Tables (NEW)   │  │ Tables (NEW)     │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     GOVAULT MAIN APP                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │   User App   │  │   AI Agent   │──▶│  Writes to analytics │  │
│  │              │  │   Endpoints  │   │  tables via hooks    │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Project Structure

```
govault-admin/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Dashboard overview
│   │   ├── login/page.tsx              # Admin login
│   │   ├── users/
│   │   │   ├── page.tsx                # Users list
│   │   │   └── [userId]/page.tsx       # User detail
│   │   ├── trips/
│   │   │   ├── page.tsx                # Trips list
│   │   │   └── [tripId]/page.tsx       # Trip detail
│   │   ├── ai-logs/
│   │   │   ├── page.tsx                # AI queries list
│   │   │   └── [traceId]/page.tsx      # Trace detail
│   │   └── analytics/
│   │       ├── page.tsx                # Analytics overview
│   │       ├── usage/page.tsx          # Usage metrics
│   │       └── agents/page.tsx         # Agent performance
│   ├── components/
│   │   ├── charts/
│   │   ├── tables/
│   │   └── ui/
│   └── lib/
│       ├── supabase/
│       └── queries/
├── package.json
└── .env.local                          # Same Supabase credentials
```

---

## 2. Database Schema (New Tables)

### 2.1 `admin_users` - Admin Access Control

```sql
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer', -- 'super_admin', 'admin', 'viewer'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES admin_users(id),
  last_login_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
```

### 2.2 `ai_agent_traces` - AI Query Logging

```sql
CREATE TABLE ai_agent_traces (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Request Context
  user_id UUID REFERENCES auth.users(id),
  trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
  session_id TEXT,                       -- Group related queries

  -- Request Details
  action TEXT NOT NULL,                  -- 'PARSE_DOCUMENT', 'EDIT_ITINERARY', etc.
  user_message TEXT,                     -- Original user input
  system_prompt TEXT,                    -- System prompt used

  -- Input Context
  input_context JSONB,                   -- Serialized context sent to AI
  document_type TEXT,                    -- 'pdf', 'image', null
  document_name TEXT,

  -- AI Response
  model_used TEXT,                       -- 'openai/gpt-4o'
  raw_response JSONB,                    -- Full AI response
  tool_calls JSONB,                      -- Array of tool calls made
  tool_calls_count INT DEFAULT 0,

  -- Results
  proposed_changes JSONB,                -- Changes proposed to user
  proposed_changes_count INT DEFAULT 0,
  suggestions JSONB,                     -- Auto-suggestions generated

  -- Outcome
  status TEXT NOT NULL,                  -- 'success', 'error', 'partial'
  error_message TEXT,
  error_stack TEXT,

  -- User Decision (filled after apply)
  changes_accepted INT,                  -- How many changes user accepted
  changes_rejected INT,
  applied_at TIMESTAMPTZ,

  -- Metrics
  duration_ms INT,
  tokens_used JSONB,                     -- {prompt: x, completion: y, total: z}

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes
  CONSTRAINT valid_status CHECK (status IN ('success', 'error', 'partial', 'pending'))
);

CREATE INDEX idx_ai_traces_user ON ai_agent_traces(user_id);
CREATE INDEX idx_ai_traces_trip ON ai_agent_traces(trip_id);
CREATE INDEX idx_ai_traces_action ON ai_agent_traces(action);
CREATE INDEX idx_ai_traces_created ON ai_agent_traces(created_at DESC);
CREATE INDEX idx_ai_traces_status ON ai_agent_traces(status);
```

### 2.3 `ai_tool_executions` - Individual Tool Call Tracking

```sql
CREATE TABLE ai_tool_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trace_id UUID REFERENCES ai_agent_traces(id) ON DELETE CASCADE,

  -- Tool Details
  tool_name TEXT NOT NULL,               -- 'add_activity', 'parse_flight', etc.
  tool_arguments JSONB,                  -- Arguments passed to tool
  tool_result JSONB,                     -- Result of tool execution

  -- Outcome
  execution_order INT,                   -- Order in the trace
  was_accepted BOOLEAN,                  -- Did user accept this change?

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tool_exec_trace ON ai_tool_executions(trace_id);
CREATE INDEX idx_tool_exec_name ON ai_tool_executions(tool_name);
```

### 2.4 `user_activity_log` - User Action Tracking

```sql
CREATE TABLE user_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),

  -- Action Details
  action_type TEXT NOT NULL,             -- 'trip_created', 'trip_viewed', 'booking_added', etc.
  resource_type TEXT,                    -- 'trip', 'booking', 'activity', etc.
  resource_id UUID,

  -- Context
  metadata JSONB,                        -- Additional context
  ip_address INET,
  user_agent TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_user ON user_activity_log(user_id);
CREATE INDEX idx_activity_type ON user_activity_log(action_type);
CREATE INDEX idx_activity_created ON user_activity_log(created_at DESC);
```

### 2.5 `analytics_daily_rollup` - Pre-computed Daily Stats

```sql
CREATE TABLE analytics_daily_rollup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,

  -- User Metrics
  total_users INT DEFAULT 0,
  new_users INT DEFAULT 0,
  active_users INT DEFAULT 0,            -- Users with activity that day

  -- Trip Metrics
  total_trips INT DEFAULT 0,
  new_trips INT DEFAULT 0,
  trips_planning INT DEFAULT 0,
  trips_active INT DEFAULT 0,
  trips_completed INT DEFAULT 0,

  -- AI Metrics
  ai_queries_total INT DEFAULT 0,
  ai_queries_success INT DEFAULT 0,
  ai_queries_error INT DEFAULT 0,
  ai_parse_document INT DEFAULT 0,
  ai_edit_itinerary INT DEFAULT 0,
  ai_generate_packing INT DEFAULT 0,
  ai_generate_phrases INT DEFAULT 0,
  ai_parse_itinerary INT DEFAULT 0,
  ai_avg_duration_ms INT DEFAULT 0,
  ai_total_tokens INT DEFAULT 0,

  -- Acceptance Metrics
  changes_proposed INT DEFAULT 0,
  changes_accepted INT DEFAULT 0,
  acceptance_rate DECIMAL(5,2),

  -- Content Metrics
  bookings_created INT DEFAULT 0,
  activities_created INT DEFAULT 0,
  documents_uploaded INT DEFAULT 0,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rollup_date ON analytics_daily_rollup(date DESC);
```

---

## 3. Backend API Specification

### 3.1 Admin Authentication

```typescript
// POST /api/admin/auth/login
// Verifies user is in admin_users table
Request: { email: string, password: string }
Response: { token: string, user: AdminUser }

// GET /api/admin/auth/me
// Returns current admin user
Response: { user: AdminUser }
```

### 3.2 Users API

```typescript
// GET /api/admin/users
// List all users with pagination and filters
Query: {
  page?: number,
  limit?: number,
  search?: string,
  sortBy?: 'created_at' | 'last_active' | 'trips_count',
  order?: 'asc' | 'desc'
}
Response: {
  users: Array<{
    id: string,
    email: string,
    created_at: string,
    last_sign_in_at: string,
    trips_count: number,
    ai_queries_count: number,
    is_active: boolean
  }>,
  total: number,
  page: number,
  totalPages: number
}

// GET /api/admin/users/:userId
// User detail with activity
Response: {
  user: UserDetail,
  trips: Trip[],
  recentActivity: ActivityLog[],
  aiUsageStats: AIStats
}
```

### 3.3 Trips API

```typescript
// GET /api/admin/trips
// List all trips with filters
Query: {
  page?: number,
  limit?: number,
  status?: 'PLANNING' | 'ACTIVE' | 'COMPLETED',
  search?: string,
  userId?: string
}
Response: {
  trips: Array<{
    id: string,
    name: string,
    owner: { id: string, email: string },
    destinations: string[],
    status: string,
    travelers_count: number,
    bookings_count: number,
    ai_queries_count: number,
    created_at: string
  }>,
  total: number
}

// GET /api/admin/trips/:tripId
// Full trip detail
Response: {
  trip: TripDetail,
  owner: UserDetail,
  travelers: Traveler[],
  bookings: Booking[],
  aiTraces: AITrace[],
  activity: ActivityLog[]
}
```

### 3.4 AI Logs API

```typescript
// GET /api/admin/ai-logs
// List AI agent traces with filters
Query: {
  page?: number,
  limit?: number,
  action?: AgentAction,
  status?: 'success' | 'error',
  userId?: string,
  tripId?: string,
  dateFrom?: string,
  dateTo?: string
}
Response: {
  traces: Array<{
    id: string,
    user: { id: string, email: string },
    trip: { id: string, name: string },
    action: string,
    status: string,
    tool_calls_count: number,
    proposed_changes_count: number,
    changes_accepted: number,
    duration_ms: number,
    created_at: string
  }>,
  total: number
}

// GET /api/admin/ai-logs/:traceId
// Full trace detail with tool executions
Response: {
  trace: {
    id: string,
    user: UserDetail,
    trip: TripDetail,
    action: string,
    user_message: string,
    system_prompt: string,
    input_context: object,
    raw_response: object,
    tool_calls: ToolCall[],
    proposed_changes: ProposedChange[],
    suggestions: Suggestion[],
    status: string,
    error_message?: string,
    duration_ms: number,
    tokens_used: TokenUsage,
    changes_accepted: number,
    changes_rejected: number,
    applied_at?: string
  },
  toolExecutions: ToolExecution[]
}
```

### 3.5 Analytics API

```typescript
// GET /api/admin/analytics/overview
// Dashboard overview stats
Query: { period?: '7d' | '30d' | '90d' | 'all' }
Response: {
  users: {
    total: number,
    new: number,
    active: number,
    growth: number  // percentage
  },
  trips: {
    total: number,
    new: number,
    byStatus: { planning: number, active: number, completed: number }
  },
  ai: {
    totalQueries: number,
    successRate: number,
    avgDuration: number,
    byAction: { [action: string]: number },
    acceptanceRate: number
  }
}

// GET /api/admin/analytics/timeseries
// Time series data for charts
Query: {
  metric: 'users' | 'trips' | 'ai_queries' | 'errors',
  period: '7d' | '30d' | '90d',
  granularity: 'day' | 'week' | 'month'
}
Response: {
  data: Array<{ date: string, value: number }>
}

// GET /api/admin/analytics/ai-performance
// AI agent performance metrics
Response: {
  byAction: Array<{
    action: string,
    count: number,
    successRate: number,
    avgDuration: number,
    avgToolCalls: number,
    acceptanceRate: number
  }>,
  byTool: Array<{
    tool: string,
    usageCount: number,
    acceptanceRate: number
  }>,
  errorBreakdown: Array<{
    errorType: string,
    count: number,
    percentage: number
  }>
}
```

---

## 4. Frontend Screens

### 4.1 Dashboard Overview (`/`)

**Purpose:** At-a-glance view of platform health and key metrics

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📊 GoVault Admin                    [Period: Last 30 days ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐   │
│  │  USERS   │  │  TRIPS   │  │ AI CALLS │  │ SUCCESS RATE │   │
│  │   247    │  │   412    │  │  1,847   │  │    94.2%     │   │
│  │  +12%    │  │  +8%     │  │  +23%    │  │    +1.2%     │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────────┘   │
│                                                                 │
│  ┌────────────────────────────┐  ┌──────────────────────────┐  │
│  │   Users & Trips Over Time  │  │   AI Queries by Action   │  │
│  │   [Line Chart]             │  │   [Pie Chart]            │  │
│  │                            │  │   • Parse Doc: 45%       │  │
│  │                            │  │   • Edit Itin: 30%       │  │
│  │                            │  │   • Gen Packing: 15%     │  │
│  │                            │  │   • Gen Phrases: 10%     │  │
│  └────────────────────────────┘  └──────────────────────────┘  │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Recent AI Queries                              [View All] │ │
│  │   ───────────────────────────────────────────────────────── │ │
│  │   user@email.com | PARSE_DOCUMENT | ✓ Success | 1.2s | 2m  │ │
│  │   user2@mail.com | EDIT_ITINERARY | ✓ Success | 0.8s | 5m  │ │
│  │   user3@test.com | PARSE_DOCUMENT | ✗ Error   | 2.1s | 8m  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │   Recent Users                                   [View All] │ │
│  │   ───────────────────────────────────────────────────────── │ │
│  │   john@email.com    | 3 trips | 12 AI queries | Active 2h  │ │
│  │   sarah@mail.com    | 1 trip  | 4 AI queries  | Active 1d  │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

**Data Required:**

- Total users, trips, AI queries (with period comparison)
- Time series for user/trip growth
- AI queries breakdown by action type
- Recent AI queries list (last 10)
- Recent active users list (last 10)

---

### 4.2 Users List (`/users`)

**Purpose:** View all registered users and their activity

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  👥 Users                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search users...                   [Filter ▼] [Export]  │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Email           │ Created   │ Trips │ AI Queries │ Active │ │
│  │─────────────────│───────────│───────│────────────│────────│ │
│  │ john@email.com  │ Jan 15    │ 5     │ 47         │ 2h ago │ │
│  │ sarah@mail.com  │ Jan 12    │ 2     │ 12         │ 1d ago │ │
│  │ mike@test.com   │ Jan 10    │ 1     │ 3          │ 3d ago │ │
│  │ ...             │ ...       │ ...   │ ...        │ ...    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Showing 1-20 of 247 users              [< 1 2 3 4 5 ... 13 >] │
└─────────────────────────────────────────────────────────────────┘
```

**Features:**

- Searchable by email
- Sortable columns (created, trips count, AI queries, last active)
- Filter by: date range, activity status, trip count
- Click row to view user detail
- Export to CSV

---

### 4.3 User Detail (`/users/[userId]`)

**Purpose:** Deep dive into a specific user's activity

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Users                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  👤 john@example.com                                      │  │
│  │  Joined: January 15, 2024 • Last active: 2 hours ago     │  │
│  │                                                           │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────┐  │  │
│  │  │ Trips  │  │AI Calls│  │Bookings│  │ Docs Uploaded  │  │  │
│  │  │   5    │  │   47   │  │   23   │  │      12        │  │  │
│  │  └────────┘  └────────┘  └────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Trips] [AI Activity] [Timeline]                               │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ User's Trips                                              │  │
│  │                                                           │  │
│  │ 🌴 Thailand Adventure    │ ACTIVE   │ 4 travelers │ Jan 20│  │
│  │ 🗼 Paris Weekend         │ COMPLETED│ 2 travelers │ Dec 15│  │
│  │ 🏔️ Japan Trip           │ PLANNING │ 3 travelers │ Jan 18│  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Recent AI Activity                                        │  │
│  │                                                           │  │
│  │ • PARSE_DOCUMENT - Boarding pass uploaded (2h ago)       │  │
│  │   ✓ 2 changes applied • Duration: 1.2s                   │  │
│  │                                                           │  │
│  │ • EDIT_ITINERARY - "Add temple visit on day 3" (1d ago)  │  │
│  │   ✓ 1 change applied • Duration: 0.9s                    │  │
│  │                                                           │  │
│  │ • GENERATE_PACKING - Generated packing list (2d ago)     │  │
│  │   ✓ 45 items generated • Duration: 2.1s                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.4 Trips List (`/trips`)

**Purpose:** View all trips across the platform

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🗺️ Trips                                                       │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ 🔍 Search trips...    [Status ▼] [Date Range] [Export]    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Trip          │ Owner         │Status  │Travelers│AI Calls│ │
│  │───────────────│───────────────│────────│─────────│────────│ │
│  │ Thailand Adv  │john@email.com │ACTIVE  │ 4       │ 23     │ │
│  │ Paris Weekend │sarah@mail.com │COMPLETE│ 2       │ 8      │ │
│  │ Japan 2024    │mike@test.com  │PLANNING│ 3       │ 15     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  Showing 1-20 of 412 trips              [< 1 2 3 4 5 ... 21 >] │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.5 Trip Detail (`/trips/[tripId]`)

**Purpose:** View complete trip details and associated AI activity

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to Trips                                                │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🌴 Thailand Adventure                           [ACTIVE] │  │
│  │  Owner: john@example.com                                  │  │
│  │  Dates: Jan 20 - Jan 30, 2024 • Bangkok, Chiang Mai      │  │
│  │                                                           │  │
│  │  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────────────┐  │  │
│  │  │Travelers│ │Bookings│  │Activities│ │  AI Queries   │  │  │
│  │  │   4    │  │   8    │  │   24    │  │     23        │  │  │
│  │  └────────┘  └────────┘  └────────┘  └────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Overview] [Travelers] [Bookings] [AI Logs]                   │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Travelers                                                 │  │
│  │ • John Doe (Adult) - john@email.com                      │  │
│  │ • Jane Doe (Adult) - jane@email.com                      │  │
│  │ • Tommy Doe (Child, 8) - Vegetarian                      │  │
│  │ • Grandma Doe (Senior, 72) - Mobility: Wheelchair        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Bookings                                                  │  │
│  │ ✈️ SQ123 BKK→CNX - Jan 20 - CONFIRMED                    │  │
│  │ 🏨 Mandarin Oriental - Jan 20-25 - CONFIRMED             │  │
│  │ ✈️ TG456 CNX→BKK - Jan 28 - PENDING                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ AI Activity for this Trip                    [View All →] │  │
│  │                                                           │  │
│  │ PARSE_DOCUMENT • 2 hours ago • 1.2s • ✓ 2 changes        │  │
│  │ EDIT_ITINERARY • 1 day ago • 0.9s • ✓ 1 change           │  │
│  │ GENERATE_PACKING • 2 days ago • 2.1s • ✓ 45 items        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.6 AI Logs List (`/ai-logs`)

**Purpose:** View all AI agent queries and their outcomes

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  🤖 AI Agent Logs                                               │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ [Action ▼] [Status ▼] [User ▼] [Date Range] [Search]     │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │ Time     │ User          │Action        │Status│Duration │ │
│  │──────────│───────────────│──────────────│──────│─────────│ │
│  │ 2h ago   │john@email.com │PARSE_DOC     │ ✓    │ 1.2s    │ │
│  │ 5h ago   │sarah@mail.com │EDIT_ITIN     │ ✓    │ 0.8s    │ │
│  │ 8h ago   │mike@test.com  │PARSE_DOC     │ ✗    │ 2.1s    │ │
│  │ 1d ago   │john@email.com │GEN_PACKING   │ ✓    │ 2.3s    │ │
│  └───────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Quick Stats (filtered period)                             │  │
│  │ Total: 1,847 • Success: 1,739 (94.2%) • Errors: 108      │  │
│  │ Avg Duration: 1.4s • Total Tokens: 2.3M                  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.7 AI Trace Detail (`/ai-logs/[traceId]`) ⭐ KEY SCREEN

**Purpose:** Deep inspection of a single AI query - the decision trace

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  ← Back to AI Logs                                              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🔍 Trace: abc123-def456                         [✓ SUCCESS]│
│  │  User: john@example.com • Trip: Thailand Adventure        │  │
│  │  Action: PARSE_DOCUMENT • Duration: 1,247ms              │  │
│  │  Timestamp: January 20, 2024 at 2:34 PM                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  [Overview] [Input] [AI Response] [Tool Calls] [Changes]       │
│  ─────────────────────────────────────────────────────────────  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📥 INPUT                                                  │  │
│  │                                                           │  │
│  │ User Message:                                             │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ "Parse this boarding pass"                           │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │ Document: boarding_pass_sq123.pdf (PDF, 245KB)           │  │
│  │                                                           │  │
│  │ System Prompt:                                           │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ You are a travel document parser. Extract flight     │ │  │
│  │ │ information from the provided document...            │ │  │
│  │ │ [Expand to see full prompt]                          │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │ Context Provided:                                        │  │
│  │ • Trip dates: Jan 20 - Jan 30, 2024                      │  │
│  │ • Existing bookings: 3 flights, 2 hotels                 │  │
│  │ • Travelers: 4 people                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🤖 AI RESPONSE                                            │  │
│  │                                                           │  │
│  │ Model: openai/gpt-4o                                     │  │
│  │ Tokens: 1,234 prompt + 567 completion = 1,801 total      │  │
│  │                                                           │  │
│  │ Raw Response:                                             │  │
│  │ ┌──────────────────────────────────────────────────────┐ │  │
│  │ │ {                                                    │ │  │
│  │ │   "tool_calls": [                                    │ │  │
│  │ │     {                                                │ │  │
│  │ │       "name": "parse_flight",                        │ │  │
│  │ │       "arguments": {                                 │ │  │
│  │ │         "airline": "Singapore Airlines",             │ │  │
│  │ │         "flight_number": "SQ123",                    │ │  │
│  │ │         ...                                          │ │  │
│  │ │       }                                              │ │  │
│  │ │     }                                                │ │  │
│  │ │   ]                                                  │ │  │
│  │ │ }                                                    │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 🔧 TOOL CALLS (Decision Trace)                            │  │
│  │                                                           │  │
│  │ ┌─ Tool Call #1 ─────────────────────────────────────┐   │  │
│  │ │ 📞 parse_flight                         [✓ Accepted] │   │  │
│  │ │                                                     │   │  │
│  │ │ Arguments:                                          │   │  │
│  │ │ {                                                   │   │  │
│  │ │   "airline": "Singapore Airlines",                  │   │  │
│  │ │   "flight_number": "SQ123",                         │   │  │
│  │ │   "departure_airport": "SIN",                       │   │  │
│  │ │   "arrival_airport": "BKK",                         │   │  │
│  │ │   "departure_time": "2024-01-20T08:00:00",          │   │  │
│  │ │   "arrival_time": "2024-01-20T09:30:00",            │   │  │
│  │ │   "confirmation_number": "ABC123"                   │   │  │
│  │ │ }                                                   │   │  │
│  │ │                                                     │   │  │
│  │ │ → Created: Booking (FLIGHT)                        │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  │                                                           │  │
│  │ ┌─ Tool Call #2 ─────────────────────────────────────┐   │  │
│  │ │ 📞 parse_flight                         [✓ Accepted] │   │  │
│  │ │                                                     │   │  │
│  │ │ Arguments:                                          │   │  │
│  │ │ { "airline": "Singapore Airlines", ... }            │   │  │
│  │ │                                                     │   │  │
│  │ │ → Created: Booking (FLIGHT) - Return flight        │   │  │
│  │ └─────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 📝 PROPOSED CHANGES                                       │  │
│  │                                                           │  │
│  │ 2 changes proposed • 2 accepted • 0 rejected             │  │
│  │ Applied at: January 20, 2024 at 2:35 PM                  │  │
│  │                                                           │  │
│  │ ┌─ Change #1 ──────────────────────────── [✓ Applied] ─┐ │  │
│  │ │ Type: ADD_BOOKING                                    │ │  │
│  │ │ Data: Flight SQ123 SIN→BKK on Jan 20                │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  │                                                           │  │
│  │ ┌─ Change #2 ──────────────────────────── [✓ Applied] ─┐ │  │
│  │ │ Type: ADD_BOOKING                                    │ │  │
│  │ │ Data: Flight SQ456 BKK→SIN on Jan 30                │ │  │
│  │ └──────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 💡 AUTO-SUGGESTIONS GENERATED                             │  │
│  │                                                           │  │
│  │ • Location mismatch detected: Trip destinations don't    │  │
│  │   include Singapore (SIN). Suggested adding Singapore.   │  │
│  │   [Accepted: No]                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

### 4.8 Analytics Dashboard (`/analytics`)

**Purpose:** Comprehensive platform analytics and trends

**Components:**

```
┌─────────────────────────────────────────────────────────────────┐
│  📈 Analytics                          [Period: Last 30 days ▼] │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ User Growth Over Time                                      │ │
│  │ [Area Chart - Total users, New users, Active users]        │ │
│  │                                                             │ │
│  │     📈                                                      │ │
│  │    /  \    ___/\___                                        │ │
│  │ __/    \__/        \___                                    │ │
│  │ Jan 1      Jan 15       Jan 30                             │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌──────────────────────┐  ┌─────────────────────────────────┐ │
│  │ AI Queries by Action │  │ AI Success Rate Over Time       │ │
│  │ [Donut Chart]        │  │ [Line Chart]                    │ │
│  │                      │  │                                 │ │
│  │   ┌────┐             │  │ 100% ─────────────────────      │ │
│  │   │    │ Parse: 45%  │  │  95% ──●───●───●───●────       │ │
│  │   │    │ Edit: 30%   │  │  90% ────────────────────       │ │
│  │   │    │ Pack: 15%   │  │  85%                            │ │
│  │   └────┘ Phrase: 10% │  │      Jan 1    Jan 15   Jan 30   │ │
│  └──────────────────────┘  └─────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AI Agent Performance                                       │ │
│  │                                                             │ │
│  │ Action          │ Count │ Success │ Avg Time │ Acceptance │ │
│  │─────────────────│───────│─────────│──────────│────────────│ │
│  │ PARSE_DOCUMENT  │ 832   │ 96.2%   │ 1.4s     │ 87.3%      │ │
│  │ EDIT_ITINERARY  │ 554   │ 94.8%   │ 0.9s     │ 92.1%      │ │
│  │ PARSE_ITINERARY │ 221   │ 91.4%   │ 2.1s     │ 78.5%      │ │
│  │ GENERATE_PACKING│ 156   │ 98.1%   │ 2.3s     │ 95.2%      │ │
│  │ GENERATE_PHRASES│ 84    │ 97.6%   │ 1.8s     │ 88.9%      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Error Breakdown                                            │ │
│  │ [Horizontal Bar Chart]                                     │ │
│  │                                                             │ │
│  │ PDF Parse Failed  ████████████████░░░░░ 45 (41.7%)         │ │
│  │ API Timeout       ████████░░░░░░░░░░░░░ 23 (21.3%)         │ │
│  │ Invalid Response  ██████░░░░░░░░░░░░░░░ 18 (16.7%)         │ │
│  │ Auth Error        ████░░░░░░░░░░░░░░░░░ 12 (11.1%)         │ │
│  │ Other             ███░░░░░░░░░░░░░░░░░░ 10 (9.3%)          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Top Tools Used                                             │ │
│  │                                                             │ │
│  │ Tool               │ Usage  │ Accept Rate │ Avg/Query     │ │
│  │────────────────────│────────│─────────────│───────────────│ │
│  │ parse_flight       │ 1,247  │ 89.2%       │ 1.5           │ │
│  │ add_activity       │ 892    │ 91.4%       │ 2.3           │ │
│  │ parse_hotel        │ 634    │ 87.8%       │ 1.1           │ │
│  │ update_activity    │ 445    │ 94.6%       │ 1.8           │ │
│  │ generate_packing   │ 156    │ 95.2%       │ 1.0           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. AI Agent Logging Integration

### 5.1 Modifications to Main App

Add logging calls to the existing agent endpoint:

```typescript
// In /src/app/api/trips/[tripId]/agent/route.ts

import { createAdminClient } from "@/lib/supabase/admin";

async function logAITrace(data: AITraceData) {
  const admin = createAdminClient();

  // Insert main trace
  const { data: trace } = await admin
    .from("ai_agent_traces")
    .insert({
      user_id: data.userId,
      trip_id: data.tripId,
      session_id: data.sessionId,
      action: data.action,
      user_message: data.userMessage,
      system_prompt: data.systemPrompt,
      input_context: data.inputContext,
      document_type: data.documentType,
      document_name: data.documentName,
      model_used: data.model,
      raw_response: data.rawResponse,
      tool_calls: data.toolCalls,
      tool_calls_count: data.toolCalls?.length ?? 0,
      proposed_changes: data.proposedChanges,
      proposed_changes_count: data.proposedChanges?.length ?? 0,
      suggestions: data.suggestions,
      status: data.status,
      error_message: data.errorMessage,
      error_stack: data.errorStack,
      duration_ms: data.durationMs,
      tokens_used: data.tokensUsed,
    })
    .select()
    .single();

  // Insert individual tool executions
  if (trace && data.toolCalls?.length) {
    await admin.from("ai_tool_executions").insert(
      data.toolCalls.map((call, index) => ({
        trace_id: trace.id,
        tool_name: call.name,
        tool_arguments: call.arguments,
        execution_order: index,
      })),
    );
  }

  return trace;
}

// Update trace with acceptance data after apply
async function updateTraceAcceptance(
  traceId: string,
  accepted: number,
  rejected: number,
) {
  const admin = createAdminClient();
  await admin
    .from("ai_agent_traces")
    .update({
      changes_accepted: accepted,
      changes_rejected: rejected,
      applied_at: new Date().toISOString(),
    })
    .eq("id", traceId);
}
```

### 5.2 Activity Logging Middleware

```typescript
// New file: /src/lib/analytics/activity-logger.ts

export async function logUserActivity(data: {
  userId: string;
  actionType: string;
  resourceType?: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  request?: Request;
}) {
  const admin = createAdminClient();

  await admin.from("user_activity_log").insert({
    user_id: data.userId,
    action_type: data.actionType,
    resource_type: data.resourceType,
    resource_id: data.resourceId,
    metadata: data.metadata,
    ip_address: data.request?.headers.get("x-forwarded-for"),
    user_agent: data.request?.headers.get("user-agent"),
  });
}

// Usage in API routes:
// await logUserActivity({
//   userId: user.id,
//   actionType: 'trip_created',
//   resourceType: 'trip',
//   resourceId: newTrip.id,
//   metadata: { destinations: trip.destinations },
//   request: req,
// })
```

---

## 6. Implementation Phases

### Phase 1: Foundation (Week 1)

- [ ] Create new Next.js project for admin dashboard
- [ ] Set up shared Supabase connection
- [ ] Create database migration for new tables
- [ ] Implement admin authentication
- [ ] Build basic layout and navigation

### Phase 2: Core Logging (Week 2)

- [ ] Add `ai_agent_traces` logging to main app
- [ ] Add `ai_tool_executions` logging
- [ ] Add `user_activity_log` logging
- [ ] Create daily rollup cron job

### Phase 3: Users & Trips (Week 3)

- [ ] Users list page with search/filter
- [ ] User detail page
- [ ] Trips list page with search/filter
- [ ] Trip detail page

### Phase 4: AI Logs (Week 4)

- [ ] AI logs list page with filters
- [ ] AI trace detail page (decision trace view)
- [ ] Tool execution visualization

### Phase 5: Analytics (Week 5)

- [ ] Dashboard overview with KPIs
- [ ] Time series charts
- [ ] AI performance analytics
- [ ] Error breakdown analysis

### Phase 6: Polish (Week 6)

- [ ] Export functionality (CSV)
- [ ] Real-time updates (optional)
- [ ] Mobile responsive design
- [ ] Performance optimization

---

## 7. Tech Stack Recommendation

### Admin Dashboard Project

| Layer             | Technology              | Reason                              |
| ----------------- | ----------------------- | ----------------------------------- |
| **Framework**     | Next.js 16 (App Router) | Same as main app, shared knowledge  |
| **UI Components** | Radix UI + Tailwind     | Consistent with main app            |
| **Charts**        | Recharts                | Best React charting library         |
| **Tables**        | TanStack Table          | Feature-rich, sorting/filtering     |
| **State**         | React Query (TanStack)  | Server state management, caching    |
| **Auth**          | Supabase Auth           | Same auth system, check admin_users |
| **Database**      | Supabase (shared)       | Same database, new tables           |

### Environment Variables

```env
# Same as main app
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SECRET_KEY=your-service-role-key

# Admin-specific
ADMIN_ALLOWED_EMAILS=admin@example.com,ops@example.com
```

---

## Summary

This spec defines a comprehensive admin dashboard that will give you visibility into:

1. **Users** - Who's using GoVault, their activity, and engagement
2. **Trips** - All trips on the platform with their details
3. **AI Agent Logs** - Every AI query with full decision traces
4. **Analytics** - Usage trends, AI performance, and error rates

The key innovation is the **AI Trace Detail** screen which shows the complete decision-making process: what the user asked, what context was provided, what the AI decided, which tools it called, and whether the user accepted the changes.

This gives you full observability into how your AI agents are performing and how users are interacting with them.
