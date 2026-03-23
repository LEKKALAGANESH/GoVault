// Auto-generate todos for bookings
import type { SupabaseClient } from "@supabase/supabase-js";

type TodoPriority = "HIGH" | "MEDIUM" | "LOW";

interface FlightData {
  airline?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_time?: string;
  status?: string;
}

interface HotelData {
  hotel_name?: string;
  check_in?: string;
  check_out?: string;
  status?: string;
}

interface TodoItem {
  title: string;
  category: string;
  priority: TodoPriority;
}

/**
 * Auto-generate todos when a flight booking is created
 */
export async function generateFlightTodos(
  supabase: SupabaseClient,
  tripId: string,
  bookingId: string,
  flight: FlightData
): Promise<string[]> {
  const todos: TodoItem[] = [];
  const flightLabel = flight.airline && flight.flight_number
    ? `${flight.airline} ${flight.flight_number}`
    : `${flight.departure_airport} → ${flight.arrival_airport}`;

  // If booking is pending, add confirmation todo (HIGH priority)
  if (flight.status === "PENDING") {
    todos.push({
      title: `Confirm ${flightLabel} booking`,
      category: "bookings",
      priority: "HIGH",
    });
  }

  // Check-in reminder (24h before flight) - MEDIUM priority
  if (flight.departure_time) {
    todos.push({
      title: `Online check-in for ${flightLabel}`,
      category: "before_trip",
      priority: "MEDIUM",
    });
  }

  // Save boarding pass todo - MEDIUM priority
  todos.push({
    title: `Save boarding pass for ${flightLabel}`,
    category: "documents",
    priority: "MEDIUM",
  });

  // Insert todos into trip_todos table
  const createdIds: string[] = [];
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    const { data, error } = await supabase
      .from("trip_todos")
      .insert({
        trip_id: tripId,
        title: todo.title,
        category: todo.category,
        priority: todo.priority,
        completed: false,
        order: i,
      })
      .select("id")
      .single();

    if (!error && data) {
      createdIds.push(data.id);
    }
  }

  return createdIds;
}

/**
 * Auto-generate todos when a hotel booking is created
 */
export async function generateHotelTodos(
  supabase: SupabaseClient,
  tripId: string,
  bookingId: string,
  hotel: HotelData
): Promise<string[]> {
  const todos: TodoItem[] = [];
  const hotelName = hotel.hotel_name || "Hotel";

  // If booking is pending, add confirmation todo (HIGH priority)
  if (hotel.status === "PENDING") {
    todos.push({
      title: `Confirm ${hotelName} booking`,
      category: "bookings",
      priority: "HIGH",
    });
  }

  // Print/save confirmation todo - MEDIUM priority
  todos.push({
    title: `Save ${hotelName} confirmation`,
    category: "documents",
    priority: "MEDIUM",
  });

  // Check-in time todo - LOW priority
  todos.push({
    title: `Confirm check-in time at ${hotelName}`,
    category: "bookings",
    priority: "LOW",
  });

  // Insert todos into trip_todos table
  const createdIds: string[] = [];
  for (let i = 0; i < todos.length; i++) {
    const todo = todos[i];
    const { data, error } = await supabase
      .from("trip_todos")
      .insert({
        trip_id: tripId,
        title: todo.title,
        category: todo.category,
        priority: todo.priority,
        completed: false,
        order: i,
      })
      .select("id")
      .single();

    if (!error && data) {
      createdIds.push(data.id);
    }
  }

  return createdIds;
}

/**
 * Check if a similar todo already exists
 */
export async function checkDuplicateTodo(
  supabase: SupabaseClient,
  tripId: string,
  title: string
): Promise<boolean> {
  const { data } = await supabase
    .from("trip_todos")
    .select("id")
    .eq("trip_id", tripId)
    .ilike("title", `%${title}%`)
    .limit(1);

  return data !== null && data.length > 0;
}
