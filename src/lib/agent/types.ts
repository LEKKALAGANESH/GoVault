// Agent Types for GoVault AI Assistant

import type { Booking, ItineraryDay, Activity } from "@/lib/types";

// Action types the agent can perform
export type AgentActionType =
  | "PARSE_DOCUMENT"           // Extract data from uploaded document
  | "PARSE_ITINERARY"          // Convert text to structured itinerary
  | "EDIT_ITINERARY"           // Natural language edit command
  | "GENERATE_PACKING"         // Generate packing checklist
  | "GENERATE_PHRASES"         // Generate essential phrases
  | "GENERATE_TODOS"           // Generate todos based on itinerary analysis
  | "GENERATE_ITINERARY_PROMPT" // Generate a prompt for user to use with ChatGPT/Claude
  | "CAPTURE_TRIP_INFO";       // Capture trip details from conversation (travelers, etc.)

// Request from client to agent API
export interface AgentRequest {
  action: AgentActionType;
  tripId: string;

  // For PARSE_DOCUMENT
  document?: {
    base64: string;
    mimeType: string;
    filename: string;
  };

  // For PARSE_ITINERARY or EDIT_ITINERARY
  text?: string;

  // Current trip context for editing
  context?: TripContext;

  // Conversation history for multi-turn context
  conversationHistory?: Array<{
    role: "user" | "assistant";
    content: string;
  }>;
}

// Current state of the trip (for context in editing)
export interface TripContext {
  tripName: string;
  startDate: string;
  endDate: string;
  destinations: string[];
  days: Array<{
    id: string;
    day_number: number;
    date: string;
    title: string;
    location?: string;
    activities: Array<{
      id: string;
      time?: string;
      title: string;
      order: number;
    }>;
  }>;
  bookings: Array<{
    id: string;
    type: string;
    status: string;
    // Flight
    airline?: string;
    flight_number?: string;
    departure_airport?: string;
    arrival_airport?: string;
    departure_time?: string;
    arrival_time?: string;
    // Hotel
    hotel_name?: string;
    check_in?: string;
    check_out?: string;
  }>;
  todos?: Array<{
    id: string;
    title: string;
    category?: string;
    completed: boolean;
  }>;
}

// Tool call result types
export type ToolName =
  | "parse_flight"
  | "parse_hotel"
  | "parse_activity"
  | "parse_itinerary_text"
  | "add_day"
  | "update_day"
  | "delete_day"
  | "add_activity"
  | "update_activity"
  | "delete_activity"
  | "move_activity"
  | "delete_booking"
  | "delete_all_bookings"
  | "delete_todo"
  | "delete_all_todos"
  | "delete_all_packing"
  | "delete_all_phrases"
  | "generate_packing_list"
  | "generate_phrases"
  | "update_travelers"
  | "update_trip_metadata"
  | "update_trip_dates";

// Proposed changes returned by agent
export interface ProposedChange {
  id: string;
  tool: ToolName;
  description: string;
  data: Record<string, unknown>;
}

// Suggestions for additional actions
export interface AgentSuggestion {
  type:
    | "location_mismatch"      // Booking location doesn't match trip destinations
    | "date_mismatch"          // Booking dates outside trip dates
    | "traveler_mismatch"      // Number of passengers doesn't match travelers
    | "missing_booking"
    | "missing_traveler"
    | "create_todo"
    | "update_trip_dates"
    | "update_trip_destinations"
    | "add_travelers"
    | "create_booking"
    | "remove_booking";        // Suggest removing a booking that doesn't match
  title: string;
  description: string;
  data?: Record<string, unknown>;
}

// Agent response to client
export interface AgentResponse {
  success: boolean;
  message: string;
  proposedChanges: ProposedChange[];
  suggestions?: AgentSuggestion[]; // Suggestions for user to consider
  detectedLocations?: string[]; // Locations found in the parsed itinerary
  error?: string;
}

// Apply request - confirmed changes from user
export interface ApplyRequest {
  tripId: string;
  changes: ProposedChange[];
  // Document to upload and link to created booking
  document?: {
    base64: string;
    mimeType: string;
    filename: string;
  };
}

// Apply response
export interface ApplyResponse {
  success: boolean;
  message: string;
  applied: {
    tool: ToolName;
    result: "created" | "updated" | "deleted";
    id?: string;
    linkedBookingId?: string; // ID of auto-linked booking (for smart linking)
    warnings?: string[]; // Warnings about potential issues (e.g., booking date conflicts)
    suggestions?: AgentSuggestion[]; // Suggestions for follow-up actions
  }[];
  errors?: string[];
  warnings?: string[]; // Top-level warnings for the entire apply operation
  suggestions?: AgentSuggestion[]; // Top-level suggestions for follow-up actions
}

// Tool parameter types
export interface ParseFlightParams {
  airline: string;
  flight_number: string;
  departure_airport: string;
  arrival_airport: string;
  departure_time?: string;
  arrival_time?: string;
  confirmation_number?: string;
  seats?: string;
}

export interface ParseHotelParams {
  hotel_name: string;
  address?: string;
  check_in: string;
  check_out: string;
  room_type?: string;
  confirmation_number?: string;
}

export interface ParseItineraryTextParams {
  days: Array<{
    day_number: number;
    date?: string;
    title: string;
    location?: string;
    summary?: string;
    activities: Array<{
      time?: string;
      title: string;
      description?: string;
      location?: string;
      tips?: string;
      tags?: string[];
    }>;
  }>;
}

export interface AddDayParams {
  day_number: number;
  date: string;
  title: string;
  location?: string;
  summary?: string;
}

export interface UpdateDayParams {
  day_id: string;
  title?: string;
  location?: string;
  summary?: string;
  energy_level?: "LOW" | "MEDIUM" | "HIGH";
}

export interface DeleteDayParams {
  day_id: string;
}

export interface AddActivityParams {
  day_number: number;
  time?: string;
  end_time?: string;
  title: string;
  description?: string;
  location?: string;
  location_url?: string;
  tips?: string;
  tags?: string[];
}

export interface UpdateActivityParams {
  activity_id: string;
  time?: string;
  end_time?: string;
  title?: string;
  description?: string;
  location?: string;
  location_url?: string;
  tips?: string;
  tags?: string[];
}

export interface DeleteActivityParams {
  activity_id: string;
}

export interface MoveActivityParams {
  activity_id: string;
  to_day_number: number;
  new_order?: number;
}
