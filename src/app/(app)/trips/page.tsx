import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { TripsTabs } from "@/components/trip/trips-tabs";
import { EmptyTripsState } from "@/components/trip/empty-trips-state";
import { Plus } from "lucide-react";
import type { Trip, Traveler, TripTodo, ItineraryDay, Booking } from "@/lib/types";

interface TripWithExtras extends Trip {
  travelers?: Traveler[];
  trip_todos?: TripTodo[];
  bookings?: Booking[];
  itinerary_nights?: { location: string; nights: number }[];
}

export default async function TripsPage() {
  const supabase = await createClient();

  // Get current user
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p>Please log in to view your trips.</p>
      </div>
    );
  }

  // Fetch trips owned by the current user
  let trips: any[] | null = null;
  let error: any = null;

  try {
    const result = await supabase
      .from("trips")
      .select(`
        *,
        travelers (*),
        trip_todos (*),
        bookings (*),
        itinerary_days (*)
      `)
      .eq("owner_id", user.id)
      .order("start_date", { ascending: true });

    trips = result.data;
    error = result.error;
  } catch (e) {
    console.error("Failed to fetch trips:", e);
    error = e;
  }

  if (error) {
    console.error("Error fetching trips:", error);
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-navy font-serif mb-4">My Trips</h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-700 font-medium">Unable to load your trips</p>
          <p className="text-red-600 text-sm mt-2">
            {error?.message || "An unexpected error occurred. Please try again later."}
          </p>
        </div>
      </div>
    );
  }

  // Process trips to add itinerary_nights
  const processedTrips: TripWithExtras[] = (trips || []).map((trip: any) => {
    // Calculate nights per location from itinerary_days
    const itinerary_nights = calculateNightsPerLocation(trip.itinerary_days || []);

    return {
      ...trip,
      itinerary_nights,
    };
  });

  const now = new Date();

  // Upcoming: future trips (start date > now)
  const upcomingTrips = processedTrips.filter(
    (trip) => new Date(trip.start_date) > now && trip.status !== "ARCHIVED"
  );

  // Active: currently happening (start <= now <= end)
  const activeTrips = processedTrips.filter(
    (trip) =>
      new Date(trip.start_date) <= now &&
      new Date(trip.end_date) >= now &&
      trip.status !== "ARCHIVED"
  );

  // Past: ended trips (end date < now)
  const pastTrips = processedTrips.filter(
    (trip) => new Date(trip.end_date) < now && trip.status !== "ARCHIVED"
  );

  // All: everything except archived
  const allTrips = processedTrips.filter(
    (trip) => trip.status !== "ARCHIVED"
  );

  const hasTrips = processedTrips.length > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-navy font-serif">My Trips</h1>
          <p className="text-muted-foreground mt-1">
            Plan, track, and relive your adventures
          </p>
        </div>
        {hasTrips && (
          <Link href="/trips/new">
            <Button className="bg-teal hover:bg-teal-dark text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </Link>
        )}
      </div>

      {!hasTrips ? (
        <EmptyTripsState />
      ) : (
        <TripsTabs
          upcomingTrips={upcomingTrips}
          activeTrips={activeTrips}
          pastTrips={pastTrips}
          allTrips={allTrips}
        />
      )}
    </div>
  );
}

// Helper function to calculate nights per location from itinerary days
function calculateNightsPerLocation(days: ItineraryDay[]): { location: string; nights: number }[] {
  if (!days || days.length === 0) return [];

  // Sort days by day_number
  const sortedDays = [...days].sort((a, b) => a.day_number - b.day_number);

  const locationNights: { location: string; nights: number }[] = [];
  let currentLocation = "";
  let currentNights = 0;

  for (const day of sortedDays) {
    const location = day.location || "Unknown";

    if (location !== currentLocation) {
      if (currentLocation && currentNights > 0) {
        locationNights.push({ location: currentLocation, nights: currentNights });
      }
      currentLocation = location;
      currentNights = 1;
    } else {
      currentNights++;
    }
  }

  // Add the last location
  if (currentLocation && currentNights > 0) {
    locationNights.push({ location: currentLocation, nights: currentNights });
  }

  return locationNights;
}

