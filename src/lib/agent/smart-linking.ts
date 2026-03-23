// Smart linking utilities for connecting activities to bookings
import type { SupabaseClient } from "@supabase/supabase-js";

interface Booking {
  id: string;
  type: "FLIGHT" | "HOTEL";
  airline?: string;
  flight_number?: string;
  departure_airport?: string;
  arrival_airport?: string;
  departure_time?: string;
  hotel_name?: string;
  check_in?: string;
  check_out?: string;
}

interface ActivityData {
  title: string;
  description?: string;
  location?: string;
  time?: string;
}

/**
 * Find a matching booking for an activity based on title/description
 */
export async function findMatchingBooking(
  supabase: SupabaseClient,
  tripId: string,
  activity: ActivityData
): Promise<string | null> {
  // Fetch all bookings for the trip
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, type, airline, flight_number, departure_airport, arrival_airport, departure_time, hotel_name, check_in, check_out")
    .eq("trip_id", tripId);

  if (!bookings || bookings.length === 0) {
    return null;
  }

  const titleLower = activity.title.toLowerCase();
  const descLower = (activity.description || "").toLowerCase();
  const locationLower = (activity.location || "").toLowerCase();
  const combinedText = `${titleLower} ${descLower} ${locationLower}`;

  // Check for flight-related activities
  const flightKeywords = ["flight", "fly", "airport", "departure", "arrival", "landing", "takeoff", "plane"];
  const isFlightRelated = flightKeywords.some((kw) => combinedText.includes(kw));

  if (isFlightRelated) {
    const flightBookings = bookings.filter((b) => b.type === "FLIGHT") as Booking[];
    const match = findMatchingFlight(flightBookings, combinedText);
    if (match) return match.id;
  }

  // Check for hotel-related activities
  const hotelKeywords = ["hotel", "check-in", "check in", "check-out", "check out", "resort", "stay", "accommodation"];
  const isHotelRelated = hotelKeywords.some((kw) => combinedText.includes(kw));

  if (isHotelRelated) {
    const hotelBookings = bookings.filter((b) => b.type === "HOTEL") as Booking[];
    const match = findMatchingHotel(hotelBookings, combinedText);
    if (match) return match.id;
  }

  return null;
}

/**
 * Find a matching flight booking based on airport codes, airline, or flight number
 */
function findMatchingFlight(flights: Booking[], text: string): Booking | null {
  if (flights.length === 0) return null;
  if (flights.length === 1) return flights[0]; // Only one flight, link to it

  // Try to match by flight number (e.g., "TG315", "WE265")
  for (const flight of flights) {
    if (flight.flight_number) {
      const flightNum = flight.flight_number.toLowerCase();
      if (text.includes(flightNum)) {
        return flight;
      }
    }
  }

  // Try to match by airport codes (e.g., "BKK", "HKT", "DEL")
  for (const flight of flights) {
    const depAirport = (flight.departure_airport || "").toLowerCase();
    const arrAirport = (flight.arrival_airport || "").toLowerCase();

    // Check for route mentions like "BKK to HKT" or "from BKK" or "to HKT"
    if (depAirport && text.includes(depAirport)) return flight;
    if (arrAirport && text.includes(arrAirport)) return flight;
  }

  // Try to match by airline name
  for (const flight of flights) {
    if (flight.airline) {
      const airline = flight.airline.toLowerCase();
      if (text.includes(airline)) {
        return flight;
      }
    }
  }

  // If multiple flights and can't distinguish, check for departure vs arrival context
  const isDeparture = text.includes("depart") || text.includes("leave") || text.includes("outbound");
  const isArrival = text.includes("arriv") || text.includes("land") || text.includes("inbound") || text.includes("return");

  // Sort by departure time and return first (outbound) or last (return)
  const sorted = [...flights].sort((a, b) =>
    new Date(a.departure_time || 0).getTime() - new Date(b.departure_time || 0).getTime()
  );

  if (isDeparture) return sorted[0]; // First flight
  if (isArrival) return sorted[sorted.length - 1]; // Last flight

  return null;
}

/**
 * Find a matching hotel booking based on hotel name or location
 */
function findMatchingHotel(hotels: Booking[], text: string): Booking | null {
  if (hotels.length === 0) return null;
  if (hotels.length === 1) return hotels[0]; // Only one hotel, link to it

  // Try to match by hotel name
  for (const hotel of hotels) {
    if (hotel.hotel_name) {
      const hotelName = hotel.hotel_name.toLowerCase();
      // Check for partial match (e.g., "Marriott" matches "Marriott Sukhumvit")
      const words = hotelName.split(/\s+/);
      for (const word of words) {
        if (word.length > 3 && text.includes(word)) {
          return hotel;
        }
      }
    }
  }

  // Check for check-in vs check-out context
  const isCheckIn = text.includes("check-in") || text.includes("check in") || text.includes("checking in");
  const isCheckOut = text.includes("check-out") || text.includes("check out") || text.includes("checking out");

  // Sort by check-in date
  const sorted = [...hotels].sort((a, b) =>
    new Date(a.check_in || 0).getTime() - new Date(b.check_in || 0).getTime()
  );

  if (isCheckIn) return sorted[0]; // First hotel (earliest check-in)
  if (isCheckOut) return sorted[sorted.length - 1]; // Last hotel

  return null;
}

/**
 * Extract airport code from text if present
 */
export function extractAirportCode(text: string): string | null {
  // Common airport code pattern: 3 uppercase letters
  const match = text.match(/\b([A-Z]{3})\b/);
  return match ? match[1] : null;
}

/**
 * Infer day number from a date string and trip start date
 */
export function inferDayNumber(date: string, tripStartDate: string): number {
  const start = new Date(tripStartDate);
  const target = new Date(date);
  const diffTime = target.getTime() - start.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays + 1; // Day 1 is the start date
}
